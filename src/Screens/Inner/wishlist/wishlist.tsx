"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  ShoppingBag,
  Grid2X2,
  List,
  ArrowRight,
  Package,
  Sparkles,
  RefreshCw,
  ChevronRight,
  Home,
} from "lucide-react";

import Header from "../../../components/common/Header";
import Footer from "@/components/Footer/Footer";
import Loader from "@/components/ui/Spinner/Loader";

import {
  useGetWishlistQuery,
  useRemoveFromWishlistMutation,
} from "@/lib/redux/api/Wishlist/wishlistApi";

import { useAddToCartMutation, useGetCartQuery } from "@/lib/redux/api/cartApi";

import { useAppDispatch } from "@/lib/redux/hooks";
import { showToast } from "../../../lib/slices/toastSlice";

/* ============================================================
   TYPES
============================================================ */

interface WishlistProductImage {
  id: number;
  image: string;
  image_url: string;
  sort_order: number;
  is_primary: boolean;
}

interface WishlistProduct {
  id: number;
  product_code: string;
  name: string;
  slug: string;
  description: string;
  specification: string;

  category_id: number;

  category: {
    id: number;
    name: string | null;
    slug: string;
  };

  tax_category_id: number;

  retail_price: string;
  retail_price_formatted: string;

  distributor_price: string;
  distributor_price_formatted: string;

  stock_quantity: number;
  low_stock_threshold: number;
  stock_status: string;

  is_published: boolean;
  status: string;
  is_wishlisted: boolean;

  images: WishlistProductImage[];

  primary_image: string;
  primary_image_url: string;

  created_at: string;
  updated_at: string;
}

interface WishlistItem {
  id: number;
  product_id: number;
  product: WishlistProduct;
  added_at: string;
}

interface WishlistCardData {
  id: number;
  productId: number;
  slug: string;
  name: string;
  category: string;

  price: number;
  oldPrice: number | null;
  discount: number | null;

  image: string;

  inStock: boolean;
  stockQuantity: number;
  lowStock: boolean;

  addedDate: string;
  addedDateShort: string;

  productCode: string;
}

/* ============================================================
   HELPERS
============================================================ */

const FALLBACK_IMAGE = "/indiekonnect-web/images/placeholder.jpg";

const formatPrice = (value: number) => `₹${value.toLocaleString("en-IN")}`;

const getNumericPrice = (value?: string | null): number => {
  if (!value) return 0;

  const parsed = Number.parseFloat(value);

  return Number.isFinite(parsed) ? parsed : 0;
};

const formatSavedDate = (date: string) => {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Recently";
  }

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatSavedDateShort = (date: string) => {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Recently";
  }

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const transformWishlistItem = (item: WishlistItem): WishlistCardData => {
  const product = item.product;

  const retailPrice = getNumericPrice(product.retail_price);

  const distributorPrice = getNumericPrice(product.distributor_price);

  /*
   * Keep the same price relationship as the existing implementation.
   */
  const hasHigherOriginalPrice = distributorPrice > retailPrice;

  const discount = hasHigherOriginalPrice
    ? Math.round(((distributorPrice - retailPrice) / distributorPrice) * 100)
    : null;

  return {
    id: item.id,

    productId: item.product_id,

    slug: product.slug,

    name: product.name,

    category: product.category?.name || "Collection",

    price: retailPrice,

    oldPrice: hasHigherOriginalPrice ? distributorPrice : null,

    discount: discount && discount > 0 ? discount : null,

    image:
      product.primary_image_url ||
      product.primary_image ||
      product.images?.find((image) => image.is_primary)?.image_url ||
      product.images?.[0]?.image_url ||
      FALLBACK_IMAGE,

    inStock: product.stock_status === "in_stock" && product.stock_quantity > 0,

    stockQuantity: product.stock_quantity ?? 0,

    lowStock:
      product.stock_quantity > 0 &&
      product.stock_quantity <= product.low_stock_threshold,

    addedDate: formatSavedDate(item.added_at),

    addedDateShort: formatSavedDateShort(item.added_at),

    productCode: product.product_code,
  };
};

/* ============================================================
   ANIMATION
============================================================ */

const containerVariants = {
  hidden: {
    opacity: 0,
  },

  visible: {
    opacity: 1,

    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 18,
  },

  visible: {
    opacity: 1,
    y: 0,

    transition: {
      duration: 0.45,
      ease: "easeOut",
    },
  },

  exit: {
    opacity: 0,
    scale: 0.96,
    y: -8,

    transition: {
      duration: 0.22,
    },
  },
};

/* ============================================================
   PAGE
============================================================ */

