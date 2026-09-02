"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Home,
  Building2,
  Phone,
  User,
  Globe,
  X,
  Loader2,
  ChevronRight,
  CreditCard,
  Truck,
  AlertCircle,
  Stamp,
  ChevronDown,
} from "lucide-react";
import {
  useGetAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
} from "@/lib/redux/api/addressApi";
import { useAppDispatch } from "@/lib/redux/hooks";
import { showToast } from "../../lib/slices/toastSlice";

export interface Address {
  id: number;
  user_id: number;
  recipient_name: string;
  contact_number: string;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  state: string;
  postcode: string;
  country: string;
  is_default: boolean;
  is_billing: boolean;
  is_delivery: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  billing_recipient_name?: string;
  billing_contact_number?: string;
  billing_address_line_1?: string;
  billing_address_line_2?: string;
  billing_city?: string;
  billing_state?: string;
  billing_postcode?: string;
  billing_country?: string;
}

export interface AddressFormData {
  recipient_name: string;
  contact_number: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  is_default: boolean;
  is_billing: boolean;
  is_delivery: boolean;
  billing_recipient_name?: string;
  billing_contact_number?: string;
  billing_address_line_1?: string;
  billing_address_line_2?: string;
  billing_city?: string;
  billing_state?: string;
  billing_postcode?: string;
  billing_country?: string;
}

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${checked ? "bg-[#111111]" : "bg-[#DCDCDA]"
        }`}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
        className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm"
        style={{ x: checked ? 20 : 0 }}
      />
    </button>
  );
}

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  addressName: string;
}

function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  addressName,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/35 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 font-sans"
          >
            <div
              className="w-full max-w-md overflow-hidden rounded-[8px] border border-[#E4E4E2] bg-white shadow-[0_18px_60px_rgba(0,0,0,0.14)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#FDF2F2]">
                  <AlertCircle className="h-5 w-5 text-[#B24C4C]" />
                </div>

                <h3 className="mb-1 text-[16px] font-semibold text-[#171717]">
                  Remove this address?
                </h3>
                <p className="text-[12px] text-[#888888]">
                  You&apos;re about to remove
                </p>
                <p className="mb-4 text-[12px] font-medium text-[#171717]">
                  &ldquo;{addressName}&rdquo;
                </p>

                <div className="mb-4 h-px w-full bg-[#E6E6E4]" />

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 rounded-[6px] border border-[#D7D7D5] bg-white px-4 py-2.5 text-[11px] font-medium text-[#555555] transition hover:border-[#BDBDBA] hover:bg-[#FAFAF9]"
                  >
                    Keep it
                  </button>
                  <button
                    type="button"
                    onClick={onConfirm}
                    disabled={isLoading}
                    className="flex flex-1 items-center justify-center gap-2 rounded-[6px] bg-[#B24C4C] px-4 py-2.5 text-[11px] font-semibold text-white transition hover:bg-[#9C3F3F] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Removing...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface AddressFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddressFormData) => Promise<void>;
  initialData?: Address | null;
  isLoading: boolean;
}

function AddressFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}: AddressFormModalProps) {
  const [formData, setFormData] = useState<AddressFormData>({
    recipient_name: "",
    contact_number: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "",
    postcode: "",
    country: "India",
    is_default: false,
    is_billing: true,
    is_delivery: true,
  });

  const [billingAddress, setBillingAddress] = useState({
    recipient_name: "",
    contact_number: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "",
    postcode: "",
    country: "India",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof AddressFormData, string>>>({});
  const [billingErrors, setBillingErrors] = useState<
    Partial<Record<keyof typeof billingAddress, string>>
  >({});

  const showSeparateBillingForm = !formData.is_billing;

  useEffect(() => {
    if (initialData) {
      setFormData({
        recipient_name: initialData.recipient_name || "",
        contact_number: initialData.contact_number || "",
        address_line_1: initialData.address_line_1 || "",
        address_line_2: initialData.address_line_2 || "",
        city: initialData.city || "",
        state: initialData.state || "",
        postcode: initialData.postcode || "",
        country: initialData.country || "India",
        is_default: initialData.is_default === true,
        is_billing: initialData.is_billing === true,
        is_delivery: initialData.is_delivery === true,
      });

      const hasBillingData =
        initialData.billing_recipient_name ||
        initialData.billing_address_line_1 ||
        initialData.billing_city;

      if (hasBillingData) {
        setBillingAddress({
          recipient_name: initialData.billing_recipient_name || "",
          contact_number: initialData.billing_contact_number || "",
          address_line_1: initialData.billing_address_line_1 || "",
          address_line_2: initialData.billing_address_line_2 || "",
          city: initialData.billing_city || "",
          state: initialData.billing_state || "",
          postcode: initialData.billing_postcode || "",
          country: initialData.billing_country || initialData.country || "India",
        });
        setFormData((prev) => ({
          ...prev,
          is_billing: false,
        }));
      } else {
        setBillingAddress({
          recipient_name: initialData.recipient_name || "",
          contact_number: initialData.contact_number || "",
          address_line_1: initialData.address_line_1 || "",
          address_line_2: initialData.address_line_2 || "",
          city: initialData.city || "",
          state: initialData.state || "",
          postcode: initialData.postcode || "",
          country: initialData.country || "India",
        });
        setFormData((prev) => ({
          ...prev,
          is_billing: true,
        }));
      }
    } else {
      setFormData({
        recipient_name: "",
        contact_number: "",
        address_line_1: "",
        address_line_2: "",
        city: "",
        state: "",
        postcode: "",
        country: "India",
        is_default: false,
        is_billing: true,
        is_delivery: true,
      });
      setBillingAddress({
        recipient_name: "",
        contact_number: "",
        address_line_1: "",
        address_line_2: "",
        city: "",
        state: "",
        postcode: "",
        country: "India",
      });
    }
    setErrors({});
    setBillingErrors({});
  }, [initialData, isOpen]);

  const validateMainAddress = () => {
    const newErrors: Partial<Record<keyof AddressFormData, string>> = {};
    if (!formData.recipient_name.trim()) newErrors.recipient_name = "Full name is required";
    if (!formData.contact_number.trim()) newErrors.contact_number = "Phone number is required";
    if (!formData.address_line_1.trim()) newErrors.address_line_1 = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.postcode.trim()) newErrors.postcode = "Postcode is required";
    if (!formData.country.trim()) newErrors.country = "Country is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateBillingAddress = () => {
    const newErrors: Partial<Record<keyof typeof billingAddress, string>> = {};
    if (!billingAddress.recipient_name.trim())
      newErrors.recipient_name = "Billing name is required";
    if (!billingAddress.contact_number.trim())
      newErrors.contact_number = "Billing phone is required";
    if (!billingAddress.address_line_1.trim())
      newErrors.address_line_1 = "Billing address is required";
    if (!billingAddress.city.trim()) newErrors.city = "Billing city is required";
    if (!billingAddress.state.trim()) newErrors.state = "Billing state is required";
    if (!billingAddress.postcode.trim())
      newErrors.postcode = "Billing postcode is required";
    if (!billingAddress.country.trim())
      newErrors.country = "Billing country is required";
    setBillingErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateMainAddress()) return;
    if (!formData.is_billing && !validateBillingAddress()) return;

    const submitData = { ...formData };

    if (formData.is_billing) {
      submitData.billing_recipient_name = formData.recipient_name;
      submitData.billing_contact_number = formData.contact_number;
      submitData.billing_address_line_1 = formData.address_line_1;
      submitData.billing_address_line_2 = formData.address_line_2 || "";
      submitData.billing_city = formData.city;
      submitData.billing_state = formData.state;
      submitData.billing_postcode = formData.postcode;
      submitData.billing_country = formData.country;
    } else {
      submitData.billing_recipient_name = billingAddress.recipient_name;
      submitData.billing_contact_number = billingAddress.contact_number;
      submitData.billing_address_line_1 = billingAddress.address_line_1;
      submitData.billing_address_line_2 = billingAddress.address_line_2;
      submitData.billing_city = billingAddress.city;
      submitData.billing_state = billingAddress.state;
      submitData.billing_postcode = billingAddress.postcode;
      submitData.billing_country = billingAddress.country;
    }

    await onSubmit(submitData);
  };

  const inputClass = (error?: string) =>
    `h-[42px] w-full rounded-[6px] border bg-white px-3.5 text-[12px] text-[#222222] outline-none transition placeholder:text-[#999999] ${error
      ? "border-[#D66A6A] bg-[#FFF9F9] focus:border-[#C94D4D] focus:ring-1 focus:ring-[#C94D4D]/10"
      : "border-[#D7D7D5] hover:border-[#BDBDBA] focus:border-[#999999] focus:ring-1 focus:ring-black/5"
    }`;

  const updateBillingField = (field: keyof typeof billingAddress, value: string) => {
    setBillingAddress((prev) => ({ ...prev, [field]: value }));
    if (billingErrors[field]) {
      setBillingErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/35 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 12 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 font-sans"
          >
            <div
              className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[8px] border border-[#E4E4E2] bg-[#F7F7F6] shadow-[0_18px_60px_rgba(0,0,0,0.14)]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* HEADER */}
              <div className="flex shrink-0 items-center justify-between border-b border-[#E6E6E4] bg-white px-5 py-4">
                <div>
                  <p className="mb-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#888888]">
                    {initialData ? "Editing" : "New entry"}
                  </p>
                  <h2 className="text-[16px] font-medium text-[#171717] sm:text-[18px]">
                    {initialData ? "Edit Address" : "Add New Address"}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#D7D7D5] bg-white text-[#777777] transition hover:border-[#BDBDBA] hover:text-[#111111]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* FORM */}
              <form onSubmit={handleSubmit} className="min-h-0 flex-1 overflow-y-auto">
                <div className="p-5">
                  {/* DELIVERY ADDRESS */}
                  <div className="mb-5">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] bg-[#111111] text-white">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-[14px] font-medium text-[#171717]">
                          Delivery Address
                        </h3>
                        <p className="mt-0.5 text-[10px] text-[#888888]">
                          Where should we deliver your order?
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div className="md:col-span-2">
                        <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.06em] text-[#666666]">
                          Full Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-[#999999]" />
                          <input
                            type="text"
                            value={formData.recipient_name}
                            onChange={(e) =>
                              setFormData({ ...formData, recipient_name: e.target.value })
                            }
                            className={`${inputClass(errors.recipient_name)} pl-10`}
                            placeholder="Enter full name"
                          />
                        </div>
                        {errors.recipient_name && (
                          <p className="mt-1 text-[10px] font-medium text-[#C94D4D]">
                            {errors.recipient_name}
                          </p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.06em] text-[#666666]">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-[#999999]" />
                          <input
                            type="text"
                            value={formData.contact_number}
                            onChange={(e) =>
                              setFormData({ ...formData, contact_number: e.target.value })
                            }
                            className={`${inputClass(errors.contact_number)} pl-10`}
                            placeholder="Enter your phone number"
                          />
                        </div>
                        {errors.contact_number && (
                          <p className="mt-1 text-[10px] font-medium text-[#C94D4D]">
                            {errors.contact_number}
                          </p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.06em] text-[#666666]">
                          Address Line 1
                        </label>
                        <div className="relative">
                          <Home className="absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-[#999999]" />
                          <input
                            type="text"
                            value={formData.address_line_1}
                            onChange={(e) =>
                              setFormData({ ...formData, address_line_1: e.target.value })
                            }
                            className={`${inputClass(errors.address_line_1)} pl-10`}
                            placeholder="Street address"
                          />
                        </div>
                        {errors.address_line_1 && (
                          <p className="mt-1 text-[10px] font-medium text-[#C94D4D]">
                            {errors.address_line_1}
                          </p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.06em] text-[#666666]">
                          Address Line 2
                          <span className="ml-1 font-normal normal-case tracking-normal text-[#999999]">
                            (Optional)
                          </span>
                        </label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-[#999999]" />
                          <input
                            type="text"
                            value={formData.address_line_2}
                            onChange={(e) =>
                              setFormData({ ...formData, address_line_2: e.target.value })
                            }
                            className={`${inputClass()} pl-10`}
                            placeholder="Apartment, suite, unit, building"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.06em] text-[#666666]">
                          City
                        </label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) =>
                            setFormData({ ...formData, city: e.target.value })
                          }
                          className={inputClass(errors.city)}
                          placeholder="Enter city"
                        />
                        {errors.city && (
                          <p className="mt-1 text-[10px] font-medium text-[#C94D4D]">{errors.city}</p>
                        )}
                      </div>

                      <div>
                        <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.06em] text-[#666666]">
                          State
                        </label>
                        <input
                          type="text"
                          value={formData.state}
                          onChange={(e) =>
                            setFormData({ ...formData, state: e.target.value })
                          }
                          className={inputClass(errors.state)}
                          placeholder="Enter state"
                        />
                        {errors.state && (
                          <p className="mt-1 text-[10px] font-medium text-[#C94D4D]">{errors.state}</p>
                        )}
                      </div>

                      <div>
                        <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.06em] text-[#666666]">
                          Postcode
                        </label>
                        <input
                          type="text"
                          value={formData.postcode}
                          onChange={(e) =>
                            setFormData({ ...formData, postcode: e.target.value })
                          }
                          className={inputClass(errors.postcode)}
                          placeholder="Enter postcode"
                        />
                        {errors.postcode && (
                          <p className="mt-1 text-[10px] font-medium text-[#C94D4D]">
                            {errors.postcode}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.06em] text-[#666666]">
                          Country
                        </label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-[#999999]" />
                          <input
                            type="text"
                            value={formData.country}
                            onChange={(e) =>
                              setFormData({ ...formData, country: e.target.value })
                            }
                            className={`${inputClass(errors.country)} pl-10`}
                            placeholder="Enter country"
                          />
                        </div>
                        {errors.country && (
                          <p className="mt-1 text-[10px] font-medium text-[#C94D4D]">{errors.country}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ADDRESS OPTIONS */}
                  <div className="space-y-2.5 border-t border-[#E6E6E4] pt-4">
                    {/* DEFAULT */}
                    <div className="flex items-center justify-between gap-3 rounded-[7px] border border-[#E4E4E2] bg-white p-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] bg-[#F1F1F0] text-[#888888]">
                          <Stamp className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[11px] font-medium text-[#222222]">
                            Set as default address
                          </p>
                          <p className="mt-0.5 text-[9px] text-[#888888]">
                            Use this address automatically at checkout
                          </p>
                        </div>
                      </div>
                      <ToggleSwitch
                        checked={formData.is_default}
                        onChange={(checked) =>
                          setFormData({ ...formData, is_default: checked })
                        }
                      />
                    </div>

                    {/* BILLING */}
                    <div className="overflow-hidden rounded-[7px] border border-[#E4E4E2] bg-white">
                      <div className="flex items-center justify-between gap-3 p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] bg-[#F1F1F0] text-[#888888]">
                            <CreditCard className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-[11px] font-medium text-[#222222]">
                              Use same address for billing
                            </p>
                            <p className="mt-0.5 text-[9px] text-[#888888]">
                              Billing and delivery address are the same
                            </p>
                          </div>
                        </div>
                        <ToggleSwitch
                          checked={formData.is_billing}
                          onChange={(checked) => {
                            setFormData({ ...formData, is_billing: checked });
                            if (checked) setBillingErrors({});
                          }}
                        />
                      </div>

                      {/* SEPARATE BILLING FORM */}
                      <AnimatePresence initial={false}>
                        {showSeparateBillingForm && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="border-t border-[#E6E6E4] bg-[#FAFAF9] p-4">
                              <div className="mb-4 flex items-center gap-2.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-[#111111] text-white">
                                  <CreditCard className="h-3.5 w-3.5" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="text-[12px] font-medium text-[#222222]">
                                    Separate Billing Address
                                  </h4>
                                  <p className="mt-0.5 text-[9px] text-[#888888]">
                                    Enter a different address for billing
                                  </p>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                <div className="md:col-span-2">
                                  <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.06em] text-[#666666]">
                                    Billing Full Name
                                  </label>
                                  <div className="relative">
                                    <User className="absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-[#999999]" />
                                    <input
                                      type="text"
                                      value={billingAddress.recipient_name}
                                      onChange={(e) =>
                                        updateBillingField("recipient_name", e.target.value)
                                      }
                                      className={`${inputClass(
                                        billingErrors.recipient_name
                                      )} pl-10`}
                                      placeholder="Enter billing full name"
                                    />
                                  </div>
                                  {billingErrors.recipient_name && (
                                    <p className="mt-1 text-[10px] font-medium text-[#C94D4D]">
                                      {billingErrors.recipient_name}
                                    </p>
                                  )}
                                </div>

                                <div className="md:col-span-2">
                                  <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.06em] text-[#666666]">
                                    Billing Phone Number
                                  </label>
                                  <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-[#999999]" />
                                    <input
                                      type="text"
                                      value={billingAddress.contact_number}
                                      onChange={(e) =>
                                        updateBillingField("contact_number", e.target.value)
                                      }
                                      className={`${inputClass(
                                        billingErrors.contact_number
                                      )} pl-10`}
                                      placeholder="+91 98765 43210"
                                    />
                                  </div>
                                  {billingErrors.contact_number && (
                                    <p className="mt-1 text-[10px] font-medium text-[#C94D4D]">
                                      {billingErrors.contact_number}
                                    </p>
                                  )}
                                </div>

                                <div className="md:col-span-2">
                                  <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.06em] text-[#666666]">
                                    Billing Address Line 1
                                  </label>
                                  <div className="relative">
                                    <Home className="absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-[#999999]" />
                                    <input
                                      type="text"
                                      value={billingAddress.address_line_1}
                                      onChange={(e) =>
                                        updateBillingField("address_line_1", e.target.value)
                                      }
                                      className={`${inputClass(
                                        billingErrors.address_line_1
                                      )} pl-10`}
                                      placeholder="Street address"
                                    />
                                  </div>
                                  {billingErrors.address_line_1 && (
                                    <p className="mt-1 text-[10px] font-medium text-[#C94D4D]">
                                      {billingErrors.address_line_1}
                                    </p>
                                  )}
                                </div>

                                <div className="md:col-span-2">
                                  <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.06em] text-[#666666]">
                                    Billing Address Line 2
                                    <span className="ml-1 font-normal normal-case tracking-normal text-[#999999]">
                                      (Optional)
                                    </span>
                                  </label>
                                  <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-[#999999]" />
                                    <input
                                      type="text"
                                      value={billingAddress.address_line_2}
                                      onChange={(e) =>
                                        updateBillingField("address_line_2", e.target.value)
                                      }
                                      className={`${inputClass()} pl-10`}
                                      placeholder="Apartment, suite, unit, building"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.06em] text-[#666666]">
                                    Billing City
                                  </label>
                                  <input
                                    type="text"
                                    value={billingAddress.city}
                                    onChange={(e) =>
                                      updateBillingField("city", e.target.value)
                                    }
                                    className={inputClass(billingErrors.city)}
                                    placeholder="Enter city"
                                  />
                                  {billingErrors.city && (
                                    <p className="mt-1 text-[10px] font-medium text-[#C94D4D]">
                                      {billingErrors.city}
                                    </p>
                                  )}
                                </div>

                                <div>
                                  <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.06em] text-[#666666]">
                                    Billing State
                                  </label>
                                  <input
                                    type="text"
                                    value={billingAddress.state}
                                    onChange={(e) =>
                                      updateBillingField("state", e.target.value)
                                    }
                                    className={inputClass(billingErrors.state)}
                                    placeholder="Enter state"
                                  />
                                  {billingErrors.state && (
                                    <p className="mt-1 text-[10px] font-medium text-[#C94D4D]">
                                      {billingErrors.state}
                                    </p>
                                  )}
                                </div>

                                <div>
                                  <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.06em] text-[#666666]">
                                    Billing Postcode
                                  </label>
                                  <input
                                    type="text"
                                    value={billingAddress.postcode}
                                    onChange={(e) =>
                                      updateBillingField("postcode", e.target.value)
                                    }
                                    className={inputClass(billingErrors.postcode)}
                                    placeholder="Enter postcode"
                                  />
                                  {billingErrors.postcode && (
                                    <p className="mt-1 text-[10px] font-medium text-[#C94D4D]">
                                      {billingErrors.postcode}
                                    </p>
                                  )}
                                </div>

                                <div>
                                  <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.06em] text-[#666666]">
                                    Billing Country
                                  </label>
                                  <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-[#999999]" />
                                    <input
                                      type="text"
                                      value={billingAddress.country}
                                      onChange={(e) =>
                                        updateBillingField("country", e.target.value)
                                      }
                                      className={`${inputClass(
                                        billingErrors.country
                                      )} pl-10`}
                                      placeholder="Enter country"
                                    />
                                  </div>
                                  {billingErrors.country && (
                                    <p className="mt-1 text-[10px] font-medium text-[#C94D4D]">
                                      {billingErrors.country}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* FOOTER */}
                <div className="sticky bottom-0 z-[10001] shrink-0 border-t border-[#E6E6E4] bg-white px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={onClose}
                      className="h-[44px] flex-1 rounded-[6px] border border-[#D7D7D5] bg-white px-4 text-[11px] font-medium text-[#555555] transition hover:border-[#BDBDBA] hover:bg-[#FAFAF9]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex h-[44px] flex-1 items-center justify-center gap-2 rounded-[6px] bg-[#111111] px-4 text-[11px] font-semibold text-white transition hover:bg-[#292929] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-3.5 w-3.5" />
                          {initialData ? "Update Address" : "Save Address"}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface AddressComponentProps {
  onAddressClick?: (address: Address) => void;
}

export default function AddressComponent({ onAddressClick }: AddressComponentProps) {
  const dispatch = useAppDispatch();

  const {
    data: addressesData,
    isLoading: isAddressesLoading,
    error: addressesError,
    refetch: refetchAddresses,
  } = useGetAddressesQuery();

  const [createAddress, { isLoading: isCreating }] = useCreateAddressMutation();
  const [updateAddress, { isLoading: isUpdating }] = useUpdateAddressMutation();
  const [deleteAddress, { isLoading: isDeleting }] = useDeleteAddressMutation();
  const [setDefaultAddress, { isLoading: isSettingDefault }] =
    useSetDefaultAddressMutation();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<number | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);

  useEffect(() => {
    if (addressesData?.data) {
      setAddresses(addressesData.data);
    }
  }, [addressesData]);

  const handleCreateAddress = async (data: AddressFormData) => {
    try {
      const createPayload = {
        ...data,
        is_default: data.is_default || false,
        is_billing: data.is_billing !== undefined ? data.is_billing : true,
        is_delivery: data.is_delivery !== undefined ? data.is_delivery : true,
      };

      await createAddress(createPayload).unwrap();
      dispatch(
        showToast({
          message: "Address added successfully!",
          type: "success",
        })
      );
      setIsModalOpen(false);
      refetchAddresses();
    } catch (error: any) {
      console.error("Failed to create address:", error);
      dispatch(
        showToast({
          message: error?.data?.message || error?.message || "Failed to add address",
          type: "error",
        })
      );
      throw error;
    }
  };

  const handleUpdateAddress = async (data: AddressFormData) => {
    if (!editingAddress) {
      console.error("No address being edited");
      return;
    }

    try {
      const updatePayload = {
        id: editingAddress.id,
        data: {
          ...data,
          is_default: data.is_default || false,
          is_billing: data.is_billing !== undefined ? data.is_billing : true,
          is_delivery: data.is_delivery !== undefined ? data.is_delivery : true,
        },
      };
      await updateAddress(updatePayload).unwrap();

      dispatch(
        showToast({
          message: "Address updated successfully!",
          type: "success",
        })
      );
      setIsModalOpen(false);
      setEditingAddress(null);
      refetchAddresses();
    } catch (error: any) {
      console.error("Failed to update address:", error);
      dispatch(
        showToast({
          message: error?.data?.message || error?.message || "Failed to update address",
          type: "error",
        })
      );
      throw error;
    }
  };

  const handleDeleteClick = (address: Address) => {
    setAddressToDelete(address);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!addressToDelete) return;
    setDeletingId(addressToDelete.id);
    try {
      await deleteAddress({
        id: addressToDelete.id,
      }).unwrap();
      dispatch(
        showToast({
          message: "Address deleted successfully!",
          type: "success",
        })
      );
      refetchAddresses();

      setDeleteModalOpen(false);
      setAddressToDelete(null);
    } catch (error: any) {
      console.error("Failed to delete address:", error);
      dispatch(
        showToast({
          message: error?.data?.message || "Failed to delete address",
          type: "error",
        })
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (id: number) => {
    setSettingDefaultId(id);
    try {
      await setDefaultAddress(id).unwrap();
      dispatch(
        showToast({
          message: "Default address updated!",
          type: "success",
        })
      );
      refetchAddresses();
    } catch (error: any) {
      console.error("Failed to set default:", error);
      dispatch(
        showToast({
          message: error?.data?.message || "Failed to set default address",
          type: "error",
        })
      );
    } finally {
      setSettingDefaultId(null);
    }
  };

  const handleEditClick = (address: Address) => {
    setEditingAddress(address);
    setIsModalOpen(true);
  };

  const handleAddressClick = (address: Address) => {
    if (onAddressClick) {
      onAddressClick(address);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.96,
      transition: { duration: 0.2 },
    },
  };

  if (isAddressesLoading) {
    return (
      <div className="flex items-center justify-center py-16 font-sans">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-[#111111]" />
          <span className="text-[12px] text-[#888888]">
            Loading your addresses...
          </span>
        </div>
      </div>
    );
  }

  if (addressesError) {
    return (
      <div className="py-16 text-center font-sans">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#FDF2F2]">
          <AlertCircle className="h-5 w-5 text-[#B24C4C]" />
        </div>
        <h3 className="mb-1.5 text-[16px] font-semibold text-[#171717]">
          Couldn&apos;t load your addresses
        </h3>
        <p className="mb-4 text-[12px] text-[#888888]">
          Please try again in a moment
        </p>
        <button
          onClick={() => refetchAddresses()}
          className="rounded-[6px] bg-[#111111] px-5 py-2.5 text-[11px] font-semibold text-white transition hover:bg-[#292929]"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto font-sans">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center"
        >
          <h2 className="text-[20px] font-semibold text-[#171717]">
            Saved Addresses
          </h2>

          <button
            onClick={() => {
              setEditingAddress(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-[6px] bg-[#111111] px-4 py-2.5 text-[11px] font-semibold text-white transition hover:bg-[#292929]"
          >
            <Plus className="h-3.5 w-3.5" />
            Add New Address
          </button>
        </motion.div>

        {/* ADDRESS LIST */}
        {addresses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[8px] border border-dashed border-[#DCDCDA] bg-white py-16 text-center"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F1F1F0]">
              <MapPin className="h-6 w-6 text-[#888888]" />
            </div>
            <h3 className="mb-1.5 text-[16px] font-semibold text-[#171717]">
              Your address book is empty
            </h3>
            <p className="mx-auto mb-5 max-w-md text-[12px] leading-5 text-[#888888]">
              Add your first address to make checkout faster next time.
            </p>
            <button
              onClick={() => {
                setEditingAddress(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-[6px] bg-[#111111] px-5 py-2.5 text-[11px] font-semibold text-white transition hover:bg-[#292929]"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Address
            </button>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-3.5 md:grid-cols-2"
          >
            <AnimatePresence mode="popLayout">
              {addresses.map((address) => (
                <motion.div
                  key={address.id}
                  variants={itemVariants}
                  layout
                  exit="exit"
                  onClick={() => handleAddressClick(address)}
                  className={`group relative cursor-pointer overflow-hidden rounded-[8px] border bg-white transition ${address.is_default
                      ? "border-[#111111]"
                      : "border-[#E4E4E2] hover:border-[#CFCFCC]"
                    }`}
                >
                  {/* DEFAULT BADGE */}
                  {address.is_default && (
                    <div
                      className="absolute right-3 top-3 rounded-full bg-[#111111] px-2.5 py-1 flex items-center justify-center"
                      title="Default address"
                    >
                      <span className="text-[8px] font-bold uppercase tracking-[0.08em] text-white text-center">
                        Default
                      </span>
                    </div>
                  )}

                  <div className="p-4">
                    <h4 className="mb-1 truncate pr-16 text-[13px] font-semibold text-[#171717]">
                      {address.recipient_name}
                    </h4>

                    <p className="text-[12px] leading-5 text-[#666666]">
                      {address.address_line_1}
                      {address.address_line_2 ? `, ${address.address_line_2}` : ""}
                      <br />
                      {address.city}, {address.state} – {address.postcode}
                      <br />
                      {address.country}
                    </p>

                    <p className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-[#555555]">
                      <Phone className="h-3 w-3" />
                      {address.contact_number}
                    </p>
                  </div>

                  <div className="h-px bg-[#E6E6E4]" />

                  <div className="flex items-center justify-between bg-[#FAFAF9] px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {address.is_billing && (
                        <span className="flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[9px] font-medium text-[#555555]">
                          <CreditCard className="h-2.5 w-2.5" />
                          Billing
                        </span>
                      )}
                      {address.is_delivery && (
                        <span className="flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[9px] font-medium text-[#555555]">
                          <Truck className="h-2.5 w-2.5" />
                          Delivery
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {!address.is_default && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetDefault(address.id);
                          }}
                          disabled={isSettingDefault && settingDefaultId === address.id}
                          className="whitespace-nowrap px-2 py-1 text-[10px] font-semibold text-[#555555] underline underline-offset-2 transition hover:text-[#111111] disabled:opacity-50"
                          title="Set as Default"
                        >
                          {isSettingDefault && settingDefaultId === address.id ? (
                            <Loader2 className="mx-auto h-3 w-3 animate-spin" />
                          ) : (
                            "Set default"
                          )}
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(address);
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[#888888] transition hover:bg-white hover:text-[#111111]"
                        title="Edit Address"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(address);
                        }}
                        disabled={isDeleting && deletingId === address.id}
                        className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[#888888] transition hover:bg-white hover:text-[#B24C4C] disabled:opacity-50"
                        title="Delete Address"
                      >
                        {isDeleting && deletingId === address.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* ADDRESS FORM MODAL */}
      <AddressFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAddress(null);
        }}
        onSubmit={editingAddress ? handleUpdateAddress : handleCreateAddress}
        initialData={editingAddress}
        isLoading={isCreating || isUpdating}
      />

      {/* DELETE CONFIRMATION MODAL */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setAddressToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        addressName={addressToDelete?.recipient_name || ""}
      />
    </>
  );
}