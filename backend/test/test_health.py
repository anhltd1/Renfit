"""The public health endpoint must not leak configuration."""

from fastapi.testclient import TestClient


def test_health_is_liveness_only():
    from src.main import app

    res = TestClient(app).get("/api/v1/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}
