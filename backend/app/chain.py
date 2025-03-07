import logging
from typing import List

import app.model as model
import app.schema as schema
from app.template import (
    adversity_template,
    belief_suggest_template,
    belief_explanation_template,
    dispute_evidence_template,
    dispute_counter_template,
    explain_template,
    summarize_failure_template,
    summarize_reason_template,
    summarize_all_template,
)
from langchain_core.output_parsers import PydanticOutputParser, StrOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_core.language_models import BaseChatModel

# ロガーの設定
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

template_map = {
    model.ElementType.ADVERSITY: adversity_template,
    model.ElementType.BELIEF_SELECTION: belief_suggest_template,
    model.ElementType.BELIEF_EXPLANATION: belief_explanation_template,
    model.ElementType.DISPUTE_EVIDENCE: dispute_evidence_template,
    model.ElementType.DISPUTE_COUNTER: dispute_counter_template,
}


class SuggestChain:
    def __init__(self, llm: BaseChatModel):
        self.llm = llm
        self.json_parser = PydanticOutputParser(pydantic_object=schema.AnalysisResult)
        # self.adversity_summary_chain = PromptTemplate(
        #     template=adversity_summary_template,
        #     input_variables=["text", "elements_text"],
        # ) | self.llm | StrOutputParser()
        # self.belief_summary_chain = PromptTemplate(
        #     template=belief_summary_template,
        #     input_variables=["adversity_summary", "selected_label", "belief_explanation"],
        # ) | self.llm | StrOutputParser()
        # self.dispute_evidence_summary_chain = PromptTemplate(
        #     template=dispute_evidence_summary_template,
        #     input_variables=["adversity_summary", "belief_summary", "dispute_evidence"],
        # ) | self.llm | StrOutputParser()
        # self.dispute_counter_summary_chain = PromptTemplate(
        #     template=dispute_counter_summary_template,
        #     input_variables=["adversity_summary", "belief_summary", "dispute_evidence_summary", "dispute_counter"],
        # ) | self.llm | StrOutputParser()

    def run(self, input: schema.SuggestInput) -> schema.AnalysisResult:
        logger.info(f"Processing {input.type} type request")
        logger.debug(f"Input data: {input.model_dump()}")
        logger.debug(f"Raw input object: {input}")

        if input.type == model.ElementType.ADVERSITY:
            logger.info("Processing adversity type request")
            logger.debug(f"Input data: {input.model_dump()}")
            logger.debug(f"Raw input object: {input}")
            prompt = PromptTemplate(
                template=template_map[input.type],
                input_variables=["text"],
                partial_variables={
                    "format_instructions": self.json_parser.get_format_instructions()
                },
            )
            chain = prompt | self.llm | self.json_parser
            result = chain.invoke({"text": input.text})
            logger.info(f"Generated {len(result.elements)} adversity elements")
            return schema.AnalysisResult(elements=result.elements)

        # Handle initial suggestions for belief type
        if input.type == model.ElementType.BELIEF_SELECTION:
            logger.info(
                f"Processing belief suggestions with text: '{input.text}' and adversity: '{input.adversity}'"
            )
            # input.adversity_summary = self.adversity_summary_chain.invoke({"text": input.text, "elements_text": self.format_elements(input.elements)})
            prompt = PromptTemplate(
                template=template_map[input.type],
                input_variables=["text", "adversity"],
                partial_variables={
                    "format_instructions": self.json_parser.get_format_instructions()
                },
            )
            chain = prompt | self.llm | self.json_parser
            result = chain.invoke(
                {
                    "text": input.text,
                    "adversity": input.adversity,
                }
            )
            logger.info(f"Generated {len(result.elements)} belief elements")
            return schema.AnalysisResult(elements=result.elements)

        # Handle belief explanation
        if input.type == model.ElementType.BELIEF_EXPLANATION:
            logger.info(
                f"Processing belief explanation with text: '{input.text}', adversity: '{input.adversity}', selected label: '{input.selected_label}'"
            )
            logger.debug(f"text: {input.text}")
            logger.debug(f"adversity: {input.adversity}")
            logger.debug(f"selected label: {input.selected_label}")
            prompt = PromptTemplate(
                template=belief_explanation_template,
                input_variables=["text", "adversity", "selected_label"],
                partial_variables={
                    "format_instructions": self.json_parser.get_format_instructions()
                },
            )
            chain = prompt | self.llm | self.json_parser
            result = chain.invoke(
                {
                    "text": input.text,
                    "adversity": input.adversity,
                    "selected_label": input.selected_label,
                }
            )
            logger.debug(f"Belief explanation result: {result}")
            # Handle response format
            return result

        if input.type == model.ElementType.DISPUTE_EVIDENCE:
            logger.info(
                f"Processing dispute evidence with text: '{input.text}', adversity: '{input.adversity}', selected label: '{input.selected_label}'"
            )
            logger.debug(f"text: {input.text}")
            logger.debug(f"adversity: {input.adversity}")
            logger.debug(f"selected label: {input.selected_label}")
            # input.belief_summary = self.belief_summary_chain.invoke({"adversity_summary": input.adversity_summary, "selected_label": input.selected_label, "belief_explanation": self.format_elements(input.elements)})
            prompt = PromptTemplate(
                template=dispute_evidence_template,
                input_variables=[
                    "text",
                    "adversity",
                    "selected_label",
                ],
                partial_variables={
                    "format_instructions": self.json_parser.get_format_instructions()
                },
            )
            chain = prompt | self.llm | self.json_parser
            result = chain.invoke(
                {
                    "text": input.text,
                    "adversity": input.adversity,
                    "selected_label": input.selected_label,
                }
            )
            logger.debug(f"Dispute evidence result: {result}")
            return result

        if input.type == model.ElementType.DISPUTE_COUNTER:
            logger.info(
                f"Processing dispute counter with text: '{input.text}', adversity: '{input.adversity}', selected label: '{input.selected_label}', disputation_evidence: '{input.dispute_evidence}'"
            )
            logger.debug(f"text: {input.text}")
            logger.debug(f"adversity: {input.adversity}")
            logger.debug(f"selected label: {input.selected_label}")
            logger.debug(f"disputation evidence: {input.dispute_evidence}")
            # input.dispute_evidence_summary = self.dispute_evidence_summary_chain.invoke({"adversity_summary": input.adversity_summary, "belief_summary": input.belief_summary, "dispute_evidence": self.format_elements(input.elements)})
            prompt = PromptTemplate(
                template=dispute_counter_template,
                input_variables=[
                    "text",
                    "adversity",
                    "selected_label",
                    "dispute_evidence",
                ],
                partial_variables={
                    "format_instructions": self.json_parser.get_format_instructions()
                },
            )
            chain = prompt | self.llm | self.json_parser
            result = chain.invoke(
                {
                    "text": input.text,
                    "adversity": input.adversity,
                    "selected_label": input.selected_label,
                    "dispute_evidence": input.dispute_evidence,
                }
            )
            logger.debug(f"Dispute counter result: {result}")
            return result

    def format_elements(self, elements: List[schema.Element]) -> str:
        sorted_elements = sorted(elements, key=lambda x: x.id)
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


