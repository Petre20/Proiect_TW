from fastapi.testclient import TestClient
from sqlalchemy.exc import OperationalError

from app.database import get_session
from app.main import app


def test_health_with_available_database():
    class AvailableSession:
        def execute(self, statement):
            return None

    app.dependency_overrides[get_session] = lambda: AvailableSession()
    try:
        with TestClient(app) as client:
            response = client.get("/api/health")
        assert response.status_code == 200
        assert response.json() == {"status": "ok", "database": "ok"}
    finally:
        app.dependency_overrides.clear()


def test_health_hides_database_error():
    class UnavailableSession:
        def execute(self, statement):
            raise OperationalError("SELECT 1", {}, Exception("private connection details"))

    app.dependency_overrides[get_session] = lambda: UnavailableSession()
    try:
        with TestClient(app) as client:
            response = client.get("/api/health")
        assert response.status_code == 503
        assert response.json() == {"detail": "Baza de date nu este disponibila."}
    finally:
        app.dependency_overrides.clear()
