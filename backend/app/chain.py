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
        summarize_and_suggest = self.summarize_chain | chain

        return summarize_and_suggest.invoke({"text": summarized_text})

    def format_elements(self, elements: List[schema.Element]) -> str:
        # 要素を番号順にソート
        sorted_elements = sorted(elements, key=lambda x: x.id)
        # テキスト形式に整形
        return "\n".join(
            [f"{element.id}. {element.description}" for element in sorted_elements]
        )


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


class BeliefChain:
    def __init__(self, llm: ChatOpenAI):
        self.llm = llm
        json_parser = PydanticOutputParser(pydantic_object=schema.AnalysisResult)
        self.prompt = PromptTemplate(
            template=belief_template,
            input_variables=["text"],
            partial_variables={
                "format_instructions": json_parser.get_format_instructions()
            },
        )
        self.chain = self.prompt | self.llm | json_parser

    def get_chain(self):
        return self.chain


class ConsequenceChain:
    def __init__(self, llm: ChatOpenAI):
        self.llm = llm
        json_parser = PydanticOutputParser(pydantic_object=schema.AnalysisResult)
        self.prompt = PromptTemplate(
            template=consequence_template,
            input_variables=["text"],
            partial_variables={
                "format_instructions": json_parser.get_format_instructions()
            },
        )
        self.chain = self.prompt | self.llm | json_parser

    def get_chain(self):
        return self.chain


class DisputeChain:
    def __init__(self, llm: ChatOpenAI):
        self.llm = llm
        json_parser = PydanticOutputParser(pydantic_object=schema.AnalysisResult)
        self.prompt = PromptTemplate(
            template=dispute_template,
            input_variables=["text"],
            partial_variables={
                "format_instructions": json_parser.get_format_instructions()
            },
        )
        self.chain = self.prompt | self.llm | json_parser

    def get_chain(self):
        return self.chain


class EnergyChain:
    def __init__(self, llm: ChatOpenAI):
        self.llm = llm
        json_parser = PydanticOutputParser(pydantic_object=schema.AnalysisResult)
        self.prompt = PromptTemplate(
            template=energy_template,
            input_variables=["text"],
            partial_variables={
                "format_instructions": json_parser.get_format_instructions()
            },
        )
        self.chain = self.prompt | self.llm | json_parser

    def get_chain(self):
        return self.chain


class SummaryChain:
    def __init__(self, llm: ChatOpenAI):
        self.llm = llm
        self.prompt = PromptTemplate(
            template=summary_template,
            input_variables=["analysis_type", "elements_text"],
            partial_variables={
                "format_instructions": "出力は自然な文章形式でお願いします。引用符（「」）で囲んでください。"
            },
        )
        self.chain = self.prompt | self.llm

    def get_chain(self):
        return self.chain

    def format_elements(self, elements: List[schema.Element]) -> str:
        # 要素を番号順にソート
        sorted_elements = sorted(elements, key=lambda x: x.id)
        # テキスト形式に整形
        return "\n".join(
            [f"{element.id}. {element.description}" for element in sorted_elements]
        )


class ChainManager:
    def __init__(self, llm: ChatOpenAI):
        self.llm = llm
        self.adversity_chain = AdversityChain(llm)
        self.belief_chain = BeliefChain(llm)
        self.consequence_chain = ConsequenceChain(llm)
        self.dispute_chain = DisputeChain(llm)
        self.energy_chain = EnergyChain(llm)
        self.summary_chain = SummaryChain(llm)

    def analyze_adversity(self, text: str) -> tuple[schema.AnalysisResult, str]:
        # Adversity分析を実行
        result = self.adversity_chain.get_chain().invoke({"text": text})
        # 要約を生成
        summary = self.summary_chain.get_chain().invoke(
            {
                "analysis_type": "adversity",
                "elements_text": self.summary_chain.format_elements(result.elements),
            }
        )
        return result, summary

    def analyze_belief(self, text: str) -> tuple[schema.AnalysisResult, str]:
        result = self.belief_chain.get_chain().invoke({"text": text})
        summary = self.summary_chain.get_chain().invoke(
            {
                "analysis_type": "belief",
                "elements_text": self.summary_chain.format_elements(result.elements),
            }
        )
        return result, summary

    def analyze_consequence(self, text: str) -> tuple[schema.AnalysisResult, str]:
        result = self.consequence_chain.get_chain().invoke({"text": text})
        summary = self.summary_chain.get_chain().invoke(
            {
                "analysis_type": "consequence",
                "elements_text": self.summary_chain.format_elements(result.elements),
            }
        )
        return result, summary

    def analyze_dispute(self, text: str) -> tuple[schema.AnalysisResult, str]:
        result = self.dispute_chain.get_chain().invoke({"text": text})
        summary = self.summary_chain.get_chain().invoke(
            {
                "analysis_type": "dispute",
                "elements_text": self.summary_chain.format_elements(result.elements),
            }
        )
        return result, summary

    def analyze_energy(self, text: str) -> tuple[schema.AnalysisResult, str]:
        result = self.energy_chain.get_chain().invoke({"text": text})
        summary = self.summary_chain.get_chain().invoke(
            {
                "analysis_type": "energy",
                "elements_text": self.summary_chain.format_elements(result.elements),
            }
        )
        return result, summary

    def summarize(
        self, elements: list[schema.Element], analysis_type: model.ElementType
    ) -> str:
        """
        選択された要素を要約して一つの文章にまとめます。
        """
        elements_text = self.summary_chain.format_elements(elements)
        summary = self.summary_chain.get_chain().invoke(
            {
                "analysis_type": analysis_type.value,
                "elements_text": elements_text,
            }
        )
        return summary

    def analyze_full_chain(
        self, initial_text: str
    ) -> List[tuple[schema.AnalysisResult, str]]:
        """
        全ての分析チェーンを順番に実行し、各ステップの結果と要約を返します。
        各ステップの要約は次のステップの入力として使用されます。
        """
        results = []

        # Adversity分析
        adversity_result, adversity_summary = self.analyze_adversity(initial_text)
        results.append((adversity_result, adversity_summary))

        # Belief分析
        belief_result, belief_summary = self.analyze_belief(adversity_summary)
        results.append((belief_result, belief_summary))

        # Consequence分析
        consequence_result, consequence_summary = self.analyze_consequence(
            belief_summary
        )
        results.append((consequence_result, consequence_summary))

        # Dispute分析
        dispute_result, dispute_summary = self.analyze_dispute(
            belief_summary
        )  # BeliefからDisputeへ
        results.append((dispute_result, dispute_summary))

        # Energy分析
        energy_result, energy_summary = self.analyze_energy(
            dispute_summary
        )  # DisputeからEnergyへ
        results.append((energy_result, energy_summary))

        return results
