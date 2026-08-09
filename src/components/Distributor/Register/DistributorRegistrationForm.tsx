// components/distributor/Registration/DistributorRegistrationFlow.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/common/Input';
import { PhoneInput } from '@/components/common/PhoneInput';
import { Button } from '@/components/common/Button';
import { Logo } from '@/components/common/Logo';
import Link from 'next/link';

// Types based on FRD requirements
interface DistributorFormData {
  full_name: string;
  date_of_birth: string;
  email: string;
  mobile: string;
  password: string;
  confirm_password: string;
  sponsor_id: string;
  placement_leg: 'left' | 'right' | 'auto';
  email_verified: boolean;
  mobile_verified: boolean;
  aadhaar_number: string;
  aadhaar_consent: boolean;
  aadhaar_verified: boolean;
  pan_number: string;
  pan_verified: boolean;
  bank_account_holder_name: string;
  bank_account_number: string;
  bank_confirm_account_number: string;
  bank_ifsc_code: string;
  bank_name: string;
  bank_branch: string;
  bank_account_type: 'current' | 'savings';
  location_consent: boolean;
  latitude?: number;
  longitude?: number;
  terms_accepted: boolean;
  agreement_accepted: boolean;
  code_of_conduct_accepted: boolean;
  account_type: 'distributor';
}

