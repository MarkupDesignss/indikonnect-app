"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTokenCheck } from "@/hooks/useTokenCheck";
import { LandingScreen } from "../Screens";
import DisclaimerModal from "@/components/common/DisclaimerModal";

export default function Page() {
  const { hasToken } = useTokenCheck();
  const router = useRouter();

  const [isClient, setIsClient] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const disclaimerAccepted = localStorage.getItem("disclaimer_accepted");

    if (disclaimerAccepted !== "true") {
      setShowDisclaimer(true);
    }
  }, []);

  // ✅ Token hai to /home pe redirect
  useEffect(() => {
    if (!isClient || hasToken === null) return;

    if (hasToken === true) {
      router.replace("/home");
    }
  }, [isClient, hasToken, router]);

  const handleDisclaimerAccept = () => {
    localStorage.setItem("disclaimer_accepted", "true");
    setShowDisclaimer(false);
  };

  const handleDisclaimerDecline = () => {
    setShowDisclaimer(false);
  };

  if (!isClient || hasToken === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F9C744]" />
      </div>
    );
  }

  // Token hai → redirect ho raha hai
  if (hasToken === true) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F9C744]" />
      </div>
    );
  }

  // Guest → LandingScreen
  return (
    <>
      <LandingScreen />

      {showDisclaimer && (
        <DisclaimerModal
          onConsent={handleDisclaimerAccept}
          onDecline={handleDisclaimerDecline}
        />
      )}
    </>
  );
}