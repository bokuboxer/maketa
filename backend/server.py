from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from langserve import add_routes
from pydantic import BaseModel

load_dotenv()

app = FastAPI()

# CORSミドルウェアの設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 本番環境では適切なオリジンを指定してください
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
prompt = PromptTemplate.from_template('''あなたは人間の行動と失敗の分析を専門とする心理学者です。以下の失敗事例を分析し、「5 Whys」手法を用いて根本原因を探ってください。

失敗事例：
[失敗の具体的な説明を挿入]

指示：
1. 上記の失敗事例を簡潔に要約してください。
2. この失敗が起こった直接的な理由を特定してください。
3. その理由についてさらに「なぜ？」と5回質問し、より深い原因を探ってください。各「なぜ」に対する回答は、前の回答に基づいて論理的に導き出してください。
4. 5回の「なぜ」を経て特定された根本原因を簡潔に述べてください。
5. この根本原因に基づいて、同様の失敗を防ぐための具体的な提案を3つ挙げてください。

回答形式：
要約：[失敗の要約]
直接的な理由：[理由の説明]
なぜ1：[回答]
なぜ2：[回答]
なぜ3：[回答]
なぜ4：[回答]
なぜ5：[回答]
根本原因：[根本原因の説明]
改善提案：
1. [提案1]
2. [提案2]
3. [提案3]

注意事項：
- 各「なぜ」の回答は、前の回答に直接関連し、より深い洞察を提供するようにしてください。
- 文化的、社会的、個人的な要因を考慮に入れてください。
- 推測に基づく回答は避け、与えられた情報に基づいて論理的に推論してください。
: {text}''')
chain = prompt | llm | StrOutputParser()


class AnalyzeInput(BaseModel):
    text: str


add_routes(app, chain, path="/analyze", input_type=AnalyzeInput)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
