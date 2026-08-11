// components/distributor/registration/components/steps/PANStep.tsx

"use client";

import React, { useState } from "react";
import { Input } from "@/components/common/Input";
import { InfoBox } from "../InfoBox";
import { FormActions } from "../FormActions";
import { StepProps } from "../../types";

export const PANStep: React.FC<StepProps> = ({
    data,
    errors,
    onChange,
    onNext,
    onBack,
}) => {
    const [isVerifying, setIsVerifying] = useState(false);
    const [panName, setPanName] = useState("");
    const [panError, setPanError] = useState("");

    const handlePANVerify = async () => {
        const cleanPan = data.pan_number.toUpperCase().replace(/[^A-Z0-9]/g, "");
        if (cleanPan.length !== 10) {
            setPanError("Please enter a valid 10-character PAN");
            return;
        }

        setPanError("");
        setIsVerifying(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1500));
            const mockName = "John Doe";
            setPanName(mockName);

            if (mockName.toLowerCase() !== data.full_name.toLowerCase()) {
                setPanError(
                    "PAN name does not match your full name. Application will be flagged for review."
                );
            }

            onChange({ target: { name: "pan_verified", value: true } } as any);
            onNext?.();
        } catch (error) {
            setPanError("PAN verification failed. Please try again.");
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="space-y-5">
            <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-[#06101E]">PAN Verification</h2>
                <p className="text-gray-500 text-sm mt-1">
                    Verify your PAN for tax compliance
                </p>
            </div>

            <InfoBox type="info" title="📋 Why this is needed">
                PAN verification is mandatory for distributor activation. A verified PAN is required for tax deduction on commission and for compliance with income tax regulations.
            </InfoBox>

            <div className="space-y-4">
                <Input
                    label="PAN Number"
                    name="pan_number"
                    value={data.pan_number}
                    onChange={onChange}
                    error={errors.pan_number || panError}
                    placeholder="Enter 10-character PAN (e.g., ABCDE1234F)"
                    maxLength={10}
                    required
                    helperText="PAN is unique across all distributor accounts"
                    className="w-full h-14 px-4 text-black rounded-xl border-gray-200 focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200"
                />

                {panName && <PANNameMatch name={panName} fullName={data.full_name} />}

                {data.pan_verified && (
                    <div className="bg-green-50/80 backdrop-blur-sm p-3 rounded-xl border border-green-100 text-sm text-green-700 flex items-center gap-2">
                        <span className="text-lg flex-shrink-0">✅</span> PAN verified
                        successfully
                    </div>
                )}

                <FormActions
                    onBack={onBack}
                    onNext={data.pan_verified ? onNext : undefined}
                    onSubmit={!data.pan_verified ? handlePANVerify : undefined}
                    isSubmitDisabled={
                        !data.pan_number ||
                        data.pan_number.replace(/[^A-Z0-9]/gi, "").length !== 10
                    }
                    isLoading={isVerifying}
                    submitLabel="Verify PAN"
                    nextLabel="Continue →"
                />
            </div>
        </div>
    );
};

interface PANNameMatchProps {
    name: string;
    fullName: string;
}

const PANNameMatch: React.FC<PANNameMatchProps> = ({ name, fullName }) => {
    const isMatch = name.toLowerCase() === fullName.toLowerCase();

    return (
        <div className="bg-gray-50/80 backdrop-blur-sm p-4 rounded-xl border-2 border-gray-200">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">
                    PAN Registered Name
                </span>
                <span className="font-semibold text-[#06101E]">{name}</span>
            </div>
            <p className={`text-xs mt-2 ${isMatch ? "text-green-600" : "text-red-500"}`}>
                {isMatch ? "✓ Name matches" : "⚠ Name mismatch - Application will be flagged for review"}
            </p>
        </div>
    );
};