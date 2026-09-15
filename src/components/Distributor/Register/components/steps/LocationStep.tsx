"use client";

import React, { useState, useEffect } from "react";
import {
  PlusCircle,
  AlertTriangle,
  X,
  Loader2,
  CheckCircle,
  MapPin,
  Navigation,
  Building2,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { InfoBox } from "../InfoBox";
import { FormActions } from "../FormActions";
import { StepProps } from "../../types";
import { useAppDispatch } from "@/lib/redux/hooks";
import { showToast } from "@/lib/slices/toastSlice";
import {
  useStep6LocationMutation,
  useLazyGetStepDataQuery,
  distributorAuthApi,
} from "../../../../../lib/redux/api/distributor/distributorauthApis";
import authApi from "@/lib/redux/api/authApi";

const theme = {
  font: "'Inter', 'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, sans-serif",
  gold: "#F9C744",
  goldDark: "#E6B33D",
  goldDeep: "#C9922A",
  navy: "#06101E",
  navySoft: "#0B1B2E",
};

const BLOCKED_STATE = "telangana";
const BLOCKED_MESSAGE =
  "Telangana users can't register directly. Please contact Admin.";

/** Result of reverse-geocoding a coordinate */
interface LocationInfo {
  state: string | null;
  city: string | null;
  district: string | null;
  country: string | null;
}

export const LocationStep: React.FC<StepProps> = ({
  data,
  errors,
  onChange,
  onNext,
  onBack,
  onBackToMobile,
}) => {
  const dispatch = useAppDispatch();
  const [isCapturing, setIsCapturing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [locationStatus, setLocationStatus] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isDataLoadedFromAPI, setIsDataLoadedFromAPI] = useState(false);

  // ===== Telangana blocking state =====
  const [isTelanganaBlocked, setIsTelanganaBlocked] = useState(false);
  const [detectedState, setDetectedState] = useState<string>("");
  const [detectedCity, setDetectedCity] = useState<string>("");

  // ✅ Local "captured" flag — immediate source-of-truth for enabling Submit
  const [hasCapturedLocation, setHasCapturedLocation] = useState(false);

  // API Hooks
  const [step6Location] = useStep6LocationMutation();
  const [getStepData, { isLoading: isLoadingStepData }] =
    useLazyGetStepDataQuery();

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showConfirmModal) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.top = `-${window.scrollY}px`;
    } else {
      const scrollY = document.body.style.top;
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0", 10) * -1);
      }
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";
    };
  }, [showConfirmModal]);

  // ==========================================
  // ✅ LOAD PHONE NUMBER (multi-source + email fallback)
  // ==========================================
  useEffect(() => {
    const candidates = [
      localStorage.getItem("distributor_verified_phone"),
      localStorage.getItem("distributor_mobile"),
      localStorage.getItem("distributor_phone"),
      localStorage.getItem("verified_phone"),
      localStorage.getItem("phone"),
    ].filter(Boolean) as string[];

    const savedPhone = candidates[0] || "";

    if (savedPhone) {
      const cleaned = savedPhone.replace(/\s+/g, "").replace(/^0+/, "");
      const formattedPhone = cleaned.startsWith("+")
        ? cleaned
        : `+91${cleaned}`;
      setPhoneNumber(formattedPhone);
      console.log("📞 Phone number loaded:", formattedPhone);
    } else if (data.email) {
      // 🔁 Fallback: use email as identifier if phone missing
      console.warn(
        "⚠ No phone found in localStorage. Falling back to email as identifier.",
      );
      setPhoneNumber(data.email);
    } else {
      console.warn("⚠ Neither phone nor email found. User may need re-verify.");
    }
  }, [data.email]);

  // ==========================================
  // ✅ FETCH STEP DATA FROM API
  // ==========================================

  const fetchStepData = async () => {
    const email = data.email || localStorage.getItem("distributor_email") || "";

    if (!email) {
      console.log("No email found to fetch step data");
      return;
    }

    try {
      console.log("📡 Fetching step 6 data for email:", email);
      const response = await getStepData({
        step: "6",
        phone: email,
      }).unwrap();

      if (response.status && response.step_data) {
        console.log("✅ Step 6 data fetched:", response);

        const userData = response.step_data.user;
        const profileData = response.step_data.distributor_profile;

        if (userData.location_consent_given === 1) {
          onChange({
            target: {
              name: "location_consent",
              value: true,
            },
          } as any);

          if (profileData.location_consent === 1) {
            onChange({
              target: {
                name: "location_verified",
                value: true,
              },
            } as any);

            setLocationStatus("✓ Location consent already submitted");
          }

          setIsDataLoadedFromAPI(true);

          dispatch(
            showToast({
              message: "Loaded location data successfully",
              type: "success",
            }),
          );
        }
      }
    } catch (error: any) {
      console.error("Error fetching step 6 data:", error);
      if (error?.status !== 404) {
        dispatch(
          showToast({
            message: error?.data?.message || "Failed to load location data",
            type: "error",
          }),
        );
      }
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const emailFromProps = data.email;
      const emailFromStorage = localStorage.getItem("distributor_email");
      const email = emailFromProps || emailFromStorage || "";

      if (email) {
        console.log("📧 Loading location data for email:", email);
        await fetchStepData();
      }
    };

    loadData();
  }, [data.email]);

  // ==========================================
  // ✅ CLEAR REGISTRATION DATA
  // ==========================================

  const clearAllRegistrationData = () => {
    const itemsToRemove = [
      "verified_phone",
      "phone_verified",
      "distributor_mobile",
      "verified_email",
      "email_verified",
      "temp_token",
      "distributor_check_status",
      "distributor_phone",
      "distributor_exists",
      "distributor_status",
      "user_data",
      "customer_otp",
      "customer_phone",
      "distributor_application",
      "distributor_application_data",
      "distributor_application_status",
      "distributor_verified_phone",
      "distributor_phone_verified",
      "distributor_verified_email",
      "distributor_email_verified",
      "distributor_temp_token",
      "distributor_email",
    ];

    itemsToRemove.forEach((item) => {
      localStorage.removeItem(item);
    });

    try {
      dispatch(distributorAuthApi.util.resetApiState());
      dispatch(authApi.util.resetApiState());
    } catch (error) {
      console.error("Error resetting API:", error);
    }
  };

  const handleNewRegistration = () => {
    clearAllRegistrationData();
    setShowConfirmModal(false);
    if (onBackToMobile) {
      onBackToMobile();
    }
  };

  // ==========================================
  // ✅ REVERSE GEOCODE (lat/lng → state + city)
  // Free open-source providers with fallbacks
  // ==========================================

  const fetchFromBigDataCloud = async (
    lat: number,
    lng: number,
  ): Promise<LocationInfo | null> => {
    try {
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
      );
      if (!res.ok) return null;
      const json = await res.json();
      return {
        state:
          json?.principalSubdivision ||
          json?.principalSubdivisionCode?.replace("IN-", "") ||
          null,
        city: json?.city || json?.locality || null,
        district:
          json?.localityInfo?.administrative?.find?.(
            (a: any) => a?.adminLevel === 5 || a?.adminLevel === 6,
          )?.name || null,
        country: json?.countryName || null,
      };
    } catch (err) {
      console.warn("BigDataCloud reverse geocode failed:", err);
      return null;
    }
  };

  const fetchFromNominatim = async (
    lat: number,
    lng: number,
  ): Promise<LocationInfo | null> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en&zoom=14`,
        {
          headers: { Accept: "application/json" },
        },
      );
      if (!res.ok) return null;
      const json = await res.json();
      const addr = json?.address || {};
      return {
        state: addr?.state || addr?.state_district || null,
        city:
          addr?.city ||
          addr?.town ||
          addr?.village ||
          addr?.suburb ||
          addr?.county ||
          null,
        district: addr?.state_district || addr?.county || null,
        country: addr?.country || null,
      };
    } catch (err) {
      console.warn("Nominatim reverse geocode failed:", err);
      return null;
    }
  };

  const getLocationFromCoords = async (
    lat: number,
    lng: number,
  ): Promise<LocationInfo | null> => {
    const bdc = await fetchFromBigDataCloud(lat, lng);
    if (bdc && (bdc.state || bdc.city)) {
      console.log("✅ BigDataCloud →", bdc);
      return bdc;
    }

    const nom = await fetchFromNominatim(lat, lng);
    if (nom && (nom.state || nom.city)) {
      console.log("✅ Nominatim →", nom);
      return nom;
    }

    return null;
  };

  // ==========================================
  // ✅ LOCATION CAPTURE
  // ==========================================

  const handleCaptureLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus(
        "⚠ Geolocation not supported. Please enable location services.",
      );
      dispatch(
        showToast({
          message: "Geolocation not supported in this browser.",
          type: "warning",
        }),
      );
      return;
    }

    setIsCapturing(true);
    setLocationStatus("Requesting location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        onChange({
          target: { name: "latitude", value: lat },
        } as any);
        onChange({
          target: { name: "longitude", value: lng },
        } as any);

        // ✅ Mark captured immediately so Submit becomes enabled
        setHasCapturedLocation(true);

        setLocationStatus("✓ Location captured. Detecting state & city...");

        try {
          const info = await getLocationFromCoords(lat, lng);

          if (info) {
            setDetectedState(info.state || "");
            setDetectedCity(info.city || "");

            if (info.state) {
              onChange({
                target: { name: "state", value: info.state },
              } as any);
            }
            if (info.city) {
              onChange({
                target: { name: "city", value: info.city },
              } as any);
            }

            const stateLower = (info.state || "").toLowerCase();

            if (stateLower === BLOCKED_STATE) {
              setIsTelanganaBlocked(true);
              setLocationStatus("❌ " + BLOCKED_MESSAGE);
              dispatch(
                showToast({
                  message: BLOCKED_MESSAGE,
                  type: "error",
                }),
              );
            } else {
              const label = [info.city, info.state].filter(Boolean).join(", ");
              setLocationStatus(`✓ Location captured — ${label}`);
              dispatch(
                showToast({
                  message: `📍 ${label}`,
                  type: "success",
                }),
              );
            }
          } else {
            setLocationStatus(
              "✓ Location captured (state/city could not be detected)",
            );
            dispatch(
              showToast({
                message:
                  "Location captured, but state/city could not be detected. You can still submit.",
                type: "warning",
              }),
            );
          }
        } catch (err) {
          console.error("Reverse geocode error:", err);
          setLocationStatus("✓ Location captured (state/city unknown)");
        } finally {
          setIsCapturing(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        let errorMsg = "⚠ Unable to capture location. ";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg += "Location permission denied. ";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg += "Location information unavailable. ";
            break;
          case error.TIMEOUT:
            errorMsg += "Location request timed out. ";
            break;
          default:
            errorMsg += "Unknown error occurred. ";
        }

        errorMsg += "Please try again.";
        setLocationStatus(errorMsg);
        setIsCapturing(false);

        dispatch(
          showToast({
            message: "Unable to capture location. Please try again.",
            type: "warning",
          }),
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
  };

  // ==========================================
  // ✅ REMOVE GPS LOCATION
  // ==========================================

  const handleRemoveGps = () => {
    onChange({ target: { name: "latitude", value: undefined } } as any);
    onChange({ target: { name: "longitude", value: undefined } } as any);
    onChange({ target: { name: "state", value: undefined } } as any);
    onChange({ target: { name: "city", value: undefined } } as any);
    setLocationStatus("");
    setDetectedState("");
    setDetectedCity("");
    setIsTelanganaBlocked(false);
    setHasCapturedLocation(false); // ✅ disable Submit again
    dispatch(
      showToast({
        message: "Location removed. You can capture again.",
        type: "success",
      }),
    );
  };

  // ==========================================
  // ✅ LOCATION SUBMISSION
  // ==========================================

  const handleSubmitLocation = async () => {
    if (isTelanganaBlocked) {
      dispatch(
        showToast({
          message: BLOCKED_MESSAGE,
          type: "error",
        }),
      );
      return;
    }

    if (!data.location_consent) {
      dispatch(
        showToast({
          message: "Please consent to location capture",
          type: "error",
        }),
      );
      return;
    }

    // ✅ Accept phone OR email as identifier
    const identifier =
      phoneNumber ||
      localStorage.getItem("distributor_verified_phone") ||
      localStorage.getItem("distributor_mobile") ||
      localStorage.getItem("distributor_phone") ||
      data.email ||
      "";

    if (!identifier) {
      dispatch(
        showToast({
          message: "Session expired. Please verify your mobile again.",
          type: "error",
        }),
      );
      return;
    }

    if (!hasCapturedLocation && !hasCoordinates) {
      dispatch(
        showToast({
          message: "Please capture your location first.",
          type: "error",
        }),
      );
      return;
    }

    setIsVerifying(true);

    try {
      const response = await step6Location({
        phone: identifier,
        location_consent: data.location_consent ? 1 : 0,
        latitude: data.latitude,
        longitude: data.longitude,
      }).unwrap();

      if (response.status) {
        dispatch(
          showToast({
            message:
              response.message || "✅ Location consent submitted successfully!",
            type: "success",
          }),
        );

        onChange({
          target: {
            name: "location_verified",
            value: true,
          },
        } as any);

        await fetchStepData();

        setTimeout(() => {
          onNext?.();
        }, 1500);
      } else {
        const errorMsg =
          response.message || "Location submission failed. Please try again.";
        dispatch(
          showToast({
            message: errorMsg,
            type: "error",
          }),
        );
      }
    } catch (error: any) {
      console.error("Location submission error:", error);
      const errorMsg =
        error?.data?.message ||
        error?.message ||
        "Location submission failed. Please try again.";
      dispatch(
        showToast({
          message: errorMsg,
          type: "error",
        }),
      );
    } finally {
      setIsVerifying(false);
    }
  };

  // ==========================================
  // ✅ HANDLE NEXT
  // ==========================================

  const handleNext = () => {
    if (isTelanganaBlocked) {
      dispatch(
        showToast({
          message: BLOCKED_MESSAGE,
          type: "error",
        }),
      );
      return;
    }

    if (isDataLoadedFromAPI && data.location_verified) {
      console.log(
        "✅ Location data already exists - Navigating to next step without POST",
      );
      dispatch(
        showToast({
          message:
            "Location consent already submitted. Proceeding to next step.",
          type: "success",
        }),
      );
      setTimeout(() => onNext(), 500);
      return;
    }

    if (!data.location_verified) {
      handleSubmitLocation();
    } else {
      onNext();
    }
  };

  // ==========================================
  // ✅ HANDLE INPUT CHANGES
  // ==========================================

  const handleConsentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isDataLoadedFromAPI) {
      setIsDataLoadedFromAPI(false);
    }

    onChange({
      target: {
        name: "location_consent",
        value: e.target.checked,
      },
    } as any);
  };

  // ==========================================
  // ✅ CONTINUE BUTTON ENABLED LOGIC (robust)
  // ==========================================

  // Robust coordinate check — accepts string or number
  const hasCoordinates = (() => {
    const lat = Number(data.latitude);
    const lng = Number(data.longitude);
    return (
      Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 && lng === 0)
    );
  })();

  // Either local flag OR valid coordinates → captured
  const locationCaptured = hasCapturedLocation || hasCoordinates;

  const isContinueEnabled = () => {
    if (isTelanganaBlocked) return false;

    if (isDataLoadedFromAPI && data.location_verified) {
      return true;
    }

    const consentOk = !!data.location_consent;
    const notBusy = !isVerifying && !isCapturing;
    const alreadyVerified = !!data.location_verified;

    const hasSomeIdentifier =
      !!phoneNumber ||
      !!localStorage.getItem("distributor_verified_phone") ||
      !!localStorage.getItem("distributor_mobile") ||
      !!localStorage.getItem("distributor_phone") ||
      !!data.email;

    const enabled =
      consentOk &&
      notBusy &&
      !alreadyVerified &&
      locationCaptured &&
      hasSomeIdentifier;

    // 🔍 Debug log — helps pinpoint what's blocking
    if (!enabled) {
      console.log("🔒 Submit disabled →", {
        consentOk,
        notBusy,
        alreadyVerified,
        locationCaptured,
        hasSomeIdentifier,
        hasCapturedLocation,
        hasCoordinates,
        phoneNumber,
        lat: data.latitude,
        lng: data.longitude,
      });
    }

    return enabled;
  };

  const getButtonLabel = () => {
    if (isTelanganaBlocked) {
      return "Registration Blocked";
    }
    if (isDataLoadedFromAPI && data.location_verified) {
      return "Continue";
    }
    if (isVerifying) {
      return "Submitting...";
    }
    return "Submit Location";
  };

  const gpsDisabled =
    isTelanganaBlocked || !!data.location_verified || isVerifying;

  return (
    <>
      <div
        style={
          {
            fontFamily: theme.font,
            "--gold": theme.gold,
            "--gold-dark": theme.goldDark,
            "--gold-deep": theme.goldDeep,
            "--navy": theme.navy,
            "--navy-soft": theme.navySoft,
          } as React.CSSProperties
        }
        className="min-h-[60vh] flex items-center justify-center px-3 sm:px-4 py-6 sm:py-10"
      >
        <div className="w-full max-w-lg mx-auto">
          <div className="relative rounded-[20px] sm:rounded-[28px] bg-white/90 backdrop-blur-xl border border-[var(--navy)]/[0.06] shadow-[0_20px_60px_-15px_rgba(6,16,30,0.15)] px-4 sm:px-6 md:px-9 py-6 sm:py-8 md:py-10">
            <div className="pointer-events-none absolute inset-x-0 -top-10 flex justify-center">
              <div className="w-32 sm:w-40 h-32 sm:h-40 rounded-full bg-[radial-gradient(circle,_rgba(249,199,68,0.3)_0%,_rgba(249,199,68,0)_70%)] blur-xl" />
            </div>

            <div className="relative space-y-4 sm:space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 sm:gap-3 mb-1">
                    <div className="w-9 sm:w-11 h-9 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[var(--gold)] via-[var(--gold-dark)] to-[var(--gold-deep)] flex items-center justify-center shadow-[0_8px_20px_-6px_rgba(249,199,68,0.55)] flex-shrink-0">
                      <MapPin className="w-4 sm:w-5 h-4 sm:h-5 text-[var(--navy)]" />
                    </div>
                    <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-[var(--navy)]">
                      Location Consent
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 font-medium">
                    Consent for location capture for fraud prevention
                  </p>
                  {isLoadingStepData && (
                    <div className="flex items-center justify-start gap-2 mt-2 text-xs sm:text-sm text-gray-500">
                      <Loader2 className="w-3 sm:w-4 h-3 sm:h-4 animate-spin" />
                      Loading your location data...
                    </div>
                  )}
                  {isDataLoadedFromAPI && (
                    <div className="mt-2 text-[10px] sm:text-xs font-semibold text-blue-600 bg-blue-50 py-1 px-2 sm:px-3 rounded-full inline-block">
                      Existing data loaded
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setShowConfirmModal(true)}
                  className="group flex-shrink-0 flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full
                                    border border-[var(--gold)]/40 bg-[#FFFBEF]
                                    text-xs sm:text-sm font-semibold text-[var(--gold-deep)]
                                    hover:bg-[var(--gold)] hover:text-[var(--navy)] hover:border-[var(--gold)]
                                    shadow-sm hover:shadow-md
                                    transition-all duration-200 whitespace-nowrap"
                >
                  <PlusCircle className="w-3 sm:w-4 h-3 sm:h-4" />
                  <span className="hidden xs:inline">New Registration</span>
                  <span className="xs:hidden">New</span>
                </button>
              </div>

              <InfoBox type="info" title="📍 Purpose">
                Location is captured once at registration for fraud prevention.
                It is never tracked continuously. Declining consent does not
                affect registration.
              </InfoBox>

              <div className="space-y-3 sm:space-y-4">
                {/* ===== CONSENT CHECKBOX ===== */}
                <div className="space-y-2 sm:space-y-3">
                  <label className="flex items-start gap-2 sm:gap-3 cursor-pointer bg-gray-50/70 border border-gray-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:border-[var(--gold)]/30 transition-colors">
                    <input
                      type="checkbox"
                      name="location_consent"
                      checked={data.location_consent || false}
                      onChange={handleConsentChange}
                      disabled={
                        isVerifying ||
                        data.location_verified ||
                        isTelanganaBlocked ||
                        (isDataLoadedFromAPI && data.location_verified)
                      }
                      className="mt-0.5 sm:mt-1 w-3.5 sm:w-4 h-3.5 sm:h-4 rounded border-gray-300 text-[var(--gold-deep)] focus:ring-[var(--gold)] flex-shrink-0"
                    />
                    <span className="text-[11px] sm:text-sm text-gray-600 leading-relaxed font-medium">
                      I consent to my location being recorded once at
                      registration for fraud prevention purposes as per the
                      Digital Personal Data Protection Act, 2023.
                    </span>
                  </label>
                  {errors.location_consent && (
                    <p className="text-[10px] sm:text-xs text-red-500 font-medium pl-1">
                      {errors.location_consent}
                    </p>
                  )}
                </div>

                {/* ===== CAPTURE LOCATION CARD ===== */}
                {data.location_consent &&
                  !data.location_verified &&
                  !isTelanganaBlocked && (
                    <div
                      className={`rounded-xl sm:rounded-2xl border-2 p-3 sm:p-4 transition-all ${
                        locationCaptured
                          ? "border-emerald-200 bg-emerald-50/40"
                          : "border-gray-100 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center ${
                              locationCaptured
                                ? "bg-emerald-500 text-white"
                                : "bg-[var(--gold)]/20 text-[var(--gold-deep)]"
                            }`}
                          >
                            {locationCaptured ? (
                              <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            ) : (
                              <Navigation className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            )}
                          </div>
                          <span className="text-xs sm:text-sm font-semibold text-[var(--navy)]">
                            Capture Current Location
                          </span>
                        </div>

                        {locationCaptured && (
                          <button
                            type="button"
                            onClick={handleRemoveGps}
                            className="flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-md transition-colors"
                            title="Remove location"
                          >
                            <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            Remove
                          </button>
                        )}
                      </div>

                      <Button
                        type="button"
                        onClick={handleCaptureLocation}
                        loading={isCapturing}
                        disabled={gpsDisabled}
                        className="w-full h-11 sm:h-12 bg-gradient-to-b from-[#F9C744] to-[#E6B33D] hover:brightness-105 active:brightness-95 text-[#06101E] font-semibold rounded-xl transition-all duration-200 shadow-[0_8px_20px_-6px_rgba(249,199,68,0.55)] disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                      >
                        📍{" "}
                        {locationCaptured
                          ? "Re-capture Location"
                          : "Capture Location"}
                      </Button>

                      {locationStatus && (
                        <p
                          className={`text-xs sm:text-sm mt-2 sm:mt-3 font-medium ${
                            locationStatus.includes("✓")
                              ? "text-emerald-600"
                              : locationStatus.includes("❌")
                                ? "text-red-600"
                                : "text-amber-600"
                          }`}
                        >
                          {locationStatus}
                        </p>
                      )}

                      {data.latitude && data.longitude && (
                        <div className="mt-3 space-y-1.5">
                          <p className="text-[10px] sm:text-xs text-gray-500 font-medium break-all">
                            <span className="text-gray-400">Coordinates:</span>{" "}
                            {typeof data.latitude === "number"
                              ? data.latitude.toFixed(4)
                              : data.latitude}
                            ,{" "}
                            {typeof data.longitude === "number"
                              ? data.longitude.toFixed(4)
                              : data.longitude}
                          </p>

                          {(detectedCity || detectedState) && (
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] sm:text-xs">
                              {detectedCity && (
                                <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                                  <Building2 className="w-3 h-3" />
                                  {detectedCity}
                                </span>
                              )}
                              {detectedState && (
                                <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                                  <MapPin className="w-3 h-3" />
                                  {detectedState}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                {/* ===== TELANGANA BLOCK BANNER ===== */}
                {isTelanganaBlocked && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
                    <AlertTriangle className="w-4 sm:w-5 h-4 sm:h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-red-700 mb-1">
                        Telangana users can't register
                      </p>
                      <p className="text-[11px] sm:text-xs text-red-600 leading-relaxed">
                        Registration from Telangana state is currently not
                        allowed. Please contact Admin for assistance.
                      </p>
                    </div>
                  </div>
                )}

                {data.location_verified && (
                  <div className="bg-emerald-50/80 backdrop-blur-sm p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-emerald-100 text-xs sm:text-sm text-emerald-700 flex items-center gap-2 sm:gap-2.5 font-medium">
                    <CheckCircle className="w-3.5 sm:w-4 h-3.5 sm:h-4 flex-shrink-0" />
                    <span>
                      Location consent submitted successfully
                      {isDataLoadedFromAPI && (
                        <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs text-blue-600">
                          (loaded from saved data)
                        </span>
                      )}
                    </span>
                  </div>
                )}

                {isVerifying && (
                  <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 font-medium">
                    <Loader2 className="w-3 sm:w-4 h-3 sm:h-4 animate-spin" />
                    Submitting location consent...
                  </div>
                )}

                <FormActions
                  onBack={onBack}
                  onNext={
                    isDataLoadedFromAPI && data.location_verified
                      ? onNext
                      : undefined
                  }
                  onSubmit={
                    !isDataLoadedFromAPI || !data.location_verified
                      ? handleSubmitLocation
                      : undefined
                  }
                  isSubmitDisabled={!isContinueEnabled()}
                  isLoading={isVerifying}
                  submitLabel={getButtonLabel()}
                  nextLabel="Continue →"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div
          className="fixed inset-0 z-[9999] overflow-y-auto px-3 sm:px-4"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(6, 16, 30, 0.7)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            fontFamily: theme.font,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowConfirmModal(false);
            }
          }}
        >
          <div
            className="bg-white rounded-[24px] sm:rounded-[28px] max-w-md w-full mx-2 sm:mx-4 p-5 sm:p-7 shadow-[0_30px_80px_-20px_rgba(6,16,30,0.5)] relative"
            style={{
              maxHeight: "90vh",
              overflowY: "auto",
              margin: "auto",
            }}
          >
            <button
              type="button"
              onClick={() => setShowConfirmModal(false)}
              className="absolute right-3 sm:right-4 top-3 sm:top-4 text-gray-400 hover:text-[#06101E] hover:bg-gray-100 rounded-full p-1 transition-colors z-10"
            >
              <X className="w-4 sm:w-5 h-4 sm:h-5" />
            </button>

            <div className="flex justify-center mb-3 sm:mb-4">
              <div className="w-12 sm:w-16 h-12 sm:h-16 rounded-full bg-amber-100 flex items-center justify-center ring-4 ring-amber-50">
                <AlertTriangle className="w-6 sm:w-8 h-6 sm:h-8 text-amber-600" />
              </div>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-center text-[#06101E] mb-1 sm:mb-2 tracking-tight">
              Start New Registration?
            </h3>

            <p className="text-xs sm:text-sm text-gray-500 text-center mb-4 sm:mb-6 font-medium">
              All your entered information will be discarded. This action cannot
              be undone.
            </p>

            <div className="bg-red-50 border border-red-200 rounded-xl p-2.5 sm:p-3 mb-4 sm:mb-6">
              <p className="text-[10px] sm:text-xs text-red-600 text-center font-semibold">
                Warning: Your current progress will be lost
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="w-full sm:flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 sm:py-2.5 rounded-xl transition-colors duration-200 text-sm sm:text-base order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleNewRegistration}
                className="w-full sm:flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 sm:py-2.5 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 shadow-[0_8px_20px_-6px_rgba(239,68,68,0.5)] text-sm sm:text-base order-1 sm:order-2"
              >
                <PlusCircle className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                Yes, Start New
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
