import { ElementType } from "@/api/model/elementType";
import { GroupedElements, StepConfig } from "./types";
import { StepHeader } from "./StepHeader";
import { useState } from "react";
import { NavigationButtons } from "./NavigationButtons";
import { useSuggestElementsElementsSuggestPost } from "@/api/generated/default/default";;

type StandardStepComponentProps = {
	selectedElements: GroupedElements;
	suggestedElements: GroupedElements;
	steps: StepConfig[];
	nextLoading: boolean;
	setSelectedElements: React.Dispatch<React.SetStateAction<GroupedElements>>;
	setSuggestedElements: React.Dispatch<React.SetStateAction<GroupedElements>>;
	setActiveStep: React.Dispatch<React.SetStateAction<ElementType>>;
	setActiveSubType: React.Dispatch<React.SetStateAction<string | null>>;
	setNextLoading: React.Dispatch<React.SetStateAction<boolean>>;
	adversityText: string | null;
	setAdversityText: React.Dispatch<React.SetStateAction<string | null>>;
}

export const DisputeEvidenceStep = ({
	suggestedElements,
	steps,
	nextLoading,
	setSelectedElements,
	setSuggestedElements,
	setActiveStep,
	setActiveSubType,
	setNextLoading,
	adversityText,
	setAdversityText,
}: StandardStepComponentProps) => {
	const { mutate: suggestElements } =
		useSuggestElementsElementsSuggestPost();
	const handleSuggestionClick = (suggestionText: string) => {
		if (adversityText) {
			const newText = adversityText + "\n" + suggestionText;
			setAdversityText(newText);
		} else {
			setAdversityText(suggestionText);
		}
	};

	const handlePrev = () => {};
	const handleNext = async () => {
		if (!adversityText) return;
		setNextLoading(true);
		suggestElements({
			data: {
				type: ElementType.belief,
				text: adversityText,
				elements: [],
			},
		},{
			onSuccess: (data) => {
				setSuggestedElements((prev) => ({
					...prev,
					[ElementType.belief]: data || [],
				}));
				setSelectedElements((prev) => ({
				...prev,
				[ElementType.belief]: [],
				}));
				setActiveStep(ElementType.belief);
				setActiveSubType("selection");
				setNextLoading(false);
			},
		});
	};

	return (
		<div className="border rounded-lg p-3 bg-white">
			<StepHeader currentStep={steps.find((step) => step.type === ElementType.disputation && step.subType === "evidence")} />
			<div className="w-full space-y-2">
				<textarea
					className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
					rows={5}
					placeholder="根拠を入力してください"
					value={adversityText || ""}
					onChange={(e) => setAdversityText(e.target.value)}
				/>
			</div>
			<div className="border-t border-gray-200 my-3" />
			<div>
				<h4 className="text-sm font-medium text-black mb-2">入力候補</h4>
				<div className="space-y-2">
					{suggestedElements[ElementType.disputation].length === 0 ? (
						<div className="text-gray-500 text-sm p-3 bg-gray-50 rounded-lg">
							入力候補はありません
						</div>
					) : (
						suggestedElements[ElementType.disputation].map((element) => (
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
				activeStep={ElementType.disputation}
				activeSubType="evidence"
				handlePrev={handlePrev}
				handleNext={handleNext}
				nextLoading={nextLoading}
				prevDisabled={false}
				nextDisabled={adversityText?.length === 0 || adversityText === null}
			/>
		</div>
	);
};
