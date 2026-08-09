// components/customer/Registration/CustomerRegistrationForm.tsx

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/common/Input';
import { PhoneInput } from '@/components/common/PhoneInput';
import { Button } from '@/components/common/Button';
import { Logo } from '@/components/common/Logo';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants/routes';

interface CustomerRegistrationFormProps {
    onBack?: () => void;
}

export const CustomerRegistrationForm: React.FC<CustomerRegistrationFormProps> = ({
    onBack
}) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        country: 'India',
        company_name: '',
        terms_condition: false,
        account_type: 'customer' as const
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.full_name.trim()) {
            newErrors.full_name = 'Full name is required';
        } else if (formData.full_name.trim().split(' ').length < 2) {
            newErrors.full_name = 'Please enter your full name (First and Last name)';
        }

        if (!formData.email) {
            newErrors.email = 'Email address is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        const cleanPhone = formData.phone.replace(/\D/g, '');
        if (!formData.phone) {
            newErrors.phone = 'Phone number is required';
        } else if (cleanPhone.length < 10) {
            newErrors.phone = 'Please enter a valid 10-digit phone number';
        }

        if (!formData.country) {
            newErrors.country = 'Country is required';
        }

        if (!formData.company_name.trim()) {
            newErrors.company_name = 'Company name is required';
        }

        if (!formData.terms_condition) {
            newErrors.terms_condition = 'You must accept the Terms of Service and Privacy Policy';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        setFormError(null);
        setSuccessMessage(null);

        try {
            const requestBody = {
                email: formData.email,
                account_type: 'customer',
                full_name: formData.full_name.trim(),
                phone: formData.phone,
                country: formData.country,
                terms_condition: formData.terms_condition ? '1' : '0',
                company_name: formData.company_name.trim()
            };

            console.log('Customer Registration Payload:', requestBody);

            const response = await fetch('https://your-api.com/customer/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed. Please try again.');
            }

            const userData = {
                ...data,
                full_name: formData.full_name,
                email: formData.email,
                phone: formData.phone,
                company_name: formData.company_name,
                country: formData.country,
                account_type: 'customer',
                registered_at: new Date().toISOString()
            };

            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('currentUser', JSON.stringify(userData));

            setSuccessMessage('Account created successfully! Redirecting...');

            setTimeout(() => {
                router.push('/customer/dashboard');
            }, 1500);

        } catch (err: any) {
            setFormError(err.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
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

    return (
        <div className="min-h-screen flex bg-[#FAF8F4]">
            {/* Left Panel - Customer Branding */}
            <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden bg-gradient-to-br from-[#0F2038] via-[#06101E] to-[#030810] p-12 flex-col justify-between">
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

                {/* Animated dots */}
                <div className="absolute inset-0 opacity-10">
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-1 h-1 bg-[#F9C744] rounded-full"
                            style={{
                                top: `${Math.random() * 100}%`,
                                left: `${Math.random() * 100}%`,
                                animation: `pulse 3s ease-in-out ${Math.random() * 3}s infinite`
                            }}
                        />
                    ))}
                </div>

                <style>{`
                    @keyframes pulse {
                        0%, 100% { opacity: 0.2; transform: scale(1); }
                        50% { opacity: 0.8; transform: scale(1.5); }
                    }
                `}</style>

                {/* Header */}
                <div className="relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/10 backdrop-blur-sm p-2.5 rounded-xl border border-white/10">
                            <Logo width={32} height={32} showText={false} />
                        </div>
                        <span className="text-white/40 text-xs tracking-[0.2em] font-light">CUSTOMER PORTAL</span>
                    </div>
                </div>

                {/* Main Content */}
                <div className="relative z-10 max-w-sm mx-auto">
                    <div className="space-y-8">
                        <div className="w-16 h-1 bg-[#F9C744] rounded-full" />

                        <h2 className="text-white text-4xl font-bold leading-tight">
                            Welcome to<br />
                            <span className="text-[#F9C744]">IndiKonnect</span><br />
                            <span className="text-2xl text-white/60">Customer Platform</span>
                        </h2>

                        <div className="space-y-4">
                            <p className="text-[#8291A6] text-sm leading-relaxed">
                                Create your customer account to start ordering, track deliveries, and manage your purchases seamlessly.
                            </p>

                            <div className="flex flex-col gap-2 text-xs text-[#5C6B80]">
                                <div className="flex items-center gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#F9C744]" />
                                    <span>Easy ordering & reordering</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#F9C744]" />
                                    <span>Real-time delivery tracking</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#F9C744]" />
                                    <span>Secure & trusted platform</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Stats */}
                <div className="relative z-10 flex items-center gap-8 text-xs">
                    <div>
                        <p className="text-white font-semibold text-lg">10K+</p>
                        <p className="text-[#5C6B80]">Happy Customers</p>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div>
                        <p className="text-white font-semibold text-lg">98%</p>
                        <p className="text-[#5C6B80]">Satisfaction Rate</p>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div>
                        <p className="text-white font-semibold text-lg">4.9★</p>
                        <p className="text-[#5C6B80]">User Rating</p>
                    </div>
                </div>
            </div>

            {/* Right Panel - Customer Registration Form */}
            <div className="flex-1 flex items-center justify-center px-4 py-8 lg:py-12">
                <div className="w-full max-w-lg">
                    {/* Mobile Header */}
                    <div className="lg:hidden text-center mb-6">
                        <div className="flex justify-center mb-3">
                            <Logo width={40} height={40} showText={false} />
                        </div>
                        <h1 className="text-2xl font-bold text-[#06101E]">Customer Registration</h1>
                        <p className="text-gray-500 text-sm">Create your customer account</p>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] border border-gray-100/80 p-6 sm:p-8 lg:p-10">
                        {/* Form Header */}
                        <div className="hidden lg:block mb-8">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-[#B98F1E] text-xs font-semibold tracking-[0.2em]">
                                    CUSTOMER REGISTRATION
                                </span>
                                <div className="flex-1 h-px bg-gradient-to-r from-[#F9C744]/30 to-transparent" />
                            </div>
                            <h1 className="text-2xl font-bold text-[#06101E]">Create Customer Account</h1>
                            <p className="text-gray-500 text-sm mt-1">Fill in your details to start shopping</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Full Name */}
                            <div>
                                <Input
                                    label="Full Name"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    error={errors.full_name}
                                    placeholder="Enter your full name"
                                    required
                                    className="h-12 px-4 text-base rounded-xl border-gray-200 focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200 w-full"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <Input
                                    label="Email Address"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    error={errors.email}
                                    placeholder="Enter your email address"
                                    required
                                    className="h-12 px-4 text-base rounded-xl border-gray-200 focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200 w-full"
                                />
                            </div>

                            {/* Phone - Fixed with label */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">
                                    Phone Number <span className="text-red-500">*</span>
                                </label>
                                <PhoneInput
                                    value={formData.phone}
                                    onChange={(value) => {
                                        setFormData(prev => ({ ...prev, phone: value }));
                                        if (errors.phone) {
                                            const newErrors = { ...errors };
                                            delete newErrors.phone;
                                            setErrors(newErrors);
                                        }
                                    }}
                                    error={errors.phone}
                                    placeholder="Enter your phone number"
                                    className="h-12 px-0 py-2 text-base rounded-xl border-gray-200 focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200 w-full"
                                />
                            </div>

                            {/* Country & Company Name - Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium  text-gray-700">
                                            Country <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="country"
                                            value={formData.country}
                                            onChange={handleChange}
                                            className={`w-full h-12 px-4 rounded-xl border ${errors.country ? 'border-red-500' : 'border-gray-200'
                                                } focus:outline-none focus:ring-2 focus:ring-[#F9C744] focus:border-transparent bg-white transition-all text-sm appearance-none`}
                                            style={{
                                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                                                backgroundRepeat: 'no-repeat',
                                                backgroundPosition: 'right 1rem center',
                                                backgroundSize: '1.5rem 1.5rem',
                                                paddingRight: '2.5rem'
                                            }}
                                        >
                                            <option value="India">🇮🇳 India</option>
                                            <option value="United States">🇺🇸 United States</option>
                                            <option value="United Kingdom">🇬🇧 United Kingdom</option>
                                            <option value="Canada">🇨🇦 Canada</option>
                                            <option value="Australia">🇦🇺 Australia</option>
                                            <option value="Germany">🇩🇪 Germany</option>
                                            <option value="France">🇫🇷 France</option>
                                            <option value="UAE">🇦🇪 UAE</option>
                                            <option value="Singapore">🇸🇬 Singapore</option>
                                            <option value="Other">🌍 Other</option>
                                        </select>
                                        {errors.country && (
                                            <p className="text-xs text-red-500">{errors.country}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <Input
                                        label="Company / Business Name"
                                        name="company_name"
                                        value={formData.company_name}
                                        onChange={handleChange}
                                        error={errors.company_name}
                                        placeholder="Your company name"
                                        required
                                        className="h-12 px-4 text-base rounded-xl border-gray-200 focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200 w-full"
                                    />
                                </div>
                            </div>

                            {/* Terms & Conditions */}
                            <div className="space-y-1.5 pt-2">
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        name="terms_condition"
                                        checked={formData.terms_condition}
                                        onChange={handleChange}
                                        className="mt-1 w-4 h-4 rounded border-gray-300 text-[#F9C744] focus:ring-[#F9C744] focus:ring-offset-0 transition-all"
                                    />
                                    <span className="text-sm text-gray-600 leading-relaxed">
                                        I agree to the{' '}
                                        <Link href="/terms" className="text-[#B98F1E] hover:underline font-medium transition-colors">
                                            Terms of Service
                                        </Link>
                                        {' '}and{' '}
                                        <Link href="/privacy" className="text-[#B98F1E] hover:underline font-medium transition-colors">
                                            Privacy Policy
                                        </Link>
                                    </span>
                                </label>
                                {errors.terms_condition && (
                                    <p className="text-xs text-red-500">{errors.terms_condition}</p>
                                )}
                            </div>

                            {/* Error/Success Messages */}
                            {formError && (
                                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-xl border border-red-100 flex items-center gap-2">
                                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    {formError}
                                </div>
                            )}
                            {successMessage && (
                                <div className="text-sm text-green-600 bg-green-50 p-3 rounded-xl border border-green-100 flex items-center gap-2">
                                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    {successMessage}
                                </div>
                            )}

                            {/* Submit Button */}
                            <Button
                                onClick={() => router.push("/products")}
                                type="submit"
                                fullWidth
                                loading={isLoading}
                                disabled={!formData.terms_condition}
                                className="h-12 text-base font-semibold bg-gradient-to-r from-[#F9C744] to-[#E6B33D] hover:from-[#E6B33D] hover:to-[#D4A030] text-[#06101E] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_14px_rgba(249,199,68,0.3)] hover:shadow-[0_6px_20px_rgba(249,199,68,0.4)]"
                            >
                                Create Customer Account
                            </Button>

                            {/* Already have an account */}
                            <div className="text-center pt-2">
                                <p className="text-sm text-gray-500">
                                    Already have an account?{' '}
                                    <Link
                                        href={ROUTES.auth.customer.login}
                                        className="text-[#B98F1E] font-semibold hover:underline transition-colors"
                                    >
                                        Sign in
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerRegistrationForm;