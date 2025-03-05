"use client";

import {
	useGetFailureByIdFailureFailureIdGet,
	useSuggestElementsElementsSuggestPost,
	useBulkCreateElementsElementsPost,
} from "@/api/generated/default/default";
import { Element } from "@/api/model/element";
import { ElementType } from "@/api/model/elementType";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
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
	DndElement
} from "@/components/analyze";
import { IconArrowLeft } from "@tabler/icons-react";

interface PageParams {
	id: string;
}

// Main component
export default function AnalyzePage({
	params,
}: { params: Promise<PageParams> }) {
	const resolvedParams = use(params);
	const { data: failure, isLoading: isFailureLoading } =
		useGetFailureByIdFailureFailureIdGet(Number(resolvedParams.id));
	const { mutate: suggestElements } = useSuggestElementsElementsSuggestPost();
	const { mutate: createElements } = useBulkCreateElementsElementsPost();
	const [loading, setLoading] = useState(true);
	const [isDragging, setIsDragging] = useState(false);
	const [activeStep, setActiveStep] = useState<ElementType>(ElementType.adversity);
	const [activeSubType, setActiveSubType] = useState<string | null>(null);
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
						const dndElements = data.map((element) => ({
							element,
							isSelected: false,
						}));

						setSuggestedElements((prev) => ({
							...prev,
							[element_type]: dndElements,
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

	useEffect(() => {
		if (failure?.description) {
			fetchSuggestElements(ElementType.adversity, failure?.description, []);
		}
	}, [failure?.description]);

	const handleDragStart = () => {
		setIsDragging(true);
	};

	const handleDragEnd = (result: DropResult) => {
		if (activeStep === ElementType.belief && activeSubType === 'selection') {
			return; // Ignore drag and drop for belief selection
		}

		setIsDragging(false);
		if (!result.destination) return;

		const sourceType = result.source.droppableId.split("-")[0];
		const destType = result.destination.droppableId.split("-")[0];
		const elementType = result.source.droppableId.split(
			"-",
		)[1] as keyof GroupedElements;

		const sourceList =
			sourceType === "selected" ? selectedElements : suggestedElements;
		const dndElement = sourceList[elementType][result.source.index];

		// 同じリスト内での移動（selected内またはsuggested内）
		if (sourceType === destType) {
			const items = Array.from(sourceList[elementType]);
			const [removed] = items.splice(result.source.index, 1);
			items.splice(result.destination.index, 0, removed);

			if (sourceType === "selected") {
				setSelectedElements((prev) => ({
					...prev,
					[elementType]: items,
				}));
			} else {
				setSuggestedElements((prev) => ({
					...prev,
					[elementType]: items,
				}));
			}
			return;
		}

		// selected と suggested 間の移動
		const newDndElement = {
			...dndElement,
			isSelected: !dndElement.isSelected,
		};

		if (sourceType === "selected") {
			setSelectedElements((prev) => ({
				...prev,
				[elementType]: prev[elementType].filter(
					(_, i) => i !== result.source.index,
				),
			}));
			setSuggestedElements((prev) => ({
				...prev,
				[elementType]: [...prev[elementType], newDndElement],
			}));
		} else {
			setSuggestedElements((prev) => ({
				...prev,
				[elementType]: prev[elementType].filter(
					(_, i) => i !== result.source.index,
				),
			}));
			setSelectedElements((prev) => ({
				...prev,
				[elementType]: [...prev[elementType], newDndElement],
			}));
		}
	};

	const suggestNextElements = async (nextType: ElementType, currentElements: Element[]) => {
		return new Promise<void>((resolve) => {
			suggestElements(
				{
					data: {
						type: nextType,
						text: "",
						elements: currentElements,
					},
				},
				{
					onSuccess: (data) => {
						if (data) {
							const dndElements = data.map((element) => ({
								element,
								isSelected: false,
							}));

							setSuggestedElements((prev) => ({
								...prev,
								[nextType]: dndElements,
							}));

							setSelectedElements((prev) => ({
								...prev,
								[nextType]: [],
							}));
						}
						setNextLoading(false);
						resolve();
					},
				},
			);
		});
	};

	const handleNext = async () => {
		const currentStep = steps.find(step => 
			step.type === activeStep && (!step.subType || step.subType === activeSubType)
		);
		const currentIndex = steps.indexOf(currentStep!);
		
		if (currentIndex < steps.length - 1) {
			const nextStep = steps[currentIndex + 1];
			setNextLoading(true);

			if (activeStep === ElementType.adversity) {
				// AからBへの遷移
				let currentElements = selectedElements[activeStep].map(
					(dndElement) => dndElement.element
				);
				await suggestNextElements(ElementType.belief, currentElements);
				setActiveStep(ElementType.belief);
				setActiveSubType('selection');
			} else if (activeStep === ElementType.belief && activeSubType === 'selection') {
				// B-1からB-2への遷移
				if (selectedElements[ElementType.belief].length !== 1) {
					setNextLoading(false);
					return;
				}
				setActiveSubType('explanation');
				setNextLoading(false);
			} else if (activeStep === ElementType.belief && activeSubType === 'explanation') {
				// B-2からD-1への遷移
				let currentElements = selectedElements[ElementType.belief].map(
					(dndElement) => dndElement.element
				);
				await suggestNextElements(ElementType.disputation, currentElements);
				setActiveStep(ElementType.disputation);
				setActiveSubType('evidence');
			} else if (activeStep === ElementType.disputation && activeSubType === 'evidence') {
				// D-1からD-2への遷移
				let currentElements = selectedElements[ElementType.disputation].map(
					(dndElement) => dndElement.element
				);
				await suggestNextElements(ElementType.disputation, currentElements);
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
			// B-2からB-1への遷移
			setActiveSubType('selection');
		} else if (currentIndex > 0) {
			// 通常の前のステップへの遷移
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
					.flatMap((elements) => elements.map((dndElement) => dndElement.element))
			}
		}, {
			onSuccess: () => {
				setSaveLoading(false);
				router.push(`/failures/${failure.id}`);
			}
		});
	};

	// Render loading state
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

	// Render main content
	return (
		<div className="min-h-screen bg-white">
			<div className="container mx-auto px-4 py-8">
				{/* Header */}
				<div className="flex items-center mb-4">
					<button
						onClick={() => router.back()}
						className="text-black hover:text-gray-600 mr-4 p-2 rounded-full hover:bg-gray-100"
					>
						<IconArrowLeft size={20} />
					</button>
					<h1 className="text-2xl font-bold text-black">詳細分析</h1>
				</div>

				{/* Previous step summary */}
				<PreviousStepSummary 
					activeStep={activeStep} 
					failure={failure} 
					selectedElements={selectedElements} 
					steps={steps}
				/>

				{/* Stepper */}
				<StepperComponent 
					activeStep={activeStep} 
					activeSubType={activeSubType} 
					steps={steps}
				/>

				{/* Main content area */}
				<DragDropContext
					onDragEnd={handleDragEnd}
					onDragStart={handleDragStart}
				>
					<div className="space-y-4">
						<div key={`${activeStep}-${activeSubType}`}>
							{activeStep === ElementType.belief && activeSubType === 'explanation' ? (
								<BeliefExplanationComponent 
									selectedElements={selectedElements} 
									setSelectedElements={setSelectedElements}
									steps={steps}
								/>
							) : (
								<StandardStepComponent 
									activeStep={activeStep}
									isDragging={isDragging}
									selectedElements={selectedElements}
									suggestedElements={suggestedElements}
									steps={steps}
									setSelectedElements={setSelectedElements}
									setSuggestedElements={setSuggestedElements}
								/>
							)}
						</div>
					</div>
				</DragDropContext>

				{/* Navigation buttons */}
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