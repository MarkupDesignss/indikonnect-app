"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type RefObject,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Poppins } from "next/font/google";
import {
  ArrowLeft,
  ArrowRight,
  BadgePercent,
  Check,
  ChevronDown,
  ChevronRight,
  Home,
  Info,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Tag,
  X,
  AlertTriangle,
  Trash2,
} from "lucide-react";
import { toast } from "react-hot-toast";

import Header from "../../../components/common/Header";
import Footer from "../../../components/Footer/Footer";
import Loding from "@/components/common/Loding";

import {
  useGetCartQuery,
  useRemoveFromCartMutation,
  useClearCartMutation,
  useUpdateCartItemMutation,
  useAddToCartMutation,
  useCheckCartStockMutation,
  useGetCouponsQuery,
} from "@/lib/redux/api/cartApi";

import { useGetProductsQuery } from "@/lib/redux/api/productApi";

import { useGetCheckoutSummaryQuery } from "@/lib/redux/api/checkoutApi";

import {
  useGetAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
} from "@/lib/redux/api/addressApi";

import { useGetUserDashboardQuery } from "@/lib/redux/api/distributor/userDashboardApi";
import { useGetUserProfileQuery } from "@/lib/redux/api/authApi";
import AddressFormModal from "@/Screens/CheckoutPage/AddressFormModal";

const PAGE_BG = "#FFFFFF";
const PLACEHOLDER_IMAGE = "/indiekonnect-web/images/placeholder.jpg";
const MAX_CART_QUANTITY = 10;

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

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
  type?: string;
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
  type?: string;
}

interface ProductTaxonomy {
  id?: number;
  title?: string | null;
  name?: string | null;
  slug?: string | null;
  category_id?: number;
}

interface VariantData {
  id: number;
  sku?: string | null;
  attributes?: Record<string, string> | null;
  attribute_string?: string | null;
  retail_price?: string | null;
  distributor_price?: string | null;
  stock_quantity?: number | null;
}

interface CartProduct {
  id: number;
  name: string;
  slug: string;
  product_code: string;
  retail_price?: string | null;
  retail_mrp?: string | null;
  distributor_price?: string | null;
  distributor_mrp?: string | null;
  commission_value?: string | number | null;
  stock_quantity?: number | null;
  available_stock?: number | null;
  category?: ProductTaxonomy | null;
  subcategory?: ProductTaxonomy | null;
  brand?: ProductTaxonomy | null;
}

interface CartItemApi {
  id: number;
  product_id: number;
  variant_id?: number | null;
  product: CartProduct;
  variant?: VariantData | null;
  variant_attributes?: Record<string, string> | null;
  quantity: number;
  current_unit_price: string;
  current_unit_price_formatted?: string | null;
  subtotal: number;
  subtotal_formatted?: string | null;
  image_url?: string | null;
  current_price_type?: string | null;
}

interface CartItemView {
  id: number;
  cartItemId: number;
  productId: number;
  variantId: number | null;
  name: string;
  slug: string;
  image: string;
  price: number;
  originalPrice?: number;
  productCode: string;
  sku: string;
  category: string;
  subcategory: string;
  brand: string;
  variantLabel: string;
  variantAttributes: Record<string, string>;
  quantity: number;
  stockQuantity: number | null;
  priceType: string;
  commissionPoints: number;
}

interface TaxCategory {
  category: string;
  rate: string;
  taxable_amount: number;
  tax_amount: number;
  cgst: number;
  sgst: number;
  igst: number;
  is_gst: boolean;
  product_name?: string;
  total_shipping_charge?: number;
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
  total_tax: number;
  shipping_cost: number;
  subtotal_after_discount_and_tax: number;
  max_coins_redeemable: number;
  coins_used: number;
  amount_redeemed: number;
  grand_total: number;
  items?: any[];
  total_commission?: string | number | null;
  tax_by_category?: TaxCategory[];
  tax_breakdown?: any[];
}

