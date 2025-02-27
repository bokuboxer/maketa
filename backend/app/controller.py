from sqlalchemy.orm import Session, joinedload
from app.chain import AnalyzeChain

import app.model as model
import app.schema as schema


class UserController:
    def __init__(self, db: Session):
        self.db = db

    def create(self, input: schema.CreateUserInput) -> None:
        user = model.User(
            firebase_uid=input.firebase_uid,
            email=input.email,
        )

        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return None

    def get_by_firebase_uid(self, firebase_uid: str) -> schema.User | None:
        user: model.User | None = (
            self.db.query(model.User)
            .options(joinedload(model.User.failures))
            .filter(model.User.firebase_uid == firebase_uid)
            .first()
        )

        if not user:
            return None

        return schema.to_schema_user(user)


class FailureController:
    def __init__(self, db: Session, analyze_chain: AnalyzeChain):
        self.db = db
        self.analyze_chain = analyze_chain

    def create(self, input: schema.CreateFailureInput) -> None:
        failure: model.Failure = model.Failure(
            description=input.description,
            user_id=input.user_id,
        )

        self.db.add(failure)
        self.db.commit()
        self.db.refresh(failure)
        return None

    def analyze(self, failure_id: int) -> schema.Failure | None:
        failure: model.Failure | None = (
            self.db.query(model.Failure)
            .options(joinedload(model.Failure.elements))
            .filter(model.Failure.id == failure_id)
            .first()
        )
        if not failure:
            return None

        if failure.has_analyzed:
            return schema.to_schema_failure(failure)

        result = self.analyze_chain.get_chain().invoke({"text": failure.description})

        # 分析結果から要素を作成
        for element_data in result.elements:
            element = model.Element(
                description=element_data.description,
                type=element_data.type,
                failure_id=failure.id,
            )
            self.db.add(element)

        failure.has_analyzed = True
        self.db.commit()
        self.db.refresh(failure)

        return schema.to_schema_failure(failure)


class ElementController:
    def __init__(self, db: Session, analyze_chain: AnalyzeChain):
        self.db = db
        self.analyze_chain = analyze_chain

    def suggest(self, failure_id: int) -> list[schema.Element] | None:
        failure: model.Failure | None = (
            self.db.query(model.Failure).filter(model.Failure.id == failure_id).first()
        )

        if not failure:
            return None

        result: schema.AnalysisResult = self.analyze_chain.get_chain().invoke(
            {"text": failure.description}
        )

        return result.elements

    def bulk_create(self, input: schema.CreateElementInput) -> None:
        elements = [
            model.Element(
                description=element.description,
                type=element.type,
                failure_id=element.failure_id,
            )
            for element in input.elements
        ]

        self.db.add_all(elements)
        self.db.commit()
        for element in elements:
            self.db.refresh(element)

        return None
