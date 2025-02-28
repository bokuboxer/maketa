import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

from app.chain import ChainManager
from app.model import ElementType


def test_chain_manager():
    # .envファイルから環境変数を読み込む
    load_dotenv()

    # OpenAI API キーの確認
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("Error: OPENAI_API_KEY environment variable is not set")
        print("Please set your OpenAI API key in .env file:")
        print("OPENAI_API_KEY='your-api-key-here'")
        return

    # テスト用のLLMを初期化
    llm = ChatOpenAI(
        model="gpt-4o-mini",
        temperature=0,
    )

    # ChainManagerを初期化
    manager = ChainManager(llm)

    # テスト用の失敗事例
    test_text = """
    先週の会議で、重要な提案をする予定でしたが、資料の準備が間に合わず、
    上司の前で慌てて説明することになってしまいました。
    結果として、提案の内容が十分に伝わらず、承認を得ることができませんでした。
    """

    # 全チェーンを実行
    results = manager.analyze_full_chain(test_text)

    # 結果の検証
    assert len(results) == 5  # 5つのチェーンの結果があること

    # 各チェーンの結果を表示
    chain_types = ["Adversity", "Belief", "Consequence", "Dispute", "Energy"]

    print("\n=== テスト結果 ===")
    for (result, summary), chain_type in zip(results, chain_types):
        print(f"\n--- {chain_type} 分析結果 ---")
        print("Elements:")
        for element in result.elements:
            print(f"  質問{element.id}: {element.description}")
            print(f"  Type: {element.type}")

        print("\nSummary:")
        print(summary)
        print("-" * 50)


if __name__ == "__main__":
    test_chain_manager()
