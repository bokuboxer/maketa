from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from typing import List

import app.schema as schema
from app.model import ElementType

# ADVERSITY = "adversity"
# BELIEF = "belief"
# CONSEQUENCE = "consequence"
# DISPUTATION = "disputation"
# EFFECT = "effect"

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

belief_template = """あなたは人間の行動と失敗の分析の専門家です。
ユーザーが入力した出来事について、以下の質問に短く答えてください。
回答は後述のPydanticスキーマに従い、JSON形式で出力してください。
推測や創作は最小限に抑えてください。

【ユーザーが入力した出来事】
{text}

【質問】
1. その出来事を思い出したとき、真っ先に頭に浮かんだ考えや思い込みは何ですか？
2. それらの考えは、あなたの感情や行動にどんな影響を与えていますか？
3. あなたを前向きにする（プラスに働く）考えは何ですか？
4. あなたを苦しめる（マイナスに働く）考えは何ですか？
5. 上記の考えを振り返って、改めて気づいたことはありますか？

【回答形式】
- 各要素のtypeは必ず"belief"を指定してください
- idは質問番号（1〜5）を指定してください
- descriptionは質問への回答を1-2行で簡潔に記述してください

{format_instructions}
"""

consequence_template = """あなたは人間の行動と失敗の分析の専門家です。
直前のフェーズで整理された「信念」の内容を踏まえて、以下の質問に短く答えてください。
回答は後述のPydanticスキーマに従い、JSON形式で出力してください。
推測や創作は最小限に抑えてください。

【前のステップで整理された信念】
{text}

【質問】
1. この信念を感じたとき、どんな感情が湧きましたか？（例: 怒り、悲しみ、不安、フラストレーション、自哀など）
2. その感情が、あなたの気分や行動にどのような影響を与えましたか？
3. 信念に基づいた結果、どんな行動をとりましたか？（例: 飲酒、攻撃、沈み込み、引きこもりなど）

【回答形式】
- 各要素のtypeは必ず"consequence"を指定してください。
- idは質問番号（1〜3）を指定してください。
- descriptionは質問への回答を1～2行で簡潔に記述してください。

{format_instructions}
"""

dispute_template = """あなたは人間の行動と失敗の分析の専門家です。
直前のフェーズで整理された「信念」の内容を踏まえて、以下の質問に短く答えてください。
回答は後述のPydanticスキーマに従い、JSON形式で出力してください。
推測や創作は最小限に抑え、実際に見受けられる事実や考えに基づいて回答してください。

【前のステップで整理された信念】
{text}

【質問】
1. この信念が本当だと考える根拠や証拠は何ですか？具体的な事実や理由を教えてください。
2. この信念があなたにどんな影響を与えているか、役に立っている点と、逆に困らせている点を分けて書いてください。
3. 現在の信念を置き換えるために、どのような前向きで自己向上的な考えを採用できますか？具体的に一つ挙げてください。

【回答形式】
- 各要素のtypeは必ず"disputation"を指定してください。
- idは質問番号（1〜3）を指定してください。
- descriptionは質問への回答を1～2行で簡潔に記述してください。

{format_instructions}
"""

energy_template = """あなたは人間の行動と失敗の分析の専門家です。
直前のDisputeフェーズで整理された新しい信念とその反応を踏まえて、以下の質問に短く答えてください。
回答は後述のPydanticスキーマに従い、JSON形式で出力してください。
推測や創作は最小限に抑え、実際に感じたことに基づいて回答してください。

【前のステップで整理された新しい信念とその反応】
{text}

【質問】
1. 新しい信念を受け入れた結果、あなたはどのような前向きな考え方を持てるようになりましたか？具体的な例を1つ挙げてください。
2. 新しい信念に変わったことで、あなたの気持ちやエネルギーはどのように変わりましたか？（例：安心感、希望、活力が増したなど）

【回答形式】
- 各要素のtypeは必ず"effect"を指定してください。
- idは質問番号（1〜2）を指定してください。
- descriptionは質問への回答を1～2行で簡潔に記述してください。

{format_instructions}
"""

summary_template = """あなたは人間の行動と失敗の分析の専門家です。
以下の分析結果を、次のステップで使いやすいように要約してください。
各要素の関連性を考慮し、自然な文章としてまとめてください。

【分析タイプ】
{analysis_type}

【分析結果】
{elements_text}

【回答形式】
- 分析結果の要素を有機的につなげ、一連の流れのある文章として記述してください
- 各要素の本質的な内容を損なわないように注意してください
- 単なる箇条書きの言い換えは避け、要素間の関係性や因果関係が分かるように記述してください
- 文章は3-4文程度で簡潔にまとめてください

【出力例】
（Adversityの場合）
「重要な会議での提案に向けて十分な準備ができていなかったため、上司の前で慌てた説明となってしまいました。
その結果、提案内容が適切に伝わらず、承認を得ることができませんでした。
この状況で自分は不安と焦りを感じ、周囲からの評価も気になっていました。」

（Beliefの場合）
「この失敗により自分の能力不足を痛感し、プロフェッショナルとしての自信が揺らいでいます。
昇進への影響も心配であり、もっと早くから準備すべきだったという後悔が残っています。
一方で、この経験を次回の成功につなげたいという前向きな意識も芽生えています。」

{format_instructions}
"""


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
