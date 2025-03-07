import { ElementType } from "@/api/model/elementType";
import { GroupedElements, StepConfig } from "./types";
import { StepHeader } from "./StepHeader";
import { NavigationButtons } from "./NavigationButtons";
import { useSuggestElementsElementsSuggestPost } from "@/api/generated/default/default";
import { Failure } from "@/api/model/failure";
import { Element } from "@/api/model/element";
type BeliefSelectionComponentProps = {
	failure: Failure | undefined;
	adversityText: string | null;
	steps: StepConfig[];
	activeStep: ElementType;
	suggestedElements: GroupedElements;
	nextLoading: boolean;
	setSuggestedElements: React.Dispatch<React.SetStateAction<GroupedElements>>;
	setActiveStep: React.Dispatch<React.SetStateAction<ElementType>>;
	setNextLoading: React.Dispatch<React.SetStateAction<boolean>>;
	beliefSelectedElement: Element | null;
	setBeliefSelectedElement: React.Dispatch<
		React.SetStateAction<Element | null>
	>;
};

export const BeliefSelectionStep = ({
	failure,
	activeStep,
	steps,
	nextLoading,
	suggestedElements,
	adversityText,
	setSuggestedElements,
	setActiveStep,
	setNextLoading,
	beliefSelectedElement,
	setBeliefSelectedElement,
}: BeliefSelectionComponentProps) => {
	const displayElements = [...suggestedElements[activeStep]];
	const { mutate: suggestElements } = useSuggestElementsElementsSuggestPost();

	const handleBeliefSelect = (element: any) => {
		setBeliefSelectedElement((prev) => (prev == element ? null : element));
	};
	const handlePrev = () => {
		setActiveStep(ElementType.adversity);
	};

	const handleNext = () => {
		if (beliefSelectedElement === null) return;
		const requestData = {
			type: ElementType.belief_explanation,
			text: failure?.description || "",
			adversity: adversityText,
			elements: [],
			selected_label: beliefSelectedElement?.description || "",
		};

		setNextLoading(true);
		suggestElements(
			{
				data: requestData,
			},
			{
				onSuccess: (data) => {
					console.log("data", data);
					setSuggestedElements((prev) => ({
						...prev,
						belief_explanation: data || [],
					}));
					setActiveStep(ElementType.belief_explanation);
					console.log("suggestedElements", suggestedElements);
					setNextLoading(false);
				},
			},
		);
	};

	return (
		<div className="border rounded-lg p-3 bg-white">
			<StepHeader
				currentStep={steps.find(
					(step) => step.type === ElementType.belief_selection,
				)}
			/>
			<div className="grid grid-cols-2 gap-3">
				{displayElements.map((element) => {
					const isSelected = beliefSelectedElement?.id === element.id;
					return (
						<button
							key={element.id}
							onClick={() => handleBeliefSelect(element)}
							className={`w-full p-3 py-2 rounded-lg text-left transition-all text-xs ${
								isSelected
									? "bg-black text-white"
									: "bg-gray-200 hover:bg-gray-100 text-black"
							}`}
						>
							<p className="font-medium">{element.description}</p>
						</button>
					);
				})}
			</div>
			<NavigationButtons
				handlePrev={handlePrev}
				handleNext={handleNext}
				prevDisabled={nextLoading}
				nextDisabled={beliefSelectedElement === null || nextLoading}
			/>
		</div>
	);
};
