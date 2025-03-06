import { ElementType } from "@/api/model/elementType";
import { BeliefExplanationComponentProps } from "./types";
import { StepHeader } from "./StepHeader";
import { useState } from "react";
// Belief explanation component
export const BeliefExplanationComponent = ({
  selectedElements,
  setSelectedElements,
  suggestedElements,
  steps,
}: BeliefExplanationComponentProps) => {
  const [explanation, setExplanation] = useState<string>("");
  const currentStep = steps.find(step => 
    step.type === ElementType.belief && step.subType === 'explanation'
  );

  const handleSuggestionClick = (suggestionText: string, elementId: number) => {
    setExplanation(suggestionText);
  };

  return (
    <div className="border rounded-lg p-3 bg-white">
      <StepHeader currentStep={currentStep} />
      <div className="mt-4">
        {selectedElements.belief.map((element) => (
          <div key={element.id} className="space-y-2">
            <div className="bg-black text-white p-3 rounded-lg">
              <p className="font-medium">{element.description}</p>
            </div>
            <div className="w-full">
              <textarea
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                rows={5}
                placeholder="この原因について詳しく説明してください"
                value={explanation || ""}
                onChange={(e) =>
                  setExplanation(e.target.value)
                }
              />
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-200 my-4" />
      <div>
        <h4 className="text-sm font-medium text-black mb-2">
          説明の候補
        </h4>
        <div className="space-y-2">
          {suggestedElements.belief.map((element) => (
            <button
              key={element.id}
              onClick={() => handleSuggestionClick(
                element.description,
                selectedElements.belief[0]?.id
              )}
              className="w-full text-left bg-gray-50 p-3 rounded-lg text-sm hover:bg-gray-100 transition-colors"
            >
              {element.description}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}; 