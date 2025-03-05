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
	IconPlus,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import HypnoticLoader from "@/components/HypnoticLoader";
interface PageParams {
	id: string;
}

interface DndElement {
	element: Element;
	isSelected: boolean;
}

interface GroupedElements {
	[key: string]: DndElement[];
}

// Add new interface for belief labels
interface BeliefLabel {
	id: number;
	description: string;
	type: 'internal' | 'external';
	isSelected: boolean;
	explanation?: string;
}

interface BeliefSuggestion {
	id: number;
	labelId: number;
	description: string;
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
	const [selectedElements, setSelectedElements] = useState<GroupedElements>({
		[ElementType.adversity]: [],
		[ElementType.belief]: [],
		[ElementType.disputation]: [],
	});
	const [suggestedElements, setSuggestedElements] = useState<GroupedElements>({
		[ElementType.adversity]: [],
		[ElementType.belief]: [],
		[ElementType.disputation]: [],
	});
	const router = useRouter();
	const [nextLoading, setNextLoading] = useState(false);
	const [saveLoading, setSaveLoading] = useState(false);
	const [beliefLabels, setBeliefLabels] = useState<BeliefLabel[]>([]);
	const [showCustomInput, setShowCustomInput] = useState(false);
	const [activeBeliefLabel, setActiveBeliefLabel] = useState<number | null>(null);
	const [beliefSuggestions, setBeliefSuggestions] = useState<BeliefSuggestion[]>([]);
	const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

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
			label: '意見の整理', 
			description: 'あなたの意見を整理しよう',
			title: '<strong>B</strong>elief',
			example: '例：\n・自分は無能だ\n・もう取り返しがつかない\n・誰も自分を信用してくれない'
		},
		{ 
			type: ElementType.disputation, 
			label: '視点の探索', 
			description: '前のステップで入力した信念に対する反論を入力してください',
			title: '<strong>D</strong>isputation',
			example: '例：\n・一度の失敗で全てを判断するのは極端すぎる\n・誰にでもミスはある\n・この経験を次に活かすことができる'
		},
	];

	const fetchBeliefExplanations = async (labelId: number) => {
		setIsLoadingSuggestions(true);
		const selectedLabel = beliefLabels.find(label => label.id === labelId);
		if (!selectedLabel || !failure?.description) return;

		suggestElements(
			{
				data: {
					type: ElementType.belief,
					text: failure.description,
					elements: [{
						id: selectedLabel.id,
						type: ElementType.belief,
						description: selectedLabel.description,
						created_at: new Date().toISOString(),
						failure_id: failure.id,
					}],
				},
			},
			{
				onSuccess: (data) => {
					if (data) {
						const suggestions: BeliefSuggestion[] = data.map((element, index) => ({
							id: index,
							labelId: selectedLabel.id,
							description: element.description,
						}));
						setBeliefSuggestions(suggestions);
					}
					setIsLoadingSuggestions(false);
				},
			},
		);
	};

	const handleExplanationUpdate = (labelId: number, explanation: string) => {
		setBeliefLabels(prev => prev.map(label => 
			label.id === labelId ? { ...label, explanation } : label
		));
	};

	const handleNext = async () => {
		const currentIndex = steps.findIndex((step) => step.type === activeStep);
		if (currentIndex < steps.length - 1) {
			const nextStep = steps[currentIndex + 1].type;
			setNextLoading(true);

			let currentElements: Element[] = [];
			if (nextStep === ElementType.disputation) {
				currentElements = selectedElements[ElementType.belief].map(
					(dndElement) => ({
						...dndElement.element,
						description: `${dndElement.element.description}\n説明: ${
							beliefLabels.find(label => label.id === dndElement.element.id)?.explanation || ''
						}`,
					}),
				);
			} else {
				currentElements = selectedElements[activeStep].map(
					(dndElement) => dndElement.element,
				);
			}

			await new Promise((resolve) => {
				suggestElements(
					{
						data: {
							type: nextStep,
							text: "",
							elements: currentElements,
						},
					},
					{
						onSuccess: (data) => {
							if (data) {
								if (nextStep === ElementType.belief) {
									// Convert suggested elements to belief labels
									const labels: BeliefLabel[] = data.map((element, index) => ({
										id: element.id,
										description: element.description,
										type: index < 5 ? 'internal' : 'external',
										isSelected: false,
									}));
									setBeliefLabels(labels);
								} else {
									const dndElements = data.map((element) => ({
										element,
										isSelected: false,
									}));

									setSuggestedElements((prev) => ({
										...prev,
										[nextStep]: dndElements,
									}));

									setSelectedElements((prev) => ({
										...prev,
										[nextStep]: [],
									}));
								}
							}
							setNextLoading(false);
							setActiveStep(nextStep);
							resolve(undefined);
						},
					},
				);
			});
		}
	};

	const handlePrev = () => {
		const currentIndex = steps.findIndex((step) => step.type === activeStep);
		if (currentIndex > 0) {
			setActiveStep(steps[currentIndex - 1].type);
		}
	};

	// Add new function to handle belief label selection
	const handleBeliefLabelSelect = (labelId: number) => {
		setBeliefLabels(prev => {
			const selectedCount = prev.filter(label => label.isSelected).length;
			const newLabels = prev.map(label => {
				if (label.id === labelId) {
					// If already selected, unselect it
					if (label.isSelected) {
						return { ...label, isSelected: false };
					}
					// If not selected and less than 3 labels are selected, select it
					if (selectedCount < 3) {
						return { ...label, isSelected: true };
					}
				}
				return label;
			});
			return newLabels;
		});

		// Update selectedElements for belief
		const selectedLabels = beliefLabels.filter(label => label.isSelected);
		setSelectedElements(prev => ({
			...prev,
			[ElementType.belief]: selectedLabels.map(label => ({
				element: {
					id: label.id,
					type: ElementType.belief,
					description: label.description,
					created_at: new Date().toISOString(),
					failure_id: failure?.id ?? 0,
				},
				isSelected: true,
			})),
		}));
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
							{steps.map((step, index) => (
								<div key={step.type} className="flex flex-col items-center">
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
						<div key={activeStep}>
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
									{activeStep === ElementType.belief ? (
										<div className="space-y-6">
											<div>
												<h4 className="text-sm font-medium text-black mb-2">内的要因（自己）</h4>
												<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
													{beliefLabels
														.filter(label => label.type === 'internal')
														.map(label => (
															<button
																key={label.id}
																onClick={() => handleBeliefLabelSelect(label.id)}
																className={`p-3 rounded-lg border text-left transition-colors ${
																	label.isSelected
																		? 'bg-black text-white border-black'
																		: 'bg-white text-black border-gray-200 hover:border-black'
																}`}
															>
																<p className="text-sm">{label.description}</p>
															</button>
														))}
												</div>
											</div>
											<div>
												<h4 className="text-sm font-medium text-black mb-2">外的要因（環境・他者）</h4>
												<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
													{beliefLabels
														.filter(label => label.type === 'external')
														.map(label => (
															<button
																key={label.id}
																onClick={() => handleBeliefLabelSelect(label.id)}
																className={`p-3 rounded-lg border text-left transition-colors ${
																	label.isSelected
																		? 'bg-black text-white border-black'
																		: 'bg-white text-black border-gray-200 hover:border-black'
																}`}
															>
																<p className="text-sm">{label.description}</p>
															</button>
														))}
												</div>
											</div>
											<div className="mt-4">
												<button
													onClick={() => setShowCustomInput(!showCustomInput)}
													className="text-sm text-gray-600 hover:text-black flex items-center gap-1"
												>
													<IconPlus size={16} />
													カスタムラベルを追加
												</button>
												{showCustomInput && (
													<form
														onSubmit={(e) => {
															e.preventDefault();
															const input = e.currentTarget.elements.namedItem(
																'customLabel',
															) as HTMLInputElement;
															const type = (e.currentTarget.elements.namedItem(
																'labelType',
															) as HTMLSelectElement).value as 'internal' | 'external';
															
															if (input.value.trim()) {
																const newLabel: BeliefLabel = {
																	id: Date.now(),
																	description: input.value.trim(),
																	type,
																	isSelected: true,
																};
																setBeliefLabels(prev => [...prev, newLabel]);
																handleBeliefLabelSelect(newLabel.id);
																input.value = '';
																setShowCustomInput(false);
															}
														}}
														className="mt-2 space-y-2"
													>
														<div className="flex gap-2">
															<input
																type="text"
																name="customLabel"
																placeholder="新しいラベルを入力"
																className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-sm text-black"
															/>
															<select
																name="labelType"
																className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-sm text-black"
															>
																<option value="internal">内的要因</option>
																<option value="external">外的要因</option>
															</select>
														</div>
														<button
															type="submit"
															className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 text-sm"
														>
															追加
														</button>
													</form>
												)}
												<div className="mt-4">
													<p className="text-sm text-gray-500">
														選択中: {beliefLabels.filter(label => label.isSelected).length}/3
													</p>
												</div>
											</div>
											{beliefLabels.some(label => label.isSelected) && (
												<div className="mt-8">
													<h4 className="text-lg font-medium text-black mb-4">ラベルの詳細説明</h4>
													<div className="flex space-x-2 mb-4">
														{beliefLabels
															.filter(label => label.isSelected)
															.map(label => (
																<button
																	key={label.id}
																	onClick={() => {
																		setActiveBeliefLabel(label.id);
																		if (!label.explanation) {
																			fetchBeliefExplanations(label.id);
																		}
																	}}
																	className={`px-4 py-2 rounded-lg transition-colors ${
																		activeBeliefLabel === label.id
																			? 'bg-black text-white'
																			: 'bg-gray-100 text-black hover:bg-gray-200'
																	}`}
																>
																	{label.description}
																</button>
															))}
													</div>
													{activeBeliefLabel && (
														<div className="space-y-4">
															<div>
																<textarea
																	value={beliefLabels.find(label => label.id === activeBeliefLabel)?.explanation || ''}
																	onChange={(e) => handleExplanationUpdate(activeBeliefLabel, e.target.value)}
																	placeholder="このラベルについて詳しく説明してください..."
																	className="w-full h-32 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-sm text-black resize-none"
																/>
															</div>
															<div>
																<h5 className="text-sm font-medium text-black mb-2">入力候補</h5>
																{isLoadingSuggestions ? (
																	<div className="flex justify-center py-4">
																		<Loader color="black" size="sm" />
																	</div>
																) : (
																	<div className="space-y-2">
																		{beliefSuggestions
																			.filter(suggestion => suggestion.labelId === activeBeliefLabel)
																			.map(suggestion => (
																				<button
																					key={suggestion.id}
																					onClick={() => handleExplanationUpdate(activeBeliefLabel, suggestion.description)}
																					className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors text-sm text-black"
																				>
																					{suggestion.description}
																				</button>
																			))}
																	</div>
																)}
															</div>
														</div>
													)}
												</div>
											)}
										</div>
									) : (
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
									)}
								</div>
								{activeStep !== ElementType.belief && (
									<>
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
									</>
								)}
							</div>
							{activeStep !== ElementType.belief && (
								<div className="mt-3">
									<form
										onSubmit={(e) => {
											e.preventDefault();
											const input = e.currentTarget.elements.namedItem(
												'element',
											) as HTMLInputElement;
											if (input.value.trim()) {
												const newElement: Element = {
													id: 0,
													type: activeStep,
													description: input.value.trim(),
													created_at: new Date().toISOString(),
													failure_id: failure?.id ?? 0,
												};
												const newDndElement: DndElement = {
													element: newElement,
													isSelected: true,
												};
												setSelectedElements((prev) => ({
													...prev,
													[activeStep]: [...prev[activeStep], newDndElement],
												}));
												input.value = '';
											}
										}}
										className="flex gap-2"
									>
										<input
											type="text"
											name="element"
											placeholder="新しい要素を入力"
											className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-sm text-black"
										/>
										<button
											type="submit"
											className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 text-sm w-20"
										>
											追加
										</button>
									</form>
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