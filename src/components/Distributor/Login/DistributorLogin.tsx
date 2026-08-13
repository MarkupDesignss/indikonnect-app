// components/distributor/Login/DistributorLogin.tsx

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { Logo } from "@/components/common/Logo";
import { ROUTES } from "@/lib/constants/routes";
import ConstellationBackground from "@/components/common/ConstellationBackground";
import { useDistributorLoginMutation } from "../../../lib/redux/api/distributor/distributorauthApis";
import {
  User,
  Eye,
  EyeOff,
  Shield,
  Users,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Phone,
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
  email: string;
  password: string;
  remember_me: boolean;
}

export const DistributorLogin: React.FC = () => {
  const router = useRouter();
  const [distributorLogin, { isLoading }] = useDistributorLoginMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    remember_me: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!validateForm()) return;

    try {
      const response = await distributorLogin({
        email: formData.email,
        password: formData.password,
      }).unwrap();

      console.log("Login response:", response);

      // ✅ FIX: Check strictly for response.status
      if (response.status === true) {
        // Login successful
        if (formData.remember_me) {
          localStorage.setItem("distributor_email", formData.email);
        }

        // Store session data
        localStorage.setItem(
          "distributor_session",
          JSON.stringify({
            logged_in: true,
            email: formData.email,
            login_time: new Date().toISOString(),
          }),
        );

        // ✅ CRITICAL: Save Tokens and User Data
        if (response.data) {
          // 1. Save Authentication Token
          if (response.data.token) {
            localStorage.setItem("distributor_token", response.data.token);
          }

          // 2. Save Refresh Token (if provided by API)
          if (response.data.refresh_token) {
            localStorage.setItem("refresh_token", response.data.refresh_token);
          }

          // 3. Save User Data
          if (response.data.user) {
            localStorage.setItem(
              "user_data",
              JSON.stringify(response.data.user),
            );
          }

          // ✅ CRITICAL: Tell the system this is a Distributor!
          localStorage.setItem("user_type", "distributor");
          localStorage.setItem("is_logged_in", "true");

          // Clear any lingering "customer" data
          localStorage.removeItem("auth_token");
        }

        // Redirect to products page
        router.push("/products");
      } else {
        // Login failed - show the error message from API
        setFormError(response.message || "Login failed. Please try again.");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      // Handle network errors or other exceptions
      setFormError(
        err.data?.message || err.message || "Network error. Please try again.",
      );
    }
  };

  // Handler for customer login navigation
  const handleCustomerLogin = () => {
    router.push("/auth/customer/login");
  };

  const features = [
    { icon: TrendingUp, label: "Real-time commission tracking" },
    { icon: Users, label: "Network growth analytics" },
    { icon: Sparkles, label: "Product catalog access" },
    { icon: Shield, label: "Support & training resources" },
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
        onStarClick={(starId) => {
          console.log(`✨ Star ${starId} exploded!`);
        }}
      />
      <div className="w-full max-w-4xl mx-auto">
        <div className="relative rounded-[28px] bg-white/90 backdrop-blur-xl border border-[var(--navy)]/[0.06] shadow-[0_20px_60px_-15px_rgba(6,16,30,0.15)] overflow-hidden">
          {/* Ambient glow */}
          <div className="pointer-events-none absolute inset-x-0 -top-10 flex justify-center">
            <div className="w-60 h-60 rounded-full bg-[radial-gradient(circle,_rgba(249,199,68,0.25)_0%,_rgba(249,199,68,0)_70%)] blur-2xl" />
          </div>

          <div className="relative grid grid-cols-1 lg:grid-cols-5">
            {/* Left Panel - Branding & Features */}
            <div className="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-[#0F2038] via-[#06101E] to-[#030810] p-8 lg:p-10 flex flex-col justify-between min-h-[400px] lg:min-h-[600px]">
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

              {/* Floating Dots */}
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

              <style>{`
                @keyframes pulse {
                  0%, 100% { opacity: 0.2; transform: scale(1); }
                  50% { opacity: 0.8; transform: scale(1.5); }
                }
                @keyframes float {
                  0%, 100% { transform: translateY(0px); }
                  50% { transform: translateY(-6px); }
                }
              `}</style>

              {/* Header */}
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

              {/* Main Content */}
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

              {/* Footer Stats */}
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

            {/* Right Panel - Login Form */}
            <div className="lg:col-span-3 p-8 lg:p-10 flex flex-col justify-center">
              {/* Mobile Header */}
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

              {/* Desktop Header */}
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

              {/* Error Message */}
              {formError && (
                <div className="mb-5 bg-red-50/80 backdrop-blur-sm p-4 rounded-2xl border border-red-200 text-sm text-red-700 flex items-start gap-3 font-medium">
                  <span className="text-lg flex-shrink-0">❌</span>
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    placeholder="john@example.com"
                    required
                    className="w-full h-14 px-4 text-black rounded-xl border-gray-200 focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all duration-200"
                    autoComplete="email"
                  />
                </div>

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
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="remember_me"
                      checked={formData.remember_me}
                      onChange={handleChange}
                      className="w-4 h-4 rounded border-gray-300 text-[var(--gold)] focus:ring-[var(--gold)] focus:ring-2 focus:ring-offset-0 cursor-pointer transition-all duration-200"
                    />
                    <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors duration-200 font-medium">
                      Remember me
                    </span>
                  </label>
                  <Link
                    href="/distributor/forgot-password"
                    className="text-sm text-[var(--gold-deep)] hover:text-[var(--gold-dark)] font-semibold hover:underline transition-colors duration-200"
                  >
                    Forgot password?
                  </Link>
                </div>

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
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Signing In...
                    </>
                  ) : (
                    "Sign In →"
                  )}
                </button>

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

                <div className="flex items-center justify-center gap-2 pt-2">
                  <Shield className="w-3.5 h-3.5 text-gray-400" />
                  <p className="text-xs text-gray-400 font-medium">
                    Secure login · Protected by encryption
                  </p>
                </div>

                {/* Customer Login Link - Added here */}
                <div className="pt-4 sm:pt-6 border-t border-gray-100 mt-4">
                  <button
                    type="button"
                    onClick={handleCustomerLogin}
                    className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-[var(--gold-deep)] transition-colors duration-200 font-medium group"
                  >
                    <Phone className="w-4 h-4 text-gray-400 group-hover:text-[var(--gold-deep)] transition-colors duration-200" />
                    <span>Login as Customer</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-200" />
                  </button>
                  <p className="text-[10px] text-gray-400 text-center mt-1.5">
                    Track deliveries, reorder products, and manage your network
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

export default DistributorLogin;
