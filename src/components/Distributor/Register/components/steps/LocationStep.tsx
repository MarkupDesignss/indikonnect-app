// components/distributor/registration/components/steps/LocationStep.tsx

"use client";

import React, { useState, useEffect } from "react";
import {
    PlusCircle,
    AlertTriangle,
    X,
    Loader2,
    CheckCircle,
    MapPin,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { InfoBox } from "../InfoBox";
import { FormActions } from "../FormActions";
import { StepProps } from "../../types";
import { useAppDispatch } from "@/lib/redux/hooks";
import { showToast } from "@/lib/slices/toastSlice";
import {
    useStep6LocationMutation,
    useLazyGetStepDataQuery,
    distributorAuthApi,
} from "../../../../../lib/redux/api/distributor/distributorauthApis";
import authApi from "@/lib/redux/api/authApi";

/**
 * Same theme tokens as EmailCheckScreen so both steps of the flow feel like
 * one product instead of two differently-styled screens.
 */
const theme = {
    font: "'Inter', 'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, sans-serif",
    gold: "#F9C744",
    goldDark: "#E6B33D",
    goldDeep: "#C9922A",
    navy: "#06101E",
    navySoft: "#0B1B2E",
};

export const LocationStep: React.FC<StepProps> = ({
    data,
    errors,
    onChange,
    onNext,
    onBack,
    onBackToMobile,
}) => {
    const dispatch = useAppDispatch();
    const [isCapturing, setIsCapturing] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [locationStatus, setLocationStatus] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isDataLoadedFromAPI, setIsDataLoadedFromAPI] = useState(false);

    // API Hooks
    const [step6Location] = useStep6LocationMutation();
    const [getStepData, { isLoading: isLoadingStepData }] =
        useLazyGetStepDataQuery();

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (showConfirmModal) {
            document.body.style.overflow = "hidden";
            document.body.style.position = "fixed";
            document.body.style.width = "100%";
            document.body.style.top = `-${window.scrollY}px`;
        } else {
            const scrollY = document.body.style.top;
            document.body.style.overflow = "";
            document.body.style.position = "";
            document.body.style.width = "";
            document.body.style.top = "";
            if (scrollY) {
                window.scrollTo(0, parseInt(scrollY || "0", 10) * -1);
            }
        }

        return () => {
            document.body.style.overflow = "";
            document.body.style.position = "";
            document.body.style.width = "";
            document.body.style.top = "";
        };
    }, [showConfirmModal]);

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
            console.log("📡 Fetching step 6 data for email:", email);
            const response = await getStepData({
                step: "6",
                phone: email,
            }).unwrap();

            if (response.status && response.step_data) {
                console.log("✅ Step 6 data fetched:", response);

                const userData = response.step_data.user;
                const profileData = response.step_data.distributor_profile;

                // Check if location consent is given
                if (userData.location_consent_given === 1) {
                    // Set consent as true
                    onChange({
                        target: {
                            name: "location_consent",
                            value: true,
                        },
                    } as any);

                    // Set location if available
                    if (profileData.location_consent === 1) {
                        onChange({
                            target: {
                                name: "location_verified",
                                value: true,
                            },
                        } as any);

                        setLocationStatus("✓ Location consent already submitted");
                    }

                    // Mark data as loaded from API
                    setIsDataLoadedFromAPI(true);

                    dispatch(
                        showToast({
                            message: "Loaded location data successfully",
                            type: "success",
                        }),
                    );
                }
            }
        } catch (error: any) {
            console.error("Error fetching step 6 data:", error);
            if (error?.status !== 404) {
                dispatch(
                    showToast({
                        message: error?.data?.message || "Failed to load location data",
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
                console.log("📧 Loading location data for email:", email);
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
    // ✅ LOCATION CAPTURE
    // ==========================================

    const handleCaptureLocation = () => {
        setIsCapturing(true);
        setLocationStatus("Requesting location...");

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;

                    onChange({
                        target: { name: "latitude", value: lat },
                    } as any);
                    onChange({
                        target: { name: "longitude", value: lng },
                    } as any);

                    setLocationStatus("✓ Location captured successfully");
                    setIsCapturing(false);

                    dispatch(
                        showToast({
                            message: "📍 Location captured successfully!",
                            type: "success",
                        }),
                    );
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    let errorMsg = "⚠ Unable to capture location. ";

                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMsg += "Location permission denied. ";
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMsg += "Location information unavailable. ";
                            break;
                        case error.TIMEOUT:
                            errorMsg += "Location request timed out. ";
                            break;
                        default:
                            errorMsg += "Unknown error occurred. ";
                    }

                    errorMsg += "Fallback to IP-derived location.";
                    setLocationStatus(errorMsg);
                    setIsCapturing(false);

                    dispatch(
                        showToast({
                            message: "Unable to capture location. Using fallback.",
                            type: "warning",
                        }),
                    );
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0,
                },
            );
        } else {
            setLocationStatus(
                "⚠ Geolocation not supported. Fallback to IP-derived location.",
            );
            setIsCapturing(false);

            dispatch(
                showToast({
                    message: "Geolocation not supported. Using fallback.",
                    type: "warning",
                }),
            );
        }
    };

    // ==========================================
    // ✅ LOCATION SUBMISSION
    // ==========================================

    const handleSubmitLocation = async () => {
        // Validate location consent
        if (!data.location_consent) {
            dispatch(
                showToast({
                    message: "Please consent to location capture",
                    type: "error",
                }),
            );
            return;
        }

        if (!phoneNumber) {
            dispatch(
                showToast({
                    message: "Phone number not found. Please verify your mobile first.",
                    type: "error",
                }),
            );
            return;
        }

        // If location not captured, use default values (0,0 as fallback)
        const latitude = data.latitude || 0;
        const longitude = data.longitude || 0;

        setIsVerifying(true);

        try {
            const response = await step6Location({
                phone: phoneNumber,
                location_consent: data.location_consent ? 1 : 0,
                latitude: latitude,
                longitude: longitude,
            }).unwrap();

            if (response.status) {
                dispatch(
                    showToast({
                        message:
                            response.message || "✅ Location consent submitted successfully!",
                        type: "success",
                    }),
                );

                onChange({
                    target: {
                        name: "location_verified",
                        value: true,
                    },
                } as any);

                // Fetch step data after successful submission
                await fetchStepData();

                setTimeout(() => {
                    onNext?.();
                }, 1500);
            } else {
                const errorMsg =
                    response.message || "Location submission failed. Please try again.";
                dispatch(
                    showToast({
                        message: errorMsg,
                        type: "error",
                    }),
                );
            }
        } catch (error: any) {
            console.error("Location submission error:", error);
            const errorMsg =
                error?.data?.message ||
                error?.message ||
                "Location submission failed. Please try again.";
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
    // ✅ HANDLE NEXT - POST OR NAVIGATE
    // ==========================================

    const handleNext = () => {
        // ✅ CHECK: If data is loaded from API and location is verified,
        // just navigate to next step without calling POST API
        if (isDataLoadedFromAPI && data.location_verified) {
            console.log(
                "✅ Location data already exists - Navigating to next step without POST",
            );
            dispatch(
                showToast({
                    message:
                        "Location consent already submitted. Proceeding to next step.",
                    type: "success",
                }),
            );
            setTimeout(() => onNext(), 500);
            return;
        }

        // If not verified, submit location
        if (!data.location_verified) {
            handleSubmitLocation();
        } else {
            onNext();
        }
    };

    // ==========================================
    // ✅ HANDLE INPUT CHANGES
    // ==========================================

    const handleConsentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Reset API loaded state when user changes input
        if (isDataLoadedFromAPI) {
            setIsDataLoadedFromAPI(false);
        }

        onChange({
            target: {
                name: "location_consent",
                value: e.target.checked,
            },
        } as any);
    };

    // Check if Continue button should be enabled
    const isContinueEnabled = () => {
        if (isDataLoadedFromAPI && data.location_verified) {
            return true;
        }
        return !!(
            data.location_consent &&
            !isVerifying &&
            !isCapturing &&
            phoneNumber &&
            !data.location_verified
        );
    };

    // Get button label
    const getButtonLabel = () => {
        if (isDataLoadedFromAPI && data.location_verified) {
            return "Continue";
        }
        if (isVerifying) {
            return "Submitting...";
        }
        return "Submit Location";
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
                {/* Centered surface card, matching the EmailCheckScreen card system */}
                <div className="w-full max-w-lg mx-auto">
                    <div className="relative rounded-[28px] bg-white/90 backdrop-blur-xl border border-[var(--navy)]/[0.06] shadow-[0_20px_60px_-15px_rgba(6,16,30,0.15)] px-6 py-8 sm:px-9 sm:py-10">
                        {/* Ambient glow to match the email step */}
                        <div className="pointer-events-none absolute inset-x-0 -top-10 flex justify-center">
                            <div className="w-40 h-40 rounded-full bg-[radial-gradient(circle,_rgba(249,199,68,0.3)_0%,_rgba(249,199,68,0)_70%)] blur-xl" />
                        </div>

                        <div className="relative space-y-5">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[var(--gold)] via-[var(--gold-dark)] to-[var(--gold-deep)] flex items-center justify-center shadow-[0_8px_20px_-6px_rgba(249,199,68,0.55)] flex-shrink-0">
                                            <MapPin className="w-5 h-5 text-[var(--navy)]" />
                                        </div>
                                        <h2 className="text-2xl font-bold tracking-tight text-[var(--navy)]">
                                            Location Consent
                                        </h2>
                                    </div>
                                    <p className="text-gray-500 text-sm font-medium">
                                        Consent for location capture for fraud prevention
                                    </p>
                                    {isLoadingStepData && (
                                        <div className="flex items-center justify-start gap-2 mt-2 text-sm text-gray-500">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Loading your location data...
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
                    transition-colors duration-200 whitespace-nowrap"
                                >
                                    <PlusCircle className="w-4 h-4" />
                                    New Registration
                                </button>
                            </div>

                            <InfoBox type="info" title="📍 Purpose">
                                Location is captured once at registration for fraud prevention. It is
                                never tracked continuously. Declining consent does not affect
                                registration.
                            </InfoBox>

                            <div className="space-y-4">
                                <div className="space-y-3">
                                    <label className="flex items-start gap-3 cursor-pointer bg-gray-50/70 border border-gray-100 rounded-2xl p-4 hover:border-[var(--gold)]/30 transition-colors">
                                        <input
                                            type="checkbox"
                                            name="location_consent"
                                            checked={data.location_consent || false}
                                            onChange={handleConsentChange}
                                            disabled={
                                                isVerifying ||
                                                data.location_verified ||
                                                (isDataLoadedFromAPI && data.location_verified)
                                            }
                                            className="mt-1 w-4 h-4 rounded border-gray-300 text-[var(--gold-deep)] focus:ring-[var(--gold)] flex-shrink-0"
                                        />
                                        <span className="text-sm text-gray-600 leading-relaxed font-medium">
                                            I consent to my location being recorded once at registration for
                                            fraud prevention purposes as per the Digital Personal Data
                                            Protection Act, 2023.
                                        </span>
                                    </label>
                                    {errors.location_consent && (
                                        <p className="text-xs text-red-500 font-medium pl-1">
                                            {errors.location_consent}
                                        </p>
                                    )}
                                </div>

                                {data.location_consent && !data.location_verified && (
                                    <LocationCapture
                                        onCapture={handleCaptureLocation}
                                        isCapturing={isCapturing}
                                        status={locationStatus}
                                        latitude={data.latitude}
                                        longitude={data.longitude}
                                        disabled={
                                            isVerifying ||
                                            data.location_verified ||
                                            (isDataLoadedFromAPI && data.location_verified)
                                        }
                                    />
                                )}

                                {data.location_verified && (
                                    <div className="bg-emerald-50/80 backdrop-blur-sm p-4 rounded-2xl border border-emerald-100 text-sm text-emerald-700 flex items-center gap-2.5 font-medium">
                                        <CheckCircle className="w-4 h-4 flex-shrink-0" />
                                        <span>
                                            Location consent submitted successfully
                                            {isDataLoadedFromAPI && (
                                                <span className="ml-2 text-xs text-blue-600">
                                                    (loaded from saved data)
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                )}

                                {isVerifying && (
                                    <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Submitting location consent...
                                    </div>
                                )}

                                <FormActions
                                    onBack={onBack}
                                    onNext={
                                        isDataLoadedFromAPI && data.location_verified ? onNext : undefined
                                    }
                                    onSubmit={
                                        !isDataLoadedFromAPI || !data.location_verified
                                            ? handleSubmitLocation
                                            : undefined
                                    }
                                    isSubmitDisabled={!isContinueEnabled()}
                                    isLoading={isVerifying}
                                    submitLabel={getButtonLabel()}
                                    nextLabel="Continue →"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div
                    className="fixed inset-0 z-[9999] overflow-y-auto"
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(6, 16, 30, 0.7)",
                        backdropFilter: "blur(4px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "1rem",
                        fontFamily: theme.font,
                    }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setShowConfirmModal(false);
                        }
                    }}
                >
                    <div
                        className="bg-white rounded-[28px] max-w-md w-full mx-4 p-6 sm:p-7 shadow-[0_30px_80px_-20px_rgba(6,16,30,0.5)] relative"
                        style={{
                            maxHeight: "90vh",
                            overflowY: "auto",
                            margin: "auto",
                        }}
                    >
                        <button
                            type="button"
                            onClick={() => setShowConfirmModal(false)}
                            className="absolute right-4 top-4 text-gray-400 hover:text-[#06101E] hover:bg-gray-100 rounded-full p-1.5 transition-colors z-10"
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

interface LocationCaptureProps {
    onCapture: () => void;
    isCapturing: boolean;
    status: string;
    latitude?: number;
    longitude?: number;
    disabled?: boolean;
}

const LocationCapture: React.FC<LocationCaptureProps> = ({
    onCapture,
    isCapturing,
    status,
    latitude,
    longitude,
    disabled,
}) => (
    <div className="bg-gray-50/80 backdrop-blur-sm p-5 rounded-2xl border-2 border-gray-100 text-center sm:text-left">
        <Button
            type="button"
            onClick={onCapture}
            loading={isCapturing}
            disabled={disabled}
            className="h-12 px-8 bg-gradient-to-b from-[#F9C744] to-[#E6B33D] hover:brightness-105 active:brightness-95 text-[#06101E] font-semibold rounded-xl transition-all duration-200 shadow-[0_8px_20px_-6px_rgba(249,199,68,0.55)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
            📍 Capture Location
        </Button>
        {status && (
            <p
                className={`text-sm mt-3 font-medium ${status.includes("✓") ? "text-emerald-600" : "text-amber-600"
                    }`}
            >
                {status}
            </p>
        )}
        {latitude && longitude && (
            <p className="text-xs text-gray-500 mt-1 font-medium">
                Coordinates:{" "}
                {typeof latitude === "number" ? latitude.toFixed(4) : latitude},{" "}
                {typeof longitude === "number" ? longitude.toFixed(4) : longitude}
            </p>
        )}
    </div>
);
