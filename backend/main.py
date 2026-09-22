from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from database import Base, engine, get_db
from models import Task
from schemas import TaskCreate, TaskDetail, TaskListItem, TaskUpdate

FRONTEND_DIR = Path(__file__).parent.parent / "frontend"

app = FastAPI(title="TaskFlow Pro API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    # 스펙 외 필드는 422, 그 외 형식 위반(title/status/due_at)은 02-specs.md에 따라 400
    if any(error["type"] == "extra_forbidden" for error in exc.errors()):
        status_code = 422
    else:
        status_code = 400
    return JSONResponse(status_code=status_code, content={"detail": exc.errors()})


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)


def _get_task_or_404(db: Session, task_id: int) -> Task:
    task = db.get(Task, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@app.post("/api/tasks", response_model=TaskDetail, status_code=201)
def create_task(payload: TaskCreate, db: Session = Depends(get_db)):
    task = Task(**payload.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@app.get("/api/tasks", response_model=list[TaskListItem])
def list_tasks(db: Session = Depends(get_db)):
    return db.query(Task).order_by(Task.id.desc()).all()


@app.get("/api/tasks/{task_id}", response_model=TaskDetail)
def get_task(task_id: int, db: Session = Depends(get_db)):
    return _get_task_or_404(db, task_id)


@app.put("/api/tasks/{task_id}", response_model=TaskDetail)
def update_task(task_id: int, payload: TaskUpdate, db: Session = Depends(get_db)):
    task = _get_task_or_404(db, task_id)
    for field, value in payload.model_dump().items():
        setattr(task, field, value)
    db.commit()
    db.refresh(task)
    return task


@app.delete("/api/tasks/{task_id}", status_code=204)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = _get_task_or_404(db, task_id)
    db.delete(task)
    db.commit()


app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
