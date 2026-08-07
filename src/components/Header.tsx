"use client";

import Link from "next/link";
import Image from "next/image";

import Logo from "../../public/images/logo.png";

import { HiOutlineMenuAlt3, HiOutlineX } from "react-icons/hi";
import { FiShoppingBag } from "react-icons/fi";

import { useState } from "react";

import {
  getFont,
  FONT_WEIGHT,
} from "../lib/constants/font-family";

import { COLORS } from "../lib/constants/colors";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

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
      href: "/product",
    },
  ];

  return (
    <header className="absolute top-0 left-0 w-full z-50">

      <div className="max-w-[1600px] mx-auto px-10">

        <div className="h-[90px] flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center">

            <Image
              src={Logo}
              alt="Logo"
              width={48}
              height={70}
              priority
            />

          </Link>

          {/* Desktop Menu */}

          <nav className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-16">

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
                  fontSize: "16px",
                }}
              >
                {item.name}
              </Link>
            ))}

          </nav>

          {/* Right */}

          <div className="hidden lg:flex items-center gap-8">

            <Link
              href="/cart"
              className="flex items-center gap-2 text-white"
            >
              <FiShoppingBag size={18} />

              <span
                style={{
                  fontFamily: getFont("jost"),
                }}
              >
                (0)
              </span>

            </Link>

            <Link
              href="/join"
              className="h-[58px] px-8 rounded-full flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105"
              style={{
                background: COLORS.brand.gold,
                color: COLORS.brand.darkBlue,
                fontFamily: getFont("jost"),
                fontWeight: FONT_WEIGHT.semiBold,
              }}
            >
              Join

              <span className="text-xl">
                →
              </span>

            </Link>

          </div>

          {/* Mobile */}

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden text-white"
          >
            {mobileOpen ? (
              <HiOutlineX size={30} />
            ) : (
              <HiOutlineMenuAlt3 size={30} />
            )}
          </button>

        </div>

      </div>

      {/* Mobile Menu */}

      {mobileOpen && (

        <div className="lg:hidden bg-[#071A33]/95 backdrop-blur-md">

          {menus.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="block px-8 py-5 border-b border-white/10 text-white uppercase"
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