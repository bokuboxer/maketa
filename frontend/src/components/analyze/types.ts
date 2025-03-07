import { Element } from "@/api/model/element";
import { ElementType } from "@/api/model/elementType";
import { Dispatch, SetStateAction } from "react";

export type ElementTypeKey = keyof typeof ElementType;

export interface GroupedElements {
	[key: string]: Element[];
}

export interface StepConfig {
	type: ElementType;
	subType?: string;
	label: string;
	description: string;
	title: string;
	example: string;
}

// コンポーネントのProps型定義
export interface StepperComponentProps {
	activeStep: ElementType;
	steps: StepConfig[];
}

export interface PreviousStepSummaryProps {
	activeStep: ElementType;
	failure: any; // Using 'any' for now as we don't have the full failure type
	adversityText: string | null;
	beliefSelectedElement: string | null;
	beliefExplanationText: string | null;
	disputeEvidenceText: string | null;
	selectedElements: GroupedElements;
	summarizedText: string;
	steps: StepConfig[];
}

export interface DraggableElementListProps {
	elementType: ElementType;
	elements: Element[];
	droppableId: string;
	emptyMessage: string;
}

export interface StepHeaderProps {
	currentStep: StepConfig | undefined;
}
