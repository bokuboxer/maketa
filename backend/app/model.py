from datetime import UTC, datetime

from sqlalchemy import Boolean, Column, DateTime, Enum, ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    firebase_uid = Column(Text, nullable=False, unique=True)
    email = Column(Text, nullable=False)
    display_name = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))

    failures: Mapped[list["Failure"]] = relationship("Failure", back_populates="user")


class Failure(Base):
    __tablename__ = "failures"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(Text, nullable=False)
    self_score = Column(Integer, nullable=False)
    has_analyzed = Column(Boolean, default=False)
    conclusion = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user: Mapped["User"] = relationship("User", back_populates="failures")

    elements: Mapped[list["Element"]] = relationship(
        "Element", back_populates="failure"
    )


class ElementType(Enum):
    INTERNAL = "internal"
    EXTERNAL = "external"
    EMOTIONAL = "emotional"


class Element(Base):
    __tablename__ = "elements"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(Text, nullable=False)
    type = Column(ElementType, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))

    failure_id = Column(Integer, ForeignKey("failures.id"), nullable=False)
    failure: Mapped["Failure"] = relationship("Failure", back_populates="elements")
