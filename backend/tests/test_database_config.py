import pytest
from pydantic import ValidationError

from app.config import Settings


def database_settings(**overrides):
    return Settings(_env_file=None, **{
        "DATABASE_URL": "", "database_password": "local-test-password",
        **overrides,
    })


def test_local_connection_remains_available():
    settings = database_settings()
    assert settings.database_url.drivername == "postgresql+psycopg"
    assert settings.database_url.host == "127.0.0.1"
    assert settings.database_url.database == "welltrack"
    assert settings.database_url.password == "local-test-password"


@pytest.mark.parametrize("scheme", ["postgres", "postgresql", "postgresql+psycopg"])
def test_neon_url_takes_priority_and_preserves_credentials_and_tls(scheme):
    settings = database_settings(
        DATABASE_URL=f"{scheme}://owner:test%40password@ep-test.eu-central-1.aws.neon.tech/welltrack"
        "?sslmode=require&channel_binding=require",
        database_password="", database_host="unused-local-host",
    )
    url = settings.database_url
    assert url.drivername == "postgresql+psycopg"
    assert url.host == "ep-test.eu-central-1.aws.neon.tech"
    assert url.username == "owner"
    assert url.password == "test@password"
    assert url.database == "welltrack"
    assert dict(url.query) == {"sslmode": "require", "channel_binding": "require"}
    assert "test%40password" not in repr(settings)
    assert "test@password" not in str(url)


def test_database_url_is_loaded_from_env_file(tmp_path):
    env_file = tmp_path / ".env"
    env_file.write_text(
        'DATABASE_URL="postgresql://owner:test-password@db.example.com/welltrack?sslmode=require"\n'
    )
    settings = Settings(_env_file=env_file)
    assert settings.database_url.host == "db.example.com"
    assert settings.database_url.query["sslmode"] == "require"


@pytest.mark.parametrize("connection_url", [
    "not-a-url", "postgresql://owner:private-password@host:invalid/db",
    "sqlite:///local.db", "postgresql:///welltrack",
    "postgresql://owner:private-password@host",
    "postgresql://owner:private-password@ep-test.eu-central-1.aws.neon.tech/welltrack",
    "postgresql://owner:private-password@ep-test.eu-central-1.aws.neon.tech/welltrack?sslmode=disable",
])
def test_invalid_url_is_rejected_without_falling_back_or_exposing_credentials(connection_url):
    with pytest.raises(ValidationError) as exception:
        database_settings(DATABASE_URL=connection_url)
    assert "private-password" not in str(exception.value)


def test_local_connection_requires_password():
    with pytest.raises(ValidationError):
        database_settings(database_password="")


def test_engine_receives_timeout_and_connection_url(monkeypatch):
    from app import database

    settings = database_settings(database_connect_timeout=20)
    captured = {}
    sentinel = object()

    def fake_engine(url, **kwargs):
        captured.update(url=url, **kwargs)
        return sentinel

    monkeypatch.setattr(database, "get_settings", lambda: settings)
    monkeypatch.setattr(database, "create_engine", fake_engine)
    database.get_engine.cache_clear()
    try:
        assert database.get_engine() is sentinel
        assert captured["url"] == settings.database_url
        assert captured["connect_args"] == {"connect_timeout": 20}
        assert captured["pool_pre_ping"] is True
        assert captured["hide_parameters"] is True
    finally:
        database.get_engine.cache_clear()
