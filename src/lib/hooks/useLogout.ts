// src/lib/hooks/useLogout.ts

"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

import {
  performLogout,
  forceLogout,
  LogoutOptions,
} from "../services/logout.service";

import { store } from "../redux/store";

export const useLogout = () => {
  const router = useRouter();

  /**
   * Normal logout
   *
   * After logout:
   * - Customer domain  -> customer home "/"
   * - Distributor domain -> distributor home "/"
   *
   * The actual token cleanup is handled by logout.service.
   */
  const logout = useCallback(
    async (options?: LogoutOptions) => {
      const redirectTo = options?.redirectTo || "/";

      return performLogout(store, router, {
        ...options,
        redirectTo,
      });
    },
    [router],
  );

  /**
   * Force logout
   *
   * Used when token/session becomes invalid.
   * Redirect remains on the current domain.
   */
  const forceLogoutNow = useCallback(
    (redirectTo = "/") => {
      forceLogout(store, router, redirectTo);
    },
    [router],
  );

  return {
    logout,
    forceLogout: forceLogoutNow,
  };
};

export default useLogout;
