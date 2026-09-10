// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTokenCheck } from "@/hooks/useTokenCheck";
import { TokenManager } from "@/lib/redux/api/baseApi";
import { LandingScreen } from "../Screens";
import Indie from "../components/common/IndieKonnectHome/Home";
import DisclaimerModal from "@/components/common/DisclaimerModal";

export default function Page() {
  const { hasToken } = useTokenCheck();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // Check disclaimer status from localStorage
    const disclaimerAccepted = localStorage.getItem("disclaimer_accepted");
    if (disclaimerAccepted !== "true") {
      setShowDisclaimer(true);
    }

    if (typeof window !== "undefined") {
      const isLoggedIn = localStorage.getItem("is_logged_in");
      const authToken = localStorage.getItem("auth_token");
      const distributorToken = localStorage.getItem("distributor_token");

      console.log("🔍 Page initialization check:", {
        hasToken,
        isLoggedIn,
        authToken: !!authToken,
        distributorToken: !!distributorToken,
      });
    }
  }, [router, hasToken]);

  const handleDisclaimerAccept = () => {
    localStorage.setItem("disclaimer_accepted", "true");
    setShowDisclaimer(false);
  };

  if (hasToken === null || !isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F9C744] mx-auto"></div>
      </div>
    );
  }

  // Logged in user (both customer and distributor)
  if (hasToken) {
    return <Indie />;
  }

  // Landing page for non-logged in users
  return (
    <>
      <LandingScreen />
      {showDisclaimer && (
        <DisclaimerModal
          onConsent={handleDisclaimerAccept}
          onDecline={() => setShowDisclaimer(false)}
        />
      )}
    </>
  );
}