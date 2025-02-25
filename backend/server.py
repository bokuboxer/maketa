from app.controller import AnalyzeController, UserController
from app.database import get_db
from app.schema import CreateUserInput
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from langchain_openai import ChatOpenAI

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
analyze_controller = AnalyzeController(llm)
user_controller = UserController(db)


@app.post("/users")
async def create_user(input: CreateUserInput):
    return user_controller.create(input)


@app.get("/users/{firebase_uid}")
async def get_user_by_firebase_uid(firebase_uid: str):
    return user_controller.get_by_firebase_uid(firebase_uid)


# add_routes(
#     app, analyze_controller.get_chain(), path="/analyze", input_type=AnalyzeInput
# )

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
