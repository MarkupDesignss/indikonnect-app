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
                {steps.map((step, index) => {
                    const isCompleted = index < currentStep;
                    const isActive = index === currentStep;
                    const isClickable = index <= currentStep;

                    return (
                        <React.Fragment key={`step-${index}`}>
                            <button
                                type="button"
                                onClick={() => isClickable && onStepClick(index)}
                                disabled={!isClickable}
                                className={`flex items-center gap-1 sm:gap-2 ${isClickable ? "cursor-pointer" : "cursor-default"
                                    } group relative`}
                            >
                                <div
                                    className={`relative w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-300 flex-shrink-0
                                        ${isCompleted
                                            ? "bg-[#F9C744] text-[#06101E] shadow-md"
                                            : isActive
                                                ? "bg-[#F9C744] text-[#06101E] ring-4 ring-[#F9C744]/40 shadow-lg scale-110"
                                                : "bg-gray-100 text-gray-400 border-2 border-gray-200"
                                        }`}
                                >
                                    {isCompleted ? <CheckIcon /> : index + 1}
                                </div>
                                <span className="hidden sm:block text-xs font-medium whitespace-nowrap transition-all duration-300">
                                    {step.title}
                                </span>
                            </button>
                            {index < steps.length - 1 && (
                                <div
                                    key={`line-${index}`}
                                    className={`flex-1 min-w-[8px] sm:min-w-[12px] h-0.5 rounded-full transition-all duration-300 ${isCompleted ? "bg-[#F9C744]" : "bg-gray-200"
                                        }`}
                                />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

const CheckIcon = () => (
    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
);

export default ProgressSteps;