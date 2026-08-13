// src/app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useTokenCheck } from "@/hooks/useTokenCheck";
import { LandingScreen } from "../Screens";
import Product from "../Screens/Inner/product/page";

export default function Page() {
  const hasToken = useTokenCheck();
  const [isClient, setIsClient] = useState(false);

  // ✅ Fix: Ensure component only renders on client-side to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show loading while checking local storage
  if (hasToken === null || !isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F9C744] mx-auto"></div>
      </div>
    );
  }

  // ✅ FIX: Agar koi bhi token (Customer ya Distributor) hai toh Product page
  // Agar koi token nahi hai toh Landing Screen
  return hasToken ? <Product /> : <LandingScreen />;
}