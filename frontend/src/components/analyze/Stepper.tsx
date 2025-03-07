import { ElementType } from "@/api/model/elementType";
import { StepConfig } from "./types";

type StepperComponentProps = {
	activeStep: ElementType;
	steps: StepConfig[];
};

// Stepper component
export const StepperComponent = ({
	activeStep,
}: StepperComponentProps) => {
	const steps = [
		{
			types: [ElementType.adversity] as ElementType[],
			button: "A",
			label: "詳細",
		},
		{
			types: [
				ElementType.belief_selection,
				ElementType.belief_explanation,
			] as ElementType[],
			button: "B",
			label: "原因",
		},
		{
			types: [
				ElementType.dispute_evidence,
				ElementType.dispute_counter,
			] as ElementType[],
			button: "D",
			label: "反証",
		},
	];

	return (
		<div className="mb-4 px-8">
			<div className="relative z-10 flex w-full justify-between">
				{steps
					.map((step, index) => (
						<div key={index} className="flex flex-col items-center">
							<button
								className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
									step.types.includes(activeStep)
										? "bg-black border-black text-white"
										: "bg-white border-gray-300 text-black"
								}`}
							>
								{step.button}
							</button>
							<div className="mt-2 text-sm font-bold text-black">
								{step.label}
							</div>
						</div>
					))}
			</div>
		</div>
	);
};
