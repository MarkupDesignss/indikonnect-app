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

import {
  getAppType,
  getCustomerDomain,
  getDistributorDomain,
} from "@/lib/appConfig";

import Logo from "@/public/indiekonnect-web/images/logo.png";

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

  // ==================================================
  // SCROLL
  // ==================================================

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

  // ==================================================
  // CLOSE DROPDOWN ON OUTSIDE CLICK
  // ==================================================

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

  // ==================================================
  // NAVIGATION MENUS
  // ==================================================

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

  // ==================================================
  // LOGIN OPTIONS
  // ==================================================

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

  // ==================================================
  // BUILD APP URL
  // ==================================================
  //
  // Option B:
  //
  // Customer:
  // https://www.markupdesigns.net/indiekonnect-web
  //
  // Distributor:
  // https://www.markupdesigns.net/indiekonnect-distributor
  //
  // ==================================================

  const buildExternalUrl = (
    baseUrl: string,
    path: string,
  ): string => {
    const cleanBaseUrl =
      baseUrl.replace(/\/+$/, "");

    const cleanPath = path.startsWith(
      "/",
    )
      ? path
      : `/${path}`;

    return `${cleanBaseUrl}${cleanPath}`;
  };

  // ==================================================
  // CUSTOMER LOGIN
  // ==================================================

  const goToCustomerLogin = () => {
    const customerDomain =
      getCustomerDomain();

    const targetUrl =
      buildExternalUrl(
        customerDomain,
        ROUTES.auth.customer.login,
      );

    window.location.href = targetUrl;
  };

  // ==================================================
  // DISTRIBUTOR LOGIN
  // ==================================================

  const goToDistributorLogin = () => {
    const distributorDomain =
      getDistributorDomain();

    const targetUrl =
      buildExternalUrl(
        distributorDomain,
        ROUTES.auth.distributor.login,
      );

    window.location.href = targetUrl;
  };

  // ==================================================
  // HANDLE JOIN OPTION
  // ==================================================

  const handleJoinOption = (
    type:
      | "customer"
      | "distributor",
  ) => {
    setIsDropdownOpen(false);
    setMobileOpen(false);

    if (type === "customer") {
      goToCustomerLogin();
      return;
    }

    goToDistributorLogin();
  };

  // ==================================================
  // CLOSE MOBILE MENU
  // ==================================================

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  // ==================================================
  // RENDER
  // ==================================================

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${scrolled
          ? "bg-[#0A1628]/95 backdrop-blur-xl shadow-2xl shadow-[#F9C744]/5 border-b border-[#F9C744]/10"
          : "bg-gradient-to-b from-[#0A1628]/80 to-transparent"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-[80px] flex items-center justify-between">
          {/* =====================================================
              LOGO
          ====================================================== */}

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
              <span className="text-[#F9C744]">
                Indie
              </span>
              Konnect
            </span>
          </Link>

          {/* =====================================================
              DESKTOP MENU
          ====================================================== */}

          <nav className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-10">
            {menus.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="group relative uppercase transition-all duration-300 text-white/80 hover:text-[#F9C744] tracking-wider"
                style={{
                  fontFamily: getFont(
                    "jost",
                  ),
                  fontWeight:
                    FONT_WEIGHT.medium,
                  fontSize: "12px",
                  letterSpacing: "2px",
                }}
              >
                <span className="relative z-10 flex items-center gap-1.5">
                  {item.name}
                </span>

                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-gradient-to-r from-[#F9C744] to-[#F9C744]/40 transition-all duration-300 group-hover:w-full group-hover:shadow-[0_0_15px_#F9C744]/50" />

                <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-[#F9C744]/10" />
              </Link>
            ))}
          </nav>

          {/* =====================================================
              RIGHT SIDE - DESKTOP
          ====================================================== */}

          <div className="hidden lg:flex items-center gap-4">
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
                className="relative group px-6 py-2.5 rounded-full flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 text-sm font-medium overflow-hidden"
                style={{
                  fontFamily: getFont(
                    "jost",
                  ),
                }}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-[#F9C744] to-[#F9C744]/80 rounded-full" />

                <span className="absolute inset-0 bg-gradient-to-r from-[#F9C744]/0 via-white/20 to-[#F9C744]/0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <span className="relative z-10 text-[#0A1628] font-semibold flex items-center gap-2">
                  Join Now

                  <FiChevronDown
                    className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen
                        ? "rotate-180"
                        : ""
                      }`}
                  />
                </span>

                <span className="absolute -inset-1 bg-[#F9C744]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </button>

              {/* =================================================
                  DROPDOWN
              ================================================== */}

              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-[#0A1628] rounded-2xl shadow-2xl shadow-[#F9C744]/10 border border-[#F9C744]/20 overflow-hidden animate-slideDown">
                  <div className="p-2">
                    <div className="px-4 py-3 border-b border-[#F9C744]/10">
                      <p className="text-[10px] font-medium text-[#F9C744] uppercase tracking-widest">
                        Welcome Back
                      </p>

                      <p className="text-xs text-white/50 mt-0.5">
                        Choose your account
                        type
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
                            className="w-full flex items-start gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden text-left"
                          >
                            <span
                              className={`absolute inset-0 bg-gradient-to-r ${option.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                            />

                            <div
                              className={`w-10 h-10 rounded-full ${option.iconBg} flex items-center justify-center flex-shrink-0 relative z-10 group-hover:scale-110 transition-transform duration-300`}
                            >
                              <Icon
                                className={`w-5 h-5 ${option.iconColor}`}
                              />
                            </div>

                            <div className="flex-1 min-w-0 relative z-10">
                              <p className="text-sm font-semibold text-white group-hover:text-[#F9C744] transition-colors duration-300">
                                {
                                  option.name
                                }
                              </p>

                              <p className="text-xs text-white/40 truncate">
                                {
                                  option.description
                                }
                              </p>
                            </div>

                            <FiArrowRight className="w-4 h-4 text-[#F9C744]/40 group-hover:text-[#F9C744] group-hover:translate-x-1 transition-all duration-300 flex-shrink-0 mt-1 relative z-10" />
                          </button>
                        );
                      },
                    )}
                  </div>

                  <div className="p-3 border-t border-[#F9C744]/10 bg-[#0A1628]/50">
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
            className="lg:hidden relative p-2 rounded-lg transition-all duration-300 hover:bg-[#F9C744]/10 group"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <span className="absolute inset-0 bg-[#F9C744]/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {mobileOpen ? (
              <HiOutlineX
                size={28}
                className="text-[#F9C744] relative z-10"
              />
            ) : (
              <HiOutlineMenuAlt3
                size={28}
                className="text-white relative z-10 group-hover:text-[#F9C744] transition-colors duration-300"
              />
            )}
          </button>
        </div>
      </div>

      {/* =========================================================
          MOBILE MENU
      ========================================================= */}

      {mobileOpen && (
        <div className="lg:hidden bg-[#0A1628]/98 backdrop-blur-xl border-t border-[#F9C744]/10 animate-slideDown">
          {/* MAIN MENU */}

          <div className="px-4 py-2">
            {menus.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="group flex items-center justify-between px-4 py-4 border-b border-white/5 text-white hover:text-[#F9C744] transition-all duration-300"
                style={{
                  fontFamily: getFont(
                    "jost",
                  ),
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

                <FiArrowRight className="w-4 h-4 text-white/20 group-hover:text-[#F9C744] group-hover:translate-x-1 transition-all duration-300" />
              </Link>
            ))}
          </div>

          {/* ACCOUNT ACCESS */}

          <div className="px-4 py-4 border-b border-[#F9C744]/10">
            <p className="text-[10px] text-[#F9C744] uppercase tracking-widest px-4 mb-3">
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
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 text-white group text-left"
              >
                <div className="w-9 h-9 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FiUser className="w-4 h-4 text-blue-400" />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-medium group-hover:text-[#F9C744] transition-colors duration-300">
                    Customer Login
                  </p>

                  <p className="text-xs text-white/40">
                    Shop & track orders
                  </p>
                </div>

                <FiArrowRight className="w-4 h-4 text-[#F9C744]/40 group-hover:text-[#F9C744] group-hover:translate-x-1 transition-all duration-300" />
              </button>

              {/* DISTRIBUTOR LOGIN */}

              <button
                type="button"
                onClick={() =>
                  handleJoinOption(
                    "distributor",
                  )
                }
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 text-white group text-left"
              >
                <div className="w-9 h-9 rounded-full bg-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FiUsers className="w-4 h-4 text-amber-400" />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-medium group-hover:text-[#F9C744] transition-colors duration-300">
                    Distributor Login
                  </p>

                  <p className="text-xs text-white/40">
                    Manage network &
                    commissions
                  </p>
                </div>

                <FiArrowRight className="w-4 h-4 text-[#F9C744]/40 group-hover:text-[#F9C744] group-hover:translate-x-1 transition-all duration-300" />
              </button>
            </div>
          </div>

          {/* =====================================================
              MOBILE REGISTER - KEPT COMMENTED
          ====================================================== */}

          {/*
          <div className="px-4 py-4">
            <Link
              href="/customer/register"
              className="flex items-center justify-center px-6 py-3 rounded-full bg-gradient-to-r from-[#F9C744] to-[#F9C744]/80 text-[#0A1628] font-semibold text-sm hover:scale-105 transition-all duration-300 shadow-lg shadow-[#F9C744]/20"
              style={{
                fontFamily: getFont("jost"),
              }}
              onClick={closeMobileMenu}
            >
              Create Account
              <FiArrowRight className="ml-2 w-4 h-4" />
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
            transform: translateY(-10px)
              scale(0.95);
          }

          to {
            opacity: 1;
            transform: translateY(0)
              scale(1);
          }
        }

        .animate-slideDown {
          animation:
            slideDown
            0.25s
            cubic-bezier(
              0.34,
              1.56,
              0.64,
              1
            )
            forwards;
        }
      `}</style>
    </header>
  );
}