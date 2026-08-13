// components/distributor/registration/components/steps/ReviewStep.tsx

"use client";

import React, { useState, useEffect } from "react";
import {
  PlusCircle,
  AlertTriangle,
  X,
  Loader2,
  CheckCircle,
  FileText,
  Shield,
  Users,
  Award,
  UserCheck,
  Calendar,
  Mail,
  Phone,
  CreditCard,
  MapPin,
  Building2,
  Landmark,
  BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import Link from "next/link";
import { FormActions } from "../FormActions";
import { StepProps } from "../../types";
import { useAppDispatch } from "@/lib/redux/hooks";
import { showToast } from "@/lib/slices/toastSlice";
<<<<<<< Updated upstream
import { useStep7SubmitMutation } from "../../../../../lib/redux/api/distributor/distributorauthApis";
import { useRouter } from "next/navigation";
=======
import {
  useStep7SubmitMutation,
  useLazyGetStepDataQuery,
  distributorAuthApi,
} from "../../../../../lib/redux/api/distributor/distributorauthApis";
import authApi from "@/lib/redux/api/authApi";
import { InfoBox } from "../InfoBox";

/**
 * Same theme tokens as SponsorStep / IdentityStep / EmailCheckScreen / LocationStep / BankStep / PANStep / AadhaarStep
 * so every step of the flow reads as one product instead of separately styled screens.
 */
const theme = {
  font: "'Inter', 'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, sans-serif",
  gold: "#F9C744",
  goldDark: "#E6B33D",
  goldDeep: "#C9922A",
  navy: "#06101E",
  navySoft: "#0B1B2E",
};
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
  const router = useRouter();
=======
>>>>>>> Stashed changes
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [step7Submit] = useStep7SubmitMutation();
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [applicationData, setApplicationData] = useState<any>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
<<<<<<< Updated upstream

=======
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isDataLoadedFromAPI, setIsDataLoadedFromAPI] = useState(false);
  const [isStepCompleted, setIsStepCompleted] = useState(false);

  // API Hooks
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

>>>>>>> Stashed changes
  // Load phone number from localStorage
  useEffect(() => {
    const savedPhone =
      localStorage.getItem("distributor_verified_phone") ||
      localStorage.getItem("distributor_mobile") ||
      "";
    if (savedPhone) {
<<<<<<< Updated upstream
      // Format phone number with country code if needed
=======
>>>>>>> Stashed changes
      const formattedPhone = savedPhone.startsWith("+")
        ? savedPhone
        : `+91${savedPhone.replace(/^0+/, "")}`;
      setPhoneNumber(formattedPhone);
    }
  }, []);
