// components/distributor/registration/DistributorRegistrationFlow.tsx

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { useDistributorCheckStatusMutation } from "../../../lib/redux/api/distributor/distributorauthApis";
import { distributorAuthApi } from "../../../lib/redux/api/distributor/distributorauthApis";

import { DistributorFormData, Step } from "./types";
import { RegistrationLayout } from "./components/steps/RegistrationLayout";
import { ProgressSteps } from "./components/ProgressSteps";
import { EmailCheckScreen } from "./components/steps/MobileCheckScreen";
import { IdentityStep } from "./components/steps/IdentityStep";
import { SponsorStep } from "./components/steps/SponsorStep";
import { AadhaarStep } from "./components/steps/AadhaarStep";
import { PANStep } from "./components/steps/PANStep";
import { BankStep } from "./components/steps/BankStep";
import { LocationStep } from "./components/steps/LocationStep";
import { ReviewStep } from "./components/steps/ReviewStep";
import {
  PlusCircle,
  AlertTriangle,
  X,
  RefreshCw,
  Trash2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/common/Button";

const steps: Step[] = [
  { title: "Identity", component: IdentityStep },
  { title: "Sponsor", component: SponsorStep },
  { title: "Aadhaar", component: AadhaarStep },
  { title: "PAN", component: PANStep },
  { title: "Bank", component: BankStep },
  { title: "Location", component: LocationStep },
  { title: "Review", component: ReviewStep },
];

export const DistributorRegistrationFlow: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [currentStep, setCurrentStep] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "info">(
    "info",
  );
  const [emailError, setEmailError] = useState("");
  const [showNewRegistrationModal, setShowNewRegistrationModal] =
    useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const [checkStatus] = useDistributorCheckStatusMutation();

  const [formData, setFormData] = useState<DistributorFormData>({
    full_name: "",
    date_of_birth: "",
    email: "",
    mobile: "",
    password: "",
    confirm_password: "",
    sponsor_id: "",
    placement_leg: "auto",
    email_verified: false,
    mobile_verified: false,
    aadhaar_number: "",
    aadhaar_consent: false,
    aadhaar_verified: false,
    pan_number: "",
    pan_verified: false,
    bank_account_holder_name: "",
    bank_account_number: "",
    bank_confirm_account_number: "",
    bank_ifsc_code: "",
    bank_name: "",
    bank_branch: "",
    bank_account_type: "savings",
    location_consent: false,
    terms_accepted: false,
    agreement_accepted: false,
    code_of_conduct_accepted: false,
    account_type: "distributor",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalSteps = steps.length;

  // ========== RESET DISTRIBUTOR API ==========
  const resetDistributorAPI = () => {
    try {
      // Reset RTK Query state
      dispatch(distributorAuthApi.util.resetApiState());

      // Invalidate all tags
      dispatch(
        distributorAuthApi.util.invalidateTags([
          "DistributorCheckStatus",
          "DistributorStepData",
          "User",
          "Auth",
          "Registration",
          "DistributorPersonal",
          "DistributorSponsor",
          "DistributorAadhaar",
          "DistributorPAN",
          "DistributorBank",
          "DistributorLocation",
          "DistributorSubmit",
        ]),
      );

      console.log("✅ Distributor API reset successfully");
    } catch (error) {
      console.error("Error resetting distributor API:", error);
    }
  };

  // ========== COMPLETE CLEAR STATE ==========
  const clearAllState = (resetAPI: boolean = true) => {
    // Reset form data to initial state
    setFormData({
      full_name: "",
      date_of_birth: "",
      email: "",
      mobile: "",
      password: "",
      confirm_password: "",
      sponsor_id: "",
      placement_leg: "auto",
      email_verified: false,
      mobile_verified: false,
      aadhaar_number: "",
      aadhaar_consent: false,
      aadhaar_verified: false,
      pan_number: "",
      pan_verified: false,
      bank_account_holder_name: "",
      bank_account_number: "",
      bank_confirm_account_number: "",
      bank_ifsc_code: "",
      bank_name: "",
      bank_branch: "",
      bank_account_type: "savings",
      location_consent: false,
      terms_accepted: false,
      agreement_accepted: false,
      code_of_conduct_accepted: false,
      account_type: "distributor",
    });

    // Clear errors
    setErrors({});

    // Clear status messages
    setStatusMessage("");
    setStatusType("info");
    setEmailError("");
    setFormError(null);
    setSuccessMessage(null);

    // Clear email
    setEmail("");

    // Clear all localStorage items
    const itemsToClear = [
      "verified_phone",
      "phone_verified",
      "distributor_mobile",
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

    itemsToClear.forEach((key) => {
      if (localStorage.getItem(key) !== null) {
        localStorage.removeItem(key);
        console.log(`✅ Removed: ${key}`);
      }
    });

    // Clear sessionStorage
    sessionStorage.clear();
    console.log("✅ SessionStorage cleared");

    // Reset API if requested
    if (resetAPI) {
      resetDistributorAPI();
    }

    // Go to email check step
    setCurrentStep(-1);

    console.log("✅ All state cleared successfully");
  };

  // ========== HANDLE NEW REGISTRATION ==========
  const handleNewRegistration = () => {
    setIsResetting(true);

    // Clear all state and reset API
    clearAllState(true);

    // Close modal
    setShowNewRegistrationModal(false);

    setTimeout(() => {
      setIsResetting(false);
      // Show success message

      setStatusType("success");

      // Clear status after 3 seconds
      setTimeout(() => {
        setStatusMessage("");
        setStatusType("info");
      }, 3000);
    }, 500);
  };

  // ========== GO BACK TO EMAIL CHECK ==========
  const handleBackToEmailCheck = () => {
    // Clear everything
    clearAllState(true);
    // Go to email check step
    setCurrentStep(-1);
  };

  // --- Email Check Handlers ---
  const handleCheckStatus = async (emailAddress: string) => {
    if (!emailAddress || !emailAddress.trim()) {
      setEmailError("Please enter your email address");
      return;
    }

    // Simple email validation (optional - can be removed if backend handles it)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailAddress)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setEmailError("");
    setIsLoading(true);
    setStatusMessage("");

    try {
      // Call the API with email
      const result = await checkStatus({ email: emailAddress }).unwrap();

      console.log("✅ Check Status Response:", result);

      if (result.status || result.success) {
        // Store in localStorage
        localStorage.setItem(
          "distributor_check_status",
          JSON.stringify(result),
        );
        localStorage.setItem("distributor_email", emailAddress);
        localStorage.setItem("temp_token", result.temp_token || "");

        // Update form data with email
        setFormData((prev) => ({
          ...prev,
          email: emailAddress,
          email_verified: true,
        }));

        // Get current step from API response
        const stepFromApi = result.current_step || 1;
        let targetStep = stepFromApi - 1;
        if (targetStep < 0) targetStep = 0;
        if (targetStep >= steps.length) targetStep = steps.length - 1;

        setCurrentStep(targetStep);

        const stepName = steps[targetStep]?.title || "";
        setStatusMessage(
          `✅ ${result.message || "Status verified"} - Continuing from Step ${stepFromApi}: ${stepName}`,
        );
        setStatusType("success");

        setEmail(emailAddress);

        // Populate user data if available
        if (result.user_data) {
          if (result.user_data.full_name) {
            setFormData((prev) => ({
              ...prev,
              full_name: result.user_data.full_name || prev.full_name,
              mobile: result.user_data.mobile || prev.mobile,
            }));
          }
        }
      } else {
        setStatusMessage(`❌ ${result.message || "Failed to check status"}`);
        setStatusType("error");
      }
    } catch (error: any) {
      console.error("❌ Error checking status:", error);
      setStatusMessage(
        `❌ ${error?.data?.message || "Failed to check status. Please try again."}`,
      );
      setStatusType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearStatus = () => {
    setStatusMessage("");
    setStatusType("info");
    setEmailError("");
  };

  // --- Form Handlers ---
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      if (!formData.full_name.trim())
        newErrors.full_name = "Full name is required";
      if (!formData.date_of_birth)
        newErrors.date_of_birth = "Date of birth is required";
      if (!formData.email) newErrors.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
        newErrors.email = "Please enter a valid email";
      if (!formData.password) newErrors.password = "Password is required";
      else if (formData.password.length < 8)
        newErrors.password = "Password must be at least 8 characters";
      if (formData.password !== formData.confirm_password)
        newErrors.confirm_password = "Passwords do not match";
    }

    if (step === 2) {
      if (!formData.aadhaar_number)
        newErrors.aadhaar_number = "Aadhaar number is required";
      else if (formData.aadhaar_number.replace(/\D/g, "").length !== 12) {
        newErrors.aadhaar_number =
          "Please enter a valid 12-digit Aadhaar number";
      }
      if (!formData.aadhaar_consent)
        newErrors.aadhaar_consent = "You must consent to Aadhaar verification";
    }

    if (step === 3) {
      if (!formData.pan_number) newErrors.pan_number = "PAN number is required";
      else if (formData.pan_number.replace(/[^A-Z0-9]/gi, "").length !== 10) {
        newErrors.pan_number = "Please enter a valid 10-character PAN";
      }
    }

    if (step === 4) {
      if (!formData.bank_account_holder_name)
        newErrors.bank_account_holder_name = "Account holder name is required";
      if (!formData.bank_name) newErrors.bank_name = "Bank name is required";
      if (!formData.bank_account_number)
        newErrors.bank_account_number = "Account number is required";
      if (
        formData.bank_account_number !== formData.bank_confirm_account_number
      ) {
        newErrors.bank_confirm_account_number = "Account numbers do not match";
      }
      if (!formData.bank_ifsc_code)
        newErrors.bank_ifsc_code = "IFSC code is required";
      if (!formData.bank_account_type)
        newErrors.bank_account_type = "Please select account type";
    }

    if (step === 6) {
      if (!formData.terms_accepted)
        newErrors.terms_accepted = "You must accept the Terms of Use";
      if (!formData.agreement_accepted)
        newErrors.agreement_accepted =
          "You must accept the Distributor Agreement";
      if (!formData.code_of_conduct_accepted)
        newErrors.code_of_conduct_accepted =
          "You must accept the Code of Conduct";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
      setFormError(null);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
    setFormError(null);
  };

  const handleStepClick = (index: number) => {
    setCurrentStep(index);
    setFormError(null);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(6)) return;

    setIsLoading(true);
    setFormError(null);
    setSuccessMessage(null);

    try {
      const payload = {
        full_name: formData.full_name,
        date_of_birth: formData.date_of_birth,
        email: formData.email,
        mobile: formData.mobile,
        sponsor_id: formData.sponsor_id || undefined,
        placement_leg: formData.placement_leg,
        aadhaar_number: formData.aadhaar_number,
        aadhaar_verified: formData.aadhaar_verified,
        pan_number: formData.pan_number,
        pan_verified: formData.pan_verified,
        bank_details: {
          account_holder_name: formData.bank_account_holder_name,
          account_number: formData.bank_account_number,
          ifsc_code: formData.bank_ifsc_code,
          bank_name: formData.bank_name,
          branch: formData.bank_branch,
          account_type: formData.bank_account_type,
        },
        location: formData.location_consent
          ? {
              latitude: formData.latitude,
              longitude: formData.longitude,
              consent_granted: true,
            }
          : { consent_granted: false },
        terms_accepted: {
          terms_of_use: true,
          distributor_agreement: true,
          code_of_conduct: true,
          accepted_at: new Date().toISOString(),
        },
        account_type: "distributor",
      };

      console.log("Distributor Registration Payload:", payload);

      await new Promise((resolve) => setTimeout(resolve, 2000));

      setSuccessMessage(
        "Your distributor application has been submitted successfully! Our team will review and contact you within 3-5 business days.",
      );

      localStorage.setItem(
        "distributor_application",
        JSON.stringify({
          status: "submitted",
          submitted_at: new Date().toISOString(),
        }),
      );

      setTimeout(() => {
        router.push("/distributor/application-status");
      }, 3000);
    } catch (err: any) {
      setFormError(err.message || "Submission failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const showEmailCheck = currentStep === -1;
  const StepComponent = !showEmailCheck ? steps[currentStep]?.component : null;

  return (
    <>
      <RegistrationLayout showHeader={showEmailCheck}>
        {showEmailCheck ? (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
            <EmailCheckScreen
              onCheckStatus={handleCheckStatus}
              isLoading={isLoading}
              statusMessage={statusMessage}
              statusType={statusType}
              mobile={email}
              setMobile={setEmail}
              error={emailError}
              onClear={handleClearStatus}
            />
          </div>
        ) : (
          <>
            {/* New Registration Button - Beautiful UI */}
            <div className="flex justify-end mb-4"></div>

            <ProgressSteps
              steps={steps}
              currentStep={currentStep}
              onStepClick={handleStepClick}
            />

            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs text-gray-400 font-medium">
                  Step {currentStep + 1} of {totalSteps}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#F9C744] to-[#E6B33D] rounded-full transition-all duration-500"
                      style={{
                        width: `${((currentStep + 1) / totalSteps) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-[#F9C744] font-medium">
                    {Math.round(((currentStep + 1) / totalSteps) * 100)}%
                  </span>
                </div>
              </div>

              {formError && <ErrorMessage message={formError} />}
              {successMessage && <SuccessMessage message={successMessage} />}

              {StepComponent && (
                <StepComponent
                  data={formData}
                  errors={errors}
                  onChange={handleChange}
                  onNext={handleNext}
                  onBack={handleBack}
                  onSubmit={handleSubmit}
                  isLoading={isLoading}
                  onBackToMobile={handleBackToEmailCheck}
                />
              )}
            </div>
          </>
        )}
      </RegistrationLayout>

      {/* New Registration Confirmation Modal */}
      {showNewRegistrationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full mx-4 p-6 shadow-2xl relative animate-in slide-in-from-bottom-4 duration-300">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowNewRegistrationModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center border-4 border-red-100">
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </div>
            </div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-center text-[#06101E] mb-2">
              Start New Registration?
            </h3>

            {/* Description */}
            <p className="text-gray-500 text-center text-sm mb-6 leading-relaxed">
              This will clear all your current progress and data. You'll start
              fresh from the beginning.
            </p>

            {/* Warning Box */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <Trash2 className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-700">
                    This action cannot be undone
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    All your entered information, verification status, and
                    progress will be permanently cleared.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                type="button"
                onClick={() => setShowNewRegistrationModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-xl transition-all duration-200"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleNewRegistration}
                disabled={isResetting}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResetting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Clearing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Yes, Start New
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Helper Components
const ErrorMessage = ({ message }: { message: string }) => (
  <div className="mb-4 text-sm text-red-600 bg-red-50 p-4 rounded-xl border border-red-100 flex items-start gap-2">
    <span className="text-lg flex-shrink-0">❌</span>
    <span>{message}</span>
  </div>
);

const SuccessMessage = ({ message }: { message: string }) => (
  <div className="mb-4 text-sm text-green-600 bg-green-50 p-4 rounded-xl border border-green-100 flex items-start gap-2">
    <span className="text-lg flex-shrink-0">✅</span>
    <span>{message}</span>
  </div>
);

export default DistributorRegistrationFlow;
