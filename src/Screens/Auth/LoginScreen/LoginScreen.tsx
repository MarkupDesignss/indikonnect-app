'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from "../../../lib/store/hook";
import {
    setMobile,
    setTimer,
    clearError,
    setView,
    setOTPSent,
    setError,
    setRegistrationData,
} from "@/lib/store/features/auth/authSlice";
import {
    useSendOTPMutation,
    useVerifyOTPMutation,
    useLoginMutation,
    useVerifyLoginOTPMutation,
} from "@/lib/api/endpoints/authApi";
import PhoneInput from "./PhoneInput";
import OTPInput from "./OTPInput";

export default function LoginScreen() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { phoneNumber, view, timer, error } = useAppSelector((state) => state.auth);
    const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
    const [sendOTP, { isLoading: isSending }] = useSendOTPMutation();
    const [verifyOTP, { isLoading: isVerifying }] = useVerifyOTPMutation();
    const [login, { isLoading: isLoggingIn }] = useLoginMutation();
    const [verifyLoginOTP, { isLoading: isVerifyingLogin }] = useVerifyLoginOTPMutation();

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timer > 0) {
            interval = setInterval(() => {
                dispatch(setTimer(timer - 1));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer, dispatch]);

    const handleSendOTPForRegistration = async () => {
        if (!phoneNumber || phoneNumber.length < 10) {
            dispatch(setError('Please enter a valid 10-digit mobile number'));
            return;
        }

        try {
            dispatch(clearError());
            const fullPhoneNumber = `+91${phoneNumber}`;
            const response = await sendOTP({ phone: fullPhoneNumber }).unwrap();
            console.log('OTP sent successfully:', response);

            if (response.status) {
                dispatch(setOTPSent(true));
                dispatch(setView('otp'));
                dispatch(setTimer(60));
                dispatch(clearError());
                setOtp(['', '', '', '', '', '']);
            } else {
                dispatch(setError(response.message || 'Failed to send OTP'));
            }
        } catch (err: any) {
            console.error('Send OTP error:', err);
            dispatch(setError(err?.data?.message || 'Failed to send OTP. Please try again.'));
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        const otpValue = otp.join('');

        if (otpValue.length < 6) {
            dispatch(setError('Please enter the complete 6-digit OTP'));
            return;
        }

        try {
            dispatch(clearError());
            const fullPhoneNumber = `+91${phoneNumber}`;
            const response = await verifyOTP({
                phone: fullPhoneNumber,
                otp: otpValue,
            }).unwrap();

            console.log('OTP verification response:', response);

            if (response.status && response.temp_token) {
                dispatch(clearError());
                // Store temp token and proceed to registration
                router.push('/register');
            } else {
                dispatch(setError(response.message || 'Invalid OTP. Please try again.'));
                setOtp(['', '', '', '', '', '']);
            }
        } catch (err: any) {
            console.error('Verify OTP error:', err);
            const errorMessage = err?.data?.message || 'OTP verification failed. Please try again.';
            dispatch(setError(errorMessage));
            setOtp(['', '', '', '', '', '']);
        }
    };

    const handleLogin = async () => {
        if (!phoneNumber || phoneNumber.length < 10) {
            dispatch(setError('Please enter a valid 10-digit mobile number'));
            return;
        }

        try {
            dispatch(clearError());
            const fullPhoneNumber = `+91${phoneNumber}`;
            const response = await login({ phone: fullPhoneNumber }).unwrap();
            console.log('Login response:', response);

            if (response.status) {
                // OTP sent for login, show OTP input
                dispatch(setView('otp'));
                dispatch(setTimer(60));
                dispatch(setOTPSent(true));
                dispatch(clearError());
                setOtp(['', '', '', '', '', '']);
            } else {
                dispatch(setError(response.message || 'Login failed. Please try again.'));
            }
        } catch (err: any) {
            console.error('Login error:', err);
            dispatch(setError(err?.data?.message || 'Login failed. Please try again.'));
        }
    };

    const handleVerifyLoginOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        const otpValue = otp.join('');

        if (otpValue.length < 6) {
            dispatch(setError('Please enter the complete 6-digit OTP'));
            return;
        }

        try {
            dispatch(clearError());
            const fullPhoneNumber = `+91${phoneNumber}`;
            const response = await verifyLoginOTP({
                phone: fullPhoneNumber,
                otp: otpValue,
            }).unwrap();

            console.log('Login OTP verification response:', response);

            if (response.status && response.user && response.token) {
                dispatch(clearError());
                router.push('/dashboard');
            } else {
                dispatch(setError(response.message || 'Invalid OTP. Please try again.'));
                setOtp(['', '', '', '', '', '']);
            }
        } catch (err: any) {
            console.error('Verify Login OTP error:', err);
            const errorMessage = err?.data?.message || 'OTP verification failed. Please try again.';
            dispatch(setError(errorMessage));
            setOtp(['', '', '', '', '', '']);
        }
    };

    const handleResendOTP = async () => {
        dispatch(clearError());
        setOtp(['', '', '', '', '', '']);
        await handleSendOTPForRegistration();
    };

    const handleResendLoginOTP = async () => {
        dispatch(clearError());
        setOtp(['', '', '', '', '', '']);
        await handleLogin();
    };

    const handlePhoneChange = (value: string) => {
        dispatch(setMobile(value));
        dispatch(clearError());
    };

    const handleBackToPhone = () => {
        dispatch(setView('login'));
        dispatch(setOTPSent(false));
        dispatch(clearError());
        setOtp(['', '', '', '', '', '']);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        {view === 'login' ? 'Sign in with Phone' : 'Verify OTP'}
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        {view === 'login'
                            ? 'Enter your mobile number to receive an OTP'
                            : `Enter the 6-digit OTP sent to +91 ${phoneNumber}`}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                        {error}
                    </div>
                )}

                {view === 'login' ? (
                    <div className="mt-8 space-y-6">
                        <PhoneInput
                            value={phoneNumber || ''}
                            onChange={handlePhoneChange}
                            error={error}
                            readOnly={isSending || isLoggingIn}
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={handleLogin}
                                disabled={isLoggingIn || !phoneNumber || phoneNumber.length < 10}
                                className="flex-1 py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoggingIn ? 'Sending OTP...' : 'Login'}
                            </button>
                            <button
                                onClick={handleSendOTPForRegistration}
                                disabled={isSending || !phoneNumber || phoneNumber.length < 10}
                                className="flex-1 py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSending ? 'Sending...' : 'Register'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="mt-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <button
                                onClick={handleBackToPhone}
                                disabled={isVerifying || isVerifyingLogin}
                                className="text-sm text-indigo-600 hover:text-indigo-500 font-medium disabled:opacity-50"
                            >
                                ← Change phone number
                            </button>
                            <span className="text-sm text-gray-500">
                                +91 {phoneNumber}
                            </span>
                        </div>

                        <OTPInput
                            otp={otp}
                            setOtp={setOtp}
                            error={error}
                            timer={timer}
                            onResend={handleResendOTP}
                            isSubmitting={isVerifying || isVerifyingLogin}
                            onSubmit={handleVerifyOTP}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}