// lib/utils/constants.ts

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const APP_THEME = {
    primary: '#F9C744',
    secondary: '#06101E',
    white: '#FFFFFF',
};

export const ROUTES = {
    customer: {
        login: '/customer/login',
        register: '/customer/register',
        verifyOTP: '/customer/verify-otp',
        dashboard: '/customer/dashboard',
    },
    distributor: {
        login: '/distributor/login',
        register: '/distributor/register',
        verifyOTP: '/distributor/verify-otp',
        onboarding: '/distributor/onboarding',
        dashboard: '/distributor/dashboard',
    },
};

export const OTP_CONFIG = {
    length: 6,
    expirySeconds: 300,
    resendCooldown: 30,
    maxAttempts: 3,
};