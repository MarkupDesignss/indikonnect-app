// components/distributor/registration/components/steps/BankStep.tsx

"use client";

import React, { useEffect, useState } from "react";
import {
  PlusCircle,
  AlertTriangle,
  X,
  Loader2,
  CheckCircle,
  Landmark,
  Lock,
} from "lucide-react";

import { Input } from "@/components/common/Input";
import { PasswordInput } from "../PasswordInput";
import { InfoBox } from "../InfoBox";
import { StepProps } from "../../types";
import { useAppDispatch } from "@/lib/redux/hooks";
import { showToast } from "@/lib/slices/toastSlice";

import {
  useStep5BankMutation,
  useLazyGetStepDataQuery,
  distributorAuthApi,
} from "@/lib/redux/api/distributor/distributorauthApis";

import authApi from "@/lib/redux/api/authApi";

const theme = {
  font: "'Inter', 'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, sans-serif",
  gold: "#F9C744",
  goldDark: "#E6B33D",
  goldDeep: "#C9922A",
  navy: "#06101E",
  navySoft: "#0B1B2E",
};

export const BankStep: React.FC<StepProps> = ({
  data,
  errors,
  onChange,
  onNext,
  onBack,
  onBackToMobile,
}) => {
  const dispatch = useAppDispatch();

  const [isVerifying, setIsVerifying] = useState(false);

  // Generic error for API / form-level errors.
  // This is NOT passed into every field.
  const [bankError, setBankError] = useState("");

  const [confirmError, setConfirmError] = useState("");

  const [phoneNumber, setPhoneNumber] = useState("");

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [isDataLoadedFromAPI, setIsDataLoadedFromAPI] = useState(false);

  const [hasBankData, setHasBankData] = useState(false);

  /* ==========================================
     API HOOKS
  ========================================== */

  const [step5Bank] = useStep5BankMutation();

  const [getStepData, { isLoading: isLoadingStepData }] =
    useLazyGetStepDataQuery();

  /* ==========================================
     PREVENT BODY SCROLL WHEN MODAL IS OPEN
  ========================================== */

  useEffect(() => {
    if (!showConfirmModal) {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";
      return;
    }

    const scrollY = window.scrollY;

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    document.body.style.top = `-${scrollY}px`;

    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";

      window.scrollTo(0, scrollY);
    };
  }, [showConfirmModal]);

  /* ==========================================
     PHONE NUMBER HELPERS
  ========================================== */

  const formatPhoneNumber = (phone: string) => {
    const cleanPhone = phone.trim();

    if (!cleanPhone) {
      return "";
    }

    if (cleanPhone.startsWith("+")) {
      return cleanPhone;
    }

    return "+91" + cleanPhone.replace(/^0+/, "");
  };

  /* ==========================================
     LOAD PHONE NUMBER
  ========================================== */

  useEffect(() => {
    const dataWithPhone = data as any;

    const savedPhone =
      dataWithPhone?.phone ||
      dataWithPhone?.mobile ||
      dataWithPhone?.phone_number ||
      localStorage.getItem("distributor_verified_phone") ||
      localStorage.getItem("distributor_mobile") ||
      localStorage.getItem("verified_phone") ||
      localStorage.getItem("distributor_phone") ||
      "";

    if (savedPhone) {
      setPhoneNumber(formatPhoneNumber(savedPhone));
      return;
    }

    setPhoneNumber("");
  }, [data]);

  /* ==========================================
     FETCH STEP DATA FROM API
  ========================================== */

  const fetchStepData = async () => {
    const email =
      data.email || localStorage.getItem("distributor_email") || "";

    if (!email) {
      return;
    }

    try {
      const response = await getStepData({
        step: "5",
        phone: email,
      }).unwrap();

      if (!response.status || !response.step_data) {
        return;
      }

      const userData = response.step_data.user;
      const profileData = response.step_data.distributor_profile;

      if (!profileData?.bank_name) {
        return;
      }

      setHasBankData(true);

      onChange({
        target: {
          name: "bank_title",
          value: profileData.title || "Mr.",
        },
      } as any);

      onChange({
        target: {
          name: "bank_entity_type",
          value: profileData.type_of_entity || "",
        },
      } as any);

      onChange({
        target: {
          name: "bank_account_holder_name",
          value: profileData.bank_holder_name || "",
        },
      } as any);

      onChange({
        target: {
          name: "bank_name",
          value: profileData.bank_name || "",
        },
      } as any);

      onChange({
        target: {
          name: "bank_branch",
          value: profileData.branch_name || "",
        },
      } as any);

      onChange({
        target: {
          name: "bank_ifsc_code",
          value: profileData.bank_ifsc || "",
        },
      } as any);

      onChange({
        target: {
          name: "bank_account_type",
          value: profileData.account_type || "savings",
        },
      } as any);

      const gstFromAPI =
        profileData.gst_in ||
        profileData.gst_number ||
        userData?.gst_in ||
        "";

      onChange({
        target: {
          name: "bank_gst_in",
          value: gstFromAPI,
        },
      } as any);

      const companyFromAPI =
        profileData.company_name ||
        userData?.company_name ||
        "";

      onChange({
        target: {
          name: "bank_company_name",
          value: companyFromAPI,
        },
      } as any);

      if (userData?.account_last4) {
        onChange({
          target: {
            name: "bank_account_number",
            value: userData.account_last4,
          },
        } as any);

        onChange({
          target: {
            name: "bank_confirm_account_number",
            value: userData.account_last4,
          },
        } as any);
      }

      onChange({
        target: {
          name: "bank_verified",
          value: true,
        },
      } as any);

      setIsDataLoadedFromAPI(true);
      setBankError("");
      setConfirmError("");
    } catch (error: any) {
      if (error?.status !== 404) {
        setBankError(
          error?.data?.message || "Failed to load bank data",
        );

        dispatch(
          showToast({
            message:
              error?.data?.message || "Failed to load bank data",
            type: "error",
          }),
        );
      }
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const emailFromProps = data.email;
      const emailFromStorage = localStorage.getItem(
        "distributor_email",
      );

      const email = emailFromProps || emailFromStorage || "";

      if (email) {
        await fetchStepData();
      }
    };

    loadData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.email]);

  /* ==========================================
     CLEAR REGISTRATION DATA
  ========================================== */

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
    setBankError("");
    setConfirmError("");
    setPhoneNumber("");

    onBackToMobile?.();
  };

  /* ==========================================
     BANK VERIFICATION
  ========================================== */

  const handleBankVerify = async () => {
    // Clear old errors before fresh validation.
    setBankError("");
    setConfirmError("");

    /* ---------- TITLE ---------- */

    if (!data.bank_title?.trim()) {
      const message = "Please select a title";

      setBankError(message);

      dispatch(
        showToast({
          message,
          type: "error",
        }),
      );

      return;
    }

    /* ---------- ACCOUNT HOLDER ---------- */

    if (!data.bank_account_holder_name?.trim()) {
      const message = "Please enter the account holder name";

      setBankError(message);

      dispatch(
        showToast({
          message,
          type: "error",
        }),
      );

      return;
    }

    /* ---------- ENTITY ---------- */

    if (!data.bank_entity_type?.trim()) {
      const message = "Please select an entity type";

      setBankError(message);

      dispatch(
        showToast({
          message,
          type: "error",
        }),
      );

      return;
    }

    /* ---------- GST ---------- */

    const gstValue = String(data.bank_gst_in || "")
      .trim()
      .toUpperCase();

    if (gstValue.length > 0 && gstValue.length !== 15) {
      const message =
        "GST IN must be exactly 15 characters, or leave it empty.";

      setBankError(message);

      dispatch(
        showToast({
          message,
          type: "error",
        }),
      );

      return;
    }

    /* ---------- COMPANY ---------- */

    const companyValue = String(
      data.bank_company_name || "",
    ).trim();

    if (companyValue.length > 0 && companyValue.length < 2) {
      const message = "Company name must be at least 2 characters.";

      setBankError(message);

      dispatch(
        showToast({
          message,
          type: "error",
        }),
      );

      return;
    }

    /* ---------- BANK NAME ---------- */

    if (!data.bank_name?.trim()) {
      const message = "Please enter your bank name";

      setBankError(message);

      dispatch(
        showToast({
          message,
          type: "error",
        }),
      );

      return;
    }

    /* ---------- ACCOUNT NUMBER ---------- */

    const cleanAccountNumber =
      String(data.bank_account_number || "").replace(/\D/g, "");

    if (!cleanAccountNumber) {
      const message = "Please enter your account number.";

      setBankError(message);

      dispatch(
        showToast({
          message,
          type: "error",
        }),
      );

      return;
    }

    if (cleanAccountNumber.length < 9) {
      const message =
        "Please enter a valid account number (minimum 9 digits).";

      setBankError(message);

      dispatch(
        showToast({
          message,
          type: "error",
        }),
      );

      return;
    }

    if (cleanAccountNumber.length > 20) {
      const message =
        "Account number cannot exceed 20 digits.";

      setBankError(message);

      dispatch(
        showToast({
          message,
          type: "error",
        }),
      );

      return;
    }

    /* ---------- CONFIRM ACCOUNT ---------- */

    const cleanConfirmAccount =
      String(
        data.bank_confirm_account_number || "",
      ).replace(/\D/g, "");

    if (!cleanConfirmAccount) {
      const message = "Please confirm your account number.";

      setConfirmError(message);

      dispatch(
        showToast({
          message,
          type: "error",
        }),
      );

      return;
    }

    if (cleanAccountNumber !== cleanConfirmAccount) {
      const message = "Account numbers do not match.";

      setConfirmError(message);

      dispatch(
        showToast({
          message,
          type: "error",
        }),
      );

      return;
    }

    /* ---------- IFSC ---------- */

    const ifscValue = String(data.bank_ifsc_code || "")
      .trim()
      .toUpperCase();

    if (ifscValue.length !== 11) {
      const message =
        "IFSC code must be exactly 11 characters (e.g. SBIN0001234).";

      setBankError(message);

      dispatch(
        showToast({
          message,
          type: "error",
        }),
      );

      return;
    }

    /* ---------- ACCOUNT TYPE ---------- */

    if (!data.bank_account_type?.trim()) {
      const message = "Please select an account type";

      setBankError(message);

      dispatch(
        showToast({
          message,
          type: "error",
        }),
      );

      return;
    }

    /* ---------- PHONE ---------- */

    if (!phoneNumber) {
      const message =
        "Phone number not found. Please go back and verify your mobile.";

      // This is now shown ONLY once at top + toast.
      // It is NOT attached to Bank Name / Account / IFSC fields.
      setBankError(message);

      dispatch(
        showToast({
          message:
            "Phone number not found. Please verify your mobile first.",
          type: "error",
        }),
      );

      return;
    }

    /* ---------- START VERIFICATION ---------- */

    setIsVerifying(true);

    try {
      const response = await step5Bank({
        phone: phoneNumber,

        bank_holder_name:
          data.bank_account_holder_name.trim(),

        bank_name: data.bank_name.trim(),

        title: data.bank_title,

        type_of_entity: data.bank_entity_type,

        branch_name: data.bank_branch?.trim() || "",

        encrypted_bank_account: cleanAccountNumber,

        confirm_account_number: cleanConfirmAccount,

        bank_ifsc: ifscValue,

        account_type: data.bank_account_type,

        gst_in: gstValue || "URP",

        company_name:
          companyValue ||
          data.bank_account_holder_name?.trim() ||
          "NA",
      }).unwrap();

      if (response.status) {
        const successMessage =
          response.message ||
          "Bank details verified successfully.";

        dispatch(
          showToast({
            message: successMessage,
            type: "success",
          }),
        );

        setBankError("");
        setConfirmError("");

        onChange({
          target: {
            name: "bank_verified",
            value: true,
          },
        } as any);

        // Reload saved bank data.
        await fetchStepData();

        setTimeout(() => {
          onNext?.();
        }, 800);
      } else {
        const errorMsg =
          response.message ||
          "Bank verification failed. Please try again.";

        setBankError(errorMsg);

        dispatch(
          showToast({
            message: errorMsg,
            type: "error",
          }),
        );
      }
    } catch (error: any) {
      const errorMsg =
        error?.data?.message ||
        error?.message ||
        "Bank verification failed. Please try again.";

      setBankError(errorMsg);

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

  /* ==========================================
     HANDLE NEXT
  ========================================== */

  const handleNext = () => {
    if (isFromAPI) {
      dispatch(
        showToast({
          message:
            "Bank details already saved. Proceeding to next step.",
          type: "success",
        }),
      );

      setTimeout(() => {
        onNext?.();
      }, 300);

      return;
    }

    if (!data.bank_verified) {
      void handleBankVerify();
      return;
    }

    onNext?.();
  };

  /* ==========================================
     ACCOUNT INPUT HANDLER
  ========================================== */

  const handleAccountChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;

    if (isDataLoadedFromAPI && hasBankData) {
      e.preventDefault();

      dispatch(
        showToast({
          message:
            "Bank details are from existing account. Cannot modify.",
          type: "warning",
        }),
      );

      return;
    }

    if (isDataLoadedFromAPI) {
      setIsDataLoadedFromAPI(false);
      setHasBankData(false);
    }

    // Clear generic error when user starts editing.
    setBankError("");

    const numericValue = value
      .replace(/\D/g, "")
      .slice(0, 20);

    onChange({
      target: {
        name,
        value: numericValue,
      },
    } as any);

    const currentAccount =
      name === "bank_account_number"
        ? numericValue
        : String(data.bank_account_number || "").replace(
          /\D/g,
          "",
        );

    const currentConfirm =
      name === "bank_confirm_account_number"
        ? numericValue
        : String(
          data.bank_confirm_account_number || "",
        ).replace(/\D/g, "");

    if (!currentConfirm) {
      setConfirmError("");
      return;
    }

    if (
      currentAccount &&
      currentConfirm &&
      currentAccount !== currentConfirm
    ) {
      setConfirmError("Account numbers do not match");
      return;
    }

    setConfirmError("");
  };

  /* ==========================================
     IFSC HANDLER
  ========================================== */

  const handleIFSCChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (isDataLoadedFromAPI && hasBankData) {
      e.preventDefault();

      dispatch(
        showToast({
          message:
            "Bank details are from existing account. Cannot modify.",
          type: "warning",
        }),
      );

      return;
    }

    if (isDataLoadedFromAPI) {
      setIsDataLoadedFromAPI(false);
      setHasBankData(false);
    }

    setBankError("");

    const value = e.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 11);

    onChange({
      target: {
        name: "bank_ifsc_code",
        value,
      },
    } as any);
  };

  /* ==========================================
     GST HANDLER
  ========================================== */

  const handleGstChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (isDataLoadedFromAPI && hasBankData) {
      e.preventDefault();

      dispatch(
        showToast({
          message:
            "Bank details are from existing account. Cannot modify.",
          type: "warning",
        }),
      );

      return;
    }

    if (isDataLoadedFromAPI) {
      setIsDataLoadedFromAPI(false);
      setHasBankData(false);
    }

    setBankError("");

    const value = e.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 15);

    onChange({
      target: {
        name: "bank_gst_in",
        value,
      },
    } as any);
  };

  /* ==========================================
     COMPANY NAME HANDLER
  ========================================== */

  const handleCompanyNameChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (isDataLoadedFromAPI && hasBankData) {
      e.preventDefault();

      dispatch(
        showToast({
          message:
            "Bank details are from existing account. Cannot modify.",
          type: "warning",
        }),
      );

      return;
    }

    if (isDataLoadedFromAPI) {
      setIsDataLoadedFromAPI(false);
      setHasBankData(false);
    }

    setBankError("");

    onChange(e);
  };

  /* ==========================================
     GENERIC FIELD CHANGE HELPERS
  ========================================== */

  const handleNormalFieldChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (isDataLoadedFromAPI && hasBankData) {
      e.preventDefault();

      dispatch(
        showToast({
          message:
            "Bank details are from existing account. Cannot modify.",
          type: "warning",
        }),
      );

      return;
    }

    if (isDataLoadedFromAPI) {
      setIsDataLoadedFromAPI(false);
      setHasBankData(false);
    }

    setBankError("");

    onChange(e);
  };

  /* ==========================================
     DERIVED VALUES
  ========================================== */

  const cleanAccountNumber =
    String(data.bank_account_number || "").replace(
      /\D/g,
      "",
    );

  const cleanConfirmAccount =
    String(
      data.bank_confirm_account_number || "",
    ).replace(/\D/g, "");

  const isFromAPI =
    isDataLoadedFromAPI && hasBankData;

  /* ==========================================
     CONTINUE BUTTON ENABLE LOGIC

     IMPORTANT:
     - phoneNumber is NOT included here
     - bankError is NOT included here
     - confirmError is NOT directly included here

     Button depends only on actual required values.
     Phone is validated after click.
  ========================================== */

  const isContinueEnabled = () => {
    if (isFromAPI) {
      return true;
    }

    const title = String(data.bank_title || "").trim();

    const holderName = String(
      data.bank_account_holder_name || "",
    ).trim();

    const entityType = String(
      data.bank_entity_type || "",
    ).trim();

    const bankName = String(
      data.bank_name || "",
    ).trim();

    const ifsc = String(
      data.bank_ifsc_code || "",
    )
      .trim()
      .toUpperCase();

    const accountType = String(
      data.bank_account_type || "",
    ).trim();

    return (
      title.length > 0 &&
      holderName.length > 0 &&
      entityType.length > 0 &&
      bankName.length > 0 &&
      cleanAccountNumber.length >= 9 &&
      cleanAccountNumber.length <= 20 &&
      cleanConfirmAccount.length > 0 &&
      cleanAccountNumber === cleanConfirmAccount &&
      ifsc.length === 11 &&
      accountType.length > 0 &&
      !isVerifying
    );
  };

  const getButtonLabel = () => {
    if (isFromAPI) {
      return "Continue →";
    }

    if (isVerifying) {
      return "Verifying...";
    }

    if (data.bank_verified) {
      return "Continue →";
    }

    return "Verify Bank Details";
  };

  const fieldDisabled =
    isVerifying || isFromAPI;

  /* ==========================================
     RENDER
  ========================================== */

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
              {/* Header */}

              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 sm:gap-3 mb-1">
                    <div className="w-9 sm:w-11 h-9 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[var(--gold)] via-[var(--gold-dark)] to-[var(--gold-deep)] flex items-center justify-center shadow-[0_8px_20px_-6px_rgba(249,199,68,0.55)] flex-shrink-0">
                      <Landmark className="w-4 sm:w-5 h-4 sm:h-5 text-[var(--navy)]" />
                    </div>

                    <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-[var(--navy)]">
                      Bank Account Details
                    </h2>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-500 font-medium">
                    Enter your bank account for commission settlement
                  </p>

                  {isLoadingStepData && (
                    <div className="flex items-center justify-start gap-2 mt-2 text-xs sm:text-sm text-gray-500">
                      <Loader2 className="w-3 sm:w-4 h-3 sm:h-4 animate-spin" />
                      Loading your data...
                    </div>
                  )}

                  {isFromAPI && (
                    <div className="mt-2 text-[10px] sm:text-xs font-semibold text-blue-600 bg-blue-50 py-1 px-2 sm:px-3 rounded-full inline-block">
                      Bank data loaded from existing account
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmModal(true)
                  }
                  className="group flex-shrink-0 flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-[var(--gold)]/40 bg-[#FFFBEF] text-xs sm:text-sm font-semibold text-[var(--gold-deep)] hover:bg-[var(--gold)] hover:text-[var(--navy)] hover:border-[var(--gold)] shadow-sm hover:shadow-md transition-all duration-200 whitespace-nowrap"
                >
                  <PlusCircle className="w-3 sm:w-4 h-3 sm:h-4" />

                  <span className="hidden xs:inline">
                    New Registration
                  </span>

                  <span className="xs:hidden">
                    New
                  </span>
                </button>
              </div>

              {/* Info */}

              <InfoBox type="info" title="Why this is needed">
                Your commission will be settled to this account. The account
                holder name must match your PAN name.
              </InfoBox>

              {/* SINGLE GENERIC ERROR */}

              {bankError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-red-600 font-medium">
                  {bankError}
                </div>
              )}

              {isFromAPI && (
                <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-green-600 bg-green-50 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-green-200">
                  <Lock className="w-3 sm:w-3.5 h-3 sm:h-3.5 flex-shrink-0" />

                  <span className="font-medium">
                    🔒 Bank details are from your existing account. Fields are
                    read-only.
                  </span>
                </div>
              )}

              <div className="space-y-3 sm:space-y-4">
                {/* Title */}

                <TitleSelector
                  value={data.bank_title || ""}
                  onChange={(e) => {
                    setBankError("");
                    onChange(e);
                  }}
                  error={errors.bank_title}
                  disabled={fieldDisabled}
                />

                {/* Account Holder Name */}

                <Input
                  label="Account Holder Name"
                  name="bank_account_holder_name"
                  value={
                    data.bank_account_holder_name || ""
                  }
                  onChange={handleNormalFieldChange}
                  error={
                    errors.bank_account_holder_name
                  }
                  placeholder={
                    isFromAPI
                      ? "Account holder name from existing account"
                      : "Enter name as on bank account"
                  }
                  required
                  helperText={
                    isFromAPI
                      ? "From existing account (read-only)"
                      : "Must match your PAN name"
                  }
                  className={`w-full h-12 sm:h-14 px-3 sm:px-4 text-black rounded-xl border-gray-200 focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all duration-200 text-sm sm:text-base placeholder:text-gray-400 ${isFromAPI
                      ? "bg-gray-100 cursor-not-allowed opacity-75"
                      : ""
                    }`}
                  disabled={fieldDisabled}
                />

                {/* Entity Type */}

                <EntityTypeSelector
                  value={data.bank_entity_type || ""}
                  onChange={(e) => {
                    setBankError("");
                    onChange(e);
                  }}
                  error={errors.bank_entity_type}
                  disabled={fieldDisabled}
                />

                {/* GST */}

                <Input
                  label="GST IN"
                  name="bank_gst_in"
                  value={data.bank_gst_in || ""}
                  onChange={handleGstChange}
                  error={errors.bank_gst_in}
                  placeholder={
                    isFromAPI
                      ? "GST from existing account"
                      : "Enter GST IN (optional)"
                  }
                  helperText={
                    isFromAPI
                      ? "From existing account (read-only)"
                      : "Optional — leave empty if not registered"
                  }
                  className={`w-full h-12 sm:h-14 px-3 sm:px-4 text-black rounded-xl border-gray-200 focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all duration-200 text-sm sm:text-base placeholder:text-gray-400 uppercase ${isFromAPI
                      ? "bg-gray-100 cursor-not-allowed opacity-75"
                      : ""
                    }`}
                  disabled={fieldDisabled}
                  maxLength={15}
                />

                {/* Company Name */}

                <Input
                  label="Company Name"
                  name="bank_company_name"
                  value={
                    data.bank_company_name || ""
                  }
                  onChange={handleCompanyNameChange}
                  error={errors.bank_company_name}
                  placeholder={
                    isFromAPI
                      ? "Company from existing account"
                      : "Enter company / firm name (optional)"
                  }
                  helperText={
                    isFromAPI
                      ? "From existing account (read-only)"
                      : "Optional — for business accounts"
                  }
                  className={`w-full h-12 sm:h-14 px-3 sm:px-4 text-black rounded-xl border-gray-200 focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all duration-200 text-sm sm:text-base placeholder:text-gray-400 ${isFromAPI
                      ? "bg-gray-100 cursor-not-allowed opacity-75"
                      : ""
                    }`}
                  disabled={fieldDisabled}
                />

                {/* Bank Name + Branch */}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <Input
                    label="Bank Name"
                    name="bank_name"
                    value={data.bank_name || ""}
                    onChange={handleNormalFieldChange}
                    error={errors.bank_name}
                    placeholder={
                      isFromAPI
                        ? "Bank from existing account"
                        : "Enter bank name"
                    }
                    required
                    className={`w-full h-12 sm:h-14 px-3 sm:px-4 text-black rounded-xl border-gray-200 focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all duration-200 text-sm sm:text-base placeholder:text-gray-400 ${isFromAPI
                        ? "bg-gray-100 cursor-not-allowed opacity-75"
                        : ""
                      }`}
                    disabled={fieldDisabled}
                  />

                  <Input
                    label="Bank Branch"
                    name="bank_branch"
                    value={data.bank_branch || ""}
                    onChange={handleNormalFieldChange}
                    error={errors.bank_branch}
                    placeholder={
                      isFromAPI
                        ? "Branch from existing account"
                        : "Enter branch name"
                    }
                    className={`w-full h-12 sm:h-14 px-3 sm:px-4 text-black rounded-xl border-gray-200 focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all duration-200 text-sm sm:text-base placeholder:text-gray-400 ${isFromAPI
                        ? "bg-gray-100 cursor-not-allowed opacity-75"
                        : ""
                      }`}
                    disabled={fieldDisabled}
                  />
                </div>

                {/* Account Number */}

                <PasswordInput
                  label="Account Number"
                  name="bank_account_number"
                  value={
                    data.bank_account_number || ""
                  }
                  onChange={handleAccountChange}
                  error={errors.bank_account_number}
                  placeholder={
                    isFromAPI
                      ? "Account number from existing account (read-only)"
                      : "Enter bank account number (max 20 digits)"
                  }
                  required
                  maxLength={20}
                  helperText={
                    isFromAPI
                      ? "From existing account (read-only)"
                      : "Minimum 9 digits, maximum 20 digits"
                  }
                  className={`w-full h-12 sm:h-14 px-3 sm:px-4 text-black rounded-xl border-gray-200 focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all duration-200 outline-none text-sm sm:text-base placeholder:text-gray-400 ${isFromAPI
                      ? "bg-gray-100 cursor-not-allowed opacity-75"
                      : ""
                    }`}
                  disabled={fieldDisabled}
                />

                {/* Confirm Account Number */}

                <PasswordInput
                  label="Confirm Account Number"
                  name="bank_confirm_account_number"
                  value={
                    data.bank_confirm_account_number ||
                    ""
                  }
                  onChange={handleAccountChange}
                  error={
                    errors.bank_confirm_account_number ||
                    confirmError
                  }
                  placeholder={
                    isFromAPI
                      ? "Confirm from existing account (read-only)"
                      : "Re-enter account number"
                  }
                  required
                  maxLength={20}
                  helperText={
                    isFromAPI
                      ? "From existing account (read-only)"
                      : "Must match the account number above"
                  }
                  className={`w-full h-12 sm:h-14 px-3 sm:px-4 text-black rounded-xl border-gray-200 focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all duration-200 outline-none text-sm sm:text-base placeholder:text-gray-400 ${isFromAPI
                      ? "bg-gray-100 cursor-not-allowed opacity-75"
                      : ""
                    }`}
                  disabled={fieldDisabled}
                />

                {/* IFSC */}

                <Input
                  label="IFSC Code"
                  name="bank_ifsc_code"
                  value={data.bank_ifsc_code || ""}
                  onChange={handleIFSCChange}
                  error={errors.bank_ifsc_code}
                  placeholder={
                    isFromAPI
                      ? "IFSC from existing account (read-only)"
                      : "Enter IFSC code (11 characters)"
                  }
                  required
                  helperText={
                    isFromAPI
                      ? "From existing account (read-only)"
                      : "11 characters — e.g. SBIN0001234"
                  }
                  className={`w-full h-12 sm:h-14 px-3 sm:px-4 text-black rounded-xl border-gray-200 focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all duration-200 text-sm sm:text-base placeholder:text-gray-400 uppercase ${isFromAPI
                      ? "bg-gray-100 cursor-not-allowed opacity-75"
                      : ""
                    }`}
                  disabled={fieldDisabled}
                  maxLength={11}
                />

                {/* Account Type */}

                <BankAccountTypeSelector
                  value={data.bank_account_type || ""}
                  onChange={(e) => {
                    setBankError("");
                    onChange(e);
                  }}
                  error={errors.bank_account_type}
                  disabled={fieldDisabled}
                />

                {/* Existing API Data */}

                {isFromAPI && (
                  <div className="bg-green-50/80 backdrop-blur-sm p-3 sm:p-3.5 rounded-xl border border-green-200 text-xs sm:text-sm text-green-700 flex items-center gap-2 sm:gap-2.5">
                    <CheckCircle className="w-3.5 sm:w-4 h-3.5 sm:h-4 flex-shrink-0" />

                    <span>
                      Bank details loaded from your existing account

                      {data.bank_verified && (
                        <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs bg-green-200 px-1.5 sm:px-2 py-0.5 rounded-full">
                          Verified ✓
                        </span>
                      )}
                    </span>
                  </div>
                )}

                {/* Fresh Verification */}

                {data.bank_verified &&
                  !isFromAPI && (
                    <div className="bg-green-50/80 backdrop-blur-sm p-3 sm:p-3.5 rounded-xl border border-green-200 text-xs sm:text-sm text-green-700 flex items-center gap-2 sm:gap-2.5">
                      <CheckCircle className="w-3.5 sm:w-4 h-3.5 sm:h-4 flex-shrink-0" />

                      Bank details verified successfully
                    </div>
                  )}

                {/* Form Actions */}

                <div className="pt-3 sm:pt-4 mt-4 sm:mt-6 border-t border-gray-100">
                  <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4">
                    <button
                      type="button"
                      onClick={onBack}
                      className="w-full sm:w-auto text-center text-gray-600 hover:text-gray-800 font-medium text-xs sm:text-sm transition-colors duration-200 py-2 sm:py-0"
                    >
                      ← Back
                    </button>

                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={!isContinueEnabled()}
                      className="w-full sm:w-auto bg-[var(--gold)] hover:bg-[var(--gold-dark)] text-[var(--navy)] font-semibold px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200 shadow-[0_8px_20px_-6px_rgba(249,199,68,0.5)] hover:shadow-[0_12px_28px_-8px_rgba(249,199,68,0.6)] text-sm sm:text-base"
                    >
                      {isVerifying ? (
                        <>
                          <Loader2 className="w-4 sm:w-5 h-4 sm:h-5 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        getButtonLabel()
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================
          CONFIRMATION MODAL
      ========================================== */}

      {showConfirmModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--navy)]/70 backdrop-blur-sm px-3 sm:px-4"
          style={{ fontFamily: theme.font }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowConfirmModal(false);
            }
          }}
        >
          <div className="bg-white rounded-[24px] sm:rounded-[28px] max-w-md w-full mx-2 sm:mx-4 p-5 sm:p-7 shadow-[0_30px_80px_-20px_rgba(6,16,30,0.5)] relative">
            <button
              type="button"
              onClick={() =>
                setShowConfirmModal(false)
              }
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
              All your entered information will be discarded. This action
              cannot be undone.
            </p>

            <div className="bg-red-50 border border-red-200 rounded-xl p-2.5 sm:p-3 mb-4 sm:mb-6">
              <p className="text-[10px] sm:text-xs text-red-600 text-center font-semibold">
                ⚠️ Your current progress will be lost
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() =>
                  setShowConfirmModal(false)
                }
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

