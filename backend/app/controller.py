import app.model as model
import app.schema as schema
from app.chain import SuggestChain
from sqlalchemy.orm import Session, joinedload


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
    def __init__(self, db: Session):
        self.db = db

    def create(self, input: schema.CreateFailureInput) -> None:
        failure: model.Failure = model.Failure(
            description=input.description,
            user_id=input.user_id,
        )

        self.db.add(failure)
        self.db.commit()
        self.db.refresh(failure)
        return None

    def get_by_id(self, failure_id: int) -> schema.Failure | None:
        failure: model.Failure | None = (
            self.db.query(model.Failure).filter(model.Failure.id == failure_id).first()
        )
        return schema.to_schema_failure(failure) if failure else None


class ElementController:
    def __init__(self, db: Session, chain: SuggestChain):
        self.db = db
        self.chain = chain

    def suggest(self, input: schema.SuggestInput) -> list[schema.Element] | None:
        result = self.chain.run(input)

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

        # failureのhas_elementsをTrueにする
        failure = self.db.query(model.Failure).filter(model.Failure.id == input.failure_id).first()
        if failure:
            failure.has_analyzed = True
            self.db.commit()
            self.db.refresh(failure)

        return None
