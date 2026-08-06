'use client';

import React from 'react';

interface RegistrationBannerProps {
    mobile: string;
    maskMobile: (num: string) => string;
}

export default function RegistrationBanner({ mobile, maskMobile }: RegistrationBannerProps) {
    return (
        <div className="bg-[#e4f5ec] border border-[#1f8a56] rounded-[18px] p-3 mb-5 flex items-center gap-2.5 text-[13px] text-[#333f48] animate-[riseIn_0.4s_var(--ease-out)_both]">
            <svg className="flex-shrink-0 text-[#1f8a56]" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>
                Mobile number <strong>+91 {maskMobile(mobile || '9876543210')}</strong> has been verified via OTP
            </span>
        </div>
    );
}