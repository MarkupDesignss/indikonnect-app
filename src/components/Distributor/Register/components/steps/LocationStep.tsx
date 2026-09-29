"use client";

import React, { useEffect, useState } from "react";
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

  /**
   * TRUE when Step-6 GET API has been loaded.
   */
  const [isDataLoadedFromAPI, setIsDataLoadedFromAPI] = useState(false);

  /**
   * TRUE when API already contained valid latitude/longitude.
   *
   * This is the most important flag.
   *
   * If TRUE:
   * - do NOT call location POST
   * - simply continue
   */
  const [isLocationFromApi, setIsLocationFromApi] = useState(false);

  /**
   * TRUE when browser GPS was captured in this session.
   */
  const [hasCapturedLocation, setHasCapturedLocation] = useState(false);

  const [isTelanganaBlocked, setIsTelanganaBlocked] = useState(false);

  const [detectedState, setDetectedState] = useState("");
  const [detectedCity, setDetectedCity] = useState("");

  const [step6Location] = useStep6LocationMutation();

  const [getStepData, { isLoading: isLoadingStepData }] =
    useLazyGetStepDataQuery();

  // ============================================================
  // BODY SCROLL LOCK
  // ============================================================

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

  // ============================================================
  // LOCATION HELPERS
  // ============================================================

  const isValidCoordinate = (
    latitude: unknown,
    longitude: unknown,
  ): boolean => {
    const lat = Number(latitude);
    const lng = Number(longitude);

    return (
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180 &&
      !(lat === 0 && lng === 0)
    );
  };

  // ============================================================
  // REVERSE GEOCODING - BIGDATACLOUD
  // ============================================================

  const fetchFromBigDataCloud = async (
    lat: number,
    lng: number,
  ): Promise<LocationInfo | null> => {
    try {
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
      );

      if (!res.ok) {
        return null;
      }

      const json = await res.json();

      return {
        state:
          json?.principalSubdivision ||
          json?.principalSubdivisionCode?.replace("IN-", "") ||
          null,

        city:
          json?.city ||
          json?.locality ||
          json?.localityInfo?.administrative?.find?.(
            (item: any) => item?.adminLevel === 5 || item?.adminLevel === 6,
          )?.name ||
          null,

        district:
          json?.localityInfo?.administrative?.find?.(
            (item: any) => item?.adminLevel === 5 || item?.adminLevel === 6,
          )?.name || null,

        country: json?.countryName || null,
      };
    } catch (error) {
      console.warn("BigDataCloud reverse geocode failed:", error);
      return null;
    }
  };

  // ============================================================
  // REVERSE GEOCODING - NOMINATIM FALLBACK
  // ============================================================

  const fetchFromNominatim = async (
    lat: number,
    lng: number,
  ): Promise<LocationInfo | null> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en&zoom=14`,
        {
          headers: {
            Accept: "application/json",
          },
        },
      );

      if (!res.ok) {
        return null;
      }

      const json = await res.json();

      const addr = json?.address || {};

      return {
        state: addr?.state || addr?.state_district || null,

        city:
          addr?.city ||
          addr?.town ||
          addr?.village ||
          addr?.municipality ||
          addr?.suburb ||
          addr?.county ||
          null,

        district: addr?.state_district || addr?.county || null,

        country: addr?.country || null,
      };
    } catch (error) {
      console.warn("Nominatim reverse geocode failed:", error);
      return null;
    }
  };

  // ============================================================
  // REVERSE GEOCODE COORDINATES
  // ============================================================

  const getLocationFromCoords = async (
    lat: number,
    lng: number,
  ): Promise<LocationInfo | null> => {
    const bdc = await fetchFromBigDataCloud(lat, lng);

    if (bdc && (bdc.state || bdc.city)) {
      return bdc;
    }

    const nom = await fetchFromNominatim(lat, lng);

    if (nom && (nom.state || nom.city)) {
      return nom;
    }

    return null;
  };

  // ============================================================
  // APPLY DETECTED LOCATION
  // ============================================================

  const applyDetectedLocation = (info: LocationInfo | null) => {
    if (!info) {
      setDetectedCity("");
      setDetectedState("");

      return;
    }

    const city = info.city || "";
    const state = info.state || "";

    setDetectedCity(city);
    setDetectedState(state);

    if (city) {
      onChange({
        target: {
          name: "city",
          value: city,
        },
      } as any);
    }

    if (state) {
      onChange({
        target: {
          name: "state",
          value: state,
        },
      } as any);
    }

    const stateLower = state.trim().toLowerCase();

    if (stateLower === BLOCKED_STATE) {
      setIsTelanganaBlocked(true);

      setLocationStatus(`❌ ${BLOCKED_MESSAGE}`);

      dispatch(
        showToast({
          message: BLOCKED_MESSAGE,
          type: "error",
        }),
      );

      return;
    }

    setIsTelanganaBlocked(false);

    const label = [city, state].filter(Boolean).join(", ");

    if (label) {
      setLocationStatus(`✓ Location detected — ${label}`);
    }
  };

  // ============================================================
  // LOAD PHONE
  // ============================================================

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
    } else if (data.email) {
      setPhoneNumber(data.email);
    }
  }, [data.email]);

  // ============================================================
  // FETCH STEP 6 DATA
  // ============================================================

  const fetchStepData = async () => {
    const email = data.email || localStorage.getItem("distributor_email") || "";

    if (!email) {
      return;
    }

    try {
      const response = await getStepData({
        step: "6",
        phone: email,
      }).unwrap();

      if (!response?.status || !response?.step_data) {
        return;
      }

      const userData = response.step_data.user;
      const profileData = response.step_data.distributor_profile;

      // --------------------------------------------------------
      // LOCATION CONSENT
      // --------------------------------------------------------

      const hasLocationConsent =
        userData?.location_consent_given === 1 ||
        userData?.location_consent_given === true ||
        profileData?.location_consent === 1 ||
        profileData?.location_consent === true;

      if (hasLocationConsent) {
        onChange({
          target: {
            name: "location_consent",
            value: true,
          },
        } as any);
      }

      // --------------------------------------------------------
      // GET LATITUDE / LONGITUDE
      // --------------------------------------------------------

      const apiLat = profileData?.latitude;
      const apiLng = profileData?.longitude;

      const apiHasValidCoordinates = isValidCoordinate(apiLat, apiLng);

      /**
       * IMPORTANT:
       *
       * If API has coordinates:
       *
       * 1. Save coordinates into form
       * 2. Mark source as API
       * 3. Reverse geocode
       * 4. Detect city/state
       * 5. NEVER POST location again
       */
      if (apiHasValidCoordinates) {
        const latNum = Number(apiLat);
        const lngNum = Number(apiLng);

        // Save coordinates into parent form
        onChange({
          target: {
            name: "latitude",
            value: latNum,
          },
        } as any);

        onChange({
          target: {
            name: "longitude",
            value: lngNum,
          },
        } as any);

        // IMPORTANT SOURCE FLAG
        setIsLocationFromApi(true);
        setHasCapturedLocation(true);

        setLocationStatus("✓ Saved coordinates found. Detecting city...");

        // ------------------------------------------------------
        // REVERSE GEOCODE API COORDINATES
        // ------------------------------------------------------

        const info = await getLocationFromCoords(latNum, lngNum);

        if (info) {
          applyDetectedLocation(info);

          const label = [info.city, info.state].filter(Boolean).join(", ");

          if (!isTelanganaBlocked) {
            setLocationStatus(
              label ? `✓ Saved location — ${label}` : "✓ Saved location loaded",
            );
          }
        } else {
          setLocationStatus(
            "✓ Saved location loaded. City could not be detected.",
          );
        }

        // ------------------------------------------------------
        // IMPORTANT:
        // Do NOT call POST here.
        // ------------------------------------------------------

        onChange({
          target: {
            name: "location_verified",
            value: true,
          },
        } as any);
      } else {
        /**
         * No coordinates from API.
         *
         * User must capture GPS manually.
         */
        setIsLocationFromApi(false);
        setHasCapturedLocation(false);

        setLocationStatus("Please capture your current location to continue.");
      }

      setIsDataLoadedFromAPI(true);

      dispatch(
        showToast({
          message: "Location data loaded successfully",
          type: "success",
        }),
      );
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

  // ============================================================
  // LOAD API DATA ON SCREEN LOAD
  // ============================================================

  useEffect(() => {
    const email = data.email || localStorage.getItem("distributor_email") || "";

    if (email) {
      fetchStepData();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.email]);

  // ============================================================
  // CLEAR REGISTRATION DATA
  // ============================================================

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

  // ============================================================
  // CAPTURE CURRENT GPS LOCATION
  // ============================================================

  const handleCaptureLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("⚠ Geolocation is not supported by this browser.");

      dispatch(
        showToast({
          message: "Geolocation is not supported in this browser.",
          type: "warning",
        }),
      );

      return;
    }

    setIsCapturing(true);

    setLocationStatus("Requesting your current location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        // --------------------------------------------------------
        // SAVE GPS COORDINATES
        // --------------------------------------------------------

        onChange({
          target: {
            name: "latitude",
            value: lat,
          },
        } as any);

        onChange({
          target: {
            name: "longitude",
            value: lng,
          },
        } as any);

        // This is a NEW browser GPS capture.
        setIsLocationFromApi(false);
        setHasCapturedLocation(true);

        setLocationStatus("✓ Location captured. Detecting city and state...");

        try {
          const info = await getLocationFromCoords(lat, lng);

          if (info) {
            applyDetectedLocation(info);

            if (!isTelanganaBlocked) {
              const label = [info.city, info.state].filter(Boolean).join(", ");

              setLocationStatus(
                label
                  ? `✓ Location captured — ${label}`
                  : "✓ Location captured successfully",
              );

              dispatch(
                showToast({
                  message: label
                    ? `📍 ${label}`
                    : "Location captured successfully",
                  type: "success",
                }),
              );
            }
          } else {
            setLocationStatus(
              "✓ Location captured. City/state could not be detected.",
            );

            dispatch(
              showToast({
                message:
                  "Location captured, but city/state could not be detected.",
                type: "warning",
              }),
            );
          }
        } catch (error) {
          console.error("Reverse geocoding error:", error);

          setLocationStatus(
            "✓ Location captured. City/state could not be detected.",
          );
        } finally {
          setIsCapturing(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);

        let errorMsg = "⚠ Unable to capture your location. ";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg += "Location permission was denied.";
            break;

          case error.POSITION_UNAVAILABLE:
            errorMsg += "Location information is unavailable.";
            break;

          case error.TIMEOUT:
            errorMsg += "Location request timed out.";
            break;

          default:
            errorMsg += "An unknown error occurred.";
            break;
        }

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

  // ============================================================
  // REMOVE GPS
  // ============================================================

  const handleRemoveGps = () => {
    onChange({
      target: {
        name: "latitude",
        value: undefined,
      },
    } as any);

    onChange({
      target: {
        name: "longitude",
        value: undefined,
      },
    } as any);

    onChange({
      target: {
        name: "state",
        value: undefined,
      },
    } as any);

    onChange({
      target: {
        name: "city",
        value: undefined,
      },
    } as any);

    onChange({
      target: {
        name: "location_verified",
        value: false,
      },
    } as any);

    setLocationStatus("");

    setDetectedState("");
    setDetectedCity("");

    setIsTelanganaBlocked(false);

    setHasCapturedLocation(false);

    setIsLocationFromApi(false);

    dispatch(
      showToast({
        message: "Location removed. You can capture again.",
        type: "success",
      }),
    );
  };

  // ============================================================
  // SUBMIT LOCATION
  // ============================================================

  const handleSubmitLocation = async () => {
    // ----------------------------------------------------------
    // BLOCK TELANGANA
    // ----------------------------------------------------------

    if (isTelanganaBlocked) {
      dispatch(
        showToast({
          message: BLOCKED_MESSAGE,
          type: "error",
        }),
      );

      return;
    }

    // ----------------------------------------------------------
    // CONSENT
    // ----------------------------------------------------------

    if (!data.location_consent) {
      dispatch(
        showToast({
          message: "Please provide location consent.",
          type: "error",
        }),
      );

      return;
    }

    // ==========================================================
    // VERY IMPORTANT:
    //
    // API already contains lat/long.
    //
    // DO NOT HIT POST.
    // ==========================================================

    if (isLocationFromApi) {
      onChange({
        target: {
          name: "location_verified",
          value: true,
        },
      } as any);

      dispatch(
        showToast({
          message: "Saved location already exists. Proceeding...",
          type: "success",
        }),
      );

      setTimeout(() => {
        onNext?.();
      }, 500);

      return;
    }

    // ----------------------------------------------------------
    // IDENTIFIER
    // ----------------------------------------------------------

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

    // ----------------------------------------------------------
    // VALIDATE COORDINATES
    // ----------------------------------------------------------

    const latNum = Number(data.latitude);
    const lngNum = Number(data.longitude);

    const validCoords = isValidCoordinate(latNum, lngNum);

    if (!validCoords) {
      dispatch(
        showToast({
          message:
            "Location data is missing. Please capture your current location.",
          type: "error",
        }),
      );

      return;
    }

    // ----------------------------------------------------------
    // SUBMIT
    // ----------------------------------------------------------

    setIsVerifying(true);

    try {
      const response = await step6Location({
        phone: identifier,

        location_consent: data.location_consent ? 1 : 0,

        latitude: latNum,

        longitude: lngNum,
      }).unwrap();

      if (response?.status) {
        dispatch(
          showToast({
            message: response.message || "Location submitted successfully.",
            type: "success",
          }),
        );

        onChange({
          target: {
            name: "location_verified",
            value: true,
          },
        } as any);

        // IMPORTANT:
        // This was a successful NEW POST.
        // From this point it is server-verified.
        setIsLocationFromApi(true);

        // Refresh GET data
        await fetchStepData();

        setTimeout(() => {
          onNext?.();
        }, 800);
      } else {
        dispatch(
          showToast({
            message:
              response?.message ||
              "Location submission failed. Please try again.",
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

  // ============================================================
  // NEXT
  // ============================================================

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

    /**
     * If GET API already provided coordinates,
     * there is nothing to POST.
     */
    if (isLocationFromApi) {
      dispatch(
        showToast({
          message: "Saved location already exists. Proceeding...",
          type: "success",
        }),
      );

      setTimeout(() => {
        onNext?.();
      }, 500);

      return;
    }

    /**
     * If location was already verified in local state,
     * continue.
     */
    if (data.location_verified) {
      onNext?.();
      return;
    }

    /**
     * Otherwise submit newly captured GPS.
     */
    handleSubmitLocation();
  };

  // ============================================================
  // CONSENT CHANGE
  // ============================================================

  const handleConsentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      target: {
        name: "location_consent",
        value: e.target.checked,
      },
    } as any);
  };

  // ============================================================
  // COORDINATE STATUS
  // ============================================================

  const hasCoordinates = isValidCoordinate(data.latitude, data.longitude);

  const locationCaptured = hasCapturedLocation || hasCoordinates;

  /**
   * If coordinates came from GET API:
   * button becomes Continue.
   *
   * If coordinates don't exist:
   * button becomes Submit Location.
   */
  const shouldSkipSubmit = isLocationFromApi;

  const isContinueEnabled = () => {
    if (isTelanganaBlocked) {
      return false;
    }

    if (isLoadingStepData) {
      return false;
    }

    if (isVerifying || isCapturing) {
      return false;
    }

    if (!data.location_consent) {
      return false;
    }

    /**
     * Existing API location:
     * Always allow Continue.
     */
    if (isLocationFromApi) {
      return true;
    }

    /**
     * New location:
     * GPS coordinates must exist.
     */
    return locationCaptured;
  };

  const getButtonLabel = () => {
    if (isTelanganaBlocked) {
      return "Registration Blocked";
    }

    if (isLoadingStepData) {
      return "Loading...";
    }

    if (isLocationFromApi) {
      return "Continue";
    }

    if (isVerifying) {
      return "Submitting...";
    }

    return "Submit Location";
  };

  const gpsDisabled = isTelanganaBlocked || isVerifying || isCapturing;

  // ============================================================
  // UI
  // ============================================================

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
            <div className="relative space-y-4 sm:space-y-5">
              {/* ==================================================
                  HEADER
              ================================================== */}

              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 sm:gap-3 mb-1">
                    <div className="w-9 sm:w-11 h-9 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[var(--gold)] via-[var(--gold-dark)] to-[var(--gold-deep)] flex items-center justify-center">
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
                    <div className="flex items-center gap-2 mt-2 text-xs sm:text-sm text-gray-500">
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
                  className="group flex-shrink-0 flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-[var(--gold)]/40 bg-[#FFFBEF] text-xs sm:text-sm font-semibold text-[var(--gold-deep)] hover:bg-[var(--gold)] hover:text-[var(--navy)] transition-all"
                >
                  <PlusCircle className="w-3 sm:w-4 h-3 sm:h-4" />

                  <span className="hidden xs:inline">New Registration</span>

                  <span className="xs:hidden">New</span>
                </button>
              </div>

              {/* ==================================================
                  INFO
              ================================================== */}

              <InfoBox type="info" title="📍 Purpose">
                Location is captured once at registration for fraud prevention.
                It is never tracked continuously. Declining consent does not
                affect registration.
              </InfoBox>

              {/* ==================================================
                  FORM
              ================================================== */}

              <div className="space-y-3 sm:space-y-4">
                {/* CONSENT */}

                <div className="space-y-2 sm:space-y-3">
                  <label className="flex items-start gap-2 sm:gap-3 cursor-pointer bg-gray-50/70 border border-gray-100 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                    <input
                      type="checkbox"
                      name="location_consent"
                      checked={data.location_consent || false}
                      onChange={handleConsentChange}
                      disabled={isVerifying || isTelanganaBlocked}
                      className="mt-0.5 sm:mt-1 w-3.5 sm:w-4 h-3.5 sm:h-4"
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

                {/* ==================================================
                    LOCATION CARD
                ================================================== */}

                {data.location_consent && !isTelanganaBlocked && (
                  <div
                    className={`rounded-xl sm:rounded-2xl border-2 p-3 sm:p-4 transition-all ${
                      locationCaptured
                        ? "border-emerald-200 bg-emerald-50/40"
                        : "border-gray-100 bg-white"
                    }`}
                  >
                    {/* CARD HEADER */}

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                            locationCaptured
                              ? "bg-emerald-500 text-white"
                              : "bg-[var(--gold)]/20 text-[var(--gold-deep)]"
                          }`}
                        >
                          {locationCaptured ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <Navigation className="w-4 h-4" />
                          )}
                        </div>

                        <span className="text-xs sm:text-sm font-semibold text-[var(--navy)]">
                          {isLocationFromApi
                            ? "Saved Location"
                            : "Capture Current Location"}
                        </span>
                      </div>

                      {locationCaptured && !isLocationFromApi && (
                        <button
                          type="button"
                          onClick={handleRemoveGps}
                          className="flex items-center gap-1 text-xs font-semibold text-red-500 bg-red-50 px-2 py-1 rounded-md"
                        >
                          <X className="w-3 h-3" />
                          Remove
                        </button>
                      )}
                    </div>

                    {/* GPS BUTTON */}

                    {!isLocationFromApi && (
                      <Button
                        type="button"
                        onClick={handleCaptureLocation}
                        loading={isCapturing}
                        disabled={gpsDisabled}
                        className="w-full h-11 sm:h-12 bg-gradient-to-b from-[#F9C744] to-[#E6B33D] text-[#06101E] font-semibold rounded-xl"
                      >
                        📍{" "}
                        {locationCaptured
                          ? "Re-capture Location"
                          : "Capture Location"}
                      </Button>
                    )}

                    {/* STATUS */}

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

                    {/* COORDINATES */}

                    {hasCoordinates && (
                      <div className="mt-3 space-y-2">
                        <p className="text-[10px] sm:text-xs text-gray-500 font-medium">
                          <span className="text-gray-400">Coordinates:</span>{" "}
                          {Number(data.latitude).toFixed(6)},{" "}
                          {Number(data.longitude).toFixed(6)}
                        </p>

                        {/* CITY + STATE */}

                        {(detectedCity || detectedState) && (
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            {detectedCity && (
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-xs">
                                <Building2 className="w-3 h-3" />
                                {detectedCity}
                              </span>
                            )}

                            {detectedState && (
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-xs">
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

                {/* ==================================================
                    TELANGANA BLOCK
                ================================================== */}

                {isTelanganaBlocked && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />

                    <div>
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

                {/* ==================================================
                    VERIFIED BANNER
                ================================================== */}

                {isLocationFromApi && (
                  <div className="bg-emerald-50/80 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-emerald-100 text-xs sm:text-sm text-emerald-700 flex items-center gap-2 font-medium">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />

                    <span>
                      Saved location found. No new location submission is
                      required.
                    </span>
                  </div>
                )}

                {/* ==================================================
                    SUBMITTING
                ================================================== */}

                {isVerifying && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 font-medium">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting location consent...
                  </div>
                )}

                {/* ==================================================
                    FORM ACTIONS
                ================================================== */}

                <FormActions
                  onBack={onBack}
                  onNext={shouldSkipSubmit ? handleNext : undefined}
                  onSubmit={
                    !shouldSkipSubmit ? handleSubmitLocation : undefined
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

      {/* ==========================================================
          NEW REGISTRATION MODAL
      ========================================================== */}

      {showConfirmModal && (
        <div
          className="fixed inset-0 z-[9999] overflow-y-auto px-3 sm:px-4"
          style={{
            backgroundColor: "rgba(6, 16, 30, 0.7)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowConfirmModal(false);
            }
          }}
        >
          <div className="bg-white rounded-[24px] max-w-md w-full p-5 sm:p-7 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowConfirmModal(false)}
              className="absolute right-3 top-3 text-gray-400 hover:text-[#06101E] rounded-full p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-amber-600" />
              </div>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-center text-[#06101E] mb-2">
              Start New Registration?
            </h3>

            <p className="text-xs sm:text-sm text-gray-500 text-center mb-6">
              All your entered information will be discarded. This action cannot
              be undone.
            </p>

            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-6">
              <p className="text-xs text-red-600 text-center font-semibold">
                Warning: Your current progress will be lost
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleNewRegistration}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                Yes, Start New
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
