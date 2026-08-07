"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

import { COLORS } from "@/lib/constants/colors";
import {
    getFont,
    FONT_WEIGHT,
} from "@/lib/constants/font-family";

// Images array
const productImages = [
    require("../../../public/images/Collection1.jpg"),
    require("../../../public/images/Collection2.jpg"),
    require("../../../public/images/Collection3.jpg"),
    require("../../../public/images/Collection4.jpg"),
    require("../../../public/images/Collection5.jpg"),
    require("../../../public/images/Collection6.jpg"),
    require("../../../public/images/Collection7.jpg"),
    require("../../../public/images/Collection8.jpg"),
];

const products = [
    {
        id: "01",
        category: "Elegant Jewellery",
        title: "Celeste Necklace",
        price: "₹ 8,499",
        image: productImages[0],
    },
    {
        id: "02",
        category: "Beauty & Care",
        title: "Radiance Serum",
        price: "₹ 2,199",
        image: productImages[1],
    },
    {
        id: "03",
        category: "Lifestyle Dining",
        title: "Nova Dinner Set",
        price: "₹ 6,999",
        image: productImages[2],
    },
    {
        id: "04",
        category: "Timeless Horology",
        title: "Meridian Automatic",
        price: "₹ 18,499",
        image: productImages[3],
        badge: "NEW",
    },
    {
        id: "05",
        category: "Elegant Jewellery",
        title: "Diamond Pendant",
        price: "₹ 12,499",
        image: productImages[4],
    },
    {
        id: "06",
        category: "Beauty & Care",
        title: "Luxury Cream",
        price: "₹ 3,999",
        image: productImages[5],
    },
    {
        id: "07",
        category: "Lifestyle Dining",
        title: "Crystal Glasses",
        price: "₹ 5,499",
        image: productImages[6],
    },
    {
        id: "08",
        category: "Timeless Horology",
        title: "Classic Chronograph",
        price: "₹ 24,499",
        image: productImages[7],
    },
];

