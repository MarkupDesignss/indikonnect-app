// src/app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useTokenCheck } from "@/hooks/useTokenCheck";
import { LandingScreen } from "../Screens";
import Indie from "../components/common/Home";

export default function Page() {
  const { hasToken } = useTokenCheck();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Debug logging
  useEffect(() => {
    if (isClient) {
      const distributorToken = localStorage.getItem("distributor_token");
      const customerToken = localStorage.getItem("auth_token");
      const userTypeFromStorage = localStorage.getItem("user_type");

      console.log("📊 Page State:", {
        hasToken,
        distributorToken: distributorToken ? `${distributorToken.substring(0, 20)}...` : 'NOT SET',
        customerToken: customerToken ? `${customerToken.substring(0, 20)}...` : 'NOT SET',
        userTypeFromStorage,
      });
    }
  }, [isClient, hasToken]);

  // Show loading while checking local storage
  if (hasToken === null || !isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F9C744] mx-auto"></div>
      </div>
    );
  }

  // If ANY token exists (customer or distributor), show Indie
  if (hasToken) {
    console.log("🚀 Navigating to Indie (User is logged in)");
    return <Indie />;
  }

  // No token, show landing
  console.log("🏠 No token, showing LandingScreen");
  return <LandingScreen />;
}