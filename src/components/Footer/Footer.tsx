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

import Msmelogo from "../../../public/indiekonnect-web/images/msme.png";
import Startuplogo from "../../../public/indiekonnect-web/images/startup.png";
import Fccilogo from "../../../public/indiekonnect-web/images/ficci.webp";
import Isologo from "../../../public/indiekonnect-web/images/iso.png";

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

const discoverLinks = [
  { label: "Join us", href: "#" },
  { label: "Become a brand partner", href: "#" },
  { label: "Catalogue", href: "/products" },
  { label: "Investor relations", href: "#" },
];

/* =========================================================
   CERTIFICATIONS DATA
========================================================= */

const certifications = [
  {
    src: Isologo,
    alt: "ISO 9001:2015 Certified",
    label: "ISO 9001:2015",
    sublabel: "Quality Management",
    imgClassName: "h-9 w-auto object-contain",
    imgWidth: 100,
    imgHeight: 36,
  },
  {
    src: Msmelogo,
    alt: "MSME, Government of India",
    label: "MSME",
    sublabel: "Govt. of India",
    imgClassName: "h-10 w-auto object-contain",
    imgWidth: 110,
    imgHeight: 40,
  },
  {
    src: Startuplogo,
    alt: "Startup India",
    label: "Startup India",
    sublabel: "DPIIT Recognised",
    imgClassName: "h-9 w-auto object-contain",
    imgWidth: 110,
    imgHeight: 40,
  },
  {
    src: Fccilogo,
    alt: "FICCI",
    label: "FICCI",
    sublabel: "Member",
    imgClassName: "h-7 w-auto object-contain",
    imgWidth: 110,
    imgHeight: 40,
  },
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
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="
        group
        inline-flex
        items-center
        gap-1.5
        text-[13.5px]
        text-[#5C5B56]
        transition-colors
        duration-200
        hover:text-black
      "
    >
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
    </Link>
  );
}

/* =========================================================
   CERTIFICATION MARK
========================================================= */

function CertBadge({
  src,
  alt,
  label,
  sublabel,
  imgClassName = "h-10 w-auto object-contain",
  imgWidth = 110,
  imgHeight = 40,
}: {
  src: any;
  alt: string;
  label: string;
  sublabel?: string;
  imgClassName?: string;
  imgWidth?: number;
  imgHeight?: number;
}) {
  return (
    <div className="group flex shrink-0 items-center gap-3">
      <div className="flex h-[36px] shrink-0 items-center justify-center transition-transform duration-300 group-hover:scale-[1.05]">
        <Image
          src={src}
          alt={alt}
          width={imgWidth}
          height={imgHeight}
          className={imgClassName}
        />
      </div>

      <div className="flex flex-col leading-tight">
        <span className="text-[12px] font-medium text-[#2A2A27]">{label}</span>
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
                  <FooterLink href={link.href}>{link.label}</FooterLink>
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
          CERTIFICATIONS — compact marquee row (right → left)
      =================================================== */}

      <div className="border-t border-[#ECE9E1]">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center sm:px-8 lg:px-12">
          <p className="shrink-0 text-[12px] text-[#6E6B63]">
            Recognised and certified by
          </p>

          {/* Marquee viewport */}
          <div className="relative w-full overflow-hidden sm:ml-6">
            {/* fade edges */}
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-white to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 bg-gradient-to-l from-white to-transparent" />

            <motion.div
              className="flex w-max items-center gap-x-9"
              animate={{ x: ["0%", "-50%"] }}
              transition={{
                duration: 22,
                ease: "linear",
                repeat: Infinity,
              }}
            >
              {/* Render list twice for seamless loop */}
              {[...certifications, ...certifications].map((cert, i) => (
                <CertBadge
                  key={`${cert.label}-${i}`}
                  src={cert.src}
                  alt={cert.alt}
                  label={cert.label}
                  sublabel={cert.sublabel}
                  imgClassName={cert.imgClassName}
                  imgWidth={cert.imgWidth}
                  imgHeight={cert.imgHeight}
                />
              ))}
            </motion.div>
          </div>
        </div>
      </div>

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