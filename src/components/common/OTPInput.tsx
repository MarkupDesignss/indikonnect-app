// src/components/common/OTPInput.tsx

import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils/constants';

interface OTPInputProps {
    length?: number;
    value: string;
    onChange: (value: string) => void;
    onComplete?: (value: string) => void;
    error?: string;
    disabled?: boolean;
}

export const OTPInput: React.FC<OTPInputProps> = ({
    length = 6,
    value,
    onChange,
    onComplete,
    error,
    disabled = false,
}) => {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        inputRefs.current = inputRefs.current.slice(0, length);
    }, [length]);

    const handleChange = (index: number, val: string) => {
        const newValue = value.split('');
        newValue[index] = val;
        const newString = newValue.join('');
        onChange(newString);

        if (val && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }

        if (newString.length === length && onComplete) {
            onComplete(newString);
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !value[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text');
        const numericOnly = pasted.replace(/\D/g, '');
        if (numericOnly.length <= length) {
            const newValue = numericOnly.padEnd(length, '');
            onChange(newValue);
            if (newValue.length === length && onComplete) {
                onComplete(newValue);
            }
            const lastIndex = Math.min(numericOnly.length, length - 1);
            inputRefs.current[lastIndex]?.focus();
        }
    };

    useEffect(() => {
        if (inputRefs.current[0] && !disabled) {
            inputRefs.current[0].focus();
        }
    }, [disabled]);

    return (
        <div className="w-full">
            <div className="flex justify-center gap-3">
                {Array.from({ length }, (_, index) => (
                    <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={value[index] || ''}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        disabled={disabled}
                        className={cn(
                            'w-12 h-14 text-center text-xl font-bold rounded-xl border-2 shadow-sm transition-all font-mono',
                            error
                                ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                                : 'border-gray-300 focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20',
                            disabled && 'bg-gray-100 cursor-not-allowed opacity-60',
                            value[index] && 'border-[#F9C744] bg-[#FFF8E1]'
                        )}
                        aria-label={`OTP digit ${index + 1}`}
                    />
                ))}
            </div>
            {error && <p className="mt-2 text-sm text-red-600 text-center font-sans">{error}</p>}
        </div>
    );
};