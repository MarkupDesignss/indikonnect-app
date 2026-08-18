// src/components/Header.tsx

"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { HiOutlineMenuAlt3, HiOutlineX } from "react-icons/hi";
import {
  FiShoppingBag,
  FiArrowRight,
  FiUser,
  FiUsers,
  FiChevronDown,
  FiSearch,
  FiHeart,
} from "react-icons/fi";

import { getFont, FONT_WEIGHT } from "@/lib/constants/font-family";
import { COLORS } from "@/lib/constants/colors";
import { ROUTES } from "@/lib/constants/routes";

// Import logo - use @ alias for cleaner imports
import Logo from "@/public/indiekonnect-web/images/logo.png";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menus = [
    {
      name: "SHOP",
      href: ROUTES.common.shop,
      icon: FiShoppingBag,
    },
    {
      name: "COLLECTIONS",
      href: ROUTES.common.collections,
    },
    {
      name: "OPPORTUNITY",
      href: ROUTES.common.opportunity,
    },
    {
      name: "JOURNAL",
      href: ROUTES.common.journal,
    },
  ];

  const joinOptions = [
    {
      name: "Customer Login / Signup",
      description: "Shop, track orders & manage purchases",
      href: ROUTES.auth.customer.login,
      icon: FiUser,
      gradient: "from-blue-50/10 to-blue-50/5",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-700",
    },
    {
      name: "Distributor Login / Signup",
      description: "Manage network, commissions & team",
      href: ROUTES.auth.distributor.login,
      icon: FiUsers,
      gradient: "from-amber-50/10 to-amber-50/5",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-700",
    },
  ];

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#0A1628]/95 backdrop-blur-xl shadow-2xl shadow-[#F9C744]/5 border-b border-[#F9C744]/10"
          : "bg-gradient-to-b from-[#0A1628]/80 to-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-[80px] flex items-center justify-between">
          {/* Logo */}
          <Link
            href={ROUTES.common.home}
            className="flex items-center shrink-0 group"
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-[#F9C744]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Image
                src={Logo}
                alt="IndieKonnect"
                width={44}
                height={62}
                priority
                className="object-contain relative z-10"
              />
            </div>
            <span className="ml-3 text-xl font-bold tracking-wider text-white hidden sm:block">
              <span className="text-[#F9C744]">Indie</span>Konnect
            </span>
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-10">
            {menus.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="group relative uppercase transition-all duration-300 text-white/80 hover:text-[#F9C744] tracking-wider"
                style={{
                  fontFamily: getFont("jost"),
                  fontWeight: FONT_WEIGHT.medium,
                  fontSize: "12px",
                  letterSpacing: "2px",
                }}
              >
                <span className="relative z-10 flex items-center gap-1.5">
                  {item.icon && <item.icon className="w-3.5 h-3.5" />}
                  {item.name}
                </span>
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-gradient-to-r from-[#F9C744] to-[#F9C744]/40 transition-all duration-300 group-hover:w-full group-hover:shadow-[0_0_15px_#F9C744]/50" />
                <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-[#F9C744]/10" />
              </Link>
            ))}
          </nav>

          {/* Right Side - Desktop */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Join Button with Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="relative group px-6 py-2.5 rounded-full flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 text-sm font-medium overflow-hidden"
                style={{
                  fontFamily: getFont("jost"),
                }}
              >
                {/* Button background with gradient */}
                <span className="absolute inset-0 bg-gradient-to-r from-[#F9C744] to-[#F9C744]/80 rounded-full" />
                <span className="absolute inset-0 bg-gradient-to-r from-[#F9C744]/0 via-white/20 to-[#F9C744]/0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Button content */}
                <span className="relative z-10 text-[#0A1628] font-semibold flex items-center gap-2">
                  Join Now
                  <FiChevronDown
                    className={`w-4 h-4 transition-transform duration-300 ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </span>

                {/* Glow effect */}
                <span className="absolute -inset-1 bg-[#F9C744]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-[#0A1628] rounded-2xl shadow-2xl shadow-[#F9C744]/10 border border-[#F9C744]/20 overflow-hidden animate-slideDown">
                  <div className="p-2">
                    <div className="px-4 py-3 border-b border-[#F9C744]/10">
                      <p className="text-[10px] font-medium text-[#F9C744] uppercase tracking-widest">
                        Welcome Back
                      </p>
                      <p className="text-xs text-white/50 mt-0.5">
                        Choose your account type
                      </p>
                    </div>
                    {joinOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <Link
                          key={option.name}
                          href={option.href}
                          className={`flex items-start gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden`}
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          {/* Hover background */}
                          <span
                            className={`absolute inset-0 bg-gradient-to-r ${option.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                          />

                          <div
                            className={`w-10 h-10 rounded-full ${option.iconBg} flex items-center justify-center flex-shrink-0 relative z-10 group-hover:scale-110 transition-transform duration-300`}
                          >
                            <Icon className={`w-5 h-5 ${option.iconColor}`} />
                          </div>
                          <div className="flex-1 min-w-0 relative z-10">
                            <p className="text-sm font-semibold text-white group-hover:text-[#F9C744] transition-colors duration-300">
                              {option.name}
                            </p>
                            <p className="text-xs text-white/40 truncate">
                              {option.description}
                            </p>
                          </div>
                          <FiArrowRight className="w-4 h-4 text-[#F9C744]/40 group-hover:text-[#F9C744] group-hover:translate-x-1 transition-all duration-300 flex-shrink-0 mt-1 relative z-10" />
                        </Link>
                      );
                    })}
                  </div>
                  <div className="p-3 border-t border-[#F9C744]/10 bg-[#0A1628]/50">
                    <div className="px-4 py-2 text-center">
                      
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden relative p-2 rounded-lg transition-all duration-300 hover:bg-[#F9C744]/10 group"
            aria-label="Toggle menu"
          >
            <span className="absolute inset-0 bg-[#F9C744]/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            {mobileOpen ? (
              <HiOutlineX size={28} className="text-[#F9C744] relative z-10" />
            ) : (
              <HiOutlineMenuAlt3
                size={28}
                className="text-white relative z-10 group-hover:text-[#F9C744] transition-colors duration-300"
              />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#0A1628]/98 backdrop-blur-xl border-t border-[#F9C744]/10 animate-slideDown">
          <div className="px-4 py-2">
            {menus.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="group flex items-center justify-between px-4 py-4 border-b border-white/5 text-white hover:text-[#F9C744] transition-all duration-300"
                style={{
                  fontFamily: getFont("jost"),
                  fontSize: "13px",
                  letterSpacing: "2px",
                }}
                onClick={() => setMobileOpen(false)}
              >
                <span className="flex items-center gap-3">
                  {item.icon && (
                    <item.icon className="w-4 h-4 text-[#F9C744]" />
                  )}
                  {item.name}
                </span>
                <FiArrowRight className="w-4 h-4 text-white/20 group-hover:text-[#F9C744] group-hover:translate-x-1 transition-all duration-300" />
              </Link>
            ))}
          </div>

          {/* Mobile - Join Options */}
          <div className="px-4 py-4 border-b border-[#F9C744]/10">
            <p className="text-[10px] text-[#F9C744] uppercase tracking-widest px-4 mb-3">
              Account Access
            </p>
            <div className="space-y-2">
              <Link
                href={ROUTES.auth.customer.login}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 text-white group"
                onClick={() => setMobileOpen(false)}
              >
                <div className="w-9 h-9 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FiUser className="w-4 h-4 text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium group-hover:text-[#F9C744] transition-colors duration-300">
                    Customer Login
                  </p>
                  <p className="text-xs text-white/40">Shop & track orders</p>
                </div>
                <FiArrowRight className="w-4 h-4 text-[#F9C744]/40 group-hover:text-[#F9C744] group-hover:translate-x-1 transition-all duration-300" />
              </Link>
              <Link
                href={ROUTES.auth.distributor.login}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 text-white group"
                onClick={() => setMobileOpen(false)}
              >
                <div className="w-9 h-9 rounded-full bg-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FiUsers className="w-4 h-4 text-amber-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium group-hover:text-[#F9C744] transition-colors duration-300">
                    Distributor Login
                  </p>
                  <p className="text-xs text-white/40">
                    Manage network & commissions
                  </p>
                </div>
                <FiArrowRight className="w-4 h-4 text-[#F9C744]/40 group-hover:text-[#F9C744] group-hover:translate-x-1 transition-all duration-300" />
              </Link>
            </div>
          </div>

          {/* Mobile - Register */}
          <div className="px-4 py-4">
            <Link
              href="/customer/register"
              className="flex items-center justify-center px-6 py-3 rounded-full bg-gradient-to-r from-[#F9C744] to-[#F9C744]/80 text-[#0A1628] font-semibold text-sm hover:scale-105 transition-all duration-300 shadow-lg shadow-[#F9C744]/20"
              style={{
                fontFamily: getFont("jost"),
              }}
              onClick={() => setMobileOpen(false)}
            >
              Create Account
              <FiArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </header>
  );
}
