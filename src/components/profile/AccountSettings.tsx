"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ChevronRight,
  User,
  X,
  Lock,
  Bell,
  BellRing,
  Mail,
  Eye,
  EyeOff,
  Shield,
  AlertCircle,
  ChevronRight as ChevronRightIcon,
  Settings,
  UserCircle,
  Key,
  BellDot,
  Building,
  CreditCard,
  FileText,
  Hash,
  Pencil,
  Check,
  XCircle,
  Trash2,
  Camera,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

import {
  useChangePasswordMutation,
  useGetUserNotificationsQuery,
  useGetUserProfileQuery,
  useToggleNotificationMutation,
  useUpdateUserProfileMutation,
} from "@/lib/redux/api/Profile/userApi";

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15 },
  },
};

const modalVariants = {
  hidden: { scale: 0.98, opacity: 0, y: 12 },
  visible: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 28,
    },
  },
  exit: {
    scale: 0.98,
    opacity: 0,
    y: 12,
    transition: { duration: 0.15 },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.04,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 22,
    },
  },
};

const Toast = ({
  show,
  message,
}: {
  show: boolean;
  message: string;
}) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{
          opacity: 0,
          y: -14,
          scale: 0.96,
          transition: { duration: 0.18 },
        }}
        transition={{
          type: "spring",
          stiffness: 350,
          damping: 24,
        }}
        className="fixed left-1/2 top-6 z-[10001] flex -translate-x-1/2 items-center gap-2.5 rounded-[8px] border border-[#E4E4E2] bg-white px-4 py-3 shadow-[0_18px_60px_rgba(0,0,0,0.14)]"
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#111111]">
          <CheckCircle2 className="h-3.5 w-3.5 text-white" />
        </div>

        <span className="text-[12px] font-medium text-[#171717]">
          {message}
        </span>
      </motion.div>
    )}
  </AnimatePresence>
);

