// components/distributor/registration/components/steps/BankStep.tsx

"use client";

import React, { useState } from "react";
import { Input } from "@/components/common/Input";
import { PasswordInput } from "../PasswordInput";
import { InfoBox } from "../InfoBox";
import { FormActions } from "../FormActions";
import { StepProps } from "../../types";

export const BankStep: React.FC<StepProps> = ({
  data,
  errors,
  onChange,
  onNext,
  onBack,
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [bankError, setBankError] = useState("");
  const [confirmError, setConfirmError] = useState("");

  const handleBankVerify = async () => {
    if (
      !data.bank_account_number ||
      data.bank_account_number !== data.bank_confirm_account_number
    ) {
      setConfirmError("Account numbers do not match");
      return;
    }

    if (!data.bank_ifsc_code || data.bank_ifsc_code.length < 4) {
      setBankError("Please enter a valid IFSC code");
      return;
    }

    setBankError("");
    setIsVerifying(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      onNext?.();
    } catch (error) {
      setBankError("Bank verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange(e);

    if (
      name === "bank_confirm_account_number" ||
      name === "bank_account_number"
    ) {
      const accountNum =
        name === "bank_account_number" ? value : data.bank_account_number;
      const confirmNum =
        name === "bank_confirm_account_number"
          ? value
          : data.bank_confirm_account_number;

      if (confirmNum && accountNum && confirmNum !== accountNum) {
        setConfirmError("Account numbers do not match");
        setBankError("");
      } else {
        setConfirmError("");
        setBankError("");
      }
    }
  };

  return (
    <div className="space-y-5">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-[#06101E]">
          Bank Account Details
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Enter your bank account for commission settlement
        </p>
      </div>

      <InfoBox type="info" title="🏦 Why this is needed">
        Your commission will be settled to this account. The account holder name
        must match your PAN name.
      </InfoBox>

      <div className="space-y-4">
        <Input
          label="Account Holder Name"
          name="bank_account_holder_name"
          value={data.bank_account_holder_name}
          onChange={onChange}
          error={errors.bank_account_holder_name}
          placeholder="Name as on bank account"
          required
          helperText="Must match your PAN name"
          className="w-full h-14 px-4 text-black rounded-xl border-gray-200 focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Bank Name"
            name="bank_name"
            value={data.bank_name}
            onChange={onChange}
            error={errors.bank_name}
            placeholder="Enter bank name"
            required
            className="w-full h-14 px-4 text-black rounded-xl border-gray-200 focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200"
          />
          <Input
            label="Bank Branch"
            name="bank_branch"
            value={data.bank_branch}
            onChange={onChange}
            error={errors.bank_branch}
            placeholder="Enter branch name"
            className="w-full h-14 px-4 text-black rounded-xl border-gray-200 focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200"
          />
        </div>

        <PasswordInput
          label="Account Number"
          name="bank_account_number"
          value={data.bank_account_number}
          onChange={handleAccountChange}
          error={errors.bank_account_number || bankError}
          placeholder="Enter bank account number"
          required
          className="w-full h-14 px-4 text-black rounded-xl border-gray-200 focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200 outline-none"
        />

        <PasswordInput
          label="Confirm Account Number"
          name="bank_confirm_account_number"
          value={data.bank_confirm_account_number}
          onChange={handleAccountChange}
          error={errors.bank_confirm_account_number || confirmError}
          placeholder="Re-enter account number"
          required
          className="w-full h-14 px-4 text-black rounded-xl border-gray-200 focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200 outline-none"
        />

        <Input
          label="IFSC Code"
          name="bank_ifsc_code"
          value={data.bank_ifsc_code}
          onChange={onChange}
          error={errors.bank_ifsc_code}
          placeholder="Enter IFSC code"
          required
          helperText="Validated against the bank name"
          className="w-full h-14 px-4 text-black rounded-xl border-gray-200 focus:border-[#F9C744] focus:ring-2 focus:ring-[#F9C744]/20 transition-all duration-200"
        />

        <BankAccountTypeSelector
          value={data.bank_account_type}
          onChange={onChange}
          error={errors.bank_account_type}
        />

        <FormActions
          onBack={onBack}
          onNext={handleBankVerify}
          isNextDisabled={
            !data.bank_account_number ||
            !data.bank_confirm_account_number ||
            data.bank_account_number !== data.bank_confirm_account_number ||
            !!confirmError
          }
          isLoading={isVerifying}
        />
      </div>
    </div>
  );
};

interface BankAccountTypeSelectorProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

const BankAccountTypeSelector: React.FC<BankAccountTypeSelectorProps> = ({
  value,
  onChange,
  error,
}) => {
  const options = [
    { value: "current", label: "Current Account", icon: "💼" },
    { value: "savings", label: "Savings Account", icon: "🏦" },
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
            className={`flex items-center justify-center gap-2 cursor-pointer text-center py-3 px-2 rounded-xl border-2 text-sm transition-all duration-200 h-14
              ${
                value === option.value
                  ? "border-[#F9C744] bg-[#F9C744]/10 text-[#06101E] font-semibold shadow-sm"
                  : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
              }`}
          >
            <input
              type="radio"
              name="bank_account_type"
              value={option.value}
              checked={value === option.value}
              onChange={onChange}
              className="sr-only"
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