export default function WishlistPage() {
  const dispatch = useAppDispatch();

  const {
    data: wishlistData,
    isLoading: isWishlistLoading,
    error: wishlistError,
    refetch: refetchWishlist,
  } = useGetWishlistQuery();

  const { refetch: refetchCart } = useGetCartQuery();

  const [removeFromWishlist, { isLoading: isRemovingFromWishlist }] =
    useRemoveFromWishlistMutation();

  const [addToCart] = useAddToCartMutation();

  const [wishlistItems, setWishlistItems] = useState<WishlistCardData[]>([]);

  const [activeFilter, setActiveFilter] = useState<
    "all" | "stock" | "price-drop"
  >("all");

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [removingId, setRemovingId] = useState<number | null>(null);

  const [addingToCartId, setAddingToCartId] = useState<number | null>(null);

  const [isAddingAll, setIsAddingAll] = useState(false);

  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const [isInitialLoad, setIsInitialLoad] = useState(true);

  /* ============================================================
         SYNC API DATA
      ============================================================ */

  useEffect(() => {
    if (wishlistData && Array.isArray(wishlistData?.data)) {
      const transformed = wishlistData.data.map((item: WishlistItem) =>
        transformWishlistItem(item),
      );

      setWishlistItems(transformed);
      setIsInitialLoad(false);
    }
  }, [wishlistData]);

  /* ============================================================
         FILTERED ITEMS
      ============================================================ */

  const filteredItems = useMemo(() => {
    if (activeFilter === "stock") {
      return wishlistItems.filter((item) => item.inStock);
    }

    if (activeFilter === "price-drop") {
      return wishlistItems.filter((item) => item.discount);
    }

    return wishlistItems;
  }, [activeFilter, wishlistItems]);

  /* ============================================================
         STATS
      ============================================================ */

  const totalSaved = wishlistItems.length;

  const inStockCount = wishlistItems.filter((item) => item.inStock).length;

  const priceDropCount = wishlistItems.filter((item) => item.discount).length;

  /* ============================================================
         REMOVE WISHLIST
      ============================================================ */

  const handleRemove = async (item: WishlistCardData) => {
    if (removingId === item.productId) {
      return;
    }

    setRemovingId(item.productId);

    try {
      await removeFromWishlist({
        product_id: item.productId,
      }).unwrap();

      setWishlistItems((previous) =>
        previous.filter(
          (wishlistItem) => wishlistItem.productId !== item.productId,
        ),
      );

      dispatch(
        showToast({
          message: "Item removed from wishlist",
          type: "success",
        }),
      );

      await refetchWishlist();
    } catch (error: any) {
      console.error("Wishlist remove error:", error);

      dispatch(
        showToast({
          message: error?.data?.message || "Failed to remove item",
          type: "error",
        }),
      );
    } finally {
      setRemovingId(null);
    }
  };

  /* ============================================================
         ADD TO CART
      ============================================================ */

  const handleAddToCart = async (item: WishlistCardData) => {
    if (!item.inStock || addingToCartId === item.productId) {
      return;
    }

    setAddingToCartId(item.productId);

    try {
      await addToCart({
        product_id: item.productId,
        quantity: 1,
        from_wishlist: true,
      }).unwrap();

      await refetchCart();

      setWishlistItems((previous) =>
        previous.filter(
          (wishlistItem) => wishlistItem.productId !== item.productId,
        ),
      );

      await refetchWishlist();

      dispatch(
        showToast({
          message: `${item.name} added to cart`,
          type: "success",
        }),
      );
    } catch (error: any) {
      console.error("Add to cart error:", error);

      dispatch(
        showToast({
          message: error?.data?.message || "Failed to add item to cart",
          type: "error",
        }),
      );
    } finally {
      setAddingToCartId(null);
    }
  };

  /* ============================================================
         ADD ALL TO CART
      ============================================================ */

  const handleAddAllToCart = async () => {
    const availableItems = wishlistItems.filter((item) => item.inStock);

    if (availableItems.length === 0) {
      dispatch(
        showToast({
          message: "No in-stock wishlist items available",
          type: "error",
        }),
      );

      return;
    }

    setIsAddingAll(true);

    try {
      const results = await Promise.allSettled(
        availableItems.map((item) =>
          addToCart({
            product_id: item.productId,
            quantity: 1,
            from_wishlist: true,
          }).unwrap(),
        ),
      );

      const successIds = availableItems
        .filter((_, index) => results[index].status === "fulfilled")
        .map((item) => item.productId);

      if (successIds.length) {
        setWishlistItems((previous) =>
          previous.filter((item) => !successIds.includes(item.productId)),
        );
      }

      await refetchCart();
      await refetchWishlist();

      dispatch(
        showToast({
          message:
            successIds.length === availableItems.length
              ? "All available items added to cart"
              : `${successIds.length} items added to cart`,
          type: "success",
        }),
      );
    } catch (error: any) {
      console.error("Add all cart error:", error);

      dispatch(
        showToast({
          message: "Unable to add wishlist items",
          type: "error",
        }),
      );
    } finally {
      setIsAddingAll(false);
    }
  };

  /* ============================================================
         LOADING
      ============================================================ */

  if (isWishlistLoading && isInitialLoad) {
    return (
      <div className="min-h-screen bg-[#f7f8fa]">
        <Header />

        <div className="flex min-h-[70vh] items-center justify-center">
          <Loader width={180} height={180} />
        </div>

        <Footer />
      </div>
    );
  }

  /* ============================================================
         ERROR
      ============================================================ */

  if (wishlistError) {
    return (
      <div className="min-h-screen bg-[#f7f8fa]">
        <Header />

        <div className="flex min-h-[65vh] items-center justify-center px-5">
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="
              w-full
              max-w-md
              rounded-[28px]
              border
              border-slate-200
              bg-white
              p-9
              text-center
              shadow-[0_20px_60px_rgba(24,38,35,0.08)]
            "
          >
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#f6ebe8]">
              <Heart size={26} className="text-[#b85f51]" />
            </div>

            <h2 className="font-serif text-3xl text-[#171b32]">
              We couldn&apos;t load your wishlist
            </h2>

            <p className="mt-3 text-base leading-6 text-[#7f8885]">
              Something went wrong while loading your saved products.
            </p>

            <button
              onClick={() => refetchWishlist()}
              className="
                mt-7
                inline-flex
                items-center
                gap-2
                rounded-full
                bg-[#171b32]
                px-7
                py-3.5
                text-sm
                font-semibold
                tracking-[0.08em]
                text-white
                transition
                hover:bg-slate-800
              "
            >
              <RefreshCw size={16} />
              Try again
            </button>
          </motion.div>
        </div>

        <Footer />
      </div>
    );
  }

  /* ============================================================
         EMPTY
      ============================================================ */

  if (!wishlistItems.length) {
    return (
      <div className="min-h-screen bg-[#f7f8fa]">
        <Header />

        <EmptyWishlist />

        <Footer />
      </div>
    );
  }

  /* ============================================================
         MAIN UI
      ============================================================ */

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#111827]">
      <Header />
      {/* ======================================================
    BREADCRUMBS
====================================================== */}

      <nav
      style={{paddingLeft:'16%',backgroundColor:'#ffff'}}
        className="mx-auto w-full px-5 pt-6 sm:px-8 lg"
        aria-label="Breadcrumb"
      >
        <motion.ol
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-wrap items-center gap-1.5 text-sm"
        >
          <li>
            <span className="font-medium text-slate-900">IndieConnect</span>
          </li>

          <ChevronRight size={14} className="shrink-0 text-slate-400" />

          <li>
            <Link
              href="/products"
              className="text-slate-500 transition-colors hover:text-slate-900"
            >
              Premium Jewelry
            </Link>
          </li>

          <ChevronRight size={14} className="shrink-0 text-slate-400" />

          <li>
            <Link
              href="/products"
              className="text-slate-500 transition-colors hover:text-slate-900"
            >
              Stunning Platinum Pendant
            </Link>
          </li>

          <ChevronRight size={14} className="shrink-0 text-slate-400" />

          <li>
            <span className="font-medium text-slate-900">Wishlist</span>
          </li>
        </motion.ol>
      </nav>

      {/* ======================================================
          PREMIUM HERO
      ====================================================== */}

      <section className="relative overflow-hidden border-b border-slate-200/70 bg-white">
        <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-slate-100 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-white blur-3xl" />

        <div className="mx-auto max-w-[1400px] px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <motion.div
              initial={{
                opacity: 0,
                y: 18,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.6,
              }}
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
                  <Heart size={19} fill="#b96253" color="#b96253" />
                </div>

                <div>
                  <p className="text-[10px] font-bold tracking-[0.24em] text-slate-400">
                    YOUR CURATED COLLECTION
                  </p>

                  <p className="mt-1 text-xs text-slate-400">Saved with care</p>
                </div>
              </div>

              <h1 className="max-w-2xl font-serif text-4xl leading-[1.05] tracking-[-0.04em] text-slate-900 sm:text-5xl lg:text-[56px]">
                My Wishlist
              </h1>

              <p className="mt-3 max-w-[560px] text-sm leading-6 text-slate-500 sm:text-base">
                The pieces you love, kept beautifully in one place. Return
                whenever you&apos;re ready.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href="/products"
                  className="
                    group
                    inline-flex
                    items-center
                    gap-2.5
                    rounded-full
                    bg-slate-900
                    px-7
                    py-3.5
                    text-sm
                    font-semibold
                    tracking-[0.04em]
                    text-white
                    shadow-[0_12px_24px_rgba(15,23,42,0.12)]
                    transition
                    hover:bg-slate-800
                  "
                >
                  Continue Shopping
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>

                <div className="rounded-full border border-slate-200 bg-white px-5 py-3.5 text-sm font-medium text-slate-500 shadow-[0_8px_22px_rgba(15,23,42,0.04)]">
                  {totalSaved} {totalSaved === 1 ? "item" : "items"} saved
                </div>
              </div>
            </motion.div>

            {/* Stats */}

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.96,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{
                duration: 0.55,
                delay: 0.1,
              }}
              className="
                grid
                w-full
                max-w-[420px]
                grid-cols-3
                overflow-hidden
                rounded-[22px]
                border
                border-slate-200/80
                bg-white
                shadow-[0_18px_42px_rgba(15,23,42,0.07)]
              "
            >
              <PremiumStat value={totalSaved} label="SAVED" />

              <PremiumStat value={inStockCount} label="IN STOCK" border />

              <PremiumStat value={priceDropCount} label="PRICE DROPS" border />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <main className="mx-auto max-w-[1400px] px-5 py-8 sm:px-7 lg:px-10 lg:py-10">
        {/* Toolbar */}

        <motion.div
          initial={{
            opacity: 0,
            y: 12,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <div className="flex items-center gap-3">
              <h2 className="font-serif text-2xl text-slate-900 sm:text-[28px]">
                Saved for later
              </h2>

              <span className="rounded-full bg-slate-100 px-3.5 py-1.5 text-xs font-bold text-slate-600">
                {filteredItems.length}
              </span>
            </div>

            <p className="mt-1.5 text-sm text-slate-400">
              Everything you&apos;ve chosen to keep close.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filters */}

            <div className="flex items-center rounded-full border border-slate-200 bg-white p-1 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
              <FilterButton
                active={activeFilter === "all"}
                onClick={() => setActiveFilter("all")}
              >
                All
              </FilterButton>

              <FilterButton
                active={activeFilter === "stock"}
                onClick={() => setActiveFilter("stock")}
              >
                In stock
              </FilterButton>

              <FilterButton
                active={activeFilter === "price-drop"}
                onClick={() => setActiveFilter("price-drop")}
              >
                Price drop
              </FilterButton>
            </div>

            {/* View */}

            <div className="flex items-center rounded-full border border-slate-200 bg-white p-1 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
              <ViewButton
                active={viewMode === "grid"}
                onClick={() => setViewMode("grid")}
              >
                <Grid2X2 size={16} />
              </ViewButton>

              <ViewButton
                active={viewMode === "list"}
                onClick={() => setViewMode("list")}
              >
                <List size={17} />
              </ViewButton>
            </div>

            {/* Add all */}

            <button
              onClick={handleAddAllToCart}
              disabled={isAddingAll || inStockCount === 0}
              className="
                group
                inline-flex
                h-[46px]
                items-center
                gap-2.5
                rounded-full
                bg-[#171b32]
                px-6
                text-sm
                font-semibold
                tracking-[0.05em]
                text-white
                shadow-[0_12px_24px_rgba(23,27,50,0.14)]
                transition
                hover:bg-slate-800
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              {isAddingAll ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Adding
                </>
              ) : (
                <>
                  <ShoppingBag size={16} />
                  Add all to cart
                </>
              )}
            </button>
          </div>
        </motion.div>

        <div className="mb-7 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

        {/* ======================================================
            PRODUCT GRID
        ====================================================== */}

        <AnimatePresence mode="popLayout">
          {filteredItems.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "flex flex-col gap-4"
              }
            >
              {filteredItems.map((item) => (
                <PremiumProductCard
                  key={item.productId}
                  item={item}
                  viewMode={viewMode}
                  hoveredId={hoveredId}
                  removingId={removingId}
                  addingToCartId={addingToCartId}
                  isRemoving={isRemovingFromWishlist}
                  onHover={setHoveredId}
                  onRemove={handleRemove}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </motion.div>
          ) : (
            <FilteredEmpty
              filter={activeFilter}
              onReset={() => setActiveFilter("all")}
            />
          )}
        </AnimatePresence>

        {/* Bottom editorial */}

        {filteredItems.length > 0 && (
          <motion.section
            initial={{
              opacity: 0,
              y: 18,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: 0.55,
            }}
            className="
              relative
              mt-12
              overflow-hidden
              rounded-[24px]
              border
              border-slate-200/80
              bg-white
              shadow-[0_12px_30px_rgba(15,23,42,0.05)]
            "
          >
            <div className="absolute -right-10 -top-16 h-44 w-44 rounded-full bg-slate-100 blur-3xl" />

            <div className="relative grid gap-6 px-7 py-9 sm:px-10 lg:grid-cols-[1fr_auto] lg:items-center lg:px-12 lg:py-10">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-[0_8px_18px_rgba(15,23,42,0.06)]">
                  <Sparkles size={20} className="text-slate-600" />
                </div>

                <div>
                  <p className="text-xs font-bold tracking-[0.18em] text-slate-600">
                    YOUR COLLECTION
                  </p>

                  <h3 className="mt-1.5 font-serif text-2xl text-[#171b32]">
                    Keep what inspires you close.
                  </h3>

                  <p className="mt-2 max-w-[560px] text-sm leading-6 text-[#7e8985]">
                    Items added to your wishlist stay here until you&apos;re
                    ready to bring them home.
                  </p>
                </div>
              </div>

              <Link
                href="/products"
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-full
                  border
                  border-slate-200
                  bg-white
                  px-6
                  py-3.5
                  text-sm
                  font-semibold
                  text-slate-900
                  shadow-[0_10px_22px_rgba(30,50,46,0.08)]
                  transition
                  hover:bg-[#171b32]
                  hover:text-white
                "
              >
                Discover more
                <ArrowRight size={16} />
              </Link>
            </div>
          </motion.section>
        )}
      </main>

      <Footer />
    </div>
  );
}

/* ============================================================
   PREMIUM STAT
============================================================ */

function PremiumStat({
  value,
  label,
  border = false,
}: {
  value: number;
  label: string;
  border?: boolean;
}) {
  return (
    <div
      className={`
        flex
        min-h-[118px]
        flex-col
        items-center
        justify-center
        px-4
        ${border ? "border-l border-[#edf0ee]" : ""}
      `}
    >
      <span className="font-serif text-4xl tracking-[-0.03em] text-[#171b32]">
        {value}
      </span>

      <span className="mt-2.5 text-[10px] font-bold tracking-[0.16em] text-[#a0a8a5]">
        {label}
      </span>
    </div>
  );
}

/* ============================================================
   FILTER BUTTON
============================================================ */

function FilterButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        h-9
        rounded-full
        px-5
        text-xs
        font-semibold
        transition-all
        ${active
          ? "bg-slate-900 text-white shadow-[0_6px_14px_rgba(15,23,42,0.12)]"
          : "text-[#8b9591] hover:text-[#171b32]"
        }
      `}
    >
      {children}
    </button>
  );
}

/* ============================================================
   VIEW BUTTON
============================================================ */

function ViewButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex
        h-9
        w-10
        items-center
        justify-center
        rounded-full
        transition
        ${active
          ? "bg-slate-900 text-white"
          : "text-[#9ca5a2] hover:text-[#171b32]"
        }
      `}
    >
      {children}
    </button>
  );
}

