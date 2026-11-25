"""Create users.

Revision ID: 0001
Revises:
"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "0001"
down_revision: str | Sequence[str] | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.BigInteger(), sa.Identity(), nullable=False),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("password_hash", sa.Text(), nullable=False),
        sa.Column("role", sa.String(20), server_default=sa.text("'user'"), nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("email_verified", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("email_verification_token_hash", sa.Text(), nullable=True),
        sa.Column("email_verification_expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("interests", postgresql.ARRAY(sa.Text()), server_default=sa.text("'{}'::text[]"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.CheckConstraint("role IN ('user', 'admin')", name=op.f("ck_users_role_values")),
        sa.CheckConstraint("btrim(name) <> ''", name=op.f("ck_users_name_not_blank")),
        sa.CheckConstraint("btrim(email) <> ''", name=op.f("ck_users_email_not_blank")),
        sa.CheckConstraint("btrim(password_hash) <> ''", name=op.f("ck_users_password_hash_not_blank")),
        sa.CheckConstraint(
            "(email_verification_token_hash IS NULL) = (email_verification_expires_at IS NULL)",
            name=op.f("ck_users_verification_token_pair"),
        ),
        sa.CheckConstraint("array_position(interests, NULL) IS NULL", name=op.f("ck_users_interests_no_nulls")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_users")),
    )
    op.create_index("uq_users_email_lower", "users", [sa.text("lower(email)")], unique=True)


def downgrade() -> None:
    op.drop_index("uq_users_email_lower", table_name="users")
    op.drop_table("users")