/* ==========================================
   TITLE SELECTOR
========================================== */

interface TitleSelectorProps {
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => void;
  error?: string;
  disabled?: boolean;
}

const TitleSelector: React.FC<TitleSelectorProps> = ({
  value,
  onChange,
  error,
  disabled,
}) => {
  const titles = [
    { value: "", label: "Select Title" },
    { value: "Mr.", label: "Mr." },
    { value: "Mrs.", label: "Mrs." },
    { value: "Ms.", label: "Ms." },
    { value: "Dr.", label: "Dr." },
    { value: "Smt.", label: "Smt." },
    { value: "Sri.", label: "Sri." },
    { value: "Kumari", label: "Kumari" },
    { value: "M/s", label: "M/s" },
  ];

  return (
    <div className="space-y-1.5 sm:space-y-2">
      <label className="text-xs sm:text-sm font-semibold text-gray-700">
        Title <span className="text-red-500">*</span>
      </label>

      <select
        name="bank_title"
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full h-12 sm:h-14 px-3 sm:px-4 text-black rounded-xl border text-sm sm:text-base ${error
            ? "border-red-500"
            : "border-gray-200"
          } focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all duration-200 outline-none appearance-none bg-white ${disabled
            ? "opacity-50 cursor-not-allowed bg-gray-100"
            : ""
          }`}
      >
        {titles.map((title) => (
          <option
            key={title.value}
            value={title.value}
          >
            {title.label}
          </option>
        ))}
      </select>

      {error && (
        <p className="text-[10px] sm:text-xs text-red-500 font-medium">
          {error}
        </p>
      )}
    </div>
  );
};

/* ==========================================
   ENTITY TYPE SELECTOR
========================================== */

interface EntityTypeSelectorProps {
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => void;
  error?: string;
  disabled?: boolean;
}

const EntityTypeSelector: React.FC<
  EntityTypeSelectorProps
> = ({
  value,
  onChange,
  error,
  disabled,
}) => {
    const entityTypes = [
      {
        value: "",
        label: "Select Entity Type",
      },
      {
        value: "individual",
        label: "Individual",
      },
      {
        value: "huf",
        label: "Hindu Undivided Family (HUF)",
      },
      {
        value: "sole_proprietorship",
        label: "Sole Proprietorship",
      },
    ];

    return (
      <div className="space-y-1.5 sm:space-y-2">
        <label className="text-xs sm:text-sm font-semibold text-gray-700">
          Type of Entity{" "}
          <span className="text-red-500">*</span>
        </label>

        <select
          name="bank_entity_type"
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full h-12 sm:h-14 px-3 sm:px-4 text-black rounded-xl border text-sm sm:text-base ${error
              ? "border-red-500"
              : "border-gray-200"
            } focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all duration-200 outline-none appearance-none bg-white ${disabled
              ? "opacity-50 cursor-not-allowed bg-gray-100"
              : ""
            }`}
        >
          {entityTypes.map((type) => (
            <option
              key={type.value}
              value={type.value}
            >
              {type.label}
            </option>
          ))}
        </select>

        {error && (
          <p className="text-[10px] sm:text-xs text-red-500 font-medium">
            {error}
          </p>
        )}
      </div>
    );
  };

