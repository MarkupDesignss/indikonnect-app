"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useChangePasswordMutation } from "@/lib/redux/api/Profile/userApi";
import { modalVariants, overlayVariants, staggerContainer, staggerItem } from "@/features/profile/components/AccountSettings.parts/support";


export const PasswordChange = ({
  isOpen,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (response?: any) => void;
}) => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [changePassword, { isLoading }] =
    useChangePasswordMutation();

  const validatePassword = () => {
    const newErrors: Record<string, string> = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword =
        "Current password is required";
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword =
        "New password is required";
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword =
        "Password must be at least 8 characters";
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword =
        "Please confirm your new password";
    } else if (
      passwordData.newPassword !==
      passwordData.confirmPassword
    ) {
      newErrors.confirmPassword =
        "Passwords do not match";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validatePassword()) return;

    try {
      const response = await changePassword({
        current_password:
          passwordData.currentPassword,
        new_password: passwordData.newPassword,
        new_password_confirmation:
          passwordData.confirmPassword,
      }).unwrap();

      onSave?.(response);

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setErrors({});

      setShowPassword({
        current: false,
        new: false,
        confirm: false,
      });

      onClose();
    } catch (error: any) {
      console.error("Change password error:", error);

      const apiMessage =
        error?.data?.message ||
        error?.message ||
        "Unable to change password. Please try again.";

      setErrors((prev) => ({
        ...prev,
        api: apiMessage,
      }));
    }
  };

  const handleClose = () => {
    if (isLoading) return;

    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setErrors({});

    setShowPassword({
      current: false,
      new: false,
      confirm: false,
    });

    onClose();
  };

  const fields = [
    {
      key: "current",
      label: "Current Password",
      field: "currentPassword",
      placeholder: "Enter current password",
    },
    {
      key: "new",
      label: "New Password",
      field: "newPassword",
      placeholder: "Enter new password",
    },
    {
      key: "confirm",
      label: "Confirm New Password",
      field: "confirmPassword",
      placeholder: "Confirm new password",
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/35 p-4 backdrop-blur-[2px] font-sans"
          onClick={handleClose}
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full max-w-md overflow-hidden rounded-[8px] border border-[#E4E4E2] bg-white shadow-[0_18px_60px_rgba(0,0,0,0.14)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#E6E6E4] bg-white px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-[6px] bg-[#111111] text-white">
                  <Lock className="h-4 w-4" />
                </div>

                <h2 className="text-[16px] font-medium text-[#171717]">
                  Change Password
                </h2>
              </div>

              <button
                onClick={handleClose}
                disabled={isLoading}
                className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#D7D7D5] bg-white text-[#777777] transition hover:border-[#BDBDBA] hover:text-[#111111] disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="space-y-3.5 p-5"
            >
              {errors.api && (
                <div className="flex items-start gap-2 rounded-[6px] border border-[#F0CFCF] bg-[#FDF2F2] px-3.5 py-2.5 text-[12px] text-[#B24C4C]">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>{errors.api}</span>
                </div>
              )}

              {fields.map(
                ({
                  key,
                  label,
                  field,
                  placeholder,
                }) => (
                  <motion.div
                    key={key}
                    variants={staggerItem}
                  >
                    <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.06em] text-[#666666]">
                      {label}
                    </label>

                    <div className="relative">
                      <input
                        type={
                          showPassword[
                            key as keyof typeof showPassword
                          ]
                            ? "text"
                            : "password"
                        }
                        value={
                          passwordData[
                          field as keyof typeof passwordData
                          ]
                        }
                        onChange={(e) => {
                          setPasswordData({
                            ...passwordData,
                            [field]: e.target.value,
                          });

                          setErrors((prev) => ({
                            ...prev,
                            [field]: "",
                            api: "",
                          }));
                        }}
                        disabled={isLoading}
                        className={`h-[42px] w-full rounded-[6px] border bg-white px-3.5 pr-10 text-[12px] text-[#222222] outline-none transition placeholder:text-[#999999] ${errors[field]
                            ? "border-[#D66A6A] bg-[#FFF9F9] focus:border-[#C94D4D] focus:ring-1 focus:ring-[#C94D4D]/10"
                            : "border-[#D7D7D5] hover:border-[#BDBDBA] focus:border-[#999999] focus:ring-1 focus:ring-black/5"
                          } ${isLoading
                            ? "cursor-not-allowed bg-[#FAFAF9]"
                            : ""
                          }`}
                        placeholder={placeholder}
                      />

                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() =>
                          setShowPassword({
                            ...showPassword,
                            [key]:
                              !showPassword[
                              key as keyof typeof showPassword
                              ],
                          })
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999999] transition hover:text-[#555555]"
                      >
                        {showPassword[
                          key as keyof typeof showPassword
                        ] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    <AnimatePresence>
                      {errors[field] && (
                        <motion.p
                          initial={{
                            opacity: 0,
                            height: 0,
                          }}
                          animate={{
                            opacity: 1,
                            height: "auto",
                          }}
                          exit={{
                            opacity: 0,
                            height: 0,
                          }}
                          className="mt-1 flex items-center gap-1 text-[10px] font-medium text-[#C94D4D]"
                        >
                          <AlertCircle className="h-3 w-3" />
                          {errors[field]}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              )}

              <motion.div
                variants={staggerItem}
                className="flex gap-2.5 pt-1"
              >
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="h-[42px] flex-1 rounded-[6px] border border-[#D7D7D5] bg-white px-4 text-[11px] font-medium text-[#555555] transition hover:border-[#BDBDBA] hover:bg-[#FAFAF9]"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex h-[42px] flex-1 items-center justify-center gap-2 rounded-[6px] bg-[#111111] px-4 text-[11px] font-semibold text-white transition hover:bg-[#292929] disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
