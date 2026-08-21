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
    transition: { duration: 0.25 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

const modalVariants = {
  hidden: { scale: 0.85, opacity: 0, y: 40 },
  visible: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 26,
    },
  },
  exit: {
    scale: 0.9,
    opacity: 0,
    y: 20,
    transition: { duration: 0.18 },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.05,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 16 },
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
        initial={{ opacity: 0, y: -30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{
          opacity: 0,
          y: -20,
          scale: 0.9,
          transition: { duration: 0.2 },
        }}
        transition={{
          type: "spring",
          stiffness: 350,
          damping: 24,
        }}
        className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2.5 bg-white border border-[#171f39]/30 shadow-2xl rounded-2xl px-5 py-3.5"
      >
        <motion.div
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            delay: 0.1,
            type: "spring",
            stiffness: 400,
            damping: 15,
          }}
          className="bg-[#171f39] rounded-full p-1"
        >
          <CheckCircle2 className="w-4 h-4 text-white" />
        </motion.div>

        <span className="text-sm font-medium text-gray-800">
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
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.05 }}
              className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{
                    rotate: -20,
                    scale: 0.5,
                  }}
                  animate={{
                    rotate: 0,
                    scale: 1,
                  }}
                  transition={{
                    delay: 0.15,
                    type: "spring",
                    stiffness: 300,
                  }}
                  className="bg-[#171f39]/10 p-2 rounded-xl"
                >
                  <Lock className="w-5 h-5 text-[#171f39]" />
                </motion.div>

                <h2 className="text-gray-800 font-bold text-lg">
                  Change Password
                </h2>
              </div>

              <motion.button
                whileHover={{
                  scale: 1.15,
                  rotate: 90,
                }}
                whileTap={{ scale: 0.9 }}
                onClick={handleClose}
                disabled={isLoading}
                className="text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="p-6 space-y-4"
            >
              {errors.api && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: -5,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 flex items-start gap-2"
                >
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{errors.api}</span>
                </motion.div>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {label}
                    </label>

                    <div className="relative">
                      <motion.input
                        whileFocus={{
                          scale: 1.01,
                        }}
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
                        className={`w-full px-4 py-2.5 border rounded-xl text-black text-sm focus:border-[#171f39] focus:ring-2 focus:ring-[#171f39]/20 outline-none transition-all ${
                          errors[field]
                            ? "border-red-400"
                            : "border-gray-300"
                        } ${
                          isLoading
                            ? "bg-gray-100 cursor-not-allowed"
                            : ""
                        }`}
                        placeholder={placeholder}
                      />

                      <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
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
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showPassword[
                          key as keyof typeof showPassword
                        ] ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </motion.button>
                    </div>

                    <AnimatePresence>
                      {errors[field] && (
                        <motion.p
                          initial={{
                            opacity: 0,
                            height: 0,
                            y: -5,
                          }}
                          animate={{
                            opacity: 1,
                            height: "auto",
                            y: 0,
                          }}
                          exit={{
                            opacity: 0,
                            height: 0,
                          }}
                          className="text-red-500 text-xs mt-1 flex items-center gap-1"
                        >
                          <AlertCircle className="w-3 h-3" />
                          {errors[field]}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              )}

              <motion.div
                variants={staggerItem}
                className="flex gap-3 pt-2"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleClose}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </motion.button>

                <motion.button
                  whileHover={
                    !isLoading
                      ? {
                          scale: 1.02,
                          boxShadow:
                            "0 8px 20px rgba(23,31,57,0.3)",
                        }
                      : {}
                  }
                  whileTap={
                    !isLoading ? { scale: 0.97 } : {}
                  }
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 bg-[#171f39] text-white font-medium rounded-xl hover:bg-[#0e1428] transition-colors shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <motion.span
                        animate={{
                          rotate: 360,
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.8,
                          ease: "linear",
                        }}
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      />
                      Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </motion.button>
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
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{
                y: -20,
                opacity: 0,
              }}
              animate={{
                y: 0,
                opacity: 1,
              }}
              transition={{ delay: 0.05 }}
              className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{
                    rotate: [
                      0,
                      -12,
                      12,
                      -8,
                      8,
                      0,
                    ],
                  }}
                  transition={{
                    delay: 0.3,
                    duration: 0.7,
                  }}
                  className="bg-[#171f39]/10 p-2 rounded-xl"
                >
                  <Bell className="w-5 h-5 text-[#171f39]" />
                </motion.div>

                <h2 className="text-gray-800 font-bold text-lg">
                  Notification Settings
                </h2>
              </div>

              <motion.button
                whileHover={{
                  scale: 1.15,
                  rotate: 90,
                }}
                whileTap={{ scale: 0.9 }}
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </motion.div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              {error && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: -5,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 flex items-start gap-2"
                >
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <motion.div
                    animate={{
                      rotate: 360,
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.8,
                      ease: "linear",
                    }}
                    className="h-10 w-10 rounded-full border-4 border-[#171f39] border-t-transparent"
                  />

                  <p className="mt-4 text-sm text-gray-500">
                    Loading notification settings...
                  </p>
                </div>
              ) : (
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
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
                          whileHover={{
                            scale: 1.03,
                            y: -2,
                          }}
                          whileTap={{
                            scale: 0.98,
                          }}
                          className={`p-4 rounded-xl border-2 transition-colors cursor-pointer ${
                            isEnabled
                              ? "border-[#171f39] bg-[#171f39]/5"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() =>
                            handleToggleLocal(
                              option.key
                            )
                          }
                        >
                          <div className="flex items-start gap-3">
                            <motion.div
                              animate={{
                                backgroundColor:
                                  isEnabled
                                    ? "#171f39"
                                    : "#F3F4F6",
                                color: isEnabled
                                  ? "#FFFFFF"
                                  : "#9CA3AF",
                              }}
                              transition={{
                                duration: 0.25,
                              }}
                              className="p-2 rounded-lg"
                            >
                              <Icon className="w-4 h-4" />
                            </motion.div>

                            <div className="flex-1">
                              <div className="flex items-center justify-between gap-3">
                                <h3 className="text-sm font-medium text-gray-800">
                                  {option.label}
                                </h3>

                                <motion.div
                                  animate={{
                                    backgroundColor:
                                      isEnabled
                                        ? "#171f39"
                                        : "#D1D5DB",
                                  }}
                                  transition={{
                                    duration: 0.25,
                                  }}
                                  className="w-10 h-5 rounded-full relative shrink-0"
                                >
                                  <motion.div
                                    animate={{
                                      left: isEnabled
                                        ? "22px"
                                        : "2px",
                                    }}
                                    transition={{
                                      type: "spring",
                                      stiffness: 500,
                                      damping: 30,
                                    }}
                                    className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"
                                  />
                                </motion.div>
                              </div>

                              <p className="text-xs text-gray-500 mt-0.5">
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

            <div className="px-6 py-4 bg-[#f7f2e8] border-t border-gray-100 flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleClose}
                disabled={isToggleLoading}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </motion.button>

              <motion.button
                whileHover={
                  !isToggleLoading
                    ? {
                        scale: 1.02,
                        boxShadow:
                          "0 8px 20px rgba(23,31,57,0.3)",
                      }
                    : {}
                }
                whileTap={
                  !isToggleLoading
                    ? { scale: 0.97 }
                    : {}
                }
                onClick={handleSave}
                disabled={
                  isLoading || isToggleLoading
                }
                className="flex-1 px-4 py-2.5 bg-[#171f39] text-white font-medium rounded-xl hover:bg-[#0e1428] transition-colors shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isToggleLoading ? (
                  <>
                    <motion.span
                      animate={{
                        rotate: 360,
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.8,
                        ease: "linear",
                      }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </motion.button>
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

      if (!localFormData.document?.trim()) {
        newErrors.document =
          "Document is required";
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

        formData.append(
          "document",
          localFormData.document || ""
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
        // Only update business fields for distributors
        ...(localFormData.account_type === "distributor" && {
          company_name:
            localFormData.company_name,
          gst_number:
            localFormData.gst_number,
          billing_address:
            localFormData.billing_address,
          document:
            localFormData.document,
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
      {
        name: "document",
        label: "Document",
        type: "text",
        icon: FileText,
        placeholder: "Enter document",
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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => {
            if (!isLoading) onClose();
          }}
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-2xl overflow-hidden"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <motion.div
              initial={{
                y: -20,
                opacity: 0,
              }}
              animate={{
                y: 0,
                opacity: 1,
              }}
              transition={{ delay: 0.05 }}
              className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{
                    rotate: -20,
                    scale: 0.5,
                  }}
                  animate={{
                    rotate: 0,
                    scale: 1,
                  }}
                  transition={{
                    delay: 0.15,
                    type: "spring",
                    stiffness: 300,
                  }}
                  className="bg-[#171f39]/10 p-2 rounded-xl"
                >
                  <Pencil className="w-5 h-5 text-[#171f39]" />
                </motion.div>

                <h2 className="text-gray-800 font-bold text-lg">
                  Edit Profile
                </h2>
              </div>

              <motion.button
                whileHover={{
                  scale: 1.15,
                  rotate: 90,
                }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                disabled={isLoading}
                className="text-gray-400 hover:text-gray-700 disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </motion.div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              {errors.api && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: -5,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 flex items-start gap-2"
                >
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{errors.api}</span>
                </motion.div>
              )}

              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.8,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                transition={{
                  delay: 0.1,
                  type: "spring",
                  stiffness: 250,
                  damping: 20,
                }}
                className="flex items-center justify-center mb-6 relative"
              >
                <div className="relative group">
                  <motion.div
                    layout
                    className={`w-28 h-28 rounded-full flex items-center justify-center text-4xl font-bold shadow-xl relative overflow-hidden ${
                      imagePreview
                        ? "border-2 border-[#171f39]"
                        : "bg-gradient-to-br from-[#171f39] to-[#e1ce92] text-white"
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
                    <AnimatePresence>
                      {!imagePreview && (
                        <motion.span
                          initial={{
                            opacity: 0,
                            scale: 0.5,
                          }}
                          animate={{
                            opacity: 1,
                            scale: 1,
                          }}
                          exit={{
                            opacity: 0,
                            scale: 0.5,
                          }}
                        >
                          {localFormData.full_name
                            ? localFormData.full_name
                                .charAt(0)
                                .toUpperCase()
                            : "U"}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  <motion.div
                    initial={{
                      scale: 0,
                      rotate: -90,
                    }}
                    animate={{
                      scale: 1,
                      rotate: 0,
                    }}
                    transition={{
                      delay: 0.35,
                      type: "spring",
                      stiffness: 350,
                      damping: 18,
                    }}
                    className="absolute -bottom-1 -right-1"
                  >
                    <label className="cursor-pointer">
                      <motion.div
                        whileHover={{
                          scale: 1.12,
                        }}
                        whileTap={{
                          scale: 0.9,
                        }}
                        className="bg-[#171f39] p-2.5 rounded-full shadow-lg border-2 border-white"
                      >
                        <Camera className="w-5 h-5 text-white" />
                      </motion.div>

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
                  </motion.div>

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
                        whileHover={{
                          scale: 1.12,
                          rotate: -8,
                        }}
                        whileTap={{
                          scale: 0.9,
                        }}
                        onClick={
                          handleRemoveImage
                        }
                        disabled={isLoading}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-2 rounded-full shadow-lg border-2 border-white disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              {errors.profile_picture && (
                <p className="text-red-500 text-xs text-center -mt-3 mb-5">
                  {errors.profile_picture}
                </p>
              )}

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  delay: 0.2,
                }}
                className="text-center text-xs text-gray-500 mb-6"
              >
                {imagePreview
                  ? "Click camera icon to change photo"
                  : "Click camera icon to upload photo"}
              </motion.p>

              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
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
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          {field.label}

                          {isRequired && !isReadOnly && (
                            <span className="text-red-500 ml-0.5">
                              *
                            </span>
                          )}

                          {isReadOnly && (
                            <span className="text-gray-400 text-xs ml-1">
                              (Read-only)
                            </span>
                          )}
                        </label>

                        <div className="relative">
                          <motion.input
                            whileFocus={
                              !isReadOnly
                                ? {
                                    scale: 1.01,
                                  }
                                : {}
                            }
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
                            className={`w-full px-4 py-2.5 border rounded-xl text-black text-sm pl-11 transition-all focus:border-[#171f39] focus:ring-2 focus:ring-[#171f39]/20 outline-none ${
                              hasError
                                ? "border-red-400"
                                : "border-gray-300"
                            } ${
                              isReadOnly
                                ? "bg-gray-100 cursor-not-allowed text-gray-600"
                                : ""
                            } ${
                              isLoading
                                ? "opacity-70"
                                : ""
                            }`}
                            placeholder={
                              field.placeholder
                            }
                          />

                          <Icon
                            className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                              isReadOnly
                                ? "text-gray-500"
                                : "text-gray-400"
                            }`}
                          />
                        </div>

                        <AnimatePresence>
                          {hasError && (
                            <motion.p
                              initial={{
                                opacity: 0,
                                height: 0,
                                y: -5,
                              }}
                              animate={{
                                opacity: 1,
                                height:
                                  "auto",
                                y: 0,
                              }}
                              exit={{
                                opacity: 0,
                                height: 0,
                              }}
                              className="text-red-500 text-xs mt-1 flex items-center gap-1"
                            >
                              <AlertCircle className="w-3 h-3" />
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

            <div className="px-6 py-4 bg-[#f7f2e8] border-t border-gray-100 flex gap-3">
              <motion.button
                whileHover={{
                  scale: 1.02,
                }}
                whileTap={{
                  scale: 0.97,
                }}
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                Cancel
              </motion.button>

              <motion.button
                whileHover={
                  !isLoading
                    ? {
                        scale: 1.02,
                        boxShadow:
                          "0 8px 20px rgba(23,31,57,0.3)",
                      }
                    : {}
                }
                whileTap={
                  !isLoading
                    ? {
                        scale: 0.97,
                      }
                    : {}
                }
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 bg-[#171f39] text-white font-medium rounded-xl hover:bg-[#0e1428] transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <motion.span
                      animate={{
                        rotate: 360,
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.8,
                        ease: "linear",
                      }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Updating...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </motion.button>
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
    document: "",
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
      document: "",
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
    // Only show "Change Password" for distributors
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
      <div className="min-h-screen bg-[#f7f2e8] flex items-center justify-center">
        <motion.div
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="text-center"
        >
          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              repeat: Infinity,
              duration: 0.8,
              ease: "linear",
            }}
            className="inline-block rounded-full h-12 w-12 border-4 border-[#171f39] border-t-transparent"
          />

          <motion.p
            animate={{
              opacity: [
                0.4,
                1,
                0.4,
              ],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.4,
            }}
            className="mt-4 text-gray-600"
          >
            Loading profile...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="min-h-screen bg-[#f7f2e8] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-500" />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-gray-800">
            Unable to load profile
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Something went wrong while fetching
            your profile.
          </p>

          <button
            onClick={() =>
              refetchProfile()
            }
            className="mt-5 px-5 py-2.5 rounded-xl bg-[#171f39] text-white text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f2e8] p-6 rounded-2xl">
      <Toast
        show={toast.show}
        message={toast.message}
      />

      <div className="max-w-5xl mx-auto">
        <motion.nav
          initial={{
            opacity: 0,
            y: -10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="flex items-center gap-1.5 text-xs text-gray-500 mb-6"
        >
          <Link
            href="/"
            className="hover:text-[#171f39] transition-colors"
          >
            Home
          </Link>

          <ChevronRight className="w-3 h-3 text-gray-300" />

          <span className="font-serif text-gray-800 font-medium">
            Account Settings
          </span>
        </motion.nav>

        <motion.div
          initial={{
            opacity: 0,
            y: 24,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.08,
            type: "spring",
            stiffness: 200,
            damping: 24,
          }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
        >
          <div className="bg-white px-8 py-6 flex items-center justify-between relative overflow-hidden border-b border-gray-100">
            <motion.div
              initial={{
                opacity: 0,
                rotate: -30,
                scale: 0,
              }}
              animate={{
                opacity: 1,
                rotate: 0,
                scale: 1,
              }}
              transition={{
                delay: 0.4,
                duration: 0.6,
              }}
              className="absolute -right-6 -top-6"
            >
              <Sparkles className="w-32 h-32 text-[#171f39]/10" />
            </motion.div>

            <div className="flex items-center gap-4 relative z-10">
              <motion.div
                initial={{
                  scale: 0,
                  rotate: -45,
                }}
                animate={{
                  scale: 1,
                  rotate: 0,
                }}
                transition={{
                  delay: 0.15,
                  type: "spring",
                  stiffness: 260,
                  damping: 18,
                }}
                whileHover={{
                  rotate: 12,
                }}
                className="bg-[#171f39]/10 p-3 rounded-xl"
              >
                <Settings className="w-6 h-6 text-[#171f39]" />
              </motion.div>

              <div>
                <motion.h1
                  initial={{
                    opacity: 0,
                    x: -12,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    delay: 0.2,
                  }}
                  className="font-serif text-2xl font-bold text-gray-800"
                >
                  Account Settings
                </motion.h1>

                <motion.p
                  initial={{
                    opacity: 0,
                    x: -12,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    delay: 0.28,
                  }}
                  className="text-gray-500 text-sm mt-0.5"
                >
                  {formData.account_type ===
                  "customer"
                    ? "Customer Profile"
                    : "Distributor Profile"}
                </motion.p>
              </div>
            </div>

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.8,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{
                delay: 0.3,
              }}
              className="flex items-center gap-2 bg-[#e1ce92]/25 border border-[#e1ce92]/60 px-4 py-2 rounded-xl relative z-10"
            >
              <Building className="w-4 h-4 text-[#171f39]" />

              <span className="text-gray-700 font-medium text-sm capitalize">
                {formData.account_type ||
                  "customer"}
              </span>
            </motion.div>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="p-8 space-y-4"
          >
            {navItems.map((item) => {
              const Icon = item.icon;

              const isActive =
                activeSection === item.id;

              return (
                <motion.div
                  key={item.id}
                  variants={staggerItem}
                  whileHover={{
                    scale: 1.015,
                    y: -2,
                  }}
                  whileTap={{
                    scale: 0.99,
                  }}
                  onClick={() =>
                    handleNavClick(item.id)
                  }
                  className={`group flex items-center justify-between p-5 rounded-xl border-2 transition-colors cursor-pointer ${
                    isActive
                      ? "border-[#171f39] bg-[#171f39]/5 shadow-md"
                      : "border-gray-200 hover:border-[#171f39]/50 hover:shadow-lg hover:bg-[#f7f2e8]"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <motion.div
                      whileHover={{
                        rotate: 8,
                      }}
                      className={`p-3 rounded-xl transition-colors ${
                        isActive
                          ? "bg-[#171f39] text-white shadow-md"
                          : "bg-gray-100 text-gray-500 group-hover:bg-[#171f39]/10 group-hover:text-[#171f39]"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </motion.div>

                    <div>
                      <h3
                        className={`font-semibold transition-colors ${
                          isActive
                            ? "text-[#171f39]"
                            : "text-gray-800 group-hover:text-[#171f39]"
                        }`}
                      >
                        {item.label}
                      </h3>

                      <p className="text-sm text-gray-500">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-sm font-medium transition-colors ${
                        isActive
                          ? "text-[#171f39]"
                          : "text-gray-400 group-hover:text-[#171f39]"
                      }`}
                    >
                      {item.id ===
                      "profile"
                        ? "Edit →"
                        : item.id ===
                          "password"
                        ? "Change →"
                        : "Manage →"}
                    </span>

                    <motion.div
                      animate={{
                        x: isActive ? 4 : 0,
                      }}
                      className="group-hover:translate-x-1 transition-transform"
                    >
                      <ChevronRightIcon
                        className={`w-4 h-4 transition-colors ${
                          isActive
                            ? "text-[#171f39]"
                            : "text-gray-300 group-hover:text-[#171f39]"
                        }`}
                      />
                    </motion.div>
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
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -10,
                }}
                transition={{
                  duration: 0.25,
                }}
                className="px-8 pb-8"
              >
                <motion.div
                  initial={{
                    opacity: 0,
                    scale: 0.95,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  transition={{
                    delay: 0.1,
                  }}
                  className="mb-6 p-6 bg-[#f7f2e8] rounded-xl border border-gray-100 flex items-center gap-6"
                >
                  <motion.div
                    whileHover={{
                      scale: 1.06,
                    }}
                    className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg bg-gradient-to-br from-[#171f39] to-[#e1ce92] overflow-hidden"
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
                  </motion.div>

                  <div>
                    <h2 className="font-semibold text-gray-800">
                      {formData.full_name ||
                        "User"}
                    </h2>

                    <p className="text-sm text-gray-500 capitalize">
                      {formData.account_type}
                    </p>

                    <p className="text-xs text-gray-400 mt-0.5">
                      {formData.email}
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
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
                          <motion.div
                            key={field.name}
                            variants={
                              staggerItem
                            }
                            whileHover={{
                              scale: 1.015,
                            }}
                          >
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                              {field.label}
                            </label>

                            <div className="relative">
                              <div className="w-full px-4 py-2.5 bg-gray-100/50 border border-gray-200 rounded-xl text-gray-700 text-sm pl-11">
                                <span className="capitalize">
                                  {value}
                                </span>
                              </div>

                              <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            </div>
                          </motion.div>
                        );
                      }

                      return (
                        <motion.div
                          key={field.name}
                          variants={
                            staggerItem
                          }
                          whileHover={{
                            scale: 1.015,
                          }}
                          className={
                            field.name ===
                            "encrypted_bank_account"
                              ? "md:col-span-2"
                              : ""
                          }
                        >
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            {field.label}
                          </label>

                          <div className="relative">
                            <div className="w-full px-4 py-2.5 bg-[#f7f2e8]/60 border border-gray-100 rounded-xl text-gray-600 text-sm pl-11">
                              {value ||
                                "Not provided"}
                            </div>

                            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          </div>
                        </motion.div>
                      );
                    }
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
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