const PasswordChange = ({
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

const Notifications = ({
  isOpen,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
}) => {
  const {
    data: notificationResponse,
    isLoading: isNotificationLoading,
    isFetching: isNotificationFetching,
    refetch: refetchNotifications,
  } = useGetUserNotificationsQuery(undefined, {
    skip: !isOpen,
  });

  const [
    toggleNotification,
    { isLoading: isToggleLoading },
  ] = useToggleNotificationMutation();

  const [notificationSettings, setNotificationSettings] =
    useState({
      email_notifications: false,
      order_updates: true,
      payment_alerts: true,
      promotional_emails: true,
      security_alerts: true,
    });

  const [initialSettings, setInitialSettings] =
    useState(notificationSettings);

  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen || !notificationResponse?.data) {
      return;
    }

    const apiData = notificationResponse.data;

    const settings = {
      email_notifications:
        Boolean(apiData.email_notifications),
      order_updates: Boolean(apiData.order_updates),
      payment_alerts: Boolean(apiData.payment_alerts),
      promotional_emails:
        Boolean(apiData.promotional_emails),
      security_alerts:
        Boolean(apiData.security_alerts),
    };

    setNotificationSettings(settings);
    setInitialSettings(settings);
  }, [isOpen, notificationResponse]);

  const notificationOptions = [
    {
      key: "email_notifications",
      label: "Email Notifications",
      icon: Mail,
      description: "Receive updates via email",
    },
    {
      key: "order_updates",
      label: "Order Updates",
      icon: BellRing,
      description: "Get notified about order status",
    },
    {
      key: "payment_alerts",
      label: "Payment Alerts",
      icon: Shield,
      description: "Payment confirmation and alerts",
    },
    {
      key: "promotional_emails",
      label: "Promotional Emails",
      icon: Mail,
      description: "Special offers and promotions",
    },
    {
      key: "security_alerts",
      label: "Security Alerts",
      icon: Shield,
      description: "Important security notifications",
    },
  ] as const;

  const handleToggleLocal = (
    key: keyof typeof notificationSettings
  ) => {
    setError("");

    setNotificationSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    setError("");

    const changedKeys = Object.keys(
      notificationSettings
    ).filter((key) => {
      const typedKey =
        key as keyof typeof notificationSettings;

      return (
        notificationSettings[typedKey] !==
        initialSettings[typedKey]
      );
    }) as (keyof typeof notificationSettings)[];

    if (changedKeys.length === 0) {
      onSave?.();
      onClose();
      return;
    }

    try {
      for (const key of changedKeys) {
        await toggleNotification({
          type: key,
          status: notificationSettings[key],
        }).unwrap();
      }

      setInitialSettings(notificationSettings);

      await refetchNotifications();

      onSave?.();
      onClose();
    } catch (error: any) {
      console.error(
        "Notification toggle error:",
        error
      );

      const apiMessage =
        error?.data?.message ||
        error?.message ||
        "Unable to update notification preferences.";

      setError(apiMessage);
    }
  };

  const handleClose = () => {
    if (isToggleLoading) return;

    setError("");
    setNotificationSettings(initialSettings);

    onClose();
  };

  const isLoading =
    isNotificationLoading ||
    isNotificationFetching;

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
            className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[8px] border border-[#E4E4E2] bg-white shadow-[0_18px_60px_rgba(0,0,0,0.14)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-[#E6E6E4] bg-white px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-[6px] bg-[#111111] text-white">
                  <Bell className="h-4 w-4" />
                </div>

                <h2 className="text-[16px] font-medium text-[#171717]">
                  Notification Settings
                </h2>
              </div>

              <button
                onClick={handleClose}
                className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#D7D7D5] bg-white text-[#777777] transition hover:border-[#BDBDBA] hover:text-[#111111]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[calc(90vh-160px)] overflow-y-auto p-5">
              {error && (
                <div className="mb-4 flex items-start gap-2 rounded-[6px] border border-[#F0CFCF] bg-[#FDF2F2] px-3.5 py-2.5 text-[12px] text-[#B24C4C]">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#E4E4E2] border-t-[#111111]" />
                  <p className="mt-4 text-[12px] text-[#888888]">
                    Loading notification settings...
                  </p>
                </div>
              ) : (
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 gap-3 md:grid-cols-2"
                >
                  {notificationOptions.map(
                    (option) => {
                      const Icon = option.icon;

                      const isEnabled =
                        notificationSettings[
                        option.key
                        ];

                      return (
                        <motion.div
                          key={option.key}
                          variants={staggerItem}
                          className={`cursor-pointer rounded-[7px] border p-3.5 transition ${isEnabled
                              ? "border-[#111111] bg-[#FAFAF9]"
                              : "border-[#E4E4E2] hover:border-[#CFCFCC]"
                            }`}
                          onClick={() =>
                            handleToggleLocal(
                              option.key
                            )
                          }
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] ${isEnabled
                                  ? "bg-[#111111] text-white"
                                  : "bg-[#F1F1F0] text-[#888888]"
                                }`}
                            >
                              <Icon className="h-4 w-4" />
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center justify-between gap-3">
                                <h3 className="text-[12px] font-medium text-[#171717]">
                                  {option.label}
                                </h3>

                                <div
                                  className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${isEnabled
                                      ? "bg-[#111111]"
                                      : "bg-[#DCDCDA]"
                                    }`}
                                >
                                  <motion.div
                                    animate={{
                                      left: isEnabled
                                        ? "18px"
                                        : "2px",
                                    }}
                                    transition={{
                                      type: "spring",
                                      stiffness: 500,
                                      damping: 30,
                                    }}
                                    className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm"
                                  />
                                </div>
                              </div>

                              <p className="mt-0.5 text-[10px] text-[#888888]">
                                {
                                  option.description
                                }
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    }
                  )}
                </motion.div>
              )}
            </div>

            <div className="flex shrink-0 gap-2.5 border-t border-[#E6E6E4] bg-white px-5 py-3.5">
              <button
                onClick={handleClose}
                disabled={isToggleLoading}
                className="h-[42px] flex-1 rounded-[6px] border border-[#D7D7D5] bg-white px-4 text-[11px] font-medium text-[#555555] transition hover:border-[#BDBDBA] hover:bg-[#FAFAF9] disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={
                  isLoading || isToggleLoading
                }
                className="flex h-[42px] flex-1 items-center justify-center gap-2 rounded-[6px] bg-[#111111] px-4 text-[11px] font-semibold text-white transition hover:bg-[#292929] disabled:opacity-60"
              >
                {isToggleLoading ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const EditProfilePopup = ({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  formData: any;
  setFormData: React.Dispatch<
    React.SetStateAction<any>
  >;
  onSave: (data: any) => Promise<boolean>;
}) => {
  const [localFormData, setLocalFormData] =
    useState(formData);

  const [errors, setErrors] = useState<
    Record<string, string>
  >({});

  const [imagePreview, setImagePreview] =
    useState<string | null>(null);

  const [updateUserProfile, { isLoading }] =
    useUpdateUserProfileMutation();

  useEffect(() => {
    setLocalFormData(formData);
    setImagePreview(
      typeof formData.profile_picture ===
        "string"
        ? formData.profile_picture
        : null
    );
  }, [formData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setLocalFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({
        ...prev,
        profile_picture:
          "Please select a valid image",
      }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        profile_picture:
          "Image size must be less than 5MB",
      }));
      return;
    }

    const previewUrl =
      URL.createObjectURL(file);

    setImagePreview(previewUrl);

    setLocalFormData((prev: any) => ({
      ...prev,
      profile_picture: file,
    }));

    setErrors((prev) => ({
      ...prev,
      profile_picture: "",
    }));
  };

  const handleRemoveImage = () => {
    setImagePreview(null);

    setLocalFormData((prev: any) => ({
      ...prev,
      profile_picture: null,
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!localFormData.full_name?.trim()) {
      newErrors.full_name =
        "Full name is required";
    }

    if (!localFormData.country?.trim()) {
      newErrors.country =
        "Country is required";
    }

    // Only validate business fields for distributors
    if (localFormData.account_type === "distributor") {
      if (!localFormData.company_name?.trim()) {
        newErrors.company_name =
          "Company name is required";
      }

      if (!localFormData.gst_number?.trim()) {
        newErrors.gst_number =
          "GST number is required";
      }

      if (!localFormData.billing_address?.trim()) {
        newErrors.billing_address =
          "Billing address is required";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const formData = new FormData();

      formData.append(
        "full_name",
        localFormData.full_name || ""
      );

      formData.append(
        "phone",
        localFormData.phone || ""
      );

      formData.append(
        "country",
        localFormData.country || ""
      );

      formData.append(
        "account_type",
        localFormData.account_type || ""
      );

      // Only append business fields for distributors
      if (localFormData.account_type === "distributor") {
        formData.append(
          "company_name",
          localFormData.company_name || ""
        );

        formData.append(
          "gst_number",
          localFormData.gst_number || ""
        );

        formData.append(
          "billing_address",
          localFormData.billing_address || ""
        );
      }

      if (
        localFormData.profile_picture instanceof
        File
      ) {
        formData.append(
          "profile_picture",
          localFormData.profile_picture
        );
      }

      const response =
        await updateUserProfile(
          formData
        ).unwrap();

      setFormData((prev: any) => ({
        ...prev,
        full_name:
          localFormData.full_name,
        phone: localFormData.phone,
        country: localFormData.country,
        account_type:
          localFormData.account_type,
        ...(localFormData.account_type === "distributor" && {
          company_name:
            localFormData.company_name,
          gst_number:
            localFormData.gst_number,
          billing_address:
            localFormData.billing_address,
        }),
        profile_picture:
          response?.user?.profile_picture ||
          localFormData.profile_picture,
      }));

      const success = await onSave(
        response
      );

      if (success) {
        onClose();
      }
    } catch (error: any) {
      console.error(
        "Update profile error:",
        error
      );

      const apiMessage =
        error?.data?.message ||
        error?.message ||
        "Unable to update profile. Please try again.";

      setErrors((prev) => ({
        ...prev,
        api: apiMessage,
      }));
    }
  };

  const getPopupFields = () => {
    const commonFields = [
      {
        name: "full_name",
        label: "Full Name",
        type: "text",
        icon: User,
        placeholder: "Enter your full name",
        required: true,
      },
      {
        name: "phone",
        label: "Phone Number",
        type: "text",
        icon: Bell,
        placeholder: "Enter phone number",
        readOnly: true,
      },
      {
        name: "email",
        label: "Email Address",
        type: "email",
        icon: Mail,
        placeholder: "Enter email address",
        readOnly: true,
      },
      {
        name: "country",
        label: "Country",
        type: "text",
        icon: User,
        placeholder: "Enter your country",
        required: true,
      },
    ];

    // Business fields - only for distributors
    const businessFields = [
      {
        name: "company_name",
        label: "Company Name",
        type: "text",
        icon: Building,
        placeholder: "Enter company name",
        required: true,
      },
      {
        name: "gst_number",
        label: "GST Number",
        type: "text",
        icon: Hash,
        placeholder: "Enter GST number",
        required: true,
      },
      {
        name: "billing_address",
        label: "Billing Address",
        type: "text",
        icon: FileText,
        placeholder: "Enter billing address",
        required: true,
      },
    ];

    // Distributor-specific bank fields (read-only)
    const distributorBankFields = [
      {
        name: "bank_holder_name",
        label: "Bank Account Holder",
        type: "text",
        icon: User,
        placeholder:
          "Enter account holder name",
        readOnly: true,
      },
      {
        name: "encrypted_bank_account",
        label: "Bank Account Number",
        type: "text",
        icon: CreditCard,
        placeholder:
          "Enter account number",
        readOnly: true,
      },
      {
        name: "bank_ifsc",
        label: "IFSC Code",
        type: "text",
        icon: Hash,
        placeholder: "Enter IFSC code",
        readOnly: true,
      },
      {
        name: "encrypted_pan",
        label: "PAN Number",
        type: "text",
        icon: FileText,
        placeholder: "Enter PAN number",
        readOnly: true,
      },
      {
        name: "encrypted_aadhaar",
        label: "Aadhaar Number",
        type: "text",
        icon: FileText,
        placeholder:
          "Enter Aadhaar number",
        readOnly: true,
      },
    ];

    // For customers: only common fields
    if (
      localFormData.account_type !==
      "distributor"
    ) {
      return commonFields;
    }

    // For distributors: common + business + bank fields
    return [
      ...commonFields,
      ...businessFields,
      ...distributorBankFields,
    ];
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/35 p-4 backdrop-blur-[2px] font-sans"
          onClick={() => {
            if (!isLoading) onClose();
          }}
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[8px] border border-[#E4E4E2] bg-white shadow-[0_18px_60px_rgba(0,0,0,0.14)]"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="flex shrink-0 items-center justify-between border-b border-[#E6E6E4] bg-white px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-[6px] bg-[#111111] text-white">
                  <Pencil className="h-4 w-4" />
                </div>

                <h2 className="text-[16px] font-medium text-[#171717]">
                  Edit Profile
                </h2>
              </div>

              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#D7D7D5] bg-white text-[#777777] transition hover:border-[#BDBDBA] hover:text-[#111111] disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[calc(90vh-160px)] overflow-y-auto p-5">
              {errors.api && (
                <div className="mb-4 flex items-start gap-2 rounded-[6px] border border-[#F0CFCF] bg-[#FDF2F2] px-3.5 py-2.5 text-[12px] text-[#B24C4C]">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>{errors.api}</span>
                </div>
              )}

              <div className="relative mb-5 flex items-center justify-center">
                <div className="group relative">
                  <div
                    className={`flex h-24 w-24 items-center justify-center overflow-hidden rounded-full text-[28px] font-semibold shadow-sm ${imagePreview
                        ? "border-2 border-[#111111]"
                        : "bg-[#111111] text-white"
                      }`}
                    style={
                      imagePreview
                        ? {
                          backgroundImage: `url(${imagePreview})`,
                          backgroundSize:
                            "cover",
                          backgroundPosition:
                            "center",
                        }
                        : {}
                    }
                  >
                    {!imagePreview &&
                      (localFormData.full_name
                        ? localFormData.full_name
                          .charAt(0)
                          .toUpperCase()
                        : "U")}
                  </div>

                  <div className="absolute -bottom-1 -right-1">
                    <label className="cursor-pointer">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#111111] shadow-sm transition hover:bg-[#292929]">
                        <Camera className="h-4 w-4 text-white" />
                      </div>

                      <input
                        type="file"
                        accept="image/*"
                        onChange={
                          handleImageUpload
                        }
                        disabled={isLoading}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <AnimatePresence>
                    {imagePreview && (
                      <motion.button
                        initial={{
                          scale: 0,
                          opacity: 0,
                        }}
                        animate={{
                          scale: 1,
                          opacity: 1,
                        }}
                        exit={{
                          scale: 0,
                          opacity: 0,
                        }}
                        onClick={
                          handleRemoveImage
                        }
                        disabled={isLoading}
                        className="absolute -right-1 -top-1 rounded-full border-2 border-white bg-[#B24C4C] p-1.5 text-white shadow-sm transition hover:bg-[#9C3F3F] disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {errors.profile_picture && (
                <p className="-mt-3 mb-4 text-center text-[10px] font-medium text-[#C94D4D]">
                  {errors.profile_picture}
                </p>
              )}

              <p className="mb-5 text-center text-[10px] text-[#888888]">
                {imagePreview
                  ? "Click camera icon to change photo"
                  : "Click camera icon to upload photo"}
              </p>

              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 gap-3.5 md:grid-cols-2"
              >
                {getPopupFields().map(
                  (field) => {
                    const Icon = field.icon;

                    const hasError =
                      errors[field.name];

                    const isReadOnly =
                      field.readOnly || false;

                    const isRequired =
                      field.required || false;

                    return (
                      <motion.div
                        key={field.name}
                        variants={staggerItem}
                        className={
                          field.name ===
                            "billing_address" ||
                            field.name ===
                            "encrypted_bank_account"
                            ? "md:col-span-2"
                            : ""
                        }
                      >
                        <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.06em] text-[#666666]">
                          {field.label}

                          {isRequired && !isReadOnly && (
                            <span className="ml-0.5 text-[#C94D4D]">
                              *
                            </span>
                          )}

                          {isReadOnly && (
                            <span className="ml-1 text-[9px] font-normal normal-case tracking-normal text-[#999999]">
                              (Read-only)
                            </span>
                          )}
                        </label>

                        <div className="relative">
                          <input
                            type={field.type}
                            name={field.name}
                            value={
                              localFormData[
                              field.name
                              ] || ""
                            }
                            onChange={
                              handleChange
                            }
                            readOnly={
                              isReadOnly
                            }
                            disabled={isLoading}
                            className={`h-[42px] w-full rounded-[6px] border bg-white pl-10 pr-3.5 text-[12px] text-[#222222] outline-none transition placeholder:text-[#999999] ${hasError
                                ? "border-[#D66A6A] bg-[#FFF9F9] focus:border-[#C94D4D] focus:ring-1 focus:ring-[#C94D4D]/10"
                                : "border-[#D7D7D5] hover:border-[#BDBDBA] focus:border-[#999999] focus:ring-1 focus:ring-black/5"
                              } ${isReadOnly
                                ? "cursor-not-allowed bg-[#FAFAF9] text-[#666666]"
                                : ""
                              } ${isLoading
                                ? "opacity-70"
                                : ""
                              }`}
                            placeholder={
                              field.placeholder
                            }
                          />

                          <Icon className="absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-[#999999]" />
                        </div>

                        <AnimatePresence>
                          {hasError && (
                            <motion.p
                              initial={{
                                opacity: 0,
                                height: 0,
                              }}
                              animate={{
                                opacity: 1,
                                height:
                                  "auto",
                              }}
                              exit={{
                                opacity: 0,
                                height: 0,
                              }}
                              className="mt-1 flex items-center gap-1 text-[10px] font-medium text-[#C94D4D]"
                            >
                              <AlertCircle className="h-3 w-3" />
                              {
                                errors[
                                field.name
                                ]
                              }
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  }
                )}
              </motion.div>
            </div>

            <div className="flex shrink-0 gap-2.5 border-t border-[#E6E6E4] bg-white px-5 py-3.5">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex h-[42px] flex-1 items-center justify-center gap-2 rounded-[6px] border border-[#D7D7D5] bg-white px-4 text-[11px] font-medium text-[#555555] transition hover:border-[#BDBDBA] hover:bg-[#FAFAF9] disabled:opacity-50"
              >
                <XCircle className="h-3.5 w-3.5" />
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
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const AccountSettings = () => {
  const [
    showPasswordModal,
    setShowPasswordModal,
  ] = useState(false);

  const [
    showNotificationModal,
    setShowNotificationModal,
  ] = useState(false);

  const [
    showEditProfilePopup,
    setShowEditProfilePopup,
  ] = useState(false);

  const [activeSection, setActiveSection] =
    useState("profile");

  const [toast, setToast] = useState({
    show: false,
    message: "",
  });

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    country: "",
    account_type: "",
    profile_picture: null as string | File | null,
    company_name: "",
    gst_number: "",
    billing_address: "",
    encrypted_aadhaar: "",
    encrypted_pan: "",
    encrypted_bank_account: "",
    bank_ifsc: "",
    bank_holder_name: "",
  });

  const {
    data: profileResponse,
    isLoading: isProfileLoading,
    isFetching: isProfileFetching,
    error: profileError,
    refetch: refetchProfile,
  } = useGetUserProfileQuery();

  useEffect(() => {
    if (!profileResponse?.user) return;

    const user = profileResponse.user;

    const isDistributor =
      user.account_type === "distributor";

    setFormData({
      full_name: user.full_name || "",
      email: user.email || "",
      phone: user.phone || "",
      country: user.country || "",
      account_type:
        user.account_type || "customer",
      profile_picture:
        user.profile_picture || null,
      company_name: "",
      gst_number: "",
      billing_address: "",
      encrypted_aadhaar: isDistributor
        ? user.aadhaar_last4
          ? `XXXX-XXXX-${user.aadhaar_last4}`
          : ""
        : "",
      encrypted_pan: isDistributor
        ? user.pan_last4
          ? `XXXXXX${user.pan_last4}`
          : ""
        : "",
      encrypted_bank_account: isDistributor
        ? user.account_last4
          ? `XXXXXXXXXX${user.account_last4}`
          : ""
        : "",
      bank_ifsc: "",
      bank_holder_name: isDistributor
        ? user.full_name || ""
        : "",
    });
  }, [profileResponse]);

  const fireToast = (
    message: string
  ) => {
    setToast({
      show: true,
      message,
    });

    setTimeout(() => {
      setToast({
        show: false,
        message: "",
      });
    }, 2400);
  };

  const handleProfileSave = async (
    response: any
  ): Promise<boolean> => {
    try {
      await refetchProfile();

      fireToast(
        response?.message ||
        "Profile updated successfully"
      );

      return true;
    } catch (error) {
      console.error(
        "Profile refresh error:",
        error
      );

      fireToast(
        "Profile updated successfully"
      );

      return true;
    }
  };

  const getDisplayFields = () => {
    const commonFields = [
      {
        name: "full_name",
        label: "Full Name",
        icon: User,
      },
      {
        name: "email",
        label: "Email Address",
        icon: Mail,
      },
      {
        name: "phone",
        label: "Phone Number",
        icon: Bell,
      },
      {
        name: "country",
        label: "Country",
        icon: User,
      },
    ];

    if (
      formData.account_type ===
      "distributor"
    ) {
      return [
        ...commonFields,
        {
          name: "account_type",
          label: "Account Type",
          icon: Building,
        },
        {
          name: "bank_holder_name",
          label: "Bank Account Holder",
          icon: User,
        },
        {
          name: "encrypted_bank_account",
          label: "Bank Account Number",
          icon: CreditCard,
        },
        {
          name: "bank_ifsc",
          label: "IFSC Code",
          icon: Hash,
        },
        {
          name: "encrypted_pan",
          label: "PAN Number",
          icon: FileText,
        },
        {
          name: "encrypted_aadhaar",
          label: "Aadhaar Number",
          icon: FileText,
        },
      ];
    }

    return commonFields;
  };

  const navItems = [
    {
      id: "profile",
      label: "Profile Information",
      icon: UserCircle,
      description: "Update your personal details",
    },
    ...(profileResponse?.user?.account_type === "distributor"
      ? [{
        id: "password",
        label: "Change Password",
        icon: Key,
        description: "Update your password",
      }]
      : []),
    {
      id: "notifications",
      label: "Notification Preferences",
      icon: BellDot,
      description: "Manage your notifications",
    },
  ];

  const handleNavClick = (
    id: string
  ) => {
    setActiveSection(id);

    if (id === "password") {
      setShowPasswordModal(true);
    }

    if (id === "notifications") {
      setShowNotificationModal(true);
    }

    if (id === "profile") {
      setShowEditProfilePopup(true);
    }
  };

  if (
    isProfileLoading ||
    isProfileFetching
  ) {
    return (
      <div className="flex min-h-[400px] items-center justify-center font-sans">
        <div className="text-center">
          <span className="inline-block h-9 w-9 animate-spin rounded-full border-2 border-[#E4E4E2] border-t-[#111111]" />
          <p className="mt-4 text-[12px] text-[#888888]">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-6 font-sans">
        <div className="w-full max-w-md rounded-[8px] border border-[#E4E4E2] bg-white p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FDF2F2]">
            <AlertCircle className="h-5 w-5 text-[#B24C4C]" />
          </div>

          <h2 className="mt-4 text-[16px] font-semibold text-[#171717]">
            Unable to load profile
          </h2>

          <p className="mt-1.5 text-[12px] text-[#888888]">
            Something went wrong while fetching your profile.
          </p>

          <button
            onClick={() =>
              refetchProfile()
            }
            className="mt-5 rounded-[6px] bg-[#111111] px-5 py-2.5 text-[11px] font-semibold text-white transition hover:bg-[#292929]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans">
      <Toast
        show={toast.show}
        message={toast.message}
      />

      <div className="mx-auto">
        <div className="overflow-hidden rounded-[8px] border border-[#E4E4E2] bg-white">
          <div className="flex items-center justify-between border-b border-[#E6E6E4] px-6 py-5">
            <div>
              <h2 className="text-[20px] font-semibold text-[#171717]">
                Account Settings
              </h2>
              <p className="mt-0.5 text-[12px] text-[#888888]">
                {formData.account_type ===
                  "customer"
                  ? "Customer Profile"
                  : "Distributor Profile"}
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-[7px] border border-[#E4E4E2] bg-[#FAFAF9] px-3.5 py-2">
              <Building className="h-3.5 w-3.5 text-[#111111]" />

              <span className="text-[11px] font-medium capitalize text-[#171717]">
                {formData.account_type ||
                  "customer"}
              </span>
            </div>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-2.5 p-6"
          >
            {navItems.map((item) => {
              const Icon = item.icon;

              const isActive =
                activeSection === item.id;

              return (
                <motion.div
                  key={item.id}
                  variants={staggerItem}
                  onClick={() =>
                    handleNavClick(item.id)
                  }
                  className={`group flex cursor-pointer items-center justify-between rounded-[7px] border p-4 transition ${isActive
                      ? "border-[#111111] bg-[#FAFAF9]"
                      : "border-[#E4E4E2] hover:border-[#CFCFCC]"
                    }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] transition ${isActive
                          ? "bg-[#111111] text-white"
                          : "bg-[#F1F1F0] text-[#888888]"
                        }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    <div>
                      <h3 className="text-[12px] font-medium text-[#171717]">
                        {item.label}
                      </h3>

                      <p className="mt-0.5 text-[10px] text-[#888888]">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium text-[#777777] group-hover:text-[#111111]">
                      {item.id ===
                        "profile"
                        ? "Edit"
                        : item.id ===
                          "password"
                          ? "Change"
                          : "Manage"}
                    </span>

                    <ChevronRightIcon className="h-3.5 w-3.5 text-[#AAAAAA] transition group-hover:text-[#111111]" />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          <AnimatePresence mode="wait">
            {activeSection ===
              "profile" && (
                <motion.div
                  key="profile-display"
                  initial={{
                    opacity: 0,
                    y: 12,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: -8,
                  }}
                  transition={{
                    duration: 0.2,
                  }}
                  className="px-6 pb-6"
                >
                  <div className="mb-5 flex items-center gap-4 rounded-[7px] border border-[#E4E4E2] bg-[#FAFAF9] p-4">
                    <div
                      className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#111111] text-[20px] font-semibold text-white"
                      style={
                        typeof formData.profile_picture ===
                          "string"
                          ? {
                            backgroundImage: `url(${formData.profile_picture})`,
                            backgroundSize:
                              "cover",
                            backgroundPosition:
                              "center",
                          }
                          : {}
                      }
                    >
                      {typeof formData.profile_picture !==
                        "string" &&
                        (formData.full_name
                          ? formData.full_name
                            .charAt(0)
                            .toUpperCase()
                          : "U")}
                    </div>

                    <div className="min-w-0">
                      <h2 className="truncate text-[16px] font-semibold text-[#171717]">
                        {formData.full_name ||
                          "User"}
                      </h2>

                      <p className="text-[11px] capitalize text-[#666666]">
                        {formData.account_type}
                      </p>

                      <p className="mt-0.5 truncate text-[10px] text-[#999999]">
                        {formData.email}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {getDisplayFields().map(
                      (field) => {
                        const Icon = field.icon;

                        const value =
                          formData[
                          field.name
                          ];

                        if (
                          field.name ===
                          "account_type"
                        ) {
                          return (
                            <div key={field.name}>
                              <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.06em] text-[#666666]">
                                {field.label}
                              </label>

                              <div className="relative">
                                <div className="h-[42px] w-full rounded-[6px] border border-[#E4E4E2] bg-[#FAFAF9] px-3.5 pl-10 text-[12px] leading-[42px] text-[#171717]">
                                  <span className="capitalize">
                                    {value}
                                  </span>
                                </div>

                                <Icon className="absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-[#999999]" />
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={field.name}
                            className={
                              field.name ===
                                "encrypted_bank_account"
                                ? "md:col-span-2"
                                : ""
                            }
                          >
                            <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.06em] text-[#666666]">
                              {field.label}
                            </label>

                            <div className="relative">
                              <div className="h-[42px] w-full truncate rounded-[6px] border border-[#E4E4E2] bg-[#FAFAF9] px-3.5 pl-10 text-[12px] leading-[42px] text-[#555555]">
                                {value ||
                                  "Not provided"}
                              </div>

                              <Icon className="absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-[#999999]" />
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </motion.div>
              )}
          </AnimatePresence>
        </div>
      </div>

      <PasswordChange
        isOpen={showPasswordModal}
        onClose={() =>
          setShowPasswordModal(
            false
          )
        }
        onSave={() => {
          fireToast(
            "Password updated successfully"
          );
        }}
      />

      <Notifications
        isOpen={showNotificationModal}
        onClose={() =>
          setShowNotificationModal(
            false
          )
        }
        onSave={() => {
          fireToast(
            "Notification preferences updated successfully"
          );
        }}
      />

      <EditProfilePopup
        isOpen={showEditProfilePopup}
        onClose={() =>
          setShowEditProfilePopup(
            false
          )
        }
        formData={formData}
        setFormData={setFormData}
        onSave={handleProfileSave}
      />
    </div>
  );
};

export default AccountSettings;