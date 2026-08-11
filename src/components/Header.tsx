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
      bgColor: "hover:bg-blue-50/10",
    },
    {
      name: "Distributor Login / Signup",
      description: "Manage network, commissions & team",
      href: ROUTES.auth.distributor.login,
      icon: FiUsers,
      bgColor: "hover:bg-amber-50/10",
    },
  ];

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-black/80 backdrop-blur-md shadow-lg" : "bg-transparent"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-[70px] flex items-center justify-between">
          {/* Logo */}
          <Link
            href={ROUTES.common.home}
            className="flex items-center shrink-0"
          >
            <Image
              src={Logo}
              alt="IndieKonnect"
              width={40}
              height={58}
              priority
              className="object-contain"
            />
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-12">
            {menus.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="uppercase transition-all duration-300 hover:text-[#FFC72C] relative group"
                style={{
                  color: "#F5F5F5",
                  fontFamily: getFont("jost"),
                  fontWeight: FONT_WEIGHT.medium,
                  letterSpacing: "1px",
                  fontSize: "13px",
                }}
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#FFC72C] transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Right Side - Desktop */}
          <div className="hidden lg:flex items-center gap-6">

            {/* Join Button with Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="h-[38px] px-5 rounded-full flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 text-sm group"
                style={{
                  background: COLORS.brand.gold,
                  color: COLORS.brand.darkBlue,
                  fontFamily: getFont("jost"),
                  fontWeight: FONT_WEIGHT.regular,
                }}
              >
                Join
                <FiChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""
                    }`}
                />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100/20 overflow-hidden animate-slideDown">
                  <div className="p-2">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Choose your account type
                      </p>
                    </div>
                    {joinOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <Link
                          key={option.name}
                          href={option.href}
                          className={`flex items-start gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${option.bgColor}`}
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <div className="w-10 h-10 rounded-full bg-[#F9C744]/10 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-5 h-5 text-[#F9C744]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900">
                              {option.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {option.description}
                            </p>
                          </div>
                          <FiArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                        </Link>
                      );
                    })}
                  </div>
                  <div className="p-2 border-t border-gray-100 bg-gray-50/50">
                    {/* <div className="px-3 py-2 text-center">
                      <p className="text-xs text-gray-500">
                        New here?{' '}
                        <Link
                          href="/customer/register"
                          className="text-[#F9C744] font-semibold hover:underline"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          Create an account
                        </Link>
                      </p>
                    </div> */}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
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

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-black/90 backdrop-blur-md border-t border-white/10">
          {menus.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="block px-8 py-4 border-b border-white/5 text-white uppercase text-sm hover:bg-white/5 transition-colors"
              style={{
                fontFamily: getFont("jost"),
              }}
              onClick={() => setMobileOpen(false)}
            >
              {item.name}
            </Link>
          ))}

          {/* Mobile - Join Options */}
          <div className="px-8 py-4 border-b border-white/5">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">
              Account Access
            </p>
            <div className="space-y-2">
              <Link
                href={ROUTES.auth.customer.login}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-white"
                onClick={() => setMobileOpen(false)}
              >
                <div className="w-8 h-8 rounded-full bg-[#F9C744]/20 flex items-center justify-center">
                  <FiUser className="w-4 h-4 text-[#F9C744]" />
                </div>
                <div>
                  <p className="text-sm font-medium">Customer Login</p>
                  <p className="text-xs text-gray-400">Shop & track orders</p>
                </div>
                <FiArrowRight className="w-4 h-4 text-gray-400 ml-auto" />
              </Link>
              <Link
                href={ROUTES.auth.distributor.login}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-white"
                onClick={() => setMobileOpen(false)}
              >
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <FiUsers className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">Distributor Login</p>
                  <p className="text-xs text-gray-400">
                    Manage network & commissions
                  </p>
                </div>
                <FiArrowRight className="w-4 h-4 text-gray-400 ml-auto" />
              </Link>
            </div>
          </div>

          {/* Mobile - Register */}
          <Link
            href="/customer/register"
            className="block px-8 py-4 text-[#F9C744] text-sm font-semibold hover:bg-white/5 transition-colors"
            style={{
              fontFamily: getFont("jost"),
            }}
            onClick={() => setMobileOpen(false)}
          >
            Create Account →
          </Link>
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
          animation: slideDown 0.2s ease-out forwards;
        }
      `}</style>
    </header>
  );
}
