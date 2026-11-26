"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Cookie } from "lucide-react";

/* =========================================================
   SAME VIDEO USED IN PREVIOUS SECTIONS
   /public/videos/indiekonnect-underwater.mp4
========================================================= */

const VIDEO_SRC = "/videos/indiekonnect-underwater.mp4";

/* =========================================================
   TEMPORARY WATCH IMAGE
   Replace later with your own:
   /images/indiekonnect-faq-watch.png
========================================================= */

const WATCH_IMAGE =
  "https://www.titan.co.in/dw/image/v2/BKDD_PRD/on/demandware.static/-/Sites-titan-master-catalog/default/dwde5f1793/images/Titan/Catalog/10071QM01_1.png?sh=1100&sw=1100";

/* =========================================================
   FAQ DATA
========================================================= */

const faqData = [
  {
    id: 1,
    question:
      "WHAT DOES 500M WATER RESISTANCE ACTUALLY MEAN?",
    answer:
      "A 500M water-resistance rating indicates that the watch is designed and tested for substantial water pressure. The rating describes pressure resistance under controlled testing conditions and does not mean the watch should routinely be taken to a depth of 500 metres.",
  },

  {
    id: 2,
    question:
      "WHAT IS A HELIUM ESCAPE VALVE AND WHY DOES IT MATTER?",
    answer:
      "A helium escape valve allows accumulated helium gas to escape from the watch during professional saturation-diving decompression. This helps reduce internal pressure that can build up during prolonged underwater operations.",
  },

  {
    id: 3,
    question:
      "HOW LONG DOES THE POWER RESERVE LAST?",
    answer:
      "The power reserve depends on the automatic movement used in the watch. Once fully wound through normal wrist movement or manual winding where supported, the movement can continue running for its specified reserve period.",
  },

  {
    id: 4,
    question:
      "IS THE WATCH SUITABLE FOR PROFESSIONAL DIVING?",
    answer:
      "The diver-oriented construction, water-resistance rating and supporting features are designed with demanding underwater use in mind. Always follow the manufacturer's operating, servicing and water-resistance guidance.",
  },

  {
    id: 5,
    question:
      "HOW OFTEN SHOULD THE WATER RESISTANCE BE CHECKED?",
    answer:
      "Water resistance can change over time because seals and gaskets naturally age. Periodic inspection and pressure testing by an authorised service centre helps confirm that the watch continues to meet its specified water-resistance level.",
  },

  {
    id: 6,
    question:
      "CAN THE WATCH BE USED FOR EVERYDAY WEAR?",
    answer:
      "Yes. The diver-focused construction is also designed to work for everyday use. However, activities involving water, impact or chemicals should always follow the manufacturer's care recommendations.",
  },
];

/* =========================================================
   ANIMATION VARIANTS
========================================================= */

const sectionVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.05,
    },
  },
};

