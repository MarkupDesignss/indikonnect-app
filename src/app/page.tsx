// src/app/page.tsx
"use client";

import { useTokenCheck } from "@/hooks/useTokenCheck";
import { LandingScreen } from "../Screens";
import Product from "../Screens/Inner/product/page";

export default function Page() {
  const hasToken = useTokenCheck();

  // Show loading while checking
  if (hasToken === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  // If token exists → show Product, else → show Landing
  return hasToken ? <Product /> : <LandingScreen />;
}