// Custom Date Picker Component
const DatePicker = ({ value, onChange, error, helperText, label, required }: any) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(value ? new Date(value) : null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [yearInput, setYearInput] = useState('');

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    const startingDay = firstDay.getDay();

    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    const formattedDate = date.toISOString().split('T')[0];
    onChange({ target: { name: 'date_of_birth', value: formattedDate } });
    setShowCalendar(false);
  };

  const handleMonthChange = (increment: number) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + increment);
    setCurrentMonth(newDate);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const year = parseInt(e.target.value);
    if (year && year > 1900 && year < 2100) {
      const newDate = new Date(currentMonth);
      newDate.setFullYear(year);
      setCurrentMonth(newDate);
    }
    setYearInput(e.target.value);
  };

  const handleYearBlur = () => {
    if (yearInput) {
      const year = parseInt(yearInput);
      if (year >= 1900 && year <= 2100) {
        const newDate = new Date(currentMonth);
        newDate.setFullYear(year);
        setCurrentMonth(newDate);
      }
    }
    setYearInput('');
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <div className="relative">
      <label className="text-sm font-medium text-gray-700 block mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div
        className="relative cursor-pointer"
        onClick={() => setShowCalendar(!showCalendar)}
      >
        <Input
          value={formatDisplayDate(value)}
          placeholder="Select date of birth"
          error={error}
          helperText={helperText}
          readOnly
          className="h-14 text-base px-4 cursor-pointer bg-white border-gray-200 rounded-xl focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>

      {showCalendar && (
        <div className="absolute z-50 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-5 w-[340px]">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleMonthChange(-1); }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex items-center gap-3">
              <span className="font-semibold text-gray-800 text-lg">
                {months[currentMonth.getMonth()]}
              </span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={yearInput || currentMonth.getFullYear()}
                  onChange={handleYearChange}
                  onBlur={handleYearBlur}
                  onClick={(e) => e.stopPropagation()}
                  className="w-20 h-9 text-center border border-gray-200 rounded-lg text-sm font-semibold focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 outline-none"
                  min="1900"
                  max="2100"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleMonthChange(1); }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
              <div key={day} className="text-center text-xs font-medium text-gray-400 py-1">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((date, index) => (
              <button
                key={index}
                type="button"
                onClick={(e) => { e.stopPropagation(); if (date) handleDateSelect(date); }}
                disabled={!date}
                className={`
                  h-10 rounded-lg text-sm transition-colors
                  ${!date ? 'invisible' : 'hover:bg-[#F9C744]/20'}
                  ${date && selectedDate && date.toDateString() === selectedDate.toDateString()
                    ? 'bg-[#F9C744] text-[#06101E] font-semibold hover:bg-[#E6B33D]'
                    : date && date.toDateString() === new Date().toDateString()
                      ? 'border-2 border-[#F9C744] text-[#06101E]'
                      : 'text-gray-700 hover:bg-gray-50'
                  }
                  ${date && date > new Date() ? 'text-gray-300 cursor-not-allowed' : ''}
                `}
              >
                {date ? date.getDate() : ''}
              </button>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Jump to year:</span>
              <div className="flex flex-wrap gap-1">
                {[1990, 1995, 2000, 2005, 2010, 2015, 2020].map((year) => (
                  <button
                    key={year}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const newDate = new Date(currentMonth);
                      newDate.setFullYear(year);
                      setCurrentMonth(newDate);
                      setYearInput(String(year));
                    }}
                    className="px-2 py-1 text-xs border border-gray-200 rounded hover:bg-[#F9C744]/20 hover:border-[#F9C744] transition-colors"
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowCalendar(false)}
            className="mt-3 w-full text-sm text-gray-500 hover:text-gray-700 py-1 border-t border-gray-100 pt-2"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

// Step 1: Basic Identity
const IdentityStep = ({ data, errors, onChange, onNext }: any) => {
  const [ageError, setAgeError] = useState('');

  const validateAge = (dob: string) => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dob = e.target.value;
    onChange({ target: { name: 'date_of_birth', value: dob } });

    const age = validateAge(dob);
    if (age < 18 && age > 0) {
      setAgeError('You must be at least 18 years old to register as a distributor');
    } else {
      setAgeError('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[#06101E]">Personal Information</h2>
        <p className="text-gray-500 text-sm mt-1">Enter your basic details</p>
      </div>

      <div className="space-y-5">
        <div>
          <Input
            label="Full Name (as per PAN)"
            name="full_name"
            value={data.full_name}
            onChange={onChange}
            error={errors.full_name}
            placeholder="John Doe"
            required
            helperText="Must match your PAN card name"
            className="h-14 text-base px-4 border-gray-200 rounded-xl focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200"
          />
        </div>

        <div>
          <DatePicker
            label="Date of Birth"
            value={data.date_of_birth}
            onChange={handleDobChange}
            error={errors.date_of_birth || ageError}
            helperText="You must be at least 18 years old"
            required
          />
        </div>

        <div>
          <Input
            label="Email Address"
            name="email"
            type="email"
            value={data.email}
            onChange={onChange}
            error={errors.email}
            placeholder="john@example.com"
            required
            helperText="Will be verified via OTP"
            className="h-14 text-base px-4 border-gray-200 rounded-xl focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200"
          />
        </div>

        <div>
          <PhoneInput
            label="Mobile Number"
            value={data.mobile}
            onChange={(value) => onChange({ target: { name: 'mobile', value } })}
            error={errors.mobile}
            placeholder="Enter your phone number"
            helperText="Will be verified via OTP"
            className="h-14 text-base px-4 border-gray-200 rounded-xl focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200"
          />
        </div>

        <div>
          <Input
            label="Create Password"
            name="password"
            type="password"
            value={data.password}
            onChange={onChange}
            error={errors.password}
            placeholder="Create a strong password"
            required
            helperText="Minimum 8 characters with uppercase, lowercase and number"
            className="h-14 text-base px-4 border-gray-200 rounded-xl focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200"
          />
        </div>

        <div>
          <Input
            label="Confirm Password"
            name="confirm_password"
            type="password"
            value={data.confirm_password}
            onChange={onChange}
            error={errors.confirm_password}
            placeholder="Confirm your password"
            required
            className="h-14 text-base px-4 border-gray-200 rounded-xl focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200"
          />
        </div>

        <Button
          type="button"
          fullWidth
          onClick={onNext}
          disabled={!!ageError}
          className="h-14 text-base bg-gradient-to-r from-[#F9C744] to-[#E6B33D] hover:from-[#E6B33D] hover:to-[#D4A22E] text-[#06101E] font-semibold rounded-xl mt-4 transition-all duration-300 shadow-lg hover:shadow-[#F9C744]/40 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue →
        </Button>
      </div>
    </div>
  );
};

// Step 2: Sponsor & Placement
const SponsorStep = ({ data, errors, onChange, onNext, onBack }: any) => {
  const [sponsorName, setSponsorName] = useState('');
  const [sponsorValid, setSponsorValid] = useState(false);
  const [sponsorLoading, setSponsorLoading] = useState(false);

  const validateSponsor = async () => {
    if (!data.sponsor_id) {
      setSponsorValid(false);
      setSponsorName('');
      return;
    }

    setSponsorLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      if (data.sponsor_id.length >= 6) {
        setSponsorValid(true);
        setSponsorName('John Smith (DIST-12345)');
      } else {
        setSponsorValid(false);
        setSponsorName('');
      }
    } catch (error) {
      setSponsorValid(false);
      setSponsorName('');
    } finally {
      setSponsorLoading(false);
    }
  };

  useEffect(() => {
    if (data.sponsor_id) {
      validateSponsor();
    }
  }, [data.sponsor_id]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[#06101E]">Sponsor & Placement</h2>
        <p className="text-gray-500 text-sm mt-1">Identify who introduced you to the network</p>
      </div>

      <div className="bg-blue-50/80 backdrop-blur-sm p-4 rounded-xl border border-blue-100 mb-2">
        <p className="text-sm text-blue-700 flex items-start gap-2">
          <span className="text-blue-500 text-lg">ℹ️</span>
          <span><strong>Why this is needed:</strong> Your sponsor determines where you sit in the binary network and who earns against your activity.</span>
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <Input
            label="Sponsor ID"
            name="sponsor_id"
            value={data.sponsor_id}
            onChange={onChange}
            error={errors.sponsor_id}
            placeholder="Enter your sponsor's distributor ID"
            required
            helperText={sponsorValid ? `✓ Sponsor found: ${sponsorName}` : 'Enter the ID of the distributor who referred you'}
            className="h-14 text-base px-4 border-gray-200 rounded-xl focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200"
          />
        </div>

        {sponsorLoading && <p className="text-sm text-gray-500 -mt-2">Validating sponsor...</p>}

        {!sponsorValid && data.sponsor_id && !sponsorLoading && (
          <p className="text-sm text-red-500 -mt-2">Invalid sponsor ID. Please check with your sponsor.</p>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Placement Leg <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'left', label: 'Left Leg' },
              { value: 'right', label: 'Right Leg' },
              { value: 'auto', label: 'Auto' }
            ].map((option) => (
              <label
                key={option.value}
                className={`flex items-center justify-center gap-2 cursor-pointer text-center py-3 px-2 rounded-xl border-2 text-sm transition-all duration-200 h-14
                  ${data.placement_leg === option.value
                    ? 'border-[#F9C744] bg-[#F9C744]/10 text-[#06101E] font-semibold shadow-sm'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'}`}
              >
                <input
                  type="radio"
                  name="placement_leg"
                  value={option.value}
                  checked={data.placement_leg === option.value}
                  onChange={onChange}
                  className="sr-only"
                />
                {option.label}
              </label>
            ))}
          </div>
          {errors.placement_leg && <p className="text-xs text-red-500">{errors.placement_leg}</p>}
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1 h-14 text-base rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
          >
            Back
          </Button>
          <Button
            type="button"
            fullWidth
            onClick={onNext}
            disabled={!sponsorValid && !!data.sponsor_id}
            className="flex-1 h-14 text-base bg-gradient-to-r from-[#F9C744] to-[#E6B33D] hover:from-[#E6B33D] hover:to-[#D4A22E] text-[#06101E] font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-[#F9C744]/40 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue →
          </Button>
        </div>
      </div>
    </div>
  );
};

// Step 3: Identity Verification
const VerificationStep = ({ data, errors, onChange, onNext, onBack }: any) => {
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleSendOTP = () => {
    setOtpSent(true);
    setTimer(30);
    setCanResend(false);
  };

  const handleVerifyOTP = () => {
    if (otpCode === '123456') {
      onChange({ target: { name: 'email_verified', value: true } });
      onChange({ target: { name: 'mobile_verified', value: true } });
      onNext();
    } else {
      alert('Invalid OTP. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[#06101E]">Verify Your Identity</h2>
        <p className="text-gray-500 text-sm mt-1">Prove ownership of your email and mobile</p>
      </div>

      <div className="bg-yellow-50/80 backdrop-blur-sm p-4 rounded-xl border border-yellow-100 mb-2">
        <p className="text-sm text-yellow-700 flex items-start gap-2">
          <span className="text-yellow-500 text-lg">📌</span>
          <span><strong>Note:</strong> Both your email and mobile number must be verified before you can proceed to KYC.</span>
        </p>
      </div>

      <div className="space-y-5">
        <div className="border-2 border-gray-200 rounded-xl px-5 py-4 h-20 flex items-center justify-between hover:border-gray-300 transition-all duration-200">
          <div>
            <p className="font-medium text-[#06101E]">{data.email}</p>
            <p className="text-xs text-gray-500">
              {data.email_verified ? '✓ Verified' : 'Pending verification'}
            </p>
          </div>
          {!data.email_verified && (
            <button
              type="button"
              onClick={handleSendOTP}
              className="text-sm text-[#B98F1E] hover:underline font-medium px-4 py-2 bg-yellow-50 rounded-lg border border-yellow-200 whitespace-nowrap hover:bg-yellow-100 transition-all duration-200"
            >
              Send OTP
            </button>
          )}
          {data.email_verified && (
            <span className="text-green-500 text-sm font-medium flex items-center gap-1">
              <span className="text-lg">✓</span> Verified
            </span>
          )}
        </div>

        <div className="border-2 border-gray-200 rounded-xl px-5 py-4 h-20 flex items-center justify-between hover:border-gray-300 transition-all duration-200">
          <div>
            <p className="font-medium text-[#06101E]">{data.mobile}</p>
            <p className="text-xs text-gray-500">
              {data.mobile_verified ? '✓ Verified' : 'Pending verification'}
            </p>
          </div>
          {!data.mobile_verified && (
            <button
              type="button"
              onClick={handleSendOTP}
              className="text-sm text-[#B98F1E] hover:underline font-medium px-4 py-2 bg-yellow-50 rounded-lg border border-yellow-200 whitespace-nowrap hover:bg-yellow-100 transition-all duration-200"
            >
              Send OTP
            </button>
          )}
          {data.mobile_verified && (
            <span className="text-green-500 text-sm font-medium flex items-center gap-1">
              <span className="text-lg">✓</span> Verified
            </span>
          )}
        </div>

        {otpSent && !data.email_verified && (
          <div className="space-y-4 bg-gray-50/80 backdrop-blur-sm p-5 rounded-xl border-2 border-gray-200">
            <div>
              <Input
                label="Enter OTP"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                className="h-14 text-base px-4 border-gray-200 rounded-xl focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200"
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <Button
                type="button"
                onClick={handleVerifyOTP}
                className="h-12 px-8 bg-gradient-to-r from-[#F9C744] to-[#E6B33D] hover:from-[#E6B33D] hover:to-[#D4A22E] text-[#06101E] font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Verify OTP
              </Button>
              {canResend ? (
                <button
                  type="button"
                  onClick={handleSendOTP}
                  className="text-sm text-[#B98F1E] hover:underline font-medium"
                >
                  Resend OTP
                </button>
              ) : (
                <span className="text-sm text-gray-400">Resend in {timer}s</span>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1 h-14 text-base rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
          >
            Back
          </Button>
          <Button
            type="button"
            fullWidth
            onClick={onNext}
            disabled={!data.email_verified || !data.mobile_verified}
            className="flex-1 h-14 text-base bg-gradient-to-r from-[#F9C744] to-[#E6B33D] hover:from-[#E6B33D] hover:to-[#D4A22E] text-[#06101E] font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-[#F9C744]/40 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue →
          </Button>
        </div>
      </div>
    </div>
  );
};

// Step 4: Aadhaar Verification
const AadhaarStep = ({ data, errors, onChange, onNext, onBack }: any) => {
  const [isVerifying, setIsVerifying] = useState(false);

  const handleAadhaarVerify = async () => {
    if (!data.aadhaar_number || data.aadhaar_number.length !== 12) {
      alert('Please enter a valid 12-digit Aadhaar number');
      return;
    }

    if (!data.aadhaar_consent) {
      alert('You must consent to Aadhaar verification');
      return;
    }

    setIsVerifying(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      onChange({ target: { name: 'aadhaar_verified', value: true } });
      onNext();
    } catch (error) {
      alert('Aadhaar verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[#06101E]">Aadhaar Verification</h2>
        <p className="text-gray-500 text-sm mt-1">Verify your identity through licensed KYC provider</p>
      </div>

      <div className="bg-blue-50/80 backdrop-blur-sm p-4 rounded-xl border border-blue-100 mb-2">
        <p className="text-sm text-blue-700 flex items-start gap-2">
          <span className="text-blue-500 text-lg">🔐</span>
          <span><strong>Why this is needed:</strong> Aadhaar verification is mandatory for distributor registration. Your Aadhaar number is verified through a licensed KYC provider and is never stored in full.</span>
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <Input
            label="Aadhaar Number"
            name="aadhaar_number"
            value={data.aadhaar_number}
            onChange={onChange}
            error={errors.aadhaar_number}
            placeholder="Enter 12-digit Aadhaar number"
            maxLength={12}
            required
            helperText="Only last 4 digits will be visible in the system"
            className="h-14 text-base px-4 border-gray-200 rounded-xl focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200"
          />
        </div>

        <div className="space-y-1.5">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="aadhaar_consent"
              checked={data.aadhaar_consent}
              onChange={onChange}
              className="mt-1 w-4 h-4 rounded border-gray-300 text-[#F9C744] focus:ring-[#F9C744]"
            />
            <span className="text-sm text-gray-600 leading-relaxed">
              I consent to Aadhaar verification through a licensed KYC provider for the purpose of identity verification as per the Digital Personal Data Protection Act, 2023.
            </span>
          </label>
          {errors.aadhaar_consent && <p className="text-xs text-red-500">{errors.aadhaar_consent}</p>}
        </div>

        {data.aadhaar_verified && (
          <div className="bg-green-50/80 backdrop-blur-sm p-3 rounded-xl border border-green-100 text-sm text-green-700 flex items-center gap-2">
            <span className="text-lg">✅</span> Aadhaar verified successfully
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1 h-14 text-base rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
          >
            Back
          </Button>
          <Button
            type="button"
            fullWidth
            loading={isVerifying}
            onClick={handleAadhaarVerify}
            disabled={!data.aadhaar_consent || !data.aadhaar_number || data.aadhaar_number.length !== 12}
            className="flex-1 h-14 text-base bg-gradient-to-r from-[#F9C744] to-[#E6B33D] hover:from-[#E6B33D] hover:to-[#D4A22E] text-[#06101E] font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-[#F9C744]/40 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {data.aadhaar_verified ? 'Continue →' : 'Verify Aadhaar'}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Step 5: PAN Verification
const PANStep = ({ data, errors, onChange, onNext, onBack }: any) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [panName, setPanName] = useState('');

  const handlePANVerify = async () => {
    if (!data.pan_number || data.pan_number.length !== 10) {
      alert('Please enter a valid 10-character PAN');
      return;
    }

    setIsVerifying(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const mockName = 'John Doe';
      setPanName(mockName);

      if (mockName.toLowerCase() !== data.full_name.toLowerCase()) {
        alert('PAN name does not match your full name. The application will be flagged for review.');
      }

      onChange({ target: { name: 'pan_verified', value: true } });
      onNext();
    } catch (error) {
      alert('PAN verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[#06101E]">PAN Verification</h2>
        <p className="text-gray-500 text-sm mt-1">Verify your PAN for tax compliance</p>
      </div>

      <div className="bg-blue-50/80 backdrop-blur-sm p-4 rounded-xl border border-blue-100 mb-2">
        <p className="text-sm text-blue-700 flex items-start gap-2">
          <span className="text-blue-500 text-lg">📋</span>
          <span><strong>Why this is needed:</strong> PAN verification is mandatory for distributor activation. A verified PAN is required for tax deduction on commission and for compliance with income tax regulations.</span>
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <Input
            label="PAN Number"
            name="pan_number"
            value={data.pan_number}
            onChange={onChange}
            error={errors.pan_number}
            placeholder="Enter 10-character PAN (e.g., ABCDE1234F)"
            maxLength={10}
            required
            helperText="PAN is unique across all distributor accounts"
            className="h-14 text-base px-4 border-gray-200 rounded-xl focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200"
          />
        </div>

        {panName && (
          <div className="bg-gray-50/80 backdrop-blur-sm p-4 rounded-xl border-2 border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">PAN Registered Name</span>
              <span className="font-semibold text-[#06101E]">{panName}</span>
            </div>
            <p className={`text-xs mt-2 ${panName.toLowerCase() === data.full_name.toLowerCase()
              ? 'text-green-600'
              : 'text-red-500'
              }`}>
              {panName.toLowerCase() === data.full_name.toLowerCase()
                ? '✓ Name matches'
                : '⚠ Name mismatch - Application will be flagged for review'}
            </p>
          </div>
        )}

        {data.pan_verified && (
          <div className="bg-green-50/80 backdrop-blur-sm p-3 rounded-xl border border-green-100 text-sm text-green-700 flex items-center gap-2">
            <span className="text-lg">✅</span> PAN verified successfully
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1 h-14 text-base rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
          >
            Back
          </Button>
          <Button
            type="button"
            fullWidth
            loading={isVerifying}
            onClick={handlePANVerify}
            disabled={!data.pan_number || data.pan_number.length !== 10}
            className="flex-1 h-14 text-base bg-gradient-to-r from-[#F9C744] to-[#E6B33D] hover:from-[#E6B33D] hover:to-[#D4A22E] text-[#06101E] font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-[#F9C744]/40 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {data.pan_verified ? 'Continue →' : 'Verify PAN'}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Step 6: Bank Account Details
const BankStep = ({ data, errors, onChange, onNext, onBack }: any) => {
  const [isVerifying, setIsVerifying] = useState(false);

  const handleBankVerify = async () => {
    if (!data.bank_account_number || data.bank_account_number !== data.bank_confirm_account_number) {
      alert('Account numbers do not match');
      return;
    }

    setIsVerifying(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      onNext();
    } catch (error) {
      alert('Bank verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[#06101E]">Bank Account Details</h2>
        <p className="text-gray-500 text-sm mt-1">Enter your bank account for commission settlement</p>
      </div>

      <div className="bg-blue-50/80 backdrop-blur-sm p-4 rounded-xl border border-blue-100 mb-2">
        <p className="text-sm text-blue-700 flex items-start gap-2">
          <span className="text-blue-500 text-lg">🏦</span>
          <span><strong>Why this is needed:</strong> Your commission will be settled to this account. The account holder name must match your PAN name.</span>
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <Input
            label="Account Holder Name"
            name="bank_account_holder_name"
            value={data.bank_account_holder_name}
            onChange={onChange}
            error={errors.bank_account_holder_name}
            placeholder="Name as on bank account"
            required
            helperText="Must match your PAN name"
            className="h-14 text-base px-4 border-gray-200 rounded-xl focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              label="Bank Name"
              name="bank_name"
              value={data.bank_name}
              onChange={onChange}
              error={errors.bank_name}
              placeholder="Enter bank name"
              required
              className="h-14 text-base px-4 border-gray-200 rounded-xl focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200"
            />
          </div>
          <div>
            <Input
              label="Bank Branch"
              name="bank_branch"
              value={data.bank_branch}
              onChange={onChange}
              error={errors.bank_branch}
              placeholder="Enter branch name"
              className="h-14 text-base px-4 border-gray-200 rounded-xl focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200"
            />
          </div>
        </div>

        <div>
          <Input
            label="Account Number"
            name="bank_account_number"
            value={data.bank_account_number}
            onChange={onChange}
            error={errors.bank_account_number}
            placeholder="Enter bank account number"
            required
            type="password"
            className="h-14 text-base px-4 border-gray-200 rounded-xl focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200"
          />
        </div>

        <div>
          <Input
            label="Confirm Account Number"
            name="bank_confirm_account_number"
            value={data.bank_confirm_account_number}
            onChange={onChange}
            error={errors.bank_confirm_account_number}
            placeholder="Re-enter account number"
            required
            type="password"
            className="h-14 text-base px-4 border-gray-200 rounded-xl focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200"
          />
        </div>

        <div>
          <Input
            label="IFSC Code"
            name="bank_ifsc_code"
            value={data.bank_ifsc_code}
            onChange={onChange}
            error={errors.bank_ifsc_code}
            placeholder="Enter IFSC code"
            required
            helperText="Validated against the bank name"
            className="h-14 text-base px-4 border-gray-200 rounded-xl focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Account Type <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'current', label: 'Current Account' },
              { value: 'savings', label: 'Savings Account' }
            ].map((option) => (
              <label
                key={option.value}
                className={`flex items-center justify-center gap-2 cursor-pointer text-center py-3 px-2 rounded-xl border-2 text-sm transition-all duration-200 h-14
                  ${data.bank_account_type === option.value
                    ? 'border-[#F9C744] bg-[#F9C744]/10 text-[#06101E] font-semibold shadow-sm'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'}`}
              >
                <input
                  type="radio"
                  name="bank_account_type"
                  value={option.value}
                  checked={data.bank_account_type === option.value}
                  onChange={onChange}
                  className="sr-only"
                />
                {option.label}
              </label>
            ))}
          </div>
          {errors.bank_account_type && <p className="text-xs text-red-500">{errors.bank_account_type}</p>}
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1 h-14 text-base rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
          >
            Back
          </Button>
          <Button
            type="button"
            fullWidth
            loading={isVerifying}
            onClick={handleBankVerify}
            disabled={!data.bank_account_number || data.bank_account_number !== data.bank_confirm_account_number}
            className="flex-1 h-14 text-base bg-gradient-to-r from-[#F9C744] to-[#E6B33D] hover:from-[#E6B33D] hover:to-[#D4A22E] text-[#06101E] font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-[#F9C744]/40 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue →
          </Button>
        </div>
      </div>
    </div>
  );
};

// Step 7: Geolocation Consent
const LocationStep = ({ data, errors, onChange, onNext, onBack }: any) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');

  const handleCaptureLocation = () => {
    setIsCapturing(true);
    setLocationStatus('Requesting location...');

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onChange({ target: { name: 'latitude', value: position.coords.latitude } });
          onChange({ target: { name: 'longitude', value: position.coords.longitude } });
          setLocationStatus('✓ Location captured successfully');
          setIsCapturing(false);
        },
        (error) => {
          setLocationStatus('⚠ Unable to capture location. Fallback to IP-derived location.');
          setIsCapturing(false);
        }
      );
    } else {
      setLocationStatus('⚠ Geolocation not supported. Fallback to IP-derived location.');
      setIsCapturing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[#06101E]">Location Consent</h2>
        <p className="text-gray-500 text-sm mt-1">Consent for location capture for fraud prevention</p>
      </div>

      <div className="bg-blue-50/80 backdrop-blur-sm p-4 rounded-xl border border-blue-100 mb-2">
        <p className="text-sm text-blue-700 flex items-start gap-2">
          <span className="text-blue-500 text-lg">📍</span>
          <span><strong>Purpose:</strong> Location is captured once at registration for fraud prevention. It is never tracked continuously. Declining consent does not affect registration.</span>
        </p>
      </div>

      <div className="space-y-5">
        <div className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="location_consent"
              checked={data.location_consent}
              onChange={onChange}
              className="mt-1 w-4 h-4 rounded border-gray-300 text-[#F9C744] focus:ring-[#F9C744]"
            />
            <span className="text-sm text-gray-600 leading-relaxed">
              I consent to my location being recorded once at registration for fraud prevention purposes as per the Digital Personal Data Protection Act, 2023.
            </span>
          </label>
          {errors.location_consent && <p className="text-xs text-red-500">{errors.location_consent}</p>}
        </div>

        {data.location_consent && (
          <div className="bg-gray-50/80 backdrop-blur-sm p-5 rounded-xl border-2 border-gray-200">
            <Button
              type="button"
              onClick={handleCaptureLocation}
              loading={isCapturing}
              className="h-12 px-8 bg-gradient-to-r from-[#F9C744] to-[#E6B33D] hover:from-[#E6B33D] hover:to-[#D4A22E] text-[#06101E] font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Capture Location
            </Button>
            {locationStatus && (
              <p className={`text-sm mt-3 ${locationStatus.includes('✓') ? 'text-green-600' : 'text-yellow-600'}`}>
                {locationStatus}
              </p>
            )}
            {data.latitude && data.longitude && (
              <p className="text-xs text-gray-500 mt-1">
                Coordinates: {data.latitude.toFixed(4)}, {data.longitude.toFixed(4)}
              </p>
            )}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1 h-14 text-base rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
          >
            Back
          </Button>
          <Button
            type="button"
            fullWidth
            onClick={onNext}
            className="flex-1 h-14 text-base bg-gradient-to-r from-[#F9C744] to-[#E6B33D] hover:from-[#E6B33D] hover:to-[#D4A22E] text-[#06101E] font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-[#F9C744]/40 transform hover:scale-[1.02]"
          >
            Continue →
          </Button>
        </div>
      </div>
    </div>
  );
};

// Step 8: Review & Submit
const ReviewStep = ({ data, onBack, onSubmit, isLoading, errors, onChange }: any) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[#06101E]">Review & Submit</h2>
        <p className="text-gray-500 text-sm mt-1">Review all information before submitting</p>
      </div>

      <div className="bg-gray-50/80 backdrop-blur-sm rounded-xl p-5 border-2 border-gray-200 max-h-80 overflow-y-auto">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="font-medium text-gray-600">Full Name:</div>
          <div className="text-[#06101E] font-medium">{data.full_name}</div>

          <div className="font-medium text-gray-600">Date of Birth:</div>
          <div className="text-[#06101E]">{data.date_of_birth}</div>

          <div className="font-medium text-gray-600">Email:</div>
          <div className="text-[#06101E]">{data.email} {data.email_verified && '✓'}</div>

          <div className="font-medium text-gray-600">Mobile:</div>
          <div className="text-[#06101E]">{data.mobile} {data.mobile_verified && '✓'}</div>

          <div className="font-medium text-gray-600">Sponsor:</div>
          <div className="text-[#06101E]">{data.sponsor_id || 'None'}</div>

          <div className="font-medium text-gray-600">Placement Leg:</div>
          <div className="text-[#06101E] capitalize">{data.placement_leg || 'Auto'}</div>

          <div className="font-medium text-gray-600">Aadhaar:</div>
          <div className="text-[#06101E]">****{data.aadhaar_number?.slice(-4)} {data.aadhaar_verified && '✓'}</div>

          <div className="font-medium text-gray-600">PAN:</div>
          <div className="text-[#06101E]">{data.pan_number} {data.pan_verified && '✓'}</div>

          <div className="font-medium text-gray-600">Bank:</div>
          <div className="text-[#06101E]">{data.bank_name}</div>

          <div className="font-medium text-gray-600">Account No:</div>
          <div className="text-[#06101E]">****{data.bank_account_number?.slice(-4)}</div>

          <div className="font-medium text-gray-600">IFSC:</div>
          <div className="text-[#06101E]">{data.bank_ifsc_code}</div>

          <div className="font-medium text-gray-600">Location:</div>
          <div className="text-[#06101E]">{data.location_consent ? 'Granted' : 'Declined'}</div>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="terms_accepted"
            checked={data.terms_accepted}
            onChange={(e) => onChange({ target: { name: 'terms_accepted', value: e.target.checked } })}
            className="mt-1 w-4 h-4 rounded border-gray-300 text-[#F9C744] focus:ring-[#F9C744]"
          />
          <span className="text-sm text-gray-600 leading-relaxed">
            I accept the <Link href="/terms" className="text-[#B98F1E] hover:underline font-medium">Terms of Use</Link>
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="agreement_accepted"
            checked={data.agreement_accepted}
            onChange={(e) => onChange({ target: { name: 'agreement_accepted', value: e.target.checked } })}
            className="mt-1 w-4 h-4 rounded border-gray-300 text-[#F9C744] focus:ring-[#F9C744]"
          />
          <span className="text-sm text-gray-600 leading-relaxed">
            I accept the <Link href="/distributor-agreement" className="text-[#B98F1E] hover:underline font-medium">Distributor Agreement</Link>
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="code_of_conduct_accepted"
            checked={data.code_of_conduct_accepted}
            onChange={(e) => onChange({ target: { name: 'code_of_conduct_accepted', value: e.target.checked } })}
            className="mt-1 w-4 h-4 rounded border-gray-300 text-[#F9C744] focus:ring-[#F9C744]"
          />
          <span className="text-sm text-gray-600 leading-relaxed">
            I accept the <Link href="/code-of-conduct" className="text-[#B98F1E] hover:underline font-medium">Code of Conduct</Link>
          </span>
        </label>

        {(errors.terms_accepted || errors.agreement_accepted || errors.code_of_conduct_accepted) && (
          <p className="text-xs text-red-500">You must accept all terms to submit your application</p>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="flex-1 h-14 text-base rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
        >
          Back
        </Button>
        <Button
          type="button"
          fullWidth
          loading={isLoading}
          disabled={!data.terms_accepted || !data.agreement_accepted || !data.code_of_conduct_accepted}
          onClick={onSubmit}
          className="flex-1 h-14 text-base bg-gradient-to-r from-[#F9C744] to-[#E6B33D] hover:from-[#E6B33D] hover:to-[#D4A22E] text-[#06101E] font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-[#F9C744]/40 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Submit Application
        </Button>
      </div>
    </div>
  );
};

// Main Component with Side Panel
export const DistributorRegistrationFlow: React.FC = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const totalSteps = 8;

  const [formData, setFormData] = useState<DistributorFormData>({
    full_name: '',
    date_of_birth: '',
    email: '',
    mobile: '',
    password: '',
    confirm_password: '',
    sponsor_id: '',
    placement_leg: 'auto',
    email_verified: false,
    mobile_verified: false,
    aadhaar_number: '',
    aadhaar_consent: false,
    aadhaar_verified: false,
    pan_number: '',
    pan_verified: false,
    bank_account_holder_name: '',
    bank_account_number: '',
    bank_confirm_account_number: '',
    bank_ifsc_code: '',
    bank_name: '',
    bank_branch: '',
    bank_account_type: 'savings',
    location_consent: false,
    terms_accepted: false,
    agreement_accepted: false,
    code_of_conduct_accepted: false,
    account_type: 'distributor'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = [
    { title: 'Identity', component: IdentityStep },
    { title: 'Sponsor', component: SponsorStep },
    { title: 'Verification', component: VerificationStep },
    { title: 'Aadhaar', component: AadhaarStep },
    { title: 'PAN', component: PANStep },
    { title: 'Bank', component: BankStep },
    { title: 'Location', component: LocationStep },
    { title: 'Review', component: ReviewStep }
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      if (!formData.full_name.trim()) newErrors.full_name = 'Full name is required';
      if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';
      if (!formData.email) newErrors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Please enter a valid email';

      const cleanPhone = formData.mobile.replace(/\D/g, '');
      if (!formData.mobile) newErrors.mobile = 'Mobile number is required';
      else if (cleanPhone.length < 10) newErrors.mobile = 'Please enter a valid 10-digit number';

      if (!formData.password) newErrors.password = 'Password is required';
      else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
      if (formData.password !== formData.confirm_password) newErrors.confirm_password = 'Passwords do not match';
    }

    if (step === 3) {
      if (!formData.aadhaar_number) newErrors.aadhaar_number = 'Aadhaar number is required';
      else if (formData.aadhaar_number.length !== 12) newErrors.aadhaar_number = 'Please enter a valid 12-digit Aadhaar number';
      if (!formData.aadhaar_consent) newErrors.aadhaar_consent = 'You must consent to Aadhaar verification';
    }

    if (step === 4) {
      if (!formData.pan_number) newErrors.pan_number = 'PAN number is required';
      else if (formData.pan_number.length !== 10) newErrors.pan_number = 'Please enter a valid 10-character PAN';
    }

    if (step === 5) {
      if (!formData.bank_account_holder_name) newErrors.bank_account_holder_name = 'Account holder name is required';
      if (!formData.bank_name) newErrors.bank_name = 'Bank name is required';
      if (!formData.bank_account_number) newErrors.bank_account_number = 'Account number is required';
      if (formData.bank_account_number !== formData.bank_confirm_account_number) {
        newErrors.bank_confirm_account_number = 'Account numbers do not match';
      }
      if (!formData.bank_ifsc_code) newErrors.bank_ifsc_code = 'IFSC code is required';
      if (!formData.bank_account_type) newErrors.bank_account_type = 'Please select account type';
    }

    if (step === 7) {
      if (!formData.terms_accepted) newErrors.terms_accepted = 'You must accept the Terms of Use';
      if (!formData.agreement_accepted) newErrors.agreement_accepted = 'You must accept the Distributor Agreement';
      if (!formData.code_of_conduct_accepted) newErrors.code_of_conduct_accepted = 'You must accept the Code of Conduct';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      setFormError(null);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
    setFormError(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(7)) return;

    setIsLoading(true);
    setFormError(null);
    setSuccessMessage(null);

    try {
      const payload = {
        full_name: formData.full_name,
        date_of_birth: formData.date_of_birth,
        email: formData.email,
        mobile: formData.mobile,
        sponsor_id: formData.sponsor_id || undefined,
        placement_leg: formData.placement_leg,
        aadhaar_number: formData.aadhaar_number,
        aadhaar_verified: formData.aadhaar_verified,
        pan_number: formData.pan_number,
        pan_verified: formData.pan_verified,
        bank_details: {
          account_holder_name: formData.bank_account_holder_name,
          account_number: formData.bank_account_number,
          ifsc_code: formData.bank_ifsc_code,
          bank_name: formData.bank_name,
          branch: formData.bank_branch,
          account_type: formData.bank_account_type
        },
        location: formData.location_consent ? {
          latitude: formData.latitude,
          longitude: formData.longitude,
          consent_granted: true
        } : { consent_granted: false },
        terms_accepted: {
          terms_of_use: true,
          distributor_agreement: true,
          code_of_conduct: true,
          accepted_at: new Date().toISOString()
        },
        account_type: 'distributor'
      };

      console.log('Distributor Registration Payload:', payload);

      const response = await fetch('https://your-api.com/distributor/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed. Please try again.');
      }

      setSuccessMessage('Your distributor application has been submitted successfully! Our team will review and contact you within 3-5 business days.');

      localStorage.setItem('distributor_application', JSON.stringify({
        status: 'submitted',
        submitted_at: new Date().toISOString(),
        ...data
      }));

      setTimeout(() => {
        router.push('/distributor/application-status');
      }, 3000);

    } catch (err: any) {
      setFormError(err.message || 'Submission failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const StepComponent = steps[currentStep].component;

  return (
    <div className="h-screen flex bg-[#FAF8F4] overflow-hidden">
      {/* Left Panel - Branding (Stable/Fixed) */}
      <div className="hidden lg:flex lg:w-5/12 h-full relative overflow-hidden bg-gradient-to-br from-[#0F2038] via-[#06101E] to-[#030810] p-12 flex-col justify-between flex-shrink-0">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, #F9C744 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        {/* Decorative Elements */}
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-[#F9C744]/5 rounded-full blur-3xl" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-[#F9C744]/5 rounded-full blur-3xl" />

        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 0.2; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.5); }
          }
        `}</style>

        {/* Floating Dots */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 bg-[#F9C744] rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `pulse 3s ease-in-out ${Math.random() * 3}s infinite`
              }}
            />
          ))}
        </div>

        {/* Header */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-sm p-2.5 rounded-xl border border-white/10">
              <Logo width={32} height={32} showText={false} />
            </div>
            <span className="text-white/40 text-xs tracking-[0.2em] font-light">INDIEKONNECT</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 max-w-sm mx-auto">
          <div className="space-y-8">
            <div className="w-16 h-1 bg-gradient-to-r from-[#F9C744] to-[#E6B33D] rounded-full" />

            <h2 className="text-white text-4xl font-bold leading-tight">
              Become a<br />
              <span className="text-[#F9C744]">Distributor</span><br />
              <span className="text-2xl text-white/60 font-normal">Partner with us</span>
            </h2>

            <div className="space-y-4">
              <p className="text-[#8291A6] text-sm leading-relaxed">
                Join our network of trusted distributors. Access premium products, competitive pricing, and dedicated support.
              </p>

              <div className="space-y-3 text-xs text-[#5C6B80]">
                <div className="flex items-center gap-3 group cursor-default">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F9C744] group-hover:scale-150 transition-transform duration-300" />
                  <span>Access to 500+ brands</span>
                </div>
                <div className="flex items-center gap-3 group cursor-default">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F9C744] group-hover:scale-150 transition-transform duration-300" />
                  <span>Competitive wholesale pricing</span>
                </div>
                <div className="flex items-center gap-3 group cursor-default">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F9C744] group-hover:scale-150 transition-transform duration-300" />
                  <span>Dedicated account manager</span>
                </div>
                <div className="flex items-center gap-3 group cursor-default">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F9C744] group-hover:scale-150 transition-transform duration-300" />
                  <span>Marketing & sales support</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="relative z-10 flex items-center gap-8 text-xs">
          <div>
            <p className="text-white font-semibold text-lg">500+</p>
            <p className="text-[#5C6B80]">Brands Available</p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div>
            <p className="text-white font-semibold text-lg">200+</p>
            <p className="text-[#5C6B80]">Active Distributors</p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div>
            <p className="text-white font-semibold text-lg">98%</p>
            <p className="text-[#5C6B80]">Satisfaction Rate</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Form (Scrollable) */}
      <div className="flex-1 h-full overflow-y-auto px-4 py-6 lg:py-8">
        <div className="max-w-2xl mx-auto">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-6">
            <div className="flex justify-center mb-3">
              <Logo width={40} height={40} showText={false} />
            </div>
            <h1 className="text-2xl font-bold text-[#06101E]">Distributor Registration</h1>
            <p className="text-gray-500 text-sm">Complete all steps to become a Brand Affiliate</p>
          </div>

          {/* Progress Steps */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8 pb-3 px-1">
            {steps.map((step, index) => (
              <React.Fragment key={index}>
                <button
                  type="button"
                  onClick={() => { if (index <= currentStep) setCurrentStep(index); }}
                  className={`flex items-center gap-2 shrink-0 ${index <= currentStep ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
                      ${index < currentStep
                        ? 'bg-[#F9C744] text-[#06101E]'
                        : index === currentStep
                          ? 'bg-[#F9C744] text-[#06101E] ring-4 ring-[#F9C744]/30 shadow-lg scale-110'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                  >
                    {index < currentStep ? '✓' : index + 1}
                  </div>
                  <span className={`text-xs hidden sm:block whitespace-nowrap ${index === currentStep ? 'text-[#06101E] font-semibold' : 'text-gray-500'
                    }`}>
                    {step.title}
                  </span>
                </button>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 shrink-0 ${index < currentStep ? 'bg-[#F9C744]' : 'bg-gray-200'
                    }`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
            {/* Step Indicator */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs text-gray-400 font-medium">Step {currentStep + 1} of {totalSteps}</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#F9C744] to-[#E6B33D] rounded-full transition-all duration-500"
                    style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-[#F9C744] font-medium">{Math.round((currentStep + 1) / totalSteps * 100)}%</span>
              </div>
            </div>

            {/* Error/Success Messages */}
            {formError && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 p-4 rounded-xl border border-red-100 flex items-center gap-2">
                <span className="text-lg">❌</span>
                {formError}
              </div>
            )}
            {successMessage && (
              <div className="mb-4 text-sm text-green-600 bg-green-50 p-4 rounded-xl border border-green-100 flex items-center gap-2">
                <span className="text-lg">✅</span>
                {successMessage}
              </div>
            )}

            {/* Step Component */}
            <StepComponent
              data={formData}
              errors={errors}
              onChange={handleChange}
              onNext={handleNext}
              onBack={handleBack}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
          </div>

          {/* Footer Note */}
          <div className="text-center text-xs text-gray-400 mt-6">
            <p>All information is secure and encrypted</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistributorRegistrationFlow;