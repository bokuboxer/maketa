import { ElementType } from "@/api/model/elementType";
import { StepConfig } from "./types";

// Step configuration
export const steps: StepConfig[] = [
  { 
    type: ElementType.adversity, 
    label: '失敗の詳細', 
    description: '失敗の詳細を入力しよう',
    title: '<strong>A</strong>dversity',
    example: '例：\n・締め切りに間に合わなかった\n・顧客からのクレームを受けた\n・チームメンバーと意見が合わなかった'
  },
  { 
    type: ElementType.belief, 
    subType: 'selection',
    label: '意見の選択', 
    description: 'あなたの意見を選択しよう（最大3つまで）',
    title: '<strong>B</strong>elief Selection',
    example: '例：\n・自分は無能だ\n・もう取り返しがつかない\n・誰も自分を信用してくれない'
  },
  { 
    type: ElementType.belief,
    subType: 'explanation',
    label: '意見の説明', 
    description: '選択した意見について詳しく説明しよう',
    title: '<strong>B</strong>elief Explanation',
    example: '例：\n・なぜそう考えたのか\n・どのような影響があったか\n・具体的な事実は何か'
  },
  { 
    type: ElementType.disputation, 
    label: '視点の探索', 
    description: '前のステップで入力した信念に対する反論を入力してください',
    title: '<strong>D</strong>isputation',
    example: '例：\n・一度の失敗で全てを判断するのは極端すぎる\n・誰にでもミスはある\n・この経験を次に活かすことができる'
  },
]; 