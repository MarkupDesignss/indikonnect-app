"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion, useAnimation, useInView } from "framer-motion";

import { COLORS } from "@/lib/constants/colors";
import {
    getFont,
    FONT_WEIGHT,
} from "@/lib/constants/font-family";

// Images array
const productImages = [
    require("../../../public/indiekonnect-web/images/Collection1.jpg"),
    require("../../../public/indiekonnect-web/images/Collection2.jpg"),
    require("../../../public/indiekonnect-web/images/Collection3.jpg"),
    require("../../../public/indiekonnect-web/images/Collection4.jpg"),
    require("../../../public/indiekonnect-web/images/Collection5.jpg"),
    require("../../../public/indiekonnect-web/images/Collection6.jpg"),
    require("../../../public/indiekonnect-web/images/Collection7.jpg"),
    require("../../../public/indiekonnect-web/images/Collection8.jpg"),
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
    const [isHovering, setIsHovering] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: false, amount: 0.1 });

    const controls = {
        title: useAnimation(),
        subtitle: useAnimation(),
        products: useAnimation(),
    };

    // Animation for entrance
    useEffect(() => {
        if (isInView) {
            controls.title.start({
                opacity: 1,
                y: 0,
                transition: { duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }
            });
            controls.subtitle.start({
                opacity: 1,
                y: 0,
                transition: { duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
            });
        }
    }, [isInView, controls]);

    // Function to scroll to a specific product
    const scrollToProduct = (index: number) => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const cardWidth = 280 + 32; // card width + gap
            const scrollPosition = index * cardWidth;
            container.scrollTo({
                left: scrollPosition,
                behavior: "smooth",
            });
        }
    };

    // Auto-scroll effect - product by product
    useEffect(() => {
        if (isPaused || !isInView) return;

        const startAutoScroll = () => {
            const interval = setInterval(() => {
                setActiveIndex((prevIndex) => {
                    const nextIndex = (prevIndex + 1) % products.length;
                    scrollToProduct(nextIndex);
                    return nextIndex;
                });
            }, 1500); // Change every 1.5 seconds - smooth transition

            return interval;
        };

        const intervalId = startAutoScroll();

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [isPaused, isInView]);

    // Handle manual scroll
    const handleScroll = () => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const cardWidth = 280 + 32;
            const scrollIndex = Math.round(container.scrollLeft / cardWidth);
            if (scrollIndex !== activeIndex && scrollIndex < products.length) {
                setActiveIndex(scrollIndex);
            }
        }
    };

    // Product variants for sequential animation
    const productVariants = {
        hidden: (i: number) => ({
            opacity: 0,
            x: 60,
            scale: 0.9,
            rotateY: 15,
        }),
        visible: (i: number) => ({
            opacity: 1,
            x: 0,
            scale: 1,
            rotateY: 0,
            transition: {
                delay: 0.3 + (i * 0.08),
                duration: 0.6,
                ease: [0.25, 0.46, 0.45, 0.94],
                type: "spring",
                damping: 15,
                stiffness: 120,
            }
        }),
        exit: (i: number) => ({
            opacity: 0,
            x: -60,
            scale: 0.9,
            rotateY: -15,
            transition: {
                duration: 0.4,
                ease: [0.25, 0.46, 0.45, 0.94],
            }
        })
    };

    return (
        <section
            ref={sectionRef}
            className="relative overflow-hidden py-16 md:py-24"
            style={{
                background: "#071424",
            }}
        >
            {/* Background Decorative Text */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.06 }}
                transition={{ duration: 1.5 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none"
            >
                <span
                    style={{
                        fontFamily: getFont("cormorant"),
                        fontSize: "clamp(120px, 20vw, 300px)",
                        fontStyle: "italic",
                        color: COLORS.brand.gold,
                        lineHeight: 1,
                        whiteSpace: "nowrap",
                        opacity: 0.3,
                    }}
                >
                    Collections
                </span>
            </motion.div>

            <div className="max-w-[1650px] mx-auto px-6 md:px-8 relative z-10">
                {/* Chapter Label */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={controls.subtitle}
                    className="flex items-center gap-4"
                >
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
                </motion.div>

                {/* Heading */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={controls.title}
                    className="flex flex-col lg:flex-row justify-between items-start lg:items-end mt-4 gap-4"
                >
                    <h2
                        className="leading-none"
                        style={{
                            fontFamily: getFont("cormorant"),
                            fontSize: "clamp(40px, 8vw, 70px)",
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

                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex items-center gap-3">
                            <div className="w-12 h-[1px] bg-white/20" />
                            <span
                                className="uppercase tracking-[4px] text-xs"
                                style={{
                                    color: "#9CA3AF",
                                    fontFamily: getFont("jost"),
                                }}
                            >
                                Auto-Scroll
                            </span>
                        </div>

                        {/* Progress Counter */}
                        <div className="flex items-center gap-1">
                            <span
                                style={{
                                    fontFamily: getFont("cormorant"),
                                    color: COLORS.brand.gold,
                                    fontSize: "clamp(24px, 3vw, 32px)",
                                    lineHeight: 1,
                                }}
                            >
                                {String(activeIndex + 1).padStart(2, "0")}
                            </span>
                            <span
                                style={{
                                    color: "#8B919D",
                                    fontFamily: getFont("jost"),
                                    fontSize: "clamp(14px, 1.5vw, 18px)",
                                }}
                            >
                                / {String(products.length).padStart(2, "0")}
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* Cards - Auto-scrolling with hidden scrollbar */}
                <div
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    onMouseEnter={() => {
                        setIsHovering(true);
                        setIsPaused(true);
                    }}
                    onMouseLeave={() => {
                        setIsHovering(false);
                        setIsPaused(false);
                    }}
                    className="relative mt-8 flex gap-6 items-start overflow-x-auto pb-8 snap-x snap-mandatory"
                    style={{
                        scrollBehavior: "smooth",
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                    }}
                >
                    <style jsx>{`
                        div::-webkit-scrollbar {
                            display: none;
                        }
                    `}</style>

                    {products.map((product, index) => (
                        <motion.div
                            key={product.id}
                            custom={index}
                            variants={productVariants}
                            initial="hidden"
                            animate={isInView ? "visible" : "hidden"}
                            exit="exit"
                            className="group flex-shrink-0 w-[280px] snap-start transition-all duration-500"
                            style={{
                                transformOrigin: 'center center',
                            }}
                            onClick={() => {
                                setActiveIndex(index);
                                scrollToProduct(index);
                            }}
                            whileHover={{
                                y: -12,
                                scale: 1.02,
                                transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
                            }}
                        >
                            <div className="relative rounded-2xl overflow-hidden bg-transparent">
                                {product.badge && (
                                    <motion.div
                                        className="absolute top-4 right-4 z-20 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-full bg-[#FFC72C] text-[#071424]"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.5 + (index * 0.1) }}
                                    >
                                        {product.badge}
                                    </motion.div>
                                )}

                                {/* Image with overlay text */}
                                <div className="relative w-full h-[400px] flex items-center justify-center overflow-hidden">
                                    <div className="relative w-full h-full transition-transform duration-700 group-hover:scale-110">
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
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                                    {/* Hover Glow */}
                                    <motion.div
                                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                        style={{
                                            background: 'radial-gradient(circle at center, rgba(255,199,44,0.1), transparent 70%)',
                                        }}
                                    />

                                    {/* Text Content - Overlaid on Image */}
                                    <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                                        <motion.p
                                            className="text-xs uppercase tracking-[3px] text-white/70"
                                            style={{
                                                fontFamily: getFont("jost"),
                                            }}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.4 + (index * 0.08) }}
                                        >
                                            {product.category}
                                        </motion.p>
                                        <motion.h3
                                            className="mt-1.5 text-xl font-medium text-white"
                                            style={{
                                                fontFamily: getFont("cormorant"),
                                            }}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.5 + (index * 0.08) }}
                                        >
                                            {product.title}
                                        </motion.h3>
                                        <motion.span
                                            className="text-black font-medium"
                                            style={{
                                                color: COLORS.brand.gold,
                                                fontFamily: getFont("jost"),
                                            }}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.6 + (index * 0.08) }}
                                        >
                                            {product.price}
                                        </motion.span>
                                    </div>

                                    {/* Decorative Line on Hover */}
                                    <motion.div
                                        className="absolute bottom-0 left-0 h-[2px] bg-[#FFC72C]"
                                        initial={{ width: "0%" }}
                                        whileHover={{ width: "100%" }}
                                        transition={{ duration: 0.4 }}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom Navigation */}
                <div className="mt-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    {/* Category Name - Dynamic */}
                    <div className="flex items-center gap-6 order-2 lg:order-1">
                        <span
                            className="uppercase tracking-[4px] text-sm"
                            style={{
                                color: "#A3AAB5",
                                fontFamily: getFont("jost"),
                                fontSize: "clamp(13px, 1.2vw, 15px)",
                            }}
                        >
                            {products[activeIndex]?.category || "Collections"}
                        </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex-1 lg:max-w-[800px] order-1 lg:order-2">
                        <div className="relative h-[2px] bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                className="absolute left-0 top-0 h-full rounded-full"
                                style={{
                                    background: `linear-gradient(90deg, ${COLORS.brand.gold}, ${COLORS.brand.gold}88)`,
                                }}
                                animate={{
                                    width: `${((activeIndex + 1) / products.length) * 100}%`,
                                }}
                                transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                            />

                            {/* Animated glow on progress */}
                            <motion.div
                                className="absolute top-0 h-full w-20 rounded-full blur-sm"
                                style={{
                                    background: COLORS.brand.gold,
                                }}
                                animate={{
                                    left: `${((activeIndex + 1) / products.length) * 100 - 5}%`,
                                }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                    </div>

                    {/* Dots indicator */}
                    <div className="flex gap-2 order-3">
                        {products.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    setActiveIndex(index);
                                    scrollToProduct(index);
                                }}
                                className="transition-all duration-300 rounded-full relative"
                                style={{
                                    width: activeIndex === index ? "24px" : "8px",
                                    height: "8px",
                                    background: activeIndex === index ? COLORS.brand.gold : "rgba(255,255,255,0.15)",
                                }}
                            >
                                {activeIndex === index && (
                                    <motion.div
                                        className="absolute inset-0 rounded-full"
                                        style={{
                                            background: COLORS.brand.gold,
                                            filter: 'blur(4px)',
                                            opacity: 0.4,
                                        }}
                                        layoutId="activeDot"
                                        transition={{ duration: 0.3 }}
                                    />
                                )}
                            </button>
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

            {/* Side Gradient */}
            <div
                className="absolute right-0 top-1/2 -translate-y-1/2 w-[300px] h-[600px] pointer-events-none"
                style={{
                    background: "linear-gradient(90deg, transparent, rgba(255,199,44,.02) 100%)",
                    filter: "blur(60px)",
                }}
            />
        </section>
    );
}