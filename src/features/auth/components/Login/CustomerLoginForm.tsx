"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";

import { PhoneInput } from "@/components/common/PhoneInput";
import ConstellationBackground from "@/components/common/ConstellationBackground";
import { Logo } from "@/components/common/Logo";

import { useSendOTPMutation } from "@/lib/redux/api/authApi";
import { showToast } from "@/lib/slices/toastSlice";

import { getAppType, getDistributorDomain } from "@/lib/appConfig";

import {
  Phone,
  Shield,
  Users,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowRight,
  UserCog,
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

interface CustomerLoginFormProps {
  onOTPSent?: (phoneNumber: string, otpData?: any) => void;
}

interface StarPoint {
  top: number;
  left: number;
  delay: number;
}

const STAR_POINTS: StarPoint[] = [
  { top: 8, left: 14, delay: 0.2 },
  { top: 16, left: 48, delay: 1.1 },
  { top: 24, left: 78, delay: 2.2 },
  { top: 36, left: 28, delay: 0.8 },
  { top: 43, left: 62, delay: 1.7 },
  { top: 55, left: 88, delay: 2.6 },
  { top: 64, left: 12, delay: 1.4 },
  { top: 72, left: 42, delay: 0.4 },
  { top: 81, left: 71, delay: 2.0 },
  { top: 90, left: 24, delay: 1.0 },
  { top: 18, left: 91, delay: 2.4 },
  { top: 48, left: 7, delay: 1.9 },
  { top: 59, left: 51, delay: 0.6 },
  { top: 76, left: 83, delay: 2.8 },
  { top: 94, left: 60, delay: 1.6 },
];

export const CustomerLoginForm: React.FC<CustomerLoginFormProps> = ({
  onOTPSent,
}) => {
  const router = useRouter();
  const dispatch = useDispatch();

  const [phoneNumber, setPhoneNumber] = useState("");

  const [error, setError] = useState<string | null>(null);

  const [sendOTP, { isLoading }] = useSendOTPMutation();

  // =========================================================
  // CURRENT APP
  // =========================================================

  const currentAppType =
    typeof window !== "undefined" ? getAppType() : "customer";

  // =========================================================
  // NORMALIZE PHONE
  // =========================================================

  const normalizePhone = (value: string): string => {
    const digits = value.replace(/\D/g, "");

    // 10 digit Indian number
    // 9876543210
    //      ↓
    // +919876543210
    if (digits.length === 10) {
      return `+91${digits}`;
    }

    // 919876543210
    //      ↓
    // +919876543210
    if (digits.length === 12 && digits.startsWith("91")) {
      return `+${digits}`;
    }

    return digits;
  };

  // =========================================================
  // HANDLE SUBMIT
  // =========================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);

    const rawDigits = phoneNumber.replace(/\D/g, "");

    const isValidIndianPhone =
      rawDigits.length === 10 ||
      (rawDigits.length === 12 && rawDigits.startsWith("91"));

    if (!isValidIndianPhone) {
      const errorMsg = "Please enter a valid 10-digit phone number";

      setError(errorMsg);

      dispatch(
        showToast({
          message: errorMsg,
          type: "error",
        }),
      );

      return;
    }

    const cleanPhone = normalizePhone(phoneNumber);

    try {
      const result = await sendOTP({
        phone: cleanPhone,
      }).unwrap();

      if (result.status === true) {
        dispatch(
          showToast({
            message: result.message || "OTP sent successfully!",
            type: "success",
          }),
        );

        onOTPSent?.(cleanPhone, {
          otp: result.otp,
          accountType: result.account_type,
          isRegistered: result.is_registered,
          message: result.message,
        });
      } else {
        const errorMsg =
          result.message || "Failed to send OTP. Please try again.";

        setError(errorMsg);

        dispatch(
          showToast({
            message: errorMsg,
            type: "error",
          }),
        );
      }
    } catch (err: any) {
      const errorMsg =
        err?.data?.message ||
        err?.error ||
        "Network error. Please check your connection and try again.";

      setError(errorMsg);

      dispatch(
        showToast({
          message: errorMsg,
          type: "error",
        }),
      );
    }
  };

  // =========================================================
  // DISTRIBUTOR LOGIN
  // =========================================================

  const handleDistributorLogin = () => {
    const distributorPath = "/auth/distributor/login";

    /**
     * If this component somehow renders while the
     * distributor build is active, use Next router.
     *
     * basePath will automatically resolve:
     *
     * /auth/distributor/login
     *        ↓
     * /indiekonnect-distributor/auth/distributor/login
     */
    if (currentAppType === "distributor") {
      router.push(distributorPath);
      return;
    }

    /**
     * OPTION B:
     *
     * Customer and distributor share the same domain,
     * but use different subdirectories.
     *
     * getDistributorDomain() returns:
     *
     * https://www.markupdesigns.net/indiekonnect-distributor
     *
     * So final URL becomes:
     *
     * https://www.markupdesigns.net/
     * indiekonnect-distributor/
     * auth/distributor/login
     */
    const distributorBaseUrl = getDistributorDomain().replace(/\/+$/, "");

    const targetUrl = `${distributorBaseUrl}${distributorPath}`;

    window.location.href = targetUrl;
  };

  // =========================================================
  // FEATURES
  // =========================================================

  const features = [
    {
      icon: TrendingUp,
      label: "Track deliveries in real-time",
    },
    {
      icon: Clock,
      label: "Reorder in seconds",
    },
    {
      icon: Users,
      label: "Stay connected to your network",
    },
    {
      icon: Sparkles,
      label: "Exclusive distributor offers",
    },
  ];

  // =========================================================
  // RENDER
  // =========================================================

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
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-3 py-4 sm:px-4 sm:py-8"
    >
      {/* =====================================================
          BACKGROUND
      ====================================================== */}

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
        onStarClick={() => {
          // Intentionally no console logging.
        }}
      />

      {/* =====================================================
          MAIN CARD
      ====================================================== */}

      <div className="relative z-10 mx-auto w-full max-w-4xl">
        <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/90 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:rounded-[28px]">
          {/* TOP GLOW */}

          <div className="pointer-events-none absolute inset-x-0 -top-10 flex justify-center">
            <div className="h-40 w-40 rounded-full bg-[radial-gradient(circle,_rgba(249,199,68,0.12)_0%,_rgba(249,199,68,0)_70%)] blur-2xl sm:h-60 sm:w-60" />
          </div>

          <div className="relative grid grid-cols-1 lg:grid-cols-5">
            {/* =================================================
                LEFT PANEL
            ================================================== */}

            <div className="relative hidden min-h-[400px] flex-col justify-between overflow-hidden bg-gradient-to-br from-[#0F2038] via-[#06101E] to-[#030810] p-8 lg:col-span-2 lg:flex lg:min-h-[600px] lg:p-10">
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

              <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-[#F9C744]/5 blur-3xl" />

              <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-[#F9C744]/5 blur-3xl" />

              <div className="absolute inset-0 opacity-30">
                <RouteMotif />
              </div>

              {/* Static Decorative Dots */}

              <div className="absolute inset-0 opacity-10">
                {STAR_POINTS.map((point, index) => (
                  <div
                    key={index}
                    className="absolute h-1.5 w-1.5 rounded-full bg-[#F9C744]"
                    style={{
                      top: `${point.top}%`,
                      left: `${point.left}%`,
                      animation: `pulse 3s ease-in-out ${point.delay}s infinite`,
                    }}
                  />
                ))}
              </div>

              <style>{`
                @keyframes pulse {
                  0%,
                  100% {
                    opacity: 0.2;
                    transform: scale(1);
                  }

                  50% {
                    opacity: 0.8;
                    transform: scale(1.5);
                  }
                }
              `}</style>

              {/* BRAND */}

              <div className="relative z-10">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl border border-white/10 bg-white/10 p-2.5 backdrop-blur-sm">
                    <Logo width={32} height={32} showText={false} />
                  </div>

                  <span className="text-[10px] font-light uppercase tracking-[0.2em] text-white/40">
                    IndieKonnect
                  </span>
                </div>
              </div>

              {/* CENTER CONTENT */}

              <div className="relative z-10 py-6">
                <div className="space-y-6">
                  <div className="h-1 w-12 rounded-full bg-gradient-to-r from-[#F9C744] to-[#E6B33D]" />

                  <h2 className="text-2xl font-bold leading-tight text-white lg:text-3xl">
                    Every order.
                    <br />
                    <span className="text-[#F9C744]">Every route.</span>
                    <br />
                    <span className="bg-gradient-to-r from-[#F9C744] to-[#E6B33D] bg-clip-text text-transparent">
                      One network.
                    </span>
                  </h2>

                  <p className="text-sm leading-relaxed text-[#8291A6]">
                    Track deliveries, reorder in seconds, and stay connected to
                    your network
                  </p>

                  <div className="space-y-2.5">
                    {features.map((feature, index) => (
                      <div
                        key={index}
                        className="group flex cursor-default items-center gap-3 text-xs text-[#5C6B80]"
                      >
                        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-[#F9C744]/10 transition-colors duration-300 group-hover:bg-[#F9C744]/20">
                          <feature.icon className="h-3.5 w-3.5 text-[#F9C744]" />
                        </div>

                        <span className="transition-colors duration-300 group-hover:text-white/80">
                          {feature.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* STATS */}

              <div className="relative z-10 grid grid-cols-2 gap-4 border-t border-white/5 pt-4 text-xs">
                <div>
                  <p className="text-lg font-semibold text-white">12K+</p>

                  <p className="text-[10px] text-[#5C6B80]">
                    Trusted Retailers
                  </p>
                </div>

                <div className="border-l border-white/5 pl-4">
                  <p className="flex items-center gap-1 text-lg font-semibold text-white">
                    99.9%
                    <Zap className="h-3 w-3 text-[#F9C744]" />
                  </p>

                  <p className="text-[10px] text-[#5C6B80]">Uptime</p>
                </div>
              </div>
            </div>

            {/* =================================================
                RIGHT PANEL
            ================================================== */}

            <div className="flex flex-col justify-center bg-white/80 p-5 backdrop-blur-sm sm:p-6 md:p-8 lg:col-span-3 lg:p-10">
              {/* MOBILE HEADER */}

              <div className="mb-6 text-center lg:hidden">
                <div className="mb-3 flex justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--gold)] via-[var(--gold-dark)] to-[var(--gold-deep)] shadow-[0_8px_20px_-6px_rgba(249,199,68,0.55)]">
                    <Phone className="h-7 w-7 text-[var(--navy)]" />
                  </div>
                </div>

                <h2 className="text-xl font-bold tracking-tight text-[var(--navy)] sm:text-2xl">
                  Welcome Back
                </h2>

                <p className="mt-1 text-xs font-medium text-gray-500 sm:text-sm">
                  Enter your phone number to continue
                </p>
              </div>

              {/* DESKTOP HEADER */}

              <div className="mb-6 hidden lg:mb-8 lg:block">
                <div className="mb-1 flex items-center gap-3">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--gold)] via-[var(--gold-dark)] to-[var(--gold-deep)] shadow-[0_8px_20px_-6px_rgba(249,199,68,0.55)]">
                    <Phone className="h-5 w-5 text-[var(--navy)]" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold tracking-tight text-[var(--navy)]">
                        Welcome Back
                      </h2>

                      <span className="hidden rounded-full border border-[var(--gold)]/30 bg-[#FFFBEF] px-2 py-0.5 text-[10px] font-semibold text-[var(--gold-deep)] sm:inline-block">
                        Customer
                      </span>
                    </div>

                    <p className="text-sm font-medium text-gray-500">
                      Enter your registered phone number to continue
                    </p>
                  </div>
                </div>
              </div>

              {/* ERROR */}

              {error && (
                <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50/80 p-3 text-xs font-medium text-red-700 backdrop-blur-sm sm:mb-5 sm:gap-3 sm:rounded-2xl sm:p-4 sm:text-sm">
                  <span className="flex-shrink-0 text-base sm:text-lg">❌</span>

                  <span className="break-words">{error}</span>
                </div>
              )}

              {/* FORM */}

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                {/* PHONE */}

                <div>
                  <PhoneInput
                    label="Phone Number"
                    value={phoneNumber}
                    onChange={(value) => setPhoneNumber(value)}
                    error={error || undefined}
                    placeholder="Enter your 10-digit number"
                  />
                </div>

                {/* SEND OTP */}

                <button
                  type="submit"
                  disabled={
                    isLoading ||
                    !phoneNumber ||
                    !(
                      phoneNumber.replace(/\D/g, "").length === 10 ||
                      (phoneNumber.replace(/\D/g, "").length === 12 &&
                        phoneNumber.replace(/\D/g, "").startsWith("91"))
                    )
                  }
                  className="group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-[var(--gold)] text-sm font-semibold text-[var(--navy)] shadow-[0_8px_20px_-6px_rgba(249,199,68,0.5)] transition-all duration-200 hover:bg-[var(--gold-dark)] hover:shadow-[0_12px_28px_-8px_rgba(249,199,68,0.6)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:h-14 sm:text-base"
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="h-4 w-4 animate-spin sm:h-5 sm:w-5"
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
                        />

                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      <span className="relative z-10">Send OTP</span>

                      <ArrowRight className="relative z-10 h-3.5 w-3.5 transition-transform group-hover:translate-x-1 sm:h-4 sm:w-4" />

                      <div className="absolute inset-0 bg-gradient-to-r from-[#E6B33D] to-[#F9C744] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </>
                  )}
                </button>

                {/* SECURITY */}

                <div className="flex items-center justify-center gap-2 pt-1 sm:pt-2">
                  <Shield className="h-3 w-3 text-gray-400 sm:h-3.5 sm:w-3.5" />

                  <p className="text-center text-[10px] font-medium text-gray-400 sm:text-xs">
                    Secure · One-time password will be sent via SMS
                  </p>
                </div>

                {/* BENEFITS */}

                <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[10px] text-gray-400 sm:gap-4 sm:text-xs">
                  <span>Track deliveries</span>

                  <span className="h-3 w-px bg-gray-200" />

                  <span>Reorder in seconds</span>

                  <span className="h-3 w-px bg-gray-200" />

                  <span>Network connected</span>
                </div>

                {/* DISTRIBUTOR LOGIN */}

                <div className="mt-2 border-t border-gray-100 pt-4 sm:pt-6">
                  <button
                    type="button"
                    onClick={handleDistributorLogin}
                    className="group flex w-full items-center justify-center gap-2 text-sm font-medium text-gray-500 transition-colors duration-200 hover:text-[var(--gold-deep)]"
                  >
                    <UserCog className="h-4 w-4 text-gray-400 transition-colors duration-200 group-hover:text-[var(--gold-deep)]" />

                    <span>Login as Distributor</span>

                    <ArrowRight className="h-3.5 w-3.5 -translate-x-2 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
                  </button>

                  <p className="mt-1.5 text-center text-[10px] text-gray-400">
                    Access your distributor dashboard to manage products and
                    commissions
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// =========================================================
// ROUTE MOTIF
// =========================================================

function RouteMotif() {
  return (
    <svg viewBox="0 0 320 320" className="h-full w-full" fill="none">
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
        style={{
          animationDelay: "0s",
        }}
        cx="40"
        cy="250"
        r="4"
        fill="#F9C744"
      />

      <circle
        className="route-node"
        style={{
          animationDelay: "0.7s",
        }}
        cx="140"
        cy="90"
        r="4"
        fill="#F9C744"
      />

      <circle
        className="route-node"
        style={{
          animationDelay: "1.4s",
        }}
        cx="280"
        cy="70"
        r="4"
        fill="#F9C744"
      />

      <circle
        className="route-node"
        style={{
          animationDelay: "2.1s",
        }}
        cx="90"
        cy="210"
        r="4"
        fill="#F9C744"
      />

      <circle
        className="route-node"
        style={{
          animationDelay: "1.1s",
        }}
        cx="130"
        cy="280"
        r="4"
        fill="#F9C744"
      />

      <circle
        className="route-node"
        style={{
          animationDelay: "1.8s",
        }}
        cx="60"
        cy="60"
        r="4"
        fill="#F9C744"
      />

      <style>{`
        .route-node {
          animation: routePulse 3s ease-in-out infinite;
          transform-box: fill-box;
          transform-origin: center;
        }

        @keyframes routePulse {
          0%,
          100% {
            opacity: 0.3;
            transform: scale(1);
          }

          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
      `}</style>
    </svg>
  );
}

export default CustomerLoginForm;
