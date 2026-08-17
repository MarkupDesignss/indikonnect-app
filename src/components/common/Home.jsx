// components/common/Home.tsx (or IndieKonnectHome.tsx)

"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  Phone,
  MapPin,
  ArrowUp,
  Send,
  Sparkles,
  Gem,
  Crown,
  Star,
  Zap,
} from "lucide-react";
import Footer from "../Footer/Footer";
import {
  FaTwitter,
  FaInstagram,
  FaFacebook,
  FaYoutube,
  FaLinkedin,
} from "react-icons/fa";
import s from "./IndieKonnectHome.module.css";
import {
  ticker,
  nav,
  heroStats,
  categories,
  catFilters,
  products,
  reels,
  promises,
  trustStats,
  offers,
  levels,
  gallery,
  socials,
} from "./catalog";

import Logo from "../../../public/indiekonnect-web/images/logo.png";
import Header from "./Header";

// Light mode color palette
const GOLD = "#C9A96E";
const GOLD_LIGHT = "#E8D5A3";
const GOLD_DARK = "#A8894F";
const AMETHYST = "#8B7BBF";
const AMETHYST_LIGHT = "#A895D6";
const RUBY = "#C44A6A";
const EMERALD = "#4BBF8A";
const BG_PRIMARY = "#F8F6F2";
const BG_SECONDARY = "#FFFFFF";
const TEXT_PRIMARY = "#1A1A24";
const TEXT_SECONDARY = "#6B6882";
const TEXT_MUTED = "#9A97B0";
const BORDER_COLOR = "rgba(0,0,0,0.06)";
const BORDER_GLOW = "rgba(201,169,110,0.15)";

