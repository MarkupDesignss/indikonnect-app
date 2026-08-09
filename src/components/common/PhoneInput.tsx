// src/components/common/PhoneInput.tsx

import React, { useState } from 'react';
import { cn } from '@/lib/utils/constants';

interface PhoneInputProps {
    value: string;
    onChange: (value: string) => void;
    error?: string;
    label?: string;
    countryCode?: string;
    className?: string;
    disabled?: boolean;
    placeholder?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
    value,
    onChange,
    error,
    label,
    countryCode = '+91',
    className,
    disabled = false,
    placeholder = '98765 43210',
}) => {
    const [displayValue, setDisplayValue] = useState(value);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const numericValue = e.target.value.replace(/\D/g, '');
        // Limit to 10 digits
        const limitedValue = numericValue.slice(0, 10);
        setDisplayValue(limitedValue);
        onChange(limitedValue);
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const pasted = e.clipboardData.getData('text');
        const numericValue = pasted.replace(/\D/g, '').slice(0, 10);
        setDisplayValue(numericValue);
        onChange(numericValue);
        e.preventDefault();
    };

    const formatDisplay = (value: string) => {
        if (value.length <= 5) return value;
        return `${value.slice(0, 5)} ${value.slice(5)}`;
    };

    return (
        <div className={cn('w-full', className)}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {label} <span className="text-red-500">*</span>
                </label>
            )}
            <div
                className={cn(
                    'flex items-center rounded-xl border overflow-hidden bg-white transition-all duration-200',
                    error
                        ? 'border-red-500 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/20'
                        : 'border-gray-200 focus-within:border-[#F9C744] focus-within:ring-2 focus-within:ring-[#F9C744]/20'
                )}
            >
                <div className="font-mono text-sm font-medium px-4 py-3 border-r border-gray-200 bg-gray-50 text-[#06101E] whitespace-nowrap min-w-[50px] text-center">
                    {countryCode}
                </div>
                <input
                    type="tel"
                    value={displayValue}
                    onChange={handleChange}
                    onPaste={handlePaste}
                    placeholder={placeholder}
                    maxLength={10}
                    disabled={disabled}
                    className={cn(
                        'font-mono flex-1 px-4 py-3 text-sm outline-none bg-transparent text-[#06101E] placeholder:text-gray-300',
                        'min-w-0 w-full',
                        disabled && 'opacity-60 cursor-not-allowed'
                    )}
                />
            </div>
            {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
        </div>
    );
};

export default PhoneInput;