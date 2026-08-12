// components/distributor/registration/components/steps/LocationStep.tsx

"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/common/Button";
import { InfoBox } from "../InfoBox";
import { FormActions } from "../FormActions";
import { StepProps } from "../../types";
import { useAppDispatch } from "@/lib/redux/hooks";
import { showToast } from "@/lib/slices/toastSlice";
import { useStep6LocationMutation } from "../../../../../lib/redux/api/distributor/distributorauthApis";

export const LocationStep: React.FC<StepProps> = ({
    data,
    errors,
    onChange,
    onNext,
    onBack,
}) => {
    const dispatch = useAppDispatch();
    const [isCapturing, setIsCapturing] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [locationStatus, setLocationStatus] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [step6Location] = useStep6LocationMutation();

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
                : `+91${savedPhone.replace(/^0+/, "")}`;
            setPhoneNumber(formattedPhone);
        }
    }, []);

    const handleCaptureLocation = () => {
        setIsCapturing(true);
        setLocationStatus("Requesting location...");

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;

                    // Update form data with coordinates
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
            // Call the API
            const response = await step6Location({
                phone: phoneNumber,
                location_consent: data.location_consent ? 1 : 0,
                latitude: latitude,
                longitude: longitude,
            }).unwrap();

            if (response.status) {
                // Location consent submitted successfully
                dispatch(
                    showToast({
                        message:
                            response.message || "✅ Location consent submitted successfully!",
                        type: "success",
                    }),
                );

                // Mark as verified
                onChange({
                    target: {
                        name: "location_verified",
                        value: true,
                    },
                } as any);

                // Auto proceed to next step after successful submission
                setTimeout(() => {
                    onNext?.();
                }, 1500);
            } else {
                // Location submission failed
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

    const handleConsentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({
            target: {
                name: "location_consent",
                value: e.target.checked,
            },
        } as any);
    };

    return (
        <div className="space-y-5">
            <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-[#06101E]">Location Consent</h2>
                <p className="text-gray-500 text-sm mt-1">
                    Consent for location capture for fraud prevention
                </p>
            </div>

            <InfoBox type="info" title="📍 Purpose">
                Location is captured once at registration for fraud prevention. It is
                never tracked continuously. Declining consent does not affect
                registration.
            </InfoBox>

            <div className="space-y-4">
                <div className="space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            name="location_consent"
                            checked={data.location_consent || false}
                            onChange={handleConsentChange}
                            disabled={isVerifying || data.location_verified}
                            className="mt-1 w-4 h-4 rounded border-gray-300 text-[#F9C744] focus:ring-[#F9C744] flex-shrink-0"
                        />
                        <span className="text-sm text-gray-600 leading-relaxed">
                            I consent to my location being recorded once at registration for
                            fraud prevention purposes as per the Digital Personal Data
                            Protection Act, 2023.
                        </span>
                    </label>
                    {errors.location_consent && (
                        <p className="text-xs text-red-500">{errors.location_consent}</p>
                    )}
                </div>

                {data.location_consent && (
                    <LocationCapture
                        onCapture={handleCaptureLocation}
                        isCapturing={isCapturing}
                        status={locationStatus}
                        latitude={data.latitude}
                        longitude={data.longitude}
                        disabled={isVerifying || data.location_verified}
                    />
                )}

                {data.location_verified && (
                    <div className="bg-green-50/80 backdrop-blur-sm p-3 rounded-xl border border-green-100 text-sm text-green-700 flex items-center gap-2">
                        <span className="text-lg flex-shrink-0">✅</span> Location consent
                        submitted successfully
                    </div>
                )}

                {isVerifying && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 animate-pulse">
                        <svg
                            className="w-4 h-4 animate-spin"
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
                        Submitting location consent...
                    </div>
                )}

                <FormActions
                    onBack={onBack}
                    onNext={data.location_verified ? onNext : handleSubmitLocation}
                    isNextDisabled={
                        !data.location_consent ||
                        isVerifying ||
                        isCapturing ||
                        !phoneNumber ||
                        data.location_verified
                    }
                    isLoading={isVerifying}
                    nextLabel={data.location_verified ? "Continue →" : "Submit Location"}
                />
            </div>
        </div>
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
    <div className="bg-gray-50/80 backdrop-blur-sm p-5 rounded-xl border-2 border-gray-200">
        <Button
            type="button"
            onClick={onCapture}
            loading={isCapturing}
            disabled={disabled}
            className="h-12 px-8 bg-gradient-to-r from-[#F9C744] to-[#E6B33D] hover:from-[#E6B33D] hover:to-[#D4A030] text-[#06101E] font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
            📍 Capture Location
        </Button>
        {status && (
            <p
                className={`text-sm mt-3 ${status.includes("✓") ? "text-green-600" : "text-yellow-600"
                    }`}
            >
                {status}
            </p>
        )}
        {latitude && longitude && (
            <p className="text-xs text-gray-500 mt-1">
                Coordinates:{" "}
                {typeof latitude === "number" ? latitude.toFixed(4) : latitude},{" "}
                {typeof longitude === "number" ? longitude.toFixed(4) : longitude}
            </p>
        )}
    </div>
);
