// components/distributor/registration/DistributorRegistrationFlow.tsx

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useDistributorCheckStatusMutation } from "@/lib/redux/api/distributor/authApi";

import { DistributorFormData, Step } from "./types";
import { RegistrationLayout } from "./components/steps/RegistrationLayout";
import { ProgressSteps } from "./components/ProgressSteps";
import { MobileCheckScreen } from "./components/steps/MobileCheckScreen";
import { IdentityStep } from "./components/steps/IdentityStep";
import { SponsorStep } from "./components/steps/SponsorStep";
import { AadhaarStep } from "./components/steps/AadhaarStep";
import { PANStep } from "./components/steps/PANStep";
import { BankStep } from "./components/steps/BankStep";
import { LocationStep } from "./components/steps/LocationStep";
import { ReviewStep } from "./components/steps/ReviewStep";

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
  const [currentStep, setCurrentStep] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [mobile, setMobile] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "info">(
    "info",
  );
  const [mobileError, setMobileError] = useState("");

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

  // ========== COMPLETE CLEAR STATE ==========
  const clearAllState = () => {
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
    setMobileError("");
    setFormError(null);
    setSuccessMessage(null);

    // Clear mobile
    setMobile("");

    // Clear all localStorage items
    localStorage.removeItem("verified_phone");
    localStorage.removeItem("phone_verified");
    localStorage.removeItem("distributor_mobile");
    localStorage.removeItem("verified_email");
    localStorage.removeItem("email_verified");
    localStorage.removeItem("temp_token");
    localStorage.removeItem("distributor_check_status");
    localStorage.removeItem("distributor_phone");
    localStorage.removeItem("distributor_exists");
    localStorage.removeItem("distributor_status");
    localStorage.removeItem("user_data");
    localStorage.removeItem("customer_otp");
    localStorage.removeItem("customer_phone");
    localStorage.removeItem("distributor_application");
  };

  // ========== GO BACK TO MOBILE CHECK ==========
  const handleBackToMobile = () => {
    // Clear everything
    clearAllState();

    // Go to mobile check step
    setCurrentStep(-1);
  };

  // --- Mobile Check Handlers ---
  const handleCheckStatus = async (phoneNumber: string) => {
    if (!phoneNumber || phoneNumber.length !== 10) {
      setMobileError("Please enter a valid 10-digit phone number");
      return;
    }

    setMobileError("");
    setIsLoading(true);
    setStatusMessage("");

    try {
      const formattedPhone = `+91${phoneNumber}`;
      const result = await checkStatus({ phone: formattedPhone }).unwrap();

      if (result.status) {
        localStorage.setItem(
          "distributor_check_status",
          JSON.stringify(result),
        );
        localStorage.setItem("distributor_phone", formattedPhone);
        localStorage.setItem("distributor_mobile", phoneNumber);
        localStorage.setItem("temp_token", result.temp_token || "");

        setFormData((prev) => ({
          ...prev,
          mobile: phoneNumber,
          mobile_verified: true,
        }));

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

        setMobile(phoneNumber);

        if (result.user_data) {
          if (result.user_data.full_name) {
            setFormData((prev) => ({
              ...prev,
              full_name: result.user_data.full_name || prev.full_name,
              email: result.user_data.email || prev.email,
            }));
          }
        }
      } else {
        setStatusMessage(`❌ ${result.message || "Failed to check status"}`);
        setStatusType("error");
      }
    } catch (error: any) {
      setStatusMessage(
        `❌ ${error?.data?.message || "Failed to check phone status. Please try again."}`,
      );
      setStatusType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearStatus = () => {
    setStatusMessage("");
    setStatusType("info");
    setMobileError("");
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

  const showMobileCheck = currentStep === -1;
  const StepComponent = !showMobileCheck ? steps[currentStep]?.component : null;

  return (
    <RegistrationLayout showHeader={showMobileCheck}>
      {showMobileCheck ? (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
          <MobileCheckScreen
            onCheckStatus={handleCheckStatus}
            isLoading={isLoading}
            statusMessage={statusMessage}
            statusType={statusType}
            mobile={mobile}
            setMobile={setMobile}
            error={mobileError}
            onClear={handleClearStatus}
          />
        </div>
      ) : (
        <>
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
                onBackToMobile={handleBackToMobile}
              />
            )}
          </div>
        </>
      )}
    </RegistrationLayout>
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
