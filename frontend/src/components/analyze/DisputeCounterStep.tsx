import { ElementType } from "@/api/model/elementType";
import { GroupedElements, StepConfig } from "./types";
import { StepHeader } from "./StepHeader";
import { Failure } from "@/api/model";
import { NavigationButtons } from "./NavigationButtons";
import { useConcludeFailureFailuresConcludePut } from "@/api/generated/default/default";
import { useRouter } from "next/navigation";

type StandardStepComponentProps = {
	suggestedElements: GroupedElements;
	steps: StepConfig[];
	failure: Failure | undefined;
	adversityText: string | null;
	beliefSelectedElement: string | null;
	beliefExplanationText: string | null;
	disputeEvidenceText: string | null;
	nextLoading: boolean;
	setActiveStep: React.Dispatch<React.SetStateAction<ElementType>>;
	setNextLoading: React.Dispatch<React.SetStateAction<boolean>>;
	disputeCounterText: string | null;
	setDisputeCounterText: React.Dispatch<React.SetStateAction<string | null>>;
};

export const DisputeCounterStep = ({
	suggestedElements,
	steps,
	nextLoading,
	failure,
	adversityText,
	beliefSelectedElement,
	beliefExplanationText,
	disputeEvidenceText,
	setActiveStep,
	setNextLoading,
	disputeCounterText,
	setDisputeCounterText,
}: StandardStepComponentProps) => {
	const router = useRouter();
	const { mutate: concludeFailure } = useConcludeFailureFailuresConcludePut();
	const handleSuggestionClick = (suggestionText: string) => {
		if (disputeCounterText) {
			const newText = disputeCounterText + "\n" + suggestionText;
			setDisputeCounterText(newText);
		} else {
			setDisputeCounterText(suggestionText);
		}
	};

	const handlePrev = () => {
		setActiveStep(ElementType.dispute_evidence);
	};
	const handleNext = async () => {
		if (!failure?.id) return;
		if (!disputeCounterText) return;
		setNextLoading(true);
		concludeFailure(
			{
				data: {
					failure_id: failure?.id,
					selected_label: beliefSelectedElement ?? "",
					adversity: adversityText ?? "",
					belief_explanation: beliefExplanationText ?? "",
					dispute_evidence: disputeEvidenceText ?? "",
					dispute_counter: disputeCounterText ?? "",
				},
			},
			{
				onSuccess: () => {
					router.push(`/failures/${failure?.id}`);
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
					(step) => step.type === ElementType.dispute_counter,
				)}
			/>
			<div className="w-full space-y-2">
				<textarea
					className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
					rows={5}
					placeholder="入力例：〜という原因は、〜という点で不十分であり、〜という点が見落とされている"
					value={disputeCounterText || ""}
					onChange={(e) => setDisputeCounterText(e.target.value)}
				/>
			</div>
			<div className="border-t border-gray-200 my-3" />
			<div>
				<h4 className="text-sm font-medium text-black mb-2">入力候補</h4>
				<div className="space-y-2">
					{suggestedElements[ElementType.dispute_counter].length === 0 ? (
						<div className="text-gray-500 text-sm p-3 bg-gray-50 rounded-lg">
							入力候補はありません
						</div>
					) : (
						suggestedElements[ElementType.dispute_counter].map((element) => (
							<button
								key={element.id}
								onClick={() => handleSuggestionClick(element.description)}
								className="p-3 py-2 mr-2 rounded-lg text-left bg-gray-200 hover:bg-gray-100 text-xs"
							>
								+ {element.description}
							</button>
						))
					)}
				</div>
			</div>
			<NavigationButtons
				handlePrev={handlePrev}
				handleNext={handleNext}
				prevDisabled={nextLoading}
				nextDisabled={
					disputeCounterText?.length === 0 || disputeCounterText === null || nextLoading
				}
				isSaveButton
			/>
		</div>
	);
};
