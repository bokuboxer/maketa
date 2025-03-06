from datetime import UTC, datetime
from enum import Enum as PyEnum
from typing import List

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, Text, Float, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    firebase_uid: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
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
    reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    has_analyzed: Mapped[bool] = mapped_column(Boolean, default=False)
    conclusion: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(UTC)
    )

    hero_name: Mapped[str | None] = mapped_column(Text, nullable=True)
    hero_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    hero_failure: Mapped[str | None] = mapped_column(Text, nullable=True)
    hero_failure_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    hero_failure_source: Mapped[str | None] = mapped_column(Text, nullable=True)
    hero_failure_certainty: Mapped[float | None] = mapped_column(Float, nullable=True)

    explain_certainty: Mapped[str | None] = mapped_column(Text, nullable=True)

    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False
    )
    user: Mapped["User"] = relationship("User", back_populates="failures")

    elements: Mapped[List["Element"]] = relationship(
        "Element", back_populates="failure"
    )


class ElementType(PyEnum):
    ADVERSITY = "adversity"
    BELIEF = "belief"
    DISPUTATION = "disputation"


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
