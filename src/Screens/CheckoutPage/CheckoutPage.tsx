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
  Clock,
  Package,
  Crown,
  Sparkles,
  Gift,
  Coins,
  Wallet,
  Building2,
  BadgeCheck,
  Headphones,
  Layers,
} from "lucide-react";

import { useDispatch } from "react-redux";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import Image from "next/image";
import Link from "next/link";

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
import Razorpay from "../../../public/indiekonnect-web/images/rozarpay.jpeg";

import AddressFormModal from "./AddressFormModal";

import {
  useGetShippingMethodsQuery,
} from "@/lib/redux/api/shippingApi";

import {
  useGetCheckoutSummaryQuery,
  usePlaceOrderMutation,
} from "@/lib/redux/api/checkoutApi";

/* =========================================================
   ADDRESS TYPES
========================================================= */

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

interface UpdateAddressRequest
  extends AddressFormData {
  id?: number;
}

interface DeleteAddressRequest {
  id: number;
}

/* =========================================================
   CHECKOUT SUMMARY DATA
========================================================= */

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
      product_id?: number;
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
    additional_gst_on_subtotal?: number;
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
  } | null;
}

/* =========================================================
   ORDER SUMMARY PROPS
========================================================= */

interface OrderSummaryProps {
  summaryData?: CheckoutSummaryData;

  isLoading: boolean;
  isFetching: boolean;

  selectedDeliveryAddress?: Address | null;

  selectedShippingMethod?: any;

  couponCode?: string | null;

  coinsRedeemed?: number;

  isDirectCheckout?: boolean;
}

/* =========================================================
   ADDRESS CARD
========================================================= */

interface AddressCardProps {
  address: Address;

  isSelected: boolean;

  onSelect: () => void;

  onEdit: () => void;

  onDelete: (
    data: DeleteAddressRequest
  ) => Promise<void>;

  onSetDefault: () => void;

  isDefault: boolean;
}

/* =========================================================
   ADDRESS CARD COMPONENT
========================================================= */

