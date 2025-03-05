import os

import app.schema as schema
from app.chain import SuggestChain
from app.controller import (
    ElementController,
    FailureController,
    UserController,
    HeroController,
)
from app.database import get_db
from app.vectordb import VectorDB
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from langchain_openai import ChatOpenAI
from pydantic import SecretStr

load_dotenv()

llm = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0,
    api_key=SecretStr(os.getenv("OPENAI_API_KEY", "")),
)

app = FastAPI()

# FastAPIのCORS設定
origins = [
    "https://maketa-frontend-app.azurewebsites.net",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,
)

try:
    db = get_db()
    vectordb = VectorDB()
    csv_path = "./data/output.csv"
    vectordb.import_data(csv_path)

    suggest_chain = SuggestChain(llm)
    user_controller = UserController(db)
    failure_controller = FailureController(db)
    element_controller = ElementController(db, suggest_chain)
    hero_controller = HeroController(vectordb)

    @app.post("/users")
    async def create_user(input: schema.CreateUserInput) -> None:
        return user_controller.create(input)

    @app.get("/user/{firebase_uid}")
    async def get_user_by_firebase_uid(
        firebase_uid: str,
    ) -> schema.User | None:
        return user_controller.get_by_firebase_uid(firebase_uid)

    @app.get("/failure/{failure_id}")
    async def get_failure_by_id(failure_id: int) -> schema.Failure | None:
        return failure_controller.get_by_id(failure_id)

    @app.post("/failures")
    async def create_failure(input: schema.CreateFailureInput) -> None:
        return failure_controller.create(input)

    @app.post("/elements/suggest")
    async def suggest_elements(
        input: schema.SuggestInput,
    ) -> list[schema.Element] | None:
        return element_controller.suggest(input)

    @app.post("/elements")
    async def bulk_create_elements(input: schema.CreateElementInput) -> None:
        return element_controller.bulk_create(input)

    @app.get("/heroes")
    async def get_heroes(search_query: str, limit: int = 1) -> list[schema.Hero] | None:
        return hero_controller.list(search_query, limit)

    if __name__ == "__main__":
        import uvicorn

        uvicorn.run(app, host="0.0.0.0", port=8000)

finally:
    if "db" in locals():
        db.close()
    if "vectordb" in locals():
        vectordb.close()
