// components/distributor/registration/components/steps/AadhaarStep.tsx

"use client";

import React, { useState, useEffect } from "react";
import {
  PlusCircle,
  AlertTriangle,
  X,
  Loader2,
  CheckCircle,
  Fingerprint,
  ShieldCheck,
  Smartphone,
  User,
  Calendar,
} from "lucide-react";

import { InfoBox } from "../InfoBox";
import { FormActions } from "../FormActions";
import { StepProps } from "../../types";
import { useAppDispatch } from "@/lib/redux/hooks";
import { showToast } from "@/lib/slices/toastSlice";
import {
  useStep3AadhaarMutation,
  useLazyGetStepDataQuery,
  distributorAuthApi,
} from "../../../../../lib/redux/api/distributor/distributorauthApis";
import authApi from "@/lib/redux/api/authApi";

const theme = {
  font: "'Inter', 'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, sans-serif",
  gold: "#F9C744",
  goldDark: "#E6B33D",
  goldDeep: "#C9922A",
  navy: "#06101E",
  navySoft: "#0B1B2E",
};

type AadhaarSubStep = "enter_aadhaar" | "enter_otp" | "verified";

const REFERENCE_ID_KEY = "distributor_aadhaar_reference_id";
const VERIFIED_AADHAAR_KEY = "distributor_verified_aadhaar";
const NAME_KEY = "distributor_aadhaar_name_as_per_pan";
const DOB_KEY = "distributor_aadhaar_date_of_birth";

const IS_SANDBOX = process.env.NEXT_PUBLIC_KYC_ENV === "sandbox";

