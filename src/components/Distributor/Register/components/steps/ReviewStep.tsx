// components/distributor/registration/components/steps/ReviewStep.tsx

"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/common/Button";
import Link from "next/link";
import { FormActions } from "../FormActions";
import { StepProps } from "../../types";
import { useAppDispatch } from "@/lib/redux/hooks";
import { showToast } from "@/lib/slices/toastSlice";
import { useStep7SubmitMutation } from "../../../../../lib/redux/api/distributor/distributorauthApis";
import { useRouter } from "next/navigation";

export const ReviewStep: React.FC<StepProps> = ({
  data,
  onBack,
  onSubmit,
  isLoading,
  errors,
  onChange,
  onNext,
  onBackToMobile,
}) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [step7Submit] = useStep7SubmitMutation();
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [applicationData, setApplicationData] = useState<any>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

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

  const clearNavigationHistory = () => {
    // Clear all localStorage data
    const keysToRemove = [
      "distributor_verified_phone",
      "distributor_mobile",
      "distributor_application_data",
      "distributor_application_status",
      "distributor_registration_data",
      "distributor_step_data",
      "distributor_form_data",
      "distributor_current_step",
      "distributor_registration_step",
      "distributor_temp_data",
      "verified_phone",
      "phone_verified",
      "distributor_email",
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
      "distributor_step_data",
      "distributor_step_completed",
      "distributor_fresh_registration",
      "distributor_user_data",
      "registration_step",
      "registration_data",
      "registration_completed",
      "auth_token",
      "auth_user",
      "auth_verified",
      "otp_timer",
      "otp_attempts",
      "otp_resend_timer",
    ];

    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
    });

    // Clear sessionStorage
    sessionStorage.clear();

    // Redirect to main distributor page (not dashboard)
    // This will replace the entire history with a single entry
    router.replace("/");
  };

  const handleSubmit = async () => {
    // Check if all checkboxes are accepted
    if (!isAllAccepted) {
      dispatch(
        showToast({
          message: "Please accept all terms and conditions",
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

    // Check if all previous steps are verified
    if (!isAllStepsVerified) {
      dispatch(
        showToast({
          message: "Please complete all previous steps before submitting.",
          type: "error",
        }),
      );
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      // Call the API
      const response = await step7Submit({
        phone: phoneNumber,
        accept_terms: data.terms_accepted ? 1 : 0,
        accept_agreement: data.agreement_accepted ? 1 : 0,
        accept_code_of_conduct: data.code_of_conduct_accepted ? 1 : 0,
      }).unwrap();

      if (response.status) {
        // Submission successful
        setSubmitSuccess(true);
        setApplicationData(response.data);

        // Store application data in localStorage for the success page
        localStorage.setItem(
          "distributor_application_data",
          JSON.stringify({
            application_id: response.data?.application_id,
            distributor_id: response.data?.distributor_id,
            status: response.data?.status || "submitted",
            submitted_at: new Date().toISOString(),
          }),
        );

        // Store the application status
        localStorage.setItem("distributor_application_status", "submitted");

        dispatch(
          showToast({
            message:
              response.message || "✅ Application submitted successfully!",
            type: "success",
          }),
        );

        // Update form data with submission status
        onChange({
          target: {
            name: "application_submitted",
            value: true,
          },
        } as any);

        if (response.data?.application_id) {
          onChange({
            target: {
              name: "application_id",
              value: response.data.application_id,
            },
          } as any);
        }

        if (response.data?.distributor_id) {
          onChange({
            target: {
              name: "distributor_id",
              value: response.data.distributor_id,
            },
          } as any);
        }

        // Call the parent onSubmit if provided
        if (onSubmit) {
          await onSubmit();
        }

        // Clear all navigation history and redirect to main distributor page
        setTimeout(() => {
          clearNavigationHistory();
        }, 2000);
      } else {
        // Submission failed
        const errorMsg =
          response.message ||
          "Application submission failed. Please try again.";
        setSubmissionError(errorMsg);
        dispatch(
          showToast({
            message: errorMsg,
            type: "error",
          }),
        );
      }
    } catch (error: any) {
      console.error("Application submission error:", error);
      const errorMsg =
        error?.data?.message ||
        error?.message ||
        "Application submission failed. Please try again.";
      setSubmissionError(errorMsg);
      dispatch(
        showToast({
          message: errorMsg,
          type: "error",
        }),
      );
    } finally {
      setIsSubmitting(false);
    }
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
    (cb) => data[cb.name as keyof typeof data] === true,
  );

  // Check if all previous steps are verified
  const isAllStepsVerified =
    data.aadhaar_verified &&
    data.pan_verified &&
    data.bank_verified &&
    data.location_verified;

  return (
    <div className="space-y-5">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-[#06101E]">Review & Submit</h2>
        <p className="text-gray-500 text-sm mt-1">
          Review all information before submitting
        </p>
      </div>

      {submitSuccess ? (
        <div className="bg-green-50/80 backdrop-blur-sm p-6 rounded-xl border-2 border-green-200 text-center">
          <div className="text-5xl mb-3">🎉</div>
          <h3 className="text-xl font-bold text-green-700 mb-2">
            Application Submitted!
          </h3>
          <p className="text-gray-600 text-sm">
            Your distributor application has been submitted successfully.
          </p>
          {applicationData?.application_id && (
            <p className="text-sm text-gray-500 mt-2">
              Application ID:{" "}
              <span className="font-mono font-semibold">
                {applicationData.application_id}
              </span>
            </p>
          )}
          {applicationData?.distributor_id && (
            <p className="text-sm text-gray-500">
              Distributor ID:{" "}
              <span className="font-mono font-semibold">
                {applicationData.distributor_id}
              </span>
            </p>
          )}
          <p className="text-xs text-gray-400 mt-3">
            Redirecting to distributor page...
          </p>
        </div>
      ) : (
        <>
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
                disabled={isSubmitting}
              />
            ))}

            {(errors.terms_accepted ||
              errors.agreement_accepted ||
              errors.code_of_conduct_accepted) && (
              <p className="text-xs text-red-500">
                You must accept all terms to submit your application
              </p>
            )}

            {submissionError && (
              <div className="bg-red-50/80 backdrop-blur-sm p-3 rounded-xl border border-red-200 text-sm text-red-700 flex items-start gap-2">
                <span className="text-lg flex-shrink-0">❌</span>
                <span>{submissionError}</span>
              </div>
            )}

            {!isAllStepsVerified && (
              <div className="bg-yellow-50/80 backdrop-blur-sm p-3 rounded-xl border border-yellow-200 text-sm text-yellow-700 flex items-center gap-2">
                <span className="text-lg flex-shrink-0">⚠️</span>
                Please complete all previous steps before submitting.
                <button
                  onClick={onBackToMobile}
                  className="text-[#F9C744] hover:underline font-medium ml-1"
                >
                  Go to start
                </button>
              </div>
            )}
          </div>

          {isSubmitting && (
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
              Submitting application...
            </div>
          )}

          <FormActions
            onBack={onBack}
            onSubmit={handleSubmit}
            isSubmitDisabled={
              !isAllAccepted ||
              isSubmitting ||
              !phoneNumber ||
              !isAllStepsVerified
            }
            isLoading={isLoading || isSubmitting}
            submitLabel="Submit Application"
            showBack={true}
          />
        </>
      )}
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
    { label: "Mobile", value: data.mobile ? `+91 ${data.mobile} ✓` : "-" },
    { label: "Sponsor", value: data.sponsor_id || "None" },
    { label: "Placement Leg", value: data.placement_leg || "Auto" },
    {
      label: "Aadhaar",
      value: data.aadhaar_number
        ? `****${data.aadhaar_number?.slice(-4)} ${data.aadhaar_verified ? "✓" : ""}`
        : "-",
    },
    {
      label: "PAN",
      value: data.pan_number
        ? `${data.pan_number} ${data.pan_verified ? "✓" : ""}`
        : "-",
    },
    { label: "Bank", value: data.bank_name || "-" },
    {
      label: "Account No",
      value: data.bank_account_number
        ? `****${data.bank_account_number?.slice(-4)}`
        : "-",
    },
    { label: "IFSC", value: data.bank_ifsc_code || "-" },
    {
      label: "Location",
      value: data.location_consent ? "Granted" : "Declined",
    },
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
  disabled?: boolean;
}

const CheckboxField: React.FC<CheckboxFieldProps> = ({
  name,
  label,
  href,
  checked,
  onChange,
  disabled,
}) => (
  <label
    className={`flex items-start gap-3 ${disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
  >
    <input
      type="checkbox"
      name={name}
      checked={checked}
      onChange={onChange}
      disabled={disabled}
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
