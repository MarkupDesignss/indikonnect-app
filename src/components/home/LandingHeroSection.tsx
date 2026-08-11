"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

import { COLORS } from "@/lib/constants/colors";
import { getFont, FONT_WEIGHT } from "@/lib/constants/font-family";

export default function LandingHeroSection() {
    const ref = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"],
    });

    const scale = useTransform(scrollYProgress, [0, 1], [1, 1.25]);
    const overlay = useTransform(scrollYProgress, [0, 1], [0.58, 0.72]);
    const titleY = useTransform(scrollYProgress, [0, 1], [0, -80]);
    const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

    return (
        <section
            ref={ref}
            className="relative min-h-screen w-full"
            style={{
                background: COLORS.brand.darkBlue,
            }}
        >
            {/* Sticky Hero */}

            <div className="sticky top-0 h-screen overflow-hidden">

                {/* Background */}

                <motion.div
                    style={{ scale }}
                    className="absolute inset-0"
                >
                    <Image
                        src="/indiekonnect-web/images/chapter-bg-4.jpg"
                        alt=""
                        fill
                        priority
                        className="object-cover"
                    />
                </motion.div>

                {/* Overlay */}

                <motion.div
                    style={{
                        opacity: overlay,
                        background: "#04101F",
                    }}
                    className="absolute inset-0"
                />

                {/* Side Gradient */}

                <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-transparent to-black/45" />

                {/* Top Light */}

                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            "radial-gradient(circle at center,rgba(255,199,44,.10),transparent 60%)",
                    }}
                />

                {/* Content */}

                <motion.div
                    style={{
                        y: titleY,
                        opacity,
                    }}
                    className="relative z-20 flex h-full flex-col items-center justify-center px-8 text-center"
                >
                    {/* chapter */}

                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-[2px] bg-[#D4A017]" />
                        <span
                            className="uppercase tracking-[4px] text-[#D4A017] text-[11px]"
                            style={{
                                fontFamily: getFont("jost"),
                                fontWeight: FONT_WEIGHT.medium,
                            }}
                        >
                            Chapter Eight · The Invitation
                        </span>
                    </div>

                    {/* Title - Reduced Size */}

                    <h1
                        className="leading-[0.9] text-[#F5F0E8]"
                        style={{
                            fontFamily: getFont("cormorant"),
                            fontWeight: FONT_WEIGHT.regular,
                            fontSize: "clamp(48px, 6vw, 100px)",
                        }}
                    >
                        Where people &
                        <br />
                        possibilities
                        <br />

                        <span
                            className="italic text-[#D4A017]"
                        >
                            connect
                        </span>

                    </h1>

                    {/* description - Reduced Size */}

                    <p
                        className="mt-6 max-w-[720px] text-[22px] leading-[1.6] text-white/72"
                        style={{
                            fontFamily: getFont("jost"),
                            fontWeight: FONT_WEIGHT.light,
                        }}
                    >
                        Whether you are here for premium products that lift your
                        everyday, or a professional opportunity that changes your
                        financial future, this is where India rises together.
                    </p>

                    {/* CTA Buttons - Smaller */}

                    <motion.div
                        initial={{
                            opacity: 0,
                            y: 30,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        transition={{
                            delay: 0.5,
                            duration: 0.8,
                        }}
                        className="mt-8 flex flex-wrap items-center justify-center gap-4"
                    >
                        {/* Primary */}

                        <motion.button
                            whileHover={{
                                scale: 1.05,
                                y: -3,
                            }}
                            whileTap={{
                                scale: 0.97,
                            }}
                            className="group flex cursor-pointer items-center gap-3 rounded-full px-8 py-3.5 text-sm"
                            style={{
                                background: "#D4A017",
                                color: "#08192F",
                                fontFamily: getFont("jost"),
                                fontWeight: FONT_WEIGHT.semibold,
                                fontSize: 15,
                            }}
                        >
                            Become a Distributor

                            <motion.span
                                animate={{
                                    x: [0, 5, 0],
                                }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 1.4,
                                }}
                            >
                                →
                            </motion.span>
                        </motion.button>

                        {/* Secondary */}

                        <motion.button
                            whileHover={{
                                scale: 1.04,
                                backgroundColor: "rgba(255,255,255,.08)",
                            }}
                            whileTap={{
                                scale: 0.98,
                            }}
                            className="rounded-full border cursor-pointer border-white/20 px-8 py-3.5 text-sm text-white backdrop-blur-md"
                            style={{
                                fontFamily: getFont("jost"),
                                fontWeight: FONT_WEIGHT.medium,
                                fontSize: 15,
                            }}
                        >
                            Shop the Collection
                        </motion.button>
                    </motion.div>

                    {/* Scroll Indicator */}

                    <motion.div
                        animate={{
                            y: [0, 10, 0],
                        }}
                        transition={{
                            repeat: Infinity,
                            duration: 2,
                        }}
                        className="absolute bottom-10 left-1/2 -translate-x-1/2"
                    >
                        <div className="flex flex-col items-center gap-4">

                            <span
                                className="uppercase tracking-[5px] text-white/60 text-[10px]"
                                style={{
                                    fontFamily: getFont("jost"),
                                }}
                            >
                                Scroll
                            </span>

                            <div className="relative h-12 w-[2px] overflow-hidden bg-white/20">

                                <motion.div
                                    animate={{
                                        y: [-15, 55],
                                    }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 1.8,
                                        ease: "linear",
                                    }}
                                    className="absolute left-0 top-0 h-6 w-full bg-[#D4A017]"
                                />
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}