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
  const {
    data,
    isLoading,
    isError,
  } = useGetFooterQuery();

  const footer = data?.data?.footer;

  const heritageSites =
    data?.data?.heritage_sites?.data ?? [];

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
      scale: 1.06,
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
    <footer className="relative overflow-hidden bg-[#0A1229] text-[#D4D8E8]">
      {/* Top mustard line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[#D4A017] to-transparent" />

      {/* Chakra watermark */}
      <svg
        className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] opacity-[0.08]"
        viewBox="0 0 200 200"
        fill="none"
      >
        <circle
          cx="100"
          cy="100"
          r="90"
          stroke="#D4A017"
          strokeWidth="1"
        />

        <circle
          cx="100"
          cy="100"
          r="4"
          fill="#D4A017"
        />

        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i * 360) / 24;
          const rad = (angle * Math.PI) / 180;

          const x2 =
            100 + 90 * Math.cos(rad);

          const y2 =
            100 + 90 * Math.sin(rad);

          return (
            <line
              key={i}
              x1="100"
              y1="100"
              x2={x2}
              y2={y2}
              stroke="#D4A017"
              strokeWidth="0.8"
            />
          );
        })}
      </svg>

      {/* Bottom-right watermark */}
      <svg
        className="pointer-events-none absolute -bottom-16 right-10 h-52 w-52 opacity-[0.05]"
        viewBox="0 0 200 200"
        fill="none"
      >
        <circle
          cx="100"
          cy="100"
          r="70"
          stroke="#D4A017"
          strokeWidth="1"
        />

        <circle
          cx="100"
          cy="100"
          r="3"
          fill="#D4A017"
        />
      </svg>

      {/* Glow */}
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-[#1A3E6B] opacity-40 blur-3xl" />

      <div className="pointer-events-none absolute -top-20 left-1/3 h-64 w-64 rounded-full bg-[#D4A017] opacity-[0.06] blur-3xl" />

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
          className="mx-auto max-w-full border-b border-[#D4A017]/30 py-12 md:py-14"
        >
          {/* Heritage heading */}
          <motion.div
            variants={itemVariants}
            className="mb-10 flex items-center gap-4"
          >
            <span className="h-px w-12 bg-[#D4A017]" />

            <span className="text-xs font-medium uppercase tracking-[0.35em] text-[#D4A017]">
              India&apos;s Heritage, Culture &amp; Diversity
            </span>

            <span className="h-px flex-1 bg-gradient-to-r from-[#D4A017]/40 to-transparent" />
          </motion.div>

          {/* Heritage Gallery */}
          <motion.div
            variants={itemVariants}
            className="mb-14 grid grid-cols-1 gap-4 md:grid-cols-3"
          >
            {isLoading ? (
              <div className="col-span-full flex min-h-[208px] items-center justify-center rounded-lg border border-[#D4A017]/20">
                <p className="text-sm text-[#A8B4CC]">
                  Loading heritage sites...
                </p>
              </div>
            ) : isError ? (
              <div className="col-span-full flex min-h-[208px] items-center justify-center rounded-lg border border-red-400/20">
                <p className="text-sm text-red-400">
                  Failed to load heritage sites.
                </p>
              </div>
            ) : heritageSites.length > 0 ? (
              heritageSites.map((monument, idx) => (
                <motion.div
                  key={monument.id}
                  whileHover="hover"
                  className="group relative h-52 overflow-hidden rounded-lg border border-[#D4A017]/30 shadow-[0_0_0_rgba(212,160,23,0)] transition-shadow duration-500 hover:shadow-[0_0_28px_rgba(212,160,23,0.18)]"
                >
                  {/* Image */}
                  <motion.div
                    variants={imageVariants}
                    className="relative h-full w-full"
                  >
                    <Image
                      src={monument.image_url}
                      alt={
                        monument.title ||
                        "Heritage Site"
                      }
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover brightness-[0.7] transition-all duration-500 group-hover:brightness-100"
                    />
                  </motion.div>

                  {/* Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A1229] via-[#0F2A52]/20 to-transparent" />

                  {/* Corners */}
                  <span className="pointer-events-none absolute left-2 top-2 h-4 w-4 border-l border-t border-[#D4A017]/50" />

                  <span className="pointer-events-none absolute bottom-2 right-2 h-4 w-4 border-b border-r border-[#D4A017]/50" />

                  {/* Top content */}
                  <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
                    <span className="rounded-full border border-[#D4A017] bg-[#0A1229]/70 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-[#D4A017] backdrop-blur-sm">
                      {monument.category ||
                        "Heritage"}
                    </span>

                    <span
                      className="text-2xl text-[#D4A017]/60"
                      style={{
                        fontFamily:
                          "'Cormorant Garamond', Georgia, serif",
                      }}
                    >
                      {String(idx + 1).padStart(
                        2,
                        "0"
                      )}
                    </span>
                  </div>

                  {/* Bottom content */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <h4
                      className="text-lg text-[#F3E9D2]"
                      style={{
                        fontFamily:
                          "'Cormorant Garamond', Georgia, serif",
                      }}
                    >
                      {monument.title}
                    </h4>

                    <p className="mt-1 flex items-center gap-1.5 text-xs text-[#D4A017]">
                      <MapPin className="h-3 w-3" />

                      {monument.full_location ||
                        `${monument.location}, ${monument.state}`}
                    </p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full flex min-h-[208px] items-center justify-center rounded-lg border border-[#D4A017]/20">
                <p className="text-sm text-[#A8B4CC]">
                  No heritage sites available.
                </p>
              </div>
            )}
          </motion.div>

          {/* Main Footer Grid */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_1fr_0.85fr_0.85fr] lg:gap-8">
            {/* Brand Column */}
            <motion.div
              variants={itemVariants}
              className="space-y-6"
            >
              {/* Dynamic Logo */}
              <div className="relative -ml-2 h-14 w-48 sm:h-16 sm:w-56">
                {footer?.logo_url ? (
                  <Image
                    src={footer.logo_url}
                    alt={
                      footer.title ||
                      "IndieKonnect Logo"
                    }
                    fill
                    sizes="224px"
                    className="object-contain object-left brightness-110"
                    priority
                  />
                ) : (
                  <div className="flex h-full items-center text-sm text-[#A8B4CC]">
                    {isLoading
                      ? "Loading..."
                      : "Logo unavailable"}
                  </div>
                )}
              </div>

              {/* Dynamic Title + Quote 1 */}
              <p className="max-w-sm text-sm leading-relaxed text-[#A8B4CC]">
                {footer?.title}

                {footer?.quote1 && (
                  <span
                    className="mt-2 block text-[#D4A017]"
                    style={{
                      fontFamily:
                        "'Cormorant Garamond', Georgia, serif",
                      fontSize: "1.05rem",
                    }}
                  >
                    {footer.quote1}
                  </span>
                )}
              </p>

              {/* Stats */}
              <div className="rounded-xl border border-[#D4A017]/20 bg-white/[0.02] p-1 backdrop-blur-sm">
                <div className="grid grid-cols-4 divide-x divide-[#D4A017]/20 py-3">
                  {stats.map((stat, idx) => {
                    const Icon = stat.icon;

                    return (
                      <div
                        key={idx}
                        className="flex flex-col items-center gap-1 px-1 text-center"
                      >
                        <Icon className="h-4 w-4 text-[#D4A017]" />

                        <p className="text-sm font-semibold text-[#F3E9D2]">
                          {stat.value}
                        </p>

                        <p className="text-[10px] uppercase tracking-wider text-[#A8B4CC]">
                          {stat.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Social Links */}
              <div className="flex items-center gap-4 pt-1">
                {socials
                  .filter(
                    (social) =>
                      !!social.href
                  )
                  .map((social) => {
                    const Icon = social.icon;

                    return (
                      <a
                        key={social.label}
                        href={social.href || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Follow us on ${social.label}`}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D4A017]/40 text-[#A8B4CC] transition-all duration-300 hover:border-[#D4A017] hover:bg-[#D4A017]/10 hover:text-[#D4A017]"
                      >
                        <Icon className="h-4 w-4" />
                      </a>
                    );
                  })}
              </div>
            </motion.div>

            {/* Customer Support */}
            <motion.div
              variants={itemVariants}
              className="space-y-5"
            >
              <div className="flex items-center gap-2">
                <MessageCircle className="h-3.5 w-3.5 text-[#D4A017]" />

                <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#F3E9D2]">
                  Customer Support
                </h3>
              </div>

              <ul className="space-y-3">
                {supportLinks.map(
                  ({
                    label,
                    icon: Icon,
                    href,
                  }) => (
                    <li key={label}>
                      <Link
                        href={href}
                        className="group flex items-center gap-2.5 text-sm text-[#C7D0E8] transition-colors duration-200 hover:text-[#D4A017]"
                      >
                        <Icon className="h-3.5 w-3.5 text-[#D4A017] transition-colors group-hover:text-[#F3C13B]" />

                        <span className="relative">
                          {label}

                          <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-[#D4A017] transition-all duration-300 group-hover:w-full" />
                        </span>
                      </Link>
                    </li>
                  )
                )}

                {/* Dynamic Phone */}
                {footer?.phone && (
                  <li>
                    <a
                      href={`tel:${footer.phone.replace(
                        /\s/g,
                        ""
                      )}`}
                      className="group flex items-center gap-2.5 text-sm font-medium text-[#F3C13B] transition-colors duration-200 hover:text-[#D4A017]"
                    >
                      <Phone className="h-3.5 w-3.5" />

                      <span className="relative">
                        Talk to Us

                        <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-[#D4A017] transition-all duration-300 group-hover:w-full" />
                      </span>
                    </a>
                  </li>
                )}
              </ul>
            </motion.div>

            {/* Footer Link Columns */}
            {Object.entries(footerLinks).map(
              ([category, links]) => (
                <motion.div
                  key={category}
                  variants={itemVariants}
                  className="space-y-5"
                >
                  <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#F3E9D2]">
                    {category}
                  </h3>

                  <ul className="space-y-3">
                    {links.map((link) => {
                      let href = "#";

                      if (
                        link === "Privacy Policy"
                      ) {
                        href = "/footer-policy/privacy-policy";
                      }

                      if (
                        link === "Terms of Use"
                      ) {
                        href = "/footer-policy/terms-of-use";
                      }

                      if (
                        link ===
                        "Cookie Preferences"
                      ) {
                        href =
                          "/footer-policy/cookie-preferences";
                      }

                      return (
                        <li key={link}>
                          <Link
                            href={href}
                            className="group inline-block text-sm text-[#A8B4CC] transition-colors duration-200 hover:text-[#D4A017]"
                          >
                            <span className="relative">
                              {link}

                              <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-[#D4A017] transition-all duration-300 group-hover:w-full" />
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </motion.div>
              )
            )}
          </div>

          {/* Contact Row */}
          <motion.div
            variants={itemVariants}
            className="mt-8 flex flex-col gap-3 border-t border-[#D4A017]/30 pt-6 text-sm font-medium text-[#E4E8F5] sm:flex-row sm:items-center sm:justify-between sm:gap-0 sm:divide-x sm:divide-[#D4A017]/30"
          >
            {/* Email */}
            {footer?.email && (
              <a
                href={`mailto:${footer.email}`}
                className="flex items-center gap-2.5 sm:px-6 sm:first:pl-0"
              >
                <Mail className="h-4 w-4 text-[#D4A017]" />

                {footer.email}
              </a>
            )}

            {/* Phone */}
            {footer?.phone && (
              <a
                href={`tel:${footer.phone.replace(
                  /\s/g,
                  ""
                )}`}
                className="flex items-center gap-2.5 sm:px-6"
              >
                <Phone className="h-4 w-4 text-[#D4A017]" />

                {footer.phone}
              </a>
            )}

            {/* Location */}
            {footer?.location && (
              <span className="flex items-center gap-2.5 sm:px-6 sm:last:pr-0">
                <MapPin className="h-4 w-4 text-[#D4A017]" />

                {footer.location}
              </span>
            )}
          </motion.div>

          {/* Dynamic Quote 2 */}
          {footer?.quote2 && (
            <motion.p
              variants={itemVariants}
              className="mt-5 text-center text-base font-medium text-[#F3C13B]"
              style={{
                fontFamily:
                  "'Cormorant Garamond', Georgia, serif",
              }}
            >
              {footer.quote2}
            </motion.p>
          )}
        </motion.div>

        {/* Bottom Bar */}
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 py-4 text-xs font-semibold text-[#C7D0E8] sm:flex-row">
          {/* Dynamic Copyright */}
          <p>
            {footer?.copyright ||
              `© ${new Date().getFullYear()} IndieConnect. All rights reserved.`}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link
              href="/footer-policy/privacy-policy"
              className="transition-colors hover:text-[#D4A017]"
            >
              Privacy Policy
            </Link>

            <Link
              href="/footer-policy/terms-of-use"
              className="transition-colors hover:text-[#D4A017]"
            >
              Terms of Service
            </Link>

            {/* Dynamic Quote 3 */}
            {footer?.quote3 && (
              <span className="hidden text-[#D4A017] sm:inline">
                {footer.quote3}
              </span>
            )}

            {/* Scroll Top */}
            <button
              onClick={scrollToTop}
              aria-label="Scroll to top"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#D4A017]/40 text-[#A8B4CC] transition-all duration-300 hover:border-[#D4A017] hover:bg-[#D4A017]/10 hover:text-[#D4A017]"
            >
              <ArrowUp className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom mustard line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[#D4A017] to-transparent" />
    </footer>
  );
}