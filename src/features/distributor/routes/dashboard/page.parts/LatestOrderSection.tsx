"use client";

import type { DashboardLatestOrder } from "@/lib/redux/api/distributor/userDashboardApi";


// --------------------------------------------------
// Latest order
// --------------------------------------------------

export function LatestOrderSection({ order }: { order: DashboardLatestOrder | null }) {
  const reference =
    order?.order_reference || order?.order_number || order?.reference;
  const orderData = order as
    | (DashboardLatestOrder & {
        total_payable?: number | string;
        order_date?: string;
      })
    | null;
  const amount = order?.total_amount ?? orderData?.total_payable;
  const status = order?.status?.toLowerCase() ?? "";
  const statusStyle =
    status.includes("deliver") ||
    status.includes("confirm") ||
    status.includes("complete")
      ? "border-[#D8EEE0] bg-[#F1FAF5] text-[#21815A]"
      : status.includes("fail") || status.includes("cancel")
        ? "border-[#F1D6D6] bg-[#FFF5F5] text-[#B45454]"
        : "border-[#E8E8E8] bg-[#F7F7F7] text-[#737373]";
  // return (
  //   <section className={`${CARD} dashboard-card h-full p-4 sm:p-5`}>
  //     <div className="flex flex-wrap items-center justify-between gap-2">
  //       <div>
  //         <SectionTitle>Latest order</SectionTitle>
  //         <p className="ml-11 mt-1 text-[11px] text-[#929292]">
  //           Your most recent purchase
  //         </p>
  //       </div>
  //       <span className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-[#F7F7F7] text-[#737373]">
  //         <ShoppingBag size={17} />
  //       </span>
  //     </div>
  //     {order ? (
  //       <div className="mt-5">
  //         <div className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-[#EDEDED] bg-[#FAFAFA] p-3.5 sm:p-4">
  //           <div className="min-w-0">
  //             <p className="text-[10px] font-medium uppercase tracking-[.1em] text-[#909090]">
  //               Order reference
  //             </p>
  //             <p className="dashboard-number mt-1 break-all text-[13px] font-bold text-[#262626] sm:text-[14px]">
  //               {reference || "Order details available"}
  //             </p>
  //           </div>
  //           <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-white text-[#555555] ring-1 ring-[#EAEAEA]">
  //             <PackageCheck size={17} />
  //           </span>
  //         </div>
  //         <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
  //           <div>
  //             <p className="text-[11px] font-medium text-[#878787]">
  //               Order value
  //             </p>
  //             <p className="dashboard-number mt-1.5 break-words text-[29px] font-bold tracking-[-.055em] text-[#181818] sm:text-[33px]">
  //               {amount == null ? "—" : formatCurrency(amount, "INR")}
  //             </p>
  //           </div>
  //           {order.status && (
  //             <span
  //               className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-semibold ${statusStyle}`}
  //             >
  //               <span className="h-1.5 w-1.5 rounded-full bg-current opacity-65" />
  //               {formatStatus(order.status)}
  //             </span>
  //           )}
  //         </div>
  //         {(order.created_at || orderData?.order_date) && (
  //           <div className="mt-5 flex items-center gap-2 border-t border-[#F0F0F0] pt-3.5 text-[11px] text-[#8C8C8C]">
  //             <Clock3 size={13} />
  //             <span className="break-words">
  //               {order.created_at || orderData?.order_date}
  //             </span>
  //           </div>
  //         )}
  //       </div>
  //     ) : (
  //       <div className="mt-4 flex min-h-[145px] flex-col items-center justify-center rounded-[14px] border border-dashed border-[#E8E8E8] bg-[#FBFBFB] p-5 text-center">
  //         <span className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-white text-[#989898] ring-1 ring-[#EBEBEB]">
  //           <ShoppingBag size={19} />
  //         </span>
  //         <p className="mt-3 text-[12px] font-semibold text-[#454545]">
  //           No orders placed yet
  //         </p>
  //         <p className="mt-1 text-[11px] text-[#999999]">
  //           Your recent orders will appear here.
  //         </p>
  //       </div>
  //     )}
  //   </section>
  // );
  return null;
}
