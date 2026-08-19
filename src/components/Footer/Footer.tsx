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

/* =========================================================
   TYPES
========================================================= */

type FooterLink = {
  label: string;
  href: string;
  tag?: string;
};

type FooterData = {
  title?: string;
  quote1?: string;
  quote3?: string;
  logo_url?: string;
  email?: string;
  phone?: string;
  location?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  twitter?: string;
  youtube?: string;
  copyright?: string;
};

/* =========================================================
   STATIC LINKS
========================================================= */

const supportLinks: FooterLink[] = [
  {
    label: "Assistance",
    href: "/footer-policy/Assistance",
  },
  {
    label: "FAQs",
    href: "/footer-policy/FAQs",
  },
  {
    label: "Returns & Refund",
    href: "/footer-policy/return-refund-policy",
  },
  {
    label: "Contact",
    href: "/contact",
  },
];

const footerLinkIcons = {
  Assistance: LifeBuoy,
  FAQs: HelpCircle,
  "Returns & Refund": RotateCcw,
  Contact: Headset,
};

const footerLinks: Record<string, FooterLink[]> = {
  Legal: [
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
  ],

  "Quick Links": [
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
  ],
};

/* =========================================================
   FOOTER
========================================================= */

export default function Footer() {
  const { data, isLoading } = useGetFooterQuery();

  const footer = data?.data?.footer as FooterData | undefined;

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
     FRAMER MOTION
  ======================================================= */

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
      y: 18,
    },

    visible: {
      opacity: 1,
      y: 0,

      transition: {
        duration: 0.65,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  /* =======================================================
     SOCIALS
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
    ): social is {
      icon: typeof FaInstagram;
      label: string;
      href: string;
    } => Boolean(social.href),
  );

  return (
    <footer className="ik-footer">
      {/* =====================================================
          WATERMARK BACKGROUND
      ===================================================== */}

      <div className="ik-watermark" aria-hidden="true">
        <Image
          src="/images/animate.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="ik-watermark-image"
        />
      </div>

      {/* =====================================================
          ATMOSPHERE
      ===================================================== */}

      <div className="ik-atmosphere" aria-hidden="true" />

      {/* =====================================================
          VIGNETTE
      ===================================================== */}

      <div className="ik-vignette" aria-hidden="true" />

      {/* =====================================================
          SHINE
      ===================================================== */}

      <div className="ik-shine" aria-hidden="true" />

      {/* =====================================================
          GRAIN
      ===================================================== */}

      <div className="ik-grain" aria-hidden="true" />

      {/* =====================================================
          TOP HAIRLINE
      ===================================================== */}

      <div className="ik-top-line" aria-hidden="true" />

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div className="ik-container">
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
          className="ik-ribbon"
        >
          <motion.div variants={itemVariants} className="ik-ribbon-content">
            <div className="ik-eyebrow">
              <span className="ik-eyebrow-line" />

              <span>Connect Beyond Boundaries</span>
            </div>

            <h2 className="ik-title">
              One nation. One network.
              <br />
              <em>{footer?.quote1 || "Endless possibilities."}</em>
            </h2>
          </motion.div>

          {/* =================================================
              SIGNATURE — NETWORK PULSE
              A quiet literal echo of "One network": three
              nodes on a single line, each pulsing in turn.
          ================================================= */}

          <motion.div
            variants={itemVariants}
            className="ik-network"
            aria-hidden="true"
          >
            <span className="ik-node" style={{ animationDelay: "0s" }} />
            <span className="ik-node-line" />
            <span
              className="ik-node ik-node-lg"
              style={{ animationDelay: "0.6s" }}
            />
            <span className="ik-node-line" />
            <span className="ik-node" style={{ animationDelay: "1.2s" }} />
          </motion.div>
        </motion.div>

        {/* ===================================================
            MAIN GRID
        =================================================== */}

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
            amount: 0.12,
          }}
          variants={containerVariants}
          className="ik-main-grid"
        >
          {/* =================================================
              BRAND
          ================================================= */}

          <motion.div variants={itemVariants} className="ik-brand">
            <div className="ik-logo-wrapper">
              {footer?.logo_url ? (
                <Image
                  src={footer.logo_url}
                  alt={footer.title || "IndieKonnect"}
                  fill
                  sizes="240px"
                  priority
                  className="ik-logo"
                />
              ) : (
                <div className="ik-logo-placeholder">
                  {isLoading ? "Loading..." : "IndieKonnect"}
                </div>
              )}
            </div>

            <p className="ik-description">
              {footer?.title ||
                "Connecting India through opportunity and excellence — a single network linking makers, brands and buyers across every state, city and pin code."}
            </p>

            {/* =================================================
                CONTACT
            ================================================= */}

            <div className="ik-contact">
              {footer?.email && (
                <a href={`mailto:${footer.email}`} className="ik-contact-item">
                  <Mail />

                  <span>{footer.email}</span>
                </a>
              )}

              {footer?.phone && (
                <a
                  href={`tel:${footer.phone.replace(/\s/g, "")}`}
                  className="ik-contact-item"
                >
                  <Phone />

                  <span>{footer.phone}</span>
                </a>
              )}

              {footer?.location && (
                <span className="ik-contact-item">
                  <MapPin />

                  <span>{footer.location}</span>
                </span>
              )}
            </div>

            {/* =================================================
                SOCIALS
            ================================================= */}

            {socials.length > 0 && (
              <div className="ik-socials">
                {socials.map(({ icon: Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="ik-social"
                  >
                    <Icon />
                  </a>
                ))}
              </div>
            )}
          </motion.div>

          {/* =================================================
              SUPPORT
          ================================================= */}

          <motion.div variants={itemVariants} className="ik-column">
            <h3 className="ik-column-title">
              <span>Support</span>
            </h3>

            <ul className="ik-links">
              {supportLinks.map(({ label, href }) => {
                const Icon =
                  footerLinkIcons[label as keyof typeof footerLinkIcons];

                return (
                  <li key={label}>
                    <Link href={href} className="ik-link">
                      {Icon && <Icon className="ik-link-icon" />}

                      <span>{label}</span>
                    </Link>
                  </li>
                );
              })}

              {footer?.phone && (
                <li>
                  <a
                    href={`tel:${footer.phone.replace(/\s/g, "")}`}
                    className="ik-link ik-talk"
                  >
                    <Phone className="ik-link-icon" />

                    <span>Talk to Us</span>
                  </a>
                </li>
              )}
            </ul>
          </motion.div>

          {/* =================================================
              LEGAL + QUICK LINKS
          ================================================= */}

          <motion.div
            variants={itemVariants}
            className="ik-column ik-column-right"
          >
            <div className="ik-link-group">
              <h3 className="ik-column-title">
                <span>Legal</span>
              </h3>

              <ul className="ik-links">
                {footerLinks.Legal.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className="ik-link ik-standard-link">
                      <span className="ik-dot" />

                      <span>{label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="ik-link-group ik-link-group-spaced">
              <h3 className="ik-column-title">
                <span>Quick Links</span>
              </h3>

              <ul className="ik-links">
                {footerLinks["Quick Links"].map(({ label, href, tag }) => (
                  <li key={label}>
                    <Link href={href} className="ik-link ik-standard-link">
                      <span className="ik-dot" />

                      <span>{label}</span>

                      {tag && <span className="ik-tag">{tag}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* =====================================================
          BASE BAR
      ===================================================== */}

      <div className="ik-base-container">
        <div className="ik-base-bar">
          <p className="ik-copyright">
            {footer?.copyright ||
              `© ${new Date().getFullYear()} IndieKonnect Pvt. Ltd. — All rights reserved.`}
          </p>

          <div className="ik-base-right">
            <Link href="/footer-policy/privacy-policy" className="ik-base-link">
              Privacy
            </Link>

            <Link href="/footer-policy/terms-of-use" className="ik-base-link">
              Terms
            </Link>

            <span className="ik-made-india">
              <span className="ik-flag-badge" aria-hidden="true">
                <span className="ik-flag-badge-core" />
              </span>

              <b>Made in India</b>

              {footer?.quote3 && (
                <span className="ik-quote3">· {footer.quote3}</span>
              )}
            </span>

            <button
              type="button"
              onClick={scrollToTop}
              aria-label="Scroll to top"
              className="ik-top-button"
            >
              <ArrowUp />
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================
          COMPONENT CSS
      ===================================================== */}

      <style>{`
        .ik-footer {
          /* ---- token system ---- */
          --ink: #0a0912;
          --ink-soft: #14121f;
          --ink-panel: #17152459;
          --paper: #f6f2e8;
          --paper-dim: rgba(246, 242, 232, 0.62);
          --paper-faint: rgba(246, 242, 232, 0.36);
          --gold: #cf9a5c;
          --gold-bright: #f0c785;
          --gold-dim: rgba(207, 154, 92, 0.55);
          --hairline: rgba(246, 242, 232, 0.09);
          --hairline-soft: rgba(246, 242, 232, 0.05);

          position: relative;
          overflow: hidden;
          width: 100%;
          background:
            radial-gradient(
              1200px 640px at 88% -10%,
              rgba(207, 154, 92, 0.16),
              transparent 60%
            ),
            radial-gradient(
              900px 520px at 4% 110%,
              rgba(120, 88, 172, 0.14),
              transparent 60%
            ),
            var(--ink);
          color: var(--paper);
          isolation: isolate;
        }

        /* =====================================================
           WATERMARK
        ===================================================== */

        .ik-watermark {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
          opacity: 0.05;
          mix-blend-mode: screen;
          filter: sepia(1) saturate(2) hue-rotate(-10deg) brightness(0.9);
        }

        .ik-watermark-image {
          object-fit: cover;
          object-position: center center;
          transform-origin: center center;
          transform: scale(0.7);
          animation:
            ikWatermarkFloat 18s ease-in-out infinite alternate,
            ikWatermarkZoom 24s ease-in-out infinite alternate;
          will-change: transform;
        }

        @keyframes ikWatermarkFloat {
          0% {
            transform:
              scale(0.7)
              translate3d(-1%, 0%, 0);
          }

          25% {
            transform:
              scale(0.72)
              translate3d(0%, -0.5%, 0);
          }

          50% {
            transform:
              scale(0.74)
              translate3d(1%, -1%, 0);
          }

          75% {
            transform:
              scale(0.72)
              translate3d(0%, 0%, 0);
          }

          100% {
            transform:
              scale(0.7)
              translate3d(-1%, 1%, 0);
          }
        }

        @keyframes ikWatermarkZoom {
          0% {
            filter: blur(0);
          }

          50% {
            filter: blur(0.25px);
          }

          100% {
            filter: blur(0);
          }
        }

        /* =====================================================
           ATMOSPHERE
        ===================================================== */

        .ik-atmosphere {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          background:
            radial-gradient(
              760px 420px at 78% 30%,
              rgba(240, 199, 133, 0.06),
              transparent 65%
            );
        }

        /* =====================================================
           VIGNETTE
        ===================================================== */

        .ik-vignette {
          position: absolute;
          inset: 0;
          z-index: 2;
          pointer-events: none;
          background:
            linear-gradient(
              to bottom,
              rgba(0, 0, 0, 0.30),
              rgba(0, 0, 0, 0) 22%,
              rgba(0, 0, 0, 0) 78%,
              rgba(0, 0, 0, 0.35)
            );
        }

        /* =====================================================
           SHINE
        ===================================================== */

        .ik-shine {
          position: absolute;
          top: -100%;
          left: -100%;
          width: 300%;
          height: 300%;
          z-index: 3;
          pointer-events: none;
          opacity: 0.06;
          transform: rotate(12deg);
          background:
            linear-gradient(
              90deg,
              transparent 0%,
              rgba(240, 199, 133, 0.9) 50%,
              transparent 100%
            );
          animation: ikShine 18s ease-in-out infinite;
        }

        @keyframes ikShine {
          0% {
            transform:
              translate3d(-30%, -30%, 0)
              rotate(12deg);
          }

          50% {
            transform:
              translate3d(20%, 20%, 0)
              rotate(12deg);
          }

          100% {
            transform:
              translate3d(45%, 45%, 0)
              rotate(12deg);
          }
        }

        /* =====================================================
           GRAIN
        ===================================================== */

        .ik-grain {
          position: absolute;
          inset: 0;
          z-index: 4;
          pointer-events: none;
          opacity: 0.035;
          background-image:
            radial-gradient(
              rgba(246, 242, 232, 0.9) 0.5px,
              transparent 0.6px
            );
          background-size: 4px 4px;
          mix-blend-mode: overlay;
        }

        /* =====================================================
           TOP LINE
        ===================================================== */

        .ik-top-line {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          z-index: 6;
          height: 1px;
          pointer-events: none;
          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(240, 199, 133, 0.55),
              transparent
            );
        }

        /* =====================================================
           CONTAINER
        ===================================================== */

        .ik-container {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 100%;
          padding-left: 48px;
          padding-right: 48px;
        }

        /* =====================================================
           RIBBON
        ===================================================== */

        .ik-ribbon {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 32px;
          padding-top: 60px;
          padding-bottom: 56px;
          border-bottom: 1px solid var(--hairline);
        }

        .ik-eyebrow {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 18px;
          color: var(--gold-bright);
          font-family:
            "JetBrains Mono",
            ui-monospace,
            monospace;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.28em;
        }

        .ik-eyebrow-line {
          width: 28px;
          height: 1px;
          background: var(--gold-dim);
        }

        .ik-title {
          margin: 0;
          color: var(--paper);
          font-family:
            "Bricolage Grotesque",
            ui-serif,
            Georgia,
            serif;
          font-size: clamp(24px, 3vw, 40px);
          font-weight: 500;
          line-height: 1.14;
          letter-spacing: -0.02em;
        }

        .ik-title em {
          font-weight: 400;
          font-style: italic;
          background: linear-gradient(100deg, var(--gold) 10%, var(--gold-bright) 55%, var(--gold) 90%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        /* =====================================================
           SIGNATURE — NETWORK PULSE
        ===================================================== */

        .ik-network {
          display: flex;
          align-items: center;
          gap: 0;
          width: 216px;
          max-width: 40vw;
          padding-bottom: 4px;
        }

        .ik-node {
          width: 6px;
          height: 6px;
          flex-shrink: 0;
          border-radius: 999px;
          background: var(--gold);
          box-shadow: 0 0 0 rgba(240, 199, 133, 0.6);
          animation: ikNodePulse 3.6s ease-in-out infinite;
        }

        .ik-node-lg {
          width: 8px;
          height: 8px;
          background: var(--gold-bright);
        }

        .ik-node-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(
            90deg,
            var(--gold-dim),
            rgba(240, 199, 133, 0.12)
          );
        }

        @keyframes ikNodePulse {
          0%,
          100% {
            box-shadow: 0 0 0 0 rgba(240, 199, 133, 0.45);
            transform: scale(1);
          }

          30% {
            box-shadow: 0 0 10px 3px rgba(240, 199, 133, 0.35);
            transform: scale(1.25);
          }

          60% {
            box-shadow: 0 0 0 0 rgba(240, 199, 133, 0);
            transform: scale(1);
          }
        }

        /* =====================================================
           MAIN GRID
        ===================================================== */

        .ik-main-grid {
          display: grid;
          grid-template-columns:
            1.5fr
            1fr
            1.2fr;
          gap: 60px;
          padding-top: 64px;
          padding-bottom: 64px;
        }

        /* =====================================================
           BRAND
        ===================================================== */

        .ik-logo-wrapper {
          position: relative;
          width: 208px;
          height: 64px;
          margin-left: -4px;
          margin-bottom: 26px;
          filter: brightness(0) invert(1);
          opacity: 0.94;
        }

        .ik-logo {
          object-fit: contain;
          object-position: left center;
        }

        .ik-logo-placeholder {
          display: flex;
          align-items: center;
          height: 100%;
          color: var(--paper-dim);
          font-family:
            "Bricolage Grotesque",
            ui-serif,
            Georgia,
            serif;
          font-size: 20px;
          font-style: italic;
        }

        .ik-description {
          max-width: 380px;
          margin: 0 0 28px;
          color: var(--paper-dim);
          font-size: 15px;
          font-weight: 300;
          line-height: 1.75;
        }

        .ik-contact {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 28px;
        }

        .ik-contact-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: fit-content;
          color: var(--paper-dim);
          font-family:
            "JetBrains Mono",
            ui-monospace,
            monospace;
          font-size: 12.5px;
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .ik-contact-item:hover {
          color: var(--gold-bright);
        }

        .ik-contact-item svg {
          width: 14px;
          height: 14px;
          flex-shrink: 0;
          color: var(--gold);
        }

        /* =====================================================
           SOCIAL
        ===================================================== */

        .ik-socials {
          display: flex;
          gap: 10px;
        }

        .ik-social {
          display: grid;
          place-items: center;
          width: 39px;
          height: 39px;
          border: 1px solid var(--hairline);
          border-radius: 999px;
          background: rgba(246, 242, 232, 0.03);
          color: var(--paper-dim);
          transition:
            transform 0.5s ease,
            color 0.5s ease,
            background 0.5s ease,
            border-color 0.5s ease,
            box-shadow 0.5s ease;
        }

        .ik-social:hover {
          transform: translateY(-4px);
          border-color: var(--gold-dim);
          background: rgba(207, 154, 92, 0.10);
          color: var(--gold-bright);
          box-shadow:
            0 12px 28px
            rgba(207, 154, 92, 0.18);
        }

        .ik-social svg {
          width: 15px;
          height: 15px;
        }

        /* =====================================================
           COLUMNS
        ===================================================== */

        .ik-column-title {
          margin: 0 0 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--hairline);
          color: var(--paper-faint);
          font-family:
            "JetBrains Mono",
            ui-monospace,
            monospace;
          font-size: 10.5px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.28em;
        }

        .ik-links {
          display: flex;
          flex-direction: column;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .ik-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 0;
          color: var(--paper);
          font-size: 14.5px;
          font-weight: 400;
          text-decoration: none;
          transition:
            transform 0.3s ease,
            color 0.3s ease;
        }

        .ik-link:hover {
          transform: translateX(8px);
          color: var(--gold-bright);
        }

        .ik-link-icon {
          width: 14px;
          height: 14px;
          flex-shrink: 0;
          color: var(--gold);
          transition: color 0.3s ease;
        }

        .ik-link:hover .ik-link-icon {
          color: var(--gold-bright);
        }

        .ik-talk {
          color: var(--gold-bright);
          font-weight: 600;
        }

        .ik-standard-link {
          gap: 8px;
        }

        .ik-dot {
          width: 4px;
          height: 4px;
          flex-shrink: 0;
          border-radius: 999px;
          background: var(--gold-bright);
          opacity: 0;
          transform: scale(0);
          transition:
            transform 0.3s ease,
            opacity 0.3s ease;
        }

        .ik-standard-link:hover .ik-dot {
          opacity: 1;
          transform: scale(1);
        }

        .ik-tag {
          margin-left: 2px;
          padding: 2px 6px;
          border-radius: 3px;
          background: rgba(207, 154, 92, 0.14);
          color: var(--gold-bright);
          font-family:
            "JetBrains Mono",
            ui-monospace,
            monospace;
          font-size: 8.5px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }

        .ik-link-group-spaced {
          margin-top: 32px;
        }

        /* =====================================================
           RIGHT COLUMN
        ===================================================== */

        .ik-column-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          text-align: right;
        }

        .ik-column-right .ik-column-title {
          width: 100%;
        }

        .ik-column-right .ik-links {
          align-items: flex-end;
        }

        .ik-column-right .ik-link {
          justify-content: flex-end;
        }

        .ik-column-right .ik-link:hover {
          transform: translateX(-8px);
        }

        .ik-column-right .ik-standard-link {
          flex-direction: row-reverse;
        }

        .ik-column-right .ik-dot {
          order: 1;
          margin-left: 8px;
        }

        .ik-column-right .ik-tag {
          margin-left: 0;
          margin-right: 2px;
        }

        .ik-column-right .ik-link-group {
          width: 100%;
        }

        .ik-column-right .ik-link-group-spaced {
          margin-top: 32px;
        }

        /* =====================================================
           BASE BAR
        ===================================================== */

        .ik-base-container {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 100%;
          padding-left: 48px;
          padding-right: 48px;
        }

        .ik-base-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding-top: 24px;
          padding-bottom: 24px;
          border-top: 1px solid var(--hairline);
        }

        .ik-copyright {
          margin: 0;
          color: var(--paper-dim);
          font-size: 12.5px;
          font-weight: 400;
        }

        .ik-base-right {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          justify-content: flex-end;
          gap: 20px;
        }

        .ik-base-link {
          color: var(--paper-dim);
          font-size: 12.5px;
          font-weight: 400;
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .ik-base-link:hover {
          color: var(--gold-bright);
        }

        .ik-made-india {
          display: flex;
          align-items: center;
          gap: 9px;
          color: var(--paper-dim);
          font-size: 12.5px;
          font-weight: 400;
        }

        .ik-made-india b {
          color: var(--paper);
          font-weight: 500;
        }

        .ik-flag-badge {
          display: grid;
          place-items: center;
          width: 18px;
          height: 18px;
          padding: 2px;
          border-radius: 999px;
          background: conic-gradient(
            from 180deg,
            #ff9933 0deg 120deg,
            #f6f2e8 120deg 240deg,
            #138808 240deg 360deg
          );
          box-shadow: 0 0 0 1px var(--hairline);
        }

        .ik-flag-badge-core {
          width: 100%;
          height: 100%;
          border-radius: 999px;
          background: var(--ink);
        }

        .ik-quote3 {
          display: inline;
          color: var(--gold-bright);
        }

        .ik-top-button {
          display: grid;
          place-items: center;
          width: 36px;
          height: 36px;
          padding: 0;
          border: 1px solid var(--hairline);
          border-radius: 999px;
          background: rgba(246, 242, 232, 0.03);
          color: var(--paper-dim);
          cursor: pointer;
          transition:
            color 0.5s ease,
            background 0.5s ease,
            border-color 0.5s ease,
            box-shadow 0.5s ease,
            transform 0.3s ease;
        }

        .ik-top-button:hover {
          transform: translateY(-2px);
          border-color: var(--gold-dim);
          background: rgba(207, 154, 92, 0.10);
          color: var(--gold-bright);
          box-shadow:
            0 12px 28px
            rgba(207, 154, 92, 0.18);
        }

        .ik-top-button svg {
          width: 16px;
          height: 16px;
        }

        /* =====================================================
           TABLET
        ===================================================== */

        @media (max-width: 1024px) {
          .ik-ribbon {
            align-items: flex-start;
          }

          .ik-network {
            max-width: 100%;
          }

          .ik-main-grid {
            grid-template-columns: 1fr 1fr;
            gap: 40px;
          }

          .ik-column-right {
            align-items: flex-start;
            text-align: left;
          }

          .ik-column-right .ik-links {
            align-items: flex-start;
          }

          .ik-column-right .ik-link {
            justify-content: flex-start;
          }

          .ik-column-right .ik-link:hover {
            transform: translateX(8px);
          }

          .ik-column-right .ik-standard-link {
            flex-direction: row;
          }

          .ik-column-right .ik-dot {
            order: 0;
            margin-left: 0;
            margin-right: 0;
          }

          .ik-column-right .ik-tag {
            margin-left: 2px;
            margin-right: 0;
          }
        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 768px) {
          .ik-watermark {
            opacity: 0.04;
          }

          .ik-watermark-image {
            transform: scale(0.6);
          }

          @keyframes ikWatermarkFloat {
            0% {
              transform:
                scale(0.6)
                translate3d(-1%, 0%, 0);
            }

            25% {
              transform:
                scale(0.62)
                translate3d(0%, -0.5%, 0);
            }

            50% {
              transform:
                scale(0.64)
                translate3d(1%, -1%, 0);
            }

            75% {
              transform:
                scale(0.62)
                translate3d(0%, 0%, 0);
            }

            100% {
              transform:
                scale(0.6)
                translate3d(-1%, 1%, 0);
            }
          }

          .ik-container {
            padding-left: 20px;
            padding-right: 20px;
          }

          .ik-base-container {
            padding-left: 20px;
            padding-right: 20px;
          }

          .ik-ribbon {
            flex-direction: column;
            align-items: flex-start;
            padding-top: 40px;
            padding-bottom: 40px;
          }

          .ik-network {
            width: 100%;
            max-width: 100%;
          }

          .ik-main-grid {
            grid-template-columns: 1fr;
            gap: 40px;
            padding-top: 44px;
            padding-bottom: 44px;
          }

          .ik-column-right {
            align-items: flex-start;
            text-align: left;
          }

          .ik-column-right .ik-links {
            align-items: flex-start;
          }

          .ik-column-right .ik-link {
            justify-content: flex-start;
          }

          .ik-column-right .ik-link:hover {
            transform: translateX(8px);
          }

          .ik-column-right .ik-standard-link {
            flex-direction: row;
          }

          .ik-column-right .ik-dot {
            order: 0;
            margin-left: 0;
            margin-right: 0;
          }

          .ik-column-right .ik-tag {
            margin-left: 2px;
            margin-right: 0;
          }

          .ik-base-bar {
            flex-direction: column;
            align-items: flex-start;
            gap: 20px;
          }

          .ik-base-right {
            justify-content: flex-start;
          }

          .ik-quote3 {
            display: none;
          }
        }

        /* =====================================================
           SMALL MOBILE
        ===================================================== */

        @media (max-width: 480px) {
          .ik-container {
            padding-left: 16px;
            padding-right: 16px;
          }

          .ik-base-container {
            padding-left: 16px;
            padding-right: 16px;
          }

          .ik-title {
            font-size: 27px;
          }

          .ik-base-right {
            gap: 14px;
          }
        }

        /* =====================================================
           REDUCED MOTION
        ===================================================== */

        @media (prefers-reduced-motion: reduce) {
          .ik-watermark-image,
          .ik-shine,
          .ik-node {
            animation: none !important;
          }

          .ik-social,
          .ik-link,
          .ik-top-button,
          .ik-contact-item {
            transition: none !important;
          }
        }
      `}</style>
    </footer>
  );
}
