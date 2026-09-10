"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { hideToast } from "../../lib/slices/toastSlice";

export function Toast() {
    const dispatch = useAppDispatch();
    const { show, message, type } = useAppSelector((state) => state.toast);

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!show) return;

        const timer = setTimeout(() => {
            dispatch(hideToast());
        }, 3000);

        return () => clearTimeout(timer);
    }, [show, dispatch]);

    const getIcon = () => {
        switch (type) {
            case "success":
                return (
                    <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                        />
                    </svg>
                );

            case "error":
                return (
                    <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                        />
                    </svg>
                );

            case "info":
                return (
                    <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 002 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                        />
                    </svg>
                );

            default:
                return null;
        }
    };

    const getColors = () => {
        switch (type) {
            case "success":
                return "bg-green-50 text-green-800 border-green-200";

            case "error":
                return "bg-red-50 text-red-800 border-red-200";

            case "info":
                return "bg-blue-50 text-blue-800 border-blue-200";

            default:
                return "bg-gray-50 text-gray-800 border-gray-200";
        }
    };

    const getIconColors = () => {
        switch (type) {
            case "success":
                return "text-green-500";

            case "error":
                return "text-red-500";

            case "info":
                return "text-blue-500";

            default:
                return "text-gray-500";
        }
    };

    if (!mounted) return null;

    const toastContent = (
        <AnimatePresence>
            {show && message && (
                <motion.div
                    className="
                        fixed
                        top-4
                        right-4
                        w-[calc(100%-2rem)]
                        max-w-sm
                        pointer-events-auto
                    "
                    style={{
                        zIndex: 2147483647,
                    }}
                    initial={{
                        opacity: 0,
                        x: 100,
                        scale: 0.8,
                    }}
                    animate={{
                        opacity: 1,
                        x: 0,
                        scale: 1,
                    }}
                    exit={{
                        opacity: 0,
                        x: 100,
                        scale: 0.8,
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                    }}
                >
                    <div
                        className={`
                            rounded-lg
                            shadow-2xl
                            border
                            ${getColors()}
                            p-4
                            flex
                            items-start
                            gap-3
                        `}
                        role="alert"
                        aria-live="polite"
                    >
                        {/* Icon */}
                        <div
                            className={`
                                flex-shrink-0
                                ${getIconColors()}
                                mt-0.5
                            `}
                        >
                            {getIcon()}
                        </div>

                        {/* Message */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium break-words">
                                {message}
                            </p>
                        </div>

                        {/* Close */}
                        <button
                            type="button"
                            onClick={() => dispatch(hideToast())}
                            className="
                                flex-shrink-0
                                -mt-1
                                -mr-1
                                p-1
                                rounded-lg
                                hover:bg-black/5
                                transition-colors
                            "
                            aria-label="Close notification"
                        >
                            <svg
                                className="w-4 h-4 text-gray-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    // Render directly into <body>
    return createPortal(toastContent, document.body);
}