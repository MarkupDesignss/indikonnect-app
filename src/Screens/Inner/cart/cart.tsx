"use client";
import { useMemo, useRef, useState, type MouseEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Poppins } from "next/font/google";
import {
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ShieldCheck,
  RotateCcw,
  Loader2,
  Sparkles,
  ChevronRight,
  Home,
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
} from "@/lib/redux/api/cartApi";
import { useGetProductsQuery } from "@/lib/redux/api/productApi";

const PAGE_BG = "#FFFFFF";
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

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
  distributor_price?: string | null;
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
  id: number; // Cart item ID, not product ID
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
  variantLabel: string;
  variantAttributes: Record<string, string>;
  quantity: number;
  stockQuantity: number | null;
  priceType: string;
}

const PLACEHOLDER_IMAGE = "/indiekonnect-web/images/placeholder.jpg";
const getImageUrl = (url?: string | null): string => {
  if (!url || typeof url !== "string") return PLACEHOLDER_IMAGE;
  const value = url.trim().replace(/\\\//g, "/");
  if (!value) return PLACEHOLDER_IMAGE;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("//")) return `https:${value}`;
  if (value.startsWith("/indiekonnect-web/")) return value;
  const path = value.replace(/^\/+/, "");
  return `https://www.markupdesigns.net/indikonnect/${path}`;
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
const parsePrice = (value?: string | number | null) => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};
const formatPrice = (value: number) => {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
};
const formatAttributeName = (value: string) => {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};
const getVariantLabel = (
  variant?: VariantData | null,
  variantAttributes?: Record<string, string> | null,
) => {
  if (variant?.attribute_string?.trim()) {
    return variant.attribute_string.trim();
  }
  const attributes = variantAttributes || variant?.attributes || {};
  const entries = Object.entries(attributes);
  if (!entries.length) {
    return "";
  }
  return entries
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
    ? parsePrice(item.product?.distributor_price)
    : parsePrice(item.product?.retail_price);
  const candidate =
    variantPrice > 0 ? variantPrice : productPrice > 0 ? productPrice : 0;
  return candidate > currentPrice ? candidate : undefined;
};

const Breadcrumb = ({ currentPage = "Cart" }: { currentPage?: string }) => {
  const router = useRouter();
  const breadcrumbItems = [
    {
      label: "Home",
      path: "/",
      icon: Home,
    },
    {
      label: "Cart",
      path: null,
      isCurrent: true,
    },
  ];
  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-5 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap px-1 py-1 text-[11px] font-medium sm:mb-6 sm:px-0"
    >
      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;
        const Icon = item.icon;
        return (
          <div key={item.label} className="flex items-center gap-1.5">
            {index > 0 && (
              <ChevronRight className="h-3 w-3 shrink-0 text-[#B0B0AD]" />
            )}
            {isLast ? (
              <span className="text-[#111111]">{currentPage}</span>
            ) : (
              <button
                type="button"
                onClick={() => router.push(item.path || "/")}
                className="flex items-center gap-1 text-[#777777] transition hover:text-[#111111]"
              >
                {Icon && <Icon className="h-3.5 w-3.5" />}
                {item.label}
              </button>
            )}
          </div>
        );
      })}
    </nav>
  );
};

const EmptyCart = () => {
  const router = useRouter();
  return (
    <section className="rounded-2xl border border-[#EAEAEA] bg-white px-5 py-16 text-center sm:py-20">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F1F1F0]">
        <ShoppingBag className="h-6 w-6 text-[#111111]" strokeWidth={1.5} />
      </div>
      <h2 className="mt-5 text-[20px] font-semibold text-[#111111]">
        Your cart is empty
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-[12px] leading-5 text-[#777777]">
        Discover something beautiful from our curated collection.
      </p>
      <button
        type="button"
        onClick={() => router.push("/products")}
        className="mt-6 inline-flex h-10 items-center gap-2 rounded-[6px] bg-black px-5 text-[11px] font-semibold uppercase tracking-wide text-white transition hover:bg-[#49372B]"
      >
        Continue Shopping
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </section>
  );
};

