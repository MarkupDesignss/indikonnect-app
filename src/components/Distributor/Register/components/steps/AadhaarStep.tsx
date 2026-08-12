// components/distributor/registration/components/steps/AadhaarStep.tsx

"use client";

import React, { useState, useEffect } from "react";
import { PlusCircle, AlertTriangle, X } from "lucide-react";

import { InfoBox } from "../InfoBox";
import { FormActions } from "../FormActions";
import { StepProps } from "../../types";
import { useAppDispatch } from "@/lib/redux/hooks";
import { showToast } from "@/lib/slices/toastSlice";
import { useStep3AadhaarMutation } from "../../../../../lib/redux/api/distributor/distributorauthApis";

export const AadhaarStep: React.FC<StepProps> = ({
    data,
    errors,
    onChange,
    onNext,
    onBack,
    onBackToMobile,
}) => {
    const dispatch = useAppDispatch();
    const [isVerifying, setIsVerifying] = useState(false);
    const [aadhaarError, setAadhaarError] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [step3Aadhaar] = useStep3AadhaarMutation();

    // Load phone number from localStorage
    useEffect(() => {
        const savedPhone =
            localStorage.getItem("distributor_verified_phone") ||
            localStorage.getItem("distributor_mobile") ||
            "";
        if (savedPhone) {
            // Format phone number with country code if needed
            const formattedPhone = savedPhone.startsWith("+")
                ? savedPhone
                : "+91" + savedPhone.replace(/^0+/, "");
            setPhoneNumber(formattedPhone);
        }
    }, []);

    // Clear all registration data
    const clearAllRegistrationData = () => {
        const itemsToRemove = [
            "verified_phone",
            "phone_verified",
            "distributor_mobile",
            "verified_email",
            "email_verified",
            "temp_token",
            "distributor_check_status",
            "distributor_phone",
            "distributor_exists",
            "distributor_status",
            "user_data",
            "customer_otp",
            "customer_phone",
            "distributor_application",
            "distributor_application_data",
            "distributor_application_status",
            "distributor_verified_phone",
            "distributor_phone_verified",
            "distributor_verified_email",
            "distributor_email_verified",
            "distributor_temp_token",
        ];

        itemsToRemove.forEach((item) => {
            localStorage.removeItem(item);
        });
    };

    const handleNewRegistration = () => {
        clearAllRegistrationData();
        setShowConfirmModal(false);
        if (onBackToMobile) {
            onBackToMobile();
        }
    };

    const handleAadhaarVerify = async () => {
        const cleanNumber = data.aadhaar_number?.replace(/\D/g, "") || "";

        // Validate Aadhaar number
        if (cleanNumber.length !== 12) {
            setAadhaarError("Please enter a valid 12-digit Aadhaar number");
            dispatch(
                showToast({
                    message: "Please enter a valid 12-digit Aadhaar number",
                    type: "error",
                }),
            );
            return;
        }

        if (!data.aadhaar_consent) {
            setAadhaarError("You must consent to Aadhaar verification");
            dispatch(
                showToast({
                    message: "You must consent to Aadhaar verification",
                    type: "error",
                }),
            );
            return;
        }

        if (!phoneNumber) {
            setAadhaarError(
                "Phone number not found. Please go back and verify your mobile.",
            );
            dispatch(
                showToast({
                    message: "Phone number not found. Please verify your mobile first.",
                    type: "error",
                }),
            );
            return;
        }

        setAadhaarError("");
        setIsVerifying(true);

        try {
            // Call the actual API
            const response = await step3Aadhaar({
                phone: phoneNumber,
                encrypted_aadhaar: cleanNumber, // Send the raw 12-digit number
                aadhaar_consent: data.aadhaar_consent ? 1 : 0,
            }).unwrap();

            if (response.status) {
                // Aadhaar verified successfully
                onChange({
                    target: {
                        name: "aadhaar_verified",
                        value: true,
                    },
                } as any);

                dispatch(
                    showToast({
                        message: response.message || "Aadhaar verified successfully",
                        type: "success",
                    }),
                );

                // Auto proceed to next step after successful verification
                setTimeout(() => {
                    onNext?.();
                }, 1000);
            } else {
                // Aadhaar verification failed
                const errorMsg =
                    response.message || "Aadhaar verification failed. Please try again.";
                setAadhaarError(errorMsg);
                dispatch(
                    showToast({
                        message: errorMsg,
                        type: "error",
                    }),
                );
            }
        } catch (error: any) {
            console.error("Aadhaar verification error:", error);
            const errorMsg =
                error?.data?.message ||
                error?.message ||
                "Aadhaar verification failed. Please try again.";
            setAadhaarError(errorMsg);
            dispatch(
                showToast({
                    message: errorMsg,
                    type: "error",
                }),
            );
        } finally {
            setIsVerifying(false);
        }
    };

    const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        } as any);
    };

    const handleConsentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({
            target: {
                name: "aadhaar_consent",
                value: e.target.checked,
            },
        } as any);
    };

    // Get clean Aadhaar number for validation
    const cleanAadhaar = data.aadhaar_number?.replace(/\D/g, "") || "";

    return (
        <>
            <div className="space-y-5">
                {/* Header with New Registration Button */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-[#06101E]">
                            Aadhaar Verification
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">
                            Verify your identity through licensed KYC provider
                        </p>
                    </div>

                    {/* New Registration Button */}
                    <button
                        type="button"
                        onClick={() => setShowConfirmModal(true)}
                        className="group flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full
              border border-[#F9C744]/40 bg-[#FFFBEF]
              text-sm font-semibold text-[#B8860B]
              hover:bg-[#F9C744] hover:text-white hover:border-[#F9C744]
              shadow-sm hover:shadow-md
              transition-all duration-200 whitespace-nowrap"
                    >
                        <PlusCircle className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
                        New Registration
                    </button>
                </div>

                <InfoBox type="info" title="Why this is needed">
                    Aadhaar verification is mandatory for distributor registration. Your
                    Aadhaar number is verified through a licensed KYC provider and is
                    never stored in full.
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
                                value={data.aadhaar_number || ""}
                                onChange={handleAadhaarChange}
                                placeholder="XXXX-XXXX-XXXX"
                                maxLength={14}
                                className={
                                    "w-full h-14 px-4 text-black rounded-xl border " +
                                    (errors.aadhaar_number || aadhaarError
                                        ? "border-red-500"
                                        : data.aadhaar_verified
                                            ? "border-green-500 bg-green-50"
                                            : "border-gray-200") +
                                    " bg-white focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200 outline-none"
                                }
                                disabled={isVerifying || data.aadhaar_verified}
                            />
                            {data.aadhaar_verified && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <span className="text-green-500 text-lg">OK</span>
                                </div>
                            )}
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
                                checked={data.aadhaar_consent || false}
                                onChange={handleConsentChange}
                                disabled={isVerifying || data.aadhaar_verified}
                                className="mt-1 w-4 h-4 rounded border-gray-300 text-[#F9C744] focus:ring-[#F9C744] flex-shrink-0"
                            />
                            <span className="text-sm text-gray-600 leading-relaxed">
                                I consent to Aadhaar verification through a licensed KYC
                                provider for the purpose of identity verification as per the
                                Digital Personal Data Protection Act, 2023.
                            </span>
                        </label>
                        {errors.aadhaar_consent && (
                            <p className="text-xs text-red-500">{errors.aadhaar_consent}</p>
                        )}
                    </div>

                    {/* Verified Status */}
                    {data.aadhaar_verified && (
                        <div className="bg-green-50/80 backdrop-blur-sm p-3 rounded-xl border border-green-100 text-sm text-green-700 flex items-center gap-2">
                            <span className="text-lg flex-shrink-0">OK</span> Aadhaar verified
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
                            cleanAadhaar.length !== 12 ||
                            isVerifying ||
                            data.aadhaar_verified
                        }
                        isLoading={isVerifying}
                        submitLabel={isVerifying ? "Verifying..." : "Verify Aadhaar"}
                        nextLabel="Continue"
                    />
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl max-w-md w-full mx-4 p-6 shadow-2xl relative">
                        <button
                            type="button"
                            onClick={() => setShowConfirmModal(false)}
                            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
                                <AlertTriangle className="w-8 h-8 text-amber-600" />
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-center text-[#06101E] mb-2">
                            Start New Registration?
                        </h3>

                        <p className="text-gray-500 text-center text-sm mb-6">
                            All your entered information will be discarded. This action cannot
                            be undone.
                        </p>

                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
                            <p className="text-xs text-red-600 text-center">
                                Warning: Your current progress will be lost
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowConfirmModal(false)}
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-lg transition-all duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleNewRegistration}
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                <PlusCircle className="w-4 h-4" />
                                Yes, Start New
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
