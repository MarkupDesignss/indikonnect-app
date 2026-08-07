"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

import banner from "../../../public/images/banner.png";
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

    useEffect(() => {
        setIsMounted(true);
    }, []);

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
        <section className="relative w-full h-screen overflow-hidden">
            {/* Background */}
            <Image
                src={banner}
                alt="Banner"
                fill
                priority
                className="object-cover"
            />

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-[#071421]/55 backdrop-blur-[1px]" />

            {/* Gradient Bottom */}
            <div className="absolute inset-x-0 bottom-0 h-[280px] bg-gradient-to-t from-[#081B35] via-[#081B35]/60 to-transparent z-[1]" />

            <div className="ml-5">

              <p
                className="uppercase tracking-[5px] text-[14px]"
                style={{
                  color: COLORS.brand.gold,
                  fontFamily: getFont("jost"),
                  fontWeight: FONT_WEIGHT.regular,
                }}
              >
                Nation • One Network • Endless Possibilities
              </p>

            </div>

            {/* Main Content */}
            <div className="relative z-10 w-full h-full max-w-[1600px] mx-auto">
                {/* Left Side - Desktop */}
                <div className="absolute left-[6%] top-1/2 -translate-y-1/2 max-w-[760px] hidden lg:block">
                    <h1
                        className="leading-[0.85]"
                        style={{
                            fontFamily: getFont("cormorant"),
                        }}
                    >
                        <span
                            className="block text-white font-light"
                            style={{
                                fontSize: "150px",
                                fontWeight: FONT_WEIGHT.light,
                            }}
                        >
                            Art of
                        </span>

                        <span
                            className="block italic font-light"
                            style={{
                                fontSize: "160px",
                                color: COLORS.brand.gold,
                                marginTop: "-25px",
                                fontWeight: FONT_WEIGHT.light,
                            }}
                        >
                            Opportunity
                        </span>
                    </h1>

                    <p
                        className="mt-8 text-white/80 max-w-[620px] text-[22px] leading-[42px]"
                        style={{
                            fontFamily: getFont("jost"),
                        }}
                    >
                        A modern Indian movement built on Connection,
                        Opportunity, Growth and Trust, where the spirit of
                        1.4 billion meets the power of entrepreneurship.
                    </p>

                    <div className="flex items-center gap-5 mt-12">
                        <Link
                            href="/join"
                            className="px-10 h-[62px] rounded-full bg-[#FFC72C] hover:bg-[#eab827] text-[#08131F] flex items-center justify-center font-semibold transition-all duration-300"
                        >
                            Join the Movement →
                        </Link>

                        <Link
                            href="/shop"
                            className="px-10 h-[62px] rounded-full border border-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/10 transition-all duration-300"
                        >
                            Shop the Collections →
                        </Link>
                    </div>
                </div>

                {/* Right Model */}
                <div className="absolute right-[4%] bottom-0 hidden lg:flex items-end justify-center z-20">
                    <div
                        className="relative overflow-hidden bg-[#C8102E]"
                        style={{
                            width: "520px",
                            height: "680px",
                            borderTopLeftRadius: "260px",
                            borderTopRightRadius: "260px",
                        }}
                    >
                        <Image
                            src={model}
                            alt="Model"
                            fill
                            priority
                            className="object-contain object-bottom scale-[1.02]"
                        />
                    </div>
                </div>

                {/* Scroll Indicator */}
                {showScrollIndicator && (
                    <div className="absolute left-[6%] bottom-[95px] z-30 flex flex-col items-start hidden lg:flex">
                        <span
                            className="uppercase tracking-[8px] text-white/60 text-[12px]"
                            style={{
                                fontFamily: getFont("jost"),
                            }}
                        >
                            Scroll
                        </span>
                        <div className="mt-5 w-[1px] h-[70px] bg-white/30 relative overflow-hidden">
                            <span className="absolute left-0 top-0 w-full h-[22px] bg-[#FFC72C] animate-bounce" />
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Marquee */}
            <div className="absolute bottom-0 left-0 w-full h-[72px] bg-[#071B34] overflow-hidden z-30 hidden lg:block">
                <div
                    ref={marqueeRef}
                    className="absolute left-0 top-0 flex items-center h-full whitespace-nowrap"
                >
                    {[...Array(8)].map((_, index) => (
                        <div
                            key={index}
                            className="flex items-center mr-16 shrink-0"
                        >
                            <span
                                className="uppercase italic text-[18px] tracking-[3px] text-white/80"
                                style={{
                                    fontFamily: getFont("cormorant"),
                                }}
                            >
                                One Nation • One Network • Endless Possibilities
                            </span>
                            <span
                                className="ml-6 text-[20px]"
                                style={{
                                    color: COLORS.brand.gold,
                                }}
                            >
                                ✦
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Mobile Hero */}
            <div className="lg:hidden absolute inset-0 z-20 flex flex-col justify-center px-6">
                <h1
                    className="leading-none"
                    style={{
                        fontFamily: getFont("cormorant"),
                    }}
                >
                    <span
                        className="block text-white font-light text-[64px]"
                        style={{
                            fontWeight: FONT_WEIGHT.light,
                        }}
                    >
                        Art of
                    </span>
                    <span
                        className="block italic text-[70px] font-light"
                        style={{
                            color: COLORS.brand.gold,
                            marginTop: "-10px",
                            fontWeight: FONT_WEIGHT.light,
                        }}
                    >
                        Opportunity
                    </span>
                </h1>

                <p
                    className="mt-6 text-white/80 leading-8 text-[16px] max-w-[340px]"
                    style={{
                        fontFamily: getFont("jost"),
                    }}
                >
                    A modern Indian movement built on Connection,
                    Opportunity, Growth and Trust where the spirit of
                    1.4 billion meets the power of entrepreneurship.
                </p>

                <div className="flex flex-col gap-4 mt-10">
                    <Link
                        href="/join"
                        className="h-[54px] rounded-full bg-[#FFC72C] text-[#08131F] flex items-center justify-center font-semibold"
                    >
                        Join the Movement →
                    </Link>
                    <Link
                        href="/shop"
                        className="h-[54px] rounded-full border border-white/20 text-white flex items-center justify-center backdrop-blur-md"
                    >
                        Shop the Collections →
                    </Link>
                </div>
            </div>
        </section>
    );
}