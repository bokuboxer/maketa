import { ElementType } from "@/api/model/elementType";
import { GroupedElements, StepConfig } from "./types";
import { StepHeader } from "./StepHeader";
import { NavigationButtons } from "./NavigationButtons";
import { useSuggestElementsElementsSuggestPost } from "@/api/generated/default/default";
import { Failure } from "@/api/model/failure";
import { Element } from "@/api/model/element";
import { useState } from "react";

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
	const [label, setLabel] = useState("");
	const { mutate: suggestElements } = useSuggestElementsElementsSuggestPost();

	const handleAddBelief = () => {
		const newElement: Element = {
			id: 0,
			description: label,
			type: ElementType.belief_selection,
			created_at: new Date().toISOString(),
			failure_id: failure?.id || 0
		};
		setSuggestedElements((prev) => ({
			...prev,
			belief_selection: [...prev.belief_selection, newElement]
		}));
		setLabel("");  // 入力フィールドをクリア
	};

	const handleBeliefSelect = (element: Element) => {
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
					setSuggestedElements((prev) => ({
						...prev,
						belief_explanation: data || [],
					}));
					setActiveStep(ElementType.belief_explanation);
					setNextLoading(false);
				},
				onError: () => {
					setNextLoading(false);
				}
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
					const isSelected = beliefSelectedElement?.description === element.description;
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
			<div className="flex justify-center items-center gap-2 mt-4">
				<input 
					id="inputLabel" 
					type="text" 
					value={label} 
					onChange={(e) => setLabel(e.target.value)} 
					placeholder="新しい原因を入力"
					className="flex-1 border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
				/>
				<button
					onClick={handleAddBelief}
					disabled={!label.trim()}
					className="px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
				>
					追加
				</button>
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
