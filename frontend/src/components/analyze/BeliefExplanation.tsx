import { ElementType } from "@/api/model/elementType";
import { BeliefExplanationComponentProps } from "./types";
import { StepHeader } from "./StepHeader";

// Belief explanation component
export const BeliefExplanationComponent = ({
  selectedElements,
  setSelectedElements,
  suggestedElements,
  steps,
}: BeliefExplanationComponentProps) => {
  const currentStep = steps.find(step => 
    step.type === ElementType.belief && step.subType === 'explanation'
  );

  const handleSuggestionClick = (suggestionText: string, elementId: number) => {
    setSelectedElements((prev) => ({
      ...prev,
      belief: prev.belief.map((item) =>
        item.element.id === elementId
          ? {
              ...item,
              element: {
                ...item.element,
                explanation: item.element.explanation
                  ? `${item.element.explanation}\n${suggestionText}`
                  : suggestionText,
              },
            }
          : item
      ),
    }));
  };

  return (
    <div className="border rounded-lg p-3 bg-white">
      <StepHeader currentStep={currentStep} />
      <div className="mt-4">
        {selectedElements.belief.map((element) => (
          <div key={element.element.id} className="space-y-2">
            <div className="bg-black text-white p-3 rounded-lg">
              <p className="font-medium">{element.element.description}</p>
            </div>
            <div className="w-full">
              <textarea
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                rows={5}
                placeholder="この原因について詳しく説明してください"
                value={element.element.explanation || ""}
                onChange={(e) =>
                  setSelectedElements((prev) => ({
                    ...prev,
                    belief: prev.belief.map((item) =>
                      item.element.id === element.element.id
                        ? {
                            ...item,
                            element: {
                              ...item.element,
                              explanation: e.target.value,
                            },
                          }
                        : item
                    ),
                  }))
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
              key={element.element.id}
              onClick={() => handleSuggestionClick(
                element.element.description,
                selectedElements.belief[0]?.element.id
              )}
              className="w-full text-left bg-gray-50 p-3 rounded-lg text-sm hover:bg-gray-100 transition-colors"
            >
              {element.element.description}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}; 