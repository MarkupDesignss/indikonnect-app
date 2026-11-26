"use client";

import { IndianRupee } from "lucide-react";
import { LuReceiptIndianRupee } from "react-icons/lu";
import { formatDate, formatPrice, formatTime } from "@/features/orders/screens/order.parts/support";


/* ============================================================
   REFUND CREDIT DISPLAY
============================================================ */

export function RefundCreditDisplay({ creditNotes }: { creditNotes: any[] }) {
  if (!creditNotes || !Array.isArray(creditNotes) || creditNotes.length === 0) {
    return null;
  }

  const totalRefund = creditNotes.reduce(
    (sum: number, cn: any) => sum + (Number(cn.amount) || 0),
    0,
  );

  if (totalRefund <= 0) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-[10px] border border-[#CFE0D4] bg-[#F6FBF7]">
      <div className="flex items-center justify-between border-b border-[#DCEAE0] px-3 py-2">
        <div className="flex items-center gap-1.5">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#3F765A]">
            <IndianRupee className="h-2.5 w-2.5 text-white" />
          </div>

          <span className="text-[10px] font-semibold text-[#2E5C44]">
            Refund Credited
          </span>
        </div>
      </div>

      <div className="divide-y divide-[#E5F0E9]">
        {creditNotes.map((cn: any) => (
          <div
            key={cn.id}
            className="flex items-center justify-between px-3 py-2"
          >
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#E4F0E9]">
                <LuReceiptIndianRupee className="h-3 w-3 text-[#3F765A]" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-[10px] font-semibold text-[#2E5C44]">
                  {cn.credit_note_number}
                </p>

                <p className="text-[8px] text-[#7A9A88]">
                  {formatDate(cn.issued_at)} · {formatTime(cn.issued_at)}
                </p>
              </div>
            </div>

            <span className="ml-2 flex-shrink-0 text-[12px] font-bold text-[#2E5C44]">
              +{formatPrice(Number(cn.amount) || 0)}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-[#DCEAE0] bg-[#EEF7F1] px-3 py-2">
        <span className="text-[10px] font-semibold text-[#2E5C44]">
          Total Credited
        </span>

        <span className="text-[13px] font-bold text-[#2E5C44]">
          {formatPrice(totalRefund)}
        </span>
      </div>
    </div>
  );
}
