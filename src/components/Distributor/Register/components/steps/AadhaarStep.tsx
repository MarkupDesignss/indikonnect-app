// components/distributor/registration/components/steps/AadhaarStep.tsx

"use client";

import React, { useState, useEffect } from "react";
import {
    PlusCircle,
    AlertTriangle,
    X,
    Loader2,
    CheckCircle,
    Fingerprint,
} from "lucide-react";

import { InfoBox } from "../InfoBox";
import { FormActions } from "../FormActions";
import { StepProps } from "../../types";
import { useAppDispatch } from "@/lib/redux/hooks";
import { showToast } from "@/lib/slices/toastSlice";
import {
    useStep3AadhaarMutation,
    useLazyGetStepDataQuery,
    distributorAuthApi,
} from "../../../../../lib/redux/api/distributor/distributorauthApis";
import authApi from "@/lib/redux/api/authApi";

/**
 * Same theme tokens as EmailCheckScreen / LocationStep / BankStep / PANStep
 * so every step of the flow reads as one product instead of separately
 * styled screens.
 */
const theme = {
    font: "'Inter', 'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, sans-serif",
    gold: "#F9C744",
    goldDark: "#E6B33D",
    goldDeep: "#C9922A",
    navy: "#06101E",
    navySoft: "#0B1B2E",
};

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
    const [isDataLoadedFromAPI, setIsDataLoadedFromAPI] = useState(false);
    const [aadhaarLast4, setAadhaarLast4] = useState("");

    // API Hooks
    const [step3Aadhaar] = useStep3AadhaarMutation();
    const [getStepData, { isLoading: isLoadingStepData }] =
        useLazyGetStepDataQuery();

    // ✅ Log when component mounts and when onNext changes
    useEffect(() => {
        console.log("🔵 AadhaarStep mounted/updated:", {
            onNextExists: !!onNext,
            onNextType: typeof onNext,
            dataAadhaarVerified: data?.aadhaar_verified,
            isDataLoadedFromAPI,
        });
    }, [onNext, data?.aadhaar_verified, isDataLoadedFromAPI]);

    // Load phone number from localStorage
    useEffect(() => {
        const savedPhone =
            localStorage.getItem("distributor_verified_phone") ||
            localStorage.getItem("distributor_mobile") ||
            "";
        if (savedPhone) {
            const formattedPhone = savedPhone.startsWith("+")
                ? savedPhone
                : "+91" + savedPhone.replace(/^0+/, "");
            setPhoneNumber(formattedPhone);
        }
    }, []);

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
            console.log("📡 Fetching step 3 data for email:", email);
            const response = await getStepData({
                step: "3",
                phone: email,
            }).unwrap();

            if (response.status && response.step_data) {
                console.log("✅ Step 3 data fetched:", response);

                const userData = response.step_data.user;

                // Check if Aadhaar is verified
                if (userData.aadhaar_last4) {
                    // The API returns aadhaar_last4 as "****6456" (already masked)
                    const last4 = userData.aadhaar_last4;
                    setAadhaarLast4(last4);

                    // Mark as verified
                    onChange({
                        target: {
                            name: "aadhaar_verified",
                            value: true,
                        },
                    } as any);

                    onChange({
                        target: {
                            name: "aadhaar_consent",
                            value: true,
                        },
                    } as any);

                    // ✅ Use the value directly from API - DO NOT mask again
                    // The API already returns it as "****6456"
                    onChange({
                        target: {
                            name: "aadhaar_number",
                            value: last4, // Directly use the API value
                        },
                    } as any);

                    // Mark data as loaded from API
                    setIsDataLoadedFromAPI(true);

                    // Clear any existing errors
                    setAadhaarError("");

                    dispatch(
                        showToast({
                            message: "Loaded Aadhaar verification data successfully",
                            type: "success",
                        }),
                    );

                    console.log("✅ Aadhaar data loaded from API:", {
                        aadhaarLast4: last4,
                        isDataLoadedFromAPI: true,
                    });
                }
            }
        } catch (error: any) {
            console.error("Error fetching step 3 data:", error);
            if (error?.status !== 404) {
                dispatch(
                    showToast({
                        message: error?.data?.message || "Failed to load Aadhaar data",
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
                console.log("📧 Loading Aadhaar data for email:", email);
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
    // ✅ CHECK IF VALUE IS FROM API (CONTAINS STARS)
    // ==========================================

    const isFromAPI = (value: string) => {
        return value?.includes("*") || false;
    };

    // ==========================================
    // ✅ AADHAAR VERIFICATION (POST API CALL)
    // ==========================================

    const handleAadhaarVerify = async () => {
        console.log("🔵 handleAadhaarVerify called", {
            isDataLoadedFromAPI,
            aadhaarVerified: data.aadhaar_verified,
            aadhaarNumber: data.aadhaar_number,
        });

        // ✅ If data is loaded from API and verified, navigate directly
        if (isDataLoadedFromAPI && data.aadhaar_verified) {
            console.log("✅ Data from API - Navigating directly");
            if (onNext) {
                onNext();
            }
            return;
        }

        // ✅ If Aadhaar contains stars (from API), navigate directly without validation
        if (isFromAPI(data.aadhaar_number) && data.aadhaar_verified) {
            console.log(
                "✅ Aadhaar from API - Navigating directly without validation",
            );
            if (onNext) {
                onNext();
            }
            return;
        }

        // Get clean number for manual entry
        const cleanNumber = data.aadhaar_number?.replace(/\D/g, "") || "";

        // Validate Aadhaar number for manual entry
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
            const response = await step3Aadhaar({
                phone: phoneNumber,
                encrypted_aadhaar: cleanNumber,
                aadhaar_consent: data.aadhaar_consent ? 1 : 0,
            }).unwrap();

            if (response.status) {
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

                await fetchStepData();

                setTimeout(() => {
                    console.log("✅ Auto-navigating after verification...");
                    if (onNext) {
                        onNext();
                    }
                }, 1000);
            } else {
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

    // ==========================================
    // ✅ HANDLE CONTINUE - DIRECT NAVIGATION
    // ==========================================

    const handleContinue = () => {
        console.log("🔵 handleContinue called", {
            isDataLoadedFromAPI,
            aadhaarVerified: data.aadhaar_verified,
            aadhaarNumber: data.aadhaar_number,
            isFromAPI: isFromAPI(data.aadhaar_number),
            onNextExists: !!onNext,
        });

        // ✅ If Aadhaar is verified, navigate directly
        if (data.aadhaar_verified) {
            console.log("✅ Aadhaar verified - Navigating to next step");
            if (onNext) {
                console.log("✅ Calling onNext()...");
                onNext();
                return;
            }
            console.error("❌ onNext is undefined!");
            return;
        }

        // If not verified, call verification API
        if (!data.aadhaar_verified) {
            handleAadhaarVerify();
        }
    };

    // ==========================================
    // ✅ HANDLE INPUT CHANGES
    // ==========================================

    const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // If the value contains stars (from API), ignore changes
        if (e.target.value.includes("*")) {
            console.log("⚠️ Value contains stars - ignoring change");
            return;
        }

        // Get the raw value (remove any formatting)
        let value = e.target.value.replace(/\D/g, "");

        // Limit to 12 digits
        if (value.length > 12) value = value.slice(0, 12);

        // Format with dashes after every 4 digits
        let formattedValue = "";
        for (let i = 0; i < value.length; i++) {
            if (i > 0 && i % 4 === 0) {
                formattedValue += "-";
            }
            formattedValue += value[i];
        }

        // Reset API loaded state when user changes input
        if (isDataLoadedFromAPI) {
            setIsDataLoadedFromAPI(false);
        }

        // Clear error when user starts typing
        setAadhaarError("");

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

    // ✅ Check if Aadhaar is from API (contains *)
    const isAadhaarFromAPI = isFromAPI(data.aadhaar_number);

    // ✅ Get clean Aadhaar number for validation
    const getCleanAadhaarForValidation = () => {
        // ✅ If value contains stars (from API), skip validation
        if (isAadhaarFromAPI) {
            return "123456789012"; // Dummy valid number to bypass validation
        }
        // Remove all non-digit characters for manual entry
        return data.aadhaar_number?.replace(/\D/g, "") || "";
    };

    const cleanAadhaar = getCleanAadhaarForValidation();

    // Check if Continue button should be enabled
    const isContinueEnabled = () => {
        // ✅ If Aadhaar is verified, always enabled
        if (data.aadhaar_verified) {
            return true;
        }

        // ✅ If value contains stars (from API), bypass validation
        if (isAadhaarFromAPI) {
            return true;
        }

        // For manual entry, validate normally
        return (
            data.aadhaar_consent &&
            data.aadhaar_number &&
            cleanAadhaar.length === 12 &&
            !isVerifying
        );
    };

    // Get button label
    const getButtonLabel = () => {
        if (data.aadhaar_verified) {
            return "Continue";
        }
        if (isVerifying) {
            return "Verifying...";
        }
        return "Verify Aadhaar";
    };

    // ✅ Determine if we should show the "Continue" button directly
    const shouldShowContinue = data.aadhaar_verified === true;

    // ✅ Determine if there's an error to show
    const hasError =
        (errors.aadhaar_number || aadhaarError) &&
        !isAadhaarFromAPI &&
        !data.aadhaar_verified;

    console.log("🔵 Render state:", {
        shouldShowContinue,
        isDataLoadedFromAPI,
        aadhaarVerified: data.aadhaar_verified,
        isAadhaarFromAPI,
        aadhaarNumber: data.aadhaar_number,
        cleanAadhaar,
        hasError,
        onNextExists: !!onNext,
    });

    const fieldDisabled =
        isVerifying ||
        data.aadhaar_verified ||
        (isDataLoadedFromAPI && data.aadhaar_verified);

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
                                            <Fingerprint className="w-5 h-5 text-[var(--navy)]" />
                                        </div>
                                        <h2 className="text-2xl font-bold tracking-tight text-[var(--navy)]">
                                            Aadhaar Verification
                                        </h2>
                                    </div>
                                    <p className="text-gray-500 text-sm font-medium">
                                        Verify your identity through licensed KYC provider
                                    </p>
                                    {isLoadingStepData && (
                                        <div className="flex items-center justify-start gap-2 mt-2 text-sm text-gray-500">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Loading your Aadhaar data...
                                        </div>
                                    )}
                                    {isDataLoadedFromAPI && (
                                        <div className="mt-2 text-xs font-semibold text-emerald-600 bg-emerald-50 py-1 px-3 rounded-full inline-block">
                                            ✓ Aadhaar already verified
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
                                    <label className="text-sm font-semibold text-gray-700 block">
                                        Aadhaar Number <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="aadhaar_number"
                                            value={data.aadhaar_number || ""}
                                            onChange={handleAadhaarChange}
                                            placeholder={
                                                isDataLoadedFromAPI ? "****-****-****" : "XXXX-XXXX-XXXX"
                                            }
                                            maxLength={14}
                                            className={
                                                "w-full h-14 px-4 text-black rounded-2xl border tracking-wider font-medium " +
                                                (hasError
                                                    ? "border-red-400 ring-2 ring-red-100"
                                                    : data.aadhaar_verified
                                                        ? "border-emerald-400 bg-emerald-50/60"
                                                        : isDataLoadedFromAPI
                                                            ? "border-blue-400 bg-blue-50/60"
                                                            : "border-gray-200") +
                                                " bg-white focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all duration-200 outline-none placeholder:text-gray-400 placeholder:tracking-normal placeholder:font-normal"
                                            }
                                            disabled={fieldDisabled}
                                        />
                                        {data.aadhaar_verified && (
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                <CheckCircle className="w-5 h-5 text-emerald-500" />
                                            </div>
                                        )}
                                    </div>
                                    {hasError && (
                                        <p className="text-xs text-red-500 mt-1 font-medium">
                                            {errors.aadhaar_number || aadhaarError}
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-400 mt-1 font-medium">
                                        {data.aadhaar_verified
                                            ? "✓ Aadhaar already verified. Only last 4 digits are visible."
                                            : "Format: XXXX-XXXX-XXXX (12 digits)"}
                                    </p>
                                </div>

                                {/* Consent Checkbox */}
                                <div className="space-y-1.5">
                                    <label className="flex items-start gap-3 cursor-pointer bg-gray-50/70 border border-gray-100 rounded-2xl p-4 hover:border-[var(--gold)]/30 transition-colors">
                                        <input
                                            type="checkbox"
                                            name="aadhaar_consent"
                                            checked={data.aadhaar_consent || false}
                                            onChange={handleConsentChange}
                                            disabled={fieldDisabled}
                                            className="mt-1 w-4 h-4 rounded border-gray-300 text-[var(--gold-deep)] focus:ring-[var(--gold)] flex-shrink-0"
                                        />
                                        <span className="text-sm text-gray-600 leading-relaxed font-medium">
                                            I consent to Aadhaar verification through a licensed KYC
                                            provider for the purpose of identity verification as per the
                                            Digital Personal Data Protection Act, 2023.
                                        </span>
                                    </label>
                                    {errors.aadhaar_consent && (
                                        <p className="text-xs text-red-500 font-medium pl-1">
                                            {errors.aadhaar_consent}
                                        </p>
                                    )}
                                </div>

                                {/* Verified Status */}
                                {data.aadhaar_verified && (
                                    <div className="bg-emerald-50/80 backdrop-blur-sm p-4 rounded-2xl border border-emerald-100 text-sm text-emerald-700 flex items-center gap-2.5 font-medium">
                                        <CheckCircle className="w-4 h-4 flex-shrink-0" />
                                        <span>
                                            Aadhaar verified successfully
                                            {isDataLoadedFromAPI && (
                                                <span className="ml-2 text-xs text-blue-600">
                                                    (loaded from saved data)
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                )}

                                {/* ✅ Show Continue button directly when Aadhaar is verified */}
                                {shouldShowContinue ? (
                                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                        <button
                                            type="button"
                                            onClick={onBack}
                                            className="text-gray-600 hover:text-[var(--navy)] font-semibold text-sm transition-colors"
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleContinue}
                                            className="bg-gradient-to-b from-[var(--gold)] to-[var(--gold-dark)] hover:brightness-105 active:brightness-95 text-[var(--navy)] font-semibold px-8 py-3 rounded-xl transition-all duration-200 shadow-[0_8px_20px_-6px_rgba(249,199,68,0.55)] flex items-center gap-2"
                                            id="aadhaar-continue-btn"
                                        >
                                            <span>Continue</span>
                                            <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 5l7 7-7 7"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                ) : (
                                    <FormActions
                                        onBack={onBack}
                                        onSubmit={handleAadhaarVerify}
                                        isSubmitDisabled={!isContinueEnabled()}
                                        isLoading={isVerifying}
                                        submitLabel={getButtonLabel()}
                                        nextLabel="Continue"
                                    />
                                )}
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
                                Warning: Your current progress will be lost
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowConfirmModal(false)}
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl transition-all duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleNewRegistration}
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_8px_20px_-6px_rgba(239,68,68,0.5)]"
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
