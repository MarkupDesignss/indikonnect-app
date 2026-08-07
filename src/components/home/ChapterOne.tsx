"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useInView } from "react-intersection-observer";
import { getFont, FONT_WEIGHT } from "../../lib/constants/font-family";
import { COLORS } from "../../lib/constants/colors";

// Array of background images with different heights
const gridImages = [
    { id: 1, src: "/images/chapter-bg-1.jpg", height: "h-[300px]" },
    { id: 2, src: "/images/chapter-bg-2.jpg", height: "h-[400px]" },
    { id: 3, src: "/images/chapter-bg-3.jpg", height: "h-[350px]" },
    { id: 4, src: "/images/chapter-bg-4.jpg", height: "h-[280px]" },
    { id: 5, src: "/images/chapter-bg-5.jpg", height: "h-[450px]" },
    { id: 6, src: "/images/chapter-bg-6.jpg", height: "h-[320px]" },
    { id: 7, src: "/images/chapter-bg-7.jpg", height: "h-[380px]" },
    { id: 8, src: "/images/chapter-bg-8.jpg", height: "h-[260px]" },
    { id: 9, src: "/images/chapter-bg-9.jpg", height: "h-[420px]" },
   
];

export default function ChapterOne() {
    const [count, setCount] = useState(0);
    const [hasAnimated, setHasAnimated] = useState(false);
    const animationRef = useRef<number | null>(null);
    const sectionRef = useRef<HTMLElement>(null);
    
    // Use react-intersection-observer
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.3,
        rootMargin: "0px",
    });

    // Counter animation - starts when user scrolls to it
    useEffect(() => {
        if (!inView || hasAnimated) return;

        setHasAnimated(true);
        
        const duration = 3000;
        const startTime = performance.now();
        const steps = 14;
        let currentStep = 0;

        const animateCounter = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const stepProgress = progress * steps;
            currentStep = Math.floor(stepProgress);
            
            let value = 0;
            if (currentStep <= 9) {
                value = (currentStep + 1) * 0.1;
            } else {
                value = 1.0 + (currentStep - 9) * 0.1;
            }
            
            if (value > 1.4) value = 1.4;
            
            setCount(value);

            if (progress < 1) {
                animationRef.current = requestAnimationFrame(animateCounter);
            } else {
                setCount(1.4);
            }
        };

        const startTimeout = setTimeout(() => {
            animationRef.current = requestAnimationFrame(animateCounter);
        }, 300);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            clearTimeout(startTimeout);
        };
    }, [inView, hasAnimated]);

    return (
        <section
            ref={ref}
            className="relative w-full min-h-screen overflow-hidden bg-[#0A1628] flex items-center justify-center py-20"
        >
            {/* Background Image Grid with Ken Burns Effect */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 w-full h-full">
                    {gridImages.map((img, index) => (
                        <div
                            key={img.id}
                            className={`relative ${img.height} w-full rounded-lg overflow-hidden shadow-2xl transition-transform duration-700 hover:scale-105`}
                        >
                            <Image
                                src={img.src}
                                alt={`Chapter background ${index + 1}`}
                                fill
                                className="object-cover animate-ken-burns"
                                priority={index < 3}
                            />
                            {/* Dark Overlay on each image */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628]/80 via-[#0A1628]/40 to-transparent" />
                        </div>
                    ))}
                </div>
                
                {/* Overall Dark Overlay */}
                <div className="absolute inset-0 bg-[#0A1628]/40 backdrop-blur-[2px]" />
            </div>

            {/* Content - Centered on top of grid */}
            <div className="relative z-10 w-full max-w-[1200px] px-6 lg:px-12 text-center">
                {/* Chapter Label */}
                <div className="flex items-center justify-center gap-4 mb-8">
                    <div className="h-[1px] w-[60px] bg-[#C9A84C]/30" />
                    <span
                        className="text-[#C9A84C] text-sm tracking-[6px] uppercase"
                        style={{
                            fontFamily: getFont("jost"),
                            fontWeight: FONT_WEIGHT.medium,
                        }}
                    >
                        Chapter One
                    </span>
                    <div className="h-[1px] w-[60px] bg-[#C9A84C]/30" />
                </div>

                {/* Main Heading */}
                <h2
                    className="text-white leading-[0.9] mb-6"
                    style={{
                        fontFamily: getFont("cormorant"),
                        fontWeight: FONT_WEIGHT.light,
                        fontSize: "clamp(48px, 8vw, 100px)",
                    }}
                >
                    <span className="block">The Nation</span>
                </h2>

                {/* Counter with billion */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    <span
                        className="text-[#C9A84C] font-light tracking-tight leading-none transition-all duration-100"
                        style={{
                            fontFamily: getFont("cormorant"),
                            fontSize: "clamp(72px, 12vw, 140px)",
                            fontWeight: FONT_WEIGHT.light,
                        }}
                    >
                        {count.toFixed(1)}
                    </span>
                    <span
                        className="text-white/60 text-2xl md:text-4xl font-light mb-2"
                        style={{
                            fontFamily: getFont("cormorant"),
                            fontWeight: FONT_WEIGHT.light,
                        }}
                    >
                        billion
                    </span>
                </div>

                {/* Description - Centered */}
                <p
                    className="text-white/70 max-w-[700px] mx-auto text-base md:text-xl leading-[32px] md:leading-[42px]"
                    style={{
                        fontFamily: getFont("jost"),
                        fontWeight: 300,
                    }}
                >
                    people. One shared ambition. Before IndieKonnect was a
                    brand, it was an observation: India does not lack talent,
                    it lacks doorways.
                </p>

                {/* Scroll Indicator - Centered */}
                <div className="flex items-center justify-center gap-4 mt-12">
                    <span
                        className="uppercase tracking-[6px] text-white/30 text-xs"
                        style={{
                            fontFamily: getFont("jost"),
                        }}
                    >
                        Scroll
                    </span>
                    <div className="w-[60px] h-[1px] bg-white/20 relative overflow-hidden">
                        <span className="absolute left-0 top-0 w-[30%] h-full bg-[#C9A84C] animate-scroll-line" />
                    </div>
                </div>
            </div>

            {/* Gold Accent Line - Bottom Center */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] max-w-[600px] h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />

            {/* CSS Animations */}
            <style jsx>{`
                @keyframes ken-burns {
                    0% {
                        transform: scale(1) translate(0, 0);
                    }
                    50% {
                        transform: scale(1.1) translate(-2%, -2%);
                    }
                    100% {
                        transform: scale(1) translate(0, 0);
                    }
                }
                
                .animate-ken-burns {
                    animation: ken-burns 12s ease-in-out infinite;
                }

                @keyframes scroll-line {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(200%);
                    }
                }
                
                .animate-scroll-line {
                    animation: scroll-line 2s ease-in-out infinite;
                }

                /* Masonry-like grid with varying heights */
                .grid {
                    grid-auto-rows: minmax(100px, auto);
                }
            `}</style>
        </section>
    );
}