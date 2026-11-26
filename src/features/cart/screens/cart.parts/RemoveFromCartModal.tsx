"use client";

import { ArrowRight, Heart, Loader2, Trash2, X } from "lucide-react";
import { CartItemView, PLACEHOLDER_IMAGE, formatPrice } from "@/features/cart/screens/cart.parts/support";


// ─────────────────────────────────────────────────────────────────────────────
// Remove-from-Cart Confirmation Popup
// ─────────────────────────────────────────────────────────────────────────────

export function RemoveFromCartModal({
  isOpen,
  item,
  isProcessing,
  onAddToWishlist,
  onRemoveOnly,
  onCancel,
}: {
  isOpen: boolean;
  item: CartItemView | null;
  isProcessing: boolean;
  onAddToWishlist: () => void;
  onRemoveOnly: () => void;
  onCancel: () => void;
}) {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-end justify-center bg-black/55 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="w-full max-w-md overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
        {/* Header */}
        <div className="relative flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFF1F4]">
              <Trash2 className="h-4 w-4 text-[#E43D5C]" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-gray-900">
                Remove this item?
              </h3>
              <p className="text-[11px] text-gray-500">
                Choose what you want to do with it
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Product preview */}
        <div className="flex items-center gap-3 border-b border-gray-100 bg-[#FAFAFA] px-5 py-3">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
            <img
              src={item.image}
              alt={item.name}
              className="h-full w-full object-cover"
              onError={(e) => {
                const img = e.currentTarget;
                if (!img.src.endsWith(PLACEHOLDER_IMAGE)) {
                  img.src = PLACEHOLDER_IMAGE;
                }
              }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12.5px] font-semibold text-gray-900">
              {item.name}
            </p>
            <p className="mt-0.5 text-[11px] text-gray-500">
              Qty: {item.quantity} · {formatPrice(item.price)}
            </p>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-2.5 px-5 py-4">
          {/* Option 1: Add to wishlist + remove */}
          <button
            type="button"
            onClick={onAddToWishlist}
            disabled={isProcessing}
            className="group flex w-full items-center gap-3 rounded-xl border border-[#CDE4D5] bg-[#F1FAF4] p-3 text-left transition hover:border-[#16845B] hover:bg-[#E6F4EA] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#16845B] shadow-sm ring-1 ring-[#CDE4D5]">
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Heart className="h-4 w-4" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-semibold text-[#1B2C20]">
                Move to Wishlist
              </p>
              <p className="mt-0.5 text-[10.5px] leading-4 text-[#5C7264]">
                Save it for later · will be removed from cart
              </p>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-[#16845B] transition group-hover:translate-x-0.5" />
          </button>

          {/* Option 2: Remove only */}
          <button
            type="button"
            onClick={onRemoveOnly}
            disabled={isProcessing}
            className="group flex w-full items-center gap-3 rounded-xl border border-[#F1C8C4] bg-[#FFF5F2] p-3 text-left transition hover:border-[#B64339] hover:bg-[#FFE9E5] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#B64339] shadow-sm ring-1 ring-[#F1C8C4]">
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-semibold text-[#8F3023]">
                Remove from Cart
              </p>
              <p className="mt-0.5 text-[10.5px] leading-4 text-[#A0574D]">
                Remove permanently without saving
              </p>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-[#B64339] transition group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Cancel */}
        <div className="border-t border-gray-100 bg-gray-50 px-5 py-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-[12px] font-semibold text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
          >
            Keep in Cart
          </button>
        </div>
      </div>
    </div>
  );
}