/* ============================================================
   PRODUCT CARD - COMPACT
============================================================ */

function PremiumProductCard({
  item,
  viewMode,
  hoveredId,
  removingId,
  addingToCartId,
  isRemoving,
  onHover,
  onRemove,
  onAddToCart,
}: {
  item: WishlistCardData;
  viewMode: "grid" | "list";
  hoveredId: number | null;
  removingId: number | null;
  addingToCartId: number | null;
  isRemoving: boolean;
  onHover: (id: number | null) => void;
  onRemove: (item: WishlistCardData) => void;
  onAddToCart: (item: WishlistCardData) => void;
}) {
  const isAdding = addingToCartId === item.productId;
  const isRemovingThis = removingId === item.productId;

  /* ==========================================================
         LIST CARD - COMPACT
      ========================================================== */

  if (viewMode === "list") {
    return (
      <motion.article
        variants={cardVariants}
        layout
        onMouseEnter={() => onHover(item.productId)}
        onMouseLeave={() => onHover(null)}
        className="
          group
          relative
          overflow-hidden
          rounded-[16px]
          border
          border-slate-200/80
          bg-white
          shadow-[0_4px_16px_rgba(15,23,42,0.05)]
          transition-shadow
          duration-300
          hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)]
        "
      >
        <div className="flex flex-col sm:flex-row">
          {/* List image - Compact */}
          <div
            className="
              relative
              h-[180px]
              w-full
              shrink-0
              overflow-hidden
              bg-[#f7f8fa]
              sm:h-[200px]
              sm:w-[200px]
            "
          >
            <ProductImageCompact
              item={item}
              hovered={hoveredId === item.productId}
            />
            <ProductBadgeCompact item={item} />
            <RemoveButtonCompact
              onClick={() => onRemove(item)}
              loading={isRemovingThis}
            />
          </div>

          {/* List details - Compact */}
          <div className="flex flex-1 flex-col justify-between p-4 lg:p-5">
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                  {item.category}
                </span>
                <span className="text-[10px] text-[#a3aaa8]">
                  Saved {item.addedDate}
                </span>
              </div>

              <Link href={`/product/${item.slug}`}>
                <h3 className="font-serif text-[18px] leading-tight text-slate-900 transition group-hover:text-slate-700 line-clamp-1">
                  {item.name}
                </h3>
              </Link>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="text-lg font-semibold tracking-[-0.02em] text-slate-900">
                  {formatPrice(item.price)}
                </span>

                {item.oldPrice && (
                  <span className="text-sm text-[#a3aaa8] line-through">
                    {formatPrice(item.oldPrice)}
                  </span>
                )}

                {item.discount && (
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                    Save {item.discount}%
                  </span>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                <StatusPillCompact inStock={item.inStock} />
                {item.lowStock && item.inStock && (
                  <span className="rounded-full bg-[#fbf1e4] px-2.5 py-1 text-[10px] font-semibold text-[#a76d28]">
                    Only {item.stockQuantity} left
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                onClick={() => onAddToCart(item)}
                disabled={!item.inStock || isAdding}
                className="
                  inline-flex
                  h-9
                  items-center
                  justify-center
                  gap-2
                  rounded-full
                  bg-[#171b32]
                  px-5
                  text-xs
                  font-semibold
                  text-white
                  transition
                  hover:bg-slate-800
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                {isAdding ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Adding
                  </>
                ) : (
                  <>
                    <ShoppingBag size={14} />
                    {item.inStock ? "Add to cart" : "Out of stock"}
                  </>
                )}
              </button>

              <Link
                href={`/product/${item.slug}`}
                className="
                  inline-flex
                  h-9
                  items-center
                  gap-1.5
                  rounded-full
                  border
                  border-slate-200
                  bg-white
                  px-4
                  text-xs
                  font-semibold
                  text-[#171b32]
                  transition
                  hover:border-slate-400
                "
              >
                View
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </motion.article>
    );
  }

  /* ==========================================================
         GRID CARD - COMPACT
      ========================================================== */

  return (
    <motion.article
      variants={cardVariants}
      layout
      onMouseEnter={() => onHover(item.productId)}
      onMouseLeave={() => onHover(null)}
      className={`
        group
        relative
        flex
        h-full
        min-h-[380px]
        flex-col
        overflow-hidden
        rounded-[16px]
        border
        border-slate-200/80
        bg-white
        transition-all
        duration-300
        ${hoveredId === item.productId
          ? " -translate-y-0.5 shadow-[0_12px_32px_rgba(25,45,41,0.10)]"
          : "shadow-[0_4px_16px_rgba(25,45,41,0.04)]"
        }
      `}
    >
      {/* ======================================================
          IMAGE AREA - Compact
      ====================================================== */}

      <div
        className="
          relative
          h-[220px]
          shrink-0
          overflow-hidden
          bg-gradient-to-br
          from-[#f8f9fa]
          via-white
          to-[#f1f3f5]
        "
      >
        <ProductImageCompact
          item={item}
          hovered={hoveredId === item.productId}
        />

        <ProductBadgeCompact item={item} />

        <RemoveButtonCompact
          onClick={() => onRemove(item)}
          loading={isRemovingThis}
        />

        {/* Hover detail button */}
        <AnimatePresence>
          {hoveredId === item.productId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="
                pointer-events-none
                absolute
                inset-0
                z-[4]
                flex
                items-end
                justify-center
                bg-gradient-to-t
                from-slate-900/10
                via-transparent
                to-transparent
                pb-3
              "
            >
              <motion.div
                initial={{ y: 6, opacity: 0, scale: 0.96 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 6, opacity: 0, scale: 0.96 }}
              >
                <Link
                  href={`/product/${item.slug}`}
                  className="
                    pointer-events-auto
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-full
                    border
                    border-white/80
                    bg-white/95
                    px-3.5
                    py-1.5
                    text-[9px]
                    font-bold
                    tracking-[0.12em]
                    text-slate-900
                    shadow-[0_8px_18px_rgba(15,23,42,0.10)]
                    backdrop-blur-md
                  "
                >
                  VIEW DETAILS
                  <ArrowRight size={11} />
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Out of stock */}
        {!item.inStock && (
          <div className="absolute inset-0 z-[5] flex items-center justify-center bg-slate-900/20">
            <div className="rounded-full border border-white/60 bg-white/95 px-4 py-1.5 text-[9px] font-bold tracking-[0.14em] text-slate-700 shadow-lg">
              OUT OF STOCK
            </div>
          </div>
        )}
      </div>

      {/* ======================================================
          DETAILS - Compact
      ====================================================== */}

      <div className="flex min-h-0 flex-1 flex-col p-3.5">
        {/* Category/date */}
        <div className="flex items-center justify-between gap-2">
          <span className="min-w-0 truncate text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">
            {item.category}
          </span>
          <span className="shrink-0 text-[10px] text-[#a3aaa8]">
            {item.addedDateShort}
          </span>
        </div>

        {/* Name */}
        <Link href={`/product/${item.slug}`} className="mt-1.5">
          <h3
            className="
              line-clamp-1
              min-h-[24px]
              font-serif
              text-[15px]
              font-medium
              leading-[1.3]
              tracking-[-0.01em]
              text-slate-900
              transition-colors
              group-hover:text-slate-700
            "
          >
            {item.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="mt-2 flex min-h-[26px] items-center gap-2">
          <span className="text-[17px] font-semibold tracking-[-0.02em] text-slate-900">
            {formatPrice(item.price)}
          </span>

          {item.oldPrice && (
            <span className="text-xs text-[#a4aaa7] line-through">
              {formatPrice(item.oldPrice)}
            </span>
          )}
        </div>

        {/* Discount */}
        <div className="mt-1 min-h-[18px]">
          {item.discount ? (
            <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-[9px] font-bold tracking-[0.05em] text-slate-600">
              {item.discount}% SAVING
            </span>
          ) : null}
        </div>

        {/* Meta */}
        <div className="mt-2 border-t border-slate-100 pt-2">
          <div className="flex items-center justify-between gap-2">
            <StatusPillCompact inStock={item.inStock} />
            <span className="truncate text-[10px] text-[#a1aaa7]">
              {item.inStock
                ? item.stockQuantity > 0 && item.lowStock
                  ? `Only ${item.stockQuantity} left`
                  : "Ready to ship"
                : "Unavailable"}
            </span>
          </div>
        </div>

        {/* Action */}
        <div className="mt-auto pt-3">
          <div className="flex gap-1.5">
            <button
              onClick={() => onAddToCart(item)}
              disabled={!item.inStock || isAdding}
              className="
                flex
                h-9
                flex-1
                items-center
                justify-center
                gap-1.5
                rounded-full
                bg-[#171b32]
                text-[9px]
                font-bold
                tracking-[0.08em]
                text-white
                transition
                hover:bg-slate-800
                disabled:cursor-not-allowed
                disabled:opacity-35
              "
            >
              {isAdding ? (
                <>
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ADDING
                </>
              ) : (
                <>
                  <ShoppingBag size={12} />
                  {item.inStock ? "ADD TO CART" : "UNAVAILABLE"}
                </>
              )}
            </button>

            <Link
              href={`/product/${item.slug}`}
              aria-label="View product"
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-full
                border
                border-slate-200
                bg-white
                text-[#171b32]
                transition
                hover:border-slate-400
              "
            >
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

/* ============================================================
   COMPACT PRODUCT IMAGE
============================================================ */

function ProductImageCompact({
  item,
  hovered,
}: {
  item: WishlistCardData;
  hovered: boolean;
}) {
  return (
    <motion.div
      animate={{
        scale: hovered ? 1.03 : 1,
      }}
      transition={{
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="
        absolute
        inset-0
        flex
        items-center
        justify-center
        p-4
      "
    >
      <div className="relative h-full w-full">
        <Image
          src={item.image || FALLBACK_IMAGE}
          alt={item.name}
          fill
          sizes="
            (max-width: 640px) 100vw,
            (max-width: 1024px) 50vw,
            (max-width: 1280px) 33vw,
            25vw
          "
          className="
            object-contain
            object-center
            p-1
            drop-shadow-[0_12px_20px_rgba(15,23,42,0.10)]
          "
          onError={(event) => {
            const target = event.currentTarget;
            if (target.src.includes(FALLBACK_IMAGE)) return;
            target.src = FALLBACK_IMAGE;
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-slate-900/[0.02]" />
      </div>
    </motion.div>
  );
}

/* ============================================================
   COMPACT PRODUCT BADGE
============================================================ */

function ProductBadgeCompact({ item }: { item: WishlistCardData }) {
  if (!item.discount) return null;

  return (
    <div className="absolute left-3 top-3 z-[6]">
      <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[9px] font-bold tracking-[0.05em] text-white shadow-[0_6px_14px_rgba(15,23,42,0.12)]">
        {item.discount}% OFF
      </span>
    </div>
  );
}

/* ============================================================
   COMPACT REMOVE BUTTON
============================================================ */

function RemoveButtonCompact({
  onClick,
  loading,
}: {
  onClick: () => void;
  loading: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      aria-label="Remove wishlist item"
      className="
        absolute
        right-3
        top-3
        z-[10]
        flex
        h-8
        w-8
        items-center
        justify-center
        rounded-full
        border
        border-slate-200
        bg-white/95
        shadow-[0_6px_14px_rgba(15,23,42,0.08)]
        backdrop-blur-md
        transition
        hover:bg-slate-50
      "
    >
      {loading ? (
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#c16a5c] border-t-transparent" />
      ) : (
        <Heart size={13} fill="#c16a5c" color="#c16a5c" strokeWidth={1.7} />
      )}
    </button>
  );
}

/* ============================================================
   COMPACT STATUS PILL
============================================================ */

function StatusPillCompact({ inStock }: { inStock: boolean }) {
  return (
    <span
      className={`
        inline-flex
        shrink-0
        items-center
        gap-1
        rounded-full
        px-2.5
        py-0.5
        text-[9px]
        font-semibold
        ${inStock
          ? "bg-slate-100 text-slate-700"
          : "bg-slate-100 text-slate-400"
        }
      `}
    >
      <span
        className={`
          h-1
          w-1
          rounded-full
          ${inStock ? "bg-slate-700" : "bg-slate-400"}
        `}
      />
      {inStock ? "In stock" : "Out of stock"}
    </span>
  );
}

/* ============================================================
   FILTER EMPTY
============================================================ */

function FilteredEmpty({
  filter,
  onReset,
}: {
  filter: "all" | "stock" | "price-drop";

  onReset: () => void;
}) {
  const message =
    filter === "stock" ? "No in-stock saved items" : "No price-drop items";

  const description =
    filter === "stock"
      ? "There are currently no available products in your wishlist."
      : "We'll show your discounted wishlist products here.";

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="
        rounded-[28px]
        border
        border-dashed
        border-[#d8e0dc]
        bg-white
        px-6
        py-24
        text-center
      "
    >
      <div className="mx-auto mb-6 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-slate-100">
        <Package size={26} strokeWidth={1.4} className="text-slate-600" />
      </div>

      <h3 className="font-serif text-3xl text-[#171b32]">{message}</h3>

      <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#909996]">
        {description}
      </p>

      <button
        onClick={onReset}
        className="
          mt-7
          rounded-full
          bg-[#171b32]
          px-7
          py-3.5
          text-sm
          font-semibold
          text-white
          transition
          hover:bg-slate-800
        "
      >
        View all saved items
      </button>
    </motion.div>
  );
}

/* ============================================================
   EMPTY WISHLIST
============================================================ */

function EmptyWishlist() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto flex min-h-[68vh] max-w-[900px] items-center justify-center px-5 py-16">
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="
            relative
            w-full
            overflow-hidden
            rounded-[28px]
            border
            border-slate-200
            bg-white
            px-7
            py-16
            text-center
            shadow-[0_24px_70px_rgba(28,45,42,0.08)]
            sm:px-12
          "
        >
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-slate-50 blur-3xl" />

          <div className="absolute -bottom-24 -left-20 h-60 w-60 rounded-full bg-slate-50 blur-3xl" />

          <div className="relative">
            <div className="mx-auto mb-7 flex h-24 w-24 items-center justify-center rounded-full bg-slate-100">
              <Heart size={36} strokeWidth={1.2} className="text-slate-600" />
            </div>

            <p className="text-xs font-bold tracking-[0.24em] text-slate-600">
              YOUR COLLECTION
            </p>

            <h2 className="mt-4 font-serif text-4xl text-[#171b32] sm:text-5xl">
              Nothing saved yet
            </h2>

            <p className="mx-auto mt-5 max-w-md text-base leading-7 text-[#8c9693]">
              When something catches your eye, save it here. Your favorites will
              always be waiting for you.
            </p>

            <Link
              href="/products"
              className="
                mt-8
                inline-flex
                items-center
                gap-2.5
                rounded-full
                bg-[#171b32]
                px-8
                py-4
                text-sm
                font-semibold
                tracking-[0.05em]
                text-white
                shadow-[0_14px_30px_rgba(23,27,50,0.16)]
                transition
                hover:bg-slate-800
              "
            >
              Explore Collection
              <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}