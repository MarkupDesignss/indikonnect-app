"use client";

import DashboardHeader from "@/components/Distributor/distributor/DashboardHeader";
import Sidebar from "../Sidebar";
import OrderHistory from "./OrderHistory";
export default function OrderHistoryPage() {
    return (
        <div style={{ fontFamily: "'Lato', sans-serif" }} className="min-h-screen w-full bg-white">
            <DashboardHeader distributorId="AIA603525" />

            <div className="relative flex min-h-[calc(100vh-72px)]">
                <Sidebar />

                <div className="min-w-0 flex-1 bg-[#f7f8fa] px-8 pb-8 pt-6">
                    <h1 className="text-[24px] font-black tracking-[-0.01em] text-[#101828]">Order history</h1>

                    <div className="mt-5">
                        <OrderHistory />
                    </div>
                </div>
            </div>
        </div>
    );
}