"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  MapPin,
  Phone,
  Mail,
  ArrowLeft,
  ChevronRight,
  Navigation,
} from "lucide-react";

import {
  FaInstagram,
  FaFacebook,
  FaYoutube,
  FaLinkedin,
  FaPinterest,
} from "react-icons/fa";

import { FaXTwitter } from "react-icons/fa6";

import Header from "../../components/common/Header";
import Footer from "../../components/Footer/Footer";
import ContactInfoCard from "../../components/contact/ContactInfoCard";
import ContactForm from "../../components/contact/ContactForm";
import { useGetFAQsQuery } from "@/lib/redux/api/faqApi";
import { useGetFooterQuery } from "@/lib/redux/api/Home/contentApi";

interface FAQItem {
  id: number;
  section_id: number;
  question: string;
  answer: string;
  order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  section?: {
    id: number;
    name: string;
    slug: string;
  };
}

export default function ContactPage() {
  const router = useRouter();

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // =========================================================
  // FAQ API
  // =========================================================
  const { data: faqResponse, isLoading: faqLoading } = useGetFAQsQuery({});

  const faqs: FAQItem[] = useMemo(() => {
    return faqResponse?.data ?? [];
  }, [faqResponse]);

  // =========================================================
  // FOOTER API (for social links)
  // =========================================================
  const { data: footerResponse } = useGetFooterQuery({});

  const footerData = useMemo(() => {
    return footerResponse?.data?.footer ?? footerResponse?.footer ?? null;
  }, [footerResponse]);

  // =========================================================
  // GROUP FAQS BY SECTION
  // =========================================================
  const groupedFaqs = useMemo(() => {
    const grouped: Record<
      string,
      {
        sectionId: number;
        sectionName: string;
        sectionSlug: string;
        faqs: FAQItem[];
      }
    > = {};

    faqs
      .filter((faq) => faq.is_active)
      .sort((a, b) => a.order - b.order)
      .forEach((faq) => {
        const sectionId = faq.section?.id ?? faq.section_id;
        const sectionName = faq.section?.name ?? "Support";
        const sectionSlug =
          faq.section?.slug ?? `section-${sectionId}`;

        if (!grouped[sectionSlug]) {
          grouped[sectionSlug] = {
            sectionId,
            sectionName,
            sectionSlug,
            faqs: [],
          };
        }

        grouped[sectionSlug].faqs.push(faq);
      });

    return Object.values(grouped);
  }, [faqs]);

  // =========================================================
  // ANIMATIONS
  // =========================================================
  const containerVariants = {
    hidden: {
      opacity: 0,
    },

    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20,
    },

    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 25,
      },
    },
  };

  // =========================================================
  // SOCIAL LINKS (from API)
  // =========================================================
  const socialLinks = useMemo(() => {
    if (!footerData) return [];

    return [
      {
        icon: FaInstagram,
        label: "Instagram",
        href: footerData.instagram,
      },
      {
        icon: FaFacebook,
        label: "Facebook",
        href: footerData.facebook,
      },
      {
        icon: FaXTwitter,
        label: "Twitter",
        href: footerData.twitter,
      },
      {
        icon: FaYoutube,
        label: "YouTube",
        href: footerData.youtube,
      },
      {
        icon: FaLinkedin,
        label: "LinkedIn",
        href: footerData.linkedin,
      },
      {
        icon: FaPinterest,
        label: "Pinterest",
        href: footerData.pinterest,
      },
    ].filter((social) => social.href && social.href.trim() !== "");
  }, [footerData]);

  // =========================================================
  // TOGGLE FAQ
  // =========================================================
  const toggleFaq = (id: number) => {
    setOpenFaq((prev) => (prev === id ? null : id));
  };

  return (
    <div
      className="min-h-screen bg-[#F5F6F8]"
      style={{
        fontFamily: "'Lato', sans-serif",
      }}
    >
      {/* =========================================================
          HEADER
      ========================================================= */}

      <Header
        cartItems={[]}
        cartCount={0}
        cartSubtotal={0}
        wishlistCount={0}
      />

      {/* =========================================================
          MAIN CONTENT
      ========================================================= */}

      <main className="relative z-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* =====================================================
              BACK + BREADCRUMB
          ===================================================== */}

          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="
              flex
              items-center
              justify-between
              pt-6
              pb-5
              sm:pt-8
            "
          >
            {/* Back */}
            <button
              type="button"
              onClick={() => router.back()}
              className="
                flex
                items-center
                gap-2
                text-xs
                text-gray-500
                hover:text-[#B8873A]
                transition-colors
                group
              "
            >
              <ArrowLeft
                className="
                  w-4
                  h-4
                  group-hover:-translate-x-1
                  transition-transform
                "
              />

              <span>Back</span>
            </button>

            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-[11px]">
              <Link
                href="/"
                className="
                  text-gray-400
                  hover:text-[#B8873A]
                  transition-colors
                "
              >
                Home
              </Link>

              <ChevronRight className="w-3 h-3 text-gray-300" />

              <span className="text-[#30333D] font-medium">
                Contact
              </span>
            </nav>
          </motion.div>

          {/* =====================================================
              PAGE HEADING
          ===================================================== */}

          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="max-w-5xl mx-auto mb-8 text-center"
          >
            <span
              className="
                text-[8px]
                uppercase
                tracking-[0.25em]
                font-semibold
                text-[#B8873A]
              "
            >
              Get in touch
            </span>

            <h1
              className="
                mt-2
                text-2xl
                sm:text-3xl
                md:text-4xl
                font-serif
                text-[#242732]
                leading-[1.1]
              "
            >
              We&apos;d love to hear from you
            </h1>

            <p
              className="
                mt-3
                max-w-xl
                mx-auto
                text-xs
                sm:text-sm
                text-gray-500
                leading-relaxed
              "
            >
              Questions about an order, a partnership, or an artisan
              collective you&apos;d like us to feature — write in, our
              team replies within a day.
            </p>
          </motion.div>

          {/* =====================================================
              THREE CONTACT INFO CARDS
          ===================================================== */}

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-3
              gap-3
              lg:gap-4
              max-w-5xl
              mx-auto
              mb-8
            "
          >
            {/* EMAIL */}
            <ContactInfoCard icon={Mail} title="Email us" delay={0.1}>
              <p className="text-[10px] text-gray-500 leading-5">
                support@indiekonnect.in — replies within 24 hours
              </p>
            </ContactInfoCard>

            {/* PHONE */}
            <ContactInfoCard icon={Phone} title="Call us" delay={0.2}>
              <p className="text-[10px] text-gray-500 leading-5">
                +91 80 4567 1234 — Mon to Sat, 10am to 7pm IST
              </p>
            </ContactInfoCard>

            {/* ADDRESS */}
            <ContactInfoCard icon={MapPin} title="Visit us" delay={0.3}>
              <p className="text-[10px] text-gray-500 leading-5">
                4th Floor, Artisan House, Indiranagar, Bengaluru 560038
              </p>
            </ContactInfoCard>
          </motion.div>

          {/* =====================================================
              FORM + MAP SECTION
          ===================================================== */}

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="
              grid
              grid-cols-1
              lg:grid-cols-[1.15fr_0.85fr]
              gap-4
              max-w-5xl
              mx-auto
            "
          >
            {/* =================================================
                CONTACT FORM
            ================================================= */}

            <motion.div
              variants={itemVariants}
              className="
                bg-white
                rounded-2xl
                border
                border-[#E7E8EC]
                shadow-[0_12px_35px_rgba(28,31,42,0.06)]
                p-6
                sm:p-7
                lg:p-8
              "
            >
              <div className="mb-2">
                <span
                  className="
                    text-[8px]
                    uppercase
                    tracking-[0.25em]
                    font-semibold
                    text-[#B8873A]
                  "
                >
                  Contact form
                </span>
              </div>

              <ContactForm />
            </motion.div>

            {/* =================================================
                RIGHT SIDE - MAP
            ================================================= */}

            <motion.div
              variants={itemVariants}
              className="space-y-3"
            >
              {/* MAP */}
              <div
                className="
                  bg-white
                  rounded-2xl
                  overflow-hidden
                  border
                  border-[#E7E8EC]
                  shadow-[0_12px_35px_rgba(28,31,42,0.06)]
                "
              >
                <div
                  className="
                    relative
                    h-[230px]
                    sm:h-[250px]
                    lg:h-[270px]
                    bg-[#E9ECF1]
                    overflow-hidden
                  "
                >
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d248849.8854912597!2d77.49085034835171!3d12.953847665482795!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670c9b44e6d%3A0xf8dfc3e8517e4fe0!2sBengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1724497123456!5m2!1sen!2sin"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Bengaluru Location Map"
                    className="w-full h-full"
                  />
                </div>

                {/* Directions */}
                <a
                  href="https://www.google.com/maps/dir//Bengaluru,+Karnataka/@12.9716,77.5946,12z"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    h-10
                    flex
                    items-center
                    justify-center
                    gap-2
                    bg-white
                    text-[9px]
                    font-semibold
                    tracking-[0.15em]
                    uppercase
                    text-[#282B35]
                    hover:text-[#B8873A]
                    hover:bg-[#FAFAFB]
                    transition-colors
                    border-t
                    border-[#E7E8EC]
                  "
                >
                  Get directions
                  <Navigation className="w-3 h-3" />
                </a>
              </div>

              {/* =================================================
                  SOCIAL CARD
              ================================================= */}

              <div
                className="
                  bg-white
                  rounded-2xl
                  border
                  border-[#E7E8EC]
                  shadow-[0_12px_35px_rgba(28,31,42,0.06)]
                  p-5
                "
              >
                <span
                  className="
                    block
                    text-[8px]
                    uppercase
                    tracking-[0.25em]
                    font-semibold
                    text-[#B8873A]
                    mb-3
                  "
                >
                  Follow along
                </span>

                <div className="flex flex-wrap items-center gap-2">
                  {socialLinks.map((social, index) => {
                    const SocialIcon = social.icon;

                    return (
                      <motion.a
                        key={social.label}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.label}
                        initial={{
                          opacity: 0,
                          scale: 0.8,
                        }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                        }}
                        transition={{
                          delay: 0.3 + index * 0.04,
                        }}
                        whileHover={{
                          y: -2,
                        }}
                        whileTap={{
                          scale: 0.95,
                        }}
                        className="
                          w-8
                          h-8
                          rounded-full
                          border
                          border-[#E2E4E8]
                          bg-[#FAFAFB]
                          flex
                          items-center
                          justify-center
                          text-[#656976]
                          hover:bg-[#20232E]
                          hover:text-white
                          hover:border-[#20232E]
                          transition-all
                        "
                      >
                        <SocialIcon className="w-3.5 h-3.5" />
                      </motion.a>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* =====================================================
              FAQ SECTION
          ===================================================== */}

          <motion.section
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="
              max-w-5xl
              mx-auto
              pt-14
              pb-16
            "
          >
            {/* Heading */}
            <div className="text-center mb-8">
              <span
                className="
                  text-[8px]
                  uppercase
                  tracking-[0.25em]
                  font-semibold
                  text-[#B8873A]
                "
              >
                Support
              </span>

              <h2
                className="
                  mt-2
                  text-2xl
                  md:text-3xl
                  font-serif
                  text-[#242732]
                "
              >
                Frequently asked
              </h2>
            </div>

            {/* FAQ LOADING */}
            {faqLoading ? (
              <div
                className="
                  bg-white
                  rounded-2xl
                  border
                  border-[#E7E8EC]
                  shadow-[0_12px_35px_rgba(28,31,42,0.05)]
                  p-10
                  text-center
                "
              >
                <p className="text-[12px] text-gray-500">
                  Loading FAQs...
                </p>
              </div>
            ) : groupedFaqs.length > 0 ? (
              <div className="space-y-5">
                {groupedFaqs.map((section) => (
                  <div key={section.sectionId}>
                    {/* =================================================
                        SECTION NAME
                    ================================================= */}
                    <div className="mb-2 px-1">
                      <h3
                        className="
                          text-[12px]
                          sm:text-[13px]
                          font-semibold
                          uppercase
                          tracking-[0.18em]
                          text-[#B8873A]
                        "
                      >
                        {section.sectionName}
                      </h3>
                    </div>

                    {/* =================================================
                        SECTION FAQS
                    ================================================= */}
                    <div
                      className="
                        bg-white
                        rounded-2xl
                        border
                        border-[#E7E8EC]
                        overflow-hidden
                        shadow-[0_12px_35px_rgba(28,31,42,0.05)]
                      "
                    >
                      {section.faqs.map((faq, index) => {
                        const isOpen = openFaq === faq.id;

                        return (
                          <div
                            key={faq.id}
                            className={`
                              border-[#ECEDEF]
                              ${
                                index !== section.faqs.length - 1
                                  ? "border-b"
                                  : ""
                              }
                            `}
                          >
                            {/* QUESTION BUTTON */}
                            <button
                              type="button"
                              onClick={() => toggleFaq(faq.id)}
                              aria-expanded={isOpen}
                              aria-controls={`faq-answer-${faq.id}`}
                              className="
                                w-full
                                flex
                                items-center
                                justify-between
                                gap-4
                                px-6
                                py-5
                                text-left
                                text-[14px]
                                font-medium
                                text-[#30333D]
                                hover:bg-[#FAFAFB]
                                transition-colors
                                focus:outline-none
                              "
                            >
                              <span>{faq.question}</span>

                              <motion.span
                                animate={{
                                  rotate: isOpen ? 180 : 0,
                                }}
                                transition={{
                                  duration: 0.2,
                                }}
                                className="
                                  flex
                                  items-center
                                  justify-center
                                  w-6
                                  h-6
                                  flex-shrink-0
                                  rounded-full
                                  border
                                  border-[#E2E4E8]
                                  text-[#B8873A]
                                  text-lg
                                  font-medium
                                  leading-none
                                "
                              >
                                {isOpen ? "−" : "+"}
                              </motion.span>
                            </button>

                            {/* ANSWER */}
                            <AnimatePresence initial={false}>
                              {isOpen && (
                                <motion.div
                                  id={`faq-answer-${faq.id}`}
                                  initial={{
                                    height: 0,
                                    opacity: 0,
                                  }}
                                  animate={{
                                    height: "auto",
                                    opacity: 1,
                                  }}
                                  exit={{
                                    height: 0,
                                    opacity: 0,
                                  }}
                                  transition={{
                                    duration: 0.25,
                                    ease: "easeInOut",
                                  }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-6 pb-5 pr-12">
                                    <p
                                      className="
                                        text-[12px]
                                        sm:text-[13px]
                                        text-gray-500
                                        leading-6
                                      "
                                    >
                                      {faq.answer}
                                    </p>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="
                  bg-white
                  rounded-2xl
                  border
                  border-[#E7E8EC]
                  shadow-[0_12px_35px_rgba(28,31,42,0.05)]
                  p-10
                  text-center
                "
              >
                <p className="text-[12px] text-gray-500">
                  No FAQs available at the moment.
                </p>
              </div>
            )}
          </motion.section>
        </div>
      </main>

      {/* =========================================================
          FOOTER
      ========================================================= */}

      <Footer />
    </div>
  );
}