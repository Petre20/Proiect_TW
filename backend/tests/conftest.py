import os
from pathlib import Path

import pytest


# Testele fara PostgreSQL pot rula si intr-un checkout fara configuratie locala.
if not (Path(__file__).resolve().parents[1] / ".env").exists():
    os.environ.setdefault("DATABASE_PASSWORD", "test-only-not-used-for-a-connection")


@pytest.fixture(autouse=True)
def isolate_auth_rate_limit():
    from app.dependencies import auth_rate_limiter

    with auth_rate_limiter.lock:
        auth_rate_limiter.events.clear()
    yield
    with auth_rate_limiter.lock:
        auth_rate_limiter.events.clear()
