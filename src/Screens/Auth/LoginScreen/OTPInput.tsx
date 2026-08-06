'use client';

import React, { useRef, useEffect } from 'react';

interface OTPInputProps {
    otp: string[];
    setOtp: (otp: string[]) => void;
    error: string | null;
    timer: number;
    onResend: () => void;
    isSubmitting: boolean;
    onSubmit: (e: React.FormEvent) => void;
}

export default function OTPInput({
    otp,
    setOtp,
    error,
    timer,
    onResend,
    isSubmitting,
    onSubmit,
}: OTPInputProps) {
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (otp.every(digit => digit === '')) {
            setTimeout(() => otpRefs.current[0]?.focus(), 100);
        }
    }, [otp]);

    const handleOtpChange = (index: number, value: string) => {
        const val = value.replace(/\D/g, '').slice(-1);
        const newOtp = [...otp];
        newOtp[index] = val;
        setOtp(newOtp);

        if (val && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (!pasteData) return;

        const newOtp = [...otp];
        pasteData.split('').forEach((char, i) => {
            if (i < 6) newOtp[i] = char;
        });
        setOtp(newOtp);
        const nextIndex = Math.min(pasteData.length, 5);
        otpRefs.current[nextIndex]?.focus();
    };

    return (
        <div className="mt-1">
            <div className="flex flex-col gap-1.5">
                <label className="font-['Arimo',sans-serif] text-[12.5px] font-bold text-[#333f48]">
                    Enter OTP
                </label>
                <div className="flex gap-2" onPaste={handlePaste}>
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={el => (otpRefs.current[index] = el)}
                            className={`w-11 h-13 text-center font-['Arimo',sans-serif] text-xl font-bold border-[1.5px] border-[#ddcf9f] rounded-[11px] text-[#002a73] outline-none transition-all duration-[0.15s] focus:border-[#003da5] focus:shadow-[0_0_0_4px_rgba(0,61,165,0.12)] focus:-translate-y-px ${digit ? 'border-[#003da5] bg-[#fff8e6]' : ''}`}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        />
                    ))}
                </div>
                {error && <span className="text-xs text-[#c4432b] font-semibold min-h-[14px]">{error}</span>}
                <span className="text-[11.5px] text-[#7a7561] mt-1 block">
                    <button
                        type="button"
                        onClick={onResend}
                        disabled={timer > 0 || isSubmitting}
                        className={`bg-none border-none font-['Arimo',sans-serif] font-bold text-xs p-0 underline ${timer > 0 ? 'text-gray-500 cursor-not-allowed' : 'text-[#003da5] cursor-pointer'}`}
                    >
                        Resend OTP
                    </button>
                    {timer > 0 && (
                        <span className="text-[11.5px] text-[#7a7561] ml-2">
                            ({timer}s)
                        </span>
                    )}
                </span>
            </div>
            <div className="flex gap-2.5 mt-3 items-center">
                <button
                    type="submit"
                    className="flex-1 font-['Arimo',sans-serif] text-[14.5px] font-bold px-[22px] py-[14px] rounded-[11px] border-none cursor-pointer transition-all duration-[0.18s] bg-[#003da5] text-[#fff9ea] shadow-[0_10px_22px_-10px_rgba(0,42,115,0.55)] hover:bg-[#0048bd] hover:-translate-y-px hover:shadow-[0_14px_26px_-10px_rgba(0,42,115,0.6)] active:translate-y-0 active:scale-[0.99] disabled:bg-[#ddcf9f] disabled:text-white disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
                    disabled={isSubmitting || otp.some(digit => digit === '')}
                    onClick={onSubmit}
                >
                    {isSubmitting ? "Verifying..." : "Verify & continue"}
                </button>
            </div>
        </div>
    );
}