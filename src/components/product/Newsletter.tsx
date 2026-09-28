"use client";

import { useState, FormEvent, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiAlertCircle,
  FiArrowRight,
  FiCheckCircle,
  FiLoader,
  FiMail,
  FiShield,
  FiZap,
} from "react-icons/fi";
import { NewsletterState } from "../../Screens/types/product";
import { useSubscribeMutation } from "@/lib/redux/api/subscriberApi";

export default function Newsletter(): JSX.Element {
    const [state, setState] = useState<NewsletterState>({
        email: "",
        isSubmitted: false,
    });
    const [isHovered, setIsHovered] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [subscribe, { isLoading, isSuccess, isError, error }] = useSubscribeMutation();
    const [errorMessage, setErrorMessage] = useState<string>("");

    useEffect(() => {
        if (isError) {
            const timer = setTimeout(() => {
                setErrorMessage("");
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [isError]);

    useEffect(() => {
        if (isSuccess) {
            setState({ email: "", isSubmitted: true });
            setTimeout(() => {
                setState((prev) => ({ ...prev, isSubmitted: false }));
            }, 3000);
        }
    }, [isSuccess]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setErrorMessage("");

        if (!state.email) {
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(state.email)) {
            setErrorMessage("Please enter a valid email address");
            return;
        }

        try {
            await subscribe({ email: state.email }).unwrap();
        } catch (err: any) {
            console.error("Subscription error:", err);
            // Handle specific error messages
            if (err?.data?.message) {
                setErrorMessage(err.data.message);
            } else if (err?.status === 409) {
                setErrorMessage("This email is already subscribed!");
            } else {
                setErrorMessage("Failed to subscribe. Please try again.");
            }
        }
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setState((prev) => ({ ...prev, email: e.target.value }));
        // Clear error when user starts typing
        if (errorMessage) {
            setErrorMessage("");
        }
    };

    // Animation variants
    const sectionVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut",
            },
        },
    };

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.9, y: 20 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                duration: 0.5,
                delay: 0.2,
                ease: "easeOut",
            },
        },
        hover: {
            scale: 1.02,
            boxShadow: "0 24px 70px rgba(120, 90, 20, 0.25)",
            transition: {
                duration: 0.3,
                ease: "easeInOut",
            },
        },
    };

    const titleVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                delay: 0.3,
                ease: "easeOut",
            },
        },
    };

    const descriptionVariants = {
        hidden: { opacity: 0, y: -10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                delay: 0.4,
                ease: "easeOut",
            },
        },
    };

    const formVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                delay: 0.5,
                ease: "easeOut",
            },
        },
    };

    const buttonVariants = {
        initial: { scale: 1 },
        hover: {
            scale: 1.05,
            boxShadow: "0 14px 34px rgba(30, 30, 30, 0.35)",
            transition: {
                duration: 0.2,
                ease: "easeInOut",
            },
        },
        tap: {
            scale: 0.95,
            transition: {
                duration: 0.1,
            },
        },
    };

    const successVariants = {
        hidden: { opacity: 0, scale: 0.8, y: -10 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 260,
                damping: 20,
            },
        },
        exit: {
            opacity: 0,
            scale: 0.8,
            y: -10,
            transition: {
                duration: 0.3,
            },
        },
    };

    const errorVariants = {
        hidden: { opacity: 0, scale: 0.8, y: -10 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 260,
                damping: 20,
            },
        },
        exit: {
            opacity: 0,
            scale: 0.8,
            y: -10,
            transition: {
                duration: 0.3,
            },
        },
    };

    const decorativeCircleVariants = {
        animate: {
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            transition: {
                duration: 20,
                repeat: Infinity,
                ease: "linear",
            },
        },
    };

    const decorativeCircle2Variants = {
        animate: {
            scale: [1, 1.1, 1],
            rotate: [0, -60, 0],
            transition: {
                duration: 15,
                repeat: Infinity,
                ease: "linear",
                delay: 2,
            },
        },
    };

    return (
        <motion.section
            className="w-full py-14 md:py-20 text-center relative overflow-hidden"
            style={{ backgroundColor: "#F9C744" }}
            aria-label="Newsletter subscription"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Decorative Background Elements */}
            <motion.div
                className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3"
                variants={decorativeCircleVariants}
                animate="animate"
            />
            <motion.div
                className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/3"
                variants={decorativeCircle2Variants}
                animate="animate"
            />
            <motion.div
                className="absolute top-1/2 left-1/2 w-48 h-48 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"
                animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.3, 0.1, 0.3],
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Floating Dots */}
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-white/25 rounded-full"
                    style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                    }}
                    animate={{
                        y: [0, -20, 0],
                        opacity: [0.2, 0.6, 0.2],
                    }}
                    transition={{
                        duration: 3 + Math.random() * 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: Math.random() * 2,
                    }}
                />
            ))}

            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    className="max-w-2xl mx-auto rounded-3xl p-8 md:p-12 shadow-xl relative overflow-hidden"
                    variants={cardVariants}
                    initial="hidden"
                    whileInView="visible"
                    whileHover="hover"
                    viewport={{ once: true }}
                    style={{
                        background:
                            "linear-gradient(150deg, rgba(255,255,255,0.98) 0%, rgba(255,253,247,0.95) 100%)",
                        border: "1px solid rgba(255, 255, 255, 0.6)",
                        backdropFilter: "blur(12px)",
                    }}
                >
                    {/* Top gold accent bar */}
                    <div
                        className="absolute top-0 left-0 right-0 h-1"
                        style={{
                            background:
                                "linear-gradient(90deg, #D4A843, #F0D67A, #D4A843)",
                        }}
                    />

                    {/* Soft corner glow inside the card */}
                    <div
                        className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[80px] pointer-events-none"
                        style={{
                            background: "rgba(212, 168, 67, 0.12)",
                        }}
                    />

                    <motion.h2
                        className="relative text-2xl md:text-4xl font-bold text-gray-900 mb-3"
                        variants={titleVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        style={{
                            fontFamily:
                                "'Playfair Display', 'Times New Roman', serif",
                        }}
                    >
                        Inspiration,{" "}
                        <span
                            style={{
                                background:
                                    "linear-gradient(120deg, #D4A843 0%, #E8C468 50%, #D4A843 100%)",
                                WebkitBackgroundClip: "text",
                                backgroundClip: "text",
                                color: "transparent",
                                fontStyle: "italic",
                            }}
                        >
                            Delivered.
                        </span>
                    </motion.h2>

                    <motion.p
                        className="relative text-gray-600 mb-7 leading-relaxed text-sm md:text-base max-w-md mx-auto"
                        variants={descriptionVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        Insights, opportunities and product launches,
                        straight to your inbox.
                    </motion.p>

                    <motion.form
                        onSubmit={handleSubmit}
                        className="space-y-3 relative"
                        noValidate
                        variants={formVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        <div className="flex flex-col sm:flex-row gap-2">
                            <motion.div className="flex-1 relative">
                                {/* Mail icon inside input */}
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none flex items-center z-10">
                                    <FiMail
                                        size={17}
                                        style={{
                                            color: isFocused
                                                ? "#D4A843"
                                                : "#9AA29C",
                                            transition: "color 0.3s ease",
                                        }}
                                    />
                                </div>

                                <input
                                    type="email"
                                    placeholder="your@example.com"
                                    value={state.email}
                                    onChange={handleEmailChange}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={() => setIsFocused(false)}
                                    required
                                    disabled={isLoading}
                                    className="w-full pl-11 pr-4 py-3.5 text-black rounded-xl text-sm focus:outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border-2"
                                    aria-label="Email address"
                                    autoComplete="email"
                                    style={{
                                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                                        borderColor: isFocused
                                            ? "#D4A843"
                                            : "#E8E2D6",
                                        boxShadow: isFocused
                                            ? "0 8px 26px rgba(212, 168, 67, 0.18)"
                                            : "0 1px 3px rgba(0,0,0,0.03)",
                                    }}
                                />
                            </motion.div>

                            <motion.button
                                type="submit"
                                disabled={isLoading}
                                className="px-7 py-3.5 text-white rounded-xl font-semibold whitespace-nowrap relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                                variants={buttonVariants}
                                initial="initial"
                                whileHover={!isLoading ? "hover" : undefined}
                                whileTap={!isLoading ? "tap" : undefined}
                                style={{
                                    background:
                                        "linear-gradient(120deg, #2B2B2B 0%, #1A1A1A 100%)",
                                    boxShadow:
                                        "0 10px 24px -10px rgba(0, 0, 0, 0.5)",
                                }}
                            >
                                {/* Button Background Shine Effect */}
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                                    initial={{ x: "-100%" }}
                                    whileHover={
                                        !isLoading ? { x: "100%" } : undefined
                                    }
                                    transition={{ duration: 0.6 }}
                                />
                                <span className="relative z-10 flex items-center gap-2 justify-center">
                                    {isLoading ? (
                                        <>
                                            <motion.span
                                                animate={{ rotate: 360 }}
                                                transition={{
                                                    duration: 1,
                                                    repeat: Infinity,
                                                    ease: "linear",
                                                }}
                                                className="inline-flex"
                                            >
                                                <FiLoader size={15} />
                                            </motion.span>
                                            Subscribing...
                                        </>
                                    ) : (
                                        <>
                                            Subscribe
                                            <FiArrowRight
                                                size={15}
                                                className="transition-transform duration-300 group-hover:translate-x-1"
                                            />
                                        </>
                                    )}
                                </span>
                            </motion.button>
                        </div>

                        {/* Error Message with Animation */}
                        <AnimatePresence>
                            {errorMessage && (
                                <motion.div
                                    className="inline-flex items-center gap-2 text-red-700 font-medium text-sm bg-red-50/90 backdrop-blur-sm px-4 py-2 rounded-full border border-red-200/70"
                                    role="alert"
                                    variants={errorVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    style={{
                                        fontFamily:
                                            "system-ui, -apple-system, sans-serif",
                                    }}
                                >
                                    <FiAlertCircle size={14} />
                                    {errorMessage}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Success Message with Animation */}
                        <AnimatePresence>
                            {state.isSubmitted && !errorMessage && (
                                <motion.div
                                    className="inline-flex items-center gap-2 text-green-700 font-medium text-sm bg-green-50/90 backdrop-blur-sm px-4 py-2 rounded-full border border-green-200/70"
                                    role="alert"
                                    variants={successVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    style={{
                                        fontFamily:
                                            "system-ui, -apple-system, sans-serif",
                                    }}
                                >
                                    <motion.span
                                        className="inline-flex"
                                        animate={{
                                            scale: [1, 1.2, 1],
                                        }}
                                        transition={{
                                            duration: 0.6,
                                            repeat: 3,
                                            ease: "easeInOut",
                                        }}
                                    >
                                        <FiCheckCircle size={14} />
                                    </motion.span>
                                    Subscribed successfully! 🎉
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.form>

                    {/* Trust Badges */}
                    <motion.div
                        className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-gray-600"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.8, duration: 0.5 }}
                        viewport={{ once: true }}
                        style={{
                            fontFamily:
                                "system-ui, -apple-system, sans-serif",
                            letterSpacing: "0.3px",
                        }}
                    >
                        <span className="flex items-center gap-1.5">
                            <FiShield
                                size={13}
                                style={{ color: "#2E7D32" }}
                            />
                            Secure
                        </span>
                        <span className="flex items-center gap-1.5">
                            <FiMail
                                size={13}
                                style={{ color: "#1565C0" }}
                            />
                            No spam
                        </span>
                        <span className="flex items-center gap-1.5">
                            <FiZap
                                size={13}
                                style={{ color: "#7B1FA2" }}
                            />
                            Instant
                        </span>
                    </motion.div>
                </motion.div>
            </div>
        </motion.section>
    );
}