<<<<<<< Updated upstream

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
=======

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
      console.log("📡 Fetching step 7 data for email:", email);
      const response = await getStepData({
        step: "7",
        phone: email,
      }).unwrap();

      if (response.status && response.step_data) {
        console.log("✅ Step 7 data fetched:", response);

        const userData = response.step_data.user;
        const profileData = response.step_data.distributor_profile;

        // Check if registration is completed
        if (profileData.registration_completed === 1) {
          setIsStepCompleted(true);
          setSubmitSuccess(true);

          // Set application data if available
          if (userData.distributor_status) {
            setApplicationData({
              application_id: userData.id,
              distributor_id: userData.id,
              status: userData.distributor_status,
            });
          }

          // Mark data as loaded from API
          setIsDataLoadedFromAPI(true);

          dispatch(
            showToast({
              message: "Application already submitted successfully",
              type: "success",
            }),
          );
        }
      }
    } catch (error: any) {
      console.error("Error fetching step 7 data:", error);
      if (error?.status !== 404) {
        dispatch(
          showToast({
            message:
              error?.data?.message || "Failed to load application status",
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
        console.log("📧 Loading application data for email:", email);
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
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
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

=======
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
  // ✅ SUBMIT APPLICATION
  // ==========================================

>>>>>>> Stashed changes
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
<<<<<<< Updated upstream

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
=======

    try {
      const response = await step7Submit({
        phone: phoneNumber,
        accept_terms: data.terms_accepted ? 1 : 0,
        accept_agreement: data.agreement_accepted ? 1 : 0,
        accept_code_of_conduct: data.code_of_conduct_accepted ? 1 : 0,
      }).unwrap();

      if (response.status) {
        setSubmitSuccess(true);
        setApplicationData(response.data);

        localStorage.setItem(
          "distributor_application_data",
          JSON.stringify({
            application_id: response.data?.application_id,
            distributor_id: response.data?.distributor_id,
            status: response.data?.status || "submitted",
            submitted_at: new Date().toISOString(),
          }),
        );

        localStorage.setItem("distributor_application_status", "submitted");

        dispatch(
          showToast({
            message:
              response.message || "✅ Application submitted successfully!",
            type: "success",
          }),
        );

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

        // Fetch step data after successful submission
        await fetchStepData();

        if (onSubmit) {
          await onSubmit();
        }

        setTimeout(() => {
          if (onNext) {
            onNext();
          }
        }, 2000);
      } else {
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

  // ==========================================
  // ✅ HANDLE NEXT - POST OR NAVIGATE
  // ==========================================

  const handleNext = () => {
    // ✅ CHECK: If data is loaded from API and application is submitted,
    // just navigate to next step without calling POST API
    if (isDataLoadedFromAPI && isStepCompleted) {
      console.log(
        "✅ Application already submitted - Navigating to next step without POST",
      );
      dispatch(
        showToast({
          message: "Application already submitted. Proceeding to next step.",
          type: "success",
        }),
      );
      setTimeout(() => onNext(), 500);
      return;
    }

    // If not submitted, submit application
    if (!isStepCompleted) {
      handleSubmit();
    } else {
      onNext();
    }
  };

  const checkboxes = [
    {
      name: "terms_accepted",
      label: "Terms of Use",
      href: "/terms",
      icon: FileText,
    },
    {
      name: "agreement_accepted",
      label: "Distributor Agreement",
      href: "/distributor-agreement",
      icon: Shield,
    },
    {
      name: "code_of_conduct_accepted",
      label: "Code of Conduct",
      href: "/code-of-conduct",
      icon: Award,
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

  // Check if Continue button should be enabled
  const isContinueEnabled = () => {
    if (isDataLoadedFromAPI && isStepCompleted) {
      return true;
    }
    return !!(
      isAllAccepted &&
      !isSubmitting &&
      phoneNumber &&
      isAllStepsVerified
    );
  };

  // Get button label
  const getButtonLabel = () => {
    if (isDataLoadedFromAPI && isStepCompleted) {
      return "Continue →";
    }
    if (isSubmitting) {
      return "Submitting...";
    }
    return "Submit Application";
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
                      <FileText className="w-5 h-5 text-[var(--navy)]" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-[var(--navy)]">
                      Review & Submit
                    </h2>
                  </div>
                  <p className="text-gray-500 text-sm font-medium">
                    Review all information before submitting
                  </p>
                  {isLoadingStepData && (
                    <div className="flex items-center justify-start gap-2 mt-2 text-sm text-gray-500">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading application status...
                    </div>
                  )}
                  {isDataLoadedFromAPI && (
                    <div className="mt-2 text-xs font-semibold text-blue-600 bg-blue-50 py-1 px-3 rounded-full inline-block">
                      Existing application found
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

              <InfoBox type="info" title="Before you submit">
                Please review all your information carefully. Once submitted,
                you won't be able to make changes.
              </InfoBox>

              {submitSuccess ? (
                <div className="bg-green-50/80 backdrop-blur-sm p-6 rounded-2xl border-2 border-green-200 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center ring-4 ring-green-50">
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-green-700 mb-2">
                    {isDataLoadedFromAPI
                      ? "Application Already Submitted!"
                      : "Application Submitted!"}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {isDataLoadedFromAPI
                      ? "Your distributor application has already been submitted successfully."
                      : "Your distributor application has been submitted successfully."}
                  </p>
                  {applicationData?.application_id && (
                    <p className="text-sm text-gray-500 mt-3">
                      Application ID:{" "}
                      <span className="font-mono font-semibold text-[var(--navy)]">
                        {applicationData.application_id}
                      </span>
                    </p>
                  )}
                  {applicationData?.distributor_id && (
                    <p className="text-sm text-gray-500">
                      Distributor ID:{" "}
                      <span className="font-mono font-semibold text-[var(--navy)]">
                        {applicationData.distributor_id}
                      </span>
                    </p>
                  )}
                  {applicationData?.status && (
                    <p className="text-sm text-gray-500">
                      Status:{" "}
                      <span className="font-semibold capitalize text-amber-600">
                        {applicationData.status}
                      </span>
                    </p>
                  )}
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
                        icon={cb.icon}
                        checked={data[cb.name as keyof typeof data] as boolean}
                        onChange={onChange}
                        disabled={
                          isSubmitting ||
                          (isDataLoadedFromAPI && isStepCompleted)
                        }
                      />
                    ))}

                    {(errors.terms_accepted ||
                      errors.agreement_accepted ||
                      errors.code_of_conduct_accepted) && (
                      <p className="text-xs text-red-500 font-medium">
                        You must accept all terms to submit your application
                      </p>
                    )}

                    {submissionError && (
                      <div className="bg-red-50/80 backdrop-blur-sm p-4 rounded-2xl border border-red-200 text-sm text-red-700 flex items-start gap-3 font-medium">
                        <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <span>{submissionError}</span>
                      </div>
                    )}

                    {!isAllStepsVerified && (
                      <div className="bg-amber-50/80 backdrop-blur-sm p-4 rounded-2xl border border-amber-200 text-sm text-amber-700 flex items-center gap-3 font-medium">
                        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                        <span>
                          Please complete all previous steps before submitting.
                          <button
                            onClick={onBackToMobile}
                            className="text-[var(--gold-deep)] hover:underline font-semibold ml-1"
                          >
                            Go to start
                          </button>
                        </span>
                      </div>
                    )}
                  </div>

                  {isSubmitting && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting application...
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4">
                    <button
                      type="button"
                      onClick={onBackToMobile}
                      className="text-gray-600 hover:text-gray-800 font-medium text-sm transition-colors duration-200"
                    >
                      Back to Start
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={!isContinueEnabled()}
                      className="bg-[var(--gold)] hover:bg-[var(--gold-dark)] text-[var(--navy)] font-semibold px-8 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-200 shadow-[0_8px_20px_-6px_rgba(249,199,68,0.5)] hover:shadow-[0_12px_28px_-8px_rgba(249,199,68,0.6)]"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        getButtonLabel()
                      )}
                    </button>
                  </div>
                </>
              )}
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
>>>>>>> Stashed changes
  );
};

interface ReviewSummaryProps {
  data: any;
}

const ReviewSummary: React.FC<ReviewSummaryProps> = ({ data }) => {
  const fields = [
<<<<<<< Updated upstream
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
=======
    { label: "Full Name", value: data.full_name, icon: UserCheck },
    { label: "Date of Birth", value: data.date_of_birth, icon: Calendar },
    { label: "Email", value: data.email, icon: Mail },
    {
      label: "Mobile",
      value: data.mobile ? `+91 ${data.mobile}` : "-",
      icon: Phone,
    },
    { label: "Sponsor ID", value: data.sponsor_id || "None", icon: Users },
    {
      label: "Placement Leg",
      value: data.placement_leg || "Auto",
      icon: Users,
    },
    {
      label: "Aadhaar",
      value: data.aadhaar_number
        ? `****${data.aadhaar_number?.slice(-4)}`
        : "-",
      icon: CreditCard,
      verified: data.aadhaar_verified,
    },
    {
      label: "PAN",
      value: data.pan_number || "-",
      icon: CreditCard,
      verified: data.pan_verified,
    },
    { label: "Bank Name", value: data.bank_name || "-", icon: Building2 },
    {
      label: "Account Number",
      value: data.bank_account_number
        ? `****${data.bank_account_number?.slice(-4)}`
        : "-",
      icon: Landmark,
    },
    { label: "IFSC Code", value: data.bank_ifsc_code || "-", icon: Landmark },
    {
      label: "Location Consent",
      value: data.location_consent ? "✅ Granted" : "❌ Declined",
      icon: MapPin,
>>>>>>> Stashed changes
    },
  ];

  return (
<<<<<<< Updated upstream
    <div className="bg-gray-50/80 backdrop-blur-sm rounded-xl p-5 border-2 border-gray-200 max-h-64 overflow-y-auto">
      <div className="grid grid-cols-2 gap-2 text-sm">
        {fields.map((field) => (
          <React.Fragment key={field.label}>
            <div className="font-medium text-gray-600">{field.label}:</div>
            <div className="text-[#06101E] font-medium truncate">
              {field.value || "-"}
            </div>
          </React.Fragment>
=======
    <div className="bg-gray-50/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-200 max-h-64 overflow-y-auto">
      <div className="grid grid-cols-1 gap-1.5 text-sm">
        {fields.map((field) => (
          <div
            key={field.label}
            className="flex items-start gap-2 py-1.5 border-b border-gray-100 last:border-0"
          >
            <div className="flex items-center gap-2 min-w-[120px] flex-shrink-0">
              {field.icon && (
                <span className="text-gray-400 flex-shrink-0">
                  <field.icon className="w-3.5 h-3.5" />
                </span>
              )}
              <span className="font-medium text-gray-600">{field.label}:</span>
            </div>
            <div className="flex items-center gap-2 flex-1">
              <span className="text-[var(--navy)] font-medium truncate">
                {field.value || "-"}
              </span>
              {field.verified && (
                <BadgeCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
              )}
            </div>
          </div>
>>>>>>> Stashed changes
        ))}
      </div>
    </div>
  );
};

interface CheckboxFieldProps {
  name: string;
  label: string;
  href: string;
<<<<<<< Updated upstream
=======
  icon: React.ElementType;
>>>>>>> Stashed changes
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

const CheckboxField: React.FC<CheckboxFieldProps> = ({
  name,
  label,
  href,
<<<<<<< Updated upstream
=======
  icon: Icon,
>>>>>>> Stashed changes
  checked,
  onChange,
  disabled,
}) => (
  <label
<<<<<<< Updated upstream
    className={`flex items-start gap-3 ${disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
=======
    className={`flex items-start gap-3 p-3 rounded-xl border transition-all duration-200 ${
      checked
        ? "border-green-200 bg-green-50/60"
        : "border-gray-200 hover:border-[var(--gold)]/40 hover:bg-[#FFFBEF]/50"
    } ${disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
>>>>>>> Stashed changes
  >
    <input
      type="checkbox"
      name={name}
      checked={checked}
      onChange={onChange}
      disabled={disabled}
<<<<<<< Updated upstream
      className="mt-1 w-4 h-4 rounded border-gray-300 text-[#F9C744] focus:ring-[#F9C744] flex-shrink-0"
    />
    <span className="text-sm text-gray-600 leading-relaxed">
      I accept the{" "}
      <Link href={href} className="text-[#B98F1E] hover:underline font-medium">
        {label}
      </Link>
    </span>
=======
      className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[var(--gold)] focus:ring-[var(--gold)] flex-shrink-0"
    />
    <div className="flex items-center gap-2">
      <Icon
        className={`w-4 h-4 ${checked ? "text-green-600" : "text-gray-400"}`}
      />
      <span
        className={`text-sm leading-relaxed ${checked ? "text-gray-700" : "text-gray-600"}`}
      >
        I accept the{" "}
        <Link
          href={href}
          className="text-[var(--gold-deep)] hover:underline font-semibold"
        >
          {label}
        </Link>
      </span>
    </div>
>>>>>>> Stashed changes
  </label>
);
