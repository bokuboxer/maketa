from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI

import app.schema as schema

# ADVERSITY = "adversity"
# BELIEF = "belief"
# CONSEQUENCE = "consequence"
# DISPUTATION = "disputation"
# EFFECT = "effect"

template = """あなたは人間の行動と失敗の分析の専門家です。以下の失敗事例を分析し、要因を見つけ、5種類の要因「不利な事態」「信念」「結果」「論争」「感情」に分類してください。

失敗事例：
{text}

回答形式：
{format_instructions}
"""

adversity_template = """あなたは人間の行動と失敗の分析の専門家です。
ユーザーが入力した失敗事例について、以下の質問に短く答えてください。
回答は後述のPydanticスキーマに従い、JSON形式で出力してください。
推測や創作は最小限に抑えてください。

【失敗事例】
{text}

【質問】
1. 出来事を一言で表すと何ですか？
2. 何が起こったのですか？
3. 自分は何をしましたか？
4. 他の人は何をしましたか？
5. どんな考えが頭に浮かびましたか？
6. どんな感情を感じていましたか？

【回答形式】
- 各要素のtypeは必ず"adversity"を指定してください
- idは質問番号（1-6）を指定してください
- descriptionは質問への回答を1-2行で簡潔に記述してください

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


class AdversityChain:
    def __init__(self, llm: ChatOpenAI):
        self.llm = llm
        json_parser = PydanticOutputParser(pydantic_object=schema.AnalysisResult)
        self.prompt = PromptTemplate(
            template=adversity_template,
            input_variables=["text"],
            partial_variables={
                "format_instructions": json_parser.get_format_instructions()
            },
        )
        self.chain = self.prompt | self.llm | json_parser

    def get_chain(self):
        return self.chain
