import { ElementType } from "@/api/model/elementType";
import { GroupedElements, StepConfig } from "./types";
import { StepHeader } from "./StepHeader";
import { Failure } from "@/api/model";
import { NavigationButtons } from "./NavigationButtons";
import { useSuggestElementsElementsSuggestPost } from "@/api/generated/default/default";

type StandardStepComponentProps = {
	suggestedElements: GroupedElements;
	steps: StepConfig[];
	failure: Failure | undefined;
	nextLoading: boolean;
	setSuggestedElements: React.Dispatch<React.SetStateAction<GroupedElements>>;
	setActiveStep: React.Dispatch<React.SetStateAction<ElementType>>;
	setNextLoading: React.Dispatch<React.SetStateAction<boolean>>;
	adversityText: string | null;
	setAdversityText: React.Dispatch<React.SetStateAction<string | null>>;
};

export const AdversityStep = ({
	suggestedElements,
	steps,
	failure,
	nextLoading,
	setSuggestedElements,
	setActiveStep,
	setNextLoading,
	adversityText,
	setAdversityText,
}: StandardStepComponentProps) => {
	const { mutate: suggestElements } = useSuggestElementsElementsSuggestPost();
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
		suggestElements(
			{
				data: {
					type: ElementType.belief_selection,
					text: failure?.description || "",
					adversity: adversityText,
				},
			},
			{
				onSuccess: (data) => {
					console.log("data", data);
					setSuggestedElements((prev) => ({
						...prev,
						[ElementType.belief_selection]: data || [],
					}));
					setActiveStep(ElementType.belief_selection);
					setNextLoading(false);
				},
			},
		);
	};

	return (
		<div className="border rounded-lg p-3 bg-white">
			<StepHeader
				currentStep={steps.find((step) => step.type === ElementType.adversity)}
			/>
			<div className="w-full space-y-2">
				<textarea
					className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
					rows={5}
					placeholder="詳しく説明してください"
					value={adversityText || ""}
					onChange={(e) => setAdversityText(e.target.value)}
				/>
			</div>
			<div className="border-t border-gray-200 my-3" />
			<div>
				<h4 className="text-sm font-medium text-black mb-2">入力候補</h4>
				<div className="space-y-2">
					{suggestedElements[ElementType.adversity].length === 0 ? (
						<div className="text-gray-500 text-sm p-3 bg-gray-50 rounded-lg">
							入力候補はありません
						</div>
					) : (
						suggestedElements[ElementType.adversity].map((element) => (
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
				prevDisabled
				nextDisabled={adversityText?.length === 0 || adversityText === null}
			/>
		</div>
	);
};
