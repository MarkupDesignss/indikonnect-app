"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useChangePasswordMutation } from "@/lib/redux/api/Profile/userApi";
import { showToast } from "@/lib/slices/toastSlice";
import { SaveButton, SectionHeader, getErrorMessage, inputClass, labelClass, sectionClass } from "@/features/distributor/routes/profile/page.parts/support";


export function SecuritySection() {
  const dispatch = useDispatch();

  const [changePassword, { isLoading: isChanging }] =
    useChangePasswordMutation();

  const [security, setSecurity] = useState({
    oldPassword: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateOldPassword = (value: string) =>
    !value ? "Old password is required" : null;

  const validatePassword = (value: string) =>
    !value
      ? "Password is required"
      : value.length < 6
        ? "Password must be at least 6 characters"
        : null;

  const validateConfirmPassword = (
    value: string,
    newPassword = security.password,
  ) =>
    !value
      ? "Please confirm your password"
      : value !== newPassword
        ? "Passwords do not match"
        : null;

  const handleChange = (
    field: "oldPassword" | "password" | "confirmPassword",
    value: string,
  ) => {
    const next = {
      ...security,
      [field]: value,
    };

    setSecurity(next);

    const nextErrors = { ...errors };

    if (field === "oldPassword") {
      nextErrors.oldPassword = validateOldPassword(value) || "";
    }

    if (field === "password") {
      nextErrors.password = validatePassword(value) || "";

      if (next.confirmPassword) {
        nextErrors.confirmPassword =
          validateConfirmPassword(next.confirmPassword, value) || "";
      }
    }

    if (field === "confirmPassword") {
      nextErrors.confirmPassword = validateConfirmPassword(value) || "";
    }

    setErrors(nextErrors);
  };

  const handleSave = async () => {
    const nextErrors: Record<string, string> = {};

    const oldError = validateOldPassword(security.oldPassword);
    const passwordError = validatePassword(security.password);
    const confirmError = validateConfirmPassword(security.confirmPassword);

    if (oldError) nextErrors.oldPassword = oldError;
    if (passwordError) nextErrors.password = passwordError;
    if (confirmError) nextErrors.confirmPassword = confirmError;

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) return;

    try {
      const response = await changePassword({
        current_password: security.oldPassword,
        new_password: security.password,
        new_password_confirmation: security.confirmPassword,
      }).unwrap();

      if (response?.status) {
        dispatch(
          showToast({
            message: response?.message || "Password changed successfully!",
            type: "success",
          }),
        );

        setSecurity({
          oldPassword: "",
          password: "",
          confirmPassword: "",
        });
        setErrors({});
        setShowOldPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
      } else {
        dispatch(
          showToast({
            message: response?.message || "Failed to change password",
            type: "error",
          }),
        );
      }
    } catch (error: unknown) {
      dispatch(
        showToast({
          message: getErrorMessage(
            error,
            "Something went wrong while changing password",
          ),
          type: "error",
        }),
      );
    }
  };

  const passwordField = (
    field: "oldPassword" | "password" | "confirmPassword",
    label: string,
    placeholder: string,
    visible: boolean,
    toggle: () => void,
    autoComplete: string,
  ) => (
    <div className="min-w-0" key={field}>
      <label className={labelClass}>
        {label}
        <span className="ml-0.5 text-red-500">*</span>
      </label>

      <div className="relative min-w-0">
        <input
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          value={security[field]}
          onChange={(event) => handleChange(field, event.target.value)}
          placeholder={placeholder}
          className={`${inputClass} pr-11 ${
            errors[field] ? "border-red-500 ring-2 ring-red-500/10" : ""
          }`}
        />

        <button
          type="button"
          onClick={toggle}
          aria-label={
            visible
              ? `Hide ${label.toLowerCase()}`
              : `Show ${label.toLowerCase()}`
          }
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8E97] transition-colors hover:text-[#4B4D56]"
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {errors[field] && (
        <p className="mt-1 break-words text-[10.5px] text-red-500">
          {errors[field]}
        </p>
      )}
    </div>
  );

  return (
    <section className={sectionClass}>
      <SectionHeader title="Security" subtitle="Change your account password" />

      <div className="space-y-4 sm:space-y-[16px]">
        {passwordField(
          "oldPassword",
          "Old Password",
          "Enter current password",
          showOldPassword,
          () => setShowOldPassword((value) => !value),
          "current-password",
        )}

        {passwordField(
          "password",
          "New Password",
          "Enter new password",
          showNewPassword,
          () => setShowNewPassword((value) => !value),
          "new-password",
        )}

        {passwordField(
          "confirmPassword",
          "Confirm New Password",
          "Confirm new password",
          showConfirmPassword,
          () => setShowConfirmPassword((value) => !value),
          "new-password",
        )}

        <div className="flex justify-end border-t border-[#EAF0F7] pt-5">
          <SaveButton
            text="Change Password"
            onClick={handleSave}
            loading={isChanging}
          />
        </div>
      </div>
    </section>
  );
}
