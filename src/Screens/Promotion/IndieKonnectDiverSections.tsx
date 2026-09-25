"use client";

import React, { useRef } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
} from "framer-motion";

/* =========================================================
   TEMPORARY ONLINE WATCH IMAGE
   Replace this later with your own IndieKonnect image:
   /images/indiekonnect-watch.png
========================================================= */
const WATCH_IMAGE =
  "https://www.titan.co.in/dw/image/v2/BKDD_PRD/on/demandware.static/-/Sites-titan-master-catalog/default/dwde5f1793/images/Titan/Catalog/10071QM01_1.png?sh=600&sw=600";

/* =========================================================
   VIDEO
   Put your underwater video here:
   /public/videos/indiekonnect-underwater.mp4
========================================================= */
const VIDEO_SRC = "/videos/indiekonnect-underwater.mp4";

/* =========================================================
   FEATURE DATA
========================================================= */
const features = [
  {
    id: 1,
    side: "left",
    title: (
      <>
        X1-C3 HIGH GRADE
        <br />
        SUPERLUMINOVA
      </>
    ),
  },
  {
    id: 2,
    side: "left",
    title: (
      <>
        HELIUM ESCAPE
        <br />
        VALVE
      </>
    ),
  },
  {
    id: 3,
    side: "left",
    title: (
      <>
        IN-HOUSE AUTOMATIC
        <br />
        MOVEMENT
      </>
    ),
  },
  {
    id: 4,
    side: "right",
    title: (
      <>
        AQUA LOCK BEZEL WITH
        <br />
        UNIDIRECTIONAL MOVEMENT
      </>
    ),
  },
  {
    id: 5,
    side: "right",
    title: (
      <>
        SCREW DOWN
        <br />
        CROWN
      </>
    ),
  },
  {
    id: 6,
    side: "right",
    title: (
      <>
        SAPPHIRE CRYSTAL
        <br />
        WITH 3 LAYER ARC
      </>
    ),
  },
];

