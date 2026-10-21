"use client";

import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import DashboardHeader from "@/components/Distributor/distributor/DashboardHeader"; 
// Note: Make sure DashboardHeader ka path sahi ho. Agar same folder mein hai toh "./DashboardHeader" karein.

export default function DistributorLayout({
    children,
}: Readonly<{
    children: ReactNode;
}>) {
    return (
        <div className="flex min-h-dvh w-full min-w-0 flex-col bg-white">
            {/* Common Header */}
            <DashboardHeader distributorId="AIA603525" />

            {/* Sidebar + Page Content */}
            <div className="relative flex w-full min-w-0 flex-1">
                {/* Sidebar */}
                <Sidebar />

                {/* Main Content Area */}
                <main className="min-h-0 min-w-0 flex-1 overflow-x-clip bg-[#fafcff] px-3 py-4 sm:px-4 sm:py-5 md:px-6 lg:px-8 lg:py-6">
                    {children}
                </main>
            </div>
        </div>
    );
}