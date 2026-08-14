// components/distributor/Login/ForgotPasswordModal.tsx

"use client";

import React, { useState, useEffect } from "react";
import { X, Mail, Key, Lock, Eye, EyeOff, CheckCircle, ArrowLeft } from "lucide-react";
import { Input } from "@/components/common/Input";
import {
    useForgotPasswordMutation,
    useVerifyResetOTPMutation,
    useResetPasswordMutation
} from "../../../lib/redux/api/distributor/distributorauthApis";

interface ForgotPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

type Step = "email" | "otp" | "reset";

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
}) => {
    // Step management
    const [currentStep, setCurrentStep] = useState<Step>("email");

    // Form data
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // UI states
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [otpTimer, setOtpTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);

    // API hooks
    const [forgotPassword, { isLoading: isEmailLoading }] = useForgotPasswordMutation();
    const [verifyResetOTP, { isLoading: isOtpLoading }] = useVerifyResetOTPMutation();
    const [resetPassword, { isLoading: isResetLoading }] = useResetPasswordMutation();

    // Timer for OTP resend
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (currentStep === "otp" && otpTimer > 0) {
            interval = setInterval(() => {
                setOtpTimer((prev) => prev - 1);
            }, 1000);
        } else if (otpTimer === 0) {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [currentStep, otpTimer]);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setCurrentStep("email");
            setEmail("");
            setOtp("");
            setPassword("");
            setConfirmPassword("");
            setError(null);
            setSuccess(null);
            setOtpTimer(60);
            setCanResend(false);
        }
    }, [isOpen]);

    // Handle modal close
    const handleClose = () => {
        if (!isEmailLoading && !isOtpLoading && !isResetLoading) {
            onClose();
        }
    };

    // Step 1: Send OTP
    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Please enter a valid email address");
            return;
        }

        try {
            const response = await forgotPassword({ email }).unwrap();

            if (response.status === true) {
                setSuccess(response.message || "OTP sent to your email");
                setCurrentStep("otp");
                setOtpTimer(60);
                setCanResend(false);

                // Pre-fill OTP if it's in response (for testing)
                if (response.otp) {
                    setOtp(String(response.otp));
                }
            } else {
                setError(response.message || "Failed to send OTP. Please try again.");
            }
        } catch (err: any) {
            setError(err.data?.message || err.message || "Network error. Please try again.");
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!otp || otp.length < 4) {
            setError("Please enter a valid OTP");
            return;
        }

        try {
            const response = await verifyResetOTP({
                email,
                otp: Number(otp)
            }).unwrap();

            if (response.status === true) {
                setSuccess(response.message || "OTP verified successfully");
                setCurrentStep("reset");
            } else {
                setError(response.message || "Invalid OTP. Please try again.");
            }
        } catch (err: any) {
            setError(err.data?.message || err.message || "Network error. Please try again.");
        }
    };

    // Step 3: Reset Password
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!password || password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            const response = await resetPassword({
                email,
                password,
                password_confirmation: confirmPassword,
            }).unwrap();

            if (response.status === true) {
                setSuccess(response.message || "Password reset successfully");

                // Close modal after success
                setTimeout(() => {
                    if (onSuccess) onSuccess();
                    handleClose();
                }, 2000);
            } else {
                setError(response.message || "Failed to reset password. Please try again.");
            }
        } catch (err: any) {
            setError(err.data?.message || err.message || "Network error. Please try again.");
        }
    };

    // Resend OTP
    const handleResendOTP = async () => {
        setError(null);
        setSuccess(null);
        setCanResend(false);
        setOtpTimer(60);

        try {
            const response = await forgotPassword({ email }).unwrap();

            if (response.status === true) {
                setSuccess("New OTP sent to your email");
                if (response.otp) {
                    setOtp(String(response.otp));
                }
            } else {
                setError(response.message || "Failed to resend OTP");
                setCanResend(true);
            }
        } catch (err: any) {
            setError(err.data?.message || err.message || "Network error");
            setCanResend(true);
        }
    };

    // Go back to previous step
    const goBack = () => {
        if (currentStep === "otp") {
            setCurrentStep("email");
            setError(null);
            setSuccess(null);
        } else if (currentStep === "reset") {
            setCurrentStep("otp");
            setError(null);
            setSuccess(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-md w-full mx-4 p-6 shadow-2xl relative animate-in slide-in-from-bottom-4 duration-300">
                {/* Close Button */}
                <button
                    type="button"
                    onClick={handleClose}
                    disabled={isEmailLoading || isOtpLoading || isResetLoading}
                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100 p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        {currentStep !== "email" && (
                            <button
                                type="button"
                                onClick={goBack}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                        )}
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F9C744] to-[#E6B33D] flex items-center justify-center shadow-[0_8px_20px_-6px_rgba(249,199,68,0.4)]">
                            {currentStep === "email" && <Mail className="w-6 h-6 text-[#06101E]" />}
                            {currentStep === "otp" && <Key className="w-6 h-6 text-[#06101E]" />}
                            {currentStep === "reset" && <Lock className="w-6 h-6 text-[#06101E]" />}
                        </div>
                    </div>
                    <h2 className="text-xl font-bold text-[#06101E]">
                        {currentStep === "email" && "Forgot Password"}
                        {currentStep === "otp" && "Verify OTP"}
                        {currentStep === "reset" && "Reset Password"}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                        {currentStep === "email" && "Enter your email to receive a password reset OTP"}
                        {currentStep === "otp" && `Enter the OTP sent to ${email}`}
                        {currentStep === "reset" && "Create a new password for your account"}
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 bg-red-50 p-3 rounded-xl border border-red-200 text-sm text-red-700 flex items-start gap-2">
                        <span className="text-lg flex-shrink-0">❌</span>
                        <span>{error}</span>
                    </div>
                )}

                {/* Success Message */}
                {success && (
                    <div className="mb-4 bg-green-50 p-3 rounded-xl border border-green-200 text-sm text-green-700 flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-500" />
                        <span>{success}</span>
                    </div>
                )}

                {/* Step 1: Email */}
                {currentStep === "email" && (
                    <form onSubmit={handleSendOTP} className="space-y-4">
                        <Input
                            label="Email Address"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="john@example.com"
                            required
                            className="w-full h-12 px-4 text-black rounded-xl border-gray-200 focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200"
                            autoComplete="email"
                        />

                        <button
                            type="submit"
                            disabled={isEmailLoading}
                            className="w-full bg-[#F9C744] hover:bg-[#E6B33D] text-[#06101E] font-semibold h-12 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200 shadow-[0_4px_12px_-4px_rgba(249,199,68,0.4)] hover:shadow-[0_8px_20px_-6px_rgba(249,199,68,0.5)]"
                        >
                            {isEmailLoading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Sending...
                                </>
                            ) : (
                                "Send OTP →"
                            )}
                        </button>
                    </form>
                )}

                {/* Step 2: OTP */}
                {currentStep === "otp" && (
                    <form onSubmit={handleVerifyOTP} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Enter OTP
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                    placeholder="Enter 6-digit OTP"
                                    className="flex-1 h-12 px-4 text-black rounded-xl border border-gray-200 focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200 outline-none"
                                    maxLength={6}
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">
                                {canResend ? (
                                    <button
                                        type="button"
                                        onClick={handleResendOTP}
                                        className="text-[#F9C744] hover:text-[#E6B33D] font-medium transition-colors"
                                    >
                                        Resend OTP
                                    </button>
                                ) : (
                                    `Resend OTP in ${otpTimer}s`
                                )}
                            </span>
                            <button
                                type="button"
                                onClick={() => setCurrentStep("email")}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                Change Email
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={isOtpLoading || !otp || otp.length < 4}
                            className="w-full bg-[#F9C744] hover:bg-[#E6B33D] text-[#06101E] font-semibold h-12 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200 shadow-[0_4px_12px_-4px_rgba(249,199,68,0.4)] hover:shadow-[0_8px_20px_-6px_rgba(249,199,68,0.5)]"
                        >
                            {isOtpLoading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Verifying...
                                </>
                            ) : (
                                "Verify OTP →"
                            )}
                        </button>
                    </form>
                )}

                {/* Step 3: Reset Password */}
                {currentStep === "reset" && (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div className="relative">
                            <Input
                                label="New Password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter new password"
                                required
                                className="w-full h-12 px-4 text-black rounded-xl border-gray-200 focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200 pr-12"
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-[46px] text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>

                        <div className="relative">
                            <Input
                                label="Confirm Password"
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                required
                                className="w-full h-12 px-4 text-black rounded-xl border-gray-200 focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200 pr-12"
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-[46px] text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>

                        <div className="text-xs text-gray-400 space-y-1">
                            <p>Password must be at least 8 characters</p>
                            <p>Include uppercase, lowercase, number, and special character</p>
                        </div>

                        <button
                            type="submit"
                            disabled={isResetLoading || !password || !confirmPassword || password.length < 8 || password !== confirmPassword}
                            className="w-full bg-[#F9C744] hover:bg-[#E6B33D] text-[#06101E] font-semibold h-12 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200 shadow-[0_4px_12px_-4px_rgba(249,199,68,0.4)] hover:shadow-[0_8px_20px_-6px_rgba(249,199,68,0.5)]"
                        >
                            {isResetLoading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Resetting...
                                </>
                            ) : (
                                "Reset Password →"
                            )}
                        </button>
                    </form>
                )}

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                    <p className="text-xs text-gray-400">
                        {currentStep === "email" && "Enter your registered email to receive a password reset link"}
                        {currentStep === "otp" && "Check your email for the OTP code"}
                        {currentStep === "reset" && "Create a strong password for your account"}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordModal;