'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../../../lib/store/hook';
import {
    updateFormData,
} from '../../../lib/store/features/registration/registrationSlice';
import { useConfirmRegistrationMutation } from '@/lib/api/endpoints/authApi';
import { setError, clearError } from '@/lib/store/features/auth/authSlice';

export default function CustomerRegistration() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { formData } = useAppSelector((state) => state.registration);
    const { phoneNumber, tempToken, error } = useAppSelector((state) => state.auth);
    const [confirmRegistration, { isLoading }] = useConfirmRegistrationMutation();
    const [localError, setLocalError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);
        dispatch(clearError());

        if (!formData.fullName || !formData.email) {
            setLocalError('Please fill in all required fields');
            return;
        }

        if (!tempToken) {
            setLocalError('Session expired. Please verify OTP again.');
            return;
        }

        try {
            const response = await confirmRegistration({
                phone: `+91${phoneNumber}`,
                temp_token: tempToken,
                full_name: formData.fullName,
                email: formData.email,
                country: 'India',
                account_type: 'customer',
                terms_condition: '1',
                company_name: formData.companyName || '',
            }).unwrap();

            console.log('Registration successful:', response);

            if (response.status) {
                router.push('/dashboard');
            } else {
                setLocalError(response.message || 'Registration failed');
            }
        } catch (err: any) {
            console.error('Registration error:', err);
            setLocalError(err?.data?.message || 'Registration failed. Please try again.');
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;
        dispatch(updateFormData({ [name]: val }));
    };

    return (
        <div className="flex flex-col gap-[18px]">
            <div>
                <h1 className="font-['Arimo',sans-serif] text-[27px] font-extrabold m-0 mb-1.5 tracking-[-0.01em]">
                    Create your customer account
                </h1>
                <p className="text-sm text-[#7a7561] m-0 mb-7 leading-[1.55]">
                    Your mobile is verified. Fill in your details to complete registration.
                </p>
            </div>

            {(localError || error) && (
                <div className="text-xs text-[#c4432b] font-semibold p-2.5 bg-[#fbeae5] rounded-lg">
                    {localError || error}
                </div>
            )}

            <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
                <div className="flex flex-col gap-1.5">
                    <label className="font-['Arimo',sans-serif] text-[12.5px] font-bold text-[#333f48]">
                        Full name *
                    </label>
                    <input
                        className="font-['Lato',system-ui] text-[14.5px] px-[13px] py-3 border-[1.5px] border-[#ddcf9f] rounded-[11px] bg-white text-[#333f48] outline-none w-full transition-all duration-[0.15s] focus:border-[#003da5] focus:shadow-[0_0_0_4px_rgba(0,61,165,0.12)]"
                        type="text"
                        name="fullName"
                        placeholder="As you'd like it on your orders"
                        required
                        value={formData.fullName || ''}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="font-['Arimo',sans-serif] text-[12.5px] font-bold text-[#333f48]">
                        Email address *
                    </label>
                    <input
                        className="font-['Lato',system-ui] text-[14.5px] px-[13px] py-3 border-[1.5px] border-[#ddcf9f] rounded-[11px] bg-white text-[#333f48] outline-none w-full transition-all duration-[0.15s] focus:border-[#003da5] focus:shadow-[0_0_0_4px_rgba(0,61,165,0.12)]"
                        type="email"
                        name="email"
                        placeholder="you@example.com"
                        required
                        value={formData.email || ''}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="font-['Arimo',sans-serif] text-[12.5px] font-bold text-[#333f48]">
                        Company Name (Optional)
                    </label>
                    <input
                        className="font-['Lato',system-ui] text-[14.5px] px-[13px] py-3 border-[1.5px] border-[#ddcf9f] rounded-[11px] bg-white text-[#333f48] outline-none w-full transition-all duration-[0.15s] focus:border-[#003da5] focus:shadow-[0_0_0_4px_rgba(0,61,165,0.12)]"
                        type="text"
                        name="companyName"
                        placeholder="Your company name"
                        value={formData.companyName || ''}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="font-['Arimo',sans-serif] text-[12.5px] font-bold text-[#333f48]">
                        Mobile number
                    </label>
                    <div className="flex gap-2">
                        <span className="flex-shrink-0 flex items-center px-[13px] border-[1.5px] border-[#ddcf9f] rounded-[11px] font-['Arimo',sans-serif] text-sm font-bold text-[#003da5] bg-[#fff8e6]">
                            +91
                        </span>
                        <input
                            className="font-['Lato',system-ui] text-[14.5px] px-[13px] py-3 border-[1.5px] border-[#ddcf9f] rounded-[11px] bg-[#fff8e6] text-[#5c6771] cursor-not-allowed outline-none w-full"
                            type="tel"
                            value={phoneNumber || ''}
                            readOnly
                            required
                        />
                    </div>
                    <span className="text-[11.5px] text-[#7a7561] font-normal">✓ Verified via OTP on login. This cannot be changed.</span>
                </div>

                <label className="flex gap-2.5 items-start text-[13px] text-[#7a7561] leading-[1.5] pt-1">
                    <input
                        type="checkbox"
                        name="agreedToTerms"
                        checked={formData.agreedToTerms || false}
                        onChange={handleInputChange}
                        className="mt-0.5 accent-[#003da5] flex-shrink-0"
                        required
                    />
                    <span>
                        I agree to the <a href="#" className="text-[#003da5] font-bold no-underline border-b-[1.5px] border-[#ffc72c]">Terms of Use</a> and <a href="#" className="text-[#003da5] font-bold no-underline border-b-[1.5px] border-[#ffc72c]">Privacy Policy</a>.
                    </span>
                </label>

                <div className="flex gap-2.5 mt-1.5 items-center">
                    <button
                        type="submit"
                        className="flex-1 font-['Arimo',sans-serif] text-[14.5px] font-bold px-[22px] py-[14px] rounded-[11px] border-none cursor-pointer transition-all duration-[0.18s] bg-[#003da5] text-[#fff9ea] shadow-[0_10px_22px_-10px_rgba(0,42,115,0.55)] hover:bg-[#0048bd] hover:-translate-y-px hover:shadow-[0_14px_26px_-10px_rgba(0,42,115,0.6)] active:translate-y-0 active:scale-[0.99] disabled:bg-[#ddcf9f] disabled:text-white disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
                        disabled={isLoading || !formData.agreedToTerms || !formData.fullName || !formData.email}
                    >
                        {isLoading ? 'Creating account...' : 'Create account'}
                    </button>
                </div>
            </form>
        </div>
    );
}