class ConcludeChain:
    def __init__(self, llm: BaseChatModel):
        self.llm = llm

    def _summarize_failure(self, failure_text: str, adversity: str) -> str:
        prompt = PromptTemplate(
            template=summarize_failure_template,
            input_variables=["failure_text", "adversity"],
        )
        chain = prompt | self.llm | StrOutputParser()
        return chain.invoke(
            {
                "failure_text": failure_text,
                "adversity": adversity,
            }
        )

    def _summarize_reason(
        self,
        selected_label: str,
        belief_explanation: str,
        dispute_evidence: str,
        dispute_counter: str,
    ) -> str:
        prompt = PromptTemplate(
            template=summarize_reason_template,
            input_variables=[
                "summarized_failure",
                "selected_label",
                "belief_explanation",
                "dispute_evidence",
                "dispute_counter",
            ],
        )
        chain = prompt | self.llm | StrOutputParser()
        return chain.invoke(
            {
                "selected_label": selected_label,
                "belief_explanation": belief_explanation,
                "dispute_evidence": dispute_evidence,
                "dispute_counter": dispute_counter,
            }
        )

    def _summarize_all(self, summarized_failure: str, summarized_reason: str) -> str:
        prompt = PromptTemplate(
            template=summarize_all_template,
            input_variables=["summarized_failure", "summarized_reason"],
        )
        chain = prompt | self.llm | StrOutputParser()
        return chain.invoke({"summarized_failure": summarized_failure, "summarized_reason": summarized_reason})

    def run(self, input: schema.ConcludeFailureInput, failure_text: str) -> tuple[str, str, str]:
        summarized_failure = self._summarize_failure(failure_text, input.adversity)
        summarized_reason = self._summarize_reason(
            selected_label=input.selected_label,
            belief_explanation=input.belief_explanation,
            dispute_evidence=input.dispute_evidence,
            dispute_counter=input.dispute_counter,
        )
        summarized_all = self._summarize_all(summarized_failure, summarized_reason)
        return summarized_failure, summarized_reason, summarized_all


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
