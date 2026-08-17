// components/customer/Login/CustomerLoginForm.tsx

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { PhoneInput } from "@/components/common/PhoneInput";
import ConstellationBackground from "@/components/common/ConstellationBackground";
import { Logo } from "@/components/common/Logo";
import { useSendOTPMutation } from "@/lib/redux/api/authApi";
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
  onOTPSent?: (phoneNumber: string) => void;
}

export const CustomerLoginForm: React.FC<CustomerLoginFormProps> = ({
  onOTPSent,
}) => {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [sendOTP, { isLoading }] = useSendOTPMutation();

  const normalizePhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length === 10) {
      return `+91${digits}`;
    }
    return digits;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanPhone = normalizePhone(phoneNumber);

    if (cleanPhone.length < 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    try {
      console.log("📱 Sending OTP to:", cleanPhone);
      const result = await sendOTP({ phone: cleanPhone }).unwrap();

      if (result.status === true) {
        console.log("✅ OTP sent successfully!");
        onOTPSent?.(cleanPhone);
      } else {
        setError(result.message || "Failed to send OTP. Please try again.");
      }
    } catch (err: any) {
      console.error("Send OTP error:", err);
      setError(
        err.data?.message ||
          "Network error. Please check your connection and try again.",
      );
    }
  };

  const handleDistributorLogin = () => {
    router.push("/auth/distributor/login");
  };

  const features = [
    { icon: TrendingUp, label: "Track deliveries in real-time" },
    { icon: Clock, label: "Reorder in seconds" },
    { icon: Users, label: "Stay connected to your network" },
    { icon: Sparkles, label: "Exclusive distributor offers" },
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
      className="min-h-screen flex items-center justify-center px-3 sm:px-4 py-4 sm:py-8 relative overflow-hidden"
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

      <div className="w-full max-w-4xl mx-auto relative z-10">
        <div className="relative rounded-2xl sm:rounded-[28px] bg-white/90 backdrop-blur-xl border border-white/20 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 -top-10 flex justify-center">
            <div className="w-40 sm:w-60 h-40 sm:h-60 rounded-full bg-[radial-gradient(circle,_rgba(249,199,68,0.12)_0%,_rgba(249,199,68,0)_70%)] blur-2xl" />
          </div>

          <div className="relative grid grid-cols-1 lg:grid-cols-5">
            {/* Left Panel - Branding & Features */}
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

              <style>{`
                @keyframes pulse {
                  0%, 100% { opacity: 0.2; transform: scale(1); }
                  50% { opacity: 0.8; transform: scale(1.5); }
                }
              `}</style>

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
                    Every order.
                    <br />
                    <span className="text-[#F9C744]">Every route.</span>
                    <br />
                    <span className="bg-gradient-to-r from-[#F9C744] to-[#E6B33D] bg-clip-text text-transparent">
                      One network.
                    </span>
                  </h2>

                  <p className="text-[#8291A6] text-sm leading-relaxed">
                    Track deliveries, reorder in seconds, and stay connected to
                    your network
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
                  <p className="text-white font-semibold text-lg flex items-center gap-1">
                    99.9%
                    <Zap className="w-3 h-3 text-[#F9C744]" />
                  </p>
                  <p className="text-[#5C6B80] text-[10px]">Uptime</p>
                </div>
              </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="lg:col-span-3 p-5 sm:p-6 md:p-8 lg:p-10 flex flex-col justify-center bg-white/80 backdrop-blur-sm">
              <div className="lg:hidden text-center mb-6">
                <div className="flex justify-center mb-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--gold)] via-[var(--gold-dark)] to-[var(--gold-deep)] flex items-center justify-center shadow-[0_8px_20px_-6px_rgba(249,199,68,0.55)]">
                    <Phone className="w-7 h-7 text-[var(--navy)]" />
                  </div>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--navy)]">
                  Welcome Back
                </h2>
                <p className="text-gray-500 text-xs sm:text-sm font-medium mt-1">
                  Enter your phone number to continue
                </p>
              </div>

              <div className="hidden lg:block mb-6 lg:mb-8">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[var(--gold)] via-[var(--gold-dark)] to-[var(--gold-deep)] flex items-center justify-center shadow-[0_8px_20px_-6px_rgba(249,199,68,0.55)] flex-shrink-0">
                    <Phone className="w-5 h-5 text-[var(--navy)]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold tracking-tight text-[var(--navy)]">
                        Welcome Back
                      </h2>
                      <span className="text-[10px] font-semibold text-[var(--gold-deep)] bg-[#FFFBEF] px-2 py-0.5 rounded-full border border-[var(--gold)]/30 hidden sm:inline-block">
                        Customer
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm font-medium">
                      Enter your registered phone number to continue
                    </p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-4 sm:mb-5 bg-red-50/80 backdrop-blur-sm p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-red-200 text-xs sm:text-sm text-red-700 flex items-start gap-2 sm:gap-3 font-medium">
                  <span className="text-base sm:text-lg flex-shrink-0">❌</span>
                  <span className="break-words">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                <div>
                  <PhoneInput
                    label="Phone Number"
                    value={phoneNumber}
                    onChange={setPhoneNumber}
                    error={error || undefined}
                    placeholder="Enter your 10-digit number"
                  />
                </div>

                <button
                  type="submit"
                  disabled={
                    isLoading ||
                    !phoneNumber ||
                    phoneNumber.replace(/\D/g, "").length < 10
                  }
                  className="w-full bg-[var(--gold)] hover:bg-[var(--gold-dark)] text-[var(--navy)] font-semibold h-12 sm:h-14 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200 shadow-[0_8px_20px_-6px_rgba(249,199,68,0.5)] hover:shadow-[0_12px_28px_-8px_rgba(249,199,68,0.6)] active:scale-[0.98] text-sm sm:text-base relative overflow-hidden group"
                >
                  {isLoading ? (
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
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      <span className="relative z-10">Send OTP</span>
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                      <div className="absolute inset-0 bg-gradient-to-r from-[#E6B33D] to-[#F9C744] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 pt-1 sm:pt-2">
                  <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400" />
                  <p className="text-[10px] sm:text-xs text-gray-400 font-medium text-center">
                    Secure · One-time password will be sent via SMS
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-gray-400 pt-1">
                  <span>Track deliveries</span>
                  <span className="w-px h-3 bg-gray-200" />
                  <span>Reorder in seconds</span>
                  <span className="w-px h-3 bg-gray-200" />
                  <span>Network connected</span>
                </div>

                <div className="pt-4 sm:pt-6 border-t border-gray-100 mt-2">
                  <button
                    type="button"
                    onClick={handleDistributorLogin}
                    className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-[var(--gold-deep)] transition-colors duration-200 font-medium group"
                  >
                    <UserCog className="w-4 h-4 text-gray-400 group-hover:text-[var(--gold-deep)] transition-colors duration-200" />
                    <span>Login as Distributor</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-200" />
                  </button>
                  <p className="text-[10px] text-gray-400 text-center mt-1.5">
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
      `}</style>
    </svg>
  );
}

export default CustomerLoginForm;
