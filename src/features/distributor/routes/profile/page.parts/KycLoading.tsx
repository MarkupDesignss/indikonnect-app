"use client";

import { Loader2 } from "lucide-react";
import { FontImport, NAVY, cardClass } from "@/features/distributor/routes/profile/page.parts/support";


export function KycLoading() {
  return (
    <div
      className={`kyc-status-page ${cardClass}`}
      aria-label="Loading KYC status"
      aria-busy="true"
    >
      <FontImport />

      <div className="flex items-center gap-3">
        <Loader2
          className="h-5 w-5 shrink-0 animate-spin"
          style={{ color: NAVY }}
        />
        <div className="min-w-0 flex-1">
          <div className="h-5 w-36 max-w-full animate-pulse rounded bg-[#f2f4f7]" />
          <div className="mt-2 h-3.5 w-56 max-w-full animate-pulse rounded bg-[#f2f4f7]" />
        </div>
      </div>

      <div className="mt-6 rounded-[14px] border border-[#e7e9ee] p-4 sm:mt-8 sm:p-6">
        <div className="h-4 w-40 max-w-full animate-pulse rounded bg-[#f2f4f7]" />

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="h-12 w-12 shrink-0 animate-pulse rounded-full bg-[#f2f4f7] sm:h-14 sm:w-14" />
          <div className="h-7 w-36 max-w-full animate-pulse rounded bg-[#f2f4f7]" />
        </div>

        <div className="mt-4 h-4 w-full max-w-[440px] animate-pulse rounded bg-[#f2f4f7]" />
        <div className="mt-2 h-4 w-4/5 max-w-[360px] animate-pulse rounded bg-[#f2f4f7]" />

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="flex min-w-0 flex-col items-center rounded-[12px] bg-[#f7f8fa] p-3 sm:p-4"
            >
              <div className="h-9 w-9 animate-pulse rounded-full bg-[#e7e9ee]" />
              <div className="mt-3 h-3 w-20 max-w-full animate-pulse rounded bg-[#e7e9ee]" />
              <div className="mt-2 h-3 w-16 max-w-full animate-pulse rounded bg-[#e7e9ee]" />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:mt-6 lg:grid-cols-2">
        <div className="h-52 animate-pulse rounded-[14px] bg-[#f7f8fa] sm:rounded-[16px]" />
        <div className="h-52 animate-pulse rounded-[14px] bg-[#f7f8fa] sm:rounded-[16px]" />
      </div>
    </div>
  );
}
