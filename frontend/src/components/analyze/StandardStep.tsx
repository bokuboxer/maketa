import { StandardStepComponentProps } from "./types";
import { StepHeader } from "./StepHeader";
import { DraggableElementList } from "./DraggableElementList";

// Standard step component (for Adversity, Belief Selection, and Disputation)
export const StandardStepComponent = ({ 
  activeStep, 
  isDragging, 
  selectedElements, 
  suggestedElements,
  steps
}: StandardStepComponentProps) => {
  const currentStep = steps.find((step) => step.type === activeStep);
  
  return (
    <div className="border rounded-lg p-3 bg-white">
      <StepHeader currentStep={currentStep} />
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
    </div>
  );
}; 