"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ModalShellProps } from "@/features/distributor/routes/buy-back/BuyBack.parts/support";


export const ModalShell = ({
  onClose,
  maxWidth = "max-w-xl",
  children,
}: ModalShellProps) => (
  <AnimatePresence>
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
      }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/55 p-3 backdrop-blur-[4px] sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.98,
          y: 12,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          scale: 0.98,
          y: 12,
        }}
        transition={{
          duration: 0.2,
        }}
        onClick={(e) => e.stopPropagation()}
        className={`flex max-h-[92vh] w-full ${maxWidth} flex-col overflow-hidden rounded-[18px] border border-neutral-200 bg-white shadow-[0_22px_80px_rgba(0,0,0,0.2)]`}
      >
        {children}
      </motion.div>
    </motion.div>
  </AnimatePresence>
);
