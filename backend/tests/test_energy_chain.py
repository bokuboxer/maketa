import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

from app.chain import EnergyChain
from app.model import ElementType


def test_energy_chain():
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

    # EnergyChainを初期化
    chain = EnergyChain(llm)

    # テスト用の新しい信念（前のステップの結果を想定）
    test_text = """
    1. 失敗の根拠は一時的な準備不足であり、能力そのものではない。過去の成功実績もある。
    2. この経験から学び、より良い時間管理とプレゼンテーションスキルを身につけることができる。
    3. 失敗は学びの機会であり、次回の成功につながる貴重なフィードバック。
    """

    # チェーンを実行
    result = chain.get_chain().invoke({"text": test_text})

    # 結果の検証
    assert len(result.elements) == 2  # 2つの質問に対する回答があること

    for element in result.elements:
        # 各要素の検証
        assert element.type == ElementType.EFFECT  # typeがenergyであること
        assert 1 <= element.id <= 2  # idが1-2の範囲内であること
        assert element.description  # descriptionが存在すること

        # 各idが一意であることを確認
        ids = [e.id for e in result.elements]
        assert len(ids) == len(set(ids))  # 重複がないこと

    # 結果の表示（デバッグ用）
    print("\nテスト結果:")
    for element in result.elements:
        print(f"\n質問{element.id}:")
        print(f"description: {element.description}")
        print(f"type: {element.type}")


if __name__ == "__main__":
    test_energy_chain()
