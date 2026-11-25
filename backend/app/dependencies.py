from collections import deque
from dataclasses import dataclass
from threading import Lock
from time import monotonic
from typing import Annotated

from fastapi import Depends, Header, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import Settings, get_settings
from app.database import get_session
from app.models import AuthSession, User
from app.services.security import hash_token, utc_now


DatabaseSession = Annotated[Session, Depends(get_session)]
AppSettings = Annotated[Settings, Depends(get_settings)]


def require_trusted_request(
    request: Request,
    settings: AppSettings,
    x_requested_with: Annotated[
        str | None, Header(alias="X-Requested-With", examples=["WellTrack"])
    ] = None,
) -> None:
    # Headerul personalizat si originile explicite impiedica cererile CSRF din browser.
    if x_requested_with != "WellTrack":
        raise HTTPException(403, "Este necesar headerul X-Requested-With: WellTrack.")
    origin = request.headers.get("origin")
    if origin is not None and origin not in settings.cors_origins:
        raise HTTPException(403, "Originea cererii nu este permisa.")
    if request.headers.get("sec-fetch-site") == "cross-site":
        raise HTTPException(403, "Cererile cross-site nu sunt permise.")


class AuthRateLimiter:
    """Limitare locala pe IP si endpoint, pentru o singura instanta API."""

    def __init__(self) -> None:
        self.events: dict[tuple[str, str], deque[float]] = {}
        self.lock = Lock()

    def check(self, request: Request, settings: AppSettings) -> None:
        now = monotonic()
        key = (request.client.host if request.client else "unknown", request.url.path)
        with self.lock:
            expired = [key for key, times in self.events.items() if times[-1] <= now - 60]
            for old_key in expired:
                del self.events[old_key]
            times = self.events.setdefault(key, deque())
            while times and times[0] <= now - 60:
                times.popleft()
            if len(times) >= settings.auth_requests_per_minute:
                raise HTTPException(429, "Prea multe incercari. Reincearca mai tarziu.", headers={"Retry-After": "60"})
            times.append(now)


auth_rate_limiter = AuthRateLimiter()


@dataclass
class AuthContext:
    user: User
    auth_session: AuthSession


def get_auth_context(request: Request, database: DatabaseSession, settings: AppSettings) -> AuthContext:
    token = request.cookies.get(settings.session_cookie_name)
    if not token or len(token) > 512:
        raise HTTPException(401, "Autentificarea este necesara.")
    result = database.execute(
        select(AuthSession, User)
        .join(User, AuthSession.user_id == User.id)
        .where(AuthSession.session_token_hash == hash_token(token), AuthSession.expires_at > utc_now())
    ).one_or_none()
    if result is None:
        raise HTTPException(401, "Sesiunea nu este valida sau a expirat.")
    auth_session, user = result
    if not user.is_active or not user.email_verified:
        raise HTTPException(403, "Contul nu are acces la aplicatie.")
    return AuthContext(user=user, auth_session=auth_session)


def get_current_user(context: Annotated[AuthContext, Depends(get_auth_context)]) -> User:
    return context.user


def require_admin(user: Annotated[User, Depends(get_current_user)]) -> User:
    if user.role != "admin":
        raise HTTPException(403, "Acces rezervat administratorilor.")
    return user
