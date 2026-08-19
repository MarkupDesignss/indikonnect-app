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
} from "lucide-react";

import {
  FaTwitter,
  FaInstagram,
  FaFacebook,
  FaYoutube,
  FaLinkedin,
} from "react-icons/fa";

import { useGetFooterQuery } from "@/lib/redux/api/Home/contentApi";

type Hub = {
  name: string;
  x: number;
  y: number;
  delay?: string;
  anchor: "start" | "end";
};

type Route = {
  d: string;
  dur: string;
  packet?: boolean;
};

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
   NETWORK STATS
========================================================= */

const stats = [
  {
    value: "28",
    label: "States",
  },
  {
    value: "19K+",
    label: "Pin codes",
  },
  {
    value: "50K+",
    label: "Distributors",
  },
];

/* =========================================================
   PRIMARY HUBS
========================================================= */

const primaryHubs: Hub[] = [
  {
    name: "New Delhi",
    x: 179,
    y: 166,
    delay: "0s",
    anchor: "start",
  },
  {
    name: "Mumbai",
    x: 110,
    y: 318,
    delay: "0.7s",
    anchor: "start",
  },
  {
    name: "Bengaluru",
    x: 186,
    y: 417,
    delay: "1.4s",
    anchor: "end",
  },
  {
    name: "Kolkata",
    x: 358,
    y: 263,
    delay: "2.1s",
    anchor: "start",
  },
];

/* =========================================================
   SECONDARY HUBS
========================================================= */

const secondaryHubs: Hub[] = [
  {
    name: "Chennai",
    x: 228,
    y: 415,
    anchor: "start",
  },
  {
    name: "Hyderabad",
    x: 200,
    y: 346,
    anchor: "start",
  },
  {
    name: "Ahmedabad",
    x: 106,
    y: 256,
    anchor: "start",
  },
  {
    name: "Guwahati",
    x: 411,
    y: 206,
    anchor: "end",
  },
  {
    name: "Lucknow",
    x: 238,
    y: 195,
    anchor: "start",
  },
  {
    name: "Kochi",
    x: 165,
    y: 466,
    anchor: "end",
  },
];

/* =========================================================
   NETWORK ROUTES
========================================================= */

const routes: Route[] = [
  {
    d: "M179,166 Q275,175 358,263",
    dur: "4.5s",
    packet: true,
  },
  {
    d: "M179,166 Q108,235 110,318",
    dur: "5.4s",
    packet: true,
  },
  {
    d: "M110,318 Q120,395 186,417",
    dur: "4.9s",
    packet: true,
  },
  {
    d: "M186,417 Q207,395 228,415",
    dur: "3.6s",
  },
  {
    d: "M358,263 Q395,220 411,206",
    dur: "3.9s",
    packet: true,
  },
  {
    d: "M179,166 Q120,195 106,256",
    dur: "5.1s",
  },
  {
    d: "M200,346 Q232,375 228,415",
    dur: "4.2s",
  },
  {
    d: "M110,318 Q95,285 106,256",
    dur: "3.4s",
  },
];

/* =========================================================
   INDIA SVG PATH
========================================================= */

const INDIA_PATH =
  "M176,56 L200,64 L216,80 L208,104 L240,138 L272,155 L304,176 L352,189 L376,197 L416,184 L472,168 L496,176 L488,192 L501,232 L456,240 L440,264 L421,272 L410,253 L392,221 L381,219 L363,203 L355,232 L363,248 L368,272 L336,278 L328,302 L304,312 L288,331 L264,352 L238,368 L229,414 L221,442 L222,459 L206,477 L195,482 L184,494 L168,472 L157,440 L141,408 L120,370 L110,320 L106,288 L110,278 L96,285 L61,265 L48,259 L64,248 L35,243 L45,235 L72,227 L75,181 L104,168 L126,146 L136,128 L144,104 L128,80 L144,64 L168,51 Z";

/* =========================================================
   INDIA NETWORK COMPONENT
========================================================= */

