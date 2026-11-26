"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";


export const overlayVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15 },
  },
};


export const modalVariants = {
  hidden: { scale: 0.98, opacity: 0, y: 12 },
  visible: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 28,
    },
  },
  exit: {
    scale: 0.98,
    opacity: 0,
    y: 12,
    transition: { duration: 0.15 },
  },
};


export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.04,
    },
  },
};


export const staggerItem = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 22,
    },
  },
};


export const Toast = ({
  show,
  message,
}: {
  show: boolean;
  message: string;
}) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{
          opacity: 0,
          y: -14,
          scale: 0.96,
          transition: { duration: 0.18 },
        }}
        transition={{
          type: "spring",
          stiffness: 350,
          damping: 24,
        }}
        className="fixed left-1/2 top-6 z-[10001] flex -translate-x-1/2 items-center gap-2.5 rounded-[8px] border border-[#E4E4E2] bg-white px-4 py-3 shadow-[0_18px_60px_rgba(0,0,0,0.14)]"
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#111111]">
          <CheckCircle2 className="h-3.5 w-3.5 text-white" />
        </div>

        <span className="text-[12px] font-medium text-[#171717]">
          {message}
        </span>
      </motion.div>
    )}
  </AnimatePresence>
);
