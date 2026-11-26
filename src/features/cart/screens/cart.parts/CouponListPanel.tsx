"use client";

import { BadgePercent } from "lucide-react";
import { CouponListItem, getCouponValueLabel } from "@/features/cart/screens/cart.parts/support";


// ─────────────────────────────────────────────────────────────────────────────
// Coupon list panel
// ─────────────────────────────────────────────────────────────────────────────

export function CouponListPanel({
  coupons,
  isLoading,
  appliedCode,
  onApply,
}: {
  coupons: CouponListItem[];
  isLoading: boolean;
  appliedCode: string | null;
  onApply: (code: string) => void;
}) {
  if (isLoading) {
    return (
      <div className="space-y-2 rounded-xl border border-[#E2E8E4] bg-white p-3">
        <div className="h-14 animate-pulse rounded-lg bg-[#EEEEEC]" />
        <div className="h-14 animate-pulse rounded-lg bg-[#EEEEEC]" />
      </div>
    );
  }

  if (!coupons.length) {
    return (
      <div className="rounded-xl border border-[#E2E8E4] bg-white p-4 text-center">
        <p className="text-[11px] text-[#888888]">
          No coupons available right now
        </p>
      </div>
    );
  }

  return (
    <div className="max-h-[200px] space-y-2 overflow-y-auto rounded-xl border border-[#E2E8E4] bg-white p-2">
      {coupons.map((coupon, index) => {
        const isApplied =
          appliedCode &&
          appliedCode.toUpperCase() === String(coupon.code).toUpperCase();

        return (
          <div
            key={`${coupon.id ?? coupon.code}-${index}`}
            className="flex items-center gap-3 rounded-lg border border-dashed border-[#DDE5DF] p-2.5"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EAF6EF] text-[#16845B]">
              <BadgePercent className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-[11px] font-semibold uppercase text-[#171717]">
                  {coupon.code}
                </p>

                <span className="shrink-0 text-[10px] font-semibold text-[#16845B]">
                  {getCouponValueLabel(coupon)}
                </span>
              </div>

              {(coupon.title || coupon.description) && (
                <p className="mt-0.5 truncate text-[10px] text-[#888888]">
                  {coupon.title || coupon.description}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => onApply(coupon.code)}
              disabled={Boolean(isApplied)}
              className="shrink-0 rounded-lg border border-[#CBD5CE] px-3 py-1.5 text-[10px] font-semibold text-[#1F513B] transition hover:border-[#16845B] hover:bg-[#EAF6EF] disabled:cursor-not-allowed disabled:text-[#AAAAAA]"
            >
              {isApplied ? "Applied" : "Apply"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
