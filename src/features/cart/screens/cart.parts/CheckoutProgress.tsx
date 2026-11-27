"use client";

import { Check } from "lucide-react";

export type CheckoutStep = 0 | 1 | 2;

interface CheckoutProgressProps {
  /** 0 = Cart, 1 = CV Allocation, 2 = Payment */
  currentStep?: CheckoutStep;
  className?: string;
}

const STEPS = ["Cart", "CV Allocation", "Payment"] as const;

export default function CheckoutProgress({
  currentStep = 0,
  className = "",
}: CheckoutProgressProps) {
  return (
    <div
      aria-label={`Checkout progress: ${STEPS.map((label, index) =>
        `${label} ${index < currentStep ? "completed" : index === currentStep ? "current" : "upcoming"}`,
      ).join(", ")}`}
      className={`w-full bg-transparent p-0 ${className}`}
    >
      <ol className="flex w-full items-start">
        {STEPS.map((label, index) => {
          const isComplete = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <li
              key={label}
              aria-current={isCurrent ? "step" : undefined}
              className="relative flex min-w-0 flex-1 flex-col items-center"
            >
              {index < STEPS.length - 1 && (
                <span
                  aria-hidden="true"
                  className={`absolute left-[calc(50%+13px)] right-[calc(-50%+13px)] top-[13px] h-[2px] ${
                    index < currentStep ? "bg-[#16845B]" : "bg-[#D9DEDA]"
                  }`}
                />
              )}

              <span
                className={`relative z-[1] flex h-[27px] w-[27px] items-center justify-center rounded-full border-2 text-[10px] font-bold ${
                  isComplete
                    ? "border-[#16845B] bg-[#16845B] text-white"
                    : isCurrent
                      ? "border-[#16845B] bg-[#16845B] text-white ring-4 ring-[#16845B]/10"
                      : "border-[#D0D5DD] bg-white text-[#98A2B3]"
                }`}
              >
                {isComplete ? <Check className="h-3.5 w-3.5" /> : index + 1}
              </span>

              <span
                className={`mt-1.5 whitespace-nowrap px-1 text-center text-[9px] font-semibold leading-4 sm:text-[10px] ${
                  isComplete || isCurrent
                    ? "text-[#17603E]"
                    : "text-[#98A2B3]"
                }`}
              >
                {label}
              </span>

              {isCurrent && (
                <span className="mt-0.5 whitespace-nowrap text-[7px] font-semibold uppercase tracking-[0.07em] text-[#16845B] sm:text-[8px]">
                  Current step
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
