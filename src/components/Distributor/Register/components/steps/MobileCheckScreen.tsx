// components/distributor/registration/components/steps/MobileCheckScreen.tsx

"use client";

import React from "react";
import { Logo } from "@/components/common/Logo";
import { MobileCheckScreenProps } from "../../types/index";

export const MobileCheckScreen: React.FC<MobileCheckScreenProps> = ({
  onCheckStatus,
  isLoading,
  statusMessage,
  statusType,
  mobile,
  setMobile,
  error,
  onClear,
}) => {
  const handleCheck = () => {
    if (mobile.length === 10) {
      // Store mobile in localStorage before checking
      localStorage.setItem("distributor_mobile", mobile);
      onCheckStatus(mobile);
    }
  };

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md mx-auto text-center">
        <div className="flex justify-center mb-6">
          <Logo width={64} height={64} showText={false} />
        </div>

        <h2 className="text-2xl font-bold text-[#06101E] mb-2">
          Enter Your Mobile Number
        </h2>
        <p className="text-gray-500 text-sm mb-8">
          We'll check your registration status
        </p>

        <div className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 block">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div
                className={`flex items-center w-full h-14 rounded-xl border ${
                  error ? "border-red-500" : "border-gray-200"
                } bg-white focus-within:border-[#F9C744] focus-within:ring-2 focus-within:ring-[#F9C744]/20 transition-all duration-200 overflow-hidden`}
              >
                <div className="flex items-center gap-1 px-3 border-r border-gray-200 h-full bg-gray-50/50 min-w-[70px]">
                  <span className="text-sm font-medium text-gray-700">+91</span>
                  <svg
                    className="w-3 h-3 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setMobile(val);
                    if (statusMessage) {
                      onClear?.();
                    }
                  }}
                  placeholder="Enter your phone number"
                  className="flex-1 h-full px-3 text-black outline-none bg-transparent"
                  maxLength={10}
                />
                {mobile.length === 10 && (
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
                  className={`text-xs mt-1 ${
                    statusType === "success"
                      ? "text-green-600"
                      : statusType === "error"
                        ? "text-red-500"
                        : "text-blue-600"
                  }`}
                >
                  {statusMessage}
                </p>
              )}
            </div>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => (window.location.href = "/auth/customer/login")}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Login as Customer instead?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

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
