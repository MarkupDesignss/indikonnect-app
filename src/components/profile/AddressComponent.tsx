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
  ChevronUp,
  CreditCard,
  ChevronRight,
  AlertCircle,
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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
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
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 text-center">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 20 }}
                  className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <AlertCircle className="w-8 h-8 text-[#92403F]" />
                </motion.div>

                <motion.h3
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl font-bold text-[#2B2420] mb-2"
                >
                  Delete Address?
                </motion.h3>
                <p className="text-sm text-[#8a7f6e] mb-1">
                  Are you sure you want to delete this address?
                </p>
                <p className="text-sm font-medium text-[#2B2420] mb-4">
                  &ldquo;{addressName}&rdquo;
                </p>
                <p className="text-xs text-[#a89c86] mb-6">
                  ⚠️ This action cannot be undone
                </p>

                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2.5 bg-white border border-[#E7DBC0] text-[#5C534A] rounded-lg hover:bg-[#F1E9D9] transition-all text-sm font-medium"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={onConfirm}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#92403F] to-[#7a3635] text-white rounded-lg flex items-center justify-center gap-2 hover:shadow-lg transition-all text-sm font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Delete
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
    focus:ring-2 focus:ring-[#171f39]/15
    focus:border-[#171f39]
    transition-all outline-none text-black text-sm
    ${error ? "border-[#92403F]" : "border-[#E7DBC0]"}
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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
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
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* HEADER */}
              <div className="shrink-0 px-6 py-4 border-b border-[#EFE6D3] flex items-center justify-between bg-white">
                <div>
                  <h2 className="font-serif text-xl text-[#2B2420]">
                    {initialData ? "Edit Address" : "Add New Address"}
                  </h2>
                  <p className="text-xs text-[#8a7f6e] mt-1">
                    Enter your delivery address details
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={onClose}
                  className="p-1.5 hover:bg-[#F1E9D9] rounded-lg text-[#a89c86] hover:text-[#2B2420] transition-colors"
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
                      <motion.div
                        initial={{ scale: 0, rotate: -30 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 18 }}
                        className="w-8 h-8 rounded-lg bg-[#171f39]/10 flex items-center justify-center"
                      >
                        <MapPin className="w-4 h-4 text-[#171f39]" />
                      </motion.div>
                      <div>
                        <h3 className="font-serif text-lg text-[#2B2420]">
                          Delivery Address
                        </h3>
                        <p className="text-xs text-[#8a7f6e]">
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
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a89c86]" />
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
                          <p className="text-xs text-[#92403F] mt-1">
                            {errors.recipient_name}
                          </p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-[#5C534A] mb-1.5">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a89c86]" />
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
                          <p className="text-xs text-[#92403F] mt-1">
                            {errors.contact_number}
                          </p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-[#5C534A] mb-1.5">
                          Address Line 1
                        </label>
                        <div className="relative">
                          <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a89c86]" />
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
                          <p className="text-xs text-[#92403F] mt-1">
                            {errors.address_line_1}
                          </p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-[#5C534A] mb-1.5">
                          Address Line 2 (Optional)
                        </label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a89c86]" />
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
                          <p className="text-xs text-[#92403F] mt-1">{errors.city}</p>
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
                          <p className="text-xs text-[#92403F] mt-1">{errors.state}</p>
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
                          <p className="text-xs text-[#92403F] mt-1">
                            {errors.postcode}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#5C534A] mb-1.5">
                          Country
                        </label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a89c86]" />
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
                          <p className="text-xs text-[#92403F] mt-1">{errors.country}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ADDRESS OPTIONS */}
                  <div className="border-t border-[#EFE6D3] pt-5 space-y-3">
                    {/* Default Address */}
                    <motion.label
                      whileHover={{ scale: 1.005 }}
                      className="flex items-center justify-between gap-3 cursor-pointer p-3 rounded-xl border border-[#E7DBC0] hover:bg-[#FBF6EC] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#e1ce92]/25 flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-[#171f39]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#2B2420]">
                            Set as default address
                          </p>
                          <p className="text-xs text-[#8a7f6e]">
                            Use this address by default
                          </p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.is_default}
                        onChange={(e) =>
                          setFormData({ ...formData, is_default: e.target.checked })
                        }
                        className="w-4 h-4 rounded border-[#D9CFBA] text-[#171f39] focus:ring-[#171f39]/20 focus:ring-2"
                      />
                    </motion.label>

                    {/* Billing Address */}
                    <div className="rounded-xl border border-[#E7DBC0] overflow-hidden">
                      <motion.label
                        whileHover={{ backgroundColor: "#FBF6EC" }}
                        className="flex items-center justify-between gap-3 cursor-pointer p-3 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-[#92403F]/10 flex items-center justify-center">
                            <CreditCard className="w-4 h-4 text-[#92403F]" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#2B2420]">
                              Use same address for billing
                            </p>
                            <p className="text-xs text-[#8a7f6e]">
                              Billing and delivery address are the same
                            </p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={formData.is_billing}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setFormData({ ...formData, is_billing: checked });
                            if (checked) setBillingErrors({});
                          }}
                          className="w-4 h-4 rounded border-[#D9CFBA] text-[#171f39] focus:ring-[#171f39]/20 focus:ring-2"
                        />
                      </motion.label>

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
                            <div className="border-t border-[#EFE6D3] bg-[#FBF6EC] p-4">
                              <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-[#92403F]/10 flex items-center justify-center">
                                  <CreditCard className="w-4 h-4 text-[#92403F]" />
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-serif text-base text-[#2B2420]">
                                    Separate Billing Address
                                  </h3>
                                  <p className="text-xs text-[#8a7f6e]">
                                    Enter a different address for billing
                                  </p>
                                </div>
                                <ChevronUp className="w-4 h-4 text-[#8a7f6e]" />
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                  <label className="block text-sm font-medium text-[#5C534A] mb-1.5">
                                    Billing Full Name
                                  </label>
                                  <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a89c86]" />
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
                                    <p className="text-xs text-[#92403F] mt-1">
                                      {billingErrors.recipient_name}
                                    </p>
                                  )}
                                </div>

                                <div className="md:col-span-2">
                                  <label className="block text-sm font-medium text-[#5C534A] mb-1.5">
                                    Billing Phone Number
                                  </label>
                                  <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a89c86]" />
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
                                    <p className="text-xs text-[#92403F] mt-1">
                                      {billingErrors.contact_number}
                                    </p>
                                  )}
                                </div>

                                <div className="md:col-span-2">
                                  <label className="block text-sm font-medium text-[#5C534A] mb-1.5">
                                    Billing Address Line 1
                                  </label>
                                  <div className="relative">
                                    <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a89c86]" />
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
                                    <p className="text-xs text-[#92403F] mt-1">
                                      {billingErrors.address_line_1}
                                    </p>
                                  )}
                                </div>

                                <div className="md:col-span-2">
                                  <label className="block text-sm font-medium text-[#5C534A] mb-1.5">
                                    Billing Address Line 2 (Optional)
                                  </label>
                                  <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a89c86]" />
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
                                    <p className="text-xs text-[#92403F] mt-1">
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
                                    <p className="text-xs text-[#92403F] mt-1">
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
                                    <p className="text-xs text-[#92403F] mt-1">
                                      {billingErrors.postcode}
                                    </p>
                                  )}
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-[#5C534A] mb-1.5">
                                    Billing Country
                                  </label>
                                  <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a89c86]" />
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
                                    <p className="text-xs text-[#92403F] mt-1">
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
                <div className="sticky bottom-0 z-20 bg-white border-t border-[#EFE6D3] px-6 py-4 shadow-[0_-8px_20px_-15px_rgba(43,36,32,0.25)]">
                  <div className="flex items-center gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-4 py-3 bg-white border border-[#E7DBC0] text-[#5C534A] rounded-lg hover:bg-[#F1E9D9] hover:border-[#D9CFBA] transition-all"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02, boxShadow: "0 10px 24px rgba(23,31,57,0.28)" }}
                      whileTap={{ scale: 0.97 }}
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-[#171f39] to-[#0e1428] text-white rounded-lg flex items-center justify-center gap-2 hover:from-[#92403F] hover:to-[#7a3635] transition-all duration-200 shadow-lg shadow-[#171f39]/10 disabled:opacity-70 disabled:cursor-not-allowed"
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
      // ✅ Ensure data is properly structured
      const createPayload = {
        ...data,
        is_default: data.is_default || false,
        is_billing: data.is_billing !== undefined ? data.is_billing : true,
        is_delivery: data.is_delivery !== undefined ? data.is_delivery : true,
      };

      console.log("Creating address with payload:", createPayload);

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
      // ✅ Ensure data is properly structured
      const updatePayload = {
        id: editingAddress.id,
        data: {
          ...data,
          // Ensure boolean values are properly set
          is_default: data.is_default || false,
          is_billing: data.is_billing !== undefined ? data.is_billing : true,
          is_delivery: data.is_delivery !== undefined ? data.is_delivery : true,
        },
      };
      const response = await updateAddress(updatePayload).unwrap();

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

      // ✅ Close the modal
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
  // ============================================
  // SET DEFAULT ADDRESS
  // ============================================
  const handleSetDefault = async (id: number) => {
    setSettingDefaultId(id);
    try {
      // ✅ Set default with ID
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

  // ============================================
  // HANDLERS
  // ============================================
  const handleEditClick = (address: Address) => {
    setEditingAddress(address);
    setIsModalOpen(true);
  };

  const handleAddressClick = (address: Address) => {
    if (onAddressClick) {
      onAddressClick(address);
    }
  };

  // ============================================
  // ANIMATION VARIANTS
  // ============================================
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

  // ============================================
  // LOADING STATE
  // ============================================
  if (isAddressesLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#171f39] animate-spin" />
          <span className="text-sm text-gray-400">Loading addresses...</span>
        </div>
      </div>
    );
  }

  // ============================================
  // ERROR STATE
  // ============================================
  if (addressesError) {
    return (
      <div className="text-center py-16">
        <div className="text-red-500 text-4xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Failed to load addresses
        </h3>
        <p className="text-gray-400 mb-4">Please try refreshing the page</p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => refetchAddresses()}
          className="px-4 py-2 bg-[#171f39] text-white rounded-lg hover:bg-[#0e1428] transition-colors text-sm"
        >
          Retry
        </motion.button>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1.5 text-xs text-gray-500 mb-6"
        >
          <Link href="/" className="hover:text-[#171f39] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-gray-300" />
          <span className="text-gray-800 font-medium">Manage Addresses</span>
        </motion.nav>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6"
        >
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 18 }}
              className="w-10 h-10 rounded-xl bg-[#171f39]/10 flex items-center justify-center"
            >
              <MapPin className="w-5 h-5 text-[#171f39]" />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Saved Addresses</h2>
              <p className="text-sm text-gray-400">
                {addresses.length} {addresses.length === 1 ? "address" : "addresses"} saved
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 10px 24px rgba(23,31,57,0.25)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setEditingAddress(null);
              setIsModalOpen(true);
            }}
            className="px-5 py-2.5 bg-gradient-to-r from-[#171f39] to-[#0e1428] text-white rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2"
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
            className="text-center py-16 bg-white rounded-2xl border border-[#E7DBC0]/40"
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 220, damping: 18 }}
              className="w-24 h-24 bg-[#171f39]/10 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <MapPin className="w-12 h-12 text-[#171f39]" />
            </motion.div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No addresses saved
            </h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Add your first address to make checkout faster and easier.
            </p>
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 10px 24px rgba(23,31,57,0.25)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setEditingAddress(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#171f39] to-[#0e1428] text-white rounded-xl font-semibold transition-all duration-300"
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
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <AnimatePresence mode="popLayout">
              {addresses.map((address) => (
                <motion.div
                  key={address.id}
                  variants={itemVariants}
                  layout
                  exit="exit"
                  whileHover={{ y: -3 }}
                  className={`group bg-white rounded-xl border p-5 shadow-sm hover:shadow-lg transition-shadow duration-300 cursor-pointer ${
                    address.is_default
                      ? "border-[#171f39] bg-gradient-to-br from-[#FBF6EC] to-white"
                      : "border-[#E7DBC0] hover:border-[#171f39]/50"
                  }`}
                  onClick={() => handleAddressClick(address)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <h4 className="font-semibold text-[#2B2420] text-base truncate">
                          {address.recipient_name}
                        </h4>
                        {address.is_default && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 16 }}
                            className="text-[10px] font-medium bg-[#171f39] text-white px-2.5 py-0.5 rounded-full whitespace-nowrap flex items-center gap-1"
                          >
                            <CheckCircle className="w-2.5 h-2.5" />
                            Default
                          </motion.span>
                        )}
                      </div>
                      <p className="text-sm text-[#8a7f6e] truncate">
                        {address.address_line_1}
                      </p>
                      {address.address_line_2 && (
                        <p className="text-sm text-[#8a7f6e] truncate">
                          {address.address_line_2}
                        </p>
                      )}
                      <p className="text-sm text-[#8a7f6e] truncate">
                        {address.city}, {address.state} - {address.postcode}
                      </p>
                      <p className="text-sm text-[#8a7f6e] truncate">
                        {address.country}
                      </p>
                      <p className="text-xs text-[#8a7f6e] mt-1.5 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {address.contact_number}
                      </p>
                      <div className="flex items-center gap-2 mt-2.5">
                        {address.is_billing && (
                          <span className="text-[9px] font-medium bg-[#92403F]/10 text-[#92403F] px-2.5 py-0.5 rounded-full">
                            Billing
                          </span>
                        )}
                        {address.is_delivery && (
                          <span className="text-[9px] font-medium bg-[#e1ce92]/30 text-[#171f39] px-2.5 py-0.5 rounded-full">
                            Delivery
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-1 ml-3">
                      {/* Edit Button */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(address);
                        }}
                        className="p-1.5 hover:bg-[#F1E9D9] rounded-lg transition-colors text-[#8a7f6e] hover:text-[#2B2420]"
                        title="Edit Address"
                      >
                        <Edit2 className="w-4 h-4" />
                      </motion.button>

                      {/* Delete Button */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(address);
                        }}
                        disabled={isDeleting && deletingId === address.id}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-[#8a7f6e] hover:text-red-500 disabled:opacity-50"
                        title="Delete Address"
                      >
                        {isDeleting && deletingId === address.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </motion.button>

                      {/* Set Default Button */}
                      {!address.is_default && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetDefault(address.id);
                          }}
                          disabled={isSettingDefault && settingDefaultId === address.id}
                          className="text-[9px] font-medium text-[#171f39] hover:text-[#0e1428] transition-colors whitespace-nowrap disabled:opacity-50"
                          title="Set as Default"
                        >
                          {isSettingDefault && settingDefaultId === address.id ? (
                            <Loader2 className="w-3 h-3 animate-spin mx-auto" />
                          ) : (
                            "Set Default"
                          )}
                        </motion.button>
                      )}
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