const kicker = {
  fontSize: 10.5,
  letterSpacing: ".24em",
  textTransform: "uppercase",
  color: GOLD,
  fontWeight: 700,
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const h2 = {
  margin: "14px 0 0",
  fontFamily: "'Fraunces', serif",
  fontSize: 40,
  fontWeight: 400,
  letterSpacing: "-.02em",
  color: TEXT_PRIMARY,
};

function useCountdown(initial = 6 * 3600 + 12 * 60 + 44) {
  const [left, setLeft] = useState(initial);
  useEffect(() => {
    const t = setInterval(() => setLeft((v) => (v > 0 ? v - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);
  const pad = (n) => String(n).padStart(2, "0");
  return {
    h: pad(Math.floor(left / 3600)),
    m: pad(Math.floor((left % 3600) / 60)),
    s: pad(left % 60),
  };
}

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

const fadeInRight = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.08 },
  },
};

const cardHover = {
  hover: {
    y: -12,
    scale: 1.02,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
};

const floatAnimation = {
  y: [0, -10, 0],
  transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
};

export default function IndieKonnectHome() {
  const router = useRouter();
  const [cart, setCart] = useState(2);
  const [wish, setWish] = useState({});
  const [filter, setFilter] = useState("All");
  const [level, setLevel] = useState(0);
  const [testimonial, setTestimonial] = useState(0);
  const rail = useRef(null);
  const time = useCountdown();

  const testimonials = [
    {
      quote:
        "It feels healthier, smoother and more radiant than ever. I love knowing I'm using something natural and effective.",
      name: "Jennifer K.",
      loc: "Verified buyer · Bengaluru",
      img: "https://images.unsplash.com/photo-1600721391776-b5cd0e0048f9?auto=format&fit=crop&w=200&q=80",
    },
    {
      quote:
        "The jewellery arrived exactly as shown, beautifully packaged. Customer support even helped me resize a ring within a day.",
      name: "Priya M.",
      loc: "Verified buyer · Pune",
      img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    },
  ];

  useEffect(() => {
    if (typeof window !== "undefined") {
      const authToken = localStorage.getItem("auth_token");
      const distributorToken = localStorage.getItem("distributor_token");
      const userType = localStorage.getItem("user_type");

      console.log("🏠 IndieKonnectHome rendered");
      console.log("📊 User state:", {
        authToken: authToken ? `${authToken.substring(0, 20)}...` : "NOT SET",
        distributorToken: distributorToken
          ? `${distributorToken.substring(0, 20)}...`
          : "NOT SET",
        userType,
      });
    }
  }, []);

  useEffect(() => {
    const t = setInterval(
      () => setTestimonial((i) => (i + 1) % testimonials.length),
      6000,
    );
    return () => clearInterval(t);
  }, []);

  const addToCart = () => setCart((c) => c + 1);
  const toggleWish = (name) => {
    setWish((w) => ({ ...w, [name]: !w[name] }));
  };
  const scrollReel = (dir) =>
    rail.current?.scrollBy({ left: dir * 640, behavior: "smooth" });
  const shown =
    filter === "All" ? products : products.filter((p) => p.cat === filter);

  return (
    <div className={s.page}>
      {/* Scroll Progress Bar - Animated */}
      <motion.div
        className={s.scrollProgress}
        initial={{ width: "0%" }}
        animate={{ width: "0%" }}
        transition={{ duration: 0.3 }}
      />

      {/* Marquee Ticker */}
      <div className={s.marqueeWrapper}>
        <div className={s.marquee}>
          {[0, 1].map((dup) => (
            <div key={dup} className={s.marqueeItem}>
              {ticker.map((t) => (
                <span key={t}>
                  {t.includes("•") ? <span className={s.gold}>{t}</span> : t}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <Header />

      {/* Hero Section - Enhanced with Animations */}
      <motion.section
        className={s.sectionPremium}
        style={{ padding: "0" }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        <div
          className={s.container}
          style={{
            display: "grid",
            gridTemplateColumns: "1.02fr 1fr",
            gap: 54,
            alignItems: "center",
            padding: "80px 48px 90px",
            position: "relative",
          }}
        >
          {/* Animated Decorative elements */}
          <motion.div
            className={s.goldGlow}
            style={{ right: -100, top: -100, width: 400, height: 400 }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className={s.crystal}
            style={{ right: 50, bottom: 50, transform: "rotate(15deg)" }}
            animate={{
              rotate: [15, 25, 15],
              opacity: [0.03, 0.06, 0.03],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          >
            ◆
          </motion.div>

          <motion.div variants={fadeInLeft}>
            <motion.div style={kicker} variants={fadeInUp}>
              <span
                style={{
                  width: 32,
                  height: 1.5,
                  background: GOLD,
                  display: "block",
                }}
              />
              <motion.span
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ✦ New Season · Autumn Edit ✦
              </motion.span>
            </motion.div>
            <motion.h1
              className={`${s.heading} ${s.headingLarge} ${s.headingGold}`}
              style={{ marginTop: 22 }}
              variants={fadeInUp}
            >
              Beauty, crockery,
              <br />
              jewellery and{" "}
              <span style={{ fontStyle: "italic", color: GOLD }}>watches</span>
              <br />
              for the modern home.
            </motion.h1>
            <motion.p
              style={{
                marginTop: 26,
                maxWidth: 440,
                fontSize: 14,
                lineHeight: 1.85,
                color: TEXT_SECONDARY,
              }}
              variants={fadeInUp}
            >
              Four thousand products, one network. Discover the edit our
              partners across 240 cities recommend most this month.
            </motion.p>
            <motion.div
              style={{ display: "flex", gap: 14, marginTop: 34 }}
              variants={fadeInUp}
            >
              <motion.button
                onClick={addToCart}
                className={s.btnPrimary}
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <span>Shop the edit</span>
              </motion.button>
              <motion.button
                className={s.btnOutline}
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <span>Become a partner</span>
              </motion.button>
            </motion.div>
            <motion.div
              style={{
                display: "flex",
                gap: 48,
                marginTop: 46,
                paddingTop: 26,
                borderTop: "1px solid rgba(0,0,0,0.04)",
              }}
              variants={fadeInUp}
            >
              {heroStats.map((st) => (
                <motion.div
                  key={st.k}
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <div className={s.statNumber}>{st.v}</div>
                  <div className={s.statLabel}>{st.k}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            style={{ position: "relative", height: 560 }}
            variants={fadeInRight}
          >
            <motion.div
              style={{
                position: "absolute",
                inset: 0,
                border: "1px solid rgba(0,0,0,0.06)",
                borderRadius: "50% 50% 20px 20px",
              }}
              animate={{
                rotate: [0, 5, 0, -5, 0],
                borderColor: [
                  "rgba(0,0,0,0.06)",
                  "rgba(201,169,110,0.2)",
                  "rgba(0,0,0,0.06)",
                ],
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              style={{
                position: "absolute",
                inset: 16,
                borderRadius: "50% 50% 16px 16px",
                overflow: "hidden",
                background: "#F0EEE8",
              }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.5 }}
            >
              <img
                src="https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1000&q=80"
                alt="Woman wearing a silver necklace"
              />
            </motion.div>
            <motion.div
              className={s.float}
              style={{
                position: "absolute",
                left: -30,
                top: 110,
                background: "rgba(255,255,255,0.95)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(0,0,0,0.04)",
                borderRadius: 16,
                padding: "14px 18px",
                display: "flex",
                gap: 12,
                alignItems: "center",
                boxShadow: "0 16px 40px rgba(0,0,0,0.08)",
              }}
              animate={floatAnimation}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  overflow: "hidden",
                  flex: "none",
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=200&q=80"
                  alt="Skincare tube"
                />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 9,
                    letterSpacing: ".14em",
                    textTransform: "uppercase",
                    color: "rgba(107,104,130,0.5)",
                  }}
                >
                  Bestseller
                </div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    marginTop: 3,
                    color: TEXT_PRIMARY,
                  }}
                >
                  Radiance Serum
                </div>
              </div>
            </motion.div>
            <motion.div
              className={s.floatSlow}
              style={{
                position: "absolute",
                right: -24,
                bottom: 86,
                background: "rgba(255,255,255,0.95)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(0,0,0,0.04)",
                borderRadius: 16,
                padding: "14px 18px",
                boxShadow: "0 16px 40px rgba(0,0,0,0.08)",
              }}
              animate={{
                y: [0, -8, 0],
                transition: {
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                },
              }}
            >
              <motion.div
                style={{ color: GOLD, fontSize: 11, letterSpacing: 2 }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ★★★★★
              </motion.div>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(107,104,130,0.7)",
                  marginTop: 5,
                }}
              >
                18,400 verified reviews
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Categories Section - Enhanced with Stagger */}
      <motion.section
        className={s.sectionDark}
        style={{ padding: "80px 0 90px" }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        <div className={s.container}>
          <motion.div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: 44,
            }}
            variants={fadeInUp}
          >
            <div>
              <div className={s.kicker}>Browse</div>
              <h2 style={h2}>Shop by category</h2>
            </div>
            <motion.span
              className={s.underline}
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                letterSpacing: ".14em",
                textTransform: "uppercase",
                color: GOLD,
                paddingBottom: 4,
                cursor: "pointer",
              }}
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              View all →
            </motion.span>
          </motion.div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 24,
            }}
          >
            {categories.map((c, idx) => (
              <motion.div
                key={c.name}
                className={s.card}
                style={{ cursor: "pointer" }}
                variants={scaleIn}
                whileHover={{ y: -12, scale: 1.02 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <div
                  style={{
                    position: "relative",
                    aspectRatio: "4 / 5",
                    borderRadius: "16px 16px 0 0",
                    overflow: "hidden",
                  }}
                >
                  <motion.div
                    className={s.imageZoom}
                    style={{ position: "absolute", inset: 0 }}
                    whileHover={{ scale: 1.08 }}
                    transition={{ duration: 0.6 }}
                  >
                    <img src={c.img} alt={c.name} />
                  </motion.div>
                  <motion.div
                    className={s.quickExplore}
                    style={{
                      position: "absolute",
                      left: 16,
                      right: 16,
                      bottom: 16,
                      background: "linear-gradient(135deg, #C9A96E, #A8894F)",
                      color: "#08080E",
                      textAlign: "center",
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: ".12em",
                      textTransform: "uppercase",
                      padding: 14,
                      borderRadius: 10,
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    Explore
                  </motion.div>
                </div>
                <div style={{ padding: "18px 22px 22px" }}>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: TEXT_PRIMARY,
                    }}
                  >
                    {c.name}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: TEXT_SECONDARY,
                      marginTop: 4,
                    }}
                  >
                    {c.count}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Deal of the Day - Enhanced */}
      <motion.section
        className={s.sectionLuxury}
        style={{ padding: "80px 0" }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        <div className={s.container}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.05fr 1fr",
              gap: 52,
              alignItems: "center",
            }}
          >
            <motion.div
              style={{
                position: "relative",
                aspectRatio: "4 / 3",
                borderRadius: 20,
                overflow: "hidden",
                boxShadow: "0 20px 60px rgba(0,0,0,0.06)",
              }}
              variants={fadeInLeft}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(135deg, rgba(201,169,110,0.05), transparent)",
                  zIndex: 1,
                }}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <img
                src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80"
                alt="Men's automatic watch"
              />
              <motion.span
                style={{
                  position: "absolute",
                  top: 20,
                  left: 20,
                  background: "linear-gradient(135deg, #C44A6A, #A83A5A)",
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: ".16em",
                  textTransform: "uppercase",
                  padding: "8px 16px",
                  borderRadius: 10,
                  boxShadow: "0 8px 25px rgba(196,74,106,0.3)",
                  zIndex: 2,
                }}
                animate={{
                  scale: [1, 1.05, 1],
                  boxShadow: [
                    "0 8px 25px rgba(196,74,106,0.3)",
                    "0 8px 35px rgba(196,74,106,0.5)",
                    "0 8px 25px rgba(196,74,106,0.3)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Deal of the day
              </motion.span>
            </motion.div>
            <motion.div variants={fadeInRight}>
              <div className={s.kicker}>Chandra Horology</div>
              <motion.h2
                style={{ ...h2, fontSize: 38, lineHeight: 1.15, marginTop: 14 }}
                variants={fadeInUp}
              >
                Automatic Chronograph 41mm, sapphire crystal
              </motion.h2>
              <motion.div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 14,
                  marginTop: 22,
                }}
                variants={fadeInUp}
              >
                <motion.span
                  style={{
                    fontFamily: "'Fraunces', serif",
                    fontSize: 36,
                    background: "linear-gradient(135deg, #C9A96E, #A8894F)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  ₹7,800
                </motion.span>
                <span
                  style={{
                    fontSize: 14,
                    color: TEXT_SECONDARY,
                    textDecoration: "line-through",
                  }}
                >
                  ₹11,200
                </span>
                <motion.span
                  style={{ fontSize: 12, fontWeight: 700, color: "#4BBF8A" }}
                  animate={{
                    backgroundColor: ["#4BBF8A", "#5CCF9A", "#4BBF8A"],
                    padding: ["2px 8px", "2px 12px", "2px 8px"],
                    borderRadius: "4px",
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  30% off
                </motion.span>
              </motion.div>
              <div style={{ display: "flex", gap: 10, marginTop: 26 }}>
                {[
                  { v: time.h, k: "Hours" },
                  { v: time.m, k: "Mins" },
                  { v: time.s, k: "Secs" },
                  { v: "13", k: "Left" },
                ].map((c) => (
                  <motion.div
                    key={c.k}
                    className={s.flipDigit}
                    whileHover={{
                      y: -6,
                      transition: { type: "spring", stiffness: 400 },
                    }}
                  >
                    <motion.div
                      className={s.flipValue}
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      {c.v}
                    </motion.div>
                    <div className={s.flipLabel}>{c.k}</div>
                  </motion.div>
                ))}
              </div>
              <motion.div
                style={{ marginTop: 26, maxWidth: 340 }}
                variants={fadeInUp}
              >
                <div
                  style={{
                    height: 4,
                    borderRadius: 4,
                    background: "rgba(0,0,0,0.06)",
                    overflow: "hidden",
                  }}
                >
                  <motion.div
                    style={{
                      height: "100%",
                      width: "68%",
                      background: "linear-gradient(90deg, #C9A96E, #8B7BBF)",
                      borderRadius: 4,
                    }}
                    animate={{ width: ["68%", "72%", "68%"] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                </div>
                <div
                  style={{ fontSize: 11, color: TEXT_SECONDARY, marginTop: 9 }}
                >
                  27 of 40 claimed today
                </div>
              </motion.div>
              <motion.button
                onClick={addToCart}
                className={s.btnPrimary}
                style={{ marginTop: 28 }}
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <span>Grab this deal</span>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Products Section - Enhanced Cards */}
      <motion.section
        className={s.sectionPremium}
        style={{ padding: "80px 0 90px" }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        <div className={s.container}>
          <motion.div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: 38,
            }}
            variants={fadeInUp}
          >
            <div>
              <div className={s.kicker}>Most loved</div>
              <h2 style={h2}>Trending this week</h2>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {catFilters.map((f) => (
                <motion.span
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    cursor: "pointer",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: ".08em",
                    textTransform: "uppercase",
                    padding: "10px 20px",
                    borderRadius: 10,
                    border: `1.5px solid ${filter === f ? GOLD : "rgba(0,0,0,0.06)"}`,
                    background:
                      filter === f ? "rgba(201,169,110,0.1)" : "transparent",
                    color: filter === f ? GOLD : TEXT_SECONDARY,
                    transition: "all 0.4s ease",
                    backdropFilter: filter === f ? "blur(10px)" : "none",
                  }}
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  {f}
                </motion.span>
              ))}
            </div>
          </motion.div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 24,
            }}
          >
            {shown.map((p) => (
              <motion.div
                key={p.name}
                className={s.card}
                variants={scaleIn}
                whileHover="hover"
                transition={{ duration: 0.4 }}
              >
                <div
                  style={{
                    position: "relative",
                    aspectRatio: "1 / 1",
                    overflow: "hidden",
                  }}
                >
                  <motion.div
                    className={s.imageZoom}
                    style={{ position: "absolute", inset: 0 }}
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <img src={p.img} alt={p.name} />
                  </motion.div>
                  <motion.span
                    className={s.tag}
                    style={{ position: "absolute", top: 14, left: 14 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    {p.tag}
                  </motion.span>
                  <motion.div
                    onClick={() => toggleWish(p.name)}
                    className={`${s.heartBtn} ${wish[p.name] ? s.active : ""}`}
                    style={{ position: "absolute", top: 12, right: 12 }}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.85 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <span>♥</span>
                  </motion.div>
                  <motion.div
                    onClick={addToCart}
                    className={s.quickAdd}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Add to bag
                  </motion.div>
                </div>
                <div style={{ padding: "18px 18px 22px" }}>
                  <div
                    style={{
                      fontSize: 9.5,
                      letterSpacing: ".16em",
                      textTransform: "uppercase",
                      color: GOLD,
                    }}
                  >
                    {p.brand}
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      marginTop: 7,
                      lineHeight: 1.35,
                      color: TEXT_PRIMARY,
                    }}
                  >
                    {p.name}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      marginTop: 11,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: TEXT_PRIMARY,
                      }}
                    >
                      {p.price}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: TEXT_SECONDARY,
                        textDecoration: "line-through",
                      }}
                    >
                      {p.mrp}
                    </span>
                    <span
                      style={{
                        fontSize: 10.5,
                        fontWeight: 700,
                        color: "#4BBF8A",
                      }}
                    >
                      {p.off}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginTop: 10,
                      fontSize: 10.5,
                      color: TEXT_SECONDARY,
                    }}
                  >
                    <span className={s.stars}>★★★★★</span>
                    {p.reviews}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Reels Section - Enhanced */}
      <motion.section
        className={s.sectionLuxury}
        style={{ padding: "80px 0 90px" }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        <div className={s.container}>
          <motion.div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: 34,
            }}
            variants={fadeInUp}
          >
            <div>
              <div className={s.kicker}>
                <motion.span
                  className={s.pulseDot}
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                Live now
              </div>
              <h2 style={h2}>Shop the reels</h2>
              <p
                style={{
                  margin: "11px 0 0",
                  fontSize: 12.5,
                  color: TEXT_SECONDARY,
                  maxWidth: 400,
                }}
              >
                Partner creators showing the products in real homes. Tap any
                reel to shop the look.
              </p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <motion.button
                onClick={() => scrollReel(-1)}
                className={s.arrowBtn}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                ‹
              </motion.button>
              <motion.button
                onClick={() => scrollReel(1)}
                className={s.arrowBtn}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                ›
              </motion.button>
            </div>
          </motion.div>
          <div ref={rail} className={s.rail}>
            {reels.map((r) => (
              <motion.div
                key={r.handle}
                style={{
                  flex: "none",
                  width: 300,
                  scrollSnapAlign: "start",
                  cursor: "pointer",
                }}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <div className={s.reelCard}>
                  <motion.div
                    className={s.imageZoom}
                    style={{ position: "absolute", inset: 0 }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.5 }}
                  >
                    <img src={r.img} alt={r.caption} />
                  </motion.div>
                  <div className={s.reelOverlay} />
                  <div
                    style={{
                      position: "absolute",
                      top: 16,
                      left: 16,
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <div className={s.petalRing}>
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 999,
                          overflow: "hidden",
                        }}
                      >
                        <img src={r.avatar} alt={r.handle} />
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#EFEDF5",
                      }}
                    >
                      {r.handle}
                    </span>
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      top: 16,
                      right: 16,
                      fontSize: 10,
                      color: "rgba(154,151,176,0.7)",
                    }}
                  >
                    ▶ {r.views}
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      left: 16,
                      right: 16,
                      bottom: 16,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12.5,
                        fontWeight: 600,
                        lineHeight: 1.4,
                        color: "#EFEDF5",
                      }}
                    >
                      {r.caption}
                    </div>
                    <motion.div
                      style={{
                        marginTop: 12,
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        background: "rgba(255,255,255,0.04)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(201,169,110,0.08)",
                        borderRadius: 16,
                        padding: "10px 12px",
                      }}
                      whileHover={{ background: "rgba(255,255,255,0.08)" }}
                      transition={{ duration: 0.3 }}
                    >
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 10,
                          overflow: "hidden",
                          flex: "none",
                        }}
                      >
                        <img src={r.productImg} alt={r.product} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: "#EFEDF5",
                          }}
                        >
                          {r.product}
                        </div>
                        <div
                          style={{ fontSize: 10.5, color: GOLD, marginTop: 2 }}
                        >
                          {r.price}
                        </div>
                      </div>
                      <motion.span
                        style={{
                          fontSize: 9.5,
                          fontWeight: 700,
                          letterSpacing: ".1em",
                          textTransform: "uppercase",
                          background:
                            "linear-gradient(135deg, #C9A96E, #A8894F)",
                          color: "#08080E",
                          padding: "8px 14px",
                          borderRadius: 10,
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Shop
                      </motion.span>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Promises Section - Enhanced */}
      <motion.section
        className={s.sectionDark}
        style={{ padding: "70px 0" }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        <div className={s.container}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 34,
            }}
          >
            {promises.map((p) => (
              <motion.div
                key={p.title}
                style={{ display: "flex", gap: 16, alignItems: "flex-start" }}
                variants={fadeInUp}
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <motion.div
                  className={s.promiseIcon}
                  whileHover={{ rotate: -10, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  {p.icon}
                </motion.div>
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: TEXT_PRIMARY,
                    }}
                  >
                    {p.title}
                  </div>
                  <div
                    style={{
                      fontSize: 11.5,
                      lineHeight: 1.7,
                      color: TEXT_SECONDARY,
                      marginTop: 6,
                    }}
                  >
                    {p.body}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Flash Offers - Enhanced */}
      <motion.section
        className={s.sectionPremium}
        style={{ padding: "84px 0" }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        <div className={s.container}>
          <motion.div
            style={{
              textAlign: "center",
              maxWidth: 640,
              margin: "0 auto 46px",
            }}
            variants={fadeInUp}
          >
            <div className={s.kicker} style={{ justifyContent: "center" }}>
              Limited time
            </div>
            <h2 style={h2}>Flash offers you don&apos;t want to miss</h2>
          </motion.div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.4fr 1fr 1fr",
              gap: 24,
            }}
          >
            <motion.div
              style={{
                position: "relative",
                minHeight: 420,
                borderRadius: 20,
                overflow: "hidden",
                cursor: "pointer",
                border: "1px solid rgba(0,0,0,0.06)",
              }}
              variants={scaleIn}
              whileHover={{ scale: 1.02, y: -8 }}
              transition={{ duration: 0.4 }}
            >
              <motion.div
                className={s.imageZoom}
                style={{ position: "absolute", inset: 0 }}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.5 }}
              >
                <img
                  src="https://images.unsplash.com/photo-1670201203116-26644750a726?auto=format&fit=crop&w=1200&q=80"
                  alt="Beauty campaign"
                />
              </motion.div>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to top, rgba(248,246,242,0.95) 0%, rgba(248,246,242,0.3) 40%, transparent 70%)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: 28,
                  bottom: 28,
                  color: TEXT_PRIMARY,
                }}
              >
                <motion.div
                  style={{
                    display: "inline-block",
                    background: "rgba(255,255,255,0.8)",
                    backdropFilter: "blur(10px)",
                    color: TEXT_PRIMARY,
                    fontSize: 10.5,
                    fontWeight: 700,
                    letterSpacing: ".2em",
                    textTransform: "uppercase",
                    padding: "8px 16px",
                    borderRadius: 10,
                    border: "1px solid rgba(0,0,0,0.04)",
                  }}
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Ends in {time.h}:{time.m}:{time.s}
                </motion.div>
                <div
                  style={{
                    fontFamily: "'Fraunces', serif",
                    fontSize: 32,
                    marginTop: 10,
                    color: TEXT_PRIMARY,
                  }}
                >
                  Up to 45% off beauty
                </div>
                <motion.span
                  style={{
                    display: "inline-block",
                    marginTop: 18,
                    background: "linear-gradient(135deg, #C9A96E, #A8894F)",
                    color: "#08080E",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: ".12em",
                    textTransform: "uppercase",
                    padding: "14px 28px",
                    borderRadius: 10,
                    boxShadow: "0 8px 30px rgba(201,169,110,0.15)",
                  }}
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Shop flash sale
                </motion.span>
              </div>
            </motion.div>
            {offers.map((o) => (
              <motion.div
                key={o.title}
                className={s.card}
                style={{
                  position: "relative",
                  minHeight: 420,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  padding: 28,
                  cursor: "pointer",
                }}
                variants={scaleIn}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.4 }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 10.5,
                      letterSpacing: ".2em",
                      textTransform: "uppercase",
                      color: TEXT_SECONDARY,
                    }}
                  >
                    {o.kicker}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Fraunces', serif",
                      fontSize: 26,
                      marginTop: 10,
                      color: TEXT_PRIMARY,
                      lineHeight: 1.2,
                    }}
                  >
                    {o.title}
                  </div>
                </div>
                <div>
                  <motion.div
                    style={{
                      height: 180,
                      borderRadius: 12,
                      overflow: "hidden",
                    }}
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.4 }}
                  >
                    <img src={o.img} alt={o.title} />
                  </motion.div>
                  <motion.span
                    className={s.underline}
                    style={{
                      display: "inline-block",
                      marginTop: 18,
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: ".12em",
                      textTransform: "uppercase",
                      color: GOLD,
                      paddingBottom: 3,
                      cursor: "pointer",
                    }}
                    whileHover={{ x: 6 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    {o.cta} →
                  </motion.span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Testimonial - Enhanced */}
      <motion.section
        className={s.sectionDark}
        style={{ padding: "96px 0", position: "relative", overflow: "hidden" }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        <motion.div
          className={s.goldGlow}
          style={{
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: 800,
            height: 800,
          }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <div
          className={s.container}
          style={{
            textAlign: "center",
            maxWidth: 820,
            margin: "0 auto",
            position: "relative",
          }}
        >
          <motion.div
            style={{ color: GOLD, letterSpacing: 5, fontSize: 14 }}
            variants={fadeInUp}
          >
            ★★★★★
          </motion.div>
          <motion.div variants={fadeInUp}>
            <motion.p
              style={{
                margin: "26px 0 0",
                fontFamily: "'Fraunces', serif",
                fontSize: 32,
                lineHeight: 1.45,
                color: TEXT_PRIMARY,
              }}
              animate={{ opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              “{testimonials[testimonial].quote}”
            </motion.p>
            <motion.div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                marginTop: 28,
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              key={testimonial}
            >
              <div className={s.petalRing}>
                <motion.div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 999,
                    overflow: "hidden",
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  <img
                    src={testimonials[testimonial].img}
                    alt={testimonials[testimonial].name}
                  />
                </motion.div>
              </div>
              <div style={{ textAlign: "left" }}>
                <div
                  style={{
                    fontSize: 12.5,
                    fontWeight: 700,
                    letterSpacing: ".12em",
                    textTransform: "uppercase",
                    color: GOLD,
                  }}
                >
                  {testimonials[testimonial].name}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(107,104,130,0.6)",
                    marginTop: 4,
                  }}
                >
                  {testimonials[testimonial].loc}
                </div>
              </div>
            </motion.div>
          </motion.div>
          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "center",
              marginTop: 20,
            }}
          >
            {testimonials.map((_, i) => (
              <motion.span
                key={i}
                onClick={() => setTestimonial(i)}
                style={{
                  width: i === testimonial ? 24 : 6,
                  height: 6,
                  borderRadius: 4,
                  background:
                    i === testimonial ? GOLD : "rgba(107,104,130,0.15)",
                  cursor: "pointer",
                  transition: "all 0.4s ease",
                }}
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.8 }}
              />
            ))}
          </div>
          <motion.div
            style={{
              display: "flex",
              gap: 52,
              justifyContent: "center",
              marginTop: 52,
              paddingTop: 34,
              borderTop: "1px solid rgba(0,0,0,0.04)",
            }}
            variants={fadeInUp}
          >
            {trustStats.map((st) => (
              <motion.div
                key={st.k}
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <div className={s.statNumber}>{st.v}</div>
                <div
                  className={s.statLabel}
                  style={{ color: "rgba(107,104,130,0.5)" }}
                >
                  {st.k}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Growth Ladder - Enhanced */}
      <motion.section
        className={s.sectionPremium}
        style={{ padding: "84px 0" }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        <div className={s.container}>
          <motion.div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
            variants={fadeInUp}
          >
            <div>
              <div className={s.kicker}>Opportunity</div>
              <h2 style={h2}>A growth ladder for leaders</h2>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <motion.button
                onClick={() =>
                  setLevel((l) => (l + levels.length - 1) % levels.length)
                }
                className={s.arrowBtn}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                ‹
              </motion.button>
              <motion.button
                onClick={() => setLevel((l) => (l + 1) % levels.length)}
                className={s.arrowBtn}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                ›
              </motion.button>
            </div>
          </motion.div>
          <motion.div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              marginTop: 44,
              borderTop: "1px solid rgba(0,0,0,0.04)",
              background: "rgba(255,255,255,0.6)",
              backdropFilter: "blur(20px)",
              borderRadius: 20,
              overflow: "hidden",
              border: "1px solid rgba(0,0,0,0.04)",
            }}
            variants={staggerContainer}
          >
            {levels.map((l, i) => (
              <motion.div
                key={l.num}
                onClick={() => setLevel(i)}
                className={`${s.levelCard} ${level === i ? s.active : ""}`}
                variants={scaleIn}
                whileHover={{
                  y: -4,
                  transition: { type: "spring", stiffness: 400 },
                }}
              >
                <motion.div
                  className={s.levelNum}
                  animate={level === i ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {l.num}
                </motion.div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    marginTop: 12,
                    color: level === i ? GOLD : TEXT_PRIMARY,
                  }}
                >
                  {l.title}
                </div>
                <p
                  style={{
                    margin: "10px 0 0",
                    fontSize: 11.5,
                    lineHeight: 1.75,
                    color: TEXT_SECONDARY,
                  }}
                >
                  {l.body}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Gallery - Enhanced */}
      <motion.section
        className={s.sectionLuxury}
        style={{ padding: "80px 0" }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        <div className={s.container}>
          <motion.div
            style={{ textAlign: "center", marginBottom: 38 }}
            variants={fadeInUp}
          >
            <div className={s.kicker} style={{ justifyContent: "center" }}>
              #IndieKonnectGlow
            </div>
            <h2 style={h2}>Feel the glow with us</h2>
          </motion.div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: 16,
            }}
          >
            {gallery.map((g) => (
              <motion.div
                key={g}
                className={s.galleryItem}
                variants={scaleIn}
                whileHover={{ scale: 1.05, y: -8 }}
                transition={{ duration: 0.4 }}
              >
                <motion.img
                  src={g}
                  alt="Customer photo"
                  whileHover={{ scale: 1.08 }}
                  transition={{ duration: 0.5 }}
                />
                <motion.div
                  className={s.galleryOverlay}
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <span
                    style={{
                      color: "#EFEDF5",
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: ".12em",
                      textTransform: "uppercase",
                    }}
                  >
                    Shop look
                  </span>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <Footer />
    </div>
  );
}
