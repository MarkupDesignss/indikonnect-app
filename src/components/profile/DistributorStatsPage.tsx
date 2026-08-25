"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
    User,
    Package,
    Heart,
    Settings,
    LogOut,
    Star,
    Crown,
    ChevronRight,
    Gift,
    Loader2,
    AlertCircle,
    MapPin,
    DollarSign,
    IndianRupee,
    TrendingUp,
    Wallet,
    Calendar,
    Phone,
    Mail,
    Award,
    Coins,
    ShoppingBag,
    Percent,
    Shield,
    BarChart3,
    PieChart,
    Target,
    Zap,
    Clock
} from "lucide-react";
import { useRouter } from "next/navigation";

import { useGetDistributorStatsQuery } from "@/lib/redux/api/headerApi";

// Skeleton Loader
const SkeletonLoader = () => (
    <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="h-12 w-12 bg-gray-200 rounded-full mx-auto"></div>
                    <div className="h-4 w-24 bg-gray-200 rounded mx-auto mt-3"></div>
                    <div className="h-8 w-20 bg-gray-200 rounded mx-auto mt-2"></div>
                </div>
            ))}
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 w-full bg-gray-200 rounded"></div>
                ))}
            </div>
        </div>
    </div>
);

// Stats Card Component
const StatsCard = ({ 
    icon: Icon, 
    label, 
    value, 
    delay, 
    subtitle, 
    valueColor = "text-[#2B2420]",
    bgColor = "bg-[#FDCB00]/10"
}: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_-8px_rgba(43,36,32,0.06)] border border-[#E7DBC0]/40 text-center hover:shadow-lg transition-shadow"
    >
        <div className={`w-12 h-12 ${bgColor} rounded-full flex items-center justify-center mx-auto mb-3`}>
            <Icon className="w-6 h-6 text-[#C9A227]" />
        </div>
        <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
        <p
            className="text-sm text-[#8a7f6e]"
            style={{ fontFamily: "Jost, sans-serif" }}
        >
            {label}
        </p>
        {subtitle && (
            <p
                className="text-xs text-[#8a7f6e]/60 mt-1"
                style={{ fontFamily: "Jost, sans-serif" }}
            >
                {subtitle}
            </p>
        )}
    </motion.div>
);

// Info Card Component
const InfoCard = ({ icon: Icon, label, value, delay }: any) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay }}
        className="flex items-center gap-4 p-4 bg-white rounded-xl border border-[#E7DBC0]/40 hover:shadow-md transition-shadow"
    >
        <div className="w-10 h-10 bg-[#FDCB00]/10 rounded-full flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-[#C9A227]" />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-xs text-[#8a7f6e]" style={{ fontFamily: "Jost, sans-serif" }}>
                {label}
            </p>
            <p className="text-sm font-semibold text-[#2B2420] truncate" style={{ fontFamily: "Jost, sans-serif" }}>
                {value || "N/A"}
            </p>
        </div>
    </motion.div>
);

