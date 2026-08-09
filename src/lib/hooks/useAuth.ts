// lib/hooks/useAuth.ts

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AuthState {
    user: any | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

export const useAuth = () => {
    const router = useRouter();
    const [state, setState] = useState<AuthState>({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
    });

    // Load user from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                setState(prev => ({
                    ...prev,
                    user,
                    isAuthenticated: true,
                }));
            } catch {
                localStorage.removeItem('currentUser');
            }
        }
    }, []);

    const setLoading = (isLoading: boolean) => {
        setState(prev => ({ ...prev, isLoading }));
    };

    const setError = (error: string | null) => {
        setState(prev => ({ ...prev, error }));
    };

    // Send OTP
    const sendOTP = useCallback(async (phoneNumber: string) => {
        setLoading(true);
        setError(null);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setLoading(false);
            return { success: true };
        } catch (error: any) {
            setError(error.message || 'Failed to send OTP');
            setLoading(false);
            throw error;
        }
    }, []);

    // Verify OTP
    const verifyOTP = useCallback(async (phoneNumber: string, otp: string) => {
        setLoading(true);
        setError(null);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Check for existing user
            const storedUser = localStorage.getItem(`user_${phoneNumber}`);
            if (storedUser) {
                const user = JSON.parse(storedUser);
                setState(prev => ({
                    ...prev,
                    user,
                    isAuthenticated: true,
                    isLoading: false,
                }));
                localStorage.setItem('currentUser', JSON.stringify(user));
                return user;
            }

            setLoading(false);
            return null;
        } catch (error: any) {
            setError(error.message || 'Invalid OTP');
            setLoading(false);
            throw error;
        }
    }, []);

    // Register Customer
    const registerCustomer = useCallback(async (data: any) => {
        setLoading(true);
        setError(null);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            const user = {
                id: `CUST${Date.now().toString().slice(-6)}`,
                ...data,
                role: 'customer',
                isVerified: true,
                createdAt: new Date().toISOString(),
            };

            localStorage.setItem(`user_${data.phoneNumber}`, JSON.stringify(user));
            localStorage.setItem('currentUser', JSON.stringify(user));

            setState(prev => ({
                ...prev,
                user,
                isAuthenticated: true,
                isLoading: false,
            }));

            return user;
        } catch (error: any) {
            setError(error.message || 'Registration failed');
            setLoading(false);
            throw error;
        }
    }, []);

    // Register Distributor
    const registerDistributor = useCallback(async (data: any) => {
        setLoading(true);
        setError(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));

            const user = {
                id: `DIST${Date.now().toString().slice(-6)}`,
                distributorId: `IND${Date.now().toString().slice(-6)}`,
                ...data,
                role: 'distributor',
                kycStatus: 'pending',
                status: 'active',
                createdAt: new Date().toISOString(),
            };

            localStorage.setItem(`user_${data.phoneNumber}`, JSON.stringify(user));
            localStorage.setItem('currentUser', JSON.stringify(user));

            setState(prev => ({
                ...prev,
                user,
                isAuthenticated: true,
                isLoading: false,
            }));

            return user;
        } catch (error: any) {
            setError(error.message || 'Registration failed');
            setLoading(false);
            throw error;
        }
    }, []);

    // Submit KYC
    const submitKYC = useCallback(async (data: any) => {
        setLoading(true);
        setError(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));

            const storedUser = localStorage.getItem('currentUser');
            if (storedUser) {
                const user = JSON.parse(storedUser);
                const updatedUser = {
                    ...user,
                    ...data,
                    kycStatus: 'submitted',
                };
                localStorage.setItem(`user_${user.phoneNumber}`, JSON.stringify(updatedUser));
                localStorage.setItem('currentUser', JSON.stringify(updatedUser));

                setState(prev => ({
                    ...prev,
                    user: updatedUser,
                    isLoading: false,
                }));

                return updatedUser;
            }

            throw new Error('User not found');
        } catch (error: any) {
            setError(error.message || 'KYC submission failed');
            setLoading(false);
            throw error;
        }
    }, []);

    // Logout
    const logout = useCallback(() => {
        localStorage.removeItem('currentUser');
        setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
        });
        router.push('/');
    }, [router]);

    return {
        ...state,
        sendOTP,
        verifyOTP,
        registerCustomer,
        registerDistributor,
        submitKYC,
        logout,
    };
};