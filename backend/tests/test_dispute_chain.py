import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

from app.chain import DisputeChain
from app.model import ElementType


def test_dispute_chain():
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

    # DisputeChainを初期化
    chain = DisputeChain(llm)

    # テスト用の信念（前のステップの結果を想定）
    test_text = """
    1. 準備不足は失態であり、プロフェッショナルとして恥ずかしい
    2. この失敗で自分の評価が下がり、昇進にも影響するかもしれない
    3. もっと早くから準備を始めるべきだった
    4. 自分は無能で、このような重要な提案を任されるべきではなかった
    5. 次回は絶対に同じ失敗を繰り返さないようにしなければならない
    """

    # チェーンを実行
    result = chain.get_chain().invoke({"text": test_text})

    # 結果の検証
    assert len(result.elements) == 3  # 3つの質問に対する回答があること

    for element in result.elements:
        # 各要素の検証
        assert element.type == ElementType.DISPUTATION  # typeがdisputationであること
        assert 1 <= element.id <= 3  # idが1-3の範囲内であること
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
    test_dispute_chain()
