"use client";

import React, { useState, useEffect } from "react";
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
  Smartphone,
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

import { useChangePasswordMutation } from "@/lib/redux/api/Profile/userApi";

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

// ---------- Toast ----------
const Toast = ({ show, message }) => (
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
        transition={{ type: "spring", stiffness: 350, damping: 24 }}
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

// ---------- Password Change Component ----------
const PasswordChange = ({ isOpen, onClose, onSave }) => {
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

  const [errors, setErrors] = useState({});

  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const validatePassword = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (
      passwordData.newPassword !== passwordData.confirmPassword
    ) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validatePassword()) {
      return;
    }

    try {
      const response = await changePassword({
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
        new_password_confirmation: passwordData.confirmPassword,
      }).unwrap();

      console.log("Change password response:", response);

      // Parent success callback
      onSave?.(response);

      // Reset form
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

      // Close modal after successful API response
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
                  initial={{ rotate: -20, scale: 0.5 }}
                  animate={{ rotate: 0, scale: 1 }}
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
                whileHover={{ scale: 1.15, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleClose}
                disabled={isLoading}
                className="text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 flex items-start gap-2"
                >
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{errors.api}</span>
                </motion.div>
              )}

              {fields.map(
                ({ key, label, field, placeholder }) => (
                  <motion.div key={key} variants={staggerItem}>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {label}
                    </label>

                    <div className="relative">
                      <motion.input
                        whileFocus={{ scale: 1.01 }}
                        type={showPassword[key] ? "text" : "password"}
                        value={passwordData[field]}
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
                            [key]: !showPassword[key],
                          })
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                      >
                        {showPassword[key] ? (
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
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                  whileTap={!isLoading ? { scale: 0.97 } : {}}
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 bg-[#171f39] text-white font-medium rounded-xl hover:bg-[#0e1428] transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <motion.span
                        animate={{ rotate: 360 }}
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

// ---------- Notifications Component ----------
const Notifications = ({ isOpen, onClose, onSave }) => {
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    orderUpdates: true,
    paymentAlerts: true,
    promotionalEmails: false,
    securityAlerts: true,
    newsletter: false,
  });

  const notificationOptions = [
    {
      key: "emailNotifications",
      label: "Email Notifications",
      icon: Mail,
      description: "Receive updates via email",
    },
    {
      key: "smsNotifications",
      label: "SMS Notifications",
      icon: Smartphone,
      description: "Receive updates via SMS",
    },
    {
      key: "pushNotifications",
      label: "Push Notifications",
      icon: Bell,
      description: "Receive push notifications",
    },
    {
      key: "orderUpdates",
      label: "Order Updates",
      icon: BellRing,
      description: "Get notified about order status",
    },
    {
      key: "paymentAlerts",
      label: "Payment Alerts",
      icon: Shield,
      description: "Payment confirmation and alerts",
    },
    {
      key: "promotionalEmails",
      label: "Promotional Emails",
      icon: Mail,
      description: "Special offers and promotions",
    },
    {
      key: "securityAlerts",
      label: "Security Alerts",
      icon: Shield,
      description: "Important security notifications",
    },
    {
      key: "newsletter",
      label: "Newsletter",
      icon: Mail,
      description: "Monthly updates and news",
    },
  ];

  const handleToggle = (key) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    onSave(notificationSettings);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
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
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.05 }}
              className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{
                    rotate: [0, -12, 12, -8, 8, 0],
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
                whileHover={{ scale: 1.15, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </motion.div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {notificationOptions.map((option) => {
                  const Icon = option.icon;
                  const isEnabled =
                    notificationSettings[option.key];

                  return (
                    <motion.div
                      key={option.key}
                      variants={staggerItem}
                      whileHover={{
                        scale: 1.03,
                        y: -2,
                      }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 rounded-xl border-2 transition-colors cursor-pointer ${
                        isEnabled
                          ? "border-[#171f39] bg-[#171f39]/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => handleToggle(option.key)}
                    >
                      <div className="flex items-start gap-3">
                        <motion.div
                          animate={{
                            backgroundColor: isEnabled
                              ? "#171f39"
                              : "#F3F4F6",
                            color: isEnabled
                              ? "#FFFFFF"
                              : "#9CA3AF",
                          }}
                          transition={{ duration: 0.25 }}
                          className="p-2 rounded-lg"
                        >
                          <Icon className="w-4 h-4" />
                        </motion.div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-gray-800">
                              {option.label}
                            </h3>

                            <motion.div
                              animate={{
                                backgroundColor: isEnabled
                                  ? "#171f39"
                                  : "#D1D5DB",
                              }}
                              transition={{ duration: 0.25 }}
                              className="w-10 h-5 rounded-full relative"
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
                            {option.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>

            <div className="px-6 py-4 bg-[#f7f2e8] border-t border-gray-100 flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </motion.button>

              <motion.button
                whileHover={{
                  scale: 1.02,
                  boxShadow:
                    "0 8px 20px rgba(23,31,57,0.3)",
                }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSave}
                className="flex-1 px-4 py-2.5 bg-[#171f39] text-white font-medium rounded-xl hover:bg-[#0e1428] transition-colors shadow-sm"
              >
                Save Changes
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ---------- Edit Profile Popup Component ----------
const EditProfilePopup = ({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSave,
}) => {
  const [localFormData, setLocalFormData] =
    useState(formData);
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] =
    useState(null);

  useEffect(() => {
    setLocalFormData(formData);

    if (formData.profile_picture) {
      setImagePreview(formData.profile_picture);
    }
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setLocalFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        setImagePreview(reader.result);

        setLocalFormData((prev) => ({
          ...prev,
          profile_picture: reader.result,
        }));
      };

      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);

    setLocalFormData((prev) => ({
      ...prev,
      profile_picture: null,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!localFormData.full_name?.trim()) {
      newErrors.full_name = "Full name is required";
    }

    if (!localFormData.country?.trim()) {
      newErrors.country = "Country is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      setFormData(localFormData);
      onSave(localFormData);
      onClose();
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
      },
      {
        name: "phone",
        label: "Phone Number",
        type: "text",
        icon: Smartphone,
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
      },
    ];

    if (localFormData.account_type === "distributor") {
      return [
        ...commonFields,
        {
          name: "bank_holder_name",
          label: "Bank Account Holder",
          type: "text",
          icon: User,
          placeholder: "Enter account holder name",
        },
        {
          name: "encrypted_bank_account",
          label: "Bank Account Number",
          type: "text",
          icon: CreditCard,
          placeholder: "Enter account number",
        },
        {
          name: "bank_ifsc",
          label: "IFSC Code",
          type: "text",
          icon: Hash,
          placeholder: "Enter IFSC code",
        },
        {
          name: "encrypted_pan",
          label: "PAN Number",
          type: "text",
          icon: FileText,
          placeholder: "Enter PAN number",
        },
        {
          name: "encrypted_aadhaar",
          label: "Aadhaar Number",
          type: "text",
          icon: FileText,
          placeholder: "Enter Aadhaar number",
        },
      ];
    }

    return commonFields;
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
          onClick={onClose}
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
                className="text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </motion.div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              {/* Profile Picture Upload */}
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
                        : "bg-gradient-to-br from-[#171f39] to-[#e1ce92]"
                    }`}
                    style={
                      imagePreview
                        ? {
                            backgroundImage: `url(${imagePreview})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }
                        : {}
                    }
                  >
                    <AnimatePresence>
                      {!imagePreview && (
                        <motion.span
                          key="initial"
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
                        whileHover={{ scale: 1.12 }}
                        whileTap={{ scale: 0.9 }}
                        className="bg-[#171f39] p-2.5 rounded-full shadow-lg hover:bg-[#0e1428] transition-colors border-2 border-white"
                      >
                        <Camera className="w-5 h-5 text-white" />
                      </motion.div>

                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
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
                        whileTap={{ scale: 0.9 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 18,
                        }}
                        onClick={handleRemoveImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors border-2 border-white"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
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
                {getPopupFields().map((field) => {
                  const Icon = field.icon;
                  const hasError = errors[field.name];
                  const isReadOnly =
                    field.readOnly || false;

                  return (
                    <motion.div
                      key={field.name}
                      variants={staggerItem}
                      className={
                        field.name ===
                        "encrypted_bank_account"
                          ? "md:col-span-2"
                          : ""
                      }
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        {field.label}

                        {!isReadOnly && (
                          <span className="text-red-500">
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
                              ? { scale: 1.01 }
                              : {}
                          }
                          type={field.type}
                          name={field.name}
                          value={
                            localFormData[field.name] || ""
                          }
                          onChange={handleChange}
                          readOnly={isReadOnly}
                          className={`w-full px-4 py-2.5 border rounded-xl text-black text-sm pl-11 transition-all focus:border-[#171f39] focus:ring-2 focus:ring-[#171f39]/20 outline-none ${
                            hasError
                              ? "border-red-400"
                              : "border-gray-300"
                          } ${
                            isReadOnly
                              ? "bg-gray-100 cursor-not-allowed text-gray-600"
                              : ""
                          }`}
                          placeholder={field.placeholder}
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
                            {errors[field.name]}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>

            <div className="px-6 py-4 bg-[#f7f2e8] border-t border-gray-100 flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Cancel
              </motion.button>

              <motion.button
                whileHover={{
                  scale: 1.02,
                  boxShadow:
                    "0 8px 20px rgba(23,31,57,0.3)",
                }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSubmit}
                className="flex-1 px-4 py-2.5 bg-[#171f39] text-white font-medium rounded-xl hover:bg-[#0e1428] transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Save Changes
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ---------- Main Account Settings Component ----------
const AccountSettings = () => {
  const [showPasswordModal, setShowPasswordModal] =
    useState(false);

  const [showNotificationModal, setShowNotificationModal] =
    useState(false);

  const [showEditProfilePopup, setShowEditProfilePopup] =
    useState(false);

  const [activeSection, setActiveSection] =
    useState("profile");

  const [loading, setLoading] = useState(true);

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
    profile_picture: null,
    company_name: "",
    gst_number: "",
    document: "",
    encrypted_aadhaar: "",
    encrypted_pan: "",
    encrypted_bank_account: "",
    bank_ifsc: "",
    bank_holder_name: "",
  });

  const fireToast = (message) => {
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

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);

      try {
        const response = {
          status: true,
          message: "Profile fetched successfully",
          user: {
            id: 16,
            distributor_id: null,
            full_name: "Rahul Kumar",
            email: "rahul.kumar@distributor.com",
            phone: "+919876543210",
            country: "India",
            account_type: "distributor",
            profile_picture: null,
          },
        };

        const user = response.user;
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
          company_name: isDistributor
            ? ""
            : "Tech Solutions Pvt Ltd",
          gst_number: isDistributor
            ? ""
            : "22ABCDE1234F1Z5",
          document: isDistributor ? "" : "PAN Card",
          encrypted_aadhaar: isDistributor
            ? "1234-5678-9012-3456"
            : "",
          encrypted_pan: isDistributor
            ? "ABCDE1234F"
            : "",
          encrypted_bank_account: isDistributor
            ? "XXXXXXXXXX1234"
            : "",
          bank_ifsc: isDistributor
            ? "HDFC0001234"
            : "",
          bank_holder_name: isDistributor
            ? "Rahul Kumar"
            : "",
        });
      } catch (error) {
        console.error(
          "Error fetching profile:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async (updatedData) => {
    console.log("Profile updated:", updatedData);

    setFormData(updatedData);

    fireToast("Profile updated successfully");
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
        icon: Smartphone,
      },
      {
        name: "country",
        label: "Country",
        icon: User,
      },
    ];

    if (formData.account_type === "distributor") {
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
    {
      id: "password",
      label: "Change Password",
      icon: Key,
      description: "Update your password",
    },
    {
      id: "notifications",
      label: "Notification Preferences",
      icon: BellDot,
      description: "Manage your notifications",
    },
  ];

  const handleNavClick = (id) => {
    setActiveSection(id);

    if (id === "password") {
      setShowPasswordModal(true);
    } else if (id === "notifications") {
      setShowNotificationModal(true);
    } else if (id === "profile") {
      setShowEditProfilePopup(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f2e8] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              repeat: Infinity,
              duration: 0.8,
              ease: "linear",
            }}
            className="inline-block rounded-full h-12 w-12 border-4 border-[#171f39] border-t-transparent"
          />

          <motion.p
            animate={{
              opacity: [0.4, 1, 0.4],
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

  return (
    <div className="min-h-screen bg-[#f7f2e8] p-6 rounded-2xl">
      <Toast
        show={toast.show}
        message={toast.message}
      />

      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1.5 text-xs text-gray-500 mb-6"
        >
          <Link
            href="/"
            className="hover:text-[#171f39] transition-colors"
          >
            Home
          </Link>

          <ChevronRight className="w-3 h-3 text-gray-300" />

          <span className="text-gray-800 font-medium">
            Account Settings
          </span>
        </motion.nav>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.08,
            type: "spring",
            stiffness: 200,
            damping: 24,
          }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
        >
          {/* Header */}
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
                whileHover={{ rotate: 12 }}
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
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-bold text-gray-800"
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
                  transition={{ delay: 0.28 }}
                  className="text-gray-500 text-sm mt-0.5"
                >
                  {formData.account_type === "customer"
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
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 bg-[#e1ce92]/25 border border-[#e1ce92]/60 px-4 py-2 rounded-xl relative z-10"
            >
              <Building className="w-4 h-4 text-[#171f39]" />

              <span className="text-gray-700 font-medium text-sm capitalize">
                {formData.account_type}
              </span>
            </motion.div>
          </div>

          {/* Navigation Cards */}
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
                  whileTap={{ scale: 0.99 }}
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
                      whileHover={{ rotate: 8 }}
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
                      {item.id === "profile"
                        ? "Edit →"
                        : item.id === "password"
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

          {/* Profile Information Display */}
          <AnimatePresence mode="wait">
            {activeSection === "profile" && (
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
                transition={{ duration: 0.25 }}
                className="px-8 pb-8"
              >
                {/* Profile Picture */}
                <motion.div
                  initial={{
                    opacity: 0,
                    scale: 0.95,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  transition={{ delay: 0.1 }}
                  className="mb-6 p-6 bg-[#f7f2e8] rounded-xl border border-gray-100 flex items-center gap-6"
                >
                  <motion.div
                    whileHover={{ scale: 1.06 }}
                    className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg bg-gradient-to-br from-[#171f39] to-[#e1ce92]"
                    style={
                      formData.profile_picture
                        ? {
                            backgroundImage: `url(${formData.profile_picture})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }
                        : {}
                    }
                  >
                    {!formData.profile_picture &&
                      (formData.full_name
                        ? formData.full_name
                            .charAt(0)
                            .toUpperCase()
                        : "U")}
                  </motion.div>

                  <div>
                    <h2 className="font-semibold text-gray-800">
                      {formData.full_name || "User"}
                    </h2>

                    <p className="text-sm text-gray-500 capitalize">
                      {formData.account_type}
                    </p>

                    <p className="text-xs text-gray-400 mt-0.5">
                      {formData.email}
                    </p>
                  </div>
                </motion.div>

                {/* Display Fields */}
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {getDisplayFields().map((field) => {
                    const Icon = field.icon;
                    const value =
                      formData[field.name];

                    if (
                      field.name === "account_type"
                    ) {
                      return (
                        <motion.div
                          key={field.name}
                          variants={staggerItem}
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

                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  value === "customer"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-purple-100 text-purple-700"
                                }`}
                              >
                                {value}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    }

                    return (
                      <motion.div
                        key={field.name}
                        variants={staggerItem}
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
                            {value || "Not provided"}
                          </div>

                          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Modals */}
      <PasswordChange
        isOpen={showPasswordModal}
        onClose={() =>
          setShowPasswordModal(false)
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
          setShowNotificationModal(false)
        }
        onSave={(settings) => {
          console.log(
            "Notification settings saved:",
            settings
          );

          fireToast(
            "Notification preferences saved"
          );
        }}
      />

      <EditProfilePopup
        isOpen={showEditProfilePopup}
        onClose={() =>
          setShowEditProfilePopup(false)
        }
        formData={formData}
        setFormData={setFormData}
        onSave={handleSave}
      />
    </div>
  );
};

export default AccountSettings;