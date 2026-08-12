// components/distributor/registration/components/steps/PANStep.tsx

"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/common/Input";
import { InfoBox } from "../InfoBox";
import { FormActions } from "../FormActions";
import { StepProps } from "../../types";
import { useAppDispatch } from "@/lib/redux/hooks";
import { showToast } from "@/lib/slices/toastSlice";
import { useStep4PANMutation } from "../../../../../lib/redux/api/distributor/distributorauthApis";

export const PANStep: React.FC<StepProps> = ({
    data,
    errors,
    onChange,
    onNext,
    onBack,
}) => {
    const dispatch = useAppDispatch();
    const [isVerifying, setIsVerifying] = useState(false);
    const [panError, setPanError] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [step4PAN] = useStep4PANMutation();

    // Load phone number from localStorage
    useEffect(() => {
        const savedPhone =
            localStorage.getItem("distributor_verified_phone") ||
            localStorage.getItem("distributor_mobile") ||
            "";
        if (savedPhone) {
            const formattedPhone = savedPhone.startsWith("+")
                ? savedPhone
                : `+91${savedPhone.replace(/^0+/, "")}`;
            setPhoneNumber(formattedPhone);
        }
    }, []);

    const handlePANVerify = async () => {
        const cleanPan = data.pan_number?.toUpperCase().replace(/[^A-Z0-9]/g, "") || "";

        // Validate PAN number
        if (cleanPan.length !== 10) {
            setPanError("Please enter a valid 10-character PAN");
            dispatch(showToast({
                message: "Please enter a valid 10-character PAN",
                type: "error",
            }));
            return;
        }

        if (!phoneNumber) {
            setPanError("Phone number not found. Please go back and verify your mobile.");
            dispatch(showToast({
                message: "Phone number not found. Please verify your mobile first.",
                type: "error",
            }));
            return;
        }

        setPanError("");
        setIsVerifying(true);

        try {
            const response = await step4PAN({
                phone: phoneNumber,
                encrypted_pan: cleanPan,
            }).unwrap();

            if (response.status) {
                // PAN verified successfully
                onChange({
                    target: {
                        name: "pan_verified",
                        value: true,
                    },
                } as any);

                dispatch(showToast({
                    message: "✅ PAN verified successfully!",
                    type: "success",
                }));

                // Auto proceed to next step
                setTimeout(() => {
                    onNext?.();
                }, 1000);
            } else {
                const errorMsg = response.message || "PAN verification failed. Please try again.";
                setPanError(errorMsg);
                dispatch(showToast({
                    message: errorMsg,
                    type: "error",
                }));
            }
        } catch (error: any) {
            console.error("PAN verification error:", error);
            const errorMsg = error?.data?.message || error?.message || "PAN verification failed. Please try again.";
            setPanError(errorMsg);
            dispatch(showToast({
                message: errorMsg,
                type: "error",
            }));
        } finally {
            setIsVerifying(false);
        }
    };

    const handlePANChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
        if (value.length > 10) value = value.slice(0, 10);

        onChange({
            target: {
                name: "pan_number",
                value: value,
            },
        } as any);

        setPanError("");
    };

    const cleanPan = data.pan_number?.toUpperCase().replace(/[^A-Z0-9]/g, "") || "";

    return (
        <div className="space-y-5">
            <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-[#06101E]">PAN Verification</h2>
                <p className="text-gray-500 text-sm mt-1">
                    Verify your PAN for tax compliance
                </p>
            </div>

            <InfoBox type="info" title="Why this is needed">
                PAN verification is mandatory for distributor activation. A verified PAN is required
                for tax deduction on commission and compliance with income tax regulations.
            </InfoBox>

            <div className="space-y-4">
                <Input
                    label="PAN Number"
                    name="pan_number"
                    value={data.pan_number || ""}
                    onChange={handlePANChange}
                    error={errors.pan_number || panError}
                    placeholder="Enter 10-character PAN (e.g., ABCDE1234F)"
                    maxLength={10}
                    required
                    helperText={
                        data.pan_verified
                            ? "✅ PAN verified"
                            : "PAN is unique across all distributor accounts"
                    }
                    className={`w-full h-14 px-4 text-black rounded-xl border-gray-200 focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200 ${data.pan_verified ? "border-green-500 bg-green-50" : ""
                        }`}
                    disabled={isVerifying || data.pan_verified}
                />

                {isVerifying && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 -mt-2">
                        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Verifying PAN...
                    </div>
                )}

                <FormActions
                    onBack={onBack}
                    onNext={data.pan_verified ? onNext : undefined}
                    onSubmit={!data.pan_verified ? handlePANVerify : undefined}
                    isSubmitDisabled={
                        !data.pan_number ||
                        cleanPan.length !== 10 ||
                        isVerifying ||
                        data.pan_verified ||
                        !phoneNumber
                    }
                    isLoading={isVerifying}
                    submitLabel={isVerifying ? "Verifying..." : "Verify PAN"}
                    nextLabel="Continue →"
                />
            </div>
        </div>
    );
};