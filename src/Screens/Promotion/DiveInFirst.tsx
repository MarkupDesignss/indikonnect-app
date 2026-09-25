"use client";

import React from "react";
import { motion } from "framer-motion";

/* =========================================================
   SAME UNDERWATER VIDEO
   Put your video here:
   /public/videos/indiekonnect-underwater.mp4
========================================================= */

const VIDEO_SRC = "/videos/indiekonnect-underwater.mp4";

/* =========================================================
   TEMPORARY WATCH IMAGE
   Replace with your own image later.
========================================================= */

const WATCH_IMAGE =
  "https://www.titan.co.in/dw/image/v2/BKDD_PRD/on/demandware.static/-/Sites-titan-master-catalog/default/dwde5f1793/images/Titan/Catalog/10071QM01_1.png?sh=800&sw=800";

/* =========================================================
   ANIMATION
========================================================= */

const parentVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.1,
    },
  },
};

const leftVariants = {
  hidden: {
    opacity: 0,
    x: -90,
    scale: 0.94,
  },

  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const rightVariants = {
  hidden: {
    opacity: 0,
    x: 90,
    scale: 0.96,
  },

  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const fieldVariants = {
  hidden: {
    opacity: 0,
    y: 25,
  },

  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

/* =========================================================
   COMPONENT
========================================================= */

export default function DiveInFirst() {
  const handleSubmit = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    // Add your API integration here.
    console.log("Form submitted");
  };

  return (
    <section
      className="
        relative
        min-h-screen
        w-full
        overflow-hidden
        bg-[#011522]
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
          absolute
          inset-0
          bg-[rgba(1,20,34,0.48)]
        "
      />

      {/* ===================================================
          BLUE OVERLAY / LIGHT
      =================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-[radial-gradient(circle_at_48%_50%,rgba(5,157,201,0.12),transparent_48%)]
        "
      />

      {/* ===================================================
          BOTTOM VIGNETTE
      =================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          bottom-0
          h-[35%]
          bg-gradient-to-t
          from-[#00111d]/55
          to-transparent
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
          max-w-[1750px]
          items-center
          px-5
          py-14
          sm:px-8
          md:px-12
          lg:px-16
          xl:px-20
        "
      >
        <motion.div
          variants={parentVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
            amount: 0.2,
          }}
          className="
            grid
            w-full
            grid-cols-1
            items-center
            gap-12
            lg:grid-cols-[1fr_0.85fr]
            lg:gap-16
            xl:gap-24
          "
        >
          {/* =================================================
              LEFT WATCH AREA
          ================================================= */}

          <motion.div
            variants={leftVariants}
            className="
              relative
              flex
              min-h-[450px]
              items-center
              justify-center
              sm:min-h-[540px]
              lg:min-h-[650px]
            "
          >
            {/* -------------------------------
                WATCH BLUE GLOW
            -------------------------------- */}

            <div
              className="
                pointer-events-none
                absolute
                left-1/2
                top-1/2
                h-[330px]
                w-[330px]
                -translate-x-1/2
                -translate-y-1/2
                rounded-full
                bg-cyan-400/10
                blur-[90px]
                sm:h-[430px]
                sm:w-[430px]
                lg:h-[500px]
                lg:w-[500px]
              "
            />

            {/* -------------------------------
                WATER BUBBLES / DECORATIVE
            -------------------------------- */}

            <motion.div
              animate={{
                y: [-10, 8, -10],
                opacity: [0.35, 0.7, 0.35],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="
                absolute
                left-[15%]
                top-[18%]
                h-3
                w-3
                rounded-full
                bg-cyan-300/60
                blur-[1px]
                sm:left-[20%]
              "
            />

            <motion.div
              animate={{
                y: [10, -15, 10],
                opacity: [0.2, 0.6, 0.2],
              }}
              transition={{
                duration: 3.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="
                absolute
                left-[25%]
                top-[12%]
                h-2
                w-2
                rounded-full
                bg-cyan-200/70
              "
            />

            <motion.div
              animate={{
                y: [-15, 8, -15],
                opacity: [0.25, 0.6, 0.25],
              }}
              transition={{
                duration: 4.7,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="
                absolute
                left-[29%]
                top-[29%]
                h-4
                w-4
                rounded-full
                bg-cyan-300/45
                blur-[1px]
              "
            />

            <motion.div
              animate={{
                y: [8, -12, 8],
                opacity: [0.2, 0.55, 0.2],
              }}
              transition={{
                duration: 3.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="
                absolute
                left-[19%]
                top-[40%]
                h-2
                w-2
                rounded-full
                bg-cyan-100/70
              "
            />

            {/* -------------------------------
                WATCH
            -------------------------------- */}

            <motion.img
              src={WATCH_IMAGE}
              alt="Professional diver watch"
              className="
                relative
                z-10
                w-[255px]
                object-contain
                drop-shadow-[0_30px_35px_rgba(0,0,0,0.5)]
                sm:w-[330px]
                md:w-[390px]
                lg:w-[430px]
                xl:w-[475px]
              "
              animate={{
                y: [0, -7, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* -------------------------------
                SMALL BUBBLES BELOW WATCH
            -------------------------------- */}

            <div className="absolute bottom-[14%] left-[31%] z-20 flex gap-2 sm:left-[28%]">
              <motion.span
                animate={{
                  y: [0, -20],
                  opacity: [0.8, 0],
                }}
                transition={{
                  duration: 2.1,
                  repeat: Infinity,
                  delay: 0,
                }}
                className="h-3 w-3 rounded-full bg-cyan-300/70"
              />

              <motion.span
                animate={{
                  y: [0, -25],
                  opacity: [0.8, 0],
                }}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                  delay: 0.55,
                }}
                className="h-2 w-2 rounded-full bg-cyan-200/70"
              />

              <motion.span
                animate={{
                  y: [0, -18],
                  opacity: [0.7, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: 1,
                }}
                className="h-4 w-4 rounded-full bg-cyan-300/50"
              />
            </div>
          </motion.div>

          {/* =================================================
              RIGHT FORM
          ================================================= */}

          <motion.div
            variants={rightVariants}
            className="
              mx-auto
              w-full
              max-w-[520px]
              lg:mx-0
              lg:max-w-[560px]
            "
          >
            {/* -------------------------------
                HEADING
            -------------------------------- */}

            <motion.h2
              variants={fieldVariants}
              className="
                text-center
                text-[38px]
                font-black
                uppercase
                leading-none
                tracking-[-0.045em]
                text-white
                sm:text-[47px]
                md:text-[52px]
                lg:text-left
                lg:text-[56px]
                xl:text-[60px]
              "
            >
              Dive In First
            </motion.h2>

            {/* -------------------------------
                FORM
            -------------------------------- */}

            <form
              onSubmit={handleSubmit}
              className="
                mt-10
                w-full
                sm:mt-12
              "
            >
              {/* NAME */}
              <motion.div
                variants={fieldVariants}
                className="mb-6"
              >
                <input
                  type="text"
                  name="name"
                  placeholder="NAME"
                  required
                  className="
                    h-[64px]
                    w-full
                    rounded-none
                    border
                    border-cyan-500/80
                    bg-[rgba(13,45,65,0.62)]
                    px-5
                    text-[15px]
                    font-medium
                    uppercase
                    tracking-[0.12em]
                    text-white
                    outline-none
                    placeholder:text-white/70
                    transition-all
                    duration-300
                    focus:border-cyan-300
                    focus:bg-[rgba(13,51,73,0.78)]
                    focus:shadow-[0_0_16px_rgba(0,194,255,0.18)]
                    sm:h-[66px]
                  "
                />
              </motion.div>

              {/* PHONE */}
              <motion.div
                variants={fieldVariants}
                className="mb-6"
              >
                <input
                  type="tel"
                  name="phone"
                  placeholder="PHONE NO."
                  required
                  className="
                    h-[64px]
                    w-full
                    rounded-none
                    border
                    border-cyan-500/80
                    bg-[rgba(13,45,65,0.62)]
                    px-5
                    text-[15px]
                    font-medium
                    uppercase
                    tracking-[0.12em]
                    text-white
                    outline-none
                    placeholder:text-white/70
                    transition-all
                    duration-300
                    focus:border-cyan-300
                    focus:bg-[rgba(13,51,73,0.78)]
                    focus:shadow-[0_0_16px_rgba(0,194,255,0.18)]
                    sm:h-[66px]
                  "
                />
              </motion.div>

              {/* EMAIL */}
              <motion.div
                variants={fieldVariants}
                className="mb-7"
              >
                <input
                  type="email"
                  name="email"
                  placeholder="E-MAIL"
                  required
                  className="
                    h-[64px]
                    w-full
                    rounded-none
                    border
                    border-cyan-500/80
                    bg-[rgba(13,45,65,0.62)]
                    px-5
                    text-[15px]
                    font-medium
                    uppercase
                    tracking-[0.12em]
                    text-white
                    outline-none
                    placeholder:text-white/70
                    transition-all
                    duration-300
                    focus:border-cyan-300
                    focus:bg-[rgba(13,51,73,0.78)]
                    focus:shadow-[0_0_16px_rgba(0,194,255,0.18)]
                    sm:h-[66px]
                  "
                />
              </motion.div>

              {/* SUBMIT */}
              <motion.button
                variants={fieldVariants}
                whileHover={{
                  y: -2,
                  scale: 1.02,
                }}
                whileTap={{
                  scale: 0.97,
                }}
                type="submit"
                className="
                  rounded-[12px]
                  border
                  border-cyan-700
                  bg-[#052c40]
                  px-6
                  py-3
                  text-[18px]
                  font-extrabold
                  uppercase
                  tracking-[0.16em]
                  text-white
                  shadow-[0_7px_16px_rgba(0,163,220,0.30)]
                  transition-all
                  duration-300
                  hover:border-cyan-400
                  hover:bg-[#06384e]
                  hover:shadow-[0_10px_22px_rgba(0,190,240,0.40)]
                "
              >
                Submit
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}