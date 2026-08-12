// components/distributor/registration/components/steps/BankStep.tsx

"use client";

import React, { useState, useEffect } from "react";
import { PlusCircle, AlertTriangle, X } from "lucide-react";
import { Input } from "@/components/common/Input";
import { PasswordInput } from "../PasswordInput";
import { InfoBox } from "../InfoBox";
import { FormActions } from "../FormActions";
import { StepProps } from "../../types";
import { useAppDispatch } from "@/lib/redux/hooks";
import { showToast } from "@/lib/slices/toastSlice";
import { useStep5BankMutation } from "../../../../../lib/redux/api/distributor/distributorauthApis";

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
  const [step5Bank] = useStep5BankMutation();

  // Load phone number from localStorage
  useEffect(() => {
    const savedPhone =
      localStorage.getItem("distributor_verified_phone") ||
      localStorage.getItem("distributor_mobile") ||
      "";
    if (savedPhone) {
      // Format phone number with country code if needed
      const formattedPhone = savedPhone.startsWith("+")
        ? savedPhone
        : "+91" + savedPhone.replace(/^0+/, "");
      setPhoneNumber(formattedPhone);
    }
  }, []);

  // Clear all registration data
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
    ];

    itemsToRemove.forEach((item) => {
      localStorage.removeItem(item);
    });
  };

  const handleNewRegistration = () => {
    clearAllRegistrationData();
    setShowConfirmModal(false);
    if (onBackToMobile) {
      onBackToMobile();
    }
  };

  const handleBankVerify = async () => {
    // Validate title/prefix
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

    // Validate account holder name
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

    // Validate entity type
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

    // Validate bank name
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

    // Validate account number
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

    // Validate confirm account number
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

    // Check if account numbers match
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

    // Validate IFSC code
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

    // Validate account type
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

      // Call the actual API with all required fields
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
        // Bank details verified successfully
        dispatch(
          showToast({
            message: response.message || "Bank details verified successfully",
            type: "success",
          }),
        );

        // Mark as verified
        onChange({
          target: {
            name: "bank_verified",
            value: true,
          },
        } as any);

        // Auto proceed to next step after successful verification
        setTimeout(() => {
          onNext?.();
        }, 1500);
      } else {
        // Bank verification failed
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

  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Only allow numeric input for account numbers
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

    // Check if account numbers match
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
    onChange({
      target: {
        name: "bank_ifsc_code",
        value: value,
      },
    } as any);
  };

  // Get clean account numbers for validation
  const cleanAccountNumber = data.bank_account_number?.replace(/\D/g, "") || "";
  const cleanConfirmAccount =
    data.bank_confirm_account_number?.replace(/\D/g, "") || "";

  return (
    <>
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
              transition-all duration-200 whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
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
              <span className="text-lg flex-shrink-0">OK</span> Bank details
              verified successfully
            </div>
          )}

          {isVerifying && (
            <div className="flex items-center gap-2 text-sm text-gray-500 animate-pulse">
              <svg
                className="w-4 h-4 animate-spin"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Verifying bank details...
            </div>
          )}

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
            nextLabel={data.bank_verified ? "Continue" : "Verify Bank Details"}
          />
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full mx-4 p-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowConfirmModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-amber-600" />
              </div>
            </div>

            <h3 className="text-xl font-bold text-center text-[#06101E] mb-2">
              Start New Registration?
            </h3>

            <p className="text-gray-500 text-center text-sm mb-6">
              All your entered information will be discarded. This action cannot
              be undone.
            </p>

            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
              <p className="text-xs text-red-600 text-center">
                Warning: Your current progress will be lost
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-lg transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleNewRegistration}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
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
      <label className="text-sm font-medium text-gray-700">
        Title <span className="text-red-500">*</span>
      </label>
      <select
        name="bank_title"
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={
          "w-full h-14 px-4 text-black rounded-xl border-gray-200 focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200 outline-none appearance-none bg-white " +
          (error ? "border-red-500" : "border-gray-200") +
          (disabled ? " opacity-50 cursor-not-allowed" : "")
        }
      >
        {titles.map((title) => (
          <option key={title.value} value={title.value}>
            {title.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
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
      <label className="text-sm font-medium text-gray-700">
        Type of Entity <span className="text-red-500">*</span>
      </label>
      <select
        name="bank_entity_type"
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={
          "w-full h-14 px-4 text-black rounded-xl border-gray-200 focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200 outline-none appearance-none bg-white " +
          (error ? "border-red-500" : "border-gray-200") +
          (disabled ? " opacity-50 cursor-not-allowed" : "")
        }
      >
        {entityTypes.map((type) => (
          <option key={type.value} value={type.value}>
            {type.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
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
      <label className="text-sm font-medium text-gray-700">
        Account Type <span className="text-red-500">*</span>
      </label>
      <div className="grid grid-cols-2 gap-3">
        {options.map((option) => (
          <label
            key={option.value}
            className={
              "flex items-center justify-center gap-2 cursor-pointer text-center py-3 px-2 rounded-xl border-2 text-sm transition-all duration-200 h-14 " +
              (value === option.value
                ? "border-[#F9C744] bg-[#F9C744]/10 text-[#06101E] font-semibold shadow-sm"
                : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50") +
              (disabled ? " opacity-50 cursor-not-allowed" : "")
            }
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
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};
