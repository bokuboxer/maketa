import logging
from typing import List

import app.model as model
import app.schema as schema
from app.template import (
    adversity_template,
    belief_suggest_template,
    belief_explanation_template,
    dispute_template,
    summary_template,
)
from langchain_core.output_parsers import PydanticOutputParser, StrOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_core.language_models import BaseChatModel

# ロガーの設定
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

template_map = {
    model.ElementType.ADVERSITY: adversity_template,
    model.ElementType.BELIEF: belief_suggest_template,
    model.ElementType.DISPUTATION: dispute_template,
}


class SuggestChain:
    def __init__(self, llm: BaseChatModel):
        self.llm = llm
        self.json_parser = PydanticOutputParser(pydantic_object=schema.AnalysisResult)
        self.belief_parser = PydanticOutputParser(
            pydantic_object=schema.BeliefAnalysisResult
        )
        self.summarize_prompt = PromptTemplate(
            template=summary_template,
            input_variables=["analysis_type", "elements_text"],
            partial_variables={
                "format_instructions": "出力は自然な文章形式でお願いします。引用符（「」）で囲んでください。"
            },
        )
        self.summarize_chain = self.summarize_prompt | self.llm | StrOutputParser()

    def run(self, input: schema.SuggestInput) -> schema.AnalysisResult:
        logger.info(f"Processing {input.type} type request")

        # Handle belief explanation
        if input.type == model.ElementType.BELIEF and input.selected_labels:
            logger.info("Processing belief explanation with selected labels")
            prompt = PromptTemplate(
                template=belief_explanation_template,
                input_variables=["text", "selected_labels"],
                partial_variables={
                    "format_instructions": self.belief_parser.get_format_instructions()
                },
            )
            chain = prompt | self.llm | self.belief_parser
            belief_result = chain.invoke(
                {
                    "text": input.text,
                    "selected_labels": "\n".join(
                        [f"- {label.description}" for label in input.selected_labels]
                    ),
                }
            )
            logger.debug(f"Belief explanation result: {belief_result}")
            # Ensure the belief_result has the correct structure
            if isinstance(belief_result, dict) and "labels" in belief_result:
                belief_result = schema.BeliefAnalysisResult(
                    labels=belief_result["labels"]
                )
            return schema.AnalysisResult(belief_analysis=belief_result)

        # Handle initial suggestions for belief type
        if input.type == model.ElementType.BELIEF:
            logger.info(f"Processing belief suggestions with text: '{input.text}'")
            text_to_use = (
                input.text if input.text else self.format_elements(input.elements)
            )
            logger.info(f"Using text for belief generation: '{text_to_use}'")
            prompt = PromptTemplate(
                template=template_map[input.type],
                input_variables=["text"],
                partial_variables={
                    "format_instructions": self.json_parser.get_format_instructions()
                },
            )
            chain = prompt | self.llm | self.json_parser
            result = chain.invoke({"text": text_to_use})
            logger.info(f"Generated {len(result.elements)} belief elements")
            return schema.AnalysisResult(elements=result.elements)

        # Handle other cases
        if not input.elements:
            logger.info("Processing initial suggestions")
            prompt = PromptTemplate(
                template=template_map[input.type],
                input_variables=["text"],
                partial_variables={
                    "format_instructions": self.json_parser.get_format_instructions()
                },
            )
            chain = prompt | self.llm | self.json_parser
            result = chain.invoke({"text": input.text})
            logger.debug(f"Initial suggestions result: {result}")
            return schema.AnalysisResult(elements=result.elements)

        # Handle summarization for non-belief types
        logger.debug("Handling other cases with summarization")
        summarized_text = self.summarize_chain.invoke(
            {
                "analysis_type": input.type.value,
                "elements_text": self.format_elements(input.elements),
            }
        )
        logger.debug(f"Summarized text: {summarized_text}")

        prompt = PromptTemplate(
            template=template_map[input.type],
            input_variables=["text"],
            partial_variables={
                "format_instructions": self.json_parser.get_format_instructions()
            },
        )
        chain = prompt | self.llm | self.json_parser
        result = chain.invoke({"text": summarized_text})
        logger.debug(f"Final result: {result}")
        return schema.AnalysisResult(elements=result.elements)

    def format_elements(self, elements: List[schema.Element]) -> str:
        sorted_elements = sorted(elements, key=lambda x: x.id)
        return "\n".join(
            [f"{element.id}. {element.description}" for element in sorted_elements]
        )
