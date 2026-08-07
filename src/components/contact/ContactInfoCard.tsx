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
    delay = 0 
}: ContactInfoCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
        >
            <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#FDCB00]/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-[#1a1a2e]" />
                </div>
                <div>
                    <h4 className="font-semibold text-gray-900 text-sm mb-2" style={{ fontFamily: "'Lato', sans-serif" }}>
                        {title}
                    </h4>
                    <div className="text-sm text-gray-600 space-y-1" style={{ fontFamily: "'Lato', sans-serif" }}>
                        {children}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}