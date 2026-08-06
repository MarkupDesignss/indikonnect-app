'use client';

import React from 'react';

interface PhoneInputProps {
    value: string;
    onChange: (value: string) => void;
    error: string | null;
    readOnly?: boolean;
}

export default function PhoneInput({
    value,
    onChange,
    error,
    readOnly = false
}: PhoneInputProps) {
    return (
        <div className="flex flex-col gap-1.5">
            <label
                htmlFor="loginMobile"
                className="font-['Arimo',sans-serif] text-[12.5px] font-bold text-[#333f48]"
            >
                Mobile number
            </label>
            <div className="flex gap-2">
                <span className="flex-shrink-0 flex items-center px-[13px] border-[1.5px] border-[#ddcf9f] rounded-[11px] font-['Arimo',sans-serif] text-sm font-bold text-[#003da5] bg-[#fff8e6]">
                    +91
                </span>
                <input
                    className={`flex-1 font-['Lato',system-ui] text-[14.5px] px-[13px] py-3 border-[1.5px] rounded-[11px] bg-white text-[#333f48] outline-none w-full transition-all duration-[0.15s] focus:border-[#003da5] focus:shadow-[0_0_0_4px_rgba(0,61,165,0.12)] ${error ? 'border-[#c4432b]' : 'border-[#ddcf9f]'} ${readOnly ? 'bg-[#fff8e6] text-[#5c6771] cursor-not-allowed' : ''}`}
                    type="tel"
                    id="loginMobile"
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    required
                    value={value}
                    onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
                    readOnly={readOnly}
                />
            </div>
            {error && <span className="text-xs text-[#c4432b] font-semibold min-h-[14px]">{error}</span>}
        </div>
    );
}