const VariantDetails = ({
  variantLabel,
  sku,
  variantAttributes,
}: {
  variantLabel: string;
  sku: string;
  variantAttributes: Record<string, string>;
}) => {
  const hasAttributes = Object.keys(variantAttributes).length > 0;
  if (!variantLabel && !sku && !hasAttributes) {
    return null;
  }
  return (
    <div className="mt-1.5 space-y-1">
      {variantLabel && (
        <div className="inline-flex max-w-full items-center rounded-[4px] border border-[#E1E1DF] bg-[#FAFAF9] px-2 py-1">
          <span className="truncate text-[9px] font-medium text-[#555555]">
            {variantLabel}
          </span>
        </div>
      )}
      {hasAttributes && !variantLabel && (
        <div className="flex flex-wrap gap-1">
          {Object.entries(variantAttributes).map(([key, value]) => (
            <span
              key={key}
              className="rounded-[4px] border border-[#E1E1DF] bg-[#FAFAF9] px-2 py-1 text-[8px] text-[#666666]"
            >
              {formatAttributeName(key)}:{" "}
              <span className="font-medium text-[#222222]">{value}</span>
            </span>
          ))}
        </div>
      )}
      {sku && (
        <p className="text-[8px] text-[#999999]">
          SKU: <span className="font-medium text-[#777777]">{sku}</span>
        </p>
      )}
    </div>
  );
};

const CartProductItem = ({
  item,
  isUpdating,
  isRemoving,
  updateQuantity,
  removeItem,
}: {
  item: CartItemView;
  isUpdating: boolean;
  isRemoving: boolean;
  updateQuantity: (id: number, action: "increment" | "decrement") => void;
  removeItem: (id: number) => void;
}) => {
  const originalTotal = item.originalPrice
    ? item.originalPrice * item.quantity
    : null;
  const itemTotal = item.price * item.quantity;
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="group grid grid-cols-[88px_minmax(0,1fr)] gap-4 border-b border-[#EEEEEE] py-6 last:border-0 sm:grid-cols-[132px_minmax(0,1fr)] sm:gap-6 sm:py-7"
    >
      <Link
        href={`/product/${item.slug}`}
        className="relative block h-[105px] w-[88px] overflow-hidden rounded-xl bg-[#F7F7F7] sm:h-[150px] sm:w-[132px]"
      >
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="(max-width:640px) 88px, 132px"
          className="object-contain p-2.5 transition-transform duration-500 group-hover:scale-105"
        />
      </Link>
      <div className="flex min-w-0 flex-col justify-between gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.13em] text-[#959595]">
              {item.productCode
                ? `Product ${item.productCode}`
                : "Selected for you"}
            </p>
            <Link
              href={`/product/${item.slug}`}
              className="line-clamp-2 text-[14px] font-semibold leading-6 text-[#1D1D1D] transition-colors hover:text-[#656565] sm:text-[16px]"
            >
              {item.name}
            </Link>
            <VariantDetails
              variantLabel={item.variantLabel}
              sku={item.sku}
              variantAttributes={item.variantAttributes}
            />
          </div>
          <button
            type="button"
            aria-label={`Remove ${item.name}`}
            title="Remove item"
            onClick={() => removeItem(item.id)}
            disabled={isRemoving}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#999] transition hover:bg-[#FFF2F1] hover:text-[#B64339] disabled:opacity-40"
          >
            {isRemoving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" strokeWidth={1.6} />
            )}
          </button>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div
            className="inline-flex h-10 items-center overflow-hidden rounded-lg border border-[#DEDEDE] bg-white"
            aria-label="Quantity selector"
          >
            <button
              type="button"
              aria-label="Decrease quantity"
              disabled={item.quantity <= 1 || isUpdating}
              onClick={() => updateQuantity(item.id, "decrement")}
              className="grid h-full w-10 place-items-center text-[#292929] transition hover:bg-[#F6F6F6] disabled:opacity-30"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span
              className="grid h-full min-w-[32px] place-items-center text-[13px] font-semibold text-[#1B1B1B]"
              aria-live="polite"
            >
              {isUpdating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                item.quantity
              )}
            </span>
            <button
              type="button"
              aria-label="Increase quantity"
              disabled={
                item.quantity >= Math.min(10, item.stockQuantity ?? 10) ||
                isUpdating
              }
              onClick={() => updateQuantity(item.id, "increment")}
              className="grid h-full w-10 place-items-center text-[#292929] transition hover:bg-[#F6F6F6] disabled:opacity-30"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="text-right">
            <p className="text-[16px] font-semibold tracking-[-0.02em] text-[#151515] sm:text-[18px]">
              {formatPrice(itemTotal)}
            </p>
            {originalTotal && originalTotal > itemTotal ? (
              <p className="mt-0.5 text-[11px] text-[#9C9C9C] line-through">
                {formatPrice(originalTotal)}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </motion.article>
  );
};

