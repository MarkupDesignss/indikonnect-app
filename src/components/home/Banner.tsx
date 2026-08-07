"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useAnimation, useInView } from "framer-motion";
import { FiArrowRight, FiChevronDown } from "react-icons/fi";
import banner from "../../../public/images/banner.jpg";
import model from "../../../public/images/model.jpg";

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
        subtitle: useAnimation(),
        description: useAnimation(),
        buttons: useAnimation(),
        model: useAnimation(),
        nationLine: useAnimation(),
    };

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isInView) {
            controls.title.start({ opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.2 } });
            controls.nationLine.start({ opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.1 } });
            controls.subtitle.start({ opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.4 } });
            controls.description.start({ opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.6 } });
            controls.buttons.start({ opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.8 } });
            controls.model.start({ opacity: 1, scale: 1, transition: { duration: 0.8, delay: 0.5 } });
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
            <div className="absolute inset-0 bg-gradient-to-r from-[#071421]/90 via-[#071421]/70 to-[#071421]/40 backdrop-blur-[2px]" />
            
            {/* Animated Gradient Overlay */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.2 }}
                className="absolute inset-0 bg-gradient-to-t from-[#081B35] via-[#081B35]/40 to-transparent"
            />

            {/* Gradient Bottom - Enhanced */}
            <div className="absolute inset-x-0 bottom-0 h-[300px] bg-gradient-to-t from-[#081B35] via-[#081B35]/80 to-transparent z-[1]" />

            {/* Decorative Elements */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.1, scale: 1 }}
                transition={{ duration: 1.5, delay: 0.5 }}
                className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-[#FFC72C] blur-3xl z-0"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.08, scale: 1 }}
                transition={{ duration: 1.5, delay: 0.7 }}
                className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#FFC72C] blur-3xl z-0"
            />

            {/* Main Content */}
            <div className="relative z-10 w-full h-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                {/* Left Side - Desktop */}
                <div className="absolute left-[4%] lg:left-[6%] top-1/2 -translate-y-1/2 max-w-[720px] hidden lg:block">
                    {/* Nation Line - Moved up by -10px */}
                    <motion.p
                        initial={{ opacity: 0, y: -20 }}
                        animate={controls.nationLine}
                        className="uppercase tracking-[5px] text-[11px] md:text-[12px] mb-8"
                        style={{
                            color: COLORS.brand.gold,
                            fontFamily: getFont("jost"),
                            fontWeight: FONT_WEIGHT.regular,
                            letterSpacing: "6px",
                            marginTop: "50px",
                        }}
                    >
                        <span className="inline-block px-3 py-1 border border-[#FFC72C]/20 rounded-full backdrop-blur-sm bg-[#FFC72C]/5">
                            Nation • One Network • Endless Possibilities
                        </span>
                    </motion.p>

                    <motion.h1
                        initial={{ opacity: 0, y: 50 }}
                        animate={controls.title}
                        className="leading-[0.85]"
                        style={{
                            fontFamily: getFont("cormorant"),
                        }}
                    >
                        <span
                            className="block text-white font-light"
                            style={{
                                fontSize: "clamp(80px, 9vw, 150px)",
                                fontWeight: FONT_WEIGHT.light,
                                textShadow: "0 4px 60px rgba(0,0,0,0.3)",
                            }}
                        >
                            Art of
                        </span>
                        <span
                            className="block italic font-light"
                            style={{
                                fontSize: "clamp(90px, 9.5vw, 160px)",
                                color: COLORS.brand.gold,
                                marginTop: "20px",
                                fontWeight: FONT_WEIGHT.light,
                                textShadow: "0 4px 60px rgba(255,199,44,0.15)",
                            }}
                        >
                            Opportunity
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={controls.description}
                        className="mt-8 text-white/80 max-w-[540px] text-[16px] md:text-[18px] leading-[32px] md:leading-[38px]"
                        style={{
                            fontFamily: getFont("jost"),
                            fontWeight: FONT_WEIGHT.light,
                        }}
                    >
                        A modern Indian movement built on Connection,
                        Opportunity, Growth and Trust, where the spirit of
                        1.4 billion meets the power of entrepreneurship.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={controls.buttons}
                        className="flex flex-wrap items-center gap-4 md:gap-6 mt-10 md:mt-14"
                    >
                        <Link
                            href="/join"
                            className="group px-8 md:px-10 h-[54px] md:h-[62px] rounded-full bg-[#FFC72C] hover:bg-[#f5b81e] text-[#08131F] flex items-center justify-center gap-2 font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#FFC72C]/30"
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
                            className="group px-8 md:px-10 h-[54px] md:h-[62px] rounded-full border border-white/20 backdrop-blur-md text-white flex items-center justify-center gap-2 hover:bg-white/10 hover:border-white/40 transition-all duration-300 hover:scale-105"
                        >
                            Shop the Collections
                            <FiArrowRight className="text-xl w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>

                    {/* Trust Badges */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2, duration: 0.6 }}
                        className="flex items-center gap-6 md:gap-8 mt-10"
                    >
                        {["Trust", "Growth", "Opportunity"].map((item, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#FFC72C]" />
                                <span
                                    className="text-[10px] md:text-[11px] text-white/50 uppercase tracking-[2px]"
                                    style={{
                                        fontFamily: getFont("jost"),
                                    }}
                                >
                                    {item}
                                </span>
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* Right Model - Desktop - Made Taller */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 50 }}
                    animate={controls.model}
                    className="absolute right-[2%] lg:right-[4%] bottom-0 hidden lg:flex items-end justify-center z-20"
                >
                    <div
                        className="relative overflow-hidden bg-gradient-to-b from-[#C8102E]/80 to-[#C8102E] shadow-2xl"
                        style={{
                            width: "clamp(340px, 30vw, 500px)",
                            height: "clamp(580px, 70vh, 780px)", // Increased height
                            borderTopLeftRadius: "clamp(200px, 22vw, 300px)",
                            borderTopRightRadius: "clamp(200px, 22vw, 300px)",
                        }}
                    >
                        <Image
                            src={model}
                            alt="Model"
                            fill
                            priority
                            className="object-contain object-bottom scale-[1.02]"
                        />
                        
                        {/* Glow Effect */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#FFC72C]/10 via-transparent to-transparent" />
                        
                        {/* Shine Effect */}
                        <motion.div
                            animate={{
                                x: ["-100%", "200%"],
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                repeatDelay: 2,
                            }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg]"
                        />
                    </div>
                </motion.div>

                {/* Scroll Indicator */}
                {showScrollIndicator && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5, duration: 0.6 }}
                        className="absolute left-[4%] lg:left-[6%] bottom-[60px] lg:bottom-[95px] z-30 flex flex-col items-start hidden lg:flex"
                    >
                        <span
                            className="uppercase tracking-[8px] text-white/40 text-[11px]"
                            style={{
                                fontFamily: getFont("jost"),
                            }}
                        >
                            Scroll
                        </span>
                        <div className="mt-4 w-[1px] h-[50px] lg:h-[70px] bg-white/20 relative overflow-hidden">
                            <motion.span
                                animate={{ y: ["0%", "100%"] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="absolute left-0 top-0 w-full h-[30%] bg-[#FFC72C]"
                            />
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Mobile Hero - Enhanced */}
            <div className="lg:hidden absolute inset-0 z-20 flex flex-col justify-center px-6">
                {/* Background gradient for mobile */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#081B35] via-[#081B35]/60 to-transparent" />
                
                <div className="relative z-10">
                    {/* Nation Line - Mobile */}
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="uppercase tracking-[3px] text-[10px] mb-5"
                        style={{
                            color: COLORS.brand.gold,
                            fontFamily: getFont("jost"),
                            fontWeight: FONT_WEIGHT.regular,
                            marginTop: "-10px", // Added -10px margin top
                        }}
                    >
                        Nation • One Network • Endless Possibilities
                    </motion.p>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="leading-[0.9]"
                        style={{
                            fontFamily: getFont("cormorant"),
                        }}
                    >
                        <span
                            className="block text-white font-light"
                            style={{
                                fontSize: "clamp(48px, 12vw, 72px)",
                                fontWeight: FONT_WEIGHT.light,
                                textShadow: "0 2px 40px rgba(0,0,0,0.3)",
                            }}
                        >
                            Art of
                        </span>
                        <span
                            className="block italic font-light"
                            style={{
                                fontSize: "clamp(52px, 13vw, 78px)",
                                color: COLORS.brand.gold,
                                marginTop: "-8px",
                                fontWeight: FONT_WEIGHT.light,
                                textShadow: "0 2px 40px rgba(255,199,44,0.15)",
                            }}
                        >
                            Opportunity
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="mt-5 text-white/70 leading-7 text-[15px] max-w-[320px]"
                        style={{
                            fontFamily: getFont("jost"),
                            fontWeight: FONT_WEIGHT.light,
                        }}
                    >
                        A modern Indian movement built on Connection,
                        Opportunity, Growth and Trust where the spirit of
                        1.4 billion meets the power of entrepreneurship.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="flex flex-col sm:flex-row items-center gap-4 mt-10"
                    >
                        <Link
                            href="/join"
                            className="group px-8 h-[52px] rounded-full bg-[#FFC72C] hover:bg-[#f5b81e] text-[#08131F] flex items-center justify-center gap-2 font-semibold transition-all duration-300 w-full sm:w-auto hover:scale-105 shadow-lg shadow-[#FFC72C]/20"
                        >
                            Join the Movement
                            <FiArrowRight className="text-xl w-4 h-4" />
                        </Link>

                        <Link
                            href="/shop"
                            className="group px-8 h-[52px] rounded-full border border-white/20 backdrop-blur-md text-white flex items-center justify-center gap-2 hover:bg-white/10 transition-all duration-300 w-full sm:w-auto hover:scale-105"
                        >
                            Shop the Collections
                            <FiArrowRight className="text-xl w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>

                    {/* Mobile Trust Badges */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="flex items-center gap-4 mt-8"
                    >
                        {["Trust", "Growth", "Opportunity"].map((item, index) => (
                            <div key={index} className="flex items-center gap-1.5">
                                <div className="w-1 h-1 rounded-full bg-[#FFC72C]" />
                                <span
                                    className="text-[9px] text-white/40 uppercase tracking-[1.5px]"
                                    style={{
                                        fontFamily: getFont("jost"),
                                    }}
                                >
                                    {item}
                                </span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}