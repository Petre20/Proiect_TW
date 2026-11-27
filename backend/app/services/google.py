from urllib.parse import unquote, urlencode

from authlib.integrations.starlette_client import OAuth
from fastapi import Request
from fastapi.responses import RedirectResponse
from pydantic import EmailStr, TypeAdapter, ValidationError
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.config import Settings
from app.models import User
from app.services.sessions import issue_session


GOOGLE_METADATA_URL = "https://accounts.google.com/.well-known/openid-configuration"
email_adapter = TypeAdapter(EmailStr)


def create_google_client(settings: Settings):
    if not settings.google_enabled:
        return None
    oauth = OAuth()
    return oauth.register(
        "google",
        client_id=settings.google_client_id,
        client_secret=settings.google_client_secret.get_secret_value(),
        server_metadata_url=GOOGLE_METADATA_URL,
        client_kwargs={
            "scope": "openid email profile",
            "code_challenge_method": "S256",
            "token_endpoint_auth_method": "client_secret_post",
            "timeout": 10,
        },
    )


def safe_next(value: str | None) -> str:
    if not value or len(value) > 512:
        return "/dashboard"
    decoded = unquote(value)
    if (
        not decoded.startswith("/") or decoded.startswith("//")
        or "\\" in decoded or any(ord(character) < 32 or ord(character) == 127 for character in decoded)
    ):
        return "/dashboard"
    return value


def google_error(settings: Settings, error: str, next_path: str = "/dashboard") -> RedirectResponse:
    response = RedirectResponse(
        settings.frontend_url.rstrip("/") + "/auth?" + urlencode({"error": error, "next": safe_next(next_path)}),
        status_code=303,
    )
    response.headers["Cache-Control"] = "no-store"
    response.headers["Referrer-Policy"] = "no-referrer"
    return response


def complete_google_login(claims: dict, next_path: str, request: Request, database: Session, settings: Settings) -> RedirectResponse:
    # Claims provin exclusiv din ID token-ul verificat de Authlib.
    subject = claims.get("sub")
    if (
        not isinstance(subject, str) or not subject or len(subject) > 255
        or claims.get("email_verified") is not True
    ):
        return google_error(settings, "google_failed", next_path)
    try:
        email = str(email_adapter.validate_python(claims.get("email"))).lower()
    except ValidationError:
        return google_error(settings, "google_failed", next_path)
    if len(email) > 255:
        return google_error(settings, "google_failed", next_path)

    user = database.scalar(select(User).where(User.google_sub == subject))
    if user is None:
        if database.scalar(select(User.id).where(func.lower(User.email) == email)) is not None:
            # Asocierea automata dupa email ar putea prelua un cont existent.
            return google_error(settings, "google_email_in_use", next_path)
        name = claims.get("name")
        name = name.strip() if isinstance(name, str) else ""
        user = User(name=(name or email.split("@")[0])[:100], email=email, google_sub=subject,
                    password_hash=None, email_verified=True, role="user")
        database.add(user)
        try:
            database.flush()
        except IntegrityError:
            database.rollback()
            # Permite finalizarea a doua autentificari concurente pentru acelasi sub.
            user = database.scalar(select(User).where(User.google_sub == subject))
            if user is None:
                return google_error(settings, "google_email_in_use", next_path)
    if not user.is_active or not user.email_verified:
        return google_error(settings, "google_failed", next_path)

    response = RedirectResponse(settings.frontend_url.rstrip("/") + safe_next(next_path), status_code=303)
    issue_session(user.id, request, response, database, settings)
    response.headers["Referrer-Policy"] = "no-referrer"
    return response
