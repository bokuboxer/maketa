from datetime import UTC, datetime
from enum import Enum as PyEnum
from typing import List

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    firebase_uid: Mapped[str] = mapped_column(Text, nullable=False, unique=True)
    email: Mapped[str] = mapped_column(Text, nullable=False)
    display_name: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(UTC)
    )

    failures: Mapped[List["Failure"]] = relationship("Failure", back_populates="user")


class Failure(Base):
    __tablename__ = "failures"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    self_score: Mapped[int] = mapped_column(Integer, nullable=False)
    has_analyzed: Mapped[bool] = mapped_column(Boolean, default=False)
    conclusion: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(UTC)
    )

    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False
    )
    user: Mapped["User"] = relationship("User", back_populates="failures")

    elements: Mapped[List["Element"]] = relationship(
        "Element", back_populates="failure"
    )


class ElementType(PyEnum):
    INTERNAL = "internal"
    EXTERNAL = "external"
    EMOTIONAL = "emotional"


class Element(Base):
    __tablename__ = "elements"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    type: Mapped[ElementType] = mapped_column(Enum(ElementType), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(UTC)
    )

    failure_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("failures.id"), nullable=False
    )
    failure: Mapped["Failure"] = relationship("Failure", back_populates="elements")
