import enum

from sqlalchemy import Column, Integer, String, Text, Date, DateTime, ForeignKey, Enum, func
from sqlalchemy.orm import relationship

from app.database import Base


class TaskStatus(str, enum.Enum):
    todo = "Todo"
    in_progress = "In Progress"
    done = "Done"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    tasks = relationship("Task", back_populates="assignee")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(
        Enum(TaskStatus, name="task_status", values_callable=lambda x: [e.value for e in x]),
        nullable=False,
        default=TaskStatus.todo,
    )
    deadline = Column(Date, nullable=True)
    assignee_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    assignee = relationship("User", back_populates="tasks")
