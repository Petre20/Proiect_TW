"""Teste PostgreSQL explicite; toate inserarile sunt anulate la final."""
import os
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import insert
from sqlalchemy.exc import IntegrityError

from app.database import get_engine
from app.main import app
from app.models import User


pytestmark = pytest.mark.skipif(
    os.getenv("WELLTRACK_RUN_DB_TESTS") != "1",
    reason="Seteaza WELLTRACK_RUN_DB_TESTS=1 pentru testele pe PostgreSQL configurat in .env.",
)


@pytest.fixture
def connection():
    with get_engine().connect() as connection:
        transaction = connection.begin()
        try:
            yield connection
        finally:
            transaction.rollback()


def user_values(**changes):
    values = {
        "name": "Test User",
        "email": f"{uuid4().hex}@example.test",
        "password_hash": "test-only-placeholder-not-a-real-password-hash",
    }
    values.update(changes)
    return values


def test_health_with_configured_database():
    with TestClient(app) as client:
        response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "database": "ok"}


def test_user_database_defaults(connection):
    row = connection.execute(
        insert(User).values(**user_values()).returning(User.__table__)
    ).mappings().one()
    assert row["role"] == "user"
    assert row["is_active"] is True
    assert row["email_verified"] is False
    assert row["interests"] == []
    assert row["created_at"].tzinfo is not None


def test_email_is_unique_ignoring_case(connection):
    email = f"{uuid4().hex}@example.test"
    connection.execute(insert(User).values(**user_values(email=email)))
    with pytest.raises(IntegrityError):
        with connection.begin_nested():
            connection.execute(insert(User).values(**user_values(email=email.upper())))


@pytest.mark.parametrize(
    "changes",
    [
        {"role": "superadmin"},
        {"email_verification_token_hash": "test-token-without-expiration"},
        {"interests": [None]},
        {"name": "   "},
    ],
)
def test_invalid_user_is_rejected(connection, changes):
    with pytest.raises(IntegrityError):
        with connection.begin_nested():
            connection.execute(insert(User).values(**user_values(**changes)))
