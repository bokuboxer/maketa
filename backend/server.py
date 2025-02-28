import app.schema as schema
from app.chain import SuggestChain
from app.controller import ElementController, FailureController, UserController
from app.database import get_db
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from langchain_openai import ChatOpenAI

load_dotenv()

db = get_db()
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

app = FastAPI()

# CORSミドルウェアの設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 本番環境では適切なオリジンを指定してください
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

db = get_db()
# chain_manager = ChainManager(llm)
suggest_chain = SuggestChain(llm)
user_controller = UserController(db)
failure_controller = FailureController(db)
element_controller = ElementController(db, suggest_chain)


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
async def suggest_elements(input: schema.SuggestInput) -> list[schema.Element] | None:
    return element_controller.suggest(input)


@app.post("/elements")
async def bulk_create_elements(input: schema.CreateElementInput) -> None:
    return element_controller.bulk_create(input)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
