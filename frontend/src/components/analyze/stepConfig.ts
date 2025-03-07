import { ElementType } from "@/api/model/elementType";
import { StepConfig } from "./types";

// Step configuration
export const steps: StepConfig[] = [
	{
		type: ElementType.adversity,
		label: "失敗の詳細",
		description: "失敗の詳細を入力してください",
		title: "<strong>A</strong>dversity（失敗の詳細）",
		example:
			"例：\n・いつ\n・どこで\n・何が起きたか\n・誰が関係していたか\n・どのような状況だったか",
	},
	{
		type: ElementType.belief_selection,
		label: "失敗の原因",
		description: "失敗の原因だと思うものを選択/入力しよう",
		title: "<strong>B</strong>elief",
		example:
			"例：\n・内的要因（自己）：\n - 準備不足だった\n - 経験が足りなかった\n・外的要因（環境・他者）：\n - 時間が足りなかった\n - チーム内のコミュニケーション不足",
	},
	{
		type: ElementType.belief_explanation,
		label: "失敗の原因の詳細",
		description: "失敗の原因の詳細を書き出そう",
		title: "<strong>B</strong>elief",
		example:
			"例：\n・なぜその原因が重要だと考えたのか\n・具体的にどのような影響があったのか\n・関連する事実は何か",
	},
	{
		type: ElementType.dispute_evidence,
		label: "失敗の原因の根拠",
		description: "なぜ失敗の原因であるのか考えてみよう",
		title: "<strong>D</strong>ispute",
		example:
			"例：\n・具体的な事実や経験\n・客観的なデータや情報\n・他者からのフィードバック",
	},
	{
		type: ElementType.dispute_counter,
		label: "もう一方の視点",
		description: "もう一方の視点で失敗の原因を考えてみよう",
		title: "<strong>D</strong>ispute",
		example:
			"例：\n・別の解釈の可能性\n・見落としている要因\n・異なる視点からの考察",
	},
];
