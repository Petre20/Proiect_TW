import json
from urllib.parse import parse_qs, urlsplit

import httpx
import pytest

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
