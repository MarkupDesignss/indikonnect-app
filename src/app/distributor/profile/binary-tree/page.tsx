"use client";

import DashboardHeader from "@/components/Distributor/distributor/DashboardHeader";
import BinaryTree from "./BinaryTree";
import Sidebar from "@/components/Distributor/distributor/Sidebar";

export default function BinaryTreePage() {
    return (
        // h-screen ensures full viewport height, overflow-hidden stops body scroll
        <div className="flex h-screen w-full overflow-hidden bg-[#fafcff]">
            
            {/* 1. SIDEBAR: Top-left, full height */}
            <Sidebar />

            {/* 2. RIGHT SIDE COLUMN */}
            <div className="flex flex-1 flex-col min-w-0 h-full">
                
                {/* HEADER: Sticky top */}
                <header className="shrink-0 sticky top-0 z-30 bg-white">
                    <DashboardHeader distributorId="AIA603525" />
                </header>

                {/* MAIN CONTENT: Scrollable */}
                <main className="flex-1 overflow-y-auto px-4 pt-5 pb-8">
                    <BinaryTree />
                </main>
                
            </div>
        </div>
    );
}