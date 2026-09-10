"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  X,
  ShoppingCart,
  Package,
  RefreshCw,
  ChevronRight,
  Home,
  Loader2,
  Heart,
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

  price: number;
  oldPrice: number | null;
  discount: number | null;

  image: string;

  inStock: boolean;
  stockQuantity: number;

  productCode: string;
}

/* ============================================================
   HELPERS
============================================================ */

const FALLBACK_IMAGE = "/indiekonnect-web/images/placeholder.jpg";

const formatPrice = (value: number): string =>
  `₹${value.toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;

const getNumericPrice = (value?: string | null): number => {
  if (!value) return 0;

  const parsed = Number.parseFloat(value);

  return Number.isFinite(parsed) ? parsed : 0;
};

const transformWishlistItem = (
  item: WishlistItem,
): WishlistCardData => {
  const product = item.product;

  const retailPrice = getNumericPrice(product.retail_price);
  const distributorPrice = getNumericPrice(product.distributor_price);

  const hasHigherOriginalPrice = distributorPrice > retailPrice;

  const discount = hasHigherOriginalPrice
    ? Math.round(
        ((distributorPrice - retailPrice) / distributorPrice) * 100,
      )
    : null;

  return {
    id: item.id,
    productId: item.product_id,
    slug: product.slug,
    name: product.name,

    price: retailPrice,
    oldPrice: hasHigherOriginalPrice ? distributorPrice : null,
    discount: discount && discount > 0 ? discount : null,

    image:
      product.primary_image_url ||
      product.primary_image ||
      product.images?.find((image) => image.is_primary)?.image_url ||
      product.images?.[0]?.image_url ||
      FALLBACK_IMAGE,

    inStock:
      product.stock_status === "in_stock" &&
      product.stock_quantity > 0,

    stockQuantity: product.stock_quantity ?? 0,

    productCode: product.product_code,
  };
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

  const [removeFromWishlist] =
    useRemoveFromWishlistMutation();

  const [addToCart] = useAddToCartMutation();

  const [wishlistItems, setWishlistItems] = useState<
    WishlistCardData[]
  >([]);

  const [removingId, setRemovingId] =
    useState<number | null>(null);

  const [addingToCartId, setAddingToCartId] =
    useState<number | null>(null);

  const [isInitialLoad, setIsInitialLoad] =
    useState(true);

  /* ==========================================================
     SYNC API DATA
  ========================================================== */

  useEffect(() => {
    if (
      wishlistData &&
      Array.isArray(wishlistData?.data)
    ) {
      const transformed = wishlistData.data.map(
        (item: WishlistItem) =>
          transformWishlistItem(item),
      );

      setWishlistItems(transformed);
      setIsInitialLoad(false);
    }
  }, [wishlistData]);

  const totalItems = wishlistItems.length;

  /* ==========================================================
     REMOVE WISHLIST
  ========================================================== */

  const handleRemove = async (
    item: WishlistCardData,
  ) => {
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
          (wishlistItem) =>
            wishlistItem.productId !== item.productId,
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
      console.error(
        "Wishlist remove error:",
        error,
      );

      dispatch(
        showToast({
          message:
            error?.data?.message ||
            "Failed to remove item",
          type: "error",
        }),
      );
    } finally {
      setRemovingId(null);
    }
  };

  /* ==========================================================
     ADD TO CART
  ========================================================== */

  const handleAddToCart = async (
    item: WishlistCardData,
  ) => {
    if (
      !item.inStock ||
      addingToCartId === item.productId
    ) {
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
          (wishlistItem) =>
            wishlistItem.productId !== item.productId,
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
      console.error(
        "Add to cart error:",
        error,
      );

      dispatch(
        showToast({
          message:
            error?.data?.message ||
            "Failed to add item to cart",
          type: "error",
        }),
      );
    } finally {
      setAddingToCartId(null);
    }
  };

  /* ==========================================================
     LOADING
  ========================================================== */

  if (isWishlistLoading && isInitialLoad) {
    return (
      <div className="min-h-screen bg-[#F7F7F6] font-sans">
        <Header />

        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader width={140} height={140} />
        </div>

        <Footer />
      </div>
    );
  }

  /* ==========================================================
     ERROR
  ========================================================== */

  if (wishlistError) {
    return (
      <div className="min-h-screen bg-[#F7F7F6] font-sans">
        <Header />

        <div className="flex min-h-[55vh] items-center justify-center px-4">
          <div className="w-full max-w-[420px] rounded-[12px] border border-[#E6E3DE] bg-white p-8 text-center shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#F4F2EE]">
              <Heart className="h-5 w-5 text-[#55504A]" />
            </div>

            <h2 className="text-[16px] font-semibold text-[#181818]">
              We couldn&apos;t load your wishlist
            </h2>

            <p className="mx-auto mt-2 max-w-[300px] text-[12px] leading-5 text-[#888888]">
              Something went wrong while loading your
              saved products.
            </p>

            <button
              onClick={() => refetchWishlist()}
              className="mt-5 inline-flex h-[40px] items-center justify-center gap-2 rounded-[7px] bg-[#111111] px-5 text-[11px] font-semibold text-white transition-all duration-200 hover:bg-[#2A2A2A] active:scale-[0.98]"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Try again
            </button>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  /* ==========================================================
     MAIN UI
  ========================================================== */

  return (
    <div className="min-h-screen bg-[#F7F7F6] font-sans">
      <Header />

      <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 lg:px-8 xl:py-9">
        {/* =====================================================
            BREADCRUMB
        ===================================================== */}

        <nav
          aria-label="Breadcrumb"
          className="mb-5 flex items-center gap-1.5 text-[11px] font-medium"
        >
          <Link
            href="/"
            className="flex items-center gap-1 text-[#858585] transition-colors hover:text-[#111111]"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Home</span>
          </Link>

          <ChevronRight className="h-3 w-3 text-[#B7B5B1]" />

          <span className="text-[#171717]">
            Wishlist
          </span>
        </nav>

        {/* =====================================================
            PAGE HEADER
        ===================================================== */}

        <div className="mb-7 flex items-end justify-between gap-4 border-b border-[#E4E1DC] pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EEECE8]">
                <Heart className="h-4 w-4 text-[#242424]" />
              </div>

              <h1 className="text-[24px] font-semibold tracking-[-0.03em] text-[#111111] sm:text-[28px]">
                My Wishlist
              </h1>
            </div>

            <p className="mt-1.5 pl-[42px] text-[12px] text-[#8A8A8A]">
              {totalItems}{" "}
              {totalItems === 1 ? "item" : "items"}{" "}
              saved for later
            </p>
          </div>

          {totalItems > 0 && (
            <Link
              href="/products"
              className="hidden h-[36px] items-center justify-center rounded-[7px] border border-[#DAD7D2] bg-white px-4 text-[11px] font-semibold text-[#272727] transition hover:border-[#BDB8B1] hover:bg-[#FAFAF9] sm:inline-flex"
            >
              Continue Shopping
            </Link>
          )}
        </div>

        {/* =====================================================
            EMPTY
        ===================================================== */}

        {totalItems === 0 ? (
          <div className="rounded-[12px] border border-dashed border-[#DAD8D4] bg-white px-6 py-20 text-center shadow-[0_5px_20px_rgba(0,0,0,0.02)]">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#F1F0EE]">
              <Heart className="h-6 w-6 text-[#77736E]" />
            </div>

            <h3 className="text-[16px] font-semibold text-[#1B1B1B]">
              Nothing saved yet
            </h3>

            <p className="mx-auto mt-2 max-w-[340px] text-[12px] leading-5 text-[#888888]">
              When something catches your eye,
              save it here and it&apos;ll wait for you.
            </p>

            <Link
              href="/products"
              className="mt-6 inline-flex h-[40px] items-center justify-center gap-2 rounded-[7px] bg-[#111111] px-6 text-[11px] font-semibold text-white transition-all hover:bg-[#292929] active:scale-[0.98]"
            >
              Explore products
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          /* ===================================================
             GRID
          =================================================== */

          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:gap-5">
            {wishlistItems.map((item) => (
              <WishlistCard
                key={item.productId}
                item={item}
                isRemoving={
                  removingId === item.productId
                }
                isAdding={
                  addingToCartId === item.productId
                }
                onRemove={() =>
                  handleRemove(item)
                }
                onAddToCart={() =>
                  handleAddToCart(item)
                }
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

/* ============================================================
   WISHLIST CARD
============================================================ */

function WishlistCard({
  item,
  isRemoving,
  isAdding,
  onRemove,
  onAddToCart,
}: {
  item: WishlistCardData;
  isRemoving: boolean;
  isAdding: boolean;
  onRemove: () => void;
  onAddToCart: () => void;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[10px] border border-[#E4E1DC] bg-white p-2.5 shadow-[0_4px_16px_rgba(0,0,0,0.025)] transition-all duration-200 hover:-translate-y-[2px] hover:border-[#D4D0CA] hover:shadow-[0_10px_28px_rgba(0,0,0,0.06)] sm:p-3">
      {/* ======================================================
          REMOVE
      ====================================================== */}

      <button
        type="button"
        onClick={onRemove}
        disabled={isRemoving}
        aria-label="Remove from wishlist"
        className="absolute right-2.5 top-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-[#DEDAD5] bg-white/95 text-[#7E7A75] shadow-[0_2px_8px_rgba(0,0,0,0.06)] backdrop-blur-sm transition-all duration-200 hover:border-[#C7C1B9] hover:bg-[#FAFAF9] hover:text-[#111111] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isRemoving ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <X className="h-3.5 w-3.5" />
        )}
      </button>

      {/* ======================================================
          IMAGE
      ====================================================== */}

      <Link
        href={`/product/${item.slug}`}
        className="relative block aspect-square w-full overflow-hidden rounded-[8px] bg-[#F4F3F1]"
      >
        <Image
          src={item.image || FALLBACK_IMAGE}
          alt={item.name}
          fill
          sizes="(max-width: 640px) 46vw, (max-width: 1024px) 30vw, 260px"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025]"
          onError={(event) => {
            const target = event.currentTarget;

            if (target.src.includes(FALLBACK_IMAGE)) {
              return;
            }

            target.src = FALLBACK_IMAGE;
          }}
        />

        {/* STOCK OVERLAY */}

        {!item.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/72 backdrop-blur-[1px]">
            <span className="rounded-full border border-[#DCD9D4] bg-white/95 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.08em] text-[#6E6B66] shadow-sm">
              Out of stock
            </span>
          </div>
        )}

        {/* DISCOUNT */}

        {item.discount && item.discount > 0 ? (
          <span className="absolute left-2 top-2 rounded-full bg-[#111111] px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.04em] text-white shadow-sm">
            {item.discount}% OFF
          </span>
        ) : null}
      </Link>

      {/* ======================================================
          DETAILS
      ====================================================== */}

      <div className="px-0.5 pt-3">
        <Link href={`/product/${item.slug}`}>
          <p className="line-clamp-2 min-h-[32px] text-[12px] font-medium leading-[16px] text-[#1A1A1A] transition-colors hover:text-[#5F5A54]">
            {item.name}
          </p>
        </Link>

        {/* PRICE */}

        <div className="mt-2 flex min-h-[20px] items-center gap-1.5">
          <span className="text-[14px] font-semibold tracking-[-0.01em] text-[#111111]">
            {formatPrice(item.price)}
          </span>

          {item.oldPrice ? (
            <span className="text-[10px] text-[#A7A5A1] line-through">
              {formatPrice(item.oldPrice)}
            </span>
          ) : null}
        </div>

        {/* STOCK LABEL */}

        <div className="mt-1.5 min-h-[14px]">
          {item.inStock ? (
            <span className="text-[9px] font-medium text-[#6E7A70]">
              In stock
            </span>
          ) : (
            <span className="text-[9px] font-medium text-[#999590]">
              Currently unavailable
            </span>
          )}
        </div>
      </div>

      {/* ======================================================
          ADD TO CART
      ====================================================== */}

      <button
        type="button"
        onClick={onAddToCart}
        disabled={!item.inStock || isAdding}
        className="mt-3 flex h-[36px] w-full items-center justify-center gap-1.5 rounded-[7px] border border-[#1A1A1A] bg-white text-[10px] font-semibold text-[#171717] transition-all duration-200 hover:bg-[#111111] hover:text-white active:scale-[0.99] disabled:cursor-not-allowed disabled:border-[#D8D5D1] disabled:bg-[#F5F4F2] disabled:text-[#AAAAA7] disabled:hover:bg-[#F5F4F2] disabled:hover:text-[#AAAAA7]"
      >
        {isAdding ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Adding...
          </>
        ) : (
          <>
            {item.inStock ? "Add to Cart" : "Out of stock"}
            {item.inStock && (
              <ShoppingCart className="h-3.5 w-3.5" />
            )}
          </>
        )}
      </button>
    </div>
  );
}