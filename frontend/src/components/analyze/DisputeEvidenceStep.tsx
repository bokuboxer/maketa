import { ElementType } from "@/api/model/elementType";
import { GroupedElements, StepConfig } from "./types";
import { StepHeader } from "./StepHeader";
import { useState } from "react";
import { NavigationButtons } from "./NavigationButtons";
import { useSuggestElementsElementsSuggestPost } from "@/api/generated/default/default";
import { Failure } from "@/api/model";
type StandardStepComponentProps = {
	suggestedElements: GroupedElements;
	steps: StepConfig[];
	failure: Failure | undefined;
	adversityText: string | null;
	beliefSelectedElement: string | null;
	beliefExplanationText: string | null;
	nextLoading: boolean;
	setSuggestedElements: React.Dispatch<React.SetStateAction<GroupedElements>>;
	setActiveStep: React.Dispatch<React.SetStateAction<ElementType>>;
	setNextLoading: React.Dispatch<React.SetStateAction<boolean>>;
	disputeEvidenceText: string | null;
	setDisputeEvidenceText: React.Dispatch<React.SetStateAction<string | null>>;
};

export const DisputeEvidenceStep = ({
	suggestedElements,
	steps,
	failure,
	adversityText,
	beliefSelectedElement,
	beliefExplanationText,
	nextLoading,
	setSuggestedElements,
	setActiveStep,
	setNextLoading,
	disputeEvidenceText,
	setDisputeEvidenceText,
}: StandardStepComponentProps) => {
	const { mutate: suggestElements } = useSuggestElementsElementsSuggestPost();
	const handleSuggestionClick = (suggestionText: string) => {
		if (disputeEvidenceText) {
			const newText = disputeEvidenceText + "\n" + suggestionText;
			setDisputeEvidenceText(newText);
		} else {
			setDisputeEvidenceText(suggestionText);
		}
	};

	const handlePrev = () => {
		setActiveStep(ElementType.belief_explanation);
	};
	const handleNext = async () => {
		if (!disputeEvidenceText) return;
		setNextLoading(true);
		suggestElements(
			{
				data: {
					type: ElementType.dispute_counter,
					text: failure?.description || "",
					adversity: adversityText,
					selected_label: beliefSelectedElement,
					belief_explanation: beliefExplanationText,
					dispute_evidence: disputeEvidenceText,
				},
			},
			{
				onSuccess: (data) => {
					setSuggestedElements((prev) => ({
						...prev,
						[ElementType.dispute_counter]: data || [],
					}));
					setActiveStep(ElementType.dispute_counter);
					setNextLoading(false);
				},
			},
		);
	};

	return (
		<div className="border rounded-lg p-3 bg-white">
			<StepHeader
				currentStep={steps.find(
					(step) => step.type === ElementType.dispute_evidence,
				)}
			/>
			<div className="w-full space-y-2">
				<textarea
					className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
					rows={5}
					placeholder="根拠を入力してください"
					value={disputeEvidenceText || ""}
					onChange={(e) => setDisputeEvidenceText(e.target.value)}
				/>
			</div>
			<div className="border-t border-gray-200 my-3" />
			<div>
				<h4 className="text-sm font-medium text-black mb-2">入力候補</h4>
				<div className="space-y-2">
					{suggestedElements[ElementType.dispute_evidence].length === 0 ? (
						<div className="text-gray-500 text-sm p-3 bg-gray-50 rounded-lg">
							入力候補はありません
						</div>
					) : (
						suggestedElements[ElementType.dispute_evidence].map((element) => (
							<button
								key={element.id}
								onClick={() => handleSuggestionClick(element.description)}
								className="w-full p-3 rounded-lg text-left bg-gray-50 hover:bg-gray-100 text-sm"
							>
								{element.description}
							</button>
						))
					)}
				</div>
			</div>
			<NavigationButtons
				handlePrev={handlePrev}
				handleNext={handleNext}
				nextLoading={nextLoading}
				prevDisabled={nextLoading}
				nextDisabled={
					disputeEvidenceText?.length === 0 || disputeEvidenceText === null
				}
			/>
		</div>
	);
};
