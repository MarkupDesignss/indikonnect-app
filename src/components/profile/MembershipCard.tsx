"use client";

import { motion } from "framer-motion";
import { Crown, Target, Sparkles } from "lucide-react";

interface MembershipCardProps {
    tier: string;
    discount: number;
    points: number;
    pointsToNext: number;
    nextTier: string;
}

export default function MembershipCard({
    tier,
    discount,
    points,
    pointsToNext,
    nextTier,
}: MembershipCardProps) {
    const progress = (points / (points + pointsToNext)) * 100;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-2xl shadow-lg border border-[#FDCB00]/20 p-6 overflow-hidden relative"
        >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FDCB00]/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#FDCB00]/5 rounded-full blur-3xl"></div>

            <div className="relative z-10">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-r from-[#FDCB00] to-[#E5B800] flex items-center justify-center shadow-lg shadow-[#FDCB00]/20">
                            <Crown className="w-7 h-7 text-[#1a1a2e]" />
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-lg">{tier}</h4>
                            <p className="text-sm text-[#FDCB00]">
                                {discount}% off all retail orders
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-[#FDCB00]" />
                            <span className="text-sm font-medium text-gray-300">
                                {points} points to {nextTier}
                            </span>
                        </div>
                        <div className="w-48 h-1.5 bg-gray-700 rounded-full mt-1 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(progress, 100)}%` }}
                                transition={{ duration: 1, delay: 0.5 }}
                                className="h-full bg-gradient-to-r from-[#FDCB00] to-[#E5B800] rounded-full shadow-lg shadow-[#FDCB00]/30"
                            />
                        </div>
                        <div className="flex items-center justify-end gap-1 mt-1">
                            <Sparkles className="w-3 h-3 text-[#FDCB00]" />
                            <span className="text-[10px] text-gray-400">
                                {Math.round(progress)}% to next tier
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}