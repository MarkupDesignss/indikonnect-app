"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

import {
  Mail,
  Phone,
  MapPin,
  ArrowUp,
  LifeBuoy,
  HelpCircle,
  RotateCcw,
  Headset,
  Heart,
  Globe,
} from "lucide-react";

import {
  FaTwitter,
  FaInstagram,
  FaFacebook,
  FaYoutube,
  FaLinkedin,
} from "react-icons/fa";

import { useGetFooterQuery } from "@/lib/redux/api/Home/contentApi";

/* =========================================================
   STATIC SUPPORT LINKS
========================================================= */

const supportLinks = [
  {
    label: "Assistance",
    icon: LifeBuoy,
    href: "/footer-policy/Assistance",
  },
  {
    label: "FAQs",
    icon: HelpCircle,
    href: "/footer-policy/FAQs",
  },
  {
    label: "Returns & Refund",
    icon: RotateCcw,
    href: "/footer-policy/return-refund-policy",
  },
  {
    label: "Contact",
    icon: Headset,
    href: "/contact",
  },
];

/* =========================================================
   LEGAL LINKS
========================================================= */

const legalLinks = [
  {
    label: "Privacy Policy",
    href: "/footer-policy/privacy-policy",
  },
  {
    label: "Terms of Use",
    href: "/footer-policy/terms-of-use",
  },
  {
    label: "Cookie Preferences",
    href: "/footer-policy/cookie-preferences",
  },
];

/* =========================================================
   QUICK LINKS
========================================================= */

const quickLinks = [
  {
    label: "About Us",
    href: "/about",
  },
  {
    label: "Careers",
    href: "/careers",
    tag: "Hiring",
  },
  {
    label: "Blog",
    href: "/blog",
  },
  {
    label: "Press Kit",
    href: "/press",
  },
];

/* =========================================================
   FOOTER
========================================================= */

