// src/lib/hooks/useLogout.ts

"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

import {
  performLogout,
  forceLogout,
  LogoutOptions,
} from "@/lib/services/logout.service.ts";

import { useStore } from "react-redux";
import type { AppStore } from "@/lib/redux/store";

export const useLogout = () => {
  const router = useRouter();
  const store = useStore() as AppStore;

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
    [router, store],
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
    [router, store],
  );

  return {
    logout,
    forceLogout: forceLogoutNow,
  };
};

export default useLogout;
