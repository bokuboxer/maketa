import { ElementType } from "@/api/model/elementType";
import { NavigationButtonsProps } from "./types";
import { IconArrowLeft, IconArrowRight, IconDeviceFloppy } from "@tabler/icons-react";
import { Loader } from "@mantine/core";

// Navigation buttons component
export const NavigationButtons = ({ 
  activeStep, 
  selectedElements, 
  handlePrev, 
  handleNext, 
  handleSave, 
  nextLoading, 
  saveLoading 
}: NavigationButtonsProps) => {
  return (
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
          onClick={handleSave}
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
  );
}; 