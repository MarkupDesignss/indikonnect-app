"use client";

import DashboardHeader from "@/features/distributor/shell/DashboardHeader";
import Sidebar from "@/features/distributor/shell/Sidebar";
import Account from "@/features/distributor/routes/accounts/Account";

export default function AccountsPage() {
    return (
        <div className="min-h-screen w-full bg-white">
            <div className="w-full h-full">
                <div className="w-full bg-white">
                    <DashboardHeader distributorId="AIA603525" />

                    <div className="flex min-h-[calc(100vh-72px)] relative">
                        <Sidebar />

                        <div className="min-w-0 flex-1 bg-[#fafcff] px-6 pt-5 pb-8">
                            <Account />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}