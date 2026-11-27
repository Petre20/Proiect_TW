from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session
from starlette.middleware.sessions import SessionMiddleware

from app.database import get_session
from app.config import Settings, get_settings
from app.routers.auth import router as auth_router
from app.routers.google import router as google_router
from app.services.google import create_google_client


async def validation_error(request: Request, exception: RequestValidationError) -> JSONResponse:
    # Evita includerea parolelor sau a tokenurilor primite in raspunsurile de eroare.
    errors = [{key: error[key] for key in ("type", "loc", "msg")} for error in exception.errors()]
    return JSONResponse(status_code=422, content={"detail": errors})


def health(session: Annotated[Session, Depends(get_session)]) -> dict[str, str]:
    try:
        session.execute(text("SELECT 1"))
    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Baza de date nu este disponibila.",
        ) from None
    return {"status": "ok", "database": "ok"}


def create_app(settings: Settings | None = None) -> FastAPI:
    configured = settings or get_settings()
    application = FastAPI(title="WellTrack API", version="0.1.0")
    application.add_middleware(
        CORSMiddleware, allow_origins=configured.cors_origins, allow_credentials=True,
        allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE"],
        allow_headers=["Content-Type", "X-Requested-With"],
    )
    if configured.google_enabled:
        application.add_middleware(
            SessionMiddleware, secret_key=configured.oauth_session_secret.get_secret_value(),
            session_cookie="welltrack_oauth", max_age=600, same_site="lax",
            https_only=configured.session_cookie_secure,
        )
    application.state.google_client = create_google_client(configured)
    if settings is not None:
        application.dependency_overrides[get_settings] = lambda: configured
    application.include_router(auth_router)
    application.include_router(google_router)
    application.add_exception_handler(RequestValidationError, validation_error)
    application.add_api_route("/api/health", health, methods=["GET"], tags=["Health"])
    return application


app = create_app()
