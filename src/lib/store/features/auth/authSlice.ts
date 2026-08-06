import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { setAuthData, removeAuthData, getUser, getRefreshToken } from '../../../utils/cookies';
import type { User, AuthState, ConfirmRegistrationRequest } from '../../../types/auth.types';

const initialState: AuthState = {
    user: getUser() || null,
    token: null,
    refreshToken: getRefreshToken() || null,
    tempToken: null,
    isAuthenticated: false,
    isLoading: false,
    phoneNumber: null,
    otpData: null,
    view: 'login',
    otpSent: false,
    timer: 0,
    error: null,
    registrationData: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (
            state,
            action: PayloadAction<{ user: User; token: string; refreshToken: string }>
        ) => {
            const { user, token, refreshToken } = action.payload;
            state.user = user;
            state.token = token;
            state.refreshToken = refreshToken;
            state.isAuthenticated = true;
            state.phoneNumber = user.phone || null;
            state.otpData = null;
            state.error = null;
            state.tempToken = null;
            state.view = 'login';
            setAuthData(token, refreshToken, user);
        },
        setTempToken: (state, action: PayloadAction<string>) => {
            state.tempToken = action.payload;
        },
        setMobile: (state, action: PayloadAction<string>) => {
            state.phoneNumber = action.payload;
        },
        setTimer: (state, action: PayloadAction<number>) => {
            state.timer = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
        setView: (state, action: PayloadAction<'login' | 'otp' | 'register'>) => {
            state.view = action.payload;
        },
        setOTPSent: (state, action: PayloadAction<boolean>) => {
            state.otpSent = action.payload;
        },
        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
        },
        setOtpData: (state, action: PayloadAction<{ phone: string; otp: number }>) => {
            state.otpData = action.payload;
        },
        clearOtpData: (state) => {
            state.otpData = null;
        },
        setRegistrationData: (state, action: PayloadAction<Partial<ConfirmRegistrationRequest>>) => {
            state.registrationData = { ...state.registrationData, ...action.payload };
        },
        clearRegistrationData: (state) => {
            state.registrationData = null;
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.refreshToken = null;
            state.tempToken = null;
            state.isAuthenticated = false;
            state.phoneNumber = null;
            state.otpData = null;
            state.error = null;
            state.view = 'login';
            state.otpSent = false;
            state.timer = 0;
            state.registrationData = null;
            removeAuthData();
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
    },
});

export const {
    setCredentials,
    setTempToken,
    setMobile,
    setTimer,
    clearError,
    setView,
    setOTPSent,
    setError,
    setOtpData,
    clearOtpData,
    setRegistrationData,
    clearRegistrationData,
    logout,
    setLoading,
} = authSlice.actions;

export default authSlice.reducer;