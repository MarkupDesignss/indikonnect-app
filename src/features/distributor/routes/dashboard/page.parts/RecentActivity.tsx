"use client";

import type { DashboardActivity } from "@/lib/redux/api/distributor/userDashboardApi";
import { MAX_VISIBLE_ACTIVITY } from "@/features/distributor/routes/dashboard/page.parts/support";

export function RecentActivity({ activity }: { activity: DashboardActivity[] }) {
  const hasOverflow = activity.length > MAX_VISIBLE_ACTIVITY;
  // return (
  //   <section className={`${CARD} dashboard-card h-full p-4 sm:p-5`}>
  //     <div className="flex flex-wrap items-center justify-between gap-2">
  //       <div>
  //         <SectionTitle>Recent activity</SectionTitle>
  //         <p className="ml-11 mt-1 text-[11px] text-[#929292]">
  //           A quick timeline of your account updates
  //         </p>
  //       </div>
  //       <span className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-[#F7F7F7] text-[#737373]">
  //         <Activity size={17} />
  //       </span>
  //     </div>
  //     {activity.length > 0 ? (
  //       <div
  //         className={`thin-scroll mt-4 ${hasOverflow ? "overflow-y-auto pr-1" : ""}`}
  //         style={
  //           hasOverflow
  //             ? {
  //                 maxHeight: `${MAX_VISIBLE_ACTIVITY * ACTIVITY_ITEM_HEIGHT}px`,
  //               }
  //             : undefined
  //         }
  //       >
  //         {activity.map((item, index) => (
  //           <div
  //             key={`${item.type}-${item.created_timestamp}-${index}`}
  //             className="relative flex gap-3 pb-4 last:pb-0"
  //           >
  //             <div className="relative flex shrink-0 flex-col items-center">
  //               <span className="z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] border border-[#E9E9E9] bg-[#FAFAFA] text-[#454545]">
  //                 <Activity size={15} />
  //               </span>
  //               {index !== activity.length - 1 && (
  //                 <span className="absolute bottom-0 top-10 w-px bg-[#EAEAEA]" />
  //               )}
  //             </div>
  //             <div className="min-w-0 flex-1 border-b border-[#F0F0F0] pb-3 last:border-0">
  //               <p className="break-words text-[12px] font-semibold leading-5 text-[#303030]">
  //                 {item.event}
  //               </p>
  //               <div className="mt-1.5 flex flex-wrap items-center gap-2">
  //                 <span className="rounded-[6px] bg-[#F5F5F5] px-2 py-0.5 text-[10px] font-medium text-[#737373]">
  //                   {formatStatus(item.type)}
  //                 </span>
  //                 <span className="text-[10px] text-[#9C9C9C]">
  //                   {item.created_at}
  //                 </span>
  //               </div>
  //             </div>
  //           </div>
  //         ))}
  //       </div>
  //     ) : (
  //       <div className="mt-4 flex min-h-[145px] flex-col items-center justify-center rounded-[14px] border border-dashed border-[#E8E8E8] bg-[#FBFBFB] p-5 text-center">
  //         <span className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-white text-[#989898] ring-1 ring-[#EBEBEB]">
  //           <Activity size={19} />
  //         </span>
  //         <p className="mt-3 text-[12px] font-semibold text-[#454545]">
  //           No recent activity
  //         </p>
  //         <p className="mt-1 text-[11px] text-[#999999]">
  //           Your latest account updates will show here.
  //         </p>
  //       </div>
  //     )}
  //   </section>
  // );
  return null;
}
