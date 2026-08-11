// components/auth/CustomerOTPVerification.tsx

"use client";

import React, { useState, useEffect, useRef } from "react";
import { OTPInput } from "@/components/common/OTPInput";
import { Button } from "@/components/common/Button";
import { Logo } from "@/components/common/Logo";
import Link from "next/link";
import {
  useVerifyOTPMutation,
  useSendOTPMutation,
} from "@/lib/redux/api/authApi";

interface CustomerOTPVerificationProps {
  phoneNumber: string;
  onBack?: () => void;
}

function RouteMotif() {
  return (
    <svg viewBox="0 0 320 320" className="w-full h-full" fill="none">
      <path
        d="M40 250 C 90 180, 70 120, 140 90 S 250 40, 280 70"
        stroke="#F9C744"
        strokeOpacity="0.3"
        strokeWidth="1.5"
        strokeDasharray="3 8"
      />
      <path
        d="M60 60 C 110 90, 130 150, 90 210 S 60 290, 130 280"
        stroke="#F9C744"
        strokeOpacity="0.2"
        strokeWidth="1.5"
        strokeDasharray="3 8"
      />
      <circle
        className="route-node"
        style={{ animationDelay: "0s" }}
        cx="40"
        cy="250"
        r="4"
        fill="#F9C744"
      />
      <circle
        className="route-node"
        style={{ animationDelay: "0.7s" }}
        cx="140"
        cy="90"
        r="4"
        fill="#F9C744"
      />
      <circle
        className="route-node"
        style={{ animationDelay: "1.4s" }}
        cx="280"
        cy="70"
        r="4"
        fill="#F9C744"
      />
      <circle
        className="route-node"
        style={{ animationDelay: "2.1s" }}
        cx="90"
        cy="210"
        r="4"
        fill="#F9C744"
      />
      <circle
        className="route-node"
        style={{ animationDelay: "1.1s" }}
        cx="130"
        cy="280"
        r="4"
        fill="#F9C744"
      />
      <circle
        className="route-node"
        style={{ animationDelay: "1.8s" }}
        cx="60"
        cy="60"
        r="4"
        fill="#F9C744"
      />
      <style>{`
                .route-node { 
                    animation: routePulse 3s ease-in-out infinite; 
                }
                @keyframes routePulse {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.2); }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 0.2; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(1.5); }
                }
            `}</style>
    </svg>
  );
}

export const CustomerOTPVerification: React.FC<
  CustomerOTPVerificationProps
