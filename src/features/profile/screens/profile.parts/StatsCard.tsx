"use client";

import { motion } from "framer-motion";
import { BRAND_GREEN, CARD } from "@/features/profile/screens/profile.parts/support";


/* ========================================================================= */
/* STATS CARD                                                                */
/* ========================================================================= */

export function StatsCard({
  value,
  label,
  icon: Icon,
  subtitle,
}: {
  value: any;
  label: string;
  icon: React.ElementType;
  color?: string;
  subtitle?: string;
}) {
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
      className={`
        group relative overflow-hidden
        ${CARD}
        p-5
        transition-all duration-300
        hover:-translate-y-1
        hover:shadow-[0_18px_40px_-25px_rgba(0,0,0,0.35)]
      `}
    >
      <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-[#F4F6F1] blur-2xl" />

      <div className="relative">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#9A9A94]">
              {label}
            </p>

            <div className="mt-3 text-[30px] font-semibold leading-none tracking-[-0.04em] text-[#111111]">
              {value}
            </div>

            {subtitle && (
              <div className="mt-2 text-[10px] font-medium text-[#8A8A85]">
                {subtitle}
              </div>
            )}
          </div>

          <div
            className="
              flex h-11 w-11
              items-center justify-center
              rounded-[13px]
              border border-[#E7E9E3]
              text-[#415447]
              shadow-[0_8px_18px_-14px_rgba(0,0,0,0.35)]
              transition-all
              duration-300
              group-hover:scale-105
            "
            style={{
              background:
                "linear-gradient(145deg, #F7F9F5 0%, #EDF2EB 100%)",
            }}
          >
            <Icon className="h-[18px] w-[18px]" />
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <div className="h-[3px] w-10 overflow-hidden rounded-full bg-[#E6E8E2]">
            <div
              className="h-full w-2/3 rounded-full"
              style={{
                backgroundColor: BRAND_GREEN,
              }}
            />
          </div>

          <span className="text-[8px] font-semibold uppercase tracking-[0.12em] text-[#B0B0AA]">
            Updated
          </span>
        </div>
      </div>
    </motion.div>
  );
}
