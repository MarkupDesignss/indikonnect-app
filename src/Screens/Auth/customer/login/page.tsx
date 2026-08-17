// app/(auth)/customer/login/page.tsx

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CustomerLoginForm } from "../../../../components/customer/Login/CustomerLoginForm";
import CustomerOTPVerification from "@/components/customer/Login/CustomerOTPVerification";
import { TokenManager } from "@/lib/redux/api/baseApi";

const theme = {
  font: "'Inter', 'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, sans-serif",
  gold: "#F9C744",
  goldDark: "#E6B33D",
  goldDeep: "#C9922A",
  navy: "#06101E",
  navySoft: "#0B1B2E",
};

export default function CustomerLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"login" | "verify">("login");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = TokenManager.getAccessToken();
      const refreshToken = TokenManager.getRefreshToken();

      if (token && refreshToken) {
        // ✅ Redirect to home page
        router.replace("/");
      } else {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleOTPSent = (phone: string) => {
    setPhoneNumber(phone);
    setStep("verify");
  };

  const handleBack = () => {
    setStep("login");
    setPhoneNumber("");
  };

  if (isCheckingAuth) {
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
        className="min-h-screen w-full flex items-center justify-center bg-[#FAF8F4]"
      >
        <div className="bg-white/90 backdrop-blur-xl rounded-[28px] p-10 border border-[var(--navy)]/[0.06] shadow-[0_20px_60px_-15px_rgba(6,16,30,0.15)] text-center max-w-md w-full mx-4">
          <div className="pointer-events-none absolute inset-x-0 -top-10 flex justify-center">
            <div className="w-40 h-40 rounded-full bg-[radial-gradient(circle,_rgba(249,199,68,0.3)_0%,_rgba(249,199,68,0)_70%)] blur-xl" />
          </div>

          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--gold)] via-[var(--gold-dark)] to-[var(--gold-deep)] flex items-center justify-center shadow-[0_8px_20px_-6px_rgba(249,199,68,0.55)] mx-auto mb-4">
              <svg
                className="animate-spin h-8 w-8 text-[var(--navy)]"
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
            </div>
            <h2 className="text-xl font-bold text-[var(--navy)] mb-2">
              Checking Authentication
            </h2>
            <p className="text-sm text-gray-500">
              Please wait while we verify your session...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return step === "login" ? (
    <CustomerLoginForm onOTPSent={handleOTPSent} />
  ) : (
    <CustomerOTPVerification phoneNumber={phoneNumber} onBack={handleBack} />
  );
}
