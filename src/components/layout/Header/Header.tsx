"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

import {
    HiOutlineMenuAlt3,
    HiOutlineX,
    HiOutlineSearch,
} from "react-icons/hi";

import {
    FiHeart,
    FiShoppingBag,
    FiUser,
} from "react-icons/fi";

import Logo from "../../../../public/logo.png";
import {
    getFont,
    FONT_WEIGHT,
} from "../../../lib/constants/font-family";

export default function Header() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener("scroll", handleScroll);

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const menus = [
        {
            name: "HOME",
            href: "/",
        },
        {
            name: "CATEGORIES",
            href: "/categories",
        },
        {
            name: "OUR STORY",
            href: "/our-story",
        },
        {
            name: "ABOUT",
            href: "/about",
        },
    ];

    return (
        <header className="sticky top-0 left-0 z-50 w-full">
            {/* ================= TOP BAR ================= */}
            <div
                style={{
                    background: "#003DA5",
                    fontFamily: getFont("liberationSans", 400),
                    fontWeight: FONT_WEIGHT.regular,
                }}
                className="h-9"
            >
                <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-end">
                    <div className="flex items-center gap-8">
                        <Link
                            href="/support"
                            className="text-[12px] text-white hover:opacity-80 transition"
                        >
                            SUPPORT
                        </Link>

                        <Link
                            href="/become-a-distributor"
                            className="text-[12px] underline text-white hover:text-yellow-300 transition"
                        >
                            Become a Distributor
                        </Link>
                    </div>
                </div>
            </div>

            {/* ================= MAIN HEADER ================= */}
            <div
                className={`transition-all duration-500 ${isScrolled
                        ? "bg-white/70 backdrop-blur-xl border-b border-white/30 shadow-lg"
                        : "bg-white border-b border-neutral-200"
                    }`}
            >
                <div className="max-w-7xl mx-auto px-6">
                    <div className="h-[64px] flex items-center justify-between">
                        {/* Logo - Increased height */}
                        <Link href="/">
                            <Image
                                src={Logo}
                                alt="logo"
                                priority
                                width={60}
                                height={80}
                                className="object-contain"
                            />
                        </Link>

                        {/* Desktop Menu - Added ml-12 for more spacing */}
                        <nav className="hidden lg:flex items-center ml-12 gap-8">
                            {menus.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    style={{
                                        fontFamily: getFont("arimo", 400),
                                        fontWeight: FONT_WEIGHT.regular,
                                    }}
                                    className="uppercase text-[14px] tracking-wide text-neutral-700 hover:text-[#003DA5] transition"
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </nav>

                        {/* Right Icons */}
                        <div className="hidden lg:flex items-center gap-5">
                            {/* Search */}
                            <Link
                                href="/search"
                                className="flex items-center gap-1 text-neutral-700 hover:text-[#003DA5] transition"
                            >
                                <HiOutlineSearch size={19} />
                                <span
                                    style={{
                                        fontFamily: getFont("arimo", 400),
                                        fontWeight: FONT_WEIGHT.regular,
                                    }}
                                    className="text-[13px]"
                                >
                                    Search
                                </span>
                            </Link>

                            {/* Wishlist */}
                            <Link
                                href="/wishlist"
                                className="flex items-center gap-1 text-neutral-700 hover:text-[#003DA5]"
                            >
                                <FiHeart size={18} />
                                <span
                                    style={{
                                        fontFamily: getFont("arimo", 400),
                                    }}
                                    className="text-[13px]"
                                >
                                    Wishlist
                                </span>
                            </Link>

                            {/* Cart */}
                            <Link
                                href="/cart"
                                className="flex items-center gap-1 text-neutral-700 hover:text-[#003DA5]"
                            >
                                <FiShoppingBag size={18} />
                                <span
                                    style={{
                                        fontFamily: getFont("arimo", 400),
                                    }}
                                    className="text-[13px]"
                                >
                                    Cart
                                </span>
                            </Link>

                            {/* Account */}
                            <Link
                                href="/account"
                                className="flex items-center gap-1 text-neutral-700 hover:text-[#003DA5]"
                            >
                                <FiUser size={18} />
                                <span
                                    style={{
                                        fontFamily: getFont("arimo", 400),
                                    }}
                                    className="text-[13px]"
                                >
                                    Account
                                </span>
                            </Link>
                        </div>

                        {/* Mobile Button */}
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="lg:hidden"
                            aria-label="Toggle menu"
                        >
                            {mobileOpen ? (
                                <HiOutlineX size={28} />
                            ) : (
                                <HiOutlineMenuAlt3 size={28} />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* ================= MOBILE MENU ================= */}
            {mobileOpen && (
                <div className="lg:hidden border-t border-neutral-200 bg-white shadow-md">
                    <nav className="flex flex-col py-3">
                        {menus.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                style={{
                                    fontFamily: getFont("arimo", 400),
                                    fontWeight: FONT_WEIGHT.regular,
                                }}
                                className="px-6 py-3 text-[14px] uppercase tracking-wide text-neutral-700 hover:bg-neutral-100 hover:text-[#003DA5] transition-all duration-300"
                            >
                                {item.name}
                            </Link>
                        ))}

                        <div className="border-t border-neutral-200 mt-3 pt-3">
                            <Link
                                href="/search"
                                onClick={() => setMobileOpen(false)}
                                className="flex items-center gap-3 px-6 py-3 text-neutral-700 hover:bg-neutral-100"
                            >
                                <HiOutlineSearch size={20} />
                                <span
                                    style={{
                                        fontFamily: getFont("arimo", 400),
                                    }}
                                >
                                    Search
                                </span>
                            </Link>

                            <Link
                                href="/wishlist"
                                onClick={() => setMobileOpen(false)}
                                className="flex items-center gap-3 px-6 py-3 text-neutral-700 hover:bg-neutral-100"
                            >
                                <FiHeart size={19} />
                                <span
                                    style={{
                                        fontFamily: getFont("arimo", 400),
                                    }}
                                >
                                    Wishlist
                                </span>
                            </Link>

                            <Link
                                href="/cart"
                                onClick={() => setMobileOpen(false)}
                                className="flex items-center gap-3 px-6 py-3 text-neutral-700 hover:bg-neutral-100"
                            >
                                <FiShoppingBag size={19} />
                                <span
                                    style={{
                                        fontFamily: getFont("arimo", 400),
                                    }}
                                >
                                    Cart
                                </span>
                            </Link>

                            <Link
                                href="/account"
                                onClick={() => setMobileOpen(false)}
                                className="flex items-center gap-3 px-6 py-3 text-neutral-700 hover:bg-neutral-100"
                            >
                                <FiUser size={19} />
                                <span
                                    style={{
                                        fontFamily: getFont("arimo", 400),
                                    }}
                                >
                                    Account
                                </span>
                            </Link>
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}