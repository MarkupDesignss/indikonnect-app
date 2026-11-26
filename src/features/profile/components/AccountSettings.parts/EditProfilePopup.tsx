"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, X, Bell, Mail, AlertCircle, Building, CreditCard, FileText, Hash, Pencil, Check, XCircle, Trash2, Camera } from "lucide-react";
import { useUpdateUserProfileMutation } from "@/lib/redux/api/Profile/userApi";
import { modalVariants, overlayVariants, staggerContainer, staggerItem } from "@/features/profile/components/AccountSettings.parts/support";
import { readCaughtMessage } from "@/lib/utils/readCaughtMessage";



export const EditProfilePopup = ({
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

  const ownedPreview = useRef<string | null>(null);
  const clearPreview = () => {
    if (ownedPreview.current) URL.revokeObjectURL(ownedPreview.current);
    ownedPreview.current = null;
  };
  useEffect(() => () => {
    if (ownedPreview.current) URL.revokeObjectURL(ownedPreview.current);
    ownedPreview.current = null;
  }, []);

  const [imagePreview, setImagePreview] =
    useState<string | null>(null);

  const [updateUserProfile, { isLoading }] =
    useUpdateUserProfileMutation();

  useEffect(() => {
    clearPreview();
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

    clearPreview();
    const previewUrl = URL.createObjectURL(file);
    ownedPreview.current = previewUrl;

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
    clearPreview();
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
    } catch (error: unknown) {
      console.error(
        "Update profile error:",
        error
      );

      const apiMessage =
        readCaughtMessage(error, "data", "message") ||
        readCaughtMessage(error, "message") ||
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
