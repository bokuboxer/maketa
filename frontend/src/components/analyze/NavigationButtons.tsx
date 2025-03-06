import { ElementType } from "@/api/model/elementType";
import {
	IconArrowLeft,
	IconArrowRight,
	IconDeviceFloppy,
} from "@tabler/icons-react";
import { Loader } from "@mantine/core";
import clsx from "clsx";

type NavigationButtonsProps = {
	activeStep: ElementType;
	activeSubType: string | null;
	handlePrev: () => void;
	handleNext: () => void;
	nextLoading: boolean;
	prevDisabled: boolean;
	nextDisabled: boolean;
}

// Navigation buttons component
export const NavigationButtons = ({
	activeStep,
	activeSubType,
	handlePrev,
	handleNext,
	nextLoading,
	prevDisabled,
	nextDisabled,
}: NavigationButtonsProps) => {
	return (
		<div className="flex justify-between mt-8">
			<button
				onClick={handlePrev}
				disabled={prevDisabled}
				className={clsx(
					"px-4 py-2 rounded flex items-center gap-2",
					activeStep === ElementType.adversity
						? "bg-gray-200 text-gray-400 cursor-not-allowed"
						: "bg-black text-white hover:bg-gray-800"
				)}
			>
				<IconArrowLeft size={20} />
				前へ
			</button>
			<button
				onClick={handleNext}
				disabled={nextDisabled}
				className={clsx(
					"px-4 py-2 rounded flex items-center gap-2",
					nextDisabled
						? "bg-gray-200 text-gray-400 cursor-not-allowed"
						: "bg-black text-white hover:bg-gray-800"
				)}
			>
				{nextLoading ? (
					<div className="w-5 h-5 flex items-center justify-center">
						<Loader color="gray" variant="dots" size="xs" />
					</div>
				) : activeStep === ElementType.disputation && activeSubType === "counter" ? (
					<>
						保存
						<IconDeviceFloppy size={20} />
					</>
				) : (
					<>
						次へ
						<IconArrowRight size={20} />
					</>
				)}
			</button>
		</div>
	);
};
