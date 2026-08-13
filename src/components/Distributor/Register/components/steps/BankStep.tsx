// components/distributor/registration/components/steps/BankStep.tsx

"use client";

import React, { useState, useEffect } from "react";
import {
  PlusCircle,
  AlertTriangle,
  X,
  Loader2,
  CheckCircle,
  Landmark,
} from "lucide-react";
import { Input } from "@/components/common/Input";
import { PasswordInput } from "../PasswordInput";
import { InfoBox } from "../InfoBox";
import { FormActions } from "../FormActions";
import { StepProps } from "../../types";
import { useAppDispatch } from "@/lib/redux/hooks";
import { showToast } from "@/lib/slices/toastSlice";
import {
  useStep5BankMutation,
  useLazyGetStepDataQuery,
  distributorAuthApi,
} from "../../../../../lib/redux/api/distributor/distributorauthApis";
import authApi from "@/lib/redux/api/authApi";

/**
 * Same theme tokens as EmailCheckScreen / LocationStep so every step of the
 * flow reads as one product instead of separately-styled screens.
 */
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
  const [bankError, setBankError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isDataLoadedFromAPI, setIsDataLoadedFromAPI] = useState(false);
  const [accountLast4, setAccountLast4] = useState("");
  const [hasBankData, setHasBankData] = useState(false);

  // API Hooks
  const [step5Bank] = useStep5BankMutation();
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

  // Load phone number from localStorage
  useEffect(() => {
    const savedPhone =
      localStorage.getItem("distributor_verified_phone") ||
      localStorage.getItem("distributor_mobile") ||
      "";
    if (savedPhone) {
      const formattedPhone = savedPhone.startsWith("+")
        ? savedPhone
        : "+91" + savedPhone.replace(/^0+/, "");
      setPhoneNumber(formattedPhone);
    }
  }, []);

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
      console.log("📡 Fetching step 5 data for email:", email);
      const response = await getStepData({
        step: "5",
        phone: email,
      }).unwrap();

      if (response.status && response.step_data) {
        console.log("✅ Step 5 data fetched:", response);

        const userData = response.step_data.user;
        const profileData = response.step_data.distributor_profile;

        // Check if bank data exists
        if (profileData.bank_name) {
          setHasBankData(true);

          // ✅ Populate Title from API
          if (profileData.title) {
            onChange({
              target: { name: "bank_title", value: profileData.title },
            } as any);
          } else {
            onChange({
              target: { name: "bank_title", value: "Mr." },
            } as any);
          }

          // ✅ Populate Entity Type from API
          if (profileData.type_of_entity) {
            onChange({
              target: {
                name: "bank_entity_type",
                value: profileData.type_of_entity,
              },
            } as any);
          }

          // Populate bank fields
          onChange({
            target: {
              name: "bank_account_holder_name",
              value: profileData.bank_holder_name || "",
            },
          } as any);

          onChange({
            target: { name: "bank_name", value: profileData.bank_name || "" },
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

          // Set account last 4 for display
          if (userData.account_last4) {
            setAccountLast4(userData.account_last4);
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

          // ✅ Mark as bank verified if bank is verified OR if we have bank data
          // Even if bank_verified is 0, we consider it as having data
          if (profileData.bank_verified === 1) {
            onChange({
              target: { name: "bank_verified", value: true },
            } as any);
          } else {
            // ✅ If we have bank data but not verified, mark as verified for navigation
            // This allows the user to proceed without re-entering
            onChange({
              target: { name: "bank_verified", value: true },
            } as any);
          }

          // Mark data as loaded from API
          setIsDataLoadedFromAPI(true);

          dispatch(
            showToast({
              message: "Loaded bank data successfully",
              type: "success",
            }),
          );
        }
      }
    } catch (error: any) {
      console.error("Error fetching step 5 data:", error);
      if (error?.status !== 404) {
        dispatch(
          showToast({
            message: error?.data?.message || "Failed to load bank data",
            type: "error",
          }),
        );
      }
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      const emailFromProps = data.email;
      const emailFromStorage = localStorage.getItem("distributor_email");
      const email = emailFromProps || emailFromStorage || "";

      if (email) {
        console.log("📧 Loading bank data for email:", email);
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
  // ✅ BANK VERIFICATION
  // ==========================================

  const handleBankVerify = async () => {
    if (!data.bank_title || data.bank_title.trim().length === 0) {
      setBankError("Please select a title");
      dispatch(
        showToast({
          message: "Please select a title",
          type: "error",
        }),
      );
      return;
    }

    if (
      !data.bank_account_holder_name ||
      data.bank_account_holder_name.trim().length === 0
    ) {
      setBankError("Account holder name is required");
      dispatch(
        showToast({
          message: "Please enter the account holder name",
          type: "error",
        }),
      );
      return;
    }

    if (!data.bank_entity_type || data.bank_entity_type.trim().length === 0) {
      setBankError("Please select an entity type");
      dispatch(
        showToast({
          message: "Please select an entity type",
          type: "error",
        }),
      );
      return;
    }

    if (!data.bank_name || data.bank_name.trim().length === 0) {
      setBankError("Bank name is required");
      dispatch(
        showToast({
          message: "Please enter your bank name",
          type: "error",
        }),
      );
      return;
    }

    if (
      !data.bank_account_number ||
      data.bank_account_number.trim().length < 9
    ) {
      setBankError("Please enter a valid account number (minimum 9 digits)");
      dispatch(
        showToast({
          message: "Please enter a valid account number",
          type: "error",
        }),
      );
      return;
    }

    if (!data.bank_confirm_account_number) {
      setConfirmError("Please confirm your account number");
      dispatch(
        showToast({
          message: "Please confirm your account number",
          type: "error",
        }),
      );
      return;
    }

    if (data.bank_account_number !== data.bank_confirm_account_number) {
      setConfirmError("Account numbers do not match");
      dispatch(
        showToast({
          message: "Account numbers do not match",
          type: "error",
        }),
      );
      return;
    }

    if (!data.bank_ifsc_code || data.bank_ifsc_code.length < 4) {
      setBankError("Please enter a valid IFSC code");
      dispatch(
        showToast({
          message: "Please enter a valid IFSC code",
          type: "error",
        }),
      );
      return;
    }

    if (!data.bank_account_type) {
      setBankError("Please select an account type");
      dispatch(
        showToast({
          message: "Please select an account type",
          type: "error",
        }),
      );
      return;
    }

    if (!phoneNumber) {
      setBankError(
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

    setBankError("");
    setConfirmError("");
    setIsVerifying(true);

    try {
      const cleanAccountNumber = data.bank_account_number.replace(/\s/g, "");
      const cleanConfirmAccount = data.bank_confirm_account_number.replace(
        /\s/g,
        "",
      );

      const response = await step5Bank({
        phone: phoneNumber,
        bank_holder_name: data.bank_account_holder_name.trim(),
        bank_name: data.bank_name.trim(),
        title: data.bank_title,
        type_of_entity: data.bank_entity_type,
        branch_name: data.bank_branch?.trim() || "",
        encrypted_bank_account: cleanAccountNumber,
        confirm_account_number: cleanConfirmAccount,
        bank_ifsc: data.bank_ifsc_code.trim().toUpperCase(),
        account_type: data.bank_account_type,
      }).unwrap();

      if (response.status) {
        dispatch(
          showToast({
            message: response.message || "Bank details verified successfully",
            type: "success",
          }),
        );

        onChange({
          target: {
            name: "bank_verified",
            value: true,
          },
        } as any);

        // Fetch step data after successful verification
        await fetchStepData();

        setTimeout(() => {
          onNext?.();
        }, 1500);
      } else {
        const errorMsg =
          response.message || "Bank verification failed. Please try again.";
        setBankError(errorMsg);
        dispatch(
          showToast({
            message: errorMsg,
            type: "error",
          }),
        );
      }
    } catch (error: any) {
      console.error("Bank verification error:", error);
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

  // ==========================================
  // ✅ HANDLE NEXT - POST OR NAVIGATE
  // ==========================================

  const handleNext = () => {
    // ✅ CHECK: If data is loaded from API and has bank data,
    // just navigate to next step without calling POST API
    if (isDataLoadedFromAPI && hasBankData) {
      console.log(
        "✅ Bank data already exists - Navigating to next step without POST",
      );
      dispatch(
        showToast({
          message: "Bank details already saved. Proceeding to next step.",
          type: "success",
        }),
      );
      setTimeout(() => onNext(), 500);
      return;
    }

    // If not verified, call verification API
    if (!data.bank_verified) {
      handleBankVerify();
    } else {
      onNext();
    }
  };

  // ==========================================
  // ✅ HANDLE INPUT CHANGES
  // ==========================================

  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Reset API loaded state when user changes input
    if (isDataLoadedFromAPI) {
      setIsDataLoadedFromAPI(false);
      setHasBankData(false);
    }

    if (
      name === "bank_account_number" ||
      name === "bank_confirm_account_number"
    ) {
      const numericValue = value.replace(/\D/g, "");
      onChange({
        target: {
          name: name,
          value: numericValue,
        },
      } as any);
    } else {
      onChange(e);
    }

    if (
      name === "bank_confirm_account_number" ||
      name === "bank_account_number"
    ) {
      const accountNum =
        name === "bank_account_number"
          ? value.replace(/\D/g, "")
          : data.bank_account_number || "";
      const confirmNum =
        name === "bank_confirm_account_number"
          ? value.replace(/\D/g, "")
          : data.bank_confirm_account_number || "";

      if (confirmNum && accountNum && confirmNum !== accountNum) {
        setConfirmError("Account numbers do not match");
        setBankError("");
      } else {
        setConfirmError("");
        setBankError("");
      }
    }
  };

  const handleIFSCChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");

    if (isDataLoadedFromAPI) {
      setIsDataLoadedFromAPI(false);
      setHasBankData(false);
    }

    onChange({
      target: {
        name: "bank_ifsc_code",
        value: value,
      },
    } as any);
  };

  const cleanAccountNumber = data.bank_account_number?.replace(/\D/g, "") || "";
  const cleanConfirmAccount =
    data.bank_confirm_account_number?.replace(/\D/g, "") || "";

  // Check if Continue button should be enabled
  const isContinueEnabled = () => {
    // ✅ If data is loaded from API and has bank data, always enabled
    if (isDataLoadedFromAPI && hasBankData) {
      return true;
    }
    return !!(
      data.bank_title &&
      data.bank_account_holder_name &&
      data.bank_entity_type &&
      data.bank_name &&
      data.bank_account_number &&
      data.bank_confirm_account_number &&
      cleanAccountNumber === cleanConfirmAccount &&
      !confirmError &&
      !bankError &&
      data.bank_ifsc_code &&
      data.bank_ifsc_code.length >= 4 &&
      data.bank_account_type &&
      !isVerifying &&
      phoneNumber
    );
  };

  // Get button label
  const getButtonLabel = () => {
    if (isDataLoadedFromAPI && hasBankData) {
      return "Continue";
    }
    if (isVerifying) {
      return "Verifying...";
    }
    return "Verify Bank Details";
  };

  // ✅ Determine if we should show the "Continue" button directly
  const shouldShowContinue = isDataLoadedFromAPI && hasBankData;

  const fieldDisabled =
    isVerifying || data.bank_verified || (isDataLoadedFromAPI && hasBankData);

  const loadedFieldClass =
    isDataLoadedFromAPI && hasBankData
      ? "border-emerald-400 bg-emerald-50/60"
      : "";

  return (
    <>
<<<<<<< Updated upstream
      <div className="space-y-5">
        {/* Header with New Registration Button */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-[#06101E]">
              Bank Account Details
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Enter your bank account for commission settlement
            </p>
          </div>

          {/* New Registration Button */}
          <button
            type="button"
            onClick={() => setShowConfirmModal(true)}
            className="group flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full
              border border-[#F9C744]/40 bg-[#FFFBEF]
              text-sm font-semibold text-[#B8860B]
              hover:bg-[#F9C744] hover:text-white hover:border-[#F9C744]
              shadow-sm hover:shadow-md
              transition-colors duration-200 whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" />
            New Registration
          </button>
        </div>

        <InfoBox type="info" title="Why this is needed">
          Your commission will be settled to this account. The account holder
          name must match your PAN name.
        </InfoBox>

        <div className="space-y-4">
          {/* Title Selector - Full Width */}
          <TitleSelector
            value={data.bank_title || ""}
            onChange={onChange}
            error={errors.bank_title || bankError}
            disabled={isVerifying || data.bank_verified}
          />

          {/* Account Holder Name - Full Width */}
          <Input
            label="Account Holder Name"
            name="bank_account_holder_name"
            value={data.bank_account_holder_name || ""}
            onChange={onChange}
            error={errors.bank_account_holder_name || bankError}
            placeholder="Enter name as on bank account"
            required
            helperText="Must match your PAN name"
            className="w-full h-14 px-4 text-black rounded-xl border-gray-200 focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200 placeholder:text-gray-400"
            disabled={isVerifying || data.bank_verified}
          />

          {/* Entity Type Selector - Full Width */}
          <EntityTypeSelector
            value={data.bank_entity_type || ""}
            onChange={onChange}
            error={errors.bank_entity_type || bankError}
            disabled={isVerifying || data.bank_verified}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Bank Name"
              name="bank_name"
              value={data.bank_name || ""}
              onChange={onChange}
              error={errors.bank_name || bankError}
              placeholder="Enter bank name"
              required
              className="w-full h-14 px-4 text-black rounded-xl border-gray-200 focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200 placeholder:text-gray-400"
              disabled={isVerifying || data.bank_verified}
            />
            <Input
              label="Bank Branch"
              name="bank_branch"
              value={data.bank_branch || ""}
              onChange={onChange}
              error={errors.bank_branch}
              placeholder="Enter branch name"
              className="w-full h-14 px-4 text-black rounded-xl border-gray-200 focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200 placeholder:text-gray-400"
              disabled={isVerifying || data.bank_verified}
            />
          </div>

          <PasswordInput
            label="Account Number"
            name="bank_account_number"
            value={data.bank_account_number || ""}
            onChange={handleAccountChange}
            error={errors.bank_account_number || bankError}
            placeholder="Enter bank account number"
            required
            className={
              "w-full h-14 px-4 text-black rounded-xl border-gray-200 focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200 outline-none placeholder:text-gray-400 " +
              (data.bank_verified ? "border-green-500 bg-green-50" : "")
            }
            disabled={isVerifying || data.bank_verified}
          />

          <PasswordInput
            label="Confirm Account Number"
            name="bank_confirm_account_number"
            value={data.bank_confirm_account_number || ""}
            onChange={handleAccountChange}
            error={errors.bank_confirm_account_number || confirmError}
            placeholder="Re-enter account number"
            required
            className="w-full h-14 px-4 text-black rounded-xl border-gray-200 focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200 outline-none placeholder:text-gray-400"
            disabled={isVerifying || data.bank_verified}
          />

          <Input
            label="IFSC Code"
            name="bank_ifsc_code"
            value={data.bank_ifsc_code || ""}
            onChange={handleIFSCChange}
            error={errors.bank_ifsc_code || bankError}
            placeholder="Enter IFSC code"
            required
            helperText="Validated against the bank name"
            className="w-full h-14 px-4 text-black rounded-xl border-gray-200 focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200 placeholder:text-gray-400"
            disabled={isVerifying || data.bank_verified}
            maxLength={11}
          />

          <BankAccountTypeSelector
            value={data.bank_account_type || ""}
            onChange={onChange}
            error={errors.bank_account_type}
            disabled={isVerifying || data.bank_verified}
          />

          {data.bank_verified && (
            <div className="bg-green-50/80 backdrop-blur-sm p-3 rounded-xl border border-green-100 text-sm text-green-700 flex items-center gap-2">
              <span className="text-lg flex-shrink-0">✓</span> Bank details
              verified successfully
=======
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
        className="min-h-[60vh] flex items-center justify-center px-4 py-10"
      >
        {/* Centered surface card, matching the EmailCheckScreen / LocationStep card system */}
        <div className="w-full max-w-2xl mx-auto">
          <div className="relative rounded-[28px] bg-white/90 backdrop-blur-xl border border-[var(--navy)]/[0.06] shadow-[0_20px_60px_-15px_rgba(6,16,30,0.15)] px-6 py-8 sm:px-9 sm:py-10">
            {/* Ambient glow to match the other steps */}
            <div className="pointer-events-none absolute inset-x-0 -top-10 flex justify-center">
              <div className="w-40 h-40 rounded-full bg-[radial-gradient(circle,_rgba(249,199,68,0.3)_0%,_rgba(249,199,68,0)_70%)] blur-xl" />
>>>>>>> Stashed changes
            </div>

<<<<<<< Updated upstream
          {/* FormActions at bottom */}
          <div className="pt-4 mt-6 border-t border-gray-100">
            <FormActions
              onBack={onBack}
              onNext={data.bank_verified ? onNext : handleBankVerify}
              isNextDisabled={
                !data.bank_title ||
                !data.bank_account_holder_name ||
                !data.bank_entity_type ||
                !data.bank_name ||
                !data.bank_account_number ||
                !data.bank_confirm_account_number ||
                cleanAccountNumber !== cleanConfirmAccount ||
                !!confirmError ||
                !!bankError ||
                !data.bank_ifsc_code ||
                data.bank_ifsc_code.length < 4 ||
                !data.bank_account_type ||
                isVerifying ||
                !phoneNumber
              }
              isLoading={isVerifying}
              nextLabel={
                data.bank_verified ? "Continue" : "Verify Bank Details"
              }
            />
=======
            <div className="relative space-y-5">
              {/* Header with New Registration Button */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[var(--gold)] via-[var(--gold-dark)] to-[var(--gold-deep)] flex items-center justify-center shadow-[0_8px_20px_-6px_rgba(249,199,68,0.55)] flex-shrink-0">
                      <Landmark className="w-5 h-5 text-[var(--navy)]" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-[var(--navy)]">
                      Bank Account Details
                    </h2>
                  </div>
                  <p className="text-gray-500 text-sm font-medium">
                    Enter your bank account for commission settlement
                  </p>
                  {isLoadingStepData && (
                    <div className="flex items-center justify-start gap-2 mt-2 text-sm text-gray-500">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading your bank data...
                    </div>
                  )}
                  {isDataLoadedFromAPI && hasBankData && (
                    <div className="mt-2 text-xs font-semibold text-emerald-600 bg-emerald-50 py-1 px-3 rounded-full inline-block">
                      ✓ Bank data already saved
                    </div>
                  )}
                  {isDataLoadedFromAPI && !hasBankData && (
                    <div className="mt-2 text-xs font-semibold text-blue-600 bg-blue-50 py-1 px-3 rounded-full inline-block">
                      Existing data loaded
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setShowConfirmModal(true)}
                  className="group flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full
                    border border-[var(--gold)]/40 bg-[#FFFBEF]
                    text-sm font-semibold text-[var(--gold-deep)]
                    hover:bg-[var(--gold)] hover:text-[var(--navy)] hover:border-[var(--gold)]
                    shadow-sm hover:shadow-md
                    transition-colors duration-200 whitespace-nowrap"
                >
                  <PlusCircle className="w-4 h-4" />
                  New Registration
                </button>
              </div>

              <InfoBox type="info" title="Why this is needed">
                Your commission will be settled to this account. The account
                holder name must match your PAN name.
              </InfoBox>

              <div className="space-y-4">
                {/* Title Selector - Full Width */}
                <TitleSelector
                  value={data.bank_title || ""}
                  onChange={onChange}
                  error={errors.bank_title || bankError}
                  disabled={fieldDisabled}
                />

                {/* Account Holder Name - Full Width */}
                <Input
                  label="Account Holder Name"
                  name="bank_account_holder_name"
                  value={data.bank_account_holder_name || ""}
                  onChange={onChange}
                  error={errors.bank_account_holder_name || bankError}
                  placeholder="Enter name as on bank account"
                  required
                  helperText="Must match your PAN name"
                  className={`w-full h-14 px-4 text-black rounded-xl border-gray-200 focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all duration-200 placeholder:text-gray-400 ${loadedFieldClass}`}
                  disabled={fieldDisabled}
                />

                {/* Entity Type Selector - Full Width */}
                <EntityTypeSelector
                  value={data.bank_entity_type || ""}
                  onChange={onChange}
                  error={errors.bank_entity_type || bankError}
                  disabled={fieldDisabled}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Bank Name"
                    name="bank_name"
                    value={data.bank_name || ""}
                    onChange={onChange}
                    error={errors.bank_name || bankError}
                    placeholder="Enter bank name"
                    required
                    className={`w-full h-14 px-4 text-black rounded-xl border-gray-200 focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all duration-200 placeholder:text-gray-400 ${loadedFieldClass}`}
                    disabled={fieldDisabled}
                  />
                  <Input
                    label="Bank Branch"
                    name="bank_branch"
                    value={data.bank_branch || ""}
                    onChange={onChange}
                    error={errors.bank_branch}
                    placeholder="Enter branch name"
                    className={`w-full h-14 px-4 text-black rounded-xl border-gray-200 focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all duration-200 placeholder:text-gray-400 ${loadedFieldClass}`}
                    disabled={fieldDisabled}
                  />
                </div>

                <PasswordInput
                  label="Account Number"
                  name="bank_account_number"
                  value={data.bank_account_number || ""}
                  onChange={handleAccountChange}
                  error={errors.bank_account_number || bankError}
                  placeholder={
                    isDataLoadedFromAPI && hasBankData
                      ? `****${accountLast4}`
                      : "Enter bank account number"
                  }
                  required
                  className={
                    "w-full h-14 px-4 text-black rounded-xl border-gray-200 focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all duration-200 outline-none placeholder:text-gray-400 " +
                    (data.bank_verified
                      ? "border-emerald-400 bg-emerald-50/60"
                      : "")
                  }
                  disabled={fieldDisabled}
                />

                <PasswordInput
                  label="Confirm Account Number"
                  name="bank_confirm_account_number"
                  value={data.bank_confirm_account_number || ""}
                  onChange={handleAccountChange}
                  error={errors.bank_confirm_account_number || confirmError}
                  placeholder={
                    isDataLoadedFromAPI && hasBankData
                      ? `****${accountLast4}`
                      : "Re-enter account number"
                  }
                  required
                  className="w-full h-14 px-4 text-black rounded-xl border-gray-200 focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all duration-200 outline-none placeholder:text-gray-400"
                  disabled={fieldDisabled}
                />

                <Input
                  label="IFSC Code"
                  name="bank_ifsc_code"
                  value={data.bank_ifsc_code || ""}
                  onChange={handleIFSCChange}
                  error={errors.bank_ifsc_code || bankError}
                  placeholder="Enter IFSC code"
                  required
                  helperText="Validated against the bank name"
                  className={`w-full h-14 px-4 text-black rounded-xl border-gray-200 focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all duration-200 placeholder:text-gray-400 ${loadedFieldClass}`}
                  disabled={fieldDisabled}
                  maxLength={11}
                />

                <BankAccountTypeSelector
                  value={data.bank_account_type || ""}
                  onChange={onChange}
                  error={errors.bank_account_type}
                  disabled={fieldDisabled}
                />

                {hasBankData && (
                  <div className="bg-emerald-50/80 backdrop-blur-sm p-4 rounded-2xl border border-emerald-100 text-sm text-emerald-700 flex items-center gap-2.5 font-medium">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    <span>
                      Bank details loaded successfully
                      {isDataLoadedFromAPI && (
                        <span className="ml-2 text-xs text-blue-600">
                          (loaded from saved data)
                        </span>
                      )}
                    </span>
                  </div>
                )}

                {isVerifying && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying bank details...
                  </div>
                )}

                {/* ✅ Show Continue button directly when data is loaded from API */}
                {shouldShowContinue ? (
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={onBack}
                      className="text-gray-600 hover:text-[var(--navy)] font-semibold text-sm transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="bg-gradient-to-b from-[var(--gold)] to-[var(--gold-dark)] hover:brightness-105 active:brightness-95 text-[var(--navy)] font-semibold px-8 py-3 rounded-xl transition-all duration-200 shadow-[0_8px_20px_-6px_rgba(249,199,68,0.55)] flex items-center gap-2"
                    >
                      <span>Continue</span>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <FormActions
                    onBack={onBack}
                    onNext={
                      isDataLoadedFromAPI && hasBankData ? onNext : undefined
                    }
                    onSubmit={
                      !isDataLoadedFromAPI || !hasBankData
                        ? handleBankVerify
                        : undefined
                    }
                    isSubmitDisabled={!isContinueEnabled()}
                    isLoading={isVerifying}
                    submitLabel={getButtonLabel()}
                    nextLabel="Continue"
                  />
                )}
              </div>
            </div>
>>>>>>> Stashed changes
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div
          className="fixed inset-0 z-[9999] overflow-y-auto"
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
            className="bg-white rounded-[28px] max-w-md w-full mx-4 p-6 sm:p-7 shadow-[0_30px_80px_-20px_rgba(6,16,30,0.5)] relative"
            style={{
              maxHeight: "90vh",
              overflowY: "auto",
              margin: "auto",
            }}
          >
            <button
              type="button"
              onClick={() => setShowConfirmModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-[#06101E] hover:bg-gray-100 rounded-full p-1.5 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center ring-4 ring-amber-50">
                <AlertTriangle className="w-8 h-8 text-amber-600" />
              </div>
            </div>

            <h3 className="text-xl font-bold text-center text-[#06101E] mb-2 tracking-tight">
              Start New Registration?
            </h3>

            <p className="text-gray-500 text-center text-sm mb-6 font-medium">
              All your entered information will be discarded. This action cannot
              be undone.
            </p>

            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-6">
              <p className="text-xs text-red-600 text-center font-semibold">
                Warning: Your current progress will be lost
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleNewRegistration}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 shadow-[0_8px_20px_-6px_rgba(239,68,68,0.5)]"
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

// Title/Name Prefix Selector Component
interface TitleSelectorProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
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
    <div className="space-y-2">
      <label className="text-sm font-semibold text-gray-700">
        Title <span className="text-red-500">*</span>
      </label>
      <select
        name="bank_title"
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full h-14 px-4 text-black rounded-xl border ${
          error ? "border-red-500" : "border-gray-200"
        } focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all duration-200 outline-none appearance-none bg-white ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {titles.map((title) => (
          <option key={title.value} value={title.value}>
            {title.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
};

// Entity Type Selector Component
interface EntityTypeSelectorProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  error?: string;
  disabled?: boolean;
}

const EntityTypeSelector: React.FC<EntityTypeSelectorProps> = ({
  value,
  onChange,
  error,
  disabled,
}) => {
  const entityTypes = [
    { value: "", label: "Select Entity Type" },
    { value: "individual", label: "Individual" },
    { value: "huf", label: "Hindu Undivided Family (HUF)" },
    { value: "partnership", label: "Partnership Firm" },
    { value: "llp", label: "Limited Liability Partnership (LLP)" },
    { value: "pvt_ltd", label: "Private Limited Company" },
    { value: "ltd", label: "Public Limited Company" },
    { value: "sole_proprietorship", label: "Sole Proprietorship" },
    { value: "trust", label: "Trust" },
    { value: "society", label: "Society" },
    { value: "aop", label: "Association of Persons (AOP)" },
    { value: "boi", label: "Body of Individuals (BOI)" },
  ];

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-gray-700">
        Type of Entity <span className="text-red-500">*</span>
      </label>
      <select
        name="bank_entity_type"
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full h-14 px-4 text-black rounded-xl border ${
          error ? "border-red-500" : "border-gray-200"
        } focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all duration-200 outline-none appearance-none bg-white ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {entityTypes.map((type) => (
          <option key={type.value} value={type.value}>
            {type.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
};

// Bank Account Type Selector Component (Radio Buttons)
interface BankAccountTypeSelectorProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
}

const BankAccountTypeSelector: React.FC<BankAccountTypeSelectorProps> = ({
  value,
  onChange,
  error,
  disabled,
}) => {
  const options = [
    { value: "current", label: "Current Account", icon: "B" },
    { value: "savings", label: "Savings Account", icon: "S" },
  ];

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-gray-700">
        Account Type <span className="text-red-500">*</span>
      </label>
      <div className="grid grid-cols-2 gap-3">
        {options.map((option) => (
          <label
            key={option.value}
            className={`flex items-center justify-center gap-2 cursor-pointer text-center py-3 px-2 rounded-xl border-2 text-sm transition-all duration-200 h-14 ${
              value === option.value
                ? "border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--navy)] font-semibold shadow-sm"
                : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <input
              type="radio"
              name="bank_account_type"
              value={option.value}
              checked={value === option.value}
              onChange={onChange}
              className="sr-only"
              disabled={disabled}
            />
            <span className="text-black">{option.icon}</span>
            {option.label}
          </label>
        ))}
      </div>
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
};

export default BankStep;
