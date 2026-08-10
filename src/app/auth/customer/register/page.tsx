'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { CustomerRegistrationForm } from '@/components/customer/Registration/CustomerRegistrationForm';
import { useSearchParams, useRouter } from 'next/navigation';

function CustomerRegisterContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [phoneNumber, setPhoneNumber] = useState('');

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

export default function CustomerRegisterPage() {
    return (
        <Suspense fallback={<div>Loading registration...</div>}>
            <CustomerRegisterContent />
        </Suspense>
    );
}