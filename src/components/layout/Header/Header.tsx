"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ShoppingCart } from "lucide-react";
import { COLORS } from '../../../lib/constants/colors'
import Logo from "../../../../public/logo.png"
import Image from 'next/image';

export function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [cartCount] = useState(0);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Navigation items
    const navItems = [
        { name: "Shop", href: "/shop" },
        { name: "Collections", href: "/collections" },
        { name: "Opportunity", href: "/opportunity" },
        { name: "Journal", href: "/journal" },
    ];

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200"
                : "bg-transparent"
                }`}
        >
            {/* Top Bar - Full Width */}
            <div
                className="w-full flex items-center justify-center"
                style={{
                    backgroundColor: COLORS.brand.navy,
                    height: '39.0938px',
                    padding: '10px 0',
                }}
            >
                <h1
                    style={{
                        color: "white",
                        fontSize: "11.5px",
                        fontFamily: "Jost, sans-serif",
                        fontWeight: "300",
                        letterSpacing: "0.15em",
                        lineHeight: "19.55px",
                    }}
                >
                    <span style={{ marginRight: "10px" }}>A</span>
                    MODERN INDIAN MOVEMENT . NOW ONBOARDING
                    <span style={{ marginLeft: "10px", color: COLORS.brand.gold }}>FOUNDING DISTRIBUTORS</span>
                </h1>
            </div>

            {/* Main Header - with container */}
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center group">
                        <Image
                            src={Logo}
                            alt="Logo"
                            width={40}
                            height={40}
                            priority
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center space-x-8">
                        {navItems.map((item) => (
                            <Link
                                style={{
                                    fontFamily: "Jost, system-ui, sans-serif",
                                    fontWeight: "400",
                                    fontSize: "14px",
                                    letterSpacing: "2.64px",
                                    lineHeight: "20.4px"
                                }}
                                key={item.name}
                                href={item.href}
                                className={`relative text-sm font-medium transition-colors duration-200 group ${isScrolled
                                    ? "text-gray-600 hover:text-[#0A2240]"
                                    : "text-white/80 hover:text-white"
                                    }`}
                            >
                                {item.name}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#FFC72C] group-hover:w-full transition-all duration-300" />
                            </Link>
                        ))}
                    </nav>

                    {/* Right Actions */}
                    <div className="flex items-center gap-4">
                        {/* Cart */}
                        <Link
                            href="/cart"
                            className={`relative p-2 transition-colors ${isScrolled
                                ? "text-gray-600 hover:text-[#0A2240]"
                                : "text-white/80 hover:text-white"
                                }`}
                        >
                            <ShoppingCart className="h-5 w-5" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 h-5 w-5 bg-[#FFC72C] text-[#0A2240] text-xs font-bold rounded-full flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {/* Sign In */}
                        <Link
                            href="/login"
                            className={`hidden sm:inline-block px-4 py-2 text-sm font-medium transition-colors ${isScrolled
                                ? "text-[#0A2240] hover:text-[#FFC72C]"
                                : "text-white/80 hover:text-white"
                                }`}
                        >
                            Sign In
                        </Link>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-2 rounded-lg transition-colors hover:bg-white/10"
                        >
                            {isMobileMenuOpen ? (
                                <X
                                    className={`h-6 w-6 ${isScrolled ? "text-[#0A2240]" : "text-white"}`}
                                />
                            ) : (
                                <Menu
                                    className={`h-6 w-6 ${isScrolled ? "text-[#0A2240]" : "text-white"}`}
                                />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden py-4 border-t border-white/10">
                        <nav className="flex flex-col space-y-3">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isScrolled
                                        ? "text-gray-600 hover:bg-gray-50"
                                        : "text-white/80 hover:bg-white/10"
                                        }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                            <Link
                                href="/login"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="px-4 py-2 bg-[#FFC72C] text-[#0A2240] rounded-lg text-sm font-medium hover:bg-[#ffd44d] transition-colors text-center"
                            >
                                Sign In
                            </Link>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}