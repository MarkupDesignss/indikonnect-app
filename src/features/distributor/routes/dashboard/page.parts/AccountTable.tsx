"use client";

import { useState } from "react";
import type { IgniteDashboard } from "@/lib/redux/api/distributor/userDashboardApi";
import { formatNumber, toNumber } from "@/features/distributor/routes/dashboard/page.parts/support";


export function AccountTable({
  ignite,
  onOpenBankedTc,
}: {
  ignite?: IgniteDashboard | null;
  onOpenBankedTc: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isActive = ignite?.membership_status?.toLowerCase() === "active";
  const availableBankedTc = toNumber(ignite?.tc_bank_available);
  const details = [
    { label: "Placement leg", value: ignite?.placement_leg ?? "N/A" },
    { label: "Total steps", value: ignite?.total_steps ?? 0 },
    { label: "Left CV", value: formatNumber(ignite?.total_cv_left) },
    { label: "Right CV", value: formatNumber(ignite?.total_cv_right) },
    {
      label: "Floating CV left",
      value: formatNumber(ignite?.floating_cv_left),
    },
    {
      label: "Floating CV right",
      value: formatNumber(ignite?.floating_cv_right),
    },
    { label: "CV left", value: formatNumber(ignite?.cv_left) },
    { label: "CV right", value: formatNumber(ignite?.cv_right) },
    { label: "Base rank", value: ignite?.base_rank_no ?? 0 },
    { label: "Eligible rank", value: ignite?.eligible_rank_no ?? 0 },
    { label: "Qualified at", value: ignite?.qualified_at ?? "N/A" },
    { label: "Member ID", value: ignite?.member_id ?? "N/A" },
  ];
  // return (
  //   <section className={`${CARD} dashboard-card h-full p-4 sm:p-5`}>
  //     <div className="flex flex-wrap items-start justify-between gap-3">
  //       <div>
  //         <SectionTitle>Account details</SectionTitle>
  //         <p className="ml-11 mt-1 text-[11px] leading-5 text-[#888888]">
  //           Your distributor placement and account information
  //         </p>
  //       </div>
  //       {ignite?.is_placed && (
  //         <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E6E6E6] bg-[#F7F7F7] px-2.5 py-1 text-[10px] font-semibold text-[#505050]">
  //           <Check size={12} />
  //           Placed
  //         </span>
  //       )}
  //     </div>
  //     <div className="mt-5 overflow-hidden rounded-[14px] border border-[#EBEBEB]">
  //       <div className="grid grid-cols-[minmax(0,1.25fr)_minmax(0,.6fr)_minmax(0,.85fr)_16px] items-center gap-2 bg-[#F7F7F7] px-3 py-3 text-[10px] font-semibold uppercase tracking-[.06em] text-[#868686] sm:px-4">
  //         <span>Account ID</span>
  //         <span>Rank</span>
  //         <span>Status</span>
  //         <span />
  //       </div>
  //       {ignite ? (
  //         <>
  //           <button
  //             type="button"
  //             aria-expanded={expanded}
  //             onClick={() => setExpanded((v) => !v)}
  //             className="group grid min-h-[72px] w-full grid-cols-[minmax(0,1.25fr)_minmax(0,.6fr)_minmax(0,.85fr)_16px] items-center gap-2 bg-white px-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#333333] sm:px-4"
  //           >
  //             <span className="min-w-0 break-all text-[11px] font-bold text-[#252525] sm:text-[13px]">
  //               {ignite.ba_id || "N/A"}
  //             </span>
  //             <span className="dashboard-number text-[13px] font-bold text-[#242424] sm:text-[15px]">
  //               {ignite.rank_no ?? 0}
  //             </span>
  //             <span
  //               className={`min-w-0 break-words text-[10px] font-semibold sm:text-[11px] ${isActive ? "text-[#25845F]" : "text-[#858585]"}`}
  //             >
  //               <span
  //                 className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle ${isActive ? "bg-[#25845F]" : "bg-[#AFAFAF]"}`}
  //               />
  //               {formatStatus(ignite.membership_status)}
  //             </span>
  //             <ChevronDown
  //               size={16}
  //               className={`text-[#777777] transition-transform ${expanded ? "rotate-180" : ""}`}
  //             />
  //           </button>
  //           <AnimatePresence initial={false}>
  //             {expanded && (
  //               <motion.div
  //                 initial={{ height: 0, opacity: 0 }}
  //                 animate={{ height: "auto", opacity: 1 }}
  //                 exit={{ height: 0, opacity: 0 }}
  //                 transition={{ duration: 0.2 }}
  //                 className="overflow-hidden border-t border-[#EBEBEB]"
  //               >
  //                 <div className="grid grid-cols-2 gap-2.5 bg-[#FAFAFA] p-3 sm:grid-cols-3 sm:p-4">
  //                   {details.map((item) => (
  //                     <div
  //                       key={item.label}
  //                       className="min-w-0 rounded-[11px] border border-[#EAEAEA] bg-white p-3"
  //                     >
  //                       <p className="text-[10px] leading-4 text-[#8A8A8A]">
  //                         {item.label}
  //                       </p>
  //                       <p className="dashboard-number mt-1 break-all text-[12px] font-bold text-[#252525] sm:text-[13px]">
  //                         {item.value}
  //                       </p>
  //                     </div>
  //                   ))}
  //                 </div>
  //               </motion.div>
  //             )}
  //           </AnimatePresence>
  //         </>
  //       ) : (
  //         <p className="p-6 text-center text-[12px] text-[#929292]">
  //           Account information is not available.
  //         </p>
  //       )}
  //     </div>
  //     <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[13px] border border-[#ECECEC] bg-[#FBFBFB] p-3 sm:p-3.5">
  //       <div>
  //         <p className="text-[11px] font-semibold text-[#343434]">
  //           Banked TC available
  //         </p>
  //         <p className="dashboard-number mt-1 text-[21px] font-bold tracking-[-.04em] text-[#191919]">
  //           {formatNumber(availableBankedTc)}
  //         </p>
  //       </div>
  //       {availableBankedTc > 0 && Boolean(ignite?.ba_id) ? (
  //         <button
  //           type="button"
  //           onClick={onOpenBankedTc}
  //           className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-[11px] bg-[#171717] px-4 text-[12px] font-semibold text-white shadow-[0_6px_14px_rgba(0,0,0,.12)] transition-all active:scale-[.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#333333]/30 focus-visible:ring-offset-2"
  //         >
  //           <HandCoins size={15} /> Place Banked TC <ArrowRight size={14} />
  //         </button>
  //       ) : (
  //         <span className="rounded-full border border-[#E8E8E8] bg-white px-3 py-1.5 text-[10px] font-medium text-[#888888]">
  //           No TC to place
  //         </span>
  //       )}
  //     </div>
  //   </section>
  // );
  return null;
}