const OrderSummary = ({
  subtotal,
  totalSavings,
  total,
  itemCount,
  cartItems,
}: {
  subtotal: number;
  totalSavings: number;
  total: number;
  itemCount: number;
  cartItems: CartItemView[];
}) => {
  const router = useRouter();
  return (
    <section className="rounded-2xl border border-[#E9E9E9] bg-white p-6 sm:p-7">
      <div className="mb-7 flex items-center justify-between gap-3">
        <h2 className="text-[19px] font-semibold tracking-[-0.025em] text-[#171717]">
          Order Summary
        </h2>
        <span className="rounded-full bg-[#F6F6F6] px-3 py-1 text-[11px] font-medium text-[#777]">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </span>
      </div>
      <div className="space-y-4 text-[13px]">
        <div className="flex items-center justify-between gap-4">
          <span className="text-[#777]">Subtotal</span>
          <span className="font-medium text-[#282828]">
            {formatPrice(subtotal)}
          </span>
        </div>
        {totalSavings > 0 && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-[#777]">Your savings</span>
            <span className="font-semibold text-[#28815C]">
              −{formatPrice(totalSavings)}
            </span>
          </div>
        )}
      </div>
      <div className="my-6 h-px bg-[#EBEBEB]" />
      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          <p className="text-[14px] font-semibold text-[#222]">Total</p>
          <p className="mt-1 text-[11px] text-[#999]">
            Calculated from your cart
          </p>
        </div>
        <p className="text-[24px] font-semibold tracking-[-0.04em] text-[#111]">
          {formatPrice(total)}
        </p>
      </div>
      <button
        type="button"
        onClick={() => {
          if (!cartItems.length) {
            toast.error("Your cart is empty");
            return;
          }
          router.push("/checkout");
        }}
        className="flex h-[52px] w-full items-center justify-center gap-3 rounded-xl bg-[#171717] px-5 text-[13px] font-semibold text-white transition hover:bg-[#373737] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
      >
        Proceed to Checkout <ArrowRight className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => router.push("/products")}
        className="mx-auto mt-5 flex items-center gap-2 text-[12px] font-medium text-[#707070] transition hover:text-[#111]"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Continue Shopping
      </button>
      <div className="mt-6 flex items-center justify-center gap-2 border-t border-[#EFEFEF] pt-5 text-[11px] text-[#8B8B8B]">
        <ShieldCheck className="h-4 w-4" strokeWidth={1.7} /> Secure checkout
      </div>
    </section>
  );
};

