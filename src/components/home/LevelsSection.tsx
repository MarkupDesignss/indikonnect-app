"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { getFont, FONT_WEIGHT } from "@/lib/constants/font-family";
import { COLORS } from "@/lib/constants/colors";

const levels = [
    {
        roman: "I",
        level: "LEVEL 01",
        title: "Associate",
        active: false,
        description:
            "Begin your journey with curated products, structured training and a community that answers when you ask.",
    },
    {
        roman: "II",
        level: "LEVEL 02",
        title: "Builder",
        active: true,
        description:
            "Grow your network and unlock deeper mentorship as your circle expands beyond the people you already knew.",
    },
    {
        roman: "III",
        level: "LEVEL 03",
        title: "Leader",
        active: false,
        description:
            "Guide your own team with recognition, tools and rewards designed around leadership rather than volume alone.",
    },
    {
        roman: "IV",
        level: "LEVEL 04",
        title: "Director",
        active: false,
        description:
            "Shape regional growth, mentor other leaders and champion the values that hold the movement together.",
    },
    {
        roman: "V",
        level: "LEVEL 05",
        title: "Ambassador",
        active: false,
        description:
            "Stand among the faces of a new India, inspiring the generation that comes next.",
    },
];

export default function LevelsSection() {
    const containerRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    const progressWidth = useTransform(
        scrollYProgress,
        [0, 1],
        ["40%", "100%"]
    );

    return (
        <section
            ref={containerRef}
            className="relative w-full min-h-screen"
            style={{
                background: "#0A2240",
            }}
        >
            {/* Background Glow */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        "radial-gradient(circle at center, rgba(255,199,44,.05), transparent 70%)",
                }}
            />

            <div className="max-w-[1700px] mx-auto px-8 lg:px-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">

                    {/* ================= LEFT SIDE ================= */}

                    <motion.div
                        className="sticky top-0 h-screen flex flex-col justify-center"
                    >

                        {/* Chapter */}

                        <div className="flex items-center gap-4 mb-10">

                            <div
                                className="w-11 h-[2px]"
                                style={{
                                    background: COLORS.brand.gold,
                                }}
                            />

                            <span
                                style={{
                                    fontFamily: getFont("jost"),
                                    color: COLORS.brand.gold,
                                    fontSize: 12,
                                    letterSpacing: "4px",
                                    fontWeight: FONT_WEIGHT.semiBold,
                                }}
                            >
                                CHAPTER SIX · THE OPPORTUNITY
                            </span>

                        </div>

                        {/* Heading */}

                        <h1
                            className="leading-[0.88]"
                            style={{
                                fontFamily: getFont("cormorant"),
                                color: "#F6F2EA",
                                fontSize: "72px",
                                fontWeight: FONT_WEIGHT.regular,
                            }}
                        >
                            A growth ladder
                            <br />
                            for{" "}
                            <span
                                style={{
                                    color: COLORS.brand.gold,
                                    fontStyle: "italic",
                                }}
                            >
                                leaders
                            </span>
                        </h1>

                        {/* Description */}

                        <p
                            className="mt-10 max-w-[560px]"
                            style={{
                                fontFamily: getFont("jost"),
                                color: "rgba(255,255,255,.65)",
                                fontSize: 18,
                                lineHeight: 1.6,
                            }}
                        >
                            A clear, milestone-driven journey built on leadership
                            development, mentorship and shared success. Every rung is
                            earned, and every rung is published.
                        </p>

                        {/* Progress */}

                        <div className="flex items-center gap-6 mt-20">

                            <span
                                style={{
                                    fontFamily: getFont("cormorant"),
                                    color: COLORS.brand.gold,
                                    fontSize: 42,
                                }}
                            >
                                02
                            </span>

                            <div className="relative w-[500px] h-[2px] bg-white/15">

                                <motion.div
                                    style={{
                                        width: progressWidth,
                                        background: COLORS.brand.gold,
                                    }}
                                    className="absolute left-0 top-0 h-full"
                                />

                            </div>

                            <span
                                style={{
                                    fontFamily: getFont("cormorant"),
                                    color: "rgba(255,199,44,.45)",
                                    fontSize: 42,
                                }}
                            >
                                05
                            </span>

                        </div>

                    </motion.div>

                    {/* ================= RIGHT SIDE ================= */}

                    <div className="py-20">

                        {levels.map((item, index) => (
                            <motion.div
                                key={item.level}
                                initial={{ opacity: 0, y: 80 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.25 }}
                                transition={{
                                    duration: 0.7,
                                    delay: index * 0.08,
                                }}
                                className="border-t border-white/10 py-16"
                            >
                                <div className="grid grid-cols-[80px_1fr] gap-10">

                                    {/* Roman Number */}

                                    <div>

                                        <h3
                                            style={{
                                                fontFamily: getFont("cormorant"),
                                                color: item.active
                                                    ? COLORS.brand.gold
                                                    : "rgba(255,255,255,.28)",
                                                fontSize: "56px",
                                                fontStyle: "italic",
                                                lineHeight: 1,
                                            }}
                                        >
                                            {item.roman}
                                        </h3>

                                    </div>

                                    {/* Content */}

                                    <div>

                                        {/* Level */}

                                        <p
                                            style={{
                                                fontFamily: getFont("jost"),
                                                color: "rgba(255,255,255,.45)",
                                                fontSize: "15px",
                                                letterSpacing: "5px",
                                                fontWeight: FONT_WEIGHT.medium,
                                            }}
                                        >
                                            {item.level}
                                        </p>

                                        {/* Title */}

                                        <motion.h2
                                            whileHover={{
                                                x: 12,
                                                color: COLORS.brand.gold,
                                            }}
                                            transition={{
                                                duration: 0.3,
                                            }}
                                            className="mt-3"
                                            style={{
                                                fontFamily: getFont("cormorant"),
                                                color: item.active
                                                    ? COLORS.brand.gold
                                                    : "#F6F2EA",
                                                fontSize: "52px",
                                                lineHeight: ".9",
                                                fontWeight: FONT_WEIGHT.regular,
                                            }}
                                        >
                                            {item.title}
                                        </motion.h2>

                                        {/* Description */}

                                        <p
                                            className="mt-6 max-w-[620px]"
                                            style={{
                                                fontFamily: getFont("jost"),
                                                color: "rgba(255,255,255,.58)",
                                                fontSize: "19px",
                                                lineHeight: "1.8",
                                            }}
                                        >
                                            {item.description}
                                        </p>

                                    </div>

                                </div>

                            </motion.div>
                        ))}

                    </div>
                </div>
            </div>

            {/* Decorative Glow - Top Right */}
            <div
                className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none"
                style={{
                    background:
                        "radial-gradient(circle, rgba(255,199,44,0.10) 0%, rgba(255,199,44,0.03) 40%, transparent 75%)",
                    filter: "blur(120px)",
                }}
            />

            {/* Decorative Glow - Bottom Left */}
            <div
                className="absolute bottom-0 left-0 w-[450px] h-[450px] pointer-events-none"
                style={{
                    background:
                        "radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 75%)",
                    filter: "blur(140px)",
                }}
            />

            {/* Background Grid */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.02]"
                style={{
                    backgroundImage: `
            linear-gradient(rgba(255,255,255,.35) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.35) 1px, transparent 1px)
          `,
                    backgroundSize: "80px 80px",
                }}
            />
        </section>
    );
}