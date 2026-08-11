// components/distributor/registration/components/steps/IdentityStep.tsx

"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { DatePicker } from "../DatePicker";
import { PasswordInput } from "../PasswordInput";
import { FormActions } from "../FormActions";
import { StepProps } from "../../types";
import {
  useSendOTPMutation,
  useVerifyPhoneOTPMutation,
  useVerifyEmailOTPMutation,
  useStep1PersonalMutation,
} from "@/lib/redux/api/distributor/authApi";
import {
  CheckCircle,
  Phone,
  Mail,
  Loader2,
  PlusCircle,
  AlertTriangle,
  X,
} from "lucide-react";
import { useAppDispatch } from "@/lib/redux/hooks";
import { showToast } from "@/lib/slices/toastSlice";

export const IdentityStep: React.FC<StepProps> = ({
  data,
  errors,
  onChange,
  onNext,
  onBackToMobile,
}) => {
  const dispatch = useAppDispatch();
  const [ageError, setAgeError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Mobile verification states
  const [mobileInput, setMobileInput] = useState("");
  const [mobileOtpInput, setMobileOtpInput] = useState("");
  const [isMobileVerified, setIsMobileVerified] = useState(false);
  const [showMobileOtp, setShowMobileOtp] = useState(false);
  const [mobileError, setMobileError] = useState("");
  const [mobileResendTimer, setMobileResendTimer] = useState(0);
  const [isMobileOtpSending, setIsMobileOtpSending] = useState(false);
  const [isMobileVerifying, setIsMobileVerifying] = useState(false);
  const [isMobileFromCheck, setIsMobileFromCheck] = useState(false);

  // Email verification states
  const [emailInput, setEmailInput] = useState("");
  const [emailOtpInput, setEmailOtpInput] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [showEmailOtp, setShowEmailOtp] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [emailResendTimer, setEmailResendTimer] = useState(0);
  const [isEmailOtpSending, setIsEmailOtpSending] = useState(false);
  const [isEmailVerifying, setIsEmailVerifying] = useState(false);
  const [tempToken, setTempToken] = useState("");

  // API Hooks
  const [sendOTP] = useSendOTPMutation();
  const [verifyPhoneOTP] = useVerifyPhoneOTPMutation();
  const [verifyEmailOTP] = useVerifyEmailOTPMutation();
  const [step1Personal] = useStep1PersonalMutation();

  // Get temp_token and mobile from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem("temp_token") || "";
    setTempToken(token);

    const savedMobile = localStorage.getItem("distributor_mobile") || "";
    if (savedMobile) {
      setMobileInput(savedMobile);
      setIsMobileFromCheck(true);
      const event = {
        target: { name: "mobile", value: savedMobile },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(event);
      // ❌ NO TOAST - Silent load from check status
    }

    const emailVerified = localStorage.getItem("email_verified") === "true";
    const savedEmail = localStorage.getItem("verified_email") || "";

    if (emailVerified && savedEmail) {
      setIsEmailVerified(true);
      setEmailInput(savedEmail);
      const event = {
        target: { name: "email", value: savedEmail },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(event);
      dispatch(
        showToast({
          message: `Email ${savedEmail} verified`,
          type: "success",
        }),
      );
    }
  }, []);

  // Mobile resend timer
  useEffect(() => {
    if (mobileResendTimer > 0) {
      const timer = setTimeout(
        () => setMobileResendTimer(mobileResendTimer - 1),
        1000,
      );
      return () => clearTimeout(timer);
    }
  }, [mobileResendTimer]);

  // Email resend timer
  useEffect(() => {
    if (emailResendTimer > 0) {
      const timer = setTimeout(
        () => setEmailResendTimer(emailResendTimer - 1),
        1000,
      );
      return () => clearTimeout(timer);
    }
  }, [emailResendTimer]);

  const validateAge = (dob: string) => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dob = e.target.value;
    onChange(e);
    const age = validateAge(dob);
    if (age < 18 && age > 0) {
      setAgeError(
        "You must be at least 18 years old to register as a distributor",
      );
      dispatch(
        showToast({
          message: "You must be at least 18 years old",
          type: "error",
        }),
      );
    } else {
      setAgeError("");
      if (age >= 18) {
        dispatch(
          showToast({
            message: "Valid age confirmed",
            type: "success",
          }),
        );
      }
    }
  };

  // ========== HANDLE CHANGE MOBILE - Complete Clear ==========
  const handleChangeMobile = () => {
    // Clear all mobile related states
    setIsMobileVerified(false);
    setShowMobileOtp(false);
    setMobileInput("");
    setMobileOtpInput("");
    setMobileError("");
    setMobileResendTimer(0);
    setIsMobileFromCheck(false);

    // Clear email verification too
    setIsEmailVerified(false);
    setEmailInput("");
    setEmailOtpInput("");
    setEmailError("");
    setEmailResendTimer(0);

    // Clear all localStorage
    localStorage.removeItem("verified_phone");
    localStorage.removeItem("phone_verified");
    localStorage.removeItem("distributor_mobile");
    localStorage.removeItem("verified_email");
    localStorage.removeItem("email_verified");
    localStorage.removeItem("temp_token");
    localStorage.removeItem("distributor_exists");
    localStorage.removeItem("distributor_status");
    localStorage.removeItem("user_data");
    localStorage.removeItem("customer_otp");
    localStorage.removeItem("customer_phone");

    dispatch(
      showToast({
        message: "Starting fresh registration",
        type: "info",
      }),
    );

    // Redirect to mobile check screen (parent will clear everything)
    if (onBackToMobile) {
      onBackToMobile();
    }
  };

  // ========== NEW REGISTRATION ==========
  const handleNewRegistration = () => {
    // Clear all data
    setIsMobileVerified(false);
    setShowMobileOtp(false);
    setMobileInput("");
    setMobileOtpInput("");
    setMobileError("");
    setMobileResendTimer(0);
    setIsMobileFromCheck(false);
    setIsEmailVerified(false);
    setEmailInput("");
    setEmailOtpInput("");
    setEmailError("");
    setEmailResendTimer(0);

    // Clear all localStorage
    localStorage.removeItem("verified_phone");
    localStorage.removeItem("phone_verified");
    localStorage.removeItem("distributor_mobile");
    localStorage.removeItem("verified_email");
    localStorage.removeItem("email_verified");
    localStorage.removeItem("temp_token");
    localStorage.removeItem("distributor_exists");
    localStorage.removeItem("distributor_status");
    localStorage.removeItem("user_data");
    localStorage.removeItem("customer_otp");
    localStorage.removeItem("customer_phone");

    setShowConfirmModal(false);

    dispatch(
      showToast({
        message: "Starting new registration",
        type: "info",
      }),
    );

    // Redirect to mobile check screen (parent will clear everything)
    if (onBackToMobile) {
      onBackToMobile();
    }
  };

  // ========== MOBILE OTP FUNCTIONS ==========
  const handleSendMobileOTP = async () => {
    if (!mobileInput || mobileInput.length < 10) {
      setMobileError("Please enter a valid 10-digit mobile number");
      dispatch(
        showToast({
          message: "Please enter a valid 10-digit mobile number",
          type: "error",
        }),
      );
      return;
    }

    let formattedMobile = mobileInput;
    if (!mobileInput.startsWith("+")) {
      formattedMobile = `+91${mobileInput.replace(/^0+/, "")}`;
    }

    setIsMobileOtpSending(true);
    setMobileError("");

    try {
      const response = await sendOTP({
        phone: formattedMobile,
        type: "phone",
        temp_token: tempToken,
      }).unwrap();

      if (response.status) {
        setShowMobileOtp(true);
        setMobileResendTimer(60);
        setMobileError("");
        setMobileOtpInput("");
        dispatch(
          showToast({
            message: `OTP sent to ${formattedMobile}`,
            type: "success",
          }),
        );
        dispatch(
          showToast({
            message: `OTP expires in ${response.expires_in} minutes`,
            type: "info",
          }),
        );
      } else {
        setMobileError(response.message || "Failed to send OTP");
        dispatch(
          showToast({
            message: response.message || "Failed to send OTP",
            type: "error",
          }),
        );
      }
    } catch (error: any) {
      const errorMsg =
        error?.data?.message || "Failed to send OTP. Please try again.";
      setMobileError(errorMsg);
      dispatch(
        showToast({
          message: errorMsg,
          type: "error",
        }),
      );
    } finally {
      setIsMobileOtpSending(false);
    }
  };

  const handleVerifyMobileOTP = async () => {
    if (!mobileOtpInput || mobileOtpInput.length < 6) {
      setMobileError("Please enter a valid 6-digit OTP");
      dispatch(
        showToast({
          message: "Please enter a valid 6-digit OTP",
          type: "error",
        }),
      );
      return;
    }

    let formattedMobile = mobileInput;
    if (!mobileInput.startsWith("+")) {
      formattedMobile = `+91${mobileInput.replace(/^0+/, "")}`;
    }

    setIsMobileVerifying(true);
    setMobileError("");

    try {
      const response = await verifyPhoneOTP({
        phone: formattedMobile,
        otp: mobileOtpInput,
      }).unwrap();

      if (response.status) {
        setIsMobileVerified(true);
        setShowMobileOtp(false);
        setMobileError("");
        const event = {
          target: { name: "mobile", value: mobileInput },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(event);
        localStorage.setItem("verified_phone", mobileInput);
        localStorage.setItem("phone_verified", "true");
        dispatch(
          showToast({
            message: "✓ Mobile verified successfully!",
            type: "success",
          }),
        );
      } else {
        setMobileError(response.message || "Invalid OTP. Please try again.");
        dispatch(
          showToast({
            message: response.message || "Invalid OTP. Please try again.",
            type: "error",
          }),
        );
      }
    } catch (error: any) {
      const errorMsg =
        error?.data?.message || "Failed to verify OTP. Please try again.";
      setMobileError(errorMsg);
      dispatch(
        showToast({
          message: errorMsg,
          type: "error",
        }),
      );
    } finally {
      setIsMobileVerifying(false);
    }
  };

  const handleResendMobileOTP = () => {
    if (mobileResendTimer === 0) {
      handleSendMobileOTP();
      dispatch(
        showToast({
          message: "Resending OTP...",
          type: "info",
        }),
      );
    }
  };

  // ========== EMAIL OTP FUNCTIONS ==========
  const handleSendEmailOTP = async () => {
    if (!emailInput || !emailInput.includes("@")) {
      setEmailError("Please enter a valid email address");
      dispatch(
        showToast({
          message: "Please enter a valid email address",
          type: "error",
        }),
      );
      return;
    }

    setIsEmailOtpSending(true);
    setEmailError("");

    try {
      const response = await sendOTP({
        email: emailInput,
        type: "email",
        temp_token: tempToken,
      }).unwrap();

      if (response.status) {
        setShowEmailOtp(true);
        setEmailResendTimer(60);
        setEmailError("");
        setEmailOtpInput("");
        dispatch(
          showToast({
            message: `OTP sent to ${emailInput}`,
            type: "success",
          }),
        );
        dispatch(
          showToast({
            message: `OTP expires in ${response.expires_in} minutes`,
            type: "info",
          }),
        );
      } else {
        setEmailError(response.message || "Failed to send OTP");
        dispatch(
          showToast({
            message: response.message || "Failed to send OTP",
            type: "error",
          }),
        );
      }
    } catch (error: any) {
      const errorMsg =
        error?.data?.message || "Failed to send OTP. Please try again.";
      setEmailError(errorMsg);
      dispatch(
        showToast({
          message: errorMsg,
          type: "error",
        }),
      );
    } finally {
      setIsEmailOtpSending(false);
    }
  };

  const handleVerifyEmailOTP = async () => {
    if (!emailOtpInput || emailOtpInput.length < 6) {
      setEmailError("Please enter a valid 6-digit OTP");
      dispatch(
        showToast({
          message: "Please enter a valid 6-digit OTP",
          type: "error",
        }),
      );
      return;
    }

    setIsEmailVerifying(true);
    setEmailError("");

    try {
      const response = await verifyEmailOTP({
        email: emailInput,
        otp: emailOtpInput,
      }).unwrap();

      if (response.status) {
        setIsEmailVerified(true);
        setShowEmailOtp(false);
        setEmailError("");
        const event = {
          target: { name: "email", value: emailInput },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(event);
        localStorage.setItem("verified_email", emailInput);
        localStorage.setItem("email_verified", "true");
        dispatch(
          showToast({
            message: "✓ Email verified successfully!",
            type: "success",
          }),
        );
      } else {
        setEmailError(response.message || "Invalid OTP. Please try again.");
        dispatch(
          showToast({
            message: response.message || "Invalid OTP. Please try again.",
            type: "error",
          }),
        );
      }
    } catch (error: any) {
      const errorMsg =
        error?.data?.message || "Failed to verify OTP. Please try again.";
      setEmailError(errorMsg);
      dispatch(
        showToast({
          message: errorMsg,
          type: "error",
        }),
      );
    } finally {
      setIsEmailVerifying(false);
    }
  };

  const handleChangeEmail = () => {
    setIsEmailVerified(false);
    setShowEmailOtp(false);
    setEmailInput("");
    setEmailOtpInput("");
    setEmailError("");
    setEmailResendTimer(0);
    localStorage.removeItem("verified_email");
    localStorage.removeItem("email_verified");
    dispatch(
      showToast({
        message: "Email changed, please verify again",
        type: "info",
      }),
    );
  };

  const handleResendEmailOTP = () => {
    if (emailResendTimer === 0) {
      handleSendEmailOTP();
      dispatch(
        showToast({
          message: "Resending OTP...",
          type: "info",
        }),
      );
    }
  };

  // ========== SUBMIT STEP 1 ==========
  const handleSubmit = async () => {
    if (!data.full_name) {
      errors.full_name = "Full name is required";
      dispatch(
        showToast({
          message: "Full name is required",
          type: "error",
        }),
      );
      return;
    }

    if (!data.date_of_birth) {
      errors.date_of_birth = "Date of birth is required";
      dispatch(
        showToast({
          message: "Date of birth is required",
          type: "error",
        }),
      );
      return;
    }

    if (!data.password) {
      errors.password = "Password is required";
      dispatch(
        showToast({
          message: "Password is required",
          type: "error",
        }),
      );
      return;
    }

    if (data.password !== data.confirm_password) {
      errors.confirm_password = "Passwords do not match";
      dispatch(
        showToast({
          message: "Passwords do not match",
          type: "error",
        }),
      );
      return;
    }

    if (!isMobileVerified) {
      setMobileError("Please verify your mobile number first");
      dispatch(
        showToast({
          message: "Please verify your mobile number first",
          type: "error",
        }),
      );
      return;
    }

    if (!isEmailVerified) {
      setEmailError("Please verify your email address first");
      dispatch(
        showToast({
          message: "Please verify your email address first",
          type: "error",
        }),
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const formattedMobile = mobileInput.startsWith("+")
        ? mobileInput
        : `+91${mobileInput.replace(/^0+/, "")}`;

      const response = await step1Personal({
        email: emailInput,
        full_name: data.full_name,
        phone: formattedMobile,
        date_of_birth: data.date_of_birth,
        country: "India",
        terms_condition: "1",
        password: data.password,
        password_confirmation: data.confirm_password,
      }).unwrap();

      if (response.status) {
        localStorage.removeItem("distributor_mobile");
        dispatch(
          showToast({
            message: "✓ Personal information saved successfully!",
            type: "success",
          }),
        );
        setTimeout(() => onNext(), 500);
      } else {
        const errorMessage =
          response.message || "Failed to save personal information";
        dispatch(
          showToast({
            message: errorMessage,
            type: "error",
          }),
        );

        if (errorMessage.toLowerCase().includes("phone")) {
          setMobileError(errorMessage);
        } else if (errorMessage.toLowerCase().includes("email")) {
          setEmailError(errorMessage);
        }
      }
    } catch (error: any) {
      console.error("Step 1 submission error:", error);
      const errorMessage =
        error?.data?.message || "Failed to save personal information";
      dispatch(
        showToast({
          message: errorMessage,
          type: "error",
        }),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="space-y-5">
        <div className="text-center mb-2">
          <h2 className="text-2xl font-bold text-[#06101E]">
            Personal Information
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Verify your contact details to continue
          </p>
        </div>

        {/* ===== NEW REGISTRATION BUTTON ===== */}
        {isMobileFromCheck && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowConfirmModal(true)}
              className="text-sm text-[#F9C744] hover:text-[#e5b33a] font-medium flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              New Registration
            </button>
          </div>
        )}

        {/* ===== MOBILE VERIFICATION ===== */}
        <div className="border border-gray-200 rounded-xl p-5 bg-white">
          <div className="flex items-center gap-2 mb-3">
            <Phone className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-800">Mobile Verification</h3>
            {isMobileVerified && (
              <span className="ml-auto flex items-center gap-1 text-sm text-green-600 font-medium">
                <CheckCircle className="w-4 h-4" /> Verified
              </span>
            )}
          </div>

          {isMobileVerified ? (
            <div className="flex items-center justify-between bg-green-50 rounded-lg p-3 border border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Verified Mobile</p>
                  <p className="font-medium text-gray-800">+91 {mobileInput}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleChangeMobile}
                className="text-[#F9C744] hover:text-[#e5b33a] text-sm font-medium hover:underline"
              >
                Change Number
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative">
                <Input
                  label="Mobile Number"
                  type="tel"
                  value={mobileInput}
                  onChange={() => {}}
                  error={mobileError}
                  placeholder="Enter 10-digit mobile number"
                  helperText={
                    isMobileFromCheck
                      ? "Verify this number with OTP"
                      : "We'll send OTP to verify your number"
                  }
                  className="w-full h-14 px-4 text-black rounded-xl border-gray-200 focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200 bg-gray-50"
                  disabled={true}
                />

                {isMobileFromCheck && !showMobileOtp && (
                  <div className="absolute right-2 top-8 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleChangeMobile}
                      className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                    >
                      Change
                    </button>
                    <span className="text-gray-300">|</span>
                    <Button
                      type="button"
                      onClick={handleSendMobileOTP}
                      disabled={isMobileOtpSending}
                      className="bg-[#F9C744] hover:bg-[#e5b33a] text-black font-medium px-4 py-1.5 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isMobileOtpSending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Send OTP"
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {!isMobileFromCheck && !showMobileOtp && (
                <Button
                  type="button"
                  onClick={handleSendMobileOTP}
                  disabled={
                    isMobileOtpSending ||
                    !mobileInput ||
                    mobileInput.length < 10
                  }
                  className="w-full bg-[#F9C744] hover:bg-[#e5b33a] text-black font-medium py-2.5 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isMobileOtpSending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    "Send OTP"
                  )}
                </Button>
              )}

              {showMobileOtp && (
                <div className="space-y-3 animate-fadeIn">
                  <div className="relative">
                    <Input
                      label="Enter OTP"
                      type="text"
                      value={mobileOtpInput}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        if (value.length <= 6) {
                          setMobileOtpInput(value);
                          setMobileError("");
                        }
                      }}
                      error={mobileError}
                      placeholder="Enter 6-digit OTP"
                      className="w-full h-14 px-4 text-black rounded-xl border-gray-200 focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200"
                      disabled={isMobileVerifying}
                    />
                    <div className="absolute right-2 top-8 flex gap-1">
                      <Button
                        type="button"
                        onClick={handleVerifyMobileOTP}
                        disabled={
                          isMobileVerifying ||
                          !mobileOtpInput ||
                          mobileOtpInput.length < 6
                        }
                        className="bg-[#F9C744] hover:bg-[#e5b33a] text-black font-medium px-3 py-1.5 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isMobileVerifying ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Verify"
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleResendMobileOTP}
                      disabled={mobileResendTimer > 0 || isMobileOtpSending}
                      className="text-sm text-[#F9C744] hover:text-[#e5b33a] disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      {mobileResendTimer > 0
                        ? `Resend in ${mobileResendTimer}s`
                        : "Resend OTP"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ===== EMAIL VERIFICATION ===== */}
        <div className="border border-gray-200 rounded-xl p-5 bg-white">
          <div className="flex items-center gap-2 mb-3">
            <Mail className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-800">Email Verification</h3>
            {isEmailVerified && (
              <span className="ml-auto flex items-center gap-1 text-sm text-green-600 font-medium">
                <CheckCircle className="w-4 h-4" /> Verified
              </span>
            )}
          </div>

          {isEmailVerified ? (
            <div className="flex items-center justify-between bg-green-50 rounded-lg p-3 border border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Verified Email</p>
                  <p className="font-medium text-gray-800">{emailInput}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleChangeEmail}
                className="text-[#F9C744] hover:text-[#e5b33a] text-sm font-medium hover:underline"
              >
                Change Email
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative">
                <Input
                  label="Email Address"
                  type="email"
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                    setEmailError("");
                  }}
                  error={emailError}
                  placeholder="Enter your email address"
                  helperText="We'll send OTP to verify your email"
                  className="w-full h-14 px-4 text-black rounded-xl border-gray-200 focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200"
                  disabled={isEmailOtpSending}
                />
                {!showEmailOtp && (
                  <Button
                    type="button"
                    onClick={handleSendEmailOTP}
                    disabled={
                      isEmailOtpSending ||
                      !emailInput ||
                      !emailInput.includes("@")
                    }
                    className="absolute right-2 top-8 bg-[#F9C744] hover:bg-[#e5b33a] text-black font-medium px-4 py-1.5 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isEmailOtpSending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending
                      </>
                    ) : (
                      "Send OTP"
                    )}
                  </Button>
                )}
              </div>

              {showEmailOtp && (
                <div className="space-y-3 animate-fadeIn">
                  <div className="relative">
                    <Input
                      label="Enter OTP"
                      type="text"
                      value={emailOtpInput}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        if (value.length <= 6) {
                          setEmailOtpInput(value);
                          setEmailError("");
                        }
                      }}
                      error={emailError}
                      placeholder="Enter 6-digit OTP"
                      className="w-full h-14 px-4 text-black rounded-xl border-gray-200 focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200"
                      disabled={isEmailVerifying}
                    />
                    <div className="absolute right-2 top-8 flex gap-1">
                      <Button
                        type="button"
                        onClick={handleVerifyEmailOTP}
                        disabled={
                          isEmailVerifying ||
                          !emailOtpInput ||
                          emailOtpInput.length < 6
                        }
                        className="bg-[#F9C744] hover:bg-[#e5b33a] text-black font-medium px-3 py-1.5 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isEmailVerifying ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Verifying
                          </>
                        ) : (
                          "Verify"
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleResendEmailOTP}
                      disabled={emailResendTimer > 0 || isEmailOtpSending}
                      className="text-sm text-[#F9C744] hover:text-[#e5b33a] disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      {emailResendTimer > 0
                        ? `Resend in ${emailResendTimer}s`
                        : "Resend OTP"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ===== OTHER FORM FIELDS ===== */}
        <div className="space-y-4">
          <Input
            label="Full Name (as per PAN)"
            name="full_name"
            value={data.full_name}
            onChange={onChange}
            error={errors.full_name}
            placeholder="John Doe"
            required
            helperText="Must match your PAN card name"
            className="w-full h-14 px-4 text-black rounded-xl border-gray-200 focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200"
          />

          <DatePicker
            label="Date of Birth"
            value={data.date_of_birth}
            onChange={handleDobChange}
            error={errors.date_of_birth || ageError}
            helperText="You must be at least 18 years old"
            required
          />

          <PasswordInput
            label="Create Password"
            name="password"
            value={data.password}
            onChange={onChange}
            error={errors.password}
            placeholder="Create a strong password"
            required
            helperText="Minimum 8 characters with uppercase, lowercase and number"
            className="w-full h-14 px-4 text-black rounded-xl border-gray-200 focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200 outline-none"
          />

          <PasswordInput
            label="Confirm Password"
            name="confirm_password"
            value={data.confirm_password}
            onChange={onChange}
            error={errors.confirm_password}
            placeholder="Confirm your password"
            required
            className="w-full h-14 px-4 text-black rounded-xl border-gray-200 focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200 outline-none"
          />

          <div className="flex justify-between items-center pt-4">
            <button
              type="button"
              onClick={onBackToMobile}
              className="text-gray-600 hover:text-gray-800 font-medium text-sm"
            >
              ← Back to Mobile
            </button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={
                isSubmitting ||
                !!ageError ||
                !isMobileVerified ||
                !isEmailVerified ||
                !data.full_name ||
                !data.date_of_birth ||
                !data.password ||
                data.password !== data.confirm_password
              }
              className="bg-[#F9C744] hover:bg-[#e5b33a] text-black font-semibold px-8 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                "Continue →"
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* ===== CONFIRMATION MODAL ===== */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full mx-4 p-6 shadow-2xl animate-scaleIn relative">
            <button
              type="button"
              onClick={() => setShowConfirmModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-amber-600" />
              </div>
            </div>

            <h3 className="text-xl font-bold text-center text-[#06101E] mb-2">
              Start New Registration?
            </h3>

            <p className="text-gray-500 text-center text-sm mb-6">
              All your entered information will be discarded. This action cannot
              be undone.
            </p>

            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
              <p className="text-xs text-red-600 text-center">
                ⚠️ Your current progress will be lost
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-lg transition-all duration-200"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleNewRegistration}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                Yes, Start New
              </Button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </>
  );
};
