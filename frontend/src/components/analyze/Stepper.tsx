import { ElementType } from "@/api/model/elementType";
import { StepperComponentProps } from "./types";

// Stepper component
export const StepperComponent = ({ activeStep, activeSubType, steps }: StepperComponentProps) => {
  return (
    <div className="mb-4">
      <div className="relative flex items-center justify-between">
        <div className="relative z-10 flex w-full justify-between">
          {steps
            .filter((step, index, self) => 
              // 同じtypeのステップの場合、最初に出現したものだけを表示
              index === self.findIndex(s => s.type === step.type)
            )
            .map((step, index) => (
              <div key={`${step.type}-${step.subType || 'main'}`} className="flex flex-col items-center">
                <button
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    step.type === activeStep
                      ? "bg-black border-black text-white"
                      : "bg-white border-gray-300 text-black"
                  }`}
                >
                  {String.fromCharCode(65 + index)}
                </button>
                <div className="mt-2 text-sm font-bold text-black">
                  {step.label}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}; 