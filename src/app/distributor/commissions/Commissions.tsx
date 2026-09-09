"use client";

import {
    BarChart3,       // Retail Profit
    BookOpen,        // Weekly Pairing
    Coins,           // Unilevel Green Coin
    Award,           // Strong leg
    Sparkles,        // Floating (Pending Release)
    CheckCircle2,    // Released
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Inbox,
} from "lucide-react";
import { useState } from "react";

const CARDS = [
    {
        label: "Retail profit",
        value: "$0.00",
        color: "#3955A6",
        bg: "#eceffb",
        icon: BarChart3,
    },
    {
        label: "Weekly pairing",
        value: "$0.00",
        color: "#B8935A",
        bg: "#f8f1e4",
        icon: BookOpen,
    },
    {
        label: "Unilevel green coin",
        value: "0",
        color: "#1f9d6b",
        bg: "#eaf7f0",
        icon: Coins,
    },
    {
        label: "Strong leg",
        value: "$0.00",
        color: "#6B4C9A",
        bg: "#f1ebf7",
        icon: Award,
    },
    {
        label: "Floating (pending release)",
        value: "$0.00",
        color: "#3955A6",
        bg: "#eceffb",
        icon: Sparkles,
    },
    {
        label: "Released",
        value: "$0.00",
        color: "#1f9d6b",
        bg: "#eaf7f0",
        icon: CheckCircle2,
    },
];

const TABLE_COLUMNS = [
    "Category",
    "Date created",
    "Date released",
    "Description",
    "Amount",
    "Related order ID",
    "Related member",
];

const Commissions = () => {
    const [filterType, setFilterType] = useState("All types");

    return (
        <div
            style={{ fontFamily: "'Lato', sans-serif" }}
            className="rounded-[16px] border border-[#e7e9ee] bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.03)]"
        >
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,400&display=swap');
            `}</style>

            {/* Heading */}
            <h1 className="text-[17px] font-bold text-[#101828]">My commissions</h1>

            {/* ================= CARDS ================= */}
            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {CARDS.map(({ label, value, color, bg, icon: Icon }) => (
                    <div
                        key={label}
                        className="flex h-[84px] items-center justify-between rounded-[14px] border border-[#e7e9ee] bg-white px-4"
                    >
                        <div>
                            <p className="text-[12px] font-semibold text-[#667085]">{label}</p>
                            <p className="mt-1 text-[19px] font-black" style={{ color }}>
                                {value}
                            </p>
                        </div>
                        <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                            style={{ backgroundColor: bg }}
                        >
                            <Icon className="h-5 w-5" style={{ color }} />
                        </div>
                    </div>
                ))}
            </div>

            {/* ================= COMMISSIONS HISTORY TABLE ================= */}
            <div className="mt-8">
                {/* Header with Filter Dropdown */}
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-[15px] font-bold text-[#101828]">Commissions history</h3>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="h-[38px] w-[170px] rounded-[8px] border border-[#e5e9ef] bg-[#f7f8fa] px-3 text-[13px] text-[#101828] outline-none transition-all focus:border-[#0E1B3D] focus:bg-white focus:ring-2 focus:ring-[#0E1B3D]/10"
                    >
                        <option value="All types">All types</option>
                        <option value="Retail profit">Retail profit</option>
                        <option value="Weekly pairing">Weekly pairing</option>
                        <option value="Unilevel green coin">Unilevel green coin</option>
                        <option value="Strong leg">Strong leg</option>
                        <option value="Floating">Floating</option>
                        <option value="Released">Released</option>
                    </select>
                </div>

                {/* Table Header */}
                <div className="grid grid-cols-[1.2fr_1.2fr_1.2fr_1.5fr_1fr_1.2fr_1.2fr] gap-2 border-b border-[#e7e9ee] pb-3 text-[11.5px] font-bold tracking-wide text-[#8a92a6]">
                    {TABLE_COLUMNS.map((col) => (
                        <span key={col}>{col}</span>
                    ))}
                </div>

                {/* Empty State */}
                <div className="flex flex-col items-center justify-center gap-3 py-14">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f2f4f7]">
                        <Inbox className="h-5 w-5 text-[#98a2b3]" />
                    </div>
                    <div className="text-center">
                        <p className="text-[13.5px] font-semibold text-[#344054]">No commissions yet</p>
                        <p className="mt-1 text-[12.5px] text-[#8a92a6]">
                            Commissions will show up here once they're earned.
                        </p>
                    </div>
                </div>

                {/* Pagination */}
                <div className="mt-4 flex items-center justify-between border-t border-[#f0f2f5] pt-4">
                    <div className="flex items-center gap-4 text-[13px] text-[#667085]">
                        <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-[#101828]">10</span>
                            <ChevronDown size={14} className="text-[#8a92a6]" />
                        </div>
                        <span className="font-medium">No records to show</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            disabled
                            className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[#d0d5dd] transition-colors"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-[#0E1B3D] text-[12px] font-semibold text-white">
                            1
                        </button>
                        <button
                            disabled
                            className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[#d0d5dd] transition-colors"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Commissions;