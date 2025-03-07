import os
import logging

import app.schema as schema
import app.vectordb as vectordb
from app.chain import SuggestChain, ExplainChain, ConcludeChain
from app.controller import (
    ElementController,
    FailureController,
    UserController,
)
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from langchain_openai import ChatOpenAI
from pydantic import SecretStr
from sqlalchemy.orm import Session
from fastapi import Depends
from app.database import get_db

# ロガーの設定
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

load_dotenv()

llm = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0,
    api_key=SecretStr(os.getenv("OPENAI_API_KEY", "")),
)

app = FastAPI()

# FastAPIのCORS設定
# 本番環境
if os.getenv("ENV") == "production":
    origins = [
        "https://maketa-frontend-app.azurewebsites.net",
    ]
else:
    origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,
)

logger.info("Starting server...")

vectordb.create_collection()
csv_path = "./data/output.csv"
vectordb.import_data(csv_path)
logger.info("Data import completed")

# コントローラーの初期化
suggest_chain = SuggestChain(llm)
explain_chain = ExplainChain(llm)
conclude_chain = ConcludeChain(llm)
logger.info("All controllers initialized successfully")


@app.post("/users")
async def create_user(
    input: schema.CreateUserInput, db: Session = Depends(get_db)
) -> None:
    controller = UserController(db)
    return controller.create(input)


@app.get("/user/{firebase_uid}")
async def get_user_by_firebase_uid(
    firebase_uid: str, db: Session = Depends(get_db)
) -> schema.User | None:
    controller = UserController(db)
    return controller.get_by_firebase_uid(firebase_uid)


@app.get("/failure/{failure_id}")
async def get_failure_by_id(
    failure_id: int, db: Session = Depends(get_db)
) -> schema.Failure | None:
    controller = FailureController(db, explain_chain, conclude_chain)
    return controller.get_by_id(failure_id)


@app.post("/failures")
async def create_failure(
    input: schema.CreateFailureInput, db: Session = Depends(get_db)
) -> None:
    controller = FailureController(db, explain_chain, conclude_chain)
    return controller.create(input)


@app.put("/failures/conclude")
async def conclude_failure(
    input: schema.ConcludeFailureInput, db: Session = Depends(get_db)
) -> None:
    controller = FailureController(db, explain_chain, conclude_chain)
    return controller.conclude(input)


@app.post("/elements/suggest")
async def suggest_elements(
    input: schema.SuggestInput, db: Session = Depends(get_db)
) -> list[schema.Element] | None:
    controller = ElementController(db, suggest_chain)
    return controller.suggest(input)


@app.post("/elements")
async def bulk_create_elements(
    input: schema.CreateElementInput, db: Session = Depends(get_db)
) -> None:
    controller = ElementController(db, suggest_chain)
    return controller.bulk_create(input)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
