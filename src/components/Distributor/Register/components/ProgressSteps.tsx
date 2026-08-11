// components/distributor/registration/components/common/ProgressSteps.tsx

import React from "react";

interface ProgressStepsProps {
    steps: { title: string }[];
    currentStep: number;
    onStepClick: (index: number) => void;
}

export const ProgressSteps: React.FC<ProgressStepsProps> = ({
    steps,
    currentStep,
    onStepClick,
}) => {
    return (
        <div className="flex items-center justify-center w-full mb-8 px-4">
            <div className="flex items-center justify-center gap-1 sm:gap-3 max-w-4xl w-full">
                {steps.map((step, index) => (
                    <React.Fragment key={index}>
                        <button
                            type="button"
                            onClick={() => {
                                if (index <= currentStep) onStepClick(index);
                            }}
                            className={`flex items-center gap-1 sm:gap-2 ${index <= currentStep ? "cursor-pointer" : "cursor-default"
                                } group relative`}
                        >
                            <div
                                className={`relative w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-300 flex-shrink-0
                  ${index < currentStep
                                        ? "bg-[#F9C744] text-[#06101E] shadow-md"
                                        : index === currentStep
                                            ? "bg-[#F9C744] text-[#06101E] ring-4 ring-[#F9C744]/40 shadow-lg scale-110"
                                            : "bg-gray-100 text-gray-400 border-2 border-gray-200"
                                    }`}
                            >
                                {index < currentStep ? (
                                    <CheckIcon />
                                ) : (
                                    index + 1
                                )}
                            </div>
                            <span
                                className={`hidden sm:block text-xs font-medium whitespace-nowrap transition-all duration-300 ${index === currentStep
                                        ? "text-[#06101E] font-semibold"
                                        : index < currentStep
                                            ? "text-gray-600"
                                            : "text-gray-400"
                                    }`}
                            >
                                {step.title}
                            </span>
                        </button>

                        {index < steps.length - 1 && (
                            <div
                                className={`flex-1 min-w-[8px] sm:min-w-[12px] h-0.5 rounded-full transition-all duration-300 ${index < currentStep ? "bg-[#F9C744]" : "bg-gray-200"
                                    }`}
                            />
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

const CheckIcon = () => (
    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
);