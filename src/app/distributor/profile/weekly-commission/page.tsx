"use client";

import DashboardHeader from "@/components/Distributor/distributor/DashboardHeader";
import Sidebar from "../../Sidebar";
import TrackingDashboard from "../TrackingDashboard";

export default function WeeklyCVDatePage() {
    return (
        <div className="min-h-screen w-full bg-white">
            <div className="w-full h-full">
                <div className="w-full bg-white">
                    <DashboardHeader distributorId="AIA603525" />

                    <div className="flex min-h-[calc(100vh-72px)] relative">
                        <Sidebar />
                        <div className="min-w-0 flex-1 bg-[#fafcff] px-8 pt-6 pb-8">
                            <TrackingDashboard variant="cv" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}