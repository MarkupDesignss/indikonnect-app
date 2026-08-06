'use client';

import React from 'react';

interface ProgressRailProps {
    currentStep: number;
    totalSteps?: number;
}

export default function ProgressRail({ currentStep, totalSteps = 3 }: ProgressRailProps) {
    const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);
    const labels = ['Details', 'Sponsor', 'KYC'];

    return (
        <div className="flex items-center mb-[30px]">
            {steps.map((step, index) => (
                <React.Fragment key={step}>
                    <div className={`flex items-center gap-2 font-['Arimo',sans-serif] text-xs font-bold transition-colors ${step < currentStep ? 'text-[#5c6771]' : ''} ${step === currentStep ? 'text-[#333f48]' : 'text-[#ddcf9f]'}`}>
                        <span className={`w-6 h-6 rounded-full border-[1.5px] flex items-center justify-center text-[11px] text-[#7a7561] bg-white flex-shrink-0 transition-all duration-[0.35s] ${step < currentStep ? 'bg-[#003da5] border-[#003da5] text-white scale-[1.02]' : ''} ${step === currentStep ? 'bg-[#ffc72c] border-[#ffc72c] text-[#002a73] shadow-[0_0_0_5px_#fff8e6] scale-[1.08]' : ''}`}>
                            {step}
                        </span>
                        <span>{labels[index]}</span>
                    </div>
                    {index < steps.length - 1 && (
                        <div className={`flex-1 h-[2px] bg-[#ddcf9f] mx-1.5 relative rounded-[2px] ${step < currentStep ? 'done' : ''}`}>
                            <div className={`absolute inset-0 w-0 bg-gradient-to-r from-[#003da5] to-[#ffc72c] transition-all duration-[0.5s] rounded-[2px] ${step < currentStep ? 'w-full' : ''}`}></div>
                        </div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}