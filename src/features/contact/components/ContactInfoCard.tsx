"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface ContactInfoCardProps {
    icon: LucideIcon;
    title: string;
    children: React.ReactNode;
    delay?: number;
}

export default function ContactInfoCard({
    icon: Icon,
    title,
    children,
    delay = 0,
}: ContactInfoCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            transition={{ delay, duration: 0.4 }}
            className="bg-white rounded-xl border border-[#E7DDCE] px-5 py-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
        >
            <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-lg bg-[#F7F1E6] flex items-center justify-center flex-shrink-0">
                    <Icon
                        className="w-5 h-5"
                        strokeWidth={1.8}
                        style={{ color: "#101B3D" }}
                    />
                </div>

                <div className="min-w-0">
                    <h4 className="text-[13px] font-semibold text-[#101B3D] mb-1.5">
                        {title}
                    </h4>

                    <div className="text-[13px] leading-5 text-[#77758A]">
                        {children}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}