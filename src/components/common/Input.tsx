// src/components/common/Input.tsx

import React from 'react';
import { cn } from '@/lib/utils/constants';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    className,
    id,
    ...props
}) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
        <div className="w-full">
            {label && (
                <label htmlFor={inputId} className="block text-sm font-medium text-[#06101E] mb-1.5 font-sans">
                    {label}
                </label>
            )}
            <div className="relative">
                {leftIcon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        {leftIcon}
                    </div>
                )}
                <input
                    id={inputId}
                    className={cn(
                        'block w-full rounded-xl border-gray-300 shadow-sm focus:border-[#F9C744] focus:ring-4 focus:ring-[#F9C744]/20 sm:text-sm font-sans transition-all',
                        error && 'border-red-300 focus:border-red-500 focus:ring-red-500/20',
                        leftIcon && 'pl-10',
                        rightIcon && 'pr-10',
                        className
                    )}
                    {...props}
                />
                {rightIcon && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">{rightIcon}</div>
                )}
            </div>
            {error && <p className="mt-1.5 text-sm text-red-600 font-sans">{error}</p>}
            {helperText && !error && <p className="mt-1.5 text-sm text-gray-500 font-sans">{helperText}</p>}
        </div>
    );
};