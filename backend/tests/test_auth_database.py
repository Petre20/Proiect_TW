"""Teste de autentificare pe PostgreSQL, izolate prin tranzactii anulate la final."""
from datetime import timedelta
import json
import os
from urllib.parse import parse_qs, urlsplit
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_engine, get_session
from app.main import app
from app.models import AuthSession, User
from app.routers import auth
from app.services.email import EmailDeliveryError
from app.services.security import hash_token, utc_now, verify_password


pytestmark = pytest.mark.skipif(os.getenv("WELLTRACK_RUN_DB_TESTS") != "1", reason="Necesita PostgreSQL si WELLTRACK_RUN_DB_TESTS=1.")
HEADERS = {"X-Requested-With": "WellTrack"}
PASSWORD = "WellTrack-test-password-2026!"


@pytest.fixture
def auth_settings(tmp_path):
    return get_settings().model_copy(update={
        "app_env": "test", "email_delivery": "local", "local_email_directory": tmp_path / "emails",
        "auth_requests_per_minute": 10000,
    })


@pytest.fixture
def auth_database():
    with get_engine().connect() as connection:
        transaction = connection.begin()
        session = Session(bind=connection, join_transaction_mode="create_savepoint", expire_on_commit=False)
        try:
            yield session
        finally:
            session.close()
            transaction.rollback()


@pytest.fixture
def client(auth_database, auth_settings):
    app.dependency_overrides[get_session] = lambda: auth_database
    app.dependency_overrides[get_settings] = lambda: auth_settings
    try:
        with TestClient(app) as client:
            client.headers.update(HEADERS)
            yield client
    finally:
        app.dependency_overrides.clear()


def tokens(settings):
    values = set()
    for path in settings.local_email_directory.glob("*.json"):
        message = json.loads(path.read_text())
        values.add(parse_qs(urlsplit(message["verification_url"]).query)["token"][0])
    return values


def register(client, email=None):
    email = email or f"{uuid4().hex}@example.com"
    response = client.post("/api/auth/register", json={"name": " Test User ", "email": email, "password": PASSWORD})
    assert response.status_code == 201, response.text
    return email.lower()


def verified_user(client, settings):
    previous_tokens = tokens(settings)
    email = register(client)
    token = (tokens(settings) - previous_tokens).pop()
    assert client.post("/api/auth/verify-email", json={"token": token}).status_code == 200
    return email


def login(client, email, password=PASSWORD):
    return client.post("/api/auth/login", json={"email": email, "password": password})


def test_register_verify_login_me_logout(client, auth_database, auth_settings):
    email = register(client, f"User{uuid4().hex}@EXAMPLE.COM")
    user = auth_database.scalar(select(User).where(User.email == email))
    assert user.name == "Test User"
    assert user.role == "user"
    assert user.password_hash.startswith("$argon2id$")
    assert verify_password(PASSWORD, user.password_hash)
    assert user.email_verified is False
    assert login(client, email).status_code == 403
    token = next(iter(tokens(auth_settings)))
    assert user.email_verification_token_hash == hash_token(token)
    verified = client.post("/api/auth/verify-email", json={"token": token})
    assert verified.status_code == 200
    assert client.post("/api/auth/verify-email", json={"token": token}).status_code == 400
    auth_database.refresh(user)
    assert user.email_verified and user.email_verification_token_hash is None
    assert user.email_verification_expires_at is None

    logged_in = login(client, email.upper())
    assert logged_in.status_code == 200
    assert logged_in.json()["id"] == user.id
    assert "password_hash" not in logged_in.text and "token" not in logged_in.text
    cookie = logged_in.headers["set-cookie"].lower()
    assert "httponly" in cookie and "samesite=lax" in cookie
    session_token = client.cookies.get(auth_settings.session_cookie_name)
    stored = auth_database.scalar(select(AuthSession).where(AuthSession.user_id == user.id))
    assert stored.session_token_hash == hash_token(session_token)
    assert stored.session_token_hash != session_token
    assert stored.expires_at > stored.created_at
    assert client.get("/api/auth/me").json()["email"] == email
    assert client.get("/api/auth/me").headers["cache-control"] == "no-store"

    logout = client.post("/api/auth/logout")
    assert logout.status_code == 204 and logout.content == b""
    assert auth_database.get(AuthSession, stored.id) is None
    client.cookies.clear()
    client.cookies.set(auth_settings.session_cookie_name, session_token)
    assert client.get("/api/auth/me").status_code == 401


def test_duplicate_email_and_invalid_credentials(client):
    email = register(client)
    duplicate = client.post("/api/auth/register", json={"name": "Another", "email": email.upper(), "password": PASSWORD})
    assert duplicate.status_code == 409
    wrong = login(client, email, "wrong-password")
    unknown = login(client, "unknown@example.com", "wrong-password")
    assert wrong.status_code == unknown.status_code == 401
    assert wrong.json() == unknown.json()


