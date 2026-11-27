from datetime import datetime, timezone
import hashlib
import base64
import os
from urllib.parse import parse_qs, urlsplit
from uuid import uuid4

from fastapi.testclient import TestClient
import httpx2
from joserfc import jwt
from joserfc.jwk import RSAKey
from pydantic import SecretStr
from pydantic import ValidationError
import pytest
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_engine, get_session
from app.main import app, create_app
from app.models import AuthSession, User
from app.services.google import GOOGLE_METADATA_URL, safe_next
from app.services.security import hash_password


@pytest.fixture(scope="module")
def signing_key():
    return RSAKey.generate_key(2048, {"kid": "welltrack-test-key"})


@pytest.fixture
def google_settings():
    return get_settings().model_copy(update={
        "google_enabled": True,
        "google_client_id": "test-client.apps.googleusercontent.com",
        "google_client_secret": SecretStr("test-only-google-secret"),
        "oauth_session_secret": SecretStr("test-only-signing-key-with-at-least-32-characters"),
        "google_redirect_uri": "http://127.0.0.1:5173/api/auth/google/callback",
        "frontend_url": "http://127.0.0.1:5173",
        "auth_requests_per_minute": 10000,
    })


@pytest.fixture
def provider(google_settings, signing_key):
    values = {"nonce": None, "challenge": None, "overrides": {}, "token_requests": 0, "invalid_signature": False}

    def handle(request):
        if str(request.url) == GOOGLE_METADATA_URL:
            return httpx2.Response(200, json={
                "issuer": "https://accounts.google.com",
                "authorization_endpoint": "https://accounts.google.com/o/oauth2/v2/auth",
                "token_endpoint": "https://oauth2.googleapis.com/token",
                "jwks_uri": "https://www.googleapis.com/oauth2/v3/certs",
                "id_token_signing_alg_values_supported": ["RS256"],
            })
        if str(request.url) == "https://www.googleapis.com/oauth2/v3/certs":
            return httpx2.Response(200, json={"keys": [signing_key.as_dict(private=False)]})
        if str(request.url) == "https://oauth2.googleapis.com/token":
            values["token_requests"] += 1
            form = parse_qs(request.content.decode())
            assert form["client_secret"] == [google_settings.google_client_secret.get_secret_value()]
            assert form["redirect_uri"] == [google_settings.google_redirect_uri]
            verifier = form["code_verifier"][0]
            challenge = base64.urlsafe_b64encode(hashlib.sha256(verifier.encode()).digest()).rstrip(b"=").decode()
            assert challenge == values["challenge"]
            now = int(datetime.now(timezone.utc).timestamp())
            claims = {
                "iss": "https://accounts.google.com", "aud": google_settings.google_client_id,
                "sub": "test-google-subject", "email": "google-test@example.com",
                "email_verified": True, "name": "Google Test", "iat": now, "exp": now + 3600,
                "nonce": values["nonce"],
                **values["overrides"],
            }
            key = RSAKey.generate_key(2048, {"kid": "welltrack-test-key"}) if values["invalid_signature"] else signing_key
            encoded = jwt.encode({"alg": "RS256", "kid": "welltrack-test-key"}, claims, key)
            return httpx2.Response(200, json={"access_token": "test-access-token", "token_type": "Bearer", "id_token": encoded})
        raise AssertionError(f"Cerere externa neasteptata: {request.url}")

    values["transport"] = httpx2.MockTransport(handle)
    return values


@pytest.fixture
def google_app(google_settings, provider):
    application = create_app(google_settings)
    application.state.google_client.client_kwargs["transport"] = provider["transport"]
    return application


@pytest.fixture
def client(google_app):
    with TestClient(google_app, base_url="http://127.0.0.1:5173", follow_redirects=False) as client:
        yield client


@pytest.fixture
def database(google_app):
    if os.getenv("WELLTRACK_RUN_DB_TESTS") != "1":
        pytest.skip("Necesita PostgreSQL si WELLTRACK_RUN_DB_TESTS=1.")
    with get_engine().connect() as connection:
        transaction = connection.begin()
        session = Session(bind=connection, join_transaction_mode="create_savepoint", expire_on_commit=False)
        google_app.dependency_overrides[get_session] = lambda: session
        try:
            yield session
        finally:
            session.close()
            transaction.rollback()


def start(client, provider, next_path="/habits"):
    response = client.get("/api/auth/google/start", params={"next": next_path})
    assert response.status_code == 302
    params = parse_qs(urlsplit(response.headers["location"]).query)
    provider["nonce"] = params["nonce"][0]
    provider["challenge"] = params["code_challenge"][0]
    assert params["code_challenge_method"] == ["S256"]
    assert "openid" in params["scope"][0]
    assert "httponly" in response.headers["set-cookie"].lower()
    return params["state"][0]


def callback(client, state):
    return client.get("/api/auth/google/callback", params={"code": "test-code", "state": state})


