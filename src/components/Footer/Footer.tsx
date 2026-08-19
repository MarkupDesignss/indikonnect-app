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

/* ─────────────────────────────────────────────
   STATIC CONFIG
   ───────────────────────────────────────────── */

const supportLinks = [
  { label: "Assistance", icon: LifeBuoy, href: "/footer-policy/Assistance" },
  { label: "FAQs", icon: HelpCircle, href: "/footer-policy/FAQs" },
  {
    label: "Returns & Refund",
    icon: RotateCcw,
    href: "/footer-policy/return-refund-policy",
  },
  { label: "Contact", icon: Headset, href: "/contact" },
];

const footerLinks = {
  Legal: [
    { label: "Privacy Policy", href: "/footer-policy/privacy-policy" },
    { label: "Terms of Use", href: "/footer-policy/terms-of-use" },
    { label: "Cookie Preferences", href: "/footer-policy/cookie-preferences" },
  ],
  "Quick Links": [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "/careers", tag: "Hiring" },
    { label: "Blog", href: "/blog" },
    { label: "Press Kit", href: "/press" },
  ],
};

const stats = [
  { value: "28", label: "States" },
  { value: "19K+", label: "Pin codes" },
  { value: "50K+", label: "Distributors" },
];

/* Network hubs — [x, y] in the 540×540 map viewBox */
const primaryHubs = [
  { name: "New Delhi", x: 179, y: 166, delay: "0s", anchor: "start" },
  { name: "Mumbai", x: 110, y: 318, delay: "0.7s", anchor: "start" },
  { name: "Bengaluru", x: 186, y: 417, delay: "1.4s", anchor: "end" },
  { name: "Kolkata", x: 358, y: 263, delay: "2.1s", anchor: "start" },
];

const secondaryHubs = [
  { name: "Chennai", x: 228, y: 415, anchor: "start" },
  { name: "Hyderabad", x: 200, y: 346, anchor: "start" },
  { name: "Ahmedabad", x: 106, y: 256, anchor: "start" },
  { name: "Guwahati", x: 411, y: 206, anchor: "end" },
  { name: "Lucknow", x: 238, y: 195, anchor: "start" },
  { name: "Kochi", x: 165, y: 466, anchor: "end" },
];

const routes = [
  { d: "M179,166 Q275,175 358,263", dur: "4.5s", packet: true },
  { d: "M179,166 Q108,235 110,318", dur: "5.4s", packet: true },
  { d: "M110,318 Q120,395 186,417", dur: "4.9s", packet: true },
  { d: "M186,417 Q207,395 228,415", dur: "3.6s" },
  { d: "M358,263 Q395,220 411,206", dur: "3.9s", packet: true },
  { d: "M179,166 Q120,195 106,256", dur: "5.1s" },
  { d: "M200,346 Q232,375 228,415", dur: "4.2s" },
  { d: "M110,318 Q95,285 106,256", dur: "3.4s" },
];

const INDIA_PATH =
  "M176,56 L200,64 L216,80 L208,104 L240,138 L272,155 L304,176 L352,189 L376,197 L416,184 L472,168 L496,176 L488,192 L501,232 L456,240 L440,264 L421,272 L410,253 L392,221 L381,219 L363,203 L355,232 L363,248 L368,272 L336,278 L328,302 L304,312 L288,331 L264,352 L238,368 L229,414 L221,442 L222,459 L206,477 L195,482 L184,494 L168,472 L157,440 L141,408 L120,370 L110,320 L106,288 L110,278 L96,285 L61,265 L48,259 L64,248 L35,243 L45,235 L72,227 L75,181 L104,168 L126,146 L136,128 L144,104 L128,80 L144,64 L168,51 Z";

/* ─────────────────────────────────────────────
   INDIA NETWORK MAP
   ───────────────────────────────────────────── */

