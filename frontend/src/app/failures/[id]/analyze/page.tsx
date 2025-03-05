"use client";

import {
	useGetFailureByIdFailureFailureIdGet,
	useSuggestElementsElementsSuggestPost,
	useBulkCreateElementsElementsPost,
} from "@/api/generated/default/default";
import { Element } from "@/api/model/element";
import { ElementType } from "@/api/model/elementType";
import {
	DragDropContext,
	Draggable,
	DraggableProvided,
	DropResult,
	Droppable,
	DroppableProvided,
} from "@hello-pangea/dnd";
import { Loader, Popover } from "@mantine/core";
import {
	IconArrowLeft,
	IconArrowRight,
	IconDeviceFloppy,
	IconHelp,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import HypnoticLoader from "@/components/HypnoticLoader";

interface PageParams {
	id: string;
}

interface ExtendedElement extends Element {
	explanation?: string;
}

type DndElement = {
	element: ExtendedElement;
	isSelected: boolean;
};

type ElementTypeKey = keyof typeof ElementType;

interface GroupedElements {
	[key: string]: DndElement[];
}

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

	useEffect(() => {
		console.log(selectedElements);
	}, [selectedElements]);

	const handleDragEnd = (result: DropResult) => {
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

	const steps = [
		{ 
			type: ElementType.adversity, 
			label: '失敗の詳細', 
			description: '失敗の詳細を入力しよう',
			title: '<strong>A</strong>dversity',
			example: '例：\n・締め切りに間に合わなかった\n・顧客からのクレームを受けた\n・チームメンバーと意見が合わなかった'
		},
		{ 
			type: ElementType.belief, 
			subType: 'selection',
			label: '意見の選択', 
			description: 'あなたの意見を選択しよう（最大3つまで）',
			title: '<strong>B</strong>elief Selection',
			example: '例：\n・自分は無能だ\n・もう取り返しがつかない\n・誰も自分を信用してくれない'
		},
		{ 
			type: ElementType.belief,
			subType: 'explanation',
			label: '意見の説明', 
			description: '選択した意見について詳しく説明しよう',
			title: '<strong>B</strong>elief Explanation',
			example: '例：\n・なぜそう考えたのか\n・どのような影響があったか\n・具体的な事実は何か'
		},
		{ 
			type: ElementType.disputation, 
			label: '視点の探索', 
			description: '前のステップで入力した信念に対する反論を入力してください',
			title: '<strong>D</strong>isputation',
			example: '例：\n・一度の失敗で全てを判断するのは極端すぎる\n・誰にでもミスはある\n・この経験を次に活かすことができる'
		},
	];

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
			} else if (currentStep?.type === ElementType.belief && currentStep?.subType === 'selection') {
				// B-1からB-2への遷移
				if (selectedElements[ElementType.belief].length === 0 || selectedElements[ElementType.belief].length > 3) {
					setNextLoading(false);
					return;
				}
				setActiveSubType('explanation');
				setNextLoading(false);
			} else if (nextStep.type === ElementType.disputation) {
				// B-2からDisputationへの遷移
				let currentElements = selectedElements[ElementType.belief].map(
					(dndElement) => dndElement.element
				);
				await suggestNextElements(nextStep.type, currentElements);
				setActiveStep(nextStep.type);
				setActiveSubType(null);
			} else {
				// その他の通常の遷移
				let currentElements = selectedElements[activeStep].map(
					(dndElement) => dndElement.element
				);
				await suggestNextElements(nextStep.type, currentElements);
				setActiveStep(nextStep.type);
				setActiveSubType(nextStep.subType || null);
			}
			
			setNextLoading(false);
		}
	};

	const handlePrev = () => {
		const currentIndex = steps.findIndex((step) => step.type === activeStep);
		if (currentIndex > 0) {
			setActiveStep(steps[currentIndex - 1].type);
		}
	};

	// Beliefフェーズの説明入力用コンポーネント
	const BeliefExplanationInput = () => {
		return (
			<div className="space-y-4">
				{selectedElements[ElementType.belief].map((dndElement: DndElement, index: number) => (
					<div key={index} className="border rounded-lg p-4 bg-white">
						<h4 className="font-medium mb-2">{dndElement.element.description}</h4>
						<textarea
							className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
							placeholder="この意見について詳しく説明してください"
							rows={3}
							value={dndElement.element.explanation || ''}
							onChange={(e) => {
								const newSelectedElements = [...selectedElements[ElementType.belief]];
								newSelectedElements[index] = {
									...dndElement,
									element: {
										...dndElement.element,
										explanation: e.target.value
									}
								};
								setSelectedElements(prev => ({
									...prev,
									[ElementType.belief]: newSelectedElements
								}));
							}}
						/>
					</div>
				))}
			</div>
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

				<div className="mb-6">
					<div className="border rounded-lg p-3 bg-white">
						<h2 className="font-semibold mb-2 text-black">
							{activeStep === ElementType.adversity
								? "失敗の内容"
								: activeStep === ElementType.disputation
									? "信念"
									: steps.find(
											(step) =>
												step.type ===
												steps[steps.findIndex((s) => s.type === activeStep) - 1]
													.type,
										)?.label}
						</h2>
						<p className="text-black text-sm">
							{activeStep === ElementType.adversity
								? failure?.description
								: activeStep === ElementType.disputation
									? selectedElements[ElementType.belief]
											.map((element) => element.element.description)
											.join("\n")
									: selectedElements[
											steps[steps.findIndex((s) => s.type === activeStep) - 1]
												.type
										]
											.map((element) => element.element.description)
											.join("\n")}
						</p>
					</div>
				</div>

				{/* Stepper */}
				<div className="mb-4">
					<div className="relative flex items-center justify-between">
						<div className="relative z-10 flex w-full justify-between">
							{steps
								.filter((step, index, self) => 
									// 同じtypeのステップの場合、最初に出現したものだけを表示
									index === self.findIndex(s => s.type === step.type)
								)
								.map((step, index) => (
									<div key={`${step.type}-${step.subType || 'main'}`} className="flex flex-col items-center">
										<button
											className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
												step.type === activeStep
													? "bg-black border-black text-white"
													: "bg-white border-gray-300 text-black"
											}`}
										>
											{String.fromCharCode(65 + index)}
										</button>
										<div className="mt-2 text-sm font-bold text-black">
											{step.label}
											{step.type === ElementType.belief && (
												<div className="text-xs font-normal text-gray-500">
													{activeSubType === 'selection' ? '(ラベル選択)' : 
													 activeSubType === 'explanation' ? '(説明入力)' : ''}
												</div>
											)}
										</div>
									</div>
								))}
						</div>
					</div>
				</div>

				<DragDropContext
					onDragEnd={handleDragEnd}
					onDragStart={handleDragStart}
				>
					<div className="space-y-4">
						<div key={`${activeStep}-${activeSubType}`}>
							{activeStep === ElementType.belief && activeSubType === 'explanation' ? (
								<BeliefExplanationInput />
							) : (
								<div className="border rounded-lg p-3 bg-white">
									<div className="mb-4">
										<h3
											className="text-lg font-medium mb-2"
											dangerouslySetInnerHTML={{
												__html:
													steps.find((step) => step.type === activeStep)?.title ||
													"",
											}}
										/>
										<div className="flex items-center gap-2">
											<p className="text-sm text-gray-600">
												{
													steps.find((step) => step.type === activeStep)
														?.description
												}
											</p>
											<Popover
												width={400}
												position="bottom"
												withArrow
												shadow="md"
											>
												<Popover.Target>
													<button className="text-gray-400 hover:text-gray-600">
														<IconHelp size={16} />
													</button>
												</Popover.Target>
												<Popover.Dropdown>
													<div className="text-sm whitespace-pre-line">
														{
															steps.find((step) => step.type === activeStep)
																?.example
														}
													</div>
												</Popover.Dropdown>
											</Popover>
										</div>
									</div>
									<div className="w-full">
										<Droppable droppableId={`selected-${activeStep}`}>
											{(provided: DroppableProvided) => (
												<div
													ref={provided.innerRef}
													{...provided.droppableProps}
													className="w-full"
													style={{ minHeight: 36 }}
												>
													{selectedElements[activeStep].length > 0 ? (
														selectedElements[activeStep].map(
															(dndElement, index) => (
																<Draggable
																	key={`${dndElement.element.id}-selected`}
																	draggableId={`${dndElement.element.id}-selected`}
																	index={index}
																>
																	{(provided: DraggableProvided) => (
																		<div
																			ref={provided.innerRef}
																			{...provided.draggableProps}
																			{...provided.dragHandleProps}
																			className="bg-white border rounded-lg p-2 mb-1 shadow-sm hover:shadow transition-shadow cursor-move min-h-[36px] flex items-center"
																		>
																			<p className="text-black text-sm leading-normal break-words">
																				{dndElement.element.description}
																			</p>
																		</div>
																	)}
																</Draggable>
															),
														)
													) : !isDragging ? (
														<div className="text-gray-400 text-sm p-2 border border-dashed border-gray-300 rounded bg-white h-[36px] flex items-center justify-center">
															要素をここにドロップ
														</div>
													) : null}
													{!isDragging && provided.placeholder}
												</div>
											)}
										</Droppable>
									</div>
									<div className="border-t border-gray-200 my-3" />
									<div>
										<h4 className="text-sm font-medium text-black mb-2">
											入力候補
										</h4>
										<Droppable droppableId={`suggested-${activeStep}`}>
											{(provided: DroppableProvided) => (
												<div
													ref={provided.innerRef}
													{...provided.droppableProps}
													className="w-full"
													style={{ minHeight: 36 }}
												>
													{suggestedElements[activeStep].length > 0 ? (
														suggestedElements[activeStep].map(
															(dndElement, index) => (
																<Draggable
																	key={`${dndElement.element.id}-suggested`}
																	draggableId={`${dndElement.element.id}-suggested`}
																	index={index}
																>
																	{(provided: DraggableProvided) => (
																		<div
																			ref={provided.innerRef}
																			{...provided.draggableProps}
																			{...provided.dragHandleProps}
																			className="bg-white border rounded-lg p-2 mb-1 shadow-sm hover:shadow transition-shadow cursor-move min-h-[36px] flex items-center"
																		>
																			<p className="text-black text-sm leading-normal break-words">
																				{dndElement.element.description}
																			</p>
																		</div>
																	)}
																</Draggable>
															),
														)
													) : !isDragging ? (
														<div className="text-gray-400 text-sm p-2 h-[36px] flex items-center justify-center">
															入力候補はありません
														</div>
													) : null}
													{!isDragging && provided.placeholder}
												</div>
											)}
										</Droppable>
									</div>
								</div>
							)}
						</div>
					</div>
				</DragDropContext>

				{/* Navigation buttons */}
				<div className="flex justify-between mt-8">
					<button
						onClick={handlePrev}
						disabled={activeStep === ElementType.adversity}
						className={`px-4 py-2 rounded flex items-center gap-2 ${
							activeStep === ElementType.adversity
								? 'bg-gray-200 text-gray-400 cursor-not-allowed'
								: 'bg-black text-white hover:bg-gray-800'
						}`}
					>
						<IconArrowLeft size={20} />
						前へ
					</button>
					{activeStep === ElementType.disputation ? (
						<button
							onClick={() => {
								if (!failure?.id) {
									return;
								}
								setSaveLoading(true);
								console.log("###############################################")
								console.log(selectedElements)
								createElements({
									data: {
										failure_id: failure.id,
										elements: Object.values(selectedElements)
											.flatMap((elements: DndElement[]) => elements.map((dndElement: DndElement) => dndElement.element))
									}
								}, {
									onSuccess: () => {
										setSaveLoading(false);
										router.push(`/failures/${failure.id}`);
									}
								})
							}}
							disabled={selectedElements[activeStep].length === 0 || saveLoading}
							className={`px-4 py-2 rounded flex items-center gap-2 ${
								selectedElements[activeStep].length === 0 || saveLoading
									? 'bg-gray-200 text-gray-400 cursor-not-allowed'
									: 'bg-black text-white hover:bg-gray-800'
							}`}
						>
							{saveLoading ? (
								<div className="w-5 h-5 flex items-center justify-center">
									<Loader color="gray" variant="dots" size="xs" />
								</div>
							) : (
								<>
									保存
									<IconDeviceFloppy size={20} />
								</>
							)}
						</button>
					) : (
						<button
							onClick={handleNext}
							disabled={selectedElements[activeStep].length === 0 || nextLoading}
							className={`px-4 py-2 rounded flex items-center gap-2 ${
								selectedElements[activeStep].length === 0 || nextLoading
									? 'bg-gray-200 text-gray-400 cursor-not-allowed'
									: 'bg-black text-white hover:bg-gray-800'
							}`}
						>
							{nextLoading ? (
								<div className="w-5 h-5 flex items-center justify-center">
									<Loader color="gray" variant="dots" size="xs" />
								</div>
							) : (
								<>
									次へ
									<IconArrowRight size={20} />
								</>
							)}
						</button>
					)}
				</div>
			</div>
		</div>
	);
} 