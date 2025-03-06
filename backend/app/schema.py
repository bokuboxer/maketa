from datetime import datetime
from typing import List

from pydantic import BaseModel, ConfigDict

import app.model as model


class BeliefLabel(BaseModel):
    id: int
    description: str
    type: str  # 'internal' or 'external'
    explanation: str | None = None
    evidence: str | None = None
    disputation: str | None = None
    new_perspective: str | None = None


class BeliefAnalysisResult(BaseModel):
    labels: List[BeliefLabel]


class Element(BaseModel):
    id: int
    description: str
    type: model.ElementType
    created_at: datetime
    failure_id: int

    model_config = ConfigDict(from_attributes=True)


class Failure(BaseModel):
    id: int
    description: str
    created_at: datetime
    conclusion: str | None
    has_analyzed: bool
    elements: list[Element]

    model_config = ConfigDict(from_attributes=True)


class User(BaseModel):
    id: int
    firebase_uid: str
    email: str
    display_name: str | None
    created_at: datetime
    failures: list[Failure]

    model_config = ConfigDict(from_attributes=True)


class Hero(BaseModel):
    name: str
    description: str
    failure: str
    source: str
    certainty: float

    model_config = ConfigDict(from_attributes=True)


class SuggestInput(BaseModel):
    text: str
    type: model.ElementType
    elements: List[Element]
    selected_label: BeliefLabel | None = None


class AnalyzeInput(BaseModel):
    text: str


class SummarizeInput(BaseModel):
    elements: list[Element]
    analysis_type: model.ElementType


class SummaryResult(BaseModel):
    summary: str


class CreateUserInput(BaseModel):
    firebase_uid: str
    email: str


class GetUserByFirebaseUidInput(BaseModel):
    firebase_uid: str


class CreateFailureInput(BaseModel):
    user_id: int
    description: str


class CreateElementInput(BaseModel):
    failure_id: int
    elements: list[Element]


class AnalysisResult(BaseModel):
    elements: List[Element] | None = None
    belief_analysis: BeliefAnalysisResult | None = None


class GetHeroesInput(BaseModel):
    query: str


def to_schema_element(model_element: model.Element) -> Element:
    return Element(
        id=model_element.id,
        description=model_element.description,
        type=model_element.type,
        created_at=model_element.created_at,
        failure_id=model_element.failure_id,
    )


def to_schema_failure(model_failure: model.Failure) -> Failure:
    return Failure(
        id=model_failure.id,
        description=model_failure.description,
        created_at=model_failure.created_at,
        conclusion=model_failure.conclusion,
        has_analyzed=model_failure.has_analyzed,
        elements=[
            to_schema_element(element) for element in (model_failure.elements or [])
        ],
    )


def to_schema_user(model_user: model.User) -> User:
    return User(
        id=model_user.id,
        firebase_uid=model_user.firebase_uid,
        email=model_user.email,
        display_name=model_user.display_name,
        created_at=model_user.created_at,
        failures=[
            to_schema_failure(failure) for failure in (model_user.failures or [])
        ],
    )
