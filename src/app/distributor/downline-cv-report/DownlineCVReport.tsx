"use client";

import { ChevronDown, Inbox } from "lucide-react";
import { useState } from "react";

const NAVY = "#0E1B3D";

const WEEK_OPTIONS = [
    "Week 35: 29 Aug 2026 to 04 Sep 2026",
    "Week 34: 22 Aug 2026 to 28 Aug 2026",
    "Week 33: 15 Aug 2026 to 21 Aug 2026",
    "Week 32: 08 Aug 2026 to 14 Aug 2026",
];

const FontImport = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,400&display=swap');
        /* In production, prefer next/font/google over a runtime @import for this. */
    `}</style>
);

const DownlineCVReport = () => {
    const [selectedWeek, setSelectedWeek] = useState(WEEK_OPTIONS[0]);

    return (
        <div
            style={{ fontFamily: "'Lato', sans-serif" }}
            className="rounded-[16px] border border-[#e7e9ee] bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.03)] sm:p-8"
        >
            <FontImport />

            {/* ================= HEADER ================= */}
            <div className="flex flex-col">
                <h1 className="text-[20px] font-black tracking-[-0.01em] text-[#101828]">
                    Downline CV by country report
                </h1>
                <p className="mt-1 text-[13.5px] text-[#667085]">
                    View your downline sales performance breakdown by country.
                </p>
            </div>

            {/* ================= FILTER SECTION ================= */}
            <div className="mt-8">
                <label className="block text-[14px] font-semibold text-[#101828]">Commission week</label>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                    {/* Dropdown */}
                    <div className="relative">
                        <select
                            value={selectedWeek}
                            onChange={(e) => setSelectedWeek(e.target.value)}
                            className="h-[44px] w-[320px] appearance-none rounded-[10px] border border-[#e5e9ef] bg-[#f7f8fa] px-4 pr-10 text-[13.5px] text-[#101828] outline-none transition-colors focus:border-[#0E1B3D] focus:bg-white focus:ring-2 focus:ring-[#0E1B3D]/10"
                        >
                            {WEEK_OPTIONS.map((week) => (
                                <option key={week}>{week}</option>
                            ))}
                        </select>
                        <ChevronDown
                            size={18}
                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#98a2b3]"
                        />
                    </div>

                    {/* Search Button */}
                    <button
                        onClick={() => {
                            // TODO: wire up to the report API/filtering logic.
                            alert(`Searching for ${selectedWeek}`);
                        }}
                        className="h-[44px] rounded-[10px] px-8 text-[13.5px] font-semibold text-white transition-colors"
                        style={{ backgroundColor: NAVY }}
                    >
                        Search
                    </button>
                </div>
            </div>

            {/* ================= EMPTY STATE ================= */}
            <div className="mt-10 flex h-[360px] flex-col items-center justify-center gap-3 rounded-[14px] bg-[#f7f8fa]">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white">
                    <Inbox className="h-5 w-5 text-[#98a2b3]" />
                </div>
                <div className="text-center">
                    <p className="text-[13.5px] font-semibold text-[#344054]">No data for this week</p>
                    <p className="mt-1 text-[12.5px] text-[#8a92a6]">
                        Try a different commission week from the dropdown above.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DownlineCVReport;