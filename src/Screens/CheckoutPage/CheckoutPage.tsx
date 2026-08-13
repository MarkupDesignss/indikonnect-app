"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Truck,
  Zap,
  ShoppingBag,
  ArrowLeft,
  ChevronRight,
  MapPin,
  CreditCard,
  X,
  CheckCircle2,
  Phone,
  Check,
  Edit2,
  Trash2,
  AlertCircle,
  Loader2,
  Star,
  Plus,
  ChevronDown,
  ChevronUp,
  Heart,
  Award,
  Clock,
  Package,
  Leaf,
  Crown,
  Sparkles,
  Gem,
  Gift,
  Coins,
  Wallet,
  Building2,
  Home,
  Users,
  BadgeCheck,
  Globe,
  Mail,
  MessageCircle,
  Headphones,
  BarChart3,
  Layers,
  Bookmark,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { showToast } from "@/lib/slices/toastSlice";

import {
  useGetAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
} from "@/lib/redux/api/addressApi";

import Header from "@/components/common/Header";
import Footer from "@/components/Footer/Footer";
import BannerImage from "../../../public/indiekonnect-web/images/banner.png";
import AddressFormModal from "./AddressFormModal";
import { useGetShippingMethodsQuery } from "@/lib/redux/api/shippingApi";
import { useGetCheckoutSummaryQuery, usePlaceOrderMutation } from "@/lib/redux/api/checkoutApi";
import Razorpay from "../../../public/indiekonnect-web/images/rozarpay.jpeg";

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

interface UpdateAddressRequest extends AddressFormData {
  id?: number;
}

interface DeleteAddressRequest {
  id: number;
}

interface CheckoutSummaryData {
  subtotal: number;
  coupon_discount: number;
  coupon?: {
    code: string;
    title: string;
    type: string;
    value: string;
    discount_amount: number;
  } | null;
  subtotal_after_discount: number;
  product_tax_breakdown?: Record<
    string,
    {
      product_id: number;
      product_name: string;
      product_code: string;
      quantity: number;
      unit_price: number;
      tax_category: string;
      tax_rate: string;
      taxable_value: number;
      tax_amount: number;
      line_total_after_tax: number;
      primary_image?: string;
      images?: {
        id: number;
        image: string;
        image_url: string;
        is_primary: boolean;
        sort_order: number;
      }[];
    }
  >;
  total_tax: number;
  shipping_cost: number;
  shipping_method?: any;
  subtotal_after_discount_and_tax: number;
  coin_balance: number;
  max_coins_redeemable: number;
  coins_used: number;
  amount_redeemed: number;
  grand_total: number;
  items: {
    product_id: number;
    product_name: string;
    product_code: string;
    quantity: number;
    unit_price: number;
    tax_category: string;
    tax_rate: string;
    taxable_value: number;
    cgst: number;
    sgst: number;
    igst: number;
    total_tax: number;
    line_total: number;
    primary_image?: string;
    images?: {
      id: number;
      image: string;
      image_url: string;
      is_primary: boolean;
      sort_order: number;
    }[];
  }[];
  summary: {
    subtotal: number;
    less_coupon: number;
    net_subtotal: number;
    product_gst_18: number;
    product_other_tax: number;
    total_tax: number;
    plus_shipping: number;
    less_coins: number;
    grand_total: number;
  };
  tax_breakdown?: any[];
  delivery_address?: {
    id: number;
    full_address: string;
    state: string;
  };
}

interface OrderSummaryProps {
  summaryData?: CheckoutSummaryData;
  isLoading: boolean;
  isFetching: boolean;
  selectedDeliveryAddress?: Address | null;
  selectedShippingMethod?: any;
  couponCode?: string | null;
  coinsRedeemed?: number;
}

interface AddressCardProps {
  address: Address;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: (data: DeleteAddressRequest) => Promise<void>;
  onSetDefault: () => void;
  isDefault: boolean;
}

