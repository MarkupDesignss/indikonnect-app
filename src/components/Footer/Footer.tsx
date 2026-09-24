
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

/* =========================================================
   FOOTER LINKS
========================================================= */

const coreLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/products" },
  { label: "Support", href: "/contact" },
];

const policyLinks = [
  { label: "Privacy Policy", href: "/footer-policy/privacy-policy" },
  { label: "Terms of Use", href: "/footer-policy/terms-of-use" },
  { label: "Cookie Preferences", href: "/footer-policy/cookie-preferences" },
  {
    label: "Return & Refund Policy",
    href: "/footer-policy/return-refund-policy",
  },
  { label: "FAQs", href: "/footer-policy/FAQs" },
];

const discoverLinks = [
  { label: "Join Us", href: "#" },
  { label: "Become a Brand Partner", href: "#" },
  { label: "Catalogue", href: "/products" },
  { label: "Investor Relations", href: "#" },
];

/* =========================================================
   ANIMATIONS
========================================================= */

const containerVariants = {
  hidden: { opacity: 0 },

  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.03,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 10,
  },

  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
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
        text-[13px]
        text-[#666661]
        transition-all
        duration-300
        hover:translate-x-1
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
          opacity-0
          transition-all
          duration-300
          group-hover:translate-x-0.5
          group-hover:opacity-100
        "
      />
    </Link>
  );
}

/* =========================================================
   FOOTER
========================================================= */

