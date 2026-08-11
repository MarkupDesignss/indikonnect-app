// components/distributor/registration/components/steps/SponsorStep.tsx

"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/common/Input";
import { InfoBox } from "../InfoBox";
import { FormActions } from "../FormActions";
import { StepProps } from "../../types";

export const SponsorStep: React.FC<StepProps> = ({
    data,
    errors,
    onChange,
    onNext,
    onBack,
}) => {
    const [sponsorName, setSponsorName] = useState("");
    const [sponsorValid, setSponsorValid] = useState(false);
    const [sponsorLoading, setSponsorLoading] = useState(false);
    const [sponsorError, setSponsorError] = useState("");

    const validateSponsor = async () => {
        if (!data.sponsor_id) {
            setSponsorValid(false);
            setSponsorName("");
            setSponsorError("Sponsor ID is required");
            return;
        }

        setSponsorLoading(true);
        setSponsorError("");
        try {
            await new Promise((resolve) => setTimeout(resolve, 500));
            if (data.sponsor_id.length >= 6) {
                setSponsorValid(true);
                setSponsorName("John Smith (DIST-12345)");
                setSponsorError("");
            } else {
                setSponsorValid(false);
                setSponsorName("");
                setSponsorError("Sponsor ID must be at least 6 characters");
            }
        } catch (error) {
            setSponsorValid(false);
            setSponsorName("");
            setSponsorError("Failed to validate sponsor. Please try again.");
        } finally {
            setSponsorLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (data.sponsor_id) {
                validateSponsor();
            } else {
                setSponsorValid(false);
                setSponsorName("");
                setSponsorError("Sponsor ID is required");
            }
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [data.sponsor_id]);

    return (
        <div className="space-y-5">
            <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-[#06101E]">
                    Sponsor Information
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                    Identify who introduced you to the network
                </p>
            </div>

            <InfoBox type="info" title="Why this is needed">
                Your sponsor determines where you sit in the binary network and who earns against your activity.
            </InfoBox>

            <div className="space-y-4">
                <Input
                    label="Sponsor ID"
                    name="sponsor_id"
                    value={data.sponsor_id}
                    onChange={onChange}
                    error={errors.sponsor_id || sponsorError}
                    placeholder="Enter your sponsor's distributor ID"
                    required
                    helperText={
                        sponsorValid
                            ? `✓ Sponsor found: ${sponsorName}`
                            : "Enter the ID of the distributor who referred you"
                    }
                    className="w-full h-14 px-4 text-black rounded-xl border-gray-200 focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200"
                />

                {sponsorLoading && <SponsorLoadingIndicator />}

                <FormActions
                    onBack={onBack}
                    onNext={onNext}
                    isNextDisabled={!sponsorValid || !data.sponsor_id}
                />
            </div>
        </div>
    );
};

const SponsorLoadingIndicator = () => (
    <div className="flex items-center gap-2 text-sm text-gray-500 -mt-2">
        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        Validating sponsor...
    </div>
);