> = ({ phoneNumber, onBack }) => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const verificationInProgress = useRef(false);

  const [verifyOTP, { isLoading }] = useVerifyOTPMutation();
  const [sendOTP, { isLoading: isResending }] = useSendOTPMutation();

  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft]);

  // Reset verification flag when component unmounts
  useEffect(() => {
    return () => {
      verificationInProgress.current = false;
    };
  }, []);

  const handleVerifyOTP = async (otpValue: string) => {
    // Prevent duplicate verification calls
    if (verificationInProgress.current || isVerifying || isLoading) {
      console.log("⚠️ Verification already in progress, skipping...");
      return;
    }

    if (!otpValue || otpValue.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    console.log("🔵🔵🔵 SENDING OTP VERIFICATION REQUEST");
    console.log("📱 Phone:", phoneNumber);
    console.log("🔑 OTP:", otpValue);

    verificationInProgress.current = true;
    setIsVerifying(true);
    setError(null);

    try {
      // Call the API - authApi onQueryStarted will handle navigation
      const result = await verifyOTP({
        phone: phoneNumber,
        otp: otpValue,
      }).unwrap();

      console.log("✅ OTP verification API call successful:", result);

      // Show success state
      setIsSuccess(true);

      // The authApi onQueryStarted will handle the redirect
      // We just show the success message

    } catch (err: any) {
      console.error("❌ OTP Verification Error:", err);
      setError(err.data?.message || "Invalid OTP. Please try again.");
      verificationInProgress.current = false;
      setIsVerifying(false);
      setIsSuccess(false);
    }
  };

  const handleComplete = (value: string) => {
    setOtp(value);
    // Only trigger verification if OTP is complete and not already verifying
    if (
      value.length === 6 &&
      !verificationInProgress.current &&
      !isVerifying &&
      !isLoading
    ) {
      handleVerifyOTP(value);
    }
  };

  const handleVerifyClick = () => {
    if (otp.length === 6) {
      handleVerifyOTP(otp);
    } else {
      setError("Please enter a complete 6-digit OTP");
    }
  };

  const handleResend = async () => {
    if (isResending) return;

    setError(null);
    setOtp("");
    setIsSuccess(false);
    verificationInProgress.current = false;
    setIsVerifying(false);

    try {
      const result = await sendOTP({
        phone: phoneNumber,
      }).unwrap();

      if (result.status === true) {
        setTimeLeft(30);
        setCanResend(false);
      } else {
        setError(result.message || "Failed to resend OTP. Please try again.");
      }
    } catch (err: any) {
      console.error("Resend OTP error:", err);
      setError(err.data?.message || "Failed to resend OTP. Please try again.");
    }
  };

  const formatPhoneNumber = (phone: string) => {
    if (phone.startsWith("+91")) {
      const digits = phone.replace("+91", "");
      return `+91 ${digits.slice(0, 5)}****${digits.slice(-2)}`;
    }
    if (phone.length === 10) {
      return `+91 ${phone.slice(0, 5)}****${phone.slice(-2)}`;
    }
    return phone;
  };

  return (
    <div className="min-h-screen w-full bg-[#FAF8F4] flex flex-col lg:flex-row">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 min-h-screen bg-[#0F2038] relative overflow-hidden flex-col justify-between p-10">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 40%, #F9C744 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />
        <div className="absolute -right-20 -top-20 w-96 h-96 opacity-60">
          <RouteMotif />
        </div>
        <div className="absolute inset-0 opacity-10">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 bg-[#F9C744] rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `pulse 3s ease-in-out ${Math.random() * 3}s infinite`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-sm p-2.5 rounded-xl border border-white/10">
              <Logo width={32} height={32} showText={false} />
            </div>
            <span className="text-white/40 text-xs tracking-[0.2em] font-light">
              INDICONNECT
            </span>
          </div>
        </div>

        <div className="relative z-10 max-w-sm mx-auto">
          <div className="space-y-8">
            <div className="w-16 h-1 bg-gradient-to-r from-[#F9C744] to-[#E6B33D] rounded-full" />
            <h2 className="text-white text-4xl font-bold leading-tight">
              Verify your
              <br />
              <span className="text-[#F9C744]">phone number</span>
              <br />
              <span className="text-2xl text-white/60 font-normal">
                One step away from your account
              </span>
            </h2>
            <div className="space-y-4">
              <p className="text-[#8291A6] text-sm leading-relaxed">
                We've sent a 6-digit verification code to your phone. Enter it
                below to complete your verification.
              </p>
              <div className="space-y-3 text-xs text-[#5C6B80]">
                <div className="flex items-center gap-3 group cursor-default">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F9C744] group-hover:scale-150 transition-transform duration-300" />
                  <span>Secure verification process</span>
                </div>
                <div className="flex items-center gap-3 group cursor-default">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F9C744] group-hover:scale-150 transition-transform duration-300" />
                  <span>One-time code expires in 5 minutes</span>
                </div>
                <div className="flex items-center gap-3 group cursor-default">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F9C744] group-hover:scale-150 transition-transform duration-300" />
                  <span>Protecting your account security</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F9C744]" />
            <span className="text-[#5C6B80]">Trusted by 12,000+ retailers</span>
          </div>
          <span className="text-[#5C6B80]">99.9% uptime</span>
        </div>
      </div>

      {/* Right Panel - OTP Verification Form */}
      <div className="flex-1 min-h-screen flex items-center justify-center px-4 py-8 lg:py-0">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex justify-center mb-8">
            <Logo width={40} height={40} showText={false} />
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="text-center mb-8">
              <div className="flex items-center gap-3 justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-[#F9C744]/10 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-[#F9C744]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-[#06101E]">
                Verify Your Number
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Enter the 6-digit code sent to{" "}
                <span className="font-medium text-[#06101E]">
                  {formatPhoneNumber(phoneNumber)}
                </span>
              </p>
            </div>

            <div className="space-y-6">
              {isSuccess ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 mx-auto rounded-full bg-green-50 flex items-center justify-center mb-4 animate-pulse">
                    <svg
                      className="w-10 h-10 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <p className="text-green-600 font-medium text-lg">
                    Verified successfully!
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Redirecting...
                  </p>
                  <div className="mt-4 flex justify-center">
                    <div className="w-8 h-8 border-4 border-[#F9C744] border-t-transparent rounded-full animate-spin" />
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-center">
                    <OTPInput
                      length={6}
                      value={otp}
                      onChange={setOtp}
                      onComplete={handleComplete}
                      disabled={isLoading || isVerifying}
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-xl border border-red-100">
                      <svg
                        className="w-4 h-4 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="flex flex-col gap-3 pt-2">
                    <Button
                      type="button"
                      fullWidth
                      loading={isLoading || isVerifying}
                      disabled={otp.length !== 6 || isLoading || isVerifying}
                      onClick={handleVerifyClick}
                      className="h-14 text-black bg-gradient-to-r from-[#F9C744] to-[#E6B33D] hover:from-[#E6B33D] hover:to-[#D4A22E] text-[#06101E] font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-[#F9C744]/40 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading || isVerifying ? "Verifying..." : "Verify OTP"}
                    </Button>

                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={onBack}
                        disabled={isLoading || isVerifying}
                        className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                        Change number
                      </button>

                      {canResend ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleResend}
                          disabled={isResending || isLoading || isVerifying}
                          type="button"
                          className="text-[#B98F1E] hover:text-[#D4A22E] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isResending ? (
                            <span className="flex items-center gap-2">
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
                              Resending...
                            </span>
                          ) : (
                            "Resend OTP"
                          )}
                        </Button>
                      ) : (
                        <span className="text-sm text-gray-400 flex items-center gap-1">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Resend in {timeLeft}s
                        </span>
                      )}
                    </div>
                  </div>
                </>
              )}

              <div className="text-center pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  By continuing, you agree to our{" "}
                  <Link
                    href="/terms"
                    className="text-[#B98F1E] hover:underline"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="text-[#B98F1E] hover:underline"
                  >
                    Privacy Policy
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerOTPVerification;