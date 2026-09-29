"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

import {
  FaInstagram,
  FaLinkedin,
  FaYoutube,
  FaFacebook,
  FaChevronRight,
} from "react-icons/fa";

import { useGetFooterQuery } from "@/lib/redux/api/Home/contentApi";

/* ⬇️ HEADER WALA SAME IMPORT PATTERN */
import { useTokenCheck } from "@/hooks/useTokenCheck";
import { getAppType, getDistributorDomain } from "@/lib/appConfig";

/* =========================================================
   FOOTER LINKS
========================================================= */

const coreLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/products" },
  { label: "Support", href: "/contact" },
];

const policyLinks = [
  { label: "Privacy policy", href: "/footer-policy/privacy-policy" },
  { label: "Terms of use", href: "/footer-policy/terms-of-use" },
  { label: "Cookie preferences", href: "/footer-policy/cookie-preferences" },
  {
    label: "Return & refund policy",
    href: "/footer-policy/return-refund-policy",
  },
  { label: "FAQs", href: "/footer-policy/FAQs" },
];

/* =========================================================
   ANIMATIONS
========================================================= */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.04,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

/* =========================================================
   FOOTER LINK
========================================================= */

function FooterLink({
  href,
  children,
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  const linkClasses = `
    group
    inline-flex
    items-center
    gap-1.5
    text-[13.5px]
    text-[#5C5B56]
    transition-colors
    duration-200
    hover:text-black
  `;

  const content = (
    <>
      <span className="relative">
        {children}
        <span
          className="
            absolute
            -bottom-1
            left-0
            h-[1px]
            w-0
            bg-black
            transition-all
            duration-300
            group-hover:w-full
          "
        />
      </span>

      <FaChevronRight
        aria-hidden
        className="
          text-[7px]
          text-[#5C5B56]
          opacity-0
          transition-all
          duration-200
          group-hover:translate-x-0.5
          group-hover:opacity-100
        "
      />
    </>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClasses}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={linkClasses}>
      {content}
    </Link>
  );
}

/* =========================================================
   CERTIFICATION MARK (API BASED)
========================================================= */

function CertBadge({
  src,
  alt,
  label,
  sublabel,
}: {
  src: string;
  alt: string;
  label: string;
  sublabel?: string | null;
}) {
  return (
    <div className="group flex shrink-0 items-center gap-3">
      <div className="flex h-[36px] w-[90px] shrink-0 items-center justify-center transition-transform duration-300 group-hover:scale-[1.05]">
        <Image
          src={src}
          alt={alt}
          width={110}
          height={40}
          className="h-10 w-auto max-w-[90px] object-contain"
          unoptimized
        />
      </div>

      <div className="flex flex-col leading-tight">
        <span className="text-[12px] font-semibold text-[#2A2A27]">
          {label}
        </span>
        {sublabel ? (
          <span className="text-[10.5px] text-[#9A968C]">{sublabel}</span>
        ) : null}
      </div>
    </div>
  );
}

/* =========================================================
   FOOTER
========================================================= */

export default function Footer() {
  const { data, isLoading } = useGetFooterQuery();

  const footer = data?.data?.footer;

  /* API se certifications (heritage_sites) */
  const heritageSites: {
    id: number;
    title: string;
    subtitle: string | null;
    image_url: string;
  }[] = data?.data?.heritage_sites?.data || [];

  /* =========================================================
     TOKEN / APP TYPE — EXACT SAME AS HEADER
  ========================================================= */

  const { hasToken, appType } = useTokenCheck();

  const currentAppType = typeof window !== "undefined" ? getAppType() : appType;

  const isDistributor = currentAppType === "distributor";

  /* =========================================================
     VISIBILITY RULES
     
     - No token            → visible
     - Customer token      → visible
     - Distributor token   → HIDDEN
  ========================================================= */

  const isDistributorLoggedIn = hasToken === true && isDistributor;

  const showDistributorLinks = !isDistributorLoggedIn;

  /* =========================================================
     DISTRIBUTOR APP URLS
  ========================================================= */

  const distributorDomain = getDistributorDomain();

  const joinUsUrl = `${distributorDomain}/auth/distributor/register/`;

  const brandPartnerUrl = `${distributorDomain}/auth/distributor/register/`;

  /* =========================================================
     DYNAMIC DISCOVER LINKS
  ========================================================= */

  const discoverLinks: {
    label: string;
    href: string;
    external?: boolean;
  }[] = [];

  if (showDistributorLinks) {
    discoverLinks.push({
      label: "Join us",
      href: joinUsUrl,
      external: true,
    });

    discoverLinks.push({
      label: "Become a brand partner",
      href: brandPartnerUrl,
      external: true,
    });
  }

  /* Always visible */
  discoverLinks.push({ label: "Catalogue", href: "/products" });

  /* =========================================================
     SOCIALS
  ========================================================= */

  const socials = [
    { icon: FaInstagram, label: "Instagram", href: footer?.instagram },
    { icon: FaLinkedin, label: "LinkedIn", href: footer?.linkedin },
    { icon: FaYoutube, label: "YouTube", href: footer?.youtube },
    { icon: FaFacebook, label: "Facebook", href: footer?.facebook },
  ].filter((s): s is typeof s & { href: string } => Boolean(s.href));

  return (
    <footer className="relative bg-white text-[#171717]">
      <div className="relative mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12">
        {/* ===================================================
            MAIN FOOTER GRID
        =================================================== */}

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={containerVariants}
          className="
            grid
            grid-cols-2
            gap-x-6
            gap-y-10
            py-14
            sm:grid-cols-2
            lg:grid-cols-[1.5fr_0.8fr_1fr_1fr_0.9fr]
            lg:gap-9
          "
        >
          {/* BRAND */}
          <motion.div
            variants={itemVariants}
            className="col-span-2 sm:col-span-2 lg:col-span-1"
          >
            <div className="relative mb-5 h-[64px] w-[210px]">
              {footer?.logo_url ? (
                <Image
                  src={footer.logo_url}
                  alt={footer?.title || "IndieKonnect"}
                  fill
                  sizes="210px"
                  priority
                  className="object-contain object-left"
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center text-[19px] font-semibold tracking-tight text-[#1A1A17]">
                  {isLoading ? "Loading..." : "IndieKonnect"}
                </div>
              )}
            </div>

            <p className="max-w-[290px] text-[13px] leading-6 text-[#6E6B63]">
              {footer?.title ||
                "Connecting India through opportunity and excellence. One nation, one network, endless possibilities."}
            </p>
          </motion.div>

          {/* EXPLORE */}
          <motion.div variants={itemVariants}>
            <h3 className="mb-4 text-[13px] font-semibold text-[#111111]">
              Explore
            </h3>
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
              {coreLinks.map((link) => (
                <li key={link.label}>
                  <FooterLink href={link.href}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* POLICIES */}
          <motion.div variants={itemVariants}>
            <h3 className="mb-4 text-[13px] font-semibold text-[#111111]">
              Policies
            </h3>
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
              {policyLinks.map((link) => (
                <li key={link.label}>
                  <FooterLink href={link.href}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* DISCOVER */}
          <motion.div variants={itemVariants}>
            <h3 className="mb-4 text-[13px] font-semibold text-[#111111]">
              Discover
            </h3>
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
              {discoverLinks.map((link) => (
                <li key={link.label}>
                  <FooterLink href={link.href} external={link.external}>
                    {link.label}
                  </FooterLink>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* FOLLOW */}
          <motion.div variants={itemVariants}>
            <h3 className="mb-4 text-[13px] font-semibold text-[#111111]">
              Follow us
            </h3>

            {socials.length > 0 ? (
              <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
                {socials.map(({ icon: Icon, label, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="
                        group
                        inline-flex
                        items-center
                        gap-2.5
                        text-[13px]
                        text-[#5C5B56]
                        transition-colors
                        duration-200
                        hover:text-black
                      "
                    >
                      <span
                        className="
                          flex
                          h-8
                          w-8
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          border
                          border-[#EAE7DE]
                          text-[#777771]
                          transition-colors
                          duration-200
                          group-hover:border-black
                          group-hover:bg-black
                          group-hover:text-white
                        "
                      >
                        <Icon aria-hidden className="text-[13px]" />
                      </span>
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[12px] text-[#AAAAAA]">
                {isLoading ? "Loading..." : "Coming soon"}
              </p>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* ===================================================
          CERTIFICATIONS — API BASED (heritage_sites)
          Full-width marquee (right → left, seamless loop)
      =================================================== */}

      {heritageSites.length > 0 && (
        <div className="border-t border-[#ECE9E1]">
          <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center sm:px-8 lg:px-12">
            <p className="shrink-0 text-[12px] text-[#6E6B63]">
              Recognised and certified by
            </p>

            {/* Marquee viewport — takes FULL remaining width */}
            <div className="relative w-full min-w-0 flex-1 overflow-hidden sm:ml-6">
              {/* fade edges */}
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-white to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-white to-transparent" />

              <motion.div
                className="flex w-max items-center gap-x-9"
                animate={{ x: ["0%", "-50%"] }}
                transition={{
                  duration: 22,
                  ease: "linear",
                  repeat: Infinity,
                }}
              >
                {/*
                  Render list TWICE for a seamless loop.
                  Combined with w-max + x: [0%, -50%],
                  the marquee fills full width with no gaps.
                */}
                {[...heritageSites, ...heritageSites].map((cert, i) => (
                  <CertBadge
                    key={`${cert.id}-${i}`}
                    src={cert.image_url}
                    alt={cert.title}
                    label={cert.title}
                    sublabel={cert.subtitle}
                  />
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================
          BOTTOM BAR
      =================================================== */}

      <div className="border-t border-[#ECE9E1]">
        <div
          className="
            mx-auto
            flex
            w-full
            max-w-[1440px]
            flex-col
            gap-2.5
            px-5
            py-5
            sm:px-8
            lg:flex-row
            lg:items-center
            lg:justify-between
            lg:px-12
          "
        >
          <p className="text-[11px] text-[#8B887F]">
            {footer?.copyright ||
              `© ${new Date().getFullYear()} IndieKonnect. All rights reserved.`}
          </p>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#8B887F]">
            <span className="inline-flex items-center gap-1.5 font-medium text-[#33332F]">
              <span
                aria-hidden
                className="flex h-[8px] w-[13px] overflow-hidden rounded-[2px] ring-1 ring-black/10"
              >
                <span className="w-1/3 bg-[#FF9933]" />
                <span className="w-1/3 bg-white" />
                <span className="w-1/3 bg-[#138808]" />
              </span>
              Made in India
            </span>

            <span
              aria-hidden
              className="hidden h-3 w-px bg-[#D3D0C8] sm:block"
            />

            <span>
              Marketed by{" "}
              <span className="font-medium text-[#555550]">
                {footer?.marketed_by || "Indie Konnect Pvt Ltd"}
              </span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
