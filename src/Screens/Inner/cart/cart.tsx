"use client";

import { useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent, type RefObject } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Poppins } from "next/font/google";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  Home,
  Info,
  Loader2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  X,
  AlertTriangle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Header from "../../../components/common/Header";
import Footer from "../../../components/Footer/Footer";
import {
  useGetCartQuery,
  useRemoveFromCartMutation,
  useClearCartMutation,
  useUpdateCartItemMutation,
  useAddToCartMutation,
  useCheckCartStockMutation,
} from "@/lib/redux/api/cartApi";
import { useGetProductsQuery } from "@/lib/redux/api/productApi";
import Loding from "@/components/common/Loding";

const PAGE_BG = "#FFFFFF";
const PLACEHOLDER_IMAGE = "/indiekonnect-web/images/placeholder.jpg";
const MAX_CART_QUANTITY = 10;

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

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
}

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

const formatAttributeName = (value: string): string =>
  value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

const getTaxonomyName = (value?: ProductTaxonomy | null): string =>
  String(value?.title || value?.name || "").trim();

const getVariantLabel = (
  variant?: VariantData | null,
  variantAttributes?: Record<string, string> | null,
): string => {
  if (variant?.attribute_string?.trim()) return variant.attribute_string.trim();
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
    ? parsePrice(item.product?.distributor_mrp ?? item.product?.distributor_price)
    : parsePrice(item.product?.retail_mrp ?? item.product?.retail_price);
  const candidate =
    variantPrice > 0 ? variantPrice : productPrice > 0 ? productPrice : 0;
  return candidate > currentPrice ? candidate : undefined;
};

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
        <Home className="h-3.5 w-3.5" /> Home
      </button>
      <ChevronRight className="h-3 w-3 shrink-0 text-[#B0B0AD]" />
      <span className="text-[#111]">{currentPage}</span>
    </nav>
  );
};

const EmptyCart = () => {
  const router = useRouter();
  return (
    <section className="rounded-xl border border-[#E8E8E8] bg-white px-5 py-16 text-center sm:py-20">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F4F4F4]">
        <ShoppingBag className="h-6 w-6 text-[#222]" strokeWidth={1.5} />
      </div>
      <h2 className="mt-5 text-[20px] font-semibold text-[#111]">Your cart is empty</h2>
      <p className="mx-auto mt-2 max-w-sm text-[12px] leading-5 text-[#777]">
        Discover something beautiful from our curated collection.
      </p>
      <button
        type="button"
        onClick={() => router.push("/products")}
        className="mt-6 inline-flex h-10 items-center gap-2 rounded-md bg-black px-5 text-[11px] font-semibold uppercase tracking-wide text-white transition hover:bg-[#333]"
      >
        Continue Shopping <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </section>
  );
};

function CartProductItem({
  item,
  isUpdating,
  isRemoving,
  isUnavailable,
  updateQuantity,
  removeItem,
}: {
  item: CartItemView;
  isUpdating: boolean;
  isRemoving: boolean;
  isUnavailable: boolean;
  updateQuantity: (id: number, quantity: number) => void;
  removeItem: (id: number) => void;
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
    if (quantity !== item.quantity) updateQuantity(item.id, quantity);
  };

  const categoryAndBrand = [item.category, item.subcategory, item.brand]
    .filter((value, index, values) => Boolean(value) && values.indexOf(value) === index)
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
            if (!image.src.endsWith(PLACEHOLDER_IMAGE)) image.src = PLACEHOLDER_IMAGE;
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
                          {active && <Check className="h-3 w-3" strokeWidth={3} />}
                        </button>
                      </li>
                    );
                  })}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          {item.stockQuantity !== null && item.stockQuantity > 0 && (
            <span className="inline-flex h-[22px] items-center rounded-[3px] border border-[#FF755D] px-1.5 text-[9.5px] font-medium text-[#F04430]">
              {item.stockQuantity} left
            </span>
          )}
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
                  {formatPrice(discountAmount)} OFF <Info className="h-2.5 w-2.5" />
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </motion.article>
  );
}

