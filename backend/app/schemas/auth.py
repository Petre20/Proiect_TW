from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, SecretStr, field_validator


class AuthInput(BaseModel):
    model_config = ConfigDict(extra="forbid")


class EmailInput(AuthInput):
    email: EmailStr = Field(max_length=255)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return value.lower()


class RegisterInput(EmailInput):
    name: str = Field(min_length=1, max_length=100)
    password: SecretStr = Field(min_length=8, max_length=128)

    @field_validator("name")
    @classmethod
    def normalize_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Numele este obligatoriu.")
        return value


class LoginInput(EmailInput):
    password: SecretStr = Field(min_length=1, max_length=128)


class VerifyEmailInput(AuthInput):
    token: SecretStr = Field(min_length=20, max_length=512)


class UserOutput(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    role: Literal["user", "admin"]
    is_active: bool
    email_verified: bool
    interests: list[str]
    created_at: datetime


class MessageOutput(BaseModel):
    message: str
