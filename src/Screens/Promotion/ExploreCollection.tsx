"use client";

import React from "react";
import { motion } from "framer-motion";
import { Cookie, ArrowRight } from "lucide-react";

/* =========================================================
   BACKGROUND VIDEO
   Put your underwater video here:
   /public/videos/indiekonnect-underwater.mp4
========================================================= */

const VIDEO_SRC = "/videos/indiekonnect-underwater.mp4";

/* =========================================================
   TEMPORARY ONLINE WATCH IMAGES
   You can replace these later with your own images.
========================================================= */

const WATCH_IMAGES = {
  "500m":
    "https://www.titan.co.in/dw/image/v2/BKDD_PRD/on/demandware.static/-/Sites-titan-master-catalog/default/dwde5f1793/images/Titan/Catalog/10071QM01_1.png?sh=600&sw=600",

  "300m":
    "https://www.titan.co.in/dw/image/v2/BKDD_PRD/on/demandware.static/-/Sites-titan-master-catalog/default/dw0d8f7c40/images/Titan/Catalog/10069KM02_1.png?sh=600&sw=600",

  "200m":
    "https://www.titan.co.in/dw/image/v2/BKDD_PRD/on/demandware.static/-/Sites-titan-master-catalog/default/dw8c8e8dc3/images/Titan/Catalog/10068KM02_1.png?sh=600&sw=600",
};


const collections = [
  {
    id: 1,
    title: "500M",
    subtitle: "COLLECTION",
    image: WATCH_IMAGES["500m"],
    features: [],
  },
  {
    id: 2,
    title: "300M",
    subtitle: "COLLECTION",
    image: WATCH_IMAGES["300m"],
    features: [],
  },
  {
    id: 3,
    title: "200M",
    subtitle: "COLLECTION",
    image: WATCH_IMAGES["200m"],
    features: [],
  },
  {
    id: 4,
    title: "100M",
    subtitle: "COLLECTION",
    image: null,
    features: [
      "120-CLICK UNIDIRECTIONAL BEZEL",
      "X1-C3 HIGH GRADE SUPERLUMINOVA",
      "ROBUST 316L SS CONSTRUCTION",
      "SCREW DOWN CROWN",
    ],
  },
];

