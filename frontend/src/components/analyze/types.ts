import { Element } from "@/api/model/element";
import { ElementType } from "@/api/model/elementType";
import type { Failure } from "@/api/model/failure";
import { Dispatch, SetStateAction } from "react";

export interface ExtendedElement extends Element {
  explanation?: string;
}

export type ElementItem = {
  element: ExtendedElement;
  isSelected: boolean;
};

export type ElementTypeKey = keyof typeof ElementType;

export interface GroupedElements {
  [key: string]: ElementItem[];
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
  failure?: Failure;
  selectedElements: GroupedElements;
  summarizedText: string;
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

export interface BeliefExplanationComponentProps {
  selectedElements: GroupedElements;
  setSelectedElements: Dispatch<SetStateAction<GroupedElements>>;
  suggestedElements: GroupedElements;
  steps: StepConfig[];
}

export interface StandardStepComponentProps {
  activeStep: ElementType;
  selectedElements: GroupedElements;
  suggestedElements: GroupedElements;
  steps: StepConfig[];
  setSelectedElements: React.Dispatch<React.SetStateAction<GroupedElements>>;
  setSuggestedElements: React.Dispatch<React.SetStateAction<GroupedElements>>;
}

export interface StepHeaderProps {
  currentStep: StepConfig | undefined;
} 