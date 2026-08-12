// components/distributor/registration/components/steps/EmailCheckScreen.tsx

"use client";

import React, { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/common/Logo";
import { MobileCheckScreenProps } from "../../types/index";
import { useDispatch, useSelector } from "react-redux";
import { distributorAuthApi } from "../../../../../lib/redux/api/distributor/distributorauthApis";
import { RootState } from "@/lib/redux/store";

export const EmailCheckScreen: React.FC<MobileCheckScreenProps> = ({
  onCheckStatus,
  isLoading,
  statusMessage,
  statusType,
  mobile, // Used as email
  setMobile, // Used as setEmail
  error,
  onClear,
}) => {
  const dispatch = useDispatch();
  const [clearStatus, setClearStatus] = useState<string>("");
  const isFirstRender = useRef(true);

  // Check current API state
  const apiState = useSelector(
    (state: RootState) => state[distributorAuthApi.reducerPath],
  );

  // Debug logging
  useEffect(() => {
    console.log("📊 Current API State:", apiState);
    console.log("📧 Email:", mobile);
    console.log("🔄 Loading State:", isLoading);
    console.log("📝 Status Message:", statusMessage);
  }, [apiState, mobile, isLoading, statusMessage]);

  // Log on first render
  useEffect(() => {
    if (isFirstRender.current) {
      console.log("🚀 Component Mounted - EmailCheckScreen");
      console.log("🔍 API Reducer Path:", distributorAuthApi.reducerPath);
      console.log("🔍 API util available:", !!distributorAuthApi.util);
      console.log(
        "🔍 resetApiState available:",
        !!distributorAuthApi.util?.resetApiState,
      );
      isFirstRender.current = false;
    }
  }, []);

  // ✅ Function to clear all localStorage items
  const clearAllLocalStorage = () => {
    console.log("🗑️ Clearing all localStorage items...");

    const itemsToClear = [
      // Distributor related
      "distributor_mobile",
      "distributor_email",
      "distributor_verified_phone",
      "distributor_phone_verified",
      "distributor_verified_email",
      "distributor_email_verified",
      "distributor_temp_token",
      "distributor_exists",
      "distributor_status",
      "distributor_step_data",
      "distributor_step_completed",
      "distributor_fresh_registration",
      "distributor_user_data",

      // Customer related
      "customer_otp",
      "customer_phone",
      "customer_verified",

      // User related
      "user_data",
      "user_token",
      "user_email",
      "user_phone",

      // OTP related
      "otp_timer",
      "otp_attempts",
      "otp_resend_timer",

      // Registration related
      "registration_step",
      "registration_data",
      "registration_completed",

      // Auth related
      "auth_token",
      "auth_user",
      "auth_verified",

      // Any other app specific keys
      "app_theme",
      "app_language",
      "last_visited",
    ];

    itemsToClear.forEach((key) => {
      if (localStorage.getItem(key) !== null) {
        localStorage.removeItem(key);
        console.log(`✅ Removed: ${key}`);
      }
    });

    // ✅ Clear all sessionStorage too
    sessionStorage.clear();
    console.log("✅ SessionStorage cleared");

    console.log("✅ All specified localStorage items cleared!");
  };

  const handleCheck = () => {
    const trimmedEmail = mobile?.trim();

    if (trimmedEmail && trimmedEmail.length > 0) {
      console.log("🔄 ===== Clearing All Data Before Check =====");

      try {
        // ✅ 1. Clear all localStorage items
        clearAllLocalStorage();

        // ✅ 2. Clear RTK Query state
        dispatch(distributorAuthApi.util.resetApiState());
        console.log("✅ resetApiState dispatched");

        // ✅ 3. Invalidate specific tags
        dispatch(
          distributorAuthApi.util.invalidateTags([
            "DistributorCheckStatus",
            "DistributorStepData",
            "User",
            "Auth",
            "Registration",
          ]),
        );
        console.log("✅ invalidateTags dispatched");

      } catch (error) {
        console.error("❌ Error clearing data:", error);
        setClearStatus("❌ Error clearing data");
      }

      // Store email in localStorage before checking
      localStorage.setItem("distributor_email", trimmedEmail);
      console.log("💾 Email stored in localStorage:", trimmedEmail);

      // Small delay to ensure state is cleared before API call
      setTimeout(() => {
        console.log("📞 Calling onCheckStatus with email:", trimmedEmail);
        // Pass the email directly to the parent handler
        onCheckStatus(trimmedEmail);
      }, 200);
    } else {
      console.warn("⚠️ Email is empty or invalid");
      // Optional: Set error message
      if (onClear) {
        onClear();
      }
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      console.log("⌨️ Enter key pressed");
      handleCheck();
    }
  };

  // Handle email input change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setMobile(val);

    // Clear status messages when user types
    if (statusMessage) {
      onClear?.();
      setClearStatus("");
    }

    // Reset API state when input is cleared
    if (val.length === 0) {
      console.log("🔄 Input cleared, resetting state");
      dispatch(distributorAuthApi.util.resetApiState());
    }
  };

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md mx-auto text-center">
        <div className="flex justify-center mb-6">
          <Logo width={64} height={64} showText={false} />
        </div>

        <h2 className="text-2xl font-bold text-[#06101E] mb-2">
          Enter Your Email Address
        </h2>
        <p className="text-gray-500 text-sm mb-8">
          We'll check your registration status
        </p>

        <div className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 block">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div
                className={`flex items-center w-full h-14 rounded-xl border ${error ? "border-red-500" : "border-gray-200"
                  } bg-white focus-within:border-[#F9C744] focus-within:ring-2 focus-within:ring-[#F9C744]/20 transition-all duration-200 overflow-hidden`}
              >
                <div className="flex items-center gap-1 px-3 border-r border-gray-200 h-full bg-gray-50/50 min-w-[70px]">
                  <svg
                    className="w-4 h-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">@</span>
                </div>
                <input
                  type="email"
                  value={mobile}
                  onChange={handleEmailChange}
                  onKeyDown={handleKeyPress}
                  placeholder="Enter your email address"
                  className="flex-1 h-full px-3 text-black outline-none bg-transparent"
                  autoFocus
                  autoComplete="email"
                />
                {mobile && mobile.trim().length > 0 && (
                  <button
                    type="button"
                    onClick={handleCheck}
                    disabled={isLoading}
                    className="mr-2 px-4 py-2 bg-[#F9C744] text-[#06101E] font-medium rounded-lg hover:bg-[#E6B33D] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap"
                  >
                    {isLoading ? <SpinnerIcon /> : "Check Status"}
                  </button>
                )}
              </div>
              {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
              {statusMessage && (
                <p
                  className={`text-xs mt-1 ${statusType === "success"
                      ? "text-green-600"
                      : statusType === "error"
                        ? "text-red-500"
                        : "text-blue-600"
                    }`}
                >
                  {statusMessage}
                </p>
              )}
              {clearStatus && !statusMessage && (
                <p className="text-xs text-green-600 mt-1">{clearStatus}</p>
              )}
            </div>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                console.log("🔗 Navigating to customer login");
                // Clear data before navigating
                clearAllLocalStorage();
                dispatch(distributorAuthApi.util.resetApiState());
                window.location.href = "/auth/customer/login";
              }}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
            >
              Login as Customer instead?
            </button>
          </div>

          {/* Debug Buttons - Only for development */}
          {process.env.NODE_ENV === "development" && (
            <div className="text-center mt-4 space-y-2">
              <div className="flex flex-wrap justify-center gap-2"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Spinner icon component
const SpinnerIcon = () => (
  <svg
    className="w-5 h-5 animate-spin"
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
);

export default EmailCheckScreen;