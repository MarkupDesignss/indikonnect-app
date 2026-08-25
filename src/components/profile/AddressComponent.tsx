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
      className={`relative shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${checked ? "bg-[#071a41]" : "bg-[#E7DBC0]"
        }`}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
        className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
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
            className="fixed inset-0 bg-[#2B2420]/50 backdrop-blur-sm z-[9999]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="fixed inset-0 flex items-center justify-center z-[10000] p-4"
          >
            <div
              className="bg-white rounded-[20px] shadow-2xl max-w-md w-full overflow-hidden border border-[#E7DBC0]/70"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-7 text-center">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 20 }}
                  className="w-14 h-14 bg-[#FFF5F5] rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <AlertCircle className="w-6 h-6 text-[#B85F59]" />
                </motion.div>

                <motion.h3
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="font-semibold text-xl text-[#2B2420] mb-1.5"
                  style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
                >
                  Remove this address?
                </motion.h3>
                <p className="text-sm text-[#8a7f6e] mb-1" style={{ fontFamily: "Jost, sans-serif" }}>
                  You&apos;re about to remove
                </p>
                <p className="text-sm font-medium text-[#2B2420] mb-5" style={{ fontFamily: "Jost, sans-serif" }}>
                  &ldquo;{addressName}&rdquo;
                </p>

                <div className="h-px w-full bg-[#EFE6D3] mb-5" />

                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2.5 bg-white border border-[#E7DBC0] text-[#6E706C] rounded-full hover:bg-[#FBF6EC] transition-all text-sm font-medium"
                    style={{ fontFamily: "Jost, sans-serif" }}
                  >
                    Keep it
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={onConfirm}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2.5 bg-[#B85F59] text-white rounded-full flex items-center justify-center gap-2 hover:bg-[#071a40] transition-all text-sm font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                    style={{ fontFamily: "Jost, sans-serif" }}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Removing...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </>
                    )}
                  </motion.button>
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

  const inputClass = (error?: string) => `
    w-full px-4 py-2.5 bg-white border rounded-lg
    focus:ring-2 focus:ring-[#C9A227]/20
    focus:border-[#C9A227]
    transition-all outline-none text-[#2B2420] text-sm placeholder:text-[#B7AD9D]
    ${error ? "border-[#B85F59]" : "border-[#E7DBC0]"}
  `;

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
            className="fixed inset-0 bg-[#2B2420]/50 backdrop-blur-sm z-[9999]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="fixed inset-0 flex items-center justify-center z-[10000] p-4"
          >
            <div
              className="bg-white rounded-[20px] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-[#E7DBC0]/70"
              onClick={(e) => e.stopPropagation()}
            >
              {/* HEADER */}
              <div className="shrink-0 px-6 py-4 border-b border-[#EFE6D3] flex items-center justify-between bg-[#071a41]">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.18em] text-[#C9A227] uppercase mb-0.5" style={{ fontFamily: "Jost, sans-serif" }}>
                    {initialData ? "Editing" : "New entry"}
                  </p>
                  <h2 className="text-xl font-semibold text-white" style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}>
                    {initialData ? "Edit Address" : "Add New Address"}
                  </h2>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={onClose}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* FORM */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto min-h-0">
                <div className="p-6">
                  {/* DELIVERY ADDRESS */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-[#071a41] flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-[#C9A227]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[#2B2420]" style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}>
                          Delivery Address
                        </h3>
                        <p className="text-xs text-[#8a7f6e]" style={{ fontFamily: "Jost, sans-serif" }}>
                          Where should we deliver your order?
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-[#6E706C] mb-1.5" style={{ fontFamily: "Jost, sans-serif" }}>
                          Full Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B7AD9D]" />
                          <input
                            type="text"
                            value={formData.recipient_name}
                            onChange={(e) =>
                              setFormData({ ...formData, recipient_name: e.target.value })
                            }
                            className={`${inputClass(errors.recipient_name)} pl-10`}
                            placeholder="Enter full name"
                            style={{ fontFamily: "Jost, sans-serif" }}
                          />
                        </div>
                        {errors.recipient_name && (
                          <p className="text-xs text-[#B85F59] mt-1" style={{ fontFamily: "Jost, sans-serif" }}>
                            {errors.recipient_name}
                          </p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-[#6E706C] mb-1.5" style={{ fontFamily: "Jost, sans-serif" }}>
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B7AD9D]" />
                          <input
                            type="text"
                            value={formData.contact_number}
                            onChange={(e) =>
                              setFormData({ ...formData, contact_number: e.target.value })
                            }
                            className={`${inputClass(errors.contact_number)} pl-10`}
                            placeholder="Enter your phone number"
                            style={{ fontFamily: "Jost, sans-serif" }}
                          />
                        </div>
                        {errors.contact_number && (
                          <p className="text-xs text-[#B85F59] mt-1" style={{ fontFamily: "Jost, sans-serif" }}>
                            {errors.contact_number}
                          </p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-[#6E706C] mb-1.5" style={{ fontFamily: "Jost, sans-serif" }}>
                          Address Line 1
                        </label>
                        <div className="relative">
                          <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B7AD9D]" />
                          <input
                            type="text"
                            value={formData.address_line_1}
                            onChange={(e) =>
                              setFormData({ ...formData, address_line_1: e.target.value })
                            }
                            className={`${inputClass(errors.address_line_1)} pl-10`}
                            placeholder="Street address"
                            style={{ fontFamily: "Jost, sans-serif" }}
                          />
                        </div>
                        {errors.address_line_1 && (
                          <p className="text-xs text-[#B85F59] mt-1" style={{ fontFamily: "Jost, sans-serif" }}>
                            {errors.address_line_1}
                          </p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-[#6E706C] mb-1.5" style={{ fontFamily: "Jost, sans-serif" }}>
                          Address Line 2 (Optional)
                        </label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B7AD9D]" />
                          <input
                            type="text"
                            value={formData.address_line_2}
                            onChange={(e) =>
                              setFormData({ ...formData, address_line_2: e.target.value })
                            }
                            className={`${inputClass()} pl-10`}
                            placeholder="Apartment, suite, unit, building"
                            style={{ fontFamily: "Jost, sans-serif" }}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#6E706C] mb-1.5" style={{ fontFamily: "Jost, sans-serif" }}>
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
                          style={{ fontFamily: "Jost, sans-serif" }}
                        />
                        {errors.city && (
                          <p className="text-xs text-[#B85F59] mt-1" style={{ fontFamily: "Jost, sans-serif" }}>{errors.city}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#6E706C] mb-1.5" style={{ fontFamily: "Jost, sans-serif" }}>
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
                          style={{ fontFamily: "Jost, sans-serif" }}
                        />
                        {errors.state && (
                          <p className="text-xs text-[#B85F59] mt-1" style={{ fontFamily: "Jost, sans-serif" }}>{errors.state}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#6E706C] mb-1.5" style={{ fontFamily: "Jost, sans-serif" }}>
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
                          style={{ fontFamily: "Jost, sans-serif" }}
                        />
                        {errors.postcode && (
                          <p className="text-xs text-[#B85F59] mt-1" style={{ fontFamily: "Jost, sans-serif" }}>
                            {errors.postcode}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#6E706C] mb-1.5" style={{ fontFamily: "Jost, sans-serif" }}>
                          Country
                        </label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B7AD9D]" />
                          <input
                            type="text"
                            value={formData.country}
                            onChange={(e) =>
                              setFormData({ ...formData, country: e.target.value })
                            }
                            className={`${inputClass(errors.country)} pl-10`}
                            placeholder="Enter country"
                            style={{ fontFamily: "Jost, sans-serif" }}
                          />
                        </div>
                        {errors.country && (
                          <p className="text-xs text-[#B85F59] mt-1" style={{ fontFamily: "Jost, sans-serif" }}>{errors.country}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ADDRESS OPTIONS */}
                  <div className="border-t border-[#EFE6D3] pt-5 space-y-3">
                    {/* Default Address */}
                    <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-[#E7DBC0]/70 bg-white">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#FBF6EC] flex items-center justify-center">
                          <Stamp className="w-4 h-4 text-[#C9A227]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#2B2420]" style={{ fontFamily: "Jost, sans-serif" }}>
                            Set as default address
                          </p>
                          <p className="text-xs text-[#8a7f6e]" style={{ fontFamily: "Jost, sans-serif" }}>
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

                    {/* Billing Address */}
                    <div className="rounded-xl border border-[#E7DBC0]/70 overflow-hidden bg-white">
                      <div className="flex items-center justify-between gap-3 p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-[#FFF5F5] flex items-center justify-center">
                            <CreditCard className="w-4 h-4 text-[#B85F59]" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#2B2420]" style={{ fontFamily: "Jost, sans-serif" }}>
                              Use same address for billing
                            </p>
                            <p className="text-xs text-[#8a7f6e]" style={{ fontFamily: "Jost, sans-serif" }}>
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

                      {/* Separate Billing Form */}
                      <AnimatePresence initial={false}>
                        {showSeparateBillingForm && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="border-t border-[#EFE6D3] bg-[#FBF8F2] p-4">
                              <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-[#FFF5F5] flex items-center justify-center">
                                  <CreditCard className="w-4 h-4 text-[#B85F59]" />
                                </div>
                                <div className="flex-1">
                                  <h3 className="text-base font-semibold text-[#2B2420]" style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}>
                                    Separate Billing Address
                                  </h3>
                                  <p className="text-xs text-[#8a7f6e]" style={{ fontFamily: "Jost, sans-serif" }}>
                                    Enter a different address for billing
                                  </p>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                  <label className="block text-sm font-medium text-[#6E706C] mb-1.5" style={{ fontFamily: "Jost, sans-serif" }}>
                                    Billing Full Name
                                  </label>
                                  <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B7AD9D]" />
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
                                      style={{ fontFamily: "Jost, sans-serif" }}
                                    />
                                  </div>
                                  {billingErrors.recipient_name && (
                                    <p className="text-xs text-[#B85F59] mt-1" style={{ fontFamily: "Jost, sans-serif" }}>
                                      {billingErrors.recipient_name}
                                    </p>
                                  )}
                                </div>

                                <div className="md:col-span-2">
                                  <label className="block text-sm font-medium text-[#6E706C] mb-1.5" style={{ fontFamily: "Jost, sans-serif" }}>
                                    Billing Phone Number
                                  </label>
                                  <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B7AD9D]" />
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
                                      style={{ fontFamily: "Jost, sans-serif" }}
                                    />
                                  </div>
                                  {billingErrors.contact_number && (
                                    <p className="text-xs text-[#B85F59] mt-1" style={{ fontFamily: "Jost, sans-serif" }}>
                                      {billingErrors.contact_number}
                                    </p>
                                  )}
                                </div>

                                <div className="md:col-span-2">
                                  <label className="block text-sm font-medium text-[#6E706C] mb-1.5" style={{ fontFamily: "Jost, sans-serif" }}>
                                    Billing Address Line 1
                                  </label>
                                  <div className="relative">
                                    <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B7AD9D]" />
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
                                      style={{ fontFamily: "Jost, sans-serif" }}
                                    />
                                  </div>
                                  {billingErrors.address_line_1 && (
                                    <p className="text-xs text-[#B85F59] mt-1" style={{ fontFamily: "Jost, sans-serif" }}>
                                      {billingErrors.address_line_1}
                                    </p>
                                  )}
                                </div>

                                <div className="md:col-span-2">
                                  <label className="block text-sm font-medium text-[#6E706C] mb-1.5" style={{ fontFamily: "Jost, sans-serif" }}>
                                    Billing Address Line 2 (Optional)
                                  </label>
                                  <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B7AD9D]" />
                                    <input
                                      type="text"
                                      value={billingAddress.address_line_2}
                                      onChange={(e) =>
                                        updateBillingField("address_line_2", e.target.value)
                                      }
                                      className={`${inputClass()} pl-10`}
                                      placeholder="Apartment, suite, unit, building"
                                      style={{ fontFamily: "Jost, sans-serif" }}
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-[#6E706C] mb-1.5" style={{ fontFamily: "Jost, sans-serif" }}>
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
                                    style={{ fontFamily: "Jost, sans-serif" }}
                                  />
                                  {billingErrors.city && (
                                    <p className="text-xs text-[#B85F59] mt-1" style={{ fontFamily: "Jost, sans-serif" }}>
                                      {billingErrors.city}
                                    </p>
                                  )}
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-[#6E706C] mb-1.5" style={{ fontFamily: "Jost, sans-serif" }}>
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
                                    style={{ fontFamily: "Jost, sans-serif" }}
                                  />
                                  {billingErrors.state && (
                                    <p className="text-xs text-[#B85F59] mt-1" style={{ fontFamily: "Jost, sans-serif" }}>
                                      {billingErrors.state}
                                    </p>
                                  )}
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-[#6E706C] mb-1.5" style={{ fontFamily: "Jost, sans-serif" }}>
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
                                    style={{ fontFamily: "Jost, sans-serif" }}
                                  />
                                  {billingErrors.postcode && (
                                    <p className="text-xs text-[#B85F59] mt-1" style={{ fontFamily: "Jost, sans-serif" }}>
                                      {billingErrors.postcode}
                                    </p>
                                  )}
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-[#6E706C] mb-1.5" style={{ fontFamily: "Jost, sans-serif" }}>
                                    Billing Country
                                  </label>
                                  <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B7AD9D]" />
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
                                      style={{ fontFamily: "Jost, sans-serif" }}
                                    />
                                  </div>
                                  {billingErrors.country && (
                                    <p className="text-xs text-[#B85F59] mt-1" style={{ fontFamily: "Jost, sans-serif" }}>
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
                <div className="sticky bottom-0 z-[10001] bg-white border-t border-[#EFE6D3] px-6 py-4 shadow-[0_-8px_20px_-15px_rgba(43,36,32,0.15)]">
                  <div className="flex items-center gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-4 py-3 bg-white border border-[#E7DBC0] text-[#6E706C] rounded-full hover:bg-[#FBF6EC] transition-all"
                      style={{ fontFamily: "Jost, sans-serif" }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 px-4 py-3 bg-[#071a41] text-white rounded-full flex items-center justify-center gap-2 hover:bg-[#071a40] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                      style={{ fontFamily: "Jost, sans-serif" }}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          {initialData ? "Update Address" : "Save Address"}
                        </>
                      )}
                    </motion.button>
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
          message: "Address added successfully! 📍",
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
          message: "Address updated successfully! 📍",
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
          message: "Address deleted successfully! 🗑️",
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
          message: "Default address updated! ✅",
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
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
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
      scale: 0.94,
      transition: { duration: 0.2 },
    },
  };

  if (isAddressesLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-7 h-7 text-[#C9A227] animate-spin" />
          <span className="text-sm text-[#8a7f6e]" style={{ fontFamily: "Jost, sans-serif" }}>
            Loading your addresses...
          </span>
        </div>
      </div>
    );
  }

  if (addressesError) {
    return (
      <div className="text-center py-20">
        <div className="w-14 h-14 bg-[#FFF5F5] rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6 text-[#B85F59]" />
        </div>
        <h3 className="text-lg font-semibold text-[#2B2420] mb-1.5" style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}>
          Couldn&apos;t load your addresses
        </h3>
        <p className="text-sm text-[#8a7f6e] mb-5" style={{ fontFamily: "Jost, sans-serif" }}>
          Please try again in a moment
        </p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => refetchAddresses()}
          className="px-5 py-2.5 bg-[#071a41] text-white rounded-full hover:bg-[#92403F] transition-colors text-sm font-medium"
          style={{ fontFamily: "Jost, sans-serif" }}
        >
          Retry
        </motion.button>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2"
        >
          <div className="flex items-center gap-3">
            <h2
              className="text-[28px] font-semibold text-[#2B2420]"
              style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
            >
              Saved Addresses
            </h2>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setEditingAddress(null);
              setIsModalOpen(true);
            }}
            className="px-5 py-2.5 bg-[#071a41] text-white rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 hover:bg-[#071a40]"
            style={{ fontFamily: "Jost, sans-serif" }}
          >
            <Plus className="w-4 h-4" />
            Add New Address
          </motion.button>
        </motion.div>

        {/* Address List */}
        {addresses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-white rounded-[20px] border border-dashed border-[#E7DBC0]"
          >
            <div className="w-16 h-16 bg-[#FBF6EC] rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-7 h-7 text-[#C9A227]" />
            </div>
            <h3 className="text-xl font-semibold text-[#2B2420] mb-1.5" style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}>
              Your address book is empty
            </h3>
            <p className="text-[#8a7f6e] mb-6 max-w-md mx-auto text-sm" style={{ fontFamily: "Jost, sans-serif" }}>
              Add your first address to make checkout faster next time.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setEditingAddress(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#071a41] text-white rounded-full font-semibold transition-all duration-300 hover:bg-[##071a40]"
              style={{ fontFamily: "Jost, sans-serif" }}
            >
              <Plus className="w-4 h-4" />
              Add Address
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >
            <AnimatePresence mode="popLayout">
              {addresses.map((address) => (
                <motion.div
                  key={address.id}
                  variants={itemVariants}
                  layout
                  exit="exit"
                  whileHover={{ y: -3 }}
                  onClick={() => handleAddressClick(address)}
                  className={`group relative bg-white rounded-[20px] border overflow-hidden shadow-[0_4px_20px_-8px_rgba(43,36,32,0.06)] hover:shadow-[0_12px_40px_-12px_rgba(43,36,32,0.12)] transition-shadow duration-300 cursor-pointer ${address.is_default
                      ? "border-[#C9A227]/50"
                      : "border-[#E7DBC0]/70 hover:border-[#E7DBC0]"
                    }`}
                >
                  {/* Default Badge */}
                  {address.is_default && (
                    <motion.div
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 16 }}
                      className="absolute -top-2 -right-2 w-14 h-14 rounded-full bg-[#071a41] flex flex-col items-center justify-center shadow-md ring-4 ring-white"
                      title="Default address"
                    >
                      <Stamp className="w-4 h-4 text-[#C9A227]" />
                      <span className="text-[7px] font-semibold tracking-wide text-white/90 mt-0.5" style={{ fontFamily: "Jost, sans-serif" }}>
                        DEFAULT
                      </span>
                    </motion.div>
                  )}

                  <div className="p-5">
                    <h4 className="text-lg font-semibold text-[#2B2420] pr-10 mb-1 truncate" style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}>
                      {address.recipient_name}
                    </h4>

                    <p className="text-sm text-[#8a7f6e] leading-relaxed" style={{ fontFamily: "Jost, sans-serif" }}>
                      {address.address_line_1}
                      {address.address_line_2 ? `, ${address.address_line_2}` : ""}
                      <br />
                      {address.city}, {address.state} – {address.postcode}
                      <br />
                      {address.country}
                    </p>

                    <p className="text-xs text-[#C9A227] mt-2.5 flex items-center gap-1.5 font-medium" style={{ fontFamily: "Jost, sans-serif" }}>
                      <Phone className="w-3 h-3" />
                      {address.contact_number}
                    </p>
                  </div>

                  <div className="h-px bg-[#EFE6D3]" />

                  <div className="px-5 py-3.5 flex items-center justify-between bg-[#FBF8F2]">
                    <div className="flex items-center gap-1.5">
                      {address.is_billing && (
                        <span className="text-[10px] font-medium bg-[#FFF5F5] text-[#B85F59] px-2.5 py-1 rounded-full flex items-center gap-1" style={{ fontFamily: "Jost, sans-serif" }}>
                          <CreditCard className="w-2.5 h-2.5" />
                          Billing
                        </span>
                      )}
                      {address.is_delivery && (
                        <span className="text-[10px] font-medium bg-[#FBF6EC] text-[#C9A227] px-2.5 py-1 rounded-full flex items-center gap-1" style={{ fontFamily: "Jost, sans-serif" }}>
                          <Truck className="w-2.5 h-2.5" />
                          Delivery
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {!address.is_default && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetDefault(address.id);
                          }}
                          disabled={isSettingDefault && settingDefaultId === address.id}
                          className="text-[10px] font-semibold text-[#2B2420] hover:text-[#C9A227] transition-colors whitespace-nowrap disabled:opacity-50 px-2 py-1"
                          style={{ fontFamily: "Jost, sans-serif" }}
                          title="Set as Default"
                        >
                          {isSettingDefault && settingDefaultId === address.id ? (
                            <Loader2 className="w-3 h-3 animate-spin mx-auto" />
                          ) : (
                            "Set default"
                          )}
                        </motion.button>
                      )}

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(address);
                        }}
                        className="p-1.5 hover:bg-[#FBF6EC] rounded-lg transition-colors text-[#8a7f6e] hover:text-[#2B2420]"
                        title="Edit Address"
                      >
                        <Edit2 className="w-4 h-4" />
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(address);
                        }}
                        disabled={isDeleting && deletingId === address.id}
                        className="p-1.5 hover:bg-[#FFF5F5] rounded-lg transition-colors text-[#8a7f6e] hover:text-[#B85F59] disabled:opacity-50"
                        title="Delete Address"
                      >
                        {isDeleting && deletingId === address.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Address Form Modal */}
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

      {/* Delete Confirmation Modal */}
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