const fadeUpVariants = {
  hidden: {
    opacity: 0,
    y: 35,
  },

  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.75,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const watchVariants = {
  hidden: {
    opacity: 0,
    x: 100,
    scale: 0.94,
  },

  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 1,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

/* =========================================================
   COMPONENT
========================================================= */

export default function FAQSection() {
  const [openId, setOpenId] = useState<number | null>(1);

  const handleToggle = (id: number) => {
    setOpenId((current) => (current === id ? null : id));
  };

  return (
    <section
      className="
        relative
        min-h-screen
        w-full
        overflow-hidden
        bg-[#021421]
      "
    >
      {/* ===================================================
          BACKGROUND VIDEO
      =================================================== */}

      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        className="
          absolute
          inset-0
          h-full
          w-full
          object-cover
        "
      >
        <source
          src={VIDEO_SRC}
          type="video/mp4"
        />
      </video>

      {/* ===================================================
          DARK OVERLAY
      =================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-[rgba(0,16,29,0.58)]
        "
      />

      {/* ===================================================
          BLUE CENTER LIGHT
      =================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-[radial-gradient(circle_at_45%_50%,rgba(0,171,220,0.17),transparent_47%)]
        "
      />

      {/* ===================================================
          RIGHT SIDE DARK GRADIENT
      =================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-y-0
          right-0
          w-[48%]
          bg-gradient-to-r
          from-transparent
          via-[#001527]/30
          to-[#001121]/75
        "
      />

      {/* ===================================================
          CONTENT
      =================================================== */}

      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{
          once: true,
          amount: 0.16,
        }}
        className="
          relative
          z-10
          mx-auto
          flex
          min-h-screen
          w-full
          max-w-[1900px]
          items-center
          px-5
          py-14
          sm:px-7
          md:px-10
          lg:px-14
          xl:px-[4.5rem]
          2xl:px-[5rem]
        "
      >
        {/* =================================================
            LEFT SIDE
        ================================================= */}

        <div
          className="
            relative
            z-20
            w-full
            lg:w-[70%]
            xl:w-[69%]
          "
        >
          {/* -----------------------------------------------
              TITLE
          ------------------------------------------------ */}

          <motion.h2
            variants={fadeUpVariants}
            className="
              mb-10
              text-[38px]
              font-black
              uppercase
              leading-none
              tracking-[-0.035em]
              text-white
              sm:text-[44px]
              md:text-[50px]
              lg:text-[53px]
              xl:text-[58px]
            "
          >
            FAQs
          </motion.h2>

          {/* -----------------------------------------------
              FAQ CONTAINER
          ------------------------------------------------ */}

          <motion.div
            variants={fadeUpVariants}
            className="
              relative
              overflow-hidden
              rounded-[12px]
              border
              border-[#078db9]/75
              bg-[rgba(5,31,46,0.72)]
              shadow-[0_0_18px_rgba(0,185,235,0.35),inset_0_0_28px_rgba(24,130,165,0.05)]
              backdrop-blur-[4px]
              lg:min-h-[505px]
              xl:min-h-[505px]
            "
          >
            {/* Inner glow */}
            <div
              className="
                pointer-events-none
                absolute
                left-1/2
                top-0
                h-[180px]
                w-[65%]
                -translate-x-1/2
                rounded-full
                bg-cyan-500/5
                blur-[55px]
              "
            />

            <div className="relative z-10 px-7 py-7 sm:px-9 sm:py-8 md:px-10">
              {faqData.map((faq, index) => {
                const isOpen = openId === faq.id;

                return (
                  <motion.div
                    key={faq.id}
                    initial={{
                      opacity: 0,
                      y: 18,
                    }}
                    whileInView={{
                      opacity: 1,
                      y: 0,
                    }}
                    viewport={{
                      once: true,
                      amount: 0.2,
                    }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.08,
                    }}
                    className="
                      border-b
                      border-white/15
                      last:border-b-0
                    "
                  >
                    {/* QUESTION */}
                    <button
                      type="button"
                      onClick={() =>
                        handleToggle(faq.id)
                      }
                      className="
                        flex
                        min-h-[82px]
                        w-full
                        items-center
                        justify-between
                        gap-6
                        text-left
                        outline-none
                      "
                      aria-expanded={isOpen}
                    >
                      <span
                        className={`
                          text-[14px]
                          font-bold
                          uppercase
                          leading-relaxed
                          tracking-[-0.025em]
                          transition-colors
                          duration-300
                          sm:text-[16px]
                          md:text-[18px]
                          lg:text-[18px]
                          xl:text-[19px]
                          ${
                            isOpen
                              ? "text-[#09a9ff]"
                              : "text-white"
                          }
                        `}
                      >
                        {faq.question}
                      </span>

                      <motion.span
                        animate={{
                          rotate: isOpen ? 180 : 0,
                        }}
                        transition={{
                          duration: 0.3,
                        }}
                        className="
                          flex
                          shrink-0
                          items-center
                          justify-center
                          text-white
                        "
                      >
                        <ChevronDown
                          size={23}
                          strokeWidth={2}
                        />
                      </motion.span>
                    </button>

                    {/* ANSWER */}
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
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
                            duration: 0.4,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          className="overflow-hidden"
                        >
                          <div className="pb-7 pr-8">
                            <p
                              className="
                                max-w-[900px]
                                text-[13px]
                                font-light
                                leading-7
                                text-white/75
                                sm:text-[14px]
                                sm:leading-7
                                md:text-[15px]
                                md:leading-8
                              "
                            >
                              {faq.answer}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* =================================================
            RIGHT WATCH
        ================================================= */}

        <motion.div
          variants={watchVariants}
          className="
            pointer-events-none
            absolute
            right-[-100px]
            top-1/2
            z-10
            hidden
            h-[820px]
            w-[650px]
            -translate-y-1/2
            lg:block
            xl:right-[-80px]
            xl:h-[850px]
            xl:w-[690px]
            2xl:right-[-45px]
            2xl:h-[900px]
            2xl:w-[730px]
          "
        >
          {/* Watch glow */}

          <div
            className="
              absolute
              left-[35%]
              top-[40%]
              h-[420px]
              w-[420px]
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              bg-cyan-400/10
              blur-[100px]
            "
          />

          {/* Actual watch */}

          <motion.img
            src={WATCH_IMAGE}
            alt="IndieKonnect diver watch"
            className="
              absolute
              left-1/2
              top-1/2
              h-auto
              w-[690px]
              max-w-none
              -translate-x-1/2
              -translate-y-1/2
              object-contain
              drop-shadow-[-15px_20px_40px_rgba(0,0,0,0.60)]
            "
            animate={{
              y: [0, -7, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>

        {/* =================================================
            MOBILE WATCH
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            scale: 0.92,
          }}
          whileInView={{
            opacity: 1,
            scale: 1,
          }}
          viewport={{
            once: true,
            amount: 0.2,
          }}
          transition={{
            duration: 0.8,
          }}
          className="
            absolute
            bottom-[-35px]
            right-[-100px]
            z-10
            block
            lg:hidden
          "
        >
          <img
            src={WATCH_IMAGE}
            alt="IndieKonnect diver watch"
            className="
              w-[390px]
              object-contain
              opacity-65
              drop-shadow-[0_20px_35px_rgba(0,0,0,0.55)]
              sm:w-[470px]
            "
          />
        </motion.div>
      </motion.div>

      {/* ===================================================
          COOKIE BUTTON
      =================================================== */}

      <motion.button
        initial={{
          opacity: 0,
          scale: 0.7,
        }}
        whileInView={{
          opacity: 1,
          scale: 1,
        }}
        viewport={{
          once: true,
        }}
        whileHover={{
          scale: 1.06,
        }}
        className="
          absolute
          bottom-5
          left-2
          z-40
          flex
          h-[58px]
          w-[58px]
          items-center
          justify-center
          rounded-full
          border-2
          border-white
          bg-[#050b12]
          text-white
          shadow-[0_3px_12px_rgba(0,0,0,0.35)]
          sm:left-4
          sm:h-[64px]
          sm:w-[64px]
        "
        aria-label="Cookie settings"
      >
        <Cookie
          size={31}
          strokeWidth={1.8}
        />
      </motion.button>
    </section>
  );
}