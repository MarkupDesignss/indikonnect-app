"use client";

import DashboardHeader from "@/features/distributor/shell/DashboardHeader";
import Sidebar from "@/features/distributor/shell/Sidebar";
import WalletPage from "@/features/distributor/routes/wallet/wallet";

export default function WalletPageRoute() {
    return (
        <div className="min-h-screen w-full bg-white">
            <div className="w-full h-full">
                <div className="w-full bg-white">
                    <DashboardHeader distributorId="AIA603525" />

                    <div className="flex min-h-[calc(100vh-72px)] relative">
                        <Sidebar />

                        <div className="min-w-0 flex-1 bg-[#fafcff] px-8 pt-6 pb-8">
                            <WalletPage />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}