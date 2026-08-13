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
      // Auto-detect the correct redirect URL based on who is logged in
      let redirectTo = "/auth/customer/login"; // Default

      if (typeof window !== "undefined") {
        const userType = localStorage.getItem("user_type");
        const distributorToken = localStorage.getItem("distributor_token");
        const authToken = localStorage.getItem("auth_token");

        if (userType === "distributor" || distributorToken) {
          redirectTo = "/auth/distributor/login";
        } else if (userType === "customer" || authToken) {
          redirectTo = "/auth/customer/login";
        }
      }

      // Pass the detected URL to the service, or use the one from options
      return performLogout(store, router, {
        ...options,
        redirectTo: options?.redirectTo || redirectTo,
      });
    },
    [router],
  );

  const forceLogoutNow = useCallback(
    (redirectTo = "/auth/customer/login") => {
      // Auto-detect here as well
      let finalRedirect = redirectTo;
      if (typeof window !== "undefined") {
        const userType = localStorage.getItem("user_type");
        const distributorToken = localStorage.getItem("distributor_token");
        if (userType === "distributor" || distributorToken) {
          finalRedirect = "/auth/distributor/login";
        }
      }
      forceLogout(store, router, finalRedirect);
    },
    [router],
  );

  return { logout, forceLogout: forceLogoutNow };
};