function IndiaNetwork() {
  return (
    <svg
      viewBox="0 0 540 540"
      className="block h-auto w-full overflow-visible"
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
          <circle cx="4.7" cy="4.7" r="1.55" fill="#1B1A3B" opacity="0.16" />
        </pattern>

        <radialGradient id="ikHaze" cx="42%" cy="42%" r="62%">
          <stop offset="0%" stopColor="#FF8A2B" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#FF8A2B" stopOpacity="0" />
        </radialGradient>

        <filter id="ikSoft" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="13" />
        </filter>

        <filter id="ikGlow" x="-160%" y="-160%" width="420%" height="420%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <path id="ikIndia" d={INDIA_PATH} />
      </defs>

      {/* ambient haze */}
      <use
        href="#ikIndia"
        fill="url(#ikHaze)"
        filter="url(#ikSoft)"
        opacity="0.9"
      />
      {/* dot-matrix landmass */}
      <use href="#ikIndia" fill="url(#ikDots)" />
      {/* coastline */}
      <use
        href="#ikIndia"
        fill="none"
        stroke="#E8590C"
        strokeWidth="1.1"
        strokeLinejoin="round"
        opacity="0.4"
      />

      {/* Andaman & Nicobar + Lakshadweep */}
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

      {/* routes */}
      <g
        fill="none"
        stroke="#E8590C"
        strokeWidth="1.2"
        opacity="0.4"
        strokeDasharray="5 7"
      >
        {routes.map((r, i) => (
          <path key={i} d={r.d}>
            <animate
              attributeName="stroke-dashoffset"
              from="0"
              to="-120"
              dur={r.dur}
              repeatCount="indefinite"
            />
          </path>
        ))}
      </g>

      {/* travelling packets */}
      <g fill="#FF8A2B" filter="url(#ikGlow)">
        {routes
          .filter((r) => r.packet)
          .map((r, i) => (
            <circle key={i} r="2.8">
              <animateMotion
                dur={r.dur}
                begin={`${i * 0.55}s`}
                repeatCount="indefinite"
                path={r.d}
              />
            </circle>
          ))}
      </g>

      {/* primary hubs */}
      {primaryHubs.map((h) => (
        <g key={h.name} className="ik-node">
          <circle cx={h.x} cy={h.y} r="16" fill="transparent" />
          <circle
            cx={h.x}
            cy={h.y}
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
              begin={h.delay}
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.85;0"
              dur="2.8s"
              begin={h.delay}
              repeatCount="indefinite"
            />
          </circle>
          <circle
            className="ik-core"
            cx={h.x}
            cy={h.y}
            r="4.8"
            fill="#FF6A00"
            filter="url(#ikGlow)"
          />
          <text
            className="ik-lbl"
            x={h.anchor === "end" ? h.x - 12 : h.x + 12}
            y={h.y - 9}
            textAnchor={h.anchor}
          >
            {h.name}
          </text>
        </g>
      ))}

      {/* secondary hubs */}
      {secondaryHubs.map((h) => (
        <g key={h.name} className="ik-node">
          <circle cx={h.x} cy={h.y} r="14" fill="transparent" />
          <circle
            className="ik-core"
            cx={h.x}
            cy={h.y}
            r="3.8"
            fill="#1B1A3B"
            opacity="0.55"
          />
          <text
            className="ik-lbl"
            x={h.anchor === "end" ? h.x - 10 : h.x + 10}
            y={h.y - 8}
            textAnchor={h.anchor}
          >
            {h.name}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* ─────────────────────────────────────────────
   FOOTER
   ───────────────────────────────────────────── */

export default function Footer() {
  const { data, isLoading } = useGetFooterQuery();
  const footer = data?.data?.footer;

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.09, delayChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const socials = [
    { icon: FaInstagram, label: "Instagram", href: footer?.instagram },
    { icon: FaFacebook, label: "Facebook", href: footer?.facebook },
    { icon: FaLinkedin, label: "LinkedIn", href: footer?.linkedin },
    { icon: FaTwitter, label: "Twitter", href: footer?.twitter },
    { icon: FaYoutube, label: "YouTube", href: footer?.youtube },
  ].filter((s) => !!s.href);

  return (
    <footer className="ik-footer relative overflow-hidden bg-[#faf8f6] text-[#1B1A3B]">
      {/* ── atmosphere ── */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1000px_520px_at_85%_0%,rgba(255,138,43,0.10),transparent_60%),radial-gradient(760px_420px_at_8%_100%,rgba(27,26,59,0.04),transparent_60%)]" />

      {/* Glossy overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/40 via-white/20 to-white/60" />

      {/* Shine effect */}
      <div className="pointer-events-none absolute -inset-full rotate-12 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-30" />

      <div className="ik-grain pointer-events-none absolute inset-0 z-[5]" />
      {/* top hairline gradient */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FF8A2B]/30 to-transparent" />

      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12">
        {/* ══════ RIBBON ══════ */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
          className="flex flex-wrap items-center justify-between gap-8 border-b border-[#1B1A3B]/[0.06] py-10 md:py-14"
        >
          <motion.div variants={itemVariants} className="max-w-2xl">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-7 bg-[#FF6A00]/60" />
              <span className="ik-mono text-[10px] uppercase tracking-[0.24em] text-[#E8590C] font-semibold">
                Connect Beyond Boundaries
              </span>
            </div>

            <h2 className="ik-display text-[clamp(22px,2.8vw,36px)] font-semibold leading-[1.15] tracking-[-0.025em] text-[#1B1A3B]">
              One nation. One network.
              <br />
              <em className="bg-gradient-to-r from-[#FF6A00] via-[#FFA94D] to-[#E8590C] bg-clip-text not-italic font-normal italic text-transparent">
                {footer?.quote1 || "Endless possibilities."}
              </em>
            </h2>
          </motion.div>
        </motion.div>

        {/* ══════ MAIN GRID ══════ */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.12 }}
          variants={containerVariants}
          className="grid grid-cols-1 gap-10 py-12 md:grid-cols-2 lg:grid-cols-[1.3fr_0.85fr_0.9fr_1fr] lg:gap-12 lg:py-16"
        >
          {/* ── Brand ── */}
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
                  {isLoading ? "Loading…" : "IndieKonnect"}
                </div>
              )}
            </div>

            <p className="mb-7 max-w-[330px] text-[15px] font-semibold leading-[1.72] text-[#1b1a3b]">
              {footer?.title ||
                "Connecting India through opportunity and excellence — a single network linking makers, brands and buyers across every state, city and pin code."}
            </p>

            <div className="mb-7 flex flex-col gap-2.5">
              {footer?.email && (
                <a
                  href={`mailto:${footer.email}`}
                  className="ik-mono flex w-fit items-center gap-2.5 text-[12.5px] text-[#1B1A3B]/80 transition-colors hover:text-[#E8590C]"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {footer.email}
                </a>
              )}
              {footer?.phone && (
                <a
                  href={`tel:${footer.phone.replace(/\s/g, "")}`}
                  className="ik-mono flex w-fit items-center gap-2.5 text-[12.5px] text-[#1B1A3B]/80 transition-colors hover:text-[#E8590C]"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {footer.phone}
                </a>
              )}
              {footer?.location && (
                <span className="ik-mono flex w-fit items-center gap-2.5 text-[12.5px] text-[#1B1A3B]/80">
                  <MapPin className="h-3.5 w-3.5" />
                  {footer.location}
                </span>
              )}
            </div>

            <div className="flex gap-2.5">
              {socials.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="grid h-[39px] w-[39px] place-items-center rounded-full border border-[#1B1A3B]/[0.08] bg-white/80 text-[#1B1A3B]/55 shadow-[0_2px_8px_rgba(27,26,59,0.06)] transition-all duration-500 hover:-translate-y-1 hover:border-[#FF8A2B]/40 hover:bg-[#FFF4E8] hover:text-[#E8590C] hover:shadow-[0_12px_28px_rgba(232,89,12,0.14)]"
                >
                  <Icon className="h-[15px] w-[15px]" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* ── Support ── */}
          <motion.div variants={itemVariants}>
            <h3 className="ik-mono mb-5 flex justify-between border-b border-[#1B1A3B]/[0.06] pb-4 text-[12px] font-bold uppercase tracking-[0.24em] text-[#1B1A3B]/80">
              Support <span className="not-italic text-[#E8590C]/75">01</span>
            </h3>
            <ul className="flex flex-col">
              {supportLinks.map(({ label, icon: Icon, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="group flex items-center gap-2.5 py-2 text-[14.5px] font-medium text-[#1B1A3B] transition-all duration-300 hover:text-[#E8590C] hover:translate-x-2"
                  >
                    <Icon className="h-3.5 w-3.5 text-[#FF8A2B] transition-colors group-hover:text-[#E8590C]" />
                    {label}
                  </Link>
                </li>
              ))}
              {footer?.phone && (
                <li>
                  <a
                    href={`tel:${footer.phone.replace(/\s/g, "")}`}
                    className="group flex items-center gap-2.5 py-2 text-[14.5px] font-semibold text-[#E8590C] transition-all duration-300 hover:translate-x-2"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    Talk to Us
                  </a>
                </li>
              )}
            </ul>
          </motion.div>

          {/* ── Legal + Quick Links ── */}
          <motion.div variants={itemVariants}>
            {Object.entries(footerLinks).map(([category, links], ci) => (
              <div key={category} className={ci > 0 ? "mt-8" : ""}>
                <h3 className="ik-mono mb-5 flex justify-between border-b border-[#1B1A3B]/[0.06] pb-4 text-[12px] font-bold uppercase tracking-[0.24em] text-[#1B1A3B]/80">
                  {category}
                  <span className="text-[#E8590C]/75">
                    {String(ci + 2).padStart(2, "0")}
                  </span>
                </h3>
                <ul className="flex flex-col">
                  {links.map(({ label, href, tag }) => (
                    <li key={label}>
                      <Link
                        href={href}
                        className="group flex items-center gap-2 py-2 text-[14.5px] font-medium text-[#1B1A3B] transition-all duration-300 hover:text-[#E8590C] hover:translate-x-2"
                      >
                        <span className="h-1 w-1 scale-0 rounded-full bg-[#E8590C] opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100" />
                        {label}
                        {tag && (
                          <span className="ik-mono rounded-[3px] bg-[#FFF0DE] px-1.5 py-0.5 text-[8.5px] uppercase tracking-[0.12em] text-[#E8590C] font-semibold">
                            {tag}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </motion.div>

          {/* ── India Network Map ── */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-2 lg:col-span-1"
          >
            <div className="rounded-2xl border border-[#1B1A3B]/[0.06] bg-white/70 p-5 shadow-[0_2px_12px_rgba(27,26,59,0.06),0_20px_48px_-24px_rgba(27,26,59,0.12)] backdrop-blur-sm">
              <div className="mb-4 flex items-center justify-between border-b border-[#1B1A3B]/[0.06] pb-4">
                <h3 className="ik-mono text-[10.5px] font-semibold uppercase tracking-[0.24em] text-[#1B1A3B]/80">
                  The Network
                </h3>
                <span className="ik-mono flex items-center gap-1.5 text-[9.5px] uppercase tracking-[0.16em] text-[#E8590C] font-semibold">
                  <span className="ik-blip h-[5px] w-[5px] rounded-full bg-[#FF6A00]" />
                  Live
                </span>
              </div>

              <div className="mx-auto max-w-[420px]">
                <IndiaNetwork />
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2.5 border-t border-[#1B1A3B]/[0.06] pt-5">
                {stats.map((s) => (
                  <div key={s.label}>
                    <b className="ik-display block text-[22px] font-semibold tracking-[-0.03em] text-[#1B1A3B]">
                      {s.value}
                    </b>
                    <span className="ik-mono text-[9px] uppercase tracking-[0.15em] text-[#1B1A3B]/80">
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* ══════ BASE BAR ══════ */}
      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col items-start justify-between gap-5 border-t border-[#1B1A3B]/[0.06] py-6 sm:flex-row sm:items-center">
          <p className="text-[12.5px] font-medium text-[#1B1A3B]/70">
            {footer?.copyright ||
              `© ${new Date().getFullYear()} IndieKonnect Pvt. Ltd. — All rights reserved.`}
          </p>

          <div className="flex flex-wrap items-center gap-5">
            <Link
              href="/footer-policy/privacy-policy"
              className="text-[12.5px] font-medium text-[#1B1A3B]/70 transition-colors hover:text-[#E8590C]"
            >
              Privacy
            </Link>
            <Link
              href="/footer-policy/terms-of-use"
              className="text-[12.5px] font-medium text-[#1B1A3B]/70 transition-colors hover:text-[#E8590C]"
            >
              Terms
            </Link>

            <span className="flex items-center gap-2.5 text-[12.5px] font-medium text-[#1B1A3B]/70">
              <span className="flex h-[3px] w-[26px] overflow-hidden rounded-sm shadow-sm">
                <i className="flex-1 bg-[#FF9933]" />
                <i className="flex-1 bg-[#FFFFFF]" />
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
              onClick={scrollToTop}
              aria-label="Scroll to top"
              className="group grid h-9 w-9 place-items-center rounded-full border border-[#1B1A3B]/[0.08] bg-white/80 text-[#1B1A3B]/55 shadow-[0_2px_8px_rgba(27,26,59,0.06)] transition-all duration-500 hover:border-[#FF8A2B]/40 hover:bg-[#FFF4E8] hover:text-[#E8590C] hover:shadow-[0_12px_28px_rgba(232,89,12,0.14)]"
            >
              <ArrowUp className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ══════ SCOPED STYLES ══════ */}
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap");

        .ik-display {
          font-family: "Bricolage Grotesque", ui-serif, Georgia, serif;
        }
        .ik-mono {
          font-family: "JetBrains Mono", ui-monospace, monospace;
        }

        .ik-grain {
          opacity: 0.025;
          mix-blend-mode: multiply;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }

        .ik-blip {
          animation: ikBlip 1.9s ease-in-out infinite;
        }
        @keyframes ikBlip {
          0%,
          100% {
            opacity: 1;
            box-shadow: 0 0 0 0 rgba(255, 106, 0, 0.5);
          }
          50% {
            opacity: 0.4;
            box-shadow: 0 0 0 6px rgba(255, 106, 0, 0);
          }
        }

        .ik-node {
          cursor: pointer;
        }
        .ik-lbl {
          font-family: "JetBrains Mono", ui-monospace, monospace;
          font-size: 11px;
          fill: #1b1a3b;
          letter-spacing: 0.06em;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s;
        }
        .ik-core {
          transition: r 0.3s;
        }
        .ik-node:hover .ik-lbl {
          opacity: 1;
        }
        .ik-node:hover .ik-core {
          r: 5.4;
        }

        @media (prefers-reduced-motion: reduce) {
          .ik-footer *,
          .ik-footer *::before,
          .ik-footer *::after {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </footer>
  );
}
