"use client";

import {
    Users,
    UserPlus,
    Award,
    UserCheck,
    Search,
    ChevronDown,
    PenLine,
} from "lucide-react";
import { useState } from "react";

const Referral = () => {
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <div className="rounded-[12px] border border-[#edf0f3] bg-white p-[20px] shadow-sm">
            {/* Heading */}
            <h1 className="text-[16px] font-semibold text-[#1a2332]">My Referrals</h1>

            {/* ================= TOP CARDS ================= */}
            <div className="mt-5 flex gap-3">
                {/* 1. Total */}
                <div className="flex h-[90px] flex-1 items-center justify-between rounded-[12px] border border-[#edf0f3] bg-white p-4 shadow-sm">
                    <div>
                        <p className="text-[12px] font-medium text-[#5a6276]">Total</p>
                        <p className="mt-1 text-[22px] font-bold text-[#17b963]">0</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8faef]">
                        <Users className="h-5 w-5 text-[#17b963]" />
                    </div>
                </div>

                {/* 2. Registered */}
                <div className="flex h-[90px] flex-1 items-center justify-between rounded-[12px] border border-[#edf0f3] bg-white p-4 shadow-sm">
                    <div>
                        <p className="text-[12px] font-medium text-[#5a6276]">Registered</p>
                        <p className="mt-1 text-[22px] font-bold text-[#e3aa00]">0</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff4e0]">
                        <UserPlus className="h-5 w-5 text-[#e3aa00]" />
                    </div>
                </div>

                {/* 3. Qualified */}
                <div className="flex h-[90px] flex-1 items-center justify-between rounded-[12px] border border-[#edf0f3] bg-white p-4 shadow-sm">
                    <div>
                        <p className="text-[12px] font-medium text-[#5a6276]">Qualified</p>
                        <p className="mt-1 text-[22px] font-bold text-[#3c78e9]">0</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#edf3ff]">
                        <Award className="h-5 w-5 text-[#3c78e9]" />
                    </div>
                </div>

                {/* 4. Activated */}
                <div className="flex h-[90px] flex-1 items-center justify-between rounded-[12px] border border-[#edf0f3] bg-white p-4 shadow-sm">
                    <div>
                        <p className="text-[12px] font-medium text-[#5a6276]">Activated</p>
                        <p className="mt-1 text-[22px] font-bold text-[#a855f7]">0</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f3e8ff]">
                        <UserCheck className="h-5 w-5 text-[#a855f7]" />
                    </div>
                </div>
            </div>

            {/* ================= FILTERS & SEARCH ================= */}
            <div className="mt-6 flex items-center gap-3">
                {/* Search Bar */}
                <div className="relative flex-1">
                    <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b0b8c8]"
                    />
                    <input
                        type="text"
                        placeholder="Search by ID, Name, or Email"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-[40px] w-full rounded-[6px] border border-[#edf0f3] bg-white pl-10 pr-4 text-[12px] text-[#1a2332] outline-none placeholder:text-[#b0b8c8] focus:border-[#3964FE] focus:ring-2 focus:ring-[#3964FE]/20 transition-all"
                    />
                </div>

                {/* Dropdown */}
                <div className="relative">
                    <select className="h-[40px] w-[120px] rounded-[6px] border border-[#edf0f3] bg-white px-3 text-[12px] text-[#5a6276] outline-none focus:border-[#3964FE] transition-all">
                        <option value="">All</option>
                        <option value="registered">Registered</option>
                        <option value="qualified">Qualified</option>
                        <option value="activated">Activated</option>
                    </select>
                </div>

                {/* Expand All Button */}
                <button className="flex items-center gap-2 h-[40px] rounded-[6px] border border-[#edf0f3] bg-white px-4 text-[12px] font-medium text-[#5a6276] hover:bg-[#f5f6fa] transition-all">
                    <PenLine size={14} />
                    EXPAND ALL
                </button>
            </div>

            {/* ================= TABLE (EMPTY) ================= */}
            <div className="mt-5">
                {/* Table Header */}
                <div className="grid grid-cols-[1.2fr_1.5fr_1fr_1fr_1fr_1fr_1fr] border-b border-[#edf0f4] pb-3 text-[11px] font-semibold uppercase tracking-wider text-[#8a92a6]">
                    <span>Member ID</span>
                    <span>Full Name</span>
                    <span>Rank</span>
                    <span>CV</span>
                    <span>Referrals</span>
                    <span>Status</span>
                    <span>Joined</span>
                </div>

                {/* Empty State */}
                <div className="flex h-[200px] items-center justify-center">
                    <p className="text-[14px] text-[#b0b8c8]">No referrals found.</p>
                </div>
            </div>
        </div>
    );
};

export default Referral;