from langchain_openai import ChatOpenAI
from app.chain import SuggestChain
from app.schema import SuggestInput, BeliefLabel


def main():
    # テスト用の入力データを作成
    test_input = SuggestInput(
        text="""
        プロジェクトの締め切りに間に合わなかった。
        作業量を見積もる際に、自分の能力を過大評価し、必要な時間を少なく見積もってしまった。
        また、途中で予期せぬ技術的な問題が発生したが、すぐに報告せずに自分で解決しようとして時間を浪費した。
        結果として、チームに迷惑をかけ、プロジェクト全体の進行に影響を与えてしまった。
        """,
        type="belief",
        elements=[],
        selected_labels=[
            BeliefLabel(
                id=1,
                description="自身の見積もりが甘かった",
                type="internal",
                explanation=None,
            ),
            BeliefLabel(
                id=2,
                description="技術的な問題への対応が遅れた",
                type="internal",
                explanation=None,
            ),
            BeliefLabel(
                id=3,
                description="チーム内のコミュニケーション不足",
                type="external",
                explanation=None,
            ),
        ],
    )

    try:
        # チェーンを初期化
        llm = ChatOpenAI(model_name="gpt-4o-mini", temperature=0)
        chain = SuggestChain(llm)

        # 説明を生成
        result = chain.run(test_input)

        print("=== Input Data ===")
        print(f"Failure Text: {test_input.text}")
        print("\nSelected Labels:")
        for label in test_input.selected_labels:
            print(f"- {label.description} (Type: {label.type})")

        print("\n=== Generated Explanations ===")
        if result.belief_analysis:
            for label in result.belief_analysis.labels:
                print(f"\nLabel: {label.description}")
                print(f"Explanation: {label.explanation}")
        else:
            print("No explanations generated.")

    except Exception as e:
        print(f"Error occurred: {str(e)}")


if __name__ == "__main__":
    main()
