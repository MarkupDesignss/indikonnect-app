// components/distributor/registration/components/steps/SponsorStep.tsx

"use client";

import React, { useState, useEffect } from "react";
import { PlusCircle, AlertTriangle, X } from "lucide-react";
import { Input } from "@/components/common/Input";
import { InfoBox } from "../InfoBox";
import { FormActions } from "../FormActions";
import { StepProps } from "../../types";
import { useAppDispatch } from "@/lib/redux/hooks";
import { showToast } from "@/lib/slices/toastSlice";
import { useStep2SponsorMutation } from "../../../../../lib/redux/api/distributor/distributorauthApis";

export const SponsorStep: React.FC<StepProps> = ({
    data,
    errors,
    onChange,
    onNext,
    onBack,
    onBackToMobile,
}) => {
    const dispatch = useAppDispatch();
    const [sponsorName, setSponsorName] = useState("");
    const [sponsorValid, setSponsorValid] = useState(false);
    const [sponsorLoading, setSponsorLoading] = useState(false);
    const [sponsorError, setSponsorError] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [isValidating, setIsValidating] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [validationAttempted, setValidationAttempted] = useState(false);

    // API Hook
    const [step2Sponsor] = useStep2SponsorMutation();

    // Load phone number from localStorage
    useEffect(() => {
        const savedPhone =
            localStorage.getItem("distributor_verified_phone") ||
            localStorage.getItem("distributor_mobile") ||
            "";
        if (savedPhone) {
            // Format phone number with country code if needed
            let formattedPhone = savedPhone.trim();
            // Remove any spaces or special characters
            formattedPhone = formattedPhone.replace(/\s/g, "");
            // Ensure it starts with +91 for Indian numbers
            if (!formattedPhone.startsWith("+")) {
                // Check if it starts with 91
                if (formattedPhone.startsWith("91")) {
                    formattedPhone = `+${formattedPhone}`;
                } else {
                    // Remove leading 0 if present
                    formattedPhone = formattedPhone.replace(/^0+/, "");
                    formattedPhone = `+91${formattedPhone}`;
                }
            }
            setPhoneNumber(formattedPhone);
            console.log("Phone number loaded:", formattedPhone);
        } else {
            console.warn("No phone number found in localStorage");
            dispatch(
                showToast({
                    message: "Phone number not found. Please verify your mobile first.",
                    type: "warning",
                })
            );
        }
    }, [dispatch]);

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

    const validateSponsor = async (sponsorId: string) => {
        // Reset validation states
        setSponsorValid(false);
        setSponsorName("");
        setSponsorError("");
        setValidationAttempted(false);

        // Validate sponsor ID is not empty
        if (!sponsorId || sponsorId.trim().length === 0) {
            setSponsorError("Sponsor ID is required");
            dispatch(
                showToast({
                    message: "Please enter a Sponsor ID",
                    type: "error",
                })
            );
            return false;
        }

        // Validate phone number exists
        if (!phoneNumber) {
            setSponsorError("Phone number not found. Please go back and verify your mobile.");
            dispatch(
                showToast({
                    message: "Phone number not found. Please verify your mobile first.",
                    type: "error",
                })
            );
            return false;
        }

        setSponsorLoading(true);
        setIsValidating(true);

        try {
            const requestData = {
                phone: phoneNumber,
                sponsor_id: sponsorId.trim(),
            };

            console.log("Calling step2-sponsor API with:", requestData);

            const response = await step2Sponsor(requestData).unwrap();
            console.log("API Response:", response);

            // Check if response is successful
            const isSuccess = response?.status === true ||
                response?.success === true ||
                response?.status === "success";

            if (isSuccess) {
                // Sponsor found successfully
                setSponsorValid(true);
                setValidationAttempted(true);

                // Get sponsor name from response
                const sponsorNameFromResponse =
                    response?.sponsor_name ||
                    response?.data?.sponsor_name ||
                    response?.name ||
                    `Sponsor ID: ${sponsorId.trim()}`;

                setSponsorName(sponsorNameFromResponse);

                // Update the data with sponsor info
                const event = {
                    target: {
                        name: "sponsor_name",
                        value: sponsorNameFromResponse,
                    },
                } as React.ChangeEvent<HTMLInputElement>;
                onChange(event);

                dispatch(
                    showToast({
                        message: `✓ Sponsor validated: ${sponsorNameFromResponse}`,
                        type: "success",
                    })
                );
                return true;
            } else {
                // Sponsor not found or error
                const errorMsg =
                    response?.message ||
                    response?.error ||
                    "Sponsor not found. Please check the ID and try again.";

                setSponsorError(errorMsg);
                setValidationAttempted(true);

                dispatch(
                    showToast({
                        message: errorMsg,
                        type: "error",
                    })
                );
                return false;
            }
        } catch (error: any) {
            console.error("Sponsor validation error:", error);

            let errorMsg = "Failed to validate sponsor. Please try again.";

            if (error?.data?.message) {
                errorMsg = error.data.message;
            } else if (error?.data?.error) {
                errorMsg = error.data.error;
            } else if (error?.message) {
                errorMsg = error.message;
            }

            setSponsorError(errorMsg);
            setValidationAttempted(true);

            dispatch(
                showToast({
                    message: errorMsg,
                    type: "error",
                })
            );
            return false;
        } finally {
            setSponsorLoading(false);
            setIsValidating(false);
        }
    };

    const handleSponsorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSponsorError("");
        setSponsorValid(false);
        setSponsorName("");
        setValidationAttempted(false);
        onChange(e);
    };

    const handleNext = async () => {
        if (!data.sponsor_id || data.sponsor_id.trim().length === 0) {
            setSponsorError("Sponsor ID is required");
            dispatch(
                showToast({
                    message: "Please enter a Sponsor ID",
                    type: "error",
                })
            );
            return;
        }

        if (data.sponsor_id.trim().length < 3) {
            setSponsorError("Sponsor ID must be at least 3 characters");
            dispatch(
                showToast({
                    message: "Sponsor ID must be at least 3 characters",
                    type: "error",
                })
            );
            return;
        }

        if (sponsorValid && data.sponsor_id) {
            onNext();
            return;
        }

        const isValid = await validateSponsor(data.sponsor_id);
        if (isValid) {
            onNext();
        }
    };

    return (
        <>
            <div className="space-y-5">
                {/* Header with New Registration Button */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-[#06101E]">
                            Sponsor Information
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">
                            Identify who introduced you to the network
                        </p>
                    </div>

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
                        <PlusCircle className="w-4 h-4" />
                        New Registration
                    </button>
                </div>

                <InfoBox type="info" title="Why this is needed">
                    Your sponsor determines where you sit in the binary network and who
                    earns against your activity.
                </InfoBox>

                <div className="space-y-4">
                    <Input
                        label="Sponsor ID"
                        name="sponsor_id"
                        value={data.sponsor_id || ""}
                        onChange={handleSponsorChange}
                        error={errors.sponsor_id || sponsorError}
                        placeholder="Enter your sponsor's distributor ID"
                        required
                        helperText={
                            sponsorLoading
                                ? "Validating sponsor..."
                                : sponsorValid
                                    ? `✓ Valid sponsor: ${sponsorName}`
                                    : validationAttempted && !sponsorValid
                                        ? "⚠️ Invalid sponsor ID. Please check and try again."
                                        : "Enter the ID of the distributor who referred you"
                        }
                        className={`w-full h-14 px-4 text-black rounded-xl border-gray-200 focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200 ${sponsorValid ? "border-green-500 bg-green-50" :
                            validationAttempted && !sponsorValid ? "border-red-500 bg-red-50" : ""
                            }`}
                        disabled={sponsorLoading || !phoneNumber}
                    />

                    {sponsorLoading && (
                        <div className="flex items-center gap-2 text-sm text-gray-500 -mt-2">
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                            Validating sponsor...
                        </div>
                    )}

                    {sponsorValid && (
                        <div className="bg-green-50/80 p-3 rounded-xl border border-green-100 text-sm text-green-700 flex items-center gap-2">
                            <span className="text-lg flex-shrink-0">✅</span>
                            <div>
                                <span>Sponsor validated: </span>
                                <strong>{sponsorName}</strong>
                            </div>
                        </div>
                    )}

                    {!phoneNumber && (
                        <div className="bg-yellow-50/80 p-3 rounded-xl border border-yellow-200 text-sm text-yellow-700 flex items-center gap-2">
                            <span className="text-lg flex-shrink-0">⚠️</span>
                            <span>Phone number not found. Please go back and verify your mobile.</span>
                        </div>
                    )}

                    <FormActions
                        onBack={onBack}
                        onNext={handleNext}
                        isNextDisabled={sponsorLoading || !phoneNumber || isValidating}
                        nextLabel="Continue to Documents →"
                    />
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-2xl max-w-md w-full mx-4 p-6 shadow-2xl relative">
                        <button
                            type="button"
                            onClick={() => setShowConfirmModal(false)}
                            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
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
                                ⚠️ Your current progress will be lost
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowConfirmModal(false)}
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleNewRegistration}
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2"
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