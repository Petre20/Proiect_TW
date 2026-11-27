from datetime import timedelta

from fastapi import Request, Response
from sqlalchemy import delete
from sqlalchemy.orm import Session

from app.config import Settings
from app.models import AuthSession
from app.services.security import generate_token, hash_token, utc_now


def issue_session(user_id: int, request: Request, response: Response, database: Session, settings: Settings) -> None:
    previous_token = request.cookies.get(settings.session_cookie_name)
    if previous_token and len(previous_token) <= 512:
        database.execute(delete(AuthSession).where(AuthSession.session_token_hash == hash_token(previous_token)))
    token = generate_token()
    now = utc_now()
    expires_at = now + timedelta(days=settings.session_ttl_days)
    database.add(AuthSession(user_id=user_id, session_token_hash=hash_token(token), created_at=now, expires_at=expires_at))
    database.commit()
    response.set_cookie(
        key=settings.session_cookie_name, value=token, httponly=True,
        secure=settings.session_cookie_secure, samesite="lax", path="/",
        max_age=settings.session_ttl_days * 24 * 60 * 60, expires=expires_at,
    )
    response.headers["Cache-Control"] = "no-store"
