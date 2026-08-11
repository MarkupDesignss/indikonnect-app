// components/distributor/registration/components/steps/AadhaarStep.tsx

"use client";

import React, { useState } from "react";
import { Button } from "@/components/common/Button";
import { InfoBox } from "../InfoBox";
import { FormActions } from "../FormActions";
import { StepProps } from "../../types";

export const AadhaarStep: React.FC<StepProps> = ({
    data,
    errors,
    onChange,
    onNext,
    onBack,
}) => {
    const [isVerifying, setIsVerifying] = useState(false);
    const [aadhaarError, setAadhaarError] = useState("");

    const handleAadhaarVerify = async () => {
        const cleanNumber = data.aadhaar_number.replace(/\D/g, "");
        if (cleanNumber.length !== 12) {
            setAadhaarError("Please enter a valid 12-digit Aadhaar number");
            return;
        }

        if (!data.aadhaar_consent) {
            setAadhaarError("You must consent to Aadhaar verification");
            return;
        }

        setAadhaarError("");
        setIsVerifying(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1500));
            onChange({ target: { name: "aadhaar_verified", value: true } } as any);
            onNext?.();
        } catch (error) {
            setAadhaarError("Aadhaar verification failed. Please try again.");
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="space-y-5">
            <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-[#06101E]">
                    Aadhaar Verification
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                    Verify your identity through licensed KYC provider
                </p>
            </div>

            <InfoBox type="info" title="🔐 Why this is needed">
                Aadhaar verification is mandatory for distributor registration. Your Aadhaar number is verified through a licensed KYC provider and is never stored in full.
            </InfoBox>

            <div className="space-y-4">
                {/* Aadhaar Number Input */}
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 block">
                        Aadhaar Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            name="aadhaar_number"
                            value={data.aadhaar_number}
                            onChange={handleAadhaarChange(onChange)}
                            placeholder="XXXX-XXXX-XXXX"
                            maxLength={14}
                            className={`w-full h-14 px-4 text-black rounded-xl border ${errors.aadhaar_number || aadhaarError ? "border-red-500" : "border-gray-200"
                                } bg-white focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200 outline-none`}
                        />
                    </div>
                    {(errors.aadhaar_number || aadhaarError) && (
                        <p className="text-xs text-red-500 mt-1">
                            {errors.aadhaar_number || aadhaarError}
                        </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                        Only last 4 digits will be visible in the system
                    </p>
                </div>

                {/* Consent Checkbox */}
                <div className="space-y-1.5">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            name="aadhaar_consent"
                            checked={data.aadhaar_consent}
                            onChange={onChange}
                            className="mt-1 w-4 h-4 rounded border-gray-300 text-[#F9C744] focus:ring-[#F9C744] flex-shrink-0"
                        />
                        <span className="text-sm text-gray-600 leading-relaxed">
                            I consent to Aadhaar verification through a licensed KYC provider
                            for the purpose of identity verification as per the Digital
                            Personal Data Protection Act, 2023.
                        </span>
                    </label>
                    {errors.aadhaar_consent && (
                        <p className="text-xs text-red-500">{errors.aadhaar_consent}</p>
                    )}
                </div>

                {/* Verified Status */}
                {data.aadhaar_verified && (
                    <div className="bg-green-50/80 backdrop-blur-sm p-3 rounded-xl border border-green-100 text-sm text-green-700 flex items-center gap-2">
                        <span className="text-lg flex-shrink-0">✅</span> Aadhaar verified
                        successfully
                    </div>
                )}

                <FormActions
                    onBack={onBack}
                    onNext={data.aadhaar_verified ? onNext : undefined}
                    onSubmit={!data.aadhaar_verified ? handleAadhaarVerify : undefined}
                    isSubmitDisabled={
                        !data.aadhaar_consent ||
                        !data.aadhaar_number ||
                        data.aadhaar_number.replace(/\D/g, "").length !== 12
                    }
                    isLoading={isVerifying}
                    submitLabel="Verify Aadhaar"
                    nextLabel="Continue →"
                />
            </div>
        </div>
    );
};

const handleAadhaarChange = (onChange: any) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 12) value = value.slice(0, 12);

    let formattedValue = "";
    for (let i = 0; i < value.length; i++) {
        if (i > 0 && i % 4 === 0) {
            formattedValue += "-";
        }
        formattedValue += value[i];
    }

    onChange({
        target: {
            name: "aadhaar_number",
            value: formattedValue,
        },
    });
};