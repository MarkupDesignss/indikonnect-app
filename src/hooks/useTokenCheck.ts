"use client";

import { useEffect, useState } from "react";
import { getAppType, type AppType } from "@/lib/appConfig";

export const useTokenCheck = () => {
  const [hasToken, setHasToken] = useState<boolean | null>(null);

  // Current authenticated app user type
  const [userType, setUserType] = useState<string | null>(null);

  // Current authenticated distributor
  const [isDistributor, setIsDistributor] = useState<boolean>(false);

  // Current application
  const [appType, setAppType] = useState<AppType>(() =>
    typeof window !== "undefined" ? getAppType() : "customer",
  );

  const checkToken = () => {
    if (typeof window === "undefined") {
      return;
    }

    const currentAppType = getAppType();

    setAppType(currentAppType);

    // ==========================================
    // DISTRIBUTOR APP
    // /indiekonnect-distributor/
    // ==========================================

    if (currentAppType === "distributor") {
      const distributorToken = localStorage.getItem("distributor_token");

      const validDistributorToken =
        !!distributorToken && distributorToken.length > 10;

      setHasToken(validDistributorToken);

      if (validDistributorToken) {
        setUserType("distributor");
        setIsDistributor(true);
      } else {
        setUserType(null);
        setIsDistributor(false);
      }

      return;
    }

    // ==========================================
    // CUSTOMER APP
    // /indiekonnect-web/
    // ==========================================

    const customerToken = localStorage.getItem("auth_token");

    const validCustomerToken = !!customerToken && customerToken.length > 10;

    setHasToken(validCustomerToken);

    if (validCustomerToken) {
      setUserType("customer");
      setIsDistributor(false);
    } else {
      setUserType(null);
      setIsDistributor(false);
    }
  };

  useEffect(() => {
    checkToken();

    const handleStorageChange = (event: StorageEvent) => {
      // Same-origin apps share localStorage.
      // Re-check when either app's authentication data changes.
      if (
        event.key === "auth_token" ||
        event.key === "refresh_token" ||
        event.key === "distributor_token" ||
        event.key === "distributor_refresh_token" ||
        event.key === "customer_user_data" ||
        event.key === "distributor_user_data" ||
        event.key === "customer_user_type" ||
        event.key === "distributor_user_type" ||
        event.key === "customer_is_logged_in" ||
        event.key === "distributor_is_logged_in"
      ) {
        checkToken();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return {
    hasToken,

    userType,

    isDistributor,

    // Current app:
    appType,

    // Convenient flags:
    isCustomerApp: appType === "customer",

    isDistributorApp: appType === "distributor",

    // Guest user:
    isGuest: hasToken === false,
  };
};
