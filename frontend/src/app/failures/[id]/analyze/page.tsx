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
		elements: Element[],
	) => {
		const data = await suggestElements({
			data: {
				type: element_type,
				text: text,
				elements: elements,
			},
		});
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

	const fetchSummary = async (
		elementType: ElementType,
		elements: Element[],
	) => {
		const data = await suggestElements({
			data: {
				type: elementType,
				text: "",
				elements: elements,
			},
		});
		if (typeof data === "string") {
			setSummarizedText(data);
		}
	};

	useEffect(() => {
		if (failure?.description) {
			fetchSuggestElements(ElementType.adversity, failure?.description, []);
		}
	}, [failure?.description]);

	useEffect(() => {
		if (activeStep === ElementType.belief_selection) {
			const elements = selectedElements[ElementType.adversity];
			if (elements.length > 0) {
				fetchSummary(ElementType.adversity, elements);
			}
		}
	}, [activeStep, selectedElements[ElementType.adversity]]);

	const handleNext = async () => {
		const currentStep = steps.find(
			(step) =>
				step.type === activeStep,
		);
		const currentIndex = steps.indexOf(currentStep!);

		if (currentIndex < steps.length - 1) {
			if (activeStep === ElementType.adversity) {
			} else if (
				activeStep === ElementType.belief_selection
			) {
				
			} else if (
				activeStep === ElementType.belief_explanation
			) {
				
			} else if (
				activeStep === ElementType.dispute_evidence
			) {
				let currentElements = selectedElements[ElementType.dispute_evidence];
				const data = await suggestElements({
					data: {
						type: ElementType.dispute_evidence,
						text: "",
						elements: currentElements,
					},
				});
				setSuggestedElements((prev) => ({
					...prev,
					[ElementType.dispute_evidence]: data || [],
				}));
				setSelectedElements((prev) => ({
					...prev,
					[ElementType.dispute_evidence]: [],
				}));
				setNextLoading(false);
			}

			setNextLoading(false);
		}
	};

	const handleSave = () => {
		if (!failure?.id) {
			return;
		}
		setNextLoading(true);
		createElements(
			{
				data: {
					failure_id: failure.id,
					elements: Object.values(selectedElements).flatMap(
						(elements) => elements,
					),
				},
			},
			{
				onSuccess: () => {
					setNextLoading(false);
					router.push(`/failures/${failure.id}`);
				},
			},
		);
	};

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
							selectedElements={selectedElements}
							suggestedElements={suggestedElements}
							steps={steps}
							beliefSelectedElement={beliefSelectedElement}
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
