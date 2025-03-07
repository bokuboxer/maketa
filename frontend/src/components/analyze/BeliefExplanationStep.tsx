import { ElementType } from "@/api/model/elementType";
import { GroupedElements, StepConfig } from "./types";
import { StepHeader } from "./StepHeader";
import { NavigationButtons } from "./NavigationButtons";
import { Element } from "@/api/model/element";
import { useSuggestElementsElementsSuggestPost } from "@/api/generated/default/default";
export interface BeliefExplanationComponentProps {
	selectedElements: GroupedElements;
	suggestedElements: GroupedElements;
	steps: StepConfig[];
	beliefSelectedElement: Element | null;
	beliefExplanationText: string | null;
	nextLoading: boolean;
	setBeliefExplanationText: React.Dispatch<React.SetStateAction<string | null>>;
	setSuggestedElements: React.Dispatch<React.SetStateAction<GroupedElements>>;
	setActiveStep: React.Dispatch<React.SetStateAction<ElementType>>;
	setNextLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const BeliefExplanationStep = ({
	selectedElements,
	suggestedElements,
	steps,
	beliefSelectedElement,
	beliefExplanationText,
	setBeliefExplanationText,
	setSuggestedElements,
	setActiveStep,
	setNextLoading,
	nextLoading,
}: BeliefExplanationComponentProps) => {
	const { mutate: suggestElements } = useSuggestElementsElementsSuggestPost();
	const currentStep = steps.find(
		(step) =>
			step.type === ElementType.belief_explanation,
	);

	const handleSuggestionClick = (suggestionText: string, elementId: number) => {
		if (beliefExplanationText) {
			const newText = beliefExplanationText + "\n" + suggestionText;
			setBeliefExplanationText(newText);
		} else {
			setBeliefExplanationText(suggestionText);
		}
	};

	const handlePrev = () => {
		setActiveStep(ElementType.belief_selection);
	};

	const handleNext = () => {
		let currentElements = selectedElements[ElementType.belief_selection];
		suggestElements({
			data: {
				type: ElementType.belief_explanation,
				text: "",
				elements: currentElements,
			},
		},{
			onSuccess: (data) => {
				setSuggestedElements((prev) => ({
					...prev,
					[ElementType.belief_explanation]: data || [],
				}));
				setNextLoading(false);
				setActiveStep(ElementType.belief_explanation);
			},
		});
	};

	return (
		<div className="border rounded-lg p-3 bg-white">
			<StepHeader currentStep={currentStep} />
			<div className="mt-4">
				<div className="space-y-2">
					<div className="bg-black text-white p-3 rounded-lg">
						<p className="font-medium">{beliefSelectedElement?.description}</p>
					</div>
					<div className="w-full space-y-2">
						<textarea
							className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
							rows={5}
							placeholder="この原因について詳しく説明してください"
							value={beliefExplanationText || ""}
							onChange={(e) => setBeliefExplanationText(e.target.value)}
						/>
					</div>
				</div>	
			</div>
			<div className="border-t border-gray-200 my-4" />
			<div>
				<h4 className="text-sm font-medium text-black mb-2">説明の候補</h4>
				<div className="space-y-2">
					{suggestedElements["belief_explanation"].map((element) => (
						<button
							key={element.id}
							onClick={() =>
								handleSuggestionClick(
									element.description,
									selectedElements.belief_explanation[0]?.id,
								)
							}
							className="w-full text-left bg-gray-50 p-3 rounded-lg text-sm hover:bg-gray-100 transition-colors"
						>
							{element.description}
						</button>
					))}
				</div>
			</div>
			<NavigationButtons
				activeStep={ElementType.belief_explanation}
				handlePrev={handlePrev}
				handleNext={handleNext}
				nextLoading={nextLoading}
				prevDisabled={nextLoading}
				nextDisabled={beliefExplanationText === null}
			/>
		</div>
	);
};
