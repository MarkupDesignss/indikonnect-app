"use client";

import { useState } from "react";


export function ApiDetailsExplorer({
  dashboard,
}: {
  dashboard: Record<string, any> | undefined;
}) {
  const [expanded, setExpanded] = useState(false);
  const sections = [
    "user",
    "stats",
    "ignite",
    "latest_order",
    "recent_activity",
    "wishlist",
    "cart",
    "sales_calendar",
  ];

  // return (
  //   <section className={`${CARD} dashboard-card mt-5 p-4 sm:p-5`}>
  //     <button
  //       type="button"
  //       onClick={() => setExpanded((v) => !v)}
  //       className="flex w-full items-center justify-between gap-3 text-left"
  //     >
  //       <SectionTitle>Raw API details</SectionTitle>
  //       <ChevronDown
  //         size={18}
  //         className={`text-[#777] transition-transform ${expanded ? "rotate-180" : ""}`}
  //       />
  //     </button>
  //     {expanded && dashboard && (
  //       <div className="mt-4 space-y-3">
  //         {sections.map((key) => (
  //           <details
  //             key={key}
  //             className="rounded-[11px] border border-[#EAEAEA] bg-[#FBFBFB] px-3 py-2"
  //           >
  //             <summary className="cursor-pointer text-[11px] font-bold text-[#2B2B2B]">
  //               {formatStatus(key)}
  //             </summary>
  //             <pre className="mt-2 max-h-56 overflow-auto rounded-md bg-white p-2 text-[10px] leading-5 text-[#444]">
  //               {JSON.stringify(dashboard[key], null, 2)}
  //             </pre>
  //           </details>
  //         ))}
  //       </div>
  //     )}
  //   </section>
  // );
  return null;
}
