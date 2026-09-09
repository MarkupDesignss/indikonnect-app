"use client";

import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Search,
} from "lucide-react";
import { useState } from "react";

interface Order {
    id: string;
    name: string;
    total: string;
    method: string;
    cv: string;
    greenCoin: number;
    blueCoin: number;
    status: string;
    createdAt: string;
}

const NAVY = "#0E1B3D";
const BRASS = "#B8935A";
const EMERALD = "#1f9d6b";
const INDIGO = "#3955A6";

const mockOrders: Order[] = Array.from({ length: 10 }, (_, i) => ({
    id: `A-2906B19-679988${i}`,
    name: "Saurabh Kainth",
    total: "Rs. 0.00",
    method: "Free",
    cv: "+0.00",
    greenCoin: 0,
    blueCoin: 0,
    status: "New",
    createdAt: "18/06/2026 17:21:23",
}));

const STATUS_STYLES: Record<string, { color: string; bg: string }> = {
    New: { color: INDIGO, bg: "#eceffb" },
    Completed: { color: EMERALD, bg: "#eaf7f0" },
    Pending: { color: BRASS, bg: "#f8f1e4" },
};

export default function OrderHistory() {
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <section className="rounded-[16px] border border-[#e7e9ee] bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
            {/* Search Bar */}
            <div className="relative mb-5 max-w-xs">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b0b6c3]" />
                <input
                    type="text"
                    placeholder="Search order"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-[40px] w-full rounded-[8px] border border-[#e5e9ef] bg-[#f7f8fa] pl-10 pr-4 text-[13px] text-[#101828] outline-none transition-all placeholder:text-[#b0b6c3] focus:border-[#0E1B3D] focus:bg-white focus:ring-2 focus:ring-[#0E1B3D]/10"
                />
            </div>

            {/* Table Header */}
            <div className="overflow-x-auto">
                <div className="grid min-w-[880px] grid-cols-[1.5fr_1.5fr_0.8fr_1fr_1fr_1fr_1.5fr_1.5fr] gap-2 border-b border-[#e7e9ee] pb-3 text-[11.5px] font-bold tracking-wide text-[#8a92a6]">
                    <span>Order ID</span>
                    <span>Name</span>
                    <span>Total</span>
                    <span>Method</span>
                    <span>CV</span>
                    <span>Coins</span>
                    <span>Status</span>
                    <span className="text-right">Created at / actions</span>
                </div>

                {/* Table Rows */}
                <div>
                    {mockOrders.map((order, idx) => {
                        const statusStyle = STATUS_STYLES[order.status] ?? { color: "#667085", bg: "#f2f4f7" };
                        return (
                            <div
                                key={order.id}
                                className={`grid min-w-[880px] grid-cols-[1.5fr_1.5fr_0.8fr_1fr_1fr_1fr_1.5fr_1.5fr] items-center gap-2 py-4 text-[13px] text-[#101828] ${idx !== mockOrders.length - 1 ? "border-b border-dashed border-[#e7e9ee]" : ""
                                    }`}
                            >
                                <span className="font-semibold text-[#0E1B3D]">{order.id}</span>
                                <span className="font-semibold">{order.name}</span>
                                <span className="text-[#667085]">{order.total}</span>
                                <span>
                                    <span className="rounded-[6px] bg-[#f2f4f7] px-2 py-1 text-[11px] font-semibold text-[#475066]">
                                        {order.method}
                                    </span>
                                </span>
                                <span className="text-[#667085]">{order.cv}</span>
                                <div className="flex items-center gap-1.5">
                                    <span
                                        className="flex h-5 w-6 items-center justify-center rounded-[4px] text-[10px] font-bold text-white"
                                        style={{ backgroundColor: EMERALD }}
                                    >
                                        {order.greenCoin}
                                    </span>
                                    <span
                                        className="flex h-5 w-6 items-center justify-center rounded-[4px] text-[10px] font-bold text-white"
                                        style={{ backgroundColor: INDIGO }}
                                    >
                                        {order.blueCoin}
                                    </span>
                                </div>
                                <span>
                                    <span
                                        className="rounded-[6px] px-2 py-1 text-[11px] font-semibold"
                                        style={{ color: statusStyle.color, backgroundColor: statusStyle.bg }}
                                    >
                                        {order.status}
                                    </span>
                                </span>
                                <div className="flex items-center justify-end gap-5">
                                    <span className="text-[#98a2b3]">{order.createdAt}</span>
                                    <button className="flex items-center gap-1 rounded-[6px] border border-[#e5e9ef] bg-white px-3 py-1.5 text-[11.5px] font-semibold text-[#344054] transition-colors hover:bg-[#f7f8fa]">
                                        Actions
                                        <ChevronDown size={13} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between border-t border-[#f0f2f5] pt-4">
                <div className="flex items-center gap-4 text-[13px] text-[#667085]">
                    <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-[#101828]">10</span>
                        <ChevronDown size={14} className="text-[#8a92a6]" />
                    </div>
                    <span className="font-medium">Showing 1–10 of 24 records</span>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[#b0b8c8] transition-colors hover:bg-[#f2f4f7] hover:text-[#0E1B3D]">
                        <ChevronLeft size={16} />
                    </button>
                    <button
                        className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[12px] font-semibold text-white"
                        style={{ backgroundColor: NAVY }}
                    >
                        1
                    </button>
                    <button className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[12px] font-semibold text-[#667085] transition-colors hover:bg-[#f2f4f7] hover:text-[#0E1B3D]">
                        2
                    </button>
                    <button className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[12px] font-semibold text-[#667085] transition-colors hover:bg-[#f2f4f7] hover:text-[#0E1B3D]">
                        3
                    </button>
                    <button className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[#b0b8c8] transition-colors hover:bg-[#f2f4f7] hover:text-[#0E1B3D]">
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </section>
    );
}