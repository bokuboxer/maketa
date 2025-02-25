from datetime import datetime

from pydantic import BaseModel

from .model import ElementType


class Element(BaseModel):
    id: int
    description: str
    type: ElementType
    created_at: datetime

    class Config:
        orm_mode = True


class Failure(BaseModel):
    id: int
    description: str
    self_score: int
    created_at: datetime
    conclusion: str | None
    elements: list[Element]

    class Config:
        orm_mode = True


class User(BaseModel):
    id: int
    firebase_uid: str
    email: str
    display_name: str | None
    created_at: datetime
    failures: list[Failure]

    class Config:
        orm_mode = True


class AnalyzeInput(BaseModel):
    text: str


class CreateUserInput(BaseModel):
    firebase_uid: str
    email: str


class GetUserByFirebaseUidInput(BaseModel):
    firebase_uid: str


class CreateFailureInput(BaseModel):
    description: str
    self_score: int

