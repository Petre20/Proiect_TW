from datetime import datetime

from sqlalchemy import (
    BigInteger,
    Boolean,
    CheckConstraint,
    DateTime,
    Identity,
    Index,
    String,
    Text,
    func,
    text,
)
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(255))
    password_hash: Mapped[str] = mapped_column(Text)
    role: Mapped[str] = mapped_column(String(20), server_default=text("'user'"))
    is_active: Mapped[bool] = mapped_column(Boolean, server_default=text("true"))
    email_verified: Mapped[bool] = mapped_column(Boolean, server_default=text("false"))
    email_verification_token_hash: Mapped[str | None] = mapped_column(Text)
    email_verification_expires_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True)
    )
    interests: Mapped[list[str]] = mapped_column(
        ARRAY(Text), server_default=text("'{}'::text[]")
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    __table_args__ = (
        Index("uq_users_email_lower", func.lower(email), unique=True),
        CheckConstraint("role IN ('user', 'admin')", name="role_values"),
        CheckConstraint("btrim(name) <> ''", name="name_not_blank"),
        CheckConstraint("btrim(email) <> ''", name="email_not_blank"),
        CheckConstraint("btrim(password_hash) <> ''", name="password_hash_not_blank"),
        CheckConstraint(
            "(email_verification_token_hash IS NULL) = "
            "(email_verification_expires_at IS NULL)",
            name="verification_token_pair",
        ),
        CheckConstraint(
            "array_position(interests, NULL) IS NULL", name="interests_no_nulls"
        ),
    )
