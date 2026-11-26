"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Check, ChevronDown, Info, Loader2, X } from "lucide-react";
import { CartItemView, MAX_CART_QUANTITY, PLACEHOLDER_IMAGE, formatPoints, formatPrice } from "@/features/cart/screens/cart.parts/support";


// ─────────────────────────────────────────────────────────────────────────────
// Cart product item
// ─────────────────────────────────────────────────────────────────────────────

export function CartProductItem({
  item,
  isUpdating,
  isRemoving,
  isUnavailable,
  updateQuantity,
  removeItem,
  isDistributor,
}: {
  item: CartItemView;
  isUpdating: boolean;
  isRemoving: boolean;
  isUnavailable: boolean;
  updateQuantity: (id: number, quantity: number) => void;
  removeItem: (id: number) => void;
  isDistributor: boolean;
}) {
  const originalPrice = item.originalPrice;
  const discountAmount = originalPrice ? originalPrice - item.price : 0;

  const maxQuantity = item.allowedPurchase
    ? MAX_CART_QUANTITY
    : Math.min(
      MAX_CART_QUANTITY,
      item.stockQuantity !== null
        ? Math.max(0, item.stockQuantity)
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
    { length: Math.max(1, maxQuantity, item.quantity) },
    (_, index) => index + 1,
  );

  const handleQtySelect = (quantity: number) => {
    setQtyOpen(false);

    if (quantity !== item.quantity) {
      updateQuantity(item.id, quantity);
    }
  };

  const categoryAndBrand = [item.category, item.subcategory, item.brand]
    .filter(
      (value, index, values) =>
        Boolean(value) && values.indexOf(value) === index,
    )
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
        className={`relative block h-[112px] w-[88px] self-center overflow-hidden bg-[#F3F3F3] sm:h-[150px] sm:w-[112px] ${isUnavailable ? "opacity-65" : ""
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

            if (!image.src.endsWith(PLACEHOLDER_IMAGE)) {
              image.src = PLACEHOLDER_IMAGE;
            }
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
              className={`inline-flex h-6 items-center gap-1 rounded-[3px] border bg-[#F4F4F4] pl-2 pr-1.5 text-[10px] font-semibold text-[#252525] transition hover:border-[#FF3E69]/60 disabled:cursor-not-allowed disabled:opacity-60 sm:text-[11px] ${qtyOpen ? "border-[#FF3E69]" : "border-transparent"
                }`}
            >
              <span className="text-[#8A8A8A]">Qty:</span>
              <span className="min-w-[12px] text-center">{item.quantity}</span>

              <ChevronDown
                className={`h-3 w-3 shrink-0 text-[#555] transition-transform ${qtyOpen ? "rotate-180" : ""
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
                          className={`flex w-full items-center justify-between px-2 py-[5px] text-[11px] font-medium transition ${active
                            ? "bg-[#FFF1F4] text-[#E43D5C]"
                            : "text-[#252525] hover:bg-[#F5F5F5]"
                            }`}
                        >
                          {quantity}

                          {active && (
                            <Check className="h-3 w-3" strokeWidth={3} />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
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
                  {formatPrice(discountAmount)} OFF
                  <Info className="h-2.5 w-2.5" />
                </span>
              )}
            </>
          )}
        </div>

        {isDistributor && item.commissionPoints > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-md border border-[#D7ECDD] bg-[#F1FAF4] px-2.5 py-2">
            <span className="text-[10.5px] font-semibold text-[#176642]">
              Commission Value
            </span>
            <span className="text-[11.5px] font-bold text-[#176642]">
              {formatPoints(item.commissionPoints)} / unit
            </span>
            {item.quantity > 1 && (
              <span className="w-full text-right text-[10px] text-[#48765B]">
                {item.quantity} units ·{" "}
                {formatPoints(item.commissionPoints * item.quantity)} total
              </span>
            )}
          </div>
        )}
      </div>
    </motion.article>
  );
}
