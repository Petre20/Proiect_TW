"""Support Google accounts without a local password.

Revision ID: 0003
Revises: 0002
"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "0003"
down_revision: str | Sequence[str] | None = "0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("users", sa.Column("google_sub", sa.String(255), nullable=True))
    op.create_unique_constraint(op.f("uq_users_google_sub"), "users", ["google_sub"])
    op.alter_column("users", "password_hash", existing_type=sa.Text(), nullable=True)
    op.create_check_constraint(op.f("ck_users_authentication_method"), "users", "password_hash IS NOT NULL OR google_sub IS NOT NULL")
    op.create_check_constraint(op.f("ck_users_google_sub_not_blank"), "users", "google_sub IS NULL OR btrim(google_sub) <> ''")


def downgrade() -> None:
    if op.get_bind().scalar(sa.text("SELECT 1 FROM users WHERE password_hash IS NULL LIMIT 1")):
        raise RuntimeError("Exista conturi Google fara parola. Migreaza aceste conturi inainte de downgrade.")
    op.drop_constraint(op.f("ck_users_google_sub_not_blank"), "users", type_="check")
    op.drop_constraint(op.f("ck_users_authentication_method"), "users", type_="check")
    op.alter_column("users", "password_hash", existing_type=sa.Text(), nullable=False)
    op.drop_constraint(op.f("uq_users_google_sub"), "users", type_="unique")
    op.drop_column("users", "google_sub")
