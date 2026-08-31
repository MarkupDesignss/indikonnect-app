"use client";

import { useEffect, useMemo, useState } from "react";
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
  `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const getNumericPrice = (value?: string | null): number => {
  if (!value) return 0;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const transformWishlistItem = (item: WishlistItem): WishlistCardData => {
  const product = item.product;

  const retailPrice = getNumericPrice(product.retail_price);
  const distributorPrice = getNumericPrice(product.distributor_price);

  const hasHigherOriginalPrice = distributorPrice > retailPrice;

  const discount = hasHigherOriginalPrice
    ? Math.round(((distributorPrice - retailPrice) / distributorPrice) * 100)
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
      product.stock_status === "in_stock" && product.stock_quantity > 0,
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

  const [removeFromWishlist] = useRemoveFromWishlistMutation();
  const [addToCart] = useAddToCartMutation();

  const [wishlistItems, setWishlistItems] = useState<WishlistCardData[]>([]);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [addingToCartId, setAddingToCartId] = useState<number | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  /* ==========================================================
     SYNC API DATA
  ========================================================== */

  useEffect(() => {
    if (wishlistData && Array.isArray(wishlistData?.data)) {
      const transformed = wishlistData.data.map((item: WishlistItem) =>
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

  const handleRemove = async (item: WishlistCardData) => {
    if (removingId === item.productId) {
      return;
    }

    setRemovingId(item.productId);

    try {
      await removeFromWishlist({ product_id: item.productId }).unwrap();

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

  /* ==========================================================
     ADD TO CART
  ========================================================== */

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
          <div className="w-full max-w-[380px] rounded-[8px] border border-[#E4E4E2] bg-white p-8 text-center">
            <h2 className="text-[16px] font-semibold text-[#111111]">
              We couldn&apos;t load your wishlist
            </h2>

            <p className="mt-2 text-[12px] leading-5 text-[#777777]">
              Something went wrong while loading your saved products.
            </p>

            <button
              onClick={() => refetchWishlist()}
              className="mt-5 inline-flex h-[38px] items-center gap-2 rounded-[6px] bg-[#111111] px-5 text-[11px] font-semibold text-white transition hover:bg-[#292929]"
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

      <div className="mx-auto w-full max-w-[980px] px-4 py-6 sm:px-6 sm:py-8">
        {/* BREADCRUMB */}
        <nav
          aria-label="Breadcrumb"
          className="mb-4 flex items-center gap-1.5 text-[11px] font-medium"
        >
          <Link
            href="/"
            className="flex items-center gap-1 text-[#777777] transition hover:text-[#111111]"
          >
            <Home className="h-3.5 w-3.5" />
            Home
          </Link>

          <ChevronRight className="h-3 w-3 text-[#B0B0AD]" />

          <span className="text-[#111111]">Wishlist</span>
        </nav>

        {/* HEADING */}
        <div className="mb-6">
          <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-[#111111] sm:text-[28px]">
            My Wishlist
          </h1>

          <p className="mt-1 text-[12px] text-[#888888]">
            {totalItems} {totalItems === 1 ? "item" : "items"}
          </p>
        </div>

        {/* EMPTY */}
        {totalItems === 0 ? (
          <div className="rounded-[8px] border border-dashed border-[#DCDCDA] bg-white px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#F1F1F0]">
              <Package className="h-5 w-5 text-[#777777]" />
            </div>

            <h3 className="text-[15px] font-medium text-[#171717]">
              Nothing saved yet
            </h3>

            <p className="mx-auto mt-2 max-w-[320px] text-[12px] leading-5 text-[#888888]">
              When something catches your eye, save it here and it&apos;ll
              wait for you.
            </p>

            <Link
              href="/products"
              className="mt-5 inline-flex h-[38px] items-center gap-2 rounded-[6px] bg-[#111111] px-5 text-[11px] font-semibold text-white transition hover:bg-[#292929]"
            >
              Explore products
            </Link>
          </div>
        ) : (
          /* GRID */
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            {wishlistItems.map((item) => (
              <WishlistCard
                key={item.productId}
                item={item}
                isRemoving={removingId === item.productId}
                isAdding={addingToCartId === item.productId}
                onRemove={() => handleRemove(item)}
                onAddToCart={() => handleAddToCart(item)}
              />
            ))}
          </div>
        )}
      </div>

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
    <div className="group relative overflow-hidden rounded-[8px] border border-[#E4E4E2] bg-white p-3 transition hover:border-[#CFCFCC]">
      {/* REMOVE BUTTON */}
      <button
        type="button"
        onClick={onRemove}
        disabled={isRemoving}
        aria-label="Remove from wishlist"
        className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-[#E4E4E2] bg-white/95 text-[#888888] transition hover:border-[#BDBDBA] hover:text-[#111111] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isRemoving ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <X className="h-3.5 w-3.5" />
        )}
      </button>

      {/* IMAGE */}
      <Link
        href={`/product/${item.slug}`}
        className="relative block aspect-square w-full overflow-hidden rounded-[6px] bg-[#F7F7F6]"
      >
        <Image
          src={item.image || FALLBACK_IMAGE}
          alt={item.name}
          fill
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 220px"
          className="object-cover "
          onError={(event) => {
            const target = event.currentTarget;
            if (target.src.includes(FALLBACK_IMAGE)) return;
            target.src = FALLBACK_IMAGE;
          }}
        />

        {!item.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <span className="rounded-full border border-[#E4E4E2] bg-white px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.06em] text-[#777777]">
              Out of stock
            </span>
          </div>
        )}

        {item.discount && (
          <span className="absolute left-2 top-2 rounded-full bg-[#111111] px-2 py-0.5 text-[9px] font-semibold text-white">
            {item.discount}% OFF
          </span>
        )}
      </Link>

      {/* DETAILS */}
      <div className="mt-3">
        <Link href={`/product/${item.slug}`}>
          <p className="line-clamp-1 text-[12px] font-medium text-[#171717] transition hover:text-[#111111]">
            {item.name}
          </p>
        </Link>

        <div className="mt-1 flex items-center gap-1.5">
          <span className="text-[13px] font-semibold text-[#111111]">
            {formatPrice(item.price)}
          </span>

          {item.oldPrice && (
            <span className="text-[11px] text-[#AAAAAA] line-through">
              {formatPrice(item.oldPrice)}
            </span>
          )}
        </div>
      </div>

      {/* ADD TO CART */}
      <button
        type="button"
        onClick={onAddToCart}
        disabled={!item.inStock || isAdding}
        className="mt-3 flex h-[36px] w-full items-center justify-center gap-2 rounded-[6px] border border-[#111111] text-[11px] font-semibold text-[#111111] transition hover:bg-[#111111] hover:text-white disabled:cursor-not-allowed disabled:border-[#DCDCDA] disabled:text-[#AAAAAA] disabled:hover:bg-transparent"
      >
        {isAdding ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <>
            {item.inStock ? "Add to Cart" : "Out of stock"}
            <ShoppingCart className="h-3.5 w-3.5" />
          </>
        )}
      </button>
    </div>
  );
}