function AddressCard({
  address,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onSetDefault,
  isDefault,
}: AddressCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete({ id: address.id });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ y: -2, scale: 1.002 }}
      transition={{ duration: 0.2 }}
      onClick={onSelect}
      className={`
        relative bg-gradient-to-br from-white to-[#FDFBF7] rounded-xl border-2
        transition-all duration-300 p-4 cursor-pointer
        ${isSelected
          ? "border-[#C9A227] shadow-[0_8px_30px_-4px_rgba(201,162,39,0.3)] shadow-[#C9A227]/20"
          : "border-[#E7DBC0] hover:border-[#C9A227]/40 hover:shadow-md hover:shadow-[#C9A227]/10"
        }
      `}
    >
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2.5 -right-2.5 w-7 h-7 bg-gradient-to-r from-[#C9A227] to-[#E5C84A] rounded-full flex items-center justify-center shadow-lg shadow-[#C9A227]/30 z-10"
        >
          <Check className="w-4 h-4 text-white" strokeWidth={3} />
        </motion.div>
      )}

      {isDefault && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-1 -left-1 bg-gradient-to-r from-[#C9A227] to-[#E5C84A] text-white text-[9px] font-bold px-2.5 py-0.5 rounded-br-lg rounded-tl-lg shadow-sm"
        >
          DEFAULT
        </motion.div>
      )}

      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className={`
              w-9 h-9 rounded-xl flex items-center justify-center
              ${isSelected
                ? "bg-gradient-to-r from-[#C9A227]/20 to-[#E5C84A]/20 text-[#C9A227]"
                : "bg-gradient-to-br from-[#FBF6EC] to-[#F5EDE0] text-[#8a7f6e]"
              }
              transition-all duration-300
            `}
          >
            <MapPin className="w-4.5 h-4.5" />
          </motion.div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-medium text-[#2B2420] text-sm flex items-center gap-1.5">
              {address.recipient_name}
              {isDefault && (
                <Star className="w-3.5 h-3.5 fill-[#C9A227] text-[#C9A227] animate-pulse" />
              )}
            </span>
          </div>

          <div className="space-y-0.5">
            <p className="text-xs text-[#5C534A]">
              {address.address_line_1}
              {address.address_line_2 && `, ${address.address_line_2}`}
            </p>
            <p className="text-xs text-[#8a7f6e] flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              {address.city}, {address.state} {address.postcode}
            </p>
            <p className="text-xs text-[#8a7f6e] flex items-center gap-1">
              <Phone className="w-3 h-3" />
              {address.contact_number}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-1.5 mt-3 pt-2.5 border-t border-[#EFE6D3]">
        {!isDefault && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              onSetDefault();
            }}
            className="text-[10px] font-medium text-[#5C534A] hover:text-[#C9A227] transition-all px-2.5 py-1 rounded-lg hover:bg-gradient-to-r hover:from-[#FBF6EC] hover:to-[#F5EDE0] flex items-center gap-1.5"
          >
            <Star className="w-3 h-3" />
            Default
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="text-[10px] font-medium text-[#5C534A] hover:text-[#2B2420] transition-all px-2.5 py-1 rounded-lg hover:bg-gradient-to-r hover:from-[#FBF6EC] hover:to-[#F5EDE0] flex items-center gap-1.5"
        >
          <Edit2 className="w-3 h-3" />
          Edit
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            setShowDeleteConfirm(true);
          }}
          className="text-[10px] font-medium text-[#a89c86] hover:text-[#92403F] transition-all px-2.5 py-1 rounded-lg hover:bg-gradient-to-r hover:from-red-50/60 hover:to-red-50/30 flex items-center gap-1.5"
        >
          <Trash2 className="w-3 h-3" />
          Delete
        </motion.button>
      </div>

      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, scale: 1, backdropFilter: "blur(4px)" }}
            exit={{ opacity: 0, scale: 0.92, backdropFilter: "blur(0px)" }}
            className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center p-4 z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                <AlertCircle className="w-10 h-10 text-[#92403F] mx-auto mb-2" />
              </motion.div>
              <p className="text-sm font-bold text-[#2B2420]">Delete Address?</p>
              <p className="text-xs text-[#8a7f6e] mt-0.5">This action cannot be undone</p>
              <div className="flex items-center gap-2 mt-3 justify-center">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-1.5 text-xs font-medium bg-white text-[#2B2420] border border-[#E7DBC0] rounded-lg hover:bg-[#FBF6EC] transition-all shadow-sm"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-1.5 text-xs font-medium bg-gradient-to-r from-[#92403F] to-[#7a3635] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-1.5 disabled:opacity-60"
                >
                  {isDeleting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  Delete
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function OrderSummary({
  summaryData,
  isLoading,
  isFetching,
  selectedDeliveryAddress,
  selectedShippingMethod,
  couponCode,
  coinsRedeemed,
}: OrderSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const formatPrice = (value: number | string | undefined) => {
    const amount = Number(value || 0);
    return `₹${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  if (isLoading || isFetching) {
    return (
      <div className="bg-gradient-to-br from-white to-[#FDFBF7] border border-[#E7DBC0] rounded-2xl overflow-hidden shadow-md">
        <div className="px-5 py-4 border-b border-[#F0E9D8] bg-gradient-to-r from-[#FBF6EC] to-transparent">
          <h2 className="font-serif text-lg text-[#2B2420] flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#C9A227]" />
            Order Summary
          </h2>
        </div>
        <div className="p-8 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="w-8 h-8 text-[#C9A227]" />
          </motion.div>
        </div>
      </div>
    );
  }

  if (!summaryData) {
    return (
      <div className="bg-gradient-to-br from-white to-[#FDFBF7] border border-[#E7DBC0] rounded-2xl overflow-hidden shadow-md">
        <div className="px-5 py-4 border-b border-[#F0E9D8] bg-gradient-to-r from-[#FBF6EC] to-transparent">
          <h2 className="font-serif text-lg text-[#2B2420] flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#C9A227]" />
            Order Summary
          </h2>
        </div>
        <div className="p-6 text-center">
          <Package className="w-12 h-12 text-[#D9CFBA] mx-auto mb-3" />
          <p className="text-sm text-[#5C534A] font-medium">No items in order</p>
          <p className="text-xs text-[#8a7f6e] mt-1">
            Please select an address to view your order summary.
          </p>
        </div>
      </div>
    );
  }

  const summary = summaryData.summary;
  const items = summaryData.items || [];
  const taxBreakdown = summaryData.product_tax_breakdown || [];

  return (
    <div className="bg-gradient-to-br from-white to-[#FDFBF7] border border-[#E7DBC0] rounded-2xl overflow-hidden shadow-md">
      <div
        className="px-5 py-4 border-b border-[#F0E9D8] bg-gradient-to-r from-[#FBF6EC] to-transparent flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2 className="font-serif text-lg text-[#2B2420] flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#C9A227]" />
          Order Summary
        </h2>
        <div className="flex items-center gap-3">
          {isFetching && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="w-4 h-4 text-[#C9A227]" />
            </motion.div>
          )}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="text-[#8a7f6e] hover:text-[#2B2420] transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </motion.button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-5 space-y-5">
              {/* Products */}
              <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar">
                {items.map((item, index) => {
                  const primaryImage =
                    item.primary_image ||
                    item.images?.find((image) => image.is_primary)?.image_url ||
                    item.images?.[0]?.image_url;

                  return (
                    <motion.div
                      key={item.product_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start gap-3 pb-4 border-b border-[#EFE6D3] last:border-0"
                    >
                      <div className="relative w-16 h-16 flex-shrink-0 bg-gradient-to-br from-[#FBF6EC] to-[#F5EDE0] rounded-lg overflow-hidden border border-[#E7DBC0]">
                        {primaryImage ? (
                          <Image
                            src={primaryImage}
                            alt={item.product_name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-6 h-6 text-[#8a7f6e]" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#2B2420] truncate flex items-center gap-1.5">
                          {item.product_name}
                          <span className="text-[10px] bg-[#FBF6EC] px-1.5 py-0.5 rounded text-[#8a7f6e] border border-[#E7DBC0]">
                            x{item.quantity}
                          </span>
                        </p>

                        <div className="flex items-center justify-between gap-2 mt-1">
                          <p className="text-xs text-[#8a7f6e]">
                            {formatPrice(item.unit_price)} × {item.quantity}
                          </p>
                          <p className="text-sm font-bold text-[#2B2420] bg-gradient-to-r from-[#C9A227] to-[#E5C84A] bg-clip-text text-transparent">
                            {formatPrice(item.line_total)}
                          </p>
                        </div>

                        {/* Tax Details per product */}
                        <div className="mt-1.5 space-y-0.5">
                          <p className="text-[10px] text-[#8a7f6e] flex items-center gap-1">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#C9A227]"></span>
                            {item.tax_category?.toUpperCase()} ({item.tax_rate})
                          </p>
                          {item.cgst > 0 && (
                            <p className="text-[10px] text-[#8a7f6e]">CGST: {formatPrice(item.cgst)}</p>
                          )}
                          {item.sgst > 0 && (
                            <p className="text-[10px] text-[#8a7f6e]">SGST: {formatPrice(item.sgst)}</p>
                          )}
                          {item.igst > 0 && (
                            <p className="text-[10px] text-[#8a7f6e]">IGST: {formatPrice(item.igst)}</p>
                          )}
                          <p className="text-[10px] font-medium text-[#2B2420] flex items-center gap-1">
                            <BadgeCheck className="w-3 h-3 text-[#C9A227]" />
                            Total Tax: {formatPrice(item.total_tax)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Tax Summary Section */}
              {taxBreakdown && Object.keys(taxBreakdown).length > 0 && (
                <div className="bg-gradient-to-br from-[#FBF6EC] to-[#F5EDE0] rounded-xl p-4 border border-[#E7DBC0]">
                  <p className="text-xs font-semibold text-[#2B2420] mb-2 flex items-center gap-2">
                    <BarChart3 className="w-3.5 h-3.5 text-[#C9A227]" />
                    Tax Breakdown
                  </p>
                  <div className="space-y-1.5">
                    {Object.entries(taxBreakdown).map(([key, tax]: [string, any], index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="text-[#8a7f6e] flex items-center gap-1.5">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#C9A227]"></span>
                          {tax.product_name} ({tax.tax_category?.toUpperCase()})
                        </span>
                        <span className="text-[#2B2420] font-medium">
                          {formatPrice(tax.tax_amount || 0)}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="border-t border-[#EFE6D3] pt-4 space-y-2.5">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-between text-sm"
                >
                  <span className="text-[#8a7f6e]">Subtotal</span>
                  <span className="text-[#2B2420]">
                    {formatPrice(summary?.subtotal ?? summaryData.subtotal)}
                  </span>
                </motion.div>

                {summaryData.coupon_discount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-[#8a7f6e] flex items-center gap-1">
                      <Gift className="w-3 h-3 text-green-600" />
                      Coupon Discount
                    </span>
                    <span className="text-green-700 font-medium">
                      -{formatPrice(summaryData.coupon_discount)}
                    </span>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-between text-sm"
                >
                  <span className="text-[#8a7f6e]">Net Subtotal</span>
                  <span className="text-[#2B2420] font-medium">
                    {formatPrice(summary?.net_subtotal ?? summaryData.subtotal_after_discount)}
                  </span>
                </motion.div>

                {/* Tax Breakdown in Summary */}
                <div className="space-y-1.5 pl-4 border-l-2 border-gradient-to-b from-[#C9A227] to-[#E5C84A]">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#8a7f6e] flex items-center gap-1">
                      <BarChart3 className="w-3 h-3 text-[#C9A227]" />
                      Tax (Total)
                    </span>
                    <span className="text-[#2B2420] font-medium">
                      {formatPrice(summaryData.total_tax)}
                    </span>
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-between text-sm"
                >
                  <span className="text-[#8a7f6e] flex items-center gap-1">
                    <Truck className="w-3 h-3 text-[#C9A227]" />
                    Shipping
                  </span>
                  <span className={Number(summaryData.shipping_cost || 0) === 0 ? "text-green-700 font-medium" : "text-[#2B2420]"}>
                    {Number(summaryData.shipping_cost || 0) === 0 ? "Free" : formatPrice(summaryData.shipping_cost)}
                  </span>
                </motion.div>

                {Number(summaryData.amount_redeemed || 0) > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-[#8a7f6e] flex items-center gap-1">
                      <Coins className="w-3 h-3 text-[#C9A227]" />
                      Coins Redeemed
                    </span>
                    <span className="text-green-700">-{formatPrice(summaryData.amount_redeemed)}</span>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex justify-between items-center text-base font-bold pt-3 mt-2 border-t-2 border-gradient-to-r from-[#C9A227] to-[#E5C84A]"
                >
                  <span className="text-[#2B2420] flex items-center gap-2">
                    <Crown className="w-4 h-4 text-[#C9A227]" />
                    Grand Total
                  </span>
                  <span className="text-[#2B2420] text-lg bg-gradient-to-r from-[#C9A227] to-[#E5C84A] bg-clip-text text-transparent">
                    {formatPrice(summaryData.grand_total)}
                  </span>
                </motion.div>
              </div>

              {/* Summary Info */}
              <div className="bg-gradient-to-br from-[#FBF6EC] to-[#F5EDE0] rounded-xl p-3 border border-[#E7DBC0] space-y-1.5 text-xs">
                {selectedDeliveryAddress && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#C9A227] mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-[#2B2420]">Delivery Address:</span>
                      <span className="text-[#5C534A] ml-1">
                        {selectedDeliveryAddress.address_line_1}, {selectedDeliveryAddress.city}, {selectedDeliveryAddress.state} - {selectedDeliveryAddress.postcode}
                      </span>
                    </div>
                  </div>
                )}
                {selectedShippingMethod && (
                  <div className="flex items-start gap-2">
                    <Truck className="w-3.5 h-3.5 text-[#C9A227] mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-[#2B2420]">Shipping Method:</span>
                      <span className="text-[#5C534A] ml-1">
                        {selectedShippingMethod.name} ({selectedShippingMethod.estimated_days} days)
                      </span>
                    </div>
                  </div>
                )}
                {couponCode && summaryData.coupon_discount > 0 && (
                  <div className="flex items-start gap-2">
                    <Gift className="w-3.5 h-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-[#2B2420]">Coupon:</span>
                      <span className="text-green-700 ml-1 font-medium">{couponCode}</span>
                      <span className="text-[#5C534A] ml-1">(-{formatPrice(summaryData.coupon_discount)})</span>
                    </div>
                  </div>
                )}
                {coinsRedeemed && coinsRedeemed > 0 && summaryData.amount_redeemed > 0 && (
                  <div className="flex items-start gap-2">
                    <Coins className="w-3.5 h-3.5 text-[#C9A227] mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-[#2B2420]">Coins Redeemed:</span>
                      <span className="text-[#5C534A] ml-1">
                        {coinsRedeemed} coins (-{formatPrice(summaryData.amount_redeemed)})
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();

  const [selectedDeliveryAddress, setSelectedDeliveryAddress] = useState<Address | null>(null);
  const [selectedBillingAddress, setSelectedBillingAddress] = useState<Address | null>(null);
  const [useSameBilling, setUseSameBilling] = useState(true);
  const [deliveryMethod, setDeliveryMethod] = useState<string>("standard");
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [coinsRedeemed, setCoinsRedeemed] = useState<number>(0);
  const [orderData, setOrderData] = useState<{
    orderId: number;
    orderReference: string;
    amount: number;
    razorpayOrderId: string;
    razorpayKey: string;
  } | null>(null);

  const {
    data: addressesData,
    isLoading: isLoadingAddresses,
    refetch,
  } = useGetAddressesQuery();

  const {
    data: shippingMethodsData,
    isLoading: isLoadingShippingMethods,
  } = useGetShippingMethodsQuery();

  const [placeOrder, { isLoading: isPlacingOrder }] = usePlaceOrderMutation();
  const [createAddress, { isLoading: isCreating }] = useCreateAddressMutation();
  const [updateAddress, { isLoading: isUpdating }] = useUpdateAddressMutation();
  const [deleteAddress] = useDeleteAddressMutation();
  const [setDefaultAddress] = useSetDefaultAddressMutation();

  const addresses: Address[] = addressesData?.data || [];
  const shippingMethods = shippingMethodsData?.data || [];

  const deliveryAddresses = addresses.filter((address) => address.is_delivery === true);
  const billingAddresses = addresses.filter((address) => address.is_billing === true);
  const availableDeliveryAddresses = deliveryAddresses.length > 0 ? deliveryAddresses : addresses;
  const availableBillingAddresses = billingAddresses.length > 0 ? billingAddresses : addresses;

  const couponCode = searchParams.get("coupon_code");
  const selectedShippingMethod = shippingMethods.find(
    (method) => method.code === deliveryMethod
  );

  const checkoutSummaryParams =
    selectedDeliveryAddress && selectedShippingMethod
      ? {
        address_id: selectedDeliveryAddress.id,
        coupon_code: couponCode || undefined,
        shipping_method_id: selectedShippingMethod.id,
        coins: coinsRedeemed || 0,
      }
      : {
        address_id: 0,
      };

  const {
    data: checkoutSummaryResponse,
    isLoading: isLoadingCheckoutSummary,
    isFetching: isFetchingCheckoutSummary,
    refetch: refetchCheckoutSummary,
  } = useGetCheckoutSummaryQuery(checkoutSummaryParams, {
    skip: !selectedDeliveryAddress || !selectedShippingMethod,
  });

  useEffect(() => {
    if (!addresses.length) {
      setSelectedDeliveryAddress(null);
      setSelectedBillingAddress(null);
      return;
    }

    const defaultAddress = addresses.find((address) => address.is_default === true);
    const deliveryAddress = addresses.find((address) => address.is_delivery === true);
    const billingAddress = addresses.find((address) => address.is_billing === true);
    const selectedDelivery = defaultAddress || deliveryAddress || billingAddress || addresses[0];
    const selectedBilling = defaultAddress || billingAddress || selectedDelivery;

    setSelectedDeliveryAddress(selectedDelivery);
    setSelectedBillingAddress(selectedBilling);
  }, [addresses]);

  const handleCreateAddress = async (data: AddressFormData) => {
    try {
      const payload: any = {
        recipient_name: data.recipient_name,
        contact_number: data.contact_number,
        address_line_1: data.address_line_1,
        address_line_2: data.address_line_2 || null,
        city: data.city,
        state: data.state,
        postcode: data.postcode,
        country: data.country,
        is_default: data.is_default ? 1 : 0,
        is_delivery: 1,
      };

      if (data.is_billing && data.billing_recipient_name) {
        payload.is_billing = 1;
        payload.billing_recipient_name = data.billing_recipient_name;
        payload.billing_contact_number = data.billing_contact_number;
        payload.billing_address_line_1 = data.billing_address_line_1;
        payload.billing_address_line_2 = data.billing_address_line_2 || null;
        payload.billing_city = data.billing_city;
        payload.billing_state = data.billing_state;
        payload.billing_postcode = data.billing_postcode;
        payload.billing_country = data.billing_country;
      } else {
        payload.is_billing = 1;
        payload.billing_recipient_name = data.recipient_name;
        payload.billing_contact_number = data.contact_number;
        payload.billing_address_line_1 = data.address_line_1;
        payload.billing_address_line_2 = data.address_line_2 || null;
        payload.billing_city = data.city;
        payload.billing_state = data.state;
        payload.billing_postcode = data.postcode;
        payload.billing_country = data.country;
      }

      const result = await createAddress(payload).unwrap();
      if (result.status) {
        dispatch(showToast({ message: "Address added successfully!", type: "success" }));
        await refetch();
        setIsAddressModalOpen(false);
        setEditingAddress(null);
      }
    } catch (error: any) {
      if (error?.data?.errors) {
        const errors = error.data.errors;
        const firstErrorKey = Object.keys(errors)[0];
        const firstErrorMessage = errors[firstErrorKey]?.[0] || "Validation failed";
        dispatch(showToast({ message: firstErrorMessage, type: "error" }));
      } else if (error?.data?.message) {
        dispatch(showToast({ message: error.data.message, type: "error" }));
      } else {
        dispatch(showToast({ message: "Failed to add address. Please try again.", type: "error" }));
      }
    }
  };

  const handleUpdateAddress = async (data: AddressFormData) => {
    if (!editingAddress) return;

    try {
      const payload: UpdateAddressRequest = {
        recipient_name: data.recipient_name,
        contact_number: data.contact_number,
        address_line_1: data.address_line_1,
        address_line_2: data.address_line_2 || undefined,
        city: data.city,
        state: data.state,
        postcode: data.postcode,
        country: data.country,
        is_default: data.is_default,
        is_delivery: true,
        is_billing: true,
      };

      if (data.is_billing && data.billing_recipient_name) {
        payload.billing_recipient_name = data.billing_recipient_name;
        payload.billing_contact_number = data.billing_contact_number;
        payload.billing_address_line_1 = data.billing_address_line_1;
        payload.billing_address_line_2 = data.billing_address_line_2 || undefined;
        payload.billing_city = data.billing_city;
        payload.billing_state = data.billing_state;
        payload.billing_postcode = data.billing_postcode;
        payload.billing_country = data.billing_country;
      }

      const result = await updateAddress({
        id: editingAddress.id,
        data: payload,
      }).unwrap();

      if (result.status) {
        dispatch(showToast({ message: "Address updated successfully!", type: "success" }));
        await refetch();
        setIsAddressModalOpen(false);
        setEditingAddress(null);
      }
    } catch (error: any) {
      if (error?.data?.errors) {
        const errors = error.data.errors;
        const firstErrorKey = Object.keys(errors)[0];
        const firstErrorMessage = errors[firstErrorKey]?.[0] || "Validation failed";
        dispatch(showToast({ message: firstErrorMessage, type: "error" }));
      } else if (error?.data?.message) {
        dispatch(showToast({ message: error.data.message, type: "error" }));
      } else {
        dispatch(showToast({ message: "Failed to update address. Please try again.", type: "error" }));
      }
    }
  };

  useEffect(() => {
    if (!shippingMethods.length) return;

    const activeMethods = shippingMethods
      .filter((method) => method.is_active)
      .sort((a, b) => a.sort_order - b.sort_order);

    if (!activeMethods.length) return;

    const currentMethodExists = activeMethods.some(
      (method) => method.code === deliveryMethod
    );

    if (!currentMethodExists) {
      setDeliveryMethod(activeMethods[0].code);
    }
  }, [shippingMethods, deliveryMethod]);

  const handleDeleteAddress = async (id: number, data: DeleteAddressRequest) => {
    try {
      const result = await deleteAddress({
        id,
        data,
      }).unwrap();

      if (result.status) {
        dispatch(showToast({ message: "Address deleted successfully!", type: "success" }));
        await refetch();
      }
    } catch (error: any) {
      dispatch(showToast({
        message: error?.data?.message || error?.message || "Failed to delete address",
        type: "error",
      }));
    }
  };

  const handleSetDefaultAddress = async (id: number) => {
    try {
      const result = await setDefaultAddress(id).unwrap();
      if (result.status) {
        dispatch(showToast({ message: "Default address updated!", type: "success" }));
        await refetch();
      }
    } catch (error: any) {
      dispatch(showToast({ message: error?.data?.message || "Failed to set default address", type: "error" }));
    }
  };

  // Single function that creates order AND opens Razorpay
  const handlePayNow = async () => {
    if (!selectedDeliveryAddress) {
      dispatch(
        showToast({
          message: "Please select a delivery address to continue",
          type: "error",
        })
      );
      return;
    }

    if (!checkoutSummaryResponse?.data) {
      dispatch(
        showToast({
          message: "Checkout summary is not available",
          type: "error",
        })
      );
      return;
    }

    const grandTotal = Number(checkoutSummaryResponse.data.grand_total);

    if (!grandTotal || grandTotal <= 0) {
      dispatch(
        showToast({
          message: "Invalid order amount",
          type: "error",
        })
      );
      return;
    }

    try {
      setIsSubmitting(true);

      // Get all the data from checkout summary
      const summaryData = checkoutSummaryResponse.data;
      const couponDiscount = summaryData.coupon_discount || 0;
      const shippingCost = summaryData.shipping_cost || 0;
      const amountRedeemed = summaryData.amount_redeemed || 0;

      // Create order
      const response = await placeOrder({
        address_id: selectedDeliveryAddress.id,
        grand_total: grandTotal,
        payment_gateway: "razorpay",
        summary_data: {
          subtotal: summaryData.subtotal,
          coupon_discount: couponDiscount,
          coupon_code: couponCode || null,
          shipping_charge: shippingCost,
          shipping_method_id: selectedShippingMethod?.id || null,
          coin_redeemed: coinsRedeemed || 0,
          amount_redeemed: amountRedeemed,
          total_tax: summaryData.total_tax,
          net_subtotal: summaryData.subtotal_after_discount,
        }
      }).unwrap();

      console.log("Place Order Response:", response);

      if (!response.success || !response.data) {
        throw new Error(response.message || "Unable to place order");
      }

      dispatch(
        showToast({
          message: "Order created successfully!",
          type: "success",
        })
      );

      // Store order data and immediately open Razorpay
      const orderData = {
        orderId: response.data.order_id,
        orderReference: response.data.order_reference,
        amount: Number(response.data.amount),
        razorpayOrderId: response.data.razorpay_order_id,
        razorpayKey: response.data.razorpay_key,
      };

      setOrderData(orderData);

      // Open Razorpay directly after order creation
      await openRazorpay(orderData);

      setIsSubmitting(false);
    } catch (error: any) {
      console.error("Place Order Error:", error);
      setIsSubmitting(false);
      dispatch(
        showToast({
          message: error?.data?.message || error?.message || "Failed to place order",
          type: "error",
        })
      );
    }
  };

  // Function to open Razorpay
  const openRazorpay = (orderData: {
    orderId: number;
    orderReference: string;
    amount: number;
    razorpayOrderId: string;
    razorpayKey: string;
  }) => {
    return new Promise((resolve, reject) => {
      // Load Razorpay script if not loaded
      if (!(window as any).Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => {
          initRazorpay(orderData, resolve, reject);
        };
        script.onerror = () => {
          reject(new Error('Failed to load Razorpay SDK'));
        };
        document.body.appendChild(script);
      } else {
        initRazorpay(orderData, resolve, reject);
      }
    });
  };

  const initRazorpay = (
    orderData: {
      orderId: number;
      orderReference: string;
      amount: number;
      razorpayOrderId: string;
      razorpayKey: string;
    },
    resolve: (value: any) => void,
    reject: (reason: any) => void
  ) => {
    const options = {
      key: orderData.razorpayKey,
      amount: Math.round(Number(orderData.amount) * 100),
      currency: "INR",
      name: "IndieKonnect",
      description: `Order #${orderData.orderReference}`,
      order_id: orderData.razorpayOrderId,
      prefill: {
        name: "",
        email: "",
        contact: "",
      },
      notes: {
        order_id: String(orderData.orderId),
        order_reference: orderData.orderReference,
      },
      theme: {
        color: "#C9A227",
      },
      handler: function (response: any) {
        console.log("Razorpay Success:", response);
        // Redirect to order confirmation on success
        router.push(`/order-confirmation?order_id=${orderData.orderId}&order_reference=${orderData.orderReference}`);
        resolve(response);
      },
      modal: {
        ondismiss: function () {
          console.log("Razorpay checkout closed");
          setIsSubmitting(false);
          reject(new Error('Payment cancelled'));
        },
      },
    };

    try {
      const razorpay = new (window as any).Razorpay(options);

      razorpay.on("payment.failed", function (response: any) {
        console.error("Payment Failed:", response);
        setIsSubmitting(false);
        const errorMessage = response?.error?.description || "Payment failed. Please try again.";
        dispatch(showToast({
          message: errorMessage,
          type: "error",
        }));
        reject(new Error(errorMessage));
      });

      razorpay.open();
    } catch (error) {
      console.error("Razorpay Open Error:", error);
      setIsSubmitting(false);
      reject(error);
    }
  };

  const handleCancelOrder = () => {
    setIsCancelling(true);
    dispatch(showToast({ message: "Checkout cancelled", type: "error" }));
    setTimeout(() => {
      setIsCancelling(false);
      router.push("/cart");
    }, 400);
  };

  const grandTotal = checkoutSummaryResponse?.data?.grand_total || 0;

  return (
    <>
      <Header />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative w-full h-[160px] md:h-[200px] lg:h-[240px] overflow-hidden"
      >
        <Image src={BannerImage} alt="Checkout Banner" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex items-center">
          <div className="container mx-auto px-4">
            <div className="px-6 md:px-12 max-w-3xl">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <motion.div
                  className="flex items-center gap-3 mb-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="p-1.5 bg-gradient-to-r from-[#C9A227] to-[#E5C84A] rounded-lg">
                    <ShoppingBag className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-white/70 text-sm font-medium tracking-widest uppercase">Checkout</span>
                </motion.div>
                <motion.h1
                  className="text-3xl md:text-4xl font-bold text-white mb-1 flex items-center gap-3"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Secure Checkout
                  <span className="text-xs bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white/90 font-normal">
                    <Shield className="w-3 h-3 inline mr-1" />
                    Protected
                  </span>
                </motion.h1>
                <motion.p
                  className="text-white/85 text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Add your address and payment details — one simple step
                </motion.p>
              </motion.div>
            </div>
          </div>
        </div>
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#FBF8F2] to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        />
      </motion.div>

      <div className="relative min-h-screen bg-gradient-to-b from-[#FBF6EC] via-[#F8F0E4] to-[#FBF6EC] pb-6">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              onClick={() => router.back()}
              className="flex items-center gap-2 text-[#5C534A] hover:text-[#C9A227] transition-colors group text-sm"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Continue Shopping</span>
            </motion.button>
            <motion.nav
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="flex items-center gap-1.5 text-xs text-[#8a7f6e]"
            >
              <Link href="/" className="hover:text-[#C9A227] transition-colors">Home</Link>
              <ChevronRight className="w-3 h-3 text-[#D9CFBA]" />
              <Link href="/cart" className="hover:text-[#C9A227] transition-colors">Cart</Link>
              <ChevronRight className="w-3 h-3 text-[#D9CFBA]" />
              <span className="text-[#2B2420] font-medium">Checkout</span>
            </motion.nav>
          </div>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-serif text-3xl text-[#2B2420] flex items-center gap-3">
                Checkout
                <span className="text-xs bg-gradient-to-r from-[#C9A227]/20 to-[#E5C84A]/20 px-3 py-1 rounded-full text-[#C9A227] font-medium border border-[#C9A227]/20">
                  3 Steps
                </span>
              </h1>
              <p className="text-sm text-[#8a7f6e] mt-1 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
                Review your address, delivery and payment details below
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-sm text-[#8a7f6e] bg-white border border-[#E7DBC0] rounded-full px-4 py-2 shadow-sm">
              <Shield className="w-4 h-4 text-[#C9A227]" />
              <span>Secure Checkout</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-gradient-to-br from-white to-[#FDFBF7] border border-[#E7DBC0] rounded-2xl overflow-hidden shadow-md"
              >
                <div className="flex items-center justify-between px-6 py-5 border-b border-[#F0E9D8] bg-gradient-to-r from-[#FBF6EC] to-transparent">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#C9A227]/20 to-[#E5C84A]/20 border border-[#C9A227]/30 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-[#C9A227]" />
                    </div>
                    <div>
                      <h2 className="font-serif text-lg text-[#2B2420] leading-tight">Delivery Address</h2>
                      <p className="text-xs text-[#8a7f6e]">Where should we send your order?</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setEditingAddress(null);
                      setIsAddressModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#C9A227] to-[#E5C84A] text-white text-xs font-medium rounded-lg hover:shadow-lg transition-all shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add New
                  </motion.button>
                </div>

                <div className="p-6">
                  {isLoadingAddresses ? (
                    <div className="flex items-center justify-center py-8">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Loader2 className="w-8 h-8 text-[#C9A227]" />
                      </motion.div>
                    </div>
                  ) : availableDeliveryAddresses.length > 0 ? (
                    <div className="space-y-3">
                      {availableDeliveryAddresses.map((address) => (
                        <AddressCard
                          key={address.id}
                          address={address}
                          isSelected={selectedDeliveryAddress?.id === address.id}
                          onSelect={() => setSelectedDeliveryAddress(address)}
                          onEdit={() => {
                            setEditingAddress(address);
                            setIsAddressModalOpen(true);
                          }}
                          onDelete={(data) => handleDeleteAddress(address.id, data)}
                          onSetDefault={() => handleSetDefaultAddress(address.id)}
                          isDefault={address.is_default === true}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MapPin className="w-14 h-14 text-[#D9CFBA] mx-auto mb-3" />
                      <p className="text-[#5C534A] font-medium">No addresses found</p>
                      <p className="text-xs text-[#8a7f6e] mt-1">Add a new address to continue</p>
                    </div>
                  )}
                </div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 }}
                className="bg-gradient-to-br from-white to-[#FDFBF7] border border-[#E7DBC0] rounded-2xl overflow-hidden shadow-md"
              >
                <div className="flex items-center gap-3 px-6 py-5 border-b border-[#F0E9D8] bg-gradient-to-r from-[#FBF6EC] to-transparent">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#C9A227]/20 to-[#E5C84A]/20 border border-[#C9A227]/30 flex items-center justify-center flex-shrink-0">
                    <Truck className="w-5 h-5 text-[#C9A227]" />
                  </div>
                  <div>
                    <h2 className="font-serif text-lg text-[#2B2420] leading-tight">Delivery Method</h2>
                    <p className="text-xs text-[#8a7f6e]">Choose how fast you want your order</p>
                  </div>
                </div>
                <div className="p-6">
                  {isLoadingShippingMethods ? (
                    <div className="flex items-center justify-center py-8">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Loader2 className="w-8 h-8 text-[#C9A227]" />
                      </motion.div>
                    </div>
                  ) : shippingMethods.filter((method) => method.is_active).length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {shippingMethods
                        .filter((method) => method.is_active)
                        .sort((a, b) => a.sort_order - b.sort_order)
                        .map((method, index) => {
                          const isActive = deliveryMethod === method.code;

                          const Icon =
                            method.code === "express"
                              ? Zap
                              : method.code === "free"
                                ? CheckCircle2
                                : Truck;

                          const priceValue = Number(method.base_rate || 0);

                          const price =
                            method.rate_type === "free" || priceValue === 0
                              ? "Free"
                              : `₹${priceValue.toFixed(2)}`;

                          return (
                            <motion.label
                              key={method.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              htmlFor={`delivery-${method.code}`}
                              className={`relative flex items-start gap-3 rounded-xl border-2 p-4 cursor-pointer transition-all ${isActive
                                  ? "border-[#C9A227] bg-gradient-to-r from-[#FBF6EC] to-[#F5EDE0] shadow-md shadow-[#C9A227]/10"
                                  : "border-[#E7DBC0] hover:border-[#C9A227]/40 hover:bg-[#FBF8F2]"
                                }`}
                            >
                              {method.code === "express" && (
                                <motion.span
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="absolute -top-2 -right-2 bg-gradient-to-r from-[#C9A227] to-[#E5C84A] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm"
                                >
                                  Fastest
                                </motion.span>
                              )}

                              <input
                                type="radio"
                                id={`delivery-${method.code}`}
                                name="deliveryMethod"
                                value={method.code}
                                checked={isActive}
                                onChange={() => setDeliveryMethod(method.code)}
                                className="sr-only"
                              />

                              <div
                                className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border-2 transition-all ${isActive
                                    ? "bg-gradient-to-r from-[#C9A227] to-[#E5C84A] border-[#C9A227] text-white shadow-md"
                                    : "bg-[#FBF6EC] border-[#E7DBC0] text-[#C9A227]"
                                  }`}
                              >
                                <Icon className="w-5 h-5" />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-medium text-sm text-[#2B2420]">
                                    {method.name}
                                  </span>
                                  {isActive && (
                                    <CheckCircle2 className="w-4 h-4 text-[#C9A227] flex-shrink-0" />
                                  )}
                                </div>
                                <p className="text-xs text-[#8a7f6e] mt-0.5">{method.description}</p>
                                <p className="text-xs text-[#8a7f6e] mt-1 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Estimated delivery: {method.estimated_days} days
                                </p>
                                <p
                                  className={`text-sm font-bold mt-1.5 ${priceValue === 0 ? "text-green-700" : "text-[#2B2420]"
                                    }`}
                                >
                                  {price}
                                </p>
                              </div>
                            </motion.label>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Truck className="w-12 h-12 text-[#D9CFBA] mx-auto mb-2" />
                      <p className="text-sm text-[#5C534A]">No delivery methods available</p>
                    </div>
                  )}
                </div>
              </motion.section>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <OrderSummary
                  summaryData={checkoutSummaryResponse?.data}
                  isLoading={isLoadingCheckoutSummary}
                  isFetching={isFetchingCheckoutSummary}
                  selectedDeliveryAddress={selectedDeliveryAddress}
                  selectedShippingMethod={selectedShippingMethod}
                  couponCode={couponCode}
                  coinsRedeemed={coinsRedeemed}
                />

                <motion.section
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="bg-gradient-to-br from-white to-[#FDFBF7] border border-[#E7DBC0] rounded-2xl overflow-hidden shadow-md"
                >
                  <div className="flex items-center gap-3 px-5 py-4 border-b border-[#F0E9D8] bg-gradient-to-r from-[#FBF6EC] to-transparent">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-[#C9A227]/20 to-[#E5C84A]/20 border border-[#C9A227]/30 flex items-center justify-center flex-shrink-0">
                      <CreditCard className="w-4.5 h-4.5 text-[#C9A227]" />
                    </div>
                    <div>
                      <h2 className="font-serif text-base text-[#2B2420] leading-tight">Payment Details</h2>
                      <p className="text-[11px] text-[#8a7f6e]">Choose how you'd like to pay</p>
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    {/* Razorpay Payment */}
                    <div className="bg-gradient-to-br from-[#FBF6EC] to-[#F5EDE0] rounded-xl p-4 border border-[#E7DBC0]">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#C9A227] to-[#E5C84A] flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#2B2420]">
                            Payment Method
                          </p>
                          <p className="text-xs text-[#8a7f6e]">
                            Secure payment powered by Razorpay
                          </p>
                        </div>
                      </div>

                      <div className="p-4 bg-white rounded-xl border-2 border-[#C9A227] shadow-md">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#FBF6EC] flex items-center justify-center">
                              <Image
                                src={Razorpay}
                                alt="Wallet"
                                width={50}
                                height={50}
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[#2B2420]">
                                Razorpay
                              </p>
                              <p className="text-xs text-[#8a7f6e]">
                                UPI, Cards, Net Banking & Wallets
                              </p>
                            </div>
                          </div>
                          <CheckCircle2 className="w-5 h-5 text-[#C9A227]" />
                        </div>
                      </div>
                    </div>

                    {/* Security */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 text-xs text-[#8a7f6e] bg-gradient-to-r from-[#FBF6EC] to-white p-3 rounded-lg border border-[#E7DBC0]"
                    >
                      <Shield className="w-4 h-4 text-[#C9A227] flex-shrink-0" />
                      <span>
                        Your payment is secure and encrypted by Razorpay
                      </span>
                    </motion.div>

                    {/* Pay Now Button - Single click creates order AND opens payment */}
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handlePayNow}
                      disabled={isSubmitting || !selectedDeliveryAddress}
                      className="w-full py-3.5 bg-gradient-to-r from-[#C9A227] to-[#E5C84A] text-white rounded-xl font-medium disabled:opacity-60 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2 hover:shadow-xl transition-all"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Creating Order & Opening Payment...
                        </>
                      ) : (
                        <>
                          <Wallet className="w-4 h-4" />
                          Pay ₹{grandTotal?.toLocaleString("en-IN") || "0"}
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.section>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-gradient-to-br from-white to-[#FDFBF7] border border-[#E7DBC0] rounded-xl p-4 space-y-2.5 shadow-sm"
                >
                  <div className="flex items-center gap-2 text-xs text-[#5C534A]">
                    <div className="p-1 bg-gradient-to-r from-[#C9A227]/20 to-[#E5C84A]/20 rounded-lg">
                      <Truck className="w-3.5 h-3.5 text-[#C9A227]" />
                    </div>
                    <span>Free shipping on orders over ₹50</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#5C534A]">
                    <div className="p-1 bg-gradient-to-r from-[#C9A227]/20 to-[#E5C84A]/20 rounded-lg">
                      <Shield className="w-3.5 h-3.5 text-[#C9A227]" />
                    </div>
                    <span>Secure checkout guaranteed</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#5C534A]">
                    <div className="p-1 bg-gradient-to-r from-[#C9A227]/20 to-[#E5C84A]/20 rounded-lg">
                      <Headphones className="w-3.5 h-3.5 text-[#C9A227]" />
                    </div>
                    <span>24/7 customer support</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Sticky Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="sticky bottom-0 left-0 right-0 z-30 mt-8"
        >
          <div className="bg-white/95 backdrop-blur-md border-t border-[#E7DBC0] shadow-[0_-8px_30px_rgba(43,36,32,0.08)]">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={handleCancelOrder}
                  disabled={isCancelling}
                  className="flex items-center gap-2 px-5 py-3 rounded-full border-2 border-[#E7DBC0] text-[#5C534A] text-sm font-medium hover:bg-[#FBF6EC] hover:text-[#2B2420] hover:border-[#C9A227]/40 transition-all disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </motion.button>

                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex flex-col items-end leading-tight">
                    <span className="text-[11px] text-[#8a7f6e] flex items-center gap-1">
                      <Truck className="w-3 h-3" />
                      Delivery
                    </span>
                    <span className="text-sm font-semibold text-[#2B2420]">
                      {shippingMethods.find((method) => method.code === deliveryMethod)?.name || "Select Delivery"}
                    </span>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handlePayNow}
                    disabled={isSubmitting || !selectedDeliveryAddress}
                    className="flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-[#C9A227] via-[#D4A92E] to-[#E5C84A] text-white text-sm font-semibold hover:shadow-lg transition-all duration-500 disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-[#C9A227]/20 group"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Wallet className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span>Pay ₹{grandTotal?.toLocaleString("en-IN") || "0"}</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <AddressFormModal
        isOpen={isAddressModalOpen}
        onClose={() => {
          setIsAddressModalOpen(false);
          setEditingAddress(null);
        }}
        onSubmit={editingAddress ? handleUpdateAddress : handleCreateAddress}
        initialData={editingAddress}
        isLoading={isCreating || isUpdating}
      />

      <Footer />
    </>
  );
}