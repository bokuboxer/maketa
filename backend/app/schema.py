from pydantic import BaseModel


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
