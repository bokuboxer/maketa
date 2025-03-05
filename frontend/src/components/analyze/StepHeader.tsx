import { Popover } from "@mantine/core";
import { IconHelp } from "@tabler/icons-react";
import { StepHeaderProps } from "./types";

// Step header component
export const StepHeader = ({ currentStep }: StepHeaderProps) => {
  return (
    <div className="mb-4">
      <h3
        className="text-lg font-medium mb-2"
        dangerouslySetInnerHTML={{
          __html: currentStep?.title || "",
        }}
      />
      <div className="flex items-center gap-2">
        <p className="text-sm text-gray-600">
          {currentStep?.description}
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
              {currentStep?.example}
            </div>
          </Popover.Dropdown>
        </Popover>
      </div>
    </div>
  );
}; 