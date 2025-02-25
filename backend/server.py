from app.controller import AnalyzeController, FailureController, UserController
from app.database import get_db
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from langchain_openai import ChatOpenAI
import app.schema as schema

load_dotenv()

db = get_db()
llm = ChatOpenAI(model="chatgpt-4o-mini", temperature=0)

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
user_controller = UserController(db)
failure_controller = FailureController(db)
analyze_controller = AnalyzeController(llm)


@app.post("/users")
async def create_user(input: schema.CreateUserInput) -> None:
    return user_controller.create(input)


@app.get("/user/{firebase_uid}")
async def get_user_by_firebase_uid(
    firebase_uid: str,
) -> schema.User | None:
    return user_controller.get_by_firebase_uid(firebase_uid)


@app.post("/failures")
async def create_failure(input: schema.CreateFailureInput) -> None:
    return failure_controller.create(input)


# add_routes(
#     app, analyze_controller.get_chain(), path="/analyze", input_type=AnalyzeInput
# )

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
