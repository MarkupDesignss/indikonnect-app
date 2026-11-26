"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Bell, Mail, AlertCircle, ChevronRight as ChevronRightIcon, UserCircle, Key, BellDot, Building, CreditCard, FileText, Hash } from "lucide-react";
import { useGetUserProfileQuery } from "@/lib/redux/api/authApi";
import { Toast, staggerContainer, staggerItem } from "@/features/profile/components/AccountSettings.parts/support";
import { PasswordChange } from "@/features/profile/components/AccountSettings.parts/PasswordChange";
import { Notifications } from "@/features/profile/components/AccountSettings.parts/Notifications";
import { EditProfilePopup } from "@/features/profile/components/AccountSettings.parts/EditProfilePopup";


export const AccountSettings = () => {
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
