"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Gift,
  X,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Check,
} from "lucide-react";
import { Marcellus } from "next/font/google";
import { toast } from "react-hot-toast";

import Header from "../../../components/common/Header";
import Footer from "../../../components/Footer/Footer";
import Banner from "../../../../public/indiekonnect-web/images/cart.png";

import {
  useGetCartQuery,
  useRemoveFromCartMutation,
  useClearCartMutation,
  useUpdateCartItemMutation,
  useGetCouponsQuery,
  useAddToCartMutation,
} from "@/lib/redux/api/cartApi";

import { useGetProductsQuery } from "@/lib/redux/api/productApi";

const marcellus = Marcellus({
  subsets: ["latin"],
  weight: "400",
});

/* =========================================================
   PREMIUM DESIGN TOKENS
========================================================= */

const INK = "#101A35";
const INK_HOVER = "#18264A";
const IVORY = "#FAF9F6";
const WHITE = "#FFFFFF";
const LINE = "#E7E9EE";
const LINE_DARK = "#D8DCE5";
const TEXT_MUTED = "#747B8C";
const GREEN = "#4E8067";
const RED = "#B85C5C";

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
}

interface Coupon {
  id: number;
  code: string;
  title: string;
  type: string;
  value: string;
  min_order: string;
  max_order: string;
  max_uses: number;
  used_count: number;
  expires_at: string;
  is_active: boolean;
}

/* =========================================================
   PAGE
========================================================= */

