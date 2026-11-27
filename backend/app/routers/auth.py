from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError

from app.dependencies import (
    AppSettings, AuthContext, DatabaseSession, auth_rate_limiter,
    get_auth_context, get_current_user, require_trusted_request,
)
from app.models import User
from app.schemas.auth import EmailInput, LoginInput, MessageOutput, RegisterInput, UserOutput, VerifyEmailInput
from app.services.email import EmailDeliveryError, send_verification_email
from app.services.sessions import issue_session
from app.services.security import (
    dummy_password_hash, generate_token, hash_password, hash_token,
    password_hasher, utc_now, verify_password,
)


router = APIRouter(prefix="/api/auth", tags=["Autentificare"])
mutating_dependencies = [Depends(require_trusted_request), Depends(auth_rate_limiter.check)]
RESEND_MESSAGE = "Daca adresa apartine unui cont eligibil, vei primi un email de verificare."


def deliver_verification(user: User, database: DatabaseSession, settings: AppSettings) -> None:
    token = generate_token()
    user.email_verification_token_hash = hash_token(token)
    user.email_verification_expires_at = utc_now() + timedelta(minutes=settings.verification_ttl_minutes)
    database.flush()
    try:
        send_verification_email(user.email, token, settings)
    except EmailDeliveryError:
        database.rollback()
        raise HTTPException(503, "Emailul nu a putut fi trimis. Reincearca mai tarziu.") from None


@router.post("/register", status_code=201, response_model=MessageOutput, dependencies=mutating_dependencies)
def register(data: RegisterInput, database: DatabaseSession, settings: AppSettings) -> dict[str, str]:
    user = User(name=data.name, email=str(data.email), password_hash=hash_password(data.password.get_secret_value()), role="user")
    database.add(user)
    try:
        deliver_verification(user, database, settings)
        database.commit()
    except IntegrityError:
        database.rollback()
        raise HTTPException(409, "Adresa de email este deja folosita.") from None
    return {"message": "Contul a fost creat. Verifica emailul inainte de autentificare."}


@router.post("/verify-email", response_model=MessageOutput, dependencies=mutating_dependencies)
def verify_email(data: VerifyEmailInput, database: DatabaseSession) -> dict[str, str]:
    user = database.scalar(
        select(User).where(User.email_verification_token_hash == hash_token(data.token.get_secret_value())).with_for_update()
    )
    if user is None or user.email_verification_expires_at is None or user.email_verification_expires_at <= utc_now():
        raise HTTPException(400, "Tokenul de verificare nu este valid sau a expirat.")
    if not user.is_active:
        raise HTTPException(403, "Contul nu este activ.")
    user.email_verified = True
    user.email_verification_token_hash = None
    user.email_verification_expires_at = None
    database.commit()
    return {"message": "Emailul a fost verificat. Te poti autentifica."}


@router.post("/resend-verification", status_code=202, response_model=MessageOutput, dependencies=mutating_dependencies)
def resend_verification(data: EmailInput, database: DatabaseSession, settings: AppSettings) -> dict[str, str]:
    user = database.scalar(select(User).where(func.lower(User.email) == str(data.email)).with_for_update())
    if user is None or user.email_verified or not user.is_active:
        return {"message": RESEND_MESSAGE}
    if user.email_verification_expires_at is not None:
        issued_at = user.email_verification_expires_at - timedelta(minutes=settings.verification_ttl_minutes)
        if utc_now() < issued_at + timedelta(seconds=settings.verification_resend_seconds):
            return {"message": RESEND_MESSAGE}
    deliver_verification(user, database, settings)
    database.commit()
    return {"message": RESEND_MESSAGE}


@router.post("/login", response_model=UserOutput, dependencies=mutating_dependencies)
def login(data: LoginInput, request: Request, response: Response, database: DatabaseSession, settings: AppSettings) -> User:
    user = database.scalar(select(User).where(func.lower(User.email) == str(data.email)))
    stored_hash = user.password_hash if user is not None and user.password_hash else dummy_password_hash()
    password = data.password.get_secret_value()
    valid_password = verify_password(password, stored_hash)
    if user is None or user.password_hash is None or not valid_password:
        raise HTTPException(401, "Email sau parola incorecta.")
    if not user.is_active:
        raise HTTPException(403, "Contul nu este activ.")
    if not user.email_verified:
        raise HTTPException(403, "Verifica adresa de email inainte de autentificare.")
    if password_hasher.check_needs_rehash(user.password_hash):
        user.password_hash = hash_password(password)

    issue_session(user.id, request, response, database, settings)
    database.refresh(user)
    return user


@router.get("/me", response_model=UserOutput)
def me(response: Response, user: Annotated[User, Depends(get_current_user)]) -> User:
    response.headers["Cache-Control"] = "no-store"
    return user


@router.post("/logout", status_code=204, dependencies=mutating_dependencies)
def logout(response: Response, database: DatabaseSession, settings: AppSettings, context: Annotated[AuthContext, Depends(get_auth_context)]) -> None:
    database.delete(context.auth_session)
    database.commit()
    response.delete_cookie(
        key=settings.session_cookie_name, path="/", httponly=True,
        secure=settings.session_cookie_secure, samesite="lax",
    )
    response.headers["Cache-Control"] = "no-store"