function IndiaNetwork() {
  return (
    <svg
      viewBox="0 0 540 540"
      className="block h-auto w-full"
      role="img"
      aria-label="IndieKonnect network across India"
    >
      <defs>
        <pattern
          id="ikDots"
          width="9.4"
          height="9.4"
          patternUnits="userSpaceOnUse"
        >
          <circle
            cx="4.7"
            cy="4.7"
            r="1.55"
            fill="#1B1A3B"
            opacity="0.16"
          />
        </pattern>

        <radialGradient id="ikHaze" cx="42%" cy="42%" r="62%">
          <stop offset="0%" stopColor="#FF8A2B" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#FF8A2B" stopOpacity="0" />
        </radialGradient>

        <filter id="ikSoft" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="13" />
        </filter>

        <filter id="ikGlow" x="-160%" y="-160%" width="420%" height="420%">
          <feGaussianBlur stdDeviation="4" result="blur" />

          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <path id="ikIndia" d={INDIA_PATH} />
      </defs>

      <use
        href="#ikIndia"
        fill="url(#ikHaze)"
        filter="url(#ikSoft)"
        opacity="0.9"
      />

      <use href="#ikIndia" fill="url(#ikDots)" />

      <use
        href="#ikIndia"
        fill="none"
        stroke="#E8590C"
        strokeWidth="1.1"
        strokeLinejoin="round"
        opacity="0.4"
      />

      <g fill="#1B1A3B" opacity="0.18">
        <circle cx="427" cy="418" r="1.55" />
        <circle cx="430" cy="428" r="1.55" />
        <circle cx="428" cy="438" r="1.55" />
        <circle cx="433" cy="448" r="1.55" />
        <circle cx="438" cy="482" r="1.55" />
        <circle cx="441" cy="493" r="1.55" />

        <circle cx="112" cy="444" r="1.55" />
        <circle cx="108" cy="454" r="1.55" />
        <circle cx="116" cy="462" r="1.55" />
      </g>

      <g
        fill="none"
        stroke="#E8590C"
        strokeWidth="1.2"
        opacity="0.4"
        strokeDasharray="5 7"
      >
        {routes.map((route, index) => (
          <path key={`route-${index}`} d={route.d}>
            <animate
              attributeName="stroke-dashoffset"
              from="0"
              to="-120"
              dur={route.dur}
              repeatCount="indefinite"
            />
          </path>
        ))}
      </g>

      <g fill="#FF8A2B" filter="url(#ikGlow)">
        {routes
          .filter((route) => route.packet)
          .map((route, index) => (
            <circle key={`packet-${index}`} r="2.8">
              <animateMotion
                dur={route.dur}
                begin={`${index * 0.55}s`}
                repeatCount="indefinite"
                path={route.d}
              />
            </circle>
          ))}
      </g>

      {primaryHubs.map((hub) => (
        <g key={hub.name} className="ik-node">
          <circle cx={hub.x} cy={hub.y} r="16" fill="transparent" />

          <circle
            cx={hub.x}
            cy={hub.y}
            r="5"
            fill="none"
            stroke="#FF8A2B"
            strokeWidth="1.2"
            opacity="0.85"
          >
            <animate
              attributeName="r"
              values="5;18"
              dur="2.8s"
              begin={hub.delay}
              repeatCount="indefinite"
            />

            <animate
              attributeName="opacity"
              values="0.85;0"
              dur="2.8s"
              begin={hub.delay}
              repeatCount="indefinite"
            />
          </circle>

          <circle
            className="ik-core"
            cx={hub.x}
            cy={hub.y}
            r="4.8"
            fill="#FF6A00"
            filter="url(#ikGlow)"
          />

          <text
            className="ik-lbl"
            x={hub.anchor === "end" ? hub.x - 12 : hub.x + 12}
            y={hub.y - 9}
            textAnchor={hub.anchor}
          >
            {hub.name}
          </text>
        </g>
      ))}

      {secondaryHubs.map((hub) => (
        <g key={hub.name} className="ik-node">
          <circle cx={hub.x} cy={hub.y} r="14" fill="transparent" />

          <circle
            className="ik-core"
            cx={hub.x}
            cy={hub.y}
            r="3.8"
            fill="#1B1A3B"
            opacity="0.55"
          />

          <text
            className="ik-lbl"
            x={hub.anchor === "end" ? hub.x - 10 : hub.x + 10}
            y={hub.y - 8}
            textAnchor={hub.anchor}
          >
            {hub.name}
          </text>
        </g>
      ))}
    </svg>
  );
}

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
    if (typeof window === "undefined") {
      return;
    }

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
      y: 18,
    },

    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  return (
    <footer className="ik-footer relative overflow-hidden bg-[#FAF8F6] text-[#1B1A3B] tracking-[0.02em]">
      {/* =====================================================
          WATERMARK
      ===================================================== */}

      <div className="ik-watermark pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <Image
          src="/indiekonnect-web/images/animate.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="ik-watermark-image"
          style={{
            filter: "blur(12px) brightness(0.65) saturate(0.4)",
          }}
        />
      </div>

      {/* =====================================================
          BACKGROUND ATMOSPHERE
      ===================================================== */}

      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_85%_5%,rgba(255,138,43,0.10),transparent_35%),radial-gradient(circle_at_10%_90%,rgba(27,26,59,0.04),transparent_35%)]" />

      <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-b from-[#FAF8F6]/50 via-[#FAF8F6]/20 to-[#FAF8F6]/70" />

      {/* =====================================================
          TOP LINE
      ===================================================== */}

      <div className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-px bg-gradient-to-r from-transparent via-[#FF8A2B]/40 to-transparent" />

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12">
        {/* ===================================================
            RIBBON
        =================================================== */}

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
            amount: 0.2,
          }}
          variants={containerVariants}
          className="border-b border-[#1B1A3B]/[0.06] py-10 md:py-14"
        >
          <motion.div variants={itemVariants}>
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-7 bg-[#FF6A00]/60" />

              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-[#E8590C]">
                Connect Beyond Boundaries
              </span>
            </div>

            <h2 className="font-serif text-[clamp(24px,2.8vw,36px)] font-semibold leading-[1.15] tracking-[-0.025em] text-[#1B1A3B]">
              One nation. One network.
              <br />

              <em className="bg-gradient-to-r from-[#FF6A00] via-[#FFA94D] to-[#E8590C] bg-clip-text font-normal italic text-transparent">
                {footer?.quote1 || "Endless possibilities."}
              </em>
            </h2>
          </motion.div>
        </motion.div>

        {/* ===================================================
            MAIN FOOTER GRID
        =================================================== */}

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
            amount: 0.12,
          }}
          variants={containerVariants}
          className="
            grid
            grid-cols-1
            gap-8
            py-12
            md:grid-cols-2
            lg:grid-cols-[1.2fr_0.9fr_0.9fr_0.9fr]
            lg:items-start
            lg:gap-6
            lg:py-16
            xl:grid-cols-[1.3fr_0.9fr_0.9fr_0.9fr]
            xl:gap-8
          "
        >
          {/* =================================================
              BRAND
          ================================================= */}

          <motion.div variants={itemVariants}>
            <div className="relative -ml-1 mb-6 h-16 w-52">
              {footer?.logo_url ? (
                <Image
                  src={footer.logo_url}
                  alt={footer?.title || "IndieKonnect"}
                  fill
                  sizes="240px"
                  priority
                  className="object-contain object-left drop-shadow-[0_10px_24px_rgba(232,89,12,0.12)]"
                />
              ) : (
                <div className="flex h-full items-center text-sm text-[#1B1A3B]/45">
                  {isLoading ? "Loading..." : "IndieKonnect"}
                </div>
              )}
            </div>

            <p className="mb-7 max-w-[340px] text-[15px] font-normal leading-[1.8] tracking-[0.03em] text-[#1B1A3B]/60">
              {footer?.title ||
                "Connecting India through opportunity and excellence — a single network linking makers, brands and buyers across every state, city and pin code."}
            </p>

            <div className="mb-8 flex flex-col gap-3.5">
              <h4 className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-[#1B1A3B]/40">
                Get in Touch
              </h4>

              {footer?.email && (
                <a
                  href={`mailto:${footer.email}`}
                  className="group relative flex w-fit items-center gap-3 font-mono text-[15px] font-semibold tracking-[0.04em] text-[#1B1A3B]/75 transition-all duration-300 hover:text-[#E8590C]"
                >
                  <Mail className="h-[18px] w-[18px] text-[#FF8A2B] transition-transform duration-300 group-hover:scale-110" />

                  <span className="relative inline-block">
                    <span>{footer.email}</span>

                    <span className="absolute bottom-0 left-0 h-[2px] w-full origin-left scale-x-0 bg-gradient-to-r from-[#FF6A00] via-[#FFA94D] to-[#E8590C] transition-transform duration-500 ease-out group-hover:scale-x-100" />
                  </span>
                </a>
              )}

              {footer?.phone && (
                <a
                  href={`tel:${footer.phone.replace(/\s/g, "")}`}
                  className="group relative flex w-fit items-center gap-3 font-mono text-[15px] font-semibold tracking-[0.04em] text-[#1B1A3B]/75 transition-all duration-300 hover:text-[#E8590C]"
                >
                  <Phone className="h-[18px] w-[18px] text-[#FF8A2B] transition-transform duration-300 group-hover:scale-110" />

                  <span className="relative inline-block">
                    <span>{footer.phone}</span>

                    <span className="absolute bottom-0 left-0 h-[2px] w-full origin-left scale-x-0 bg-gradient-to-r from-[#FF6A00] via-[#FFA94D] to-[#E8590C] transition-transform duration-500 ease-out group-hover:scale-x-100" />
                  </span>
                </a>
              )}

              {footer?.location && (
                <span className="flex w-fit items-center gap-3 font-mono text-[15px] font-semibold tracking-[0.04em] text-[#1B1A3B]/75">
                  <MapPin className="h-[18px] w-[18px] text-[#FF8A2B]" />

                  <span>{footer.location}</span>
                </span>
              )}
            </div>

            <div className="flex gap-3">
              {socials.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="grid h-[44px] w-[44px] place-items-center rounded-full border border-[#1B1A3B]/[0.08] bg-white/80 text-[#1B1A3B]/55 shadow-[0_2px_8px_rgba(27,26,59,0.06)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#FF8A2B]/40 hover:bg-[#FFF4E8] hover:text-[#E8590C] hover:shadow-[0_12px_28px_rgba(232,89,12,0.14)]"
                >
                  <Icon className="h-[18px] w-[18px]" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* =================================================
              SUPPORT
          ================================================= */}

          <motion.div variants={itemVariants}>
            <h3 className="mb-3 flex items-center justify-between border-b border-[#1B1A3B]/[0.07] pb-3 font-mono text-[11px] font-bold uppercase tracking-[0.4em] text-[#1B1A3B]">
              <span>Support</span>

              <span className="text-[#E8590C]/75">01</span>
            </h3>

            <ul className="m-0 flex flex-col p-0">
              {supportLinks.map(({ label, icon: Icon, href }) => (
                <li key={label} className="m-0 p-0">
                  <Link
                    href={href}
                    className="group relative flex w-fit items-center gap-3 py-2 text-[15px] font-semibold tracking-[0.06em] text-[#1B1A3B] transition-colors duration-300 hover:text-[#E8590C]"
                  >
                    <Icon className="h-[18px] w-[18px] flex-shrink-0 text-[#FF8A2B] transition-transform duration-300 group-hover:scale-110" />

                    <span className="relative inline-block whitespace-nowrap">
                      <span>{label}</span>

                      <span className="absolute bottom-0 left-0 h-[2.5px] w-full origin-left scale-x-0 bg-gradient-to-r from-[#FF6A00] via-[#FFA94D] to-[#E8590C] transition-transform duration-500 ease-out group-hover:scale-x-100" />

                      <span className="absolute bottom-[-1px] left-0 h-[3.5px] w-full origin-left scale-x-0 bg-gradient-to-r from-[#FF6A00]/30 via-[#FFA94D]/30 to-[#E8590C]/30 blur-[2.5px] transition-transform duration-700 ease-out group-hover:scale-x-100" />
                    </span>
                  </Link>
                </li>
              ))}

              {footer?.phone && (
                <li className="m-0 p-0">
                  <a
                    href={`tel:${footer.phone.replace(/\s/g, "")}`}
                    className="group relative flex w-fit items-center gap-3 py-2 text-[15px] font-semibold tracking-[0.06em] text-[#E8590C] transition-colors duration-300"
                  >
                    <Phone className="h-[18px] w-[18px] flex-shrink-0" />

                    <span className="relative inline-block whitespace-nowrap">
                      <span>Talk to Us</span>

                      <span className="absolute bottom-0 left-0 h-[2.5px] w-full origin-left scale-x-0 bg-gradient-to-r from-[#FF6A00] via-[#FFA94D] to-[#E8590C] transition-transform duration-500 ease-out group-hover:scale-x-100" />

                      <span className="absolute bottom-[-1px] left-0 h-[3.5px] w-full origin-left scale-x-0 bg-gradient-to-r from-[#FF6A00]/30 via-[#FFA94D]/30 to-[#E8590C]/30 blur-[2.5px] transition-transform duration-700 ease-out group-hover:scale-x-100" />
                    </span>
                  </a>
                </li>
              )}
            </ul>
          </motion.div>

          {/* =================================================
              LEGAL
          ================================================= */}

          <motion.div variants={itemVariants}>
            <div className="min-w-0">
              <h3 className="mb-3 flex items-center justify-between border-b border-[#1B1A3B]/[0.07] pb-3 font-mono text-[11px] font-bold uppercase tracking-[0.4em] text-[#1B1A3B]">
                <span>Legal</span>

                <span className="text-[#E8590C]/75">02</span>
              </h3>

              <ul className="m-0 flex flex-col items-start p-0">
                {legalLinks.map((link) => (
                  <li key={link.label} className="m-0 w-fit p-0">
                    <Link
                      href={link.href}
                      className="group relative flex w-fit items-center gap-0 py-2 text-[15px] font-semibold tracking-[0.06em] text-[#1B1A3B] transition-colors duration-300 hover:text-[#E8590C]"
                    >
                      <span className="absolute left-0 -ml-4 h-2 w-2 scale-0 rounded-full bg-[#E8590C] opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100" />

                      <span className="relative inline-block whitespace-nowrap">
                        <span>{link.label}</span>

                        <span className="absolute bottom-0 left-0 h-[2.5px] w-full origin-left scale-x-0 bg-gradient-to-r from-[#FF6A00] via-[#FFA94D] to-[#E8590C] transition-transform duration-500 ease-out group-hover:scale-x-100" />

                        <span className="absolute bottom-[-1px] left-0 h-[3.5px] w-full origin-left scale-x-0 bg-gradient-to-r from-[#FF6A00]/30 via-[#FFA94D]/30 to-[#E8590C]/30 blur-[2.5px] transition-transform duration-700 ease-out group-hover:scale-x-100" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* =================================================
              QUICK LINKS
          ================================================= */}

          <motion.div variants={itemVariants}>
            <div className="min-w-0">
              <h3 className="mb-3 flex items-center justify-between border-b border-[#1B1A3B]/[0.07] pb-3 font-mono text-[11px] font-bold uppercase tracking-[0.4em] text-[#1B1A3B]">
                <span>Quick Links</span>

                <span className="text-[#E8590C]/75">03</span>
              </h3>

              <ul className="m-0 flex flex-col items-start p-0">
                {quickLinks.map((link) => (
                  <li key={link.label} className="m-0 w-fit p-0">
                    <Link
                      href={link.href}
                      className="group relative flex w-fit items-center gap-2 py-2 text-[15px] font-semibold tracking-[0.06em] text-[#1B1A3B] transition-colors duration-300 hover:text-[#E8590C]"
                    >
                      <span className="absolute left-0 -ml-4 h-2 w-2 scale-0 rounded-full bg-[#E8590C] opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100" />

                      <span className="relative inline-block whitespace-nowrap">
                        <span>{link.label}</span>

                        <span className="absolute bottom-0 left-0 h-[2.5px] w-full origin-left scale-x-0 bg-gradient-to-r from-[#FF6A00] via-[#FFA94D] to-[#E8590C] transition-transform duration-500 ease-out group-hover:scale-x-100" />

                        <span className="absolute bottom-[-1px] left-0 h-[3.5px] w-full origin-left scale-x-0 bg-gradient-to-r from-[#FF6A00]/30 via-[#FFA94D]/30 to-[#E8590C]/30 blur-[2.5px] transition-transform duration-700 ease-out group-hover:scale-x-100" />
                      </span>

                      {link.tag && (
                        <span className="rounded-[3px] bg-[#FFF0DE] px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.15em] text-[#E8590C]">
                          {link.tag}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* =====================================================
          BOTTOM BAR
      ===================================================== */}

      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col items-start justify-between gap-5 border-t border-[#1B1A3B]/[0.06] py-6 sm:flex-row sm:items-center">
          <p className="text-[13px] font-medium tracking-[0.03em] text-[#1B1A3B]/70">
            {footer?.copyright ||
              `© ${new Date().getFullYear()} IndieKonnect Pvt. Ltd. — All rights reserved.`}
          </p>

          <div className="flex flex-wrap items-center gap-5">
            <Link
              href="/footer-policy/privacy-policy"
              className="group relative text-[13px] font-semibold tracking-[0.03em] text-[#1B1A3B]/70 transition-colors hover:text-[#E8590C]"
            >
              Privacy

              <span className="absolute bottom-0 left-0 h-[2px] w-full origin-left scale-x-0 bg-gradient-to-r from-[#FF6A00] via-[#FFA94D] to-[#E8590C] transition-transform duration-500 ease-out group-hover:scale-x-100" />
            </Link>

            <Link
              href="/footer-policy/terms-of-use"
              className="group relative text-[13px] font-semibold tracking-[0.03em] text-[#1B1A3B]/70 transition-colors hover:text-[#E8590C]"
            >
              Terms

              <span className="absolute bottom-0 left-0 h-[2px] w-full origin-left scale-x-0 bg-gradient-to-r from-[#FF6A00] via-[#FFA94D] to-[#E8590C] transition-transform duration-500 ease-out group-hover:scale-x-100" />
            </Link>

            <span className="flex items-center gap-2.5 text-[13px] font-bold tracking-[0.04em] text-[#1B1A3B]/70">
              <span className="flex h-[3px] w-[26px] overflow-hidden rounded-sm">
                <i className="flex-1 bg-[#FF9933]" />
                <i className="flex-1 bg-white" />
                <i className="flex-1 bg-[#138808]" />
              </span>

              <b className="font-bold text-[#1B1A3B]">Made in India</b>

              {footer?.quote3 && (
                <span className="hidden text-[#E8590C] sm:inline">
                  · {footer.quote3}
                </span>
              )}
            </span>

            <button
              type="button"
              onClick={scrollToTop}
              aria-label="Scroll to top"
              className="group grid h-9 w-9 place-items-center rounded-full border border-[#1B1A3B]/[0.08] bg-white/80 text-[#1B1A3B]/55 shadow-[0_2px_8px_rgba(27,26,59,0.06)] transition-all duration-300 hover:border-[#FF8A2B]/40 hover:bg-[#FFF4E8] hover:text-[#E8590C]"
            >
              <ArrowUp className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================
          COMPONENT CSS
      ===================================================== */}

      <style>
        {`
          .ik-watermark {
            opacity: 0.055;
            overflow: hidden;
          }

          .ik-watermark-image {
            object-fit: cover;
            object-position: center center;
            transform-origin: center center;
            animation:
              ikWatermarkFloat 20s ease-in-out infinite alternate,
              ikWatermarkZoom 24s ease-in-out infinite alternate;
            will-change: transform;
          }

          @keyframes ikWatermarkFloat {
            0% {
              transform: scale(1.02) translate3d(-1%, 0, 0);
            }

            25% {
              transform: scale(1.035) translate3d(0, -0.5%, 0);
            }

            50% {
              transform: scale(1.05) translate3d(1%, -1%, 0);
            }

            75% {
              transform: scale(1.035) translate3d(0, 0, 0);
            }

            100% {
              transform: scale(1.02) translate3d(-1%, 1%, 0);
            }
          }

          @keyframes ikWatermarkZoom {
            0% {
              filter: blur(0);
            }

            50% {
              filter: blur(0.2px);
            }

            100% {
              filter: blur(0);
            }
          }

          .ik-blip {
            animation: ikBlip 1.9s ease-in-out infinite;
          }

          @keyframes ikBlip {
            0%,
            100% {
              opacity: 1;
              box-shadow:
                0 0 0 0 rgba(255, 106, 0, 0.5);
            }

            50% {
              opacity: 0.4;
              box-shadow:
                0 0 0 6px rgba(255, 106, 0, 0);
            }
          }

          .ik-node {
            cursor: pointer;
          }

          .ik-lbl {
            font-family:
              ui-monospace,
              SFMono-Regular,
              Menlo,
              Monaco,
              Consolas,
              monospace;

            font-size: 11px;
            fill: #1b1a3b;
            letter-spacing: 0.06em;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
          }

          .ik-node:hover .ik-lbl {
            opacity: 1;
          }

          @media (max-width: 768px) {
            .ik-watermark {
              opacity: 0.045;
            }

            .ik-watermark-image {
              object-position: center center;
            }

            .ik-lbl {
              font-size: 9px;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .ik-watermark-image,
            .ik-blip {
              animation: none !important;
            }

            .ik-node:hover .ik-lbl {
              opacity: 1;
            }
          }
        `}
      </style>
    </footer>
  );
}