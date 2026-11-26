"use client";

import { TrendingUp, Trophy, ShieldCheck } from "lucide-react";
import type { IgniteDashboard } from "@/lib/redux/api/distributor/userDashboardApi";
import { toNumber } from "@/features/distributor/routes/dashboard/page.parts/support";


// --------------------------------------------------
// Account summary
// --------------------------------------------------

export function AccountSummary({ ignite }: { ignite?: IgniteDashboard | null }) {
  const ranks = [
    { label: "Current rank", value: ignite?.rank_no, icon: Trophy },
    {
      label: "Eligible rank",
      value: ignite?.eligible_rank_no,
      icon: TrendingUp,
    },
    { label: "Base rank", value: ignite?.base_rank_no, icon: ShieldCheck },
  ];
  const left = toNumber(ignite?.total_cv_left);
  const right = toNumber(ignite?.total_cv_right);
  const total = left + right;
  const leftPct = total > 0 ? (left / total) * 100 : 0;
  const rightPct = total > 0 ? (right / total) * 100 : 0;
  const isActive = ignite?.membership_status?.toLowerCase() === "active";
  // return (
  //   <section className={`${CARD} dashboard-card h-full p-4 sm:p-5`}>
  //     <div className="flex flex-wrap items-start justify-between gap-3">
  //       <div>
  //         <SectionTitle>Network performance</SectionTitle>
  //         <p className="ml-11 mt-1 text-[11px] leading-5 text-[#888888]">
  //           Rank progress and CV distribution
  //         </p>
  //       </div>
  //       <span
  //         className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
  //           isActive
  //             ? "border-[#D9EDE2] bg-[#F0FAF4] text-[#21845F]"
  //             : "border-[#EBEBEB] bg-[#F8F8F8] text-[#777777]"
  //         }`}
  //       >
  //         <span
  //           className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-[#21845F]" : "bg-[#BDBDBD]"}`}
  //         />
  //         {formatStatus(ignite?.membership_status)}
  //       </span>
  //     </div>
  //     <div className="mt-5 grid grid-cols-3 gap-2.5">
  //       {ranks.map((item, index) => {
  //         const Icon = item.icon;
  //         return (
  //           <div
  //             key={item.label}
  //             className={`min-w-0 rounded-[14px] border p-3 sm:p-4 ${
  //               index === 0
  //                 ? "border-[#EAE5D9] bg-[#FBFAF7]"
  //                 : index === 1
  //                   ? "border-[#E9ECEF] bg-[#F9FAFB]"
  //                   : "border-[#E9ECEF] bg-[#F9FAFB]"
  //             }`}
  //           >
  //             <Icon
  //               size={16}
  //               className={
  //                 index === 0
  //                   ? "text-[#C18D3D]"
  //                   : index === 1
  //                     ? "text-[#269C79]"
  //                     : "text-[#7C78CE]"
  //               }
  //               strokeWidth={1.7}
  //             />
  //             <p className="dashboard-number mt-4 break-words text-[23px] font-bold leading-none tracking-[-.05em] text-[#191919] sm:text-[28px]">
  //               {item.value ?? "—"}
  //             </p>
  //             <p className="mt-2 text-[10px] font-medium leading-4 text-[#777777] sm:text-[11px]">
  //               {item.label}
  //             </p>
  //           </div>
  //         );
  //       })}
  //     </div>
  //     <div className="mt-5 rounded-[14px] border border-[#EAEAEA] bg-[#FCFCFC] p-3.5 sm:p-4">
  //       <div className="flex items-center justify-between gap-2">
  //         <span className="text-[12px] font-semibold text-[#303030]">
  //           CV distribution
  //         </span>
  //         <span className="dashboard-number text-[11px] font-bold text-[#8A8A8A]">
  //           {formatNumber(total)} total
  //         </span>
  //       </div>
  //       <div className="mt-4 flex min-w-0 items-end justify-between gap-3">
  //         <div className="min-w-0">
  //           <p className="text-[10px] text-[#8A8A8A]">Left leg</p>
  //           <p className="dashboard-number mt-1 break-words text-[19px] font-bold leading-none text-[#202020]">
  //             {formatNumber(left)}
  //           </p>
  //         </div>
  //         <div className="min-w-0 text-right">
  //           <p className="text-[10px] text-[#8A8A8A]">Right leg</p>
  //           <p className="dashboard-number mt-1 break-words text-[19px] font-bold leading-none text-[#202020]">
  //             {formatNumber(right)}
  //           </p>
  //         </div>
  //       </div>
  //       <div className="mt-4 flex h-[9px] w-full gap-[3px] overflow-hidden rounded-full bg-[#E9E9E9]">
  //         {leftPct > 0 && (
  //           <div
  //             className="h-full rounded-l-full bg-[#5B83D8] transition-all"
  //             style={{ width: `${leftPct}%` }}
  //           />
  //         )}
  //         {rightPct > 0 && (
  //           <div
  //             className="h-full rounded-r-full bg-[#37B89A] transition-all"
  //             style={{ width: `${rightPct}%` }}
  //           />
  //         )}
  //       </div>
  //       <div className="mt-2.5 flex justify-between gap-2 text-[10px] font-semibold text-[#888888]">
  //         <span>
  //           <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[#5B83D8]" />
  //           Left {total > 0 ? leftPct.toFixed(0) : 0}%
  //         </span>
  //         <span>
  //           Right {total > 0 ? rightPct.toFixed(0) : 0}%{" "}
  //           <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[#37B89A]" />
  //         </span>
  //       </div>
  //     </div>
  //     <div className="mt-4 flex items-center justify-between border-t border-[#F0F0F0] pt-4">
  //       <span className="text-[11px] text-[#888888]">Membership status</span>
  //       <span className="text-[11px] font-semibold text-[#2A2A2A]">
  //         {formatStatus(ignite?.membership_status)}
  //       </span>
  //     </div>
  //   </section>
  // );
  return null;
}
