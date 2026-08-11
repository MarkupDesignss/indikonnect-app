"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
    motion,
    useAnimation,
    useInView,
    useMotionValue,
    useSpring,
    useTransform,
} from "framer-motion";
import { getFont, FONT_WEIGHT } from "../../lib/constants/font-family";
import { COLORS } from "../../lib/constants/colors";

const gridImages = [
    { id: 1, src: "/indiekonnect-web/images/chapter-bg-1.jpg", height: "h-[300px]" },
    { id: 2, src: "/indiekonnect-web/images/chapter-bg-2.jpg", height: "h-[400px]" },
    { id: 3, src: "/indiekonnect-web/images/chapter-bg-3.jpg", height: "h-[350px]" },
    { id: 4, src: "/indiekonnect-web/images/chapter-bg-4.jpg", height: "h-[280px]" },
    { id: 5, src: "/indiekonnect-web/images/chapter-bg-5.jpg", height: "h-[450px]" },
    { id: 6, src: "/indiekonnect-web/images/chapter-bg-6.jpg", height: "h-[320px]" },
    { id: 7, src: "/indiekonnect-web/images/chapter-bg-4.jpg", height: "h-[380px]" },
    { id: 8, src: "/indiekonnect-web/images/chapter-bg-1.jpg", height: "h-[260px]" },
    { id: 9, src: "/indiekonnect-web/images/chapter-bg-5.jpg", height: "h-[420px]" },
    { id: 10, src: "/indiekonnect-web/images/chapter-bg-1.jpg", height: "h-[260px]" },
    { id: 11, src: "/indiekonnect-web/images/chapter-bg-2.jpg", height: "h-[420px]" },
];