function OrderSummary({
  subtotal,
  totalSavings,
  total,
  itemCount,
  isCheckingStock,
  unavailableCount,
  onCheckout,
}: {
  subtotal: number;
  totalSavings: number;
  total: number;
  itemCount: number;
  isCheckingStock: boolean;
  unavailableCount: number;
  onCheckout: () => void;
}) {
  const router = useRouter();
  return (
    <section className="rounded-xl border border-[#E5E5E5] bg-white p-4 sm:p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-[17px] font-semibold text-[#171717]">Order Summary</h2>
        <span className="rounded-full bg-[#F4F4F4] px-2.5 py-1 text-[10px] font-medium text-[#777]">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </span>
      </div>
      <div className="space-y-3 text-[12px]">
        <div className="flex items-center justify-between gap-4">
          <span className="text-[#777]">Subtotal</span>
          <span className="font-medium text-[#282828]">{formatPrice(subtotal)}</span>
        </div>
        {totalSavings > 0 && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-[#777]">Your savings</span>
            <span className="font-semibold text-[#28815C]">−{formatPrice(totalSavings)}</span>
          </div>
        )}
      </div>
      <div className="my-5 h-px bg-[#EBEBEB]" />
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-[13px] font-semibold text-[#222]">Total</p>
          <p className="mt-1 text-[10px] text-[#999]">Calculated from your cart</p>
        </div>
        <p className="text-[22px] font-semibold tracking-[-0.04em] text-[#111]">
          {formatPrice(total)}
        </p>
      </div>
      {unavailableCount > 0 && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-[#F1C8C4] bg-[#FFF2F1] p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#B64339]" />
          <div>
            <p className="text-[11px] font-semibold text-[#B64339]">
              {unavailableCount} {unavailableCount === 1 ? "item is" : "items are"} out of stock
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
        disabled={isCheckingStock || itemCount === 0}
        className="flex h-[46px] w-full items-center justify-center gap-2 rounded-md bg-[#171717] px-4 text-[12px] font-semibold text-white transition hover:bg-[#373737] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isCheckingStock ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Checking stock...
          </>
        ) : (
          <>Proceed to Checkout <ArrowRight className="h-4 w-4" /></>
        )}
      </button>
      <button
        type="button"
        onClick={() => router.push("/products")}
        className="mx-auto mt-4 flex items-center gap-2 text-[11px] font-medium text-[#707070] transition hover:text-[#111]"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Continue Shopping
      </button>
      <div className="mt-5 flex items-center justify-center gap-2 border-t border-[#EFEFEF] pt-4 text-[10px] text-[#8B8B8B]">
        <ShieldCheck className="h-4 w-4" strokeWidth={1.7} /> Secure checkout
      </div>
    </section>
  );
}

function RecommendedSection({
  recommended,
  addingProductId,
  handleRecommendedAddToCart,
  scrollRecommended,
  recommendedScrollRef,
}: {
  recommended: any[];
  addingProductId: number | string | null;
  handleRecommendedAddToCart: (product: any, event?: ReactMouseEvent<HTMLButtonElement>) => void;
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
          <h2 className="text-[15px] font-semibold text-[#171717]">You might also like</h2>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/products" className="hidden text-[9px] font-medium uppercase tracking-wide text-[#777] underline underline-offset-4 hover:text-black sm:block">
            View all
          </Link>
          {recommended.length > 1 && (
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => scrollRecommended("left")} aria-label="Scroll left" className="flex h-7 w-7 items-center justify-center rounded-[5px] border border-[#D8D8D6] bg-white text-[#333] hover:bg-[#F3F3F2]">
                <ArrowLeft className="h-3 w-3" />
              </button>
              <button type="button" onClick={() => scrollRecommended("right")} aria-label="Scroll right" className="flex h-7 w-7 items-center justify-center rounded-[5px] bg-black text-white hover:bg-[#333]">
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      </div>
      <div ref={recommendedScrollRef} className="flex gap-3 overflow-x-auto pb-1 scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {recommended.map((product: any) => {
          const isAdding = addingProductId === product.id;
          return (
            <div key={product.id} className="group w-[128px] shrink-0 snap-start sm:w-[140px] md:w-[150px]">
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
                      if (!image.src.endsWith(PLACEHOLDER_IMAGE)) image.src = PLACEHOLDER_IMAGE;
                    }}
                  />
                </div>
              </Link>
              <div className="pt-2">
                <p className="truncate text-[10px] font-medium text-[#222]">{product.name}</p>
                <p className="mt-0.5 text-[12px] font-semibold text-[#111]">
                  {formatPrice(parsePrice(product.retail_price))}
                </p>
                <button
                  type="button"
                  onClick={(event) => handleRecommendedAddToCart(product, event)}
                  disabled={isAdding}
                  className="mt-1.5 flex h-9 w-full items-center justify-center gap-1.5 rounded-[5px] bg-black text-[9px] font-semibold uppercase tracking-wide text-white transition hover:bg-[#333] disabled:opacity-50"
                >
                  {isAdding ? <Loader2 className="h-3 w-3 animate-spin" /> : <ShoppingBag className="h-3 w-3" />}
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

export default function CartPage() {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState<number | null>(null);
  const [addingProductId, setAddingProductId] = useState<number | string | null>(null);
  const recommendedScrollRef = useRef<HTMLDivElement>(null);
  const [unavailableProductIds, setUnavailableProductIds] = useState<Set<number>>(new Set());
  const [isCheckingStock, setIsCheckingStock] = useState(false);

  const {
    data: cartData,
    isLoading: isCartLoading,
    refetch: refetchCart,
  } = useGetCartQuery({});
  const { data: productsData, isLoading: isProductsLoading } = useGetProductsQuery({});
  const [removeFromCart, { isLoading: isRemoving }] = useRemoveFromCartMutation();
  const [clearCart, { isLoading: isClearing }] = useClearCartMutation();
  const [updateCartItem] = useUpdateCartItemMutation();
  const [addToCart] = useAddToCartMutation();
  const [checkCartStock] = useCheckCartStockMutation();

  const cartItems = useMemo<CartItemView[]>(() => {
    const apiItems: CartItemApi[] = cartData?.data?.items || [];
    return apiItems.map((item) => {
      const currentPrice = parsePrice(item.current_unit_price);
      const variantAttributes = item.variant_attributes || item.variant?.attributes || {};
      const productStock = item.product?.available_stock ?? item.product?.stock_quantity;
      const stockQuantity = item.variant?.stock_quantity ?? productStock ?? null;
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
        priceType: item.current_price_type || cartData?.data?.price_type || "retail",
      };
    });
  }, [cartData]);

  const recommended = useMemo(() => {
    if (!productsData?.data) return [];
    const cartProductIds = new Set(cartItems.map((item) => item.productId));
    return (productsData.data || [])
      .filter((product: any) => !cartProductIds.has(product.id))
      .slice(0, 8);
  }, [productsData, cartItems]);

  const { subtotal, totalSavings, total, itemCount } = useMemo(() => {
    const subtotalValue = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const mrpValue = cartItems.reduce(
      (sum, item) => sum + (item.originalPrice || item.price) * item.quantity,
      0,
    );
    const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    return {
      subtotal: subtotalValue,
      totalSavings: Math.max(mrpValue - subtotalValue, 0),
      total: subtotalValue,
      itemCount: count,
    };
  }, [cartItems]);

  const scrollRecommended = (direction: "left" | "right") => {
    recommendedScrollRef.current?.scrollBy({
      left: direction === "left" ? -220 : 220,
      behavior: "smooth",
    });
  };

  const runCartStockCheck = async (): Promise<{ allAvailable: boolean; unavailableIds: Set<number> }> => {
    const cartId = cartData?.data?.id;
    if (!cartId) {
      toast.error("Cart is not ready yet. Please refresh the page.", { position: "bottom-center" });
      return { allAvailable: false, unavailableIds: new Set() };
    }
    try {
      const result = await checkCartStock({ cartId }).unwrap();
      const items = result?.data?.items || [];
      const unavailableIds = new Set<number>();
      items.forEach((entry: any) => {
        if (!entry.available) unavailableIds.add(Number(entry.product_id));
      });
      setUnavailableProductIds(unavailableIds);
      await refetchCart();
      const allAvailable = unavailableIds.size === 0;
      if (allAvailable) {
        toast.success("All items are in stock. Proceeding to checkout…", {
          position: "bottom-center",
          duration: 2000,
        });
      } else {
        toast.error(
          unavailableIds.size === 1
            ? "1 item is out of stock. Please remove it to continue."
            : `${unavailableIds.size} items are out of stock. Please remove them to continue.`,
          { position: "bottom-center", duration: 4000 },
        );
      }
      return { allAvailable, unavailableIds };
    } catch (error: any) {
      toast.error(error?.data?.message || "Unable to verify stock right now. Please try again.", {
        position: "bottom-center",
        duration: 4000,
      });
      return { allAvailable: false, unavailableIds: new Set() };
    }
  };

  const handleCheckout = async () => {
    if (!cartItems.length) {
      toast.error("Your cart is empty", { position: "bottom-center" });
      return;
    }
    setIsCheckingStock(true);
    try {
      const { allAvailable } = await runCartStockCheck();
      if (allAvailable) router.push("/checkout");
    } finally {
      setIsCheckingStock(false);
    }
  };

  const updateQuantity = async (cartItemId: number, requestedQuantity: number) => {
    const item = cartItems.find((cartItem) => cartItem.id === cartItemId);
    if (!item?.cartItemId) {
      toast.error("Cart item not found");
      return;
    }
    const availableLimit = Math.min(MAX_CART_QUANTITY, item.stockQuantity ?? MAX_CART_QUANTITY);
    const newQuantity = Math.max(1, Math.min(requestedQuantity, Math.max(1, availableLimit)));
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

  const removeItem = async (cartItemId: number) => {
    const item = cartItems.find((cartItem) => cartItem.id === cartItemId);
    if (!item?.cartItemId) return;
    try {
      await removeFromCart(item.cartItemId).unwrap();
      await refetchCart();
      setUnavailableProductIds((previous) => {
        if (!previous.has(item.productId)) return previous;
        const next = new Set(previous);
        next.delete(item.productId);
        return next;
      });
      toast.success("Item removed from cart", { position: "bottom-center" });
    } catch (error: any) {
      toast.error(error?.data?.message || "Unable to remove item");
    }
  };

  const clearCartHandler = async () => {
    try {
      await clearCart({}).unwrap();
      await refetchCart();
      setUnavailableProductIds(new Set());
      toast.success("Cart cleared successfully", { position: "bottom-center" });
    } catch (error: any) {
      toast.error(error?.data?.message || "Unable to clear cart");
    }
  };

  const handleRecommendedAddToCart = async (
    product: any,
    event?: ReactMouseEvent<HTMLButtonElement>,
  ) => {
    event?.preventDefault();
    event?.stopPropagation();
    if (addingProductId === product.id) return;
    try {
      setAddingProductId(product.id);
      await addToCart({ product_id: product.id, quantity: 1 }).unwrap();
      await refetchCart();
      toast.success("Added to cart", { position: "bottom-center" });
    } catch (error: any) {
      toast.error(error?.data?.message || "Unable to add product", { position: "bottom-center" });
    } finally {
      setAddingProductId(null);
    }
  };

  if (isCartLoading) {
    return (
      <div className={`${poppins.className} min-h-screen bg-white text-[#171717]`} style={{ background: PAGE_BG }}>
        <Header cartItems={[]} cartCount={0} cartSubtotal={0} wishlistCount={0} onRemoveFromCart={() => {}} onClearCart={() => {}} />
        <main className="mx-auto flex min-h-[65vh] w-full max-w-[1200px] items-center justify-center px-4">
          <div className="text-center"><Loding /></div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={`${poppins.className} min-h-screen bg-white text-[#171717]`} style={{ background: PAGE_BG }}>
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
        {cartItems.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="min-w-0 space-y-4">
              <section className="min-w-0">
                <div className="mb-3 flex items-center justify-between gap-3 px-0.5">
                  <div>
                    <h1 className="text-[19px] font-semibold tracking-[-0.03em] text-[#171717] sm:text-[21px]">Shopping Cart</h1>
                    <p className="mt-0.5 text-[10px] text-[#888]">{itemCount} {itemCount === 1 ? "item" : "items"} in your cart</p>
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
                        isUnavailable={unavailableProductIds.has(item.productId)}
                        updateQuantity={updateQuantity}
                        removeItem={removeItem}
                      />
                    ))}
                  </AnimatePresence>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3 border-t border-[#EEEEEE] pt-4">
                  <Link href="/products" className="flex items-center gap-1.5 text-[10px] font-medium text-[#555] transition hover:text-black">
                    <ArrowLeft className="h-3 w-3" /> Continue Shopping
                  </Link>
                  <span className="text-right text-[9px] text-[#999]">Secure &amp; easy checkout</span>
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
                subtotal={subtotal}
                totalSavings={totalSavings}
                total={total}
                itemCount={itemCount}
                isCheckingStock={isCheckingStock}
                unavailableCount={unavailableProductIds.size}
                onCheckout={handleCheckout}
              />
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
