"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
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
  Mail,
  Send,
  User,
  CalendarDays,
} from "lucide-react";

import { InfoBox } from "../InfoBox";
import { FormActions } from "../FormActions";
import { StepProps } from "../../types";
import { useAppDispatch } from "@/lib/redux/hooks";
import { showToast } from "@/lib/slices/toastSlice";
import {
  useStep4PANMutation,
  useLazyGetStepDataQuery,
  useRequestCorrectionMutation,
  distributorAuthApi,
} from "../../../../../lib/redux/api/distributor/distributorauthApis";
import authApi from "@/lib/redux/api/authApi";

// Type-safe enum (must match backend)
type CorrectionReason =
  | "wrong_name_at_signup"
  | "wrong_dob_at_signup"
  | "both_wrong_at_signup"
 

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
 * Convert DD/MM/YYYY → YYYY-MM-DD (for native date input)
 */
const toISODate = (ddmmyyyy: string): string => {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(ddmmyyyy)) return "";
  const [dd, mm, yyyy] = ddmmyyyy.split("/");
  return `${yyyy}-${mm}-${dd}`;
};

/**
 * Convert YYYY-MM-DD → DD/MM/YYYY
 */
const fromISODate = (iso: string): string => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "";
  const [yyyy, mm, dd] = iso.split("-");
  return `${dd}/${mm}/${yyyy}`;
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
 * Validate DD/MM/YYYY — real calendar date.
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

/**
 * Age check — at least 18 years old.
 */
const isAtLeast18 = (value: string): boolean => {
  if (!isValidDOB(value)) return false;
  const [dd, mm, yyyy] = value.split("/").map((x) => parseInt(x, 10));
  const dob = new Date(yyyy, mm - 1, dd);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age >= 18;
};

/**
 * Return maximum allowed DOB (18 years ago) in YYYY-MM-DD.
 */
const getMaxDOB = (): string => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

/**
 * Return minimum sensible DOB (100 years ago) in YYYY-MM-DD.
 */
const getMinDOB = (): string => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 100);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
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

/**
 * Which fields should be shown based on reason.
 */
const reasonNeedsName = (r: CorrectionReason): boolean => {
  return (
    r === "wrong_name_at_signup" ||

    r === "both_wrong_at_signup" 

  );
};

