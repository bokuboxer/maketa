import { Element } from "@/api/model/element";
import { ElementType } from "@/api/model/elementType";
import { Dispatch, SetStateAction } from "react";

export interface ExtendedElement extends Element {
  explanation?: string;
}

export type DndElement = {
  element: ExtendedElement;
  isSelected: boolean;
};

export type ElementTypeKey = keyof typeof ElementType;

export interface GroupedElements {
  [key: string]: DndElement[];
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
  activeSubType: string | null;
  steps: StepConfig[];
}

export interface PreviousStepSummaryProps {
  activeStep: ElementType;
  failure: any; // Using 'any' for now as we don't have the full failure type
  selectedElements: GroupedElements;
  steps: StepConfig[];
}

export interface NavigationButtonsProps {
  activeStep: ElementType;
  selectedElements: GroupedElements;
  handlePrev: () => void;
  handleNext: () => void;
  handleSave: () => void;
  nextLoading: boolean;
  saveLoading: boolean;
}

export interface DraggableElementListProps {
  elementType: ElementType;
  elements: DndElement[];
  droppableId: string;
  emptyMessage: string;
  isDragging: boolean;
}

export interface StepHeaderProps {
  currentStep: StepConfig | undefined;
}

export interface BeliefExplanationComponentProps {
  selectedElements: GroupedElements;
  setSelectedElements: Dispatch<SetStateAction<GroupedElements>>;
}

export interface StandardStepComponentProps {
  activeStep: ElementType;
  isDragging: boolean;
  selectedElements: GroupedElements;
  suggestedElements: GroupedElements;
  steps: StepConfig[];
} 