"use client";

import React, { useState } from "react";
import { PhoneInput } from "@/components/common/PhoneInput";
import { Button } from "@/components/common/Button";
import { Logo } from "@/components/common/Logo";
import { useSendOTPMutation } from "@/lib/redux/api/authApi";

interface CustomerLoginFormProps {
    onOTPSent?: (phoneNumber: string) => void;
}

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

export const CustomerLoginForm: React.FC<CustomerLoginFormProps> = ({
    onOTPSent,
}) => {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [error, setError] = useState<string | null>(null);

    // RTK Query mutation
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
            const result = await sendOTP({ phone: cleanPhone }).unwrap();

            if (result.status === true) {
                // Call onOTPSent callback to switch to OTP verification
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

    return (
        <div className="min-h-screen w-full bg-[#FAF8F4] flex flex-col lg:flex-row">
            {/* Left Panel - Hidden on mobile */}
            <div className="hidden lg:flex lg:w-1/2 min-h-screen bg-[#0F2038] relative overflow-hidden flex-col justify-between p-10">
                <div
                    className="absolute inset-0 opacity-5"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle at 30% 40%, #F9C744 1px, transparent 1px)",
                        backgroundSize: "30px 30px",
                    }}
                />

                <div className="absolute -right-20 -top-20 w-96 h-96 opacity-60">
                    <RouteMotif />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/10 p-2 rounded-lg">
                            <Logo width={28} height={28} showText={false} />
                        </div>
                        <span className="text-white/40 text-xs tracking-widest">
                            NETWORK
                        </span>
                    </div>
                </div>

                <div className="relative z-10 max-w-sm">
                    <div className="w-10 h-0.5 bg-[#F9C744] mb-6" />
                    <h2 className="text-white text-3xl font-semibold leading-tight">
                        Every order.
                        <br />
                        <span className="text-[#F9C744]">Every route.</span>
                        <br />
                        One network.
                    </h2>
                    <p className="text-[#8291A6] text-sm mt-4 leading-relaxed">
                        Track deliveries, reorder in seconds, and stay connected to your
                        network

                    </p>
                </div>

                <div className="relative z-10 flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#F9C744]" />
                        <span className="text-[#5C6B80]">Trusted by 12,000+ retailers</span>
                    </div>
                    <span className="text-[#5C6B80]">99.9% uptime</span>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="flex-1 min-h-screen flex items-center justify-center px-4 py-8 lg:py-0">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex justify-center mb-8">
                        <Logo width={40} height={40} showText={false} />
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                        <div className="mb-6">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-[#B98F1E] text-xs font-semibold tracking-widest">
                                    CUSTOMER LOGIN
                                </span>
                                <div className="flex-1 h-px bg-gradient-to-r from-[#F9C744]/30 to-transparent" />
                            </div>
                            <h1 className="text-2xl font-semibold text-[#06101E]">
                                Welcome back
                            </h1>
                            <p className="text-gray-500 text-sm mt-1">
                                Enter your registered phone number to continue.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <PhoneInput
                                label="Phone Number"
                                value={phoneNumber}
                                onChange={setPhoneNumber}
                                error={error || undefined}
                                placeholder="Enter your 10-digit number"
                            />

                            {error && <p className="text-red-500 text-xs -mt-3">{error}</p>}

                            <Button
                                type="submit"
                                fullWidth
                                loading={isLoading}
                                disabled={
                                    !phoneNumber || phoneNumber.replace(/\D/g, "").length < 10
                                }
                                className="h-14 text-base bg-gradient-to-r from-[#F9C744] to-[#E6B33D] hover:from-[#E6B33D] hover:to-[#D4A22E] text-[#06101E] font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-[#F9C744]/40 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Send OTP
                            </Button>

                            <p className="text-center text-xs text-gray-400 pt-2">
                                Track, reorder, and manage your distribution from our platform.
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerLoginForm;
