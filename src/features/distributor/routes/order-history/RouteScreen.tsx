"use client";

import DashboardHeader from "@/features/distributor/shell/DashboardHeader";
import Sidebar from "@/features/distributor/shell/Sidebar";
import OrderHistory from "@/features/distributor/routes/order-history/OrderHistory";
export default function OrderHistoryPage() {
    return (
        <div style={{ fontFamily: "'Lato', sans-serif" }} className="min-h-screen w-full bg-white">
            <DashboardHeader distributorId="AIA603525" />

            <div className="relative flex min-h-[calc(100vh-72px)]">
                <Sidebar />
                <div className="min-w-0 flex-1 bg-[#f7f8fa] px-4 ">
                        <OrderHistory />
                </div>
            </div>
        </div>
    );
}