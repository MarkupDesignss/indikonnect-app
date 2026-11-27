"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BadgePercent,
  Loader2,
  ShieldCheck,
  AlertTriangle,
  Truck,
} from "lucide-react";

import {
  CheckoutSummaryData,
  CouponListItem,
  formatPoints,
  formatPrice,
} from "@/features/cart/screens/cart.parts/support";

import { TaxBreakdownPopup } from "@/features/cart/screens/cart.parts/TaxBreakdownPopup";

interface OrderSummaryProps {
  summaryData?: CheckoutSummaryData;
  fallbackSubtotal: number;
  fallbackSavings: number;
  itemCount: number;
  isCheckingStock: boolean;
  unavailableCount: number;
  onCheckout: () => void;
  couponInput: string;
  setCouponInput: (value: string) => void;
  appliedCoupon: string | null;
  onApplyCoupon: (codeOverride?: string) => void;
  onRemoveCoupon: () => void;
  isApplyingCoupon: boolean;
  coupons: CouponListItem[];
  isLoadingCoupons: boolean;
  showCouponList: boolean;
  setShowCouponList: (value: boolean) => void;
  isDistributor: boolean;
  totalCommission: number;
  /** Optional label passed by CartPage after reading ignite_cv_preview. */
  checkoutButtonLabel?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// OrderSummary — cache refresh + shipping/service charge + CV-aware CTA
// ─────────────────────────────────────────────────────────────────────────────

export function OrderSummary(props: OrderSummaryProps) {
  const router = useRouter();

  const {
    summaryData,
    fallbackSubtotal,
    fallbackSavings,
    itemCount,
    isCheckingStock,
    unavailableCount,
    onCheckout,
    isDistributor,
    totalCommission,
    checkoutButtonLabel,
  } = props;

  // ─────────────────────────────────────────────────────────────────────────
  // Determine the CTA label from the checkout summary.
  // Distributor + CV > 0: allocation popup is required.
  // Distributor + CV = 0: skip allocation and continue to payment.
  // Retail: preserve the normal customer checkout label.
  // CartPage may pass checkoutButtonLabel; this calculation is the fallback.
  // ─────────────────────────────────────────────────────────────────────────

  const ignitePreview = (summaryData as any)?.ignite_cv_preview;
  const rawPreviewCV =
    ignitePreview?.total_cv ??
    ignitePreview?.summary?.total_cv ??
    ignitePreview?.base_product_cv ??
    ignitePreview?.summary?.base_product_cv ??
    0;
  const previewCV = Number(rawPreviewCV);
  const hasPositiveCV = Number.isFinite(previewCV) && previewCV > 0;

  const calculatedCheckoutButtonLabel = !isDistributor
    ? "Proceed to Checkout"
    : hasPositiveCV
      ? "Proceed to CV Allocation"
      : "Proceed to Payment";

  const resolvedCheckoutButtonLabel =
    checkoutButtonLabel || calculatedCheckoutButtonLabel;

  // ─────────────────────────────────────────────────────────────────────────
  // CLEAR CACHE BEFORE CHECKOUT
  // ─────────────────────────────────────────────────────────────────────────

  const handleProceedCheckout = async () => {
    if (isCheckingStock || unavailableCount > 0) return;

    try {
      // Clear browser Cache Storage when supported.
      if (typeof window !== "undefined" && "caches" in window) {
        const cacheKeys = await window.caches.keys();
        await Promise.all(
          cacheKeys.map((cacheName) => window.caches.delete(cacheName)),
        );
      }
    } catch (error) {
      console.error("Cache clearing error:", error);
    }

    // Refresh Next.js router data, then continue even if cache clearing fails.
    router.refresh();
    onCheckout();
  };

  // ─────────────────────────────────────────────────────────────────────────
  // CORE AMOUNTS
  // ─────────────────────────────────────────────────────────────────────────

  const subtotal = Number(summaryData?.subtotal ?? fallbackSubtotal);
  const couponDiscount = Number(summaryData?.coupon_discount ?? 0);
  const rawSummary = summaryData as any;

  const shippingCharge = Number(
    rawSummary?.shipping_cost ??
      rawSummary?.shipping_charge ??
      rawSummary?.delivery_charge ??
      rawSummary?.shipping ??
      0,
  );

  const serviceCharge = Number(
    rawSummary?.service_charge ??
      rawSummary?.serviceCharge ??
      rawSummary?.service_fee ??
      0,
  );

  const totalTax = Number(summaryData?.total_tax ?? 0);
  const grandTotal = Number(summaryData?.grand_total ?? fallbackSubtotal);

  const hasCommission = isDistributor && totalCommission > 0;
  const hasShipping = Number.isFinite(shippingCharge) && shippingCharge > 0;
  const hasService = Number.isFinite(serviceCharge) && serviceCharge > 0;

  return (
    <section className="rounded-xl border border-[#E5E5E5] bg-white p-4 sm:p-5">
      {/* HEADER */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-[17px] font-semibold text-[#171717]">
          Cart Summary
        </h2>

        <span className="rounded-full bg-[#F4F4F4] px-2.5 py-1 text-[10px] font-medium text-[#777]">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </span>
      </div>

      {/* COUPON SECTION
          Keep your existing coupon UI here. The coupon props remain part of
          this component's public interface, so existing CartPage usage stays
          compatible. */}
      <div className="mb-3">
        {/* Existing coupon component/UI can remain here unchanged. */}
      </div>

      {/* PRICE BREAKDOWN */}
      <div className="space-y-2 text-[12px]">
        {/* SUBTOTAL */}
        <div className="flex items-center justify-between gap-4">
          <span className="text-[#777]">Subtotal</span>
          <span className="font-medium text-[#282828]">
            {formatPrice(subtotal)}
          </span>
        </div>

        {/* COUPON DISCOUNT */}
        {couponDiscount > 0 && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-[#777]">
              Discount
              {summaryData?.coupon?.code
                ? ` (${summaryData.coupon.code})`
                : ""}
            </span>
            <span className="font-semibold text-[#28815C]">
              −{formatPrice(couponDiscount)}
            </span>
          </div>
        )}

        {/* SHIPPING CHARGE */}
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1 text-[#777]">
            <Truck className="h-3 w-3" />
            Shipping Charge
          </span>
          <span
            className={`font-medium ${
              hasShipping ? "text-[#282828]" : "text-[#28815C]"
            }`}
          >
            {hasShipping ? formatPrice(shippingCharge) : "FREE"}
          </span>
        </div>

        {/* SERVICE CHARGE */}
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1 text-[#777]">
            <ShieldCheck className="h-3 w-3" />
            Service Charge
          </span>
          <span
            className={`font-medium ${
              hasService ? "text-[#282828]" : "text-[#28815C]"
            }`}
          >
            {hasService ? formatPrice(serviceCharge) : "FREE"}
          </span>
        </div>

        {/* TAXES */}
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1 text-[#777]">
            Taxes
            {summaryData && <TaxBreakdownPopup summaryData={summaryData} />}
          </span>
          <span className="font-medium text-[#282828]">
            {formatPrice(totalTax)}
          </span>
        </div>

        {/* FALLBACK SAVINGS */}
        {fallbackSavings > 0 && couponDiscount === 0 && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-[#777]">Your savings</span>
            <span className="font-semibold text-[#28815C]">
              −{formatPrice(fallbackSavings)}
            </span>
          </div>
        )}
      </div>

      {/* COMMISSION */}
      {hasCommission && (
        <div className="mt-2 flex items-center justify-between rounded-lg bg-[#ECF9F1] px-2 py-1.5">
          <span className="flex items-center gap-1 text-[11.5px] font-semibold text-[#16845B]">
            <BadgePercent className="h-3 w-3" />
            Total Commission Value
          </span>
          <span className="text-[12px] font-bold text-[#16845B]">
            {formatPoints(totalCommission)}
          </span>
        </div>
      )}

      <div className="my-4 h-px bg-[#EBEBEB]" />

      {/* TOTAL PAYABLE */}
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-[13px] font-semibold text-[#222]">Total payable</p>
          <p className="mt-1 text-[10px] text-[#999]">
            Including taxes, shipping &amp; service
          </p>
        </div>
        <p className="text-[22px] font-semibold tracking-[-0.04em] text-[#111]">
          {formatPrice(grandTotal)}
        </p>
      </div>

      {/* OUT OF STOCK WARNING */}
      {unavailableCount > 0 && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-[#F1C8C4] bg-[#FFF2F1] p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#B64339]" />
          <div>
            <p className="text-[11px] font-semibold text-[#B64339]">
              {unavailableCount} {unavailableCount === 1 ? "item is" : "items are"} out of stock
            </p>
            <p className="mt-0.5 text-[10px] leading-4 text-[#8A4A44]">
              Remove unavailable items to continue checkout.
            </p>
          </div>
        </div>
      )}

      {/* PROCEED BUTTON */}
      <button
        type="button"
        onClick={handleProceedCheckout}
        disabled={isCheckingStock || unavailableCount > 0}
        aria-busy={isCheckingStock}
        aria-label={resolvedCheckoutButtonLabel}
        className="flex h-[46px] w-full items-center justify-center gap-2 rounded-md bg-[#171717] px-4 text-[12px] font-semibold text-white transition hover:bg-[#373737] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isCheckingStock ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Checking stock...
          </>
        ) : (
          <>
            {resolvedCheckoutButtonLabel}
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>

      {/* CONTINUE SHOPPING */}
      <button
        type="button"
        onClick={() => router.push("/products")}
        className="mx-auto mt-4 flex items-center gap-2 text-[11px] font-medium text-[#707070] transition hover:text-[#111]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Continue Shopping
      </button>

      {/* SECURE CHECKOUT */}
      <div className="mt-5 flex items-center justify-center gap-2 border-t border-[#EFEFEF] pt-4 text-[10px] text-[#8B8B8B]">
        <ShieldCheck className="h-4 w-4" strokeWidth={1.7} />
        Secure checkout
      </div>
    </section>
  );
}