const RecommendedSection = ({
  recommended,
  addingProductId,
  handleRecommendedAddToCart,
  scrollRecommended,
  recommendedScrollRef,
}: any) => {
  return (
    <section
      className="
        rounded-xl
        border
        border-[#E6E6E4]
        bg-white
        p-4
        sm:p-[18px]
      "
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="mb-1 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-[#333333]" />
            <span className="text-[9px] font-medium uppercase tracking-[0.14em] text-[#999999]">
              Curated for you
            </span>
          </div>
          <h2 className="text-[16px] font-semibold text-[#171717]">
            You might also like
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/products"
            className="hidden text-[9px] font-medium uppercase tracking-wide text-[#777777] underline underline-offset-4 transition hover:text-[#111111] sm:block"
          >
            View all
          </Link>
          {recommended.length > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => scrollRecommended("left")}
                className="
                  flex
                  h-7
                  w-7
                  items-center
                  justify-center
                  rounded-[5px]
                  border
                  border-[#D8D8D6]
                  bg-white
                  text-[#333333]
                  transition
                  hover:bg-[#F3F3F2]
                "
                aria-label="Scroll left"
              >
                <ArrowLeft className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => scrollRecommended("right")}
                className="
                  flex
                  h-7
                  w-7
                  items-center
                  justify-center
                  rounded-[5px]
                  bg-[#111111]
                  text-white
                  transition
                  hover:bg-[#49372B]
                "
                aria-label="Scroll right"
              >
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div
        ref={recommendedScrollRef}
        className="
          flex
          gap-3
          overflow-x-auto
          pb-1
          scroll-smooth
          snap-x
          snap-mandatory
          [-ms-overflow-style:none]
          [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden
        "
      >
        {recommended.map((product: any) => {
          const isAdding = addingProductId === product.id;
          return (
            <div
              key={product.id}
              className="
                  group
                  w-[132px]
                  shrink-0
                  snap-start
                  sm:w-[145px]
                  md:w-[155px]
                "
            >
              <Link href={`/product/${product.slug}`}>
                <div
                  className="
                      relative
                      aspect-square
                      overflow-hidden
                      rounded-[6px]
                      border
                      border-[#E5E5E3]
                      bg-[#F1F1F0]
                      transition
                      group-hover:border-[#111111]
                    "
                >
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
                <p className="truncate text-[10px] font-medium text-[#222222]">
                  {product.name}
                </p>
                <p className="mt-0.5 text-[13px] font-semibold text-[#111111]">
                  {formatPrice(parsePrice(product.retail_price))}
                </p>
                <button
                  type="button"
                  onClick={(e: MouseEvent<HTMLButtonElement>) =>
                    handleRecommendedAddToCart(product, e)
                  }
                  disabled={isAdding}
                  className="
                      mt-1.5
                      flex
                      h-7
                      w-full
                      items-center
                      justify-center
                      gap-1.5
                      rounded-[5px]
                      bg-[#111111]
                      text-[9px]
                      font-semibold
                      uppercase
                      tracking-wide
                      text-white
                      transition
                      hover:bg-[#49372B]
                      disabled:opacity-50
                    "
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
};

const CartWithItems = ({
  cartItems,
  itemCount,
  isUpdating,
  isRemoving,
  isClearing,
  updateQuantity,
  removeItem,
  clearCartHandler,
  recommended,
  isProductsLoading,
  addingProductId,
  handleRecommendedAddToCart,
  scrollRecommended,
  recommendedScrollRef,
  subtotal,
  totalSavings,
  total,
}: any) => {
  return (
    <div
      className="
        grid
        grid-cols-1
        items-start
        gap-5
        lg:grid-cols-[minmax(0,1fr)_350px]
      "
    >
      <div className="min-w-0 space-y-5">
        <section
          className="
            overflow-hidden
            rounded-[22px]
            border
            border-[#EAEAEA]
            bg-white
            shadow-[0_14px_50px_-36px_rgba(62,43,19,0.28)]
          "
        >
          <div className="flex items-center justify-between px-5 pb-5 pt-6 sm:px-7 sm:pt-7">
            <div>
              <h1 className="text-[20px] font-semibold tracking-[-0.03em] text-[#171717]">
                Shopping Cart
              </h1>
              <p className="mt-0.5 text-[10px] text-[#888888]">
                {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
              </p>
            </div>
            <button
              type="button"
              onClick={clearCartHandler}
              disabled={isClearing}
              className="
                flex
                h-8
                items-center
                gap-1.5
                rounded-[5px]
                border
                border-[#E7E7E7]
                bg-white
                px-3
                text-[9px]
                font-semibold
                uppercase
                tracking-wide
                text-[#707070]
                transition
                hover:bg-[#F7F7F7]
                disabled:opacity-40
              "
            >
              {isClearing && <Loader2 className="h-3 w-3 animate-spin" />}
              Clear Cart
            </button>
          </div>

          <div
            className="
              hidden
              border-y
              border-[#EEEEEC]
              bg-[#FAFAF9]
              px-[18px]
              py-2.5
              md:grid
              md:grid-cols-[minmax(0,1fr)_110px_90px_30px]
              md:gap-3
            "
          >
            <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#999999]">
              Product
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#999999]">
              Quantity
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#999999]">
              Price
            </span>
            <span />
          </div>

          <div className="px-5 sm:px-7">
            <AnimatePresence initial={false}>
              {cartItems.map((item: CartItemView) => (
                <CartProductItem
                  key={item.id}
                  item={item}
                  isUpdating={isUpdating === item.id}
                  isRemoving={isRemoving}
                  updateQuantity={updateQuantity}
                  removeItem={removeItem}
                />
              ))}
            </AnimatePresence>
          </div>

          <div className="border-t border-[#EEEEEE] px-5 py-5 sm:px-7">
            <div className="flex items-center justify-between">
              <Link
                href="/products"
                className="
                  flex
                  items-center
                  gap-1.5
                  text-[10px]
                  font-medium
                  text-[#555555]
                  transition
                  hover:text-[#111111]
                "
              >
                <ArrowLeft className="h-3 w-3" />
                Continue Shopping
              </Link>
              <span className="text-[9px] text-[#999999]">
                Secure & easy checkout
              </span>
            </div>
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
          cartItems={cartItems}
        />
      </aside>
    </div>
  );
};

export default function CartPage() {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState<number | null>(null);
  const [addingProductId, setAddingProductId] = useState<
    number | string | null
  >(null);
  const recommendedScrollRef = useRef<HTMLDivElement>(null);

  const {
    data: cartData,
    isLoading: isCartLoading,
    refetch: refetchCart,
  } = useGetCartQuery({});
  const { data: productsData, isLoading: isProductsLoading } =
    useGetProductsQuery({});
  const [removeFromCart, { isLoading: isRemoving }] =
    useRemoveFromCartMutation();
  const [clearCart, { isLoading: isClearing }] = useClearCartMutation();
  const [updateCartItem] = useUpdateCartItemMutation();
  const [addToCart] = useAddToCartMutation();

  const scrollRecommended = (direction: "left" | "right") => {
    const element = recommendedScrollRef.current;
    if (!element) return;
    element.scrollBy({
      left: direction === "left" ? -220 : 220,
      behavior: "smooth",
    });
  };

  const cartItems = useMemo<CartItemView[]>(() => {
    const apiItems: CartItemApi[] = cartData?.data?.items || [];
    if (!apiItems.length) {
      return [];
    }
    return apiItems.map((item) => {
      const currentPrice = parsePrice(item.current_unit_price);
      const variantAttributes =
        item.variant_attributes || item.variant?.attributes || {};
      const variantLabel = getVariantLabel(item.variant, variantAttributes);
      const originalPrice = getOriginalPrice(item, currentPrice);
      return {
        id: item.id,
        cartItemId: item.id,
        productId: item.product_id,
        variantId: item.variant_id ?? null,
        name: item.product?.name || "Product",
        slug: item.product?.slug || "",
        image: getImageUrl(item.image_url),
        price: currentPrice,
        originalPrice,
        productCode: item.product?.product_code || "",
        sku: item.variant?.sku || "",
        variantLabel,
        variantAttributes,
        quantity: Number(item.quantity || 1),
        stockQuantity: item.variant?.stock_quantity ?? null,
        priceType:
          item.current_price_type || cartData?.data?.price_type || "retail",
      };
    });
  }, [cartData]);

  const recommended = useMemo(() => {
    if (!productsData?.data) {
      return [];
    }
    const cartProductIds = new Set(cartItems.map((item) => item.productId));
    return (productsData.data || [])
      .filter((product: any) => !cartProductIds.has(product.id))
      .slice(0, 8);
  }, [productsData, cartItems]);

  const { subtotal, totalSavings, total, itemCount } = useMemo(() => {
    const subtotalValue = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const mrpValue = cartItems.reduce(
      (sum, item) => sum + (item.originalPrice || item.price) * item.quantity,
      0,
    );
    const savings = Math.max(mrpValue - subtotalValue, 0);
    const finalTotal = subtotalValue;
    const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    return {
      subtotal: subtotalValue,
      totalSavings: savings,
      total: finalTotal,
      itemCount: count,
    };
  }, [cartItems]);

  const updateQuantity = async (
    cartItemId: number,
    action: "increment" | "decrement",
  ) => {
    const item = cartItems.find((cartItem) => cartItem.id === cartItemId);
    if (!item?.cartItemId) {
      toast.error("Cart item not found");
      return;
    }
    const newQuantity =
      action === "increment"
        ? Math.min(item.quantity + 1, 10, item.stockQuantity ?? 10)
        : Math.max(item.quantity - 1, 1);
    if (newQuantity === item.quantity) {
      return;
    }
    setIsUpdating(cartItemId);
    try {
      await updateCartItem({
        itemId: item.cartItemId,
        data: {
          quantity: newQuantity,
          action,
        },
      }).unwrap();
      await refetchCart();
    } catch (error: any) {
      toast.error(error?.data?.message || "Unable to update quantity");
    } finally {
      setIsUpdating(null);
    }
  };

  const removeItem = async (cartItemId: number) => {
    const item = cartItems.find((cartItem) => cartItem.id === cartItemId);
    if (!item?.cartItemId) {
      return;
    }
    try {
      await removeFromCart(item.cartItemId).unwrap();
      await refetchCart();
      toast.success("Item removed from cart", {
        position: "bottom-center",
      });
    } catch (error: any) {
      toast.error(error?.data?.message || "Unable to remove item");
    }
  };

  const clearCartHandler = async () => {
    try {
      await clearCart({}).unwrap();
      await refetchCart();
      toast.success("Cart cleared successfully", {
        position: "bottom-center",
      });
    } catch (error: any) {
      toast.error(error?.data?.message || "Unable to clear cart");
    }
  };

  const handleRecommendedAddToCart = async (
    product: any,
    e?: MouseEvent<HTMLButtonElement>,
  ) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (addingProductId === product.id) {
      return;
    }
    try {
      setAddingProductId(product.id);
      await addToCart({
        product_id: product.id,
        quantity: 1,
      }).unwrap();
      await refetchCart();
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

  if (isCartLoading) {
    return (
      <div
        className={`${poppins.className} min-h-screen bg-white text-[#171717]`}
        style={{
          background: PAGE_BG,
        }}
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
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#E4E4E2] bg-white">
              <Loader2 className="h-5 w-5 animate-spin text-[#111111]" />
            </div>
            <p className="mt-4 text-[9px] font-medium uppercase tracking-[0.16em] text-[#999999]">
              Preparing your cart
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div
      className={`${poppins.className} min-h-screen bg-white text-[#171717]`}
      style={{
        background: PAGE_BG,
      }}
    >
      <Header
        cartItems={cartItems}
        cartCount={itemCount}
        cartSubtotal={subtotal}
        wishlistCount={0}
        onRemoveFromCart={removeItem}
        onClearCart={clearCartHandler}
      />
      <main
        className="
          mx-auto
          w-full
          max-w-[1200px]
          px-4
          py-5
          sm:px-6
          sm:py-7
          lg:px-8
        "
      >
        <div className="mb-5 sm:mb-6">
          <h1 className="text-[28px] font-semibold tracking-[-0.045em] text-[#171717] sm:text-[36px]">
            Shopping Bag
          </h1>
          <Breadcrumb currentPage="Cart" />
        </div>
        {cartItems.length === 0 ? (
          <EmptyCart />
        ) : (
          <CartWithItems
            cartItems={cartItems}
            itemCount={itemCount}
            isUpdating={isUpdating}
            isRemoving={isRemoving}
            isClearing={isClearing}
            updateQuantity={updateQuantity}
            removeItem={removeItem}
            clearCartHandler={clearCartHandler}
            recommended={recommended}
            isProductsLoading={isProductsLoading}
            addingProductId={addingProductId}
            handleRecommendedAddToCart={handleRecommendedAddToCart}
            scrollRecommended={scrollRecommended}
            recommendedScrollRef={recommendedScrollRef}
            subtotal={subtotal}
            totalSavings={totalSavings}
            total={total}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}
