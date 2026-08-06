'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface SuccessScreenProps {
    type: 'customer' | 'distributor';
    title: string;
    message: string;
    badgeText?: string;
    buttonText?: string;
}

export default function SuccessScreen({
    type,
    title,
    message,
    badgeText,
    buttonText = 'Go to dashboard'
}: SuccessScreenProps) {
    const router = useRouter();

    return (
        <div className="flex flex-col items-start gap-3.5 pt-2 animate-[riseIn_0.45s_var(--ease-out)_both]">
            <div className={`w-14 h-14 rounded-[16px] flex items-center justify-center ${type === 'customer' ? 'bg-[#e4f5ec]' : 'bg-[#fff8e6]'}`}>
                {type === 'customer' ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" width="26" height="26" className="text-[#1f8a56]">
                        <path d="M20 6L9 17l-5-5" />
                    </svg>
                ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" width="26" height="26" className="text-[#e2a30f]">
                        <path d="M12 8v4l3 3" />
                        <circle cx="12" cy="12" r="9" />
                    </svg>
                )}
            </div>

            {badgeText && (
                <span className="font-['Arimo',sans-serif] text-[11.5px] font-extrabold uppercase bg-[#fff8e6] text-[#e2a30f] px-[11px] py-[5px] rounded-full mt-2.5">
                    {badgeText}
                </span>
            )}

            <h2 className="font-['Arimo',sans-serif] text-[27px] font-extrabold mt-2.5 tracking-[-0.01em]">
                {title}
            </h2>

            <p className="text-sm text-[#7a7561] mb-2.5 leading-[1.55]">
                {message}
            </p>

            <button
                type="button"
                className="font-['Arimo',sans-serif] text-[14.5px] font-bold px-[22px] py-[14px] rounded-[11px] border-none cursor-pointer transition-all duration-[0.18s] bg-[#003da5] text-[#fff9ea] shadow-[0_10px_22px_-10px_rgba(0,42,115,0.55)] hover:bg-[#0048bd] hover:-translate-y-px hover:shadow-[0_14px_26px_-10px_rgba(0,42,115,0.6)] active:translate-y-0 active:scale-[0.99]"
                onClick={() => router.push('/')}
            >
                {buttonText}
            </button>
        </div>
    );
}