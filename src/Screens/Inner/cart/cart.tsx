"use client";

import { useState, useMemo, useEffect } from "react";
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
  ShoppingCart,
  Tag,
  ShieldCheck,
  Truck,
  RotateCcw,
  ChevronRight,
  Sparkles,
  PackageOpen,
  Lock,
  CreditCard,
  Gift,
  X,
  CheckCircle2,
  Heart,
  Star,
  Loader2,
} from "lucide-react";

import Header from "../../../components/common/Header";
import Footer from "../../../components/Footer/Footer";


import BannerImage from "../../../../public/images/banner.png";
import {
  useGetCartQuery,
  useRemoveFromCartMutation,
  useClearCartMutation,
  useUpdateCartItemMutation,
  useApplyCouponMutation,
  useGetCartSummaryQuery,
  useRemoveCouponMutation,
} from "@/lib/redux/api/cartApi";
import { useGetProductsQuery } from "@/lib/redux/api/productApi";
import { toast } from "react-hot-toast";

// Types based on API response
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

interface CartData {
  id: number;
  items: CartItem[];
  total: number;
  total_formatted: string;
  total_items: number;
  price_type: string;
  price_calculation: string;
}

interface CartResponse {
  data: CartData;
  is_guest: boolean;
  session_id: string | null;
  user_type: string;
}

