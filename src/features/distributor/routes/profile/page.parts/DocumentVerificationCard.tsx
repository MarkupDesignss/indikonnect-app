"use client";

import { CheckCircle2, Clock } from "lucide-react";
import { AMBER, DetailRow, EMERALD, cardClass } from "@/features/distributor/routes/profile/page.parts/support";


export function DocumentVerificationCard({
  bp,
  documents,
}: {
  bp: any;
  documents: {
    label: string;
    status: string;
    verified: boolean;
    notApplicable: boolean;
  }[];
}) {
  return (
    <div className={cardClass}>
      <h3 className="break-words text-[15px] font-bold text-[#101828] sm:text-[16px]">
        Document verification status
      </h3>

      <div className="mt-4 space-y-3 border-b border-[#e7e9ee] pb-4 sm:space-y-3.5">
        {documents.map((document) => {
          const color = document.notApplicable
            ? "#98a2b3"
            : document.verified
              ? EMERALD
              : AMBER;

          return (
            <div
              key={document.label}
              className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-3"
            >
              <p className="min-w-0 break-words text-[12px] leading-5 text-[#667085] sm:text-[13px] sm:text-[13.5px]">
                {document.label}
              </p>

              <span
                className="inline-flex max-w-full items-center justify-end gap-1.5 break-words text-right text-[11px] font-semibold leading-5 sm:text-[12px] sm:text-[13px]"
                style={{ color }}
              >
                {document.verified && (
                  <CheckCircle2 size={13} className="shrink-0" />
                )}
                {!document.verified && !document.notApplicable && (
                  <Clock size={13} className="shrink-0" />
                )}
                <span>{document.status}</span>
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 space-y-3 sm:space-y-3.5">
        <DetailRow label="Bank name" value={bp.bank_name || "—"} />
        <DetailRow
          label="Account type"
          value={bp.account_type || "—"}
          capitalize
        />
      </div>
    </div>
  );
}
