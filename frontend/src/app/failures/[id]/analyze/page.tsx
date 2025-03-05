"use client";

import {
	useGetFailureByIdFailureFailureIdGet,
	useSuggestElementsElementsSuggestPost,
	useBulkCreateElementsElementsPost,
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
	NavigationButtons, 
	BeliefExplanationComponent, 
	StandardStepComponent,
	steps,
} from "@/components/analyze";
import { IconArrowLeft } from "@tabler/icons-react";

interface PageParams {
	id: string;
}

interface BeliefAnalysisResponse {
	belief_analysis?: {
		labels: Element[];
	};
}

// Main component
export default function AnalyzePage({
	params,
}: { params: Promise<PageParams> }) {
	const resolvedParams = use(params);
	const { data: failure, isLoading: isFailureLoading } =
		useGetFailureByIdFailureFailureIdGet(Number(resolvedParams.id)) as { data: Failure | undefined, isLoading: boolean };
	const { mutate: suggestElements } = useSuggestElementsElementsSuggestPost();
	const { mutate: createElements } = useBulkCreateElementsElementsPost();
	const [loading, setLoading] = useState(true);
	const [activeStep, setActiveStep] = useState<ElementType>(ElementType.adversity);
	const [activeSubType, setActiveSubType] = useState<string | null>(null);
	const [summarizedText, setSummarizedText] = useState<string>("");
	const [selectedElements, setSelectedElements] = useState<GroupedElements>({
		adversity: [],
		belief: [],
		disputation: [],
	});
	const [suggestedElements, setSuggestedElements] = useState<GroupedElements>({
		adversity: [],
		belief: [],
		disputation: [],
	});
	const router = useRouter();
	const [nextLoading, setNextLoading] = useState(false);
	const [saveLoading, setSaveLoading] = useState(false);

	const fetchSuggestElements = async (
		element_type: ElementType,
		text: string,
		elements: Element[],
	) => {
		suggestElements(
			{
				data: {
					type: element_type,
					text: text,
					elements: elements,
				},
			},
			{
				onSuccess: (data) => {
					if (data) {
						const elements = data.map((element) => ({
							element,
							isSelected: false,
						}));

						setSuggestedElements((prev) => ({
							...prev,
							[element_type]: elements,
						}));

						setSelectedElements((prev) => ({
							...prev,
							[element_type]: [],
						}));
					}
					setLoading(false);
				},
			},
		);
	};

	const fetchSummary = async (elementType: ElementType, elements: Element[]) => {
		suggestElements(
			{
				data: {
					type: elementType,
					text: "",
					elements: elements,
				},
			},
			{
				onSuccess: (data) => {
					if (typeof data === 'string') {
						setSummarizedText(data);
					}
				},
			},
		);
	};

	useEffect(() => {
		if (failure?.description) {
			fetchSuggestElements(ElementType.adversity, failure?.description, []);
		}
	}, [failure?.description]);

	useEffect(() => {
		if (activeStep === ElementType.belief) {
			const elements = selectedElements[ElementType.adversity];
			if (elements.length > 0) {
				fetchSummary(ElementType.adversity, elements.map(e => e.element));
			}
		}
	}, [activeStep, selectedElements[ElementType.adversity]]);

	const handleNext = async () => {
		const currentStep = steps.find(step => 
			step.type === activeStep && (!step.subType || step.subType === activeSubType)
		);
		const currentIndex = steps.indexOf(currentStep!);
		
		if (currentIndex < steps.length - 1) {
			const nextStep = steps[currentIndex + 1];
			setNextLoading(true);

			if (activeStep === ElementType.adversity) {
				if (!failure?.id) {
					setNextLoading(false);
					return;
				}
				let currentElements = [{
					id: selectedElements[activeStep][0].element.id,
					type: ElementType.adversity,
					description: selectedElements[activeStep][0].element.description,
					failure_id: failure.id,
					created_at: new Date().toISOString(),
				}];
				suggestElements(
					{
						data: {
							type: ElementType.belief,
							text: "",
							elements: currentElements as Element[],
						},
					},
					{
						onSuccess: (data) => {
							if (data) {
								const elements = data.map((element) => ({
									element,
									isSelected: false,
								}));

								setSuggestedElements((prev) => ({
									...prev,
									[ElementType.belief]: elements,
								}));

								setSelectedElements((prev) => ({
									...prev,
									[ElementType.belief]: [],
								}));
							}
							setNextLoading(false);
						},
					},
				);
				setActiveStep(ElementType.belief);
				setActiveSubType('selection');
			} else if (activeStep === ElementType.belief && activeSubType === 'explanation') {
				let currentElements = selectedElements[ElementType.belief].map(
					(element) => element.element
				);
				suggestElements(
					{
						data: {
							type: ElementType.disputation,
							text: "",
							elements: currentElements,
						},
					},
					{
						onSuccess: (data) => {
							if (data) {
								const elements = data.map((element) => ({
									element,
									isSelected: false,
								}));

								setSuggestedElements((prev) => ({
									...prev,
									[ElementType.disputation]: elements,
								}));

								setSelectedElements((prev) => ({
									...prev,
									[ElementType.disputation]: [],
								}));
							}
							setNextLoading(false);
						},
					},
				);
				setActiveStep(ElementType.disputation);
				setActiveSubType('evidence');
			} else if (activeStep === ElementType.disputation && activeSubType === 'evidence') {
				let currentElements = selectedElements[ElementType.disputation].map(
					(element) => element.element
				);
				suggestElements(
					{
						data: {
							type: ElementType.disputation,
							text: "",
							elements: currentElements,
						},
					},
					{
						onSuccess: (data) => {
							if (data) {
								const elements = data.map((element) => ({
									element,
									isSelected: false,
								}));

								setSuggestedElements((prev) => ({
									...prev,
									[ElementType.disputation]: elements,
								}));

								setSelectedElements((prev) => ({
									...prev,
									[ElementType.disputation]: [],
								}));
							}
							setNextLoading(false);
						},
					},
				);
				setActiveSubType('counter');
			}
			
			setNextLoading(false);
		}
	};

	const handlePrev = () => {
		const currentStep = steps.find(step => 
			step.type === activeStep && (!step.subType || step.subType === activeSubType)
		);
		const currentIndex = steps.indexOf(currentStep!);

		if (activeStep === ElementType.belief && activeSubType === 'explanation') {
			setActiveSubType('selection');
		} else if (currentIndex > 0) {
			const prevStep = steps[currentIndex - 1];
			setActiveStep(prevStep.type);
			setActiveSubType(prevStep.subType || null);
		}
	};

	const handleSave = () => {
		if (!failure?.id) {
			return;
		}
		setSaveLoading(true);
		createElements({
			data: {
				failure_id: failure.id,
				elements: Object.values(selectedElements)
					.flatMap((elements) => elements.map((element) => element.element))
			}
		}, {
			onSuccess: () => {
				setSaveLoading(false);
				router.push(`/failures/${failure.id}`);
			}
		});
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
					activeSubType={activeSubType} 
					steps={steps}
				/>

				<div className="space-y-4">
					<div key={`${activeStep}-${activeSubType}`}>
						{activeStep === ElementType.belief && activeSubType === 'explanation' ? (
							<BeliefExplanationComponent 
								selectedElements={selectedElements} 
								setSelectedElements={setSelectedElements}
								suggestedElements={suggestedElements}
								steps={steps}
							/>
						) : (
							<StandardStepComponent 
								activeStep={activeStep}
								selectedElements={selectedElements}
								suggestedElements={suggestedElements}
								steps={steps}
								setSelectedElements={setSelectedElements}
								setSuggestedElements={setSuggestedElements}
							/>
						)}
					</div>
				</div>

				<NavigationButtons 
					activeStep={activeStep}
					selectedElements={selectedElements}
					handlePrev={handlePrev}
					handleNext={handleNext}
					handleSave={handleSave}
					nextLoading={nextLoading}
					saveLoading={saveLoading}
				/>
			</div>
		</div>
	);
} 