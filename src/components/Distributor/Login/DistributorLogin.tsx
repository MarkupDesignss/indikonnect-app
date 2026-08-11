// components/distributor/Login/DistributorLogin.tsx

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Logo } from '@/components/common/Logo';
import { ROUTES } from '@/lib/constants/routes';

interface LoginFormData {
    email: string;
    password: string;
    remember_me: boolean;
}

export const DistributorLogin: React.FC = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [formData, setFormData] = useState<LoginFormData>({
        email: '',
        password: '',
        remember_me: false
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Mock successful login
            console.log('Login attempt:', formData);

            // Store session
            localStorage.setItem('distributor_session', JSON.stringify({
                logged_in: true,
                email: formData.email,
                login_time: new Date().toISOString()
            }));

            // Redirect to dashboard
            router.push('/distributor/dashboard');

        } catch (err: any) {
            setFormError(err.message || 'Invalid email or password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-[#FAF8F4]">
            {/* Left Panel - Branding */}
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
                            Welcome<br />
                            <span className="text-[#F9C744]">Distributor</span><br />
                            <span className="text-2xl text-white/60 font-normal">Access your partner dashboard</span>
                        </h2>

                        <div className="space-y-4">
                            <p className="text-[#8291A6] text-sm leading-relaxed">
                                Manage your commissions, track sales, and grow your network all from one place.
                            </p>

                            <div className="space-y-3 text-xs text-[#5C6B80]">
                                <div className="flex items-center gap-3 group cursor-default">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#F9C744] group-hover:scale-150 transition-transform duration-300" />
                                    <span>Real-time commission tracking</span>
                                </div>
                                <div className="flex items-center gap-3 group cursor-default">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#F9C744] group-hover:scale-150 transition-transform duration-300" />
                                    <span>Network growth analytics</span>
                                </div>
                                <div className="flex items-center gap-3 group cursor-default">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#F9C744] group-hover:scale-150 transition-transform duration-300" />
                                    <span>Product catalog access</span>
                                </div>
                                <div className="flex items-center gap-3 group cursor-default">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#F9C744] group-hover:scale-150 transition-transform duration-300" />
                                    <span>Support & training resources</span>
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

            {/* Right Panel - Login Form */}
            <div className="flex-1 flex items-center justify-center px-4 py-8 lg:py-12">
                <div className="w-full max-w-md">
                    {/* Mobile Header */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <Logo width={48} height={48} showText={false} />
                        </div>
                        <h1 className="text-2xl font-bold text-[#06101E]">Distributor Login</h1>
                        <p className="text-gray-500 text-sm mt-1">Access your partner dashboard</p>
                    </div>

                    {/* Login Card */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                        {/* Header */}
                        <div className="hidden lg:block mb-8">
                            <h1 className="text-2xl font-bold text-[#06101E]">Welcome Back</h1>
                            <p className="text-gray-500 text-sm mt-1">Sign in to access your distributor dashboard</p>
                        </div>

                        {/* Error Message */}
                        {formError && (
                            <div className="mb-4 text-sm text-red-600 bg-red-50 p-4 rounded-xl border border-red-100 flex items-center gap-2">
                                <span className="text-lg">❌</span>
                                {formError}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <Input
                                    label="Email Address"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    error={errors.email}
                                    placeholder="john@example.com"
                                    required
                                    className="h-14 text-black px-4 border-gray-200 rounded-xl focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200"
                                    autoComplete="email"
                                />
                            </div>

                            <div>
                                <div className="relative">
                                    <Input
                                        label="Password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={handleChange}
                                        error={errors.password}
                                        placeholder="Enter your password"
                                        required
                                        className="h-14 text-black px-4 border-gray-200 rounded-xl focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200"
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-[46px] text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                    >
                                        {showPassword ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="remember_me"
                                        checked={formData.remember_me}
                                        onChange={handleChange}
                                        className="w-4 h-4 rounded border-gray-300 text-[#F9C744] focus:ring-[#F9C744]"
                                    />
                                    <span className="text-sm text-gray-600">Remember me</span>
                                </label>
                                <Link
                                    href="/distributor/forgot-password"
                                    className="text-sm text-[#B98F1E] hover:underline font-medium"
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            <Button
                                type="submit"
                                fullWidth
                                loading={isLoading}
                                className="h-14 text-black bg-gradient-to-r from-[#F9C744] to-[#E6B33D] hover:from-[#E6B33D] hover:to-[#D4A22E] text-[#06101E] font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-[#F9C744]/40 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                            >
                                Sign In
                            </Button>

                            <div className="text-center mt-4">
                                <p className="text-sm text-gray-500">
                                    Don't have an account?{' '}
                                    <Link
                                        href={ROUTES.auth.distributor.register}
                                        className="text-[#B98F1E] hover:underline font-semibold"
                                    >
                                        Register here
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </div>

                    {/* Footer Note */}
                    <div className="text-center text-xs text-gray-400 mt-6">
                        <p>Secure login · Protected by encryption</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DistributorLogin;