// Achievement Badge Component
const AchievementBadge = ({ icon: Icon, label, value, color = "text-[#C9A227]" }: any) => (
    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-[#FBF6EC] to-transparent rounded-xl border border-[#E7DBC0]/30">
        <div className={`w-8 h-8 rounded-full bg-[#FDCB00]/10 flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-4 h-4 ${color}`} />
        </div>
        <div className="flex-1">
            <p className="text-xs text-[#8a7f6e]" style={{ fontFamily: "Jost, sans-serif" }}>
                {label}
            </p>
            <p className="text-sm font-semibold text-[#2B2420]" style={{ fontFamily: "Jost, sans-serif" }}>
                {value}
            </p>
        </div>
    </div>
);

interface DistributorStats {
    success: boolean;
    data: {
        user_id: number;
        full_name: string;
        email: string;
        phone: string;
        total_orders: number;
        total_amount_mrp: number;
        total_savings: number;
        total_coins_earned: number;
        account_type: string;
        joined_at: string;
    };
    message: string;
}

export default function DistributorStatsPage() {
    const router = useRouter();
    
    // Use RTK Query hook to fetch data dynamically
    const { data: statsData, isLoading, error, refetch } = useGetDistributorStatsQuery({});

    // Format date
    const formatDate = (dateString: string) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    // Format currency in Rupees
    const formatCurrency = (amount: number = 0) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
            minimumFractionDigits: 0
        }).format(amount);
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
                delayChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 25,
            },
        },
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#FBF8F2]">
                <div className="container mx-auto px-4 py-8">
                    <SkeletonLoader />
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-[#FBF8F2] flex items-center justify-center">
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-red-200 max-w-md w-full text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-[#2B2420] mb-2">Error Loading Stats</h3>
                    <p className="text-[#8a7f6e] mb-4">Failed to load distributor statistics. Please try again.</p>
                    <button
                        onClick={() => refetch()}
                        className="px-6 py-2 bg-[#2B2420] text-white rounded-lg hover:bg-[#3d332e] transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FBF8F2]">
            {/* Banner - Removed Image import */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="relative w-full h-[160px] md:h-[220px] lg:h-[280px] overflow-hidden bg-gradient-to-r from-[#2B2420] to-[#92403F]"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent flex items-center">
                    <div className="container mx-auto px-4">
                        <div className="px-6 md:px-12 max-w-2xl">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                <motion.div
                                    className="flex items-center gap-3 mb-2"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <Crown className="w-8 h-8 text-[#FDCB00]" />
                                    <span className="text-white/70 font-serif text-sm font-medium tracking-widest uppercase">
                                        Distributor
                                    </span>
                                </motion.div>
                                <motion.h1
                                    className="font-serif text-3xl md:text-5xl font-semibold text-white mb-2"
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    Distributor Stats
                                </motion.h1>
                                <motion.p
                                    className="text-white/80 text-sm"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    Welcome back, {statsData?.data?.full_name || "Distributor"}
                                </motion.p>
                            </motion.div>
                        </div>
                    </div>
                </div>
                <motion.div
                    className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#FBF8F2] to-transparent"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                />
            </motion.div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-6"
                >
                    {/* Stats Cards */}
                    <motion.div
                        variants={itemVariants}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                    >
                        <StatsCard
                            icon={ShoppingBag}
                            label="Total Orders"
                            value={statsData?.data?.total_orders || 0}
                            delay={0.1}
                            bgColor="bg-blue-50"
                        />
                        <StatsCard
                            icon={IndianRupee}
                            label="Total Amount (MRP)"
                            value={formatCurrency(statsData?.data?.total_amount_mrp || 0)}
                            delay={0.2}
                            bgColor="bg-green-50"
                        
                        />
                        <StatsCard
                            icon={Percent}
                            label="Total Savings"
                            value={formatCurrency(statsData?.data?.total_savings || 0)}
                            delay={0.3}
                            bgColor="bg-purple-50"
                           
                        />
                        <StatsCard
                            icon={Coins}
                            label="Coins Earned"
                            value={statsData?.data?.total_coins_earned || 0}
                            delay={0.4}
                            bgColor="bg-amber-50"
                          
                        />
                    </motion.div>

                    {/* Profile Information */}
                    <motion.div
                        variants={itemVariants}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                    >
                        {/* Personal Info */}
                        <div className="lg:col-span-2 bg-white rounded-2xl shadow-[0_4px_20px_-8px_rgba(43,36,32,0.06)] border border-[#E7DBC0]/40 p-6">
                            <h3 className="font-serif font-bold text-[#2B2420] text-lg mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-[#C9A227]" />
                                Personal Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InfoCard
                                    icon={User}
                                    label="Full Name"
                                    value={statsData?.data?.full_name}
                                    delay={0.1}
                                />
                                <InfoCard
                                    icon={Mail}
                                    label="Email Address"
                                    value={statsData?.data?.email}
                                    delay={0.2}
                                />
                                <InfoCard
                                    icon={Phone}
                                    label="Phone Number"
                                    value={statsData?.data?.phone}
                                    delay={0.3}
                                />
                                <InfoCard
                                    icon={Calendar}
                                    label="Joined Date"
                                    value={formatDate(statsData?.data?.joined_at || "")}
                                    delay={0.4}
                                />
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-white rounded-2xl shadow-[0_4px_20px_-8px_rgba(43,36,32,0.06)] border border-[#E7DBC0]/40 p-6">
                            <h3 className="font-serif font-bold text-[#2B2420] text-lg mb-4 flex items-center gap-2">
                                <Award className="w-5 h-5 text-[#C9A227]" />
                                Quick Stats
                            </h3>
                            <div className="space-y-3">
                                <AchievementBadge
                                    icon={Shield}
                                    label="Account Type"
                                    value={statsData?.data?.account_type || "Distributor"}
                                    color="text-[#C9A227]"
                                />
                                <AchievementBadge
                                    icon={TrendingUp}
                                    label="Total Orders"
                                    value={statsData?.data?.total_orders || 0}
                                    color="text-blue-600"
                                />
                                <AchievementBadge
                                    icon={Coins}
                                    label="Coins Earned"
                                    value={statsData?.data?.total_coins_earned || 0}
                                    color="text-amber-600"
                                />
                                <AchievementBadge
                                    icon={Wallet}
                                    label="Total Savings"
                                    value={formatCurrency(statsData?.data?.total_savings || 0)}
                                    color="text-emerald-600"
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* Performance & Achievements */}
                    <motion.div
                        variants={itemVariants}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                    >
                        {/* Performance Metrics */}
                        <div className="bg-gradient-to-br from-white to-[#FBF6EC] rounded-2xl shadow-[0_4px_20px_-8px_rgba(43,36,32,0.06)] border border-[#E7DBC0]/40 p-6">
                            <h3 className="font-serif font-bold text-[#2B2420] text-lg mb-4 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-[#C9A227]" />
                                Performance Metrics
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-[#8a7f6e]" style={{ fontFamily: "Jost, sans-serif" }}>
                                            Order Completion
                                        </span>
                                        <span className="font-semibold text-[#2B2420]">0%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div className="bg-gradient-to-r from-[#C9A227] to-[#92403F] h-2.5 rounded-full" style={{ width: '0%' }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-[#8a7f6e]" style={{ fontFamily: "Jost, sans-serif" }}>
                                            Savings Rate
                                        </span>
                                        <span className="font-semibold text-[#2B2420]">0%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-2.5 rounded-full" style={{ width: '0%' }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-[#8a7f6e]" style={{ fontFamily: "Jost, sans-serif" }}>
                                            Coins Accumulation
                                        </span>
                                        <span className="font-semibold text-[#2B2420]">0</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div className="bg-gradient-to-r from-amber-400 to-amber-600 h-2.5 rounded-full" style={{ width: '0%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Achievements */}
                        <div className="bg-gradient-to-br from-white to-[#FBF6EC] rounded-2xl shadow-[0_4px_20px_-8px_rgba(43,36,32,0.06)] border border-[#E7DBC0]/40 p-6">
                            <h3 className="font-serif font-bold text-[#2B2420] text-lg mb-4 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-[#C9A227]" />
                                Achievements
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-4 bg-white rounded-xl border border-[#E7DBC0]/30 text-center hover:shadow-md transition-shadow">
                                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <Target className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <p className="text-xs text-[#8a7f6e]" style={{ fontFamily: "Jost, sans-serif" }}>
                                        First Order
                                    </p>
                                    <p className="text-sm font-semibold text-[#2B2420]">Not Started</p>
                                </div>
                                <div className="p-4 bg-white rounded-xl border border-[#E7DBC0]/30 text-center hover:shadow-md transition-shadow">
                                    <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <Award className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <p className="text-xs text-[#8a7f6e]" style={{ fontFamily: "Jost, sans-serif" }}>
                                        Coins Milestone
                                    </p>
                                    <p className="text-sm font-semibold text-[#2B2420]">0 / 100</p>
                                </div>
                                <div className="p-4 bg-white rounded-xl border border-[#E7DBC0]/30 text-center hover:shadow-md transition-shadow">
                                    <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <TrendingUp className="w-5 h-5 text-green-600" />
                                    </div>
                                    <p className="text-xs text-[#8a7f6e]" style={{ fontFamily: "Jost, sans-serif" }}>
                                        Savings Target
                                    </p>
                                    <p className="text-sm font-semibold text-[#2B2420]">₹0 / ₹1,000</p>
                                </div>
                                <div className="p-4 bg-white rounded-xl border border-[#E7DBC0]/30 text-center hover:shadow-md transition-shadow">
                                    <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <Crown className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <p className="text-xs text-[#8a7f6e]" style={{ fontFamily: "Jost, sans-serif" }}>
                                        Rank Progress
                                    </p>
                                    <p className="text-sm font-semibold text-[#2B2420]">Standard</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Bottom Section */}
                    <motion.div
                        variants={itemVariants}
                        className="bg-gradient-to-r from-[#1a1a2e]/5 to-[#92403F]/5 rounded-2xl p-6 border border-[#C9A227]/20"
                    >
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-3">
                                <Clock className="w-6 h-6 text-[#C9A227]" />
                                <div>
                                    <p className="text-sm font-medium text-[#2B2420]" style={{ fontFamily: "Jost, sans-serif" }}>
                                        Account Status: <span className="text-emerald-600 font-semibold">Active</span>
                                    </p>
                                    <p className="text-xs text-[#8a7f6e]" style={{ fontFamily: "Jost, sans-serif" }}>
                                        Member since {formatDate(statsData?.data?.joined_at || "")}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="px-4 py-2 bg-[#2B2420] text-white rounded-lg text-sm font-medium" style={{ fontFamily: "Jost, sans-serif" }}>
                                    Distributor ID: #{statsData?.data?.user_id || "N/A"}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}