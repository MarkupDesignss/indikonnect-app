// app/(auth)/customer/register/page.tsx

'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { CustomerRegistrationForm } from '@/components/customer/Registration/CustomerRegistrationForm';
import { useSearchParams, useRouter } from 'next/navigation';
import { TokenManager } from '@/lib/redux/api/baseApi';

function CustomerRegisterContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if user is already authenticated
        const token = TokenManager.getAccessToken();
        const refreshToken = TokenManager.getRefreshToken();

        if (token && refreshToken) {
            // Already logged in, redirect to home
            router.replace('/');
            return;
        }

        // Try to get phone from URL params first
        let phone = searchParams.get('phone');

        // If not in URL, try localStorage
        if (!phone) {
            phone = localStorage.getItem('verified_phone') || '';
        }

        // If still no phone, try sessionStorage
        if (!phone) {
            phone = sessionStorage.getItem('verified_phone') || '';
        }

        // Also check for temp token to verify the user came from OTP flow
        const tempToken = localStorage.getItem('temp_token') || sessionStorage.getItem('temp_token') || '';

        console.log('📱 Phone from page:', phone);
        console.log('🔑 Temp token:', tempToken);

        // If no phone OR no temp token, redirect to login (not phone input)
        if (!phone || !tempToken) {
            console.log('❌ Missing phone or temp token - redirecting to login');
            // Clear any stale data
            localStorage.removeItem('verified_phone');
            localStorage.removeItem('temp_token');
            sessionStorage.removeItem('verified_phone');
            sessionStorage.removeItem('temp_token');
            router.replace('/auth/customer/login');
            return;
        }

        setPhoneNumber(phone);
        setIsLoading(false);
    }, [searchParams, router]);

    // Handle back to login
    const handleBack = () => {
        // Clear temporary data
        if (typeof window !== 'undefined') {
            localStorage.removeItem('temp_token');
            localStorage.removeItem('verified_phone');
            localStorage.removeItem('customer_otp');
            localStorage.removeItem('customer_phone');
            sessionStorage.removeItem('temp_token');
            sessionStorage.removeItem('verified_phone');
            sessionStorage.removeItem('customer_phone');
        }
        router.push('/auth/customer/login');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FAF8F4]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-[#F9C744] border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-500 text-sm font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <CustomerRegistrationForm
            phoneNumber={phoneNumber}
            onBack={handleBack}
        />
    );
}

export default function CustomerRegisterPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#FAF8F4]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-[#F9C744] border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-500 text-sm font-medium">Loading registration...</p>
                </div>
            </div>
        }>
            <CustomerRegisterContent />
        </Suspense>
    );
}