export default function CartPage() {
  const router = useRouter();
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    pct: number;
  } | null>(null);
  const [promoError, setPromoError] = useState("");
  const [isPromoLoading, setIsPromoLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState<number | null>(null);

  // API Hooks
  const {
    data: cartData,
    isLoading: isCartLoading,
    isError: isCartError,
    refetch: refetchCart,
  } = useGetCartQuery({});

  // Get products from API for recommendations
  const {
    data: productsData,
    isLoading: isProductsLoading,
  } = useGetProductsQuery({});

  const [removeFromCart, { isLoading: isRemoving }] =
    useRemoveFromCartMutation();
    
  const [clearCart, { isLoading: isClearing }] = useClearCartMutation();

  const [updateCartItem, { isLoading: isUpdatingCart }] =
    useUpdateCartItemMutation();

  // Transform API cart items to UI format
  const cartItems = useMemo(() => {
    if (!cartData?.data?.items) return [];

    return cartData.data.items.map((item: CartItem) => ({
      id: item.product_id,
      cartItemId: item.id, // This is the cart item ID used for API operations
      name: item.product.name,
      image: item.product.primary_image,
      price: parseFloat(item.current_unit_price),
      originalPrice: parseFloat(item.product.retail_price) > parseFloat(item.current_unit_price) 
        ? parseFloat(item.product.retail_price) 
        : undefined,
      category: item.product.product_code,
      quantity: item.quantity,
      inStock: true,
    }));
  }, [cartData]);

  // Get recommended products from API (exclude items already in cart)
  const recommended = useMemo(() => {
    if (!productsData?.data) return [];
    
    const cartProductIds = new Set(cartItems.map((item) => item.id));
    const allProducts = productsData.data || [];
    
    // Filter products not in cart and group by category
    const availableProducts = allProducts.filter(
      (p: any) => !cartProductIds.has(p.id)
    );
    
    // Group by category to show variety
    const categorized: Record<string, any[]> = {};
    availableProducts.forEach((p: any) => {
      const category = p.category || 'Uncategorized';
      if (!categorized[category]) categorized[category] = [];
      categorized[category].push(p);
    });
    
    // Take 2 from each category, up to 6 total
    const result: any[] = [];
    const categories = Object.keys(categorized);
    for (const cat of categories) {
      const items = categorized[cat].slice(0, 2);
      result.push(...items);
      if (result.length >= 6) break;
    }
    
    return result.slice(0, 6);
  }, [productsData, cartItems]);

  const updateQuantity = async (
    id: number,
    type: "increment" | "decrement"
  ) => {
    const item = cartItems.find((item) => item.id === id);
  
    if (!item) {
      toast.error("Item not found");
      return;
    }
  
    if (!item.cartItemId) {
      toast.error("Cart item ID missing");
      return;
    }
  
    const newQuantity =
      type === "increment"
        ? Math.min(item.quantity + 1, 10)
        : Math.max(item.quantity - 1, 1);
  
    if (newQuantity === item.quantity) return;
  
    setIsUpdating(id);
  
    try {
      console.log("Updating cart item:", {
        itemId: item.cartItemId,
        quantity: newQuantity,
        action: type,
      });
  
      await updateCartItem({
        itemId: item.cartItemId,
        data: {
          quantity: newQuantity,
          action: type,
        },
      }).unwrap();
  
      await refetchCart();
  
      toast.success("Quantity updated successfully", {
        duration: 2000,
        position: 'bottom-center',
        style: {
          background: '#10B981',
          color: '#fff',
          borderRadius: '10px',
          padding: '12px 20px',
        },
        icon: '✅',
      });
    } catch (error: any) {
      console.error("Failed to update quantity:", error);
  
      toast.error(
        error?.data?.message || "Failed to update quantity",
        {
          duration: 3000,
          position: 'bottom-center',
          style: {
            background: '#EF4444',
            color: '#fff',
            borderRadius: '10px',
            padding: '12px 20px',
          },
          icon: '❌',
        }
      );
    } finally {
      setIsUpdating(null);
    }
  };

  const removeItem = async (id: number) => {
    const item = cartItems.find((item) => item.id === id);
  
    if (!item) {
      toast.error("Item not found");
      return;
    }
  
    if (!item.cartItemId) {
      toast.error("Cart item ID missing");
      return;
    }
  
    try {
      await removeFromCart(item.cartItemId).unwrap();
  
      await refetchCart();
  
      toast.success("Item removed from cart", {
        duration: 2000,
        position: 'bottom-center',
        style: {
          background: '#10B981',
          color: '#fff',
          borderRadius: '10px',
          padding: '12px 20px',
        },
        icon: '🗑️',
      });
    } catch (error: any) {
      console.error("Failed to remove item:", error);
  
      toast.error(
        error?.data?.message || "Failed to remove item",
        {
          duration: 3000,
          position: 'bottom-center',
          style: {
            background: '#EF4444',
            color: '#fff',
            borderRadius: '10px',
            padding: '12px 20px',
          },
          icon: '❌',
        }
      );
    }
  };

  // Clear entire cart
  const clearCartHandler = async () => {
    try {
      await clearCart({}).unwrap();
      await refetchCart();
      toast.success("Cart cleared successfully", {
        duration: 2000,
        position: 'bottom-center',
        style: {
          background: '#10B981',
          color: '#fff',
          borderRadius: '10px',
          padding: '12px 20px',
        },
        icon: '🧹',
      });
    } catch (error: any) {
      console.error("Failed to clear cart:", error);
      toast.error(error?.data?.message || "Failed to clear cart", {
        duration: 3000,
        position: 'bottom-center',
        style: {
          background: '#EF4444',
          color: '#fff',
          borderRadius: '10px',
          padding: '12px 20px',
        },
        icon: '❌',
      });
    }
  };

  // Apply promo code
  const applyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) {
      toast.error("Please enter a promo code", {
        duration: 2000,
        position: 'bottom-center',
        style: {
          background: '#F59E0B',
          color: '#fff',
          borderRadius: '10px',
          padding: '12px 20px',
        },
        icon: '⚠️',
      });
      return;
    }
    setIsPromoLoading(true);
    setTimeout(() => {
      if (code === "KONNECT10") {
        setAppliedPromo({ code, pct: 10 });
        setPromoError("");
        toast.success("Promo code applied successfully!", {
          duration: 2000,
          position: 'bottom-center',
          style: {
            background: '#10B981',
            color: '#fff',
            borderRadius: '10px',
            padding: '12px 20px',
          },
          icon: '🎉',
        });
      } else {
        setAppliedPromo(null);
        setPromoError("Invalid or expired code");
        toast.error("Invalid promo code. Please try again.", {
          duration: 3000,
          position: 'bottom-center',
          style: {
            background: '#EF4444',
            color: '#fff',
            borderRadius: '10px',
            padding: '12px 20px',
          },
          icon: '❌',
        });
      }
      setIsPromoLoading(false);
    }, 600);
  };

  // Calculate cart totals
  const {
    subtotal,
    totalMrp,
    totalSavingsFromMrp,
    promoDiscount,
    shipping,
    tax,
    total,
    itemCount,
  } = useMemo(() => {
    const subtotal = cartItems.reduce(
      (sum, c) => sum + c.price * c.quantity,
      0,
    );
    const totalMrp = cartItems.reduce(
      (sum, c) => sum + (c.originalPrice || c.price) * c.quantity,
      0,
    );
    const totalSavingsFromMrp = Math.max(totalMrp - subtotal, 0);
    const promoDiscount = appliedPromo
      ? Math.round((subtotal * appliedPromo.pct) / 100)
      : 0;
    const afterPromo = subtotal - promoDiscount;
    const shipping = afterPromo > 999 || afterPromo === 0 ? 0 : 79;
    const tax = Math.round(afterPromo * 0.05);
    const total = afterPromo + shipping + tax;
    const itemCount = cartItems.reduce((sum, c) => sum + c.quantity, 0);
    return {
      subtotal,
      totalMrp,
      totalSavingsFromMrp,
      promoDiscount,
      shipping,
      tax,
      total,
      itemCount,
    };
  }, [cartItems, appliedPromo]);

  // Animation variants
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
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
      },
    },
    exit: {
      opacity: 0,
      x: 20,
      transition: {
        duration: 0.3,
      },
    },
  };

  const summaryVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
        delay: 0.3,
      },
    },
  };

  const recommendedVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.2,
      },
    },
  };

  const recommendedItemVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 10 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
      },
    },
  };

  // Loading state
  if (isCartLoading) {
    return (
      <div className="min-h-screen bg-[#FBF8F2]">
        <Header
          cartItems={[]}
          cartCount={0}
          cartSubtotal={0}
          wishlistCount={0}
          onRemoveFromCart={() => {}}
          onClearCart={() => {}}
        />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-[#FDCB00] animate-spin" />
            <p className="text-gray-500 text-sm">Loading your cart...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF8F2]">
      {/* Header */}
      <Header
        cartItems={cartItems}
        cartCount={itemCount}
        cartSubtotal={subtotal}
        wishlistCount={0}
        onRemoveFromCart={removeItem}
        onClearCart={clearCartHandler}
      />

      {/* Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative w-full h-[160px] md:h-[220px] lg:h-[280px] overflow-hidden"
      >
        <Image
          src={BannerImage}
          alt="Cart Banner"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent flex items-center">
          <div className="container mx-auto px-4">
            <div className="px-6 md:px-12 max-w-2xl">
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
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <ShoppingBag className="w-8 h-8 text-[#FDCB00]" />
                  </motion.div>
                  <span className="text-white/70 text-sm font-medium tracking-widest uppercase">
                    Your Cart
                  </span>
                </motion.div>
                <motion.h1
                  className="text-3xl md:text-5xl font-bold text-white mb-2"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Shopping Cart
                </motion.h1>
                <motion.p
                  className="text-white/80 text-sm md:text-base"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {itemCount > 0
                    ? `${itemCount} ${itemCount === 1 ? "item" : "items"} in your cart`
                    : "Your cart is currently empty"}
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

      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-[#FDCB00] transition-colors mb-4 group text-sm"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Continue Shopping</span>
        </motion.button>

        {/* Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex items-center gap-1.5 text-xs text-gray-500 mb-6"
        >
          <Link href="/" className="hover:text-[#FDCB00] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-gray-300" />
          <span className="text-gray-800 font-medium">Shopping Cart</span>
        </motion.nav>

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="w-11 h-11 rounded-2xl bg-[#FDCB00] flex items-center justify-center shadow-sm"
            >
              <ShoppingBag className="w-5 h-5 text-gray-900" />
            </motion.div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Your Cart
              </h1>
              <motion.p
                className="text-sm text-gray-500"
                key={itemCount}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {itemCount > 0
                  ? `${itemCount} ${itemCount === 1 ? "item" : "items"} in your cart`
                  : "Your cart is currently empty"}
              </motion.p>
            </div>
          </div>

          {cartItems.length > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearCartHandler}
              disabled={isClearing}
              className="hidden sm:flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
            >
              {isClearing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Clear Cart
            </motion.button>
          )}
        </motion.div>

        {cartItems.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 py-20 px-6 flex flex-col items-center justify-center text-center"
          >
            <motion.div
              className="w-24 h-24 rounded-full bg-[#FDCB00]/10 flex items-center justify-center mb-6"
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <PackageOpen className="w-12 h-12 text-[#FDCB00]" />
            </motion.div>
            <motion.h2
              className="text-xl font-bold text-gray-900 mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Your cart is empty
            </motion.h2>
            <motion.p
              className="text-gray-500 mb-6 max-w-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Looks like you haven't added anything yet. Explore our collection
              and find something you'll love.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#FDCB00] text-gray-900 rounded-xl font-semibold hover:bg-[#E5B800] hover:shadow-lg transition-all"
              >
                <Sparkles className="w-4 h-4" />
                Start Shopping
              </Link>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start"
          >
            {/* Left: Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <motion.div
                variants={itemVariants}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <AnimatePresence initial={false}>
                  {cartItems.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex gap-4 p-4 sm:p-5 ${
                        idx !== cartItems.length - 1
                          ? "border-b border-gray-100"
                          : ""
                      }`}
                    >
                      {/* Image */}
                      <Link
                        href={`/product/${item.id}`}
                        className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden flex-shrink-0 bg-gray-50 border border-gray-100 group"
                      >
                        <Image
                          src={item.image || "/images/placeholder.jpg"}
                          alt={item.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </Link>

                      {/* Info */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              {item.category && (
                                <span className="text-[10px] text-[#FDCB00] font-semibold uppercase tracking-wide">
                                  {item.category}
                                </span>
                              )}
                              <Link
                                href={`/product/${item.id}`}
                                className="block font-semibold text-gray-900 text-sm sm:text-base truncate hover:text-[#FDCB00] transition-colors"
                              >
                                {item.name}
                              </Link>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    item.inStock === false
                                      ? "bg-red-400"
                                      : "bg-green-500"
                                  }`}
                                />
                                <span
                                  className={`text-xs font-medium ${
                                    item.inStock === false
                                      ? "text-red-500"
                                      : "text-green-600"
                                  }`}
                                >
                                  {item.inStock === false
                                    ? "Out of Stock"
                                    : "In Stock"}
                                </span>
                              </div>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.1, rotate: 90 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => removeItem(item.id)}
                              disabled={isRemoving}
                              className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0 disabled:opacity-50"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>

                        <div className="flex items-end justify-between mt-3 flex-wrap gap-3">
                          {/* Quantity Stepper */}
                          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="px-2.5 py-1.5 hover:bg-gray-50 transition-colors disabled:opacity-40"
                              onClick={() =>
                                updateQuantity(item.id, "decrement")
                              }
                              disabled={item.quantity <= 1 || isUpdating === item.id}
                            >
                              <Minus className="w-3.5 h-3.5 text-gray-600" />
                            </motion.button>
                            <motion.span
                              key={item.quantity}
                              initial={{ scale: 0.5 }}
                              animate={{ scale: 1 }}
                              className="w-9 text-center text-sm font-medium"
                            >
                              {isUpdating === item.id ? (
                                <Loader2 className="w-3 h-3 animate-spin mx-auto" />
                              ) : (
                                item.quantity
                              )}
                            </motion.span>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="px-2.5 py-1.5 hover:bg-gray-50 transition-colors disabled:opacity-40"
                              onClick={() =>
                                updateQuantity(item.id, "increment")
                              }
                              disabled={item.quantity >= 10 || isUpdating === item.id}
                            >
                              <Plus className="w-3.5 h-3.5 text-gray-600" />
                            </motion.button>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <div className="flex items-center gap-2 justify-end">
                              <motion.span
                                key={item.price * item.quantity}
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                className="font-bold text-gray-900 text-base"
                              >
                                ₹{(item.price * item.quantity).toLocaleString()}
                              </motion.span>
                              {item.originalPrice && (
                                <span className="text-xs text-gray-400 line-through">
                                  ₹
                                  {(
                                    item.originalPrice * item.quantity
                                  ).toLocaleString()}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-gray-400">
                              ₹{item.price.toLocaleString()} each
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              {/* Trust strip */}
              <motion.div
                variants={itemVariants}
                className="grid grid-cols-3 gap-3"
              >
                {[
                  { icon: Truck, label: "Free Shipping", sub: "Over ₹999" },
                  {
                    icon: ShieldCheck,
                    label: "Secure Checkout",
                    sub: "100% Protected",
                  },
                  {
                    icon: RotateCcw,
                    label: "Easy Returns",
                    sub: "7 Day Policy",
                  },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{
                      y: -2,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    }}
                    className="flex flex-col items-center text-center gap-1.5 py-4 bg-white rounded-xl border border-gray-100 shadow-sm transition-all"
                  >
                    <item.icon className="w-5 h-5 text-[#FDCB00]" />
                    <span className="text-[11px] text-gray-600 font-medium leading-tight">
                      {item.label}
                      <br />
                      <span className="text-[10px] text-gray-400 font-normal">
                        {item.sub}
                      </span>
                    </span>
                  </motion.div>
                ))}
              </motion.div>

              {/* Recommended Products from API */}
              {!isProductsLoading && recommended.length > 0 && (
                <motion.div
                  variants={recommendedVariants}
                  initial="hidden"
                  animate="visible"
                  className="pt-2"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-[#FDCB00]" />
                    <h3 className="font-bold text-gray-900">
                      You might also like
                    </h3>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
                    {recommended.map((p: any) => (
                      <motion.div
                        key={p.id}
                        variants={recommendedItemVariants}
                        whileHover={{ y: -4 }}
                        className="flex-shrink-0 w-36 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden group"
                      >
                        <Link href={`/product/${p.id}`}>
                          <div className="relative aspect-square bg-gray-50">
                            <Image
                              src={p.primary_image || "/images/placeholder.jpg"}
                              alt={p.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        </Link>
                        <div className="p-2.5">
                          <p className="text-xs font-medium text-gray-700 line-clamp-1">
                            {p.name}
                          </p>
                          <p className="text-sm font-bold text-gray-900 mt-0.5">
                            ₹{parseFloat(p.retail_price || 0).toLocaleString()}
                          </p>
                          {p.category && (
                            <span className="text-[10px] text-[#FDCB00] font-semibold uppercase">
                              {p.category}
                            </span>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              router.push(`/product/${p.id}`);
                            }}
                            className="w-full mt-2 py-1.5 bg-[#FDCB00] hover:bg-[#E5B800] text-gray-900 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            Add
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Right: Order Summary */}
            <motion.div
              variants={summaryVariants}
              className="lg:sticky lg:top-24 space-y-4"
            >
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-[#FDCB00]/10 to-transparent">
                  <h3 className="font-bold text-gray-900">Order Summary</h3>
                </div>

                <div className="p-5 space-y-3">
                  {/* Promo code */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1.5">
                      <Gift className="w-3.5 h-3.5 text-[#FDCB00]" />
                      Promo Code
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => {
                          setPromoCode(e.target.value);
                          setPromoError("");
                        }}
                        placeholder="Try KONNECT10"
                        className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#FDCB00] focus:ring-1 focus:ring-[#FDCB00] focus:bg-white transition-all"
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={applyPromo}
                        disabled={isPromoLoading}
                        className="px-4 py-2 bg-[#FDCB00] text-gray-900 text-sm font-semibold rounded-lg hover:bg-[#E5B800] transition-colors disabled:opacity-50"
                      >
                        {isPromoLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Apply"
                        )}
                      </motion.button>
                    </div>
                    <AnimatePresence>
                      {appliedPromo && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex items-center justify-between mt-2 bg-green-50 border border-green-100 rounded-lg px-3 py-1.5"
                        >
                          <span className="flex items-center gap-1.5 text-xs text-green-700 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />"
                            {appliedPromo.code}" applied — {appliedPromo.pct}%
                            off
                          </span>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              setAppliedPromo(null);
                              setPromoCode("");
                              toast.success("Promo code removed", {
                                duration: 2000,
                                position: 'bottom-center',
                                style: {
                                  background: '#6B7280',
                                  color: '#fff',
                                  borderRadius: '10px',
                                  padding: '12px 20px',
                                },
                                icon: '🔄',
                              });
                            }}
                            className="text-green-500 hover:text-green-700"
                          >
                            <X className="w-3.5 h-3.5" />
                          </motion.button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {promoError && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-red-500 mt-1.5"
                      >
                        {promoError}
                      </motion.p>
                    )}
                  </div>

                  <div className="h-px bg-gray-100 my-3" />

                  {/* Price breakdown */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-500">
                      <span>Subtotal ({itemCount} items)</span>
                      <span className="text-gray-800 font-medium">
                        ₹{subtotal.toLocaleString()}
                      </span>
                    </div>
                    {totalSavingsFromMrp > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount on MRP</span>
                        <span className="font-medium">
                          − ₹{totalSavingsFromMrp.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {appliedPromo && (
                      <div className="flex justify-between text-green-600">
                        <span>Promo ({appliedPromo.code})</span>
                        <span className="font-medium">
                          − ₹{promoDiscount.toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-500">
                      <span className="flex items-center gap-1">
                        Shipping
                        {shipping === 0 && (
                          <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-semibold">
                            FREE
                          </span>
                        )}
                      </span>
                      <span className="text-gray-800 font-medium">
                        {shipping === 0 ? "₹0" : `₹${shipping}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>Estimated Tax</span>
                      <span className="text-gray-800 font-medium">
                        ₹{tax.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="h-px bg-gray-100 my-3" />

                  <motion.div
                    className="flex justify-between items-baseline"
                    key={total}
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-[#FDCB00]">
                      ₹{total.toLocaleString()}
                    </span>
                  </motion.div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (cartItems.length === 0) {
                        toast.error("Your cart is empty", {
                          duration: 2000,
                          position: 'bottom-center',
                          style: {
                            background: '#EF4444',
                            color: '#fff',
                            borderRadius: '10px',
                            padding: '12px 20px',
                          },
                          icon: '🛒',
                        });
                      } else {
                        router.push("/checkout");
                      }
                    }}
                    className="w-full mt-2 py-3.5 bg-[#FDCB00] text-gray-900 rounded-xl font-bold hover:bg-[#E5B800] hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    Proceed to Checkout
                  </motion.button>

                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 pt-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    100% secure payments
                  </div>
                </div>
              </div>

              {/* Payment methods */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4"
              >
                <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-2">
                  <CreditCard className="w-3.5 h-3.5 text-[#FDCB00]" />
                  We Accept
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    "UPI",
                    "Visa",
                    "Mastercard",
                    "RuPay",
                    "Net Banking",
                    "COD",
                  ].map((method) => (
                    <span
                      key={method}
                      className="text-[11px] font-medium text-gray-600 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-md"
                    >
                      {method}
                    </span>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </div>

      <Footer />

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}