# import logging
from typing import List

import app.model as model
import app.schema as schema
from app.template import (
    adversity_template,
    belief_template,
    consequence_template,
    dispute_template,
    energy_template,
    summary_template,
)
from langchain_core.output_parsers import PydanticOutputParser, StrOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI

template_map = {
    model.ElementType.ADVERSITY: adversity_template,
    model.ElementType.BELIEF: belief_template,
    model.ElementType.CONSEQUENCE: consequence_template,
    model.ElementType.DISPUTATION: dispute_template,
    model.ElementType.EFFECT: energy_template,
}


class SuggestChain:
    def __init__(self, llm: ChatOpenAI):
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