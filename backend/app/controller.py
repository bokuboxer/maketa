from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from sqlalchemy.orm import Session, joinedload

import app.model as model
import app.schema as schema

template = """あなたは人間の行動と失敗の分析の専門家です。以下の失敗事例を分析し、要因を見つけ、3種類の要因「外部要因」「内部要因」「感情要因」に分類してください。

失敗事例：
{text}

回答形式：
{format_instructions}
"""


class AnalyzeChain:
    def __init__(self, llm: ChatOpenAI):
        self.llm = llm
        json_parser = PydanticOutputParser(pydantic_object=schema.AnalysisResult)
        self.prompt = PromptTemplate(
            template=template,
            input_variables=["text"],
            partial_variables={
                "format_instructions": json_parser.get_format_instructions()
            },
        )
        self.chain = self.prompt | self.llm | json_parser

    def get_chain(self):
        return self.chain


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
            self_score=input.self_score,
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
