"use client";

import { useSyncExternalStore } from "react";
import { getAppType, DISTRIBUTOR_BASE_PATH, type AppType } from "@/lib/appConfig";

const authKeys = new Set([
  "auth_token", "refresh_token", "distributor_token", "distributor_refresh_token",
  "customer_user_data", "distributor_user_data", "customer_user_type",
  "distributor_user_type", "customer_is_logged_in", "distributor_is_logged_in",
]);

function subscribe(notify: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || authKeys.has(event.key)) notify();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener("auth-change", notify);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("auth-change", notify);
  };
}

function getServerSnapshot(): string {
  const appType = process.env.NEXT_PUBLIC_APP_BASE_PATH === DISTRIBUTOR_BASE_PATH ? "distributor" : "customer";
  return `${appType}:pending`;
}

function getSnapshot(): string {
  const appType = getAppType();
  try {
    const token = localStorage.getItem(appType === "distributor" ? "distributor_token" : "auth_token");
    return `${appType}:${Boolean(token && token.length > 10)}`;
  } catch {
    return `${appType}:false`;
  }
}

export const useTokenCheck = () => {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [type, status] = snapshot.split(":");
  const appType: AppType = type === "distributor" ? "distributor" : "customer";
  const hasToken = status === "pending" ? null : status === "true";
  return {
    hasToken,
    userType: hasToken ? appType : null,
    isDistributor: hasToken === true && appType === "distributor",
    appType,
    isCustomerApp: appType === "customer",
    isDistributorApp: appType === "distributor",
    isGuest: hasToken === false,
  };
};
