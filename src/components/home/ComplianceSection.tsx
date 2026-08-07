"use client";

import { motion } from "framer-motion";

const complianceCards = [
  {
    id: "i",
    title: "Regulatory Alignment",
    description:
      "Actively aligning with India's evolving direct-selling frameworks.",
  },
  {
    id: "ii",
    title: "Robust Compensation",
    description:
      "A transparent structure focused on leadership development.",
  },
  {
    id: "iii",
    title: "Corporate Governance",
    description:
      "The highest standards of ethics, compliance and accountability.",
  },
];

export default function ComplianceSection() {
  return (
    <section className="relative overflow-hidden bg-[#F7F3EA] py-16">

      {/* Background Glow */}

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-120px] h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#C89A2B]/5 blur-[140px]" />
        <div className="absolute right-[-120px] bottom-[-120px] h-[450px] w-[450px] rounded-full bg-[#C89A2B]/8 blur-[120px]" />
      </div>

      <div className="relative max-w-[1500px] mx-auto px-8 lg:px-16">

        {/* Chapter */}

        <div className="flex justify-center items-center gap-5 mb-4">
          <div className="w-12 h-[2px] bg-[#C89A2B]" />

          <span
            className="
            uppercase
            tracking-[4px]
            text-[13px]
            font-semibold
            text-[#C89A2B]
            "
          >
            FUTURE-READY & COMPLIANT
          </span>

        </div>

        {/* Heading */}

        <h2
          className="
          text-center
          text-[#111]
          leading-[0.9]
          font-serif
          text-[40px]
          md:text-[40px]
          lg:text-[40px]
          "
        >
          A proud advocate of{" "}

          <span className="italic text-[#C89A2B]">
            Aatmanirbhar Bharat
          </span>

        </h2>

        {/* Cards */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-12">
        {complianceCards.map((card, index) => (
  <motion.div
    key={card.id}
    initial={{
      opacity: 0,
      y: 60,
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
      duration: 0.7,
      delay: index * 0.15,
    }}
    whileHover={{
      y: -12,
      scale: 1.02,
    }}
    className="
      relative
      min-h-[340px]
      rounded-[10px]
      border
      border-[#DDD6C8]
      bg-white
      p-14
      shadow-[0_25px_70px_rgba(0,0,0,0.08)]
      transition-all
      duration-500
      overflow-hidden
      group
    "
  >
    {/* Hover Glow */}

    <div
      className="
        absolute
        inset-0
        opacity-0
        group-hover:opacity-100
        transition-all
        duration-500
      "
      style={{
        background:
          "radial-gradient(circle at top right, rgba(200,154,43,.08), transparent 65%)",
      }}
    />

    {/* Roman Number */}

    <span
      className="
        absolute
        top-10
        right-10
        text-[26px]
        font-serif
        text-[#D7D2C8]
        lowercase
      "
    >
      {card.id}
    </span>

    {/* Content */}

    <div className="relative z-10">

      <h3
        className="
          text-[#111]
          text-[34px]
          leading-tight
          font-serif
        "
      >
        {card.title}
      </h3>

      <p
        className="
          mt-6
          text-[20px]
          leading-[1.7]
          text-[#555]
          max-w-[360px]
        "
      >
        {card.description}
      </p>

    </div>

    {/* Bottom Gold Line */}

    <motion.div
      initial={{
        width: 0,
      }}
      whileHover={{
        width: "100%",
      }}
      transition={{
        duration: 0.4,
      }}
      className="
        absolute
        left-0
        bottom-0
        h-[3px]
        bg-[#C89A2B]
      "
    />
  </motion.div>
))}
        </div>
      </div>

      {/* Decorative Glow */}

      <div className="pointer-events-none absolute inset-0">

        <div
          className="
            absolute
            left-[-180px]
            top-1/2
            h-[420px]
            w-[420px]
            -translate-y-1/2
            rounded-full
            blur-[150px]
            opacity-20
          "
          style={{
            background: "#C89A2B",
          }}
        />

        <div
          className="
            absolute
            right-[-180px]
            bottom-[-120px]
            h-[420px]
            w-[420px]
            rounded-full
            blur-[170px]
            opacity-15
          "
          style={{
            background: "#C89A2B",
          }}
        />
      </div>

      {/* Background Noise */}

      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(#000 0.5px, transparent 0.5px)",
          backgroundSize: "12px 12px",
        }}
      />
    </section>
  );
}