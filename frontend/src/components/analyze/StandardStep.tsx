import { ElementType } from "@/api/model/elementType";
import { StandardStepComponentProps } from "./types";
import { StepHeader } from "./StepHeader";
import { DraggableElementList } from "./DraggableElementList";

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
  const elements = suggestedElements[activeStep];
  const midPoint = Math.ceil(elements.length / 2);
  const firstColumn = elements.slice(0, midPoint);
  const secondColumn = elements.slice(midPoint);

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
  isDragging, 
  selectedElements, 
  suggestedElements,
  steps
}: StandardStepComponentProps) => {
  const currentStep = steps.find((step) => step.type === activeStep);
  
  const handleBeliefSelect = (element: any) => {
    // If the element is already selected, remove it
    if (selectedElements[activeStep].some(
      (selected) => selected.element.id === element.element.id
    )) {
      selectedElements[activeStep] = [];
      suggestedElements[activeStep] = [...suggestedElements[activeStep], element];
    } else {
      // Move any currently selected element back to suggested
      const currentlySelected = selectedElements[activeStep][0];
      if (currentlySelected) {
        suggestedElements[activeStep] = [...suggestedElements[activeStep], currentlySelected];
      }
      // Select the new element
      selectedElements[activeStep] = [element];
      suggestedElements[activeStep] = suggestedElements[activeStep].filter(
        (e) => e.element.id !== element.element.id
      );
    }
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
          <div className="w-full">
            <DraggableElementList 
              elementType={activeStep}
              elements={selectedElements[activeStep]}
              droppableId={`selected-${activeStep}`}
              emptyMessage="要素をここにドロップ"
              isDragging={isDragging}
            />
          </div>
          <div className="border-t border-gray-200 my-3" />
          <div>
            <h4 className="text-sm font-medium text-black mb-2">
              入力候補
            </h4>
            <DraggableElementList 
              elementType={activeStep}
              elements={suggestedElements[activeStep]}
              droppableId={`suggested-${activeStep}`}
              emptyMessage="入力候補はありません"
              isDragging={isDragging}
            />
          </div>
        </>
      )}
    </div>
  );
}; 