export default function Footer() {
  const { data, isLoading } = useGetFooterQuery();

  const footer = data?.data?.footer;

  /* =======================================================
     SCROLL TOP
  ======================================================= */

  const scrollToTop = () => {
    if (typeof window === "undefined") return;

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =======================================================
     SOCIAL LINKS
  ======================================================= */

  const socials = [
    {
      icon: FaFacebook,
      label: "Facebook",
      href: footer?.facebook,
    },
    {
      icon: FaInstagram,
      label: "Instagram",
      href: footer?.instagram,
    },
    {
      icon: FaLinkedin,
      label: "LinkedIn",
      href: footer?.linkedin,
    },
    {
      icon: FaTwitter,
      label: "Twitter",
      href: footer?.twitter,
    },
    {
      icon: FaYoutube,
      label: "YouTube",
      href: footer?.youtube,
    },
  ].filter(
    (
      social,
    ): social is typeof social & {
      href: string;
    } => Boolean(social.href),
  );

  /* =======================================================
     MOTION
  ======================================================= */

  const containerVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 15,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.55,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  return (
    <footer className="relative overflow-hidden bg-[#FAF8F6] font-['Poppins',sans-serif] text-[#1B1A3B]">

      {/* =====================================================
          BACKGROUND IMAGE
      ===================================================== */}

      <motion.div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        animate={{
          x: [0, 20, -15, 0],
          y: [0, -15, 10, 0],
          rotate: [0, 2, -2, 0],
          scale: [1, 1.03, 0.98, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
      >
        <Image
          src="/indiekonnect-web/images/animate.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="ik-watermark-image"
          style={{
            opacity: 0.4,
            visibility: "visible",
            objectFit: "cover",
          }}
        />
      </motion.div>
      {/* =====================================================
          SOFT OVERLAY
      ===================================================== */}

      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-[#fffdfb]/95 via-[#fffaf5]/88 to-[#fffdfb]/96" />

      <div className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(circle_at_88%_12%,rgba(255,138,43,0.08),transparent_25%),radial-gradient(circle_at_8%_82%,rgba(232,89,12,0.035),transparent_28%)]" />

      {/* =====================================================
          TOP BORDER
      ===================================================== */}

      <div className="absolute inset-x-0 top-0 z-[5] h-[1px] bg-[#E8590C]/10" />

      {/* =====================================================
          MAIN CONTAINER
      ===================================================== */}

      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12">

        {/* ===================================================
            TOP RIBBON
        =================================================== */}

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
            amount: 0.15,
          }}
          variants={containerVariants}
          className="border-b border-[#1B1A3B]/[0.07]"
        >
          <motion.div
            variants={itemVariants}
            className="flex min-h-[100px] flex-wrap items-center justify-center gap-x-6 gap-y-3 py-7 text-center lg:flex-nowrap lg:justify-between lg:gap-x-8 lg:py-6"
          >
            {/* Left */}

            <div className="flex shrink-0 items-center gap-2 text-[#E8590C]">
              <Globe className="h-[17px] w-[17px]" />

              <span className="text-[12px] font-semibold tracking-[0.04em]">
                Vasudhaiva Kutumbakam
              </span>
            </div>

            {/* Divider */}

            <span className="hidden h-5 w-px bg-[#1B1A3B]/15 lg:block" />

            {/* Main Statement */}

            <p className="text-[13px] font-semibold tracking-[0.02em] text-[#1B1A3B] sm:text-[14px]">
              One nation. One network, endless possibilities.
            </p>

            {/* Divider */}

            <span className="hidden h-5 w-px bg-[#1B1A3B]/15 lg:block" />

            {/* Single Quote */}

            <p className="text-[12px] font-medium italic tracking-[0.03em] text-[#E8590C] sm:text-[13px]">
              “Vasudhaiva Kutumbakam”—The world is one family
            </p>

            {/* Right Heart */}

            <Heart className="hidden h-4 w-4 flex-shrink-0 text-[#FF6A00] lg:block" />
          </motion.div>
        </motion.div>

        {/* ===================================================
            MAIN FOOTER
        =================================================== */}

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
            amount: 0.08,
          }}
          variants={containerVariants}
          className="grid grid-cols-1 gap-10 py-10 sm:grid-cols-2 lg:grid-cols-[1.35fr_0.9fr_0.9fr_1fr_1.35fr] lg:gap-7 lg:py-12 xl:grid-cols-[1.4fr_0.9fr_0.9fr_1fr_1.45fr] xl:gap-10"
        >

          {/* =================================================
              BRAND
          ================================================= */}

          <motion.div variants={itemVariants} className="text-left">

            {/* Logo */}

            <div className="relative mb-5 h-[82px] w-[205px]">
              {footer?.logo_url ? (
                <Image
                  src={footer.logo_url}
                  alt={footer?.title || "IndieKonnect"}
                  fill
                  sizes="220px"
                  priority
                  className="object-contain object-left"
                />
              ) : (
                <div className="flex h-full items-center text-sm text-[#1B1A3B]/45">
                  {isLoading ? "Loading..." : "IndieKonnect"}
                </div>
              )}
            </div>

            {/* Description */}

            <p className="max-w-[270px] text-[15px] font-medium leading-[1.75] tracking-[0.01em] text-[#1B1A3B]/75">
              {footer?.title ||
                "Connecting India through opportunity and excellence."}
            </p>

            {/* Quote */}

            <div className="mt-7 max-w-[285px]">
              <div className="flex gap-3">
                <span className="font-serif text-[44px] font-bold leading-[0.7] text-[#FF6A00]">
                  “
                </span>

                <p className="pt-1 text-[14px] font-normal italic leading-[1.8] text-[#1B1A3B]/75">
                  We are not just a network — we are a family, united by the
                  spirit of India.
                </p>
              </div>
            </div>
          </motion.div>

          {/* =================================================
              SUPPORT
          ================================================= */}

          <motion.div variants={itemVariants}>
            <h3 className="relative mb-7 flex w-fit items-center text-[15px] font-bold uppercase tracking-[0.08em] text-[#1B1A3B] after:absolute after:bottom-[-12px] after:left-0 after:h-[2.5px] after:w-[28px] after:rounded-full after:bg-[#FF6A00]">
              Support
            </h3>

            <ul className="m-0 flex flex-col gap-3 p-0">
              {supportLinks.map(({ label, icon: Icon, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="group flex w-fit items-center gap-3 text-[15px] font-medium text-[#1B1A3B]/85 transition-all duration-300 hover:text-[#E8590C]"
                  >
                    <Icon className="h-[22px] w-[22px] flex-shrink-0 text-[#FF6A00] transition-transform duration-300 group-hover:scale-105" />

                    <span className="relative whitespace-nowrap">
                      {label}

                      <span className="absolute -bottom-1 left-0 h-[1.5px] w-full origin-left scale-x-0 bg-[#FF6A00] transition-transform duration-300 group-hover:scale-x-100" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* =================================================
              LEGAL
          ================================================= */}

          <motion.div variants={itemVariants}>
            <h3 className="relative mb-7 flex w-fit items-center text-[15px] font-bold uppercase tracking-[0.08em] text-[#1B1A3B] after:absolute after:bottom-[-12px] after:left-0 after:h-[2.5px] after:w-[28px] after:rounded-full after:bg-[#FF6A00]">
              Legal
            </h3>

            <ul className="m-0 flex flex-col gap-3 p-0">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="group relative block w-fit whitespace-nowrap py-0.5 text-[15px] font-medium text-[#1B1A3B]/85 transition-colors duration-300 hover:text-[#E8590C]"
                  >
                    {link.label}

                    <span className="absolute -bottom-1 left-0 h-[1.5px] w-full origin-left scale-x-0 bg-[#FF6A00] transition-transform duration-300 group-hover:scale-x-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* =================================================
              QUICK LINKS
          ================================================= */}

          <motion.div variants={itemVariants}>
            <h3 className="relative mb-7 flex w-fit items-center text-[15px] font-bold uppercase tracking-[0.08em] text-[#1B1A3B] after:absolute after:bottom-[-12px] after:left-0 after:h-[2.5px] after:w-[28px] after:rounded-full after:bg-[#FF6A00]">
              Quick Links
            </h3>

            <ul className="m-0 flex flex-col gap-3 p-0">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="group flex w-fit items-center gap-2 whitespace-nowrap text-[15px] font-medium text-[#1B1A3B]/85 transition-colors duration-300 hover:text-[#E8590C]"
                  >
                    <span className="relative">
                      {link.label}

                      <span className="absolute -bottom-1 left-0 h-[1.5px] w-full origin-left scale-x-0 bg-[#FF6A00] transition-transform duration-300 group-hover:scale-x-100" />
                    </span>

                    {link.tag && (
                      <span className="rounded-[5px] bg-[#FFF0E5] px-2 py-[3px] text-[8px] font-bold uppercase tracking-[0.1em] text-[#E8590C]">
                        {link.tag}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* =================================================
              GET IN TOUCH
          ================================================= */}

          <motion.div
            variants={itemVariants}
            className="border-l-0 border-[#1B1A3B]/10 lg:border-l lg:pl-8"
          >
            <h3 className="relative mb-7 flex w-fit items-center text-[15px] font-bold uppercase tracking-[0.08em] text-[#1B1A3B] after:absolute after:bottom-[-12px] after:left-0 after:h-[2.5px] after:w-[28px] after:rounded-full after:bg-[#FF6A00]">
              Get In Touch
            </h3>

            <div className="flex flex-col gap-4">

              {/* Email */}

              {footer?.email && (
                <a
                  href={`mailto:${footer.email}`}
                  className="group flex w-fit items-center gap-3 text-[15px] font-medium text-[#1B1A3B]/85 transition-colors duration-300 hover:text-[#E8590C]"
                >
                  <Mail className="h-[23px] w-[23px] flex-shrink-0 text-[#FF6A00]" />

                  <span className="relative">
                    {footer.email}

                    <span className="absolute -bottom-1 left-0 h-[1.5px] w-full origin-left scale-x-0 bg-[#FF6A00] transition-transform duration-300 group-hover:scale-x-100" />
                  </span>
                </a>
              )}

              {/* Phone */}

              {footer?.phone && (
                <a
                  href={`tel:${footer.phone.replace(/\s/g, "")}`}
                  className="group flex w-fit items-center gap-3 text-[15px] font-medium text-[#1B1A3B]/85 transition-colors duration-300 hover:text-[#E8590C]"
                >
                  <Phone className="h-[23px] w-[23px] flex-shrink-0 text-[#FF6A00]" />

                  <span className="relative">
                    {footer.phone}

                    <span className="absolute -bottom-1 left-0 h-[1.5px] w-full origin-left scale-x-0 bg-[#FF6A00] transition-transform duration-300 group-hover:scale-x-100" />
                  </span>
                </a>
              )}

              {/* Location */}

              {footer?.location && (
                <div className="flex items-center gap-3 text-[15px] font-medium text-[#1B1A3B]/85">
                  <MapPin className="h-[23px] w-[23px] flex-shrink-0 text-[#FF6A00]" />

                  <span>{footer.location}</span>
                </div>
              )}
            </div>

            {/* =================================================
                SOCIAL ICONS - SINGLE LINE
            ================================================= */}

            {socials.length > 0 && (
              <div className="mt-7 border-t border-[#1B1A3B]/10 pt-6">
                <div className="flex flex-nowrap items-center gap-3 whitespace-nowrap">
                  {socials.map(({ icon: Icon, label, href }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="grid h-[43px] w-[43px] flex-shrink-0 place-items-center rounded-full border border-[#1B1A3B]/[0.08] bg-white/80 text-[#1B1A3B] shadow-[0_3px_10px_rgba(27,26,59,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-[#FF8A2B]/30 hover:bg-[#FFF4E8] hover:text-[#E8590C] hover:shadow-[0_8px_20px_rgba(232,89,12,0.12)]"
                    >
                      <Icon className="h-[17px] w-[17px]" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* =====================================================
          BOTTOM BAR
      ===================================================== */}

      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-5 border-t border-[#1B1A3B]/[0.08] py-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between lg:flex-nowrap lg:gap-4">

          {/* Copyright */}

          <p className="whitespace-nowrap text-[13px] font-medium text-[#1B1A3B]/70">
            {footer?.copyright ||
              `© ${new Date().getFullYear()} IndieKonnect. All rights reserved.`}
          </p>

          {/* Center Items */}

          <div className="flex flex-wrap items-center gap-4 lg:gap-6">

            <span className="hidden h-4 w-px bg-[#1B1A3B]/20 sm:block" />

            <Link
              href="/footer-policy/privacy-policy"
              className="relative whitespace-nowrap text-[13px] font-semibold text-[#1B1A3B]/70 transition-colors duration-300 hover:text-[#E8590C]"
            >
              Privacy
            </Link>

            <span className="h-4 w-px bg-[#1B1A3B]/20" />

            <Link
              href="/footer-policy/terms-of-use"
              className="relative whitespace-nowrap text-[13px] font-semibold text-[#1B1A3B]/70 transition-colors duration-300 hover:text-[#E8590C]"
            >
              Terms
            </Link>

            <span className="h-4 w-px bg-[#1B1A3B]/20" />

            {/* Made in India */}

            <div className="flex items-center gap-2 text-[13px] font-bold text-[#1B1A3B]">
              <span className="flex h-[10px] w-[22px] flex-col overflow-hidden rounded-[1px]">
                <span className="flex-1 bg-[#FF9933]" />
                <span className="flex-1 bg-white" />
                <span className="flex-1 bg-[#138808]" />
              </span>

              <span>Made in India</span>
            </div>

            <span className="hidden h-4 w-px bg-[#1B1A3B]/20 lg:block" />

            {footer?.quote3 && (
              <span className="hidden text-[13px] font-medium text-[#E8590C] lg:inline">
                · {footer.quote3}
              </span>
            )}
          </div>

          {/* Badge + Arrow */}

          <div className="flex items-center gap-4">

            <span className="flex items-center gap-2 rounded-full border border-[#FF8A2B]/35 bg-white/50 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#E8590C]">
              <Heart className="h-3.5 w-3.5" />

              Vasudhaiva Kutumbakam
            </span>

            <button
              type="button"
              onClick={scrollToTop}
              aria-label="Scroll to top"
              className="grid h-[39px] w-[39px] flex-shrink-0 place-items-center rounded-full border border-[#1B1A3B]/[0.08] bg-white text-[#1B1A3B]/70 shadow-[0_3px_10px_rgba(27,26,59,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-[#FF8A2B]/40 hover:bg-[#FFF4E8] hover:text-[#E8590C]"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}