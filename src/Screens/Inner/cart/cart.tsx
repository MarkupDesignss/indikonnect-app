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
  CheckCircle2,
  Loader2,
  AlertCircle,
  Sparkles,
  Lock,
  Tag,
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
  useGetCouponsQuery,
  useAddToCartMutation,
} from "@/lib/redux/api/cartApi";

import { useGetProductsQuery } from "@/lib/redux/api/productApi";

/* =========================================================
   DESIGN TOKENS
========================================================= */

const INK = "#111111";
const PAGE_BG = "#F5F5F4";
const LINE = "#E5E2DB";
const GREEN = "#4E8067";

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
   BREADCRUMB COMPONENT
========================================================= */

const Breadcrumb = ({ currentPage = "Cart" }: { currentPage?: string }) => {
  const router = useRouter();

  const breadcrumbItems = [
    { label: "Home", path: "/", icon: Home },
    { label: "Products", path: "/products" },
    { label: currentPage, path: null, isCurrent: true },
  ];

  return (
    <nav
      className="flex items-center gap-1.5 text-xs text-gray-400 mb-6 overflow-x-auto whitespace-nowrap py-1"
      aria-label="Breadcrumb"
    >
      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;
        const Icon = item.icon;

        return (
          <div key={index} className="flex items-center gap-1.5">
            {index > 0 && (
              <ChevronRight
                className="w-3 h-3 flex-shrink-0 text-gray-300"
                strokeWidth={1.5}
              />
            )}

            {isLast ? (
              <span className="font-medium text-[#111111] cursor-default">
                {item.label}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => router.push(item.path || "/")}
                className="flex items-center gap-1 hover:text-[#111111] transition-colors duration-200"
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{item.label}</span>
              </button>
            )}
          </div>
        );
      })}
    </nav>
  );
};

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
  const [addingProductId, setAddingProductId] = useState<
    number | string | null
  >(null);
  const recommendedScrollRef = useRef<HTMLDivElement>(null);

  /* =========================================================
     API HOOKS
  ========================================================= */

  const {
    data: cartData,
    isLoading: isCartLoading,
    refetch: refetchCart,
  } = useGetCartQuery({});

  const { data: couponsData } = useGetCouponsQuery();
  const { data: productsData, isLoading: isProductsLoading } =
    useGetProductsQuery({});

  const [removeFromCart, { isLoading: isRemoving }] =
    useRemoveFromCartMutation();
  const [clearCart, { isLoading: isClearing }] = useClearCartMutation();
  const [updateCartItem] = useUpdateCartItemMutation();
  const [addToCart] = useAddToCartMutation();

  /* =========================================================
     HELPERS
  ========================================================= */

  const scrollRecommended = (direction: "left" | "right") => {
    const el = recommendedScrollRef.current;
    if (!el) return;
    const amount = 220;
    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  /* =========================================================
     CART ITEMS
  ========================================================= */

  const cartItems = useMemo(() => {
    if (!cartData?.data?.items) return [];

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
      if (!coupon.is_active) return false;
      if (coupon.max_uses > 0 && coupon.used_count >= coupon.max_uses)
        return false;
      if (coupon.expires_at && new Date(coupon.expires_at) < new Date())
        return false;
      return true;
    });
  }, [couponsData]);

  /* =========================================================
     RECOMMENDED PRODUCTS
  ========================================================= */

  const recommended = useMemo(() => {
    if (!productsData?.data) return [];
    const cartProductIds = new Set(cartItems.map((item) => item.id));
    const allProducts = productsData.data || [];
    return allProducts
      .filter((product: any) => !cartProductIds.has(product.id))
      .slice(0, 8);
  }, [productsData, cartItems]);

  /* =========================================================
     PRICE CALCULATION
  ========================================================= */

  const { subtotal, totalSavings, promoDiscount, shipping, total, itemCount } =
    useMemo(() => {
      const subtotalValue = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      const mrpValue = cartItems.reduce(
        (sum, item) => sum + (item.originalPrice || item.price) * item.quantity,
        0,
      );

      const savings = Math.max(mrpValue - subtotalValue, 0);

      let couponDiscount = 0;
      if (appliedPromo) {
        if (appliedPromo.type === "percentage") {
          couponDiscount = Math.round(
            (subtotalValue * appliedPromo.value) / 100,
          );
        } else {
          couponDiscount = Math.min(appliedPromo.value, subtotalValue);
        }
      }

      const afterCoupon = subtotalValue - couponDiscount;
      const delivery = afterCoupon >= 999 || afterCoupon === 0 ? 0 : 79;
      const finalTotal = afterCoupon + delivery;
      const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);

      return {
        subtotal: subtotalValue,
        totalSavings: savings + couponDiscount,
        promoDiscount: couponDiscount,
        shipping: delivery,
        total: finalTotal,
        itemCount: count,
      };
    }, [cartItems, appliedPromo]);

  /* =========================================================
     CART ACTIONS
  ========================================================= */

  const updateQuantity = async (
    id: number,
    action: "increment" | "decrement",
  ) => {
    const item = cartItems.find((cartItem) => cartItem.id === id);
    if (!item?.cartItemId) {
      toast.error("Cart item not found");
      return;
    }

    const newQuantity =
      action === "increment"
        ? Math.min(item.quantity + 1, 10)
        : Math.max(item.quantity - 1, 1);

    if (newQuantity === item.quantity) return;

    setIsUpdating(id);
    try {
      await updateCartItem({
        itemId: item.cartItemId,
        data: { quantity: newQuantity, action },
      }).unwrap();
      await refetchCart();
    } catch (error: any) {
      toast.error(error?.data?.message || "Unable to update quantity");
    } finally {
      setIsUpdating(null);
    }
  };

  const removeItem = async (id: number) => {
    const item = cartItems.find((cartItem) => cartItem.id === id);
    if (!item?.cartItemId) return;

    try {
      await removeFromCart(item.cartItemId).unwrap();
      await refetchCart();
      toast.success("Item removed from cart", { position: "bottom-center" });
    } catch (error: any) {
      toast.error(error?.data?.message || "Unable to remove item");
    }
  };

  const clearCartHandler = async () => {
    try {
      await clearCart({}).unwrap();
      await refetchCart();
      setAppliedPromo(null);
      toast.success("Cart cleared successfully", { position: "bottom-center" });
    } catch (error: any) {
      toast.error(error?.data?.message || "Unable to clear cart");
    }
  };

  /* =========================================================
     COUPON ACTIONS
  ========================================================= */

  const applyPromo = (code?: string) => {
    const finalCode = (code || promoCode).trim().toUpperCase();

    if (!finalCode) {
      setPromoError("Please enter a coupon code");
      return;
    }

    setIsPromoLoading(true);
    setPromoError("");

    const coupon = availableCoupons.find(
      (item: Coupon) => item.code.toUpperCase() === finalCode,
    );

    setTimeout(() => {
      if (!coupon) {
        setAppliedPromo(null);
        setPromoError("Invalid or expired coupon code");
        setIsPromoLoading(false);
        return;
      }

      const minOrder = parseFloat(coupon.min_order) || 0;
      const maxOrder = parseFloat(coupon.max_order) || Infinity;

      if (subtotal < minOrder) {
        setPromoError(`Minimum order amount is ₹${minOrder.toLocaleString()}`);
        setAppliedPromo(null);
        setIsPromoLoading(false);
        return;
      }

      if (maxOrder !== Infinity && subtotal > maxOrder) {
        setPromoError(`Maximum order amount is ₹${maxOrder.toLocaleString()}`);
        setAppliedPromo(null);
        setIsPromoLoading(false);
        return;
      }

      setAppliedPromo({
        id: coupon.id,
        code: coupon.code,
        value: parseFloat(coupon.value),
        type: coupon.type,
        title: coupon.title,
      });

      setPromoCode(coupon.code);
      setPromoError("");
      setShowCoupons(false);
      setIsPromoLoading(false);

      toast.success(`${coupon.code} applied successfully`, {
        position: "bottom-center",
      });
    }, 500);
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setPromoCode("");
    setPromoError("");
  };

  /* =========================================================
     RECOMMENDED PRODUCT ACTIONS
  ========================================================= */

  const handleRecommendedAddToCart = async (
    product: any,
    e?: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (addingProductId === product.id) return;

    try {
      setAddingProductId(product.id);
      await addToCart({ product_id: product.id, quantity: 1 }).unwrap();
      await refetchCart();
      toast.success("Added to cart", { position: "bottom-center" });
    } catch (error: any) {
      toast.error(error?.data?.message || "Unable to add product", {
        position: "bottom-center",
      });
    } finally {
      setAddingProductId(null);
    }
  };

  /* =========================================================
     LOADING STATE
  ========================================================= */

  if (isCartLoading) {
    return (
      <div className="min-h-screen font-sans" style={{ background: PAGE_BG }}>
        <Header
          cartItems={[]}
          cartCount={0}
          cartSubtotal={0}
          wishlistCount={0}
          onRemoveFromCart={() => {}}
          onClearCart={() => {}}
        />
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white border border-[#E5E2DB] flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: INK }} />
          </div>
          <p className="mt-5 text-[11px] tracking-[0.16em] uppercase text-gray-400">
            Preparing your cart
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-screen font-sans" style={{ background: PAGE_BG }}>
      <Header
        cartItems={cartItems}
        cartCount={itemCount}
        cartSubtotal={subtotal}
        wishlistCount={0}
        onRemoveFromCart={removeItem}
        onClearCart={clearCartHandler}
      />

      <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-10">
        {/* BREADCRUMB */}
        <Breadcrumb currentPage="Cart" />

        {cartItems.length === 0 ? (
          /* =================================================
             EMPTY CART
          ================================================= */
          <EmptyCart />
        ) : (
          /* =================================================
             CART WITH ITEMS
          ================================================= */
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
            promoDiscount={promoDiscount}
            shipping={shipping}
            total={total}
            promoCode={promoCode}
            setPromoCode={setPromoCode}
            promoError={promoError}
            setPromoError={setPromoError}
            showCoupons={showCoupons}
            setShowCoupons={setShowCoupons}
            availableCoupons={availableCoupons}
            applyPromo={applyPromo}
            isPromoLoading={isPromoLoading}
            appliedPromo={appliedPromo}
            removePromo={removePromo}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}

/* =========================================================
   SUB-COMPONENTS
========================================================= */

const EmptyCart = () => {
  const INK = "#111111";

  return (
    <div className="bg-white rounded-2xl border border-[#E5E2DB] min-h-[420px] flex flex-col items-center justify-center text-center px-6">
      <div className="w-16 h-16 rounded-full bg-[#F4F3EE] flex items-center justify-center mb-5">
        <ShoppingBag
          className="w-6 h-6"
          strokeWidth={1.4}
          style={{ color: INK }}
        />
      </div>

      <h2 className="text-xl font-bold" style={{ color: INK }}>
        Your cart is empty
      </h2>

      <p className="text-sm text-gray-500 mt-2 max-w-sm">
        Discover something beautiful from our curated collection.
      </p>

      <Link
        href="/products"
        className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-lg text-sm font-bold uppercase tracking-wide mt-6 hover:bg-black transition-colors"
        style={{ background: INK }}
      >
        Continue Shopping
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
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
  promoDiscount,
  shipping,
  total,
  promoCode,
  setPromoCode,
  promoError,
  setPromoError,
  showCoupons,
  setShowCoupons,
  availableCoupons,
  applyPromo,
  isPromoLoading,
  appliedPromo,
  removePromo,
}: any) => {
  const INK = "#111111";
  const LINE = "#E5E2DB";
  const GREEN = "#4E8067";
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-start">
      {/* LEFT COLUMN */}
      <div className="space-y-6">
        {/* SHOPPING CART */}
        <section className="bg-white rounded-2xl border border-[#E5E2DB] p-5 md:p-7">
          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-xl md:text-2xl font-bold"
                style={{ color: INK }}
              >
                Shopping Cart
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
              </p>
            </div>
          </div>

          {/* DESKTOP HEADER */}
          <div className="mt-5 pb-3 border-b border-[#E5E2DB] hidden sm:grid grid-cols-[1fr_160px_120px_40px] gap-3 text-[11px] uppercase tracking-[0.12em] text-[#8B8B87] font-semibold">
            <span>Product</span>
            <span>Quantity</span>
            <span>Price</span>
            <span />
          </div>

          <AnimatePresence initial={false}>
            {cartItems.map((item: any) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 sm:grid-cols-[1fr_160px_120px_40px] items-center gap-3 py-5 border-b border-[#E5E2DB] last:border-b-0"
              >
                {/* PRODUCT */}
                <div className="flex items-center gap-3 min-w-0">
                  <Link
                    href={`/product/${item.slug}`}
                    className="relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-[#F4F3EE] border border-[#E5E2DB]"
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </Link>

                  <div className="min-w-0">
                    <Link
                      href={`/product/${item.slug}`}
                      className="block text-[14px] sm:text-[15px] font-semibold leading-snug line-clamp-2 hover:opacity-70 transition-opacity"
                      style={{ color: INK }}
                    >
                      {item.name}
                    </Link>
                    {item.category && (
                      <p className="text-[11px] text-[#858581] mt-1">
                        SKU: {item.category}
                      </p>
                    )}
                  </div>
                </div>

                {/* QUANTITY */}
                <div className="flex items-center gap-2">
                  <span className="sm:hidden text-[11px] uppercase tracking-wide text-gray-400 mr-1">
                    Qty
                  </span>
                  <div
                    className="flex items-center h-10 w-[112px] rounded-full bg-white border-2 shadow-sm overflow-hidden"
                    style={{ borderColor: "#C9C5BC" }}
                  >
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, "decrement")}
                      disabled={item.quantity <= 1 || isUpdating === item.id}
                      className="w-10 h-full flex items-center justify-center text-[#111111] hover:bg-[#F0EEE9] active:bg-[#E7E4DC] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" strokeWidth={2.5} />
                    </button>

                    <div className="flex-1 h-full flex items-center justify-center border-x border-[#D8D5CD]">
                      {isUpdating === item.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-[#111111]" />
                      ) : (
                        <span className="text-sm font-bold text-[#111111]">
                          {item.quantity}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, "increment")}
                      disabled={item.quantity >= 10 || isUpdating === item.id}
                      className="w-10 h-full flex items-center justify-center text-[#111111] hover:bg-[#F0EEE9] active:bg-[#E7E4DC] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>

                {/* PRICE */}
                <div className="sm:block flex items-center gap-2 ml-[48px] sm:ml-0">
                  <span
                    className="block text-[16px] font-bold"
                    style={{ color: INK }}
                  >
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </span>
                  {item.originalPrice && (
                    <span className="text-[12px] text-[#9298A4] line-through">
                      ₹{(item.originalPrice * item.quantity).toLocaleString()}
                    </span>
                  )}
                </div>

                {/* REMOVE */}
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  disabled={isRemoving}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 border border-transparent hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-colors justify-self-end sm:justify-self-auto"
                  aria-label="Remove product"
                >
                  {isRemoving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* CANCEL ORDER */}
          <div className="flex items-center justify-end mt-6">
            <button
              type="button"
              onClick={clearCartHandler}
              disabled={isClearing}
              className="bg-[#E0432B] hover:bg-[#C73A24] text-white px-6 py-2.5 rounded-full text-sm font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isClearing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Cancel Order
            </button>
          </div>
        </section>

        {/* RECOMMENDED */}
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

      {/* RIGHT COLUMN */}
      <aside className="lg:sticky lg:top-24">
        <OrderSummary
          subtotal={subtotal}
          totalSavings={totalSavings}
          promoDiscount={promoDiscount}
          shipping={shipping}
          total={total}
          itemCount={itemCount}
          promoCode={promoCode}
          setPromoCode={setPromoCode}
          promoError={promoError}
          setPromoError={setPromoError}
          showCoupons={showCoupons}
          setShowCoupons={setShowCoupons}
          availableCoupons={availableCoupons}
          applyPromo={applyPromo}
          isPromoLoading={isPromoLoading}
          appliedPromo={appliedPromo}
          removePromo={removePromo}
          cartItems={cartItems}
        />
      </aside>
    </div>
  );
};

const RecommendedSection = ({
  recommended,
  addingProductId,
  handleRecommendedAddToCart,
  scrollRecommended,
  recommendedScrollRef,
}: any) => {
  const INK = "#111111";

  return (
    <section className="bg-white rounded-2xl border border-[#E5E2DB] p-5 md:p-7">
      <div className="flex items-end justify-between mb-5">
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles className="w-4 h-4" style={{ color: INK }} />
            <span className="text-[11px] tracking-[0.16em] uppercase text-gray-400">
              Curated for you
            </span>
          </div>
          <h3 className="text-lg md:text-xl font-bold" style={{ color: INK }}>
            You might also like
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/products"
            className="text-xs uppercase tracking-wide underline underline-offset-4 text-gray-500 hover:text-[#111111] hidden sm:inline"
          >
            View all
          </Link>

          {recommended.length > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => scrollRecommended("left")}
                className="w-8 h-8 rounded-lg border border-[#D5D1C8] bg-white text-[#111111] flex items-center justify-center hover:bg-[#F4F3EE] transition-colors"
                aria-label="Scroll left"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => scrollRecommended("right")}
                className="w-8 h-8 rounded-lg bg-[#111111] text-white flex items-center justify-center hover:bg-black transition-colors"
                aria-label="Scroll right"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div
        ref={recommendedScrollRef}
        className="flex gap-4 overflow-x-auto pb-1 scroll-smooth snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {recommended.map((product: any) => {
          const isThisProductAdding = addingProductId === product.id;

          return (
            <div
              key={product.id}
              className="group w-[160px] sm:w-[180px] flex-shrink-0 snap-start"
            >
              <Link href={`/product/${product.slug}`}>
                <div className="relative aspect-square overflow-hidden rounded-xl bg-[#F4F3EE] border border-[#E5E2DB] group-hover:border-[#111111] transition-colors">
                  <Image
                    src={
                      product.primary_image_url ||
                      product.primary_image ||
                      "/indiekonnect-web/images/placeholder.jpg"
                    }
                    alt={product.name}
                    fill
                    sizes="200px"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </Link>

              <div className="pt-2.5">
                <p
                  className="text-[12px] truncate font-medium"
                  style={{ color: INK }}
                >
                  {product.name}
                </p>
                <p
                  className="text-[15px] font-bold mt-0.5"
                  style={{ color: INK }}
                >
                  ₹{parseFloat(product.retail_price || 0).toLocaleString()}
                </p>

                <button
                  type="button"
                  onClick={(e) => handleRecommendedAddToCart(product, e)}
                  disabled={isThisProductAdding}
                  className="mt-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-white px-4 py-1.5 rounded-full disabled:opacity-50"
                  style={{ background: INK }}
                >
                  {isThisProductAdding ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ShoppingBag className="w-3.5 h-3.5" />
                  )}
                  {isThisProductAdding ? "Adding..." : "Add"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

const OrderSummary = ({
  subtotal,
  totalSavings,
  promoDiscount,
  shipping,
  total,
  itemCount,
  promoCode,
  setPromoCode,
  promoError,
  setPromoError,
  showCoupons,
  setShowCoupons,
  availableCoupons,
  applyPromo,
  isPromoLoading,
  appliedPromo,
  removePromo,
  cartItems,
}: any) => {
  const INK = "#111111";
  const LINE = "#E5E2DB";
  const GREEN = "#4E8067";
  const router = useRouter();

  return (
    <div className="bg-white rounded-2xl border border-[#E5E2DB] p-5 md:p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E5E2DB]">
        <h2 className="text-lg font-bold" style={{ color: INK }}>
          Order Summary
        </h2>
        <span className="text-[11px] font-semibold text-gray-400">
          {itemCount} {itemCount === 1 ? "ITEM" : "ITEMS"}
        </span>
      </div>

      {/* PRICE DETAILS */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-[#7d827f]">Subtotal</span>
          <span className="text-sm font-semibold" style={{ color: INK }}>
            ₹{subtotal.toLocaleString()}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-[#7d827f]">Discount</span>
          <span className="text-sm font-semibold text-[#4E8067]">
            {totalSavings > 0 ? `−₹${totalSavings.toLocaleString()}` : "₹0.00"}
          </span>
        </div>

        {promoDiscount > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#7d827f]">Coupon Discount</span>
            <span className="text-sm font-semibold text-[#4E8067]">
              −₹{promoDiscount.toLocaleString()}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="text-sm text-[#7d827f]">Delivery</span>
          <span
            className="text-sm font-semibold"
            style={{ color: shipping === 0 ? GREEN : INK }}
          >
            {shipping === 0 ? "Free" : `₹${shipping}`}
          </span>
        </div>
      </div>

      {/* COUPON */}
      <div className="mt-5 pt-5 border-t border-[#E5E2DB]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-[#F4F3EE] flex items-center justify-center">
            <Tag className="w-4 h-4" style={{ color: INK }} />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: INK }}>
              Have a coupon?
            </p>
            <p className="text-[10px] text-gray-400">Apply it to save more</p>
          </div>
        </div>

        {/* INPUT */}
        <div className="relative">
          <input
            value={promoCode}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setPromoCode(e.target.value.toUpperCase());
              setPromoError("");
            }}
            onFocus={() => {
              if (availableCoupons.length > 0) setShowCoupons(true);
            }}
            placeholder="Enter coupon code"
            className="w-full h-11 px-4 pr-24 bg-[#F7F6F2] border border-[#D9D6CE] rounded-lg text-sm font-medium placeholder:text-gray-400 outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111]/10 transition-all"
          />

          <button
            type="button"
            onClick={() => applyPromo()}
            disabled={isPromoLoading || !promoCode.trim()}
            className="absolute right-1.5 top-1.5 h-8 px-3 rounded-md text-[11px] font-bold uppercase tracking-wide text-white disabled:opacity-40 transition-colors"
            style={{ background: INK }}
          >
            {isPromoLoading ? "..." : "Apply"}
          </button>
        </div>

        {/* ERROR */}
        {promoError && (
          <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {promoError}
          </p>
        )}

        {/* AVAILABLE COUPONS */}
        <AnimatePresence>
          {showCoupons && availableCoupons.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-2 bg-white border border-[#E5E2DB] rounded-lg overflow-hidden shadow-sm">
                {availableCoupons.slice(0, 4).map((coupon: any) => (
                  <button
                    type="button"
                    key={coupon.id}
                    onClick={() => applyPromo(coupon.code)}
                    className="w-full text-left px-3 py-2.5 border-b last:border-b-0 border-[#E5E2DB] hover:bg-[#F7F6F2] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="text-sm font-bold"
                        style={{ color: INK }}
                      >
                        {coupon.code}
                      </span>
                      <span className="text-[11px] text-[#4E8067] font-bold">
                        {coupon.type === "percentage"
                          ? `${coupon.value}% OFF`
                          : `₹${coupon.value} OFF`}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {coupon.title}
                    </p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* APPLIED COUPON */}
        <AnimatePresence>
          {appliedPromo && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="mt-2 flex items-center justify-between bg-[#F1F7F3] border border-[#CFE1D7] rounded-lg px-3 py-2"
            >
              <span className="flex items-center gap-1.5 text-xs text-[#4E8067] font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {appliedPromo.code} applied
              </span>
              <button
                type="button"
                onClick={removePromo}
                className="text-[11px] uppercase tracking-wide text-red-500 hover:text-red-700 font-semibold"
              >
                Remove
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* TOTAL */}
      <div className="h-px my-5" style={{ background: LINE }} />

      <div className="flex items-center justify-between">
        <div>
          <span className="text-base font-bold block" style={{ color: INK }}>
            Total
          </span>
          <span className="text-[10px] text-gray-400">
            Inclusive of applicable charges
          </span>
        </div>
        <span className="text-2xl font-bold" style={{ color: INK }}>
          ₹{total.toLocaleString()}
        </span>
      </div>

      {/* PAYMENT */}
      <div
        className="mt-5 flex items-center gap-3 rounded-lg border-2 px-4 py-3"
        style={{ borderColor: INK }}
      >
        <div className="w-9 h-9 rounded-md bg-[#0f1c47] flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm italic">R</span>
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: INK }}>
            Razorpay
          </p>
          <p className="text-[11px] text-gray-400">
            Cards, UPI, wallets & netbanking
          </p>
        </div>
        <CheckCircle2
          className="w-4 h-4 ml-auto flex-shrink-0"
          style={{ color: INK }}
        />
      </div>

      {/* CHECKOUT */}
      <button
        type="button"
        onClick={() => {
          if (!cartItems.length) {
            toast.error("Your cart is empty");
            return;
          }
          router.push(
            appliedPromo
              ? `/checkout?coupon_code=${encodeURIComponent(appliedPromo.code)}`
              : "/checkout",
          );
        }}
        className="w-full h-12 mt-4 text-white rounded-lg text-sm font-bold uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-black transition-colors"
        style={{ background: INK }}
      >
        Check Out
        <ArrowRight className="w-4 h-4" />
      </button>

      {/* SECURE */}
      <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-gray-400">
        <Lock className="w-3 h-3" />
        Payments secured by Razorpay
      </div>

      {/* TRUST FEATURES */}
      <div className="bg-white rounded-2xl border border-[#E5E2DB] p-5 mt-6">
        <button
          type="button"
          onClick={() => router.push("/products")}
          className="flex items-center gap-2 text-sm font-bold hover:opacity-60 transition-opacity"
          style={{ color: INK }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shopping
        </button>

        <div className="h-px my-4" style={{ background: LINE }} />

        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center text-center">
            <div className="w-9 h-9 rounded-full bg-[#F4F3EE] flex items-center justify-center mb-2">
              <Truck className="w-4 h-4" style={{ color: INK }} />
            </div>
            <p
              className="text-[11px] font-bold leading-tight"
              style={{ color: INK }}
            >
              Free Shipping
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">Over ₹999</p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-9 h-9 rounded-full bg-[#F4F3EE] flex items-center justify-center mb-2">
              <ShieldCheck className="w-4 h-4" style={{ color: INK }} />
            </div>
            <p
              className="text-[11px] font-bold leading-tight"
              style={{ color: INK }}
            >
              Secure Checkout
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">100% Protected</p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-9 h-9 rounded-full bg-[#F4F3EE] flex items-center justify-center mb-2">
              <RotateCcw className="w-4 h-4" style={{ color: INK }} />
            </div>
            <p
              className="text-[11px] font-bold leading-tight"
              style={{ color: INK }}
            >
              Easy Returns
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">7 Day Policy</p>
          </div>
        </div>
      </div>
    </div>
  );
};
