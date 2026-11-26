"use client";

import DashboardHeader from "@/features/distributor/shell/DashboardHeader";
import Sidebar from "@/features/distributor/shell/Sidebar";
import BuyBack from "@/features/distributor/routes/buy-back/BuyBack";
export default function OrderHistoryPage() {
    return (
        <div style={{ fontFamily: "'Lato', sans-serif" }} className="min-h-screen w-full bg-white">
            <DashboardHeader distributorId="AIA603525" />

            <div className="relative flex min-h-[calc(100vh-72px)]">
                <Sidebar />
                <div className="min-w-0 flex-1 bg-[#f7f8fa] px-4 pb-8 pt-5">
                    <h1 className="text-[24px] font-black tracking-[-0.01em] text-[#101828]">Buy Back</h1>

                    <div className="mt-3">
                        <BuyBack />
                    </div>
                </div>
            </div>
        </div>
    );
}