"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import {
  useGetContentsQuery,
  useGetDealOfTheDayProductsQuery,
  useGetReelsQuery,
  useGetTrendingProductsQuery,
} from "@/lib/redux/api/Home/contentApi";
import { useGetCategoriesQuery } from "@/lib/redux/api/categoryApi";

const GOLD = "#C9A96E";
const GOLD_DARK = "#A8894F";
const GOLD_LIGHT = "#E8D5A3";
const TEXT_PRIMARY = "#1A1A24";
const TEXT_SECONDARY = "#6B6882";
const AMETHYST = "#8B7BBF";
const RUBY = "#C44A6A";
const EMERALD = "#4BBF8A";

// Premium Animation Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 60, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

const fadeIn = {
  hidden: { opacity: 0, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.08 },
  },
};

const floatAnimation = {
  y: [0, -14, 0],
  transition: { duration: 5, repeat: Infinity, ease: "easeInOut" },
};

export default function IndieKonnectHome() {
  const router = useRouter();
  const [cart, setCart] = useState(2);
  const [wish, setWish] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState("All");
  const [level, setLevel] = useState(0);
  const [testimonial, setTestimonial] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const rail = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  const { data: apiResponse, isLoading, error } = useGetContentsQuery({});
  const {
    data: categoriesData,
    isLoading: isCategoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useGetCategoriesQuery({});

  const { data: dealProductsResponse, isLoading: isDealProductsLoading } =
    useGetDealOfTheDayProductsQuery();

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

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll Progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress((scrollTop / maxScroll) * 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Transform categories data
  const categories = useMemo(() => {
    if (!categoriesData) return [];

    const rawData = categoriesData.data || categoriesData;

    if (Array.isArray(rawData)) {
      return rawData;
    }

    if (rawData?.data && Array.isArray(rawData.data)) {
      return rawData.data;
    }

    if (rawData?.categories && Array.isArray(rawData.categories)) {
      return rawData.categories;
    }

    if (rawData?.items && Array.isArray(rawData.items)) {
      return rawData.items;
    }

    return [];
  }, [categoriesData]);

  const dealPricing = useMemo(() => {
    if (!dealProduct) return { mrp: 0, price: 0, discount: 0 };
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
    if (count >= 1000) return (count / 1000).toFixed(1) + "k";
    return count.toString();
  };

  const getProductImage = (product: any) => {
    if (product?.images?.length > 0) {
      const primary = product.images.find((img: any) => img.is_primary);
      return (
        primary?.image_url ||
        product.images[0]?.image_url ||
        "/images/placeholder.png"
      );
    }
    return "/images/placeholder.png";
  };

  const getProductPrice = (product: any) => {
    if (!product) return "₹0";
    const price = Number(product.retail_price || 0);
    return `₹${price.toLocaleString("en-IN")}`;
  };

  const getCreatorAvatar = (creatorHandle: string) => {
    if (!creatorHandle) {
      return "https://ui-avatars.com/api/?name=Creator&background=C9A96E&color=fff&size=60&bold=true";
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(creatorHandle)}&background=C9A96E&color=fff&size=60&bold=true`;
  };

  const calculateTimeLeft = () => {
    if (!dealProduct?.deal_of_the_day_ends_at) {
      return { h: "00", m: "00", s: "00" };
    }
    const difference =
      new Date(dealProduct.deal_of_the_day_ends_at).getTime() -
      new Date().getTime();
    if (difference <= 0) {
      return { h: "00", m: "00", s: "00" };
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
    (item: any) => item.slug === "home" || item.title === "Home",
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
    {
      quote:
        "The quality exceeded my expectations. Every piece feels handcrafted with love and attention to detail.",
      name: "Aisha R.",
      loc: "Verified buyer · Mumbai",
      img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80",
    },
  ];

  const addToCart = () => setCart((c) => c + 1);
  const toggleWish = (name: string) => {
    setWish((w) => ({ ...w, [name]: !w[name] }));
  };
  const scrollReel = (dir: number) =>
    rail.current?.scrollBy({ left: dir * 640, behavior: "smooth" });

  if (isLoading) {
    return (
      <div className={s.page}>
        <Header />
        <div className={s.loadingContainer}>
          <div className={s.loaderRing}>
            <div className={s.loaderRingInner} />
          </div>
          <p className={s.loadingText}>Loading experience...</p>
        </div>
        <Footer />
      </div>
    );
  }

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
      {/* Premium Scroll Progress Bar */}
      <motion.div
        className={s.scrollProgress}
        style={{ width: `${scrollProgress}%` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
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
  

      {/* Hero Section */}
      <motion.section
        className={s.heroSection}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        <div className={s.heroContainer}>
          <motion.div
            className={s.heroGlow1}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className={s.heroGlow2}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />
          <motion.div
            className={s.crystalLarge}
            animate={{
              rotate: [0, 15, 0, -15, 0],
              opacity: [0.02, 0.06, 0.02],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          >
            ◆
          </motion.div>

          <div className={s.heroContent}>
            <motion.div className={s.heroKicker} variants={fadeIn}>
              <span className={s.kickerLine} />
              <motion.span
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
                className={s.kickerText}
              >
                {getHeading()}
              </motion.span>
            </motion.div>

            <motion.h1
              className={s.heroHeading}
              variants={fadeInUp}
              dangerouslySetInnerHTML={{ __html: getShortDescription() }}
            />

            <motion.p
              className={s.heroDescription}
              variants={fadeInUp}
              dangerouslySetInnerHTML={{ __html: getDescription() }}
            />

            <motion.div className={s.heroButtons} variants={fadeInUp}>
              <motion.button
                onClick={addToCart}
                className={s.btnYellow}
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <span>Shop the edit</span>
                <svg
                  className={s.btnArrow}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </motion.button>
              <motion.button
                className={s.btnWhiteShadow}
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <span>Become a partner</span>
              </motion.button>
            </motion.div>

            <motion.div className={s.heroStats} variants={fadeInUp}>
              {heroStats.map((st) => (
                <motion.div
                  key={st.k}
                  className={s.bt}
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <motion.div
                    className={s.heroStatNumber}
                    whileHover={{ scale: 1.05 }}
                  >
                    {st.v}
                    <span className={s.statPlus}>+</span>
                  </motion.div>
                  <div className={s.heroStatLabel}>{st.k}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <motion.div className={s.heroImageWrapper} variants={fadeIn}>
            <div className={s.heroImageFrame}>
              <div className={s.heroImageBorder} />
              <div className={s.heroImageContainer}>
                <motion.img
                  src={getBannerImage()}
                  alt={getBannerAlt()}
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.6 }}
                />
              </div>
            </div>

            <motion.div className={s.floatingBadge1} animate={floatAnimation}>
              <div className={s.badgeIcon}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#C9A96E"
                  strokeWidth="2"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <div>
                <div className={s.badgeLabel}>Bestseller</div>
                <div className={s.badgeTitle}>Radiance Serum</div>
              </div>
            </motion.div>

            <motion.div
              className={s.floatingBadge2}
              animate={{
                y: [0, -12, 0],
                transition: {
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                },
              }}
            >
              <div className={s.badgeStars}>★★★★★</div>
              <div className={s.badgeReviews}>18,400 reviews</div>
            </motion.div>

            <motion.div
              className={s.floatingBadge3}
              animate={{
                y: [0, -10, 0],
                transition: {
                  duration: 7,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2,
                },
              }}
            >
              <span className={s.badgeDot} />
              <span>Live · 2.4k watching</span>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Categories Section */}
      <motion.section
        className={s.sectionDark}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        <div className={s.container}>
          <motion.div className={s.sectionHeader} variants={fadeInUp}>
            <div className={s.sectionHeaderLeft}>
              <div className={s.kicker}>
                <span className={s.kickerLine} />
                Browse
              </div>
              <h2 className={s.sectionTitle}>Shop by category</h2>
            </div>
            <motion.span
              className={s.viewAll}
              whileHover={{ x: 6 }}
              transition={{ type: "spring", stiffness: 400 }}
              onClick={() => router.push("/products")}
            >
              View all →
            </motion.span>
          </motion.div>

          {isCategoriesLoading ? (
            <div className={s.loadingGrid}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={s.skeletonCard}>
                  <div className={s.skeletonImage} />
                  <div className={s.skeletonText} />
                </div>
              ))}
            </div>
          ) : categoriesError ? (
            <div className={s.errorState}>
              <p>Failed to load categories</p>
              <button
                onClick={() => refetchCategories()}
                className={s.retryBtn}
              >
                Retry
              </button>
            </div>
          ) : categories && categories.length > 0 ? (
            <div className={s.categoryGrid}>
              {categories.map((c: any, idx: number) => {
                const categoryName =
                  c.title || c.name || c.category_name || "Category";
                const categorySlug = categoryName
                  .toLowerCase()
                  .replace(/\s+/g, "-");
                const categoryImage =
                  c.image ||
                  c.img ||
                  c.image_url ||
                  c.category_image ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(categoryName)}&background=C9A96E&color=fff&size=300&bold=true`;
                const productCount =
                  c.products_count || c.count || c.product_count || 0;

                return (
                  <motion.div
                    key={c.id || c.category_id || idx}
                    className={s.categoryCard}
                    variants={scaleIn}
                    whileHover={{ y: -12, scale: 1.02 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    onClick={() =>
                      router.push(
                        `/products/?category=${encodeURIComponent(categorySlug)}`,
                      )
                    }
                  >
                    <div className={s.categoryImageWrapper}>
                      <motion.div
                        className={s.categoryImage}
                        whileHover={{ scale: 1.08 }}
                        transition={{ duration: 0.6 }}
                      >
                        <img
                          src={categoryImage}
                          alt={categoryName}
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(categoryName)}&background=C9A96E&color=fff&size=300&bold=true`;
                          }}
                        />
                      </motion.div>
                      <motion.div
                        className={s.categoryOverlay}
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <span>Explore</span>
                      </motion.div>
                    </div>
                    <div className={s.categoryInfo}>
                      <div className={s.categoryName}>{categoryName}</div>
                      <div className={s.categoryCount}>
                        {productCount}{" "}
                        {productCount === 1 ? "product" : "products"}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className={s.emptyState}>
              <p>No categories available at the moment.</p>
              <button
                onClick={() => refetchCategories()}
                className={s.retryBtn}
              >
                Refresh
              </button>
            </div>
          )}
        </div>
      </motion.section>

      {/* DEAL OF THE DAY */}
      <motion.section
        className={s.sectionLuxury}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        <motion.div
          className={s.dealGlow}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <div className={s.container}>
          <motion.div className={s.dealKickerWrapper} variants={fadeInUp}>
            <div className={s.dealKicker}>
              <span className={s.dealDot} />
              Limited Deal
            </div>
          </motion.div>

          {isDealProductsLoading ? (
            <div className={s.dealLoading}>Loading deal of the day...</div>
          ) : dealProduct ? (
            <div className={s.dealGrid}>
              <motion.div className={s.dealImageWrapper} variants={fadeIn}>
                <div className={s.dealImageContainer}>
                  <motion.img
                    src={
                      dealProduct.primary_image_url ||
                      dealProduct.images?.[0]?.image_url ||
                      "/images/product-placeholder.png"
                    }
                    alt={dealProduct.name}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.6 }}
                  />
                  <motion.span
                    className={s.dealBadge}
                    animate={{
                      scale: [1, 1.05, 1],
                      boxShadow: [
                        "0 8px 30px rgba(196,74,106,0.3)",
                        "0 8px 50px rgba(196,74,106,0.5)",
                        "0 8px 30px rgba(196,74,106,0.3)",
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    🔥 Deal of the day
                  </motion.span>
                </div>
              </motion.div>

              <motion.div className={s.dealContent} variants={fadeInUp}>
                <div className={s.dealCategory}>
                  {dealProduct.category?.name || "Chandra Horology"}
                </div>

                <h2 className={s.dealTitle}>{dealProduct.name}</h2>

                {dealProduct.description && (
                  <p className={s.dealDescription}>{dealProduct.description}</p>
                )}

                <div className={s.dealPrice}>
                  <motion.span
                    className={s.dealPriceCurrent}
                    animate={{
                      scale: [1, 1.02, 1],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    ₹{dealPricing.price.toLocaleString("en-IN")}
                  </motion.span>
                  {dealPricing.mrp > 0 && (
                    <span className={s.dealPriceMrp}>
                      ₹{dealPricing.mrp.toLocaleString("en-IN")}
                    </span>
                  )}
                  {dealPricing.discount > 0 && (
                    <motion.span
                      className={s.dealDiscount}
                      animate={{
                        backgroundColor: ["#4BBF8A", "#5CCF9A", "#4BBF8A"],
                        padding: ["2px 10px", "2px 14px", "2px 10px"],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {dealPricing.discount}% off
                    </motion.span>
                  )}
                </div>

                <div className={s.dealCountdown}>
                  {[
                    { v: time.h, k: "Hours" },
                    { v: time.m, k: "Mins" },
                    { v: time.s, k: "Secs" },
                  ].map((c) => (
                    <motion.div
                      key={c.k}
                      className={s.dealDigit}
                      whileHover={{ y: -6 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <motion.div
                        className={s.dealDigitValue}
                        animate={{
                          scale: [1, 1.05, 1],
                        }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        {c.v}
                      </motion.div>
                      <div className={s.dealDigitLabel}>{c.k}</div>
                    </motion.div>
                  ))}
                  <motion.div
                    className={s.dealDigit}
                    whileHover={{ y: -6 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <div className={s.dealDigitValue}>
                      {Math.max(0, Number(dealProduct.stock_quantity || 0))}
                    </div>
                    <div className={s.dealDigitLabel}>Left</div>
                  </motion.div>
                </div>

                <div className={s.dealStock}>
                  {(() => {
                    const stock = Number(dealProduct.stock_quantity || 0);
                    const threshold = Number(
                      dealProduct.low_stock_threshold || 10,
                    );
                    const totalStock = stock + 40;
                    const claimedPercentage =
                      totalStock > 0
                        ? Math.min(
                          100,
                          Math.round(
                            ((totalStock - stock) / totalStock) * 100,
                          ),
                        )
                        : 0;
                    return (
                      <>
                        <div className={s.dealStockBar}>
                          <motion.div
                            className={s.dealStockFill}
                            initial={{ width: "0%" }}
                            animate={{ width: `${claimedPercentage}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                          />
                        </div>
                        <div className={s.dealStockLabel}>
                          {stock <= threshold
                            ? `Only ${stock} left in stock`
                            : `${stock} items available`}
                        </div>
                      </>
                    );
                  })()}
                </div>

                <motion.button
                  onClick={handleDealClick}
                  className={s.btnPrimary}
                  style={{ marginTop: 28 }}
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <span>Grab this deal</span>
                  <svg
                    className={s.btnArrow}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </motion.button>
              </motion.div>
            </div>
          ) : (
            <div className={s.dealEmpty}>No deal available today.</div>
          )}
        </div>
      </motion.section>

      {/* Products Section */}
      <motion.section
        className={s.sectionPremium}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        <div className={s.container}>
          <motion.div className={s.sectionHeader} variants={fadeInUp}>
            <div className={s.sectionHeaderLeft}>
              <div className={s.kicker}>
                <span className={s.kickerLine} />
                Most loved
              </div>
              <h2 className={s.sectionTitle}>Trending this week</h2>
            </div>
            <div className={s.filterGroup}>
              <motion.span
                onClick={() => setFilter("All")}
                className={`${s.filterChip} ${filter === "All" ? s.active : ""}`}
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
              >
                All
              </motion.span>
              {isCategoriesLoading ? (
                <span className={s.filterLoading}>Loading...</span>
              ) : (
                categories.map((category: any) => (
                  <motion.span
                    key={category.id}
                    onClick={() => setFilter(category.id.toString())}
                    className={`${s.filterChip} ${filter === category.id.toString() ? s.active : ""}`}
                    whileHover={{ y: -2, scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {category.name || category.title}
                  </motion.span>
                ))
              )}
            </div>
          </motion.div>

          {isTrendingLoading ? (
            <div className={s.loadingGrid}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={s.skeletonCard}>
                  <div className={s.skeletonImage} />
                  <div className={s.skeletonText} />
                  <div className={s.skeletonPrice} />
                </div>
              ))}
            </div>
          ) : isTrendingError ? (
            <div className={s.errorState}>
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
                        product.category_id === Number(filter),
                    );

                return filteredProducts.length === 0 ? (
                  <div className={s.emptyState}>
                    No trending products found in this category.
                  </div>
                ) : (
                  <div className={s.productGrid}>
                    {filteredProducts.map((p: any) => {
                      const price = Number(p.retail_price ?? 0);
                      const mrp = Number(p.retail_mrp ?? 0);
                      const discount =
                        mrp > 0 && price < mrp
                          ? Math.round(((mrp - price) / mrp) * 100)
                          : 0;
                      const image =
                        p.images?.find((img: any) => img.is_primary)
                          ?.image_url ||
                        p.images?.[0]?.image_url ||
                        "/images/product-placeholder.png";
                      const category = categories.find(
                        (cat: any) => cat.id === p.category_id,
                      );

                      return (
                        <motion.div
                          key={p.id}
                          className={s.productCard}
                          variants={scaleIn}
                          whileHover="hover"
                          transition={{ duration: 0.4 }}
                        >
                          <div className={s.productImageWrapper}>
                            <motion.div
                              className={s.productImage}
                              whileHover={{ scale: 1.1 }}
                              transition={{ duration: 0.6 }}
                            >
                              <img src={image} alt={p.name} />
                            </motion.div>
                            <span className={s.productTag}>
                              {category?.name || "Trending"}
                            </span>
                            <motion.div
                              onClick={() => toggleWish(p.name)}
                              className={`${s.productWish} ${wish[p.name] ? s.active : ""}`}
                              whileHover={{ scale: 1.15 }}
                              whileTap={{ scale: 0.85 }}
                              transition={{ type: "spring", stiffness: 400 }}
                            >
                              <svg
                                viewBox="0 0 24 24"
                                fill={wish[p.name] ? "#C44A6A" : "none"}
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                              </svg>
                            </motion.div>
                            <motion.div
                              onClick={() => addToCart()}
                              className={s.productQuickAdd}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Add to bag
                            </motion.div>
                          </div>
                          <div className={s.productInfo}>
                            <div className={s.productCategory}>
                              {category?.name || "Trending"}
                            </div>
                            <div className={s.productName}>{p.name}</div>
                            {p.description && (
                              <div className={s.productDescription}>
                                {p.description}
                              </div>
                            )}
                            <div className={s.productPrice}>
                              <span className={s.productPriceCurrent}>
                                ₹{price.toLocaleString("en-IN")}
                              </span>
                              {mrp > 0 && mrp > price && (
                                <span className={s.productPriceMrp}>
                                  ₹{mrp.toLocaleString("en-IN")}
                                </span>
                              )}
                              {discount > 0 && (
                                <span className={s.productDiscount}>
                                  {discount}% off
                                </span>
                              )}
                            </div>
                            <div className={s.productMeta}>
                              <span className={s.productStars}>★★★★★</span>
                              <span>Trending</span>
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

      {/* Reels Section */}
      <motion.section
        className={s.sectionLuxury}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        <motion.div
          className={s.reelsGlow}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <div className={s.container}>
          <motion.div className={s.sectionHeader} variants={fadeInUp}>
            <div className={s.sectionHeaderLeft}>
              <div className={s.kicker}>
                <motion.span
                  className={s.pulseDot}
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                Live now
              </div>
              <h2 className={s.sectionTitle}>Shop the reels</h2>
              <p className={s.sectionSubtitle}>
                Partner creators showing the products in real homes. Tap any
                reel to shop the look.
              </p>
            </div>
            <div className={s.reelControls}>
              <motion.button
                onClick={() => scrollReel(-1)}
                className={s.arrowBtn}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </motion.button>
              <motion.button
                onClick={() => scrollReel(1)}
                className={s.arrowBtn}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </motion.button>
            </div>
          </motion.div>

          {isReelsLoading ? (
            <div className={s.reelsLoading}>
              <div className={s.loaderRing} />
            </div>
          ) : reelsError ? (
            <div className={s.errorState}>Failed to load reels</div>
          ) : (
            <div ref={rail} className={s.reelRail}>
              {(reelsData?.data || []).map((r: any) => {
                const product = r.product;
                const productSlug = product?.slug;
                const productName = product?.name || "Product";
                const productImage = getProductImage(product);
                const productPrice = getProductPrice(product);
                const creatorName = r.creator_handle || r.title || "Creator";
                const views = r.followers_count || 0;
                const videoUrl =
                  r.video_full_url || r.video_url || r.video_path;

                const handleReelClick = () => {
                  console.log("Play reel:", videoUrl);
                };

                const handleShopClick = (e: React.MouseEvent) => {
                  e.stopPropagation();
                  if (productSlug) {
                    router.push(`/product/${productSlug}/`);
                  }
                };

                return (
                  <motion.div
                    key={r.id || r.creator_handle}
                    className={s.reelCard}
                    whileHover={{ y: -10, scale: 1.02 }}
                    transition={{ duration: 0.4 }}
                    onClick={handleReelClick}
                  >
                    <div className={s.reelMedia}>
                      {videoUrl ? (
                        <video
                          src={videoUrl}
                          muted
                          playsInline
                          poster={productImage}
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
                        <img src={productImage} alt={r.title || "Reel"} />
                      )}
                    </div>
                    <div className={s.reelOverlay} />
                    <div className={s.reelHeader}>
                      <div className={s.reelAvatar}>
                        <img
                          src={getCreatorAvatar(creatorName)}
                          alt={creatorName}
                        />
                      </div>
                      <span className={s.reelCreator}>@{creatorName}</span>
                    </div>
                    <div className={s.reelViews}>▶ {formatViews(views)}</div>
                    <div className={s.reelFooter}>
                      <div className={s.reelCaption}>
                        {r.title || r.caption || `${creatorName}'s reel`}
                      </div>
                      <div className={s.reelProduct}>
                        <div className={s.reelProductImage}>
                          <img src={productImage} alt={productName} />
                        </div>
                        <div className={s.reelProductInfo}>
                          <div className={s.reelProductName}>{productName}</div>
                          <div className={s.reelProductPrice}>
                            {productPrice}
                          </div>
                        </div>
                        <motion.span
                          className={s.reelShopBtn}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleShopClick}
                        >
                          Shop
                        </motion.span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </motion.section>

      {/* Promises Section */}
      <motion.section
        className={s.sectionDark}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        <div className={s.container}>
          <div className={s.promisesGrid}>
            {promises.map((p) => (
              <motion.div
                key={p.title}
                className={s.promiseItem}
                variants={fadeInUp}
                whileHover={{ y: -6 }}
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
                  <div className={s.promiseTitle}>{p.title}</div>
                  <div className={s.promiseBody}>{p.body}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Flash Offers */}
      <motion.section
        className={s.sectionPremium}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        <motion.div
          className={s.offersGlow}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <div className={s.container}>
          <motion.div className={s.offersHeader} variants={fadeInUp}>
            <div className={s.kicker} style={{ justifyContent: "center" }}>
              <span className={s.kickerLine} />
              Limited time
            </div>
            <h2 className={s.sectionTitle} style={{ textAlign: "center" }}>
              Flash offers you don&apos;t want to miss
            </h2>
          </motion.div>

          <div className={s.offersGrid}>
            <motion.div
              className={s.offerHero}
              variants={scaleIn}
              whileHover={{ scale: 1.02, y: -8 }}
              transition={{ duration: 0.4 }}
            >
              <motion.img
                src="https://images.unsplash.com/photo-1670201203116-26644750a726?auto=format&fit=crop&w=1200&q=80"
                alt="Beauty campaign"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.5 }}
              />
              <div className={s.offerHeroOverlay} />
              <div className={s.offerHeroContent}>
                <motion.span
                  className={s.offerHeroTimer}
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  ⏱ Ends in {time.h}:{time.m}:{time.s}
                </motion.span>
                <div className={s.offerHeroTitle}>Up to 45% off beauty</div>
                <motion.span
                  className={s.offerHeroCta}
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Shop flash sale →
                </motion.span>
              </div>
            </motion.div>

            {offers.map((o) => (
              <motion.div
                key={o.title}
                className={s.offerCard}
                variants={scaleIn}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.4 }}
              >
                <div className={s.offerCardContent}>
                  <div className={s.offerCardKicker}>{o.kicker}</div>
                  <div className={s.offerCardTitle}>{o.title}</div>
                </div>
                <div>
                  <motion.div
                    className={s.offerCardImage}
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.4 }}
                  >
                    <img src={o.img} alt={o.title} />
                  </motion.div>
                  <motion.span
                    className={s.offerCardCta}
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

      {/* Testimonial */}
      <motion.section
        className={s.sectionDark}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        <motion.div
          className={s.testimonialGlow}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <div className={s.testimonialContainer}>
          <motion.div className={s.testimonialStars} variants={fadeInUp}>
            ★★★★★
          </motion.div>
          <motion.div variants={fadeInUp}>
            <AnimatePresence mode="wait">
              <motion.p
                key={testimonial}
                className={s.testimonialQuote}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                “{testimonials[testimonial].quote}”
              </motion.p>
            </AnimatePresence>
            <motion.div
              className={s.testimonialAuthor}
              key={testimonial}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className={s.testimonialAvatar}>
                <img
                  src={testimonials[testimonial].img}
                  alt={testimonials[testimonial].name}
                />
              </div>
              <div>
                <div className={s.testimonialName}>
                  {testimonials[testimonial].name}
                </div>
                <div className={s.testimonialLoc}>
                  {testimonials[testimonial].loc}
                </div>
              </div>
            </motion.div>
          </motion.div>
          <div className={s.testimonialDots}>
            {testimonials.map((_, i) => (
              <motion.span
                key={i}
                onClick={() => setTestimonial(i)}
                className={`${s.testimonialDot} ${i === testimonial ? s.active : ""}`}
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.8 }}
              />
            ))}
          </div>
          <motion.div className={s.testimonialStats} variants={fadeInUp}>
            {trustStats.map((st) => (
              <motion.div
                key={st.k}
                className={s.testimonialStat}
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <div className={s.statNumber}>{st.v}</div>
                <div className={s.testimonialStatLabel}>{st.k}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Growth Ladder */}
      <motion.section
        className={s.sectionPremium}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        <div className={s.container}>
          <motion.div className={s.sectionHeader} variants={fadeInUp}>
            <div className={s.sectionHeaderLeft}>
              <div className={s.kicker}>
                <span className={s.kickerLine} />
                Opportunity
              </div>
              <h2 className={s.sectionTitle}>A growth ladder for leaders</h2>
            </div>
            <div className={s.levelControls}>
              <motion.button
                onClick={() =>
                  setLevel((l) => (l + levels.length - 1) % levels.length)
                }
                className={s.arrowBtn}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </motion.button>
              <motion.button
                onClick={() => setLevel((l) => (l + 1) % levels.length)}
                className={s.arrowBtn}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </motion.button>
            </div>
          </motion.div>

          <motion.div className={s.levelsContainer} variants={staggerContainer}>
            {levels.map((l, i) => (
              <motion.div
                key={l.num}
                onClick={() => setLevel(i)}
                className={`${s.levelCard} ${level === i ? s.active : ""}`}
                variants={scaleIn}
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <motion.div
                  className={s.levelNum}
                  animate={level === i ? { scale: [1, 1.08, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {l.num}
                </motion.div>
                <div
                  className={`${s.levelTitle} ${level === i ? s.active : ""}`}
                >
                  {l.title}
                </div>
                <p className={s.levelBody}>{l.body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Gallery - Removed bottom margin/padding */}
      <motion.section
        className={s.sectionLuxury}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
        style={{ marginBottom: 0, paddingBottom: 0 }}
      >
        <motion.div
          className={s.galleryGlow}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <div className={s.container} style={{ paddingBottom: 0 }}>
          <motion.div className={s.galleryHeader} variants={fadeInUp}>
            <div className={s.kicker} style={{ justifyContent: "center" }}>
              <span className={s.kickerLine} />
              #IndieKonnectGlow
            </div>
            <h2 className={s.sectionTitle} style={{ textAlign: "center" }}>
              Feel the glow with us
            </h2>
          </motion.div>

          <div className={s.galleryGrid}>
            {gallery.map((g) => (
              <motion.div
                key={g}
                className={s.galleryItem}
                variants={scaleIn}
                whileHover={{ scale: 1.06, y: -8 }}
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
                  <span>Shop look</span>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
