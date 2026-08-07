"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { User, Package, Heart, Settings, LogOut, Star, Crown } from "lucide-react";

interface ProfileSidebarProps {
    name: string;
    email: string;
    rating: number;
    activeTab: string;
    onTabChange: (tab: string) => void;
    onLogout: () => void;
}

const navItems = [
    { icon: User, label: "Overview", tab: "overview", path: "/profile" },
    { icon: Package, label: "My Orders", tab: "orders", path: "/orders" },
    { icon: Heart, label: "Wishlist", tab: "wishlist", path: "/wishlist" },
    { icon: Settings, label: "Account Settings", tab: "settings", path: "/settings" },
];

export default function ProfileSidebar({
    name,
    email,
    rating,
    activeTab,
    onTabChange,
    onLogout,
}: ProfileSidebarProps) {
    const router = useRouter();

    const handleNavigation = (item: typeof navItems[0]) => {
        onTabChange(item.tab);
        router.push(item.path);
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
            {/* Profile Card */}
            <div className="p-6 text-center border-b border-gray-100 bg-gradient-to-b from-[#1a1a2e]/5 to-transparent">
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="w-24 h-24 rounded-full bg-gradient-to-r from-[#1a1a2e] to-[#16213e] mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-[#1a1a2e]/20 border-2 border-[#FDCB00]/30"
                >
                    {name.charAt(0)}
                </motion.div>
                <h3 className="font-bold text-gray-900 text-lg">{name}</h3>
                <p className="text-sm text-gray-500">{email}</p>
                <div className="flex items-center justify-center gap-1 mt-2">
                    <Star className="w-4 h-4 fill-[#FDCB00] text-[#FDCB00]" />
                    <span className="text-sm font-medium text-gray-700">{rating}</span>
                    <span className="text-xs text-gray-400 ml-1">•</span>
                    <Crown className="w-3.5 h-3.5 text-[#FDCB00]" />
                </div>
            </div>

            {/* Navigation */}
            <nav className="p-3">
                {navItems.map((item) => (
                    <motion.button
                        key={item.label}
                        whileHover={{ x: 5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleNavigation(item)}
                        className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm transition-all ${activeTab === item.tab
                                ? "bg-[#FDCB00]/10 text-[#1a1a2e] font-semibold border border-[#FDCB00]/20"
                                : "text-gray-600 hover:bg-gray-50"
                            }`}
                    >
                        <item.icon className={`w-4 h-4 ${activeTab === item.tab ? "text-[#FDCB00]" : ""}`} />
                        {item.label}
                        {activeTab === item.tab && (
                            <motion.div
                                layoutId="activeTab"
                                className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FDCB00]"
                            />
                        )}
                    </motion.button>
                ))}
                <div className="border-t border-gray-100 mt-3 pt-3">
                    <button
                        onClick={onLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-all"
                    >
                        <LogOut className="w-4 h-4" />
                        Log Out
                    </button>
                </div>
            </nav>
        </div>
    );
}