export default function CartPage() {
  const router = useRouter();

  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState("");

  const [appliedPromo, setAppliedPromo] = useState<{
    id: number;
    code: string;
    value: number;
    type: string;
    title: string;
  } | null>(null);

  const [isPromoLoading, setIsPromoLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState<number | null>(null);
  const [showCoupons, setShowCoupons] = useState(false);

  /* =========================================================
     IMPORTANT:
     Only clicked recommended product will be loading
  ========================================================= */

  const [addingProductId, setAddingProductId] = useState<
    number | string | null
  >(null);

  /* =========================================================
     API
  ========================================================= */

  const {
    data: cartData,
    isLoading: isCartLoading,
    refetch: refetchCart,
  } = useGetCartQuery({});

  const { data: couponsData } = useGetCouponsQuery();

  const {
    data: productsData,
    isLoading: isProductsLoading,
  } = useGetProductsQuery({});

  const [removeFromCart, { isLoading: isRemoving }] =
    useRemoveFromCartMutation();

  const [clearCart, { isLoading: isClearing }] =
    useClearCartMutation();

  const [updateCartItem] = useUpdateCartItemMutation();

  const [addToCart] = useAddToCartMutation();

  /* =========================================================
     CART ITEMS
  ========================================================= */

  const cartItems = useMemo(() => {
    if (!cartData?.data?.items) {
      return [];
    }

    return cartData.data.items.map((item: CartItem) => ({
      id: item.product_id,
      cartItemId: item.id,
      name: item.product.name,
      slug: item.product.slug,

      image:
        item.product.primary_image ||
        "/indiekonnect-web/images/placeholder.jpg",

      price: parseFloat(item.current_unit_price),

      originalPrice:
        parseFloat(item.product.retail_price) >
          parseFloat(item.current_unit_price)
          ? parseFloat(item.product.retail_price)
          : undefined,

      category: item.product.product_code,
      quantity: item.quantity,
      inStock: true,
    }));
  }, [cartData]);

  /* =========================================================
     COUPONS
  ========================================================= */

  const availableCoupons = useMemo(() => {
    const coupons = couponsData?.data?.data ?? [];

    return coupons.filter((coupon: Coupon) => {
      if (!coupon.is_active) {
        return false;
      }

      if (
        coupon.max_uses > 0 &&
        coupon.used_count >= coupon.max_uses
      ) {
        return false;
      }

      if (coupon.expires_at) {
        if (new Date(coupon.expires_at) < new Date()) {
          return false;
        }
      }

      return true;
    });
  }, [couponsData]);

  /* =========================================================
     RECOMMENDED PRODUCTS
  ========================================================= */

  const recommended = useMemo(() => {
    if (!productsData?.data) {
      return [];
    }

    const cartProductIds = new Set(
      cartItems.map((item) => item.id),
    );

    const allProducts = productsData.data || [];

    return allProducts
      .filter(
        (product: any) =>
          !cartProductIds.has(product.id),
      )
      .slice(0, 4);
  }, [productsData, cartItems]);

  /* =========================================================
     PRICE CALCULATION
  ========================================================= */

  const {
    subtotal,
    totalMrp,
    totalSavings,
    promoDiscount,
    shipping,
    total,
    itemCount,
  } = useMemo(() => {
    const subtotalValue = cartItems.reduce(
      (sum, item) =>
        sum + item.price * item.quantity,
      0,
    );

    const mrpValue = cartItems.reduce(
      (sum, item) =>
        sum +
        (item.originalPrice || item.price) *
        item.quantity,
      0,
    );

    const savings = Math.max(
      mrpValue - subtotalValue,
      0,
    );

    let couponDiscount = 0;

    if (appliedPromo) {
      if (appliedPromo.type === "percentage") {
        couponDiscount = Math.round(
          (subtotalValue * appliedPromo.value) /
          100,
        );
      } else {
        couponDiscount = Math.min(
          appliedPromo.value,
          subtotalValue,
        );
      }
    }

    const afterCoupon =
      subtotalValue - couponDiscount;

    const delivery =
      afterCoupon >= 999 ||
        afterCoupon === 0
        ? 0
        : 79;

    const finalTotal =
      afterCoupon + delivery;

    const count = cartItems.reduce(
      (sum, item) =>
        sum + item.quantity,
      0,
    );

    return {
      subtotal: subtotalValue,
      totalMrp: mrpValue,
      totalSavings: savings,
      promoDiscount: couponDiscount,
      shipping: delivery,
      total: finalTotal,
      itemCount: count,
    };
  }, [cartItems, appliedPromo]);

  /* =========================================================
     UPDATE QUANTITY
  ========================================================= */

  const updateQuantity = async (
    id: number,
    action: "increment" | "decrement",
  ) => {
    const item = cartItems.find(
      (cartItem) =>
        cartItem.id === id,
    );

    if (!item?.cartItemId) {
      toast.error("Cart item not found");
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
        itemId: item.cartItemId,
        data: {
          quantity: newQuantity,
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
          position: "bottom-center",
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

  const clearCartHandler =
    async () => {
      try {
        await clearCart(
          {},
        ).unwrap();

        await refetchCart();

        setAppliedPromo(null);

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
     APPLY COUPON
  ========================================================= */

  const applyPromo = (
    code?: string,
  ) => {
    const finalCode = (
      code || promoCode
    )
      .trim()
      .toUpperCase();

    if (!finalCode) {
      setPromoError(
        "Please enter a coupon code",
      );
      return;
    }

    setIsPromoLoading(true);
    setPromoError("");

    const coupon =
      availableCoupons.find(
        (item: Coupon) =>
          item.code.toUpperCase() ===
          finalCode,
      );

    setTimeout(() => {
      if (!coupon) {
        setAppliedPromo(null);
        setPromoError(
          "Invalid or expired coupon code",
        );
        setIsPromoLoading(false);
        return;
      }

      const minOrder =
        parseFloat(
          coupon.min_order,
        ) || 0;

      const maxOrder =
        parseFloat(
          coupon.max_order,
        ) || Infinity;

      if (subtotal < minOrder) {
        setPromoError(
          `Minimum order amount is ₹${minOrder.toLocaleString()}`,
        );

        setAppliedPromo(null);
        setIsPromoLoading(false);
        return;
      }

      if (
        maxOrder !== Infinity &&
        subtotal > maxOrder
      ) {
        setPromoError(
          `Maximum order amount is ₹${maxOrder.toLocaleString()}`,
        );

        setAppliedPromo(null);
        setIsPromoLoading(false);
        return;
      }

      setAppliedPromo({
        id: coupon.id,
        code: coupon.code,
        value: parseFloat(
          coupon.value,
        ),
        type: coupon.type,
        title: coupon.title,
      });

      setPromoCode(coupon.code);
      setPromoError("");
      setShowCoupons(false);
      setIsPromoLoading(false);

      toast.success(
        `${coupon.code} applied successfully`,
        {
          position:
            "bottom-center",
        },
      );
    }, 500);
  };

  /* =========================================================
     REMOVE COUPON
  ========================================================= */

  const removePromo = () => {
    setAppliedPromo(null);
    setPromoCode("");
    setPromoError("");
  };

  /* =========================================================
     ADD RECOMMENDED PRODUCT
     ONLY CLICKED CARD LOADING
  ========================================================= */

  const handleRecommendedAddToCart =
    async (
      product: any,
      e?: React.MouseEvent<HTMLButtonElement>,
    ) => {
      e?.preventDefault();
      e?.stopPropagation();

      if (addingProductId === product.id) {
        return;
      }

      try {
        setAddingProductId(product.id);

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
        className="min-h-screen bg-white font-sans"
        style={{
          color: INK,
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

        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-[#EEF1F7] blur-xl" />

            <div className="relative w-12 h-12 rounded-full bg-[#F4F6FA] border border-[#E3E7EF] flex items-center justify-center">
              <Loader2
                className="w-5 h-5 animate-spin"
                style={{
                  color: INK,
                }}
              />
            </div>
          </div>

          <p className="mt-5 text-[11px] tracking-[0.16em] uppercase text-gray-400 font-sans">
            Preparing your cart
          </p>
        </div>

        <Footer />
      </div>
    );
  }

  /* =========================================================
     MAIN
  ========================================================= */

  return (
    <div
      className="min-h-screen bg-white font-sans"
      style={{
        color: INK,
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

      {/* =====================================================
          PREMIUM CART HERO
      ===================================================== */}
      <section className="relative overflow-hidden border-b border-[#e8e1d6] bg-white">
        <div className="pointer-events-none absolute right-0 top-0 h-60 w-60 rounded-full bg-[#dcae45]/10 blur-3xl" />

        <div className="relative mx-auto w-full max-w-[1280px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
            <div>
              <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#69738a]">
                <button
                  type="button"
                  onClick={() => router.push("/products")}
                  className="cursor-pointer transition-colors hover:text-[#071a41]"
                >
                  Products
                </button>

                <ChevronRight className="h-3 w-3 text-[#dcae45]" />

                <span className="text-[#071a41]">Cart</span>
              </div>

              <h1 className="font-serif text-[38px] leading-none tracking-[-0.02em] text-[#071a41] sm:text-[44px]">
                Cart
              </h1>

              <p className="mt-3 max-w-[520px] text-[13px] leading-6 text-[#69738a] sm:text-[14px]">
                Review your items, apply coupons, and proceed to secure checkout.
              </p>
            </div>

            {/* PROGRESS - Only Cart Active (Step 1), Others Inactive */}

            <div className="flex items-center">
              {/* Step 1 - Cart (Active - Blue) */}
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#101A35] text-sm font-bold text-white shadow-lg">
                  1
                </div>

                <span className="hidden text-[11px] font-bold text-[#071a41] sm:block">
                  Cart
                </span>
              </div>

              <div className="mx-3 h-px w-10 bg-[#e5dfd3] sm:w-16" />

              {/* Step 2 - Checkout (Inactive) */}
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eeeae2] text-sm font-semibold text-[#8e96a5]">
                  2
                </div>

                <span className="hidden text-[11px] text-[#8e96a5] sm:block">
                  Checkout
                </span>
              </div>

              <div className="mx-3 h-px w-10 bg-[#e5dfd3] sm:w-16" />

              {/* Step 3 - Confirmation (Inactive) */}
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eeeae2] text-sm font-semibold text-[#8e96a5]">
                  3
                </div>

                <span className="hidden text-[11px] text-[#8e96a5] sm:block">
                  Confirmation
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="max-w-[1280px] mx-auto px-5 md:px-8 lg:px-10 py-8 md:py-12 lg:py-14">
        <div className="flex items-center justify-between border-b border-[#DDE1E8] pb-5 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-4 h-px bg-[#101A35]" />

              <span className="text-[14px] sm:text-[9px] md:text-[10px] tracking-[0.2em] uppercase text-gray-400 font-sans">
                Shopping bag
              </span>
            </div>

            <h2
              className={`${marcellus.className} text-[20px] sm:text-[20px] md:text-[20px] font-medium`}
              style={{
                color: INK,
              }}
            >
              Your selection
            </h2>
          </div>

          {cartItems.length > 0 && (
            <button
              onClick={clearCartHandler}
              disabled={isClearing}
              className="group flex items-center gap-2 text-[14px] tracking-[0.12em] uppercase text-gray-500 hover:text-[#101A35] transition-colors disabled:opacity-40 font-sans"
            >
              <span className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center group-hover:border-[#101A35] transition-colors">
                {isClearing ? (
                  <Loader2 className="w-2.5 h-2.5 animate-spin" />
                ) : (
                  <Trash2 className="w-2.5 h-2.5" />
                )}
              </span>

              <span className="hidden sm:inline">
                {isClearing
                  ? "Clearing..."
                  : "Clear cart"}
              </span>
            </button>
          )}
        </div>

        {/* =====================================================
            EMPTY CART
        ===================================================== */}

        {cartItems.length === 0 ? (
          <div className="min-h-[400px] flex flex-col items-center justify-center text-center border-b border-gray-200">
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-full bg-[#EEF1F7] blur-3xl scale-150" />

              <div className="relative w-20 h-20 rounded-full bg-[#F8F9FB] border border-[#E4E7ED] flex items-center justify-center">
                <ShoppingBag
                  className="w-7 h-7"
                  strokeWidth={1.2}
                  style={{
                    color: INK,
                  }}
                />
              </div>
            </div>

            <h2
              className={`${marcellus.className} text-[20px] md:text-[20px]`}
              style={{
                color: INK,
              }}
            >
              Your cart is empty
            </h2>

            <p className="text-[11px] text-gray-500 mt-2 max-w-sm leading-relaxed font-sans">
              Discover something beautiful from our carefully curated
              collection.
            </p>

            <Link
              href="/products"
              className="premium-button inline-flex items-center gap-2.5 text-white px-7 py-3.5 rounded-full text-[14px] font-semibold tracking-[0.16em] uppercase mt-7 font-sans"
              style={{
                background: INK,
              }}
            >
              Continue Shopping
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 lg:gap-12 items-start">
            {/* =================================================
                LEFT
            ================================================= */}

            <section>
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <span className="text-[14px] tracking-[0.16em] uppercase text-[#101A35] font-sans">
                  {itemCount}{" "}
                  {itemCount === 1
                    ? "Item"
                    : "Items"}
                </span>

                <span className="text-[14px] tracking-[0.12em] uppercase text-gray-400 font-sans">
                  Product details
                </span>
              </div>

              {/* =================================================
                  CART ITEMS
              ================================================= */}

              <div>
                <AnimatePresence initial={false}>
                  {cartItems.map(
                    (item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{
                          opacity: 0,
                          y: 12,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        exit={{
                          opacity: 0,
                          height: 0,
                          overflow:
                            "hidden",
                        }}
                        transition={{
                          duration: 0.25,
                        }}
                        className="relative py-5 border-b"
                        style={{
                          borderColor:
                            LINE,
                        }}
                      >
                        <div className="flex gap-4 md:gap-5">
                          <Link
                            href={`/product/${item.slug}`}
                            className="product-image relative w-[80px] h-[100px] md:w-[100px] md:h-[125px] flex-shrink-0 overflow-hidden rounded-[12px]"
                            style={{
                              background:
                                IVORY,
                            }}
                          >
                            <Image
                              src={
                                item.image ||
                                "/indiekonnect-web/images/placeholder.jpg"
                              }
                              alt={
                                item.name
                              }
                              fill
                              sizes="150px"
                              className="object-cover transition-transform duration-700 hover:scale-[1.05]"
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-black/[0.06] to-transparent pointer-events-none" />
                          </Link>

                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between gap-3">
                              <div className="min-w-0">
                                <p
                                  className="text-[7px] tracking-[0.18em] uppercase mb-1.5 font-sans"
                                  style={{
                                    color:
                                      TEXT_MUTED,
                                  }}
                                >
                                  {item.category ||
                                    "Collection"}
                                </p>

                                <Link
                                  href={`/product/${item.slug}`}
                                  className={`${marcellus.className} block text-[17px] sm:text-[18px] md:text-[20px] leading-tight font-medium hover:opacity-60 transition-opacity`}
                                  style={{
                                    color:
                                      INK,
                                  }}
                                >
                                  {
                                    item.name
                                  }
                                </Link>

                                <div className="mt-2 flex items-center gap-1.5">
                                  <span
                                    className="w-1 h-1 rounded-full"
                                    style={{
                                      background:
                                        GREEN,
                                    }}
                                  />

                                  <span className="text-[14px] text-gray-400 font-sans">
                                    In stock
                                  </span>
                                </div>
                              </div>

                              <button
                                onClick={() =>
                                  removeItem(
                                    item.id,
                                  )
                                }
                                disabled={
                                  isRemoving
                                }
                                className="w-7 h-7 rounded-full flex items-center justify-center border border-transparent hover:border-[#E5E7EC] hover:bg-[#F6F7F9] text-gray-400 hover:text-[#101A35] transition-all flex-shrink-0"
                                aria-label="Remove product"
                              >
                                {isRemoving ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <X className="w-3 h-3" />
                                )}
                              </button>
                            </div>

                            <div className="flex items-end justify-between gap-3 mt-5">
                              <div
                                className="flex items-center h-8 rounded-full border bg-white"
                                style={{
                                  borderColor:
                                    LINE_DARK,
                                }}
                              >
                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      item.id,
                                      "decrement",
                                    )
                                  }
                                  disabled={
                                    item.quantity <=
                                    1 ||
                                    isUpdating ===
                                    item.id
                                  }
                                  className="w-8 h-full flex items-center justify-center rounded-l-full disabled:opacity-25 hover:bg-[#F4F6F9] transition-colors"
                                >
                                  <Minus className="w-2.5 h-2.5" />
                                </button>

                                <span
                                  className="w-7 text-center text-[9px] font-medium font-sans"
                                  style={{
                                    color:
                                      INK,
                                  }}
                                >
                                  {isUpdating ===
                                    item.id ? (
                                    <Loader2 className="w-2.5 h-2.5 animate-spin mx-auto" />
                                  ) : (
                                    item.quantity
                                  )}
                                </span>

                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      item.id,
                                      "increment",
                                    )
                                  }
                                  disabled={
                                    item.quantity >=
                                    10 ||
                                    isUpdating ===
                                    item.id
                                  }
                                  className="w-8 h-full flex items-center justify-center rounded-r-full disabled:opacity-25 hover:bg-[#F4F6F9] transition-colors"
                                >
                                  <Plus className="w-2.5 h-2.5" />
                                </button>
                              </div>

                              <div className="text-right">
                                <div className="flex items-center gap-2 justify-end flex-wrap">
                                  <span
                                    className={` text-[18px] sm:text-[18px] font-semibold tracking-[-0.03em]`}
                                    style={{
                                      color:
                                        INK,
                                    }}
                                  >
                                    ₹
                                    {(
                                      item.price *
                                      item.quantity
                                    ).toLocaleString()}
                                  </span>

                                  {item.originalPrice && (
                                    <span className="text-[12px] text-[#9298A4] line-through font-sans">
                                      ₹
                                      {(
                                        item.originalPrice *
                                        item.quantity
                                      ).toLocaleString()}
                                    </span>
                                  )}
                                </div>

                                <span className="text-[11px] text-[#697286] font-sans">
                                  ₹
                                  {item.price.toLocaleString()}{" "}
                                  each
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ),
                  )}
                </AnimatePresence>
              </div>

              {/* =================================================
                  SHIPPING MESSAGE
              ================================================= */}

              <div className="mt-6 relative overflow-hidden rounded-[14px] border bg-[#F8F9FB] px-4 py-4">
                <div className="absolute right-0 top-0 w-24 h-24 rounded-full bg-[#E9EDF5] blur-3xl opacity-60" />

                <div className="relative flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white border border-[#E4E7ED] flex items-center justify-center flex-shrink-0">
                    <Gift
                      className="w-3.5 h-3.5"
                      strokeWidth={1.5}
                      style={{
                        color: INK,
                      }}
                    />
                  </div>

                  <div>
                    <p
                      className="text-[9px] font-semibold tracking-wide font-sans"
                      style={{
                        color: INK,
                      }}
                    >
                      Free shipping unlocked
                    </p>

                    <p className="text-[14px] text-gray-500 mt-0.5 font-sans">
                      Your order qualifies for free delivery in 4–7 days.
                    </p>
                  </div>
                </div>
              </div>

              {/* =================================================
                  TRUST FEATURES
              ================================================= */}

              <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-start gap-2">
                  <Truck
                    className="w-3.5 h-3.5 mt-0.5"
                    strokeWidth={1.4}
                    style={{
                      color: INK,
                    }}
                  />

                  <div>
                    <p
                      className="text-[14px] font-semibold font-sans"
                      style={{
                        color: INK,
                      }}
                    >
                      Free Shipping
                    </p>

                    <p className="text-[7px] text-gray-400 mt-0.5 font-sans">
                      Over ₹999
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <ShieldCheck
                    className="w-3.5 h-3.5 mt-0.5"
                    strokeWidth={1.4}
                    style={{
                      color: INK,
                    }}
                  />

                  <div>
                    <p
                      className="text-[14px] font-semibold font-sans"
                      style={{
                        color: INK,
                      }}
                    >
                      Secure Checkout
                    </p>

                    <p className="text-[7px] text-gray-400 mt-0.5 font-sans">
                      100% Protected
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <RotateCcw
                    className="w-3.5 h-3.5 mt-0.5"
                    strokeWidth={1.4}
                    style={{
                      color: INK,
                    }}
                  />

                  <div>
                    <p
                      className="text-[14px] font-semibold font-sans"
                      style={{
                        color: INK,
                      }}
                    >
                      Easy Returns
                    </p>

                    <p className="text-[7px] text-gray-400 mt-0.5 font-sans">
                      7 Day Policy
                    </p>
                  </div>
                </div>
              </div>

              {/* =================================================
                  RECOMMENDED
              ================================================= */}

              {!isProductsLoading &&
                recommended.length >
                0 && (
                  <div className="mt-10 pt-8 border-t border-gray-200">
                    <div className="flex items-end justify-between mb-5">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Sparkles
                            className="w-3 h-3"
                            strokeWidth={
                              1.5
                            }
                            style={{
                              color:
                                INK,
                            }}
                          />

                          <span className="text-[7px] tracking-[0.16em] uppercase text-gray-400 font-sans">
                            Curated for you
                          </span>
                        </div>

                        <h3
                          className={`text-[22px] sm:text-[23px] md:text-[24px]`}
                          style={{
                            color:
                              INK,
                          }}
                        >
                          You might also like
                        </h3>
                      </div>

                      <Link
                        href="/products"
                        className="text-[14px] uppercase tracking-[0.14em] underline underline-offset-4 text-gray-500 hover:text-[#101A35] font-sans"
                      >
                        View all
                      </Link>
                    </div>

                    {/* =================================================
                        RECOMMENDED PRODUCT GRID
                        ONLY CLICKED BUTTON WILL LOAD
                    ================================================= */}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
                      {recommended.map(
                        (product: any) => {
                          const isThisProductAdding =
                            addingProductId ===
                            product.id;

                          return (
                            <div
                              key={
                                product.id
                              }
                              className="group"
                            >
                              <Link
                                href={`/product/${product.slug}`}
                              >
                                <div className="relative aspect-square overflow-hidden rounded-[14px] bg-[#F7F7F5] border border-[#E8E9ED] group-hover:border-[#101A35] transition-all duration-300">
                                  <Image
                                    src={
                                      product.primary_image_url ||
                                      product.primary_image ||
                                      "/indiekonnect-web/images/placeholder.jpg"
                                    }
                                    alt={
                                      product.name
                                    }
                                    fill
                                    sizes="200px"
                                    className="object-cover group-hover:scale-[1.05] transition-transform duration-700"
                                  />

                                  <div className="absolute inset-0 bg-gradient-to-t from-black/[0.05] to-transparent pointer-events-none" />

                                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
                                    <span className="bg-white/95 text-[#101A35] px-4 py-2 rounded-full text-[8px] font-semibold tracking-[0.08em] uppercase shadow-lg flex items-center gap-1.5">
                                      <ShoppingBag className="w-3 h-3" />
                                      Quick Add
                                    </span>
                                  </div>
                                </div>
                              </Link>

                              <div className="pt-3">
                                <p
                                  className="text-[11px] sm:text-[12px] truncate font-medium"
                                  style={{
                                    color:
                                      INK,
                                  }}
                                >
                                  {
                                    product.name
                                  }
                                </p>

                                <p
                                  className={` text-[15px] sm:text-[16px] font-semibold mt-0.5`}
                                  style={{
                                    color:
                                      INK,
                                  }}
                                >
                                  ₹
                                  {parseFloat(
                                    product.retail_price ||
                                    0,
                                  ).toLocaleString()}
                                </p>

                                {/* =================================================
                                    ONLY CLICKED PRODUCT BUTTON
                                ================================================= */}

                                <button
                                  type="button"
                                  onClick={(
                                    e,
                                  ) =>
                                    handleRecommendedAddToCart(
                                      product,
                                      e,
                                    )
                                  }
                                  disabled={
                                    isThisProductAdding
                                  }
                                  className="mt-2 flex items-center gap-1.5 text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.08em] transition-all hover:opacity-60 disabled:opacity-40 bg-[#101A35] text-white px-4 py-1.5 rounded-full"
                                  style={{
                                    background:
                                      INK,
                                    color:
                                      WHITE,
                                  }}
                                >
                                  {isThisProductAdding ? (
                                    <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin" />
                                  ) : (
                                    <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                  )}

                                  {isThisProductAdding
                                    ? "Adding..."
                                    : "Add"}
                                </button>
                              </div>
                            </div>
                          );
                        },
                      )}
                    </div>
                  </div>
                )}
            </section>

            {/* =================================================
                RIGHT — ORDER SUMMARY
            ================================================= */}

            <aside className="lg:sticky lg:top-24">
              <motion.div
                initial={{
                  opacity: 0,
                  y: 12,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.4,
                }}
                className="relative overflow-hidden rounded-[18px] p-5 md:p-6 shadow-[0_16px_50px_-28px_rgba(16,26,53,0.3)]"
                style={{
                  background: IVORY,
                  border: `1px solid ${LINE}`,
                }}
              >
                <div className="absolute -right-16 -top-16 w-40 h-40 rounded-full bg-[#EEF1F7] blur-3xl opacity-70 pointer-events-none" />

                <div className="absolute left-0 bottom-0 w-24 h-24 rounded-full bg-white blur-3xl opacity-60 pointer-events-none" />

                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[9px] sm:text-[10px] tracking-[0.18em] uppercase text-gray-400 mb-1.5 font-sans">
                        Order details
                      </p>

                      <h2
                        className={`${marcellus.className} text-[24px] sm:text-[26px] md:text-[28px] font-medium`}
                        style={{
                          color: INK,
                        }}
                      >
                        Order Summary
                      </h2>
                    </div>

                    <div className="w-9 h-9 rounded-full bg-white border border-[#E4E7ED] flex items-center justify-center">
                      <ShoppingBag
                        className="w-3.5 h-3.5"
                        strokeWidth={1.4}
                        style={{
                          color: INK,
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-6 space-y-3.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[12px] text-[#697286] font-sans">
                        Subtotal (
                        {
                          itemCount
                        }{" "}
                        items)
                      </span>

                      <span
                        className={` text-[16px] font-semibold`}
                        style={{
                          color: INK,
                        }}
                      >
                        ₹
                        {subtotal.toLocaleString()}
                      </span>
                    </div>

                    {totalSavings >
                      0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] text-[#4E8067] font-sans">
                            Product savings
                          </span>

                          <span
                            className={` text-[14px] font-semibold text-[#4E8067]`}
                          >
                            −₹
                            {totalSavings.toLocaleString()}
                          </span>
                        </div>
                      )}

                    {appliedPromo && (
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] text-[#4E8067] font-sans">
                          Coupon
                        </span>

                        <span
                          className={`text-[14px] font-semibold text-[#4E8067]`}
                        >
                          −₹
                          {promoDiscount.toLocaleString()}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <span className="text-[12px] text-[#697286] font-sans">
                        Shipping
                      </span>

                      <span
                        className={` text-[16px] font-semibold`}
                        style={{
                          color:
                            shipping ===
                              0
                              ? GREEN
                              : INK,
                        }}
                      >
                        {shipping ===
                          0
                          ? "Free"
                          : `₹${shipping}`}
                      </span>
                    </div>
                  </div>

                  {/* COUPON */}

                  <div className="mt-6">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          value={
                            promoCode
                          }
                          onChange={(e) => {
                            setPromoCode(
                              e.target.value.toUpperCase(),
                            );
                            setPromoError("");
                          }}
                          onFocus={() => {
                            if (
                              availableCoupons.length >
                              0
                            ) {
                              setShowCoupons(
                                true,
                              );
                            }
                          }}
                          placeholder="Promo code"
                          className="w-full h-10 px-3 bg-white border rounded-[10px] text-[10px] placeholder:text-gray-400 outline-none transition-all focus:border-[#AEB6C6] focus:ring-2 focus:ring-[#EEF1F7] font-sans"
                          style={{
                            borderColor:
                              LINE,
                            color:
                              INK,
                          }}
                        />

                        {availableCoupons.length >
                          0 && (
                            <button
                              onClick={() =>
                                setShowCoupons(
                                  !showCoupons,
                                )
                              }
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[7px] uppercase tracking-wide text-gray-400 hover:text-[#101A35] font-sans"
                            >
                              {showCoupons
                                ? "Close"
                                : "Offers"}
                            </button>
                          )}
                      </div>

                      <button
                        onClick={() =>
                          applyPromo()
                        }
                        disabled={
                          isPromoLoading ||
                          !promoCode.trim()
                        }
                        className="premium-button h-10 px-4 text-white rounded-[10px] text-[7px] font-semibold tracking-[0.1em] uppercase disabled:opacity-40 font-sans"
                        style={{
                          background:
                            INK,
                        }}
                      >
                        {isPromoLoading
                          ? "..."
                          : "Apply"}
                      </button>
                    </div>

                    {promoError && (
                      <p className="mt-1.5 text-[14px] text-red-500 flex items-center gap-1 font-sans">
                        <AlertCircle className="w-2.5 h-2.5" />

                        {promoError}
                      </p>
                    )}

                    <AnimatePresence>
                      {showCoupons &&
                        availableCoupons.length >
                        0 && (
                          <motion.div
                            initial={{
                              opacity: 0,
                              height: 0,
                            }}
                            animate={{
                              opacity: 1,
                              height: "auto",
                            }}
                            exit={{
                              opacity: 0,
                              height: 0,
                            }}
                            className="overflow-hidden"
                          >
                            <div
                              className="mt-2 bg-white border rounded-[10px] overflow-hidden shadow-sm"
                              style={{
                                borderColor:
                                  LINE,
                              }}
                            >
                              {availableCoupons
                                .slice(
                                  0,
                                  4,
                                )
                                .map(
                                  (
                                    coupon: Coupon,
                                  ) => (
                                    <button
                                      key={
                                        coupon.id
                                      }
                                      onClick={() =>
                                        applyPromo(
                                          coupon.code,
                                        )
                                      }
                                      className="w-full text-left px-3 py-2.5 border-b last:border-b-0 border-gray-100 hover:bg-[#F7F8FA] transition-colors"
                                    >
                                      <div className="flex items-center justify-between">
                                        <span
                                          className="text-[14px] font-semibold font-sans"
                                          style={{
                                            color:
                                              INK,
                                          }}
                                        >
                                          {
                                            coupon.code
                                          }
                                        </span>

                                        <span className="text-[7px] text-[#4E8067] font-medium font-sans">
                                          {coupon.type ===
                                            "percentage"
                                            ? `${coupon.value}% OFF`
                                            : `₹${coupon.value} OFF`}
                                        </span>
                                      </div>

                                      <p className="text-[7px] text-gray-400 mt-0.5 font-sans">
                                        {
                                          coupon.title
                                        }
                                      </p>
                                    </button>
                                  ),
                                )}
                            </div>
                          </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                      {appliedPromo && (
                        <motion.div
                          initial={{
                            opacity: 0,
                            y: -4,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          exit={{
                            opacity: 0,
                            y: -4,
                          }}
                          className="mt-2 flex items-center justify-between bg-white border border-[#CFE1D7] rounded-[9px] px-3 py-2"
                        >
                          <span className="flex items-center gap-1.5 text-[14px] text-[#4E8067] font-sans">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            {
                              appliedPromo.code
                            }{" "}
                            applied
                          </span>

                          <button
                            onClick={
                              removePromo
                            }
                            className="text-[7px] uppercase tracking-wide text-red-500 hover:text-red-700 font-sans"
                          >
                            Remove
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div
                    className="h-px my-5"
                    style={{
                      background:
                        LINE_DARK,
                    }}
                  />

                  <div className="flex items-end justify-between">
                    <div>
                      <span
                        className="text-[11px] uppercase tracking-[0.12em] font-semibold font-sans"
                        style={{
                          color: INK,
                        }}
                      >
                        Total
                      </span>

                      <p className="text-[9px] text-[#697286] mt-0.5 font-sans">
                        Inclusive of applicable charges
                      </p>
                    </div>

                    <span
                      className={` text-[20px] sm:text-[20px] md:text-[20px] font-semibold tracking-[-0.03em]`}
                      style={{
                        color: INK,
                      }}
                    >
                      ₹
                      {total.toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      if (
                        !cartItems.length
                      ) {
                        toast.error(
                          "Your cart is empty",
                        );
                        return;
                      }

                      router.push(
                        appliedPromo
                          ? `/checkout?coupon_code=${encodeURIComponent(
                            appliedPromo.code,
                          )}`
                          : "/checkout",
                      );
                    }}
                    className="premium-button w-full h-12 mt-6 text-white rounded-full text-[9px] font-semibold tracking-[0.15em] uppercase flex items-center justify-center font-sans"
                    style={{
                      background:
                        INK,
                    }}
                  >
                    Proceed to Checkout
                    <ArrowRight className="w-3.5 h-3.5 ml-2" />
                  </button>

                  <Link
                    href="/products"
                    className="flex items-center justify-center gap-2 mt-3 text-[9px] tracking-[0.05em] underline underline-offset-4 hover:opacity-60 font-sans"
                    style={{
                      color: INK,
                    }}
                  >
                    <ArrowLeft className="w-2.5 h-2.5" />
                    Continue shopping
                  </Link>

                  <div
                    className="mt-5 pt-3 border-t flex items-center justify-center gap-3 text-[14px] text-gray-500 font-sans"
                    style={{
                      borderColor:
                        LINE,
                    }}
                  >
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-2.5 h-2.5" />
                      Secure checkout
                    </span>

                    <span className="text-gray-300">
                      •
                    </span>

                    <span>
                      7-day returns
                    </span>
                  </div>
                </div>
              </motion.div>
            </aside>
          </div>
        )}
      </main>

      <Footer />

      {/* =====================================================
          GLOBAL PREMIUM STYLES
      ===================================================== */}

      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }

        body {
          background: #ffffff;
          font-family:
            "Inter",
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            Roboto,
            sans-serif;
        }

        ::selection {
          background: #101a35;
          color: #ffffff;
        }

        .premium-button {
          position: relative;
          overflow: hidden;

          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease,
            background 0.25s ease;
        }

        .premium-button::before {
          content: "";
          position: absolute;
          inset: 0;

          background: linear-gradient(
            115deg,
            transparent 20%,
            rgba(255, 255, 255, 0.15) 45%,
            transparent 70%
          );

          transform: translateX(-120%);
          transition:
            transform 0.65s ease;
        }

        .premium-button:hover {
          transform: translateY(-1px);

          box-shadow:
            0 12px 25px
              rgba(16, 26, 53, 0.16),
            0 4px 8px
              rgba(16, 26, 53, 0.08);

          background: #18264a !important;
        }

        .premium-button:hover::before {
          transform: translateX(120%);
        }

        .premium-button:active {
          transform: translateY(0);
        }

        .product-image {
          isolation: isolate;
        }

        @media (max-width: 640px) {
          .premium-button:hover {
            transform: none;
            box-shadow: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          html {
            scroll-behavior: auto;
          }

          .premium-button,
          .product-image img {
            transition: none !important;
          }

          .premium-button::before {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}