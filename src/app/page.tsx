"use client";

import { useEffect, useState } from "react";
import { useTokenCheck } from "@/hooks/useTokenCheck";
import { LandingScreen } from "../Screens";
import Indie from "../components/common/Home";
import DisclaimerModal from "../components/common/DisclaimerModal";

export default function Page() {
  const { hasToken } = useTokenCheck();

  const [isClient, setIsClient] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [consentGiven, setConsentGiven] = useState<boolean | null>(null);

  // Client mounted
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check localStorage consent
  useEffect(() => {
    if (!isClient) return;

    try {
      const consentStatus = localStorage.getItem("consent_given");

      console.log("🔍 Existing consent:", consentStatus);

      if (consentStatus === "true") {
        setConsentGiven(true);
        setShowDisclaimer(false);
        return;
      }

      if (consentStatus === "false") {
        setConsentGiven(false);
        setShowDisclaimer(false);
        return;
      }

      // No consent found
      const timer = window.setTimeout(() => {
        setShowDisclaimer(true);
      }, 3000);

      return () => window.clearTimeout(timer);
    } catch (error) {
      console.error("❌ Error reading consent:", error);

      const timer = window.setTimeout(() => {
        setShowDisclaimer(true);
      }, 3000);

      return () => window.clearTimeout(timer);
    }
  }, [isClient]);

  // ACCEPT
  const handleConsent = () => {
    try {
      localStorage.setItem("consent_given", "true");

      const savedValue = localStorage.getItem("consent_given");

      console.log("✅ Consent saved:", savedValue);

      setConsentGiven(true);
      setShowDisclaimer(false);
    } catch (error) {
      console.error("❌ Failed to save consent:", error);
    }
  };

  // DECLINE
  const handleDecline = () => {
    try {
      localStorage.setItem("consent_given", "false");

      const savedValue = localStorage.getItem("consent_given");

      console.log("❌ Decline saved:", savedValue);

      setConsentGiven(false);
      setShowDisclaimer(false);
    } catch (error) {
      console.error("❌ Failed to save decline:", error);
    }
  };

  // Loading
  if (hasToken === null || !isClient) {
    return (
      <div className="flex min-h-screen items-center justify-center overflow-hidden">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#F9C744]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden">
      {hasToken ? <Indie /> : <LandingScreen />}

      {showDisclaimer && (
        <DisclaimerModal
          onConsent={handleConsent}
          onDecline={handleDecline}
        />
      )}
    </div>
  );
}