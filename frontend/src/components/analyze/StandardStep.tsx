import { ElementType } from "@/api/model/elementType";
import { StandardStepComponentProps, ExtendedElement } from "./types";
import { StepHeader } from "./StepHeader";

// Belief Selection Component
const BeliefSelectionComponent = ({
  suggestedElements,
  selectedElements,
  activeStep,
  onSelect,
}: {
  suggestedElements: StandardStepComponentProps['suggestedElements'];
  selectedElements: StandardStepComponentProps['selectedElements'];
  activeStep: ElementType;
  onSelect: (element: any) => void;
}) => {
  // すべての要素を表示（suggestedElementsのみを使用）
  const displayElements = [...suggestedElements[activeStep]];
  const midPoint = Math.ceil(displayElements.length / 2);
  const firstColumn = displayElements.slice(0, midPoint);
  const secondColumn = displayElements.slice(midPoint);

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-2">
        {firstColumn.map((element) => {
          const isSelected = selectedElements[activeStep].some(
            (selected) => selected.element.id === element.element.id
          );
          return (
            <button
              key={element.element.id}
              onClick={() => onSelect(element)}
              className={`w-full p-3 rounded-lg text-left transition-all text-xs ${
                isSelected
                  ? "bg-black text-white"
                  : "bg-gray-50 hover:bg-gray-100 text-black"
              }`}
            >
              <p className="font-medium">{element.element.description}</p>
            </button>
          );
        })}
      </div>
      <div className="space-y-2">
        {secondColumn.map((element) => {
          const isSelected = selectedElements[activeStep].some(
            (selected) => selected.element.id === element.element.id
          );
          return (
            <button
              key={element.element.id}
              onClick={() => onSelect(element)}
              className={`w-full p-3 rounded-lg text-left transition-all text-xs ${
                isSelected
                  ? "bg-black text-white"
                  : "bg-gray-50 hover:bg-gray-100 text-black"
              }`}
            >
              <p className="font-medium">{element.element.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Standard step component (for Adversity, Belief Selection, and Disputation)
export const StandardStepComponent = ({ 
  activeStep, 
  selectedElements, 
  suggestedElements,
  steps,
  setSelectedElements,
  setSuggestedElements,
}: StandardStepComponentProps) => {
  const currentStep = steps.find((step) => step.type === activeStep);
  
  const handleBeliefSelect = (element: any) => {
    // If the element is already selected, remove it
    if (selectedElements[activeStep].some(
      (selected) => selected.element.id === element.element.id
    )) {
      setSelectedElements((prev) => ({
        ...prev,
        [activeStep]: []
      }));
    } else {
      // Select the new element
      setSelectedElements((prev) => ({
        ...prev,
        [activeStep]: [element]
      }));
    }
  };

  const handleSuggestionClick = (suggestionText: string) => {
    if (selectedElements[activeStep].length === 0) {
      // 最初の要素を追加
      const newElement: ExtendedElement = {
        id: Date.now(),
        type: activeStep,
        description: suggestionText,
        failure_id: 0, // This will be set when saving
        created_at: new Date().toISOString(),
      };
      
      setSelectedElements((prev) => ({
        ...prev,
        [activeStep]: [{
          element: newElement,
          isSelected: true,
        }]
      }));
    } else {
      // 既存の要素の説明に追加
      setSelectedElements((prev) => ({
        ...prev,
        [activeStep]: prev[activeStep].map((item) => ({
          ...item,
          element: {
            ...item.element,
            description: item.element.description
              ? `${item.element.description}\n${suggestionText}`
              : suggestionText,
          },
        }))
      }));
    }
  };

  const handleDescriptionChange = (newDescription: string) => {
    setSelectedElements((prev) => ({
      ...prev,
      [activeStep]: prev[activeStep].map((item) => ({
        ...item,
        element: {
          ...item.element,
          description: newDescription,
        },
      }))
    }));
  };

  return (
    <div className="border rounded-lg p-3 bg-white">
      <StepHeader currentStep={currentStep} />
      {activeStep === ElementType.belief ? (
        <BeliefSelectionComponent
          suggestedElements={suggestedElements}
          selectedElements={selectedElements}
          activeStep={activeStep}
          onSelect={handleBeliefSelect}
        />
      ) : (
        <>
          <div className="w-full space-y-2">
            {selectedElements[activeStep].length === 0 ? (
              <div className="text-gray-500 text-sm p-3 bg-gray-50 rounded-lg">
                説明を入力または候補から選択してください
              </div>
            ) : (
              <textarea
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                rows={5}
                placeholder="詳しく説明してください"
                value={selectedElements[activeStep][0]?.element.description || ""}
                onChange={(e) => handleDescriptionChange(e.target.value)}
              />
            )}
          </div>
          <div className="border-t border-gray-200 my-3" />
          <div>
            <h4 className="text-sm font-medium text-black mb-2">
              入力候補
            </h4>
            <div className="space-y-2">
              {suggestedElements[activeStep].length === 0 ? (
                <div className="text-gray-500 text-sm p-3 bg-gray-50 rounded-lg">入力候補はありません</div>
              ) : (
                suggestedElements[activeStep].map((element) => (
                  <button
                    key={element.element.id}
                    onClick={() => handleSuggestionClick(element.element.description)}
                    className="w-full p-3 rounded-lg text-left bg-gray-50 hover:bg-gray-100 text-sm"
                  >
                    {element.element.description}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}; 