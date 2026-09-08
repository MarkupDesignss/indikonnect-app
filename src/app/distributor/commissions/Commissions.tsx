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
    ChevronRight
} from "lucide-react";
import { useState } from "react";

const Commissions = () => {
    const [filterType, setFilterType] = useState("All Types");

    return (
        <div className="rounded-[12px] border border-[#edf0f3] bg-white p-[20px] shadow-sm">
            {/* Heading */}
            <h1 className="text-[16px] font-semibold text-[#1a2332]">My Commissions</h1>

            {/* ================= TOP CARDS ================= */}
            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                {/* 1. Retail Profit */}
                <div className="flex h-[80px] items-center justify-between rounded-[12px] border border-[#edf0f3] bg-white px-4 shadow-sm">
                    <div>
                        <p className="text-[12px] font-medium text-[#5a6276]">Retail Profit</p>
                        <p className="mt-1 text-[20px] font-bold text-[#3c78e9]">$ 0.00</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#edf3ff]">
                        <BarChart3 className="h-5 w-5 text-[#3c78e9]" />
                    </div>
                </div>

                {/* 2. Weekly Pairing */}
                <div className="flex h-[80px] items-center justify-between rounded-[12px] border border-[#edf0f3] bg-white px-4 shadow-sm">
                    <div>
                        <p className="text-[12px] font-medium text-[#5a6276]">Weekly Pairing</p>
                        <p className="mt-1 text-[20px] font-bold text-[#e3aa00]">$ 0.00</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff4e0]">
                        <BookOpen className="h-5 w-5 text-[#e3aa00]" />
                    </div>
                </div>

                {/* 3. Unilevel Green Coin */}
                <div className="flex h-[80px] items-center justify-between rounded-[12px] border border-[#edf0f3] bg-white px-4 shadow-sm">
                    <div>
                        <p className="text-[12px] font-medium text-[#5a6276]">Unilevel Green Coin</p>
                        <p className="mt-1 text-[20px] font-bold text-[#17b963]">0</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8faef]">
                        <Coins className="h-5 w-5 text-[#17b963]" />
                    </div>
                </div>

                {/* 4. Strong leg */}
                <div className="flex h-[80px] items-center justify-between rounded-[12px] border border-[#edf0f3] bg-white px-4 shadow-sm">
                    <div>
                        <p className="text-[12px] font-medium text-[#5a6276]">Strong leg</p>
                        <p className="mt-1 text-[20px] font-bold text-[#a855f7]">$ 0.00</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f3e8ff]">
                        <Award className="h-5 w-5 text-[#a855f7]" />
                    </div>
                </div>
            </div>

            {/* Second Row of Cards (Floating & Released) */}
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                {/* 5. Floating (Pending Release) */}
                <div className="flex h-[80px] items-center justify-between rounded-[12px] border border-[#edf0f3] bg-white px-4 shadow-sm">
                    <div>
                        <p className="text-[12px] font-medium text-[#5a6276]">
                            Floating (Pending Release)
                        </p>
                        <p className="mt-1 text-[20px] font-bold text-[#3c78e9]">$ 0.00</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#edf3ff]">
                        <Sparkles className="h-5 w-5 text-[#3c78e9]" />
                    </div>
                </div>

                {/* 6. Released */}
                <div className="flex h-[80px] items-center justify-between rounded-[12px] border border-[#edf0f3] bg-white px-4 shadow-sm">
                    <div>
                        <p className="text-[12px] font-medium text-[#5a6276]">Released</p>
                        <p className="mt-1 text-[20px] font-bold text-[#3c78e9]">$ 0.00</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8faef]">
                        <CheckCircle2 className="h-5 w-5 text-[#17b963]" />
                    </div>
                </div>
            </div>

            {/* ================= COMMISSIONS HISTORY TABLE ================= */}
            <div className="mt-8">
                {/* Header with Filter Dropdown */}
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-[14px] font-semibold text-[#1a2332]">Commissions History</h3>
                    <div className="relative">
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="h-[36px] w-[140px] rounded-[6px] border border-[#edf0f3] bg-white px-3 text-[12px] text-[#5a6276] outline-none focus:border-[#3964FE] transition-all"
                        >
                            <option value="All Types">All Types</option>
                            <option value="Retail Profit">Retail Profit</option>
                            <option value="Weekly Pairing">Weekly Pairing</option>
                            <option value="Unilevel Green Coin">Unilevel Green Coin</option>
                            <option value="Strong leg">Strong leg</option>
                            <option value="Floating">Floating</option>
                            <option value="Released">Released</option>
                        </select>
                    </div>
                </div>

                {/* Table Header */}
                <div className="grid grid-cols-[1.2fr_1.2fr_1.2fr_1.5fr_1fr_1.2fr_1.2fr] border-b border-[#edf0f4] pb-3 text-[11px] font-semibold uppercase tracking-wider text-[#8a92a6]">
                    <span>Category</span>
                    <span>Date Created</span>
                    <span>Date Release</span>
                    <span>Description</span>
                    <span>Amount</span>
                    <span>Related OrderID</span>
                    <span>Related Member</span>
                </div>

                {/* Empty State */}
                <div className="mt-6 flex h-[150px] items-center justify-center">
                    <p className="text-[13px] font-medium uppercase tracking-wider text-[#b0b8c8]">
                        No Data Available in the Table
                    </p>
                </div>

                {/* Pagination */}
                <div className="mt-4 flex items-center justify-between border-t border-[#f0f2f5] pt-4">
                    <div className="flex items-center gap-4 text-[12px] text-[#5a6276]">
                        <div className="flex items-center gap-2">
                            <span>10</span>
                            <ChevronDown size={14} className="text-[#8a92a6]" />
                        </div>
                        <span className="uppercase font-medium tracking-wider">
                            Showing no records
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="flex h-7 w-7 items-center justify-center rounded-[4px] text-[#b0b8c8] hover:bg-[#f0f4ff] hover:text-[#3964FE] transition-colors">
                            <ChevronLeft size={16} />
                        </button>
                        <button className="flex h-7 w-7 items-center justify-center rounded-[4px] bg-[#3964FE] text-[12px] font-medium text-white shadow-sm shadow-[#3964FE]/30">
                            1
                        </button>
                        <button className="flex h-7 w-7 items-center justify-center rounded-[4px] text-[#b0b8c8] hover:bg-[#f0f4ff] hover:text-[#3964FE] transition-colors">
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Commissions;