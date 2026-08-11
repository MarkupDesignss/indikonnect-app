// components/distributor/Registration/DistributorRegistrationFlow.tsx

"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/common/Input";
import { PhoneInput } from "@/components/common/PhoneInput";
import { Button } from "@/components/common/Button";
import { Logo } from "@/components/common/Logo";
import Link from "next/link";

// Types based on FRD requirements
interface DistributorFormData {
  full_name: string;
  date_of_birth: string;
  email: string;
  mobile: string;
  password: string;
  confirm_password: string;
  sponsor_id: string;
  placement_leg: "left" | "right" | "auto";
  email_verified: boolean;
  mobile_verified: boolean;
  aadhaar_number: string;
  aadhaar_consent: boolean;
  aadhaar_verified: boolean;
  pan_number: string;
  pan_verified: boolean;
  bank_account_holder_name: string;
  bank_account_number: string;
  bank_confirm_account_number: string;
  bank_ifsc_code: string;
  bank_name: string;
  bank_branch: string;
  bank_account_type: "current" | "savings";
  location_consent: boolean;
  latitude?: number;
  longitude?: number;
  terms_accepted: boolean;
  agreement_accepted: boolean;
  code_of_conduct_accepted: boolean;
  account_type: "distributor";
}

// Enhanced Date Picker Component
const DatePicker = ({
  value,
  onChange,
  error,
  helperText,
  label,
  required,
}: any) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value) : null,
  );
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [yearInput, setYearInput] = useState("");
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    const startingDay = firstDay.getDay();

    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    const formattedDate = date.toISOString().split("T")[0];
    onChange({ target: { name: "date_of_birth", value: formattedDate } });
    setShowCalendar(false);
  };

  const handleMonthChange = (increment: number) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + increment);
    setCurrentMonth(newDate);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const year = parseInt(e.target.value);
    if (year && year > 1900 && year < 2100) {
      const newDate = new Date(currentMonth);
      newDate.setFullYear(year);
      setCurrentMonth(newDate);
    }
    setYearInput(e.target.value);
  };

  const handleYearBlur = () => {
    if (yearInput) {
      const year = parseInt(yearInput);
      if (year >= 1900 && year <= 2100) {
        const newDate = new Date(currentMonth);
        newDate.setFullYear(year);
        setCurrentMonth(newDate);
      }
    }
    setYearInput("");
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <div className="space-y-1.5 relative" ref={pickerRef}>
      <label className="text-sm font-medium text-gray-700 block">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div
        className="relative cursor-pointer"
        onClick={() => setShowCalendar(!showCalendar)}
      >
        <input
          type="text"
          value={formatDisplayDate(value)}
          placeholder="Select date of birth"
          readOnly
          className={`w-full h-14 px-4 text-base rounded-xl border ${
            error ? "border-red-500" : "border-gray-200"
          } bg-white cursor-pointer focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200 outline-none`}
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      {helperText && !error && (
        <p className="text-xs text-gray-400 mt-1">{helperText}</p>
      )}

      {showCalendar && (
        <div className="absolute z-50 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-5 w-[340px] left-0">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleMonthChange(-1);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5 text-gray-600"
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
            </button>

            <div className="flex items-center gap-3">
              <span className="font-semibold text-gray-800 text-lg">
                {months[currentMonth.getMonth()]}
              </span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={yearInput || currentMonth.getFullYear()}
                  onChange={handleYearChange}
                  onBlur={handleYearBlur}
                  onClick={(e) => e.stopPropagation()}
                  className="w-20 h-9 text-center border border-gray-200 rounded-lg text-sm font-semibold focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 outline-none"
                  min="1900"
                  max="2100"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleMonthChange(1);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5 text-gray-600"
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

          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-gray-400 py-1"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((date, index) => (
              <button
                key={index}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (date) handleDateSelect(date);
                }}
                disabled={!date}
                className={`
                  h-10 rounded-lg text-sm transition-colors
                  ${!date ? "invisible" : "hover:bg-[#F9C744]/20"}
                  ${
                    date &&
                    selectedDate &&
                    date.toDateString() === selectedDate.toDateString()
                      ? "bg-[#F9C744] text-[#06101E] font-semibold hover:bg-[#E6B33D]"
                      : date &&
                          date.toDateString() === new Date().toDateString()
                        ? "border-2 border-[#F9C744] text-[#06101E]"
                        : "text-gray-700 hover:bg-gray-50"
                  }
                  ${date && date > new Date() ? "text-gray-300 cursor-not-allowed" : ""}
                `}
              >
                {date ? date.getDate() : ""}
              </button>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Jump to year:</span>
              <div className="flex flex-wrap gap-1">
                {[1990, 1995, 2000, 2005, 2010, 2015, 2020].map((year) => (
                  <button
                    key={year}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const newDate = new Date(currentMonth);
                      newDate.setFullYear(year);
                      setCurrentMonth(newDate);
                      setYearInput(String(year));
                    }}
                    className="px-2 py-1 text-xs border border-gray-200 rounded hover:bg-[#F9C744]/20 hover:border-[#F9C744] transition-colors"
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowCalendar(false)}
            className="mt-3 w-full text-sm text-gray-500 hover:text-gray-700 py-1 border-t border-gray-100 pt-2"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

// Enhanced Phone Input Wrapper
const PhoneInputWrapper = ({
  value,
  onChange,
  error,
  placeholder,
  label,
  required,
  helperText,
}: any) => {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
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
            value={value}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              onChange(val);
            }}
            placeholder={placeholder || "Enter your phone number"}
            className="flex-1 h-full px-3 text-base outline-none bg-transparent"
            maxLength={10}
          />
        </div>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-gray-400 mt-1">{helperText}</p>
        )}
      </div>
    </div>
  );
};

