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
            whileHover={{
                y: -4,
                boxShadow: "0 8px 25px rgba(43,36,32,0.08)",
                borderColor: "#C9A227/30"
            }}
            className="bg-white rounded-2xl shadow-[0_4px_20px_-8px_rgba(43,36,32,0.06)] border border-[#E7DBC0]/40 p-4 text-center transition-all duration-300"
        >
            <div className="w-12 h-12 rounded-full bg-[#FDCB00]/10 flex items-center justify-center mx-auto mb-2">
                <Icon className="w-6 h-6 text-[#2B2420]" />
            </div>
            <p className="text-2xl font-serif font-semibold text-[#2B2420]">
                {value}
            </p>
            <p className="text-xs text-[#8a7f6e] font-medium tracking-wide" style={{ fontFamily: 'Jost, sans-serif' }}>
                {label}
            </p>
        </motion.div>
    );
}