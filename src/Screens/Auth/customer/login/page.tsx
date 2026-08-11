// app/(auth)/customer/login/page.tsx

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CustomerLoginForm } from "../../../../components/customer/Login/CustomerLoginForm";
import { CustomerOTPVerification } from "../../../../components/customer/Login/CustomerOTPVerification";
import { TokenManager } from "@/lib/redux/api/baseApi";

export default function CustomerLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"login" | "verify">("login");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = () => {
      const token = TokenManager.getAccessToken();
      const refreshToken = TokenManager.getRefreshToken();

      if (token && refreshToken) {
        // User is already logged in, redirect to products
        router.replace("/products");
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

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen w-full bg-[#FAF8F4] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F9C744] mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
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
