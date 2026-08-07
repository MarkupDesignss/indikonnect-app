"use client";

import Link from "next/link";
import Image from "next/image";
import Logo from "../../public/images/logo.png";
import { HiOutlineMenuAlt3, HiOutlineX } from "react-icons/hi";
import { FiShoppingBag } from "react-icons/fi";
import { FiArrowRight } from "react-icons/fi";

import { useState, useEffect } from "react";

import {
  getFont,
  FONT_WEIGHT,
} from "../lib/constants/font-family";

import { COLORS } from "../lib/constants/colors";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const menus = [
    {
      name: "SHOP",
      href: "/shop",
    },
    {
      name: "COLLECTIONS",
      href: "/collections",
    },
    {
      name: "OPPORTUNITY",
      href: "/opportunity",
    },
    {
      name: "JOURNAL",
      href: "/products",
    },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-black/70 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-10">
        <div className="h-[70px] flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src={Logo}
              alt="Logo"
              width={40}
              height={58}
              priority
            />
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-12">
            {menus.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="uppercase transition-all duration-300 hover:text-[#FFC72C]"
                style={{
                  color: "#F5F5F5",
                  fontFamily: getFont("jost"),
                  fontWeight: FONT_WEIGHT.medium,
                  letterSpacing: "1px",
                  fontSize: "13px",
                }}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right */}
          <div className="hidden lg:flex items-center gap-6">
            <Link
              href="/cart"
              className="flex items-center gap-2 text-white"
            >
              <FiShoppingBag size={16} />
              <span
                style={{
                  fontFamily: getFont("jost"),
                  fontSize: "13px",
                }}
              >
                (0)
              </span>
            </Link>

            <Link
              href="/join"
              className="h-[38px] px-5 rounded-full flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 text-sm"
              style={{
                background: COLORS.brand.gold,
                color: COLORS.brand.darkBlue,
                fontFamily: getFont("jost"),
                fontWeight: FONT_WEIGHT.regular,
              }}
            >
              Join
              <span className="text-xs">
                <FiArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>

          {/* Mobile */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden text-white"
          >
            {mobileOpen ? (
              <HiOutlineX size={28} />
            ) : (
              <HiOutlineMenuAlt3 size={28} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-black/70 backdrop-blur-md">
          {menus.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="block px-8 py-4 border-b border-white/10 text-white uppercase text-sm"
              style={{
                fontFamily: getFont("jost"),
              }}
            >
              {item.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}