/* ==========================================
   BANK ACCOUNT TYPE SELECTOR
========================================== */

interface BankAccountTypeSelectorProps {
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => void;
  error?: string;
  disabled?: boolean;
}

const BankAccountTypeSelector: React.FC<
  BankAccountTypeSelectorProps
> = ({
  value,
  onChange,
  error,
  disabled,
}) => {
    const options = [
      {
        value: "current",
        label: "Current Account",
      },
      {
        value: "savings",
        label: "Savings Account",
      },
    ];

    return (
      <div className="space-y-1.5 sm:space-y-2">
        <label className="text-xs sm:text-sm font-semibold text-gray-700">
          Account Type{" "}
          <span className="text-red-500">*</span>
        </label>

        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {options.map((option) => (
            <label
              key={option.value}
              className={`flex items-center justify-center gap-1 sm:gap-2 cursor-pointer text-center py-2.5 sm:py-3 px-1.5 sm:px-2 rounded-xl border-2 text-xs sm:text-sm transition-all duration-200 h-11 sm:h-14 ${value === option.value
                  ? "border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--navy)] font-semibold shadow-sm"
                  : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                } ${disabled
                  ? "opacity-50 cursor-not-allowed"
                  : ""
                }`}
            >
              <input
                type="radio"
                name="bank_account_type"
                value={option.value}
                checked={
                  value === option.value
                }
                onChange={onChange}
                className="sr-only"
                disabled={disabled}
              />

              {option.label}
            </label>
          ))}
        </div>

        {error && (
          <p className="text-[10px] sm:text-xs text-red-500 font-medium">
            {error}
          </p>
        )}
      </div>
    );
  };

export default BankStep;