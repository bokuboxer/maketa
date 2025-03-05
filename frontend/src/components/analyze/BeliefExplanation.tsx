import { ElementType } from "@/api/model/elementType";
import { BeliefExplanationComponentProps, DndElement } from "./types";

// Belief explanation component
export const BeliefExplanationComponent = ({ selectedElements, setSelectedElements }: BeliefExplanationComponentProps) => {
  return (
    <div className="space-y-4">
      {selectedElements[ElementType.belief].map((dndElement: DndElement, index: number) => (
        <div key={index} className="border rounded-lg p-4 bg-white">
          <h4 className="font-medium mb-2">{dndElement.element.description}</h4>
          <textarea
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="この意見について詳しく説明してください"
            rows={3}
            value={dndElement.element.explanation || ''}
            onChange={(e) => {
              const newSelectedElements = [...selectedElements[ElementType.belief]];
              newSelectedElements[index] = {
                ...dndElement,
                element: {
                  ...dndElement.element,
                  explanation: e.target.value
                }
              };
              setSelectedElements(prev => ({
                ...prev,
                [ElementType.belief]: newSelectedElements
              }));
            }}
          />
        </div>
      ))}
    </div>
  );
}; 