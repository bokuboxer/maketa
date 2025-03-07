"use client"

import * as React from "react"
import { ElementType } from "@/api/model/elementType"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
interface StepperProps {
  activeStep: ElementType
}

export function Stepper({activeStep}: StepperProps) {
	const steps = [
		{
			id: 0,
			types: [ElementType.adversity] as ElementType[],
			button: "A",
			label: "詳細",
		},
		{
			id: 1,
			types: [
				ElementType.belief_selection,
				ElementType.belief_explanation,
			] as ElementType[],
			button: "B",
			label: "原因",
		},
		{
			id: 2,
			types: [
				ElementType.dispute_evidence,
				ElementType.dispute_counter,
			] as ElementType[],
			button: "D",
			label: "反証",
		},
	];

	const activeStepId = steps.findIndex((step) => step.types.includes(activeStep));

  return (
    <div className="w-full mb-4">
      <div className="flex items-center justify-between px-4">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium",
                  step.id < activeStepId
                    ? "bg-black text-white"
                    : step.id === activeStepId
                      ? "border-2 border-black bg-background text-black"
                      : "border border-border bg-muted text-muted-foreground",
                )}
                aria-current={step.id === activeStepId ? "step" : undefined}
              >
                {step.id < activeStepId ? <Check className="h-4 w-4" /> : <span>{step.button}</span>}
              </div>
              <span
                className={cn(
                  "mt-1 text-xs",
                  step.id === activeStepId ? "font-medium text-black" : "text-gray-500",
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn("h-[1px] flex-1 mx-2", step.id < activeStepId ? "bg-black" : "bg-gray-300")}
                aria-hidden="true"
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

