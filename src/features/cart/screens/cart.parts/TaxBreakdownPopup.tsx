"use client";

import { useEffect, useRef, useState } from "react";
import { Info, X } from "lucide-react";
import { CheckoutSummaryData, formatPrice } from "@/features/cart/screens/cart.parts/support";


// ─────────────────────────────────────────────────────────────────────────────
// Tax breakdown popup
// ─────────────────────────────────────────────────────────────────────────────

export function TaxBreakdownPopup({
  summaryData,
}: {
  summaryData: CheckoutSummaryData;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const categories =
    Array.isArray(summaryData.tax_by_category) &&
      summaryData.tax_by_category.length > 0
      ? summaryData.tax_by_category
      : [];

  return (
    <div ref={containerRef} className="relative inline-flex">
      <button
        type="button"
        aria-label="View tax breakdown"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-[#89928B] transition hover:text-[#16845B]"
      >
        <Info className="h-3 w-3" />
      </button>

      {open && (
        <div className="absolute bottom-[calc(100%+8px)] left-12 z-[9999] w-[calc(100vw-32px)] max-w-[320px] -translate-x-1/2 rounded-xl border border-[#E1EAE3] bg-white p-3 shadow-[0_16px_40px_-20px_rgba(15,45,30,0.45)] sm:left-auto sm:right-0 sm:translate-x-0 sm:w-[300px]">
          <div className="mb-2 flex items-center justify-between border-b border-[#EDF1EE] pb-2">
            <p className="text-[12px] font-semibold text-[#1B2C20]">
              Tax Breakdown
            </p>

            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close tax breakdown"
              className="flex h-5 w-5 items-center justify-center rounded-full text-[#89928B] transition hover:bg-[#F1F6F2] hover:text-[#16845B]"
            >
              <X className="h-3 w-3" />
            </button>
          </div>

          {categories.length > 0 ? (
            <div className="max-h-[300px] space-y-3 overflow-y-auto [scrollbar-width:thin] pr-1">
              {categories.map((tax, index) => (
                <div
                  key={`${tax.category}-${tax.rate}-${index}`}
                  className="rounded-lg border border-[#EDF1EE] bg-[#FAFCFA] p-2.5"
                >
                  <div className="mb-1.5 flex items-start justify-between gap-2">
                    <span className="text-[11px] font-semibold leading-tight text-[#26332A]">
                      {tax.product_name || tax.category}
                      <br />

                      <span className="text-[9.5px] font-normal text-[#78847C]">
                        {tax.category} @ {tax.rate}
                      </span>
                    </span>

                    <span className="shrink-0 text-[11px] font-bold text-[#173E2B]">
                      {formatPrice(tax.tax_amount)}
                    </span>
                  </div>

                  <div className="space-y-1 rounded border border-[#F0F4F1] bg-white p-1.5 text-[10px] text-[#748078]">
                    <div className="flex items-center justify-between">
                      <span>Taxable Value</span>

                      <span className="font-medium text-[#526258]">
                        {formatPrice(tax.taxable_amount)}
                      </span>
                    </div>

                    {Number(tax.igst || 0) > 0 && (
                      <div className="flex items-center justify-between">
                        <span>IGST</span>
                        <span>{formatPrice(tax.igst)}</span>
                      </div>
                    )}

                    {Number(tax.cgst || 0) > 0 && (
                      <div className="flex items-center justify-between">
                        <span>CGST</span>
                        <span>{formatPrice(tax.cgst)}</span>
                      </div>
                    )}

                    {Number(tax.sgst || 0) > 0 && (
                      <div className="flex items-center justify-between">
                        <span>SGST</span>
                        <span>{formatPrice(tax.sgst)}</span>
                      </div>
                    )}

                    {Number(tax.total_shipping_charge || 0) > 0 && (
                      <div className="flex items-center justify-between text-[#16845B]">
                        <span>Shipping</span>
                        <span>
                          {formatPrice(tax.total_shipping_charge || 0)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between border-t border-[#EDF1EE] pt-2 text-[11px] font-bold text-[#1B2C20]">
                <span>Total Tax</span>
                <span>{formatPrice(summaryData.total_tax)}</span>
              </div>
            </div>
          ) : (
            <p className="py-2 text-center text-[10.5px] text-[#888888]">
              Tax breakdown unavailable
            </p>
          )}
        </div>
      )}
    </div>
  );
}
