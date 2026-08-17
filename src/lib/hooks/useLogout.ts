// src/lib/hooks/useLogout.ts

import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import {
  performLogout,
  forceLogout,
  LogoutOptions,
} from "../services/logout.service";
import { store } from "../redux/store";

export const useLogout = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const logout = useCallback(
    async (options?: LogoutOptions) => {
      // ✅ Always redirect to home page after logout
      // Home page will show LandingScreen if no token exists
      const redirectTo = "/"; // Always go to home page

      console.log("🔓 Logging out, redirecting to:", redirectTo);

      // Pass the redirect URL to the service
      return performLogout(store, router, {
        ...options,
        redirectTo: options?.redirectTo || redirectTo,
      });
    },
    [router],
  );

  const forceLogoutNow = useCallback(
    (redirectTo = "/") => {
      // ✅ Always redirect to home page
      console.log("🔓 Force logging out, redirecting to:", redirectTo);
      forceLogout(store, router, redirectTo);
    },
    [router],
  );

  return { logout, forceLogout: forceLogoutNow };
};
