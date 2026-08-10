'use client';

import React, { useEffect, useState } from 'react';
import { CustomerRegistrationForm } from '@/components/customer/Registration/CustomerRegistrationForm';
import { useSearchParams, useRouter } from 'next/navigation';

export default function CustomerRegisterPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [phoneNumber, setPhoneNumber] = useState<string>('');

    useEffect(() => {
        // Try to get phone from URL params first
        let phone = searchParams.get('phone');

        // If not in URL, try localStorage
        if (!phone) {
            phone = localStorage.getItem('verified_phone') || '';
        }

        console.log('Phone from page:', phone);
        setPhoneNumber(phone);

        // If no phone, redirect back to phone input
        if (!phone) {
            router.push('/auth/customer/phone');
        }
    }, [searchParams, router]);

    return <CustomerRegistrationForm phoneNumber={phoneNumber} />;
}