// Password Input Component with Eye Toggle
const PasswordInput = ({
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
  required,
  helperText,
  className,
}: any) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-700 block">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`${className} pr-12`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#F9C744] transition-colors duration-200"
          tabIndex={-1}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          )}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      {helperText && !error && (
        <p className="text-xs text-gray-400 mt-1">{helperText}</p>
      )}
    </div>
  );
};

// Step 1: Identity with Integrated OTP Verification
const IdentityStep = ({ data, errors, onChange, onNext }: any) => {
  const [ageError, setAgeError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [selectedField, setSelectedField] = useState<"email" | "mobile" | null>(
    null,
  );
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [mobileOtpSent, setMobileOtpSent] = useState(false);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

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
    onChange({ target: { name: "date_of_birth", value: dob } });

    const age = validateAge(dob);
    if (age < 18 && age > 0) {
      setAgeError(
        "You must be at least 18 years old to register as a distributor",
      );
    } else {
      setAgeError("");
    }
  };

  const handleSendOTP = (field: "email" | "mobile") => {
    if (field === "email" && !data.email) {
      setOtpError("Please enter your email address first");
      return;
    }
    if (field === "mobile" && !data.mobile) {
      setOtpError("Please enter your mobile number first");
      return;
    }

    setSelectedField(field);
    setOtpSent(true);
    setOtpError("");
    setOtpCode("");
    setTimer(30);
    setCanResend(false);
    setOtpSuccess(false);

    if (field === "email") {
      setEmailOtpSent(true);
    } else {
      setMobileOtpSent(true);
    }

    // In real implementation, this would call an API
    console.log(`Sending OTP to ${field}`);
  };

  const handleVerifyOTP = () => {
    if (!otpCode || otpCode.length !== 6) {
      setOtpError("Please enter a valid 6-digit OTP");
      return;
    }

    setIsVerifying(true);
    setOtpError("");

    // Simulate OTP verification
    setTimeout(() => {
      if (otpCode === "123456") {
        setOtpSuccess(true);
        setOtpError("");
        if (selectedField === "email") {
          onChange({ target: { name: "email_verified", value: true } });
        } else if (selectedField === "mobile") {
          onChange({ target: { name: "mobile_verified", value: true } });
        }
        setIsVerifying(false);
        setOtpSent(false);
        setOtpCode("");
      } else {
        setOtpError("Invalid OTP. Please try again.");
        setIsVerifying(false);
      }
    }, 1000);
  };

  const isEmailVerified = data.email_verified;
  const isMobileVerified = data.mobile_verified;
  const allVerified = isEmailVerified && isMobileVerified;

  return (
    <div className="space-y-5">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-[#06101E]">
          Personal Information
        </h2>
        <p className="text-gray-500 text-sm mt-1">Enter your basic details</p>
      </div>

      <div className="bg-yellow-50/80 backdrop-blur-sm p-4 rounded-xl border border-yellow-100 mb-2">
        <p className="text-sm text-yellow-700 flex items-start gap-2">
          <span className="text-yellow-500 text-lg flex-shrink-0">📌</span>
          <span>
            <strong>Note:</strong> Both your email and mobile number must be
            verified before you can proceed.
          </span>
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Input
            label="Full Name (as per PAN)"
            name="full_name"
            value={data.full_name}
            onChange={onChange}
            error={errors.full_name}
            placeholder="John Doe"
            required
            helperText="Must match your PAN card name"
            className="w-full h-14 px-4 text-base rounded-xl border-gray-200 focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200"
          />
        </div>

        <div>
          <DatePicker
            label="Date of Birth"
            value={data.date_of_birth}
            onChange={handleDobChange}
            error={errors.date_of_birth || ageError}
            helperText="You must be at least 18 years old"
            required
          />
        </div>

        {/* Email with OTP */}
        <div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 block">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="email"
                  name="email"
                  value={data.email}
                  onChange={onChange}
                  placeholder="john@example.com"
                  disabled={data.email_verified}
                  className={`w-full h-14 px-4 text-base rounded-xl border ${
                    errors.email ? "border-red-500" : "border-gray-200"
                  } bg-white focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200 outline-none ${
                    data.email_verified ? "bg-green-50 border-green-500" : ""
                  }`}
                />
              </div>
              {!data.email_verified && data.email && (
                <Button
                  type="button"
                  onClick={() => handleSendOTP("email")}
                  disabled={emailOtpSent && !canResend}
                  className="h-14 px-6 bg-gradient-to-r from-[#F9C744] to-[#E6B33D] hover:from-[#E6B33D] hover:to-[#D4A030] text-[#06101E] font-medium rounded-xl transition-all duration-200 shadow-md hover:shadow-lg whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {emailOtpSent && !canResend ? `${timer}s` : "Send OTP"}
                </Button>
              )}
              {data.email_verified && (
                <div className="h-14 flex items-center px-4 bg-green-50 rounded-xl border-2 border-green-500 text-green-600 font-medium">
                  ✓ Verified
                </div>
              )}
            </div>
            {errors.email && !data.email_verified && (
              <p className="text-xs text-red-500 mt-1">{errors.email}</p>
            )}
            {data.email_verified && (
              <p className="text-xs text-green-600 mt-1">
                ✓ Email verified successfully
              </p>
            )}
          </div>
        </div>

        {/* Mobile with OTP */}
        <div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <div className="flex-1">
                <div
                  className={`flex items-center w-full h-14 rounded-xl border ${
                    errors.mobile ? "border-red-500" : "border-gray-200"
                  } bg-white focus-within:border-[#F9C744] focus-within:ring-2 focus-within:ring-[#F9C744]/20 transition-all duration-200 overflow-hidden ${
                    data.mobile_verified ? "bg-green-50 border-green-500" : ""
                  }`}
                >
                  <div className="flex items-center gap-1 px-3 border-r border-gray-200 h-full bg-gray-50/50 min-w-[70px]">
                    <span className="text-sm font-medium text-gray-700">
                      +91
                    </span>
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
                    value={data.mobile}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      onChange({ target: { name: "mobile", value: val } });
                    }}
                    placeholder="Enter your phone number"
                    className="flex-1 h-full px-3 text-base outline-none bg-transparent"
                    maxLength={10}
                    disabled={data.mobile_verified}
                  />
                </div>
              </div>
              {!data.mobile_verified && data.mobile.length === 10 && (
                <Button
                  type="button"
                  onClick={() => handleSendOTP("mobile")}
                  disabled={mobileOtpSent && !canResend}
                  className="h-14 px-6 bg-gradient-to-r from-[#F9C744] to-[#E6B33D] hover:from-[#E6B33D] hover:to-[#D4A030] text-[#06101E] font-medium rounded-xl transition-all duration-200 shadow-md hover:shadow-lg whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {mobileOtpSent && !canResend ? `${timer}s` : "Send OTP"}
                </Button>
              )}
              {data.mobile_verified && (
                <div className="h-14 flex items-center px-4 bg-green-50 rounded-xl border-2 border-green-500 text-green-600 font-medium">
                  ✓ Verified
                </div>
              )}
            </div>
            {errors.mobile && !data.mobile_verified && (
              <p className="text-xs text-red-500 mt-1">{errors.mobile}</p>
            )}
            {data.mobile_verified && (
              <p className="text-xs text-green-600 mt-1">
                ✓ Mobile verified successfully
              </p>
            )}
          </div>
        </div>

        {/* OTP Input Section */}
        {otpSent && !allVerified && (
          <div className="space-y-4 bg-gray-50/80 backdrop-blur-sm p-5 rounded-xl border-2 border-gray-200">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                Enter OTP sent to{" "}
                <span className="font-semibold">
                  {selectedField === "email" ? data.email : data.mobile}
                </span>
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    if (val.length <= 6) {
                      setOtpCode(val);
                      setOtpError("");
                    }
                  }}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  className={`flex-1 h-14 px-4 text-base rounded-xl border ${
                    otpError ? "border-red-500" : "border-gray-200"
                  } focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200 outline-none`}
                />
                <Button
                  type="button"
                  onClick={handleVerifyOTP}
                  loading={isVerifying}
                  className="h-14 px-8 bg-gradient-to-r from-[#F9C744] to-[#E6B33D] hover:from-[#E6B33D] hover:to-[#D4A030] text-[#06101E] font-medium rounded-xl transition-all duration-200 shadow-md hover:shadow-lg whitespace-nowrap"
                >
                  Verify
                </Button>
              </div>
              {otpError && (
                <p className="text-xs text-red-500 mt-1">{otpError}</p>
              )}
              {otpSuccess && (
                <p className="text-xs text-green-600 mt-1">
                  ✓ OTP verified successfully!
                </p>
              )}
            </div>
            <div className="flex items-center justify-between">
              {canResend ? (
                <button
                  type="button"
                  onClick={() => selectedField && handleSendOTP(selectedField)}
                  className="text-sm text-[#B98F1E] hover:underline font-medium"
                >
                  Resend OTP
                </button>
              ) : (
                <span className="text-sm text-gray-400">
                  Resend in {timer}s
                </span>
              )}
              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setOtpCode("");
                  setOtpError("");
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div>
          <PasswordInput
            label="Create Password"
            name="password"
            value={data.password}
            onChange={onChange}
            error={errors.password}
            placeholder="Create a strong password"
            required
            helperText="Minimum 8 characters with uppercase, lowercase and number"
            className="w-full h-14 px-4 text-base rounded-xl border-gray-200 focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200 outline-none"
          />
        </div>

        <div>
          <PasswordInput
            label="Confirm Password"
            name="confirm_password"
            value={data.confirm_password}
            onChange={onChange}
            error={errors.confirm_password}
            placeholder="Confirm your password"
            required
            className="w-full h-14 px-4 text-base rounded-xl border-gray-200 focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200 outline-none"
          />
        </div>

        <Button
          type="button"
          fullWidth
          onClick={onNext}
          disabled={!!ageError || !allVerified}
          className="w-full h-14 text-base bg-gradient-to-r from-[#F9C744] to-[#E6B33D] hover:from-[#E6B33D] hover:to-[#D4A030] text-[#06101E] font-semibold rounded-xl mt-2 transition-all duration-300 shadow-lg hover:shadow-[#F9C744]/40 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {!allVerified ? "Verify email & mobile to continue" : "Continue →"}
        </Button>
      </div>
    </div>
  );
};

