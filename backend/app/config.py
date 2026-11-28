from functools import lru_cache
from pathlib import Path
from typing import Literal
from urllib.parse import urlsplit

from pydantic import EmailStr, Field, SecretStr, TypeAdapter, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy import URL, make_url
from sqlalchemy.exc import ArgumentError


BACKEND_DIR = Path(__file__).resolve().parents[1]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
        hide_input_in_errors=True,
    )

    database_host: str = "127.0.0.1"
    database_port: int = Field(default=5432, ge=1, le=65535)
    database_name: str = "welltrack"
    database_user: str = "welltrack_app"
    database_password: SecretStr = SecretStr("")
    database_connection_url: SecretStr = Field(default=SecretStr(""), validation_alias="DATABASE_URL")
    database_connect_timeout: int = Field(default=10, ge=1, le=120)

    app_env: Literal["development", "test", "production"] = "development"
    frontend_url: str = "http://localhost:5173"
    cors_origins: list[str] = [
        "http://127.0.0.1:5173", "http://localhost:5173",
        "http://127.0.0.1:8000", "http://localhost:8000",
    ]
    session_ttl_days: int = Field(default=7, ge=1, le=30)
    session_cookie_name: str = "welltrack_session"
    session_cookie_secure: bool = False
    verification_ttl_minutes: int = Field(default=60, ge=1, le=1440)
    verification_resend_seconds: int = Field(default=60, ge=1)
    auth_requests_per_minute: int = Field(default=10, ge=1)
    email_delivery: Literal["local", "resend", "brevo"] = "local"
    local_email_directory: Path = BACKEND_DIR / ".local" / "emails"
    resend_api_key: SecretStr = SecretStr("")
    brevo_api_key: SecretStr = SecretStr("")
    email_from: str = ""
    email_from_name: str = Field(default="WellTrack", min_length=1)

    google_enabled: bool = False
    google_client_id: str = ""
    google_client_secret: SecretStr = SecretStr("")
    google_redirect_uri: str = "http://localhost:5173/api/auth/google/callback"
    oauth_session_secret: SecretStr = SecretStr("")

    @model_validator(mode="after")
    def validate_database_configuration(self) -> "Settings":
        # Validarea timpurie evita conectarea accidentala la baza locala.
        self.database_url
        return self

    @model_validator(mode="after")
    def validate_auth_configuration(self) -> "Settings":
        frontend = urlsplit(self.frontend_url)
        if frontend.scheme not in {"http", "https"} or not frontend.netloc:
            raise ValueError("FRONTEND_URL trebuie sa fie un URL HTTP sau HTTPS.")
        for origin in self.cors_origins:
            parsed = urlsplit(origin)
            if (
                parsed.scheme not in {"http", "https"} or not parsed.netloc
                or parsed.path or parsed.query or parsed.fragment
                or parsed.username or parsed.password or "*" in origin
            ):
                raise ValueError("CORS_ORIGINS trebuie sa contina origini explicite, fara cale sau wildcard.")
        if self.email_delivery == "resend" and (
            not self.resend_api_key.get_secret_value() or not self.email_from
        ):
            raise ValueError("Pentru Resend sunt necesare RESEND_API_KEY si EMAIL_FROM.")
        if self.email_delivery == "brevo":
            if not self.brevo_api_key.get_secret_value().strip() or not self.email_from:
                raise ValueError("Pentru Brevo sunt necesare BREVO_API_KEY si EMAIL_FROM.")
            self.email_from = str(TypeAdapter(EmailStr).validate_python(self.email_from))
        if self.google_enabled:
            redirect = urlsplit(self.google_redirect_uri)
            frontend_origin = f"{frontend.scheme}://{frontend.netloc}"
            if (
                not self.google_client_id or not self.google_client_secret.get_secret_value()
                or len(self.oauth_session_secret.get_secret_value()) < 32
            ):
                raise ValueError("Google necesita GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET si OAUTH_SESSION_SECRET de minimum 32 de caractere.")
            if (
                redirect.scheme not in {"http", "https"} or not redirect.netloc
                or redirect.path != "/api/auth/google/callback"
                or redirect.query or redirect.fragment or redirect.username or redirect.password
            ):
                raise ValueError("GOOGLE_REDIRECT_URI trebuie sa indice ruta /api/auth/google/callback.")
            if redirect.hostname != frontend.hostname or frontend_origin not in self.cors_origins:
                raise ValueError("Google necesita acelasi hostname pentru callback si frontend si o origine frontend permisa in CORS.")
            if self.app_env == "production" and redirect.scheme != "https":
                raise ValueError("Callback-ul Google necesita HTTPS in productie.")
        if self.app_env == "production" and (
            not self.session_cookie_secure or frontend.scheme != "https"
            or self.email_delivery not in {"resend", "brevo"}
            or any(not origin.startswith("https://") for origin in self.cors_origins)
        ):
            raise ValueError("Productia necesita HTTPS, cookie Secure si trimiterea emailurilor prin Resend sau Brevo.")
        return self

    @property
    def database_url(self) -> URL:
        connection_url = self.database_connection_url.get_secret_value().strip()
        if connection_url:
            try:
                url = make_url(connection_url)
            except (ArgumentError, ValueError):
                raise ValueError("DATABASE_URL nu este un URL PostgreSQL valid.") from None
            if (
                url.drivername not in {"postgres", "postgresql", "postgresql+psycopg"}
                or not url.host or not url.database or not url.username
            ):
                raise ValueError("DATABASE_URL necesita PostgreSQL, host, utilizator si numele bazei.")
            if url.host.endswith(".neon.tech") and url.query.get("sslmode") not in {
                "require", "verify-ca", "verify-full",
            }:
                raise ValueError("Conexiunea Neon necesita sslmode=require sau verificare TLS mai stricta.")
            return url.set(drivername="postgresql+psycopg")
        if not self.database_password.get_secret_value().strip():
            raise ValueError("Completeaza DATABASE_URL sau DATABASE_PASSWORD pentru conexiunea locala.")
        return URL.create(
            "postgresql+psycopg",
            username=self.database_user,
            password=self.database_password.get_secret_value(),
            host=self.database_host,
            port=self.database_port,
            database=self.database_name,
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()
