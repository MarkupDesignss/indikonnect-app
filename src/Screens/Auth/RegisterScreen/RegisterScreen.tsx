'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '../../../lib/store/hook';
import { setTab, resetRegistration, updateFormData } from '../../../lib/store/features/registration/registrationSlice';

import { setView } from '@/lib/store/features/auth/authSlice';
import ContextPanel from '../LoginScreen/ContextPanel';
import CustomerRegistration from './CustomerRegistration';
import DistributorRegistration from './DistributorRegistration';
import RegistrationBanner from './RegistrationBanner';

export default function RegistrationForm() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { tab, customerSuccess, distributorSuccess } = useAppSelector(
        (state) => state.registration
    );
    const { phoneNumber, tempToken, isAuthenticated } = useAppSelector((state) => state.auth);

    // Redirect if no temp token or already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            router.push('/dashboard');
        }
        if (!tempToken && !isAuthenticated) {
            // No temp token, go back to login
            dispatch(setView('login'));
        }
    }, [tempToken, isAuthenticated, router, dispatch]);

    const handleViewChange = (view: 'login') => {
        dispatch(resetRegistration());
        dispatch(setView('login'));
    };

    const maskMobile = (num: string) => {
        if (!num) return '';
        return num.slice(0, 5) + '•••••' + num.slice(-2);
    };

    if (customerSuccess || distributorSuccess) {
        return (
            <div className="grid grid-cols-[0.86fr_1.14fr] gap-0 bg-white border border-[#ebe2c9] rounded-[22px] shadow-card overflow-hidden min-h-[660px] animate-[riseIn_0.55s_var(--ease-out)_both] max-[860px]:grid-cols-1">
                <ContextPanel
                    tab={tab}
                    onSwitchTab={(newTab) => dispatch(setTab(newTab))}
                    onViewChange={handleViewChange}
                />
                <div className="p-[46px_44px_40px] flex flex-col max-[520px]:p-[30px_22px_36px]">
                    {/* Success content would be rendered here */}
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-[0.86fr_1.14fr] gap-0 bg-white border border-[#ebe2c9] rounded-[22px] shadow-card overflow-hidden min-h-[660px] animate-[riseIn_0.55s_var(--ease-out)_both] max-[860px]:grid-cols-1">
            <ContextPanel
                tab={tab}
                onSwitchTab={(newTab) => dispatch(setTab(newTab))}
                onViewChange={handleViewChange}
            />

            <div className="p-[46px_44px_40px] flex flex-col max-[520px]:p-[30px_22px_36px]">
                <div className="flex-1 flex flex-col">
                    <RegistrationBanner mobile={phoneNumber || ''} maskMobile={maskMobile} />

                    {tab === 'customer' ? (
                        <CustomerRegistration />
                    ) : (
                        <DistributorRegistration />
                    )}
                </div>
            </div>
        </div>
    );
}