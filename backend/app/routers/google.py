import logging
from typing import Annotated

from authlib.integrations.base_client.errors import OAuthError
from fastapi import APIRouter, Depends, HTTPException, Query, Request
import httpx2
from joserfc.errors import JoseError
from starlette.concurrency import run_in_threadpool

from app.dependencies import AppSettings, DatabaseSession, auth_rate_limiter
from app.services.google import complete_google_login, google_error, safe_next


router = APIRouter(prefix="/api/auth/google", tags=["Google"])
logger = logging.getLogger(__name__)


@router.get("/start", dependencies=[Depends(auth_rate_limiter.check)])
async def google_start(request: Request, settings: AppSettings, next: Annotated[str | None, Query(max_length=512)] = None):
    client = request.app.state.google_client
    if not settings.google_enabled or client is None:
        raise HTTPException(503, "Autentificarea Google nu este configurata.")
    request.session.clear()
    request.session["google_next"] = safe_next(next)
    try:
        response = await client.authorize_redirect(request, settings.google_redirect_uri)
        response.headers["Cache-Control"] = "no-store"
        response.headers["Referrer-Policy"] = "no-referrer"
        return response
    except (OAuthError, httpx2.HTTPError):
        request.session.clear()
        logger.warning("Initializarea autentificarii Google a esuat.")
        return google_error(settings, "google_failed", safe_next(next))


@router.get("/callback", dependencies=[Depends(auth_rate_limiter.check)])
async def google_callback(request: Request, database: DatabaseSession, settings: AppSettings):
    client = request.app.state.google_client
    if not settings.google_enabled or client is None:
        return google_error(settings, "google_failed")
    next_path = safe_next(request.session.get("google_next"))
    try:
        token = await client.authorize_access_token(request)
        if not token.get("id_token") or not token.get("userinfo"):
            return google_error(settings, "google_failed", next_path)
        return await run_in_threadpool(complete_google_login, token["userinfo"], next_path, request, database, settings)
    except (OAuthError, httpx2.HTTPError, JoseError, ValueError):
        # Nu include coduri OAuth, tokenuri sau mesaje ale furnizorului in loguri.
        logger.warning("Validarea autentificarii Google a esuat.")
        return google_error(settings, "google_failed", next_path)
    finally:
        request.session.clear()
