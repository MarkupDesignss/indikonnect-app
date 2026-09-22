"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import {
  HiOutlineMenuAlt3,
  HiOutlineX,
} from "react-icons/hi";

import {
  FiArrowRight,
  FiUser,
  FiUsers,
  FiChevronDown,
} from "react-icons/fi";

import {
  getFont,
  FONT_WEIGHT,
} from "@/lib/constants/font-family";

import { ROUTES } from "@/lib/constants/routes";

import Logo from "@/public/indiekonnect-web/images/logo.png";

/* =========================================================
   PRODUCTION APP PATHS
========================================================= */

const CUSTOMER_APP_PATH =
  "/indiekonnect-web";

const DISTRIBUTOR_APP_PATH =
  "/indiekonnect-distributor";

/* =========================================================
   HEADER
========================================================= */

export default function Header() {
  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [scrolled, setScrolled] =
    useState(false);

  const [
    isDropdownOpen,
    setIsDropdownOpen,
  ] = useState(false);

  const dropdownRef =
    useRef<HTMLDivElement>(null);

  /* ==================================================
     SCROLL
  ================================================== */

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(
        window.scrollY > 50,
      );
    };

    window.addEventListener(
      "scroll",
      handleScroll,
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll,
      );
    };
  }, []);

  /* ==================================================
     CLOSE DROPDOWN ON OUTSIDE CLICK
  ================================================== */

  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent,
    ) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target as Node,
        )
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
    };
  }, []);

  /* ==================================================
     NAVIGATION MENUS
  ================================================== */

  const menus = [
    {
      name: "SHOP",
      href: ROUTES.common.shop,
    },
    {
      name: "COLLECTIONS",
      href: ROUTES.common.collections,
    },
    /*
    {
      name: "OPPORTUNITY",
      href: ROUTES.common.opportunity,
    },
    {
      name: "JOURNAL",
      href: ROUTES.common.journal,
    },
    */
  ];

  /* ==================================================
     LOGIN OPTIONS
  ================================================== */

  const joinOptions = [
    {
      name: "Customer Login / Signup",
      description:
        "Shop, track orders & manage purchases",
      icon: FiUser,
      gradient:
        "from-blue-50/10 to-blue-50/5",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-700",
      type: "customer" as const,
    },
    {
      name: "Distributor Login / Signup",
      description:
        "Manage network, commissions & team",
      icon: FiUsers,
      gradient:
        "from-amber-50/10 to-amber-50/5",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-700",
      type: "distributor" as const,
    },
  ];

  /* ==================================================
     SAFE EXTERNAL URL BUILDER
  ================================================== */

  const buildExternalUrl = (
    basePath: string,
    path: string,
  ): string => {
    if (
      typeof window ===
      "undefined"
    ) {
      return "";
    }

    const cleanBasePath =
      basePath.replace(
        /\/+$/,
        "",
      );

    let cleanPath =
      path || "/";

    /*
     * IMPORTANT:
     *
     * Agar ROUTES mein accidentally:
     *
     * /indiekonnect-web/auth/...
     *
     * ya
     *
     * /indiekonnect-distributor/auth/...
     *
     * aa gaya ho to basePath duplicate na ho.
     */
    cleanPath = cleanPath.replace(
      /^\/indiekonnect-web(?=\/|$)/,
      "",
    );

    cleanPath = cleanPath.replace(
      /^\/indiekonnect-distributor(?=\/|$)/,
      "",
    );

    if (
      !cleanPath.startsWith(
        "/",
      )
    ) {
      cleanPath = `/${cleanPath}`;
    }

    return `${window.location.origin}${cleanBasePath}${cleanPath}`;
  };

  /* ==================================================
     CUSTOMER LOGIN
  ================================================== */

  const goToCustomerLogin = () => {
    const targetUrl =
      buildExternalUrl(
        CUSTOMER_APP_PATH,
        ROUTES.auth.customer.login,
      );

    if (targetUrl) {
      window.location.href =
        targetUrl;
    }
  };

  /* ==================================================
     DISTRIBUTOR LOGIN
  ================================================== */

  const goToDistributorLogin = () => {
    const targetUrl =
      buildExternalUrl(
        DISTRIBUTOR_APP_PATH,
        ROUTES.auth.distributor.login,
      );

    if (targetUrl) {
      window.location.href =
        targetUrl;
    }
  };

  /* ==================================================
     HANDLE JOIN OPTION
  ================================================== */

  const handleJoinOption = (
    type:
      | "customer"
      | "distributor",
  ) => {
    setIsDropdownOpen(false);

    setMobileOpen(false);

    if (
      type ===
      "customer"
    ) {
      goToCustomerLogin();

      return;
    }

    goToDistributorLogin();
  };

  /* ==================================================
     CLOSE MOBILE MENU
  ================================================== */

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  /* ==================================================
     RENDER
  ================================================== */

  return (
    <header
      className={`fixed left-0 top-0 z-50 w-full transition-all duration-500 ${scrolled
          ? "border-b border-[#F9C744]/10 bg-[#0A1628]/95 shadow-2xl shadow-[#F9C744]/5 backdrop-blur-xl"
          : "bg-gradient-to-b from-[#0A1628]/80 to-transparent"
        }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-[80px] items-center justify-between">
          {/* =====================================================
              LOGO
          ====================================================== */}

          <Link
            href={ROUTES.common.home}
            className="group flex shrink-0 items-center"
          >
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-[#F9C744]/20 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />

              <Image
                src={Logo}
                alt="IndieKonnect"
                width={44}
                height={62}
                priority
                className="relative z-10 object-contain"
              />
            </div>

            <span className="ml-3 hidden text-xl font-bold tracking-wider text-white sm:block">
              <span className="text-[#F9C744]">
                Indie
              </span>
              Konnect
            </span>
          </Link>

          {/* =====================================================
              DESKTOP MENU
          ====================================================== */}

          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-10 lg:flex">
            {menus.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="group relative uppercase tracking-wider text-white/80 transition-all duration-300 hover:text-[#F9C744]"
                style={{
                  fontFamily:
                    getFont("jost"),
                  fontWeight:
                    FONT_WEIGHT.medium,
                  fontSize: "12px",
                  letterSpacing: "2px",
                }}
              >
                <span className="relative z-10 flex items-center gap-1.5">
                  {item.name}
                </span>

                <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-gradient-to-r from-[#F9C744] to-[#F9C744]/40 transition-all duration-300 group-hover:w-full group-hover:shadow-[0_0_15px_#F9C744]/50" />

                <span className="absolute -bottom-1 left-0 h-[2px] w-full bg-[#F9C744]/10" />
              </Link>
            ))}
          </nav>

          {/* =====================================================
              RIGHT SIDE - DESKTOP
          ====================================================== */}

          <div className="hidden items-center gap-4 lg:flex">
            <div
              className="relative"
              ref={dropdownRef}
            >
              {/* =================================================
                  JOIN NOW
              ================================================== */}

              <button
                type="button"
                onClick={() =>
                  setIsDropdownOpen(
                    (prev) => !prev,
                  )
                }
                className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-300 hover:scale-105"
                style={{
                  fontFamily:
                    getFont("jost"),
                }}
              >
                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-[#F9C744] to-[#F9C744]/80" />

                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-[#F9C744]/0 via-white/20 to-[#F9C744]/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                <span className="relative z-10 flex items-center gap-2 font-semibold text-[#0A1628]">
                  Join Now

                  <FiChevronDown
                    className={`h-4 w-4 transition-transform duration-300 ${isDropdownOpen
                        ? "rotate-180"
                        : ""
                      }`}
                  />
                </span>

                <span className="absolute -inset-1 rounded-full bg-[#F9C744]/20 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
              </button>

              {/* =================================================
                  DROPDOWN
              ================================================== */}

              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-80 overflow-hidden rounded-2xl border border-[#F9C744]/20 bg-[#0A1628] shadow-2xl shadow-[#F9C744]/10 animate-slideDown">
                  <div className="p-2">
                    <div className="border-b border-[#F9C744]/10 px-4 py-3">
                      <p className="text-[10px] font-medium uppercase tracking-widest text-[#F9C744]">
                        Welcome Back
                      </p>

                      <p className="mt-0.5 text-xs text-white/50">
                        Choose your account type
                      </p>
                    </div>

                    {joinOptions.map(
                      (option) => {
                        const Icon =
                          option.icon;

                        return (
                          <button
                            key={
                              option.name
                            }
                            type="button"
                            onClick={() =>
                              handleJoinOption(
                                option.type,
                              )
                            }
                            className="group relative flex w-full items-start gap-3 overflow-hidden rounded-xl px-4 py-3 text-left transition-all duration-300"
                          >
                            <span
                              className={`absolute inset-0 bg-gradient-to-r ${option.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                            />

                            <div
                              className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${option.iconBg} transition-transform duration-300 group-hover:scale-110`}
                            >
                              <Icon
                                className={`h-5 w-5 ${option.iconColor}`}
                              />
                            </div>

                            <div className="relative z-10 min-w-0 flex-1">
                              <p className="text-sm font-semibold text-white transition-colors duration-300 group-hover:text-[#F9C744]">
                                {
                                  option.name
                                }
                              </p>

                              <p className="truncate text-xs text-white/40">
                                {
                                  option.description
                                }
                              </p>
                            </div>

                            <FiArrowRight className="relative z-10 mt-1 h-4 w-4 shrink-0 text-[#F9C744]/40 transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#F9C744]" />
                          </button>
                        );
                      },
                    )}
                  </div>

                  <div className="border-t border-[#F9C744]/10 bg-[#0A1628]/50 p-3">
                    <div className="px-4 py-2 text-center" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* =====================================================
              MOBILE MENU BUTTON
          ====================================================== */}

          <button
            type="button"
            onClick={() =>
              setMobileOpen(
                (prev) => !prev,
              )
            }
            className="group relative rounded-lg p-2 transition-all duration-300 hover:bg-[#F9C744]/10 lg:hidden"
            aria-label="Toggle menu"
            aria-expanded={
              mobileOpen
            }
          >
            <span className="absolute inset-0 rounded-lg bg-[#F9C744]/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            {mobileOpen ? (
              <HiOutlineX
                size={28}
                className="relative z-10 text-[#F9C744]"
              />
            ) : (
              <HiOutlineMenuAlt3
                size={28}
                className="relative z-10 text-white transition-colors duration-300 group-hover:text-[#F9C744]"
              />
            )}
          </button>
        </div>
      </div>

      {/* =========================================================
          MOBILE MENU
      ========================================================= */}

      {mobileOpen && (
        <div className="border-t border-[#F9C744]/10 bg-[#0A1628]/98 backdrop-blur-xl animate-slideDown lg:hidden">
          {/* MAIN MENU */}

          <div className="px-4 py-2">
            {menus.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="group flex items-center justify-between border-b border-white/5 px-4 py-4 text-white transition-all duration-300 hover:text-[#F9C744]"
                style={{
                  fontFamily:
                    getFont("jost"),
                  fontSize: "13px",
                  letterSpacing: "2px",
                }}
                onClick={
                  closeMobileMenu
                }
              >
                <span className="flex items-center gap-3">
                  {item.name}
                </span>

                <FiArrowRight className="h-4 w-4 text-white/20 transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#F9C744]" />
              </Link>
            ))}
          </div>

          {/* ACCOUNT ACCESS */}

          <div className="border-b border-[#F9C744]/10 px-4 py-4">
            <p className="mb-3 px-4 text-[10px] uppercase tracking-widest text-[#F9C744]">
              Account Access
            </p>

            <div className="space-y-2">
              {/* CUSTOMER LOGIN */}

              <button
                type="button"
                onClick={() =>
                  handleJoinOption(
                    "customer",
                  )
                }
                className="group flex w-full items-center gap-3 rounded-xl bg-white/5 px-4 py-3 text-left text-white transition-all duration-300 hover:bg-white/10"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/20 transition-transform duration-300 group-hover:scale-110">
                  <FiUser className="h-4 w-4 text-blue-400" />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-medium transition-colors duration-300 group-hover:text-[#F9C744]">
                    Customer Login
                  </p>

                  <p className="text-xs text-white/40">
                    Shop & track orders
                  </p>
                </div>

                <FiArrowRight className="h-4 w-4 text-[#F9C744]/40 transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#F9C744]" />
              </button>

              {/* DISTRIBUTOR LOGIN */}

              <button
                type="button"
                onClick={() =>
                  handleJoinOption(
                    "distributor",
                  )
                }
                className="group flex w-full items-center gap-3 rounded-xl bg-white/5 px-4 py-3 text-left text-white transition-all duration-300 hover:bg-white/10"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/20 transition-transform duration-300 group-hover:scale-110">
                  <FiUsers className="h-4 w-4 text-amber-400" />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-medium transition-colors duration-300 group-hover:text-[#F9C744]">
                    Distributor Login
                  </p>

                  <p className="text-xs text-white/40">
                    Manage network & commissions
                  </p>
                </div>

                <FiArrowRight className="h-4 w-4 text-[#F9C744]/40 transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#F9C744]" />
              </button>
            </div>
          </div>

          {/*
          =====================================================
          MOBILE REGISTER - KEPT COMMENTED
          =====================================================

          <div className="px-4 py-4">
            <Link
              href="/customer/register"
              className="flex items-center justify-center rounded-full bg-gradient-to-r from-[#F9C744] to-[#F9C744]/80 px-6 py-3 text-sm font-semibold text-[#0A1628] shadow-lg shadow-[#F9C744]/20 transition-all duration-300 hover:scale-105"
              style={{
                fontFamily: getFont("jost"),
              }}
              onClick={closeMobileMenu}
            >
              Create Account

              <FiArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
          */}
        </div>
      )}

      {/* =========================================================
          ANIMATION
      ========================================================= */}

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
          animation:
            slideDown 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)
            forwards;
        }
      `}</style>
    </header>
  );
}