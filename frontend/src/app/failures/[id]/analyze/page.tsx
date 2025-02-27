'use client';

import { useGetFailureByIdFailureFailureIdGet, useSuggestElementsElementsSuggestPost } from '@/api/generated/default/default';
import { Element } from '@/api/model/element';
import { ElementType } from '@/api/model/elementType';
import { DragDropContext, Draggable, DraggableProvided, DropResult, Droppable, DroppableProvided } from '@hello-pangea/dnd';
import { Loader } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';

interface PageParams {
	id: string;
}

type DndElement = {
  element: Element;
  isSelected: boolean;
}

interface GroupedElements {
  adversity: DndElement[];
  belief: DndElement[];
  consequence: DndElement[];
  disputation: DndElement[];
  effect: DndElement[];
}

export default function AnalyzePage({ params }: { params: Promise<PageParams> }) {
  const resolvedParams = use(params);
	const { data: failure, isLoading: isFailureLoading } = useGetFailureByIdFailureFailureIdGet(Number(resolvedParams.id))
  const {mutate: suggestElements} = useSuggestElementsElementsSuggestPost()
	const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [activeStep, setActiveStep] = useState<ElementType>(ElementType.adversity);
  const [selectedElements, setSelectedElements] = useState<GroupedElements>({
    adversity: [],
    belief: [],
    consequence: [],
    disputation: [],
    effect: [],
  });
  const [suggestedElements, setSuggestedElements] = useState<GroupedElements>({
    adversity: [],
    belief: [],
    consequence: [],
    disputation: [],
    effect: [],
  });
	const router = useRouter();

  useEffect(() => {
    const fetchSuggestElements = async () => {
      suggestElements({ 
        params: { failure_id: Number(resolvedParams.id) }
      }, {
        onSuccess: (data) => {
          if (data) {
            const grouped = data.reduce<GroupedElements>(
              (acc, element) => {
                const dndElement: DndElement = {
                  element,
                  isSelected: false
                };
                if (element.type === ElementType.adversity) acc.adversity.push(dndElement);
                if (element.type === ElementType.belief) acc.belief.push(dndElement);
                if (element.type === ElementType.consequence) acc.consequence.push(dndElement);
                if (element.type === ElementType.disputation) acc.disputation.push(dndElement);
                if (element.type === ElementType.effect) acc.effect.push(dndElement);
                return acc;
              },
              { adversity: [], belief: [], consequence: [], disputation: [], effect: [] }
            );

            // 全ての要素を推測された要素として設定
            setSuggestedElements(grouped);

            // 選択された要素は空で初期化
            setSelectedElements({
              adversity: [],
              belief: [],
              consequence: [],
              disputation: [],
              effect: [],
            });
          }
          setLoading(false);
        },
      });
    };
    fetchSuggestElements();
  }, [resolvedParams.id]);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (result: DropResult) => {
    setIsDragging(false);
    if (!result.destination) return;

    const sourceType = result.source.droppableId.split('-')[0];
    const destType = result.destination.droppableId.split('-')[0];
    const elementType = result.source.droppableId.split('-')[1] as keyof GroupedElements;

    const sourceList = sourceType === 'selected' ? selectedElements : suggestedElements;
    const dndElement = sourceList[elementType][result.source.index];

    // 同じリスト内での移動（selected内またはsuggested内）
    if (sourceType === destType) {
      const items = Array.from(sourceList[elementType]);
      const [removed] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, removed);

      if (sourceType === 'selected') {
        setSelectedElements(prev => ({
          ...prev,
          [elementType]: items
        }));
      } else {
        setSuggestedElements(prev => ({
          ...prev,
          [elementType]: items
        }));
      }
      return;
    }

    // selected と suggested 間の移動
    const newDndElement = { 
      ...dndElement,
      isSelected: !dndElement.isSelected
    };

    if (sourceType === 'selected') {
      setSelectedElements(prev => ({
        ...prev,
        [elementType]: prev[elementType].filter((_, i) => i !== result.source.index)
      }));
      setSuggestedElements(prev => ({
        ...prev,
        [elementType]: [...prev[elementType], newDndElement]
      }));
    } else {
      setSuggestedElements(prev => ({
        ...prev,
        [elementType]: prev[elementType].filter((_, i) => i !== result.source.index)
      }));
      setSelectedElements(prev => ({
        ...prev,
        [elementType]: [...prev[elementType], newDndElement]
      }));
    }
  };

  const steps = [
    { 
      type: ElementType.adversity, 
      label: '逆境', 
      description: '失敗の原因となった状況や出来事を選択してください',
      example: '例：\n・締め切りに間に合わなかった\n・顧客からのクレームを受けた\n・チームメンバーと意見が合わなかった'
    },
    { 
      type: ElementType.belief, 
      label: '信念', 
      description: 'その状況で抱いた考えや思い込みを選択してください',
      example: '例：\n・自分は無能だ\n・もう取り返しがつかない\n・誰も自分を信用してくれない'
    },
    { 
      type: ElementType.consequence, 
      label: '結果', 
      description: 'その考えによって引き起こされた行動や結果を選択してください',
      example: '例：\n・落ち込んで仕事に手がつかなくなった\n・チームメンバーとの関係が悪化した\n・問題を先送りにしてしまった'
    },
    { 
      type: ElementType.disputation, 
      label: '反論', 
      description: '考えの誤りに対する反論を選択してください',
      example: '例：\n・一度の失敗で全てを判断するのは極端すぎる\n・誰にでもミスはある\n・この経験を次に活かすことができる'
    },
    { 
      type: ElementType.effect, 
      label: '効果', 
      description: '反論による新しい考え方や行動の変化を選択してください',
      example: '例：\n・冷静に問題に向き合えるようになった\n・同僚に相談して解決策を見つけた\n・再発防止の仕組みを作った'
    },
  ];

  const handleNext = () => {
    const currentIndex = steps.findIndex(step => step.type === activeStep);
    if (currentIndex < steps.length - 1) {
      setActiveStep(steps[currentIndex + 1].type);
    }
  };

  const handlePrev = () => {
    const currentIndex = steps.findIndex(step => step.type === activeStep);
    if (currentIndex > 0) {
      setActiveStep(steps[currentIndex - 1].type);
    }
  };

  if (isFailureLoading || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader color="black" size="lg" variant="dots" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-4">
          <button
            onClick={() => router.back()}
            className="text-black hover:text-gray-600 mr-4 p-2 rounded-full hover:bg-gray-100"
          >
            <IconArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-black">詳細分析</h1>
        </div>
        
        <div className="mb-6">
          <div className="border rounded-lg p-3 bg-white">
            <h2 className="font-semibold mb-2 text-black">失敗の内容</h2>
            <p className="text-black text-sm">{failure?.description}</p>
          </div>
        </div>

        {/* Stepper */}
        <div className="mb-4">
          <div className="relative flex items-center justify-between">
            <div className="relative z-10 flex w-full justify-between">
              {steps.map((step, index) => (
                <div key={step.type} className="flex flex-col items-center">
                  <button
                    onClick={() => setActiveStep(step.type)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      step.type === activeStep
                        ? 'bg-black border-black text-white'
                        : 'bg-white border-gray-300 text-black'
                    }`}
                  >
                    {index + 1}
                  </button>
                  <div className="mt-2 text-sm font-bold text-black">{step.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
          <div className="space-y-4">
            <div key={activeStep}>
              <div className="border rounded-lg p-3 bg-white">
                <div className="mb-4">
                  <p className="text-sm text-gray-600">{steps.find(step => step.type === activeStep)?.description}</p>
                </div>
                <div className="w-full">
                  <Droppable droppableId={`selected-${activeStep}`}>
                    {(provided: DroppableProvided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="w-full"
                        style={{ minHeight: 36 }}
                      >
                        {selectedElements[activeStep].length > 0 ? (
                          selectedElements[activeStep].map((dndElement, index) => (
                            <Draggable
                              key={`${dndElement.element.id}-selected`}
                              draggableId={`${dndElement.element.id}-selected`}
                              index={index}
                            >
                              {(provided: DraggableProvided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="bg-white border rounded-lg p-2 mb-1 shadow-sm hover:shadow transition-shadow cursor-move h-[36px] flex items-center"
                                >
                                  <p className="text-black text-sm leading-snug truncate">{dndElement.element.description}</p>
                                </div>
                              )}
                            </Draggable>
                          ))
                        ) : !isDragging ? (
                          <div className="text-gray-400 text-sm p-2 border border-dashed border-gray-300 rounded bg-white h-[36px] flex items-center justify-center">
                            要素をここにドロップ
                          </div>
                        ) : null}
                        {!isDragging && provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
                <div className="border-t border-gray-200 my-3" />
                <div>
                  <h4 className="text-sm font-medium text-black mb-2">推測された要素</h4>
                  <Droppable droppableId={`suggested-${activeStep}`}>
                    {(provided: DroppableProvided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="w-full"
                        style={{ minHeight: 36 }}
                      >
                        {suggestedElements[activeStep].length > 0 ? (
                          suggestedElements[activeStep].map((dndElement, index) => (
                            <Draggable
                              key={`${dndElement.element.id}-suggested`}
                              draggableId={`${dndElement.element.id}-suggested`}
                              index={index}
                            >
                              {(provided: DraggableProvided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="bg-white border rounded-lg p-2 mb-1 shadow-sm hover:shadow transition-shadow cursor-move h-[36px] flex items-center"
                                >
                                  <p className="text-black text-sm leading-snug truncate">{dndElement.element.description}</p>
                                </div>
                              )}
                            </Draggable>
                          ))
                        ) : !isDragging ? (
                          <div className="text-gray-400 text-sm p-2 h-[36px] flex items-center justify-center">
                            推測された要素はありません
                          </div>
                        ) : null}
                        {!isDragging && provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              </div>
            </div>
          </div>
        </DragDropContext>

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handlePrev}
            disabled={activeStep === ElementType.adversity}
            className={`px-4 py-2 rounded ${
              activeStep === ElementType.adversity
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            前へ
          </button>
          <button
            onClick={handleNext}
            disabled={activeStep === ElementType.effect}
            className={`px-4 py-2 rounded ${
              activeStep === ElementType.effect
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            次へ
          </button>
        </div>
      </div>
    </div>
  );
} 