"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  ArrowUp,
  Users,
  Award,
  Star,
  Shield,
  MessageCircle,
  LifeBuoy,
  HelpCircle,
  RotateCcw,
  Headset,
  Sparkles,
  Crown,
} from "lucide-react";

import {
  FaTwitter,
  FaInstagram,
  FaFacebook,
  FaYoutube,
  FaLinkedin,
} from "react-icons/fa";

import { useGetFooterQuery } from "@/lib/redux/api/Home/contentApi";

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

const footerLinks = {
  Legal: ["Privacy Policy", "Terms of Use", "Cookie Preferences"],
  "Quick Links": ["About Us", "Careers", "Blog", "Press Kit"],
};

const stats = [
  {
    icon: Users,
    value: "1M+",
    label: "Network",
  },
  {
    icon: Award,
    value: "50K+",
    label: "Distributors",
  },
  {
    icon: Star,
    value: "4.8",
    label: "Rating",
  },
  {
    icon: Shield,
    value: "100%",
    label: "Trust",
  },
];

export default function Footer() {
  const { data, isLoading, isError } = useGetFooterQuery();

  const footer = data?.data?.footer;

  const heritageSites = data?.data?.heritage_sites?.data ?? [];

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const containerVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.09,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 16,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  const imageVariants = {
    hover: {
      scale: 1.08,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const socials = [
    {
      icon: FaInstagram,
      label: "Instagram",
      href: footer?.instagram,
    },
    {
      icon: FaFacebook,
      label: "Facebook",
      href: footer?.facebook,
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
  ];

  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-[#0D1530] via-[#111B3B] to-[#0A1229] text-[#E8EBF8]">
      {/* Top golden line with glow */}
      <div className="relative h-[2px] w-full bg-gradient-to-r from-transparent via-[#FFD700] to-transparent">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFD700]/50 to-transparent blur-sm" />
      </div>

      {/* Premium sparkle effects */}
      <div className="pointer-events-none absolute left-10 top-10 h-2 w-2 rounded-full bg-[#FFD700] opacity-60 blur-[1px] animate-pulse" />
      <div
        className="pointer-events-none absolute right-20 top-20 h-1.5 w-1.5 rounded-full bg-[#FFD700] opacity-50 blur-[1px] animate-pulse"
        style={{ animationDelay: "1s" }}
      />
      <div
        className="pointer-events-none absolute left-1/4 top-40 h-1 w-1 rounded-full bg-[#FFD700] opacity-40 blur-[1px] animate-pulse"
        style={{ animationDelay: "2s" }}
      />

      {/* Chakra watermark - Enhanced */}
      <svg
        className="pointer-events-none absolute -right-24 -top-24 h-[480px] w-[480px] opacity-[0.12]"
        viewBox="0 0 200 200"
        fill="none"
      >
        <circle
          cx="100"
          cy="100"
          r="90"
          stroke="#FFD700"
          strokeWidth="1.2"
          className="drop-shadow-[0_0_10px_rgba(255,215,0,0.3)]"
        />

        <circle
          cx="100"
          cy="100"
          r="70"
          stroke="#FFD700"
          strokeWidth="0.5"
          strokeDasharray="4 4"
        />

        <circle
          cx="100"
          cy="100"
          r="4"
          fill="#FFD700"
          className="drop-shadow-[0_0_8px_rgba(255,215,0,0.8)]"
        />

        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i * 360) / 24;
          const rad = (angle * Math.PI) / 180;

          const x2 = 100 + 90 * Math.cos(rad);

          const y2 = 100 + 90 * Math.sin(rad);

          return (
            <line
              key={i}
              x1="100"
              y1="100"
              x2={x2}
              y2={y2}
              stroke="#FFD700"
              strokeWidth="0.8"
              className="drop-shadow-[0_0_2px_rgba(255,215,0,0.5)]"
            />
          );
        })}
      </svg>

      {/* Bottom-right watermark */}
      <svg
        className="pointer-events-none absolute -bottom-16 right-10 h-56 w-56 opacity-[0.08]"
        viewBox="0 0 200 200"
        fill="none"
      >
        <circle cx="100" cy="100" r="70" stroke="#FFD700" strokeWidth="1.2" />

        <circle cx="100" cy="100" r="3" fill="#FFD700" />
      </svg>

      {/* Enhanced Glow Effects */}
      <div className="pointer-events-none absolute -bottom-40 -left-32 h-[500px] w-[500px] rounded-full bg-[#2563EB] opacity-30 blur-3xl" />
      <div className="pointer-events-none absolute -top-20 left-1/3 h-80 w-80 rounded-full bg-[#FFD700] opacity-[0.1] blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 right-0 h-72 w-72 rounded-full bg-[#8B5CF6] opacity-[0.08] blur-3xl" />

      {/* Main container */}
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
            amount: 0.15,
          }}
          variants={containerVariants}
          className="mx-auto max-w-full border-b border-[#FFD700]/40 py-12 md:py-16"
        >
          {/* Heritage heading with crown */}
          <motion.div
            variants={itemVariants}
            className="mb-10 flex items-center gap-4"
          >
            <span className="h-px w-16 bg-gradient-to-r from-[#FFD700] to-transparent" />

            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-[#FFD700]" />
              <span className="text-xs font-semibold uppercase tracking-[0.35em] text-[#FFD700]">
                India&apos;s Heritage, Culture &amp; Diversity
              </span>
            </div>

            <span className="h-px flex-1 bg-gradient-to-r from-[#FFD700]/60 to-transparent" />
          </motion.div>

          {/* Heritage Gallery - Enhanced */}
          <motion.div
            variants={itemVariants}
            className="mb-14 grid grid-cols-1 gap-5 md:grid-cols-3"
          >
            {isLoading ? (
              <div className="col-span-full flex min-h-[224px] items-center justify-center rounded-xl border-2 border-[#FFD700]/30 bg-gradient-to-br from-[#1A2040]/50 to-[#0D1530]/50">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#FFD700] animate-spin" />
                  <p className="text-sm text-[#C7D0E8]">
                    Loading heritage sites...
                  </p>
                </div>
              </div>
            ) : isError ? (
              <div className="col-span-full flex min-h-[224px] items-center justify-center rounded-xl border-2 border-red-400/30 bg-gradient-to-br from-red-900/20 to-transparent">
                <p className="text-sm text-red-400">
                  Failed to load heritage sites.
                </p>
              </div>
            ) : heritageSites.length > 0 ? (
              heritageSites.map((monument, idx) => (
                <motion.div
                  key={monument.id}
                  whileHover="hover"
                  className="group relative h-56 overflow-hidden rounded-xl border-2 border-[#FFD700]/40 shadow-[0_0_20px_rgba(255,215,0,0.15)] transition-all duration-500 hover:shadow-[0_0_35px_rgba(255,215,0,0.35)] hover:border-[#FFD700]/70"
                >
                  {/* Image */}
                  <motion.div
                    variants={imageVariants}
                    className="relative h-full w-full"
                  >
                    <Image
                      src={monument.image_url}
                      alt={monument.title || "Heritage Site"}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover brightness-[0.75] transition-all duration-500 group-hover:brightness-110 group-hover:saturate-125"
                    />
                  </motion.div>

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A1229] via-[#1A2040]/30 to-transparent" />

                  {/* Premium corners */}
                  <span className="pointer-events-none absolute left-3 top-3 h-5 w-5 border-l-2 border-t-2 border-[#FFD700] opacity-70" />
                  <span className="pointer-events-none absolute right-3 top-3 h-5 w-5 border-r-2 border-t-2 border-[#FFD700] opacity-70" />
                  <span className="pointer-events-none absolute bottom-3 left-3 h-5 w-5 border-b-2 border-l-2 border-[#FFD700] opacity-70" />
                  <span className="pointer-events-none absolute bottom-3 right-3 h-5 w-5 border-b-2 border-r-2 border-[#FFD700] opacity-70" />

                  {/* Top content */}
                  <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
                    <span className="rounded-full border border-[#FFD700] bg-[#0A1229]/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#FFD700] backdrop-blur-md shadow-[0_0_10px_rgba(255,215,0,0.3)]">
                      {monument.category || "Heritage"}
                    </span>

                    <span
                      className="text-3xl font-bold text-[#FFD700]/80 drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]"
                      style={{
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                      }}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                  </div>

                  {/* Bottom content */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <h4
                      className="text-xl font-semibold text-[#FFE9A8] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                      style={{
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                      }}
                    >
                      {monument.title}
                    </h4>

                    <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-[#FFD700]">
                      <MapPin className="h-3.5 w-3.5" />
                      {monument.full_location ||
                        `${monument.location}, ${monument.state}`}
                    </p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full flex min-h-[224px] items-center justify-center rounded-xl border-2 border-[#FFD700]/30 bg-gradient-to-br from-[#1A2040]/50 to-[#0D1530]/50">
                <p className="text-sm text-[#C7D0E8]">
                  No heritage sites available.
                </p>
              </div>
            )}
          </motion.div>

          {/* Main Footer Grid */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_1fr_0.85fr_0.85fr] lg:gap-10">
            {/* Brand Column */}
            <motion.div variants={itemVariants} className="space-y-6">
              {/* Dynamic Logo */}
              <div className="relative -ml-2 h-16 w-52 sm:h-20 sm:w-60">
                {footer?.logo_url ? (
                  <Image
                    src={footer.logo_url}
                    alt={footer.title || "IndieKonnect Logo"}
                    fill
                    sizes="240px"
                    className="object-contain object-left brightness-125 contrast-105 drop-shadow-[0_0_15px_rgba(255,215,0,0.3)]"
                    priority
                  />
                ) : (
                  <div className="flex h-full items-center text-sm text-[#C7D0E8]">
                    {isLoading ? "Loading..." : "Logo unavailable"}
                  </div>
                )}
              </div>

              {/* Dynamic Title + Quote 1 */}
              <p className="max-w-sm text-sm leading-relaxed text-[#C7D0E8]">
                {footer?.title}

                {footer?.quote1 && (
                  <span
                    className="mt-2 block text-lg font-medium text-[#FFD700] drop-shadow-[0_0_10px_rgba(255,215,0,0.4)]"
                    style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                    }}
                  >
                    {footer.quote1}
                  </span>
                )}
              </p>

              {/* Stats - Enhanced */}
              <div className="rounded-xl border-2 border-[#FFD700]/30 bg-gradient-to-br from-[#1A2040]/60 to-[#0D1530]/60 p-1.5 backdrop-blur-md shadow-[0_0_20px_rgba(255,215,0,0.1)]">
                <div className="grid grid-cols-4 divide-x divide-[#FFD700]/30 py-4">
                  {stats.map((stat, idx) => {
                    const Icon = stat.icon;

                    return (
                      <div
                        key={idx}
                        className="flex flex-col items-center gap-1.5 px-1 text-center"
                      >
                        <Icon className="h-5 w-5 text-[#FFD700] drop-shadow-[0_0_6px_rgba(255,215,0,0.6)]" />

                        <p className="text-base font-bold text-[#FFE9A8]">
                          {stat.value}
                        </p>

                        <p className="text-[10px] font-medium uppercase tracking-wider text-[#C7D0E8]">
                          {stat.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Social Links - Enhanced */}
              <div className="flex items-center gap-4 pt-1">
                {socials
                  .filter((social) => !!social.href)
                  .map((social) => {
                    const Icon = social.icon;

                    return (
                      <a
                        key={social.label}
                        href={social.href || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Follow us on ${social.label}`}
                        className="group flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#FFD700]/50 text-[#C7D0E8] transition-all duration-300 hover:border-[#FFD700] hover:bg-gradient-to-br hover:from-[#FFD700]/20 hover:to-[#FFD700]/5 hover:text-[#FFD700] hover:shadow-[0_0_20px_rgba(255,215,0,0.3)] hover:scale-110"
                      >
                        <Icon className="h-4.5 w-4.5 transition-transform duration-300 group-hover:scale-110" />
                      </a>
                    );
                  })}
              </div>
            </motion.div>

            {/* Customer Support */}
            <motion.div variants={itemVariants} className="space-y-5">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-[#FFD700] drop-shadow-[0_0_6px_rgba(255,215,0,0.5)]" />

                <h3 className="text-sm font-bold uppercase tracking-[0.25em] text-[#FFE9A8]">
                  Customer Support
                </h3>
              </div>

              <ul className="space-y-3.5">
                {supportLinks.map(({ label, icon: Icon, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="group flex items-center gap-3 text-sm font-medium text-[#E0E4F5] transition-all duration-200 hover:text-[#FFD700] hover:translate-x-1"
                    >
                      <Icon className="h-4 w-4 text-[#FFD700] transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_6px_rgba(255,215,0,0.6)]" />

                      <span className="relative">
                        {label}

                        <span className="absolute -bottom-0.5 left-0 h-[2px] w-0 bg-gradient-to-r from-[#FFD700] to-transparent transition-all duration-300 group-hover:w-full" />
                      </span>
                    </Link>
                  </li>
                ))}

                {/* Dynamic Phone */}
                {footer?.phone && (
                  <li>
                    <a
                      href={`tel:${footer.phone.replace(/\s/g, "")}`}
                      className="group flex items-center gap-3 text-sm font-semibold text-[#FFD700] transition-all duration-200 hover:text-[#FFE9A8] hover:translate-x-1"
                    >
                      <Phone className="h-4 w-4 drop-shadow-[0_0_6px_rgba(255,215,0,0.5)]" />

                      <span className="relative">
                        Talk to Us
                        <span className="absolute -bottom-0.5 left-0 h-[2px] w-0 bg-gradient-to-r from-[#FFD700] to-transparent transition-all duration-300 group-hover:w-full" />
                      </span>
                    </a>
                  </li>
                )}
              </ul>
            </motion.div>

            {/* Footer Link Columns */}
            {Object.entries(footerLinks).map(([category, links]) => (
              <motion.div
                key={category}
                variants={itemVariants}
                className="space-y-5"
              >
                <h3 className="text-sm font-bold uppercase tracking-[0.25em] text-[#FFE9A8]">
                  {category}
                </h3>

                <ul className="space-y-3.5">
                  {links.map((link) => {
                    let href = "#";

                    if (link === "Privacy Policy") {
                      href = "/footer-policy/privacy-policy";
                    }

                    if (link === "Terms of Use") {
                      href = "/footer-policy/terms-of-use";
                    }

                    if (link === "Cookie Preferences") {
                      href = "/footer-policy/cookie-preferences";
                    }

                    return (
                      <li key={link}>
                        <Link
                          href={href}
                          className="group inline-block text-sm font-medium text-[#C7D0E8] transition-all duration-200 hover:text-[#FFD700] hover:translate-x-1"
                        >
                          <span className="relative">
                            {link}

                            <span className="absolute -bottom-0.5 left-0 h-[2px] w-0 bg-gradient-to-r from-[#FFD700] to-transparent transition-all duration-300 group-hover:w-full" />
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Contact Row - Enhanced */}
          <motion.div
            variants={itemVariants}
            className="mt-10 flex flex-col gap-4 rounded-xl border-2 border-[#FFD700]/30 bg-gradient-to-br from-[#1A2040]/40 to-[#0D1530]/40 p-5 text-sm font-semibold text-[#FFE9A8] backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:gap-0 sm:divide-x sm:divide-[#FFD700]/40"
          >
            {/* Email */}
            {footer?.email && (
              <a
                href={`mailto:${footer.email}`}
                className="group flex items-center gap-3 transition-all duration-200 hover:text-[#FFD700] sm:px-6 sm:first:pl-0"
              >
                <Mail className="h-5 w-5 text-[#FFD700] drop-shadow-[0_0_6px_rgba(255,215,0,0.5)] group-hover:scale-110 transition-transform" />

                {footer.email}
              </a>
            )}

            {/* Phone */}
            {footer?.phone && (
              <a
                href={`tel:${footer.phone.replace(/\s/g, "")}`}
                className="group flex items-center gap-3 transition-all duration-200 hover:text-[#FFD700] sm:px-6"
              >
                <Phone className="h-5 w-5 text-[#FFD700] drop-shadow-[0_0_6px_rgba(255,215,0,0.5)] group-hover:scale-110 transition-transform" />

                {footer.phone}
              </a>
            )}

            {/* Location */}
            {footer?.location && (
              <span className="group flex items-center gap-3 transition-all duration-200 hover:text-[#FFD700] sm:px-6 sm:last:pr-0">
                <MapPin className="h-5 w-5 text-[#FFD700] drop-shadow-[0_0_6px_rgba(255,215,0,0.5)] group-hover:scale-110 transition-transform" />

                {footer.location}
              </span>
            )}
          </motion.div>

          {/* Dynamic Quote 2 - Enhanced */}
          {footer?.quote2 && (
            <motion.p
              variants={itemVariants}
              className="mt-6 text-center text-lg font-semibold text-[#FFD700] drop-shadow-[0_0_15px_rgba(255,215,0,0.4)]"
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
              }}
            >
              {footer.quote2}
            </motion.p>
          )}
        </motion.div>

        {/* Bottom Bar - Enhanced */}
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 py-5 text-xs font-semibold text-[#D4D8E8] sm:flex-row">
          {/* Dynamic Copyright */}
          <p className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-[#FFD700]" />
            {footer?.copyright ||
              `© ${new Date().getFullYear()} IndieConnect. All rights reserved.`}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link
              href="/footer-policy/privacy-policy"
              className="transition-all duration-200 hover:text-[#FFD700] hover:scale-105"
            >
              Privacy Policy
            </Link>

            <Link
              href="/footer-policy/terms-of-use"
              className="transition-all duration-200 hover:text-[#FFD700] hover:scale-105"
            >
              Terms of Service
            </Link>

            {/* Dynamic Quote 3 */}
            {footer?.quote3 && (
              <span className="hidden text-[#FFD700] sm:inline font-medium">
                {footer.quote3}
              </span>
            )}

            {/* Scroll Top - Enhanced */}
            <button
              onClick={scrollToTop}
              aria-label="Scroll to top"
              className="group flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#FFD700]/50 text-[#C7D0E8] transition-all duration-300 hover:border-[#FFD700] hover:bg-gradient-to-br hover:from-[#FFD700]/20 hover:to-[#FFD700]/5 hover:text-[#FFD700] hover:shadow-[0_0_20px_rgba(255,215,0,0.3)] hover:scale-110"
            >
              <ArrowUp className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom golden line with glow */}
      <div className="relative h-[2px] w-full bg-gradient-to-r from-transparent via-[#FFD700] to-transparent">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFD700]/50 to-transparent blur-sm" />
      </div>
    </footer>
  );
}
