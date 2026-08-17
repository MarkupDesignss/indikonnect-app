"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Footer from "../Footer/Footer";
import s from "./IndieKonnectHome.module.css";
import {
  ticker,
  heroStats,
  products,
  reels,
  promises,
  trustStats,
  offers,
  levels,
  gallery,
} from "./catalog";

import Header from "./Header";
import { useGetContentsQuery, useGetDealOfTheDayProductsQuery, useGetReelsQuery, useGetTrendingProductsQuery } from "@/lib/redux/api/Home/contentApi";
import { useGetCategoriesQuery } from "@/lib/redux/api/categoryApi";

const GOLD = "#C9A96E";
const TEXT_PRIMARY = "#1A1A24";
const TEXT_SECONDARY = "#6B6882";

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

export default function IndieKonnectHome() {
  const router = useRouter();
  const [cart, setCart] = useState(2);
  const [wish, setWish] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState("All");
  const [level, setLevel] = useState(0);
  const [testimonial, setTestimonial] = useState(0);
  const rail = useRef<HTMLDivElement>(null);

  const { data: apiResponse, isLoading, error } = useGetContentsQuery({});
  const { data: categoriesData, isLoading: isCategoriesLoading, error: categoriesError } = useGetCategoriesQuery({});

  const {
    data: dealProductsResponse,
    isLoading: isDealProductsLoading,
  } = useGetDealOfTheDayProductsQuery();

  const {
    data: reelsData,
    isLoading: isReelsLoading,
    error: reelsError,
  } = useGetReelsQuery({});

  const {
    data: trendingResponse,
    isLoading: isTrendingLoading,
    isError: isTrendingError,
  } = useGetTrendingProductsQuery();
  
  const trendingProducts = trendingResponse?.data ?? [];

  const dealProduct = dealProductsResponse?.data?.[0];

  const isDistributor = false;

  // Get categories from API
  const categories = useMemo(() => {
    return categoriesData?.data || categoriesData || [];
  }, [categoriesData]);

  const dealPricing = useMemo(() => {
    if (!dealProduct) {
      return { mrp: 0, price: 0, discount: 0 };
    }

    const mrp = isDistributor
      ? Number(dealProduct.distributor_mrp ?? 0)
      : Number(dealProduct.retail_mrp ?? 0);

    const price = isDistributor
      ? Number(dealProduct.distributor_price ?? 0)
      : Number(dealProduct.retail_price ?? 0);

    const discount = mrp > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0;

    return { mrp, price, discount };
  }, [dealProduct, isDistributor]);

  const formatViews = (count: number) => {
    if (!count) return "0";
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + "k";
    }
    return count.toString();
  };

  // Helper function to get product image
  const getProductImage = (product: any) => {
    if (product?.images?.length > 0) {
      const primary = product.images.find((img: any) => img.is_primary);
      return primary?.image_url || product.images[0]?.image_url || "/images/placeholder.png";
    }
    return "/images/placeholder.png";
  };

  // Helper function to get product price
  const getProductPrice = (product: any) => {
    if (!product) return "₹0";
    const price = Number(product.retail_price || 0);
    return `₹${price.toLocaleString("en-IN")}`;
  };

  // Helper function to get avatar from creator
  const getCreatorAvatar = (creatorHandle: string) => {
    if (!creatorHandle) {
      return "https://ui-avatars.com/api/?name=Creator&background=C9A96E&color=fff&size=60&bold=true";
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(creatorHandle)}&background=C9A96E&color=fff&size=60&bold=true`;
  };

  const calculateTimeLeft = () => {
    if (!dealProduct?.deal_of_the_day_ends_at) {
      return {
        h: "00",
        m: "00",
        s: "00",
      };
    }

    const difference =
      new Date(dealProduct.deal_of_the_day_ends_at).getTime() -
      new Date().getTime();

    if (difference <= 0) {
      return {
        h: "00",
        m: "00",
        s: "00",
      };
    }

    return {
      h: String(Math.floor(difference / (1000 * 60 * 60))).padStart(2, "0"),
      m: String(Math.floor((difference / (1000 * 60)) % 60)).padStart(2, "0"),
      s: String(Math.floor((difference / 1000) % 60)).padStart(2, "0"),
    };
  };

  const [time, setTime] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [dealProduct]);

  useEffect(() => {
    const t = setInterval(
      () => setTestimonial((i) => (i + 1) % testimonials.length),
      6000,
    );
    return () => clearInterval(t);
  }, []);

  const handleDealClick = () => {
    if (!dealProduct?.slug) return;
    router.push(`/product/${dealProduct.slug}/`);
  };

  const homeContent = apiResponse?.data?.find(
    (item: any) => item.slug === "home" || item.title === "Home"
  );
  const bannerBlock = homeContent?.blocks?.[0] || null;

  const stripHtml = (html: string) => {
    if (!html) return "";
    if (typeof window === "undefined") {
      return html.replace(/<[^>]*>/g, "").trim();
    }
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const getTextFromHtml = (html: string) => {
    if (!html) return "";
    const stripped = stripHtml(html);
    return stripped || "";
  };

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

  const addToCart = () => setCart((c) => c + 1);
  const toggleWish = (name: string) => {
    setWish((w) => ({ ...w, [name]: !w[name] }));
  };
  const scrollReel = (dir: number) =>
    rail.current?.scrollBy({ left: dir * 640, behavior: "smooth" });

  // Show loading state
  if (isLoading) {
    return (
      <div className={s.page}>
        <Header />
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
          flexDirection: "column",
          gap: "20px"
        }}>
          <div className={s.loader} />
          <p style={{ color: TEXT_SECONDARY }}>Loading...</p>
        </div>
        <Footer />
      </div>
    );
  }

  // Show error state
  if (error) {
    console.error("API Error:", error);
  }

  const getBannerImage = () => {
    if (bannerBlock?.images?.[0]?.url) {
      return bannerBlock.images[0].url;
    }
    return "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1000&q=80";
  };

  const getBannerAlt = () => {
    if (bannerBlock?.images?.[0]?.alt_text) {
      return bannerBlock.images[0].alt_text;
    }
    return "Hero banner";
  };

  const getHeading = () => {
    if (bannerBlock?.heading) {
      return getTextFromHtml(bannerBlock.heading);
    }
    return "✦ New Season · Autumn Edit ✦";
  };

  const getShortDescription = () => {
    if (bannerBlock?.short_description) {
      return bannerBlock.short_description;
    }
    return "Beauty, crockery,<br />jewellery and <span style='font-style:italic;color:#C9A96E'>watches</span><br />for the modern home.";
  };

  const getDescription = () => {
    if (bannerBlock?.description) {
      return stripHtml(bannerBlock.description);
    }
    return "Four thousand products, one network. Discover the edit our partners across 240 cities recommend most this month.";
  };

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

      {/* Hero Section - Dynamic with API Data */}
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

          {/* LEFT CONTENT - Dynamic from API */}
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
                {getHeading()}
              </motion.span>
            </motion.div>

            <motion.h1
              className={`${s.heading} ${s.headingLarge} ${s.headingGold}`}
              style={{ marginTop: 22 }}
              variants={fadeInUp}
              dangerouslySetInnerHTML={{
                __html: getShortDescription()
              }}
            />

            <motion.p
              style={{
                marginTop: 26,
                maxWidth: 440,
                fontSize: 14,
                lineHeight: 1.85,
                color: TEXT_SECONDARY,
              }}
              variants={fadeInUp}
              dangerouslySetInnerHTML={{
                __html: getDescription()
              }}
            />

            {/* Buttons */}
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

            {/* Stats */}
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

          {/* RIGHT CONTENT - Image Dynamic from API */}
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
                src={getBannerImage()}
                alt={getBannerAlt()}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </motion.div>

            {/* Floating Elements */}
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
              animate={{
                y: [0, -10, 0],
                transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
              }}
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

      {/* Categories Section - Dynamic from API */}
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
              onClick={() => router.push('/products')}
            >
              View all →
            </motion.span>
          </motion.div>

          {isCategoriesLoading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
              <div className={s.loader} />
            </div>
          ) : categoriesError ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: TEXT_SECONDARY }}>
              Failed to load categories
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 24,
              }}
            >
              {categories.map((c: any, idx: number) => {
                const categorySlug = c.title || c.name?.toLowerCase().replace(/\s+/g, '-');

                return (
                  <motion.div
                    key={c.id || c.name || idx}
                    className={s.card}
                    style={{ cursor: "pointer" }}
                    variants={scaleIn}
                    whileHover={{ y: -12, scale: 1.02 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => router.push(`/products/?category=${encodeURIComponent(categorySlug)}`)}
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
                        <img
                          src={c.image || c.img || "https://via.placeholder.com/300x400"}
                          alt={c.name}
                        />
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
                          cursor: "pointer",
                        }}
                        initial={{ opacity: 0, y: 20 }}
                        whileHover={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/products/?category=${encodeURIComponent(categorySlug)}`);
                        }}
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
                        {c.title || c.name}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: TEXT_SECONDARY,
                          marginTop: 4,
                        }}
                      >
                        {c.products_count || "0 products"}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </motion.section>

      {/* DEAL OF THE DAY - FIXED */}
      <motion.section
        className={s.sectionLuxury}
        style={{ padding: "80px 0" }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        <div className={s.container}>
          {isDealProductsLoading ? (
            <div
              style={{
                width: "100%",
                minHeight: 420,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                color: TEXT_SECONDARY,
              }}
            >
              Loading deal of the day...
            </div>
          ) : dealProduct ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.05fr 1fr",
                gap: 52,
                alignItems: "center",
              }}
            >
              {/* PRODUCT IMAGE */}
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
                    pointerEvents: "none",
                  }}
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                  }}
                />

                <img
                  src={
                    dealProduct.primary_image_url ||
                    dealProduct.images?.[0]?.image_url ||
                    "/images/product-placeholder.png"
                  }
                  alt={dealProduct.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />

                {/* DEAL BADGE */}
                <motion.span
                  style={{
                    position: "absolute",
                    top: 20,
                    left: 20,
                    background:
                      "linear-gradient(135deg, #C44A6A, #A83A5A)",
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: ".16em",
                    textTransform: "uppercase",
                    padding: "8px 16px",
                    borderRadius: 10,
                    boxShadow:
                      "0 8px 25px rgba(196,74,106,0.3)",
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
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                >
                  Deal of the day
                </motion.span>
              </motion.div>

              {/* PRODUCT CONTENT */}
              <motion.div variants={fadeInRight}>
                {/* CATEGORY */}
                <div className={s.kicker}>
                  {dealProduct.category?.name || "Chandra Horology"}
                </div>

                {/* PRODUCT NAME */}
                <motion.h2
                  style={{
                    ...h2,
                    fontSize: 38,
                    lineHeight: 1.15,
                    marginTop: 14,
                  }}
                  variants={fadeInUp}
                >
                  {dealProduct.name}
                </motion.h2>

                {/* DESCRIPTION */}
                {dealProduct.description && (
                  <motion.p
                    style={{
                      marginTop: 12,
                      fontSize: 14,
                      lineHeight: 1.7,
                      color: TEXT_SECONDARY,
                      maxWidth: 520,
                    }}
                    variants={fadeInUp}
                  >
                    {dealProduct.description}
                  </motion.p>
                )}

                {/* PRICE */}
                <motion.div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 14,
                    marginTop: 22,
                    flexWrap: "wrap",
                  }}
                  variants={fadeInUp}
                >
                  {/* SALE PRICE */}
                  <motion.span
                    style={{
                      fontFamily: "'Fraunces', serif",
                      fontSize: 36,
                      background:
                        "linear-gradient(135deg, #C9A96E, #A8894F)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                    animate={{
                      scale: [1, 1.02, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  >
                    ₹{dealPricing.price.toLocaleString("en-IN")}
                  </motion.span>

                  {/* MRP */}
                  {dealPricing.mrp > 0 && (
                    <span
                      style={{
                        fontSize: 14,
                        color: TEXT_SECONDARY,
                        textDecoration: "line-through",
                      }}
                    >
                      ₹{dealPricing.mrp.toLocaleString("en-IN")}
                    </span>
                  )}

                  {/* DISCOUNT */}
                  {dealPricing.discount > 0 && (
                    <motion.span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#fff",
                        backgroundColor: "#4BBF8A",
                        padding: "2px 8px",
                        borderRadius: "4px",
                      }}
                      animate={{
                        backgroundColor: [
                          "#4BBF8A",
                          "#5CCF9A",
                          "#4BBF8A",
                        ],
                        padding: [
                          "2px 8px",
                          "2px 12px",
                          "2px 8px",
                        ],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                    >
                      {dealPricing.discount}% off
                    </motion.span>
                  )}
                </motion.div>

                {/* COUNTDOWN */}
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    marginTop: 26,
                  }}
                >
                  {[
                    { v: time.h, k: "Hours" },
                    { v: time.m, k: "Mins" },
                    { v: time.s, k: "Secs" },
                    {
                      v: String(
                        Math.max(
                          0,
                          Number(dealProduct.stock_quantity || 0)
                        )
                      ),
                      k: "Left",
                    },
                  ].map((c) => (
                    <motion.div
                      key={c.k}
                      className={s.flipDigit}
                      whileHover={{
                        y: -6,
                        transition: {
                          type: "spring",
                          stiffness: 400,
                        },
                      }}
                    >
                      <motion.div
                        className={s.flipValue}
                        animate={{
                          scale: [1, 1.05, 1],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                        }}
                      >
                        {c.v}
                      </motion.div>
                      <div className={s.flipLabel}>
                        {c.k}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* STOCK PROGRESS */}
                <motion.div
                  style={{
                    marginTop: 26,
                    maxWidth: 340,
                  }}
                  variants={fadeInUp}
                >
                  {(() => {
                    const stock = Number(dealProduct.stock_quantity || 0);
                    const threshold = Number(dealProduct.low_stock_threshold || 10);
                    const totalStock = stock + 40;
                    const claimedPercentage = totalStock > 0
                      ? Math.min(100, Math.round(((totalStock - stock) / totalStock) * 100))
                      : 0;

                    return (
                      <>
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
                              background: "linear-gradient(90deg, #C9A96E, #8B7BBF)",
                              borderRadius: 4,
                            }}
                            initial={{ width: `${claimedPercentage}%` }}
                            animate={{
                              width: [
                                `${claimedPercentage}%`,
                                `${Math.min(100, claimedPercentage + 4)}%`,
                                `${claimedPercentage}%`,
                              ],
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                            }}
                          />
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: TEXT_SECONDARY,
                            marginTop: 9,
                          }}
                        >
                          {stock <= threshold
                            ? `Only ${stock} left in stock`
                            : `${stock} items available`}
                        </div>
                      </>
                    );
                  })()}
                </motion.div>

                <motion.button
                  onClick={handleDealClick}
                  className={s.btnPrimary}
                  style={{ marginTop: 28 }}
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 17,
                  }}
                >
                  <span>Grab this deal</span>
                </motion.button>
              </motion.div>
            </div>
          ) : (
            <div
              style={{
                width: "100%",
                textAlign: "center",
                padding: "60px 0",
                color: TEXT_SECONDARY,
              }}
            >
              No deal available today.
            </div>
          )}
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
          {/* HEADER */}
          <motion.div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: 38,
              gap: 20,
            }}
            variants={fadeInUp}
          >
            <div>
              <div className={s.kicker}>Most loved</div>
              <h2 style={h2}>Trending this week</h2>
            </div>

            {/* CATEGORY FILTERS */}
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                justifyContent: "flex-end",
              }}
            >
              {/* ALL */}
              <motion.span
                onClick={() => setFilter("All")}
                style={{
                  cursor: "pointer",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                  padding: "10px 20px",
                  borderRadius: 10,
                  border: `1.5px solid ${
                    filter === "All"
                      ? GOLD
                      : "rgba(0,0,0,0.06)"
                  }`,
                  background:
                    filter === "All"
                      ? "rgba(201,169,110,0.1)"
                      : "transparent",
                  color:
                    filter === "All"
                      ? GOLD
                      : TEXT_SECONDARY,
                  transition: "all 0.4s ease",
                  backdropFilter:
                    filter === "All"
                      ? "blur(10px)"
                      : "none",
                }}
                whileHover={{
                  y: -2,
                  scale: 1.02,
                }}
                whileTap={{
                  scale: 0.95,
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                }}
              >
                All
              </motion.span>

              {/* API CATEGORIES */}
              {isCategoriesLoading ? (
                <span
                  style={{
                    fontSize: 11,
                    color: TEXT_SECONDARY,
                    padding: "10px 20px",
                  }}
                >
                  Loading...
                </span>
              ) : (
                categories.map((category: any) => (
                  <motion.span
                    key={category.id}
                    onClick={() =>
                      setFilter(category.id.toString())
                    }
                    style={{
                      cursor: "pointer",
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: ".08em",
                      textTransform: "uppercase",
                      padding: "10px 20px",
                      borderRadius: 10,
                      border: `1.5px solid ${
                        filter === category.id.toString()
                          ? GOLD
                          : "rgba(0,0,0,0.06)"
                      }`,
                      background:
                        filter === category.id.toString()
                          ? "rgba(201,169,110,0.1)"
                          : "transparent",
                      color:
                        filter === category.id.toString()
                          ? GOLD
                          : TEXT_SECONDARY,
                      transition: "all 0.4s ease",
                      backdropFilter:
                        filter === category.id.toString()
                          ? "blur(10px)"
                          : "none",
                    }}
                    whileHover={{
                      y: -2,
                      scale: 1.02,
                    }}
                    whileTap={{
                      scale: 0.95,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                    }}
                  >
                    {category.name}
                  </motion.span>
                ))
              )}
            </div>
          </motion.div>

          {/* LOADING */}
          {isTrendingLoading ? (
            <div
              style={{
                minHeight: 350,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                color: TEXT_SECONDARY,
              }}
            >
              Loading trending products...
            </div>
          ) : isTrendingError ? (
            /* ERROR */
            <div
              style={{
                minHeight: 350,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                color: TEXT_SECONDARY,
              }}
            >
              Unable to load trending products.
            </div>
          ) : (
            <>
              {(() => {
                const filteredProducts =
                  filter === "All"
                    ? trendingProducts
                    : trendingProducts.filter(
                        (product: any) =>
                          product.category_id ===
                          Number(filter)
                      );

                return filteredProducts.length === 0 ? (
                  <div
                    style={{
                      minHeight: 300,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      color: TEXT_SECONDARY,
                    }}
                  >
                    No trending products found in this category.
                  </div>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(4, 1fr)",
                      gap: 24,
                    }}
                  >
                    {filteredProducts.map((p: any) => {
                      const isDistributor = false;

                      const price = isDistributor
                        ? Number(
                            p.distributor_price ?? 0
                          )
                        : Number(
                            p.retail_price ?? 0
                          );

                      const mrp = isDistributor
                        ? Number(
                            p.distributor_mrp ?? 0
                          )
                        : Number(
                            p.retail_mrp ?? 0
                          );

                      const discount =
                        mrp > 0 && price < mrp
                          ? Math.round(
                              ((mrp - price) / mrp) *
                                100
                            )
                          : 0;

                      const image =
                        p.images?.find(
                          (img: any) => img.is_primary
                        )?.image_url ||
                        p.images?.[0]?.image_url ||
                        "/images/product-placeholder.png";

                      const category =
                        categories.find(
                          (cat: any) =>
                            cat.id === p.category_id
                        );

                      return (
                        <motion.div
                          key={p.id}
                          className={s.card}
                          variants={scaleIn}
                          whileHover="hover"
                          transition={{
                            duration: 0.4,
                          }}
                        >
                          {/* PRODUCT IMAGE */}
                          <div
                            style={{
                              position: "relative",
                              aspectRatio: "1 / 1",
                              overflow: "hidden",
                            }}
                          >
                            <motion.div
                              className={s.imageZoom}
                              style={{
                                position: "absolute",
                                inset: 0,
                              }}
                              whileHover={{
                                scale: 1.1,
                              }}
                              transition={{
                                duration: 0.6,
                              }}
                            >
                              <img
                                src={image}
                                alt={p.name}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  display: "block",
                                }}
                              />
                            </motion.div>

                            {/* CATEGORY TAG */}
                            <motion.span
                              className={s.tag}
                              style={{
                                position:
                                  "absolute",
                                top: 14,
                                left: 14,
                              }}
                              whileHover={{
                                scale: 1.05,
                              }}
                            >
                              {category?.name ||
                                "Trending"}
                            </motion.span>

                            {/* WISHLIST */}
                            <motion.div
                              onClick={() =>
                                toggleWish(p.name)
                              }
                              className={`${s.heartBtn} ${
                                wish[p.name]
                                  ? s.active
                                  : ""
                              }`}
                              style={{
                                position:
                                  "absolute",
                                top: 12,
                                right: 12,
                              }}
                              whileHover={{
                                scale: 1.15,
                              }}
                              whileTap={{
                                scale: 0.85,
                              }}
                              transition={{
                                type: "spring",
                                stiffness: 400,
                              }}
                            >
                              <span>♥</span>
                            </motion.div>

                            {/* ADD TO BAG */}
                            <motion.div
                              onClick={() =>
                                addToCart()
                              }
                              className={s.quickAdd}
                              whileHover={{
                                scale: 1.02,
                              }}
                              whileTap={{
                                scale: 0.95,
                              }}
                            >
                              Add to bag
                            </motion.div>
                          </div>

                          {/* PRODUCT INFO */}
                          <div
                            style={{
                              padding:
                                "18px 18px 22px",
                            }}
                          >
                            {/* CATEGORY */}
                            <div
                              style={{
                                fontSize: 9.5,
                                letterSpacing: ".16em",
                                textTransform:
                                  "uppercase",
                                color: GOLD,
                              }}
                            >
                              {category?.name ||
                                "Trending"}
                            </div>

                            {/* PRODUCT NAME */}
                            <div
                              style={{
                                fontSize: 14,
                                fontWeight: 600,
                                marginTop: 7,
                                lineHeight: 1.35,
                                color:
                                  TEXT_PRIMARY,
                              }}
                            >
                              {p.name}
                            </div>

                            {/* DESCRIPTION */}
                            {p.description && (
                              <div
                                style={{
                                  fontSize: 11,
                                  color:
                                    TEXT_SECONDARY,
                                  marginTop: 6,
                                  lineHeight: 1.5,
                                }}
                              >
                                {p.description}
                              </div>
                            )}

                            {/* PRICE */}
                            <div
                              style={{
                                display: "flex",
                                alignItems:
                                  "center",
                                gap: 9,
                                marginTop: 11,
                                flexWrap: "wrap",
                              }}
                            >
                              {/* CURRENT PRICE */}
                              <span
                                style={{
                                  fontSize: 14,
                                  fontWeight: 700,
                                  color:
                                    TEXT_PRIMARY,
                                }}
                              >
                                ₹
                                {price.toLocaleString(
                                  "en-IN"
                                )}
                              </span>

                              {/* MRP */}
                              {mrp > 0 &&
                                mrp > price && (
                                  <span
                                    style={{
                                      fontSize: 11,
                                      color:
                                        TEXT_SECONDARY,
                                      textDecoration:
                                        "line-through",
                                    }}
                                  >
                                    ₹
                                    {mrp.toLocaleString(
                                      "en-IN"
                                    )}
                                  </span>
                                )}

                              {/* DISCOUNT */}
                              {discount > 0 && (
                                <span
                                  style={{
                                    fontSize: 10.5,
                                    fontWeight: 700,
                                    color:
                                      "#4BBF8A",
                                  }}
                                >
                                  {discount}% off
                                </span>
                              )}
                            </div>

                            {/* TRENDING / RATING */}
                            <div
                              style={{
                                display: "flex",
                                alignItems:
                                  "center",
                                gap: 6,
                                marginTop: 10,
                                fontSize: 10.5,
                                color:
                                  TEXT_SECONDARY,
                              }}
                            >
                              <span
                                className={s.stars}
                              >
                                ★★★★★
                              </span>

                              <span>
                                Trending
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                );
              })()}
            </>
          )}
        </div>
      </motion.section>

      {/* Reels Section - Dynamic from API */}
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

          {/* Show loading state */}
          {isReelsLoading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "40px 0",
              }}
            >
              <div className={s.loader} />
            </div>
          ) : reelsError ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 0",
                color: TEXT_SECONDARY,
              }}
            >
              Failed to load reels
            </div>
          ) : (
            <div ref={rail} className={s.rail}>
              {(reelsData?.data || []).map((r: any) => {
                const product = r.product;
                const productSlug = product?.slug;
                const productName = product?.name || "Product";
                const productImage = getProductImage(product);
                const productPrice = getProductPrice(product);
                const creatorName = r.creator_handle || r.title || "Creator";
                const views = r.followers_count || 0;
                const videoUrl = r.video_full_url || r.video_url || r.video_path;

                // Handle reel click to play video (optional)
                const handleReelClick = () => {
                  // You can implement video playback modal or navigation
                  console.log("Play reel:", videoUrl);
                };

                // Handle shop click - navigate to product
                const handleShopClick = (e: React.MouseEvent) => {
                  e.stopPropagation();
                  if (productSlug) {
                    router.push(`/product/${productSlug}/`);
                  }
                };

                return (
                  <motion.div
                    key={r.id || r.creator_handle}
                    style={{
                      flex: "none",
                      width: 300,
                      scrollSnapAlign: "start",
                      cursor: "pointer",
                    }}
                    whileHover={{ y: -8 }}
                    transition={{ duration: 0.3 }}
                    onClick={handleReelClick}
                  >
                    <div className={s.reelCard}>
                      {/* Video Thumbnail - Use video_url or fallback to a placeholder */}
                      <motion.div
                        className={s.imageZoom}
                        style={{ position: "absolute", inset: 0 }}
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.5 }}
                      >
                        {videoUrl ? (
                          <video
                            src={videoUrl}
                            muted
                            playsInline
                            poster={productImage}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                            onMouseEnter={(e) => {
                              const video = e.currentTarget;
                              if (video.readyState >= 2) {
                                video.play().catch(() => { });
                              }
                            }}
                            onMouseLeave={(e) => {
                              const video = e.currentTarget;
                              video.pause();
                              video.currentTime = 0;
                            }}
                          />
                        ) : (
                          <img
                            src={productImage}
                            alt={r.title || "Reel"}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        )}
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
                            <img
                              src={getCreatorAvatar(creatorName)}
                              alt={creatorName}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          </div>
                        </div>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: "#EFEDF5",
                          }}
                        >
                          @{creatorName}
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
                        ▶ {formatViews(views)}
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
                          {r.title || r.caption || `${creatorName}'s reel`}
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
                            <img
                              src={productImage}
                              alt={productName}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                fontSize: 11,
                                fontWeight: 600,
                                color: "#EFEDF5",
                              }}
                            >
                              {productName}
                            </div>
                            <div
                              style={{ fontSize: 10.5, color: GOLD, marginTop: 2 }}
                            >
                              {productPrice}
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
                              cursor: "pointer",
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleShopClick}
                          >
                            Shop
                          </motion.span>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
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