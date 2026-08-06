'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import {
    setDistributorStep,
    updateFormData,
    setSponsorVerified,
} from '@/lib/store/features/registration/registrationSlice';
import { useRegisterDistributorMutation, useVerifySponsorMutation } from '@/lib/api/endpoints/authApi';
import ProgressRail from './ProgressRail';

export default function DistributorRegistration() {
    const dispatch = useAppDispatch();
    const { distributorStep, formData, sponsorVerified, sponsorName } = useAppSelector(
        (state) => state.registration
    );
    const { mobile } = useAppSelector((state) => state.auth);

    const [registerDistributor, { isLoading: isRegistering }] = useRegisterDistributorMutation();
    const [verifySponsor, { isLoading: isVerifyingSponsor }] = useVerifySponsorMutation();
    const [localError, setLocalError] = useState<string | null>(null);
    const [sponsorIdInput, setSponsorIdInput] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;
        dispatch(updateFormData({ [name]: val }));
    };

    const handlePlacementLegChange = (leg: 'auto' | 'left' | 'right') => {
        dispatch(updateFormData({ placementLeg: leg }));
    };

    const handleVerifySponsor = async () => {
        if (!sponsorIdInput) return;
        setLocalError(null);

        try {
            const result = await verifySponsor({ sponsorId: sponsorIdInput }).unwrap();
            if (result.success && result.data) {
                dispatch(setSponsorVerified({ verified: true, name: result.data.name }));
                dispatch(updateFormData({ sponsorId: sponsorIdInput }));
            }
        } catch (error: any) {
            setLocalError(error?.data?.message || 'Sponsor verification failed');
            dispatch(setSponsorVerified({ verified: false }));
        }
    };

    const handleStepSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);

        if (distributorStep === 1) {
            if (!formData.fullName || !formData.email || !formData.dateOfBirth) {
                setLocalError('Please fill in all required fields');
                return;
            }
            dispatch(setDistributorStep(2));
        } else if (distributorStep === 2) {
            if (!formData.agreedToTerms) {
                setLocalError('You must agree to the Distributor Agreement');
                return;
            }
            dispatch(setDistributorStep(3));
        } else if (distributorStep === 3) {
            try {
                await registerDistributor({
                    ...formData,
                    mobile,
                    role: 'distributor',
                }).unwrap();
            } catch (error: any) {
                setLocalError(error?.data?.message || 'Application submission failed');
            }
        }
    };

    const renderStepContent = () => {
        switch (distributorStep) {
            case 1:
                return (
                    <>
                        <h1 className="font-['Arimo',sans-serif] text-[27px] font-extrabold m-0 mb-1.5 tracking-[-0.01em]">
                            Start your application
                        </h1>
                        <p className="text-sm text-[#7a7561] m-0 mb-7 leading-[1.55]">
                            You must be 18 or over to apply.
                        </p>

                        <div className="flex flex-col gap-1.5">
                            <label className="font-['Arimo',sans-serif] text-[12.5px] font-bold text-[#333f48]">
                                Full name
                            </label>
                            <input
                                className="font-['Lato',system-ui] text-[14.5px] px-[13px] py-3 border-[1.5px] border-[#ddcf9f] rounded-[11px] bg-white text-[#333f48] outline-none w-full transition-all duration-[0.15s] focus:border-[#003da5] focus:shadow-[0_0_0_4px_rgba(0,61,165,0.12)]"
                                type="text"
                                name="fullName"
                                placeholder="As per your ID documents"
                                required
                                value={formData.fullName}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                            <div className="flex flex-col gap-1.5">
                                <label className="font-['Arimo',sans-serif] text-[12.5px] font-bold text-[#333f48]">
                                    Date of birth
                                </label>
                                <input
                                    className="font-['Lato',system-ui] text-[14.5px] px-[13px] py-3 border-[1.5px] border-[#ddcf9f] rounded-[11px] bg-white text-[#333f48] outline-none w-full transition-all duration-[0.15s] focus:border-[#003da5] focus:shadow-[0_0_0_4px_rgba(0,61,165,0.12)]"
                                    type="date"
                                    name="dateOfBirth"
                                    required
                                    value={formData.dateOfBirth}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="font-['Arimo',sans-serif] text-[12.5px] font-bold text-[#333f48]">
                                    Email address
                                </label>
                                <input
                                    className="font-['Lato',system-ui] text-[14.5px] px-[13px] py-3 border-[1.5px] border-[#ddcf9f] rounded-[11px] bg-white text-[#333f48] outline-none w-full transition-all duration-[0.15s] focus:border-[#003da5] focus:shadow-[0_0_0_4px_rgba(0,61,165,0.12)]"
                                    type="email"
                                    name="email"
                                    placeholder="you@example.com"
                                    required
                                    value={formData.email}
                                    onChange={handleInputChange}
                                />
                            </div>
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
                                    value={mobile}
                                    readOnly
                                    required
                                />
                            </div>
                        </div>
                    </>
                );

            case 2:
                return (
                    <>
                        <h1 className="font-['Arimo',sans-serif] text-[27px] font-extrabold m-0 mb-1.5 tracking-[-0.01em]">
                            Sponsor & placement
                        </h1>
                        <p className="text-sm text-[#7a7561] m-0 mb-7 leading-[1.55]">
                            Leave blank if you don't have a sponsor.
                        </p>

                        <div className="flex flex-col gap-1.5">
                            <label className="font-['Arimo',sans-serif] text-[12.5px] font-bold text-[#333f48]">
                                Sponsor ID <span className="font-normal text-gray-500">(optional)</span>
                            </label>
                            <div className="flex gap-2">
                                <input
                                    className="flex-1 font-['Lato',system-ui] text-[14.5px] px-[13px] py-3 border-[1.5px] border-[#ddcf9f] rounded-[11px] bg-white text-[#333f48] outline-none transition-all duration-[0.15s] focus:border-[#003da5] focus:shadow-[0_0_0_4px_rgba(0,61,165,0.12)]"
                                    type="text"
                                    placeholder="e.g. IK-104822"
                                    value={sponsorIdInput}
                                    onChange={(e) => setSponsorIdInput(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="flex-shrink-0 font-['Arimo',sans-serif] text-[13px] font-bold px-[18px] rounded-[11px] border-[1.5px] border-[#003da5] bg-white text-[#003da5] cursor-pointer hover:bg-[#003da5] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={handleVerifySponsor}
                                    disabled={isVerifyingSponsor || !sponsorIdInput}
                                >
                                    {isVerifyingSponsor ? 'Verifying...' : 'Verify'}
                                </button>
                            </div>
                            {sponsorVerified && sponsorName && (
                                <div className="text-[#1f8a56] font-bold text-[13px] mt-1.5">
                                    ✓ Sponsor confirmed: {sponsorName}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-1.5 mt-2.5">
                            <label className="font-['Arimo',sans-serif] text-[12.5px] font-bold text-[#333f48]">
                                Placement leg
                            </label>
                            <div className="flex gap-2.5 flex-wrap">
                                {['auto', 'left', 'right'].map((leg) => (
                                    <label
                                        key={leg}
                                        className={`flex-1 min-w-[130px] border-[1.5px] border-[#ddcf9f] rounded-[11px] p-[13px_14px] cursor-pointer flex items-center gap-2.5 hover:-translate-y-px transition-transform ${formData.placementLeg === leg ? 'border-[#003da5] bg-[#fff8e6]' : ''}`}
                                    >
                                        <input
                                            type="radio"
                                            name="placementLeg"
                                            value={leg}
                                            checked={formData.placementLeg === leg}
                                            onChange={() => handlePlacementLegChange(leg as any)}
                                        />
                                        <span>{leg.charAt(0).toUpperCase() + leg.slice(1)}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <label className="flex gap-2.5 items-start text-[13px] text-[#7a7561] leading-[1.5] pt-1">
                            <input
                                type="checkbox"
                                name="agreedToTerms"
                                checked={formData.agreedToTerms}
                                onChange={handleInputChange}
                                className="mt-0.5 accent-[#003da5] flex-shrink-0"
                                required
                            />
                            <span>I agree to the Distributor Agreement.</span>
                        </label>
                    </>
                );

            case 3:
                return (
                    <>
                        <h1 className="font-['Arimo',sans-serif] text-[27px] font-extrabold m-0 mb-1.5 tracking-[-0.01em]">
                            Identity & bank details
                        </h1>
                        <p className="text-sm text-[#7a7561] m-0 mb-7 leading-[1.55]">
                            Provide details for commission payouts.
                        </p>

                        <div className="flex flex-col gap-1.5">
                            <label className="font-['Arimo',sans-serif] text-[12.5px] font-bold text-[#333f48]">
                                Aadhaar number
                            </label>
                            <input
                                className="font-['Lato',system-ui] text-[14.5px] px-[13px] py-3 border-[1.5px] border-[#ddcf9f] rounded-[11px] bg-white text-[#333f48] outline-none w-full transition-all duration-[0.15s] focus:border-[#003da5] focus:shadow-[0_0_0_4px_rgba(0,61,165,0.12)]"
                                type="text"
                                name="aadhaar"
                                placeholder="[Aadhaar Redacted]"
                                maxLength={12}
                                required
                                value={formData.aadhaar || ''}
                                onChange={handleInputChange}
                            />
                        </div>

                        <label className="flex gap-2.5 items-start text-[13px] text-[#7a7561] leading-[1.5] pt-1 mb-3">
                            <input type="checkbox" className="mt-0.5 accent-[#003da5] flex-shrink-0" required />
                            <span>I consent to verification for fraud prevention.</span>
                        </label>

                        <div className="flex flex-col gap-1.5">
                            <label className="font-['Arimo',sans-serif] text-[12.5px] font-bold text-[#333f48]">
                                PAN number
                            </label>
                            <input
                                className="font-['Lato',system-ui] text-[14.5px] px-[13px] py-3 border-[1.5px] border-[#ddcf9f] rounded-[11px] bg-white text-[#333f48] outline-none w-full transition-all duration-[0.15s] focus:border-[#003da5] focus:shadow-[0_0_0_4px_rgba(0,61,165,0.12)]"
                                type="text"
                                name="pan"
                                placeholder="10-character PAN"
                                maxLength={10}
                                required
                                value={formData.pan || ''}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="font-['Arimo',sans-serif] text-xs font-bold uppercase text-[#003da5] mt-[15px] mb-[5px]">
                            Bank account details
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="font-['Arimo',sans-serif] text-[12.5px] font-bold text-[#333f48]">
                                Account holder name
                            </label>
                            <input
                                className="font-['Lato',system-ui] text-[14.5px] px-[13px] py-3 border-[1.5px] border-[#ddcf9f] rounded-[11px] bg-white text-[#333f48] outline-none w-full transition-all duration-[0.15s] focus:border-[#003da5] focus:shadow-[0_0_0_4px_rgba(0,61,165,0.12)]"
                                type="text"
                                placeholder="Exactly as per PAN/Bank records"
                                required
                                value={formData.bankAccount?.holderName || ''}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    dispatch(updateFormData({
                                        bankAccount: { ...formData.bankAccount, holderName: value } as any
                                    }));
                                }}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                            <div className="flex flex-col gap-1.5">
                                <label className="font-['Arimo',sans-serif] text-[12.5px] font-bold text-[#333f48]">
                                    Account number
                                </label>
                                <input
                                    className="font-['Lato',system-ui] text-[14.5px] px-[13px] py-3 border-[1.5px] border-[#ddcf9f] rounded-[11px] bg-white text-[#333f48] outline-none w-full transition-all duration-[0.15s] focus:border-[#003da5] focus:shadow-[0_0_0_4px_rgba(0,61,165,0.12)]"
                                    type="password"
                                    placeholder="Account number"
                                    required
                                    value={formData.bankAccount?.accountNumber || ''}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        dispatch(updateFormData({
                                            bankAccount: { ...formData.bankAccount, accountNumber: value } as any
                                        }));
                                    }}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="font-['Arimo',sans-serif] text-[12.5px] font-bold text-[#333f48]">
                                    IFSC code
                                </label>
                                <input
                                    className="font-['Lato',system-ui] text-[14.5px] px-[13px] py-3 border-[1.5px] border-[#ddcf9f] rounded-[11px] bg-white text-[#333f48] outline-none w-full transition-all duration-[0.15s] focus:border-[#003da5] focus:shadow-[0_0_0_4px_rgba(0,61,165,0.12)]"
                                    type="text"
                                    placeholder="e.g. HDFC0001234"
                                    required
                                    value={formData.bankAccount?.ifscCode || ''}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        dispatch(updateFormData({
                                            bankAccount: { ...formData.bankAccount, ifscCode: value } as any
                                        }));
                                    }}
                                />
                            </div>
                        </div>
                    </>
                );

            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col gap-[18px]">
            <ProgressRail currentStep={distributorStep} />

            {localError && (
                <div className="text-xs text-[#c4432b] font-semibold p-2.5 bg-[#fbeae5] rounded-lg">
                    {localError}
                </div>
            )}

            <form noValidate onSubmit={handleStepSubmit} className="flex flex-col gap-[18px]">
                {renderStepContent()}

                <div className="flex gap-2.5 mt-5 items-center">
                    {distributorStep > 1 && (
                        <button
                            type="button"
                            className="font-['Arimo',sans-serif] text-[14.5px] font-bold px-[22px] py-[14px] rounded-[11px] border-[1.5px] border-[#ddcf9f] bg-transparent text-[#5c6771] cursor-pointer transition-all duration-[0.18s] hover:border-[#003da5] hover:text-[#003da5]"
                            onClick={() => dispatch(setDistributorStep(distributorStep - 1))}
                        >
                            Back
                        </button>
                    )}
                    <button
                        type="submit"
                        className="flex-1 font-['Arimo',sans-serif] text-[14.5px] font-bold px-[22px] py-[14px] rounded-[11px] border-none cursor-pointer transition-all duration-[0.18s] bg-[#003da5] text-[#fff9ea] shadow-[0_10px_22px_-10px_rgba(0,42,115,0.55)] hover:bg-[#0048bd] hover:-translate-y-px hover:shadow-[0_14px_26px_-10px_rgba(0,42,115,0.6)] active:translate-y-0 active:scale-[0.99] disabled:bg-[#ddcf9f] disabled:text-white disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
                        disabled={isRegistering}
                    >
                        {distributorStep === 3
                            ? (isRegistering ? 'Submitting...' : 'Submit Application')
                            : 'Continue'}
                    </button>
                </div>
            </form>
        </div>
    );
}