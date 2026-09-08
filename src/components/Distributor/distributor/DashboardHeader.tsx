"use client";

import { CalendarDays, ChevronDown, Download, UserRound } from "lucide-react";
import Image from "next/image";

interface DashboardHeaderProps {
  distributorId?: string;
}

export default function DashboardHeader({
  distributorId = "AIA603525",
}: DashboardHeaderProps) {
  return (
    <header className="h-[72px] border-b border-[#e9edf2] bg-white">
      <div className="flex h-full items-center justify-between px-6">
        {/* Distributor */}
        <div className="flex items-center gap-3">
          <div className="flex h-[36px] items-center gap-2.5 rounded-[8px] border border-[#e5e9ef] bg-white px-4 transition-colors hover:border-[#3964FE]">
            <UserRound
              size={15}
              strokeWidth={1.7}
              className="text-[#3964FE]"
            />

            <span className="font-sans text-[11px] font-medium text-[#5a6276]">
              Distributor ID:
            </span>

            <span className="font-sans text-[11px] font-semibold text-[#1a2332]">
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
          <button className="flex h-[36px] items-center gap-2.5 rounded-[8px] border border-[#e5e9ef] bg-white px-4 font-sans text-[11px] text-[#1a2332] transition-all hover:border-[#3964FE] hover:bg-[#f8faff] focus:ring-2 focus:ring-[#3964FE]/20">
            <CalendarDays size={14} className="text-[#3964FE]" />

            <span className="font-medium">
              2026-W08-33 (15 Aug - 21 Aug)
            </span>

            <ChevronDown
              size={13}
              strokeWidth={2}
              className="text-[#8a92a6]"
            />
          </button>

          <button className="flex h-[36px] items-center gap-2.5 rounded-[8px] bg-[#3964FE] px-5 font-sans text-[11px] font-medium text-white shadow-md shadow-[#3964FE]/30 transition-all hover:bg-[#2a4fd8] hover:shadow-lg hover:shadow-[#3964FE]/40 active:scale-[0.98]">
            <Download size={13} strokeWidth={2} />
            <span>Download Report</span>
          </button>
        </div>
      </div>
    </header>
  );
}