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


class BeliefExplanation(BaseModel):
    type: str
    description: str


class BeliefAnalysisResult(BaseModel):
    explanations: List[BeliefExplanation]


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
    detail: str | None
    reason: str | None
    created_at: datetime
    has_analyzed: bool
    elements: list[Element]

    hero_name: str | None
    hero_description: str | None
    hero_failure: str | None
    hero_energy: str | None
    hero_failure_source: str | None
    hero_failure_certainty: float | None
    hero_image_url: str | None
    explain_certainty: str | None

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
    energy: str
    image_url: str
    certainty: float

    model_config = ConfigDict(from_attributes=True)


class SuggestInput(BaseModel):
    type: model.ElementType
    text: str
    selected_label: str | None = None
    adversity: str | None = None
    belief_explanation: str | None = None
    dispute_evidence: str | None = None
    dispute_counter: str | None = None


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


class ConcludeFailureInput(BaseModel):
    failure_id: int
    selected_label: str
    adversity: str
    belief_explanation: str
    dispute_evidence: str
    dispute_counter: str


class CreateElementInput(BaseModel):
    failure_id: int
    elements: list[Element]


class AnalysisResult(BaseModel):
    elements: List[Element] | None = None


class GetHeroesInput(BaseModel):
    query: str


class ExplainInput(BaseModel):
    user_failure: str
    hero_failure: str


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
        detail=model_failure.detail,
        reason=model_failure.reason,
        created_at=model_failure.created_at,
        has_analyzed=model_failure.has_analyzed,
        hero_name=model_failure.hero_name,
        hero_description=model_failure.hero_description,
        hero_failure=model_failure.hero_failure,
        hero_energy=model_failure.hero_energy,
        hero_failure_source=model_failure.hero_failure_source,
        hero_failure_certainty=model_failure.hero_failure_certainty,
        hero_image_url=model_failure.hero_image_url,
        explain_certainty=model_failure.explain_certainty,
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
