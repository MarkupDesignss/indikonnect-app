"use client";

import DashboardHeader from "@/components/Distributor/distributor/DashboardHeader";
import Sidebar from "../Sidebar"
import OrderHistory from "./OrderHistory"

export default function OrderHistoryPage() {
    return (
        <div className="min-h-screen w-full bg-white">
            <div className="w-full h-full">
                <div className="w-full bg-white">
                    <DashboardHeader distributorId="AIA603525" />

                    <div className="flex min-h-[calc(100vh-72px)] relative">
                        <Sidebar />

                        <div className="min-w-0 flex-1 bg-[#fafcff] px-8 pt-6 pb-8">
                            <h1 className="text-[20px] font-semibold text-[#20252b]">
                                Order History
                            </h1>

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