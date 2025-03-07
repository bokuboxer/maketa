import { ElementType } from "@/api/model/elementType";
import { StepConfig } from "@/components/analyze/types";
import { Failure } from "@/api/model/failure";

type PreviousStepSummaryProps = {
	activeStep: ElementType;
	failure: Failure | undefined;
	adversityText: string | null;
	beliefSelectedElement: string | null;
	beliefExplanationText: string | null;
	disputeEvidenceText: string | null;
	steps: StepConfig[];
};

export const PreviousStepSummary = ({
	activeStep,
	failure,
	adversityText,
	beliefSelectedElement,
	beliefExplanationText,
	disputeEvidenceText,
	steps,
}: PreviousStepSummaryProps) => {
	return (
		<div className="mb-6">
			<div className="border rounded-lg p-3 bg-white">
				<h2 className="font-semibold mb-2 text-black">
					{activeStep === ElementType.adversity
						? "失敗の内容"
						: activeStep === ElementType.belief_selection
							? "失敗の詳細"
							: activeStep === ElementType.belief_explanation
								? "失敗の原因"
								: activeStep === ElementType.dispute_evidence
									? "失敗の原因"
									: activeStep === ElementType.dispute_counter
										? "原因の根拠"
										: steps.find(
												(step) =>
													step.type ===
													steps[
														steps.findIndex((s) => s.type === activeStep) - 1
													].type,
											)?.label}
				</h2>
				<p className="text-black text-sm">
					{activeStep === ElementType.adversity
						? failure?.description
						: activeStep === ElementType.belief_selection
							? adversityText
							: activeStep === ElementType.belief_explanation
								? beliefSelectedElement
								: activeStep === ElementType.dispute_evidence
									? beliefExplanationText
									: activeStep === ElementType.dispute_counter
										? disputeEvidenceText
										: steps.find(
												(step) =>
													step.type ===
													steps[
														steps.findIndex((s) => s.type === activeStep) - 1
													].type,
											)?.label}
				</p>
			</div>
		</div>
	);
};
