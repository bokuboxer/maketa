import { ElementType } from "@/api/model/elementType";
import { GroupedElements, StepConfig } from "./types";
import { StepHeader } from "./StepHeader";
import { NavigationButtons } from "./NavigationButtons";
import { Element } from "@/api/model/element";
import { useSuggestElementsElementsSuggestPost } from "@/api/generated/default/default";
import { Failure } from "@/api/model";
export interface BeliefExplanationComponentProps {
	suggestedElements: GroupedElements;
	steps: StepConfig[];
	failure: Failure | undefined;
	adversityText: string | null;
	beliefSelectedElement: string | null;
	beliefExplanationText: string | null;
	nextLoading: boolean;
	setBeliefExplanationText: React.Dispatch<React.SetStateAction<string | null>>;
	setSuggestedElements: React.Dispatch<React.SetStateAction<GroupedElements>>;
	setActiveStep: React.Dispatch<React.SetStateAction<ElementType>>;
	setNextLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const BeliefExplanationStep = ({
	failure,
	adversityText,
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
		(step) => step.type === ElementType.belief_explanation,
	);

	const handleSuggestionClick = (suggestionText: string) => {
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
		if (!beliefExplanationText) return;
		setNextLoading(true);
		suggestElements(
			{
				data: {
					type: ElementType.dispute_evidence,
					text: failure?.description || "",
					adversity: adversityText,
					selected_label: beliefSelectedElement || "",
					belief_explanation: beliefExplanationText || "",
				},
			},
			{
				onSuccess: (data) => {
					setSuggestedElements((prev) => ({
						...prev,
						[ElementType.dispute_evidence]: data || [],
					}));
					setNextLoading(false);
					setActiveStep(ElementType.dispute_evidence);
				},
				onError: () => {
					setNextLoading(false);
				}
			},	
		);
	};

	return (
		<div className="border rounded-lg p-3 bg-white">
			<StepHeader currentStep={currentStep} />
			<div className="mt-4">
				<div className="space-y-2">
					<div className="bg-black text-white p-3 rounded-lg">
						<p className="font-medium text-sm">{beliefSelectedElement}</p>
					</div>
					<div className="w-full space">
						<textarea
							className="w-full p-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
							rows={5}
							placeholder="この原因について詳しく説明してください"
							value={beliefExplanationText || ""}
							onChange={(e) => setBeliefExplanationText(e.target.value)}
						/>
					</div>
				</div>
			</div>
			<div className="border-t border-gray-200 my-2" />
			<div>
				<h4 className="text-sm font-medium text-black mb-2">説明の候補</h4>
				<div className="space-y-2">
					{suggestedElements["belief_explanation"].map((element) => (
						<button
							key={element.id}
							onClick={() => handleSuggestionClick(element.description)}
							className="text-left bg-gray-200 p-3 py-2 mr-2 rounded-lg text-xs hover:bg-gray-100 transition-colors"
						>
							+ {element.description}
						</button>
					))}
				</div>
			</div>
			<NavigationButtons
				handlePrev={handlePrev}
				handleNext={handleNext}
				prevDisabled={nextLoading}
				nextDisabled={beliefExplanationText === null || nextLoading}
			/>
		</div>
	);
};
