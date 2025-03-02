
adversity_template = """あなたは人間の行動と失敗の分析の専門家です。
ユーザーが入力した失敗事例について、以下の質問に短く答えてください。
回答は後述のPydanticスキーマに従い、JSON形式で出力してください。
推測や創作は最小限に抑えてください。
出力は敬語を使わず、平易で直接的な表現にしてください。

【失敗事例】
{text}

【質問】
1. どこで、いつ起こった？場所や時間、状況を明示して。
2. 自分は何をした？具体的な行動を記して。
3. 他の人は何をした？その行動や関与を記して。
4. その他、客観的な情報や詳細はあるか？

【回答形式】
- 各要素のtypeは必ず"adversity"を指定してください
- descriptionは質問への回答を1-2行で簡潔に記述してください

{format_instructions}
"""

belief_template = """あなたは人間の行動と失敗の分析の専門家です。
ユーザーが入力した出来事について、以下の質問に短く答えてください。
回答は後述のPydanticスキーマに従い、JSON形式で出力してください。
推測や創作は最小限に抑えてください。
出力は敬語を使わず、平易で直接的な表現にしてください。

【ユーザーが入力した出来事】
{text}

【質問】
1. この出来事を引き起こした自分をどう捉えているか？ 自分の意見を書き出せ。
2. どんな特性や属人性が原因だと考えているか？ 自分の意見を書き出せ。
3. この出来事に関わった他人をどう捉えているか？ 自分の意見を書き出せ。
4. その人のどんな特性や属人性が原因だと考えているか？ 自分の意見を書き出せ。
5. この出来事を生み出した状況をどう捉えているか？ 自分の意見を書き出せ。
6. どんな特異性や要因が原因だと考えているか？ 自分の意見を書き出せ。

【回答形式】
- 各要素のtypeは必ず"belief"を指定してください
- descriptionは質問への回答を1-2行で簡潔に記述してください

{format_instructions}
"""

consequence_template = """あなたは人間の行動と失敗の分析の専門家です。
直前のフェーズで整理された「信念」の内容を踏まえて、以下の質問に短く答えてください。
回答は後述のPydanticスキーマに従い、JSON形式で出力してください。
推測や創作は最小限に抑えてください。
出力は敬語を使わず、平易で直接的な表現にしてください。

【前のステップで整理された信念】
{text}

【質問】
1. この信念を感じたとき、どんな感情が湧いたか？
2. その感情が、自分の気分や行動にどのような影響を与えたか？
3. 信念に基づいた結果、自分はどんな行動をとったか？

【回答形式】
- 各要素のtypeは必ず"consequence"を指定してください。
- descriptionは質問への回答を1～2行で簡潔に記述してください。

{format_instructions}
"""

dispute_template = """あなたは人間の行動と失敗の分析の専門家です。
直前のフェーズで整理された「信念」の内容をもとに、以下の質問に端的に答えてください。
回答は後述のPydanticスキーマに従い、JSON形式で出力してください。
推測や創作は最小限に、実際の事実や自分自身の認識に基づいて答えてください。
出力は敬語を使わず、平易で直接的な表現にしてください。

【前のステップで整理された信念】
{text}

【質問】
1. この信念が正しいと感じる要因は何か？具体的な事実や自分自身の認識を挙げて。
2. この信念に反する証拠や事実はないか？具体的な事実から客観的に判断して。
3. この信念の裏にある隠れた前提や思い込みは何か？客観的に判断して。
4. この信念の裏にある隠れた前提や思い込みは何か？もうひとつの見方を挙げて。
5. もしこの信念を別の視点に置き換えるとしたら、どんな考え方が適切か？
6. もしこの信念を別の視点に置き換えるとしたら、どんな考え方が適切か？もうひとつの見方を挙げて。

【回答形式】
- 各要素のtypeは必ず"disputation"としてください。
- descriptionは各質問への回答を1～2行で簡潔に記述してください。

{format_instructions}
"""

energy_template = """あなたは人間の行動と失敗の分析の専門家です。
直前のDisputeフェーズで整理された新しい信念とその反応を踏まえて、以下の質問に短く答えてください。
回答は後述のPydanticスキーマに従い、JSON形式で出力してください。
推測や創作は最小限に抑え、実際に感じたことに基づいて回答してください。
出力は敬語を使わず、平易で直接的な表現にしてください。

【前のステップで整理された新しい信念とその反応】
{text}

【質問】
1. 新しい信念を受け入れて、何に気づいたか？
2. その気づきから、どんな学びを得たか？
3. 新しい信念で気持ちやエネルギーはどう変わりそうか？
4. 得た学びを次の挑戦にどう活かすか？
5. 次の行動や挑戦に、どんな意欲が湧いたか？

【回答形式】
- 各要素のtypeは必ず"effect"を指定してください。
- descriptionは質問への回答を1～2行で簡潔に記述してください。

{format_instructions}
"""

summary_template = """あなたは人間の行動と失敗の分析の専門家です。
以下の分析結果を、次のステップで使いやすいように要約してください。
各要素の関連性を考慮し、自然な文章としてまとめてください。
出力は敬語を使わず、平易で直接的な表現にしてください。

【分析タイプ】
{analysis_type}

【分析結果】
{elements_text}

【回答形式】
- 分析結果の要素を有機的につなげ、一連の流れのある文章として記述してください
- 各要素の本質的な内容を損なわないように注意してください
- 単なる箇条書きの言い換えは避け、要素間の関係性や因果関係が分かるように記述してください
- 文章は3-4文程度で簡潔にまとめてください

{format_instructions}
"""
