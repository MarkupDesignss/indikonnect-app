"use client";

import { Maximize2, Minimize2, Scan, Users } from "lucide-react";
import { useState } from "react";

const NAVY = "#0E1B3D";
const BRASS = "#B8935A";
const EMERALD = "#1f9d6b";

const FontImport = () => (
  <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,400&display=swap');
        /* In production, prefer next/font/google over a runtime @import for this. */
    `}</style>
);

const ToolbarButton = ({ icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-1.5 rounded-[8px] px-2.5 py-2 text-[13px] font-semibold text-[#344054] transition-colors hover:bg-[#f2f4f7] hover:text-[#0E1B3D] sm:px-3"
  >
    <Icon size={15} className="shrink-0" />
    <span className="hidden sm:inline">{label}</span>
  </button>
);

const SponsorTree = () => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div
      style={{ fontFamily: "'Lato', sans-serif" }}
      className="rounded-[16px] border border-[#e7e9ee] bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.03)] sm:p-6"
    >
      <FontImport />

      {/* ================= HEADER ================= */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <h1 className="text-[17px] font-black tracking-[-0.01em] text-[#101828] sm:text-[19px]">
          Sponsor tree
        </h1>

        <div className="flex items-center gap-1 self-start rounded-[10px] border border-[#e7e9ee] bg-[#f7f8fa] p-1 sm:self-auto">
          <ToolbarButton
            icon={Maximize2}
            label="Expand all"
            onClick={() => setIsExpanded(true)}
          />
          <ToolbarButton
            icon={Minimize2}
            label="Collapse all"
            onClick={() => setIsExpanded(false)}
          />
          <ToolbarButton icon={Scan} label="Fit to view" />
        </div>
      </div>

      {/* ================= TREE STRUCTURE ================= */}
      <div className="mt-6 flex min-h-[320px] flex-col items-center justify-center sm:mt-8 sm:min-h-[400px]">
        {/* Root Node */}
        <div
          className={`w-full max-w-[380px] rounded-[18px] border p-5 text-center transition-all duration-300 sm:p-8 ${
            isExpanded
              ? "border-[#0E1B3D]/25 bg-white opacity-100 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
              : "border-[#e7e9ee] bg-white opacity-60"
          }`}
        >
          <div
            className="mx-auto flex h-12 w-12 items-center justify-center rounded-full text-[14px] font-bold text-white sm:h-14 sm:w-14 sm:text-[15px]"
            style={{ backgroundColor: NAVY }}
          >
            AC
          </div>

          <p className="mt-4 text-[12px] text-[#98a2b3]">AIA182931-001</p>
          <p className="mt-1 break-words text-[17px] font-black text-[#101828] sm:text-[19px]">
            Abhay Chauhan
          </p>

          {/* Status and Rank Badges */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span
              className="rounded-full px-3 py-1 text-[12px] font-semibold sm:text-[12.5px]"
              style={{ color: EMERALD, backgroundColor: "#eaf7f0" }}
            >
              Activated
            </span>
            <span
              className="rounded-full px-3 py-1 text-[12px] font-semibold sm:text-[12.5px]"
              style={{ color: BRASS, backgroundColor: "#f8f1e4" }}
            >
              Silver
            </span>
          </div>

          {/* No Downline Message */}
          {isExpanded && (
            <div className="mt-5 flex flex-col items-center gap-2 border-t border-[#f0f2f5] pt-5 sm:mt-6">
              <Users className="h-5 w-5 text-[#c1c6d0]" />
              <p className="text-[13px] text-[#8a92a6] sm:text-[13.5px]">
                No downline yet
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SponsorTree;