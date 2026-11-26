"use client";

import { useEffect, useRef, useState } from "react";
import { Info, X } from "lucide-react";
import { CheckoutSummaryData, formatPrice } from "@/features/checkout/screens/CheckoutPage.parts/support";


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
        <div className="absolute bottom-[calc(100%+8px)] left-12 z-[9999] w-[calc(100vw-32px)] max-w-[280px] -translate-x-1/2 rounded-xl border border-[#E1EAE3] bg-white p-3 shadow-[0_16px_40px_-20px_rgba(15,45,30,0.45)] sm:left-auto sm:right-0 sm:translate-x-0 sm:w-[260px]">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] font-semibold text-[#1B2C20]">
              Tax breakdown
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
            <div className="space-y-2">
              {categories.map((tax, index) => (
                <div
                  key={`${tax.category}-${tax.rate}-${index}`}
                  className="rounded-lg border border-[#EDF1EE] bg-[#FAFCFA] p-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-semibold text-[#26332A]">
                      {tax.category} @ {Number(tax.rate || 0).toFixed(2)}%
                    </span>

                    <span className="text-[10.5px] font-semibold text-[#173E2B]">
                      {formatPrice(tax.tax_amount)}
                    </span>
                  </div>

                  <div className="mt-1 space-y-0.5 text-[9.5px] text-[#748078]">
                    <div className="flex items-center justify-between">
                      <span>Taxable value</span>
                      <span>{formatPrice(tax.taxable_amount)}</span>
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
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between border-t border-[#EDF1EE] pt-2 text-[10.5px] font-semibold text-[#1B2C20]">
                <span>Total tax</span>
                <span>{formatPrice(summaryData.total_tax)}</span>
              </div>
            </div>
          ) : (
            <p className="text-[10.5px] text-[#888888]">
              Tax breakdown unavailable
            </p>
          )}
        </div>
      )}
    </div>
  );
}