export default function ChapterOne() {
    const [isHovering, setIsHovering] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const sectionRef = useRef<HTMLElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const accumulatedScrollRef = useRef(0);

    // ---- Motion values instead of React state for the scroll-driven stuff.
    // These update every frame WITHOUT triggering a re-render -> buttery smooth.
    const rawProgress = useMotionValue(0); // 0 -> 1, updated directly from wheel
    const progress = useSpring(rawProgress, {
        stiffness: 120,
        damping: 20,
        mass: 0.5,
    }); // smoothed/eased version, this is what everything reads from

    const counterMax = 1.4;
    const countText = useTransform(progress, (p) => (p * counterMax).toFixed(1));
    const barWidth = useTransform(progress, (p) => `${Math.min(p, 1) * 100}%`);
    const counterColor = useTransform(
        progress,
        [0, 0.95, 1],
        ["rgba(255,255,255,0.8)", "rgba(255,255,255,0.8)", "#FFD700"]
    );
    const counterScale = useTransform(progress, [0, 0.5, 1], [1, 1.05, 1]);

    const controls = {
        label: useAnimation(),
        counter: useAnimation(),
        description: useAnimation(),
        accentLine: useAnimation(),
    };

    const isInView = useInView(sectionRef, { once: false, amount: 0.1 });
    const gridControls = useAnimation();

    // Entrance animations
    useEffect(() => {
        if (isInView) {
            controls.label.start({ opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.1 } });
            controls.counter.start({ opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, delay: 0.2 } });
            controls.description.start({ opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.3 } });
            controls.accentLine.start({ opacity: 1, scaleX: 1, transition: { duration: 0.8, delay: 0.4 } });

            gridControls.start((i) => ({
                opacity: 1,
                scale: 1,
                y: 0,
                transition: { duration: 0.8, delay: 0.1 + i * 0.08, ease: "easeOut" },
            }));
        }
    }, [isInView, controls, gridControls]);

    // Smooth parallax on the grid images -> driven by the SAME spring value
    useEffect(() => {
        const unsubscribe = progress.on("change", (p) => {
            if (!gridRef.current) return;
            const items = gridRef.current.querySelectorAll<HTMLElement>(".grid-item");
            const maxOffset = 800;
            const offset = Math.min(p, 1) * maxOffset;

            items.forEach((item, index) => {
                const speedFactor = 0.3 + (index % 3) * 0.15;
                item.style.transform = `translate3d(0, -${(offset * speedFactor).toFixed(1)}px, 0) scale(1.02)`;
            });
        });
        return unsubscribe;
    }, [progress]);

    // Wheel handling — just updates the raw motion value, spring does the smoothing
    useEffect(() => {
        if (!isInView) return;

        const maxScrollDistance = 800;

        const handleScroll = (e: WheelEvent) => {
            if (!isHovering || isComplete) return;

            accumulatedScrollRef.current += e.deltaY * 0.8;
            const clamped = Math.max(0, Math.min(maxScrollDistance, Math.abs(accumulatedScrollRef.current)));
            const p = clamped / maxScrollDistance;

            rawProgress.set(p);

            if (p >= 1) {
                setIsComplete(true);
                accumulatedScrollRef.current = 0;
                return;
            }

            e.preventDefault();
            clearTimeout(scrollTimeoutRef.current!);
            scrollTimeoutRef.current = setTimeout(() => {
                accumulatedScrollRef.current = 0;
            }, 1000);
        };

        const handleMouseEnter = () => {
            setIsHovering(true);
            if (rawProgress.get() < 0.9) setIsComplete(false);
        };
        const handleMouseLeave = () => setIsHovering(false);

        const section = sectionRef.current;
        if (section) {
            section.addEventListener("wheel", handleScroll, { passive: false });
            section.addEventListener("mouseenter", handleMouseEnter);
            section.addEventListener("mouseleave", handleMouseLeave);
        }
        return () => {
            if (section) {
                section.removeEventListener("wheel", handleScroll);
                section.removeEventListener("mouseenter", handleMouseEnter);
                section.removeEventListener("mouseleave", handleMouseLeave);
            }
            if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        };
    }, [isInView, isHovering, isComplete, rawProgress]);

    // Reset when out of view
    useEffect(() => {
        if (!isInView) {
            rawProgress.set(0);
            setIsHovering(false);
            setIsComplete(false);
            accumulatedScrollRef.current = 0;
        }
    }, [isInView, rawProgress]);

    return (
        <section
            ref={sectionRef}
            className="relative w-full min-h-screen overflow-hidden bg-[#0A1628] flex items-center justify-center py-20"
            style={{ cursor: isHovering && !isComplete ? "grabbing" : isComplete ? "default" : "grab" }}
        >
            {/* Background Image Grid — lighter overlay so images are actually visible */}
            <div ref={gridRef} className="absolute inset-0 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 w-full h-[200%]">
                    {gridImages.map((img, index) => (
                        <motion.div
                            key={img.id}
                            custom={index}
                            initial={{ opacity: 0, scale: 0.9, y: 50 }}
                            animate={gridControls}
                            className={`grid-item relative ${img.height} w-full rounded-lg overflow-hidden shadow-2xl`}
                            style={{ willChange: "transform", backfaceVisibility: "hidden", transform: "translateZ(0)" }}
                        >
                            <Image
                                src={img.src}
                                alt={`Chapter background ${index + 1}`}
                                fill
                                className="object-cover"
                                priority={index < 3}
                            />
                            {/* Much lighter overlay — images stay visible instead of drowning in dark gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628]/60 via-[#0A1628]/15 to-transparent" />
                            <div className="absolute inset-0 border border-[#C9A84C]/10 rounded-lg pointer-events-none" />
                            <div className="absolute bottom-4 right-4 text-[#C9A84C]/30 text-xs font-mono">
                                #{index + 1}
                            </div>
                            <motion.div
                                className="absolute inset-0 bg-[#C9A84C]/0"
                                whileHover={{ backgroundColor: "rgba(201, 168, 76, 0.08)" }}
                                transition={{ duration: 0.25 }}
                            />
                        </motion.div>
                    ))}
                </div>

                {/* Overall overlay — much lighter now, no heavy blur */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#0A1628]/45 via-[#0A1628]/20 to-[#0A1628]/70" />
            </div>

            {/* Status Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isInView ? 1 : 0 }}
                transition={{ delay: 0.5 }}
                className={`absolute top-8 left-1/2 -translate-x-1/2 z-20 transition-all duration-500 ${isHovering ? "opacity-0 scale-75" : "opacity-100 scale-100"
                    } ${isComplete ? "opacity-0" : ""}`}
            >
                <div className="flex items-center gap-2 bg-[#C9A84C]/10 backdrop-blur-md px-4 py-2 rounded-full border border-[#C9A84C]/20">
                    <span
                        className="text-[#C9A84C] text-xs tracking-[4px] uppercase"
                        style={{ fontFamily: getFont("jost") }}
                    >
                        {isComplete ? "✓ Complete" : "Hover & Scroll to Explore"}
                    </span>
                    {!isComplete && (
                        <motion.div animate={{ y: [0, 3, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                            <svg className="w-3 h-3 text-[#C9A84C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                        </motion.div>
                    )}
                </div>
            </motion.div>

            {isComplete && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute top-8 left-1/2 -translate-x-1/2 z-20"
                >
                    <div className="flex items-center gap-2 bg-[#C9A84C]/20 backdrop-blur-md px-4 py-2 rounded-full border border-[#C9A84C]/40">
                        <span className="text-[#C9A84C] text-sm">✨</span>
                        <span className="text-[#C9A84C] text-xs tracking-[4px] uppercase" style={{ fontFamily: getFont("jost") }}>
                            Journey Complete
                        </span>
                        <span className="text-[#C9A84C] text-sm">✨</span>
                    </div>
                </motion.div>
            )}

            {/* Content */}
            <div className="relative z-10 w-full max-w-[1200px] px-6 lg:px-12 text-center">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={controls.label} className="flex items-center justify-center gap-4 mb-8">
                    <motion.div initial={{ scaleX: 0 }} animate={controls.label} className="h-[1px] w-[60px] bg-[#C9A84C]/30 origin-left" transition={{ duration: 0.8, delay: 0.2 }} />
                    <span className="text-[#C9A84C] text-sm tracking-[6px] uppercase" style={{ fontFamily: getFont("jost"), fontWeight: FONT_WEIGHT.medium }}>
                        Chapter One The Nation
                    </span>
                    <motion.div initial={{ scaleX: 0 }} animate={controls.label} className="h-[1px] w-[60px] bg-[#C9A84C]/30 origin-right" transition={{ duration: 0.8, delay: 0.3 }} />
                </motion.div>

                {/* Counter — driven directly by the spring, no re-render lag */}
                <motion.div initial={{ opacity: 0, y: 30, scale: 0.8 }} animate={controls.counter} className="flex items-center justify-center gap-2 mb-8">
                    <motion.span
                        className="text-white/80 font-light tracking-tight leading-none"
                        style={{
                            fontFamily: getFont("cormorant"),
                            fontSize: "clamp(72px, 12vw, 140px)",
                            fontWeight: FONT_WEIGHT.light,
                            color: counterColor,
                            scale: counterScale,
                        }}
                    >
                        {countText}
                    </motion.span>
                    <span
                        className="text-[#C9A84C] text-2xl italic md:text-4xl font-light mb-2"
                        style={{ fontFamily: getFont("cormorant"), fontWeight: FONT_WEIGHT.light }}
                    >
                        billion
                    </span>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={controls.description}
                    className="text-white/70 max-w-[700px] mx-auto text-black md:text-xl leading-[24px] md:leading-[32px]"
                    style={{ fontFamily: getFont("jost"), fontWeight: 300 }}
                >
                    people. One shared ambition. Before IndieKonnect was a brand, it was an observation: India does not lack talent, it lacks doorways.
                </motion.p>

                {/* Progress bar — smooth width via motion value */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isHovering || isComplete ? 1 : 0.3 }}
                    className="mt-12 max-w-[400px] mx-auto"
                >
                    <div className="w-full h-[2px] bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-[#C9A84C] to-[#FFD700] rounded-full"
                            style={{ width: isComplete ? "100%" : barWidth }}
                        />
                    </div>
                    <div className="flex justify-between mt-2">
                        <span className="text-[#C9A84C]/40 text-[10px] tracking-[2px] uppercase" style={{ fontFamily: getFont("jost") }}>
                            Begin
                        </span>
                        <span className="text-[#C9A84C]/40 text-[10px] tracking-[2px] uppercase" style={{ fontFamily: getFont("jost") }}>
                            {isComplete ? "✓ Complete" : "Scroll"}
                        </span>
                    </div>
                </motion.div>

                {isComplete && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
                        <span className="text-[#C9A84C]/50 text-xs tracking-[4px] uppercase" style={{ fontFamily: getFont("jost") }}>
                            ↓ Continue scrolling to explore more
                        </span>
                    </motion.div>
                )}
            </div>

            <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={controls.accentLine}
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] max-w-[600px] h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent origin-center"
            />

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovering || isComplete ? 0.5 : 0.2, scale: isHovering || isComplete ? 1.1 : 1 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 pointer-events-none overflow-hidden"
            >
                {[...Array(30)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{
                            x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1000),
                            y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 800),
                            scale: 0,
                        }}
                        animate={{
                            y: [null, -(30 + Math.random() * 50), 0],
                            scale: [0, 0.5 + Math.random() * 1, 0],
                            opacity: [0, 0.5 + Math.random() * 0.5, 0],
                        }}
                        transition={{
                            duration: 2 + Math.random() * 4,
                            delay: Math.random() * 3,
                            repeat: Infinity,
                            repeatDelay: Math.random() * 2,
                        }}
                        className="absolute w-1 h-1 rounded-full bg-[#C9A84C]"
                        style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, boxShadow: "0 0 6px rgba(201, 168, 76, 0.3)" }}
                    />
                ))}
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovering || isComplete ? 0.5 : 0.2, scale: isHovering || isComplete ? 1.2 : 1 }}
                transition={{ duration: 0.5 }}
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] max-w-[1000px] h-[250px] bg-gradient-to-t from-[#C9A84C]/15 to-transparent blur-3xl pointer-events-none"
            />

            <style jsx>{`
                .grid-item {
                    will-change: transform;
                    backface-visibility: hidden;
                    transform: translateZ(0);
                }
                .grid-item:hover {
                    transform: scale(1.05) !important;
                    z-index: 10;
                    transition: transform 0.3s ease !important;
                }
            `}</style>
        </section>
    );
}