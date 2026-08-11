"use client";

import { useState, FormEvent, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
            boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
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

    const inputVariants = {
        focus: {
            scale: 1.02,
            boxShadow: "0 0 0 3px rgba(249, 199, 68, 0.5)",
            borderColor: "#F9C744",
            transition: {
                duration: 0.2,
            },
        },
        blur: {
            scale: 1,
            boxShadow: "none",
            borderColor: "#D1D5DB",
            transition: {
                duration: 0.2,
            },
        },
    };

    const buttonVariants = {
        initial: { scale: 1 },
        hover: {
            scale: 1.05,
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
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
            className="w-full py-12 md:py-16 text-center relative overflow-hidden"
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
                    className="absolute w-2 h-2 bg-white/20 rounded-full"
                    style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                    }}
                    animate={{
                        y: [0, -20, 0],
                        opacity: [0.2, 0.5, 0.2],
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
                    className="max-w-2xl mx-auto bg-white/10 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-xl"
                    variants={cardVariants}
                    initial="hidden"
                    whileInView="visible"
                    whileHover="hover"
                    viewport={{ once: true }}
                    style={{
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                    }}
                >
                    <motion.h2
                        className="text-2xl md:text-4xl font-bold text-gray-800 mb-2"
                        variants={titleVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        Inspiration, Delivered.
                        <motion.span
                            className="inline-block ml-2"
                            animate={{
                                rotate: [0, 10, -10, 0],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: 1,
                            }}
                        >
                            ✨
                        </motion.span>
                    </motion.h2>

                    <motion.p
                        className="text-gray-700 mb-6 leading-relaxed text-sm md:text-base"
                        variants={descriptionVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        Insights opportunities and product launches, straight to your inbox.
                    </motion.p>

                    <motion.form
                        onSubmit={handleSubmit}
                        className="space-y-3"
                        noValidate
                        variants={formVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        <div className="flex flex-col sm:flex-row gap-2">
                            <motion.div
                                className="flex-1 relative"
                                variants={inputVariants}
                                animate={isFocused ? "focus" : "blur"}
                            >
                                <input
                                    type="email"
                                    placeholder="your@example.com"
                                    value={state.email}
                                    onChange={handleEmailChange}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={() => setIsFocused(false)}
                                    required
                                    disabled={isLoading}
                                    className="w-full px-4 py-3 border-2 text-black border-gray-300 rounded-lg text-sm focus:outline-none bg-white/90 backdrop-blur-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label="Email address"
                                    autoComplete="email"
                                    style={{
                                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                                    }}
                                />
                                {/* Input Glow Effect */}
                                <AnimatePresence>
                                    {isFocused && (
                                        <motion.div
                                            className="absolute inset-0 rounded-lg pointer-events-none"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            style={{
                                                boxShadow: "0 0 20px rgba(249, 199, 68, 0.3)",
                                            }}
                                        />
                                    )}
                                </AnimatePresence>
                            </motion.div>

                            <motion.button
                                type="submit"
                                disabled={isLoading}
                                className="px-6 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors whitespace-nowrap relative overflow-hidden shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                variants={buttonVariants}
                                initial="initial"
                                whileHover={!isLoading ? "hover" : undefined}
                                whileTap={!isLoading ? "tap" : undefined}
                            >
                                {/* Button Background Shine Effect */}
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                    initial={{ x: "-100%" }}
                                    whileHover={!isLoading ? { x: "100%" } : undefined}
                                    transition={{ duration: 0.6 }}
                                />
                                <span className="relative z-10 flex items-center gap-2">
                                    {isLoading ? (
                                        <>
                                            <motion.span
                                                animate={{ rotate: 360 }}
                                                transition={{
                                                    duration: 1,
                                                    repeat: Infinity,
                                                    ease: "linear",
                                                }}
                                            >
                                                ⟳
                                            </motion.span>
                                            Subscribing...
                                        </>
                                    ) : (
                                        "Subscribe"
                                    )}
                                </span>
                            </motion.button>
                        </div>

                        {/* Error Message with Animation */}
                        <AnimatePresence>
                            {errorMessage && (
                                <motion.div
                                    className="text-red-700 font-medium text-sm bg-red-50/80 backdrop-blur-sm px-4 py-2 rounded-lg inline-block"
                                    role="alert"
                                    variants={errorVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                >
                                    <span className="inline-block mr-2">⚠️</span>
                                    {errorMessage}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Success Message with Animation */}
                        <AnimatePresence>
                            {state.isSubmitted && !errorMessage && (
                                <motion.div
                                    className="text-green-700 font-medium text-sm bg-green-50/80 backdrop-blur-sm px-4 py-2 rounded-lg inline-block"
                                    role="alert"
                                    variants={successVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                >
                                    <motion.span
                                        className="inline-block mr-2"
                                        animate={{
                                            scale: [1, 1.2, 1],
                                        }}
                                        transition={{
                                            duration: 0.6,
                                            repeat: 3,
                                            ease: "easeInOut",
                                        }}
                                    >
                                        ✓
                                    </motion.span>
                                    Subscribed successfully! 🎉
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.form>

                    {/* Trust Badges */}
                    <motion.div
                        className="mt-4 flex flex-wrap justify-center gap-4 text-xs text-gray-600"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.8, duration: 0.5 }}
                        viewport={{ once: true }}
                    >
                        <span className="flex items-center gap-1">
                            <span className="text-green-600">🔒</span> Secure
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="text-blue-600">📧</span> No spam
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="text-purple-600">⚡</span> Instant
                        </span>
                    </motion.div>
                </motion.div>
            </div>
        </motion.section>
    );
}