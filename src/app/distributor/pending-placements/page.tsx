"use client";

import DashboardHeader from "@/components/Distributor/distributor/DashboardHeader";
import Sidebar from "../../../components/Distributor/distributor/Sidebar";
import PendingPlacements from "./PendingPlacements";

export default function page() {
    return (
        <div style={{ fontFamily: "'Lato', sans-serif" }} className="min-h-screen w-full bg-white">
            <DashboardHeader distributorId="AIA603525" />

            <div className="relative flex min-h-[calc(100vh-72px)]">
                <Sidebar />
                <div className="min-w-0 flex-1 bg-[#f7f8fa] px-4 pb-4 pt-2">
                    <div className="mt-1">
                        <PendingPlacements />
                    </div>
                </div>
            </div>
        </div>
    );
}