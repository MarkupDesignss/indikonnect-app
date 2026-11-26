"use client";

import { useState } from "react";
import { LedgerEntry } from "@/features/distributor/routes/dashboard/page.parts/support";

export function LedgerHistory({ entries }: { entries?: LedgerEntry[] | null }) {
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const filtered = (entries ?? [])
    .filter((entry) => {
      if (filter !== "all" && entry.category !== filter) return false;
      const needle = search.toLowerCase().trim();
      return (
        !needle ||
        [
          entry.id,
          entry.category,
          entry.tx_type,
          entry.description,
          entry.order_id,
          entry.related_member,
          entry.date_created,
        ].some((v) =>
          String(v ?? "")
            .toLowerCase()
            .includes(needle),
        )
      );
    })
    .slice()
    .sort((a, b) => (b.date_created ?? "").localeCompare(a.date_created ?? ""));
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pages);
  const shown = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  // return (
  //   <section className={`${CARD} dashboard-card mt-5 p-4 sm:p-5`}>
  //     <div className="flex flex-wrap items-center justify-between gap-2">
  //       <div>
  //         <SectionTitle>Wallet ledger</SectionTitle>
  //         <p className="ml-11 mt-1 text-[11px] text-[#929292]">
  //           Full history of credits and debits
  //         </p>
  //       </div>
  //       <div className="flex flex-wrap items-center gap-2">
  //         <input
  //           type="search"
  //           value={search}
  //           onChange={(e) => {
  //             setSearch(e.target.value);
  //             setPage(1);
  //           }}
  //           placeholder="Search ledger..."
  //           className="h-9 min-w-0 rounded-[9px] border border-[#E4E7EC] bg-white px-3 text-[12px] text-[#344054] outline-none placeholder:text-[#98a2b3] focus:border-[#7183A3]"
  //         />
  //       </div>
  //     </div>
  //     <div className="mt-3 flex flex-wrap gap-1.5">
  //       {ledgerCategories.map((cat) => (
  //         <button
  //           key={cat}
  //           type="button"
  //           onClick={() => {
  //             setFilter(cat);
  //             setPage(1);
  //           }}
  //           className={`rounded-full border px-3 py-1 text-[10px] font-semibold transition-colors ${
  //             filter === cat
  //               ? "border-[#171717] bg-[#171717] text-white"
  //               : "border-[#E4E7EC] bg-white text-[#475467]"
  //           }`}
  //         >
  //           {cat === "all" ? "All" : formatStatus(cat)}
  //         </button>
  //       ))}
  //     </div>
  //     {shown.length > 0 ? (
  //       <div className="mt-3 overflow-x-auto rounded-[12px] border border-[#EBEBEB]">
  //         <table className="w-full min-w-[520px] border-collapse text-left text-[11px]">
  //           <thead>
  //             <tr className="bg-[#F7F7F7] text-[10px] uppercase tracking-[.06em] text-[#868686]">
  //               <th className="px-3 py-2 font-semibold">Date</th>
  //               <th className="px-3 py-2 font-semibold">Category</th>
  //               <th className="px-3 py-2 font-semibold">Type</th>
  //               <th className="px-3 py-2 font-semibold">Description</th>
  //               <th className="px-3 py-2 text-right font-semibold">Amount</th>
  //             </tr>
  //           </thead>
  //           <tbody>
  //             {shown.map((entry, i) => (
  //               <tr
  //                 key={`${entry.id}-${i}`}
  //                 className="border-t border-[#EFEFEF] text-[#303030]"
  //               >
  //                 <td className="px-3 py-2">{formatLedgerDate(entry.date_created)}</td>
  //                 <td className="px-3 py-2">{formatStatus(entry.category)}</td>
  //                 <td className="px-3 py-2">{formatStatus(entry.tx_type)}</td>
  //                 <td className="px-3 py-2 break-words">
  //                   {entry.description || "—"}
  //                 </td>
  //                 <td className="px-3 py-2 text-right font-bold">
  //                   {entry.amount ?? "—"}
  //                 </td>
  //               </tr>
  //             ))}
  //           </tbody>
  //         </table>
  //       </div>
  //     ) : (
  //       <p className="mt-3 rounded-[12px] border border-dashed border-[#E8E8E8] bg-[#FBFBFB] p-5 text-center text-[11px] text-[#929292]">
  //         No ledger entries match the current filter.
  //       </p>
  //     )}
  //     {pages > 1 && (
  //       <div className="mt-3 flex items-center justify-end gap-2 text-[11px] text-[#667085]">
  //         <button
  //           type="button"
  //           disabled={currentPage === 1}
  //           onClick={() => setPage((p) => Math.max(1, p - 1))}
  //           className="rounded-md border border-[#E4E7EC] bg-white px-2 py-1 font-semibold disabled:opacity-50"
  //         >
  //           Prev
  //         </button>
  //         <span>
  //           Page {currentPage} / {pages}
  //         </span>
  //         <button
  //           type="button"
  //           disabled={currentPage === pages}
  //           onClick={() => setPage((p) => Math.min(pages, p + 1))}
  //           className="rounded-md border border-[#E4E7EC] bg-white px-2 py-1 font-semibold disabled:opacity-50"
  //         >
  //           Next
  //         </button>
  //       </div>
  //     )}
  //   </section>
  // );
  return null;
}
