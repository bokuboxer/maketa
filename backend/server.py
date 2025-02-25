from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from langchain_openai import ChatOpenAI
from langserve import add_routes

from .app.controller import AnalyzeController, AnalyzeInput

load_dotenv()

app = FastAPI()
llm = ChatOpenAI(model="chatgpt-4o-mini", temperature=0)

# CORSミドルウェアの設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 本番環境では適切なオリジンを指定してください
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

analyze_controller = AnalyzeController(llm)
# failure_controller = FailureController(llm)

# @app.post("/failure")
# async def create_failure(failure: Failure):
#     return failure_controller.create_failure(failure)


add_routes(
    app, analyze_controller.get_chain(), path="/analyze", input_type=AnalyzeInput
)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
