"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
    icon: LucideIcon;
    label: string;
    value: number | string;
    delay?: number;
}

export default function StatsCard({ icon: Icon, label, value, delay = 0 }: StatsCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
                delay,
            }}
            whileHover={{ y: -4, boxShadow: "0 8px 25px rgba(0,0,0,0.08)" }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center transition-all"
        >
            <div className="w-12 h-12 rounded-full bg-[#FDCB00]/10 flex items-center justify-center mx-auto mb-2">
                <Icon className="w-6 h-6 text-[#1a1a2e]" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
        </motion.div>
    );
}