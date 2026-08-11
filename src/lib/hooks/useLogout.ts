// src/lib/hooks/useLogout.ts

import { useDispatch, } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { performLogout, forceLogout, LogoutOptions } from '../services/logout.service';
import { store } from '../redux/store';

export const useLogout = () => {
    const dispatch = useDispatch();
    const router = useRouter();

    const logout = useCallback(
        async (options?: LogoutOptions) => {
            return performLogout(store, router, options);
        },
        [router]
    );

    const forceLogoutNow = useCallback(
        (redirectTo = '/auth/customer/login') => {
            forceLogout(store, router, redirectTo);
        },
        [router]
    );

    return { logout, forceLogout: forceLogoutNow };
};