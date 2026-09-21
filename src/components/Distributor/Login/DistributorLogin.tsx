"use client";

import React, { useEffect, useState } from "react";

import { useRouter } from "next/navigation";
import Link from "next/link";

import { Input } from "@/components/common/Input";
import { Logo } from "@/components/common/Logo";
import { ROUTES } from "@/lib/constants/routes";
import ForgotPasswordModal from "./ForgotPasswordModal";
import ConstellationBackground from "@/components/common/ConstellationBackground";

import { useDistributorLoginMutation } from "../../../lib/redux/api/distributor/distributorauthApis";

import { getAppType, getAppHomeUrl, getCustomerDomain } from "@/lib/appConfig";

import {
  User,
  Eye,
  EyeOff,
  Shield,
  Users,
  TrendingUp,
  Sparkles,
  ArrowRight,
  User2,
} from "lucide-react";

const theme = {
  font: "'Inter', 'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, sans-serif",
  gold: "#F9C744",
  goldDark: "#E6B33D",
  goldDeep: "#C9922A",
  navy: "#06101E",
  navySoft: "#0B1B2E",
};

interface LoginFormData {
  login: string;
  password: string;
  remember_me: boolean;
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

export const DistributorLogin: React.FC = () => {
  const router = useRouter();

  const [distributorLogin, { isLoading }] = useDistributorLoginMutation();

  const [showPassword, setShowPassword] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState<LoginFormData>({
    login: "",
    password: "",
    remember_me: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const [isMounted, setIsMounted] = useState(false);

  // =====================================================
  // MOUNT - RESTORE REMEMBERED LOGIN
  // =====================================================

  useEffect(() => {
    setIsMounted(true);

    try {
      const savedLogin = localStorage.getItem("distributor_login");

      if (savedLogin) {
        setFormData((prev) => ({
          ...prev,
          login: savedLogin,
          remember_me: true,
        }));
      }
    } catch {
      // Ignore localStorage errors.
    }
  }, []);

  // =====================================================
  // VALIDATE FORM
  // =====================================================

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const loginValue = formData.login.trim();

    if (!loginValue) {
      newErrors.login = "Email or Distributor ID is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // =====================================================
  // HANDLE INPUT CHANGE
  // =====================================================

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const nextErrors = {
          ...prev,
        };

        delete nextErrors[name];

        return nextErrors;
      });
    }

    if (formError) {
      setFormError(null);
    }
  };

  // =====================================================
  // HANDLE LOGIN
  // =====================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setFormError(null);

    if (!validateForm()) {
      return;
    }

