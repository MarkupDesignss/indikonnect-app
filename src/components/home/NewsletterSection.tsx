"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(email);
    setEmail("");
  };

  return (
    <section
      className="relative overflow-hidden py-24 px-6 min-h-[500px] flex items-center"
      style={{
        background: "#FFFDF7",
      }}
    >
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top right glow */}
        <div
          className="absolute -top-32 right-0 w-[500px] h-[500px] rounded-full blur-[120px]"
          style={{
            background: "rgba(218, 165, 32, 0.06)",
          }}
        />
        
        {/* Bottom left glow */}
        <div
          className="absolute -bottom-32 left-0 w-[400px] h-[400px] rounded-full blur-[100px]"
          style={{
            background: "rgba(218, 165, 32, 0.04)",
          }}
        />

        {/* Decorative dots */}
        <div className="absolute top-12 left-8 w-2 h-2 rounded-full bg-[#D4A843]/30" />
        <div className="absolute top-20 right-16 w-3 h-3 rounded-full bg-[#D4A843]/20" />
        <div className="absolute bottom-20 left-1/4 w-2 h-2 rounded-full bg-[#D4A843]/25" />
        <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 rounded-full bg-[#D4A843]/20" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {/* Small Label with Sparkle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center gap-2.5 mb-6"
        >
          <Sparkles size={16} color="#D4A843" />
          <span
            className="text-[13px] font-medium tracking-[3px] uppercase"
            style={{
              color: "#D4A843",
              fontFamily: "system-ui, -apple-system, sans-serif",
              letterSpacing: "3px",
            }}
          >
            Stay Connected
          </span>
        </motion.div>

        {/* Main Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-serif"
          style={{
            fontFamily: "'Playfair Display', 'Times New Roman', serif",
            fontWeight: 400,
            color: "#1A1A1A",
            fontSize: "clamp(48px, 8vw, 88px)",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
          }}
        >
          Inspiration,
          <br />
          <span
            style={{
              color: "#D4A843",
              fontStyle: "italic",
            }}
          >
            delivered.
          </span>
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 max-w-2xl mx-auto"
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 400,
            color: "#666666",
            fontSize: "clamp(17px, 1.4vw, 20px)",
            lineHeight: 1.7,
          }}
        >
          Insights, opportunities and product launches,
          <br className="hidden sm:block" />
          straight to your inbox.
        </motion.p>

        {/* Subscription Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 max-w-xl mx-auto"
        >
          <form onSubmit={handleSubmit}>
            <div
              className={`
                relative
                flex
                items-center
                bg-white
                rounded-full
                border
                transition-all
                duration-300
                shadow-sm
                hover:shadow-md
                ${isFocused ? "shadow-md" : ""}
              `}
              style={{
                borderColor: isFocused ? "#D4A843" : "#E8E2D6",
                boxShadow: isFocused 
                  ? "0 8px 30px rgba(212, 168, 67, 0.12)" 
                  : "0 2px 10px rgba(0, 0, 0, 0.04)",
              }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="you@example.com"
                required
                className="
                  flex-1
                  bg-transparent
                  px-7
                  py-4.5
                  text-[15px]
                  outline-none
                  rounded-full
                "
                style={{
                  color: "#1A1A1A",
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  fontWeight: 400,
                }}
              />

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="
                  absolute
                  right-1.5
                  top-1/2
                  -translate-y-1/2
                  flex
                  items-center
                  gap-2
                  px-6
                  py-3
                  text-white
                  font-medium
                  text-[14px]
                  rounded-full
                  transition-all
                  duration-300
                  group
                "
                style={{
                  background: "#D4A843",
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  fontWeight: 500,
                  letterSpacing: "0.3px",
                }}
              >
                <span>Subscribe</span>
                <ArrowRight 
                  size={16} 
                  className="transition-transform duration-300 group-hover:translate-x-1" 
                  style={{ strokeWidth: 2 }}
                />
              </motion.button>
            </div>
          </form>

          {/* Trust indicator */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-5 text-[13px]"
            style={{
              color: "#999999",
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontWeight: 400,
              letterSpacing: "0.3px",
            }}
          >
            ✦ No spam, unsubscribe anytime
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}