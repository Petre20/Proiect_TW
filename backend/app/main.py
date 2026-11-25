from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.database import get_session
from app.config import get_settings
from app.routers.auth import router as auth_router


app = FastAPI(title="WellTrack API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_settings().cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE"],
    allow_headers=["Content-Type", "X-Requested-With"],
)
app.include_router(auth_router)


@app.exception_handler(RequestValidationError)
async def validation_error(request: Request, exception: RequestValidationError) -> JSONResponse:
    # Evita includerea parolelor sau a tokenurilor primite in raspunsurile de eroare.
    errors = [{key: error[key] for key in ("type", "loc", "msg")} for error in exception.errors()]
    return JSONResponse(status_code=422, content={"detail": errors})


@app.get("/api/health", tags=["Health"])
def health(session: Annotated[Session, Depends(get_session)]) -> dict[str, str]:
    try:
        session.execute(text("SELECT 1"))
    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Baza de date nu este disponibila.",
        ) from None
    return {"status": "ok", "database": "ok"}