/* =========================================================
   COMMON ANIMATION
========================================================= */
const itemVariants = {
  hiddenLeft: {
    opacity: 0,
    x: -70,
    filter: "blur(5px)",
  },

  hiddenRight: {
    opacity: 0,
    x: 70,
    filter: "blur(5px)",
  },

  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.75,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

/* =========================================================
   MAIN COMPONENT
========================================================= */
export default function IndieKonnectDiverSections() {
  const featureRef = useRef<HTMLDivElement | null>(null);

  const isInView = useInView(featureRef, {
    once: true,
    amount: 0.3,
  });

  const reducedMotion = useReducedMotion();

  return (
    <main className="w-full overflow-hidden bg-[#001824] text-white">

      {/* ===================================================
          SECTION 1
          WATCH FEATURE SECTION
      =================================================== */}
      <section
        ref={featureRef}
        className="
          relative
          min-h-screen
          w-full
          overflow-hidden
          bg-[#001724]
        "
      >
        {/* -------------------------------
            BACKGROUND VIDEO
        -------------------------------- */}
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
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

        {/* -------------------------------
            DARK BLUE OVERLAY
        -------------------------------- */}
        <div
          className="
            absolute
            inset-0
            bg-[rgba(0,20,32,0.33)]
          "
        />

        {/* -------------------------------
            BLUE GRADIENT
        -------------------------------- */}
        <div
          className="
            absolute
            inset-0
            bg-gradient-to-b
            from-[#002337]/20
            via-[#003f59]/5
            to-[#00111d]/45
          "
        />

        {/* =================================================
            DESKTOP CONTENT
        ================================================= */}
        <div
          className="
            relative
            z-10
            hidden
            min-h-screen
            w-full
            lg:block
          "
        >
          {/* -----------------------------------------------
              TOP TITLE
          ------------------------------------------------ */}
          <motion.div
            initial={
              reducedMotion
                ? false
                : {
                    opacity: 0,
                    y: -25,
                  }
            }
            animate={
              reducedMotion
                ? {
                    opacity: 1,
                    y: 0,
                  }
                : isInView
                ? {
                    opacity: 1,
                    y: 0,
                  }
                : {
                    opacity: 0,
                    y: -25,
                  }
            }
            transition={{
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
              absolute
              left-1/2
              top-[30px]
              -translate-x-1/2
              whitespace-nowrap
              text-center
              text-[25px]
              font-light
              tracking-[0.30em]
              text-white
              xl:text-[29px]
            "
          >
            Professional Diver&apos;s Automatic Watch
          </motion.div>

          {/* -----------------------------------------------
              WATCH IMAGE
          ------------------------------------------------ */}
          <motion.div
            initial={
              reducedMotion
                ? false
                : {
                    opacity: 0,
                    scale: 0.92,
                    y: 30,
                  }
            }
            animate={
              reducedMotion
                ? {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                  }
                : isInView
                ? {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                  }
                : {
                    opacity: 0,
                    scale: 0.92,
                    y: 30,
                  }
            }
            transition={{
              duration: 1,
              delay: 0.15,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
              absolute
              left-1/2
              top-[52%]
              z-20
              w-[330px]
              -translate-x-1/2
              -translate-y-1/2
              xl:w-[385px]
              2xl:w-[420px]
            "
          >
            <img
              src={WATCH_IMAGE}
              alt="Professional diver watch"
              className="
                block
                h-auto
                w-full
                object-contain
                drop-shadow-[0_25px_45px_rgba(0,0,0,0.45)]
              "
            />
          </motion.div>

          {/* =================================================
              WHITE ANNOTATION SVG
          ================================================= */}
          <svg
            className="
              pointer-events-none
              absolute
              inset-0
              z-30
              h-full
              w-full
            "
            viewBox="0 0 1381 743"
            preserveAspectRatio="none"
            fill="none"
          >
            {/* =============================================
                LEFT TOP LINE
            ============================================== */}
            <motion.path
              d="M365 234 H510 L565 211"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              variants={{
                hidden: {
                  pathLength: 0,
                  opacity: 0,
                },
                visible: {
                  pathLength: 1,
                  opacity: 1,
                  transition: {
                    duration: 0.55,
                    delay: 0.55,
                  },
                },
              }}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
            />

            <motion.circle
              cx="565"
              cy="211"
              r="6.5"
              fill="white"
              variants={{
                hidden: {
                  scale: 0,
                  opacity: 0,
                },
                visible: {
                  scale: 1,
                  opacity: 1,
                  transition: {
                    duration: 0.3,
                    delay: 1.05,
                  },
                },
              }}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              style={{
                transformOrigin: "565px 211px",
              }}
            />

            {/* =============================================
                LEFT MIDDLE LINE
            ============================================== */}
            <motion.path
              d="M290 316 H526"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              variants={{
                hidden: {
                  pathLength: 0,
                  opacity: 0,
                },
                visible: {
                  pathLength: 1,
                  opacity: 1,
                  transition: {
                    duration: 0.55,
                    delay: 1.1,
                  },
                },
              }}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
            />

            <motion.circle
              cx="526"
              cy="316"
              r="6.5"
              fill="white"
              variants={{
                hidden: {
                  scale: 0,
                  opacity: 0,
                },
                visible: {
                  scale: 1,
                  opacity: 1,
                  transition: {
                    duration: 0.3,
                    delay: 1.65,
                  },
                },
              }}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              style={{
                transformOrigin: "526px 316px",
              }}
            />

            {/* =============================================
                LEFT BOTTOM LINE
            ============================================== */}
            <motion.path
              d="M348 427 H507 L552 401"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              variants={{
                hidden: {
                  pathLength: 0,
                  opacity: 0,
                },
                visible: {
                  pathLength: 1,
                  opacity: 1,
                  transition: {
                    duration: 0.55,
                    delay: 1.7,
                  },
                },
              }}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
            />

            <motion.circle
              cx="552"
              cy="401"
              r="6.5"
              fill="white"
              variants={{
                hidden: {
                  scale: 0,
                  opacity: 0,
                },
                visible: {
                  scale: 1,
                  opacity: 1,
                  transition: {
                    duration: 0.3,
                    delay: 2.25,
                  },
                },
              }}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              style={{
                transformOrigin: "552px 401px",
              }}
            />

            {/* =============================================
                RIGHT TOP LINE
            ============================================== */}
            <motion.path
              d="M944 154 H781 L742 178"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              variants={{
                hidden: {
                  pathLength: 0,
                  opacity: 0,
                },
                visible: {
                  pathLength: 1,
                  opacity: 1,
                  transition: {
                    duration: 0.55,
                    delay: 2.3,
                  },
                },
              }}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
            />

            <motion.circle
              cx="742"
              cy="178"
              r="6.5"
              fill="white"
              variants={{
                hidden: {
                  scale: 0,
                  opacity: 0,
                },
                visible: {
                  scale: 1,
                  opacity: 1,
                  transition: {
                    duration: 0.3,
                    delay: 2.85,
                  },
                },
              }}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              style={{
                transformOrigin: "742px 178px",
              }}
            />

            {/* =============================================
                RIGHT MIDDLE LINE
            ============================================== */}
            <motion.path
              d="M960 292 H809 L797 286"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              variants={{
                hidden: {
                  pathLength: 0,
                  opacity: 0,
                },
                visible: {
                  pathLength: 1,
                  opacity: 1,
                  transition: {
                    duration: 0.55,
                    delay: 2.9,
                  },
                },
              }}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
            />

            <motion.circle
              cx="797"
              cy="286"
              r="6.5"
              fill="white"
              variants={{
                hidden: {
                  scale: 0,
                  opacity: 0,
                },
                visible: {
                  scale: 1,
                  opacity: 1,
                  transition: {
                    duration: 0.3,
                    delay: 3.45,
                  },
                },
              }}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              style={{
                transformOrigin: "797px 286px",
              }}
            />

            {/* =============================================
                RIGHT BOTTOM LINE
            ============================================== */}
            <motion.path
              d="M975 367 H808 L770 344"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              variants={{
                hidden: {
                  pathLength: 0,
                  opacity: 0,
                },
                visible: {
                  pathLength: 1,
                  opacity: 1,
                  transition: {
                    duration: 0.55,
                    delay: 3.5,
                  },
                },
              }}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
            />

            <motion.circle
              cx="770"
              cy="344"
              r="6.5"
              fill="white"
              variants={{
                hidden: {
                  scale: 0,
                  opacity: 0,
                },
                visible: {
                  scale: 1,
                  opacity: 1,
                  transition: {
                    duration: 0.3,
                    delay: 4.05,
                  },
                },
              }}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              style={{
                transformOrigin: "770px 344px",
              }}
            />
          </svg>

          {/* =================================================
              LEFT TEXT BLOCKS
          ================================================= */}
          <div className="absolute inset-0 z-40">
            {/* LEFT 1 */}
            <motion.div
              initial="hiddenLeft"
              animate={
                isInView
                  ? "visible"
                  : "hiddenLeft"
              }
              variants={itemVariants}
              transition={{
                delay: 0.55,
              }}
              className="
                absolute
                left-[7%]
                top-[25%]
                text-right
              "
            >
              <FeatureText>
                {features[0].title}
              </FeatureText>
            </motion.div>

            {/* LEFT 2 */}
            <motion.div
              initial="hiddenLeft"
              animate={
                isInView
                  ? "visible"
                  : "hiddenLeft"
              }
              variants={itemVariants}
              transition={{
                delay: 1.1,
              }}
              className="
                absolute
                left-[4.8%]
                top-[39.5%]
                text-right
              "
            >
              <FeatureText>
                {features[1].title}
              </FeatureText>
            </motion.div>

            {/* LEFT 3 */}
            <motion.div
              initial="hiddenLeft"
              animate={
                isInView
                  ? "visible"
                  : "hiddenLeft"
              }
              variants={itemVariants}
              transition={{
                delay: 1.7,
              }}
              className="
                absolute
                left-[3%]
                top-[49%]
                text-right
              "
            >
              <FeatureText>
                {features[2].title}
              </FeatureText>
            </motion.div>

            {/* =================================================
                RIGHT TEXT BLOCKS
            ================================================= */}

            {/* RIGHT 1 */}
            <motion.div
              initial="hiddenRight"
              animate={
                isInView
                  ? "visible"
                  : "hiddenRight"
              }
              variants={itemVariants}
              transition={{
                delay: 2.3,
              }}
              className="
                absolute
                right-[6%]
                top-[14%]
                text-left
              "
            >
              <FeatureText>
                {features[3].title}
              </FeatureText>
            </motion.div>

            {/* RIGHT 2 */}
            <motion.div
              initial="hiddenRight"
              animate={
                isInView
                  ? "visible"
                  : "hiddenRight"
              }
              variants={itemVariants}
              transition={{
                delay: 2.9,
              }}
              className="
                absolute
                right-[8.8%]
                top-[28%]
                text-left
              "
            >
              <FeatureText>
                {features[4].title}
              </FeatureText>
            </motion.div>

            {/* RIGHT 3 */}
            <motion.div
              initial="hiddenRight"
              animate={
                isInView
                  ? "visible"
                  : "hiddenRight"
              }
              variants={itemVariants}
              transition={{
                delay: 3.5,
              }}
              className="
                absolute
                right-[7.5%]
                top-[42%]
                text-left
              "
            >
              <FeatureText>
                {features[5].title}
              </FeatureText>
            </motion.div>
          </div>

          {/* =================================================
              INDIEKONNECT SMALL BRAND
          ================================================= */}
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: isInView ? 1 : 0,
            }}
            transition={{
              duration: 0.8,
              delay: 4.15,
            }}
            className="
              absolute
              bottom-[7%]
              left-1/2
              z-40
              -translate-x-1/2
              text-center
            "
          >
            <p
              className="
                text-[12px]
                font-medium
                uppercase
                tracking-[0.45em]
                text-white/90
                sm:text-[14px]
              "
            >
              INDIEKONNECT
            </p>
          </motion.div>
        </div>

        {/* =================================================
            MOBILE VERSION
        ================================================= */}
        <div
          className="
            relative
            z-10
            flex
            min-h-screen
            flex-col
            px-5
            py-9
            lg:hidden
          "
        >
          {/* TITLE */}
          <motion.h2
            initial={{
              opacity: 0,
              y: -15,
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
              duration: 0.7,
            }}
            className="
              text-center
              text-[17px]
              font-light
              leading-relaxed
              tracking-[0.18em]
              text-white
              sm:text-[21px]
            "
          >
            Professional Diver&apos;s Automatic Watch
          </motion.h2>

          {/* WATCH */}
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.9,
            }}
            whileInView={{
              opacity: 1,
              scale: 1,
            }}
            viewport={{
              once: true,
              amount: 0.25,
            }}
            transition={{
              duration: 0.9,
            }}
            className="
              mx-auto
              mt-7
              w-[270px]
              sm:w-[330px]
            "
          >
            <img
              src={WATCH_IMAGE}
              alt="Professional diver watch"
              className="w-full object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.45)]"
            />
          </motion.div>

          {/* MOBILE FEATURES */}
          <div className="mx-auto mt-4 flex w-full max-w-[520px] flex-col gap-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.id}
                initial={{
                  opacity: 0,
                  y: 25,
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
                  duration: 0.65,
                  delay: index * 0.12,
                }}
                className="
                  rounded-xl
                  border
                  border-white/15
                  bg-black/20
                  px-4
                  py-3
                  text-center
                  backdrop-blur-sm
                "
              >
                <p className="
                  text-[11px]
                  font-semibold
                  leading-6
                  tracking-[0.18em]
                  text-white
                  sm:text-[13px]
                ">
                  {feature.title}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="mt-auto pt-8 text-center">
            <p className="text-[11px] uppercase tracking-[0.4em] text-white/80">
              INDIEKONNECT
            </p>
          </div>
        </div>
      </section>

      {/* ===================================================
          SECTION 2
          500M
      =================================================== */}
      <section
        className="
          relative
          min-h-[55vh]
          w-full
          overflow-hidden
          bg-[#001724]
          sm:min-h-[65vh]
          lg:min-h-[72vh]
        "
      >
        {/* VIDEO */}
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
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

        {/* OVERLAY */}
        <div className="absolute inset-0 bg-[#001b2a]/25" />

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-b
            from-transparent
            via-[#00405b]/5
            to-[#00111c]/40
          "
        />

        {/* CONTENT */}
        <div
          className="
            relative
            z-10
            flex
            min-h-[55vh]
            flex-col
            items-center
            justify-between
            px-5
            py-10
            sm:min-h-[65vh]
            sm:py-14
            lg:min-h-[72vh]
            lg:py-16
          "
        >
          {/* BIG 500M */}
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.85,
              y: 35,
            }}
            whileInView={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              amount: 0.3,
            }}
            transition={{
              duration: 1,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
              mt-2
              select-none
              text-center
              text-[130px]
              font-black
              leading-none
              tracking-[-0.06em]
              text-white/45
              sm:text-[190px]
              md:text-[250px]
              lg:text-[300px]
              xl:text-[350px]
            "
          >
            500M
          </motion.div>

          {/* BOTTOM TEXT */}
          <motion.div
            initial={{
              opacity: 0,
              y: 25,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              amount: 0.3,
            }}
            transition={{
              duration: 0.8,
              delay: 0.35,
            }}
            className="
              mb-3
              text-center
              sm:mb-5
            "
          >
            <p
              className="
                text-[18px]
                font-light
                tracking-[0.18em]
                text-white
                sm:text-[24px]
                md:text-[30px]
                lg:text-[36px]
              "
            >
              Professional Diver&apos;s Automatic Watch
            </p>

            <p
              className="
                mt-3
                text-[10px]
                uppercase
                tracking-[0.4em]
                text-white/65
                sm:text-[12px]
              "
            >
              Built For Extreme Depth
            </p>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

/* =========================================================
   FEATURE TEXT COMPONENT
========================================================= */
function FeatureText({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <p
      className="
        whitespace-nowrap
        text-[15px]
        font-semibold
        leading-[1.9]
        tracking-[0.22em]
        text-white
        drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)]
        xl:text-[17px]
        2xl:text-[18px]
      "
    >
      {children}
    </p>
  );
}