export const AadhaarStep: React.FC<StepProps> = ({
  data,
  errors,
  onChange,
  onNext,
  onBack,
  onBackToMobile,
}) => {
  const dispatch = useAppDispatch();
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [aadhaarError, setAadhaarError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isDataLoadedFromAPI, setIsDataLoadedFromAPI] = useState(false);
  const [aadhaarLast4, setAadhaarLast4] = useState("");

  const [subStep, setSubStep] = useState<AadhaarSubStep>("enter_aadhaar");
  const [referenceId, setReferenceId] = useState("");
  const [otp, setOtp] = useState("");

  const [step3Aadhaar] = useStep3AadhaarMutation();
  const [getStepData, { isLoading: isLoadingStepData }] =
    useLazyGetStepDataQuery();

  // ==========================================
  // LOAD PHONE
  // ==========================================

  useEffect(() => {
    const savedPhone =
      localStorage.getItem("distributor_verified_phone") ||
      localStorage.getItem("distributor_mobile") ||
      "";
    if (savedPhone) {
      const clean = savedPhone.trim();
      const formattedPhone = clean.startsWith("+")
        ? clean
        : "+91" + clean.replace(/^0+/, "");
      setPhoneNumber(formattedPhone);
    }
  }, []);

  // ==========================================
  // RESTORE PENDING REFERENCE
  // ==========================================

  useEffect(() => {
    if (data.aadhaar_verified) return;
    const savedRef = localStorage.getItem(REFERENCE_ID_KEY);
    if (savedRef && !referenceId) {
      setReferenceId(savedRef);
      setSubStep("enter_otp");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==========================================
  // BACKFILL masked aadhaar if verified but state empty
  // ==========================================

  useEffect(() => {
    if (!data.aadhaar_verified) return;
    if (aadhaarLast4) return;

    // 1) Try parent props (already masked)
    const fromProps = String(data.aadhaar_number || "");
    if (fromProps.includes("*")) {
      setAadhaarLast4(fromProps);
      return;
    }

    // 2) If we have the full number stashed, mask the last 4
    const full = localStorage.getItem(VERIFIED_AADHAAR_KEY) || "";
    const digits = full.replace(/\D/g, "");
    if (digits.length === 12) {
      setAadhaarLast4("****" + digits.slice(-4));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.aadhaar_verified, data.aadhaar_number]);

  // ==========================================
  // FETCH STEP DATA
  // ==========================================

  const fetchStepData = async () => {
    const email = data.email || localStorage.getItem("distributor_email") || "";
    if (!email) return;

    try {
      const response = await getStepData({ step: "3", phone: email }).unwrap();

      if (response.status && response.step_data) {
        const userData = response.step_data.user;
        const profileData = response.step_data.distributor_profile;

        const aadhaarLast4Value = userData?.aadhaar_last4;
        const isAadhaarVerified =
          profileData?.aadhaar_verified === true ||
          profileData?.aadhaar_verified === 1 ||
          !!aadhaarLast4Value;

        if (isAadhaarVerified && aadhaarLast4Value) {
          const last4 = String(aadhaarLast4Value); // "****9012"
          setAadhaarLast4(last4);
          setSubStep("verified");

          onChange({
            target: { name: "aadhaar_verified", value: true },
          } as any);

          onChange({
            target: { name: "aadhaar_consent", value: true },
          } as any);

          onChange({
            target: { name: "aadhaar_number", value: last4 },
          } as any);

          setIsDataLoadedFromAPI(true);
          setAadhaarError("");

          localStorage.removeItem(REFERENCE_ID_KEY);
          setReferenceId("");

          dispatch(
            showToast({
              message: "Loaded Aadhaar verification data successfully",
              type: "success",
            }),
          );
        }
      }
    } catch (error: any) {
      if (error?.status !== 404) {
        dispatch(
          showToast({
            message: error?.data?.message || "Failed to load Aadhaar data",
            type: "error",
          }),
        );
      }
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const email =
        data.email || localStorage.getItem("distributor_email") || "";
      if (email) await fetchStepData();
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.email]);

  // ==========================================
  // CLEAR REGISTRATION DATA
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
      REFERENCE_ID_KEY,
      VERIFIED_AADHAAR_KEY,
      NAME_KEY,
      DOB_KEY,
    ];
    itemsToRemove.forEach((item) => localStorage.removeItem(item));
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
    onBackToMobile?.();
  };

  const isFromAPI = (value: string) => value?.includes("*") || false;

  // ==========================================
  // STEP 3A: SEND OTP
  // ==========================================

  const handleSendOTP = async () => {
    const cleanNumber = data.aadhaar_number?.replace(/\D/g, "") || "";

    if (cleanNumber.length !== 12) {
      setAadhaarError("Please enter a valid 12-digit Aadhaar number");
      dispatch(
        showToast({
          message: "Please enter a valid 12-digit Aadhaar number",
          type: "error",
        }),
      );
      return;
    }

    if (!data.aadhaar_consent) {
      setAadhaarError("You must consent to Aadhaar verification");
      dispatch(
        showToast({
          message: "You must consent to Aadhaar verification",
          type: "error",
        }),
      );
      return;
    }

    if (!data.aadhaar_name_as_per_pan?.trim()) {
      setAadhaarError("Please enter your name as per PAN");
      dispatch(
        showToast({
          message: "Please enter your name as per PAN",
          type: "error",
        }),
      );
      return;
    }

    if (data.aadhaar_date_of_birth?.replace(/\D/g, "").length !== 8) {
      setAadhaarError("Please enter a valid date of birth (DD/MM/YYYY)");
      dispatch(
        showToast({
          message: "Please enter a valid date of birth",
          type: "error",
        }),
      );
      return;
    }

    if (!phoneNumber) {
      setAadhaarError(
        "Phone number not found. Please go back and verify your mobile.",
      );
      return;
    }

    setAadhaarError("");
    setOtpError("");
    setIsSendingOtp(true);

    try {
      const payload = IS_SANDBOX
        ? {
            phone: "+918800880088",
            encrypted_aadhaar: "123456789012",
            aadhaar_consent: 1,
            name_as_per_pan: "JOHN DOE",
            date_of_birth: "01/01/1990",
            aadhaar_number: "123456789012",
          }
        : {
            phone: phoneNumber,
            encrypted_aadhaar: cleanNumber,
            aadhaar_consent: data.aadhaar_consent ? 1 : 0,
            name_as_per_pan: data.aadhaar_name_as_per_pan.trim(),
            date_of_birth: data.aadhaar_date_of_birth,
            aadhaar_number: cleanNumber,
          };

      console.log("📡 [Step 3A] Send OTP payload:", payload);

      const response = await step3Aadhaar(payload).unwrap();

      console.log("✅ [Step 3A] Send OTP response:", response);

      if (response.status) {
        const refId = String(
          (response as any)?.reference_id ??
            (response as any)?.data?.reference_id ??
            "",
        );

        if (!refId) {
          const msg = "Server did not return a reference ID. Please try again.";
          setAadhaarError(msg);
          dispatch(showToast({ message: msg, type: "error" }));
          return;
        }

        setReferenceId(refId);
        localStorage.setItem(REFERENCE_ID_KEY, refId);

        // Stash for PAN step + backfill display
        localStorage.setItem(VERIFIED_AADHAAR_KEY, cleanNumber);
        localStorage.setItem(NAME_KEY, data.aadhaar_name_as_per_pan.trim());
        localStorage.setItem(DOB_KEY, data.aadhaar_date_of_birth);

        dispatch(
          showToast({
            message:
              response.message || "OTP sent to your Aadhaar-linked mobile",
            type: "success",
          }),
        );

        setOtp("");
        setSubStep("enter_otp");
      } else {
        const errorMsg =
          response.message || "Failed to send OTP. Please try again.";
        setAadhaarError(errorMsg);
        dispatch(showToast({ message: errorMsg, type: "error" }));
      }
    } catch (error: any) {
      console.error("❌ [Step 3A] Send OTP error:", error);
      const errorMsg =
        error?.data?.message ||
        error?.message ||
        "Failed to send OTP. Please try again.";
      setAadhaarError(errorMsg);
      dispatch(showToast({ message: errorMsg, type: "error" }));
    } finally {
      setIsSendingOtp(false);
    }
  };

  // ==========================================
  // STEP 3B: VERIFY OTP
  // ==========================================

  const handleVerifyOTP = async () => {
    const cleanOtp = otp.replace(/\D/g, "");

    if (cleanOtp.length !== 6) {
      setOtpError("Please enter a valid 6-digit OTP");
      return;
    }

    const activeRef = String(
      referenceId || localStorage.getItem(REFERENCE_ID_KEY) || "",
    );

    if (!activeRef) {
      setOtpError("Reference ID missing. Please resend OTP.");
      return;
    }

    setOtpError("");
    setIsVerifying(true);

    try {
      const cleanNumber = data.aadhaar_number?.replace(/\D/g, "") || "";
      const nameAsPerPan =
        data.aadhaar_name_as_per_pan?.trim() ||
        localStorage.getItem(NAME_KEY) ||
        "";
      const dateOfBirth =
        data.aadhaar_date_of_birth || localStorage.getItem(DOB_KEY) || "";

      const payload = IS_SANDBOX
        ? {
            phone: "8800880088",
            encrypted_aadhaar: "123456789012",
            aadhaar_consent: "1" as const,
            reference_id: activeRef,
            otp: cleanOtp,
            name_as_per_pan: "JOHN DOE",
            date_of_birth: "01/01/1990",
            aadhaar_number: "123456789012",
          }
        : {
            phone: phoneNumber,
            encrypted_aadhaar: cleanNumber,
            aadhaar_consent: data.aadhaar_consent ? 1 : 0,
            reference_id: activeRef,
            otp: cleanOtp,
            name_as_per_pan: nameAsPerPan,
            date_of_birth: dateOfBirth,
            aadhaar_number: cleanNumber,
          };

      console.log("📡 [Step 3B] Verify OTP payload:", payload);

      const response = await step3Aadhaar(payload).unwrap();

      console.log("✅ [Step 3B] Verify OTP response:", response);

      if (response.status) {
        // Stash full aadhaar + mask for display
        localStorage.setItem(VERIFIED_AADHAAR_KEY, cleanNumber);
        localStorage.setItem(NAME_KEY, nameAsPerPan);
        localStorage.setItem(DOB_KEY, dateOfBirth);

        // ✅ Show masked aadhaar immediately
        const maskedFromFull = "****" + cleanNumber.slice(-4);
        setAadhaarLast4(maskedFromFull);

        onChange({
          target: { name: "aadhaar_verified", value: true },
        } as any);

        dispatch(
          showToast({
            message: response.message || "Aadhaar verified successfully",
            type: "success",
          }),
        );

        localStorage.removeItem(REFERENCE_ID_KEY);
        setReferenceId("");
        setOtp("");

        setSubStep("verified");
        await fetchStepData();

        setTimeout(() => {
          onNext?.();
        }, 1000);
      } else {
        const errorMsg = response.message || "Invalid OTP. Please try again.";
        setOtpError(errorMsg);
        dispatch(showToast({ message: errorMsg, type: "error" }));
      }
    } catch (error: any) {
      console.error("❌ [Step 3B] Verify OTP error:", error);
      const errorMsg =
        error?.data?.message ||
        error?.message ||
        "OTP verification failed. Please try again.";
      setOtpError(errorMsg);
      dispatch(showToast({ message: errorMsg, type: "error" }));
    } finally {
      setIsVerifying(false);
    }
  };

  // ==========================================
  // HANDLE CONTINUE
  // ==========================================

  const handleContinue = () => {
    if (data.aadhaar_verified) {
      onNext?.();
      return;
    }
    if (subStep === "enter_aadhaar") {
      void handleSendOTP();
      return;
    }
    if (subStep === "enter_otp") {
      void handleVerifyOTP();
      return;
    }
  };

  const handleResendOTP = async () => {
    setOtp("");
    setOtpError("");
    setReferenceId("");
    localStorage.removeItem(REFERENCE_ID_KEY);
    await handleSendOTP();
  };

  // ==========================================
  // CHANGE AADHAAR (reset verification)
  // ==========================================

  const handleChangeAadhaar = () => {
    onChange({
      target: { name: "aadhaar_verified", value: false },
    } as any);
    onChange({
      target: { name: "aadhaar_number", value: "" },
    } as any);
    onChange({
      target: { name: "aadhaar_consent", value: false },
    } as any);

    setSubStep("enter_aadhaar");
    setAadhaarLast4("");
    setIsDataLoadedFromAPI(false);
    setAadhaarError("");
    setOtpError("");
    setOtp("");

    localStorage.removeItem(REFERENCE_ID_KEY);
    localStorage.removeItem(VERIFIED_AADHAAR_KEY);
    // Keep name/DOB so user doesn't retype them
  };

  // ==========================================
  // INPUT HANDLERS
  // ==========================================

  const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.includes("*")) return;
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 12) value = value.slice(0, 12);
    let formattedValue = "";
    for (let i = 0; i < value.length; i++) {
      if (i > 0 && i % 4 === 0) formattedValue += "-";
      formattedValue += value[i];
    }
    if (isDataLoadedFromAPI) setIsDataLoadedFromAPI(false);
    setAadhaarError("");
    onChange({
      target: { name: "aadhaar_number", value: formattedValue },
    } as any);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      target: { name: "aadhaar_name_as_per_pan", value: e.target.value },
    } as any);
    setAadhaarError("");
  };

  const handleDOBChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^\d]/g, "");
    if (value.length > 8) value = value.slice(0, 8);
    let formatted = "";
    if (value.length >= 2) {
      formatted = value.slice(0, 2);
      if (value.length > 2) formatted += "/" + value.slice(2, 4);
      if (value.length > 4) formatted += "/" + value.slice(4, 8);
    } else {
      formatted = value;
    }
    onChange({
      target: { name: "aadhaar_date_of_birth", value: formatted },
    } as any);
    setAadhaarError("");
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(value);
    setOtpError("");
  };

  const handleConsentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      target: { name: "aadhaar_consent", value: e.target.checked },
    } as any);
  };

  // ==========================================
  // DERIVED
  // ==========================================

  const isAadhaarFromAPI = isFromAPI(data.aadhaar_number);
  const getCleanAadhaarForValidation = () => {
    if (isAadhaarFromAPI) return "123456789012";
    return data.aadhaar_number?.replace(/\D/g, "") || "";
  };
  const cleanAadhaar = getCleanAadhaarForValidation();

  const isContinueEnabled = () => {
    if (data.aadhaar_verified) return true;
    if (isAadhaarFromAPI) return true;

    if (subStep === "enter_otp") {
      return otp.replace(/\D/g, "").length === 6 && !isVerifying;
    }

    return (
      !!data.aadhaar_consent &&
      !!data.aadhaar_number &&
      cleanAadhaar.length === 12 &&
      !!data.aadhaar_name_as_per_pan?.trim() &&
      data.aadhaar_date_of_birth?.replace(/\D/g, "").length === 8 &&
      !isSendingOtp
    );
  };

  const getButtonLabel = () => {
    if (data.aadhaar_verified) return "Continue";
    if (isSendingOtp) return "Sending OTP...";
    if (isVerifying) return "Verifying OTP...";
    if (subStep === "enter_otp") return "Verify OTP";
    return "Send OTP";
  };

  const shouldShowContinue = data.aadhaar_verified === true;
  const hasError =
    (errors.aadhaar_number || aadhaarError) &&
    !isAadhaarFromAPI &&
    !data.aadhaar_verified;
  const displayValue = data.aadhaar_number || aadhaarLast4 || "";
  const fieldDisabled =
    isSendingOtp ||
    isVerifying ||
    data.aadhaar_verified ||
    (isDataLoadedFromAPI && data.aadhaar_verified);

  // ==========================================
  // OTP SCREEN
  // ==========================================

  const renderOtpStep = () => (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-blue-50/70 border border-blue-100 rounded-xl sm:rounded-2xl">
        <Smartphone className="w-4 sm:w-5 h-4 sm:h-5 text-blue-600 flex-shrink-0" />
        <div className="text-xs sm:text-sm text-blue-700 font-medium">
          OTP sent to your Aadhaar-linked mobile number ending with{" "}
          <span className="font-bold">
            {phoneNumber ? phoneNumber.slice(-4) : "****"}
          </span>
        </div>
      </div>

      {IS_SANDBOX && (
        <div className="text-[10px] sm:text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          🧪 Sandbox mode — use OTP <span className="font-bold">121212</span>{" "}
          with reference <span className="font-bold">{referenceId || "—"}</span>
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-xs sm:text-sm font-semibold text-gray-700 block">
          Enter OTP <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          inputMode="numeric"
          value={otp}
          onChange={handleOtpChange}
          placeholder="Enter 6-digit OTP"
          maxLength={6}
          autoFocus
          className={
            "w-full h-12 sm:h-14 px-3 sm:px-4 text-black rounded-xl sm:rounded-2xl border tracking-[0.5em] text-center font-bold text-lg sm:text-xl " +
            (otpError
              ? "border-red-400 ring-2 ring-red-100"
              : "border-gray-200") +
            " bg-white focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all duration-200 outline-none placeholder:text-gray-400 placeholder:tracking-normal placeholder:font-normal placeholder:text-sm"
          }
          disabled={isVerifying}
        />
        {otpError && (
          <p className="text-[10px] sm:text-xs text-red-500 mt-1 font-medium">
            {otpError}
          </p>
        )}
        <div className="flex items-center justify-between mt-1">
          <p className="text-[10px] sm:text-xs text-gray-400 font-medium">
            OTP is valid for 10 minutes
          </p>
          <button
            type="button"
            onClick={handleResendOTP}
            disabled={isVerifying || isSendingOtp}
            className="text-[10px] sm:text-xs font-semibold text-[var(--gold-deep)] hover:text-[var(--gold-dark)] disabled:opacity-50 transition-colors"
          >
            {isSendingOtp ? "Sending..." : "Resend OTP"}
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={() => {
            setSubStep("enter_aadhaar");
            setOtp("");
            setOtpError("");
            setReferenceId("");
            localStorage.removeItem(REFERENCE_ID_KEY);
          }}
          className="w-full sm:w-auto text-center text-gray-600 hover:text-[var(--navy)] font-semibold text-xs sm:text-sm transition-colors py-2 sm:py-0"
        >
          ← Change Aadhaar Number
        </button>
        <button
          type="button"
          onClick={handleVerifyOTP}
          disabled={!isContinueEnabled()}
          className="w-full sm:w-auto bg-gradient-to-b from-[var(--gold)] to-[var(--gold-dark)] hover:brightness-105 active:brightness-95 text-[var(--navy)] font-semibold px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl transition-all duration-200 shadow-[0_8px_20px_-6px_rgba(249,199,68,0.55)] flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isVerifying ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              Verify OTP
            </>
          )}
        </button>
      </div>
    </div>
  );

  // ==========================================
  // MAIN AADHAAR FORM
  // ==========================================

  const renderAadhaarForm = () => (
    <div className="space-y-3 sm:space-y-4">
      {/* Aadhaar Number */}
      <div className="space-y-1.5">
        <label className="text-xs sm:text-sm font-semibold text-gray-700 block">
          Aadhaar Number <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="aadhaar_number"
          value={displayValue}
          onChange={handleAadhaarChange}
          placeholder={
            isDataLoadedFromAPI ? "****-****-****" : "XXXX-XXXX-XXXX"
          }
          maxLength={14}
          className={
            "w-full h-12 sm:h-14 px-3 sm:px-4 text-black rounded-xl sm:rounded-2xl border tracking-wider font-medium text-sm sm:text-base " +
            (hasError
              ? "border-red-400 ring-2 ring-red-100"
              : isDataLoadedFromAPI
                ? "border-blue-400 bg-blue-50/60"
                : "border-gray-200") +
            " bg-white focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all duration-200 outline-none placeholder:text-gray-400 placeholder:tracking-normal placeholder:font-normal"
          }
          disabled={fieldDisabled}
        />
        {hasError && (
          <p className="text-[10px] sm:text-xs text-red-500 mt-1 font-medium">
            {errors.aadhaar_number || aadhaarError}
          </p>
        )}
        <p className="text-[10px] sm:text-xs text-gray-400 mt-1 font-medium">
          Format: XXXX-XXXX-XXXX (12 digits)
        </p>
      </div>

      {/* Name as per PAN */}
      <div className="space-y-1.5">
        <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-gray-400" />
          Name as per PAN <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="aadhaar_name_as_per_pan"
          value={data.aadhaar_name_as_per_pan || ""}
          onChange={handleNameChange}
          placeholder="Enter full name as on PAN card"
          className="w-full h-12 sm:h-14 px-3 sm:px-4 text-black rounded-xl sm:rounded-2xl border border-gray-200 bg-white focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all duration-200 outline-none text-sm sm:text-base placeholder:text-gray-400 uppercase"
          disabled={fieldDisabled}
        />
        <p className="text-[10px] sm:text-xs text-gray-400 mt-1 font-medium">
          Must match the name on your PAN card exactly
        </p>
      </div>

      {/* Date of Birth */}
      <div className="space-y-1.5">
        <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-gray-400" />
          Date of Birth <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="aadhaar_date_of_birth"
          value={data.aadhaar_date_of_birth || ""}
          onChange={handleDOBChange}
          placeholder="DD/MM/YYYY"
          maxLength={10}
          className="w-full h-12 sm:h-14 px-3 sm:px-4 text-black rounded-xl sm:rounded-2xl border border-gray-200 bg-white focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all duration-200 outline-none text-sm sm:text-base placeholder:text-gray-400"
          disabled={fieldDisabled}
        />
        <p className="text-[10px] sm:text-xs text-gray-400 mt-1 font-medium">
          Enter DOB exactly as on your PAN card
        </p>
      </div>

      {/* Consent */}
      <div className="space-y-1.5">
        <label className="flex items-start gap-2 sm:gap-3 cursor-pointer bg-gray-50/70 border border-gray-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:border-[var(--gold)]/30 transition-colors">
          <input
            type="checkbox"
            name="aadhaar_consent"
            checked={data.aadhaar_consent || false}
            onChange={handleConsentChange}
            disabled={fieldDisabled}
            className="mt-0.5 sm:mt-1 w-3.5 sm:w-4 h-3.5 sm:h-4 rounded border-gray-300 text-[var(--gold-deep)] focus:ring-[var(--gold)] flex-shrink-0"
          />
          <span className="text-[11px] sm:text-sm text-gray-600 leading-relaxed font-medium">
            I consent to Aadhaar verification through a licensed KYC provider
            for the purpose of identity verification as per the Digital Personal
            Data Protection Act, 2023.
          </span>
        </label>
        {errors.aadhaar_consent && (
          <p className="text-[10px] sm:text-xs text-red-500 font-medium pl-1">
            {errors.aadhaar_consent}
          </p>
        )}
      </div>

      <FormActions
        onBack={onBack}
        onSubmit={handleContinue}
        isSubmitDisabled={!isContinueEnabled()}
        isLoading={isSendingOtp}
        submitLabel={getButtonLabel()}
        nextLabel="Continue"
      />
    </div>
  );

  // ==========================================
  // VERIFIED STATE
  // ==========================================

  const renderVerifiedState = () => {
    const maskedForDisplay =
      aadhaarLast4 ||
      (displayValue.includes("*") ? displayValue : "") ||
      "****-****-****";

    return (
      <div className="space-y-3 sm:space-y-4">
        {/* ✅ Show which Aadhaar was verified */}
        <div className="flex items-center gap-3 p-3 sm:p-4 bg-emerald-50/80 border border-emerald-100 rounded-xl sm:rounded-2xl">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <Fingerprint className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-600" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] sm:text-xs font-semibold text-emerald-600 uppercase tracking-wide">
              Verified Aadhaar
            </div>
            <div className="text-sm sm:text-base font-bold text-emerald-800 tracking-wider">
              {maskedForDisplay}
            </div>
          </div>
          <CheckCircle className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-500 flex-shrink-0" />
        </div>

        <div className="bg-emerald-50/80 backdrop-blur-sm p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-emerald-100 text-xs sm:text-sm text-emerald-700 flex items-center gap-2 sm:gap-2.5 font-medium">
          <CheckCircle className="w-3.5 sm:w-4 h-3.5 sm:h-4 flex-shrink-0" />
          <span>
            Aadhaar verified successfully
            {isDataLoadedFromAPI && (
              <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs text-blue-600">
                (loaded from saved data)
              </span>
            )}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onBack}
              className="w-full sm:w-auto text-center text-gray-600 hover:text-[var(--navy)] font-semibold text-xs sm:text-sm transition-colors py-2 sm:py-0"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleChangeAadhaar}
              className="w-full sm:w-auto text-center text-[10px] sm:text-xs font-semibold text-[var(--gold-deep)] hover:text-[var(--gold-dark)] underline underline-offset-2 transition-colors py-1 sm:py-0"
            >
              Change Aadhaar number
            </button>
          </div>
          <button
            type="button"
            onClick={handleContinue}
            className="w-full sm:w-auto bg-gradient-to-b from-[var(--gold)] to-[var(--gold-dark)] hover:brightness-105 active:brightness-95 text-[var(--navy)] font-semibold px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl transition-all duration-200 shadow-[0_8px_20px_-6px_rgba(249,199,68,0.55)] flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <span>Continue</span>
            <svg
              className="w-3.5 sm:w-4 h-3.5 sm:h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  // ==========================================
  // RENDER
  // ==========================================

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
        className="min-h-[60vh] flex items-center justify-center px-3 sm:px-4 py-6 sm:py-10"
      >
        <div className="w-full max-w-lg mx-auto">
          <div className="relative rounded-[20px] sm:rounded-[28px] bg-white/90 backdrop-blur-xl border border-[var(--navy)]/[0.06] shadow-[0_20px_60px_-15px_rgba(6,16,30,0.15)] px-4 sm:px-6 md:px-9 py-6 sm:py-8 md:py-10">
            <div className="pointer-events-none absolute inset-x-0 -top-10 flex justify-center">
              <div className="w-32 sm:w-40 h-32 sm:h-40 rounded-full bg-[radial-gradient(circle,_rgba(249,199,68,0.3)_0%,_rgba(249,199,68,0)_70%)] blur-xl" />
            </div>

            <div className="relative space-y-4 sm:space-y-5">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 sm:gap-3 mb-1">
                    <div className="w-9 sm:w-11 h-9 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[var(--gold)] via-[var(--gold-dark)] to-[var(--gold-deep)] flex items-center justify-center shadow-[0_8px_20px_-6px_rgba(249,199,68,0.55)] flex-shrink-0">
                      <Fingerprint className="w-4 sm:w-5 h-4 sm:h-5 text-[var(--navy)]" />
                    </div>
                    <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-[var(--navy)]">
                      Aadhaar Verification
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 font-medium">
                    Verify your identity through licensed KYC provider
                  </p>
                  {isLoadingStepData && (
                    <div className="flex items-center justify-start gap-2 mt-2 text-xs sm:text-sm text-gray-500">
                      <Loader2 className="w-3 sm:w-4 h-3 sm:h-4 animate-spin" />
                      Loading your Aadhaar data...
                    </div>
                  )}
                  {isDataLoadedFromAPI && (
                    <div className="mt-2 text-[10px] sm:text-xs font-semibold text-emerald-600 bg-emerald-50 py-1 px-2 sm:px-3 rounded-full inline-block">
                      ✓ Aadhaar already verified
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setShowConfirmModal(true)}
                  className="group flex-shrink-0 flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-[var(--gold)]/40 bg-[#FFFBEF] text-xs sm:text-sm font-semibold text-[var(--gold-deep)] hover:bg-[var(--gold)] hover:text-[var(--navy)] hover:border-[var(--gold)] shadow-sm hover:shadow-md transition-all duration-200 whitespace-nowrap"
                >
                  <PlusCircle className="w-3 sm:w-4 h-3 sm:h-4 transition-transform duration-300 group-hover:rotate-90" />
                  <span className="hidden xs:inline">New Registration</span>
                  <span className="xs:hidden">New</span>
                </button>
              </div>

              <InfoBox type="info" title="Why this is needed">
                Aadhaar verification is mandatory for distributor registration.
                An OTP will be sent to your Aadhaar-linked mobile number for
                verification.
              </InfoBox>

              {shouldShowContinue
                ? renderVerifiedState()
                : subStep === "enter_otp"
                  ? renderOtpStep()
                  : renderAadhaarForm()}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--navy)]/70 backdrop-blur-sm px-3 sm:px-4"
          style={{ fontFamily: theme.font }}
        >
          <div className="bg-white rounded-[24px] sm:rounded-[28px] max-w-md w-full mx-2 sm:mx-4 p-5 sm:p-7 shadow-[0_30px_80px_-20px_rgba(6,16,30,0.5)] relative">
            <button
              type="button"
              onClick={() => setShowConfirmModal(false)}
              className="absolute right-3 sm:right-4 top-3 sm:top-4 text-gray-400 hover:text-[#06101E] hover:bg-gray-100 rounded-full p-1 transition-colors"
            >
              <X className="w-4 sm:w-5 h-4 sm:h-5" />
            </button>

            <div className="flex justify-center mb-3 sm:mb-4">
              <div className="w-12 sm:w-16 h-12 sm:h-16 rounded-full bg-amber-100 flex items-center justify-center ring-4 ring-amber-50">
                <AlertTriangle className="w-6 sm:w-8 h-6 sm:h-8 text-amber-600" />
              </div>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-center text-[#06101E] mb-1 sm:mb-2 tracking-tight">
              Start New Registration?
            </h3>

            <p className="text-xs sm:text-sm text-gray-500 text-center mb-4 sm:mb-6 font-medium">
              All your entered information will be discarded. This action cannot
              be undone.
            </p>

            <div className="bg-red-50 border border-red-200 rounded-xl p-2.5 sm:p-3 mb-4 sm:mb-6">
              <p className="text-[10px] sm:text-xs text-red-600 text-center font-semibold">
                Warning: Your current progress will be lost
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="w-full sm:flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 sm:py-2.5 rounded-xl transition-all duration-200 text-sm sm:text-base order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleNewRegistration}
                className="w-full sm:flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 sm:py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_8px_20px_-6px_rgba(239,68,68,0.5)] text-sm sm:text-base order-1 sm:order-2"
              >
                <PlusCircle className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                Yes, Start New
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AadhaarStep;