def test_resend_cooldown_and_old_token_invalidation(client, auth_database, auth_settings):
    email = register(client)
    old_token = next(iter(tokens(auth_settings)))
    assert client.post("/api/auth/resend-verification", json={"email": email}).status_code == 202
    assert len(tokens(auth_settings)) == 1
    user = auth_database.scalar(select(User).where(User.email == email))
    user.email_verification_expires_at -= timedelta(seconds=auth_settings.verification_resend_seconds + 1)
    auth_database.commit()
    response = client.post("/api/auth/resend-verification", json={"email": email})
    assert response.status_code == 202
    new_token = (tokens(auth_settings) - {old_token}).pop()
    assert client.post("/api/auth/verify-email", json={"token": old_token}).status_code == 400
    assert client.post("/api/auth/verify-email", json={"token": new_token}).status_code == 200
    assert client.post("/api/auth/resend-verification", json={"email": "unknown@example.com"}).json() == response.json()


def test_expired_verification_is_rejected(client, auth_database, auth_settings):
    email = register(client)
    user = auth_database.scalar(select(User).where(User.email == email))
    user.email_verification_expires_at = utc_now() - timedelta(seconds=1)
    auth_database.commit()
    response = client.post("/api/auth/verify-email", json={"token": next(iter(tokens(auth_settings)))})
    assert response.status_code == 400
    assert not user.email_verified


def test_expired_session_and_disabled_account_are_rejected(client, auth_database, auth_settings):
    email = verified_user(client, auth_settings)
    assert login(client, email).status_code == 200
    stored = auth_database.scalar(select(AuthSession).join(User).where(User.email == email))
    stored.created_at = utc_now() - timedelta(days=2)
    stored.expires_at = utc_now() - timedelta(seconds=1)
    auth_database.commit()
    assert client.get("/api/auth/me").status_code == 401
    assert login(client, email).status_code == 200
    user = auth_database.scalar(select(User).where(User.email == email))
    user.is_active = False
    auth_database.commit()
    assert client.get("/api/auth/me").status_code == 403
    assert login(client, email).status_code == 403


def test_cookie_rotation_and_independent_sessions(client, auth_database, auth_settings):
    email = verified_user(client, auth_settings)
    assert login(client, email).status_code == 200
    first = client.cookies.get(auth_settings.session_cookie_name)
    assert login(client, email).status_code == 200
    second = client.cookies.get(auth_settings.session_cookie_name)
    assert second != first
    assert auth_database.scalar(select(AuthSession).where(AuthSession.session_token_hash == hash_token(first))) is None
    with TestClient(app) as other_client:
        other_client.headers.update(HEADERS)
        assert login(other_client, email).status_code == 200
        assert client.post("/api/auth/logout").status_code == 204
        assert other_client.get("/api/auth/me").status_code == 200


def test_email_delivery_failure_rolls_back_registration(client, auth_database, monkeypatch):
    def fail(*args):
        raise EmailDeliveryError("private-delivery-error")

    monkeypatch.setattr(auth, "send_verification_email", fail)
    email = f"{uuid4().hex}@example.com"
    response = client.post("/api/auth/register", json={"name": "Test", "email": email, "password": PASSWORD})
    assert response.status_code == 503
    assert "private-delivery-error" not in response.text
    assert auth_database.scalar(select(func.count()).select_from(User).where(User.email == email)) == 0


def test_forged_cookie_is_rejected(client, auth_settings):
    client.cookies.set(auth_settings.session_cookie_name, "a-forged-token")
    assert client.get("/api/auth/me").status_code == 401


def test_logout_requires_csrf_header_and_does_not_end_other_users_session(client, auth_settings):
    first_email = verified_user(client, auth_settings)
    assert login(client, first_email).status_code == 200
    with TestClient(app) as other_client:
        other_client.headers.update(HEADERS)
        second_email = verified_user(other_client, auth_settings)
        assert login(other_client, second_email).status_code == 200
        assert client.get("/api/auth/me").json()["email"] == first_email
        assert other_client.get("/api/auth/me").json()["email"] == second_email
        assert other_client.post("/api/auth/logout", headers={"X-Requested-With": "wrong"}).status_code == 403
        assert other_client.get("/api/auth/me").status_code == 200
        assert client.post("/api/auth/logout").status_code == 204
        assert other_client.get("/api/auth/me").status_code == 200


def test_resend_failure_preserves_previous_token(client, auth_database, auth_settings, monkeypatch):
    email = register(client)
    old_token = next(iter(tokens(auth_settings)))
    user = auth_database.scalar(select(User).where(User.email == email))
    user.email_verification_expires_at -= timedelta(seconds=auth_settings.verification_resend_seconds + 1)
    auth_database.commit()

    def fail(*args):
        raise EmailDeliveryError("private-delivery-error")

    monkeypatch.setattr(auth, "send_verification_email", fail)
    assert client.post("/api/auth/resend-verification", json={"email": email}).status_code == 503
    auth_database.refresh(user)
    assert user.email_verification_token_hash == hash_token(old_token)
    assert client.post("/api/auth/verify-email", json={"token": old_token}).status_code == 200
