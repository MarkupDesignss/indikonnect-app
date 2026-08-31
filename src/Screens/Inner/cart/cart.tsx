"use client";

import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ShieldCheck,
  Truck,
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

/* =========================================================
   DESIGN TOKENS
========================================================= */

const PAGE_BG = "#F7F7F6";

/* =========================================================
   TYPES
========================================================= */

interface CartProduct {
  id: number;
  name: string;
  slug: string;
  product_code: string;
  retail_price: string;
  distributor_price: string;
  primary_image: string;
  current_price_type: string;
}

interface CartItem {
  id: number;
  product_id: number;
  product: CartProduct;
  quantity: number;
  current_unit_price: string;
  current_unit_price_formatted: string;
  subtotal: number;
  subtotal_formatted: string;
  stored_unit_price: string;
  image_url: string;
}

/* =========================================================
   HELPERS
========================================================= */

const getImageUrl = (url?: string) => {
  if (!url) {
    return "/indiekonnect-web/images/placeholder.jpg";
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `https://www.markupdesigns.net/indikonnect/${url}`;
};

const formatPrice = (value: number) => {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
};

/* =========================================================
   BREADCRUMB
========================================================= */

const Breadcrumb = ({
  currentPage = "Cart",
}: {
  currentPage?: string;
}) => {
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
          <div
            key={item.label}
            className="flex items-center gap-1.5"
          >
            {index > 0 && (
              <ChevronRight className="h-3 w-3 shrink-0 text-[#B0B0AD]" />
            )}

            {isLast ? (
              <span className="text-[#111111]">
                {currentPage}
              </span>
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

/* =========================================================
   EMPTY CART
========================================================= */

const EmptyCart = () => {
  const router = useRouter();

  return (
    <section className="rounded-[8px] border border-[#E6E6E4] bg-white px-5 py-16 text-center sm:py-20">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F1F1F0]">
        <ShoppingBag
          className="h-6 w-6 text-[#111111]"
          strokeWidth={1.5}
        />
      </div>

      <h2 className="mt-5 text-[20px] font-semibold text-[#111111]">
        Your cart is empty
      </h2>

      <p className="mx-auto mt-2 max-w-sm text-[12px] leading-5 text-[#777777]">
        Discover something beautiful from our curated
        collection.
      </p>

      <button
        type="button"
        onClick={() => router.push("/products")}
        className="mt-6 inline-flex h-10 items-center gap-2 rounded-[6px] bg-black px-5 text-[11px] font-semibold uppercase tracking-wide text-white transition hover:bg-[#222222]"
      >
        Continue Shopping

        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </section>
  );
};

/* =========================================================
   CART PRODUCT ITEM
========================================================= */

const CartProductItem = ({
  item,
  isUpdating,
  isRemoving,
  updateQuantity,
  removeItem,
}: {
  item: any;
  isUpdating: boolean;
  isRemoving: boolean;
  updateQuantity: (
    id: number,
    action: "increment" | "decrement",
  ) => void;
  removeItem: (id: number) => void;
}) => {
  const itemTotal = item.price * item.quantity;

  const originalTotal = item.originalPrice
    ? item.originalPrice * item.quantity
    : 0;

  return (
    <motion.div
      layout
      initial={{
        opacity: 0,
        y: 8,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        height: 0,
        overflow: "hidden",
      }}
      transition={{
        duration: 0.2,
      }}
      className="border-b border-[#EEEEEC] py-4 last:border-b-0"
    >
      <div className="flex items-start gap-3">
        {/* IMAGE */}

        <Link
          href={`/product/${item.slug}`}
          className="
            relative
            h-[68px]
            w-[68px]
            shrink-0
            overflow-hidden
            rounded-[6px]
            border
            border-[#E4E4E2]
            bg-[#F1F1F0]
            sm:h-[78px]
            sm:w-[78px]
          "
        >
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="78px"
            className="object-cover transition duration-500 hover:scale-105"
          />
        </Link>

        {/* INFO */}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link
                href={`/product/${item.slug}`}
                className="
                  line-clamp-2
                  text-[12px]
                  font-semibold
                  leading-[17px]
                  text-[#111111]
                  transition
                  hover:text-[#555555]
                  sm:text-[13px]
                "
              >
                {item.name}
              </Link>

              {item.category && (
                <p className="mt-1 text-[9px] text-[#888888]">
                  SKU: {item.category}
                </p>
              )}
            </div>

            {/* DESKTOP PRICE */}

            <div className="hidden shrink-0 text-right sm:block">
              <p className="text-[13px] font-semibold text-[#111111]">
                {formatPrice(itemTotal)}
              </p>

              {item.originalPrice && (
                <p className="mt-0.5 text-[9px] text-[#999999] line-through">
                  {formatPrice(originalTotal)}
                </p>
              )}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            {/* QUANTITY */}

            <div
              className="
                flex
                h-[32px]
                w-[92px]
                items-center
                overflow-hidden
                rounded-[5px]
                border
                border-[#D5D5D3]
                bg-white
              "
            >
              <button
                type="button"
                onClick={() =>
                  updateQuantity(item.id, "decrement")
                }
                disabled={
                  item.quantity <= 1 || isUpdating
                }
                className="
                  flex
                  h-full
                  w-[29px]
                  items-center
                  justify-center
                  text-[#333333]
                  transition
                  hover:bg-[#F3F3F2]
                  disabled:cursor-not-allowed
                  disabled:opacity-30
                "
                aria-label="Decrease quantity"
              >
                <Minus className="h-3 w-3" />
              </button>

              <div className="flex h-full flex-1 items-center justify-center border-x border-[#E3E3E1]">
                {isUpdating ? (
                  <Loader2 className="h-3 w-3 animate-spin text-[#111111]" />
                ) : (
                  <span className="text-[11px] font-semibold text-[#111111]">
                    {item.quantity}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() =>
                  updateQuantity(item.id, "increment")
                }
                disabled={
                  item.quantity >= 10 || isUpdating
                }
                className="
                  flex
                  h-full
                  w-[29px]
                  items-center
                  justify-center
                  text-[#333333]
                  transition
                  hover:bg-[#F3F3F2]
                  disabled:cursor-not-allowed
                  disabled:opacity-30
                "
                aria-label="Increase quantity"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>

            {/* MOBILE PRICE + DELETE */}

            <div className="flex items-center gap-3 sm:hidden">
              <div className="text-right">
                <p className="text-[12px] font-semibold text-[#111111]">
                  {formatPrice(itemTotal)}
                </p>

                {item.originalPrice && (
                  <p className="text-[9px] text-[#999999] line-through">
                    {formatPrice(originalTotal)}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => removeItem(item.id)}
                disabled={isRemoving}
                className="
                  flex
                  h-7
                  w-7
                  items-center
                  justify-center
                  rounded-[5px]
                  border
                  border-[#E1E1DF]
                  text-[#777777]
                  transition
                  hover:border-[#D8C5C1]
                  hover:bg-[#FBF5F4]
                  hover:text-[#B43D32]
                  disabled:opacity-40
                "
                aria-label="Remove product"
              >
                {isRemoving ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Trash2 className="h-3 w-3" />
                )}
              </button>
            </div>

            {/* DESKTOP DELETE */}

            <button
              type="button"
              onClick={() => removeItem(item.id)}
              disabled={isRemoving}
              className="
                hidden
                h-7
                w-7
                items-center
                justify-center
                rounded-[5px]
                border
                border-transparent
                text-[#777777]
                transition
                hover:border-[#E0D1CD]
                hover:bg-[#FBF5F4]
                hover:text-[#B43D32]
                disabled:opacity-40
                sm:flex
              "
              aria-label="Remove product"
            >
              {isRemoving ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Trash2 className="h-3 w-3" />
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* =========================================================
   ORDER SUMMARY
   NO COUPON
   NO DELIVERY
   NO RAZORPAY
========================================================= */

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
  cartItems: any[];
}) => {
  const router = useRouter();

  return (
    <div className="overflow-hidden rounded-[8px] border border-[#E6E6E4] bg-white">
      {/* HEADER */}

      <div className="px-4 pb-3 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[17px] font-semibold text-[#171717]">
            Order Summary
          </h2>

          <span className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[#888888]">
            {itemCount}{" "}
            {itemCount === 1 ? "Item" : "Items"}
          </span>
        </div>
      </div>

      {/* PRICE DETAILS */}

      <div className="px-4 pb-4">
        <div className="space-y-2.5">
          {/* SUBTOTAL */}

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#555555]">
              Subtotal
            </span>

            <span className="text-[11px] font-medium text-[#222222]">
              {formatPrice(subtotal)}
            </span>
          </div>

          {/* DISCOUNT */}

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#555555]">
              Discount
            </span>

            <span className="text-[11px] font-medium text-[#4E8067]">
              {totalSavings > 0
                ? `-${formatPrice(totalSavings)}`
                : "₹0"}
            </span>
          </div>
        </div>
      </div>

      {/* TOTAL */}

      <div className="mx-4 border-t border-[#DCDCD9]" />

      <div className="flex items-center justify-between px-4 py-4">
        <div>
          <span className="block text-[15px] font-medium text-[#222222]">
            Total
          </span>

          <span className="mt-0.5 block text-[9px] text-[#888888]">
            Final cart amount
          </span>
        </div>

        <span className="text-[18px] font-semibold text-[#111111]">
          {formatPrice(total)}
        </span>
      </div>

      {/* CHECKOUT */}

      <div className="px-4 pb-4">
        <button
          type="button"
          onClick={() => {
            if (!cartItems.length) {
              toast.error("Your cart is empty");
              return;
            }

            router.push("/checkout");
          }}
          className="
            flex
            h-[46px]
            w-full
            items-center
            justify-center
            gap-2
            rounded-[6px]
            bg-[#111111]
            text-[11px]
            font-semibold
            uppercase
            tracking-wide
            text-white
            transition
            hover:bg-[#222222]
          "
        >
          Proceed to Checkout

          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* TRUST */}

      <div className="border-t border-[#EEEEEC] px-4 py-3">
        <button
          type="button"
          onClick={() => router.push("/products")}
          className="
            flex
            items-center
            gap-1.5
            text-[10px]
            font-medium
            text-[#444444]
            transition
            hover:text-[#111111]
          "
        >
          <ArrowLeft className="h-3 w-3" />
          Back to Shopping
        </button>

        <div className="my-3 border-t border-[#EEEEEC]" />

        <div className="grid grid-cols-3 gap-2">
          <TrustFeature
            icon={Truck}
            title="Free Shipping"
            subtitle="Over ₹999"
          />

          <TrustFeature
            icon={ShieldCheck}
            title="Secure Checkout"
            subtitle="100% Protected"
          />

          <TrustFeature
            icon={RotateCcw}
            title="Easy Returns"
            subtitle="7 Day Policy"
          />
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   TRUST FEATURE
========================================================= */

const TrustFeature = ({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: any;
  title: string;
  subtitle: string;
}) => {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#F1F1F0]">
        <Icon className="h-3.5 w-3.5 text-[#222222]" />
      </div>

      <p className="text-[8px] font-semibold leading-tight text-[#222222] sm:text-[9px]">
        {title}
      </p>

      <p className="mt-0.5 text-[7px] text-[#999999] sm:text-[8px]">
        {subtitle}
      </p>
    </div>
  );
};

/* =========================================================
   RECOMMENDED PRODUCTS
========================================================= */

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
        rounded-[8px]
        border
        border-[#E6E6E4]
        bg-white
        p-4
        sm:p-[18px]
      "
    >
      {/* HEADER */}

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
                onClick={() =>
                  scrollRecommended("left")
                }
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
                onClick={() =>
                  scrollRecommended("right")
                }
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
                  hover:bg-[#222222]
                "
                aria-label="Scroll right"
              >
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* PRODUCTS */}

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
          const isAdding =
            addingProductId === product.id;

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
                  <Image
                    src={getImageUrl(
                      product.primary_image_url ||
                      product.primary_image,
                    )}
                    alt={product.name}
                    fill
                    sizes="155px"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
              </Link>

              <div className="pt-2">
                <p className="truncate text-[10px] font-medium text-[#222222]">
                  {product.name}
                </p>

                <p className="mt-0.5 text-[13px] font-semibold text-[#111111]">
                  {formatPrice(
                    parseFloat(
                      product.retail_price || 0,
                    ),
                  )}
                </p>

                <button
                  type="button"
                  onClick={(e) =>
                    handleRecommendedAddToCart(
                      product,
                      e,
                    )
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
                    hover:bg-[#222222]
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

/* =========================================================
   CART WITH ITEMS
========================================================= */

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
        lg:grid-cols-[minmax(0,1fr)_372px]
      "
    >
      {/* LEFT */}

      <div className="min-w-0 space-y-5">
        {/* SHOPPING CART */}

        <section
          className="
            overflow-hidden
            rounded-[8px]
            border
            border-[#E6E6E4]
            bg-white
          "
        >
          {/* HEADER */}

          <div className="flex items-center justify-between px-4 pb-3 pt-5 sm:px-[18px]">
            <div>
              <h1 className="text-[17px] font-semibold text-[#171717]">
                Shopping Cart
              </h1>

              <p className="mt-0.5 text-[10px] text-[#888888]">
                {itemCount}{" "}
                {itemCount === 1
                  ? "item"
                  : "items"}{" "}
                in your cart
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
                border-[#E0D2CF]
                bg-[#FBF5F4]
                px-3
                text-[9px]
                font-semibold
                uppercase
                tracking-wide
                text-[#A53B31]
                transition
                hover:bg-[#F8EDEB]
                disabled:opacity-40
              "
            >
              {isClearing && (
                <Loader2 className="h-3 w-3 animate-spin" />
              )}

              Clear Cart
            </button>
          </div>

          {/* COLUMN HEADINGS */}

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

          {/* ITEMS */}

          <div className="px-4 sm:px-[18px]">
            <AnimatePresence initial={false}>
              {cartItems.map((item: any) => (
                <CartProductItem
                  key={item.id}
                  item={item}
                  isUpdating={
                    isUpdating === item.id
                  }
                  isRemoving={isRemoving}
                  updateQuantity={
                    updateQuantity
                  }
                  removeItem={removeItem}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* BOTTOM */}

          <div className="border-t border-[#EEEEEC] px-4 py-3 sm:px-[18px]">
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

        {/* RECOMMENDED */}

        {!isProductsLoading &&
          recommended.length > 0 && (
            <RecommendedSection
              recommended={recommended}
              addingProductId={addingProductId}
              handleRecommendedAddToCart={
                handleRecommendedAddToCart
              }
              scrollRecommended={
                scrollRecommended
              }
              recommendedScrollRef={
                recommendedScrollRef
              }
            />
          )}
      </div>

      {/* RIGHT */}

      <aside className="self-start lg:sticky lg:top-5">
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

/* =========================================================
   MAIN PAGE
========================================================= */

export default function CartPage() {
  const router = useRouter();

  const [isUpdating, setIsUpdating] =
    useState<number | null>(null);

  const [addingProductId, setAddingProductId] =
    useState<number | string | null>(null);

  const recommendedScrollRef =
    useRef<HTMLDivElement>(null);

  /* =========================================================
     API
  ========================================================= */

  const {
    data: cartData,
    isLoading: isCartLoading,
    refetch: refetchCart,
  } = useGetCartQuery({});

  const {
    data: productsData,
    isLoading: isProductsLoading,
  } = useGetProductsQuery({});

  const [
    removeFromCart,
    { isLoading: isRemoving },
  ] = useRemoveFromCartMutation();

  const [
    clearCart,
    { isLoading: isClearing },
  ] = useClearCartMutation();

  const [updateCartItem] =
    useUpdateCartItemMutation();

  const [addToCart] =
    useAddToCartMutation();

  /* =========================================================
     RECOMMENDED SCROLL
  ========================================================= */

  const scrollRecommended = (
    direction: "left" | "right",
  ) => {
    const element =
      recommendedScrollRef.current;

    if (!element) return;

    element.scrollBy({
      left:
        direction === "left"
          ? -220
          : 220,
      behavior: "smooth",
    });
  };

  /* =========================================================
     CART ITEMS
  ========================================================= */

  const cartItems = useMemo(() => {
    if (!cartData?.data?.items) {
      return [];
    }

    return cartData.data.items.map(
      (item: CartItem) => ({
        id: item.product_id,

        cartItemId: item.id,

        name: item.product.name,

        slug: item.product.slug,

        image: getImageUrl(
          item.image_url,
        ),

        price: parseFloat(
          item.current_unit_price,
        ),

        originalPrice:
          parseFloat(
            item.product.retail_price,
          ) >
            parseFloat(
              item.current_unit_price,
            )
            ? parseFloat(
              item.product.retail_price,
            )
            : undefined,

        category:
          item.product.product_code,

        quantity: item.quantity,

        inStock: true,
      }),
    );
  }, [cartData]);

  /* =========================================================
     RECOMMENDED PRODUCTS
  ========================================================= */

  const recommended = useMemo(() => {
    if (!productsData?.data) {
      return [];
    }

    const cartProductIds = new Set(
      cartItems.map(
        (item) => item.id,
      ),
    );

    return (productsData.data || [])
      .filter(
        (product: any) =>
          !cartProductIds.has(
            product.id,
          ),
      )
      .slice(0, 8);
  }, [productsData, cartItems]);

  /* =========================================================
     PRICE CALCULATION

     ONLY:
     SUBTOTAL
     DISCOUNT
     TOTAL

     NO:
     COUPON
     DELIVERY
     SHIPPING
  ========================================================= */

  const {
    subtotal,
    totalSavings,
    total,
    itemCount,
  } = useMemo(() => {
    const subtotalValue =
      cartItems.reduce(
        (sum, item) =>
          sum +
          item.price *
          item.quantity,
        0,
      );

    const mrpValue =
      cartItems.reduce(
        (sum, item) =>
          sum +
          (item.originalPrice ||
            item.price) *
          item.quantity,
        0,
      );

    const savings = Math.max(
      mrpValue - subtotalValue,
      0,
    );

    const finalTotal =
      subtotalValue;

    const count =
      cartItems.reduce(
        (sum, item) =>
          sum + item.quantity,
        0,
      );

    return {
      subtotal: subtotalValue,

      totalSavings: savings,

      total: finalTotal,

      itemCount: count,
    };
  }, [cartItems]);

  /* =========================================================
     UPDATE QUANTITY
  ========================================================= */

  const updateQuantity = async (
    id: number,
    action:
      | "increment"
      | "decrement",
  ) => {
    const item = cartItems.find(
      (cartItem) =>
        cartItem.id === id,
    );

    if (!item?.cartItemId) {
      toast.error(
        "Cart item not found",
      );
      return;
    }

    const newQuantity =
      action === "increment"
        ? Math.min(
          item.quantity + 1,
          10,
        )
        : Math.max(
          item.quantity - 1,
          1,
        );

    if (
      newQuantity ===
      item.quantity
    ) {
      return;
    }

    setIsUpdating(id);

    try {
      await updateCartItem({
        itemId:
          item.cartItemId,
        data: {
          quantity:
            newQuantity,
          action,
        },
      }).unwrap();

      await refetchCart();
    } catch (error: any) {
      toast.error(
        error?.data?.message ||
        "Unable to update quantity",
      );
    } finally {
      setIsUpdating(null);
    }
  };

  /* =========================================================
     REMOVE ITEM
  ========================================================= */

  const removeItem = async (
    id: number,
  ) => {
    const item = cartItems.find(
      (cartItem) =>
        cartItem.id === id,
    );

    if (!item?.cartItemId) {
      return;
    }

    try {
      await removeFromCart(
        item.cartItemId,
      ).unwrap();

      await refetchCart();

      toast.success(
        "Item removed from cart",
        {
          position:
            "bottom-center",
        },
      );
    } catch (error: any) {
      toast.error(
        error?.data?.message ||
        "Unable to remove item",
      );
    }
  };

  /* =========================================================
     CLEAR CART
  ========================================================= */

  const clearCartHandler = async () => {
    try {
      await clearCart({}).unwrap();

      await refetchCart();

      toast.success(
        "Cart cleared successfully",
        {
          position:
            "bottom-center",
        },
      );
    } catch (error: any) {
      toast.error(
        error?.data?.message ||
        "Unable to clear cart",
      );
    }
  };

  /* =========================================================
     RECOMMENDED ADD TO CART
  ========================================================= */

  const handleRecommendedAddToCart =
    async (
      product: any,
      e?: React.MouseEvent<HTMLButtonElement>,
    ) => {
      e?.preventDefault();
      e?.stopPropagation();

      if (
        addingProductId ===
        product.id
      ) {
        return;
      }

      try {
        setAddingProductId(
          product.id,
        );

        await addToCart({
          product_id:
            product.id,
          quantity: 1,
        }).unwrap();

        await refetchCart();

        toast.success(
          "Added to cart",
          {
            position:
              "bottom-center",
          },
        );
      } catch (error: any) {
        toast.error(
          error?.data?.message ||
          "Unable to add product",
          {
            position:
              "bottom-center",
          },
        );
      } finally {
        setAddingProductId(null);
      }
    };

  /* =========================================================
     LOADING
  ========================================================= */

  if (isCartLoading) {
    return (
      <div
        className="min-h-screen font-sans"
        style={{
          background: PAGE_BG,
        }}
      >
        <Header
          cartItems={[]}
          cartCount={0}
          cartSubtotal={0}
          wishlistCount={0}
          onRemoveFromCart={() => { }}
          onClearCart={() => { }}
        />

        <main className="mx-auto flex min-h-[65vh] w-full max-w-[1100px] items-center justify-center px-4">
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

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div
      className="min-h-screen font-sans"
      style={{
        background: PAGE_BG,
      }}
    >
      <Header
        cartItems={cartItems}
        cartCount={itemCount}
        cartSubtotal={subtotal}
        wishlistCount={0}
        onRemoveFromCart={
          removeItem
        }
        onClearCart={
          clearCartHandler
        }
      />

      <main
        className="
          mx-auto
          w-full
          max-w-[1100px]
          px-4
          py-5
          sm:px-6
          sm:py-7
          lg:px-0
        "
      >
        {/* PAGE HEADING */}

        <div className="mb-5 sm:mb-6">
          <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-[#111111] sm:text-[28px]">
            Cart
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
            updateQuantity={
              updateQuantity
            }
            removeItem={removeItem}
            clearCartHandler={
              clearCartHandler
            }
            recommended={
              recommended
            }
            isProductsLoading={
              isProductsLoading
            }
            addingProductId={
              addingProductId
            }
            handleRecommendedAddToCart={
              handleRecommendedAddToCart
            }
            scrollRecommended={
              scrollRecommended
            }
            recommendedScrollRef={
              recommendedScrollRef
            }
            subtotal={subtotal}
            totalSavings={
              totalSavings
            }
            total={total}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}