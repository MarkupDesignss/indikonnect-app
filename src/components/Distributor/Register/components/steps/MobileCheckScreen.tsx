// components/distributor/registration/components/steps/EmailCheckScreen.tsx

"use client";

import React, { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/common/Logo";
import { MobileCheckScreenProps } from "../../types/index";
import { useDispatch, useSelector } from "react-redux";
import { distributorAuthApi } from "../../../../../lib/redux/api/distributor/distributorauthApis";
import { RootState } from "@/lib/redux/store";
import {
  X,
  AlertCircle,
  CheckCircle,
  User,
  ArrowRight,
  Loader2,
  Mail,
  UserCheck,
  Shield,
  Calendar,
  Phone,
} from "lucide-react";
import { useRouter } from "next/navigation";

const theme = {
  font: "'Inter', 'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, sans-serif",
  gold: "#F9C744",
  goldDark: "#E6B33D",
  goldDeep: "#C9922A",
  navy: "#06101E",
  navySoft: "#0B1B2E",
};

export const EmailCheckScreen: React.FC<MobileCheckScreenProps> = ({
  onCheckStatus,
  isLoading,
  statusMessage,
  statusType,
  mobile,
  setMobile,
  error,
  onClear,
  checkResponse,
}) => {
  const dispatch = useDispatch();
  const [clearStatus, setClearStatus] = useState<string>("");
  const isFirstRender = useRef(true);
  const [showRegisteredModal, setShowRegisteredModal] = useState(false);
  const [registeredUserData, setRegisteredUserData] = useState<any>(null);
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  const apiState = useSelector(
    (state: RootState) => state[distributorAuthApi.reducerPath],
  );

  useEffect(() => {
    console.log("📊 Current API State:", apiState);
    console.log("📧 Email:", mobile);
    console.log("🔄 Loading State:", isLoading);
    console.log("📝 Status Message:", statusMessage);
    console.log("🧾 Check Response:", checkResponse);
  }, [apiState, mobile, isLoading, statusMessage, checkResponse]);

  // ---------------------------------------------------------------------------
  // ✅ SINGLE SOURCE OF TRUTH
  // is_registered === true  →  SIRF modal kholo.
  //                          NA navigate, NA step jump, NA redirect.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!checkResponse) {
      setShowRegisteredModal(false);
      setRegisteredUserData(null);
      return;
    }

    const isFullyRegistered =
      checkResponse.is_registered === true && checkResponse.exists === true;

    if (isFullyRegistered) {
      const user =
        checkResponse.user_data?.user || checkResponse.user_data || {};

      console.log(
        "⛔ is_registered = true → SIRF modal. NO navigation, NO step jump.",
      );

      setRegisteredUserData(user);
      setShowRegisteredModal(true);
    } else {
      setShowRegisteredModal(false);
      setRegisteredUserData(null);
    }
  }, [checkResponse]);

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

  // ---------------------------------------------------------------------------
  // Clear all localStorage items (only on explicit user action)
  // ---------------------------------------------------------------------------
  const clearAllLocalStorage = () => {
    console.log("🗑️ Clearing all localStorage items...");

    const itemsToClear = [
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
      "customer_otp",
      "customer_phone",
      "customer_verified",
      "user_data",
      "user_token",
      "user_email",
      "user_phone",
      "otp_timer",
      "otp_attempts",
      "otp_resend_timer",
      "registration_step",
      "registration_data",
      "registration_completed",
      "auth_token",
      "auth_user",
      "auth_verified",
      "app_theme",
      "app_language",
      "last_visited",
      "distributor_check_status",
    ];

    itemsToClear.forEach((key) => {
      if (localStorage.getItem(key) !== null) {
        localStorage.removeItem(key);
        console.log(`✅ Removed: ${key}`);
      }
    });

    sessionStorage.clear();
    console.log("✅ SessionStorage cleared");
  };

  const handleCheck = () => {
    const trimmedEmail = mobile?.trim();

    if (trimmedEmail && trimmedEmail.length > 0) {
      console.log("🔄 ===== Clearing All Data Before Check =====");

      try {
        clearAllLocalStorage();
        dispatch(distributorAuthApi.util.resetApiState());
        console.log("✅ resetApiState dispatched");

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
      } catch (err) {
        console.error("❌ Error clearing data:", err);
        setClearStatus("❌ Error clearing data");
      }

      localStorage.setItem("distributor_email", trimmedEmail);
      console.log("💾 Email stored in localStorage:", trimmedEmail);

      setTimeout(() => {
        console.log("📞 Calling onCheckStatus with email:", trimmedEmail);
        onCheckStatus(trimmedEmail);
      }, 200);
    } else {
      console.warn("⚠️ Email is empty or invalid");
      onClear?.();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCheck();
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setMobile(val);

    if (statusMessage) {
      onClear?.();
      setClearStatus("");
    }

    if (val.length === 0) {
      dispatch(distributorAuthApi.util.resetApiState());
      setShowRegisteredModal(false);
      setRegisteredUserData(null);
    }
  };

  // ✅ Sirf modal band karo — KUCH BHI NAHI
  const handleCloseModal = () => {
    setShowRegisteredModal(false);
  };

  // ✅ Sirf EXPLICIT click par navigate — automatic kabhi nahi
  const handleProceedToLogin = () => {
    setShowRegisteredModal(false);
    clearAllLocalStorage();
    dispatch(distributorAuthApi.util.resetApiState());
    router.push("/auth/distributor/login");
  };

  const handleUseDifferentEmail = () => {
    setShowRegisteredModal(false);
    setRegisteredUserData(null);
    clearAllLocalStorage();
    setMobile("");
    onClear?.();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getUserData = () => {
    if (registeredUserData?.user) return registeredUserData.user;
    return registeredUserData || {};
  };

  const user = getUserData();

  // ✅ API ka message hi dikhao
  const registeredMessage =
    checkResponse?.message || "Distributor already registered.";

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
      >
        <div className="flex flex-col items-center justify-center px-4 py-6">
          <div className="w-full max-w-md mx-auto">
            <div className="relative rounded-[28px] bg-white/90 backdrop-blur-xl border border-[#06101E]/[0.06] shadow-[0_20px_60px_-15px_rgba(6,16,30,0.15)] px-7 py-9 sm:px-9 sm:py-10 text-center">
              <div className="pointer-events-none absolute inset-x-0 -top-10 flex justify-center">
                <div className="w-40 h-40 rounded-full bg-[radial-gradient(circle,_rgba(249,199,68,0.35)_0%,_rgba(249,199,68,0)_70%)] blur-xl" />
              </div>

              <div className="relative flex justify-center mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--gold)] via-[var(--gold-dark)] to-[var(--gold-deep)] flex items-center justify-center shadow-[0_10px_30px_-6px_rgba(249,199,68,0.55)] ring-1 ring-white/40">
                  <Logo width={48} height={48} showText={false} />
                </div>
              </div>

              <h2 className="text-[1.7rem] leading-tight font-bold tracking-tight text-[var(--navy)] mb-1.5">
                Enter Your Email Address
              </h2>
              <p className="text-gray-500 text-sm mb-8 font-medium">
                We&apos;ll check your registration status
              </p>

              <div className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-gray-600 block text-left tracking-wide uppercase">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div
                      className={`flex items-center w-full h-14 rounded-2xl border bg-white transition-all duration-200 ${error
                          ? "border-red-400 ring-2 ring-red-100"
                          : isFocused
                            ? "border-[var(--gold)] ring-2 ring-[var(--gold)]/25 shadow-[0_6px_18px_-6px_rgba(249,199,68,0.45)]"
                            : "border-gray-200 shadow-sm"
                        }`}
                    >
                      <div
                        className={`flex items-center gap-1.5 px-3.5 border-r h-full min-w-[56px] sm:min-w-[64px] justify-center flex-shrink-0 transition-colors duration-200 ${isFocused
                            ? "bg-[var(--gold)]/10 border-[var(--gold)]/30"
                            : "bg-gray-50/70 border-gray-200"
                          }`}
                      >
                        <Mail
                          className={`w-4 h-4 transition-colors duration-200 ${isFocused
                              ? "text-[var(--gold-deep)]"
                              : "text-gray-400"
                            }`}
                        />
                      </div>
                      <input
                        type="email"
                        value={mobile}
                        onChange={handleEmailChange}
                        onKeyDown={handleKeyPress}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder="you@example.com"
                        className="min-w-0 flex-1 h-full px-3 sm:px-3.5 text-[var(--navy)] placeholder:text-gray-400 outline-none bg-transparent text-[15px] font-medium"
                        autoFocus
                        autoComplete="email"
                      />
                    </div>

                    {mobile && mobile.trim().length > 0 && (
                      <button
                        type="button"
                        onClick={handleCheck}
                        disabled={isLoading}
                        className="mt-2.5 w-full px-4 py-3 bg-gradient-to-b from-[var(--gold)] to-[var(--gold-dark)] text-[var(--navy)] font-semibold rounded-xl hover:brightness-105 active:brightness-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-1.5 shadow-[0_4px_12px_-3px_rgba(249,199,68,0.6)]"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Checking...
                          </>
                        ) : (
                          <>
                            Check Status
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    )}

                    {error && (
                      <p className="text-xs text-red-500 mt-1.5 text-left flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        {error}
                      </p>
                    )}
                    {statusMessage && !showRegisteredModal && (
                      <p
                        className={`text-xs mt-1.5 text-left flex items-center gap-1 font-medium ${statusType === "success"
                            ? "text-emerald-600"
                            : statusType === "error"
                              ? "text-red-500"
                              : "text-blue-600"
                          }`}
                      >
                        {statusType === "success" && (
                          <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        )}
                        {statusMessage}
                      </p>
                    )}
                    {clearStatus && !statusMessage && (
                      <p className="text-xs text-emerald-600 mt-1.5 text-left font-medium">
                        {clearStatus}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      console.log("🔗 Explicit click → distributor login");
                      clearAllLocalStorage();
                      dispatch(distributorAuthApi.util.resetApiState());
                      router.push("/auth/distributor/login");
                    }}
                    className="text-sm text-gray-500 hover:text-[var(--gold-deep)] underline font-medium transition-colors duration-200 inline-flex items-center justify-center gap-1.5"
                  >
                    <User className="w-4 h-4" />
                    Login as a Distributor instead?
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Modal — sirf message dikhata hai, kahi NAHI bhejta */}
        {showRegisteredModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-[var(--navy)]/70 backdrop-blur-sm"
              onClick={handleCloseModal}
            />

            <div className="relative bg-white rounded-[28px] max-w-md w-full mx-auto shadow-[0_30px_80px_-20px_rgba(6,16,30,0.5)] animate-in fade-in zoom-in duration-300 overflow-hidden">
              {/* Gradient Header */}
              <div className="relative bg-gradient-to-br from-[var(--gold)] via-[var(--gold-dark)] to-[var(--gold-deep)] px-6 py-9 text-center overflow-hidden">
                <div className="pointer-events-none absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/15" />
                <div className="pointer-events-none absolute -bottom-14 -left-8 w-28 h-28 rounded-full bg-white/10" />

                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="absolute right-4 top-4 text-[var(--navy)]/60 hover:text-[var(--navy)] transition-colors rounded-full hover:bg-white/25 p-1.5"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="relative flex justify-center mb-3.5">
                  <div className="w-20 h-20 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center border-2 border-white/40 shadow-lg">
                    <UserCheck className="w-10 h-10 text-[var(--navy)]" />
                  </div>
                </div>

                {/* ✅ API ka exact message */}
                <h3 className="relative text-2xl font-bold tracking-tight text-[var(--navy)]">
                  {registeredMessage}
                </h3>
                <p className="relative text-[var(--navy)]/85 text-sm mt-1.5 font-medium leading-relaxed px-4">
                  This email is linked to an existing distributor account.
                  Please log in to continue.
                </p>
              </div>

              {/* Content */}
              <div className="px-6 py-6">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 p-3 bg-gray-50/80 rounded-2xl border border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-[var(--gold)]/15 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-[var(--gold-deep)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                        Full Name
                      </p>
                      <p className="text-sm font-semibold text-[var(--navy)] truncate">
                        {user.full_name || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50/80 rounded-2xl border border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-[var(--gold)]/15 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-[var(--gold-deep)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                        Email Address
                      </p>
                      <p className="text-sm font-semibold text-[var(--navy)] truncate">
                        {user.email || mobile || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50/80 rounded-2xl border border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-[var(--gold)]/15 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-[var(--gold-deep)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                        Phone Number
                      </p>
                      <p className="text-sm font-semibold text-[var(--navy)] truncate">
                        {user.phone || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50/80 rounded-2xl border border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-[var(--gold)]/15 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-[var(--gold-deep)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                        Account Status
                      </p>
                      <p className="text-sm font-semibold text-[var(--navy)] flex items-center gap-2 mt-0.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 capitalize">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          {user.distributor_status || "Active"}
                        </span>
                      </p>
                    </div>
                  </div>

                  {user.created_at && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50/80 rounded-2xl border border-gray-100">
                      <div className="w-10 h-10 rounded-full bg-[var(--gold)]/15 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-[var(--gold-deep)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                          Registered On
                        </p>
                        <p className="text-sm font-semibold text-[var(--navy)]">
                          {formatDate(user.created_at)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 space-y-2.5">
                  <button
                    type="button"
                    onClick={handleProceedToLogin}
                    className="w-full bg-gradient-to-b from-[var(--gold)] to-[var(--gold-dark)] hover:brightness-105 active:brightness-95 text-[var(--navy)] font-semibold py-3.5 rounded-2xl transition-all duration-200 shadow-[0_10px_25px_-8px_rgba(249,199,68,0.6)] flex items-center justify-center gap-2 group"
                  >
                    <span>Proceed to Login</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    type="button"
                    onClick={handleUseDifferentEmail}
                    className="w-full text-gray-500 hover:text-[var(--navy)] text-sm font-semibold py-2 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Use a different email
                  </button>
                </div>

                <p className="text-center text-xs text-gray-400 mt-4 font-medium">
                  Need help? Contact our support team
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap");

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
};

export default EmailCheckScreen;