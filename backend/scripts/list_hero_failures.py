from typing import Any
import json
import csv
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_community.retrievers import TavilySearchAPIRetriever
from langchain_community.retrievers.tavily_search_api import SearchDepth
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.runnables.base import RunnableSerializable
from pydantic import BaseModel, Field


class Hero(BaseModel):
    name: str = Field(description="人物の名前")
    description: str = Field(description="人物の説明 肩書きのみ")
    failure: str = Field(description="失敗談 100字以下 失敗の事実のみ")
    source: str = Field(description="出典")


def get_hero_failures(name: str) -> Hero:
    retriever = TavilySearchAPIRetriever(
        k=10,
        search_depth=SearchDepth.BASIC,
        include_raw_content=True,
    )
    llm = ChatOpenAI(model="gpt-4o-mini")

    question = f"{name}の失敗談を教えてください。"
    docs = retriever.invoke(question)
    valid_docs = [
        doc for doc in docs if doc.page_content is not None and doc.page_content.strip()
    ]
    context = "\n\n".join(
        [
            f"出典: {doc.metadata.get('source', '不明')}\n{doc.page_content}"
            for doc in valid_docs
        ]
    )

    json_parser = PydanticOutputParser(pydantic_object=Hero)

    template = '''
    {name}の身に起こった実際の失敗談を教えてください。
    情報源は以下のものであり、想像など情報に基づかないものは回答しないでください。
    各情報源の信頼性も考慮して回答してください。
    
    情報源: """
    {context}
    """

    出力は以下のフォーマットで出力してください。
    {format_instructions}
    '''

    prompt = PromptTemplate(
        template=template,
        input_variables=["question", "context"],
        partial_variables={
            "format_instructions": json_parser.get_format_instructions()
        },
    )

    chain: RunnableSerializable[Any, Hero] = (
        prompt | llm | PydanticOutputParser(pydantic_object=Hero)
    )
    return chain.invoke({"name": name, "context": context})


if __name__ == "__main__":
    load_dotenv()

    heroes: list[Hero] = []
    names = [
        "ビル・ゲイツ",  # IT
        "スティーブ・ジョブズ",  # IT
        "ウォーレン・バフェット",  # 経済
        "アルベルト・アインシュタイン",  # 物理学
        "マリー・キュリー",  # 物理学・化学
        "チャールズ・ダーウィン",  # 生物学
        "レオナルド・ダ・ヴィンチ",  # 芸術・科学
        "ピカソ",  # 芸術
        "マーティン・ルーサー・キング・ジュニア",  # 社会運動
        "ナエルソン・マンデラ",  # 政治
        "スティーブン・ホーキング",  # 物理学
        "ジェームズ・ワトソン",  # 生物学
        "フランシス・クリック",  # 生物学
        "トーマス・エジソン",  # 発明家
        "ヘンリー・フォード",  # 経済・技術
        "マハトマ・ガンディー",  # 社会運動
    ]

    for name in names:
        try:
            result = get_hero_failures(name)
            heroes.append(result)
        except Exception as e:
            print(f"エラーが発生しました: {e}")

    data = [[hero.name, hero.description, hero.failure, hero.source] for hero in heroes]
    with open("../data/output.csv", mode="w", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)
        columns = ["Name", "Description", "Failure", "Source"]
        writer.writerow(columns)
        writer.writerows(data)

    print("CSVファイルが作成されました。")
