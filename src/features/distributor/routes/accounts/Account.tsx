"use client";

import { Search, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface AccountData {
    id: string;
    rank: string;
    status: string;
}

const mockAccounts: AccountData[] = Array.from({ length: 3 }, (_, i) => ({
    id: "A-2606B19-8799889",
    rank: "Silver",
    status: "Activated",
}));

const Account = () => {
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <div className="rounded-[12px] border border-[#edf0f3] bg-white p-[20px] shadow-sm">
            {/* Header */}
            <h1 className="text-[16px] font-semibold text-[#1a2332]">Account</h1>

            {/* Search Bar */}
            <div className="relative mt-4 max-w-[300px]">
                <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b0b8c8]"
                />
                <input
                    type="text"
                    placeholder="Quick Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-[40px] w-full rounded-[6px] border border-[#edf0f3] bg-white pl-10 pr-4 text-[12px] text-[#1a2332] outline-none placeholder:text-[#b0b8c8] focus:border-[#3964FE] focus:ring-2 focus:ring-[#3964FE]/20 transition-all"
                />
            </div>

            {/* Table Header */}
            <div className="mt-6 grid grid-cols-[1.5fr_1fr_1fr] border-b border-[#edf0f4] pb-3 text-[11px] font-semibold uppercase tracking-wider text-[#8a92a6]">
                <span>Account ID</span>
                <span>Rank</span>
                <span>Status</span>
            </div>

            {/* Table Rows */}
            <div className="mt-2">
                {mockAccounts.map((account, idx) => (
                    <div
                        key={idx}
                        className={`grid grid-cols-[1.5fr_1fr_1fr] items-center py-4 text-[12px] text-[#1a2332] ${idx !== mockAccounts.length - 1
                                ? "border-b border-dashed border-[#edf0f4]"
                                : ""
                            }`}
                    >
                        <span className="font-medium text-[#1a2332]">{account.id}</span>
                        <span className="uppercase text-[#5a6276]">{account.rank}</span>
                        <span className="flex items-center gap-2 font-semibold text-[#17b963]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#17b963]" />
                            {account.status}
                        </span>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between border-t border-[#f0f2f5] pt-4">
                <div className="flex items-center gap-4 text-[12px] text-[#5a6276]">
                    <div className="flex items-center gap-2">
                        <span>10</span>
                        <ChevronDown size={14} className="text-[#8a92a6]" />
                    </div>
                    <span className="uppercase font-medium tracking-wider">
                        Showing 3 to 3
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
    );
};

export default Account;