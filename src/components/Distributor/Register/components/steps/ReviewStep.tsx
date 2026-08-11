// components/distributor/registration/components/steps/ReviewStep.tsx

"use client";

import React, { useState } from "react";
import { Button } from "@/components/common/Button";
import Link from "next/link";
import { FormActions } from "../FormActions";
import { StepProps } from "../../types";

export const ReviewStep: React.FC<StepProps> = ({
    data,
    onBack,
    onSubmit,
    isLoading,
    errors,
    onChange,
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        await onSubmit?.();
        setIsSubmitting(false);
    };

    const checkboxes = [
        {
            name: "terms_accepted",
            label: "Terms of Use",
            href: "/terms",
        },
        {
            name: "agreement_accepted",
            label: "Distributor Agreement",
            href: "/distributor-agreement",
        },
        {
            name: "code_of_conduct_accepted",
            label: "Code of Conduct",
            href: "/code-of-conduct",
        },
    ];

    const isAllAccepted = checkboxes.every(
        (cb) => data[cb.name as keyof typeof data] === true
    );

    return (
        <div className="space-y-5">
            <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-[#06101E]">Review & Submit</h2>
                <p className="text-gray-500 text-sm mt-1">
                    Review all information before submitting
                </p>
            </div>

            <ReviewSummary data={data} />

            <div className="space-y-3 pt-2">
                {checkboxes.map((cb) => (
                    <CheckboxField
                        key={cb.name}
                        name={cb.name}
                        label={cb.label}
                        href={cb.href}
                        checked={data[cb.name as keyof typeof data] as boolean}
                        onChange={onChange}
                    />
                ))}

                {(errors.terms_accepted || errors.agreement_accepted || errors.code_of_conduct_accepted) && (
                    <p className="text-xs text-red-500">
                        You must accept all terms to submit your application
                    </p>
                )}
            </div>

            <FormActions
                onBack={onBack}
                onSubmit={handleSubmit}
                isSubmitDisabled={!isAllAccepted}
                isLoading={isLoading || isSubmitting}
                submitLabel="Submit Application"
                showBack={true}
            />
        </div>
    );
};

interface ReviewSummaryProps {
    data: any;
}

const ReviewSummary: React.FC<ReviewSummaryProps> = ({ data }) => {
    const fields = [
        { label: "Full Name", value: data.full_name },
        { label: "Date of Birth", value: data.date_of_birth },
        { label: "Email", value: data.email },
        { label: "Mobile", value: `+91 ${data.mobile} ✓` },
        { label: "Sponsor", value: data.sponsor_id || "None" },
        { label: "Placement Leg", value: data.placement_leg || "Auto" },
        { label: "Aadhaar", value: `****${data.aadhaar_number?.slice(-4)} ${data.aadhaar_verified ? "✓" : ""}` },
        { label: "PAN", value: `${data.pan_number} ${data.pan_verified ? "✓" : ""}` },
        { label: "Bank", value: data.bank_name },
        { label: "Account No", value: `****${data.bank_account_number?.slice(-4)}` },
        { label: "IFSC", value: data.bank_ifsc_code },
        { label: "Location", value: data.location_consent ? "Granted" : "Declined" },
    ];

    return (
        <div className="bg-gray-50/80 backdrop-blur-sm rounded-xl p-5 border-2 border-gray-200 max-h-64 overflow-y-auto">
            <div className="grid grid-cols-2 gap-2 text-sm">
                {fields.map((field) => (
                    <React.Fragment key={field.label}>
                        <div className="font-medium text-gray-600">{field.label}:</div>
                        <div className="text-[#06101E] font-medium truncate">
                            {field.value || "-"}
                        </div>
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

interface CheckboxFieldProps {
    name: string;
    label: string;
    href: string;
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CheckboxField: React.FC<CheckboxFieldProps> = ({
    name,
    label,
    href,
    checked,
    onChange,
}) => (
    <label className="flex items-start gap-3 cursor-pointer">
        <input
            type="checkbox"
            name={name}
            checked={checked}
            onChange={onChange}
            className="mt-1 w-4 h-4 rounded border-gray-300 text-[#F9C744] focus:ring-[#F9C744] flex-shrink-0"
        />
        <span className="text-sm text-gray-600 leading-relaxed">
            I accept the{" "}
            <Link href={href} className="text-[#B98F1E] hover:underline font-medium">
                {label}
            </Link>
        </span>
    </label>
);