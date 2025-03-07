"use client";

import {
	useGetFailureByIdFailureFailureIdGet,
	useSuggestElementsElementsSuggestPost,
} from "@/api/generated/default/default";
import { Element } from "@/api/model/element";
import { ElementType } from "@/api/model/elementType";
import type { Failure } from "@/api/model/failure";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import HypnoticLoader from "@/components/HypnoticLoader";
import {
	GroupedElements,
	PreviousStepSummary,
	BeliefExplanationStep,
	AdversityStep,
	DisputeEvidenceStep,
	steps,
	BeliefSelectionStep,
	Stepper,
} from "@/components/analyze";
import { IconArrowLeft } from "@tabler/icons-react";
import { DisputeCounterStep } from "@/components/analyze/DisputeCounterStep";
import { LoadingModal } from "@/components/analyze/LoadingModal";

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

	const [loading, setLoading] = useState(true);
	const [activeStep, setActiveStep] = useState<ElementType>(steps[0].type);
	const [suggestedElements, setSuggestedElements] = useState<GroupedElements>({
		adversity: [],
		belief_selection: [],
		belief_explanation: [],
		dispute_evidence: [],
		dispute_counter: [],
	});
	const [adversityText, setAdversityText] = useState<string | null>(null);
	const [beliefSelectedElement, setBeliefSelectedElement] =
		useState<Element | null>(null);
	const [beliefExplanationText, setBeliefExplanationText] = useState<
		string | null
	>(null);
	const [disputeEvidenceText, setDisputeEvidenceText] = useState<string | null>(
		null,
	);
	const [disputeCounterText, setDisputeCounterText] = useState<string | null>(
		null,
	);

	const router = useRouter();
	const [nextLoading, setNextLoading] = useState(false);

	const fetchSuggestElements = async (
		element_type: ElementType,
		text: string,
	) => {
		const data = await suggestElements({
			data: {
				type: element_type,
				text: text,
				adversity:
					element_type === ElementType.adversity ? adversityText : null,
			},
		});
		setSuggestedElements((prev) => ({
			...prev,
			[element_type]: data || [],
		}));
		setLoading(false);
	};

	useEffect(() => {
		if (failure?.description) {
			fetchSuggestElements(ElementType.adversity, failure?.description);
		}
	}, [failure?.description]);

	if (isFailureLoading || loading) {
		return (
			<div className="min-h-screen bg-white flex items-center justify-center">
				<HypnoticLoader
					size={250}
					text="分析の時間へ"
					isLoading={isFailureLoading || loading}
					ringCount={5}
				/>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-white">
			{nextLoading && <LoadingModal />}
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
					steps={steps}
				/>
				<Stepper activeStep={activeStep} />
				<div className="space-y-4">
					<div key={`${activeStep}`}>
						{activeStep === ElementType.adversity ? (
							<AdversityStep
								steps={steps}
								failure={failure}
								suggestedElements={suggestedElements}
								nextLoading={nextLoading}
								setSuggestedElements={setSuggestedElements}
								setActiveStep={setActiveStep}
								setNextLoading={setNextLoading}
								adversityText={adversityText}
								setAdversityText={setAdversityText}
							/>
						) : activeStep === ElementType.belief_selection ? (
							<BeliefSelectionStep
								failure={failure}
								adversityText={adversityText}
								steps={steps}
								activeStep={activeStep}
								nextLoading={nextLoading}
								setActiveStep={setActiveStep}
								suggestedElements={suggestedElements}
								setSuggestedElements={setSuggestedElements}
								setNextLoading={setNextLoading}
								beliefSelectedElement={beliefSelectedElement}
								setBeliefSelectedElement={setBeliefSelectedElement}
							/>
						) : activeStep === ElementType.belief_explanation ? (
							<BeliefExplanationStep
								failure={failure}
								adversityText={adversityText}
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
						) : activeStep === ElementType.dispute_evidence ? (
							<DisputeEvidenceStep
								steps={steps}
								failure={failure}
								adversityText={adversityText}
								beliefSelectedElement={beliefSelectedElement?.description || ""}
								beliefExplanationText={beliefExplanationText}
								suggestedElements={suggestedElements}
								setSuggestedElements={setSuggestedElements}
								setActiveStep={setActiveStep}
								setNextLoading={setNextLoading}
								disputeEvidenceText={disputeEvidenceText}
								setDisputeEvidenceText={setDisputeEvidenceText}
								nextLoading={nextLoading}
							/>
						) : activeStep === ElementType.dispute_counter ? (
							<DisputeCounterStep
								failure={failure}
								adversityText={adversityText}
								beliefSelectedElement={beliefSelectedElement?.description || ""}
								beliefExplanationText={beliefExplanationText}
								disputeEvidenceText={disputeEvidenceText}
								steps={steps}
								suggestedElements={suggestedElements}
								disputeCounterText={disputeCounterText}
								setDisputeCounterText={setDisputeCounterText}
								nextLoading={nextLoading}
								setActiveStep={setActiveStep}
								setNextLoading={setNextLoading}
							/>
						) : null}
					</div>
				</div>
			</div>
		</div>
	);
}
