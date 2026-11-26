"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Package } from "lucide-react";
import { AnyObject, CARD, LABEL, SOFT_CARD, formatCurrency } from "@/features/profile/screens/profile.parts/support";


/* ========================================================================= */
/* LATEST ORDER                                                              */
/* ========================================================================= */

export function LatestOrderCard({
  latestOrder,
  onViewOrders,
}: {
  latestOrder: AnyObject;
  onViewOrders: () => void;
}) {
  const orderItem = latestOrder?.items?.[0];

  const image =
    orderItem?.images?.[0]?.image_url ||
    orderItem?.image_url ||
    orderItem?.primary_image_url ||
    "";

  const orderStatus = latestOrder?.status || "pending";

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 12,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className={`${CARD} overflow-hidden`}
    >
      <div className="border-b border-[#ECECE6] px-5 py-4.5">
        <div className="flex items-center justify-between">
          <div>
            <p className={LABEL}>Recent Purchase</p>

            <h3 className="mt-1 text-[17px] font-semibold tracking-[-0.02em] text-[#171717]">
              Latest Order
            </h3>
          </div>

          <button
            type="button"
            onClick={onViewOrders}
            className="
              group flex items-center gap-1.5
              rounded-full
              border border-[#E5E5E0]
              bg-[#FAFAF8]
              px-3 py-1.5
              text-[9px]
              font-semibold
              text-[#333]
            "
          >
            View All
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {latestOrder ? (
        <div className="p-5">
          <div className="flex items-center gap-4">
            <div className="relative h-[94px] w-[94px] shrink-0 overflow-hidden rounded-[15px] border border-[#E6E6E0] bg-[#F5F6F2]">
              {image ? (
                <Image
                  src={image}
                  alt={orderItem?.name || "Order item"}
                  fill
                  sizes="94px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Package className="h-7 w-7 text-[#B7B8B1]" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h4 className="line-clamp-2 text-[13px] font-semibold leading-[1.35] text-[#171717]">
                  {orderItem?.name || "Order"}
                </h4>

                <span
                  className={`
                    inline-flex items-center gap-1.5
                    rounded-full border
                    px-2.5 py-1
                    text-[8px]
                    font-bold uppercase
                    tracking-[0.08em]

                    ${orderStatus === "confirmed"
                      ? "border-[#CFE0D4] bg-[#F1F7F3] text-[#3F765A]"
                      : "border-[#E8E8E3] bg-[#F9F9F7] text-[#777870]"
                    }
                  `}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {orderStatus}
                </span>
              </div>

              <p className="mt-2 text-[10px] leading-5 text-[#92928C]">
                Order {latestOrder?.order_reference || "—"}
                <br />
                Placed {latestOrder?.order_date || "—"}
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className={`${SOFT_CARD} p-3.5`}>
              <p className={LABEL}>Total Paid</p>

              <p className="mt-1.5 text-[17px] font-semibold tracking-[-0.02em] text-[#111]">
                {formatCurrency(latestOrder?.total_payable)}
              </p>
            </div>

            <div className={`${SOFT_CARD} p-3.5`}>
              <p className={LABEL}>Items</p>

              <p className="mt-1.5 text-[17px] font-semibold tracking-[-0.02em] text-[#111]">
                {latestOrder?.items?.length || 0}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onViewOrders}
            className="
              mt-4 flex h-[42px] w-full
              items-center justify-center gap-2
              rounded-[11px]
              text-[9px]
              font-bold uppercase
              tracking-[0.13em]
              text-white
              shadow-[0_12px_25px_-15px_rgba(22,40,28,0.8)]
              transition-all
              hover:-translate-y-0.5
              hover:brightness-110
              active:scale-[0.98]
            "
            style={{
              background:
                "linear-gradient(135deg, #294532 0%, #16281C 100%)",
            }}
          >
            Track Order
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <div className="px-6 py-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[14px] bg-[#F3F4F0]">
            <Package className="h-6 w-6 text-[#AEB0A8]" />
          </div>

          <p className="mt-4 text-[11px] font-medium text-[#888981]">
            You haven&apos;t placed any orders yet.
          </p>

          <Link
            href="/products"
            className="
              mt-4 inline-flex
              items-center gap-1
              text-[9px]
              font-bold uppercase
              tracking-[0.12em]
              text-[#2E5239]
              underline underline-offset-4
            "
          >
            Start Shopping
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}
    </motion.div>
  );
}
