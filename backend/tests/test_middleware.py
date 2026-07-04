import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_request_id_generation():
    response = client.get("/docs") # Testing a public endpoint to see if middleware attaches header
    assert response.status_code == 200
    assert "X-Request-ID" in response.headers
    request_id = response.headers["X-Request-ID"]
    
    # Verify it is a valid UUIDv4 format
    import uuid
    try:
        val = uuid.UUID(request_id, version=4)
        assert str(val) == request_id
    except ValueError:
        pytest.fail("Request ID is not a valid UUIDv4")

def test_error_standardization():
    # Trigger a 404
    response = client.get("/invalid-endpoint-that-does-not-exist")
    assert response.status_code == 404
    
    data = response.json()
    assert "request_id" in data
    assert "error" in data
    assert data["error"]["code"] == "NOT_FOUND"
    assert "X-Request-ID" in response.headers
