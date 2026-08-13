// components/customer/Registration/CustomerRegistrationForm.tsx

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/common/Input";
import { PhoneInput } from "@/components/common/PhoneInput";
import { Button } from "@/components/common/Button";
import { Logo } from "@/components/common/Logo";
import Link from "next/link";
import { ROUTES } from "@/lib/constants/routes";
import ConstellationBackground from "@/components/common/ConstellationBackground";
import { useConfirmRegistrationMutation } from "@/lib/redux/api/authApi";
import {
  User,
  Mail,
  Phone,
  Building2,
  Globe,
  Shield,
  CheckCircle,
  ArrowRight,
  Users,
  Star,
  Sparkles,
} from "lucide-react";

/**
 * Same theme tokens as all registration steps and login components
 */
const theme = {
  font: "'Inter', 'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, sans-serif",
  gold: "#F9C744",
  goldDark: "#E6B33D",
  goldDeep: "#C9922A",
  navy: "#06101E",
  navySoft: "#0B1B2E",
};

interface CustomerRegistrationFormProps {
  onBack?: () => void;
  phoneNumber?: string;
}

export const CustomerRegistrationForm: React.FC<
  CustomerRegistrationFormProps
> = ({ onBack, phoneNumber }) => {
  const router = useRouter();
  const [confirmRegistration, { isLoading }] = useConfirmRegistrationMutation();
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [verifiedPhone, setVerifiedPhone] = useState<string>("");
  const [isPhoneVerified, setIsPhoneVerified] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    country: "India",
    company_name: "",
    terms_condition: false,
    account_type: "customer" as const,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let token = null;
    let phone = null;

    if (phoneNumber) {
      phone = phoneNumber;
      console.log("📱 Phone from props:", phone);
    }

    if (!phone && typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const urlPhone = urlParams.get("phone");
      if (urlPhone) {
        phone = decodeURIComponent(urlPhone);
        console.log("📱 Phone from URL:", phone);
      }
    }

    if (!phone) {
      const storedPhone = localStorage.getItem("verified_phone");
      if (storedPhone) {
        phone = storedPhone;
        console.log("📱 Phone from localStorage:", phone);
      }
    }

    if (!phone) {
      const sessionPhone = sessionStorage.getItem("verified_phone");
      if (sessionPhone) {
        phone = sessionPhone;
        console.log("📱 Phone from sessionStorage:", phone);
      }
    }

    token = localStorage.getItem("temp_token");
    if (!token) {
      token = sessionStorage.getItem("temp_token");
    }

    console.log("🔑 Temp Token:", token);
    console.log("📱 Final Phone:", phone);

    if (token) {
      setTempToken(token);
    }

    if (phone) {
      setVerifiedPhone(phone);
      setIsPhoneVerified(true);
      setFormData((prev) => ({ ...prev, phone: phone }));
    } else {
      console.log("❌ No phone found, redirecting to phone input...");
      setFormError("Phone number not found. Please verify your phone again.");
      setTimeout(() => {
        router.push(ROUTES.auth.customer.phone);
      }, 2000);
    }
  }, [phoneNumber, router]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = "Full name is required";
    } else if (formData.full_name.trim().split(" ").length < 2) {
      newErrors.full_name = "Please enter your full name (First and Last name)";
    }

    if (!formData.email) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    const cleanPhone = formData.phone.replace(/\D/g, "");
    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (cleanPhone.length < 10) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }

    if (!formData.country) {
      newErrors.country = "Country is required";
    }

    if (!formData.company_name.trim()) {
      newErrors.company_name = "Company name is required";
    }

    if (!formData.terms_condition) {
      newErrors.terms_condition =
        "You must accept the Terms of Service and Privacy Policy";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!tempToken) {
      setFormError("Session expired. Please verify your phone number again.");
      setTimeout(() => {
        router.push(ROUTES.auth.customer.phone);
      }, 2000);
      return;
    }

    setFormError(null);
    setSuccessMessage(null);

    try {
      const requestBody = {
        email: formData.email,
        account_type: "customer",
        temp_token: tempToken,
        full_name: formData.full_name.trim(),
        phone: formData.phone,
        country: formData.country,
        terms_condition: formData.terms_condition ? "1" : "0",
        company_name: formData.company_name.trim(),
      };

      console.log("📝 Registration Payload:", requestBody);

      const result = await confirmRegistration(requestBody).unwrap();

      if (result.status && result.token) {
        localStorage.setItem("auth_token", result.token);
        if (result.data?.user) {
          localStorage.setItem("user_data", JSON.stringify(result.data.user));
        }

        localStorage.removeItem("temp_token");
        localStorage.removeItem("verified_phone");
        localStorage.removeItem("customer_otp");
        localStorage.removeItem("customer_phone");
        sessionStorage.removeItem("temp_token");
        sessionStorage.removeItem("verified_phone");
        sessionStorage.removeItem("customer_phone");

        setSuccessMessage(
          "Account created successfully! Redirecting to dashboard...",
        );

        setTimeout(() => {
          router.push(ROUTES.dashboard);
        }, 1500);
      } else {
        setFormError(
          result.message || "Registration failed. Please try again.",
        );
      }
    } catch (err: any) {
      console.error("Registration error:", err);

      if (err.data?.message) {
        if (err.data.message.includes("email")) {
          setFormError(
            "This email is already registered. Please use a different email.",
          );
        } else if (err.data.message.includes("phone")) {
          setFormError(
            "This phone number is already registered. Please use a different number.",
          );
        } else {
          setFormError(err.data.message);
        }
      } else {
        setFormError("Registration failed. Please try again later.");
      }
    }
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

  const features = [
    { icon: Sparkles, label: "Easy ordering & reordering" },
    { icon: Shield, label: "Real-time delivery tracking" },
    { icon: CheckCircle, label: "Secure & trusted platform" },
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
      className="min-h-screen flex items-center justify-center bg-[#FAF8F4] px-3 sm:px-4 py-4 sm:py-8"
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
          // You can add analytics or custom logic here
        }}
      />
      {/* Centered surface card */}
      <div className="w-full max-w-4xl mx-auto">
        <div className="relative rounded-2xl sm:rounded-[28px] bg-white/90 backdrop-blur-xl border border-[var(--navy)]/[0.06] shadow-[0_20px_60px_-15px_rgba(6,16,30,0.15)] overflow-hidden">
          {/* Ambient glow */}
          <div className="pointer-events-none absolute inset-x-0 -top-10 flex justify-center">
            <div className="w-40 sm:w-60 h-40 sm:h-60 rounded-full bg-[radial-gradient(circle,_rgba(249,199,68,0.25)_0%,_rgba(249,199,68,0)_70%)] blur-2xl" />
          </div>

          <div className="relative grid grid-cols-1 lg:grid-cols-5">
            {/* Left Panel - Customer Branding */}
            <div className="hidden lg:flex lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-[#0F2038] via-[#06101E] to-[#030810] p-8 lg:p-10 flex-col justify-between min-h-[400px] lg:min-h-[600px]">
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
                    Welcome to
                    <br />
                    <span className="text-[#F9C744]">IndiKonnect</span>
                  </h2>

                  <p className="text-[#8291A6] text-sm leading-relaxed">
                    Create your customer account to start ordering, track
                    deliveries, and manage your purchases seamlessly.
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
                  <p className="text-white font-semibold text-lg">10K+</p>
                  <p className="text-[#5C6B80] text-[10px]">Happy Customers</p>
                </div>
                <div className="border-l border-white/5 pl-4">
                  <p className="text-white font-semibold text-lg">98%</p>
                  <p className="text-[#5C6B80] text-[10px]">Satisfaction</p>
                </div>
                <div className="border-l border-white/5 pl-4">
                  <p className="text-white font-semibold text-lg">4.9★</p>
                  <p className="text-[#5C6B80] text-[10px]">User Rating</p>
                </div>
              </div>
            </div>

            {/* Right Panel - Registration Form */}
            <div className="lg:col-span-3 p-5 sm:p-6 md:p-8 lg:p-10 flex flex-col justify-center">
              {/* Mobile Header */}
              <div className="lg:hidden text-center mb-6">
                <div className="flex justify-center mb-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--gold)] via-[var(--gold-dark)] to-[var(--gold-deep)] flex items-center justify-center shadow-[0_8px_20px_-6px_rgba(249,199,68,0.55)]">
                    <Users className="w-7 h-7 text-[var(--navy)]" />
                  </div>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--navy)]">
                  Customer Registration
                </h2>
                <p className="text-gray-500 text-xs sm:text-sm font-medium mt-1">
                  Create your customer account
                </p>
              </div>

              {/* Desktop Header */}
              <div className="hidden lg:block mb-6 lg:mb-8">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[var(--gold)] via-[var(--gold-dark)] to-[var(--gold-deep)] flex items-center justify-center shadow-[0_8px_20px_-6px_rgba(249,199,68,0.55)] flex-shrink-0">
                    <Users className="w-5 h-5 text-[var(--navy)]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold tracking-tight text-[var(--navy)]">
                        Create Customer Account
                      </h2>
                      <span className="text-[10px] font-semibold text-[var(--gold-deep)] bg-[#FFFBEF] px-2 py-0.5 rounded-full border border-[var(--gold)]/30 hidden sm:inline-block">
                        Customer
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm font-medium">
                      Fill in your details to start shopping
                    </p>
                  </div>
                </div>
              </div>

              {/* Error/Success Messages */}
              {formError && (
                <div className="mb-4 bg-red-50/80 backdrop-blur-sm p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-red-200 text-xs sm:text-sm text-red-700 flex items-start gap-2 sm:gap-3 font-medium">
                  <span className="text-base sm:text-lg flex-shrink-0">❌</span>
                  <span className="break-words">{formError}</span>
                </div>
              )}
              {successMessage && (
                <div className="mb-4 bg-green-50/80 backdrop-blur-sm p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-green-200 text-xs sm:text-sm text-green-700 flex items-start gap-2 sm:gap-3 font-medium">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 text-green-600" />
                  <span className="break-words">{successMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                {/* Full Name */}
                <div>
                  <Input
                    label="Full Name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    error={errors.full_name}
                    placeholder="Enter your full name"
                    required
                    className="w-full h-12 sm:h-14 px-4 text-black rounded-xl border-gray-200 focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all duration-200"
                  />
                </div>

                {/* Email */}
                <div>
                  <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    placeholder="Enter your email address"
                    required
                    className="w-full h-12 sm:h-14 px-4 text-black rounded-xl border-gray-200 focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all duration-200"
                  />
                </div>

                {/* Phone - Fixed with label */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <PhoneInput
                    value={formData.phone}
                    onChange={(value) => {
                      setFormData((prev) => ({ ...prev, phone: value }));
                      if (errors.phone) {
                        const newErrors = { ...errors };
                        delete newErrors.phone;
                        setErrors(newErrors);
                      }
                    }}
                    error={errors.phone}
                    placeholder="Enter your phone number"
                    disabled={isPhoneVerified}
                    className="w-full h-12 sm:h-14 px-4 text-black rounded-xl border-gray-200 focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all duration-200"
                  />
                  {isPhoneVerified && verifiedPhone && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Phone number is verified and cannot be changed
                    </p>
                  )}
                </div>

                {/* Country & Company Name - Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Country */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className={`w-full h-12 sm:h-14 px-4 rounded-xl border ${
                        errors.country ? "border-red-500" : "border-gray-200"
                      } focus:outline-none focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent bg-white transition-all text-sm appearance-none text-black`}
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 1rem center",
                        backgroundSize: "1.5rem 1.5rem",
                        paddingRight: "2.5rem",
                      }}
                    >
                      <option value="India">🇮🇳 India</option>
                      <option value="United States">🇺🇸 United States</option>
                      <option value="United Kingdom">🇬🇧 United Kingdom</option>
                      <option value="Canada">🇨🇦 Canada</option>
                      <option value="Australia">🇦🇺 Australia</option>
                      <option value="Germany">🇩🇪 Germany</option>
                      <option value="France">🇫🇷 France</option>
                      <option value="UAE">🇦🇪 UAE</option>
                      <option value="Singapore">🇸🇬 Singapore</option>
                      <option value="Other">🌍 Other</option>
                    </select>
                    {errors.country && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.country}
                      </p>
                    )}
                  </div>

                  {/* Company Name */}
                  <div>
                    <Input
                      label="Company / Business Name"
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleChange}
                      error={errors.company_name}
                      placeholder="Your company name"
                      required
                      className="w-full h-12 sm:h-14 px-4 text-black rounded-xl border-gray-200 focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Terms & Conditions */}
                <div className="space-y-1.5 pt-2">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="terms_condition"
                      checked={formData.terms_condition}
                      onChange={handleChange}
                      className="mt-1 w-4 h-4 rounded border-gray-300 text-[var(--gold)] focus:ring-[var(--gold)] focus:ring-offset-0 transition-all flex-shrink-0"
                    />
                    <span className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      I agree to the{" "}
                      <Link
                        href="/terms"
                        className="text-[var(--gold-deep)] hover:underline font-medium transition-colors"
                      >
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/privacy"
                        className="text-[var(--gold-deep)] hover:underline font-medium transition-colors"
                      >
                        Privacy Policy
                      </Link>
                    </span>
                  </label>
                  {errors.terms_condition && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.terms_condition}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={
                    isLoading || !formData.terms_condition || !tempToken
                  }
                  className="w-full bg-[var(--gold)] hover:bg-[var(--gold-dark)] text-[var(--navy)] font-semibold h-12 sm:h-14 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200 shadow-[0_8px_20px_-6px_rgba(249,199,68,0.5)] hover:shadow-[0_12px_28px_-8px_rgba(249,199,68,0.6)] active:scale-[0.98] text-sm sm:text-base"
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
                      {!tempToken ? "Session Expired" : "Creating Account..."}
                    </>
                  ) : (
                    <>
                      {!tempToken
                        ? "Session Expired"
                        : "Create Customer Account"}
                      {tempToken && <ArrowRight className="w-4 h-4" />}
                    </>
                  )}
                </button>

                {/* Already have an account */}
                <div className="text-center pt-2">
                  <p className="text-xs sm:text-sm text-gray-500 font-medium">
                    Already have an account?{" "}
                    <Link
                      href={ROUTES.auth.customer.login}
                      className="text-[var(--gold-deep)] font-semibold hover:underline transition-colors"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>

                {/* Security Badge */}
                <div className="flex items-center justify-center gap-2 pt-1">
                  <Shield className="w-3.5 h-3.5 text-gray-400" />
                  <p className="text-[10px] sm:text-xs text-gray-400 font-medium">
                    Secure · Your data is protected
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

export default CustomerRegistrationForm;
