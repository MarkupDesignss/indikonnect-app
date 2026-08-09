// app/(auth)/customer/login/page.tsx

'use client';

import React, { useState } from 'react';
import { CustomerLoginForm } from '../../../../components/customer/Login/CustomerLoginForm';
import { CustomerOTPVerification } from '../../../../components/customer/Login/CustomerOTPVerification';

export default function CustomerLoginPage() {
    const [step, setStep] = useState<'login' | 'verify'>('login');
    const [phoneNumber, setPhoneNumber] = useState('');

    const handleOTPSent = (phone: string) => {
        setPhoneNumber(phone);
        setStep('verify');
    };

    const handleBack = () => {
        setStep('login');
        setPhoneNumber('');
    };

    return step === 'login' ? (
        <CustomerLoginForm onOTPSent={handleOTPSent} />
    ) : (
        <CustomerOTPVerification phoneNumber={phoneNumber} onBack={handleBack} />
    );
}