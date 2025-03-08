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
			"自身が原因だと思うものを選択してください\n感情による判断でも構いません",
	},
	{
		type: ElementType.belief_explanation,
		label: "失敗の原因の詳細",
		description: "選択した原因について詳細な事実を書き出そう",
		title: "<strong>B</strong>elief（原因の詳細）",
		example:
			"自身のどんな行動が直接影響していますか？\n他者のどんな行動が直接影響していますか？\nどんな環境や設備が関係していますか？\nどんな期待があったのですか？\nどんな結果が期待されていたのですか？",
	},
	{
		type: ElementType.dispute_evidence,
		label: "失敗の原因の根拠",
		description: "なぜこの原因が重要であるのか考えてみよう",
		title: "<strong>D</strong>ispute（原因の重要性）",
		example:
			"他の原因と比べた時、具体的にどんな事実が重要であると思いますか？\nこれを解決すると、どんな効果があると思いますか？",
	},
	{
		type: ElementType.dispute_counter,
		label: "反対側の視点",
		description: "選んだ失敗の原因以外のケースについて考えてみよう",
		title: "<strong>D</strong>ispute（他の視点）",
		example:
			"この原因だけではどんな点が見落とされるでしょうか？\n他の視点で説明可能な点は何でしょうか？",
	},
];
