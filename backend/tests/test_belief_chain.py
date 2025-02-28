import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

from app.chain import BeliefChain
from app.model import ElementType


def test_belief_chain():
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

    # BeliefChainを初期化
    chain = BeliefChain(llm)

    # テスト用の失敗事例
    test_text = """
    先週の会議で、重要な提案をする予定でしたが、資料の準備が間に合わず、
    上司の前で慌てて説明することになってしまいました。
    結果として、提案の内容が十分に伝わらず、承認を得ることができませんでした。
    """

    # チェーンを実行
    result = chain.get_chain().invoke({"text": test_text})

    # 結果の検証
    assert len(result.elements) == 5  # 5つの質問に対する回答があること

    for element in result.elements:
        # 各要素の検証
        assert element.type == ElementType.BELIEF  # typeがbeliefであること
        assert 1 <= element.id <= 5  # idが1-5の範囲内であること
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
    test_belief_chain()
