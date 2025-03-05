import { ElementType } from "@/api/model/elementType";
import { BeliefExplanationComponentProps, DndElement } from "./types";
import { Tabs } from "@mantine/core";
import { useState } from "react";

// Belief explanation component
export const BeliefExplanationComponent = ({ selectedElements, setSelectedElements }: BeliefExplanationComponentProps) => {
  const [activeTab, setActiveTab] = useState<string>("0");

  return (
    <div className="border rounded-lg p-4 bg-white">
      <Tabs value={activeTab} onChange={(value) => setActiveTab(value || "0")}>
        <Tabs.List grow>
          {selectedElements[ElementType.belief].map((dndElement: DndElement, index: number) => (
            <Tabs.Tab
              key={index}
              value={index.toString()}
              className="data-[active]:bg-black data-[active]:text-white"
            >
              {dndElement.element.description}
            </Tabs.Tab>
          ))}
        </Tabs.List>

        {selectedElements[ElementType.belief].map((dndElement: DndElement, index: number) => (
          <Tabs.Panel key={index} value={index.toString()}>
            <div className="mt-4">
              <textarea
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="この原因について詳しく説明してください"
                rows={5}
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
          </Tabs.Panel>
        ))}
      </Tabs>
    </div>
  );
}; 