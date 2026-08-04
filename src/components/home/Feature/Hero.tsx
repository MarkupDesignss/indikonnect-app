"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef } from "react";
import { COLORS } from "@/src/lib/constants/colors";
import {
    ShoppingBag,
    Heart,
    Star,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import Watch from "../../../../public/images/watch.jpeg";
import Necklace from "../../../../public/images/necklace.jpeg";
import Beauty from "../../../../public/images/makeup.jpeg";
import Dinner from "../../../../public/images/Dinner.jpeg";

const products = [
    {
        id: 1,
        name: "Aurelia Chronograph",
        price: "₹ 12,999",
        category: "Watches",
        image: Watch,
        isBestSeller: true,
        rating: 4.8,
        reviews: 124,
    },
    {
        id: 2,
        name: "Celeste Necklace",
        price: "₹ 8,499",
        category: "Jewelry",
        image: Necklace,
        isBestSeller: false,
        rating: 4.6,
        reviews: 89,
    },
    {
        id: 3,
        name: "Radiance Serum",
        price: "₹ 2,199",
        category: "Beauty",
        image: Beauty,
        isBestSeller: false,
        rating: 4.9,
        reviews: 203,
    },
    {
        id: 4,
        name: "Nova Dinner Set",
        price: "₹ 6,999",
        category: "Home & Living",
        image: Dinner,
        isBestSeller: false,
        rating: 4.7,
        reviews: 156,
    },
    {
        id: 5,
        name: "Zenith Watch",
        price: "₹ 15,999",
        category: "Watches",
        image: Watch,
        isBestSeller: false,
        rating: 4.5,
        reviews: 98,
    },
];

export function FeaturedProducts() {
    const [hoveredProduct, setHoveredProduct] = useState(null);
    const scrollRef = useRef(null);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = direction === "left" ? -400 : 400;
            scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }
    };

    return (
        <section
            className="w-full py-16 md:py-12 overflow-x-hidden"
            style={{ backgroundColor: "#F9F5EB" }}
        >
            <div className="container mx-auto px-4">
                {/* Section Header - Left Aligned */}
                <div className="text-left mb-8 md:mb-12">

                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px" }}>
                        <div style={{ borderWidth: '1px', width: "30px", color: "#0A2240", }}></div>
                        <span
                            style={{
                                fontFamily: "Jost sans-serif",
                                fontSize: "13px",
                                textTransform: "uppercase",
                                letterSpacing: "3px",
                                color: "#0A2240",
                                fontWeight: "500",
                            }}
                        >
                            The Collections
                        </span>
                        <div
                            style={{
                                borderWidth: "1px",
                                height: "1.5px",

                                width: "1.5px",
                                borderRadius: "50%",
                                border: "1px solid #000",
                                backgroundColor: COLORS.brand.navy,
                            }}
                        ></div>
                        <span style={{
                            fontFamily: "Jost sans-serif",
                            fontSize: "13px",
                            textTransform: "uppercase",
                            letterSpacing: "2.64px",
                            color: "#0A2240",
                            fontWeight: "500",
                        }}>Best Seller</span>
                    </div>
                    <h2
                        className="text-[#0A2240] font-light tracking-wide mb-3"
                        style={{
                            fontFamily: 'var(--font-cormorant), "Cormorant Garamond", serif',
                            letterSpacing: "-0.5472px",
                            fontSize: "clamp(32px, 5vw, 60px)",
                            lineHeight: "1.2",
                        }}
                    >
                        Curated for the
                        <span
                            style={{
                                color: "rgb(185, 138, 0)",
                                fontStyle: "italic",
                                marginLeft: "10px",
                            }}
                        >
                            discerning
                        </span>
                    </h2>
                    <div
                        className="w-20 h-0.5"
                        style={{ backgroundColor: COLORS.brand.gold }}
                    />
                </div>

                {/* Products Carousel */}
                <div className="relative">
                    {/* Navigation Buttons */}
                    <button
                        onClick={() => scroll("left")}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-300 -ml-4"
                    >
                        <ChevronLeft className="w-6 h-6 text-[#0A2240]" />
                    </button>

                    <button
                        onClick={() => scroll("right")}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-300 -mr-4"
                    >
                        <ChevronRight className="w-6 h-6 text-[#0A2240]" />
                    </button>

                    {/* Scrollable Container */}
                    <div
                        ref={scrollRef}
                        className="flex gap-4 md:gap-6 overflow-x-auto scroll-smooth hide-scrollbar pb-4"
                        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                    >
                        {products.map((product) => (
                            <div
                                key={product.id}
                                className="min-w-[280px] sm:min-w-[300px] lg:min-w-[280px] flex-shrink-0 group relative bg-white rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl"
                                onMouseEnter={() => setHoveredProduct(product.id)}
                                onMouseLeave={() => setHoveredProduct(null)}
                            >
                                {/* Product Image */}
                                <div className="relative aspect-square bg-gray-100 overflow-hidden">
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />

                                    {/* Best Seller Badge */}
                                    {product.isBestSeller && (
                                        <div className="absolute top-4 left-4 bg-[#FFC72C] text-[#0A2240] text-[10px] font-semibold uppercase tracking-[2px] px-3 py-1.5">
                                            BEST SELLER
                                        </div>
                                    )}

                                    {/* Quick Action Buttons */}
                                    <div
                                        className={`absolute inset-0 bg-black/40 flex items-center justify-center gap-3 transition-opacity duration-300 ${hoveredProduct === product.id
                                            ? "opacity-100"
                                            : "opacity-0"
                                            }`}
                                    >
                                        <button className="bg-white text-[#0A2240] p-3 rounded-full hover:bg-[#FFC72C] transition-colors duration-300">
                                            <ShoppingBag className="w-5 h-5" />
                                        </button>
                                        <button className="bg-white text-[#0A2240] p-3 rounded-full hover:bg-[#FFC72C] transition-colors duration-300">
                                            <Heart className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Product Info */}
                                <div className="p-4">
                                    <div className="flex items-start justify-between mb-1">
                                        <h3
                                            className="text-[#0A2240] text-sm font-medium tracking-wide"
                                            style={{
                                                fontFamily: 'var(--font-jost), "Jost", sans-serif',
                                            }}
                                        >
                                            {product.name}
                                        </h3>
                                        <span
                                            className="text-[#0A2240] font-semibold"
                                            style={{
                                                fontFamily: 'var(--font-jost), "Jost", sans-serif',
                                            }}
                                        >
                                            {product.price}
                                        </span>
                                    </div>

                                    <p
                                        className="text-gray-500 text-xs tracking-wider uppercase mb-2"
                                        style={{
                                            fontFamily: 'var(--font-jost), "Jost", sans-serif',
                                        }}
                                    >
                                        {product.category}
                                    </p>

                                    <div className="flex items-center gap-1">
                                        <div className="flex items-center">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-3.5 h-3.5 ${i < Math.floor(product.rating)
                                                        ? "text-[#FFC72C] fill-[#FFC72C]"
                                                        : "text-gray-300"
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-xs text-gray-500 ml-1">
                                            ({product.reviews})
                                        </span>
                                    </div>

                                    <button className="w-full mt-4 py-2.5 border border-[#0A2240] text-[#0A2240] text-xs font-medium uppercase tracking-[2px] hover:bg-[#0A2240] hover:text-white transition-all duration-300">
                                        JOIN →
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* View All Button - Left Aligned */}
                <div
                    style={{
                        alignItems: "center",
                        justifyContent: "center",
                        display: "flex",
                    }}
                    className="mt-10"
                >
                    <div className="text-left ">
                        <Link
                            href="/shop"
                            className="inline-block px-10 py-3 border-2 border-[#0A2240] text-[#0A2240] text-xs font-medium uppercase tracking-[2.64px] hover:bg-[#0A2240] hover:text-white transition-all duration-300"
                            style={{
                                fontFamily: 'var(--font-jost), "Jost", sans-serif',
                            }}
                        >
                            View All Collections
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
