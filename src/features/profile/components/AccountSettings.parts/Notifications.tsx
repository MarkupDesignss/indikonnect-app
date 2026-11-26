"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, BellRing, Mail, Shield, AlertCircle } from "lucide-react";
import { useGetUserNotificationsQuery, useToggleNotificationMutation } from "@/lib/redux/api/Profile/userApi";
import { modalVariants, overlayVariants, staggerContainer, staggerItem } from "@/features/profile/components/AccountSettings.parts/support";
import { readCaughtMessage } from "@/lib/utils/readCaughtMessage";



export const Notifications = ({
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
    } catch (error: unknown) {
      console.error(
        "Notification toggle error:",
        error
      );

      const apiMessage =
        readCaughtMessage(error, "data", "message") ||
        readCaughtMessage(error, "message") ||
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