    try {
      // -------------------------------------------------
      // Clear only the current distributor token.
      //
      // DO NOT clear customer authentication because
      // both apps now share the same origin.
      // -------------------------------------------------

      localStorage.removeItem("distributor_token");

      localStorage.removeItem("distributor_refresh_token");

      // -------------------------------------------------
      // LOGIN
      //
      // distributorAuthApi transformResponse() handles:
      //
      // distributor_token
      // distributor_refresh_token
      // distributor_user_data
      // -------------------------------------------------

      const response = await distributorLogin({
        login: formData.login.trim(),
        password: formData.password,
      }).unwrap();

      // -------------------------------------------------
      // CHECK LOGIN STATUS
      // -------------------------------------------------

      if (response.status !== true) {
        setFormError(
          response.message || "Login failed. Please check your credentials.",
        );

        return;
      }

      // -------------------------------------------------
      // EXTRACT TOKEN
      // Used only as a safety validation here.
      // Actual token storage is handled by
      // distributorAuthApi / TokenManager.
      // -------------------------------------------------

      const accessToken =
        (response as any)?.access_token || (response as any)?.token;

      if (!accessToken) {
        setFormError("Login failed: No access token received");

        return;
      }

      // -------------------------------------------------
      // DISTRIBUTOR PROFILE
      //
      // Keep distributor-specific profile separate.
      // -------------------------------------------------

      const distributorProfile = (response as any)?.distributor_profile;

      if (distributorProfile) {
        localStorage.setItem(
          "distributor_profile",
          JSON.stringify(distributorProfile),
        );
      }

      // -------------------------------------------------
      // REMEMBER LOGIN
      // -------------------------------------------------

      if (formData.remember_me) {
        localStorage.setItem("distributor_login", formData.login.trim());
      } else {
        localStorage.removeItem("distributor_login");
      }

      // -------------------------------------------------
      // VERIFY CURRENT APP
      // -------------------------------------------------

      const currentAppType = getAppType();

      if (currentAppType !== "distributor") {
        /**
         * This normally should never happen because the
         * distributor login page belongs to the
         * distributor build.
         *
         * Safety fallback:
         * redirect to distributor application home.
         */
        const distributorHome =
          window.location.origin + "/indiekonnect-distributor/";

        window.location.replace(distributorHome);

        return;
      }

      // -------------------------------------------------
      // DISTRIBUTOR HOME
      //
      // With basePath:
      //
      // router.replace("/")
      //
      // resolves to:
      // /indiekonnect-distributor/
      //
      // We use getAppHomeUrl() + location.replace()
      // so there is no ambiguity in static export.
      // -------------------------------------------------

      window.location.replace(getAppHomeUrl());
    } catch (err: any) {
      setFormError(
        err?.data?.message ||
          err?.error ||
          err?.message ||
          "Unable to login. Please try again.",
      );
    }
  };

  // =====================================================
  // CUSTOMER LOGIN
  // =====================================================

  const handleCustomerLogin = () => {
    const customerPath = "/auth/customer/login";

    /**
     * OPTION B:
     *
     * Customer:
     * /indiekonnect-web
     *
     * Distributor:
     * /indiekonnect-distributor
     *
     * We MUST NOT use router.push() here because
     * router on distributor build would resolve the path
     * against distributor's basePath.
     */

    const customerBaseUrl = getCustomerDomain().replace(/\/+$/, "");

    const customerLoginUrl = `${customerBaseUrl}${customerPath}`;

    window.location.href = customerLoginUrl;
  };

  // =====================================================
  // FEATURES
  // =====================================================

  const features = [
    {
      icon: TrendingUp,
      label: "Real-time commission tracking",
    },
    {
      icon: Users,
      label: "Network growth analytics",
    },
    {
      icon: Sparkles,
      label: "Product catalog access",
    },
    {
      icon: Shield,
      label: "Support & training resources",
    },
  ];

  // =====================================================
  // UI
  // =====================================================

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
      className="min-h-screen flex items-center justify-center bg-[#FAF8F4] px-4 py-8"
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
        <div className="relative rounded-[28px] bg-white/90 backdrop-blur-xl border border-[var(--navy)]/[0.06] shadow-[0_20px_60px_-15px_rgba(6,16,30,0.15)] overflow-hidden">
          {/* Ambient glow */}

          <div className="pointer-events-none absolute inset-x-0 -top-10 flex justify-center">
            <div className="w-60 h-60 rounded-full bg-[radial-gradient(circle,_rgba(249,199,68,0.25)_0%,_rgba(249,199,68,0)_70%)] blur-2xl" />
          </div>

          <div className="relative grid grid-cols-1 lg:grid-cols-5">
            {/* =====================================================
                LEFT PANEL
            ====================================================== */}

            <div className="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-[#0F2038] via-[#06101E] to-[#030810] p-8 lg:p-10 flex flex-col justify-between min-h-[400px] lg:min-h-[600px]">
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

              {isMounted && (
                <div className="absolute inset-0 opacity-10">
                  {STAR_POINTS.map((pos, index) => (
                    <div
                      key={`dot-${index}`}
                      className="absolute w-1.5 h-1.5 bg-[#F9C744] rounded-full"
                      style={{
                        top: `${pos.top}%`,
                        left: `${pos.left}%`,
                        animation: `pulse 3s ease-in-out ${pos.delay}s infinite`,
                      }}
                    />
                  ))}
                </div>
              )}

              <style>{`
                @keyframes pulse {
                  0%, 100% {
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
                  <div className="bg-white/10 backdrop-blur-sm p-2.5 rounded-xl border border-white/10">
                    <Logo width={32} height={32} showText={false} />
                  </div>

                  <span className="text-white/40 text-[10px] tracking-[0.2em] font-light uppercase">
                    Indiekonnet
                  </span>
                </div>
              </div>

              {/* CENTER CONTENT */}

              <div className="relative z-10 py-6">
                <div className="space-y-6">
                  <div className="w-12 h-1 bg-gradient-to-r from-[#F9C744] to-[#E6B33D] rounded-full" />

                  <h2 className="text-white text-2xl lg:text-3xl font-bold leading-tight">
                    Welcome
                    <br />
                    <span className="text-[#F9C744]">Distributor</span>
                  </h2>

                  <p className="text-[#8291A6] text-sm leading-relaxed">
                    Access your partner dashboard to manage commissions, track
                    sales, and grow your network.
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

              {/* STATS */}

              <div className="relative z-10 grid grid-cols-3 gap-4 text-xs border-t border-white/5 pt-4">
                <div>
                  <p className="text-white font-semibold text-lg">500+</p>

                  <p className="text-[#5C6B80] text-[10px]">Brands Available</p>
                </div>

                <div className="border-l border-white/5 pl-4">
                  <p className="text-white font-semibold text-lg">200+</p>

                  <p className="text-[#5C6B80] text-[10px]">Distributors</p>
                </div>

                <div className="border-l border-white/5 pl-4">
                  <p className="text-white font-semibold text-lg">98%</p>

                  <p className="text-[#5C6B80] text-[10px]">Satisfaction</p>
                </div>
              </div>
            </div>

            {/* =====================================================
                RIGHT PANEL - LOGIN
            ====================================================== */}

            <div className="lg:col-span-3 p-8 lg:p-10 flex flex-col justify-center">
              {/* MOBILE HEADING */}

              <div className="lg:hidden text-center mb-6">
                <div className="flex justify-center mb-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--gold)] via-[var(--gold-dark)] to-[var(--gold-deep)] flex items-center justify-center shadow-[0_8px_20px_-6px_rgba(249,199,68,0.55)]">
                    <User className="w-7 h-7 text-[var(--navy)]" />
                  </div>
                </div>

                <h2 className="text-2xl font-bold tracking-tight text-[var(--navy)]">
                  Welcome Back
                </h2>

                <p className="text-gray-500 text-sm font-medium mt-1">
                  Sign in to access your distributor dashboard
                </p>
              </div>

              {/* DESKTOP HEADING */}

              <div className="hidden lg:block mb-8">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[var(--gold)] via-[var(--gold-dark)] to-[var(--gold-deep)] flex items-center justify-center shadow-[0_8px_20px_-6px_rgba(249,199,68,0.55)] flex-shrink-0">
                    <User className="w-5 h-5 text-[var(--navy)]" />
                  </div>

                  <h2 className="text-2xl font-bold tracking-tight text-[var(--navy)]">
                    Welcome Back
                  </h2>
                </div>

                <p className="text-gray-500 text-sm font-medium ml-14">
                  Sign in to access your distributor dashboard
                </p>
              </div>

              {/* FORM ERROR */}

              {formError && (
                <div className="mb-5 bg-red-50/80 backdrop-blur-sm p-4 rounded-2xl border border-red-200 text-sm text-red-700 flex items-start gap-3 font-medium">
                  <span className="text-lg flex-shrink-0">❌</span>

                  <span>{formError}</span>
                </div>
              )}

              {/* LOGIN FORM */}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* LOGIN */}

                <div>
                  <Input
                    label="Email or BA ID"
                    name="login"
                    type="text"
                    value={formData.login}
                    onChange={handleChange}
                    error={errors.login}
                    placeholder="Enter Email or BA ID"
                    required
                    className="w-full h-14 px-4 text-black rounded-xl border-gray-200 focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all duration-200"
                    autoComplete="username"
                  />
                </div>

                {/* PASSWORD */}

                <div>
                  <div className="relative">
                    <Input
                      label="Password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      error={errors.password}
                      placeholder="Enter your password"
                      required
                      className="w-full h-14 px-4 text-black rounded-xl border-gray-200 focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all duration-200 pr-12"
                      autoComplete="current-password"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-[46px] text-gray-400 hover:text-gray-600 transition-colors duration-200"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* REMEMBER / FORGOT */}

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="remember_me"
                      checked={formData.remember_me}
                      onChange={handleChange}
                      className="w-4 h-4 rounded border-gray-300 text-[var(--gold)] focus:ring-[var(--gold)]/20"
                    />

                    <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors duration-200">
                      Remember me
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-[var(--gold-deep)] hover:text-[var(--gold-dark)] font-semibold hover:underline transition-colors duration-200"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* SIGN IN */}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[var(--gold)] hover:bg-[var(--gold-dark)] text-[var(--navy)] font-semibold h-14 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200 shadow-[0_8px_20px_-6px_rgba(249,199,68,0.5)] hover:shadow-[0_12px_28px_-8px_rgba(249,199,68,0.6)] hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5"
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
                      Signing In...
                    </>
                  ) : (
                    "Sign In →"
                  )}
                </button>

                {/* REGISTER */}

                <div className="text-center pt-2">
                  <p className="text-sm text-gray-500 font-medium">
                    Don't have an account?{" "}
                    <Link
                      href={ROUTES.auth.distributor.register}
                      className="text-[var(--gold-deep)] hover:text-[var(--gold-dark)] font-semibold hover:underline transition-colors duration-200"
                    >
                      Register here
                    </Link>
                  </p>
                </div>

                {/* SECURITY */}

                <div className="flex items-center justify-center gap-2 pt-2">
                  <Shield className="w-3.5 h-3.5 text-gray-400" />

                  <p className="text-xs text-gray-400 font-medium">
                    Secure login · Protected by encryption
                  </p>
                </div>

                {/* CUSTOMER LOGIN */}

                <div className="pt-4 sm:pt-6 border-t border-gray-100 mt-4">
                  <button
                    type="button"
                    onClick={handleCustomerLogin}
                    className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-[var(--gold-deep)] transition-colors duration-200 font-medium group"
                  >
                    <User2 className="w-4 h-4 text-gray-400 group-hover:text-[var(--gold-deep)] transition-colors duration-200" />

                    <span>Login as Customer</span>

                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-200" />
                  </button>

                  <p className="text-[10px] text-gray-400 text-center mt-1.5">
                    Track deliveries, reorder products
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* FORGOT PASSWORD */}

      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onSuccess={() => setShowForgotPassword(false)}
      />
    </div>
  );
};

export default DistributorLogin;
