'use client';

import { useAnalyzeFailureFailuresFailureIdAnalyzePost, useSuggestElementsElementsSuggestPost } from '@/api/generated/default/default';
import { Element } from '@/api/model/element';
import { Failure } from '@/api/model/failure';
import { DragDropContext, Draggable, DraggableProvided, DropResult, Droppable, DroppableProvided } from '@hello-pangea/dnd';
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
  internal: DndElement[];
  external: DndElement[];
  emotional: DndElement[];
}

export default function AnalyzePage({ params }: { params: Promise<PageParams> }) {
	const [failure, setFailure] = useState<Failure | null>(null)
	const [loading, setLoading] = useState(true);
  const [selectedElements, setSelectedElements] = useState<GroupedElements>({
    internal: [],
    external: [],
    emotional: [],
  });
  const [suggestedElements, setSuggestedElements] = useState<GroupedElements>({
    internal: [],
    external: [],
    emotional: [],
  });
	const router = useRouter();
	const {mutate: analyzeFailure} = useAnalyzeFailureFailuresFailureIdAnalyzePost()
  const {mutate: suggestElements} = useSuggestElementsElementsSuggestPost()
	const resolvedParams = use(params);

	// useEffect(() => {
	// 	const fetchFailure = () => {
	// 		analyzeFailure(
	// 			{ failureId: Number(resolvedParams.id) },
	// 			{
	// 				onSuccess: (data) => {
	// 					setFailure(data);
	// 					setLoading(false);
	// 				},
	// 			}
	// 		);
	// 	};

	// 	fetchFailure();
	// }, [resolvedParams.id, analyzeFailure]);

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
                if (element.type === 'internal') acc.internal.push(dndElement);
                if (element.type === 'external') acc.external.push(dndElement);
                if (element.type === 'emotional') acc.emotional.push(dndElement);
                return acc;
              },
              { internal: [], external: [], emotional: [] }
            );

            // 全ての要素を推測された要素として設定
            setSuggestedElements({
              internal: grouped.internal,
              external: grouped.external,
              emotional: grouped.emotional,
            });

            // 選択された要素は空で初期化
            setSelectedElements({
              internal: [],
              external: [],
              emotional: [],
            });
          }
          setLoading(false);
        },
      });
    };
    fetchSuggestElements();
  }, [resolvedParams.id]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const sourceType = result.source.droppableId.split('-')[0];
    const destType = result.destination.droppableId.split('-')[0];
    const sourceCategory = result.source.droppableId.split('-')[1];
    const destCategory = result.destination.droppableId.split('-')[1];

    // 異なるカテゴリー間の移動は許可しない
    if (sourceCategory !== destCategory) return;

    const category = sourceCategory as keyof GroupedElements;
    const sourceList = sourceType === 'selected' ? selectedElements : suggestedElements;
    const dndElement = sourceList[category][result.source.index];

    // 同じリスト内での移動（selected内またはsuggested内）
    if (sourceType === destType) {
      const items = Array.from(sourceList[category]);
      const [removed] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, removed);

      if (sourceType === 'selected') {
        setSelectedElements(prev => ({
          ...prev,
          [category]: items
        }));
      } else {
        setSuggestedElements(prev => ({
          ...prev,
          [category]: items
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
        [category]: prev[category].filter((_, i) => i !== result.source.index)
      }));
      setSuggestedElements(prev => ({
        ...prev,
        [category]: [...prev[category], newDndElement]
      }));
    } else {
      setSuggestedElements(prev => ({
        ...prev,
        [category]: prev[category].filter((_, i) => i !== result.source.index)
      }));
      setSelectedElements(prev => ({
        ...prev,
        [category]: [...prev[category], newDndElement]
      }));
    }
  };

  const renderElementList = (dndElements: DndElement[], type: string, isSelected: boolean) => (
    <Droppable droppableId={`${isSelected ? 'selected' : 'suggested'}-${type}`}>
      {(provided: DroppableProvided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className="min-h-[100px]"
        >
          {dndElements.map((dndElement, index) => (
            <Draggable
              key={`${dndElement.element.id}-${isSelected ? 'selected' : 'suggested'}`}
              draggableId={`${dndElement.element.id}-${isSelected ? 'selected' : 'suggested'}`}
              index={index}
            >
              {(provided: DraggableProvided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  className="bg-white border rounded-lg p-4 mb-2 shadow-sm hover:shadow transition-shadow cursor-move"
                >
                  <p className="text-gray-700">{dndElement.element.description}</p>
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );

  if (loading) {
    return <div className="p-8">分析中...</div>;
  }

  // if (!failure) {
  //   return <div className="p-8">失敗の分析情報が見つかりませんでした。</div>;
  // }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-800"
        >
          ← 戻る
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">失敗の分析</h1>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">失敗の内容</h2>
          <p className="text-gray-700">discription</p>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="space-y-8">
            {(['internal', 'external', 'emotional'] as const).map((type) => (
              <div key={type} className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {type === 'internal' ? '内部要因' : type === 'external' ? '外部要因' : '感情要因'}
                </h3>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="min-h-[100px]">
                    {selectedElements[type].length > 0 ? (
                      renderElementList(selectedElements[type], type, true)
                    ) : (
                      <div className="text-gray-400 text-sm p-4 border border-dashed border-gray-300 rounded bg-white">
                        要素をここにドロップ
                      </div>
                    )}
                  </div>
                  <div className="border-t border-gray-200 my-4" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-4">推測された要素</h4>
                    {suggestedElements[type].length > 0 ? (
                      renderElementList(suggestedElements[type], type, false)
                    ) : (
                      <div className="text-gray-400 text-sm p-4">
                        推測された要素はありません
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
} 