"use client";

import { ChevronRight, Loader2 } from "lucide-react";


export function PlaceOrderButton({
  onClick,
  isSubmitting,
  gatewayLoading,
  disabled,
  compact = false,
  retryMode = false,
}: {
  onClick: () => void;
  isSubmitting: boolean;
  gatewayLoading: boolean;
  disabled: boolean;
  total?: number;
  compact?: boolean;
  retryMode?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isSubmitting}
      aria-busy={isSubmitting}
      className={`group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#173E2B] via-[#1B5538] to-[#16845B] px-4 text-[13px] font-semibold text-white ring-1 ring-inset ring-white/10 transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#16845B]/30 active:translate-y-0 active:scale-[0.99] disabled:cursor-not-allowed disabled:from-[#9DB2A5] disabled:via-[#9DB2A5] disabled:to-[#9DB2A5] disabled:hover:translate-y-0 ${compact ? "min-h-[44px] py-2" : "min-h-[46px] py-2.5"
        }`}
    >
      {!disabled && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-white/20 opacity-0 blur-sm transition-all duration-700 group-hover:left-[120%] group-hover:opacity-100"
        />
      )}

      {isSubmitting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>
            {retryMode ? "Processing payment..." : "Processing order..."}
          </span>
        </>
      ) : (
        <>
          <span>{retryMode ? "Retry Payment" : "Place Order"}</span>
          <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </>
      )}
    </button>
  );
}
