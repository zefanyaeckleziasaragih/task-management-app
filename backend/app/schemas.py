from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, EmailStr

from app.models import TaskStatus


# ---------- Auth ----------
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ---------- User ----------
class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr

    class Config:
        from_attributes = True


# ---------- Task ----------
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.todo
    deadline: Optional[date] = None
    assignee_id: Optional[int] = None


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    deadline: Optional[date] = None
    assignee_id: Optional[int] = None


class TaskOut(TaskBase):
    id: int
    created_at: datetime
    updated_at: datetime
    assignee: Optional[UserOut] = None

    class Config:
        from_attributes = True


# ---------- Chatbot ----------
class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str
