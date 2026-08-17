// components/auth/CustomerOTPVerification.tsx

"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { OTPInput } from "@/components/common/OTPInput";
import ConstellationBackground from "@/components/common/ConstellationBackground";
import { Logo } from "@/components/common/Logo";
import Link from "next/link";
import {
  useVerifyOTPMutation,
  useSendOTPMutation,
} from "@/lib/redux/api/authApi";
import { TokenManager } from "@/lib/redux/api/baseApi";
import {
  Shield,
  Clock,
  Lock,
  CheckCircle,
  ArrowLeft,
  RefreshCw,
  Smartphone,
  Zap,
} from "lucide-react";

const theme = {
  font: "'Inter', 'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, sans-serif",
  gold: "#F9C744",
  goldDark: "#E6B33D",
  goldDeep: "#C9922A",
  navy: "#06101E",
  navySoft: "#0B1B2E",
};

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
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const verificationInProgress = useRef(false);
  const redirectTimerRef = useRef<NodeJS.Timeout | null>(null);

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

  useEffect(() => {
    return () => {
      verificationInProgress.current = false;
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

  const handleVerifyOTP = async (otpValue: string) => {
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
      const result = await verifyOTP({
        phone: phoneNumber,
        otp: otpValue,
      }).unwrap();

      console.log("✅ OTP verification API call successful:", result);

      if (result.status === true) {
        // ✅ Check if token was set
        const token = TokenManager.getAccessToken();
        if (token) {
          console.log("🔑 Token found, redirecting to home page...");
          setIsSuccess(true);

          // ✅ Redirect after showing success state
          if (redirectTimerRef.current) {
            clearTimeout(redirectTimerRef.current);
          }
          redirectTimerRef.current = setTimeout(() => {
            console.log("📍 Redirecting to home page...");
            router.push("/");
          }, 1500);
        } else {
          console.error("❌ No token found after verification");
          setError("Authentication failed. Please try again.");
          verificationInProgress.current = false;
          setIsVerifying(false);
          setIsSuccess(false);
        }
      } else {
        setError(result.message || "Invalid OTP. Please try again.");
        verificationInProgress.current = false;
        setIsVerifying(false);
        setIsSuccess(false);
      }
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
        console.log("✅ OTP resent successfully!");
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

  const features = [
    { icon: Shield, label: "Secure verification process" },
    { icon: Clock, label: "One-time code expires in 5 minutes" },
    { icon: Lock, label: "Protecting your account security" },
  ];

  return (
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
      className="min-h-screen flex items-center justify-center bg-[#FAF8F4] px-3 sm:px-4 py-4 sm:py-8"
    >
      <ConstellationBackground
        starColor="#F9C744"
        starCount={55}
        connectionDistance={22}
        animationSpeed={1.2}
        showParticles={true}
        particleCount={20}
        showShootingStars={true}
        shootingStarCount={5}
        glowIntensity={1.2}
        interactive={true}
      />
      <div className="w-full max-w-4xl mx-auto">
        <div className="relative rounded-2xl sm:rounded-[28px] bg-white/90 backdrop-blur-xl border border-[var(--navy)]/[0.06] shadow-[0_20px_60px_-15px_rgba(6,16,30,0.15)] overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 -top-10 flex justify-center">
            <div className="w-40 sm:w-60 h-40 sm:h-60 rounded-full bg-[radial-gradient(circle,_rgba(249,199,68,0.25)_0%,_rgba(249,199,68,0)_70%)] blur-2xl" />
          </div>

          <div className="relative grid grid-cols-1 lg:grid-cols-5">
            {/* Left Panel */}
            <div className="hidden lg:flex lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-[#0F2038] via-[#06101E] to-[#030810] p-8 lg:p-10 flex-col justify-between min-h-[400px] lg:min-h-[600px]">
              <div className="absolute inset-0 opacity-[0.03]">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 20% 50%, #F9C744 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                  }}
                />
              </div>

              <div className="absolute -right-20 -top-20 w-96 h-96 bg-[#F9C744]/5 rounded-full blur-3xl" />
              <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-[#F9C744]/5 rounded-full blur-3xl" />

              <div className="absolute inset-0 opacity-30">
                <RouteMotif />
              </div>

              <div className="absolute inset-0 opacity-10">
                {[...Array(15)].map((_, i) => (
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
                  <span className="text-white/40 text-[10px] tracking-[0.2em] font-light uppercase">
                    Indiekonnet
                  </span>
                </div>
              </div>

              <div className="relative z-10 py-6">
                <div className="space-y-6">
                  <div className="w-12 h-1 bg-gradient-to-r from-[#F9C744] to-[#E6B33D] rounded-full" />

                  <h2 className="text-white text-2xl lg:text-3xl font-bold leading-tight">
                    Verify your
                    <br />
                    <span className="text-[#F9C744]">phone number</span>
                  </h2>

                  <p className="text-[#8291A6] text-sm leading-relaxed">
                    We've sent a 6-digit verification code to your phone. Enter
                    it below to complete your verification.
                  </p>

                  <div className="space-y-2.5">
                    {features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 text-xs text-[#5C6B80] group cursor-default"
                      >
                        <div className="w-6 h-6 rounded-lg bg-[#F9C744]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#F9C744]/20 transition-colors duration-300">
                          <feature.icon className="w-3.5 h-3.5 text-[#F9C744]" />
                        </div>
                        <span className="group-hover:text-white/80 transition-colors duration-300">
                          {feature.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative z-10 grid grid-cols-2 gap-4 text-xs border-t border-white/5 pt-4">
                <div>
                  <p className="text-white font-semibold text-lg">12K+</p>
                  <p className="text-[#5C6B80] text-[10px]">
                    Trusted Retailers
                  </p>
                </div>
                <div className="border-l border-white/5 pl-4">
                  <p className="text-white font-semibold text-lg">99.9%</p>
                  <p className="text-[#5C6B80] text-[10px]">Uptime</p>
                </div>
              </div>
            </div>

            {/* Right Panel */}
            <div className="lg:col-span-3 p-5 sm:p-6 md:p-8 lg:p-10 flex flex-col justify-center">
              {/* Mobile Header */}
              <div className="lg:hidden text-center mb-6">
                <div className="flex justify-center mb-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--gold)] via-[var(--gold-dark)] to-[var(--gold-deep)] flex items-center justify-center shadow-[0_8px_20px_-6px_rgba(249,199,68,0.55)]">
                    <Smartphone className="w-7 h-7 text-[var(--navy)]" />
                  </div>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--navy)]">
                  Verify Your Number
                </h2>
                <p className="text-gray-500 text-xs sm:text-sm font-medium mt-1">
                  Enter the 6-digit code sent to your phone
                </p>
              </div>

              {/* Desktop Header */}
              <div className="hidden lg:block mb-6 lg:mb-8">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[var(--gold)] via-[var(--gold-dark)] to-[var(--gold-deep)] flex items-center justify-center shadow-[0_8px_20px_-6px_rgba(249,199,68,0.55)] flex-shrink-0">
                    <Smartphone className="w-5 h-5 text-[var(--navy)]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold tracking-tight text-[var(--navy)]">
                        Verify Your Number
                      </h2>
                      <span className="text-[10px] font-semibold text-[var(--gold-deep)] bg-[#FFFBEF] px-2 py-0.5 rounded-full border border-[var(--gold)]/30 hidden sm:inline-block">
                        OTP
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm font-medium">
                      Enter the 6-digit code sent to{" "}
                      <span className="font-semibold text-[var(--navy)]">
                        {formatPhoneNumber(phoneNumber)}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Success State */}
              {isSuccess ? (
                <div className="text-center py-6 sm:py-8">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-green-100 flex items-center justify-center ring-4 ring-green-50 animate-pulse">
                      <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-green-700 mb-2">
                    Verified Successfully!
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">
                    Redirecting to your dashboard...
                  </p>
                  <div className="mt-6 flex justify-center">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-center mb-5 sm:mb-6">
                    <OTPInput
                      length={6}
                      value={otp}
                      onChange={setOtp}
                      onComplete={handleComplete}
                      disabled={isLoading || isVerifying}
                    />
                  </div>

                  {error && (
                    <div className="mb-4 bg-red-50/80 backdrop-blur-sm p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-red-200 text-xs sm:text-sm text-red-700 flex items-start gap-2 sm:gap-3 font-medium">
                      <span className="text-base sm:text-lg flex-shrink-0">
                        ❌
                      </span>
                      <span className="break-words">{error}</span>
                    </div>
                  )}

                  <div className="space-y-3 sm:space-y-4">
                    <button
                      type="button"
                      onClick={handleVerifyClick}
                      disabled={otp.length !== 6 || isLoading || isVerifying}
                      className="w-full bg-[var(--gold)] hover:bg-[var(--gold-dark)] text-[var(--navy)] font-semibold h-12 sm:h-14 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200 shadow-[0_8px_20px_-6px_rgba(249,199,68,0.5)] hover:shadow-[0_12px_28px_-8px_rgba(249,199,68,0.6)] active:scale-[0.98] text-sm sm:text-base"
                    >
                      {isLoading || isVerifying ? (
                        <>
                          <svg
                            className="animate-spin h-4 w-4 sm:h-5 sm:w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Verifying...
                        </>
                      ) : (
                        <>
                          Verify OTP
                          <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </>
                      )}
                    </button>

                    <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-0 sm:justify-between">
                      <button
                        type="button"
                        onClick={onBack}
                        disabled={isLoading || isVerifying}
                        className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200 flex items-center gap-1.5 font-medium disabled:opacity-50 disabled:cursor-not-allowed order-2 sm:order-1"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Change number
                      </button>

                      {canResend ? (
                        <button
                          type="button"
                          onClick={handleResend}
                          disabled={isResending || isLoading || isVerifying}
                          className="text-sm text-[var(--gold-deep)] hover:text-[var(--gold-dark)] font-semibold transition-colors duration-200 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
                        >
                          <RefreshCw
                            className={`w-4 h-4 ${isResending ? "animate-spin" : ""}`}
                          />
                          {isResending ? "Resending..." : "Resend OTP"}
                        </button>
                      ) : (
                        <span className="text-sm text-gray-400 flex items-center gap-1.5 font-medium order-1 sm:order-2">
                          <Clock className="w-4 h-4" />
                          Resend in {timeLeft}s
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-center pt-4 sm:pt-6 border-t border-gray-100 mt-4">
                    <p className="text-[10px] sm:text-xs text-gray-400 font-medium">
                      By continuing, you agree to our{" "}
                      <Link
                        href="/terms"
                        className="text-[var(--gold-deep)] hover:underline font-semibold"
                      >
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/privacy"
                        className="text-[var(--gold-deep)] hover:underline font-semibold"
                      >
                        Privacy Policy
                      </Link>
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerOTPVerification;