function AddressCard({
  address,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onSetDefault,
  isDefault,
}: AddressCardProps) {
  const [isDeleting, setIsDeleting] =
    useState(false);

  const [
    showDeleteConfirm,
    setShowDeleteConfirm,
  ] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      await onDelete({
        id: address.id,
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        y: -10,
      }}
      whileHover={{
        y: -2,
        scale: 1.002,
      }}
      transition={{
        duration: 0.2,
      }}
      onClick={onSelect}
      className={`
        relative bg-white rounded-xl border-2
        transition-all duration-300 p-4 cursor-pointer
        ${isSelected
          ? "border-[#F7B407] shadow-[0_8px_30px_-4px_rgba(247,180,7,0.3)]"
          : "border-[#E7DBC0] hover:border-[#F7B407]/40 hover:shadow-md"
        }
      `}
    >
      {/* SELECTED */}

      {isSelected && (
        <motion.div
          initial={{
            scale: 0,
          }}
          animate={{
            scale: 1,
          }}
          className="absolute -top-2.5 -right-2.5 w-7 h-7 bg-gradient-to-r from-[#F7B407] to-[#f5c94a] rounded-full flex items-center justify-center shadow-lg z-10"
        >
          <Check
            className="w-4 h-4 text-[#26253A]"
            strokeWidth={3}
          />
        </motion.div>
      )}

      {/* DEFAULT */}

      {isDefault && (
        <motion.div
          initial={{
            opacity: 0,
            y: -10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="absolute -top-1 -left-1 bg-gradient-to-r from-[#F7B407] to-[#f5c94a] text-[#26253A] text-[9px] font-bold px-2.5 py-0.5 rounded-br-lg rounded-tl-lg shadow-sm"
        >
          DEFAULT
        </motion.div>
      )}

      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <div
            className={`
              w-9 h-9 rounded-xl flex items-center justify-center
              ${isSelected
                ? "bg-[#F7B407]/20 text-[#F7B407]"
                : "bg-[#FBF6EC] text-[#8a7f6e]"
              }
            `}
          >
            <MapPin className="w-4 h-4" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-medium text-[#26253A] text-sm flex items-center gap-1.5">
              {address.recipient_name}

              {isDefault && (
                <Star className="w-3.5 h-3.5 fill-[#F7B407] text-[#F7B407]" />
              )}
            </span>
          </div>

          <div className="space-y-0.5">
            <p className="text-xs text-[#5C534A]">
              {address.address_line_1}

              {address.address_line_2 &&
                `, ${address.address_line_2}`}
            </p>

            <p className="text-xs text-[#8a7f6e] flex items-center gap-1">
              <Building2 className="w-3 h-3" />

              {address.city},{" "}
              {address.state}{" "}
              {address.postcode}
            </p>

            <p className="text-xs text-[#8a7f6e] flex items-center gap-1">
              <Phone className="w-3 h-3" />

              {address.contact_number}
            </p>
          </div>
        </div>
      </div>

      {/* ACTIONS */}

      <div className="flex items-center justify-end gap-1.5 mt-3 pt-2.5 border-t border-[#EFE6D3]">
        {!isDefault && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onSetDefault();
            }}
            className="text-[10px] font-medium text-[#5C534A] hover:text-[#F7B407] px-2.5 py-1 rounded-lg hover:bg-[#F7B407]/10 flex items-center gap-1.5"
          >
            <Star className="w-3 h-3" />
            Default
          </button>
        )}

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onEdit();
          }}
          className="text-[10px] font-medium text-[#5C534A] hover:text-[#26253A] px-2.5 py-1 rounded-lg hover:bg-[#F7B407]/10 flex items-center gap-1.5"
        >
          <Edit2 className="w-3 h-3" />
          Edit
        </button>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setShowDeleteConfirm(true);
          }}
          className="text-[10px] font-medium text-[#a89c86] hover:text-[#F7B407] px-2.5 py-1 rounded-lg hover:bg-red-50 flex items-center gap-1.5"
        >
          <Trash2 className="w-3 h-3" />
          Delete
        </button>
      </div>

      {/* DELETE CONFIRMATION */}

      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.92,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              scale: 0.92,
            }}
            className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-xl flex items-center justify-center p-4 z-20"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="text-center">
              <AlertCircle className="w-10 h-10 text-[#F7B407] mx-auto mb-2" />

              <p className="text-sm font-bold text-[#26253A]">
                Delete Address?
              </p>

              <p className="text-xs text-[#8a7f6e] mt-0.5">
                This action cannot be undone
              </p>

              <div className="flex items-center gap-2 mt-3 justify-center">
                <button
                  type="button"
                  onClick={() =>
                    setShowDeleteConfirm(
                      false
                    )
                  }
                  className="px-4 py-1.5 text-xs font-medium bg-white text-[#26253A] border border-[#E7DBC0] rounded-lg"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-1.5 text-xs font-medium bg-gradient-to-r from-[#F7B407] to-[#f5c94a] text-[#26253A] rounded-lg flex items-center gap-1.5 disabled:opacity-60"
                >
                  {isDeleting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}

                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* =========================================================
   ORDER SUMMARY
========================================================= */

function OrderSummary({
  summaryData,
  isLoading,
  isFetching,
  selectedDeliveryAddress,
  selectedShippingMethod,
  couponCode,
  coinsRedeemed = 0,
  isDirectCheckout,
}: OrderSummaryProps) {
  const [isExpanded, setIsExpanded] =
    useState(true);

  const formatPrice = (
    value:
      | number
      | string
      | undefined
  ) => {
    const amount = Number(
      value || 0
    );

    return `₹${amount.toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  if (
    isLoading ||
    isFetching
  ) {
    return (
      <div className="bg-white border border-[#E7DBC0] rounded-2xl overflow-hidden shadow-md">
        <div className="px-5 py-4 border-b border-[#F0E9D8]">
          <h2 className="text-lg text-[#26253A] flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#F7B407]" />

            {isDirectCheckout
              ? "Product Summary"
              : "Order Summary"}
          </h2>
        </div>

        <div className="p-8 flex justify-center">
          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <Loader2 className="w-8 h-8 text-[#F7B407]" />
          </motion.div>
        </div>
      </div>
    );
  }

  if (!summaryData) {
    return (
      <div className="bg-white border border-[#E7DBC0] rounded-2xl overflow-hidden shadow-md">
        <div className="px-5 py-4 border-b border-[#F0E9D8]">
          <h2 className="text-lg text-[#26253A] flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#F7B407]" />

            {isDirectCheckout
              ? "Product Summary"
              : "Order Summary"}
          </h2>
        </div>

        <div className="p-6 text-center">
          <Package className="w-12 h-12 text-[#D9CFBA] mx-auto mb-3" />

          <p className="text-sm text-[#5C534A] font-medium">
            No summary available
          </p>
        </div>
      </div>
    );
  }

  const summary =
    summaryData.summary;

  let items =
    summaryData.items || [];

  const productTaxBreakdown =
    summaryData.product_tax_breakdown ||
    {};

  if (
    items.length === 0 &&
    Object.keys(
      productTaxBreakdown
    ).length > 0
  ) {
    items =
      Object.values(
        productTaxBreakdown
      ).map(
        (product: any) => ({
          product_id:
            product.product_id,

          product_name:
            product.product_name,

          product_code:
            product.product_code,

          quantity:
            product.quantity || 1,

          unit_price:
            product.unit_price || 0,

          tax_category:
            product.tax_category,

          tax_rate:
            product.tax_rate,

          taxable_value:
            product.taxable_value ||
            0,

          cgst:
            product.cgst || 0,

          sgst:
            product.sgst || 0,

          igst:
            product.igst || 0,

          total_tax:
            product.tax_amount || 0,

          line_total:
            product.line_total_after_tax ||
            product.unit_price *
            (product.quantity || 1),

          primary_image:
            product.primary_image,

          images:
            product.images || [],
        })
      );
  }

  return (
    <div className="bg-white border border-[#E7DBC0] rounded-2xl overflow-hidden shadow-md">
      <div
        className="px-5 py-4 border-b border-[#F0E9D8] flex items-center justify-between cursor-pointer"
        onClick={() =>
          setIsExpanded(
            (previous) =>
              !previous
          )
        }
      >
        <h2 className="text-lg text-[#26253A] flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#F7B407]" />

          {isDirectCheckout
            ? "Product Summary"
            : "Order Summary"}
        </h2>

        <div className="flex items-center gap-3">
          {isFetching && (
            <Loader2 className="w-4 h-4 text-[#F7B407] animate-spin" />
          )}

          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{
              height: 0,
              opacity: 0,
            }}
            animate={{
              height: "auto",
              opacity: 1,
            }}
            exit={{
              height: 0,
              opacity: 0,
            }}
            className="overflow-hidden"
          >
            <div className="p-5 space-y-5">
              {/* PRODUCTS */}

              <div className="space-y-4 max-h-[300px] overflow-y-auto">
                {items.length > 0 ? (
                  items.map(
                    (
                      item: any,
                      index: number
                    ) => {
                      const primaryImage =
                        item.primary_image ||
                        item.images?.find(
                          (
                            image: any
                          ) =>
                            image.is_primary
                        )
                          ?.image_url ||
                        item.images?.[0]
                          ?.image_url;

                      return (
                        <motion.div
                          key={
                            item.product_id ||
                            index
                          }
                          initial={{
                            opacity: 0,
                            x: -20,
                          }}
                          animate={{
                            opacity: 1,
                            x: 0,
                          }}
                          className="flex items-start gap-3 pb-4 border-b border-[#EFE6D3]"
                        >
                          <div className="relative w-16 h-16 flex-shrink-0 bg-[#FBF6EC] rounded-lg overflow-hidden border border-[#E7DBC0]">
                            {primaryImage ? (
                              <Image
                                src={
                                  primaryImage
                                }
                                alt={
                                  item.product_name ||
                                  "Product"
                                }
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ShoppingBag className="w-6 h-6 text-[#8a7f6e]" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#26253A] truncate">
                              {
                                item.product_name
                              }{" "}
                              <span className="text-[10px] bg-[#FBF6EC] px-1.5 py-0.5 rounded text-[#8a7f6e]">
                                x
                                {
                                  item.quantity
                                }
                              </span>
                            </p>

                            <div className="flex justify-between gap-2 mt-1">
                              <p className="text-xs text-[#8a7f6e]">
                                {formatPrice(
                                  item.unit_price
                                )}{" "}
                                ×{" "}
                                {
                                  item.quantity
                                }
                              </p>

                              <p className="text-sm font-bold text-[#26253A]">
                                {formatPrice(
                                  item.line_total ||
                                  item.unit_price *
                                  item.quantity
                                )}
                              </p>
                            </div>

                            {item.tax_category && (
                              <p className="text-[10px] text-[#8a7f6e] mt-1">
                                {
                                  item.tax_category
                                }{" "}
                                (
                                {
                                  item.tax_rate
                                }
                                )
                              </p>
                            )}

                            <p className="text-[10px] font-medium text-[#26253A] flex items-center gap-1 mt-1">
                              <BadgeCheck className="w-3 h-3 text-[#F7B407]" />
                              Total Tax:{" "}
                              {formatPrice(
                                item.total_tax
                              )}
                            </p>
                          </div>
                        </motion.div>
                      );
                    }
                  )
                ) : (
                  <p className="text-sm text-[#8a7f6e] text-center">
                    No products in this order
                  </p>
                )}
              </div>

              {/* PRICE BREAKDOWN */}

              <div className="border-t border-[#EFE6D3] pt-4 space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-[#8a7f6e]">
                    Subtotal
                  </span>

                  <span className="text-[#26253A]">
                    {formatPrice(
                      summary?.subtotal ??
                      summaryData.subtotal
                    )}
                  </span>
                </div>

                {summaryData.coupon_discount >
                  0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#8a7f6e] flex items-center gap-1">
                        <Gift className="w-3 h-3 text-[#F7B407]" />
                        Coupon Discount
                      </span>

                      <span className="text-[#26253A]">
                        -
                        {formatPrice(
                          summaryData.coupon_discount
                        )}
                      </span>
                    </div>
                  )}

                <div className="flex justify-between text-sm">
                  <span className="text-[#8a7f6e]">
                    Tax (Total)
                  </span>

                  <span className="text-[#26253A]">
                    {formatPrice(
                      summaryData.total_tax
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-[#8a7f6e] flex items-center gap-1">
                    <Truck className="w-3 h-3 text-[#F7B407]" />
                    Shipping
                  </span>

                  <span className="text-[#26253A]">
                    {Number(
                      summaryData.shipping_cost ||
                      0
                    ) === 0
                      ? "Free"
                      : formatPrice(
                        summaryData.shipping_cost
                      )}
                  </span>
                </div>

                {Number(
                  summaryData.amount_redeemed ||
                  0
                ) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#8a7f6e] flex items-center gap-1">
                        <Coins className="w-3 h-3 text-[#F7B407]" />
                        Coins Redeemed
                      </span>

                      <span className="text-[#26253A]">
                        -
                        {formatPrice(
                          summaryData.amount_redeemed
                        )}
                      </span>
                    </div>
                  )}

                <div className="flex justify-between items-center text-base font-bold pt-3 mt-2 border-t-2 border-[#F7B407]">
                  <span className="text-[#26253A] flex items-center gap-2">
                    <Crown className="w-4 h-4 text-[#F7B407]" />
                    Grand Total
                  </span>

                  <span className="text-[#26253A] text-lg">
                    {formatPrice(
                      summaryData.grand_total
                    )}
                  </span>
                </div>
              </div>

              {/* INFO */}

              <div className="bg-[#F7B407]/10 rounded-xl p-3 border border-[#F7B407]/20 space-y-1.5 text-xs">
                {selectedDeliveryAddress && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#F7B407] mt-0.5" />

                    <div>
                      <span className="font-medium text-[#26253A]">
                        Delivery Address:
                      </span>

                      <span className="text-[#5C534A] ml-1">
                        {
                          selectedDeliveryAddress.address_line_1
                        }
                        ,{" "}
                        {
                          selectedDeliveryAddress.city
                        }
                        ,{" "}
                        {
                          selectedDeliveryAddress.state
                        }{" "}
                        -{" "}
                        {
                          selectedDeliveryAddress.postcode
                        }
                      </span>
                    </div>
                  </div>
                )}

                {selectedShippingMethod && (
                  <div className="flex items-start gap-2">
                    <Truck className="w-3.5 h-3.5 text-[#F7B407] mt-0.5" />

                    <div>
                      <span className="font-medium text-[#26253A]">
                        Shipping Method:
                      </span>

                      <span className="text-[#5C534A] ml-1">
                        {
                          selectedShippingMethod.name
                        }
                      </span>
                    </div>
                  </div>
                )}

                {couponCode &&
                  summaryData.coupon_discount >
                  0 && (
                    <div className="flex items-start gap-2">
                      <Gift className="w-3.5 h-3.5 text-[#F7B407] mt-0.5" />

                      <div>
                        <span className="font-medium text-[#26253A]">
                          Coupon:
                        </span>

                        <span className="text-[#26253A] ml-1 font-medium">
                          {couponCode}
                        </span>
                      </div>
                    </div>
                  )}

                {coinsRedeemed > 0 &&
                  summaryData.amount_redeemed >
                  0 && (
                    <div className="flex items-start gap-2">
                      <Coins className="w-3.5 h-3.5 text-[#F7B407] mt-0.5" />

                      <div>
                        <span className="font-medium text-[#26253A]">
                          Coins Redeemed:
                        </span>

                        <span className="text-[#5C534A] ml-1">
                          {
                            coinsRedeemed
                          }{" "}
                          coins
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

/* =========================================================
   CHECKOUT PAGE
========================================================= */

export default function CheckoutPage() {
  const router = useRouter();

  const dispatch =
    useDispatch();

  const searchParams =
    useSearchParams();

  /* =======================================================
     URL DATA
  ======================================================= */

  const productId = Number(
    searchParams.get(
      "product_id"
    )
  );

  const quantity = Number(
    searchParams.get(
      "quantity"
    )
  );

  const isDirectCheckout =
    productId > 0 &&
    quantity > 0;

  const couponCode =
    searchParams.get(
      "coupon_code"
    );

  /* =======================================================
     STATE
  ======================================================= */

  const [
    selectedDeliveryAddress,
    setSelectedDeliveryAddress,
  ] =
    useState<Address | null>(
      null
    );

  const [
    deliveryMethod,
    setDeliveryMethod,
  ] = useState<string>("");

  const [
    isAddressModalOpen,
    setIsAddressModalOpen,
  ] = useState(false);

  const [
    editingAddress,
    setEditingAddress,
  ] =
    useState<Address | null>(
      null
    );

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    isCancelling,
    setIsCancelling,
  ] = useState(false);

  const [
    coinsRedeemed,
    setCoinsRedeemed,
  ] = useState(0);

  /* =======================================================
     ADDRESS API
  ======================================================= */

  const {
    data: addressesData,
    isLoading:
    isLoadingAddresses,
    refetch:
    refetchAddresses,
  } =
    useGetAddressesQuery();

  /* =======================================================
     SHIPPING API
  ======================================================= */

  const {
    data: shippingMethodsData,
    isLoading:
    isLoadingShippingMethods,
  } =
    useGetShippingMethodsQuery();

  /* =======================================================
     CHECKOUT API
  ======================================================= */

  const [
    placeOrder,
    {
      isLoading:
      isPlacingOrder,
    },
  ] =
    usePlaceOrderMutation();

  /* =======================================================
     ADDRESS MUTATIONS
  ======================================================= */

  const [
    createAddress,
    {
      isLoading:
      isCreating,
    },
  ] =
    useCreateAddressMutation();

  const [
    updateAddress,
    {
      isLoading:
      isUpdating,
    },
  ] =
    useUpdateAddressMutation();

  const [deleteAddress] =
    useDeleteAddressMutation();

  const [setDefaultAddress] =
    useSetDefaultAddressMutation();

  /* =======================================================
     NORMALIZE DATA
  ======================================================= */

  const addresses: Address[] =
    Array.isArray(
      addressesData?.data
    )
      ? addressesData.data
      : [];

  const shippingMethods =
    Array.isArray(
      shippingMethodsData?.data
    )
      ? shippingMethodsData.data
      : [];

  /* =======================================================
     DELIVERY ADDRESS FILTER
  ======================================================= */

  const deliveryAddresses =
    addresses.filter(
      (address) =>
        address.is_delivery ===
        true
    );

  const availableDeliveryAddresses =
    deliveryAddresses.length >
      0
      ? deliveryAddresses
      : addresses;

  /* =======================================================
     IMPORTANT:
     NO AUTO MODAL OPEN HERE
  ======================================================= */

  /*
    AddressFormModal will only open when:
    1. Add New clicked
    2. Edit clicked

    If there are zero addresses,
    the same form is rendered inline.
  */

  /* =======================================================
     SHIPPING METHODS
  ======================================================= */

  const activeShippingMethods =
    shippingMethods
      .filter(
        (method) =>
          method.is_active
      )
      .sort(
        (a, b) =>
          a.sort_order -
          b.sort_order
      );

  const selectedShippingMethod =
    shippingMethods.find(
      (method) =>
        method.code ===
        deliveryMethod
    );

  /* =======================================================
     AUTO SELECT SHIPPING
  ======================================================= */

  useEffect(() => {
    if (
      activeShippingMethods.length ===
      0
    ) {
      return;
    }

    const exists =
      activeShippingMethods.some(
        (method) =>
          method.code ===
          deliveryMethod
      );

    if (!exists) {
      setDeliveryMethod(
        activeShippingMethods[0]
          .code
      );
    }
  }, [
    shippingMethods,
    deliveryMethod,
  ]);

  /* =======================================================
     AUTO SELECT ADDRESS
  ======================================================= */

  useEffect(() => {
    if (
      addresses.length ===
      0
    ) {
      setSelectedDeliveryAddress(
        null
      );

      return;
    }

    const defaultAddress =
      addresses.find(
        (address) =>
          address.is_default ===
          true
      );

    const deliveryAddress =
      addresses.find(
        (address) =>
          address.is_delivery ===
          true
      );

    const selected =
      defaultAddress ||
      deliveryAddress ||
      addresses[0];

    setSelectedDeliveryAddress(
      selected
    );
  }, [addresses]);

  /* =======================================================
     CHECKOUT SUMMARY PARAMS
  ======================================================= */

  const checkoutSummaryParams = {
    ...(selectedDeliveryAddress?.id
      ? {
        address_id:
          selectedDeliveryAddress.id,
      }
      : {}),

    ...(selectedShippingMethod?.id
      ? {
        shipping_method_id:
          selectedShippingMethod.id,
      }
      : {}),

    ...(couponCode
      ? {
        coupon_code:
          couponCode,
      }
      : {}),

    ...(coinsRedeemed > 0
      ? {
        coins:
          coinsRedeemed,
      }
      : {}),

    ...(isDirectCheckout
      ? {
        product_id:
          productId,

        quantity,
      }
      : {}),
  };

  /* =======================================================
     CHECKOUT SUMMARY
  ======================================================= */

  const {
    data:
    checkoutSummaryResponse,

    isLoading:
    isLoadingCheckoutSummary,

    isFetching:
    isFetchingCheckoutSummary,

    isError:
    isCheckoutSummaryError,

    refetch:
    refetchCheckoutSummary,
  } =
    useGetCheckoutSummaryQuery(
      checkoutSummaryParams
    );

  /* =======================================================
     CREATE ADDRESS
  ======================================================= */

  const handleCreateAddress =
    async (
      data: AddressFormData
    ) => {
      try {
        const payload: any = {
          recipient_name:
            data.recipient_name,

          contact_number:
            data.contact_number,

          address_line_1:
            data.address_line_1,

          address_line_2:
            data.address_line_2 ||
            null,

          city:
            data.city,

          state:
            data.state,

          postcode:
            data.postcode,

          country:
            data.country,

          is_default:
            data.is_default
              ? 1
              : 0,

          is_delivery: 1,

          is_billing: 1,

          billing_recipient_name:
            data.billing_recipient_name ||
            data.recipient_name,

          billing_contact_number:
            data.billing_contact_number ||
            data.contact_number,

          billing_address_line_1:
            data.billing_address_line_1 ||
            data.address_line_1,

          billing_address_line_2:
            data.billing_address_line_2 ||
            data.address_line_2 ||
            null,

          billing_city:
            data.billing_city ||
            data.city,

          billing_state:
            data.billing_state ||
            data.state,

          billing_postcode:
            data.billing_postcode ||
            data.postcode,

          billing_country:
            data.billing_country ||
            data.country,
        };

        const result =
          await createAddress(
            payload
          ).unwrap();

        if (result.status) {
          dispatch(
            showToast({
              message:
                "Address added successfully!",
              type:
                "success",
            })
          );

          /*
            First refetch address list.
            Once address comes back,
            inline form disappears automatically
            because addresses.length > 0.
          */

          await refetchAddresses();

          setIsAddressModalOpen(
            false
          );

          setEditingAddress(
            null
          );

          setTimeout(() => {
            refetchCheckoutSummary();
          }, 100);
        }
      } catch (error: any) {
        if (
          error?.data?.errors
        ) {
          const errors =
            error.data.errors;

          const firstKey =
            Object.keys(
              errors
            )[0];

          const message =
            errors[firstKey]?.[0] ||
            "Validation failed";

          dispatch(
            showToast({
              message,
              type: "error",
            })
          );
        } else {
          dispatch(
            showToast({
              message:
                error?.data
                  ?.message ||
                "Failed to add address. Please try again.",
              type:
                "error",
            })
          );
        }
      }
    };

  /* =======================================================
     UPDATE ADDRESS
  ======================================================= */

  const handleUpdateAddress =
    async (
      data: AddressFormData
    ) => {
      if (!editingAddress) {
        return;
      }

      try {
        const payload: UpdateAddressRequest =
        {
          recipient_name:
            data.recipient_name,

          contact_number:
            data.contact_number,

          address_line_1:
            data.address_line_1,

          address_line_2:
            data.address_line_2 ||
            undefined,

          city:
            data.city,

          state:
            data.state,

          postcode:
            data.postcode,

          country:
            data.country,

          is_default:
            data.is_default,

          is_delivery:
            true,

          is_billing:
            true,

          billing_recipient_name:
            data.billing_recipient_name,

          billing_contact_number:
            data.billing_contact_number,

          billing_address_line_1:
            data.billing_address_line_1,

          billing_address_line_2:
            data.billing_address_line_2,

          billing_city:
            data.billing_city,

          billing_state:
            data.billing_state,

          billing_postcode:
            data.billing_postcode,

          billing_country:
            data.billing_country,
        };

        const result =
          await updateAddress({
            id:
              editingAddress.id,

            data:
              payload,
          }).unwrap();

        if (result.status) {
          dispatch(
            showToast({
              message:
                "Address updated successfully!",
              type:
                "success",
            })
          );

          await refetchAddresses();

          setIsAddressModalOpen(
            false
          );

          setEditingAddress(
            null
          );

          setTimeout(() => {
            refetchCheckoutSummary();
          }, 100);
        }
      } catch (error: any) {
        dispatch(
          showToast({
            message:
              error?.data?.message ||
              "Failed to update address. Please try again.",
            type:
              "error",
          })
        );
      }
    };

  /* =======================================================
     DELETE ADDRESS
  ======================================================= */

  const handleDeleteAddress =
    async (
      id: number,
      data: DeleteAddressRequest
    ) => {
      try {
        const result =
          await deleteAddress({
            id,
            data,
          }).unwrap();

        if (result.status) {
          dispatch(
            showToast({
              message:
                "Address deleted successfully!",
              type:
                "success",
            })
          );

          await refetchAddresses();

          /*
             If the last address was deleted,
             availableDeliveryAddresses becomes empty
             and inline form automatically appears.
          */

          setTimeout(() => {
            refetchCheckoutSummary();
          }, 100);
        }
      } catch (error: any) {
        dispatch(
          showToast({
            message:
              error?.data?.message ||
              "Failed to delete address",
            type:
              "error",
          })
        );
      }
    };

  /* =======================================================
     DEFAULT ADDRESS
  ======================================================= */

  const handleSetDefaultAddress =
    async (
      id: number
    ) => {
      try {
        const result =
          await setDefaultAddress(
            id
          ).unwrap();

        if (result.status) {
          dispatch(
            showToast({
              message:
                "Default address updated!",
              type:
                "success",
            })
          );

          await refetchAddresses();

          setTimeout(() => {
            refetchCheckoutSummary();
          }, 100);
        }
      } catch (error: any) {
        dispatch(
          showToast({
            message:
              error?.data?.message ||
              "Failed to set default address",
            type:
              "error",
          })
        );
      }
    };

  /* =======================================================
     PAY NOW
  ======================================================= */

  const handlePayNow =
    async () => {
      if (
        !selectedDeliveryAddress
      ) {
        dispatch(
          showToast({
            message:
              "Please select a delivery address to continue",
            type:
              "error",
          })
        );

        return;
      }

      if (
        !checkoutSummaryResponse?.data
      ) {
        dispatch(
          showToast({
            message:
              "Checkout summary is not available",
            type:
              "error",
          })
        );

        return;
      }

      const grandTotal =
        Number(
          checkoutSummaryResponse
            .data
            .grand_total
        );

      if (
        !grandTotal ||
        grandTotal <= 0
      ) {
        dispatch(
          showToast({
            message:
              "Invalid order amount",
            type:
              "error",
          })
        );

        return;
      }

      try {
        setIsSubmitting(
          true
        );

        const summaryData =
          checkoutSummaryResponse.data;

        const orderPayload: any =
        {
          address_id:
            selectedDeliveryAddress.id,

          grand_total:
            grandTotal,

          payment_gateway:
            "razorpay",

          summary_data: {
            subtotal:
              summaryData.subtotal,

            coupon_discount:
              summaryData.coupon_discount ||
              0,

            coupon_code:
              couponCode ||
              null,

            shipping_charge:
              summaryData.shipping_cost ||
              0,

            shipping_method_id:
              selectedShippingMethod?.id ||
              null,

            coin_redeemed:
              coinsRedeemed ||
              0,

            amount_redeemed:
              summaryData.amount_redeemed ||
              0,

            total_tax:
              summaryData.total_tax,

            net_subtotal:
              summaryData.subtotal_after_discount,
          },
        };

        if (
          isDirectCheckout
        ) {
          orderPayload.product_id =
            productId;

          orderPayload.quantity =
            quantity;
        }

        const response =
          await placeOrder(
            orderPayload
          ).unwrap();

        if (
          !response.success ||
          !response.data
        ) {
          throw new Error(
            response.message ||
            "Unable to place order"
          );
        }

        dispatch(
          showToast({
            message:
              "Order created successfully!",
            type:
              "success",
          })
        );

        await openRazorpay({
          orderId:
            response.data
              .order_id,

          orderReference:
            response.data
              .order_reference,

          amount:
            Number(
              response.data.amount
            ),

          razorpayOrderId:
            response.data
              .razorpay_order_id,

          razorpayKey:
            response.data
              .razorpay_key,
        });

        setIsSubmitting(
          false
        );
      } catch (error: any) {
        console.error(
          "Place Order Error:",
          error
        );

        setIsSubmitting(
          false
        );

        dispatch(
          showToast({
            message:
              error?.data?.message ||
              error?.message ||
              "Failed to place order",
            type:
              "error",
          })
        );
      }
    };

  /* =======================================================
     RAZORPAY
  ======================================================= */

  const openRazorpay =
    (
      nextOrderData: {
        orderId: number;
        orderReference: string;
        amount: number;
        razorpayOrderId: string;
        razorpayKey: string;
      }
    ) => {
      return new Promise(
        (
          resolve,
          reject
        ) => {
          if (
            !(window as any)
              .Razorpay
          ) {
            const script =
              document.createElement(
                "script"
              );

            script.src =
              "https://checkout.razorpay.com/v1/checkout.js";

            script.async =
              true;

            script.onload = () => {
              initRazorpay(
                nextOrderData,
                resolve,
                reject
              );
            };

            script.onerror =
              () => {
                reject(
                  new Error(
                    "Failed to load Razorpay SDK"
                  )
                );
              };

            document.body.appendChild(
              script
            );
          } else {
            initRazorpay(
              nextOrderData,
              resolve,
              reject
            );
          }
        }
      );
    };

  const initRazorpay =
    (
      nextOrderData: {
        orderId: number;
        orderReference: string;
        amount: number;
        razorpayOrderId: string;
        razorpayKey: string;
      },

      resolve: (
        value: any
      ) => void,

      reject: (
        reason: any
      ) => void
    ) => {
      const options = {
        key:
          nextOrderData.razorpayKey,

        amount:
          Math.round(
            Number(
              nextOrderData.amount
            ) * 100
          ),

        currency:
          "INR",

        name:
          "IndieKonnect",

        description:
          `Order #${nextOrderData.orderReference}`,

        order_id:
          nextOrderData.razorpayOrderId,

        prefill: {
          name: "",
          email: "",
          contact: "",
        },

        notes: {
          order_id:
            String(
              nextOrderData.orderId
            ),

          order_reference:
            nextOrderData.orderReference,
        },

        theme: {
          color:
            "#F7B407",
        },

        handler:
          function (
            response: any
          ) {
            console.log(
              "Razorpay Success:",
              response
            );

            router.push(
              `/order-confirmation?order_id=${nextOrderData.orderId}&order_reference=${nextOrderData.orderReference}`
            );

            resolve(
              response
            );
          },

        modal: {
          ondismiss:
            function () {
              setIsSubmitting(
                false
              );

              reject(
                new Error(
                  "Payment cancelled"
                )
              );
            },
        },
      };

      try {
        const razorpay =
          new (window as any).Razorpay(
            options
          );

        razorpay.on(
          "payment.failed",
          function (
            response: any
          ) {
            console.error(
              "Payment Failed:",
              response
            );

            setIsSubmitting(
              false
            );

            const errorMessage =
              response?.error
                ?.description ||
              "Payment failed. Please try again.";

            dispatch(
              showToast({
                message:
                  errorMessage,
                type:
                  "error",
              })
            );

            reject(
              new Error(
                errorMessage
              )
            );
          }
        );

        razorpay.open();
      } catch (error) {
        setIsSubmitting(
          false
        );

        reject(error);
      }
    };

  /* =======================================================
     CANCEL
  ======================================================= */

  const handleCancelOrder =
    () => {
      setIsCancelling(
        true
      );

      dispatch(
        showToast({
          message:
            "Checkout cancelled",
          type:
            "error",
        })
      );

      setTimeout(() => {
        setIsCancelling(
          false
        );

        router.push(
          isDirectCheckout
            ? "/products"
            : "/cart"
        );
      }, 400);
    };

  /* =======================================================
     GRAND TOTAL
  ======================================================= */

  const grandTotal =
    checkoutSummaryResponse
      ?.data
      ?.grand_total || 0;

  /* =======================================================
     PAGE HELPERS
  ======================================================= */

  const pageTitle =
    isDirectCheckout
      ? "Quick Checkout"
      : "Secure Checkout";

  /* =======================================================
     UI
  ======================================================= */

  return (
    <>
      <Header />

      {/* ===================================================
          BANNER
      =================================================== */}

      <motion.div
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        className="relative w-full h-[160px] md:h-[200px] lg:h-[240px] overflow-hidden"
      >
        <Image
          src={BannerImage}
          alt="Checkout Banner"
          fill
          className="object-cover"
          priority
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#0A1628]/90 via-[#0A1628]/60 to-transparent flex items-center">
          <div className="container mx-auto px-4">
            <div className="px-6 md:px-12 max-w-3xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-1.5 bg-gradient-to-r from-[#F7B407] to-[#f5c94a] rounded-lg">
                  <ShoppingBag className="w-5 h-5 text-[#26253A]" />
                </div>

                <span className="text-[#F7B407] text-sm font-medium tracking-widest uppercase">
                  {isDirectCheckout
                    ? "Quick Checkout"
                    : "Checkout"}
                </span>

                {isDirectCheckout && (
                  <span className="text-[10px] bg-[#F7B407]/20 px-2.5 py-0.5 rounded-full text-[#F7B407] border border-[#F7B407]/30">
                    Direct Purchase
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-white mb-1 flex items-center gap-3">
                {pageTitle}

                <span className="text-xs bg-[#F7B407]/20 px-3 py-1 rounded-full text-[#F7B407] border border-[#F7B407]/30">
                  <Shield className="w-3 h-3 inline mr-1" />
                  Protected
                </span>
              </h1>

              <p className="text-white/70 text-sm">
                {isDirectCheckout
                  ? `Complete your purchase for ${quantity} item${quantity > 1
                    ? "s"
                    : ""
                  }`
                  : "Add your address and payment details — one simple step"}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ===================================================
          MAIN
      =================================================== */}

      <div className="relative min-h-screen bg-[#F8F4EE] pb-6">
        <div className="container mx-auto px-4 py-8">
          {/* NAVIGATION */}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <button
              type="button"
              onClick={() =>
                router.back()
              }
              className="flex items-center gap-2 text-[#5C534A] hover:text-[#F7B407] text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </button>

            <nav className="flex items-center gap-1.5 text-xs text-[#8a7f6e]">
              <Link
                href="/"
                className="hover:text-[#F7B407]"
              >
                Home
              </Link>

              <ChevronRight className="w-3 h-3" />

              <Link
                href={
                  isDirectCheckout
                    ? "/products"
                    : "/cart"
                }
                className="hover:text-[#F7B407]"
              >
                {isDirectCheckout
                  ? "Products"
                  : "Cart"}
              </Link>

              <ChevronRight className="w-3 h-3" />

              <span className="text-[#F7B407] font-medium">
                Checkout
              </span>
            </nav>
          </div>

          {/* PAGE HEADER */}

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl text-[#26253A] flex items-center gap-3">
                {isDirectCheckout
                  ? "Quick Checkout"
                  : "Checkout"}

                <span className="text-xs bg-[#F7B407]/20 px-3 py-1 rounded-full text-[#F7B407] font-medium border border-[#F7B407]/30">
                  {isDirectCheckout
                    ? "Direct"
                    : "3 Steps"}
                </span>
              </h1>

              <p className="text-sm text-[#8a7f6e] mt-1 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#F7B407]" />

                {isDirectCheckout
                  ? `Purchase ${quantity} item${quantity > 1
                    ? "s"
                    : ""
                  } directly`
                  : "Review your address, delivery and payment details below"}
              </p>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-sm text-[#5C534A] bg-white border border-[#E7DBC0] rounded-full px-4 py-2 shadow-sm">
              <Shield className="w-4 h-4 text-[#F7B407]" />
              Secure Checkout
            </div>
          </div>

          {/* =================================================
              GRID
          ================================================= */}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* =================================================
                LEFT
            ================================================= */}

            <div className="lg:col-span-2 space-y-6">
              {/* =================================================
                  DELIVERY ADDRESS
              ================================================= */}

              <motion.section
                initial={{
                  opacity: 0,
                  y: 16,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="bg-white border border-[#E7DBC0] rounded-2xl overflow-hidden shadow-md"
              >
                {/* HEADER */}

                <div className="flex items-center justify-between px-6 py-5 border-b border-[#F0E9D8] bg-gradient-to-r from-[#FBF6EC] to-transparent">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F7B407]/15 border border-[#F7B407]/30 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-[#F7B407]" />
                    </div>

                    <div>
                      <h2 className="text-lg text-[#26253A]">
                        Delivery Address
                      </h2>

                      <p className="text-xs text-[#8a7f6e]">
                        {availableDeliveryAddresses.length >
                          0
                          ? "Select your delivery address"
                          : "Where should we deliver your order?"}
                      </p>
                    </div>
                  </div>

                  {/* =================================================
                      ADD NEW ONLY IF ADDRESS EXISTS
                  ================================================= */}

                  {availableDeliveryAddresses.length >
                    0 && (
                      <motion.button
                        whileHover={{
                          scale: 1.02,
                        }}
                        whileTap={{
                          scale: 0.95,
                        }}
                        type="button"
                        onClick={() => {
                          setEditingAddress(
                            null
                          );

                          setIsAddressModalOpen(
                            true
                          );
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#F7B407] to-[#f5c94a] text-[#26253A] text-xs font-medium rounded-lg hover:shadow-lg transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />

                        Add New
                      </motion.button>
                    )}
                </div>

                {/* BODY */}

                <div className="p-6">
                  {isLoadingAddresses ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-8 h-8 text-[#F7B407] animate-spin" />
                    </div>
                  ) : availableDeliveryAddresses.length >
                    0 ? (
                    /*
                      ADDRESS EXISTS
                      ↓
                      SHOW CARDS
                    */

                    <div className="space-y-3">
                      {availableDeliveryAddresses.map(
                        (address) => (
                          <AddressCard
                            key={
                              address.id
                            }
                            address={
                              address
                            }
                            isSelected={
                              selectedDeliveryAddress?.id ===
                              address.id
                            }
                            onSelect={() =>
                              setSelectedDeliveryAddress(
                                address
                              )
                            }
                            onEdit={() => {
                              setEditingAddress(
                                address
                              );

                              setIsAddressModalOpen(
                                true
                              );
                            }}
                            onDelete={(
                              data
                            ) =>
                              handleDeleteAddress(
                                address.id,
                                data
                              )
                            }
                            onSetDefault={() =>
                              handleSetDefaultAddress(
                                address.id
                              )
                            }
                            isDefault={
                              address.is_default ===
                              true
                            }
                          />
                        )
                      )}
                    </div>
                  ) : (

                    <div className="rounded-2xl border border-[#E7DBC0] bg-[#FBF6EC]/50 overflow-hidden">


                      {/* SAME MODAL FORM INLINE */}

                      <AddressFormModal
                        isOpen={true}
                        inline={true}
                        onClose={() => { }}
                        onSubmit={
                          handleCreateAddress
                        }
                        initialData={
                          null
                        }
                        isLoading={
                          isCreating
                        }
                      />
                    </div>
                  )}
                </div>
              </motion.section>

              {/* =================================================
                  DELIVERY METHOD
              ================================================= */}

              <motion.section
                initial={{
                  opacity: 0,
                  y: 16,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="bg-white border border-[#E7DBC0] rounded-2xl overflow-hidden shadow-md"
              >
                <div className="flex items-center gap-3 px-6 py-5 border-b border-[#F0E9D8]">
                  <div className="w-10 h-10 rounded-xl bg-[#F7B407]/15 border border-[#F7B407]/30 flex items-center justify-center">
                    <Truck className="w-5 h-5 text-[#F7B407]" />
                  </div>

                  <div>
                    <h2 className="text-lg text-[#26253A]">
                      Delivery Method
                    </h2>

                    <p className="text-xs text-[#8a7f6e]">
                      Choose how fast you want your order
                    </p>
                  </div>
                </div>

                <div className="p-6">
                  {isLoadingShippingMethods ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-8 h-8 text-[#F7B407] animate-spin" />
                    </div>
                  ) : activeShippingMethods.length >
                    0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {activeShippingMethods.map(
                        (
                          method
                        ) => {
                          const isActive =
                            deliveryMethod ===
                            method.code;

                          const Icon =
                            method.code ===
                              "express"
                              ? Zap
                              : method.code ===
                                "free"
                                ? CheckCircle2
                                : Truck;

                          const priceValue =
                            Number(
                              method.base_rate ||
                              0
                            );

                          const price =
                            method.rate_type ===
                              "free" ||
                              priceValue ===
                              0
                              ? "Free"
                              : `₹${priceValue.toFixed(
                                2
                              )}`;

                          return (
                            <label
                              key={
                                method.id
                              }
                              className={`relative flex items-start gap-3 rounded-xl border-2 p-4 cursor-pointer transition-all ${isActive
                                  ? "border-[#F7B407] bg-[#F7B407]/10"
                                  : "border-[#E7DBC0]"
                                }`}
                            >
                              <input
                                type="radio"
                                name="deliveryMethod"
                                value={
                                  method.code
                                }
                                checked={
                                  isActive
                                }
                                onChange={() =>
                                  setDeliveryMethod(
                                    method.code
                                  )
                                }
                                className="sr-only"
                              />

                              <div
                                className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border-2 ${isActive
                                    ? "bg-gradient-to-r from-[#F7B407] to-[#f5c94a] border-[#F7B407]"
                                    : "bg-[#FBF6EC] border-[#E7DBC0]"
                                  }`}
                              >
                                <Icon className="w-5 h-5" />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-sm text-[#26253A]">
                                    {
                                      method.name
                                    }
                                  </span>

                                  {isActive && (
                                    <CheckCircle2 className="w-4 h-4 text-[#F7B407]" />
                                  )}
                                </div>

                                <p className="text-xs text-[#8a7f6e] mt-0.5">
                                  {
                                    method.description
                                  }
                                </p>

                                <p className="text-xs text-[#8a7f6e] mt-1 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Estimated delivery:{" "}
                                  {
                                    method.estimated_days
                                  }{" "}
                                  days
                                </p>

                                <p className="text-sm font-bold mt-1.5 text-[#26253A]">
                                  {price}
                                </p>
                              </div>
                            </label>
                          );
                        }
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Truck className="w-12 h-12 text-[#D9CFBA] mx-auto mb-2" />

                      <p className="text-sm text-[#5C534A]">
                        No delivery methods available
                      </p>
                    </div>
                  )}
                </div>
              </motion.section>
            </div>

            {/* =================================================
                RIGHT
            ================================================= */}

            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* ORDER SUMMARY */}

                <OrderSummary
                  summaryData={
                    checkoutSummaryResponse?.data
                  }
                  isLoading={
                    isLoadingCheckoutSummary
                  }
                  isFetching={
                    isFetchingCheckoutSummary
                  }
                  selectedDeliveryAddress={
                    selectedDeliveryAddress
                  }
                  selectedShippingMethod={
                    selectedShippingMethod
                  }
                  couponCode={
                    couponCode
                  }
                  coinsRedeemed={
                    coinsRedeemed
                  }
                  isDirectCheckout={
                    isDirectCheckout
                  }
                />

                {/* ERROR */}

                {isCheckoutSummaryError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                    <p className="text-xs text-red-600">
                      Checkout summary could not be loaded.
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        refetchCheckoutSummary()
                      }
                      className="text-xs font-semibold underline mt-1"
                    >
                      Retry
                    </button>
                  </div>
                )}

                {/* PAYMENT */}

                <motion.section
                  initial={{
                    opacity: 0,
                    y: 16,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="bg-white border border-[#E7DBC0] rounded-2xl overflow-hidden shadow-md"
                >
                  <div className="flex items-center gap-3 px-5 py-4 border-b border-[#F0E9D8]">
                    <div className="w-9 h-9 rounded-xl bg-[#F7B407]/15 border border-[#F7B407]/30 flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-[#F7B407]" />
                    </div>

                    <div>
                      <h2 className="text-base text-[#26253A]">
                        Payment Details
                      </h2>

                      <p className="text-[11px] text-[#8a7f6e]">
                        Secure payment powered by Razorpay
                      </p>
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="bg-[#F7B407]/10 rounded-xl p-4 border border-[#F7B407]/20">
                      <div className="p-4 bg-white rounded-xl border-2 border-[#F7B407]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#FBF6EC] flex items-center justify-center">
                              <Image
                                src={
                                  Razorpay
                                }
                                alt="Razorpay"
                                width={
                                  50
                                }
                                height={
                                  50
                                }
                                className="object-cover"
                              />
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-[#26253A]">
                                Razorpay
                              </p>

                              <p className="text-xs text-[#8a7f6e]">
                                UPI, Cards, Net Banking & Wallets
                              </p>
                            </div>
                          </div>

                          <CheckCircle2 className="w-5 h-5 text-[#F7B407]" />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[#8a7f6e] bg-[#F7B407]/5 p-3 rounded-lg border border-[#F7B407]/20">
                      <Shield className="w-4 h-4 text-[#F7B407]" />

                      <span>
                        Your payment is secure and encrypted by Razorpay
                      </span>
                    </div>

                    {/* PAY */}

                    <motion.button
                      whileHover={{
                        scale: 1.01,
                      }}
                      whileTap={{
                        scale: 0.98,
                      }}
                      type="button"
                      onClick={
                        handlePayNow
                      }
                      disabled={
                        isSubmitting ||
                        !selectedDeliveryAddress
                      }
                      className="w-full py-3.5 bg-gradient-to-r from-[#F7B407] to-[#f5c94a] text-[#26253A] rounded-xl font-medium disabled:opacity-60 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Creating Order...
                        </>
                      ) : (
                        <>
                          <Wallet className="w-4 h-4" />

                          Pay ₹
                          {Number(
                            grandTotal
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.section>

                {/* TRUST */}

                <div className="bg-white border border-[#E7DBC0] rounded-xl p-4 space-y-2.5 shadow-sm">
                  <div className="flex items-center gap-2 text-xs text-[#5C534A]">
                    <Truck className="w-3.5 h-3.5 text-[#F7B407]" />

                    <span>
                      Free shipping on orders over ₹50
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[#5C534A]">
                    <Shield className="w-3.5 h-3.5 text-[#F7B407]" />

                    <span>
                      Secure checkout guaranteed
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[#5C534A]">
                    <Headphones className="w-3.5 h-3.5 text-[#F7B407]" />

                    <span>
                      24/7 customer support
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            STICKY BOTTOM BAR
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="sticky bottom-0 left-0 right-0 z-30 mt-8"
        >
          <div className="bg-white/95 backdrop-blur-md border-t border-[#E7DBC0] shadow-[0_-8px_30px_rgba(43,36,32,0.08)]">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={
                    handleCancelOrder
                  }
                  disabled={
                    isCancelling
                  }
                  className="flex items-center gap-2 px-5 py-3 rounded-full border-2 border-[#E7DBC0] text-[#5C534A] text-sm font-medium disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>

                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:flex flex-col items-end leading-tight">
                      <span className="text-[11px] text-[#8a7f6e] flex items-center gap-1">
                        <Truck className="w-3 h-3" />
                        Delivery
                      </span>

                      <span className="text-sm font-semibold text-[#26253A]">
                        {selectedShippingMethod?.name || "Select Delivery"}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handlePayNow}
                      disabled={isSubmitting || !selectedDeliveryAddress}
                      className="flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-[#F7B407] via-[#f5c94a] to-[#e6b83d] text-[#26253A] text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Wallet className="w-4 h-4" />
                          Pay ₹
                          {Number(grandTotal).toLocaleString("en-IN")}
                        </>
                      )}
                    </button>
                  </div>

                  {!selectedDeliveryAddress && !isLoadingAddresses && (
                    <p className="text-[10px] text-[#8a7f6e] text-right">
                      Please add a delivery address before proceeding to payment.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* =================================================
          POPUP MODAL

          This is ONLY used when:
          - Add New clicked
          - Edit clicked

          It never opens automatically.
      ================================================= */}

      <AddressFormModal
        isOpen={
          isAddressModalOpen
        }
        inline={false}
        onClose={() => {
          if (
            !isCreating &&
            !isUpdating
          ) {
            setIsAddressModalOpen(
              false
            );

            setEditingAddress(
              null
            );
          }
        }}
        onSubmit={
          editingAddress
            ? handleUpdateAddress
            : handleCreateAddress
        }
        initialData={
          editingAddress
        }
        isLoading={
          isCreating ||
          isUpdating
        }
      />

      <Footer />
    </>
  );
}