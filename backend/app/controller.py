import app.model as model
import app.schema as schema
from app.chain import SuggestChain, ExplainChain, ConcludeChain
from sqlalchemy.orm import Session, joinedload
import app.vectordb as vectordb
import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


class UserController:
    def __init__(self, db: Session):
        self.db = db

    def create(self, input: schema.CreateUserInput) -> None:
        user = model.User(
            firebase_uid=input.firebase_uid,
            email=input.email,
        )

        try:
            self.db.begin()
            self.db.add(user)
            self.db.commit()
            self.db.refresh(user)
        except Exception as e:
            self.db.rollback()
            raise e
        finally:
            self.db.close()

        return None

    def get_by_firebase_uid(self, firebase_uid: str) -> schema.User | None:
        try:
            self.db.begin()
            user: model.User | None = (
                self.db.query(model.User)
                .options(joinedload(model.User.failures))
                .filter(model.User.firebase_uid == firebase_uid)
                .first()
            )

            if not user:
                return None

            result = schema.to_schema_user(user)
            self.db.commit()
            return result
        except Exception as e:
            self.db.rollback()
            raise e
        finally:
            self.db.close()


class FailureController:
    def __init__(
        self, db: Session, explain_chain: ExplainChain, conclude_chain: ConcludeChain
    ):
        self.db = db
        self.explain_chain = explain_chain
        self.conclude_chain = conclude_chain

    def create(self, input: schema.CreateFailureInput) -> None:
        failure: model.Failure = model.Failure(
            description=input.description,
            user_id=input.user_id,
        )

        try:
            self.db.begin()
            self.db.add(failure)
            self.db.commit()
            self.db.refresh(failure)
        except Exception as e:
            self.db.rollback()
            raise e
        finally:
            self.db.close()
        return None

    def conclude(self, input: schema.ConcludeFailureInput) -> None:
        failure = (
            self.db.query(model.Failure)
            .filter(model.Failure.id == input.failure_id)
            .first()
        )
        if not failure:
            return None

        # TODO: 関連した要素を原因としてまとめる
        summarized_detail, summarized_reason, summarized_all = self.conclude_chain.run(
            input, failure.description
        )

        logger.info(f"summarized_detail: {summarized_detail}")
        logger.info(f"summarized_reason: {summarized_reason}")
        logger.info(f"summarized_all: {summarized_all}")

        # 類似する偉人の失敗談を取得
        heroes = vectordb.query_collection(failure.description, 1)
        if not heroes:
            return None

        # 偉人の失敗談との類似点を説明
        hero = heroes[0]
        hero_failure = hero.description
        explain_result = self.explain_chain.run(
            schema.ExplainInput(user_failure=summarized_all, hero_failure=hero_failure)
        )

        try:
            # 既存のレコードを更新
            failure.detail = summarized_detail
            failure.reason = summarized_reason
            failure.has_analyzed = True
            failure.hero_name = hero.name
            failure.hero_name = hero.name
            failure.hero_description = hero.description
            failure.hero_failure = hero.failure
            failure.hero_failure_source = hero.source
            failure.hero_failure_certainty = hero.certainty
            failure.explain_certainty = explain_result
            failure.hero_energy = hero.energy
            failure.hero_image_url = hero.image_url

            self.db.commit()
            self.db.refresh(failure)
        except Exception as e:
            self.db.rollback()
            raise e
        finally:
            self.db.close()
        return None

    def get_by_id(self, failure_id: int) -> schema.Failure | None:
        try:
            self.db.begin()
            failure: model.Failure | None = (
                self.db.query(model.Failure)
                .options(joinedload(model.Failure.elements))
                .filter(model.Failure.id == failure_id)
                .first()
            )
            result = schema.to_schema_failure(failure) if failure else None
            self.db.commit()
            return result
        except Exception as e:
            self.db.rollback()
            raise e
        finally:
            self.db.close()


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
                failure_id=input.failure_id,
            )
            for element in input.elements
        ]

        try:
            self.db.begin()
            self.db.add_all(elements)
            self.db.commit()
            for element in elements:
                self.db.refresh(element)
        except Exception as e:
            self.db.rollback()
            raise e
        finally:
            self.db.close()

        return None