const reasonNeedsDOB = (r: CorrectionReason): boolean => {
  return (
    r === "wrong_dob_at_signup" ||

    r === "both_wrong_at_signup" 

  );
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

  // Modal States
  const [showContactModal, setShowContactModal] = useState(false);
  const [isSubmittingCorrection, setIsSubmittingCorrection] = useState(false);

  const [correctionReason, setCorrectionReason] = useState<CorrectionReason>(
    "wrong_name_at_signup",
  );
  const [correctionName, setCorrectionName] = useState("");
  const [correctionDOB, setCorrectionDOB] = useState(""); // DD/MM/YYYY
  const [correctionDOBError, setCorrectionDOBError] = useState("");

  const [isDataLoadedFromAPI, setIsDataLoadedFromAPI] = useState(false);
  const [panLast4, setPanLast4] = useState("");

  const [verifiedAadhaar, setVerifiedAadhaar] = useState("");

  // Locked fallback values
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

  const apiNameRef = useRef("");
  const apiDobRef = useRef("");
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
  const [requestCorrection] = useRequestCorrectionMutation();
  const [getStepData, { isLoading: isLoadingStepData }] =
    useLazyGetStepDataQuery();

  // -------------------------------------------------------
  // Which correction fields to show
  // -------------------------------------------------------
  const showNameField = useMemo(
    () => reasonNeedsName(correctionReason),
    [correctionReason],
  );
  const showDOBField = useMemo(
    () => reasonNeedsDOB(correctionReason),
    [correctionReason],
  );

  // ==========================================
  // LOAD PHONE
  // ==========================================
  useEffect(() => {
    const candidates: Array<string | null | undefined> = [
      (data as any)?.phone,
      (data as any)?.mobile,
      (data as any)?.phone_number,
      typeof window !== "undefined"
        ? localStorage.getItem("distributor_verified_phone")
        : null,
      typeof window !== "undefined"
        ? localStorage.getItem("distributor_mobile")
        : null,
      typeof window !== "undefined"
        ? localStorage.getItem("distributor_phone")
        : null,
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
    if (!raw) return;

    const formatted = normalizePhone(raw);
    if (formatted) {
      setPhoneNumber(formatted);
      phoneRef.current = formatted;
    }
  }, [
    (data as any)?.phone,
    (data as any)?.mobile,
    (data as any)?.phone_number,
  ]);

  // ==========================================
  // INITIAL RESOLVE
  // ==========================================
  useEffect(() => {
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
    if (!email) return null;

    try {
      const response = await getStepData({ step: "4", phone: email }).unwrap();
      if (!response?.status || !response?.step_data) return null;

      const userData: any = response.step_data.user || {};
      const profileData: any = response.step_data.distributor_profile || {};

      const apiName = String(
        userData?.full_name ||
          profileData?.pan_name_as_per_pan ||
          profileData?.bank_holder_name ||
          "",
      ).trim();
      if (apiName) {
        apiNameRef.current = apiName;
        lockedNameRef.current = apiName;
        setLockedName(apiName);
        setNameSource((prev) => prev || "api");
        onChange({
          target: { name: "pan_name_as_per_pan", value: apiName },
        } as any);
      }

      const apiDobRaw =
        userData?.date_of_birth ||
        profileData?.pan_date_of_birth ||
        profileData?.date_of_birth ||
        "";
      const apiDob = normalizeDOB(String(apiDobRaw));
      if (apiDob) {
        apiDobRef.current = apiDob;
        lockedDOBRef.current = apiDob;
        setLockedDOB(apiDob);
        setDobSource((prev) => prev || "api");
        onChange({
          target: { name: "pan_date_of_birth", value: apiDob },
        } as any);
      }

      const apiPhoneRaw =
        userData?.phone ||
        userData?.mobile ||
        profileData?.phone ||
        profileData?.mobile ||
        "";
      const apiPhone = normalizePhone(String(apiPhoneRaw));
      if (apiPhone && !phoneRef.current) {
        setPhoneNumber(apiPhone);
        phoneRef.current = apiPhone;
      }

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
  const resolveAadhaarForPayload = (): { value: string; isFull: boolean } => {
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
  // RESOLVE PHONE FOR PAYLOAD
  // ==========================================
  const resolvePhoneForPayload = (): string => {
    if (phoneRef.current) return phoneRef.current;
    if (phoneNumber) return phoneNumber;
    const fromProps = normalizePhone(
      String(
        (data as any)?.phone ||
          (data as any)?.mobile ||
          (data as any)?.phone_number ||
          "",
      ),
    );
    if (fromProps) return fromProps;

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

    const finalPhone = resolvePhoneForPayload();

    if (!finalName || finalName.length < 3) {
      setNameFieldError("Name as per PAN is required (min 3 characters)");
      dispatch(
        showToast({ message: "Please enter name as per PAN", type: "error" }),
      );
      return;
    }

    if (!finalDOB || !isValidDOB(finalDOB)) {
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

    if (!phoneNumber && finalPhone) {
      setPhoneNumber(finalPhone);
      phoneRef.current = finalPhone;
    }

    setIsVerifying(true);
    const aadhaarResolved = resolveAadhaarForPayload();

    const payload: any = {
      phone: finalPhone,
      encrypted_pan: cleanPan,
      name_as_per_pan: finalName,
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
        setTimeout(() => onNext?.(), 1000);
      } else {
        const backendErrors = (response as any)?.errors || null;

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
  // HANDLE CORRECTION SUBMIT
  // ==========================================
  const handleRequestCorrection = async () => {
    setCorrectionDOBError("");

    // ---- Name validation (only when field is visible) ----
    if (showNameField && !correctionName.trim()) {
      dispatch(
        showToast({
          message: "Please enter your full name",
          type: "error",
        }),
      );
      return;
    }

    // ---- DOB validation (only when field is visible) ----
    if (showDOBField) {
      if (!correctionDOB.trim()) {
        setCorrectionDOBError("Date of birth is required");
        dispatch(
          showToast({
            message: "Please enter your date of birth",
            type: "error",
          }),
        );
        return;
      }

      if (!isValidDOB(correctionDOB)) {
        setCorrectionDOBError(
          "Please enter a valid calendar date (DD/MM/YYYY)",
        );
        dispatch(
          showToast({
            message: "Please enter a valid date of birth (DD/MM/YYYY)",
            type: "error",
          }),
        );
        return;
      }

      if (!isAtLeast18(correctionDOB)) {
        setCorrectionDOBError("You must be at least 18 years old");
        dispatch(
          showToast({
            message: "You must be at least 18 years old",
            type: "error",
          }),
        );
        return;
      }
    }

    setIsSubmittingCorrection(true);
    try {
      const email =
        data.email || localStorage.getItem("distributor_email") || "";

      // Fallback: if a field is hidden, use existing stored value
      const finalName = showNameField
        ? correctionName.trim()
        : String(data.pan_name_as_per_pan || lockedName || "").trim();

      const finalDOB = showDOBField
        ? correctionDOB.replace(/\//g, "-")
        : String(data.pan_date_of_birth || lockedDOB || "").replace(/\//g, "-");

      const payload = {
        email,
        reason: correctionReason,
        full_name: finalName,
        date_of_birth: finalDOB,
      };

      const res = await requestCorrection(payload).unwrap();
      if (res.status) {
        dispatch(
          showToast({
            message: "Correction request submitted successfully!",
            type: "success",
          }),
        );
        setShowContactModal(false);
      } else {
        dispatch(
          showToast({
            message: res.message || "Failed to submit request",
            type: "error",
          }),
        );
      }
    } catch (error: any) {
      dispatch(
        showToast({
          message: error?.data?.message || "Something went wrong",
          type: "error",
        }),
      );
    } finally {
      setIsSubmittingCorrection(false);
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
    onChange({ target: { name: "pan_number", value } } as any);
    setPanFieldError("");
    setPageError("");
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^A-Za-z .'-]/g, "");
    onChange({ target: { name: "pan_name_as_per_pan", value } } as any);
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

  const openContactModal = () => {
    setCorrectionName(data.pan_name_as_per_pan || lockedName || "");
    setCorrectionDOB(data.pan_date_of_birth || lockedDOB || "");
    setCorrectionDOBError("");
    setShowContactModal(true);
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

  const maxDOB = getMaxDOB();
  const minDOB = getMinDOB();

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

                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                    Name as per PAN <span className="text-red-500">*</span>
                    {nameSource === "api" || nameSource === "step3" ? (
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
                          : nameSource === "api" || nameSource === "step3"
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

                {/* DOB */}
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                    Date of Birth <span className="text-red-500">*</span>
                    {dobSource === "api" || dobSource === "step3" ? (
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
                          : dobSource === "api" || dobSource === "step3"
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

                {/* Contact Admin Button */}
                <button
                  type="button"
                  onClick={openContactModal}
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

      {/* ---------------- CONTACT ADMIN / CORRECTION MODAL ---------------- */}
      {showContactModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--navy)]/70 backdrop-blur-sm px-3 sm:px-4"
          style={{ fontFamily: theme.font }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowContactModal(false);
          }}
        >
          <div className="bg-white rounded-[24px] sm:rounded-[28px] max-w-md w-full mx-2 sm:mx-4 p-5 sm:p-7 shadow-[0_30px_80px_-20px_rgba(6,16,30,0.5)] relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowContactModal(false)}
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
              Request Correction
            </h3>

            <p className="text-xs sm:text-sm text-gray-500 text-center mb-4 sm:mb-6 font-medium">
              Select what's wrong and we'll send the request to admin for
              approval.
            </p>

            <div className="space-y-4 mb-5">
              {/* Reason Dropdown — exact backend enums */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-semibold text-gray-700 block">
                  Reason for correction
                </label>
                <select
                  value={correctionReason}
                  onChange={(e) =>
                    setCorrectionReason(e.target.value as CorrectionReason)
                  }
                  className="w-full h-11 sm:h-12 px-3 rounded-xl border border-gray-200 bg-gray-50 text-black text-sm font-medium focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 outline-none"
                >
                  <option value="wrong_name_at_signup">
                    Wrong Name at Signup
                  </option>
                  <option value="wrong_dob_at_signup">
                    Wrong DOB at Signup
                  </option>
                  <option value="both_wrong_at_signup">
                    Both Name &amp; DOB Wrong
                  </option>
               
                </select>
              </div>

              {/* Full Name — only if reason needs it */}
              {showNameField && (
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-semibold text-gray-700 block">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={correctionName}
                      onChange={(e) => setCorrectionName(e.target.value)}
                      placeholder="Enter correct full name"
                      className="w-full h-11 sm:h-12 pl-9 pr-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 placeholder:font-normal text-sm font-medium focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 outline-none"
                    />
                  </div>
                </div>
              )}

              {/* DOB — only if reason needs it, with native calendar + 18y cap */}
              {showDOBField && (
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-semibold text-gray-700 block">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      type="date"
                      value={toISODate(correctionDOB)}
                      onChange={(e) => {
                        const iso = e.target.value;
                        if (!iso) {
                          setCorrectionDOB("");
                          return;
                        }
                        const [yyyy, mm, dd] = iso.split("-");
                        setCorrectionDOB(`${dd}/${mm}/${yyyy}`);
                        setCorrectionDOBError("");
                      }}
                      min={minDOB}
                      max={maxDOB}
                      className="w-full h-11 sm:h-12 pl-9 pr-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm font-medium focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 outline-none"
                    />
                  </div>
                  {correctionDOBError && (
                    <p className="text-[10px] sm:text-xs text-red-500 mt-1 font-medium">
                      {correctionDOBError}
                    </p>
                  )}
                  <p className="text-[10px] sm:text-xs text-gray-400 mt-1 font-medium">
                    Must be at least 18 years old.
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleRequestCorrection}
              disabled={isSubmittingCorrection}
              className="w-full flex items-center justify-center gap-2 bg-[var(--gold)] hover:bg-[var(--gold-dark)] text-[var(--navy)] font-bold py-3 rounded-xl transition-all duration-200 mb-6 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmittingCorrection ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Submit Request
                </>
              )}
            </button>

            {/* Fallback Contact Options */}
            <div className="border-t border-gray-100 pt-4">
              <p className="text-[10px] sm:text-xs text-center text-gray-400 font-medium mb-3">
                Or contact us directly
              </p>
              <div className="flex gap-2">
                <a
                  href={`tel:${ADMIN_PHONE.replace(/\s/g, "")}`}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition-colors text-xs font-semibold text-emerald-800"
                >
                  <PhoneCall className="w-3.5 h-3.5" /> Call Support
                </a>
                <a
                  href={`mailto:${ADMIN_EMAIL}`}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors text-xs font-semibold text-blue-800"
                >
                  <Mail className="w-3.5 h-3.5" /> Email Support
                </a>
              </div>
            </div>
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
