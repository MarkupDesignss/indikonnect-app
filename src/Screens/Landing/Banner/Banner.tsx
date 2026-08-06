"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import banner from "../../../../public/images/banner.png";
import { COLORS } from "../../../lib/constants/colors";

export function Banner() {
    const marqueeRef = useRef(null);
    const [isMounted, setIsMounted] = useState(false);
    const [showScrollIndicator, setShowScrollIndicator] = useState(true);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Handle scroll indicator visibility
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 100) {
                setShowScrollIndicator(false);
            } else {
                setShowScrollIndicator(true);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Marquee animation
    useEffect(() => {
        if (!isMounted) return;

        const marquee = marqueeRef.current;
        if (!marquee) return;

        let animationId;
        let position = 0;
        const speed = 0.5;

        const animate = () => {
            position -= speed;

            // Reset position when we've scrolled past one full set
            if (Math.abs(position) >= marquee.scrollWidth / 2) {
                position = 0;
            }

            if (marquee) {
                marquee.style.transform = `translateX(${position}px)`;
            }

            animationId = requestAnimationFrame(animate);
        };

        // Start animation after a small delay to ensure content is rendered
        const timer = setTimeout(() => {
            animate();
        }, 100);

        return () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
            clearTimeout(timer);
        };
    }, [isMounted]);

    return (
        <div className="w-full h-screen relative overflow-hidden">
            {/* Background Image */}
            <Image
                className="w-full h-full object-cover"
                src={banner}
                alt="Taj Mahal background"
                priority
                fill
            />

            {/* Overlay with Blur */}
            <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center z-[2] bg-black/20">
                {/* "Art of" Text - Using Cormorant font */}
                <div className="absolute top-[20%] left-1/2 -translate-x-1/2 text-center">
                    <span
                        className="block text-white text-[150px] font-light tracking-[-0.32px] leading-[0.9] antialiased"
                        style={{
                            fontFamily: 'var(--font-cormorant), "Cormorant Garamond", serif',
                        }}
                    >
                        Art of
                    </span>
                    <span
                        className="block text-[150px] font-light tracking-[-0.32px] leading-[0.9] italic antialiased"
                        style={{
                            color: COLORS.brand.gold,
                            fontFamily: 'var(--font-cormorant), "Cormorant Garamond", serif',
                            fontStyle: 'italic',
                            marginTop: '-20px'
                        }}
                    >
                        Opportunity
                    </span>
                </div>

                {/* Description Paragraph */}
                <p
                    className="text-white/85 mt-[180px] text-base font-light leading-[27.2px] text-center max-w-[500px] mb-[34px]"
                    style={{
                        fontFamily: 'var(--font-jost), "Jost", sans-serif',
                    }}
                >
                    A modern Indian movement built on Connection, Opportunity, Growth, and
                    Trust, where the spirit of 1.4 billion meets the power of
                    entrepreneurship.
                </p>

                {/* Buttons */}
                <div className="flex flex-row gap-5">
                    <Link
                        href="/join"
                        className="flex items-center justify-center gap-2.5 cursor-pointer px-[34px] py-4 bg-[#FFC72C] text-[#0A2240] border border-[#FFC72C] text-center no-underline uppercase text-xs font-medium leading-[20.4px] tracking-[2.64px] transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[#e6b52a] hover:scale-105 antialiased"
                        style={{
                            fontFamily: 'var(--font-jost), "Jost", sans-serif',
                        }}
                    >
                        JOIN THE MOVEMENT →
                    </Link>
                    <Link
                        href="/shop"
                        className="flex items-center justify-center gap-2.5 cursor-pointer font-medium px-[34px] py-4 text-white border-b border-b-white text-center uppercase text-xs leading-[20.4px] tracking-[2.64px] transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] antialiased"
                        style={{
                            fontFamily: 'var(--font-jost), "Jost", sans-serif',
                        }}
                    >
                        SHOP THE COLLECTIONS →
                    </Link>
                </div>

                {/* Scroll Indicator - Mouse Shape */}
                {showScrollIndicator && (
                    <div className="absolute bottom-[100px] left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
                        {/* Mouse Icon */}
                        <div className="relative">
                            <svg
                                width="26"
                                height="42"
                                viewBox="0 0 26 42"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="text-white/60"
                            >
                                <rect
                                    x="1"
                                    y="1"
                                    width="24"
                                    height="40"
                                    rx="12"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                />
                                {/* Scroll wheel */}
                                <path
                                    d="M13 8V16"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    className="animate-scroll-wheel"
                                />
                            </svg>
                        </div>

                        {/* Text */}
                        <span
                            className="text-white/60 text-[10px] tracking-[0.2em] uppercase animate-pulse"
                            style={{
                                fontFamily: 'var(--font-jost), "Jost", sans-serif',
                            }}
                        >
                            Scroll
                        </span>
                    </div>
                )}

                {/* Bottom Bar with Marquee Animation */}
                <div className="absolute bottom-0 left-0 w-full bg-[#0A2240] flex items-center justify-center z-[3] overflow-hidden">
                    <div
                        ref={marqueeRef}
                        className="flex whitespace-nowrap py-[30px] will-change-transform"
                        style={{ display: 'flex' }}
                    >
                        {[...Array(6)].map((_, index) => (
                            <span
                                key={index}
                                className={`text-white text-base tracking-[2px] uppercase italic opacity-80 ${index < 5 ? "mr-[50px]" : ""
                                    }`}
                                style={{
                                    fontFamily: 'var(--font-cormorant), "Cormorant Garamond", serif',
                                    fontStyle: 'italic'
                                }}
                            >
                                One Nation.One Network. Endless Possibilities.
                                <span className="ml-2.5" style={{ color: COLORS.brand.gold }}>
                                    ✦
                                </span>
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}