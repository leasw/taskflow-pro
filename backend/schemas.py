from datetime import datetime, timezone

from pydantic import BaseModel, ConfigDict, field_serializer, field_validator

from models import TaskStatus


def _to_utc_iso8601(value: datetime | None) -> str | None:
    if value is None:
        return None
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")


def _normalize_due_at(value: datetime | None) -> datetime | None:
    # due_at은 02-specs.md에 따라 UTC로 저장한다. 오프셋이 있으면 UTC로 변환 후
    # SQLite DateTime 컬럼에 안전하게 저장하기 위해 naive로 벗겨낸다.
    if value is None:
        return None
    if value.tzinfo is not None:
        value = value.astimezone(timezone.utc).replace(tzinfo=None)
    return value


class TaskCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str
    description: str | None = None
    status: TaskStatus = TaskStatus.TODO
    due_at: datetime | None = None

    @field_validator("due_at")
    @classmethod
    def normalize_due_at(cls, value: datetime | None) -> datetime | None:
        return _normalize_due_at(value)


class TaskUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str
    description: str | None = None
    status: TaskStatus
    due_at: datetime | None = None

    @field_validator("due_at")
    @classmethod
    def normalize_due_at(cls, value: datetime | None) -> datetime | None:
        return _normalize_due_at(value)


class _UtcTimestampMixin(BaseModel):
    due_at: datetime | None
    created_at: datetime
    updated_at: datetime

    @field_serializer("due_at", "created_at", "updated_at")
    def serialize_utc(self, value: datetime | None) -> str | None:
        return _to_utc_iso8601(value)


class TaskListItem(_UtcTimestampMixin):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    status: TaskStatus


class TaskDetail(_UtcTimestampMixin):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str | None
    status: TaskStatus