/* =========================================================
   FRAMER MOTION
========================================================= */

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.16,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 70,
    scale: 0.96,
  },

  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.75,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function ExploreCollection() {
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
        <source src={VIDEO_SRC} type="video/mp4" />
      </video>

      {/* ===================================================
          VIDEO DARK OVERLAY
      =================================================== */}

      <div
        className="
          absolute
          inset-0
          bg-[rgba(0,16,29,0.66)]
        "
      />

      {/* ===================================================
          BLUE CENTER GLOW
      =================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-0
          h-full
          w-[50%]
          -translate-x-1/2
          bg-[radial-gradient(circle_at_center,rgba(16,143,185,0.24),transparent_67%)]
        "
      />

      {/* ===================================================
          TOP LIGHT / VIGNETTE
      =================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-gradient-to-b
          from-[#071b2b]/40
          via-transparent
          to-[#00101b]/65
        "
      />

      {/* ===================================================
          CONTENT
      =================================================== */}

      <div
        className="
          relative
          z-10
          mx-auto
          flex
          min-h-screen
          w-full
          max-w-[1900px]
          flex-col
          px-4
          pb-10
          pt-6
          sm:px-6
          sm:pt-7
          md:px-8
          lg:px-10
          xl:px-14
        "
      >
        {/* =================================================
            HEADING
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: -25,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.25,
          }}
          transition={{
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="flex justify-center"
        >
          <h2
            className="
              text-center
              text-[25px]
              font-light
              uppercase
              tracking-[0.22em]
              text-white
              sm:text-[28px]
              md:text-[31px]
              lg:text-[34px]
            "
          >
            Explore Collection
          </h2>
        </motion.div>

        {/* =================================================
            CARDS
        ================================================= */}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
            amount: 0.16,
          }}
          className="
            mt-6
            grid
            w-full
            grid-cols-1
            gap-5
            sm:grid-cols-2
            lg:grid-cols-4
            lg:gap-6
            xl:gap-7
          "
        >
          {collections.map((collection) => (
            <motion.article
              key={collection.id}
              variants={cardVariants}
              className="
                group
                relative
                flex
                min-h-[540px]
                w-full
                flex-col
                overflow-hidden
                rounded-[11px]
                border
                border-[#0786b5]/70
                bg-[rgba(4,25,42,0.78)]
                shadow-[0_0_14px_rgba(0,177,235,0.44),inset_0_0_25px_rgba(10,111,145,0.07)]
                backdrop-blur-[3px]
                transition-all
                duration-500
                hover:border-[#19bdf0]
                hover:shadow-[0_0_26px_rgba(0,190,255,0.62),inset_0_0_35px_rgba(7,140,184,0.10)]
                sm:min-h-[570px]
                lg:min-h-[575px]
                xl:min-h-[585px]
              "
            >
              {/* -----------------------------------------
                  CARD TOP GLOW
              ----------------------------------------- */}

              <div
                className="
                  pointer-events-none
                  absolute
                  left-1/2
                  top-0
                  h-[150px]
                  w-[70%]
                  -translate-x-1/2
                  rounded-full
                  bg-[#0b7698]/10
                  blur-[40px]
                "
              />

              {/* -----------------------------------------
                  WATCH IMAGE
              ----------------------------------------- */}

              <div
                className="
                  relative
                  flex
                  h-[330px]
                  items-center
                  justify-center
                  px-8
                  pt-6
                  sm:h-[345px]
                  lg:h-[345px]
                "
              >
                {collection.image ? (
                  <motion.img
                    src={collection.image}
                    alt={`${collection.title} collection`}
                    loading="lazy"
                    whileHover={{
                      scale: 1.045,
                      y: -5,
                    }}
                    transition={{
                      duration: 0.45,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="
                      relative
                      z-10
                      max-h-[310px]
                      w-auto
                      max-w-[90%]
                      object-contain
                      drop-shadow-[0_25px_25px_rgba(0,0,0,0.42)]
                    "
                  />
                ) : (
                  /* -------------------------------------
                     FEATURE CARD
                  ------------------------------------- */

                  <div
                    className="
                      flex
                      w-full
                      flex-col
                      items-start
                      justify-center
                      px-8
                    "
                  >
                    <ul className="space-y-4">
                      {collection.features.map((feature, index) => (
                        <motion.li
                          key={feature}
                          initial={{
                            opacity: 0,
                            x: 15,
                          }}
                          whileInView={{
                            opacity: 1,
                            x: 0,
                          }}
                          viewport={{
                            once: true,
                            amount: 0.3,
                          }}
                          transition={{
                            duration: 0.45,
                            delay: 0.15 + index * 0.08,
                          }}
                          className="
                            flex
                            items-start
                            text-left
                            text-[10px]
                            font-medium
                            leading-relaxed
                            tracking-[-0.01em]
                            text-[#d7f6ff]
                            sm:text-[11px]
                            md:text-[10px]
                            xl:text-[11px]
                          "
                        >
                          <span className="mr-2 text-[#a7edf9]">
                            •
                          </span>

                          <span>{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* -----------------------------------------
                  CARD BOTTOM CONTENT
              ----------------------------------------- */}

              <div
                className="
                  relative
                  z-10
                  mt-auto
                  flex
                  flex-col
                  items-center
                  pb-7
                  text-center
                "
              >
                {/* Collection Number */}
                <motion.h3
                  initial={{
                    opacity: 0,
                    y: 15,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                    amount: 0.35,
                  }}
                  transition={{
                    duration: 0.55,
                    delay: 0.15,
                  }}
                  className="
                    text-[33px]
                    font-bold
                    leading-none
                    tracking-[-0.03em]
                    text-white
                    sm:text-[36px]
                    md:text-[35px]
                    xl:text-[37px]
                  "
                >
                  {collection.title}
                </motion.h3>

                {/* COLLECTION */}
                <motion.p
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                    amount: 0.35,
                  }}
                  transition={{
                    duration: 0.5,
                    delay: 0.22,
                  }}
                  className="
                    mt-2
                    text-[16px]
                    font-light
                    uppercase
                    tracking-[0.20em]
                    text-white
                    sm:text-[17px]
                  "
                >
                  {collection.subtitle}
                </motion.p>

                {/* SHOP NOW */}
                <motion.button
                  initial={{
                    opacity: 0,
                    y: 12,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                    amount: 0.35,
                  }}
                  transition={{
                    duration: 0.55,
                    delay: 0.3,
                  }}
                  whileHover={{
                    y: -2,
                    scale: 1.03,
                  }}
                  whileTap={{
                    scale: 0.97,
                  }}
                  className="
                    group/button
                    mt-4
                    inline-flex
                    min-w-[150px]
                    items-center
                    justify-center
                    gap-2
                    rounded-[12px]
                    border
                    border-[#16789b]
                    bg-[#032638]/90
                    px-5
                    py-2.5
                    text-[14px]
                    font-bold
                    uppercase
                    tracking-[0.18em]
                    text-white
                    shadow-[0_4px_10px_rgba(0,155,210,0.35)]
                    transition-all
                    duration-300
                    hover:border-[#24bff1]
                    hover:bg-[#06394e]
                    hover:shadow-[0_7px_18px_rgba(0,180,240,0.48)]
                  "
                >
                  Shop Now

                  <ArrowRight
                    size={14}
                    strokeWidth={2.5}
                    className="
                      opacity-0
                      -translate-x-2
                      transition-all
                      duration-300
                      group-hover/button:translate-x-0
                      group-hover/button:opacity-100
                    "
                  />
                </motion.button>
              </div>

              {/* -----------------------------------------
                  BOTTOM INNER GLOW
              ----------------------------------------- */}

              <div
                className="
                  pointer-events-none
                  absolute
                  bottom-0
                  left-1/2
                  h-[85px]
                  w-[65%]
                  -translate-x-1/2
                  bg-[#057899]/10
                  blur-[35px]
                "
              />
            </motion.article>
          ))}
        </motion.div>

        {/* =================================================
            SHOP ALL
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.25,
          }}
          transition={{
            duration: 0.8,
            delay: 0.45,
          }}
          className="
            mt-7
            flex
            justify-center
            sm:mt-8
          "
        >
          <motion.button
            whileHover={{
              y: -3,
              scale: 1.02,
            }}
            whileTap={{
              scale: 0.97,
            }}
            className="
              inline-flex
              items-center
              gap-3
              rounded-[13px]
              border
              border-[#1a7c9d]
              bg-[#052536]/95
              px-7
              py-2.5
              text-[19px]
              font-bold
              uppercase
              tracking-[0.16em]
              text-white
              shadow-[0_6px_18px_rgba(0,160,215,0.40)]
              transition-all
              duration-300
              hover:border-[#25c2ef]
              hover:bg-[#06374d]
              hover:shadow-[0_9px_25px_rgba(0,190,240,0.55)]
              sm:px-8
              sm:py-3
              sm:text-[23px]
            "
          >
            Shop All

            <ArrowRight
              size={21}
              strokeWidth={2.5}
            />
          </motion.button>
        </motion.div>
      </div>

      {/* =================================================
          FLOATING COOKIE BUTTON
      ================================================= */}

      <motion.button
        initial={{
          opacity: 0,
          scale: 0.7,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        transition={{
          duration: 0.5,
          delay: 0.8,
        }}
        whileHover={{
          scale: 1.06,
        }}
        className="
          absolute
          bottom-3
          left-0
          z-30
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
          shadow-[0_3px_12px_rgba(0,0,0,0.30)]
          sm:h-[64px]
          sm:w-[64px]
        "
        aria-label="Cookie settings"
      >
        <Cookie
          size={32}
          strokeWidth={1.8}
        />
      </motion.button>
    </section>
  );
}