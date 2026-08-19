"use client";

import { useEffect, useState } from "react";
import { useTokenCheck } from "@/hooks/useTokenCheck";
import { LandingScreen } from "../Screens";
import Indie from "../components/common/Home";
import DisclaimerModal from "@/components/common/DisclaimerModal";

export default function Page() {
  const { hasToken } = useTokenCheck();
  const [isClient, setIsClient] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // Check disclaimer status from localStorage
    const disclaimerAccepted = localStorage.getItem("disclaimer_accepted");

    if (disclaimerAccepted !== "true") {
      setShowDisclaimer(true);
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      const distributorToken = localStorage.getItem("distributor_token");
      const customerToken = localStorage.getItem("auth_token");
      const userTypeFromStorage = localStorage.getItem("user_type");

      console.log("📊 Page State:", {
        hasToken,
        distributorToken: distributorToken
          ? `${distributorToken.substring(0, 20)}...`
          : "NOT SET",
        customerToken: customerToken
          ? `${customerToken.substring(0, 20)}...`
          : "NOT SET",
        userTypeFromStorage,
      });
    }
  }, [isClient, hasToken]);

  // Handle I Agree
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

  // Logged in user
  if (hasToken) {
    return <Indie />;
  }

  // Landing page
  return (
    <>
      <LandingScreen />

      {showDisclaimer && (
        <DisclaimerModal
          onConsent={handleDisclaimerAccept}
          onDecline={() => {
            setShowDisclaimer(false);
          }}
        />
      )}
    </>
  );
}