export default function Footer() {
  const { data, isLoading } = useGetFooterQuery();

  const footer = data?.data?.footer;

  const socials = [
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
      icon: FaYoutube,
      label: "YouTube",
      href: footer?.youtube,
    },
    {
      icon: FaFacebook,
      label: "Facebook",
      href: footer?.facebook,
    },
  ].filter(
    (s): s is typeof s & { href: string } => Boolean(s.href)
  );

  return (
    <footer className="relative overflow-hidden bg-white text-[#171717]">

      {/* =====================================================
          BACKGROUND EFFECTS
      ===================================================== */}

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          className="
            absolute
            -left-[180px]
            -top-[180px]
            h-[380px]
            w-[380px]
            rounded-full
            bg-[#F5A623]/[0.035]
            blur-[95px]
          "
        />

        <div
          className="
            absolute
            right-[-180px]
            top-[100px]
            h-[360px]
            w-[360px]
            rounded-full
            bg-[#138808]/[0.018]
            blur-[105px]
          "
        />

        <div
          className="
            absolute
            bottom-[-180px]
            left-[35%]
            h-[380px]
            w-[380px]
            rounded-full
            bg-[#F5A623]/[0.018]
            blur-[110px]
          "
        />
      </div>

      {/* =====================================================
          INDIA ACCENT LINE
      ===================================================== */}

  

      {/* =====================================================
          MAIN CONTAINER
      ===================================================== */}

      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12">

        {/* ===================================================
            MAIN FOOTER GRID
        =================================================== */}

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
            amount: 0.08,
          }}
          variants={containerVariants}
          className="
            grid
            grid-cols-2
            gap-x-6
            gap-y-9
            pb-14
            pt-16
            sm:grid-cols-2
            lg:grid-cols-[1.6fr_0.8fr_1fr_1fr_0.9fr]
            lg:gap-9
          "
        >

          {/* =================================================
              BRAND
          ================================================= */}

          <motion.div
            variants={itemVariants}
            className="col-span-2 sm:col-span-2 lg:col-span-1"
          >
            <div className="relative mb-3 h-[52px] w-[170px]">
              {footer?.logo_url ? (
                <Image
                  src={footer.logo_url}
                  alt={footer?.title || "IndieKonnect"}
                  fill
                  sizes="170px"
                  priority
                  className="object-contain object-left"
                />
              ) : (
                <div className="flex h-full items-center text-[12px] text-[#999999]">
                  {isLoading ? "Loading..." : "IndieKonnect"}
                </div>
              )}
            </div>

            <p className="max-w-[300px] text-[12px] leading-5.5 text-[#666661]">
              {footer?.title ||
                "Connecting India through opportunity and excellence. One nation, one network, endless possibilities."}
            </p>

            {/* =================================================
                TRUST ROW
            ================================================= */}

            <div className="mt-6">
              <p
                className="
                  mb-2
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.2em]
                  text-[#9A968C]
                "
              >
                Recognised &amp; Certified
              </p>

              <div className="flex flex-wrap items-center gap-3">

                {/* =================================================
                    MSME LOGO — INCREASED SIZE
                ================================================= */}

                <div
                  className="
                    flex
                    h-[58px]
                    items-center
                    justify-center
                    rounded-lg
                    border
                    border-[#E8E5DC]
                    bg-white
                    px-4
                    shadow-[0_2px_8px_rgba(0,0,0,0.03)]
                    transition-all
                    duration-300
                    hover:border-black/30
                    hover:shadow-[0_6px_16px_rgba(0,0,0,0.08)]
                  "
                >
                  <Image
                    src={Msmelogo}
                    alt="MSME, Government of India"
                    width={115}
                    height={42}
                    className="h-[42px] w-auto object-contain"
                  />
                </div>

                {/* =================================================
                    STARTUP INDIA LOGO — INCREASED SIZE
                ================================================= */}

                <div
                  className="
                    flex
                    h-[58px]
                    items-center
                    justify-center
                    rounded-lg
                    border
                    border-[#E8E5DC]
                    bg-white
                    px-4
                    shadow-[0_2px_8px_rgba(0,0,0,0.03)]
                    transition-all
                    duration-300
                    hover:border-black/30
                    hover:shadow-[0_6px_16px_rgba(0,0,0,0.08)]
                  "
                >
                  <Image
                    src={Startuplogo}
                    alt="Startup India"
                    width={115}
                    height={42}
                    className="h-[40px] w-auto object-contain"
                  />
                </div>

              </div>
            </div>
          </motion.div>

          {/* =================================================
              EXPLORE
          ================================================= */}

          <motion.div variants={itemVariants}>
            <h3
              className="
                mb-3.5
                text-[10px]
                font-bold
                uppercase
                tracking-[0.18em]
                text-[#111111]
              "
            >
              Explore
            </h3>

            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {coreLinks.map((link) => (
                <li key={link.label}>
                  <FooterLink href={link.href}>
                    {link.label}
                  </FooterLink>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* =================================================
              POLICIES
          ================================================= */}

          <motion.div variants={itemVariants}>
            <h3
              className="
                mb-3.5
                text-[10px]
                font-bold
                uppercase
                tracking-[0.18em]
                text-[#111111]
              "
            >
              Policies
            </h3>

            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {policyLinks.map((link) => (
                <li key={link.label}>
                  <FooterLink href={link.href}>
                    {link.label}
                  </FooterLink>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* =================================================
              DISCOVER
          ================================================= */}

          <motion.div variants={itemVariants}>
            <h3
              className="
                mb-3.5
                text-[10px]
                font-bold
                uppercase
                tracking-[0.18em]
                text-[#111111]
              "
            >
              Discover
            </h3>

            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {discoverLinks.map((link) => (
                <li key={link.label}>
                  <FooterLink href={link.href}>
                    {link.label}
                  </FooterLink>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* =================================================
              SOCIAL — VERTICAL LAYOUT WITH LABELS
          ================================================= */}

          <motion.div variants={itemVariants}>
            <h3
              className="
                mb-3.5
                text-[10px]
                font-bold
                uppercase
                tracking-[0.18em]
                text-[#111111]
              "
            >
              Follow Us
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
                        text-[12px]
                        text-[#666661]
                        transition-all
                        duration-300
                        hover:translate-x-1
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
                          border-[#E4E1D8]
                          bg-white
                          text-[#777771]
                          shadow-[0_3px_14px_rgba(0,0,0,0.025)]
                          transition-all
                          duration-300
                          group-hover:border-black
                          group-hover:bg-black
                          group-hover:text-white
                          group-hover:shadow-[0_8px_20px_rgba(0,0,0,0.25)]
                        "
                      >
                        <Icon
                          aria-hidden
                          className="
                            text-[13px]
                            transition-transform
                            duration-300
                            group-hover:scale-110
                          "
                        />
                      </span>

                      <span className="relative">
                        {label}

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
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[11px] text-[#AAAAAA]">
                {isLoading ? "Loading..." : "Coming soon"}
              </p>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* =====================================================
          BOTTOM BAR
      ===================================================== */}

      <div className="relative z-10 border-t border-[#E8E6E0] bg-white">
        <div
          className="
            mx-auto
            flex
            w-full
            max-w-[1440px]
            flex-col
            gap-2
            px-5
            py-5
            sm:px-8
            lg:flex-row
            lg:items-center
            lg:justify-between
            lg:px-12
          "
        >
          <p className="text-[10px] leading-5 text-[#888882]">
            {footer?.copyright ||
              `© ${ new Date().getFullYear() } IndieKonnect.All rights reserved.`}
          </p>

          <div
            className="
              flex
              flex-wrap
              items-center
              gap-x-3
              gap-y-1
              text-[10px]
              text-[#888882]
            "
          >
            <span
              className="
                inline-flex
                items-center
                gap-1.5
                font-semibold
                text-[#33332F]
              "
            >
              <span
                aria-hidden
                className="
                  flex
                  h-[8px]
                  w-[13px]
                  overflow-hidden
                  rounded-[2px]
                  shadow-sm
                  ring-1
                  ring-black/10
                "
              >
                <span className="w-1/3 bg-[#FF9933]" />
                <span className="w-1/3 bg-white" />
                <span className="w-1/3 bg-[#138808]" />
              </span>

              Made in India
            </span>

            <span
              aria-hidden
              className="
                hidden
                h-3
                w-px
                bg-[#D3D0C8]
                sm:block
              "
            />

            <span>
              Marketed By:{" "}
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
