"use client";

import {
	useGetFailureByIdFailureFailureIdGet,
	useSuggestElementsElementsSuggestPost,
	useBulkCreateElementsElementsPost,
	useConcludeFailureFailuresConcludePut,
} from "@/api/generated/default/default";
import { Element } from "@/api/model/element";
import { ElementType } from "@/api/model/elementType";
import type { Failure } from "@/api/model/failure";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import HypnoticLoader from "@/components/HypnoticLoader";
import {
	GroupedElements,
	StepperComponent,
	PreviousStepSummary,
	BeliefExplanationStep,
	AdversityStep,
	DisputeEvidenceStep,
	steps,
	BeliefSelectionStep,
} from "@/components/analyze";
import { IconArrowLeft } from "@tabler/icons-react";
import { DisputeCounterStep } from "@/components/analyze/DisputeCounterStep";

interface PageParams {
	id: string;
}

// Main component
export default function AnalyzePage({
	params,
}: { params: Promise<PageParams> }) {
	const resolvedParams = use(params);

	const { data: failure, isLoading: isFailureLoading } =
		useGetFailureByIdFailureFailureIdGet(Number(resolvedParams.id)) as {
			data: Failure | undefined;
			isLoading: boolean;
		};
	const { mutateAsync: suggestElements } =
		useSuggestElementsElementsSuggestPost();
	const { mutateAsync: createElements } = useBulkCreateElementsElementsPost();
	const { mutateAsync: concludeFailure } =
		useConcludeFailureFailuresConcludePut();
	
	const [loading, setLoading] = useState(true);
	const [activeStep, setActiveStep] = useState<ElementType>(steps[0].type);
	const [summarizedText, setSummarizedText] = useState<string>("");
	const [selectedElements, setSelectedElements] = useState<GroupedElements>({
		adversity: [],
		belief_selection: [],
		belief_explanation: [],
		dispute_evidence: [],
		dispute_counter: [],
	});
	const [suggestedElements, setSuggestedElements] = useState<GroupedElements>({
		adversity: [],
		belief_selection: [],
		belief_explanation: [],
		dispute_evidence: [],
		dispute_counter: [],
	});
	const [adversityText, setAdversityText] = useState<string | null>(null);
	const [beliefSelectedElement, setBeliefSelectedElement] = useState<Element | null>(null);
	const [beliefExplanationText, setBeliefExplanationText] = useState<string | null>(null);
	const [disputeEvidenceText, setDisputeEvidenceText] = useState<string | null>(null);
	const [disputeCounterText, setDisputeCounterText] = useState<string | null>(null);

	const router = useRouter();
	const [nextLoading, setNextLoading] = useState(false);

	const fetchSuggestElements = async (
		element_type: ElementType,
		text: string,
	) => {
		console.log("activeStep", activeStep);
		console.log("[fetchSuggestElements] Start", {
			element_type,
			text,
			adversity: element_type === ElementType.belief_selection ? adversityText : null,
			selectedElements,
		});
		const data = await suggestElements({
			data: {
				type: element_type,
				text: text,
				adversity: element_type === ElementType.adversity ? adversityText : null,
			},
		});
		console.log("[fetchSuggestElements] Response data:", data);
		setSuggestedElements((prev) => ({
			...prev,
			[element_type]: data || [],
		}));
		setSelectedElements((prev) => ({
			...prev,
			[element_type]: [],
		}));
		setLoading(false);
	};

	useEffect(() => {
		if (failure?.description) {
			console.log("[Initial Adversity] Starting with description:", failure.description);
			fetchSuggestElements(ElementType.adversity, failure?.description);
		}
	}, [failure?.description]);

	useEffect(() => {
		if (activeStep === ElementType.belief_selection) {
			const elements = selectedElements[ElementType.adversity];
			console.log("[Belief Selection Step] Current state:", {
				activeStep,
				selectedAdversityElements: elements,
				adversityText,
			});
		}
	}, [activeStep, selectedElements[ElementType.adversity]]);



	// const handleSave = () => {
	// 	if (!failure?.id) {
	// 		return;
	// 	}
	// 	setNextLoading(true);
	// 	createElements(
	// 		{
	// 			data: {
	// 				failure_id: failure.id,
	// 				elements: Object.values(selectedElements).flatMap(
	// 					(elements) => elements,
	// 				),
	// 			},
	// 		},
	// 		{
	// 			onSuccess: () => {
	// 				setNextLoading(false);
	// 				router.push(`/failures/${failure.id}`);
	// 			},
	// 		},
	// 	);
	// };

	if (isFailureLoading || loading) {
		return (
			<div className="min-h-screen bg-white flex items-center justify-center">
				<HypnoticLoader
					size={250}
					color="black"
					secondaryColor="gray"
					text="分析の時間へ"
					isLoading={isFailureLoading || loading}
					ringCount={5}
				/>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-white">
			<div className="container mx-auto px-4 py-8">
				<div className="flex items-center mb-4">
					<button
						onClick={() => router.back()}
						className="text-black hover:text-gray-600 mr-4 p-2 rounded-full hover:bg-gray-100"
					>
						<IconArrowLeft size={20} />
					</button>
					<h1 className="text-2xl font-bold text-black">詳細分析</h1>
				</div>
				<PreviousStepSummary
					activeStep={activeStep}
					failure={failure}
					adversityText={adversityText}
					beliefSelectedElement={beliefSelectedElement?.description || ""}
					beliefExplanationText={beliefExplanationText}
					disputeEvidenceText={disputeEvidenceText}
					selectedElements={selectedElements}
					summarizedText={summarizedText}
					steps={steps}
				/>
				<StepperComponent
					activeStep={activeStep}
					steps={steps}
				/>
				<div className="space-y-4">
					<div key={`${activeStep}`}>
						{activeStep === ElementType.adversity ?
							 (
								<AdversityStep
								steps={steps}
								failure={failure}
								selectedElements={selectedElements}
								suggestedElements={suggestedElements}
								nextLoading={nextLoading}
								setSelectedElements={setSelectedElements}
								setSuggestedElements={setSuggestedElements}
								setActiveStep={setActiveStep}
								setNextLoading={setNextLoading}
								adversityText={adversityText}
								setAdversityText={setAdversityText}
							/>
						) : activeStep === ElementType.belief_selection ?
						(
							<BeliefSelectionStep
								failure={failure}
								adversityText={adversityText}
								steps={steps}
								activeStep={activeStep}
								nextLoading={nextLoading}
								setActiveStep={setActiveStep}
								selectedElements={selectedElements}
								suggestedElements={suggestedElements}
								setSuggestedElements={setSuggestedElements}
								setNextLoading={setNextLoading}
								beliefSelectedElement={beliefSelectedElement}
								setBeliefSelectedElement={setBeliefSelectedElement}
							/>
						) : activeStep === ElementType.belief_explanation ?
						(
							<BeliefExplanationStep
								failure={failure}
								adversityText={adversityText}
								selectedElements={selectedElements}
								suggestedElements={suggestedElements}
								steps={steps}
								beliefSelectedElement={beliefSelectedElement?.description || ""}
								beliefExplanationText={beliefExplanationText}
								setActiveStep={setActiveStep}
								setBeliefExplanationText={setBeliefExplanationText}
								setNextLoading={setNextLoading}
								nextLoading={nextLoading}
								setSuggestedElements={setSuggestedElements}
							/>
						) : activeStep === ElementType.dispute_evidence ?
						(
							<DisputeEvidenceStep
								steps={steps}
								failure={failure}
								adversityText={adversityText}
								beliefSelectedElement={beliefSelectedElement?.description || ""}
								beliefExplanationText={beliefExplanationText}
								selectedElements={selectedElements}
								suggestedElements={suggestedElements}
								setSelectedElements={setSelectedElements}
								setSuggestedElements={setSuggestedElements}
								setActiveStep={setActiveStep}
								setNextLoading={setNextLoading}
								disputeEvidenceText={disputeEvidenceText}
								setDisputeEvidenceText={setDisputeEvidenceText}
								nextLoading={nextLoading}
							/>
						) : activeStep === ElementType.dispute_counter ?
						(
							<DisputeCounterStep
								failure={failure}
								adversityText={adversityText}
								beliefSelectedElement={beliefSelectedElement?.description || ""}
								beliefExplanationText={beliefExplanationText}
								disputeEvidenceText={disputeEvidenceText}
								steps={steps}
								selectedElements={selectedElements}
								suggestedElements={suggestedElements}
								setSelectedElements={setSelectedElements}
								setSuggestedElements={setSuggestedElements}
								disputeCounterText={disputeCounterText}
								setDisputeCounterText={setDisputeCounterText}
								nextLoading={nextLoading}
								setActiveStep={setActiveStep}
								setNextLoading={setNextLoading}
							/>
						) : null
						}
					</div>
				</div>
			</div>
		</div>
	);
}
