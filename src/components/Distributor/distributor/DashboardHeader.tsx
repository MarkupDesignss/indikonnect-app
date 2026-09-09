"use client";

import { CalendarDays, ChevronDown, Download, UserRound } from "lucide-react";
import Image from "next/image";

interface DashboardHeaderProps {
  distributorId?: string;
}

const NAVY = "#0E1B3D";

export default function DashboardHeader({
  distributorId = "AIA603525",
}: DashboardHeaderProps) {
  return (
    <header
      style={{ fontFamily: "'Lato', sans-serif" }}
      className="h-[72px] border-b border-[#e9edf2] bg-white"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,400&display=swap');
        /* In production, prefer next/font/google over a runtime @import for this. */
      `}</style>

      {/* `relative` is required here — the logo below is centered with `absolute left-1/2`,
          which without a positioned ancestor would center against the page, not the header. */}
      <div className="relative flex h-full items-center justify-between px-6">
        {/* Distributor */}
        <div className="flex items-center gap-3">
          <div className="flex h-[36px] items-center gap-2.5 rounded-[8px] border border-[#e5e9ef] bg-[#f7f8fa] px-4 transition-colors hover:border-[#0E1B3D]/40">
            <UserRound size={15} strokeWidth={1.7} style={{ color: NAVY }} />

            <span className="text-[11px] font-semibold text-[#667085]">
              Distributor ID:
            </span>

            <span className="text-[11px] font-bold text-[#101828]">
              {distributorId}
            </span>
          </div>
        </div>

        {/* Logo */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <Image
            src="/images/logo.png"
            alt="Indie Konnect"
            width={120}
            height={44}
            className="h-[44px] w-auto object-contain"
            priority
          />
        </div>

        {/* Right controls */}
        <div className="ml-auto flex items-center gap-3">
          <button className="flex h-[36px] items-center gap-2.5 rounded-[8px] border border-[#e5e9ef] bg-white px-4 text-[11px] text-[#101828] transition-all hover:border-[#0E1B3D]/40 hover:bg-[#f7f8fa] focus:outline-none focus:ring-2 focus:ring-[#0E1B3D]/15">
            <CalendarDays size={14} style={{ color: NAVY }} />

            <span className="font-semibold">
              Week 33, 2026 (15 Aug – 21 Aug)
            </span>

            <ChevronDown size={13} strokeWidth={2} className="text-[#98a2b3]" />
          </button>

          <button
            className="flex h-[36px] items-center gap-2.5 rounded-[8px] px-5 text-[11px] font-semibold text-white transition-all active:scale-[0.98]"
            style={{
              backgroundColor: NAVY,
              boxShadow: `0 8px 20px -8px ${NAVY}66`,
            }}
          >
            <Download size={13} strokeWidth={2} />
            <span>Download report</span>
          </button>
        </div>
      </div>
    </header>
  );
}
