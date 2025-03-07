import { ElementType } from "@/api/model/elementType";
import { GroupedElements, StepConfig } from "./types";
import { StepHeader } from "./StepHeader";
import { NavigationButtons } from "./NavigationButtons";
import { useSuggestElementsElementsSuggestPost } from "@/api/generated/default/default";
import { Failure } from "@/api/model/failure";
import { Element } from "@/api/model/element";
type BeliefSelectionComponentProps = {
	failure: Failure | undefined;
	steps: StepConfig[];
	activeStep: ElementType;
	selectedElements: GroupedElements;
	suggestedElements: GroupedElements;
	nextLoading: boolean;
	setSuggestedElements: React.Dispatch<React.SetStateAction<GroupedElements>>;
	setActiveStep: React.Dispatch<React.SetStateAction<ElementType>>;
	setNextLoading: React.Dispatch<React.SetStateAction<boolean>>;
	beliefSelectedElement: Element | null;
	setBeliefSelectedElement: React.Dispatch<React.SetStateAction<Element | null>>;
}

export const BeliefSelectionStep = ({
	failure,
	activeStep,
	steps,
	nextLoading,
	suggestedElements,
	selectedElements,
	setSuggestedElements,
	setActiveStep,
	setNextLoading,
	beliefSelectedElement,
	setBeliefSelectedElement,
}: BeliefSelectionComponentProps) => {
	const displayElements = [...suggestedElements[activeStep]];
	const midPoint = Math.ceil(displayElements.length / 2);
	const firstColumn = displayElements.slice(0, midPoint);
	const secondColumn = displayElements.slice(midPoint);
	const { mutate: suggestElements } = useSuggestElementsElementsSuggestPost();

	const handleBeliefSelect = (element: any) => {
		setBeliefSelectedElement((prev) => prev == element ? null : element);
	};
	const handlePrev = () => {
		setActiveStep(ElementType.adversity);
	};

	const handleNext = () => {
		if (beliefSelectedElement === null) return;

		const requestData = {
			type: ElementType.belief_selection,
			text: failure?.description || "",
			elements: [],
			selected_label: {
				id: beliefSelectedElement.id,
				description: beliefSelectedElement.description,
				type: "internal" as const,
				explanation: null,
			},
		};
		// B-1からB-2への遷移時
		setNextLoading(true);
		suggestElements({
			data: requestData,
		}, {
			onSuccess: (data) => {
				setSuggestedElements((prev) => ({
					...prev,
					"belief_explanation": data || [],
				}));
				setNextLoading(false);
			},
		});
	};

	return (
		<div className="border rounded-lg p-3 bg-white">
			<StepHeader currentStep={steps.find((step) => step.type === ElementType.belief_selection)} />
			<div className="grid grid-cols-2 gap-3">
				<div className="space-y-2">
					{firstColumn.map((element) => {
						const isSelected = selectedElements[activeStep].some(
							(selected) => selected.id === element.id,
						);
						return (
							<button
								key={element.id}
								onClick={() => handleBeliefSelect(element)}
								className={`w-full p-3 rounded-lg text-left transition-all text-xs ${
									isSelected
										? "bg-black text-white"
										: "bg-gray-50 hover:bg-gray-100 text-black"
								}`}
							>
								<p className="font-medium">{element.description}</p>
							</button>
						);
					})}
				</div>
				<div className="space-y-2">
					{secondColumn.map((element) => {
						const isSelected = beliefSelectedElement?.id === element.id;
						return (
							<button
								key={element.id}
								onClick={() => handleBeliefSelect(element)}
								className={`w-full p-3 rounded-lg text-left transition-all text-xs ${
									isSelected
										? "bg-black text-white"
										: "bg-gray-50 hover:bg-gray-100 text-black"
								}`}
							>
								<p className="font-medium">{element.description}</p>
							</button>
						);
					})}
				</div>
			</div>
			<NavigationButtons
				activeStep={ElementType.belief_selection}
				handlePrev={handlePrev}
				handleNext={handleNext}
				nextLoading={nextLoading}
				prevDisabled={nextLoading}
				nextDisabled={beliefSelectedElement === null}
			/>
		</div>
	);
};