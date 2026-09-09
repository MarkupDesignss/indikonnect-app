"use client";

import {
    Users,
    UserPlus,
    Award,
    UserCheck,
    Search,
    Maximize2,
    Inbox,
} from "lucide-react";
import { useState } from "react";

const NAVY = "#0E1B3D";
const BRASS = "#B8935A";
const EMERALD = "#1f9d6b";
const INDIGO = "#3955A6";

const STATS = [
    { label: "Total", value: 0, color: NAVY, bg: "#eceefb", icon: Users },
    { label: "Registered", value: 0, color: BRASS, bg: "#f8f1e4", icon: UserPlus },
    { label: "Qualified", value: 0, color: INDIGO, bg: "#eceffb", icon: Award },
    { label: "Activated", value: 0, color: EMERALD, bg: "#eaf7f0", icon: UserCheck },
];

const TABLE_COLUMNS = ["Member ID", "Full name", "Rank", "CV", "Referrals", "Status", "Joined"];

const Referral = () => {
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <div
            style={{ fontFamily: "'Lato', sans-serif" }}
            className="rounded-[16px] border border-[#e7e9ee] bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.03)]"
        >
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,400&display=swap');
            `}</style>

            {/* Heading */}
            <h1 className="text-[17px] font-bold text-[#101828]">My referrals</h1>

            {/* ================= TOP CARDS ================= */}
            <div className="mt-5 flex flex-wrap gap-3">
                {STATS.map(({ label, value, color, bg, icon: Icon }) => (
                    <div
                        key={label}
                        className="flex h-[92px] min-w-[160px] flex-1 items-center justify-between rounded-[14px] border border-[#e7e9ee] bg-white px-4"
                    >
                        <div>
                            <p className="text-[12px] font-semibold text-[#667085]">{label}</p>
                            <p className="mt-1 text-[22px] font-black" style={{ color }}>
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

            {/* ================= FILTERS & SEARCH ================= */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
                {/* Search Bar */}
                <div className="relative min-w-[220px] flex-1">
                    <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b0b6c3]"
                    />
                    <input
                        type="text"
                        placeholder="Search by ID, name, or email"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-[40px] w-full rounded-[8px] border border-[#e5e9ef] bg-[#f7f8fa] pl-10 pr-4 text-[13px] text-[#101828] outline-none transition-all placeholder:text-[#b0b6c3] focus:border-[#0E1B3D] focus:bg-white focus:ring-2 focus:ring-[#0E1B3D]/10"
                    />
                </div>

                {/* Dropdown */}
                <select className="h-[40px] w-[130px] rounded-[8px] border border-[#e5e9ef] bg-[#f7f8fa] px-3 text-[13px] text-[#101828] outline-none transition-all focus:border-[#0E1B3D] focus:bg-white focus:ring-2 focus:ring-[#0E1B3D]/10">
                    <option value="">All statuses</option>
                    <option value="registered">Registered</option>
                    <option value="qualified">Qualified</option>
                    <option value="activated">Activated</option>
                </select>

                {/* Expand All Button */}
                <button className="flex h-[40px] items-center gap-2 rounded-[8px] border border-[#e5e9ef] bg-white px-4 text-[13px] font-semibold text-[#344054] transition-colors hover:bg-[#f7f8fa]">
                    <Maximize2 size={14} />
                    Expand all
                </button>
            </div>

            {/* ================= TABLE ================= */}
            <div className="mt-6 overflow-x-auto">
                {/* Table Header */}
                <div className="grid min-w-[760px] grid-cols-[1.2fr_1.5fr_1fr_1fr_1fr_1fr_1fr] gap-2 border-b border-[#e7e9ee] pb-3 text-[11.5px] font-bold tracking-wide text-[#8a92a6]">
                    {TABLE_COLUMNS.map((col) => (
                        <span key={col}>{col}</span>
                    ))}
                </div>

                {/* Empty State */}
                <div className="flex min-w-[760px] flex-col items-center justify-center gap-3 py-14">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f2f4f7]">
                        <Inbox className="h-5 w-5 text-[#98a2b3]" />
                    </div>
                    <div className="text-center">
                        <p className="text-[13.5px] font-semibold text-[#344054]">No referrals yet</p>
                        <p className="mt-1 text-[12.5px] text-[#8a92a6]">
                            People you refer will show up here once they sign up.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Referral;