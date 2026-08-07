"use client";

import React from "react";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import Image from "next/image";

const testimonials = [
  {
    id: 1,
    name: "Ananya R.",
    role: "Builder · Jaipur",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
    quote:
      "IndieKonnect gave me more than products. It gave me a community, and the confidence to build something that is genuinely my own.",
  },
  {
    id: 2,
    name: "Vikram S.",
    role: "Leader · Pune",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80",
    quote:
      "The transparency and ethics won my trust first. This feels like a brand building for the long term, not the quarter.",
  },
  {
    id: 3,
    name: "Meera K.",
    role: "Director · Indore",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80",
    quote:
      "From homemaker to team leader. My own journey is the proof that the possibilities really are endless here.",
  },
  {
    id: 4,
    name: "Priya N.",
    role: "Associate · Kochi",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80",
    quote:
      "I joined for the catalogue. I stayed for the mentorship, which is the part nobody advertises and everyone needs.",
  },
  {
    id: 5,
    name: "Rahul M.",
    role: "Ambassador · Delhi",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80",
    quote:
      "Everything feels premium. The products, the people and the support system all reflect long-term thinking.",
  },
];

// 10 cards ke liye - 2 baar duplicate
const sliderData = [...testimonials, ...testimonials];

export default function Testimonials() {
  return (
    <section className="relative overflow-hidden bg-[#F7F3EA] py-12">
      {/* Heading */}
      <div className="max-w-7xl mx-auto text-center px-6">
        <div className="flex justify-center items-center gap-4 mb-8">
          <div className="w-12 h-[2px] bg-[#C89A2B]" />
          <p className="uppercase tracking-[4px] text-[#C89A2B] text-sm font-semibold">
            CHAPTER SEVEN · THE PEOPLE
          </p>
        </div>

        <h2 className="text-[65px] md:text-[72px] leading-[0.9] font-serif text-[#111]">
          People &
          <br className="mb-8" />
          <span className="italic text-[#C89A2B]">possibilities</span>
        </h2>
      </div>

      {/* Slider Wrapper */}
      <div className="relative mt-24">
        {/* Left Fade */}
        <div className="absolute left-0 top-0 z-20 h-full w-40 bg-gradient-to-r from-[#F7F3EA] to-transparent" />

        {/* Right Fade */}
        <div className="absolute right-0 top-0 z-20 h-full w-40 bg-gradient-to-l from-[#F7F3EA] to-transparent" />

        <motion.div
          className="flex gap-8 w-max"
          animate={{
            x: ["0%", "-50%"],
          }}
          transition={{
            duration: 40, 
            ease: "linear",
            repeat: Infinity,
          }}
        >
          {sliderData.map((item, index) => (
            <motion.div
              key={index}
              whileHover={{
                y: -8,
                scale: 1.02,
              }}
              transition={{
                duration: 0.35,
              }}
              className="
                testimonial-card
                w-[470px]
                min-h-[360px]
                rounded-sm
                bg-white
                border
                border-[#E7E2D7]
                shadow-[0_20px_60px_rgba(0,0,0,0.08)]
                flex
                flex-col
                justify-between
                p-12
                flex-shrink-0
              "
            >
              {/* Quote */}
              <div>
                <Quote
                  size={32}
                  strokeWidth={2.3}
                  className="text-[#C89A2B]"
                />
                <p className="mt-10 text-[20px] leading-[1.6] text-[#111] font-serif">
                  {item.quote}
                </p>
              </div>

              {/* Bottom */}
              <div className="flex items-center gap-5 mt-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden border border-[#ddd] flex-shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="54px"
                  />
                </div>
                <div>
                  <h4 className="text-[22px] text-[#111] font-semibold">
                    {item.name}
                  </h4>
                  <p className="mt-1 text-[17px] text-[#777] tracking-wide">
                    {item.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Background Decoration */}
      <div className="absolute -top-40 left-0 w-[500px] h-[500px] rounded-full bg-[#C89A2B]/5 blur-[120px]" />
      <div className="absolute bottom-[-250px] right-0 w-[600px] h-[600px] rounded-full bg-[#C89A2B]/5 blur-[140px]" />

      {/* Custom CSS */}
      <style jsx>{`
        @media (max-width: 1024px) {
          .testimonial-card {
            width: 380px;
            min-height: 340px;
          }
        }

        @media (max-width: 768px) {
          .testimonial-card {
            width: 320px;
            min-height: 300px;
            padding: 30px;
          }
        }

        @media (max-width: 500px) {
          .testimonial-card {
            width: 280px;
            min-height: 280px;
            padding: 24px;
          }
        }
      `}</style>
    </section>
  );
}