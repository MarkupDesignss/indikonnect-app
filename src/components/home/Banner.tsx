"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useAnimation, useInView } from "framer-motion";
import { FiArrowRight, FiChevronDown } from "react-icons/fi";
import banner from "../../../public/indiekonnect-web/images/banner.jpg";

import {
    getFont,
    FONT_WEIGHT,
} from "../../lib/constants/font-family";

import { COLORS } from "../../lib/constants/colors";

export default function Banner() {
    const marqueeRef = useRef<HTMLDivElement>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [showScrollIndicator, setShowScrollIndicator] = useState(true);
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: false, amount: 0.1 });

    const controls = {
        title: useAnimation(),
        description: useAnimation(),
        buttons: useAnimation(),
        nationLine: useAnimation(),
        trustBadges: useAnimation(),
    };

    // Letter animation variants - sliding from sides
    const letterSlideVariants = {
        hidden: (i: number) => ({
            opacity: 0,
            x: i % 2 === 0 ? -100 : 100,
            rotateY: 45,
            scale: 0.3,
        }),
        visible: (i: number) => ({
            opacity: 1,
            x: 0,
            rotateY: 0,
            scale: 1,
            transition: {
                delay: 0.1 + (i * 0.06),
                duration: 0.7,
                ease: [0.25, 0.46, 0.45, 0.94],
                type: "spring",
                damping: 12,
                stiffness: 150,
            }
        })
    };

    // Fast letter animation for "Opportunity"
    const fastLetterVariants = {
        hidden: (i: number) => ({
            opacity: 0,
            x: i % 2 === 0 ? -80 : 80,
            rotateY: 30,
            scale: 0.5,
        }),
        visible: (i: number) => ({
            opacity: 1,
            x: 0,
            rotateY: 0,
            scale: 1,
            transition: {
                delay: 0.05 + (i * 0.025),
                duration: 0.5,
                ease: [0.25, 0.46, 0.45, 0.94],
                type: "spring",
                damping: 15,
                stiffness: 180,
            }
        })
    };

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isInView) {
            controls.nationLine.start({
                opacity: 1,
                y: 0,
                transition: { duration: 0.6, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }
            });
            controls.title.start({
                opacity: 1,
                y: 0,
                transition: { duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
            });
            controls.description.start({
                opacity: 1,
                y: 0,
                transition: { duration: 0.8, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
            });
            controls.buttons.start({
                opacity: 1,
                y: 0,
                transition: { duration: 0.6, delay: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }
            });
            controls.trustBadges.start({
                opacity: 1,
                y: 0,
                transition: { duration: 0.6, delay: 1.0, ease: [0.25, 0.46, 0.45, 0.94] }
            });
        }
    }, [isInView, controls]);

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollIndicator(window.scrollY < 120);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        if (!isMounted) return;

        const marquee = marqueeRef.current;
        if (!marquee) return;

        let animationFrame: number;
        let position = 0;
        const speed = 0.45;

        const animate = () => {
            position -= speed;
            if (Math.abs(position) >= marquee.scrollWidth / 2) {
                position = 0;
            }
            marquee.style.transform = `translateX(${position}px)`;
            animationFrame = requestAnimationFrame(animate);
        };

        const timer = setTimeout(() => {
            animate();
        }, 100);

        return () => {
            cancelAnimationFrame(animationFrame);
            clearTimeout(timer);
        };
    }, [isMounted]);

    return (
        <section ref={sectionRef} className="relative w-full h-screen overflow-hidden bg-[#081B35]">
            {/* Background */}
            <motion.div
                initial={{ scale: 1.1, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.5 }}
                className="absolute inset-0"
            >
                <Image
                    src={banner}
                    alt="Banner"
                    fill
                    priority
                    className="object-cover"
                />
            </motion.div>

            {/* Gradient Overlay - Enhanced */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#071421]/80 via-[#071421]/60 to-[#071421]/90 backdrop-blur-[2px]" />

            {/* Animated Gradient Overlay */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.2 }}
                className="absolute inset-0 bg-gradient-to-t from-[#081B35] via-[#081B35]/40 to-transparent"
            />

            {/* Radial Glow Center */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.15, scale: 1 }}
                transition={{ duration: 1.5, delay: 0.3 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[#FFC72C] blur-3xl z-0"
            />

            {/* Gradient Bottom - Enhanced */}
            <div className="absolute inset-x-0 bottom-0 h-[300px] bg-gradient-to-t from-[#081B35] via-[#081B35]/80 to-transparent z-[1]" />

            {/* Decorative Elements */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.08, scale: 1 }}
                transition={{ duration: 1.5, delay: 0.5 }}
                className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-[#FFC72C] blur-3xl z-0"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.06, scale: 1 }}
                transition={{ duration: 1.5, delay: 0.7 }}
                className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#FFC72C] blur-3xl z-0"
            />

            {/* Main Content - Centered */}
            <div className="relative z-10 w-full h-full flex items-center justify-center px-6">
                <div className="w-full max-w-[900px] text-center">
                    {/* Main Title with Letter-by-Letter Animation */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={controls.title}
                        className="flex flex-col items-center justify-center"
                        style={{
                            fontFamily: getFont("cormorant"),
                        }}
                    >
                        {/* "Art of" - slightly smaller, moving down */}
                        <div className="flex flex-wrap items-center justify-center gap-x-2">
                            {["A", "r", "t", " ", "o", "f"].map((letter, index) => (
                                <motion.span
                                    key={index}
                                    custom={index}
                                    variants={letterSlideVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="inline-block"
                                    style={{
                                        fontSize: "clamp(40px, 6vw, 100px)",
                                        fontWeight: FONT_WEIGHT.light,
                                        color: "#ffffff",
                                        textShadow: "0 4px 60px rgba(0,0,0,0.3)",
                                        lineHeight: 0.9,
                                        marginRight: letter === " " ? "0.15em" : "0",
                                    }}
                                >
                                    {letter === " " ? "\u00A0" : letter}
                                </motion.span>
                            ))}
                        </div>

                        {/* "Opportunity" - larger, with fast animation */}
                        <div className="flex flex-wrap items-center justify-center gap-x-1 mt-2">
                            {"Opportunity".split('').map((letter, index) => (
                                <motion.span
                                    key={index}
                                    custom={index}
                                    variants={fastLetterVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="inline-block"
                                    style={{
                                        fontSize: "clamp(52px, 9vw, 140px)",
                                        fontWeight: FONT_WEIGHT.light,
                                        color: COLORS.brand.gold,
                                        fontStyle: "italic",
                                        textShadow: "0 4px 60px rgba(255,199,44,0.2)",
                                        lineHeight: 0.9,
                                    }}
                                >
                                    {letter}
                                </motion.span>
                            ))}
                        </div>
                    </motion.div>

                    {/* Decorative Gold Line under title */}
                    <motion.div
                        initial={{ scaleX: 0, opacity: 0 }}
                        animate={{
                            scaleX: 1,
                            opacity: 1,
                            transition: { delay: 1.2, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }
                        }}
                        className="w-[80px] h-[2px] bg-gradient-to-r from-[#FFC72C] to-[#FFC72C]/20 mx-auto mt-3"
                    />

                    {/* Description */}
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={controls.description}
                        className="mt-6 text-white/80 max-w-[650px] mx-auto text-[15px] md:text-[18px] leading-[28px] md:leading-[36px]"
                        style={{
                            fontFamily: getFont("jost"),
                            fontWeight: FONT_WEIGHT.light,
                        }}
                    >
                        A modern Indian movement built on Connection,
                        Opportunity, Growth and Trust, where the spirit of
                        1.4 billion meets the power of entrepreneurship.
                    </motion.p>

                    {/* Nation Line - Below Description */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={controls.nationLine}
                        className="flex justify-center mt-6"
                    >
                        <span
                            className="inline-flex items-center gap-2 px-4 py-2 border border-[#FFC72C]/20 rounded-full backdrop-blur-sm bg-[#FFC72C]/5"
                            style={{
                                fontFamily: getFont("jost"),
                            }}
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#FFC72C] animate-pulse" />
                            <span className="text-[#FFC72C] text-[10px] tracking-[4px] uppercase">
                                Nation • One Network • Endless Possibilities
                            </span>
                        </span>
                    </motion.div>

                    {/* Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={controls.buttons}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 mt-8 md:mt-10"
                    >
                        <Link
                            href="/join"
                            className="group px-8 md:px-10 h-[50px] md:h-[56px] rounded-full bg-[#FFC72C] hover:bg-[#f5b81e] text-[#08131F] flex items-center justify-center gap-2 font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#FFC72C]/30 min-w-[180px]"
                        >
                            Join the Movement
                            <motion.span
                                animate={{ x: [0, 5, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            >
                                <FiArrowRight className="text-xl w-4 h-4" />
                            </motion.span>
                        </Link>

                        <Link
                            href="/shop"
                            className="group px-8 md:px-10 h-[50px] md:h-[56px] rounded-full border border-white/20 backdrop-blur-md text-white flex items-center justify-center gap-2 hover:bg-white/10 hover:border-white/40 transition-all duration-300 hover:scale-105 min-w-[180px]"
                        >
                            Shop the Collections
                            <FiArrowRight className="text-xl w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>

                    {/* Trust Badges - Centered */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={controls.trustBadges}
                        className="flex items-center justify-center gap-6 md:gap-10 mt-8"
                    >
                        {["Trust", "Growth", "Opportunity", "Innovation"].map((item, index) => (
                            <motion.div
                                key={index}
                                className="flex items-center gap-2"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 1.2 + (index * 0.1), duration: 0.4 }}
                            >
                                <motion.div
                                    className="w-1.5 h-1.5 rounded-full bg-[#FFC72C]"
                                    animate={{ scale: [1, 1.5, 1] }}
                                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                                />
                                <span
                                    className="text-[10px] md:text-[11px] text-white/50 uppercase tracking-[2px]"
                                    style={{
                                        fontFamily: getFont("jost"),
                                    }}
                                >
                                    {item}
                                </span>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* Scroll Indicator - Moved further down */}
            {showScrollIndicator && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 0.6 }}
                    className="absolute bottom-[20px] left-1/2 -translate-x-1/2 z-30 flex flex-col items-center"
                >
                    <span
                        className="uppercase tracking-[8px] text-white/20 text-[9px]"
                        style={{
                            fontFamily: getFont("jost"),
                        }}
                    >
                        Scroll
                    </span>
                    <div className="mt-2 w-[1px] h-[40px] bg-white/10 relative overflow-hidden">
                        <motion.span
                            animate={{ y: ["0%", "100%"] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="absolute left-0 top-0 w-full h-[30%] bg-[#FFC72C]"
                        />
                    </div>
                </motion.div>
            )}

            {/* Bottom Gradient Glow */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                transition={{ duration: 1.2, delay: 0.5 }}
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] max-w-[1000px] h-[200px] bg-gradient-to-t from-[#FFC72C]/10 to-transparent blur-3xl pointer-events-none z-[1]"
            />

            {/* Floating Particles */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.8 }}
                className="absolute inset-0 pointer-events-none overflow-hidden z-[1]"
            >
                {[...Array(25)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{
                            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
                            scale: 0
                        }}
                        animate={{
                            y: [null, -(40 + Math.random() * 80), 0],
                            scale: [0, 0.3 + Math.random() * 1, 0],
                            opacity: [0, 0.2 + Math.random() * 0.4, 0]
                        }}
                        transition={{
                            duration: 4 + Math.random() * 7,
                            delay: Math.random() * 5,
                            repeat: Infinity,
                            repeatDelay: Math.random() * 4,
                            ease: "easeInOut"
                        }}
                        className="absolute w-0.5 h-0.5 rounded-full bg-[#FFC72C]"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            boxShadow: '0 0 8px rgba(255,199,44,0.3)',
                            width: `${1 + Math.random() * 2}px`,
                            height: `${1 + Math.random() * 2}px`,
                        }}
                    />
                ))}
            </motion.div>
        </section>
    );
}