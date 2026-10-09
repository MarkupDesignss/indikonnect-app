"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  PlusCircle,
  AlertTriangle,
  X,
  Loader2,
  CheckCircle,
  IdCard,
  Lock,
  Pencil,
  PhoneCall,
} from "lucide-react";

import { InfoBox } from "../InfoBox";
import { FormActions } from "../FormActions";
import { StepProps } from "../../types";
import { useAppDispatch } from "@/lib/redux/hooks";
import { showToast } from "@/lib/slices/toastSlice";
import {
  useStep4PANMutation,
  useLazyGetStepDataQuery,
  distributorAuthApi,
} from "../../../../../lib/redux/api/distributor/distributorauthApis"
import authApi from "@/lib/redux/api/authApi";

const theme = {
  font: "'Inter', 'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, sans-serif",
  gold: "#F9C744",
  goldDark: "#E6B33D",
  goldDeep: "#C9922A",
  navy: "#06101E",
  navySoft: "#0B1B2E",
};

/**
 * Normalize any date string to DD/MM/YYYY.
 */
const normalizeDOB = (raw: string): string => {
  const s = String(raw || "").trim();
  if (!s) return "";

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) return s;
  if (/^\d{2}-\d{2}-\d{4}$/.test(s)) return s.replace(/-/g, "/");

  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}`;

  return "";
};

/**
 * Auto-format DOB input as user types: DD/MM/YYYY
 */
const formatDOBInput = (raw: string): string => {
  const digits = String(raw || "")
    .replace(/\D/g, "")
    .slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};

/**
 * Validate DD/MM/YYYY
 */
const isValidDOB = (value: string): boolean => {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return false;
  const [dd, mm, yyyy] = value.split("/").map((x) => parseInt(x, 10));
  if (dd < 1 || dd > 31) return false;
  if (mm < 1 || mm > 12) return false;
  if (yyyy < 1900 || yyyy > new Date().getFullYear()) return false;

  const d = new Date(yyyy, mm - 1, dd);
  return (
    d.getDate() === dd && d.getMonth() === mm - 1 && d.getFullYear() === yyyy
  );
};

const isMaskedPAN = (value: string): boolean => {
  return String(value || "").includes("*");
};

/**
 * Format a raw phone string into +91XXXXXXXXXX
 */
const normalizePhone = (raw: string): string => {
  const digits = String(raw || "")
    .replace(/\D/g, "")
    .replace(/^0+/, "");
  const tenDigit = digits.length > 10 ? digits.slice(-10) : digits;
  return tenDigit.length === 10 ? `+91${tenDigit}` : "";
};

export const PANStep: React.FC<StepProps> = ({
  data,
  errors,
  onChange,
  onNext,
  onBack,
  onBackToMobile,
}) => {
  const dispatch = useAppDispatch();
  const [isVerifying, setIsVerifying] = useState(false);

  const [panFieldError, setPanFieldError] = useState("");
  const [nameFieldError, setNameFieldError] = useState("");
  const [dobFieldError, setDobFieldError] = useState("");
  const [pageError, setPageError] = useState("");

  const [phoneNumber, setPhoneNumber] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [isDataLoadedFromAPI, setIsDataLoadedFromAPI] = useState(false);
  const [panLast4, setPanLast4] = useState("");

  const [verifiedAadhaar, setVerifiedAadhaar] = useState("");

  // Locked fallback values (used only if user hasn't typed anything)
  const [lockedName, setLockedName] = useState("");
  const [lockedDOB, setLockedDOB] = useState("");
  const [nameSource, setNameSource] = useState<"step3" | "api" | "manual" | "">(
    "",
  );
  const [dobSource, setDobSource] = useState<"step3" | "api" | "manual" | "">(
    "",
  );

  const lockedNameRef = useRef("");
  const lockedDOBRef = useRef("");
  const verifiedAadhaarRef = useRef("");

  // API-resolved refs (guaranteed source of truth for name/DOB)
  const apiNameRef = useRef("");
  const apiDobRef = useRef("");

  // Phone ref — guaranteed source of truth even if state lags
  const phoneRef = useRef("");

  useEffect(() => {
    lockedNameRef.current = lockedName;
  }, [lockedName]);
  useEffect(() => {
    lockedDOBRef.current = lockedDOB;
  }, [lockedDOB]);
  useEffect(() => {
    verifiedAadhaarRef.current = verifiedAadhaar;
  }, [verifiedAadhaar]);
  useEffect(() => {
    phoneRef.current = phoneNumber;
  }, [phoneNumber]);

  const ADMIN_PHONE = "+91 98765 43210";
  const ADMIN_EMAIL = "support@indiekonnect.com";

  const [step4PAN] = useStep4PANMutation();
  const [getStepData, { isLoading: isLoadingStepData }] =
    useLazyGetStepDataQuery();

  // ==========================================
  // LOAD PHONE (multi-source resolution)
  // ==========================================

  useEffect(() => {
    const candidates: Array<string | null | undefined> = [
      // 1. From parent step props (best — always fresh)
      (data as any)?.phone,
      (data as any)?.mobile,
      (data as any)?.phone_number,

      // 2. localStorage — canonical keys
      typeof window !== "undefined"
        ? localStorage.getItem("distributor_verified_phone")
        : null,
      typeof window !== "undefined"
        ? localStorage.getItem("distributor_mobile")
        : null,
      typeof window !== "undefined"
        ? localStorage.getItem("distributor_phone")
        : null,

      // 3. localStorage — legacy keys from earlier steps
      typeof window !== "undefined"
        ? localStorage.getItem("verified_phone")
        : null,
      typeof window !== "undefined"
        ? localStorage.getItem("phone_verified")
        : null,
      typeof window !== "undefined"
        ? localStorage.getItem("customer_phone")
        : null,
    ];

    const raw = candidates.find(
      (v) => typeof v === "string" && v.trim().length > 0,
    );

    if (!raw) {
      console.warn("⚠️ [PANStep] No phone found in props or localStorage");
      return;
    }

    const formatted = normalizePhone(raw);

    console.log("📞 [PANStep] phone resolved →", { raw, formatted });

    if (formatted) {
      setPhoneNumber(formatted);
      phoneRef.current = formatted;
    } else {
      console.warn("⚠️ [PANStep] phone could not be normalized →", raw);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    (data as any)?.phone,
    (data as any)?.mobile,
    (data as any)?.phone_number,
  ]);

  // ==========================================
  // INITIAL RESOLVE (props / localStorage)
  // ==========================================

  useEffect(() => {
    // ---- Aadhaar ----
    const aadhaarFromProps = String(data.aadhaar_number || "").replace(
      /\D/g,
      "",
    );
    if (aadhaarFromProps.length === 12) {
      setVerifiedAadhaar(aadhaarFromProps);
    } else {
      const aadhaarFromStorage = String(
        localStorage.getItem("distributor_verified_aadhaar") || "",
      ).replace(/\D/g, "");
      if (aadhaarFromStorage.length === 12) {
        setVerifiedAadhaar(aadhaarFromStorage);
      }
    }

    // ---- Name ----
    if (data.pan_name_as_per_pan?.trim()) {
      setLockedName(data.pan_name_as_per_pan.trim());
      lockedNameRef.current = data.pan_name_as_per_pan.trim();
      setNameSource("api");
    } else {
      const storedName = (
        localStorage.getItem("distributor_aadhaar_name_as_per_pan") || ""
      ).trim();
      if (storedName) {
        setLockedName(storedName);
        lockedNameRef.current = storedName;
        setNameSource("step3");
        onChange({
          target: { name: "pan_name_as_per_pan", value: storedName },
        } as any);
      }
    }

    // ---- DOB ----
    if (data.pan_date_of_birth?.trim()) {
      const normalized = normalizeDOB(data.pan_date_of_birth);
      setLockedDOB(normalized);
      lockedDOBRef.current = normalized;
      setDobSource("api");
    } else {
      const storedDOB = normalizeDOB(
        localStorage.getItem("distributor_aadhaar_date_of_birth") || "",
      );
      if (storedDOB) {
        setLockedDOB(storedDOB);
        lockedDOBRef.current = storedDOB;
        setDobSource("step3");
        onChange({
          target: { name: "pan_date_of_birth", value: storedDOB },
        } as any);
      }
    }
  }, [data.aadhaar_number, data.pan_name_as_per_pan, data.pan_date_of_birth]);

  // ==========================================
  // FETCH STEP DATA
  // ==========================================

  const fetchStepData = async (): Promise<{
    name: string;
    dob: string;
  } | null> => {
    const email = data.email || localStorage.getItem("distributor_email") || "";
    if (!email) {
      console.warn("[fetchStepData] ❌ No email found");
      return null;
    }

    console.log("[fetchStepData] 🔍 Fetching step 4 for:", email);

    try {
      const response = await getStepData({ step: "4", phone: email }).unwrap();
      console.log("[fetchStepData] ✅ Response:", response);

      if (!response?.status || !response?.step_data) {
        console.warn("[fetchStepData] ⚠️ No step_data in response");
        return null;
      }

      const userData: any = response.step_data.user || {};
      const profileData: any = response.step_data.distributor_profile || {};

      // ---- NAME (preserve case exactly as backend returns it) ----
      const apiName = String(
        userData?.full_name ||
          profileData?.pan_name_as_per_pan ||
          profileData?.bank_holder_name ||
          "",
      ).trim();

      console.log("[fetchStepData] name candidates:", {
        user_full_name: userData?.full_name,
        pan_name_as_per_pan: profileData?.pan_name_as_per_pan,
        bank_holder_name: profileData?.bank_holder_name,
        resolved: apiName,
      });

      if (apiName) {
        apiNameRef.current = apiName;
        lockedNameRef.current = apiName;
        setLockedName(apiName);
        setNameSource((prev) => prev || "api");
        onChange({
          target: { name: "pan_name_as_per_pan", value: apiName },
        } as any);
      }

      // ---- DOB ----
      const apiDobRaw =
        userData?.date_of_birth ||
        profileData?.pan_date_of_birth ||
        profileData?.date_of_birth ||
        "";

      const apiDob = normalizeDOB(String(apiDobRaw));

      console.log("[fetchStepData] dob candidates:", {
        user_date_of_birth: userData?.date_of_birth,
        pan_date_of_birth: profileData?.pan_date_of_birth,
        profile_date_of_birth: profileData?.date_of_birth,
        raw: apiDobRaw,
        normalized: apiDob,
      });

      if (apiDob) {
        apiDobRef.current = apiDob;
        lockedDOBRef.current = apiDob;
        setLockedDOB(apiDob);
        setDobSource((prev) => prev || "api");
        onChange({
          target: { name: "pan_date_of_birth", value: apiDob },
        } as any);
      }

      // ---- PHONE (from API — fallback if localStorage/props failed) ----
      const apiPhoneRaw =
        userData?.phone ||
        userData?.mobile ||
        profileData?.phone ||
        profileData?.mobile ||
        "";
      const apiPhone = normalizePhone(String(apiPhoneRaw));
      if (apiPhone && !phoneRef.current) {
        console.log("[fetchStepData] 📞 phone from API →", apiPhone);
        setPhoneNumber(apiPhone);
        phoneRef.current = apiPhone;
      }

      // ---- PAN verified state ----
      if (userData.pan_last4) {
        setPanLast4(userData.pan_last4);
        onChange({ target: { name: "pan_verified", value: true } } as any);
        onChange({
          target: { name: "pan_number", value: userData.pan_last4 },
        } as any);
        setIsDataLoadedFromAPI(true);
        dispatch(
          showToast({
            message: "Loaded PAN verification data successfully",
            type: "success",
          }),
        );
      }

      return { name: apiName, dob: apiDob };
    } catch (error: any) {
      console.error("[fetchStepData] ❌ Error:", error);
      if (error?.status !== 404) {
        dispatch(
          showToast({
            message: error?.data?.message || "Failed to load PAN data",
            type: "error",
          }),
        );
      }
      return null;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const email =
        data.email || localStorage.getItem("distributor_email") || "";
      if (email) await fetchStepData();
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.email]);

  // ==========================================
  // CLEAR REGISTRATION DATA
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
      "distributor_aadhaar_reference_id",
      "distributor_verified_aadhaar",
      "distributor_aadhaar_name_as_per_pan",
      "distributor_aadhaar_date_of_birth",
    ];
    itemsToRemove.forEach((item) => localStorage.removeItem(item));
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
    onBackToMobile?.();
  };

  // ==========================================
  // RESOLVE AADHAAR FOR PAYLOAD
  // ==========================================

  const resolveAadhaarForPayload = (): {
    value: string;
    isFull: boolean;
  } => {
    const fromRef = String(verifiedAadhaarRef.current || "").replace(/\D/g, "");
    if (fromRef.length === 12) return { value: fromRef, isFull: true };

    const fromState = String(verifiedAadhaar || "").replace(/\D/g, "");
    if (fromState.length === 12) return { value: fromState, isFull: true };

    const fromStorage = String(
      localStorage.getItem("distributor_verified_aadhaar") || "",
    ).replace(/\D/g, "");
    if (fromStorage.length === 12) return { value: fromStorage, isFull: true };

    const fromProps = String(data.aadhaar_number || "").replace(/\D/g, "");
    if (fromProps.length === 4 && data.aadhaar_verified) {
      return { value: fromProps, isFull: false };
    }

    return { value: "", isFull: false };
  };

  // ==========================================
  // RESOLVE PHONE FOR PAYLOAD (last-ditch fallback)
  // ==========================================

  const resolvePhoneForPayload = (): string => {
    // 1. ref
    if (phoneRef.current) return phoneRef.current;
    // 2. state
    if (phoneNumber) return phoneNumber;
    // 3. props
    const fromProps = normalizePhone(
      String(
        (data as any)?.phone ||
          (data as any)?.mobile ||
          (data as any)?.phone_number ||
          "",
      ),
    );
    if (fromProps) return fromProps;
    // 4. localStorage
    const keys = [
      "distributor_verified_phone",
      "distributor_mobile",
      "distributor_phone",
      "verified_phone",
      "phone_verified",
      "customer_phone",
    ];
    for (const k of keys) {
      const v = localStorage.getItem(k);
      if (v) {
        const normalized = normalizePhone(v);
        if (normalized) return normalized;
      }
    }
    return "";
  };

  // ==========================================
  // PAN VERIFY
  // ==========================================

  const handlePANVerify = async () => {
    setPanFieldError("");
    setNameFieldError("");
    setDobFieldError("");
    setPageError("");

    // ---- PAN validation ----
    const rawPan = String(data.pan_number || "").toUpperCase();

    if (isMaskedPAN(rawPan)) {
      setPanFieldError("Please enter your real PAN number (e.g. ABCDE1234F)");
      dispatch(
        showToast({
          message: "Please enter your real PAN number",
          type: "error",
        }),
      );
      return;
    }

    const cleanPan = rawPan.replace(/[^A-Z0-9]/g, "");

    if (cleanPan.length !== 10) {
      setPanFieldError("Please enter a valid 10-character PAN");
      dispatch(
        showToast({
          message: "Please enter a valid 10-character PAN",
          type: "error",
        }),
      );
      return;
    }

    const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panPattern.test(cleanPan)) {
      setPanFieldError("Invalid PAN format. Format: ABCDE1234F");
      dispatch(
        showToast({
          message: "Invalid PAN format. Format: ABCDE1234F",
          type: "error",
        }),
      );
      return;
    }

    // ---- Name resolution (preserve case — NO uppercasing) ----
    const manualName = String(data.pan_name_as_per_pan || "").trim();
    const storedName = (
      localStorage.getItem("distributor_aadhaar_name_as_per_pan") || ""
    ).trim();
    const finalName = (
      manualName ||
      apiNameRef.current ||
      lockedNameRef.current ||
      lockedName ||
      storedName ||
      ""
    ).trim();

    // ---- DOB resolution ----
    const manualDOB = String(data.pan_date_of_birth || "").trim();
    const storedDOB = normalizeDOB(
      localStorage.getItem("distributor_aadhaar_date_of_birth") || "",
    );
    const finalDOB = normalizeDOB(
      manualDOB ||
        apiDobRef.current ||
        lockedDOBRef.current ||
        lockedDOB ||
        storedDOB ||
        "",
    );

    // ---- Phone resolution ----
    const finalPhone = resolvePhoneForPayload();

    // ---- HARD GUARDS ----
    if (!finalName || finalName.length < 3) {
      console.error("❌ BLOCKED: name invalid", {
        manualName,
        apiNameRef: apiNameRef.current,
        lockedNameRef: lockedNameRef.current,
        lockedName,
        storedName,
        finalName,
      });
      setNameFieldError("Name as per PAN is required (min 3 characters)");
      dispatch(
        showToast({
          message: "Please enter name as per PAN",
          type: "error",
        }),
      );
      return;
    }

    if (!finalDOB || !isValidDOB(finalDOB)) {
      console.error("❌ BLOCKED: dob invalid", {
        manualDOB,
        apiDobRef: apiDobRef.current,
        lockedDOBRef: lockedDOBRef.current,
        lockedDOB,
        storedDOB,
        finalDOB,
      });
      setDobFieldError("Valid date of birth is required (DD/MM/YYYY)");
      dispatch(
        showToast({
          message: "Please enter a valid date of birth",
          type: "error",
        }),
      );
      return;
    }

    if (!finalPhone) {
      console.error("❌ BLOCKED: phone not found in any source");
      setPageError(
        "Phone number not found. Please go back and verify your mobile.",
      );
      dispatch(
        showToast({
          message: "Phone number not found. Please verify your mobile first.",
          type: "error",
        }),
      );
      return;
    }

    // sync state/ref if resolved from a fallback source
    if (!phoneNumber && finalPhone) {
      setPhoneNumber(finalPhone);
      phoneRef.current = finalPhone;
    }

    setIsVerifying(true);

    const aadhaarResolved = resolveAadhaarForPayload();

    // ---- Build payload — all 4 required fields explicit ----
    const payload: {
      phone: string;
      encrypted_pan: string;
      name_as_per_pan: string;
      date_of_birth: string;
      aadhaar_number?: string;
    } = {
      phone: finalPhone,
      encrypted_pan: cleanPan,
      name_as_per_pan: finalName, // ✅ case preserved from source
      date_of_birth: finalDOB,
    };

    if (aadhaarResolved.isFull && aadhaarResolved.value.length === 12) {
      payload.aadhaar_number = aadhaarResolved.value;
    }

    try {
      const response = await step4PAN(payload).unwrap();
      if (response.status) {
        onChange({ target: { name: "pan_verified", value: true } } as any);

        dispatch(
          showToast({
            message: response.message || "PAN verified successfully",
            type: "success",
          }),
        );

        await fetchStepData();

        setTimeout(() => {
          onNext?.();
        }, 1000);
      } else {
        const backendErrors =
          (response as any)?.errors &&
          typeof (response as any).errors === "object"
            ? (response as any).errors
            : null;

        if (backendErrors?.encrypted_pan || backendErrors?.pan_number) {
          const msg = Array.isArray(
            backendErrors.encrypted_pan || backendErrors.pan_number,
          )
            ? (backendErrors.encrypted_pan || backendErrors.pan_number)[0]
            : "Invalid PAN";
          setPanFieldError(msg);
        } else if (backendErrors?.name_as_per_pan) {
          setPageError(backendErrors.name_as_per_pan[0]);
        } else if (backendErrors?.date_of_birth) {
          setPageError(backendErrors.date_of_birth[0]);
        } else {
          setPageError(
            response.message || "PAN verification failed. Please try again.",
          );
        }

        dispatch(
          showToast({
            message:
              response.message || "PAN verification failed. Please try again.",
            type: "error",
          }),
        );
      }
    } catch (error: any) {
      console.error("❌ [Step 4] PAN verify error:", error);

      const backendErrors = error?.data?.errors;
      if (backendErrors && typeof backendErrors === "object") {
        if (backendErrors.encrypted_pan || backendErrors.pan_number) {
          const msg = Array.isArray(
            backendErrors.encrypted_pan || backendErrors.pan_number,
          )
            ? (backendErrors.encrypted_pan || backendErrors.pan_number)[0]
            : "Invalid PAN";
          setPanFieldError(msg);
        } else if (backendErrors?.name_as_per_pan) {
          setPageError(backendErrors.name_as_per_pan[0]);
        } else if (backendErrors?.date_of_birth) {
          setPageError(backendErrors.date_of_birth[0]);
        } else {
          setPageError("PAN verification failed. Please try again.");
        }
      } else {
        setPageError(
          error?.data?.message ||
            error?.message ||
            "PAN verification failed. Please try again.",
        );
      }

      dispatch(
        showToast({
          message:
            error?.data?.message ||
            error?.message ||
            "PAN verification failed. Please try again.",
          type: "error",
        }),
      );
    } finally {
      setIsVerifying(false);
    }
  };

  // ==========================================
  // NEXT
  // ==========================================

  const handleNext = () => {
    if (isDataLoadedFromAPI && data.pan_verified) {
      dispatch(
        showToast({
          message: "PAN already verified. Proceeding to next step.",
          type: "success",
        }),
      );
      setTimeout(() => onNext?.(), 500);
      return;
    }

    if (!data.pan_verified) {
      handlePANVerify();
    } else {
      onNext?.();
    }
  };

  // ==========================================
  // INPUT HANDLERS
  // ==========================================

  const handlePANChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");

    if (value.includes("*")) return;
    if (value.length > 10) value = value.slice(0, 10);

    if (isDataLoadedFromAPI) setIsDataLoadedFromAPI(false);

    onChange({
      target: { name: "pan_number", value },
    } as any);

    setPanFieldError("");
    setPageError("");
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // ✅ Preserve user's case exactly — only strip disallowed characters.
    // Backend may be case-sensitive for name matching, so we don't
    // uppercase on typing or blur.
    const value = e.target.value.replace(/[^A-Za-z .'-]/g, "");

    onChange({
      target: { name: "pan_name_as_per_pan", value },
    } as any);

    setLockedName(value);
    lockedNameRef.current = value;
    setNameSource("manual");
    setNameFieldError("");
    setPageError("");
  };

  const handleDOBChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDOBInput(e.target.value);

    onChange({
      target: { name: "pan_date_of_birth", value: formatted },
    } as any);

    setLockedDOB(formatted);
    lockedDOBRef.current = formatted;
    setDobSource("manual");
    setDobFieldError("");
    setPageError("");
  };

  const cleanPan =
    data.pan_number?.toUpperCase().replace(/[^A-Z0-9]/g, "") || "";

  const isContinueEnabled = () => {
    if (isDataLoadedFromAPI && data.pan_verified) return true;
    return (
      !!data.pan_number &&
      cleanPan.length === 10 &&
      !!String(data.pan_name_as_per_pan || "").trim() &&
      !!String(data.pan_date_of_birth || "").trim() &&
      !isVerifying
    );
  };

  const getButtonLabel = () => {
    if (isDataLoadedFromAPI && data.pan_verified) return "Continue";
    if (isVerifying) return "Verifying...";
    return "Verify PAN";
  };

  const displayedName =
    String(data.pan_name_as_per_pan || "").trim() || lockedName || "";

  const displayedDOB =
    String(data.pan_date_of_birth || "").trim() ||
    lockedDOB ||
    normalizeDOB(data.pan_date_of_birth || "");

  const isNameAutoFilled = nameSource === "api" || nameSource === "step3";
  const isDOBAutoFilled = dobSource === "api" || dobSource === "step3";

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
                      <IdCard className="w-4 sm:w-5 h-4 sm:h-5 text-[var(--navy)]" />
                    </div>
                    <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-[var(--navy)]">
                      PAN Verification
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 font-medium">
                    Verify your PAN for tax compliance
                  </p>
                  {isLoadingStepData && (
                    <div className="flex items-center justify-start gap-2 mt-2 text-xs sm:text-sm text-gray-500">
                      <Loader2 className="w-3 sm:w-4 h-3 sm:h-4 animate-spin" />
                      Loading your PAN data...
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
                  className="group flex-shrink-0 flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-[var(--gold)]/40 bg-[#FFFBEF] text-xs sm:text-sm font-semibold text-[var(--gold-deep)] hover:bg-[var(--gold)] hover:text-[var(--navy)] hover:border-[var(--gold)] shadow-sm hover:shadow-md transition-all duration-200 whitespace-nowrap"
                >
                  <PlusCircle className="w-3 sm:w-4 h-3 sm:h-4 transition-transform duration-300 group-hover:rotate-90" />
                  <span className="hidden xs:inline">New Registration</span>
                  <span className="xs:hidden">New</span>
                </button>
              </div>

              <InfoBox type="info" title="Why this is needed">
                PAN verification is mandatory for distributor activation. Name
                and DOB are auto-filled from your profile — you can edit them if
                needed.
              </InfoBox>

              {pageError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-red-600 font-medium">
                  {pageError}
                </div>
              )}

              <div className="space-y-3 sm:space-y-4">
                {/* PAN Number */}
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-semibold text-gray-700 block">
                    PAN Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="pan_number"
                      value={data.pan_number || ""}
                      onChange={handlePANChange}
                      placeholder={
                        isDataLoadedFromAPI ? "*****" + panLast4 : "ABCDE1234F"
                      }
                      maxLength={10}
                      className={
                        "w-full h-12 sm:h-14 px-3 sm:px-4 text-black rounded-xl sm:rounded-2xl border uppercase tracking-wider font-medium text-sm sm:text-base " +
                        (errors.pan_number || panFieldError
                          ? "border-red-400 ring-2 ring-red-100"
                          : data.pan_verified
                            ? "border-emerald-400 bg-emerald-50/60"
                            : isDataLoadedFromAPI
                              ? "border-blue-400 bg-blue-50/60"
                              : "border-gray-200") +
                        " bg-white focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all duration-200 outline-none placeholder:text-gray-400 placeholder:tracking-normal placeholder:font-normal"
                      }
                      disabled={
                        isVerifying ||
                        data.pan_verified ||
                        (isDataLoadedFromAPI && data.pan_verified)
                      }
                    />
                    {data.pan_verified && (
                      <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2">
                        <CheckCircle className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-500" />
                      </div>
                    )}
                  </div>
                  {(errors.pan_number || panFieldError) && (
                    <p className="text-[10px] sm:text-xs text-red-500 mt-1 font-medium">
                      {errors.pan_number || panFieldError}
                    </p>
                  )}
                  <p className="text-[10px] sm:text-xs text-gray-400 mt-1 font-medium">
                    {isDataLoadedFromAPI && data.pan_verified
                      ? "✓ PAN already verified. Only last 4 characters are visible."
                      : "Format: ABCDE1234F (5 letters, 4 digits, 1 letter)"}
                  </p>
                </div>

                {/* Name — editable, case preserved */}
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                    Name as per PAN <span className="text-red-500">*</span>
                    {isNameAutoFilled ? (
                      <>
                        <Lock className="w-3 h-3 text-blue-500" />
                        <span className="text-[10px] sm:text-xs font-normal text-blue-500">
                          (auto-filled — edit if needed)
                        </span>
                      </>
                    ) : (
                      <>
                        <Pencil className="w-3 h-3 text-gray-400" />
                        <span className="text-[10px] sm:text-xs font-normal text-gray-400">
                          (enter manually)
                        </span>
                      </>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="pan_name_as_per_pan"
                      value={data.pan_name_as_per_pan || ""}
                      onChange={handleNameChange}
                      placeholder="e.g. John Doe"
                      disabled={isVerifying || data.pan_verified}
                      className={
                        "w-full h-12 sm:h-14 px-3 sm:px-4 rounded-xl sm:rounded-2xl border tracking-wide font-semibold text-sm sm:text-base outline-none transition-all duration-200 " +
                        (nameFieldError
                          ? "border-red-400 ring-2 ring-red-100 bg-red-50/40 text-red-800"
                          : isNameAutoFilled
                            ? "border-blue-300 bg-blue-50/50 text-blue-900 focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20"
                            : "border-gray-200 bg-white text-black focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20") +
                        " placeholder:text-gray-400 placeholder:font-normal placeholder:tracking-normal disabled:cursor-not-allowed"
                      }
                    />
                    {data.pan_name_as_per_pan?.trim() &&
                      !nameFieldError &&
                      !isVerifying && (
                        <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2">
                          <CheckCircle className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-500" />
                        </div>
                      )}
                  </div>
                  {nameFieldError && (
                    <p className="text-[10px] sm:text-xs text-red-500 mt-1 font-medium">
                      {nameFieldError}
                    </p>
                  )}
                  <p className="text-[10px] sm:text-xs text-gray-400 mt-1 font-medium">
                    {nameSource === "step3"
                      ? "✓ Auto-filled from Step 3 (Aadhaar)."
                      : nameSource === "api"
                        ? "✓ Auto-filled from your profile."
                        : nameSource === "manual"
                          ? "✎ Entered manually."
                          : "✎ Please enter your name exactly as on PAN card."}
                  </p>
                </div>

                {/* DOB — editable */}
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                    Date of Birth <span className="text-red-500">*</span>
                    {isDOBAutoFilled ? (
                      <>
                        <Lock className="w-3 h-3 text-blue-500" />
                        <span className="text-[10px] sm:text-xs font-normal text-blue-500">
                          (auto-filled — edit if needed)
                        </span>
                      </>
                    ) : (
                      <>
                        <Pencil className="w-3 h-3 text-gray-400" />
                        <span className="text-[10px] sm:text-xs font-normal text-gray-400">
                          (enter manually)
                        </span>
                      </>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="pan_date_of_birth"
                      value={data.pan_date_of_birth || ""}
                      onChange={handleDOBChange}
                      placeholder="DD/MM/YYYY"
                      maxLength={10}
                      inputMode="numeric"
                      disabled={isVerifying || data.pan_verified}
                      className={
                        "w-full h-12 sm:h-14 px-3 sm:px-4 rounded-xl sm:rounded-2xl border tracking-wider font-semibold text-sm sm:text-base outline-none transition-all duration-200 " +
                        (dobFieldError
                          ? "border-red-400 ring-2 ring-red-100 bg-red-50/40 text-red-800"
                          : isDOBAutoFilled
                            ? "border-blue-300 bg-blue-50/50 text-blue-900 focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20"
                            : "border-gray-200 bg-white text-black focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20") +
                        " placeholder:text-gray-400 placeholder:font-normal placeholder:tracking-normal disabled:cursor-not-allowed"
                      }
                    />
                    {data.pan_date_of_birth?.trim() &&
                      isValidDOB(data.pan_date_of_birth || "") &&
                      !dobFieldError &&
                      !isVerifying && (
                        <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2">
                          <CheckCircle className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-500" />
                        </div>
                      )}
                  </div>
                  {dobFieldError && (
                    <p className="text-[10px] sm:text-xs text-red-500 mt-1 font-medium">
                      {dobFieldError}
                    </p>
                  )}
                  <p className="text-[10px] sm:text-xs text-gray-400 mt-1 font-medium">
                    {dobSource === "step3"
                      ? "✓ Auto-filled from Step 3 (Aadhaar)."
                      : dobSource === "api"
                        ? "✓ Auto-filled from your profile."
                        : dobSource === "manual"
                          ? "✎ Entered manually."
                          : "✎ Please enter your date of birth (DD/MM/YYYY)."}
                  </p>
                </div>

                {/* Contact Admin */}
                <button
                  type="button"
                  onClick={() => setShowContactModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 transition-all duration-200 text-xs sm:text-sm font-semibold"
                >
                  <PhoneCall className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                  Need help? Contact Admin
                </button>

                {isVerifying && (
                  <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 font-medium">
                    <Loader2 className="w-3 sm:w-4 h-3 sm:h-4 animate-spin" />
                    Verifying PAN...
                  </div>
                )}

                {data.pan_verified && (
                  <div className="bg-emerald-50/80 backdrop-blur-sm p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-emerald-100 text-xs sm:text-sm text-emerald-700 flex items-center gap-2 sm:gap-2.5 font-medium">
                    <CheckCircle className="w-3.5 sm:w-4 h-3.5 sm:h-4 flex-shrink-0" />
                    <span>
                      PAN verified successfully
                      {isDataLoadedFromAPI && (
                        <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs text-blue-600">
                          (loaded from saved data)
                        </span>
                      )}
                    </span>
                  </div>
                )}

                <FormActions
                  onBack={onBack}
                  onNext={
                    isDataLoadedFromAPI && data.pan_verified
                      ? onNext
                      : undefined
                  }
                  onSubmit={
                    !isDataLoadedFromAPI || !data.pan_verified
                      ? handlePANVerify
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

      {/* Contact Admin Modal */}
      {showContactModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--navy)]/70 backdrop-blur-sm px-3 sm:px-4"
          style={{ fontFamily: theme.font }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowContactModal(false);
          }}
        >
          <div className="bg-white rounded-[24px] sm:rounded-[28px] max-w-md w-full mx-2 sm:mx-4 p-5 sm:p-7 shadow-[0_30px_80px_-20px_rgba(6,16,30,0.5)] relative">
            <button
              type="button"
              onClick={() => setShowContactModal(false)}
              className="absolute right-3 sm:right-4 top-3 sm:top-4 text-gray-400 hover:text-[#06101E] hover:bg-gray-100 rounded-full p-1 transition-colors z-10"
            >
              <X className="w-4 sm:w-5 h-4 sm:h-5" />
            </button>

            <div className="flex justify-center mb-3 sm:mb-4">
              <div className="w-12 sm:w-16 h-12 sm:h-16 rounded-full bg-amber-100 flex items-center justify-center ring-4 ring-amber-50">
                <PhoneCall className="w-6 sm:w-8 h-6 sm:h-8 text-amber-600" />
              </div>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-center text-[#06101E] mb-1 sm:mb-2 tracking-tight">
              Contact Admin
            </h3>

            <p className="text-xs sm:text-sm text-gray-500 text-center mb-4 sm:mb-6 font-medium">
              If your name or date of birth doesn&apos;t match your PAN card,
              please reach out to our admin team.
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 sm:p-4 mb-4 sm:mb-5 space-y-2">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-gray-500 font-medium">Name:</span>
                <span className="text-gray-800 font-bold">
                  {displayedName || "—"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-gray-500 font-medium">DOB:</span>
                <span className="text-gray-800 font-bold">
                  {displayedDOB || "—"}
                </span>
              </div>
            </div>

            <div className="space-y-2 mb-4 sm:mb-6">
              <a
                href={`tel:${ADMIN_PHONE.replace(/\s/g, "")}`}
                className="w-full flex items-center gap-3 px-3 sm:px-4 py-3 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition-colors text-sm sm:text-base font-semibold text-emerald-800"
              >
                <PhoneCall className="w-4 sm:w-5 h-4 sm:h-5 flex-shrink-0" />
                <span className="flex-1 text-left">Call</span>
                <span className="text-xs sm:text-sm text-emerald-600">
                  {ADMIN_PHONE}
                </span>
              </a>

              <a
                href={`mailto:${ADMIN_EMAIL}?subject=Update%20Name%2FDOB%20for%20Distributor%20KYC&body=My%20registered%20phone%3A%20${encodeURIComponent(
                  phoneNumber,
                )}`}
                className="w-full flex items-center gap-3 px-3 sm:px-4 py-3 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors text-sm sm:text-base font-semibold text-blue-800"
              >
                <svg
                  className="w-4 sm:w-5 h-4 sm:h-5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span className="flex-1 text-left">Email</span>
                <span className="text-xs sm:text-sm text-blue-600 truncate max-w-[140px]">
                  {ADMIN_EMAIL}
                </span>
              </a>
            </div>

            <button
              type="button"
              onClick={() => setShowContactModal(false)}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl transition-all duration-200 text-sm sm:text-base"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Confirm New Registration Modal */}
      {showConfirmModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--navy)]/70 backdrop-blur-sm px-3 sm:px-4"
          style={{ fontFamily: theme.font }}
        >
          <div className="bg-white rounded-[24px] sm:rounded-[28px] max-w-md w-full mx-2 sm:mx-4 p-5 sm:p-7 shadow-[0_30px_80px_-20px_rgba(6,16,30,0.5)] relative">
            <button
              type="button"
              onClick={() => setShowConfirmModal(false)}
              className="absolute right-3 sm:right-4 top-3 sm:top-4 text-gray-400 hover:text-[#06101E] hover:bg-gray-100 rounded-full p-1 transition-colors"
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
                className="w-full sm:flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 sm:py-2.5 rounded-xl transition-all duration-200 text-sm sm:text-base order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleNewRegistration}
                className="w-full sm:flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 sm:py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_8px_20px_-6px_rgba(239,68,68,0.5)] text-sm sm:text-base order-1 sm:order-2"
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
