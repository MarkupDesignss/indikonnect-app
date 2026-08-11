// components/distributor/registration/components/steps/LocationStep.tsx

"use client";

import React, { useState } from "react";
import { Button } from "@/components/common/Button";
import { InfoBox } from "../InfoBox";
import { FormActions } from "../FormActions";
import { StepProps } from "../../types";

export const LocationStep: React.FC<StepProps> = ({
    data,
    errors,
    onChange,
    onNext,
    onBack,
}) => {
    const [isCapturing, setIsCapturing] = useState(false);
    const [locationStatus, setLocationStatus] = useState("");

    const handleCaptureLocation = () => {
        setIsCapturing(true);
        setLocationStatus("Requesting location...");

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    onChange({
                        target: { name: "latitude", value: position.coords.latitude },
                    } as any);
                    onChange({
                        target: { name: "longitude", value: position.coords.longitude },
                    } as any);
                    setLocationStatus("✓ Location captured successfully");
                    setIsCapturing(false);
                },
                (error) => {
                    setLocationStatus(
                        "⚠ Unable to capture location. Fallback to IP-derived location."
                    );
                    setIsCapturing(false);
                }
            );
        } else {
            setLocationStatus(
                "⚠ Geolocation not supported. Fallback to IP-derived location."
            );
            setIsCapturing(false);
        }
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
                Location is captured once at registration for fraud prevention. It is never tracked continuously. Declining consent does not affect registration.
            </InfoBox>

            <div className="space-y-4">
                <div className="space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            name="location_consent"
                            checked={data.location_consent}
                            onChange={onChange}
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
                    />
                )}

                <FormActions onBack={onBack} onNext={onNext} />
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
}

const LocationCapture: React.FC<LocationCaptureProps> = ({
    onCapture,
    isCapturing,
    status,
    latitude,
    longitude,
}) => (
    <div className="bg-gray-50/80 backdrop-blur-sm p-5 rounded-xl border-2 border-gray-200">
        <Button
            type="button"
            onClick={onCapture}
            loading={isCapturing}
            className="h-12 px-8 bg-gradient-to-r from-[#F9C744] to-[#E6B33D] hover:from-[#E6B33D] hover:to-[#D4A030] text-[#06101E] font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
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
                Coordinates: {latitude.toFixed(4)}, {longitude.toFixed(4)}
            </p>
        )}
    </div>
);