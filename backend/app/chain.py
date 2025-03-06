# import logging
from typing import List

import app.model as model
import app.schema as schema
from app.template import (
    adversity_template,
    belief_template,
    dispute_template,
    summary_template,
    explain_template,
)
from langchain_core.output_parsers import PydanticOutputParser, StrOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_core.language_models import BaseChatModel

template_map = {
    model.ElementType.ADVERSITY: adversity_template,
    model.ElementType.BELIEF: belief_template,
    model.ElementType.DISPUTATION: dispute_template,
}


class SuggestChain:
    def __init__(self, llm: BaseChatModel):
        self.llm = llm
        self.json_parser = PydanticOutputParser(pydantic_object=schema.AnalysisResult)
        self.summarize_prompt = PromptTemplate(
            template=summary_template,
            input_variables=["analysis_type", "elements_text"],
            partial_variables={
                "format_instructions": "出力は自然な文章形式でお願いします。引用符（「」）で囲んでください。"
            },
        )
        self.summarize_chain = self.summarize_prompt | self.llm | StrOutputParser()

    def run(self, input: schema.SuggestInput) -> schema.AnalysisResult:
        prompt = PromptTemplate(
            template=template_map[input.type],
            input_variables=["text"],
            partial_variables={
                "format_instructions": self.json_parser.get_format_instructions()
            },
        )
        chain = prompt | self.llm | self.json_parser

        # Adversityの場合は、直接分析を行う
        if input.type == model.ElementType.ADVERSITY:
            return chain.invoke({"text": input.text})

        # それ以外の場合は、要素を要約してから分析を行う
        summarized_text = self.summarize_chain.invoke(
            {
                "analysis_type": input.type.value,
                "elements_text": self.format_elements(input.elements),
            }
        )

        return chain.invoke({"text": summarized_text})

    def format_elements(self, elements: List[schema.Element]) -> str:
        # 要素を番号順にソート
        sorted_elements = sorted(elements, key=lambda x: x.id)
        # テキスト形式に整形
        return "\n".join(
            [f"{element.id}. {element.description}" for element in sorted_elements]
        )


class ExplainChain:
    def __init__(self, llm: BaseChatModel):
        self.llm = llm
        self.summarize_prompt = PromptTemplate(
            template=explain_template,
            input_variables=["user_failure", "hero_failure"],
        )
        self.chain = self.summarize_prompt | self.llm | StrOutputParser()

    def run(self, input: schema.ExplainInput) -> str:
        return self.chain.invoke(
            {"user_failure": input.user_failure, "hero_failure": input.hero_failure}
        )


if __name__ == "__main__":
    from langchain_openai import ChatOpenAI

    chain = ExplainChain(llm=ChatOpenAI(model="gpt-4o-mini"))
    print(
        chain.run(
            schema.ExplainInput(
                user_failure="絵が独創的でクラスで1番下手だと言われた",
                hero_failure="ピカソは新しすぎる発想で当初の作品が全く評価されず、芸術界に受け入れられるまで苦労した。",
            )
        )
    )
