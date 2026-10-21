"use client";

import DashboardHeader from "@/components/Distributor/distributor/DashboardHeader";
import Sidebar from "../../../components/Distributor/distributor/Sidebar";
import BinaryTreeV2 from "./BinaryTreeV2";

export default function BinaryTreePage() {
    return (
        <div className="flex min-h-dvh w-full flex-col bg-white">
            {/* Responsive Header */}
            <DashboardHeader distributorId="AIA603525" />

            {/* Sidebar + Main Content */}
            <div className="relative flex w-full min-w-0 flex-1">
                {/* Desktop Sidebar / Mobile Drawer */}
                <Sidebar />

                {/* Main Content */}
                <main className="min-h-0 min-w-0 flex-1 bg-[#fafcff] px-3 py-4 sm:px-4 sm:py-5 md:px-6 lg:px-8 lg:py-6">
                    <div className="w-full min-w-0">
                        <BinaryTreeV2 />
                    </div>
                </main>
            </div>
        </div>
    );
}