export default function CollectionsSection() {
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollContainerRef = useRef(null);
    const autoScrollRef = useRef(null);

    // Function to scroll to a specific product
    const scrollToProduct = (index) => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const cardWidth = 280 + 40; // card width + gap
            const scrollPosition = index * cardWidth;
            container.scrollTo({
                left: scrollPosition,
                behavior: "smooth",
            });
        }
    };

    // Auto-scroll effect
    useEffect(() => {
        const startAutoScroll = () => {
            autoScrollRef.current = setInterval(() => {
                setActiveIndex((prevIndex) => {
                    const nextIndex = (prevIndex + 1) % products.length;
                    scrollToProduct(nextIndex);
                    return nextIndex;
                });
            }, 1000); // Change every 3 seconds
        };

        startAutoScroll();

        // Cleanup on unmount
        return () => {
            if (autoScrollRef.current) {
                clearInterval(autoScrollRef.current);
            }
        };
    }, []);

    // Pause auto-scroll on hover
    const handleMouseEnter = () => {
        if (autoScrollRef.current) {
            clearInterval(autoScrollRef.current);
            autoScrollRef.current = null;
        }
    };

    const handleMouseLeave = () => {
        autoScrollRef.current = setInterval(() => {
            setActiveIndex((prevIndex) => {
                const nextIndex = (prevIndex + 1) % products.length;
                scrollToProduct(nextIndex);
                return nextIndex;
            });
        }, 1000);
    };

    // Manual scroll handler
    const handleScroll = () => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const cardWidth = 280 + 40;
            const scrollIndex = Math.round(container.scrollLeft / cardWidth);
            if (scrollIndex !== activeIndex && scrollIndex < products.length) {
                setActiveIndex(scrollIndex);
            }
        }
    };

    return (
        <section
            className="relative overflow-hidden py-12"
            style={{
                background: "#071424",
            }}
        >
            <div className="max-w-[1650px] mx-auto px-8">
                {/* Chapter */}
                <div className="flex items-center gap-4">
                    <div
                        className="w-10 h-[2px]"
                        style={{
                            background: COLORS.brand.gold,
                        }}
                    />
                    <span
                        className="uppercase tracking-[4px] text-[11px]"
                        style={{
                            color: COLORS.brand.gold,
                            fontFamily: getFont("jost"),
                        }}
                    >
                        Chapter Three • The Collections
                    </span>
                </div>

                {/* Heading */}
                <div className="flex justify-between items-end mt-4">
                    <h2
                        className="leading-none"
                        style={{
                            fontFamily: getFont("cormorant"),
                            fontSize: "70px",
                            color: "#F8F6F2",
                            fontWeight: FONT_WEIGHT.regular,
                        }}
                    >
                        Curated for the{" "}
                        <span
                            style={{
                                color: COLORS.brand.gold,
                                fontStyle: "italic",
                            }}
                        >
                            discerning
                        </span>
                    </h2>

                    <div className="hidden lg:flex items-center gap-4">
                        <div className="w-10 h-[1px] bg-white/30" />
                        <span
                            className="uppercase tracking-[4px] text-sm"
                            style={{
                                color: "#9CA3AF",
                                fontFamily: getFont("jost"),
                            }}
                        >
                            Auto-Scroll
                        </span>
                    </div>
                </div>

                {/* Cards - Auto-scrolling with hidden scrollbar */}
                <div
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    className="relative mt-6 flex gap-4 items-start overflow-x-auto pb-6 snap-x snap-mandatory"
                    style={{
                        scrollBehavior: "smooth",
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                    }}
                >
                    {/* Hide scrollbar for Chrome/Safari */}
                    <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>

                    {products.map((product, index) => (
                        <div
                            key={product.id}
                            className="group flex-shrink-0 w-[280px] snap-start transition-all duration-500 hover:-translate-y-2"
                            onClick={() => {
                                setActiveIndex(index);
                                scrollToProduct(index);
                            }}
                        >
                            <div className="relative rounded-2xl overflow-hidden bg-transparent">
                                {product.badge && (
                                    <div className="absolute top-4 right-4 z-20 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-full bg-[#FFC72C] text-[#071424]">
                                        {product.badge}
                                    </div>
                                )}

                                {/* Image with overlay text */}
                                <div className="relative w-full h-[400px] flex items-center justify-center">
                                    <div className="relative w-full h-full transition-transform duration-500 group-hover:scale-105">
                                        <Image
                                            src={product.image}
                                            alt={product.title}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 100vw, 280px"
                                            priority={index < 2}
                                        />
                                    </div>

                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                                    {/* Text Content - Overlaid on Image */}
                                    <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                                        <p
                                            className="text-xs uppercase tracking-[3px] text-white/70"
                                            style={{
                                                fontFamily: getFont("jost"),
                                            }}
                                        >
                                            {product.category}
                                        </p>
                                        <h3
                                            className="mt-1.5 text-xl font-medium text-white"
                                            style={{
                                                fontFamily: getFont("cormorant"),
                                            }}
                                        >
                                            {product.title}
                                        </h3>
                                        <span
                                            className="text-base font-medium"
                                            style={{
                                                color: COLORS.brand.gold,
                                                fontFamily: getFont("jost"),
                                            }}
                                        >
                                            {product.price}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Background Typography */}
                <h1
                    className="hidden lg:block absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none"
                    style={{
                        fontFamily: getFont("cormorant"),
                        fontSize: "240px",
                        fontStyle: "italic",
                        color: "rgba(255,199,44,.12)",
                        lineHeight: 1,
                        whiteSpace: "nowrap",
                    }}
                >
                    Beauty
                </h1>
                {/* Bottom Navigation */}
                <div className="mt-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                    {/* Left */}
                    <div className="flex items-center gap-6">
                        <div className="flex items-end">
                            <span
                                style={{
                                    fontFamily: getFont("cormorant"),
                                    color: COLORS.brand.gold,
                                    fontSize: "52px",
                                    lineHeight: 1,
                                }}
                            >
                                {String(activeIndex + 1).padStart(2, "0")}
                            </span>
                            <span
                                className="ml-2"
                                style={{
                                    color: "#8B919D",
                                    fontFamily: getFont("jost"),
                                    fontSize: "26px",
                                }}
                            >
                                / {String(products.length).padStart(2, "0")}
                            </span>
                        </div>

                        <span
                            className="uppercase tracking-[4px]"
                            style={{
                                color: "#A3AAB5",
                                fontFamily: getFont("jost"),
                                fontSize: "15px",
                            }}
                        >
                            {products[activeIndex]?.category || "Collections"}
                        </span>
                    </div>

                    {/* Progress */}
                    <div className="flex-1 lg:max-w-[1300px]">
                        <div className="relative h-[2px] bg-white/15 rounded-full overflow-hidden">
                            <div
                                className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
                                style={{
                                    width: `${((activeIndex + 1) / products.length) * 100}%`,
                                    background: COLORS.brand.gold,
                                }}
                            />
                        </div>
                    </div>

                    {/* Dots indicator */}
                    <div className="flex gap-2">
                        {products.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    setActiveIndex(index);
                                    scrollToProduct(index);
                                }}
                                className="transition-all duration-300 rounded-full"
                                style={{
                                    width: activeIndex === index ? "24px" : "8px",
                                    height: "8px",
                                    background: activeIndex === index ? COLORS.brand.gold : "rgba(255,255,255,0.2)",
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Top Glow */}
            <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full pointer-events-none"
                style={{
                    background:
                        "radial-gradient(circle, rgba(255,199,44,.05), transparent 70%)",
                    filter: "blur(80px)",
                }}
            />

            {/* Bottom Glow */}
            <div
                className="absolute bottom-[-250px] left-1/2 -translate-x-1/2 w-[1200px] h-[500px] pointer-events-none"
                style={{
                    background:
                        "radial-gradient(circle, rgba(255,255,255,.03), transparent 70%)",
                    filter: "blur(120px)",
                }}
            />
        </section>
    );
}