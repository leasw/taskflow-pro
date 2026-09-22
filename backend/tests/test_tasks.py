import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import database
import main
from database import Base


@pytest.fixture(autouse=True)
def temp_db(tmp_path, monkeypatch):
    db_path = tmp_path / "test.db"
    engine = create_engine(
        f"sqlite:///{db_path}", connect_args={"check_same_thread": False}
    )
    TestSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    Base.metadata.create_all(bind=engine)

    monkeypatch.setattr(database, "engine", engine)
    monkeypatch.setattr(database, "SessionLocal", TestSessionLocal)

    def override_get_db():
        db = TestSessionLocal()
        try:
            yield db
        finally:
            db.close()

    main.app.dependency_overrides[database.get_db] = override_get_db
    yield
    main.app.dependency_overrides.clear()


@pytest.fixture
def client():
    return TestClient(main.app)


def test_create_task_title_only(client):
    response = client.post("/api/tasks", json={"title": "Write report"})
    assert response.status_code == 201
    body = response.json()
    assert body["title"] == "Write report"
    assert body["status"] == "todo"


def test_list_tasks_excludes_description(client):
    client.post("/api/tasks", json={"title": "Task A", "description": "secret"})
    response = client.get("/api/tasks")
    assert response.status_code == 200
    body = response.json()
    assert len(body) == 1
    assert "description" not in body[0]


def test_get_task_includes_description(client):
    created = client.post(
        "/api/tasks", json={"title": "Task A", "description": "detail"}
    ).json()
    response = client.get(f"/api/tasks/{created['id']}")
    assert response.status_code == 200
    assert response.json()["description"] == "detail"


def test_update_task_all_fields(client):
    created = client.post("/api/tasks", json={"title": "Task A"}).json()
    response = client.put(
        f"/api/tasks/{created['id']}",
        json={
            "title": "Updated",
            "description": "new desc",
            "status": "in_progress",
            "due_at": "2026-12-31T18:00:00Z",
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["title"] == "Updated"
    assert body["status"] == "in_progress"


def test_delete_task(client):
    created = client.post("/api/tasks", json={"title": "Task A"}).json()
    response = client.delete(f"/api/tasks/{created['id']}")
    assert response.status_code == 204
    assert client.get("/api/tasks").json() == []


def test_create_task_missing_title_returns_400(client):
    response = client.post("/api/tasks", json={})
    assert response.status_code == 400


def test_create_task_invalid_status_returns_400(client):
    response = client.post(
        "/api/tasks", json={"title": "Task A", "status": "not_a_status"}
    )
    assert response.status_code == 400


def test_create_task_invalid_due_at_returns_400(client):
    response = client.post(
        "/api/tasks", json={"title": "Task A", "due_at": "not-a-date"}
    )
    assert response.status_code == 400


def test_get_task_not_found_returns_404(client):
    response = client.get("/api/tasks/9999")
    assert response.status_code == 404


def test_update_task_not_found_returns_404(client):
    response = client.put(
        "/api/tasks/9999",
        json={"title": "X", "status": "todo"},
    )
    assert response.status_code == 404


def test_delete_task_not_found_returns_404(client):
    response = client.delete("/api/tasks/9999")
    assert response.status_code == 404


def test_create_task_rejects_unknown_field(client):
    response = client.post(
        "/api/tasks", json={"title": "Task A", "unknown_field": "x"}
    )
    assert response.status_code == 422
