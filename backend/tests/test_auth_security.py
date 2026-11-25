from types import SimpleNamespace

import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient
from starlette.requests import Request

from app.dependencies import AuthRateLimiter
from app.main import app
from app.services.security import generate_token, hash_password, hash_token, verify_password


HEADERS = {"X-Requested-With": "WellTrack"}


def test_password_hash_is_salted_and_verified():
    password = "a-long-test-password-2026"
    first = hash_password(password)
    second = hash_password(password)
    assert first.startswith("$argon2id$")
    assert first != second
    assert verify_password(password, first)
    assert not verify_password("a-different-password", first)
    assert not verify_password(password, "invalid-stored-hash")


def test_tokens_are_random_and_stored_as_hashes():
    token = generate_token()
    assert len(token) >= 43
    assert token != generate_token()
    assert len(hash_token(token)) == 64
    assert hash_token(token) != token


@pytest.mark.parametrize("headers", [{}, {"X-Requested-With": "wrong"}, {**HEADERS, "Origin": "https://untrusted.example"}, {**HEADERS, "Sec-Fetch-Site": "cross-site"}])
def test_auth_rejects_untrusted_requests_before_database_access(headers):
    with TestClient(app) as client:
        response = client.post("/api/auth/login", json={"email": "test@example.com", "password": "test"}, headers=headers)
    assert response.status_code == 403


def test_validation_does_not_echo_password_or_allow_registration_role():
    password = "shortpw"
    with TestClient(app) as client:
        response = client.post("/api/auth/register", headers=HEADERS, json={
            "name": "Test", "email": "test@example.com", "password": password, "role": "admin",
        })
    assert response.status_code == 422
    assert password not in response.text
    assert all("input" not in error for error in response.json()["detail"])


def test_cors_allows_frontend_credentials_and_custom_header():
    with TestClient(app) as client:
        response = client.options("/api/auth/login", headers={
            "Origin": "http://127.0.0.1:5173",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type,x-requested-with",
        })
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://127.0.0.1:5173"
    assert response.headers["access-control-allow-credentials"] == "true"


def test_auth_rate_limit():
    limiter = AuthRateLimiter()
    request = Request({"type": "http", "path": "/api/auth/login", "client": ("127.0.0.1", 1234), "headers": []})
    settings = SimpleNamespace(auth_requests_per_minute=2)
    limiter.check(request, settings)
    limiter.check(request, settings)
    with pytest.raises(HTTPException) as exception:
        limiter.check(request, settings)
    assert exception.value.status_code == 429
