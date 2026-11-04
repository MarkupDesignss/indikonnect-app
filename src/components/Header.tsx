"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { HiOutlineMenuAlt3, HiOutlineX } from "react-icons/hi";
import { FiArrowRight, FiUser, FiUsers, FiChevronDown } from "react-icons/fi";

import { getFont, FONT_WEIGHT } from "@/lib/constants/font-family";
import { ROUTES } from "@/lib/constants/routes";
import Logo from "@/public/indiekonnect-web/images/logo.png";

const CUSTOMER_APP_PATH = "/indiekonnect-web";
const DISTRIBUTOR_APP_PATH = "/indiekonnect-distributor";

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  /* MOUNT (portal ke liye) */
  useEffect(() => {
    setMounted(true);
  }, []);

  /* SCROLL */
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* LOCK BODY SCROLL */
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (mobileOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [mobileOpen]);

  /* CLOSE MOBILE MENU WHEN SCREEN BECOMES DESKTOP */
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* CLOSE DROPDOWN ON OUTSIDE CLICK */
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
    { name: "SHOP", href: ROUTES.common.shop },
    { name: "COLLECTIONS", href: ROUTES.common.shop },
    { name: "SUPPORT", href: "/contact/" },
    { name: "FAQ", href: "/footer-policy/FAQs/" },
  ];

  const joinOptions = [
    {
      name: "Customer Login / Signup",
      description: "Shop, track orders & manage purchases",
      icon: FiUser,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-700",
      type: "customer" as const,
    },
    {
      name: "Distributor Login / Signup",
      description: "Manage network, commissions & team",
      icon: FiUsers,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-700",
      type: "distributor" as const,
    },
  ];

  const buildExternalUrl = (basePath: string, path: string): string => {
    if (typeof window === "undefined") return "";
    const cleanBasePath = basePath.replace(/\/+$/, "");
    let cleanPath = path || "/";
    cleanPath = cleanPath.replace(/^\/indiekonnect-web(?=\/|$)/, "");
    cleanPath = cleanPath.replace(/^\/indiekonnect-distributor(?=\/|$)/, "");
    if (!cleanPath.startsWith("/")) cleanPath = `/${cleanPath}`;
    return `${window.location.origin}${cleanBasePath}${cleanPath}`;
  };

  const goToCustomerLogin = () => {
    const targetUrl = buildExternalUrl(CUSTOMER_APP_PATH, ROUTES.auth.customer.login);
    if (targetUrl) window.location.href = targetUrl;
  };

  const goToDistributorLogin = () => {
    const targetUrl = buildExternalUrl(DISTRIBUTOR_APP_PATH, ROUTES.auth.distributor.login);
    if (targetUrl) window.location.href = targetUrl;
  };

  const handleJoinOption = (type: "customer" | "distributor") => {
    setIsDropdownOpen(false);
    setMobileOpen(false);
    if (type === "customer") goToCustomerLogin();
    else goToDistributorLogin();
  };

  const closeMobileMenu = () => setMobileOpen(false);

  const headerEl = (
    <header
      className={`fixed inset-x-0 top-0 z-[9999] transition-all duration-500 ${
        scrolled || mobileOpen
          ? "border-b border-[#F9C744]/10 bg-[#0A1628]/95 shadow-2xl shadow-[#F9C744]/5 backdrop-blur-xl"
          : "bg-gradient-to-b from-[#0A1628]/80 to-transparent"
      }`}
      style={{ maxWidth: "100%" }}
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-[70px] items-center justify-between gap-3 sm:h-[80px]">
          {/* LOGO */}
          <Link
            href={ROUTES.common.home}
            className="group relative z-50 flex shrink-0 items-center"
            aria-label="IndieKonnect Home"
          >
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-[#F9C744]/20 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
              <Image
                src={Logo}
                alt="IndieKonnect"
                width={44}
                height={62}
                priority
                className="relative z-10 h-[36px] w-auto object-contain sm:h-[44px]"
              />
            </div>
          </Link>

          {/* DESKTOP MENU */}
          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 lg:flex xl:gap-10">
            {menus.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="group relative whitespace-nowrap uppercase tracking-wider text-white/80 transition-all duration-300 hover:text-[#F9C744]"
                style={{
                  fontFamily: getFont("jost"),
                  fontWeight: FONT_WEIGHT.medium,
                  fontSize: "12px",
                  letterSpacing: "2px",
                }}
              >
                <span className="relative z-10 flex items-center gap-1.5">{item.name}</span>
                <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-gradient-to-r from-[#F9C744] to-[#F9C744]/40 transition-all duration-300 group-hover:w-full group-hover:shadow-[0_0_15px_#F9C744]/50" />
                <span className="absolute -bottom-1 left-0 h-[2px] w-full bg-[#F9C744]/10" />
              </Link>
            ))}
          </nav>

          {/* RIGHT SIDE - DESKTOP */}
          <div className="hidden shrink-0 items-center gap-4 lg:flex">
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 hover:scale-105 xl:px-6"
                style={{ fontFamily: getFont("jost") }}
              >
                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-[#F9C744] to-[#F9C744]/80" />
                <span className="relative z-10 flex items-center gap-2 font-semibold text-[#0A1628]">
                  Join Now
                  <FiChevronDown
                    className={`h-4 w-4 transition-transform duration-300 ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </span>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-[20rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-[#F9C744]/20 bg-[#0A1628] shadow-2xl shadow-[#F9C744]/10">
                  <div className="p-2">
                    <div className="border-b border-[#F9C744]/10 px-4 py-3">
                      <p className="text-[10px] font-medium uppercase tracking-widest text-[#F9C744]">
                        Welcome Back
                      </p>
                      <p className="mt-0.5 text-xs text-white/50">Choose your account type</p>
                    </div>
                    {joinOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.name}
                          type="button"
                          onClick={() => handleJoinOption(option.type)}
                          className="group relative flex w-full items-start gap-3 overflow-hidden rounded-xl px-4 py-3 text-left transition-all duration-300"
                        >
                          <div
                            className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${option.iconBg} transition-transform duration-300 group-hover:scale-110`}
                          >
                            <Icon className={`h-5 w-5 ${option.iconColor}`} />
                          </div>
                          <div className="relative z-10 min-w-0 flex-1">
                            <p className="text-sm font-semibold text-white transition-colors duration-300 group-hover:text-[#F9C744]">
                              {option.name}
                            </p>
                            <p className="truncate text-xs text-white/40">{option.description}</p>
                          </div>
                          <FiArrowRight className="relative z-10 mt-1 h-4 w-4 shrink-0 text-[#F9C744]/40 transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#F9C744]" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* MOBILE / TABLET MENU BUTTON */}
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="relative z-50 ml-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-all duration-300 hover:bg-[#F9C744]/10 lg:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
          >
            {mobileOpen ? (
              <HiOutlineX size={28} className="text-[#F9C744]" />
            ) : (
              <HiOutlineMenuAlt3 size={28} className="text-white" />
            )}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div
          id="mobile-menu"
          className="absolute inset-x-0 top-[70px] flex flex-col border-t border-[#F9C744]/10 bg-[#0A1628] shadow-2xl sm:top-[80px] lg:hidden"
          style={{
            maxHeight: "calc(100dvh - 70px)",
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <div className="px-4 py-2">
            {menus.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="group flex items-center justify-between border-b border-white/5 px-2 py-5 text-white transition-all duration-300 hover:text-[#F9C744]"
                style={{ fontFamily: getFont("jost"), fontSize: "14px", letterSpacing: "2px" }}
                onClick={closeMobileMenu}
              >
                <span>{item.name}</span>
                <FiArrowRight className="h-4 w-4 text-white/20 transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#F9C744]" />
              </Link>
            ))}
          </div>

          <div className="border-b border-[#F9C744]/10 px-4 py-6">
            <p className="mb-4 px-2 text-[10px] uppercase tracking-widest text-[#F9C744]">
              Account Access
            </p>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleJoinOption("customer")}
                className="group flex w-full items-center gap-4 rounded-xl bg-white/5 p-3 text-left text-white transition-all duration-300 hover:bg-white/10"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/20">
                  <FiUser className="h-5 w-5 text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Customer Login</p>
                  <p className="text-xs text-white/40">Shop & track orders</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleJoinOption("distributor")}
                className="group flex w-full items-center gap-4 rounded-xl bg-white/5 p-3 text-left text-white transition-all duration-300 hover:bg-white/10"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/20">
                  <FiUsers className="h-5 w-5 text-amber-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Distributor Login</p>
                  <p className="text-xs text-white/40">Manage network & commissions</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );

  /* Portal: header kisi transformed/smooth-scroll wrapper ke andar fasega nahi */
  if (!mounted) return null;
  return createPortal(headerEl, document.body);
}