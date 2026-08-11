// components/distributor/registration/components/common/FormActions.tsx

import React from "react";
import { Button } from "@/components/common/Button";

interface FormActionsProps {
    onBack?: () => void;
    onNext?: () => void;
    onSubmit?: () => void;
    isNextDisabled?: boolean;
    isSubmitDisabled?: boolean;
    isLoading?: boolean;
    nextLabel?: string;
    submitLabel?: string;
    showBack?: boolean;
}

export const FormActions: React.FC<FormActionsProps> = ({
    onBack,
    onNext,
    onSubmit,
    isNextDisabled,
    isSubmitDisabled,
    isLoading,
    nextLabel = "Continue →",
    submitLabel = "Submit Application",
    showBack = true,
}) => {
    const handleAction = () => {
        if (onSubmit) {
            onSubmit();
        } else if (onNext) {
            onNext();
        }
    };

    return (
        <div className="flex gap-3 pt-4">
            {showBack && onBack && (
                <Button
                    type="button"
                    variant="outline"
                    onClick={onBack}
                    className="flex-1 h-14 text-black rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                >
                    Back
                </Button>
            )}
            <Button
                type="button"
                fullWidth
                loading={isLoading}
                onClick={handleAction}
                disabled={onSubmit ? isSubmitDisabled : isNextDisabled}
                className="flex-1 h-14 text-black bg-gradient-to-r from-[#F9C744] to-[#E6B33D] hover:from-[#E6B33D] hover:to-[#D4A030] text-[#06101E] font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-[#F9C744]/40 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {onSubmit ? submitLabel : nextLabel}
            </Button>
        </div>
    );
};