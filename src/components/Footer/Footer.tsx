"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { FaInstagram, FaLinkedin, FaYoutube, FaFacebook } from "react-icons/fa";
import { useGetFooterQuery } from "@/lib/redux/api/Home/contentApi";

const coreLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Support", href: "/footer-policy/Assistance" },
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
  { label: "Join US", href: "#" },
  { label: "Become a Brand Partner", href: "#" },
  { label: "Catalogue", href: "#" },
  { label: "Investor Relations", href: "#" },
];

export default function Footer() {
  const { data, isLoading } = useGetFooterQuery();

  const footer = data?.data?.footer;

  const socials = [
    { icon: FaInstagram, label: "Instagram", href: footer?.instagram },
    { icon: FaLinkedin, label: "LinkedIn", href: footer?.linkedin },
    { icon: FaYoutube, label: "Youtube", href: footer?.youtube },
    { icon: FaFacebook, label: "Facebook", href: footer?.facebook },
  ].filter((social): social is typeof social & { href: string } =>
    Boolean(social.href),
  );

  /* =======================================================
     MOTION
  ======================================================= */

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.07, delayChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <footer className="relative overflow-hidden border-t border-[#E4E4E2] bg-white font-sans text-[#171717]">
      {/* =====================================================
          MAIN CONTAINER
      ===================================================== */}

      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={containerVariants}
          className="grid grid-cols-1 gap-10 py-16 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_1fr_1fr_0.9fr]"
        >
          {/* =================================================
              BRAND
          ================================================= */}

          <motion.div variants={itemVariants}>
            <div className="relative mb-5 h-[72px] w-[220px]">
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
                <div className="flex h-full items-center text-[13px] text-[#999999]">
                  {isLoading ? "Loading..." : "IndieKonnect"}
                </div>
              )}
            </div>

            <p className="max-w-[280px] text-[13px] leading-[1.7] text-[#666666]">
              {footer?.title ||
                "Connecting India through opportunity and excellence. One nation, one network, endless possibilities."}
            </p>
          </motion.div>

          {/* =================================================
              CORE
          ================================================= */}

          <motion.div variants={itemVariants}>
            <h3 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#111111]">
              Core
            </h3>

            <ul className="m-0 flex flex-col gap-3 p-0">
              {coreLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[13px] text-[#666666] underline decoration-transparent underline-offset-4 transition-all duration-200 hover:text-[#111111] hover:decoration-[#111111]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* =================================================
              POLICIES
          ================================================= */}

          <motion.div variants={itemVariants}>
            <h3 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#111111]">
              Policies
            </h3>

            <ul className="m-0 flex flex-col gap-3 p-0">
              {policyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[13px] text-[#666666] underline decoration-transparent underline-offset-4 transition-all duration-200 hover:text-[#111111] hover:decoration-[#111111]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* =================================================
              DISCOVER
          ================================================= */}

          <motion.div variants={itemVariants}>
            <h3 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#111111]">
              Discover
            </h3>

            <ul className="m-0 flex flex-col gap-3 p-0">
              {discoverLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[13px] text-[#666666] underline decoration-transparent underline-offset-4 transition-all duration-200 hover:text-[#111111] hover:decoration-[#111111]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* =================================================
              FOLLOW US
          ================================================= */}

          <motion.div variants={itemVariants}>
            <h3 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#111111]">
              Follow Us
            </h3>

            <ul className="m-0 flex flex-col gap-3 p-0">
              {socials.length > 0 ? (
                socials.map(({ label, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[13px] text-[#666666] underline decoration-transparent underline-offset-4 transition-all duration-200 hover:text-[#111111] hover:decoration-[#111111]"
                    >
                      {label}
                    </a>
                  </li>
                ))
              ) : (
                <li className="text-[13px] text-[#AAAAAA]">
                  {isLoading ? "Loading..." : "Coming soon"}
                </li>
              )}
            </ul>
          </motion.div>
        </motion.div>
      </div>

      {/* =====================================================
          BOTTOM BAR
      ===================================================== */}

      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-3 border-t border-[#E4E4E2] py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="whitespace-nowrap text-[11px] text-[#888888]">
            {footer?.copyright ||
              `© ${new Date().getFullYear()} IndieKonnect. All rights reserved.`}
          </p>

          <p className="whitespace-nowrap text-[11px] text-[#888888]">
            <span className="font-semibold text-[#171717]">Made In India</span>{" "}
            &nbsp;Marketed By: {footer?.marketed_by || "Indie Konnect Pvt Ltd"}
          </p>
        </div>
      </div>
    </footer>
  );
}
