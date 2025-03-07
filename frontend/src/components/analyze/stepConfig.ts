import { ElementType } from "@/api/model/elementType";
import { StepConfig } from "./types";

// Step configuration
export const steps: StepConfig[] = [
	{
		type: ElementType.adversity,
		label: "失敗の詳細",
		description: "失敗の詳細を入力しよう",
		title: "<strong>A</strong>dversity（失敗の詳細）",
		example:
			"いつ起こりましたか？\nどこで起こりましたか？\n何をしましたか？\n誰が関係していましたか？\nどのような状況でしたか？",
	},
	{
		type: ElementType.belief_selection,
		label: "失敗の原因",
		description: "失敗の原因の中で最も関係していると思われるものを選択しよう",
		title: "<strong>B</strong>elief（原因の選択）",
		example:
			"例：\n・内的要因（自己）：\n - 準備不足だった\n - 経験が足りなかった\n・外的要因（環境・他者）：\n - 時間が足りなかった\n - チーム内のコミュニケーション不足",
	},
	{
		type: ElementType.belief_explanation,
		label: "失敗の原因の詳細",
		description: "選択した原因について詳細な事実を書き出そう",
		title: "<strong>B</strong>elief（原因の詳細）",
		example:
			"例：\n・なぜその原因が重要だと考えたのか\n・具体的にどのような影響があったのか\n・関連する事実は何か",
	},
	{
		type: ElementType.dispute_evidence,
		label: "失敗の原因の根拠",
		description: "なぜこの原因が重要であるのか考えてみよう",
		title: "<strong>D</strong>ispute（原因の重要性）",
		example:
			"例：\n直接影響しているといえるのは、どんな事実があるからですか？\n・客観的なデータや情報\n・他者からのフィードバック",
	},
	{
		type: ElementType.dispute_counter,
		label: "反対側の視点",
		description: "選んだ失敗の原因が重要でないケースについて考えてみよう",
		title: "<strong>D</strong>ispute（反対側の視点）",
		example:
			"例：\n・別の解釈の可能性\n・見落としている要因\n・異なる視点からの考察",
	},
];
