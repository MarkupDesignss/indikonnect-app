// components/distributor/registration/components/steps/SponsorStep.tsx

"use client";

import React, { useState, useEffect } from "react";
import {
    PlusCircle,
    AlertTriangle,
    X,
    Loader2,
    CheckCircle,
    Users,
} from "lucide-react";
import { Input } from "@/components/common/Input";
import { InfoBox } from "../InfoBox";
import { FormActions } from "../FormActions";
import { StepProps } from "../../types";
import { useAppDispatch } from "@/lib/redux/hooks";
import { showToast } from "@/lib/slices/toastSlice";
import {
    useStep2SponsorMutation,
    useLazyGetStepDataQuery,
    distributorAuthApi,
} from "../../../../../lib/redux/api/distributor/distributorauthApis";
import authApi from "@/lib/redux/api/authApi";

/**
 * Same theme tokens as EmailCheckScreen / LocationStep / BankStep / PANStep /
 * AadhaarStep so every step of the flow reads as one product instead of
 * separately styled screens.
 */
const theme = {
    font: "'Inter', 'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, sans-serif",
    gold: "#F9C744",
    goldDark: "#E6B33D",
    goldDeep: "#C9922A",
    navy: "#06101E",
    navySoft: "#0B1B2E",
};

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
    const [isDataLoadedFromAPI, setIsDataLoadedFromAPI] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // API Hooks
    const [step2Sponsor] = useStep2SponsorMutation();
    const [getStepData, { isLoading: isLoadingStepData }] =
        useLazyGetStepDataQuery();

    // Load phone number from localStorage
    useEffect(() => {
        const savedPhone =
            localStorage.getItem("distributor_verified_phone") ||
            localStorage.getItem("distributor_mobile") ||
            "";
        if (savedPhone) {
            let formattedPhone = savedPhone.trim();
            formattedPhone = formattedPhone.replace(/\s/g, "");
            if (!formattedPhone.startsWith("+")) {
                if (formattedPhone.startsWith("91")) {
                    formattedPhone = `+${formattedPhone}`;
                } else {
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
                }),
            );
        }
    }, [dispatch]);

    // ==========================================
    // ✅ FETCH STEP DATA FROM API
    // ==========================================

    const fetchStepData = async () => {
        const email = data.email || localStorage.getItem("distributor_email") || "";

        if (!email) {
            console.log("No email found to fetch step data");
            return;
        }

        try {
            console.log("📡 Fetching step 2 data for email:", email);
            const response = await getStepData({
                step: "2",
                phone: email,
            }).unwrap();

            if (response.status && response.step_data) {
                console.log("✅ Step 2 data fetched:", response);

                const userData = response.step_data.user;

                // Check if sponsor data exists
                if (userData.sponsor_id) {
                    // Populate sponsor ID
                    onChange({
                        target: { name: "sponsor_id", value: userData.sponsor_id },
                    } as any);

                    // Set sponsor as valid
                    setSponsorValid(true);
                    setValidationAttempted(true);
                    setSponsorName(userData.sponsor_id);

                    // If there's a sponsor name or ID in the response, use it
                    if (userData.sponsor_name) {
                        setSponsorName(userData.sponsor_name);
                    }

                    // Mark data as loaded from API
                    setIsDataLoadedFromAPI(true);

                    dispatch(
                        showToast({
                            message: "Loaded sponsor data successfully",
                            type: "success",
                        }),
                    );
                }
            }
        } catch (error: any) {
            console.error("Error fetching step 2 data:", error);
            if (error?.status !== 404) {
                dispatch(
                    showToast({
                        message: error?.data?.message || "Failed to load sponsor data",
                        type: "error",
                    }),
                );
            }
        }
    };

    // Load data on component mount
    useEffect(() => {
        const loadData = async () => {
            const emailFromProps = data.email;
            const emailFromStorage = localStorage.getItem("distributor_email");
            const email = emailFromProps || emailFromStorage || "";

            if (email) {
                console.log("📧 Loading sponsor data for email:", email);
                await fetchStepData();
            }
        };

        loadData();
    }, [data.email]);

    // ==========================================
    // ✅ CLEAR REGISTRATION DATA
    // ==========================================

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
            "distributor_email",
        ];

        itemsToRemove.forEach((item) => {
            localStorage.removeItem(item);
        });

        // Reset API state
        try {
            dispatch(distributorAuthApi.util.resetApiState());
            dispatch(authApi.util.resetApiState());
        } catch (error) {
            console.error("Error resetting API:", error);
        }
    };

    const handleNewRegistration = () => {
        clearAllRegistrationData();
        setShowConfirmModal(false);
        if (onBackToMobile) {
            onBackToMobile();
        }
    };

    // ==========================================
    // ✅ VALIDATE SPONSOR
    // ==========================================

    const validateSponsor = async (sponsorId: string) => {
        // Reset validation states
        setSponsorValid(false);
        setSponsorName("");
        setSponsorError("");
        setValidationAttempted(false);

        if (!sponsorId || sponsorId.trim().length === 0) {
            setSponsorError("Sponsor ID is required");
            dispatch(
                showToast({
                    message: "Please enter a Sponsor ID",
                    type: "error",
                }),
            );
            return false;
        }

        if (!phoneNumber) {
            setSponsorError(
                "Phone number not found. Please go back and verify your mobile.",
            );
            dispatch(
                showToast({
                    message: "Phone number not found. Please verify your mobile first.",
                    type: "error",
                }),
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

            const isSuccess =
                response?.status === true ||
                response?.success === true ||
                response?.status === "success";

            if (isSuccess) {
                setSponsorValid(true);
                setValidationAttempted(true);

                const sponsorNameFromResponse =
                    response?.sponsor_name ||
                    response?.data?.sponsor_name ||
                    response?.name ||
                    `Sponsor ID: ${sponsorId.trim()}`;

                setSponsorName(sponsorNameFromResponse);

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
                    }),
                );
                return true;
            } else {
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
                    }),
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
                }),
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
        setIsDataLoadedFromAPI(false); // Reset API loaded state when user changes input
        onChange(e);
    };

    // ==========================================
    // ✅ HANDLE NEXT - POST OR NAVIGATE
    // ==========================================

    const handleNext = async () => {
        if (!data.sponsor_id || data.sponsor_id.trim().length === 0) {
            setSponsorError("Sponsor ID is required");
            dispatch(
                showToast({
                    message: "Please enter a Sponsor ID",
                    type: "error",
                }),
            );
            return;
        }

        if (data.sponsor_id.trim().length < 3) {
            setSponsorError("Sponsor ID must be at least 3 characters");
            dispatch(
                showToast({
                    message: "Sponsor ID must be at least 3 characters",
                    type: "error",
                }),
            );
            return;
        }

        // ✅ CHECK: If data is loaded from API and sponsor is valid,
        // just navigate to next step without calling POST API
        if (isDataLoadedFromAPI && sponsorValid && data.sponsor_id) {
            console.log(
                "✅ Sponsor data already exists - Navigating to next step without POST",
            );

            dispatch(
                showToast({
                    message:
                        "Sponsor information already saved. Proceeding to next step.",
                    type: "success",
                }),
            );

            // Navigate to next step immediately
            setTimeout(() => onNext(), 500);
            return;
        }

        // If sponsor is already validated, proceed
        if (sponsorValid && data.sponsor_id) {
            onNext();
            return;
        }

        // Validate sponsor and proceed
        const isValid = await validateSponsor(data.sponsor_id);
        if (isValid) {
            // After validation, the POST API was already called in validateSponsor
            // Now we can navigate to next step
            setTimeout(() => onNext(), 500);
        }
    };

    // Check if Continue button should be enabled
    const isContinueEnabled = () => {
        if (isDataLoadedFromAPI && sponsorValid) {
            return true;
        }
        return (
            !sponsorLoading &&
            !isValidating &&
            phoneNumber &&
            data.sponsor_id &&
            data.sponsor_id.trim().length >= 3
        );
    };

    return (
        <>
            <div
                style={
                    {
                        fontFamily: theme.font,
                        "--gold": theme.gold,
                        "--gold-dark": theme.goldDark,
                        "--gold-deep": theme.goldDeep,
                        "--navy": theme.navy,
                        "--navy-soft": theme.navySoft,
                    } as React.CSSProperties
                }
                className="min-h-[60vh] flex items-center justify-center px-4 py-10"
            >
                {/* Centered surface card, matching the rest of the registration flow */}
                <div className="w-full max-w-lg mx-auto">
                    <div className="relative rounded-[28px] bg-white/90 backdrop-blur-xl border border-[var(--navy)]/[0.06] shadow-[0_20px_60px_-15px_rgba(6,16,30,0.15)] px-6 py-8 sm:px-9 sm:py-10">
                        {/* Ambient glow to match the other steps */}
                        <div className="pointer-events-none absolute inset-x-0 -top-10 flex justify-center">
                            <div className="w-40 h-40 rounded-full bg-[radial-gradient(circle,_rgba(249,199,68,0.3)_0%,_rgba(249,199,68,0)_70%)] blur-xl" />
                        </div>

                        <div className="relative space-y-5">
                            {/* Header with New Registration Button */}
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[var(--gold)] via-[var(--gold-dark)] to-[var(--gold-deep)] flex items-center justify-center shadow-[0_8px_20px_-6px_rgba(249,199,68,0.55)] flex-shrink-0">
                                            <Users className="w-5 h-5 text-[var(--navy)]" />
                                        </div>
                                        <h2 className="text-2xl font-bold tracking-tight text-[var(--navy)]">
                                            Sponsor Information
                                        </h2>
                                    </div>
                                    <p className="text-gray-500 text-sm font-medium">
                                        Identify who introduced you to the network
                                    </p>
                                    {isLoadingStepData && (
                                        <div className="flex items-center justify-start gap-2 mt-2 text-sm text-gray-500">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Loading your sponsor data...
                                        </div>
                                    )}
                                    {isDataLoadedFromAPI && (
                                        <div className="mt-2 text-xs font-semibold text-blue-600 bg-blue-50 py-1 px-3 rounded-full inline-block">
                                            Existing data loaded
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setShowConfirmModal(true)}
                                    className="group flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full
              border border-[var(--gold)]/40 bg-[#FFFBEF]
              text-sm font-semibold text-[var(--gold-deep)]
              hover:bg-[var(--gold)] hover:text-[var(--navy)] hover:border-[var(--gold)]
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
                                {/* Sponsor ID Input */}
                                <div className="space-y-1">
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
                                                : sponsorValid && isDataLoadedFromAPI
                                                    ? `✓ Existing sponsor: ${sponsorName}`
                                                    : sponsorValid
                                                        ? `✓ Valid sponsor: ${sponsorName}`
                                                        : validationAttempted && !sponsorValid
                                                            ? "⚠️ Invalid sponsor ID. Please check and try again."
                                                            : isDataLoadedFromAPI
                                                                ? "✓ Sponsor already saved"
                                                                : "Enter the ID of the distributor who referred you"
                                        }
                                        className={`w-full h-14 px-4 text-black rounded-xl border-gray-200 focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all duration-200 ${sponsorValid && isDataLoadedFromAPI
                                            ? "border-emerald-400 bg-emerald-50/60"
                                            : sponsorValid
                                                ? "border-emerald-400 bg-emerald-50/60"
                                                : validationAttempted && !sponsorValid
                                                    ? "border-red-400 bg-red-50/60"
                                                    : isDataLoadedFromAPI
                                                        ? "border-blue-400 bg-blue-50/60"
                                                        : ""
                                            }`}
                                        disabled={
                                            sponsorLoading ||
                                            !phoneNumber ||
                                            (isDataLoadedFromAPI && sponsorValid)
                                        }
                                    />

                                    {sponsorLoading && (
                                        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Validating sponsor...
                                        </div>
                                    )}

                                    {sponsorValid && (
                                        <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-100 text-sm text-emerald-700 flex items-center gap-2.5 font-medium">
                                            <CheckCircle className="w-4 h-4 flex-shrink-0" />
                                            <div>
                                                <span>Sponsor validated: </span>
                                                <strong>{sponsorName}</strong>
                                                {isDataLoadedFromAPI && (
                                                    <span className="ml-2 text-xs text-blue-600 font-normal">
                                                        (loaded from saved data)
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {!phoneNumber && (
                                        <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200 text-sm text-amber-700 flex items-center gap-2.5 font-medium">
                                            <span className="text-lg flex-shrink-0">⚠️</span>
                                            <span>
                                                Phone number not found. Please go back and verify your mobile.
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <FormActions
                                    onBack={onBack}
                                    onNext={handleNext}
                                    isNextDisabled={!isContinueEnabled()}
                                    nextLabel={
                                        isDataLoadedFromAPI && sponsorValid
                                            ? "Continue →"
                                            : "Validate & Continue →"
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--navy)]/70 backdrop-blur-sm px-4"
                    style={{ fontFamily: theme.font }}
                >
                    <div className="bg-white rounded-[28px] max-w-md w-full mx-4 p-6 sm:p-7 shadow-[0_30px_80px_-20px_rgba(6,16,30,0.5)] relative">
                        <button
                            type="button"
                            onClick={() => setShowConfirmModal(false)}
                            className="absolute right-4 top-4 text-gray-400 hover:text-[#06101E] hover:bg-gray-100 rounded-full p-1.5 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center ring-4 ring-amber-50">
                                <AlertTriangle className="w-8 h-8 text-amber-600" />
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-center text-[#06101E] mb-2 tracking-tight">
                            Start New Registration?
                        </h3>

                        <p className="text-gray-500 text-center text-sm mb-6 font-medium">
                            All your entered information will be discarded. This action cannot
                            be undone.
                        </p>

                        <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-6">
                            <p className="text-xs text-red-600 text-center font-semibold">
                                ⚠️ Your current progress will be lost
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowConfirmModal(false)}
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleNewRegistration}
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 shadow-[0_8px_20px_-6px_rgba(239,68,68,0.5)]"
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