def test_disabled_google_fails_without_contacting_provider():
    disabled_app = create_app(get_settings().model_copy(update={"google_enabled": False}))
    with TestClient(disabled_app) as client:
        response = client.get("/api/auth/google/start")
    assert response.status_code == 503


@pytest.mark.parametrize("path", [None, "", "//evil.example", "https://evil.example", "/\\evil.example", "/%5cevil.example", "/%2fevil.example", "/a%0d%0aLocation:evil"])
def test_unsafe_next_paths_use_dashboard(path):
    assert safe_next(path) == "/dashboard"


def test_local_next_path_is_preserved():
    assert safe_next("/habits?week=2") == "/habits?week=2"


def test_google_requires_credentials_and_matching_callback(google_settings):
    from app.config import Settings

    values = google_settings.model_dump()
    with pytest.raises(ValidationError):
        Settings(_env_file=None, **{**values, "google_client_secret": SecretStr("")})
    with pytest.raises(ValidationError):
        Settings(_env_file=None, **{**values, "google_redirect_uri": "http://other.example/api/auth/google/callback"})


def test_callback_without_oauth_cookie_is_rejected(client, provider):
    response = callback(client, "unrequested-state")
    assert response.status_code == 303
    assert "error=google_failed" in response.headers["location"]
    assert provider["token_requests"] == 0


def test_oauth_start_and_invalid_state(client, provider):
    start(client, provider)
    response = callback(client, "wrong-state")
    assert response.status_code == 303
    assert "error=google_failed" in response.headers["location"]
    assert provider["token_requests"] == 0


@pytest.mark.parametrize("overrides", [
    {"iss": "https://untrusted.example"}, {"aud": "wrong-client"},
    {"nonce": "wrong-nonce"}, {"exp": 1}, {"email_verified": False},
    {"email": "invalid-email"},
])
def test_invalid_google_identity_is_rejected(client, provider, overrides):
    provider["overrides"] = overrides
    state = start(client, provider)
    response = callback(client, state)
    assert response.status_code == 303
    assert "error=google_failed" in response.headers["location"]
    assert client.cookies.get("welltrack_session") is None


def test_invalid_signature_is_rejected(client, provider):
    provider["invalid_signature"] = True
    response = callback(client, start(client, provider))
    assert response.status_code == 303
    assert "error=google_failed" in response.headers["location"]


def test_cancelled_google_login_returns_to_frontend(client, provider):
    state = start(client, provider)
    response = client.get("/api/auth/google/callback", params={"state": state, "error": "access_denied"})
    assert response.status_code == 303
    assert "error=google_failed" in response.headers["location"]
    assert provider["token_requests"] == 0


def test_verified_google_account_creates_local_session(client, provider, database, google_settings):
    provider["overrides"] = {"email": f"{uuid4().hex}@example.com", "sub": uuid4().hex}
    response = callback(client, start(client, provider))
    assert response.status_code == 303
    assert response.headers["location"] == "http://127.0.0.1:5173/habits"
    assert "code=" not in response.headers["location"] and "token=" not in response.headers["location"]
    user = database.scalar(select(User).where(User.google_sub == provider["overrides"]["sub"]))
    assert user is not None and user.password_hash is None and user.email_verified
    assert user.role == "user"
    assert client.cookies.get(google_settings.session_cookie_name)
    assert client.get("/api/auth/me").json()["id"] == user.id
    assert client.post("/api/auth/login", headers={"X-Requested-With": "WellTrack"}, json={"email": user.email, "password": "any-password"}).status_code == 401
    assert callback(client, start(client, provider)).status_code == 303
    assert database.scalar(select(func.count()).select_from(User).where(User.google_sub == user.google_sub)) == 1
    assert database.scalar(select(func.count()).select_from(AuthSession).where(AuthSession.user_id == user.id)) == 1
    assert client.post("/api/auth/logout", headers={"X-Requested-With": "WellTrack"}).status_code == 204
    assert client.get("/api/auth/me").status_code == 401


def test_password_account_is_not_linked_automatically(client, provider, database):
    email = f"{uuid4().hex}@example.com"
    user = User(name="Existing", email=email, password_hash=hash_password("test-password"), email_verified=True)
    database.add(user)
    database.commit()
    provider["overrides"] = {"email": email, "sub": uuid4().hex}
    response = callback(client, start(client, provider))
    assert response.status_code == 303
    assert "error=google_email_in_use" in response.headers["location"]
    database.refresh(user)
    assert user.google_sub is None
    assert client.cookies.get("welltrack_session") is None


def test_disabled_google_account_cannot_login(client, provider, database):
    user = User(name="Disabled", email=f"{uuid4().hex}@example.com", google_sub=uuid4().hex,
                password_hash=None, email_verified=True, is_active=False)
    database.add(user)
    database.commit()
    provider["overrides"] = {"email": user.email, "sub": user.google_sub}
    response = callback(client, start(client, provider))
    assert "error=google_failed" in response.headers["location"]
    assert client.cookies.get("welltrack_session") is None
