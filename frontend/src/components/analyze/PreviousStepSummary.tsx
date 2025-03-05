import { ElementType } from "@/api/model/elementType";
import { PreviousStepSummaryProps } from "./types";

// Previous step summary component
export const PreviousStepSummary = ({ activeStep, failure, selectedElements, steps }: PreviousStepSummaryProps) => {
  return (
    <div className="mb-6">
      <div className="border rounded-lg p-3 bg-white">
        <h2 className="font-semibold mb-2 text-black">
          {activeStep === ElementType.adversity
            ? "失敗の内容"
            : activeStep === ElementType.disputation
              ? "信念"
              : steps.find(
                  (step) =>
                    step.type ===
                    steps[steps.findIndex((s) => s.type === activeStep) - 1]
                      .type,
                )?.label}
        </h2>
        <p className="text-black text-sm">
          {activeStep === ElementType.adversity
            ? failure?.description
            : activeStep === ElementType.disputation
              ? selectedElements[ElementType.belief]
                  .map((element) => element.element.description)
                  .join("\n")
              : selectedElements[
                  steps[steps.findIndex((s) => s.type === activeStep) - 1]
                    .type
                ]
                  .map((element) => element.element.description)
                  .join("\n")}
        </p>
      </div>
    </div>
  );
}; 