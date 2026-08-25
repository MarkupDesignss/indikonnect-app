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

/* ============================================================
   DESIGN TOKENS
   Ink & Brass — a "correspondence" palette: deep ink for
   authority, warm parchment for surface, brass for the one
   accent that matters (the default address, like a wax seal).
   ============================================================ */
const T = {
  ink: "#171B33",
  inkDeep: "#0D0F20",
  brass: "#AD8A3E",
  brassSoft: "#F3E8CE",
  parchment: "#FBF7EE",
  parchmentDeep: "#F4EDDC",
  sand: "#E7DEC5",
  sandDeep: "#D9CDA8",
  ink900Text: "#211E1A",
  textMuted: "#8B7F6C",
  textFaint: "#B2A78F",
  rust: "#A2453A",
  rustSoft: "#FBEFEC",
};

// Types
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

// ============ SMALL TOGGLE SWITCH (used instead of raw checkboxes) ============
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
      className={`relative shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
        checked ? "bg-[#171B33]" : "bg-[#E7DEC5]"
      }`}
      style={{ ["--tw-ring-color" as any]: T.brass }}
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

// ============ DELETE CONFIRMATION MODAL ============
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
            className="fixed inset-0 bg-[#0D0F20]/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div
              className="bg-[#FBF7EE] rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-[#E7DEC5]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-7 text-center">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 20 }}
                  className="w-14 h-14 bg-[#FBEFEC] rounded-full flex items-center justify-center mx-auto mb-4 ring-1 ring-[#A2453A]/15"
                >
                  <AlertCircle className="w-6 h-6 text-[#A2453A]" />
                </motion.div>

                <motion.h3
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="font-serif text-xl text-[#211E1A] mb-1.5"
                >
                  Remove this address?
                </motion.h3>
                <p className="text-sm text-[#8B7F6C] mb-1">
                  You&apos;re about to remove
                </p>
                <p className="text-sm font-medium text-[#211E1A] mb-5">
                  &ldquo;{addressName}&rdquo;
                </p>

                <div className="h-px w-full bg-[repeating-linear-gradient(90deg,#D9CDA8_0,#D9CDA8_6px,transparent_6px,transparent_12px)] mb-5" />

                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2.5 bg-white border border-[#E7DEC5] text-[#5C534A] rounded-lg hover:bg-[#F4EDDC] transition-all text-sm font-medium"
                  >
                    Keep it
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={onConfirm}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2.5 bg-[#A2453A] text-white rounded-lg flex items-center justify-center gap-2 hover:bg-[#8C3A30] transition-all text-sm font-medium disabled:opacity-70 disabled:cursor-not-allowed"
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

// ============ ADDRESS FORM MODAL COMPONENT ============
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
    focus:ring-2 focus:ring-[#AD8A3E]/20
    focus:border-[#AD8A3E]
    transition-all outline-none text-[#211E1A] text-sm placeholder:text-[#B2A78F]
    ${error ? "border-[#A2453A]" : "border-[#E7DEC5]"}
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
            className="fixed inset-0 bg-[#0D0F20]/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div
              className="bg-[#FBF7EE] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-[#E7DEC5]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* HEADER */}
              <div className="shrink-0 px-6 py-4 border-b border-[#E7DEC5] flex items-center justify-between bg-[#171B33]">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.18em] text-[#AD8A3E] uppercase mb-0.5">
                    {initialData ? "Editing" : "New entry"}
                  </p>
                  <h2 className="font-serif text-xl text-white">
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
                      <div className="w-8 h-8 rounded-lg bg-[#171B33] flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-[#AD8A3E]" />
                      </div>
                      <div>
                        <h3 className="font-serif text-lg text-[#211E1A]">
                          Delivery Address
                        </h3>
                        <p className="text-xs text-[#8B7F6C]">
                          Where should we deliver your order?
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-[#5C534A] mb-1.5">
                          Full Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B2A78F]" />
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
                          <p className="text-xs text-[#A2453A] mt-1">
                            {errors.recipient_name}
                          </p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-[#5C534A] mb-1.5">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B2A78F]" />
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
                          <p className="text-xs text-[#A2453A] mt-1">
                            {errors.contact_number}
                          </p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-[#5C534A] mb-1.5">
                          Address Line 1
                        </label>
                        <div className="relative">
                          <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B2A78F]" />
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
                          <p className="text-xs text-[#A2453A] mt-1">
                            {errors.address_line_1}
                          </p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-[#5C534A] mb-1.5">
                          Address Line 2 (Optional)
                        </label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B2A78F]" />
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
                        <label className="block text-sm font-medium text-[#5C534A] mb-1.5">
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
                          <p className="text-xs text-[#A2453A] mt-1">{errors.city}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#5C534A] mb-1.5">
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
                          <p className="text-xs text-[#A2453A] mt-1">{errors.state}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#5C534A] mb-1.5">
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
                          <p className="text-xs text-[#A2453A] mt-1">
                            {errors.postcode}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#5C534A] mb-1.5">
                          Country
                        </label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B2A78F]" />
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
                          <p className="text-xs text-[#A2453A] mt-1">{errors.country}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ADDRESS OPTIONS */}
                  <div className="border-t border-[#E7DEC5] pt-5 space-y-3">
                    {/* Default Address */}
                    <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-[#E7DEC5] bg-white">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#F3E8CE] flex items-center justify-center">
                          <Stamp className="w-4 h-4 text-[#AD8A3E]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#211E1A]">
                            Set as default address
                          </p>
                          <p className="text-xs text-[#8B7F6C]">
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
                    <div className="rounded-xl border border-[#E7DEC5] overflow-hidden bg-white">
                      <div className="flex items-center justify-between gap-3 p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-[#FBEFEC] flex items-center justify-center">
                            <CreditCard className="w-4 h-4 text-[#A2453A]" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#211E1A]">
                              Use same address for billing
                            </p>
                            <p className="text-xs text-[#8B7F6C]">
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
                            <div className="border-t border-[#E7DEC5] bg-[#F4EDDC] p-4">
                              <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-[#FBEFEC] flex items-center justify-center">
                                  <CreditCard className="w-4 h-4 text-[#A2453A]" />
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-serif text-base text-[#211E1A]">
                                    Separate Billing Address
                                  </h3>
                                  <p className="text-xs text-[#8B7F6C]">
                                    Enter a different address for billing
                                  </p>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                  <label className="block text-sm font-medium text-[#5C534A] mb-1.5">
                                    Billing Full Name
                                  </label>
                                  <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B2A78F]" />
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
                                    <p className="text-xs text-[#A2453A] mt-1">
                                      {billingErrors.recipient_name}
                                    </p>
                                  )}
                                </div>

                                <div className="md:col-span-2">
                                  <label className="block text-sm font-medium text-[#5C534A] mb-1.5">
                                    Billing Phone Number
                                  </label>
                                  <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B2A78F]" />
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
                                    <p className="text-xs text-[#A2453A] mt-1">
                                      {billingErrors.contact_number}
                                    </p>
                                  )}
                                </div>

                                <div className="md:col-span-2">
                                  <label className="block text-sm font-medium text-[#5C534A] mb-1.5">
                                    Billing Address Line 1
                                  </label>
                                  <div className="relative">
                                    <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B2A78F]" />
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
                                    <p className="text-xs text-[#A2453A] mt-1">
                                      {billingErrors.address_line_1}
                                    </p>
                                  )}
                                </div>

                                <div className="md:col-span-2">
                                  <label className="block text-sm font-medium text-[#5C534A] mb-1.5">
                                    Billing Address Line 2 (Optional)
                                  </label>
                                  <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B2A78F]" />
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
                                  <label className="block text-sm font-medium text-[#5C534A] mb-1.5">
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
                                    <p className="text-xs text-[#A2453A] mt-1">
                                      {billingErrors.city}
                                    </p>
                                  )}
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-[#5C534A] mb-1.5">
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
                                    <p className="text-xs text-[#A2453A] mt-1">
                                      {billingErrors.state}
                                    </p>
                                  )}
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-[#5C534A] mb-1.5">
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
                                    <p className="text-xs text-[#A2453A] mt-1">
                                      {billingErrors.postcode}
                                    </p>
                                  )}
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-[#5C534A] mb-1.5">
                                    Billing Country
                                  </label>
                                  <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B2A78F]" />
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
                                    <p className="text-xs text-[#A2453A] mt-1">
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
                <div className="sticky bottom-0 z-20 bg-[#FBF7EE] border-t border-[#E7DEC5] px-6 py-4 shadow-[0_-8px_20px_-15px_rgba(23,27,51,0.25)]">
                  <div className="flex items-center gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-4 py-3 bg-white border border-[#E7DEC5] text-[#5C534A] rounded-lg hover:bg-[#F4EDDC] hover:border-[#D9CDA8] transition-all"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02, boxShadow: "0 10px 24px rgba(23,27,51,0.28)" }}
                      whileTap={{ scale: 0.97 }}
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 px-4 py-3 bg-[#171B33] text-white rounded-lg flex items-center justify-center gap-2 hover:bg-[#0D0F20] transition-all duration-200 shadow-lg shadow-[#171B33]/10 disabled:opacity-70 disabled:cursor-not-allowed"
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

// ============ MAIN ADDRESS COMPONENT ============
interface AddressComponentProps {
  onAddressClick?: (address: Address) => void;
}

export default function AddressComponent({ onAddressClick }: AddressComponentProps) {
  const dispatch = useAppDispatch();

  // API hooks
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

  // State
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<number | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);

  // Transform data
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

  // ANIMATION VARIANTS
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

  // LOADING STATE
  if (isAddressesLoading) {
    return (
      <div className="flex items-center justify-center py-20 bg-[#FBF7EE]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-7 h-7 text-[#171B33] animate-spin" />
          <span className="text-sm text-[#8B7F6C]">Loading your addresses...</span>
        </div>
      </div>
    );
  }

  // ERROR STATE
  if (addressesError) {
    return (
      <div className="text-center py-20 bg-[#FBF7EE]">
        <div className="w-14 h-14 bg-[#FBEFEC] rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6 text-[#A2453A]" />
        </div>
        <h3 className="font-serif text-lg text-[#211E1A] mb-1.5">
          Couldn&apos;t load your addresses
        </h3>
        <p className="text-sm text-[#8B7F6C] mb-5">Please try again in a moment</p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => refetchAddresses()}
          className="px-5 py-2.5 bg-[#171B33] text-white rounded-lg hover:bg-[#0D0F20] transition-colors text-sm font-medium"
        >
          Retry
        </motion.button>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto px-4 py-8 bg-[#FBF7EE]">
        {/* Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1.5 text-xs text-[#8B7F6C] mb-6"
        >
          <Link href="/" className="hover:text-[#171B33] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-[#D9CDA8]" />
          <span className="text-[#211E1A] font-medium">Manage Addresses</span>
        </motion.nav>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#171B33] flex items-center justify-center">
              <MapPin className="w-5 h-5 text-[#AD8A3E]" />
            </div>
            <div>
              <p className="text-[10px] font-semibold tracking-[0.18em] text-[#AD8A3E] uppercase mb-0.5">
                Your book of addresses
              </p>
              <h2 className="font-serif text-2xl text-[#211E1A]">Saved Addresses</h2>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 10px 24px rgba(23,27,51,0.25)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setEditingAddress(null);
              setIsModalOpen(true);
            }}
            className="px-5 py-2.5 bg-[#171B33] text-white rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2"
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
            className="text-center py-16 bg-white rounded-2xl border border-dashed border-[#D9CDA8]"
          >
            <div className="w-16 h-16 bg-[#F3E8CE] rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-7 h-7 text-[#AD8A3E]" />
            </div>
            <h3 className="font-serif text-xl text-[#211E1A] mb-1.5">
              Your address book is empty
            </h3>
            <p className="text-[#8B7F6C] mb-6 max-w-md mx-auto text-sm">
              Add your first address to make checkout faster next time.
            </p>
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 10px 24px rgba(23,27,51,0.25)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setEditingAddress(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#171B33] text-white rounded-xl font-semibold transition-all duration-300"
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
                  className={`group relative bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 cursor-pointer ${
                    address.is_default
                      ? "border-[#AD8A3E]/50"
                      : "border-[#E7DEC5] hover:border-[#D9CDA8]"
                  }`}
                >
                  {/* wax-seal default badge */}
                  {address.is_default && (
                    <motion.div
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 16 }}
                      className="absolute -top-2 -right-2 w-14 h-14 rounded-full bg-[#171B33] flex flex-col items-center justify-center shadow-md ring-4 ring-white"
                      title="Default address"
                    >
                      <Stamp className="w-4 h-4 text-[#AD8A3E]" />
                      <span className="text-[7px] font-semibold tracking-wide text-white/90 mt-0.5">
                        DEFAULT
                      </span>
                    </motion.div>
                  )}

                  <div className="p-5">
                    <h4 className="font-serif text-lg text-[#211E1A] pr-10 mb-1 truncate">
                      {address.recipient_name}
                    </h4>

                    <p className="text-sm text-[#8B7F6C] leading-relaxed">
                      {address.address_line_1}
                      {address.address_line_2 ? `, ${address.address_line_2}` : ""}
                      <br />
                      {address.city}, {address.state} – {address.postcode}
                      <br />
                      {address.country}
                    </p>

                    <p className="text-xs text-[#AD8A3E] mt-2.5 flex items-center gap-1.5 font-medium">
                      <Phone className="w-3 h-3" />
                      {address.contact_number}
                    </p>
                  </div>

                  {/* perforated divider — postcard cut line */}
                  <div className="h-0 border-t border-dashed border-[#E7DEC5] relative">
                    <span className="absolute -left-2.5 -top-2.5 w-5 h-5 rounded-full bg-[#FBF7EE] border border-[#E7DEC5]" />
                    <span className="absolute -right-2.5 -top-2.5 w-5 h-5 rounded-full bg-[#FBF7EE] border border-[#E7DEC5]" />
                  </div>

                  <div className="px-5 py-3.5 flex items-center justify-between bg-[#FBF7EE]">
                    <div className="flex items-center gap-1.5">
                      {address.is_billing && (
                        <span className="text-[10px] font-medium bg-[#FBEFEC] text-[#A2453A] px-2.5 py-1 rounded-full flex items-center gap-1">
                          <CreditCard className="w-2.5 h-2.5" />
                          Billing
                        </span>
                      )}
                      {address.is_delivery && (
                        <span className="text-[10px] font-medium bg-[#F3E8CE] text-[#8A6C24] px-2.5 py-1 rounded-full flex items-center gap-1">
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
                          className="text-[10px] font-semibold text-[#171B33] hover:text-[#AD8A3E] transition-colors whitespace-nowrap disabled:opacity-50 px-2 py-1"
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
                        className="p-1.5 hover:bg-[#F4EDDC] rounded-lg transition-colors text-[#8B7F6C] hover:text-[#211E1A]"
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
                        className="p-1.5 hover:bg-[#FBEFEC] rounded-lg transition-colors text-[#8B7F6C] hover:text-[#A2453A] disabled:opacity-50"
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