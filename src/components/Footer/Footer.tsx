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
  { label: "Return & Refund Policy", href: "/footer-policy/return-refund-policy" },
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
  ].filter(
    (social): social is typeof social & { href: string } =>
      Boolean(social.href),
  );

  /* =======================================================
     MOTION
  ======================================================= */

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <footer className="relative overflow-hidden bg-[#faf2e7] font-['Poppins',sans-serif] text-[#1B1A3B]">
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-[#faf2e7]/95 via-[#faf2e7]/88 to-[#faf2e7]/96" />

      {/* =====================================================
          MAIN CONTAINER
      ===================================================== */}

      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={containerVariants}
          className="grid grid-cols-1 gap-10 py-20 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_1fr_1fr_0.9fr]"
        >
          {/* =================================================
              BRAND
          ================================================= */}

          <motion.div variants={itemVariants}>
            <div className="relative mb-6 h-[104px] w-[260px]">
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

            <p className="max-w-[280px] text-[15px] font-medium leading-[1.75] text-[#1B1A3B]/75">
              {footer?.title ||
                "Connecting India through opportunity and excellence. One nation, one network, endless possibilities."}
            </p>
          </motion.div>

          {/* =================================================
              CORE
          ================================================= */}

          <motion.div variants={itemVariants}>
            <h3 className="mb-6 text-[15px] font-bold uppercase tracking-[0.08em] text-[#1B1A3B]">
              Core
            </h3>

            <ul className="m-0 flex flex-col gap-4 p-0">
              {coreLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[15px] font-medium text-[#1B1A3B]/85 transition-colors duration-300 hover:text-[#E8590C]"
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
            <h3 className="mb-6 text-[15px] font-bold uppercase tracking-[0.08em] text-[#1B1A3B]">
              Policies
            </h3>

            <ul className="m-0 flex flex-col gap-4 p-0">
              {policyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[15px] font-medium text-[#1B1A3B]/85 transition-colors duration-300 hover:text-[#E8590C]"
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
            <h3 className="mb-6 text-[15px] font-bold uppercase tracking-[0.08em] text-[#1B1A3B]">
              Discover
            </h3>

            <ul className="m-0 flex flex-col gap-4 p-0">
              {discoverLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[15px] font-medium text-[#1B1A3B]/85 transition-colors duration-300 hover:text-[#E8590C]"
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
            <h3 className="mb-6 text-[15px] font-bold uppercase tracking-[0.08em] text-[#1B1A3B]">
              Follow Us
            </h3>

            <ul className="m-0 flex flex-col gap-4 p-0">
              {socials.length > 0
                ? socials.map(({ label, href }) => (
                    <li key={label}>
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[15px] font-medium text-[#1B1A3B]/85 transition-colors duration-300 hover:text-[#E8590C]"
                      >
                        {label}
                      </a>
                    </li>
                  ))
                : (
                    <li className="text-[15px] font-medium text-[#1B1A3B]/45">
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
        <div className="flex flex-col gap-4 border-t border-[#1B1A3B]/[0.08] py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="whitespace-nowrap text-[13px] text-[#1B1A3B]/70">
            {footer?.copyright ||
              `© ${new Date().getFullYear()} IndieKonnect. All rights reserved.`}
          </p>

          <p className="whitespace-nowrap text-[13px] text-[#1B1A3B]/70">
            <span className="font-bold text-[#1B1A3B]">Made In India</span>{" "}
            &nbsp;Marketed By: {footer?.marketed_by || "Indie Konnect Pvt Ltd"}
          </p>
        </div>
      </div>
    </footer>
  );
}