interface CouponListItem {
  id?: number;
  code: string;
  title?: string;
  description?: string;
  type?: string;
  value?: string | number;
  is_active?: boolean | number | string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const getImageUrl = (url?: string | null): string => {
  if (!url || typeof url !== "string") return PLACEHOLDER_IMAGE;

  const value = url.trim().replace(/\\\//g, "/");

  if (!value) return PLACEHOLDER_IMAGE;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("//")) return `https:${value}`;
  if (value.startsWith("/indiekonnect-web/")) return value;

  return `https://www.markupdesigns.net/indikonnect/${value.replace(/^\/+/, "")}`;
};

const getRecommendedImage = (product: any): string => {
  const images = Array.isArray(product?.images) ? product.images : [];

  const primary = images.find(
    (image: any) => image?.is_primary === true || image?.is_primary === 1,
  );

  const readImage = (value: any): string => {
    if (typeof value === "string") return value;

    return value?.image_url || value?.url || value?.image || "";
  };

  const url =
    readImage(product?.primary_image_url) ||
    readImage(product?.primary_image) ||
    readImage(product?.image_url) ||
    readImage(product?.image) ||
    readImage(primary) ||
    readImage(images[0]) ||
    readImage(product?.product?.primary_image_url) ||
    readImage(product?.product?.images?.[0]);

  return getImageUrl(url);
};

const parsePrice = (value?: string | number | null): number => {
  const parsed = Number(value ?? 0);

  return Number.isFinite(parsed) ? parsed : 0;
};

const formatPrice = (value: number): string =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  })}`;

const formatPoints = (value: number): string =>
  `${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  })} pts`;

const formatAttributeName = (value: string): string =>
  value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

const getTaxonomyName = (value?: ProductTaxonomy | null): string =>
  String(value?.title || value?.name || "").trim();

const getVariantLabel = (
  variant?: VariantData | null,
  variantAttributes?: Record<string, string> | null,
): string => {
  if (variant?.attribute_string?.trim()) {
    return variant.attribute_string.trim();
  }

  const attributes = variantAttributes || variant?.attributes || {};

  return Object.entries(attributes)
    .map(([key, value]) => `${formatAttributeName(key)}: ${value}`)
    .join(" • ");
};

const getOriginalPrice = (item: CartItemApi, currentPrice: number) => {
  const isDistributor =
    String(item.current_price_type || "").toLowerCase() === "distributor";

  const variantPrice = isDistributor
    ? parsePrice(item.variant?.distributor_price)
    : parsePrice(item.variant?.retail_price);

  const productPrice = isDistributor
    ? parsePrice(
        item.product?.distributor_mrp ?? item.product?.distributor_price,
      )
    : parsePrice(item.product?.retail_mrp ?? item.product?.retail_price);

  const candidate =
    variantPrice > 0 ? variantPrice : productPrice > 0 ? productPrice : 0;

  return candidate > currentPrice ? candidate : undefined;
};

const getCouponValueLabel = (coupon: CouponListItem): string => {
  const type = String(coupon.type || "").toLowerCase();
  const value = coupon.value ?? 0;

  if (type.includes("percent") || type === "%") {
    return `${value}% OFF`;
  }

  if (Number(value) > 0) {
    return `${formatPrice(Number(value))} OFF`;
  }

  return "Discount";
};

const getErrorMessage = (error: any, fallback: string): string =>
  error?.data?.message ||
  error?.error?.data?.message ||
  error?.data?.error ||
  error?.message ||
  fallback;

// ─────────────────────────────────────────────────────────────────────────────
// Breadcrumb
// ─────────────────────────────────────────────────────────────────────────────

const Breadcrumb = ({ currentPage = "Cart" }: { currentPage?: string }) => {
  const router = useRouter();

  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-4 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap py-1 text-[11px] font-medium sm:mb-5"
    >
      <button
        type="button"
        onClick={() => router.push("/")}
        className="flex items-center gap-1 text-[#777] transition hover:text-black"
      >
        <Home className="h-3.5 w-3.5" />
        Home
      </button>

      <ChevronRight className="h-3 w-3 shrink-0 text-[#B0B0AD]" />

      <span className="text-[#111]">{currentPage}</span>
    </nav>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Empty cart
// ─────────────────────────────────────────────────────────────────────────────

const EmptyCart = () => {
  const router = useRouter();

  return (
    <section className="rounded-xl border border-[#E8E8E8] bg-white px-5 py-16 text-center sm:py-20">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F4F4F4]">
        <ShoppingBag className="h-6 w-6 text-[#222]" strokeWidth={1.5} />
      </div>

      <h2 className="mt-5 text-[20px] font-semibold text-[#111]">
        Your cart is empty
      </h2>

      <p className="mx-auto mt-2 max-w-sm text-[12px] leading-5 text-[#777]">
        Discover something beautiful from our curated collection.
      </p>

      <button
        type="button"
        onClick={() => router.push("/products")}
        className="mt-6 inline-flex h-10 items-center gap-2 rounded-md bg-black px-5 text-[11px] font-semibold uppercase tracking-wide text-white transition hover:bg-[#333]"
      >
        Continue Shopping
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Address Selector Modal
// ─────────────────────────────────────────────────────────────────────────────

function AddressSelectorModal({
  isOpen,
  addresses,
  selectedId,
  onSelect,
  onEdit,
  onAddNew,
  onDelete,
  deletingId,
  onClose,
}: {
  isOpen: boolean;
  addresses: Address[];
  selectedId?: number;
  onSelect: (address: Address) => void;
  onEdit: (address: Address) => void;
  onAddNew: () => void;
  onDelete: (address: Address) => void;
  deletingId: number | null;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 p-5">
          <div>
            <h2 className="text-[16px] font-semibold text-gray-900">
              Select Delivery Address
            </h2>

            <p className="mt-1 text-[12px] text-gray-500">
              Choose where you want your order delivered
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 transition hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          {addresses.map((address) => {
            const isSelected = selectedId === address.id;
            const isDeleting = deletingId === address.id;

            return (
              <div
                key={address.id}
                onClick={() => !isDeleting && onSelect(address)}
                className={`relative rounded-xl border p-4 transition-all duration-200 ${
                  isDeleting
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                } ${
                  isSelected
                    ? "border-[#16845B] bg-[#F5FBF6] shadow-sm ring-1 ring-[#16845B]"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                      isSelected
                        ? "border-[#16845B] bg-[#16845B]"
                        : "border-gray-300"
                    }`}
                  >
                    {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                  </div>

                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-[13px] font-semibold text-gray-900">
                        {address.recipient_name}
                      </span>

                      <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium uppercase text-gray-600">
                        {address.type || "Home"}
                      </span>

                      {address.is_default && (
                        <span className="rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-700">
                          Default
                        </span>
                      )}
                    </div>

                    <p className="text-[12px] leading-relaxed text-gray-600">
                      {address.address_line_1}
                      {address.address_line_2
                        ? `, ${address.address_line_2}`
                        : ""}
                      , {address.city}, {address.state} - {address.postcode}
                    </p>

                    <p className="mt-1 text-[12px] text-gray-500">
                      Phone: {address.contact_number}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onEdit(address);
                      }}
                      disabled={isDeleting}
                      className="rounded-lg p-2 text-gray-400 transition hover:bg-green-50 hover:text-[#16845B] disabled:cursor-not-allowed disabled:opacity-40"
                      title="Edit Address"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onDelete(address);
                      }}
                      disabled={isDeleting}
                      className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                      title="Delete Address"
                    >
                      {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 p-4">
          <button
            type="button"
            onClick={onAddNew}
            className="flex items-center gap-2 text-[12px] font-semibold text-[#16845B] hover:text-[#0E6242]"
          >
            <Plus className="h-4 w-4" />
            Add New Address
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-gray-900 px-5 py-2 text-[12px] font-medium text-white transition hover:bg-gray-800"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Delete Confirm Modal
// ─────────────────────────────────────────────────────────────────────────────

function DeleteConfirmModal({
  isOpen,
  isDeleting,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <Trash2 className="h-6 w-6 text-red-600" />
        </div>

        <h3 className="text-lg font-semibold text-gray-900">Delete Address</h3>
        <p className="mt-2 text-sm text-gray-500">
          Are you sure you want to delete this address? This action cannot be
          undone.
        </p>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Cart product item
// ─────────────────────────────────────────────────────────────────────────────

function CartProductItem({
  item,
  isUpdating,
  isRemoving,
  isUnavailable,
  updateQuantity,
  removeItem,
  isDistributor,
}: {
  item: CartItemView;
  isUpdating: boolean;
  isRemoving: boolean;
  isUnavailable: boolean;
  updateQuantity: (id: number, quantity: number) => void;
  removeItem: (id: number) => void;
  isDistributor: boolean;
}) {
  const originalPrice = item.originalPrice;
  const discountAmount = originalPrice ? originalPrice - item.price : 0;

  const maxQuantity = Math.min(
    MAX_CART_QUANTITY,
    item.stockQuantity !== null && item.stockQuantity > 0
      ? item.stockQuantity
      : MAX_CART_QUANTITY,
  );

  const [qtyOpen, setQtyOpen] = useState(false);
  const qtyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!qtyOpen) return;

    const handler = (event: globalThis.MouseEvent) => {
      if (qtyRef.current && !qtyRef.current.contains(event.target as Node)) {
        setQtyOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);

    return () => document.removeEventListener("mousedown", handler);
  }, [qtyOpen]);

  const quantityOptions = Array.from(
    { length: Math.max(maxQuantity, item.quantity) },
    (_, index) => index + 1,
  );

  const handleQtySelect = (quantity: number) => {
    setQtyOpen(false);

    if (quantity !== item.quantity) {
      updateQuantity(item.id, quantity);
    }
  };

  const categoryAndBrand = [item.category, item.subcategory, item.brand]
    .filter(
      (value, index, values) =>
        Boolean(value) && values.indexOf(value) === index,
    )
    .join(" · ");

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.18 }}
      className="grid min-h-[128px] grid-cols-[88px_minmax(0,1fr)] gap-2.5 rounded-[5px] border border-[#E5E5E5] bg-white px-2.5 py-2 sm:min-h-[170px] sm:grid-cols-[112px_minmax(0,1fr)] sm:gap-3 sm:px-3 sm:py-2.5"
    >
      <Link
        href={`/product/${item.slug}`}
        className={`relative block h-[112px] w-[88px] self-center overflow-hidden bg-[#F3F3F3] sm:h-[150px] sm:w-[112px] ${
          isUnavailable ? "opacity-65" : ""
        }`}
      >
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="absolute inset-0 h-full w-full object-cover"
          onError={(event) => {
            const image = event.currentTarget;

            if (!image.src.endsWith(PLACEHOLDER_IMAGE)) {
              image.src = PLACEHOLDER_IMAGE;
            }
          }}
        />

        {isUnavailable && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/35">
            <span className="rounded-sm bg-white px-1.5 py-1 text-center text-[8px] font-bold uppercase text-[#B64339] sm:text-[9px]">
              Out of stock
            </span>
          </span>
        )}
      </Link>

      <div className="flex min-w-0 flex-col justify-between gap-1.5 py-0.5">
        <div className="flex min-w-0 items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              href={`/product/${item.slug}`}
              className="line-clamp-1 text-[12.5px] font-semibold leading-[1.3] text-[#172033] hover:text-black sm:line-clamp-2 sm:text-[14.5px] sm:leading-[1.35]"
            >
              {item.name}
            </Link>

            {categoryAndBrand && (
              <p className="mt-1 truncate text-[9.5px] font-medium leading-3.5 text-[#666] sm:text-[10.5px]">
                {categoryAndBrand}
              </p>
            )}

            {item.productCode && (
              <p className="mt-0.5 truncate text-[9.5px] leading-3.5 text-[#8A8A8A] sm:text-[10.5px]">
                Product code: {item.productCode}
              </p>
            )}

            {item.sku && (
              <p className="truncate text-[9.5px] leading-3.5 text-[#8A8A8A] sm:text-[10.5px]">
                SKU: {item.sku}
              </p>
            )}
          </div>

          <button
            type="button"
            aria-label={`Remove ${item.name}`}
            title="Remove item"
            onClick={() => removeItem(item.id)}
            disabled={isRemoving}
            className="-mr-1 -mt-1 flex h-6 w-6 shrink-0 items-center justify-center text-[#111] transition hover:text-[#E43D5C] disabled:opacity-40 sm:h-7 sm:w-7"
          >
            {isRemoving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <X className="h-5 w-5" strokeWidth={1.4} />
            )}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {item.variantLabel && (
            <span className="inline-flex h-6 max-w-full items-center gap-1 rounded-[3px] bg-[#F4F4F4] px-1.5 text-[9.5px] font-semibold text-[#252525] sm:text-[11px]">
              <span className="max-w-[140px] truncate">
                {item.variantLabel.toLowerCase().startsWith("size") ||
                item.variantLabel.includes(":")
                  ? item.variantLabel
                  : `Size: ${item.variantLabel}`}
              </span>

              <ChevronDown className="h-3 w-3 shrink-0" />
            </span>
          )}

          <div className="relative" ref={qtyRef}>
            <button
              type="button"
              aria-label={`Quantity for ${item.name}`}
              aria-haspopup="listbox"
              aria-expanded={qtyOpen}
              disabled={isUpdating || isUnavailable}
              onClick={() => setQtyOpen((value) => !value)}
              className={`inline-flex h-6 items-center gap-1 rounded-[3px] border bg-[#F4F4F4] pl-2 pr-1.5 text-[10px] font-semibold text-[#252525] transition hover:border-[#FF3E69]/60 disabled:cursor-not-allowed disabled:opacity-60 sm:text-[11px] ${
                qtyOpen ? "border-[#FF3E69]" : "border-transparent"
              }`}
            >
              <span className="text-[#8A8A8A]">Qty:</span>
              <span className="min-w-[12px] text-center">{item.quantity}</span>

              <ChevronDown
                className={`h-3 w-3 shrink-0 text-[#555] transition-transform ${
                  qtyOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {qtyOpen && (
                <motion.ul
                  role="listbox"
                  initial={{ opacity: 0, y: -4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.97 }}
                  transition={{ duration: 0.12 }}
                  className="absolute left-0 top-full z-30 mt-1 max-h-44 w-[64px] overflow-y-auto rounded-[5px] border border-[#E5E5E5] bg-white py-1 shadow-[0_6px_20px_rgba(0,0,0,0.12)]"
                >
                  {quantityOptions.map((quantity) => {
                    const active = quantity === item.quantity;

                    return (
                      <li key={quantity}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={active}
                          onClick={() => handleQtySelect(quantity)}
                          className={`flex w-full items-center justify-between px-2 py-[5px] text-[11px] font-medium transition ${
                            active
                              ? "bg-[#FFF1F4] text-[#E43D5C]"
                              : "text-[#252525] hover:bg-[#F5F5F5]"
                          }`}
                        >
                          {quantity}

                          {active && (
                            <Check className="h-3 w-3" strokeWidth={3} />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
          <span className="text-[13px] font-bold tracking-[-0.02em] text-[#171717] sm:text-[15px]">
            {formatPrice(item.price)}
          </span>

          {originalPrice && originalPrice > item.price && (
            <>
              <span className="text-[11px] text-[#929292] line-through sm:text-[12.5px]">
                {formatPrice(originalPrice)}
              </span>

              {discountAmount > 0 && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-[#FF514A] sm:text-[12px]">
                  {formatPrice(discountAmount)} OFF
                  <Info className="h-2.5 w-2.5" />
                </span>
              )}
            </>
          )}
        </div>

        {isDistributor && item.commissionPoints > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-md border border-[#D7ECDD] bg-[#F1FAF4] px-2.5 py-2">
            <span className="text-[10.5px] font-semibold text-[#176642]">
              Commission Value
            </span>
            <span className="text-[11.5px] font-bold text-[#176642]">
              {formatPoints(item.commissionPoints)} / unit
            </span>
            {item.quantity > 1 && (
              <span className="w-full text-right text-[10px] text-[#48765B]">
                {item.quantity} units ·{" "}
                {formatPoints(item.commissionPoints * item.quantity)} total
              </span>
            )}
          </div>
        )}
      </div>
    </motion.article>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tax breakdown popup
// ─────────────────────────────────────────────────────────────────────────────

function TaxBreakdownPopup({
  summaryData,
}: {
  summaryData: CheckoutSummaryData;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const categories =
    Array.isArray(summaryData.tax_by_category) &&
    summaryData.tax_by_category.length > 0
      ? summaryData.tax_by_category
      : [];

  return (
    <div ref={containerRef} className="relative inline-flex">
      <button
        type="button"
        aria-label="View tax breakdown"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-[#89928B] transition hover:text-[#16845B]"
      >
        <Info className="h-3 w-3" />
      </button>

      {open && (
        <div className="absolute bottom-[calc(100%+8px)] left-12 z-[9999] w-[calc(100vw-32px)] max-w-[320px] -translate-x-1/2 rounded-xl border border-[#E1EAE3] bg-white p-3 shadow-[0_16px_40px_-20px_rgba(15,45,30,0.45)] sm:left-auto sm:right-0 sm:translate-x-0 sm:w-[300px]">
          <div className="mb-2 flex items-center justify-between border-b border-[#EDF1EE] pb-2">
            <p className="text-[12px] font-semibold text-[#1B2C20]">
              Tax Breakdown
            </p>

            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close tax breakdown"
              className="flex h-5 w-5 items-center justify-center rounded-full text-[#89928B] transition hover:bg-[#F1F6F2] hover:text-[#16845B]"
            >
              <X className="h-3 w-3" />
            </button>
          </div>

          {categories.length > 0 ? (
            <div className="max-h-[300px] space-y-3 overflow-y-auto [scrollbar-width:thin] pr-1">
              {categories.map((tax, index) => (
                <div
                  key={`${tax.category}-${tax.rate}-${index}`}
                  className="rounded-lg border border-[#EDF1EE] bg-[#FAFCFA] p-2.5"
                >
                  <div className="mb-1.5 flex items-start justify-between gap-2">
                    <span className="text-[11px] font-semibold leading-tight text-[#26332A]">
                      {tax.product_name || tax.category}
                      <br />

                      <span className="text-[9.5px] font-normal text-[#78847C]">
                        {tax.category} @ {tax.rate}
                      </span>
                    </span>

                    <span className="shrink-0 text-[11px] font-bold text-[#173E2B]">
                      {formatPrice(tax.tax_amount)}
                    </span>
                  </div>

                  <div className="space-y-1 rounded border border-[#F0F4F1] bg-white p-1.5 text-[10px] text-[#748078]">
                    <div className="flex items-center justify-between">
                      <span>Taxable Value</span>

                      <span className="font-medium text-[#526258]">
                        {formatPrice(tax.taxable_amount)}
                      </span>
                    </div>

                    {Number(tax.igst || 0) > 0 && (
                      <div className="flex items-center justify-between">
                        <span>IGST</span>
                        <span>{formatPrice(tax.igst)}</span>
                      </div>
                    )}

                    {Number(tax.cgst || 0) > 0 && (
                      <div className="flex items-center justify-between">
                        <span>CGST</span>
                        <span>{formatPrice(tax.cgst)}</span>
                      </div>
                    )}

                    {Number(tax.sgst || 0) > 0 && (
                      <div className="flex items-center justify-between">
                        <span>SGST</span>
                        <span>{formatPrice(tax.sgst)}</span>
                      </div>
                    )}

                    {Number(tax.total_shipping_charge || 0) > 0 && (
                      <div className="flex items-center justify-between text-[#16845B]">
                        <span>Shipping</span>
                        <span>
                          {formatPrice(tax.total_shipping_charge || 0)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between border-t border-[#EDF1EE] pt-2 text-[11px] font-bold text-[#1B2C20]">
                <span>Total Tax</span>
                <span>{formatPrice(summaryData.total_tax)}</span>
              </div>
            </div>
          ) : (
            <p className="py-2 text-center text-[10.5px] text-[#888888]">
              Tax breakdown unavailable
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Coupon list panel
// ─────────────────────────────────────────────────────────────────────────────

function CouponListPanel({
  coupons,
  isLoading,
  appliedCode,
  onApply,
}: {
  coupons: CouponListItem[];
  isLoading: boolean;
  appliedCode: string | null;
  onApply: (code: string) => void;
}) {
  if (isLoading) {
    return (
      <div className="space-y-2 rounded-xl border border-[#E2E8E4] bg-white p-3">
        <div className="h-14 animate-pulse rounded-lg bg-[#EEEEEC]" />
        <div className="h-14 animate-pulse rounded-lg bg-[#EEEEEC]" />
      </div>
    );
  }

  if (!coupons.length) {
    return (
      <div className="rounded-xl border border-[#E2E8E4] bg-white p-4 text-center">
        <p className="text-[11px] text-[#888888]">
          No coupons available right now
        </p>
      </div>
    );
  }

  return (
    <div className="max-h-[200px] space-y-2 overflow-y-auto rounded-xl border border-[#E2E8E4] bg-white p-2">
      {coupons.map((coupon, index) => {
        const isApplied =
          appliedCode &&
          appliedCode.toUpperCase() === String(coupon.code).toUpperCase();

        return (
          <div
            key={`${coupon.id ?? coupon.code}-${index}`}
            className="flex items-center gap-3 rounded-lg border border-dashed border-[#DDE5DF] p-2.5"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EAF6EF] text-[#16845B]">
              <BadgePercent className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-[11px] font-semibold uppercase text-[#171717]">
                  {coupon.code}
                </p>

                <span className="shrink-0 text-[10px] font-semibold text-[#16845B]">
                  {getCouponValueLabel(coupon)}
                </span>
              </div>

              {(coupon.title || coupon.description) && (
                <p className="mt-0.5 truncate text-[10px] text-[#888888]">
                  {coupon.title || coupon.description}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => onApply(coupon.code)}
              disabled={Boolean(isApplied)}
              className="shrink-0 rounded-lg border border-[#CBD5CE] px-3 py-1.5 text-[10px] font-semibold text-[#1F513B] transition hover:border-[#16845B] hover:bg-[#EAF6EF] disabled:cursor-not-allowed disabled:text-[#AAAAAA]"
            >
              {isApplied ? "Applied" : "Apply"}
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Recommended section
// ─────────────────────────────────────────────────────────────────────────────

function RecommendedSection({
  recommended,
  addingProductId,
  handleRecommendedAddToCart,
  scrollRecommended,
  recommendedScrollRef,
}: {
  recommended: any[];
  addingProductId: number | string | null;
  handleRecommendedAddToCart: (
    product: any,
    event?: ReactMouseEvent<HTMLButtonElement>,
  ) => void;
  scrollRecommended: (direction: "left" | "right") => void;
  recommendedScrollRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <section className="rounded-xl border border-[#E6E6E4] bg-white p-4 sm:p-[18px]">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <div className="mb-1 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-[#333]" />

            <span className="text-[9px] font-medium uppercase tracking-[0.14em] text-[#999]">
              Curated for you
            </span>
          </div>

          <h2 className="text-[15px] font-semibold text-[#171717]">
            You might also like
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/products"
            className="hidden text-[9px] font-medium uppercase tracking-wide text-[#777] underline underline-offset-4 hover:text-black sm:block"
          >
            View all
          </Link>

          {recommended.length > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => scrollRecommended("left")}
                aria-label="Scroll left"
                className="flex h-7 w-7 items-center justify-center rounded-[5px] border border-[#D8D8D6] bg-white text-[#333] hover:bg-[#F3F3F2]"
              >
                <ArrowLeft className="h-3 w-3" />
              </button>

              <button
                type="button"
                onClick={() => scrollRecommended("right")}
                aria-label="Scroll right"
                className="flex h-7 w-7 items-center justify-center rounded-[5px] bg-black text-white hover:bg-[#333]"
              >
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div
        ref={recommendedScrollRef}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {recommended.map((product: any) => {
          const isAdding = addingProductId === product.id;

          return (
            <div
              key={product.id}
              className="group w-[128px] shrink-0 snap-start sm:w-[140px] md:w-[150px]"
            >
              <Link href={`/product/${product.slug}`}>
                <div className="relative aspect-square overflow-hidden rounded-[5px] border border-[#E5E5E3] bg-[#F1F1F0] transition group-hover:border-black">
                  <img
                    src={getRecommendedImage(product)}
                    alt={product.name || "Recommended product"}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    onError={(event) => {
                      const image = event.currentTarget;

                      if (!image.src.endsWith(PLACEHOLDER_IMAGE)) {
                        image.src = PLACEHOLDER_IMAGE;
                      }
                    }}
                  />
                </div>
              </Link>

              <div className="pt-2">
                <p className="truncate text-[10px] font-medium text-[#222]">
                  {product.name}
                </p>

                <p className="mt-0.5 text-[12px] font-semibold text-[#111]">
                  {formatPrice(parsePrice(product.retail_price))}
                </p>

                <button
                  type="button"
                  onClick={(event) =>
                    handleRecommendedAddToCart(product, event)
                  }
                  disabled={isAdding}
                  className="mt-1.5 flex h-9 w-full items-center justify-center gap-1.5 rounded-[5px] bg-black text-[9px] font-semibold uppercase tracking-wide text-white transition hover:bg-[#333] disabled:opacity-50"
                >
                  {isAdding ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <ShoppingBag className="h-3 w-3" />
                  )}

                  {isAdding ? "Adding..." : "Add"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// OrderSummary
// ─────────────────────────────────────────────────────────────────────────────

function OrderSummary({
  summaryData,
  fallbackSubtotal,
  fallbackSavings,
  itemCount,
  isCheckingStock,
  unavailableCount,
  onCheckout,
  couponInput,
  setCouponInput,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  isApplyingCoupon,
  coupons,
  isLoadingCoupons,
  showCouponList,
  setShowCouponList,
  isDistributor,
  totalCommission,
}: {
  summaryData?: CheckoutSummaryData;
  fallbackSubtotal: number;
  fallbackSavings: number;
  itemCount: number;
  isCheckingStock: boolean;
  unavailableCount: number;
  onCheckout: () => void;
  couponInput: string;
  setCouponInput: (value: string) => void;
  appliedCoupon: string | null;
  onApplyCoupon: (codeOverride?: string) => void;
  onRemoveCoupon: () => void;
  isApplyingCoupon: boolean;
  coupons: CouponListItem[];
  isLoadingCoupons: boolean;
  showCouponList: boolean;
  setShowCouponList: (value: boolean) => void;
  isDistributor: boolean;
  totalCommission: number;
}) {
  const router = useRouter();

  const subtotal = Number(summaryData?.subtotal ?? fallbackSubtotal);
  const couponDiscount = Number(summaryData?.coupon_discount ?? 0);
  const shipping = Number(summaryData?.shipping_cost ?? 0);
  const totalTax = Number(summaryData?.total_tax ?? 0);
  const grandTotal = Number(summaryData?.grand_total ?? fallbackSubtotal);

  const hasCoupon = !!summaryData?.coupon || couponDiscount > 0;
  const hasCommission = isDistributor && totalCommission > 0;

  return (
    <section className="rounded-xl border border-[#E5E5E5] bg-white p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-[17px] font-semibold text-[#171717]">
          Cart Summary
        </h2>

        <span className="rounded-full bg-[#F4F4F4] px-2.5 py-1 text-[10px] font-medium text-[#777]">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </span>
      </div>

      {/* Coupon section */}
      <div className="mb-3">
        <div className="mb-1.5 flex items-center justify-between gap-3">
          <p className="text-[12px] font-semibold text-[#303B33]">
            Discount code
          </p>

          <button
            type="button"
            onClick={() => setShowCouponList(!showCouponList)}
            className="flex shrink-0 items-center gap-1 rounded-md px-1 py-0.5 text-[11px] font-semibold text-[#16845B] transition hover:text-[#0E6242]"
          >
            {showCouponList ? "Hide coupons" : "View coupons"}

            <ChevronDown
              className={`h-3 w-3 transition-transform ${
                showCouponList ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {showCouponList && (
          <div className="mb-2">
            <CouponListPanel
              coupons={coupons}
              isLoading={isLoadingCoupons}
              appliedCode={appliedCoupon}
              onApply={(code) => {
                onApplyCoupon(code);
                setShowCouponList(false);
              }}
            />
          </div>
        )}

        {!hasCoupon ? (
          <div className="flex h-[38px] w-full items-center rounded-xl border border-[#DFE7E1] bg-white px-3 focus-within:border-[#16845B]">
            <Tag className="mr-2 h-[14px] w-[14px] shrink-0 text-[#839087]" />

            <input
              type="text"
              value={couponInput}
              onChange={(event) => setCouponInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !isApplyingCoupon) {
                  onApplyCoupon();
                }
              }}
              placeholder="Enter discount code"
              disabled={isApplyingCoupon}
              className="min-w-0 flex-1 bg-transparent text-[12px] uppercase text-[#333333] outline-none placeholder:normal-case placeholder:text-[#999999]"
            />

            <button
              type="button"
              onClick={() => onApplyCoupon()}
              disabled={!couponInput.trim() || isApplyingCoupon}
              className="ml-2 flex h-[26px] min-w-[56px] shrink-0 items-center justify-center rounded-lg bg-[#173E2B] px-3 text-[11px] font-semibold text-white transition hover:bg-[#20543A] disabled:cursor-not-allowed disabled:bg-[#D5D5D3]"
            >
              {isApplyingCoupon ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                "Apply"
              )}
            </button>
          </div>
        ) : (
          <div className="flex min-h-[38px] items-center justify-between rounded-xl border border-[#CDE4D5] bg-[#F1FAF4] px-3">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#D9F0E1]">
                <Check className="h-3.5 w-3.5 text-[#16845B]" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-[11px] font-semibold uppercase text-[#263C2D]">
                  {summaryData?.coupon?.code || appliedCoupon}
                </p>

                <p className="text-[10px] text-[#64816D]">
                  Coupon applied successfully
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onRemoveCoupon}
              className="ml-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#777777] transition hover:bg-white hover:text-[#111111]"
              aria-label="Remove coupon"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Breakdown */}
      <div className="space-y-2 text-[12px]">
        <div className="flex items-center justify-between gap-4">
          <span className="text-[#777]">Subtotal</span>

          <span className="font-medium text-[#282828]">
            {formatPrice(subtotal)}
          </span>
        </div>

        {couponDiscount > 0 && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-[#777]">
              Discount
              {summaryData?.coupon?.code ? ` (${summaryData.coupon.code})` : ""}
            </span>

            <span className="font-semibold text-[#28815C]">
              −{formatPrice(couponDiscount)}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          <span className="text-[#777]">Shipping</span>

          <span className="font-medium text-[#282828]">
            {shipping === 0 ? "₹0" : formatPrice(shipping)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1 text-[#777]">
            Taxes
            {summaryData && <TaxBreakdownPopup summaryData={summaryData} />}
          </span>

          <span className="font-medium text-[#282828]">
            {formatPrice(totalTax)}
          </span>
        </div>

        {fallbackSavings > 0 && couponDiscount === 0 && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-[#777]">Your savings</span>

            <span className="font-semibold text-[#28815C]">
              −{formatPrice(fallbackSavings)}
            </span>
          </div>
        )}
      </div>

      {hasCommission && (
        <div className="mt-2 flex items-center justify-between rounded-lg bg-[#ECF9F1] px-2 py-1.5">
          <span className="flex items-center gap-1 text-[11.5px] font-semibold text-[#16845B]">
            <BadgePercent className="h-3 w-3" />
            Total Commission Value
          </span>

          <span className="text-[12px] font-bold text-[#16845B]">
            {formatPoints(totalCommission)}
          </span>
        </div>
      )}

      <div className="my-4 h-px bg-[#EBEBEB]" />

      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-[13px] font-semibold text-[#222]">Total payable</p>

          <p className="mt-1 text-[10px] text-[#999]">
            Including taxes and shipping
          </p>
        </div>

        <p className="text-[22px] font-semibold tracking-[-0.04em] text-[#111]">
          {formatPrice(grandTotal)}
        </p>
      </div>

      {unavailableCount > 0 && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-[#F1C8C4] bg-[#FFF2F1] p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#B64339]" />

          <div>
            <p className="text-[11px] font-semibold text-[#B64339]">
              {unavailableCount}{" "}
              {unavailableCount === 1 ? "item is" : "items are"} out of stock
            </p>

            <p className="mt-0.5 text-[10px] leading-4 text-[#8A4A44]">
              Remove unavailable items to continue checkout.
            </p>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onCheckout}
        aria-busy={isCheckingStock}
        className="flex h-[46px] w-full items-center justify-center gap-2 rounded-md bg-[#171717] px-4 text-[12px] font-semibold text-white transition hover:bg-[#373737] active:scale-[0.99]"
      >
        {isCheckingStock ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Checking stock...
          </>
        ) : (
          <>
            Proceed to Checkout
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>

      <button
        type="button"
        onClick={() => router.push("/products")}
        className="mx-auto mt-4 flex items-center gap-2 text-[11px] font-medium text-[#707070] transition hover:text-[#111]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Continue Shopping
      </button>

      <div className="mt-5 flex items-center justify-center gap-2 border-t border-[#EFEFEF] pt-4 text-[10px] text-[#8B8B8B]">
        <ShieldCheck className="h-4 w-4" strokeWidth={1.7} />
        Secure checkout
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Cart Page
// ─────────────────────────────────────────────────────────────────────────────

export default function CartPage() {
  const router = useRouter();

  const [isUpdating, setIsUpdating] = useState<number | null>(null);
  const [addingProductId, setAddingProductId] = useState<
    number | string | null
  >(null);

  const recommendedScrollRef = useRef<HTMLDivElement>(null);

  const [unavailableProductIds, setUnavailableProductIds] = useState<
    Set<number>
  >(new Set());

  const [isCheckingStock, setIsCheckingStock] = useState(false);
  // Persist validation feedback on screen (toast alone can be missed).
  const [checkoutIssues, setCheckoutIssues] = useState<string[]>([]);
  const checkoutLockRef = useRef(false);

  const reportCheckoutIssue = (message: string) => {
    setCheckoutIssues([message]);
    toast.error(message, { position: "bottom-center", duration: 5000 });
  };

  // ── Coupon state ──────────────────────────────────────────────────────────

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [showCouponList, setShowCouponList] = useState(false);
  const [pendingCoupon, setPendingCoupon] = useState<string | null>(null);

  // ── Address state ─────────────────────────────────────────────────────────

  const [selectedDeliveryAddress, setSelectedDeliveryAddress] =
    useState<Address | null>(null);

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isSelectorModalOpen, setIsSelectorModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // Delete Address State
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);
  const [deletingAddressId, setDeletingAddressId] = useState<number | null>(
    null,
  );

  // ── Cart query ────────────────────────────────────────────────────────────

  const {
    data: cartData,
    isLoading: isCartLoading,
    isFetching: isFetchingCart,
    error: cartLoadError,
    refetch: refetchCart,
  } = useGetCartQuery(
    {},
    {
      refetchOnMountOrArgChange: true,
    },
  );

  const { data: productsData, isLoading: isProductsLoading } =
    useGetProductsQuery({});

  const [removeFromCart, { isLoading: isRemoving }] =
    useRemoveFromCartMutation();

  const [clearCart, { isLoading: isClearing }] = useClearCartMutation();

  const [updateCartItem] = useUpdateCartItemMutation();
  const [addToCart] = useAddToCartMutation();
  const [checkCartStock] = useCheckCartStockMutation();

  // ── Address APIs ──────────────────────────────────────────────────────────

  const {
    data: addressesData,
    isLoading: isLoadingAddresses,
    error: addressesLoadError,
    refetch: refetchAddresses,
  } = useGetAddressesQuery();

  const [createAddress, { isLoading: isCreating }] = useCreateAddressMutation();

  const [updateAddress, { isLoading: isUpdatingAddress }] =
    useUpdateAddressMutation();

  const [deleteAddress, { isLoading: isDeleting }] = useDeleteAddressMutation();

  const [setDefaultAddress] = useSetDefaultAddressMutation();

  // ── Summary & supporting APIs ─────────────────────────────────────────────

  const { data: couponsData, isLoading: isLoadingCoupons } =
    useGetCouponsQuery();

  const { data: dashboardResponse } = useGetUserDashboardQuery();

  const {
    data: profileResponse,
    isLoading: isLoadingProfile,
    isFetching: isFetchingProfile,
    refetch: refetchProfile,
  } = useGetUserProfileQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  // ── Profile response mapping ──────────────────────────────────────────────

  const profilePayload = profileResponse as any;

  const profileUser = useMemo(() => {
    return (
      profilePayload?.data?.user ??
      profilePayload?.user ??
      profilePayload?.data ??
      profilePayload ??
      {}
    );
  }, [profilePayload]);

  // ── Address selection logic ───────────────────────────────────────────────

  const addresses: Address[] = Array.isArray((addressesData as any)?.data)
    ? (addressesData as any).data
    : [];

  const deliveryAddresses = addresses.filter(
    (address) => address?.is_delivery === true,
  );

  const availableAddresses =
    deliveryAddresses.length > 0 ? deliveryAddresses : addresses;

  useEffect(() => {
    if (!availableAddresses.length) {
      setSelectedDeliveryAddress(null);
      return;
    }

    setSelectedDeliveryAddress((current) => {
      if (current?.id) {
        const stillExists = availableAddresses.find(
          (address) => address?.id === current.id,
        );

        if (stillExists) return stillExists;
      }

      const defaultAddress = availableAddresses.find(
        (address) => address?.is_default === true,
      );

      if (defaultAddress) return defaultAddress;

      const deliveryAddress = availableAddresses.find(
        (address) => address?.is_delivery === true,
      );

      if (deliveryAddress) return deliveryAddress;

      return availableAddresses[0] || null;
    });
  }, [availableAddresses]);

  // ── Summary query ─────────────────────────────────────────────────────────

  const summaryParams = useMemo(() => {
    const params: Record<string, any> = {};

    if (selectedDeliveryAddress?.id) {
      params.address_id = selectedDeliveryAddress.id;
    }

    if (appliedCoupon) {
      params.coupon_code = appliedCoupon.trim();
    }

    return params;
  }, [selectedDeliveryAddress?.id, appliedCoupon]);

  const {
    data: checkoutSummaryResponse,
    error: checkoutSummaryError,
    isFetching: isFetchingCheckoutSummary,
    refetch: refetchCheckoutSummary,
  } = useGetCheckoutSummaryQuery(summaryParams, {
    skip: !selectedDeliveryAddress?.id,
  });

  const summaryData: CheckoutSummaryData | undefined = (
    checkoutSummaryResponse as any
  )?.data;

  // ── Role ──────────────────────────────────────────────────────────────────

  const dashboardInfo = useMemo(() => {
    const response = dashboardResponse as any;

    if (response?.data?.ignite) return response.data;
    if (response?.data?.data?.ignite) return response.data.data;
    if (response?.ignite) return response;

    return {};
  }, [dashboardResponse]);

  const coinRole = String(dashboardInfo?.user?.account_type || "")
    .trim()
    .toLowerCase();

  const profileUserRole = String(
    profileUser?.account_type ||
      profilePayload?.user?.account_type ||
      profilePayload?.data?.user?.account_type ||
      "",
  )
    .trim()
    .toLowerCase();

  const isDistributor =
    coinRole === "distributor" ||
    profileUserRole === "distributor" ||
    String((cartData as any)?.user_type || "").toLowerCase() === "distributor";

  // ── Cart items mapping ────────────────────────────────────────────────────

  const cartItems = useMemo<CartItemView[]>(() => {
    const apiItems: CartItemApi[] = cartData?.data?.items || [];

    return apiItems.map((item) => {
      const currentPrice = parsePrice(item.current_unit_price);

      const variantAttributes =
        item.variant_attributes || item.variant?.attributes || {};

      const productStock =
        item.product?.available_stock ?? item.product?.stock_quantity;

      const stockQuantity =
        item.variant?.stock_quantity ?? productStock ?? null;

      return {
        id: item.id,
        cartItemId: item.id,
        productId: item.product_id,
        variantId: item.variant_id ?? null,
        name: item.product?.name || "Product",
        slug: item.product?.slug || "",
        image: getImageUrl(item.image_url),
        price: currentPrice,
        originalPrice: getOriginalPrice(item, currentPrice),
        productCode: item.product?.product_code || "",
        sku: item.variant?.sku || "",
        category: getTaxonomyName(item.product?.category),
        subcategory: getTaxonomyName(item.product?.subcategory),
        brand: getTaxonomyName(item.product?.brand),
        variantLabel: getVariantLabel(item.variant, variantAttributes),
        variantAttributes,
        quantity: Math.max(1, Number(item.quantity || 1)),
        stockQuantity: stockQuantity === null ? null : Number(stockQuantity),
        priceType:
          item.current_price_type || cartData?.data?.price_type || "retail",
        commissionPoints: Math.max(
          0,
          parsePrice(item.product?.commission_value),
        ),
      };
    });
  }, [cartData]);

  const cartProductIds = useMemo(() => {
    const ids = new Set<number>();

    cartItems.forEach((item) => {
      ids.add(Number(item.productId));
    });

    return ids;
  }, [cartItems]);

  // ── Recommended ───────────────────────────────────────────────────────────

  const recommended = useMemo(() => {
    if (!productsData?.data) return [];

    return (productsData.data || [])
      .filter((product: any) => !cartProductIds.has(product.id))
      .slice(0, 8);
  }, [productsData, cartProductIds]);

  // ── Fallback totals ───────────────────────────────────────────────────────

  const { subtotal, totalSavings, itemCount } = useMemo(() => {
    const subtotalValue = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const mrpValue = cartItems.reduce(
      (sum, item) => sum + (item.originalPrice || item.price) * item.quantity,
      0,
    );

    const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return {
      subtotal: subtotalValue,
      totalSavings: Math.max(mrpValue - subtotalValue, 0),
      itemCount: count,
    };
  }, [cartItems]);

  // ── Commission POINTS (not money) ──────────────────────────────────────
  // Cart endpoint provides product.commission_value per unit.
  // Do not use formatPrice or subtract these points from payable totals.
  const totalCommission = useMemo(() => {
    if (!isDistributor) return 0;

    return cartItems.reduce(
      (total, item) => total + item.commissionPoints * item.quantity,
      0,
    );
  }, [isDistributor, cartItems]);

  // ── Coupons filter ────────────────────────────────────────────────────────

  const coupons: CouponListItem[] = useMemo(() => {
    const list = (couponsData as any)?.data?.data;

    if (!Array.isArray(list)) return [];

    return list.filter((coupon: CouponListItem) => {
      if (coupon?.is_active === undefined) return true;

      return (
        coupon.is_active === true ||
        coupon.is_active === 1 ||
        coupon.is_active === "1"
      );
    });
  }, [couponsData]);

  // ── Coupon apply effect ───────────────────────────────────────────────────

  useEffect(() => {
    if (!pendingCoupon || isFetchingCheckoutSummary) return;

    const responseData = checkoutSummaryResponse as any;
    const responseError = checkoutSummaryError as any;

    const currentResponse = responseError?.data ?? responseData;

    if (!currentResponse) return;

    if (currentResponse?.success === false) {
      const backendMessage = currentResponse?.message;

      setAppliedCoupon(null);
      setCouponInput("");
      setPendingCoupon(null);
      setIsApplyingCoupon(false);

      if (backendMessage) {
        toast.error(backendMessage, {
          position: "bottom-center",
        });
      }

      return;
    }

    if (currentResponse?.success === true) {
      const responseCouponCode = String(responseData?.data?.coupon?.code || "")
        .trim()
        .toUpperCase();

      if (responseCouponCode && responseCouponCode !== pendingCoupon) {
        return;
      }

      setPendingCoupon(null);
      setIsApplyingCoupon(false);

      toast.success("Coupon applied", {
        position: "bottom-center",
      });

      return;
    }

    if (responseError) {
      const backendMessage =
        responseError?.data?.message ||
        responseError?.error?.data?.message ||
        "";

      setAppliedCoupon(null);
      setCouponInput("");
      setPendingCoupon(null);
      setIsApplyingCoupon(false);

      if (backendMessage) {
        toast.error(backendMessage, {
          position: "bottom-center",
        });
      }
    }
  }, [
    pendingCoupon,
    isFetchingCheckoutSummary,
    checkoutSummaryResponse,
    checkoutSummaryError,
  ]);

  // ── Address Handlers ──────────────────────────────────────────────────────

  const handleCreateAddress = async (data: AddressFormData) => {
    try {
      const payload = {
        ...data,
        type: data.type || "Home",
        is_delivery: 1,
        is_billing: 1,
      };

      const result = await createAddress(payload).unwrap();

      if (
        (result as any)?.status === false ||
        (result as any)?.success === false
      ) {
        throw new Error(
          (result as any)?.message || "Address could not be saved.",
        );
      }
      {
        toast.success("Address added successfully!", {
          position: "bottom-center",
        });

        await refetchAddresses();

        setIsAddressModalOpen(false);
        setEditingAddress(null);

        setTimeout(() => {
          void refetchCheckoutSummary();
        }, 100);
      }
    } catch (error: any) {
      toast.error(getErrorMessage(error, "Failed to add address"), {
        position: "bottom-center",
      });
    }
  };

  const handleUpdateAddress = async (data: AddressFormData) => {
    if (!editingAddress?.id) return;

    try {
      const result = await updateAddress({
        id: editingAddress.id,
        data: {
          ...data,
          type: data.type || "Home",
        },
      }).unwrap();

      if (
        (result as any)?.status === false ||
        (result as any)?.success === false
      ) {
        throw new Error(
          (result as any)?.message || "Address could not be updated.",
        );
      }
      {
        toast.success("Address updated successfully!", {
          position: "bottom-center",
        });

        await refetchAddresses();

        setIsAddressModalOpen(false);
        setEditingAddress(null);

        setTimeout(() => {
          void refetchCheckoutSummary();
        }, 100);
      }
    } catch (error: any) {
      toast.error(getErrorMessage(error, "Failed to update address"), {
        position: "bottom-center",
      });
    }
  };

  const openDeleteConfirm = (address: Address) => {
    setAddressToDelete(address);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteAddress = async () => {
    if (!addressToDelete?.id || deletingAddressId !== null) return;

    try {
      setDeletingAddressId(addressToDelete.id);

      const result = await deleteAddress({
        id: addressToDelete.id,
        data: {} as any,
      }).unwrap();

      if ((result as any)?.status === false) {
        throw new Error((result as any)?.message || "Failed to delete address");
      }

      toast.success("Address deleted successfully!", {
        position: "bottom-center",
      });

      if (selectedDeliveryAddress?.id === addressToDelete.id) {
        setSelectedDeliveryAddress(null);
      }

      await refetchAddresses();

      setIsDeleteConfirmOpen(false);
      setAddressToDelete(null);

      setTimeout(() => {
        void refetchCheckoutSummary();
      }, 100);
    } catch (error: any) {
      toast.error(getErrorMessage(error, "Failed to delete address"), {
        position: "bottom-center",
      });
    } finally {
      setDeletingAddressId(null);
    }
  };

  const handleSetDefaultAddress = async (id: number) => {
    if (!id) return;

    try {
      const result = await setDefaultAddress(id).unwrap();

      if (
        (result as any)?.status === false ||
        (result as any)?.success === false
      ) {
        throw new Error(
          (result as any)?.message || "Failed to set default address.",
        );
      }
      {
        toast.success("Default address updated!", {
          position: "bottom-center",
        });

        await refetchAddresses();

        setTimeout(() => {
          void refetchCheckoutSummary();
        }, 100);
      }
    } catch (error: any) {
      toast.error(getErrorMessage(error, "Failed to set default address"), {
        position: "bottom-center",
      });
    }
  };

  const openAddAddress = () => {
    setEditingAddress(null);
    setIsAddressModalOpen(true);
  };

  // ── Other Handlers ────────────────────────────────────────────────────────

  const scrollRecommended = (direction: "left" | "right") => {
    recommendedScrollRef.current?.scrollBy({
      left: direction === "left" ? -220 : 220,
      behavior: "smooth",
    });
  };

  // A stock validation must either confirm every cart line or block checkout.
  const runCartStockCheck = async (
    freshItems: CartItemView[] = cartItems,
  ): Promise<boolean> => {
    const cartId = Number(cartData?.data?.id);
    if (!Number.isInteger(cartId) || cartId <= 0) {
      reportCheckoutIssue(
        "Cart ID is missing. Refresh your cart and try again.",
      );
      return false;
    }

    try {
      const response: any = await checkCartStock({ cartId }).unwrap();
      if (
        response?.success === false ||
        !Array.isArray(response?.data?.items)
      ) {
        throw new Error(
          response?.message ||
            "Stock API returned an invalid response. Please retry.",
        );
      }
      const stockRows: any[] = response.data.items;
      if (!stockRows.length) {
        reportCheckoutIssue(
          "Stock API returned no items. Checkout has been stopped for safety.",
        );
        return false;
      }

      const unavailableIds = new Set<number>();
      const reasons: string[] = [];
      for (const line of freshItems) {
        // Prefer cart-item ID: several variants of one product can appear in a cart.
        const stock =
          stockRows.find(
            (entry: any) =>
              Number(
                entry?.cart_item_id ?? entry?.cartItemId ?? entry?.item_id,
              ) === line.cartItemId,
          ) ??
          stockRows.find(
            (entry: any) =>
              Number(entry?.product_id) === line.productId &&
              (entry?.variant_id == null ||
                Number(entry.variant_id) === Number(line.variantId)),
          );
        if (!stock) {
          unavailableIds.add(line.productId);
          reasons.push(`${line.name}: stock verification result is missing.`);
          continue;
        }
        const qty = Number(line.quantity);
        const availableQty = stock.available_stock ?? stock.stock_quantity;
        const availableFlag =
          stock.available ?? stock.is_available ?? stock.is_in_stock;
        const denied =
          availableFlag === false ||
          availableFlag === 0 ||
          availableFlag === "false";
        const insufficient = availableQty != null && Number(availableQty) < qty;
        const unconfirmed = availableFlag == null && availableQty == null;
        if (denied || insufficient || unconfirmed) {
          unavailableIds.add(line.productId);
          reasons.push(
            insufficient
              ? `${line.name}: only ${availableQty} available, but ${qty} requested.`
              : `${line.name}: ${unconfirmed ? "availability could not be confirmed" : "out of stock"}.`,
          );
        }
      }
      setUnavailableProductIds(unavailableIds);
      if (reasons.length) {
        setCheckoutIssues(reasons);
        toast.error(reasons[0], { position: "bottom-center", duration: 5000 });
        return false;
      }
      return true;
    } catch (error: any) {
      reportCheckoutIssue(
        getErrorMessage(error, "Stock verification failed. Please retry."),
      );
      return false;
    }
  };

  const handleCheckout = async () => {
    // Never disable the CTA for missing data: tell the shopper how to fix it.
    if (checkoutLockRef.current || isCheckingStock) {
      toast("Checkout verification is already running.", {
        position: "bottom-center",
      });
      return;
    }
    setCheckoutIssues([]);
    if (isCartLoading || isFetchingCart) {
      reportCheckoutIssue(
        "Your cart is loading. Please try again once it finishes.",
      );
      return;
    }
    if (cartLoadError) {
      reportCheckoutIssue(
        getErrorMessage(
          cartLoadError,
          "Unable to load cart. Refresh and retry.",
        ),
      );
      return;
    }
    if (
      isUpdating !== null ||
      isRemoving ||
      isClearing ||
      addingProductId !== null
    ) {
      reportCheckoutIssue(
        "A cart update is in progress. Please retry after it completes.",
      );
      return;
    }
    if (!cartItems.length) {
      reportCheckoutIssue("Your cart is empty. Add a product to continue.");
      return;
    }
    const invalidLine = cartItems.find(
      (item) =>
        !Number.isInteger(Number(item.productId)) ||
        Number(item.productId) <= 0 ||
        !Number.isInteger(Number(item.quantity)) ||
        Number(item.quantity) < 1 ||
        !Number.isFinite(item.price) ||
        item.price < 0,
    );
    if (invalidLine) {
      reportCheckoutIssue(
        `${invalidLine.name}: invalid product, price or quantity. Refresh the cart.`,
      );
      return;
    }
    if (isLoadingAddresses) {
      reportCheckoutIssue("Delivery addresses are loading. Please try again.");
      return;
    }
    if (addressesLoadError) {
      reportCheckoutIssue(
        getErrorMessage(
          addressesLoadError,
          "Delivery addresses could not be loaded. Please retry.",
        ),
      );
      void refetchAddresses();
      return;
    }
    if (!selectedDeliveryAddress?.id) {
      reportCheckoutIssue(
        "A delivery address is required. Add or select your delivery address.",
      );
      if (availableAddresses.length) setIsSelectorModalOpen(true);
      else openAddAddress();
      return;
    }
    const address = selectedDeliveryAddress;
    const missing = [
      ["recipient name", address.recipient_name],
      ["phone number", address.contact_number],
      ["address line 1", address.address_line_1],
      ["city", address.city],
      ["state", address.state],
      ["PIN code", address.postcode],
    ]
      .filter(([, value]) => !String(value ?? "").trim())
      .map(([label]) => label);
    const phone = String(address.contact_number ?? "").replace(/\D/g, "");
    const pin = String(address.postcode ?? "").trim();
    if (
      missing.length ||
      phone.length < 10 ||
      (String(address.country || "India")
        .toLowerCase()
        .includes("india") &&
        !/^\d{6}$/.test(pin))
    ) {
      const issue = missing.length
        ? `Delivery address is missing: ${missing.join(", ")}.`
        : phone.length < 10
          ? "Delivery phone number must have at least 10 digits."
          : "Enter a valid 6-digit delivery PIN code.";
      reportCheckoutIssue(issue);
      setEditingAddress(address);
      setIsAddressModalOpen(true);
      return;
    }
    if (isApplyingCoupon || pendingCoupon) {
      reportCheckoutIssue(
        "Coupon verification is in progress. Please try again.",
      );
      return;
    }
    if (checkoutSummaryError) {
      reportCheckoutIssue(
        getErrorMessage(
          checkoutSummaryError,
          "Could not load checkout totals. Please try again.",
        ),
      );
      return;
    }
    if (isFetchingCheckoutSummary) {
      reportCheckoutIssue(
        "Order totals are recalculating. Please try again shortly.",
      );
      return;
    }

    checkoutLockRef.current = true;
    setIsCheckingStock(true);
    try {
      if (!(await runCartStockCheck())) return;
      const refreshed: any = await refetchCart();
      if (refreshed?.error) {
        reportCheckoutIssue(
          getErrorMessage(
            refreshed.error,
            "Cart refresh failed. Please retry.",
          ),
        );
        return;
      }
      const refreshedItems = refreshed?.data?.data?.items;
      if (!Array.isArray(refreshedItems) || !refreshedItems.length) {
        reportCheckoutIssue(
          "Your cart is no longer available. Refresh and review it.",
        );
        return;
      }
      if (
        refreshedItems.length !== cartItems.length ||
        refreshedItems.some((line: any) => {
          const prior = cartItems.find(
            (item) => Number(item.cartItemId) === Number(line.id),
          );
          return !prior || Number(prior.quantity) !== Number(line.quantity);
        })
      ) {
        reportCheckoutIssue(
          "Your cart changed during verification. Please review it and click checkout again.",
        );
        return;
      }
      const params = new URLSearchParams({ checkout_type: "cart" });
      if (appliedCoupon) params.set("coupon_code", appliedCoupon);
      params.set("address_id", String(address.id));
      router.push(`/checkout?${params.toString()}`);
    } catch (error: any) {
      reportCheckoutIssue(
        getErrorMessage(error, "Checkout could not continue. Please retry."),
      );
    } finally {
      checkoutLockRef.current = false;
      setIsCheckingStock(false);
    }
  };

  // ── Update quantity ───────────────────────────────────────────────────────

  const updateQuantity = async (
    cartItemId: number,
    requestedQuantity: number,
  ) => {
    const item = cartItems.find((cartItem) => cartItem.id === cartItemId);

    if (!item?.cartItemId) {
      toast.error("Cart item not found");
      return;
    }

    const availableLimit = Math.min(
      MAX_CART_QUANTITY,
      item.stockQuantity ?? MAX_CART_QUANTITY,
    );

    const newQuantity = Math.max(
      1,
      Math.min(requestedQuantity, Math.max(1, availableLimit)),
    );

    if (newQuantity === item.quantity) return;

    setIsUpdating(cartItemId);

    try {
      await updateCartItem({
        itemId: item.cartItemId,
        data: {
          quantity: newQuantity,
          action: newQuantity > item.quantity ? "increment" : "decrement",
        },
      }).unwrap();

      await refetchCart();

      await refetchCheckoutSummary();

      setUnavailableProductIds((previous) => {
        if (!previous.has(item.productId)) return previous;

        const next = new Set(previous);

        next.delete(item.productId);

        return next;
      });
    } catch (error: any) {
      toast.error(error?.data?.message || "Unable to update quantity");
    } finally {
      setIsUpdating(null);
    }
  };

  // ── Remove item ───────────────────────────────────────────────────────────

  const removeItem = async (cartItemId: number) => {
    const item = cartItems.find((cartItem) => cartItem.id === cartItemId);

    if (!item?.cartItemId) return;

    try {
      await removeFromCart(item.cartItemId).unwrap();

      await refetchCart();

      await refetchCheckoutSummary();

      setUnavailableProductIds((previous) => {
        if (!previous.has(item.productId)) return previous;

        const next = new Set(previous);

        next.delete(item.productId);

        return next;
      });

      toast.success("Item removed from cart", {
        position: "bottom-center",
      });
    } catch (error: any) {
      toast.error(error?.data?.message || "Unable to remove item");
    }
  };

  // ── Clear cart ────────────────────────────────────────────────────────────

  const clearCartHandler = async () => {
    try {
      await clearCart({}).unwrap();

      await refetchCart();

      await refetchCheckoutSummary();

      setUnavailableProductIds(new Set());

      toast.success("Cart cleared successfully", {
        position: "bottom-center",
      });
    } catch (error: any) {
      toast.error(error?.data?.message || "Unable to clear cart");
    }
  };

  // ── Recommended product add to cart ───────────────────────────────────────

  const handleRecommendedAddToCart = async (
    product: any,
    event?: ReactMouseEvent<HTMLButtonElement>,
  ) => {
    event?.preventDefault();
    event?.stopPropagation();

    if (addingProductId === product.id) return;

    try {
      setAddingProductId(product.id);

      await addToCart({
        product_id: product.id,
        quantity: 1,
      }).unwrap();

      await refetchCart();

      await refetchCheckoutSummary();

      toast.success("Added to cart", {
        position: "bottom-center",
      });
    } catch (error: any) {
      toast.error(error?.data?.message || "Unable to add product", {
        position: "bottom-center",
      });
    } finally {
      setAddingProductId(null);
    }
  };

  // ── Coupon handlers ───────────────────────────────────────────────────────

  const handleApplyCoupon = (codeOverride?: string) => {
    const code = (codeOverride ?? couponInput).trim().toUpperCase();

    if (isApplyingCoupon) {
      toast("Coupon validation is already in progress.", {
        position: "bottom-center",
      });
      return;
    }
    if (!code) {
      toast.error("Please enter a coupon code.", { position: "bottom-center" });
      return;
    }
    if (!selectedDeliveryAddress?.id) {
      toast.error(
        "Add or select a delivery address before applying a coupon.",
        { position: "bottom-center" },
      );
      if (availableAddresses.length) setIsSelectorModalOpen(true);
      else openAddAddress();
      return;
    }

    setIsApplyingCoupon(true);
    setCouponInput(code);
    setPendingCoupon(code);
    setAppliedCoupon(code);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setPendingCoupon(null);
    setIsApplyingCoupon(false);

    toast.success("Coupon removed", {
      position: "bottom-center",
    });
  };

  // ── Coupon state sync when summary changes externally ─────────────────────

  useEffect(() => {
    const code = summaryData?.coupon?.code;

    if (code && !appliedCoupon) {
      setAppliedCoupon(String(code));
      setCouponInput(String(code));
    }
  }, [summaryData?.coupon?.code, appliedCoupon]);

  // ── Loading ───────────────────────────────────────────────────────────────

  if (isCartLoading || isLoadingProfile) {
    return (
      <div
        className={`${poppins.className} min-h-screen bg-white text-[#171717]`}
        style={{ background: PAGE_BG }}
      >
        <Header
          cartItems={[]}
          cartCount={0}
          cartSubtotal={0}
          wishlistCount={0}
          onRemoveFromCart={() => {}}
          onClearCart={() => {}}
        />

        <main className="mx-auto flex min-h-[65vh] w-full max-w-[1200px] items-center justify-center px-4">
          <div className="text-center">
            <Loding />
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // ── Main UI ───────────────────────────────────────────────────────────────

  return (
    <div
      className={`${poppins.className} min-h-screen bg-white text-[#171717]`}
      style={{ background: PAGE_BG }}
    >
      <Header
        cartItems={cartItems}
        cartCount={itemCount}
        cartSubtotal={subtotal}
        wishlistCount={0}
        onRemoveFromCart={removeItem}
        onClearCart={clearCartHandler}
      />

      <main className="mx-auto w-full max-w-[1200px] px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
        <Breadcrumb currentPage="Cart" />

        {/* Address Section */}

        {isLoadingAddresses ? (
          <div className="mb-4 h-[68px] animate-pulse rounded-xl bg-[#F4F4F4]" />
        ) : availableAddresses.length > 0 && selectedDeliveryAddress ? (
          <div>
            <div className="mb-4 flex flex-col gap-3 rounded-xl border border-[#D5E6DB] bg-[#F1FAF4] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div className="min-w-0">
                <p className="truncate text-[14px] text-[#526258]">
                  Deliver to:{" "}
                  <span className="font-semibold text-[#1B2C20]">
                    {selectedDeliveryAddress.recipient_name},{" "}
                    {selectedDeliveryAddress.postcode}
                  </span>
                </p>

                <p className="mt-1 line-clamp-2 text-[12px] text-[#718077] sm:truncate">
                  {selectedDeliveryAddress.address_line_1}
                  {selectedDeliveryAddress.address_line_2
                    ? `, ${selectedDeliveryAddress.address_line_2}`
                    : ""}
                  , {selectedDeliveryAddress.city},{" "}
                  {selectedDeliveryAddress.state}
                </p>
              </div>

              <div className="flex w-full shrink-0 items-center gap-2 sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsSelectorModalOpen(true)}
                  className="inline-flex h-10 flex-1 items-center justify-center rounded-lg border border-[#16845B] bg-white px-4 text-[11px] font-semibold uppercase tracking-wide text-[#16845B] transition hover:bg-[#E6F4EA] sm:flex-none"
                >
                  Change Address
                </button>
              </div>
            </div>

            <div className="mb-4 flex items-center justify-between px-1">
              <button
                type="button"
                onClick={openAddAddress}
                className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#16845B] transition hover:text-[#0E6242]"
              >
                <Plus className="h-3.5 w-3.5" />
                Add new address
              </button>

              {selectedDeliveryAddress &&
                !selectedDeliveryAddress.is_default && (
                  <button
                    type="button"
                    onClick={() =>
                      handleSetDefaultAddress(selectedDeliveryAddress.id)
                    }
                    className="text-[12px] font-medium text-[#718077] underline underline-offset-4 transition hover:text-[#173E2B]"
                  >
                    Set as default
                  </button>
                )}
            </div>
          </div>
        ) : (
          <div className="mb-4 flex flex-col gap-3 rounded-xl border border-dashed border-[#CFE0D5] bg-[#F5FBF6] px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-2.5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#16845B] ring-1 ring-[#E4EBE6]">
                <MapPin className="h-4 w-4" />
              </span>

              <div>
                <p className="text-[12px] font-semibold text-[#24352A]">
                  No delivery address yet
                </p>

                <p className="text-[10.5px] text-[#78847C]">
                  Add an address to complete your order.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={openAddAddress}
              className="inline-flex h-8 w-full shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#173E2B] px-3 text-[10.5px] font-semibold text-white transition hover:bg-[#20543A] sm:w-auto"
            >
              <Plus className="h-3.5 w-3.5" />
              Add address
            </button>
          </div>
        )}

        {checkoutIssues.length > 0 && (
          <div
            role="alert"
            aria-live="assertive"
            className="mb-4 rounded-xl border border-[#F2B8AF] bg-[#FFF5F2] p-4"
          >
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#B84332]" />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-bold text-[#8F3023]">
                  Checkout cannot continue yet
                </p>
                <ul className="mt-1 list-disc space-y-1 pl-4 text-[12px] text-[#8F3023]">
                  {checkoutIssues.map((message, index) => (
                    <li key={index}>{message}</li>
                  ))}
                </ul>
                <div className="mt-3 flex flex-wrap gap-2">
                  {!selectedDeliveryAddress?.id && (
                    <button
                      type="button"
                      onClick={() =>
                        availableAddresses.length
                          ? setIsSelectorModalOpen(true)
                          : openAddAddress()
                      }
                      className="rounded-lg bg-[#8F3023] px-3 py-1.5 text-[11px] font-semibold text-white"
                    >
                      {availableAddresses.length
                        ? "Select Address"
                        : "Add Address"}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      void refetchCart();
                      void refetchAddresses();
                      if (selectedDeliveryAddress?.id)
                        void refetchCheckoutSummary();
                      setCheckoutIssues([]);
                    }}
                    className="rounded-lg border border-[#CFA99F] px-3 py-1.5 text-[11px] font-semibold text-[#8F3023]"
                  >
                    Refresh &amp; Check Again
                  </button>
                </div>
              </div>
              <button
                type="button"
                aria-label="Dismiss checkout error"
                onClick={() => setCheckoutIssues([])}
                className="text-[#8F3023]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {cartItems.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="min-w-0 space-y-4">
              <section className="min-w-0">
                <div className="mb-3 flex items-center justify-between gap-3 px-0.5">
                  <div>
                    <h1 className="text-[19px] font-semibold tracking-[-0.03em] text-[#171717] sm:text-[21px]">
                      Shopping Cart
                    </h1>

                    <p className="mt-0.5 text-[10px] text-[#888]">
                      {itemCount} {itemCount === 1 ? "item" : "items"} in your
                      cart
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={clearCartHandler}
                    disabled={isClearing}
                    className="flex h-8 shrink-0 items-center gap-1.5 rounded-[4px] border border-[#E5E5E5] bg-white px-2.5 text-[9px] font-semibold uppercase tracking-wide text-[#666] transition hover:bg-[#F7F7F7] disabled:opacity-40 sm:px-3"
                  >
                    {isClearing && <Loader2 className="h-3 w-3 animate-spin" />}
                    Clear Cart
                  </button>
                </div>

                <div className="space-y-2.5">
                  <AnimatePresence initial={false}>
                    {cartItems.map((item) => (
                      <CartProductItem
                        key={item.id}
                        item={item}
                        isUpdating={isUpdating === item.id}
                        isRemoving={isRemoving}
                        isUnavailable={unavailableProductIds.has(
                          item.productId,
                        )}
                        updateQuantity={updateQuantity}
                        removeItem={removeItem}
                        isDistributor={isDistributor}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </section>

              {!isProductsLoading && recommended.length > 0 && (
                <RecommendedSection
                  recommended={recommended}
                  addingProductId={addingProductId}
                  handleRecommendedAddToCart={handleRecommendedAddToCart}
                  scrollRecommended={scrollRecommended}
                  recommendedScrollRef={recommendedScrollRef}
                />
              )}
            </div>

            <aside className="self-start lg:sticky lg:top-7">
              <OrderSummary
                summaryData={summaryData}
                fallbackSubtotal={subtotal}
                fallbackSavings={totalSavings}
                itemCount={itemCount}
                isCheckingStock={isCheckingStock}
                unavailableCount={unavailableProductIds.size}
                onCheckout={handleCheckout}
                couponInput={couponInput}
                setCouponInput={setCouponInput}
                appliedCoupon={appliedCoupon}
                onApplyCoupon={handleApplyCoupon}
                onRemoveCoupon={handleRemoveCoupon}
                isApplyingCoupon={isApplyingCoupon}
                coupons={coupons}
                isLoadingCoupons={isLoadingCoupons}
                showCouponList={showCouponList}
                setShowCouponList={setShowCouponList}
                isDistributor={isDistributor}
                totalCommission={totalCommission}
              />
            </aside>
          </div>
        )}
      </main>

      <Footer />

      {/* Address Form Modal */}

      <AddressFormModal
        isOpen={isAddressModalOpen}
        inline={false}
        onClose={() => {
          if (!isCreating && !isUpdatingAddress) {
            setIsAddressModalOpen(false);
            setEditingAddress(null);
          }
        }}
        onSubmit={editingAddress ? handleUpdateAddress : handleCreateAddress}
        initialData={editingAddress}
        isLoading={isCreating || isUpdatingAddress}
      />

      {/* Address Selector Modal */}

      <AddressSelectorModal
        isOpen={isSelectorModalOpen}
        addresses={availableAddresses}
        selectedId={selectedDeliveryAddress?.id}
        onSelect={(address) => {
          setSelectedDeliveryAddress(address);
          setIsSelectorModalOpen(false);
        }}
        onEdit={(address) => {
          setIsSelectorModalOpen(false);
          setEditingAddress(address);
          setIsAddressModalOpen(true);
        }}
        onAddNew={() => {
          setIsSelectorModalOpen(false);
          setEditingAddress(null);
          setIsAddressModalOpen(true);
        }}
        onDelete={(address) => {
          openDeleteConfirm(address);
        }}
        deletingId={deletingAddressId}
        onClose={() => setIsSelectorModalOpen(false)}
      />

      {/* Custom Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteConfirmOpen}
        isDeleting={isDeleting}
        onConfirm={handleDeleteAddress}
        onCancel={() => {
          if (!isDeleting) {
            setIsDeleteConfirmOpen(false);
            setAddressToDelete(null);
          }
        }}
      />
    </div>
  );
}
