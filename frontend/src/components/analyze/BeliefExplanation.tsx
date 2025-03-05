import { ElementType } from "@/api/model/elementType";
import { BeliefExplanationComponentProps, DndElement } from "./types";
import { Tabs } from "@mantine/core";
import { useState } from "react";
import { StepHeader } from "./StepHeader";

// Belief explanation component
export const BeliefExplanationComponent = ({
  selectedElements,
  setSelectedElements,
  steps,
}: BeliefExplanationComponentProps) => {
  const [activeTab, setActiveTab] = useState<string>("0");

  const currentStep = steps.find(step => 
    step.type === ElementType.belief && step.subType === 'explanation'
  );

  return (
    <div className="border rounded-lg p-3 bg-white">
      <StepHeader currentStep={currentStep} />
      <div className="mt-4">
        {selectedElements.belief.map((element) => (
          <div key={element.element.id} className="space-y-2">
            <div className="bg-black text-white p-3 rounded-lg">
              <p className="font-medium">{element.element.description}</p>
            </div>
            <textarea
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              rows={5}
              placeholder="詳細を簡潔に書き出してください"
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
        ))}
      </div>
    </div>
  );
}; 