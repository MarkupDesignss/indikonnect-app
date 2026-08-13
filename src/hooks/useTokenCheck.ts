// src/hooks/useTokenCheck.ts
"use client";

import { useEffect, useState } from "react";

export const useTokenCheck = () => {
  const [hasToken, setHasToken] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // 1. Check for Customer Token
      const customerToken = localStorage.getItem("auth_token");

      // 2. Check for Distributor Token
      const distributorToken = localStorage.getItem("distributor_token");

      // 3. Check if user_type is explicitly set
      const userType = localStorage.getItem("user_type");

      // ✅ FIX: Distributor ke liye 'distributor_token' check karo, Customer ke liye 'auth_token'
      // Agar koi bhi token hai, toh user logged in hai.
      const tokenExists = !!(customerToken || distributorToken);

      // Agar token exist karta hai ya user_type set hai, toh true karo
      setHasToken(tokenExists);
    } else {
      setHasToken(false);
    }
  }, []);

  return hasToken;
};
