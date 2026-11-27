import json
from urllib.parse import parse_qs, urlsplit

import httpx
import pytest
from pydantic import ValidationError

from app.config import Settings
from app.services.email import EmailDeliveryError, send_verification_email


def local_settings(tmp_path):
    return Settings(_env_file=None, database_password="test-only", local_email_directory=tmp_path / "emails")


def test_local_email_preserves_token_without_making_network_request(tmp_path, monkeypatch):
    def unexpected_request(*args, **kwargs):
        raise AssertionError("Trimiterea locala nu trebuie sa acceseze reteaua.")

    monkeypatch.setattr(httpx, "post", unexpected_request)
    settings = local_settings(tmp_path)
    send_verification_email("test@example.com", "test-token", settings)
    files = list(settings.local_email_directory.glob("*.json"))
    assert len(files) == 1
    assert files[0].stat().st_mode & 0o777 == 0o600
    message = json.loads(files[0].read_text())
    assert message["to"] == ["test@example.com"]
    assert urlsplit(message["verification_url"]).path == "/auth/verify-email"
    assert parse_qs(urlsplit(message["verification_url"]).query)["token"] == ["test-token"]


def test_resend_request_is_mocked_and_errors_are_sanitized(tmp_path, monkeypatch):
    settings = local_settings(tmp_path).model_copy(update={"email_delivery": "resend", "email_from": "WellTrack <test@example.com>"})
    from pydantic import SecretStr
    settings.resend_api_key = SecretStr("test-only-api-key")

    def rejected_request(url, **kwargs):
        assert url == "https://api.resend.com/emails"
        assert kwargs["json"]["to"] == ["test@example.com"]
        assert kwargs["headers"]["Authorization"] == "Bearer test-only-api-key"
        return httpx.Response(403, request=httpx.Request("POST", url), text="private-provider-details")

    monkeypatch.setattr(httpx, "post", rejected_request)
    with pytest.raises(EmailDeliveryError) as exception:
        send_verification_email("test@example.com", "test-token", settings)
    assert "private-provider-details" not in str(exception.value)


def test_resend_success_uses_frontend_verification_page(tmp_path, monkeypatch):
    from pydantic import SecretStr

    settings = local_settings(tmp_path).model_copy(update={
        "email_delivery": "resend", "email_from": "WellTrack <onboarding@resend.dev>",
        "resend_api_key": SecretStr("test-only-api-key"),
    })
    calls = []

    def accepted_request(url, **kwargs):
        calls.append(kwargs["json"])
        assert kwargs["headers"]["Authorization"] == "Bearer test-only-api-key"
        return httpx.Response(200, request=httpx.Request("POST", url), json={"id": "test-email-id"})

    monkeypatch.setattr(httpx, "post", accepted_request)
    send_verification_email("test@example.com", "test-token", settings)
    assert len(calls) == 1
    assert calls[0]["from"] == settings.email_from
    assert "/auth/verify-email?token=test-token" in calls[0]["text"]
    assert not settings.local_email_directory.exists()


def brevo_settings(**overrides):
    return Settings(
        _env_file=None,
        **{
            "database_password": "test-only", "email_delivery": "brevo",
            "brevo_api_key": "test-only-brevo-key", "email_from": "sender@example.com",
            **overrides,
        },
    )


def test_brevo_sends_verification_link_with_expected_contract(monkeypatch):
    settings = brevo_settings(frontend_url="http://localhost:5173")
    calls = []

    def accepted_request(url, **kwargs):
        assert url == "https://api.brevo.com/v3/smtp/email"
        assert kwargs["headers"] == {"api-key": "test-only-brevo-key"}
        assert kwargs["timeout"] == 10
        calls.append(kwargs["json"])
        return httpx.Response(201, request=httpx.Request("POST", url), json={"messageId": "test-id"})

    monkeypatch.setattr(httpx, "post", accepted_request)
    send_verification_email("recipient@example.com", "token+with&symbols", settings)
    assert len(calls) == 1
    message = calls[0]
    assert message["sender"] == {"name": "WellTrack", "email": "sender@example.com"}
    assert message["to"] == [{"email": "recipient@example.com"}]
    assert message["subject"] == "Verifica adresa de email - WellTrack"
    link = message["textContent"].splitlines()[1]
    assert urlsplit(link).path == "/auth/verify-email"
    assert parse_qs(urlsplit(link).query)["token"] == ["token+with&symbols"]


@pytest.mark.parametrize("failure", ["http", "timeout"])
def test_brevo_errors_do_not_expose_provider_details(monkeypatch, failure):
    def rejected_request(url, **kwargs):
        if failure == "timeout":
            raise httpx.ReadTimeout("private-provider-details")
        return httpx.Response(403, request=httpx.Request("POST", url), text="private-provider-details")

    monkeypatch.setattr(httpx, "post", rejected_request)
    with pytest.raises(EmailDeliveryError) as exception:
        send_verification_email("recipient@example.com", "test-token", brevo_settings())
    assert str(exception.value) == "Emailul nu a putut fi trimis."


@pytest.mark.parametrize("overrides", [
    {"brevo_api_key": ""}, {"brevo_api_key": "   "},
    {"email_from": ""}, {"email_from": "invalid-address"},
])
def test_brevo_rejects_incomplete_configuration(overrides):
    with pytest.raises(ValidationError):
        brevo_settings(**overrides)


def test_production_accepts_brevo_and_rejects_local_delivery():
    production = {
        "app_env": "production", "frontend_url": "https://welltrack.example.com",
        "cors_origins": ["https://welltrack.example.com"], "session_cookie_secure": True,
    }
    assert brevo_settings(**production).email_delivery == "brevo"
    with pytest.raises(ValidationError):
        brevo_settings(**production, email_delivery="local")
