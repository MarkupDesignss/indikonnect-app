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
   * IMPORTANT:
   * Next.js router automatically applies the current app basePath.
   *
   * Customer:
   * router.push("/")
   * -> /indiekonnect-web/
   *
   * Distributor:
   * router.push("/")
   * -> /indiekonnect-distributor/
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
   * Also uses "/" because Next.js adds the current basePath.
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
