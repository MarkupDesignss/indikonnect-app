// src/hooks/useTokenCheck.ts
"use client";

import { useEffect, useState } from "react";

export const useTokenCheck = () => {
  const [hasToken, setHasToken] = useState<boolean | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [isDistributor, setIsDistributor] = useState<boolean>(false);

  useEffect(() => {
    const checkToken = () => {
      if (typeof window !== "undefined") {
        // Check both tokens
        const distributorToken = localStorage.getItem("distributor_token");
        const customerToken = localStorage.getItem("auth_token");
        const userTypeFromStorage = localStorage.getItem("user_type");

        console.log("🔍 Token Check:", {
          distributorToken: distributorToken
            ? `${distributorToken.substring(0, 20)}...`
            : "NOT SET",
          customerToken: customerToken
            ? `${customerToken.substring(0, 20)}...`
            : "NOT SET",
          userTypeFromStorage,
        });

        // Check if any token exists
        const hasDistributorToken =
          !!distributorToken && distributorToken.length > 10;
        const hasCustomerToken = !!customerToken && customerToken.length > 10;
        const tokenExists = hasDistributorToken || hasCustomerToken;

        setHasToken(tokenExists);

        // Determine user type
        if (hasDistributorToken) {
          setUserType("distributor");
          setIsDistributor(true);
        } else if (hasCustomerToken) {
          setUserType("customer");
          setIsDistributor(false);
        } else {
          setUserType(null);
          setIsDistributor(false);
        }
      }
    };

    checkToken();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (
        e.key === "distributor_token" ||
        e.key === "auth_token" ||
        e.key === "user_type"
      ) {
        console.log(`🔄 Storage changed: ${e.key}`);
        checkToken();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return { hasToken, userType, isDistributor };
};
