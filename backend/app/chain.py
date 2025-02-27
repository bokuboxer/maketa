from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI

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