// Step 2: Sponsor & Placement
const SponsorStep = ({ data, errors, onChange, onNext, onBack }: any) => {
  const [sponsorName, setSponsorName] = useState("");
  const [sponsorValid, setSponsorValid] = useState(false);
  const [sponsorLoading, setSponsorLoading] = useState(false);
  const [sponsorError, setSponsorError] = useState("");

  const validateSponsor = async () => {
    if (!data.sponsor_id) {
      setSponsorValid(false);
      setSponsorName("");
      setSponsorError("Sponsor ID is required");
      return;
    }

    setSponsorLoading(true);
    setSponsorError("");
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (data.sponsor_id.length >= 6) {
        setSponsorValid(true);
        setSponsorName("John Smith (DIST-12345)");
        setSponsorError("");
      } else {
        setSponsorValid(false);
        setSponsorName("");
        setSponsorError("Sponsor ID must be at least 6 characters");
      }
    } catch (error) {
      setSponsorValid(false);
      setSponsorName("");
      setSponsorError("Failed to validate sponsor. Please try again.");
    } finally {
      setSponsorLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (data.sponsor_id) {
        validateSponsor();
      } else {
        setSponsorValid(false);
        setSponsorName("");
        setSponsorError("Sponsor ID is required");
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [data.sponsor_id]);

  return (
    <div className="space-y-5">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-[#06101E]">
          Sponsor Information
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Identify who introduced you to the network
        </p>
      </div>

      <div className="bg-blue-50/80 backdrop-blur-sm p-4 rounded-xl border border-blue-100 mb-2">
        <p className="text-sm text-blue-700 flex items-start gap-2">
          <span className="text-blue-500 text-lg flex-shrink-0">ℹ️</span>
          <span>
            <strong>Why this is needed:</strong> Your sponsor determines where
            you sit in the binary network and who earns against your activity.
          </span>
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Input
            label="Sponsor ID"
            name="sponsor_id"
            value={data.sponsor_id}
            onChange={onChange}
            error={errors.sponsor_id || sponsorError}
            placeholder="Enter your sponsor's distributor ID"
            required
            helperText={
              sponsorValid
                ? `✓ Sponsor found: ${sponsorName}`
                : "Enter the ID of the distributor who referred you"
            }
            className="w-full h-14 px-4 text-base rounded-xl border-gray-200 focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200"
          />
        </div>

        {sponsorLoading && (
          <div className="flex items-center gap-2 text-sm text-gray-500 -mt-2">
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
            Validating sponsor...
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1 h-14 text-base rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
          >
            Back
          </Button>
          <Button
            type="button"
            fullWidth
            onClick={onNext}
            disabled={!sponsorValid || !data.sponsor_id}
            className="flex-1 h-14 text-base bg-gradient-to-r from-[#F9C744] to-[#E6B33D] hover:from-[#E6B33D] hover:to-[#D4A030] text-[#06101E] font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-[#F9C744]/40 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue →
          </Button>
        </div>
      </div>
    </div>
  );
};

// Step 3: Aadhaar Verification
const AadhaarStep = ({ data, errors, onChange, onNext, onBack }: any) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [aadhaarError, setAadhaarError] = useState("");

  const handleAadhaarVerify = async () => {
    const cleanNumber = data.aadhaar_number.replace(/\D/g, "");
    if (cleanNumber.length !== 12) {
      setAadhaarError("Please enter a valid 12-digit Aadhaar number");
      return;
    }

    if (!data.aadhaar_consent) {
      setAadhaarError("You must consent to Aadhaar verification");
      return;
    }

    setAadhaarError("");
    setIsVerifying(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      onChange({ target: { name: "aadhaar_verified", value: true } });
      onNext();
    } catch (error) {
      setAadhaarError("Aadhaar verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-[#06101E]">
          Aadhaar Verification
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Verify your identity through licensed KYC provider
        </p>
      </div>

      <div className="bg-blue-50/80 backdrop-blur-sm p-4 rounded-xl border border-blue-100 mb-2">
        <p className="text-sm text-blue-700 flex items-start gap-2">
          <span className="text-blue-500 text-lg flex-shrink-0">🔐</span>
          <span>
            <strong>Why this is needed:</strong> Aadhaar verification is
            mandatory for distributor registration. Your Aadhaar number is
            verified through a licensed KYC provider and is never stored in
            full.
          </span>
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 block">
              Aadhaar Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="aadhaar_number"
                value={data.aadhaar_number}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, "");
                  if (value.length > 12) value = value.slice(0, 12);

                  let formattedValue = "";
                  for (let i = 0; i < value.length; i++) {
                    if (i > 0 && i % 4 === 0) {
                      formattedValue += "-";
                    }
                    formattedValue += value[i];
                  }

                  onChange({
                    target: {
                      name: "aadhaar_number",
                      value: formattedValue,
                    },
                  });
                }}
                placeholder="XXXX-XXXX-XXXX"
                maxLength={14}
                className={`w-full h-14 px-4 text-base rounded-xl border ${
                  errors.aadhaar_number || aadhaarError
                    ? "border-red-500"
                    : "border-gray-200"
                } bg-white focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200 outline-none`}
              />
            </div>
            {(errors.aadhaar_number || aadhaarError) && (
              <p className="text-xs text-red-500 mt-1">
                {errors.aadhaar_number || aadhaarError}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              Only last 4 digits will be visible in the system
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="aadhaar_consent"
              checked={data.aadhaar_consent}
              onChange={onChange}
              className="mt-1 w-4 h-4 rounded border-gray-300 text-[#F9C744] focus:ring-[#F9C744] flex-shrink-0"
            />
            <span className="text-sm text-gray-600 leading-relaxed">
              I consent to Aadhaar verification through a licensed KYC provider
              for the purpose of identity verification as per the Digital
              Personal Data Protection Act, 2023.
            </span>
          </label>
          {errors.aadhaar_consent && (
            <p className="text-xs text-red-500">{errors.aadhaar_consent}</p>
          )}
        </div>

        {data.aadhaar_verified && (
          <div className="bg-green-50/80 backdrop-blur-sm p-3 rounded-xl border border-green-100 text-sm text-green-700 flex items-center gap-2">
            <span className="text-lg flex-shrink-0">✅</span> Aadhaar verified
            successfully
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1 h-14 text-base rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
          >
            Back
          </Button>
          <Button
            type="button"
            fullWidth
            loading={isVerifying}
            onClick={handleAadhaarVerify}
            disabled={
              !data.aadhaar_consent ||
              !data.aadhaar_number ||
              data.aadhaar_number.replace(/\D/g, "").length !== 12
            }
            className="flex-1 h-14 text-base bg-gradient-to-r from-[#F9C744] to-[#E6B33D] hover:from-[#E6B33D] hover:to-[#D4A030] text-[#06101E] font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-[#F9C744]/40 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {data.aadhaar_verified ? "Continue →" : "Verify Aadhaar"}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Step 4: PAN Verification
const PANStep = ({ data, errors, onChange, onNext, onBack }: any) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [panName, setPanName] = useState("");
  const [panError, setPanError] = useState("");

  const handlePANVerify = async () => {
    const cleanPan = data.pan_number.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (cleanPan.length !== 10) {
      setPanError("Please enter a valid 10-character PAN");
      return;
    }

    setPanError("");
    setIsVerifying(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const mockName = "John Doe";
      setPanName(mockName);

      if (mockName.toLowerCase() !== data.full_name.toLowerCase()) {
        setPanError(
          "PAN name does not match your full name. Application will be flagged for review.",
        );
      }

      onChange({ target: { name: "pan_verified", value: true } });
      onNext();
    } catch (error) {
      setPanError("PAN verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-[#06101E]">PAN Verification</h2>
        <p className="text-gray-500 text-sm mt-1">
          Verify your PAN for tax compliance
        </p>
      </div>

      <div className="bg-blue-50/80 backdrop-blur-sm p-4 rounded-xl border border-blue-100 mb-2">
        <p className="text-sm text-blue-700 flex items-start gap-2">
          <span className="text-blue-500 text-lg flex-shrink-0">📋</span>
          <span>
            <strong>Why this is needed:</strong> PAN verification is mandatory
            for distributor activation. A verified PAN is required for tax
            deduction on commission and for compliance with income tax
            regulations.
          </span>
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Input
            label="PAN Number"
            name="pan_number"
            value={data.pan_number}
            onChange={onChange}
            error={errors.pan_number || panError}
            placeholder="Enter 10-character PAN (e.g., ABCDE1234F)"
            maxLength={10}
            required
            helperText="PAN is unique across all distributor accounts"
            className="w-full h-14 px-4 text-base rounded-xl border-gray-200 focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200"
          />
        </div>

        {panName && (
          <div className="bg-gray-50/80 backdrop-blur-sm p-4 rounded-xl border-2 border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">
                PAN Registered Name
              </span>
              <span className="font-semibold text-[#06101E]">{panName}</span>
            </div>
            <p
              className={`text-xs mt-2 ${
                panName.toLowerCase() === data.full_name.toLowerCase()
                  ? "text-green-600"
                  : "text-red-500"
              }`}
            >
              {panName.toLowerCase() === data.full_name.toLowerCase()
                ? "✓ Name matches"
                : "⚠ Name mismatch - Application will be flagged for review"}
            </p>
          </div>
        )}

        {data.pan_verified && (
          <div className="bg-green-50/80 backdrop-blur-sm p-3 rounded-xl border border-green-100 text-sm text-green-700 flex items-center gap-2">
            <span className="text-lg flex-shrink-0">✅</span> PAN verified
            successfully
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1 h-14 text-base rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
          >
            Back
          </Button>
          <Button
            type="button"
            fullWidth
            loading={isVerifying}
            onClick={handlePANVerify}
            disabled={
              !data.pan_number ||
              data.pan_number.replace(/[^A-Z0-9]/gi, "").length !== 10
            }
            className="flex-1 h-14 text-base bg-gradient-to-r from-[#F9C744] to-[#E6B33D] hover:from-[#E6B33D] hover:to-[#D4A030] text-[#06101E] font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-[#F9C744]/40 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {data.pan_verified ? "Continue →" : "Verify PAN"}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Step 5: Bank Account Details
const BankStep = ({ data, errors, onChange, onNext, onBack }: any) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [bankError, setBankError] = useState("");
  const [confirmError, setConfirmError] = useState("");

  const handleBankVerify = async () => {
    if (
      !data.bank_account_number ||
      data.bank_account_number !== data.bank_confirm_account_number
    ) {
      setConfirmError("Account numbers do not match");
      return;
    }

    if (!data.bank_ifsc_code || data.bank_ifsc_code.length < 4) {
      setBankError("Please enter a valid IFSC code");
      return;
    }

    setBankError("");
    setIsVerifying(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      onNext();
    } catch (error) {
      setBankError("Bank verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange(e);

    if (
      name === "bank_confirm_account_number" ||
      name === "bank_account_number"
    ) {
      const accountNum =
        name === "bank_account_number" ? value : data.bank_account_number;
      const confirmNum =
        name === "bank_confirm_account_number"
          ? value
          : data.bank_confirm_account_number;

      if (confirmNum && accountNum && confirmNum !== accountNum) {
        setConfirmError("Account numbers do not match");
        setBankError("");
      } else {
        setConfirmError("");
        setBankError("");
      }
    }
  };

  const handleConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    onChange(e);

    if (
      value &&
      data.bank_account_number &&
      value !== data.bank_account_number
    ) {
      setConfirmError("Account numbers do not match");
      setBankError("");
    } else {
      setConfirmError("");
      setBankError("");
    }
  };

  return (
    <div className="space-y-5">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-[#06101E]">
          Bank Account Details
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Enter your bank account for commission settlement
        </p>
      </div>

      <div className="bg-blue-50/80 backdrop-blur-sm p-4 rounded-xl border border-blue-100 mb-2">
        <p className="text-sm text-blue-700 flex items-start gap-2">
          <span className="text-blue-500 text-lg flex-shrink-0">🏦</span>
          <span>
            <strong>Why this is needed:</strong> Your commission will be settled
            to this account. The account holder name must match your PAN name.
          </span>
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Input
            label="Account Holder Name"
            name="bank_account_holder_name"
            value={data.bank_account_holder_name}
            onChange={onChange}
            error={errors.bank_account_holder_name}
            placeholder="Name as on bank account"
            required
            helperText="Must match your PAN name"
            className="w-full h-14 px-4 text-base rounded-xl border-gray-200 focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              label="Bank Name"
              name="bank_name"
              value={data.bank_name}
              onChange={onChange}
              error={errors.bank_name}
              placeholder="Enter bank name"
              required
              className="w-full h-14 px-4 text-base rounded-xl border-gray-200 focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200"
            />
          </div>
          <div>
            <Input
              label="Bank Branch"
              name="bank_branch"
              value={data.bank_branch}
              onChange={onChange}
              error={errors.bank_branch}
              placeholder="Enter branch name"
              className="w-full h-14 px-4 text-base rounded-xl border-gray-200 focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200"
            />
          </div>
        </div>

        <div>
          <PasswordInput
            label="Account Number"
            name="bank_account_number"
            value={data.bank_account_number}
            onChange={handleAccountChange}
            error={errors.bank_account_number || bankError}
            placeholder="Enter bank account number"
            required
            className="w-full h-14 px-4 text-base rounded-xl border-gray-200 focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200 outline-none"
          />
        </div>

        <div>
          <PasswordInput
            label="Confirm Account Number"
            name="bank_confirm_account_number"
            value={data.bank_confirm_account_number}
            onChange={handleConfirmChange}
            error={errors.bank_confirm_account_number || confirmError}
            placeholder="Re-enter account number"
            required
            className="w-full h-14 px-4 text-base rounded-xl border-gray-200 focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200 outline-none"
          />
        </div>

        <div>
          <Input
            label="IFSC Code"
            name="bank_ifsc_code"
            value={data.bank_ifsc_code}
            onChange={onChange}
            error={errors.bank_ifsc_code}
            placeholder="Enter IFSC code"
            required
            helperText="Validated against the bank name"
            className="w-full h-14 px-4 text-base rounded-xl border-gray-200 focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Account Type <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: "current", label: "Current Account", icon: "💼" },
              { value: "savings", label: "Savings Account", icon: "🏦" },
            ].map((option) => (
              <label
                key={option.value}
                className={`flex items-center justify-center gap-2 cursor-pointer text-center py-3 px-2 rounded-xl border-2 text-sm transition-all duration-200 h-14
                  ${
                    data.bank_account_type === option.value
                      ? "border-[#F9C744] bg-[#F9C744]/10 text-[#06101E] font-semibold shadow-sm"
                      : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                  }`}
              >
                <input
                  type="radio"
                  name="bank_account_type"
                  value={option.value}
                  checked={data.bank_account_type === option.value}
                  onChange={onChange}
                  className="sr-only"
                />
                <span className="text-base">{option.icon}</span>
                {option.label}
              </label>
            ))}
          </div>
          {errors.bank_account_type && (
            <p className="text-xs text-red-500">{errors.bank_account_type}</p>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1 h-14 text-base rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
          >
            Back
          </Button>
          <Button
            type="button"
            fullWidth
            loading={isVerifying}
            onClick={handleBankVerify}
            disabled={
              !data.bank_account_number ||
              !data.bank_confirm_account_number ||
              data.bank_account_number !== data.bank_confirm_account_number ||
              !!confirmError
            }
            className="flex-1 h-14 text-base bg-gradient-to-r from-[#F9C744] to-[#E6B33D] hover:from-[#E6B33D] hover:to-[#D4A030] text-[#06101E] font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-[#F9C744]/40 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue →
          </Button>
        </div>
      </div>
    </div>
  );
};

// Step 6: Geolocation Consent
const LocationStep = ({ data, errors, onChange, onNext, onBack }: any) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [locationStatus, setLocationStatus] = useState("");

  const handleCaptureLocation = () => {
    setIsCapturing(true);
    setLocationStatus("Requesting location...");

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onChange({
            target: { name: "latitude", value: position.coords.latitude },
          });
          onChange({
            target: { name: "longitude", value: position.coords.longitude },
          });
          setLocationStatus("✓ Location captured successfully");
          setIsCapturing(false);
        },
        (error) => {
          setLocationStatus(
            "⚠ Unable to capture location. Fallback to IP-derived location.",
          );
          setIsCapturing(false);
        },
      );
    } else {
      setLocationStatus(
        "⚠ Geolocation not supported. Fallback to IP-derived location.",
      );
      setIsCapturing(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-[#06101E]">Location Consent</h2>
        <p className="text-gray-500 text-sm mt-1">
          Consent for location capture for fraud prevention
        </p>
      </div>

      <div className="bg-blue-50/80 backdrop-blur-sm p-4 rounded-xl border border-blue-100 mb-2">
        <p className="text-sm text-blue-700 flex items-start gap-2">
          <span className="text-blue-500 text-lg flex-shrink-0">📍</span>
          <span>
            <strong>Purpose:</strong> Location is captured once at registration
            for fraud prevention. It is never tracked continuously. Declining
            consent does not affect registration.
          </span>
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="location_consent"
              checked={data.location_consent}
              onChange={onChange}
              className="mt-1 w-4 h-4 rounded border-gray-300 text-[#F9C744] focus:ring-[#F9C744] flex-shrink-0"
            />
            <span className="text-sm text-gray-600 leading-relaxed">
              I consent to my location being recorded once at registration for
              fraud prevention purposes as per the Digital Personal Data
              Protection Act, 2023.
            </span>
          </label>
          {errors.location_consent && (
            <p className="text-xs text-red-500">{errors.location_consent}</p>
          )}
        </div>

        {data.location_consent && (
          <div className="bg-gray-50/80 backdrop-blur-sm p-5 rounded-xl border-2 border-gray-200">
            <Button
              type="button"
              onClick={handleCaptureLocation}
              loading={isCapturing}
              className="h-12 px-8 bg-gradient-to-r from-[#F9C744] to-[#E6B33D] hover:from-[#E6B33D] hover:to-[#D4A030] text-[#06101E] font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              📍 Capture Location
            </Button>
            {locationStatus && (
              <p
                className={`text-sm mt-3 ${
                  locationStatus.includes("✓")
                    ? "text-green-600"
                    : "text-yellow-600"
                }`}
              >
                {locationStatus}
              </p>
            )}
            {data.latitude && data.longitude && (
              <p className="text-xs text-gray-500 mt-1">
                Coordinates: {data.latitude.toFixed(4)},{" "}
                {data.longitude.toFixed(4)}
              </p>
            )}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1 h-14 text-base rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
          >
            Back
          </Button>
          <Button
            type="button"
            fullWidth
            onClick={onNext}
            className="flex-1 h-14 text-base bg-gradient-to-r from-[#F9C744] to-[#E6B33D] hover:from-[#E6B33D] hover:to-[#D4A030] text-[#06101E] font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-[#F9C744]/40 transform hover:scale-[1.02]"
          >
            Continue →
          </Button>
        </div>
      </div>
    </div>
  );
};

// Step 7: Review & Submit
const ReviewStep = ({
  data,
  onBack,
  onSubmit,
  isLoading,
  errors,
  onChange,
}: any) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await onSubmit();
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-5">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-[#06101E]">Review & Submit</h2>
        <p className="text-gray-500 text-sm mt-1">
          Review all information before submitting
        </p>
      </div>

      <div className="bg-gray-50/80 backdrop-blur-sm rounded-xl p-5 border-2 border-gray-200 max-h-64 overflow-y-auto">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="font-medium text-gray-600">Full Name:</div>
          <div className="text-[#06101E] font-medium truncate">
            {data.full_name}
          </div>

          <div className="font-medium text-gray-600">Date of Birth:</div>
          <div className="text-[#06101E]">{data.date_of_birth}</div>

          <div className="font-medium text-gray-600">Email:</div>
          <div className="text-[#06101E] truncate">
            {data.email} {data.email_verified && "✓"}
          </div>

          <div className="font-medium text-gray-600">Mobile:</div>
          <div className="text-[#06101E]">
            {data.mobile} {data.mobile_verified && "✓"}
          </div>

          <div className="font-medium text-gray-600">Sponsor:</div>
          <div className="text-[#06101E]">{data.sponsor_id || "None"}</div>

          <div className="font-medium text-gray-600">Placement Leg:</div>
          <div className="text-[#06101E] capitalize">
            {data.placement_leg || "Auto"}
          </div>

          <div className="font-medium text-gray-600">Aadhaar:</div>
          <div className="text-[#06101E]">
            ****{data.aadhaar_number?.slice(-4)} {data.aadhaar_verified && "✓"}
          </div>

          <div className="font-medium text-gray-600">PAN:</div>
          <div className="text-[#06101E]">
            {data.pan_number} {data.pan_verified && "✓"}
          </div>

          <div className="font-medium text-gray-600">Bank:</div>
          <div className="text-[#06101E] truncate">{data.bank_name}</div>

          <div className="font-medium text-gray-600">Account No:</div>
          <div className="text-[#06101E]">
            ****{data.bank_account_number?.slice(-4)}
          </div>

          <div className="font-medium text-gray-600">IFSC:</div>
          <div className="text-[#06101E]">{data.bank_ifsc_code}</div>

          <div className="font-medium text-gray-600">Location:</div>
          <div className="text-[#06101E]">
            {data.location_consent ? "Granted" : "Declined"}
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="terms_accepted"
            checked={data.terms_accepted}
            onChange={(e) =>
              onChange({
                target: { name: "terms_accepted", value: e.target.checked },
              })
            }
            className="mt-1 w-4 h-4 rounded border-gray-300 text-[#F9C744] focus:ring-[#F9C744] flex-shrink-0"
          />
          <span className="text-sm text-gray-600 leading-relaxed">
            I accept the{" "}
            <Link
              href="/terms"
              className="text-[#B98F1E] hover:underline font-medium"
            >
              Terms of Use
            </Link>
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="agreement_accepted"
            checked={data.agreement_accepted}
            onChange={(e) =>
              onChange({
                target: { name: "agreement_accepted", value: e.target.checked },
              })
            }
            className="mt-1 w-4 h-4 rounded border-gray-300 text-[#F9C744] focus:ring-[#F9C744] flex-shrink-0"
          />
          <span className="text-sm text-gray-600 leading-relaxed">
            I accept the{" "}
            <Link
              href="/distributor-agreement"
              className="text-[#B98F1E] hover:underline font-medium"
            >
              Distributor Agreement
            </Link>
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="code_of_conduct_accepted"
            checked={data.code_of_conduct_accepted}
            onChange={(e) =>
              onChange({
                target: {
                  name: "code_of_conduct_accepted",
                  value: e.target.checked,
                },
              })
            }
            className="mt-1 w-4 h-4 rounded border-gray-300 text-[#F9C744] focus:ring-[#F9C744] flex-shrink-0"
          />
          <span className="text-sm text-gray-600 leading-relaxed">
            I accept the{" "}
            <Link
              href="/code-of-conduct"
              className="text-[#B98F1E] hover:underline font-medium"
            >
              Code of Conduct
            </Link>
          </span>
        </label>

        {(errors.terms_accepted ||
          errors.agreement_accepted ||
          errors.code_of_conduct_accepted) && (
          <p className="text-xs text-red-500">
            You must accept all terms to submit your application
          </p>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="flex-1 h-14 text-base rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
        >
          Back
        </Button>
        <Button
          type="button"
          fullWidth
          loading={isLoading || isSubmitting}
          disabled={
            !data.terms_accepted ||
            !data.agreement_accepted ||
            !data.code_of_conduct_accepted
          }
          onClick={handleSubmit}
          className="flex-1 h-14 text-base bg-gradient-to-r from-[#F9C744] to-[#E6B33D] hover:from-[#E6B33D] hover:to-[#D4A030] text-[#06101E] font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-[#F9C744]/40 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Submit Application
        </Button>
      </div>
    </div>
  );
};

// Main Component with Side Panel
export const DistributorRegistrationFlow: React.FC = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const totalSteps = 7;

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

  const steps = [
    { title: "Identity", component: IdentityStep },
    { title: "Sponsor", component: SponsorStep },
    { title: "Aadhaar", component: AadhaarStep },
    { title: "PAN", component: PANStep },
    { title: "Bank", component: BankStep },
    { title: "Location", component: LocationStep },
    { title: "Review", component: ReviewStep },
  ];

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

      if (!formData.email_verified)
        newErrors.email = "Please verify your email address";

      const cleanPhone = formData.mobile.replace(/\D/g, "");
      if (!formData.mobile) newErrors.mobile = "Mobile number is required";
      else if (cleanPhone.length < 10)
        newErrors.mobile = "Please enter a valid 10-digit number";

      if (!formData.mobile_verified)
        newErrors.mobile = "Please verify your mobile number";

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

  const StepComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen flex bg-[#FAF8F4]">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-5/12 min-h-screen relative overflow-hidden bg-gradient-to-br from-[#0F2038] via-[#06101E] to-[#030810] p-12 flex-col justify-between flex-shrink-0">
        {/* Background Pattern */}
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

        {/* Decorative Elements */}
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-[#F9C744]/5 rounded-full blur-3xl" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-[#F9C744]/5 rounded-full blur-3xl" />

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.2; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.5); }
          }
        `}</style>

        {/* Floating Dots */}
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

        {/* Header */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-sm p-2.5 rounded-xl border border-white/10">
              <Logo width={32} height={32} showText={false} />
            </div>
            <span className="text-white/40 text-xs tracking-[0.2em] font-light">
              INDIEKONNECT
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 max-w-sm mx-auto">
          <div className="space-y-8">
            <div className="w-16 h-1 bg-gradient-to-r from-[#F9C744] to-[#E6B33D] rounded-full" />

            <h2 className="text-white text-4xl font-bold leading-tight">
              Become a<br />
              <span className="text-[#F9C744]">Distributor</span>
              <br />
              <span className="text-2xl text-white/60 font-normal">
                Partner with us
              </span>
            </h2>

            <div className="space-y-4">
              <p className="text-[#8291A6] text-sm leading-relaxed">
                Join our network of trusted distributors. Access premium
                products, competitive pricing, and dedicated support.
              </p>

              <div className="space-y-3 text-xs text-[#5C6B80]">
                <div className="flex items-center gap-3 group cursor-default">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F9C744] group-hover:scale-150 transition-transform duration-300 flex-shrink-0" />
                  <span>Access to 500+ brands</span>
                </div>
                <div className="flex items-center gap-3 group cursor-default">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F9C744] group-hover:scale-150 transition-transform duration-300 flex-shrink-0" />
                  <span>Competitive wholesale pricing</span>
                </div>

                <div className="flex items-center gap-3 group cursor-default">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F9C744] group-hover:scale-150 transition-transform duration-300 flex-shrink-0" />
                  <span>Marketing & sales support</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="relative z-10 flex items-center gap-8 text-xs">
          <div>
            <p className="text-white font-semibold text-lg">500+</p>
            <p className="text-[#5C6B80]">Brands Available</p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div>
            <p className="text-white font-semibold text-lg">200+</p>
            <p className="text-[#5C6B80]">Active Distributors</p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div>
            <p className="text-white font-semibold text-lg">98%</p>
            <p className="text-[#5C6B80]">Satisfaction Rate</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Form (Scrollable) */}
      <div className="flex-1 overflow-y-auto px-4 py-6 lg:py-8">
        <div className="max-w-2xl mx-auto">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-6">
            <div className="flex justify-center mb-3">
              <Logo width={40} height={40} showText={false} />
            </div>
            <h1 className="text-2xl font-bold text-[#06101E]">
              Distributor Registration
            </h1>
            <p className="text-gray-500 text-sm">
              Complete all steps to become a Brand Affiliate
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center w-full mb-8 px-4">
            <div className="flex items-center justify-center gap-1 sm:gap-3 max-w-4xl w-full">
              {steps.map((step, index) => (
                <React.Fragment key={index}>
                  <button
                    type="button"
                    onClick={() => {
                      if (index <= currentStep) setCurrentStep(index);
                    }}
                    className={`flex items-center gap-1 sm:gap-2 ${
                      index <= currentStep ? "cursor-pointer" : "cursor-default"
                    } group relative`}
                  >
                    {/* Step Circle with Number */}
                    <div
                      className={`relative w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-300 flex-shrink-0
              ${
                index < currentStep
                  ? "bg-[#F9C744] text-[#06101E] shadow-md"
                  : index === currentStep
                    ? "bg-[#F9C744] text-[#06101E] ring-4 ring-[#F9C744]/40 shadow-lg scale-110"
                    : "bg-gray-100 text-gray-400 border-2 border-gray-200"
              }`}
                    >
                      {index < currentStep ? (
                        <svg
                          className="w-4 h-4 sm:w-5 sm:h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </div>

                    {/* Step Label */}
                    <span
                      className={`hidden sm:block text-xs font-medium whitespace-nowrap transition-all duration-300 ${
                        index === currentStep
                          ? "text-[#06101E] font-semibold"
                          : index < currentStep
                            ? "text-gray-600"
                            : "text-gray-400"
                      }`}
                    >
                      {step.title}
                    </span>
                  </button>

                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 min-w-[8px] sm:min-w-[12px] h-0.5 rounded-full transition-all duration-300 ${
                        index < currentStep ? "bg-[#F9C744]" : "bg-gray-200"
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
            {/* Step Indicator */}
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

            {/* Error/Success Messages */}
            {formError && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 p-4 rounded-xl border border-red-100 flex items-start gap-2">
                <span className="text-lg flex-shrink-0">❌</span>
                <span>{formError}</span>
              </div>
            )}
            {successMessage && (
              <div className="mb-4 text-sm text-green-600 bg-green-50 p-4 rounded-xl border border-green-100 flex items-start gap-2">
                <span className="text-lg flex-shrink-0">✅</span>
                <span>{successMessage}</span>
              </div>
            )}

            {/* Step Component */}
            <StepComponent
              data={formData}
              errors={errors}
              onChange={handleChange}
              onNext={handleNext}
              onBack={handleBack}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
          </div>

          {/* Footer Note */}
          <div className="text-center text-xs text-gray-400 mt-6">
            <p>All information is secure and encrypted</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistributorRegistrationFlow;
