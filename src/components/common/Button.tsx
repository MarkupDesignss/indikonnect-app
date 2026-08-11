// src/components/common/Button.tsx

import React from 'react';
import { cn } from '@/lib/utils/constants';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    loading = false,
    className,
    disabled,
    ...props
}) => {
    const baseStyles =
        'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-xl font-sans';

    const variants = {
        primary:
            'bg-[#F9C744] text-[#06101E] hover:bg-[#F0B830] hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 focus:ring-[#F9C744] disabled:bg-[#F9C744]/50 disabled:hover:translate-y-0 disabled:hover:shadow-none',
        secondary:
            'bg-[#06101E] text-white hover:bg-[#0A1A2E] hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 focus:ring-[#06101E] disabled:bg-[#06101E]/50 disabled:hover:translate-y-0 disabled:hover:shadow-none',
        outline:
            'border-2 border-[#06101E] text-[#06101E] hover:bg-[#06101E]/5 hover:-translate-y-0.5 active:translate-y-0 focus:ring-[#06101E]',
        ghost:
            'text-[#06101E] hover:bg-[#06101E]/5 hover:-translate-y-0.5 active:translate-y-0 focus:ring-[#06101E]',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-5 py-2.5 text-black',
        lg: 'px-7 py-3.5 text-lg',
    };

    return (
        <button
            className={cn(
                baseStyles,
                variants[variant],
                sizes[size],
                fullWidth && 'w-full',
                loading && 'opacity-70 cursor-not-allowed hover:translate-y-0 hover:shadow-none',
                className
            )}
            disabled={disabled || loading}
            {...props}
        >
            {loading && (
                <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
            )}
            {children}
        </button>
    );
};