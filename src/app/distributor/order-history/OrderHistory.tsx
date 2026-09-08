"use client";

import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Search,
} from "lucide-react";
import { useState } from "react";
import DashboardHeader from "@/components/Distributor/distributor/DashboardHeader";
import Sidebar from "../Sidebar";

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

const mockOrders: Order[] = Array.from({ length: 10 }, (_, i) => ({
    id: "A-2906B19-6799889",
    name: "SAURABH KAINTH",
    total: "RS.00",
    method: "Free",
    cv: "+0.00",
    greenCoin: 0,
    blueCoin: 0,
    status: "NEW",
    createdAt: "18/06/2026 17:21:23",
}));

function OrderHistory() {
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <section className="rounded-[12px] border border-[#edf0f3] bg-white shadow-sm p-[20px]">
            {/* Search Bar */}
            <div className="relative max-w-xs mb-5">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b0b8c8]" />
                <input
                    type="text"
                    placeholder="Search Order"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-[40px] w-full rounded-[6px] border border-[#e5e9ef] bg-white pl-10 pr-4 text-[12px] text-[#1a2332] outline-none placeholder:text-[#b0b8c8] focus:border-[#3964FE] focus:ring-2 focus:ring-[#3964FE]/20 transition-all"
                />
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-[1.5fr_1.5fr_0.8fr_1fr_1fr_1fr_1.5fr_1.5fr] border-b border-[#edf0f4] pb-3 text-[11px] font-semibold uppercase tracking-wider text-[#8a92a6]">
                <span>Order ID</span>
                <span>Name</span>
                <span>Total</span>
                <span>Method</span>
                <span>CV</span>
                <span>Coins</span>
                <span>Status</span>
                <span className="text-right">Created At / Actions</span>
            </div>

            {/* Table Rows */}
            <div className="mt-2">
                {mockOrders.map((order, idx) => (
                    <div
                        key={idx}
                        className={`grid grid-cols-[1.5fr_1.5fr_0.8fr_1fr_1fr_1fr_1.5fr_1.5fr] items-center py-4 text-[12px] text-[#1a2332] ${idx !== mockOrders.length - 1 ? "border-b border-dashed border-[#edf0f4]" : ""
                            }`}
                    >
                        <span className="font-medium text-[#1a2332]">{order.id}</span>
                        <span className="font-medium text-[#1a2332]">{order.name}</span>
                        <span className="text-[#5a6276]">{order.total}</span>
                        <span>
                            <span className="rounded-[4px] bg-[#e8e8e8] px-2 py-1 text-[10px] font-medium text-[#5a6276]">{order.method}</span>
                        </span>
                        <span className="text-[#5a6276]">{order.cv}</span>
                        <div className="flex items-center gap-1.5">
                            <span className="flex h-4 w-5 items-center justify-center rounded-[2px] bg-[#17b963] text-[9px] font-bold text-white">{order.greenCoin}</span>
                            <span className="flex h-4 w-5 items-center justify-center rounded-[2px] bg-[#3c78e9] text-[9px] font-bold text-white">{order.blueCoin}</span>
                        </div>
                        <span>
                            <span className="rounded-[4px] bg-[#e8e8e8] px-2 py-1 text-[10px] font-semibold text-[#5a6276]">{order.status}</span>
                        </span>
                        <div className="flex items-center justify-end gap-6">
                            <span className="text-[#5a6276]">{order.createdAt}</span>
                            <button className="flex items-center gap-1 rounded-[4px] bg-[#e8e8e8] px-3 py-1.5 text-[11px] font-medium text-[#5a6276] hover:bg-[#dcdcdc] transition-colors">
                                Actions
                                <ChevronDown size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between border-t border-[#f0f2f5] pt-4">
                <div className="flex items-center gap-4 text-[12px] text-[#5a6276]">
                    <div className="flex items-center gap-2">
                        <span>10</span>
                        <ChevronDown size={14} className="text-[#8a92a6]" />
                    </div>
                    <span className="uppercase font-medium tracking-wider">Showing 1 to 10 of 24 records</span>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex h-7 w-7 items-center justify-center rounded-[4px] text-[#b0b8c8] hover:bg-[#f0f4ff] hover:text-[#3964FE] transition-colors">
                        <ChevronLeft size={16} />
                    </button>
                    <button className="flex h-7 w-7 items-center justify-center rounded-[4px] bg-[#3964FE] text-[12px] font-medium text-white shadow-sm shadow-[#3964FE]/30">1</button>
                    <button className="flex h-7 w-7 items-center justify-center rounded-[4px] text-[12px] text-[#5a6276] hover:bg-[#f0f4ff] hover:text-[#3964FE] transition-colors">2</button>
                    <button className="flex h-7 w-7 items-center justify-center rounded-[4px] text-[12px] text-[#5a6276] hover:bg-[#f0f4ff] hover:text-[#3964FE] transition-colors">3</button>
                    <button className="flex h-7 w-7 items-center justify-center rounded-[4px] text-[#b0b8c8] hover:bg-[#f0f4ff] hover:text-[#3964FE] transition-colors">
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </section>
    );
}

export default function OrderHistoryPage() {
    return (
        <div className="min-h-screen w-full bg-white">
            <div className="w-full h-full">
                <div className="w-full bg-white">
                    

                    <div className="flex min-h-[calc(100vh-72px)] relative">
                       

                        <div className="min-w-0 flex-1 bg-[#fafcff] px-8 pt-6 pb-8">
                            <h1 className="text-[20px] font-semibold text-[#20252b]">Order History</h1>

                            <div className="mt-[20px]">
                                <OrderHistory />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}