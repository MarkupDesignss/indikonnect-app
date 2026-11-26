"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageSizePicker } from "@/features/distributor/routes/TC-Bank/TCBankPage.parts/support";


export function Pagination({
  total,

  page,

  size,

  onPageChange,

  onSizeChange,
}: {
  total: number;

  page: number;

  size: number;

  onPageChange: (v: number) => void;

  onSizeChange: (v: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / size));

  const from = total === 0 ? 0 : (page - 1) * size + 1;

  const to = Math.min(page * size, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EEF0F4] px-4 py-3 sm:px-5">
      <div className="flex flex-wrap items-center gap-3">
        <PageSizePicker value={size} onChange={onSizeChange} />

        <span className="text-[11px] text-[#8B94A3]">
          Showing {from}–{to} of {total}
        </span>
      </div>

      <div className="inline-flex items-center gap-1.5">
        <button
          type="button"

          aria-label="Previous page"

          disabled={page <= 1}

          onClick={() => onPageChange(Math.max(1, page - 1))}

          className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#E5E8ED] text-[#6C7482] hover:bg-[#F7F8FA] disabled:cursor-not-allowed disabled:opacity-35"
        >
          <ChevronLeft size={15} />
        </button>

        <span className="flex h-8 min-w-8 items-center justify-center rounded-[8px] bg-[#191919] px-2 text-[11px] font-bold text-white">
          {page}
        </span>

        <button
          type="button"

          aria-label="Next page"

          disabled={page >= totalPages}

          onClick={() => onPageChange(Math.min(totalPages, page + 1))}

          className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#E5E8ED] text-[#6C7482] hover:bg-[#F7F8FA] disabled:cursor-not-allowed disabled:opacity-35"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
