"use client";

import Image from "next/image";
import { AlertTriangle, BadgePercent, Package, ShieldCheck, X } from "lucide-react";
import { CheckoutSummaryData, GatewayBrandIcon, PaymentGatewayOption, allowsPurchaseWithoutStock, formatPoints, formatPrice, getItemImage, normalizeSummaryItems } from "@/features/checkout/screens/CheckoutPage.parts/support";
import { TaxBreakdownPopup } from "@/features/checkout/screens/CheckoutPage.parts/TaxBreakdownPopup";
import { PlaceOrderButton } from "@/features/checkout/screens/CheckoutPage.parts/PlaceOrderButton";


// ─────────────────────────────────────────────────────────────────────────────
// Cart summary
// ─────────────────────────────────────────────────────────────────────────────

export function CartSummary({
  summaryData,
  userRole,
  loading,
  onPlaceOrder,
  isSubmitting,
  disabled,
  unavailableProductIds,
  checkoutType,
  selectedGateway,
  gatewayLoading,
  retryMode = false,
  retryOrderReference = "",
  onExitPayment,
  cartLines,
}: {
  summaryData?: CheckoutSummaryData;
  userRole: string;
  loading: boolean;
  onPlaceOrder: () => void;
  isSubmitting: boolean;
  disabled: boolean;
  unavailableProductIds: Set<number>;
  checkoutType: "cart" | "buy_now";
  selectedGateway: PaymentGatewayOption;
  gatewayLoading: boolean;
  retryMode?: boolean;
  retryOrderReference?: string;
  onExitPayment: () => void;
  cartLines: any[];
}) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-[#E6ECE8] bg-white p-4 shadow-[0_14px_40px_-32px_rgba(15,45,30,0.25)]">
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-1/2 rounded bg-[#EEEEEC]" />
          <div className="h-16 rounded-xl bg-[#EEEEEC]" />
          <div className="h-16 rounded-xl bg-[#EEEEEC]" />
          <div className="h-10 rounded-xl bg-[#EEEEEC]" />
          <div className="h-4 rounded bg-[#EEEEEC]" />
          <div className="h-4 rounded bg-[#EEEEEC]" />
          <div className="h-12 rounded-xl bg-[#EEEEEC]" />
        </div>
      </div>
    );
  }

  if (!summaryData) {
    return (
      <div className="rounded-2xl border border-[#E6ECE8] bg-white p-8">
        <p className="text-center text-[13px] text-[#777777]">
          Order summary unavailable. Please check your cart or refresh the page.
        </p>
        <button
          type="button"
          onClick={onPlaceOrder}
          className="mt-4 w-full rounded-lg bg-[#173E2B] px-4 py-3 text-sm font-semibold text-white"
        >
          Check checkout requirements
        </button>
      </div>
    );
  }

  const items = normalizeSummaryItems(summaryData, cartLines);

  const isDistributor = userRole === "distributor";

  const itemsCommissionSum = items.reduce((acc, item) => {
    const perItem = Number(
      item.commission_total ??
      (item.commission_value !== null && item.commission_value !== undefined
        ? Number(item.commission_value) * Number(item.quantity || 1)
        : 0),
    );

    return acc + (Number.isFinite(perItem) ? perItem : 0);
  }, 0);

  const apiTotalCommissionRaw =
    summaryData.total_commission ??
    (summaryData as any).total_commission_value ??
    (summaryData as any).commission_total ??
    (summaryData as any).total_commission_amount;

  const apiTotalCommission = Number(apiTotalCommissionRaw ?? NaN);

  const totalCommission = Number.isFinite(apiTotalCommission)
    ? apiTotalCommission
    : itemsCommissionSum;

  const hasCommission = isDistributor && Number.isFinite(totalCommission);

  const hasUnavailable = !retryMode && items.some(
    (item) => !allowsPurchaseWithoutStock(item.allowed_purchsed) && unavailableProductIds.has(item.product_id),
  );

  // Do not disable a button due to missing user input or recoverable validation.
  // Handler explains what is missing and routes user to the fix.
  const buttonDisabled = isSubmitting;

  return (
    <div className="rounded-2xl border border-[#E4EBE6] bg-white shadow-[0_16px_45px_-32px_rgba(15,45,30,0.28)]">
      {retryMode && (
        <div className="rounded-t-2xl border-b border-[#F2D9B8] bg-gradient-to-r from-[#FFF8ED] to-white px-4 py-3.5 sm:px-5">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FFF0D9] text-[#A65A11]">
              <AlertTriangle className="h-4.5 w-4.5" />
            </span>

            <div className="min-w-0">
              <h2 className="text-[16px] font-semibold tracking-[-0.03em] text-[#392B1C]">
                Payment pending
              </h2>
              <p className="mt-1 text-[11px] leading-5 text-[#806B55]">
                Your previous payment was cancelled or not completed. Retry
                payment for this order without placing a new order.
              </p>
            </div>
          </div>
        </div>
      )}

      <div
        className={`${retryMode ? "" : "rounded-t-2xl"
          } border-b border-[#EDF1EE] bg-gradient-to-r from-[#F6FBF7] to-white px-4 py-2.5 sm:px-5`}
      >
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-[16px] font-semibold tracking-[-0.03em] text-[#16241B]">
              Order Summary
            </h2>
            <p className="mt-0.5 text-[11px] text-[#7B877F]">
              {retryMode
                ? "Review your items before retrying payment"
                : "Review your items before placing the order"}
            </p>
          </div>

          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-[#16845B] shadow-sm ring-1 ring-[#E4EBE6]">
            <Package className="h-4 w-4" />
          </div>
        </div>
      </div>

      <div
        className={`space-y-3 px-4 py-2.5 sm:px-5 ${items.length > 5
            ? "max-h-[320px] overflow-y-auto overscroll-contain pr-2"
            : ""
          }`}
      >
        {items.length > 0 ? (
          items.map((item, index) => {
            const imageUrl = getItemImage(item);

            const isUnavailable =
              !retryMode &&
              !allowsPurchaseWithoutStock(item.allowed_purchsed) &&
              unavailableProductIds.has(item.product_id);

            const perUnitCommission = Number(item.commission_value ?? 0);
            const lineCommission = Number(
              item.commission_total ??
              (Number.isFinite(perUnitCommission)
                ? perUnitCommission * Number(item.quantity || 1)
                : 0),
            );

            const showCommission =
              isDistributor &&
              !retryMode &&
              Number.isFinite(lineCommission) &&
              lineCommission > 0;

            return (
              <div
                key={`${item.product_id}-${item.variant_id ?? "none"}-${index}`}
                className={`flex items-start gap-3 ${isUnavailable ? "opacity-70" : ""
                  }`}
              >
                <div className="relative mt-0.5 h-[42px] w-[42px] shrink-0">
                  <div className="relative h-full w-full overflow-hidden rounded-lg border border-[#E9EEEA] bg-[#F8FAF8]">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={item.product_name || "Product"}
                        fill
                        sizes="42px"
                        className="object-contain p-1"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-4 w-4 text-[#999999]" />
                      </div>
                    )}

                    {isUnavailable && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <span className="rounded bg-white px-1 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#B64339]">
                          OOS
                        </span>
                      </div>
                    )}
                  </div>

                  <span className="absolute -right-[5px] -top-[6px] flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#173E2B] px-1 text-[10px] font-semibold text-white ring-2 ring-white">
                    {item.quantity}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-[12px] font-medium leading-[16px] text-[#222922]">
                    {item.product_name}
                  </p>

                  {showCommission && (
                    <div className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-[#ECF9F1] px-1.5 py-0.5 text-[9.5px] font-semibold text-[#16845B]">
                      <BadgePercent className="h-3 w-3" />
                      CV {formatPoints(lineCommission)} pts
                    </div>
                  )}

                  {isUnavailable && (
                    <p className="mt-1 text-[10px] font-semibold text-[#B64339]">
                      {checkoutType === "buy_now"
                        ? "Out of stock — choose an available quantity"
                        : "Out of stock — update your cart"}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 flex-col items-end justify-between self-stretch">
                  <p className="shrink-0 text-[13px] font-semibold text-[#1D2921]">
                    {formatPrice(item.line_total)}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <p className="py-3 text-center text-[12px] text-[#777777]">
            No products in your cart
          </p>
        )}
      </div>

      <div className="space-y-1 border-t border-[#E8EEE9] px-4 py-2.5 sm:px-5">
        {/* Subtotal */}
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-[#667168]">Subtotal</span>
          <span className="text-[12px] font-medium text-[#263329]">
            {formatPrice(summaryData.subtotal)}
          </span>
        </div>

        {/* Coupon discount (if any) */}
        {Number(summaryData.coupon_discount || 0) > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-[#667168]">Discount</span>
            <span className="text-[12px] font-semibold text-[#28815C]">
              −{formatPrice(summaryData.coupon_discount)}
            </span>
          </div>
        )}

        {/* ✅ SHIPPING CHARGE — separate row */}
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-[#667168]">Shipping Charge</span>
          <span className="text-[12px] font-medium text-[#263329]">
            {Number(summaryData.shipping_cost || 0) === 0
              ? "FREE"
              : formatPrice(summaryData.shipping_cost)}
          </span>
        </div>

        {/* ✅ SERVICE CHARGE — separate row */}
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-[#667168]">Service Charge</span>
          <span className="text-[12px] font-medium text-[#263329]">
            {Number(summaryData.service_charge || 0) === 0
              ? "FREE"
              : formatPrice(summaryData.service_charge)}
          </span>
        </div>

        {/* Taxes */}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-[12px] text-[#667168]">
            Taxes
            <TaxBreakdownPopup summaryData={summaryData} />
          </span>

          <span className="text-[12px] font-medium text-[#263329]">
            {formatPrice(summaryData.total_tax)}
          </span>
        </div>

        {hasCommission && (
          <div className="mt-1 flex items-center justify-between rounded-lg bg-[#ECF9F1] px-2 py-1.5">
            <span className="flex items-center gap-1 text-[11.5px] font-semibold text-[#16845B]">
              <BadgePercent className="h-3 w-3" />
              Total CV (Commission Points)
            </span>
            <span className="text-[12px] font-bold text-[#16845B]">
              {formatPoints(totalCommission)} pts
            </span>
          </div>
        )}
      </div>
      <div className="rounded-b-2xl border-t border-[#DEE7E0] bg-gradient-to-b from-white to-[#F8FBF8] px-4 pb-3 pt-2.5 sm:px-5">
        <div className="mb-2.5 flex items-center justify-between gap-3">
          <div>
            <span className="block text-[14px] font-semibold text-[#263329]">
              Total payable
            </span>
            <span className="block text-[10px] text-[#89928B]">
              Including taxes and shipping
            </span>
          </div>

          <span className="text-[18px] font-semibold tracking-[-0.04em] text-[#17251B]">
            {formatPrice(summaryData.grand_total)}
          </span>
        </div>

        {hasUnavailable && (
          <div className="mb-3 flex items-start gap-2 rounded-xl border border-[#F1C8C4] bg-[#FFF2F1] p-2.5">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#B64339]" />

            <div>
              <p className="text-[12px] font-semibold text-[#B64339]">
                {checkoutType === "buy_now"
                  ? "This product is unavailable"
                  : "Some items are out of stock"}
              </p>

              <p className="mt-0.5 text-[11px] leading-4 text-[#8A4A44]">
                {checkoutType === "buy_now"
                  ? "This product is out of stock or the requested quantity is unavailable. Return to the product and select an available quantity."
                  : "Please return to your cart and remove unavailable items to continue."}
              </p>
            </div>
          </div>
        )}

        <div className="hidden lg:block">
          <PlaceOrderButton
            onClick={onPlaceOrder}
            isSubmitting={isSubmitting}
            gatewayLoading={gatewayLoading}
            disabled={buttonDisabled}
            total={summaryData.grand_total}
            retryMode={retryMode}
          />
        </div>

        {retryMode && (
          <button
            type="button"
            onClick={onExitPayment}
            disabled={isSubmitting}
            className="mt-2 hidden min-h-[42px] w-full items-center justify-center gap-2 rounded-xl border border-[#D8E1DB] bg-white px-4 py-2.5 text-[12px] font-semibold text-[#405247] transition hover:border-[#AEBDB3] hover:bg-[#F7FAF8] disabled:cursor-not-allowed disabled:opacity-60 lg:flex"
          >
            <X className="h-4 w-4" />
            Exit Payment
          </button>
        )}

        <div className="mt-2.5 rounded-lg border border-[#E5ECE7] bg-white px-2.5 py-1.5">
          <div className="flex items-center justify-center gap-2">
            <GatewayBrandIcon
              icon={selectedGateway.icon}
              className={`h-3.5 w-3.5 shrink-0 ${selectedGateway.icon === "hdfc"
                  ? "text-[#B51F2B]"
                  : selectedGateway.icon === "razorpay"
                    ? "text-[#2457A7]"
                    : "text-[#2F65B8]"
                }`}
            />

            <p className="text-center text-[11px] text-[#748078]">
              Selected:{" "}
              <span className="font-semibold text-[#34443A]">
                {selectedGateway.title}
              </span>
              {selectedGateway.tag ? ` · ${selectedGateway.tag}` : ""}
            </p>
          </div>

          <p className="mt-0.5 flex items-center justify-center gap-1.5 text-[10px] text-[#748078]">
            <ShieldCheck className="h-3 w-3 text-[#16845B]" />
            Secure checkout · Encrypted payment
          </p>
        </div>
      </div>
    </div>
  );
}
