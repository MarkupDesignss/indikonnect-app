"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import ProductGrid from "../../../components/product/ProductGrid";
import FilterSidebar from "../../../components/product/FilterSidebar";
import Newsletter from "../../../components/product/Newsletter";
import Footer from "../../../components/Footer/Footer";
import Header from "../../../components/common/Header";
// Import your banner image
import BannerImage from "../../../../public/images/banner.png";

export default function ProductsPage(): JSX.Element {
  // Animation variants
  const bannerVariants = {
    hidden: { opacity: 0, scale: 1.1 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        delay: 0.3,
        ease: "easeOut",
      },
    },
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: 0.5,
        ease: "easeOut",
      },
    },
  };

  const titleVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        delay: 0.7,
        ease: "easeOut",
      },
    },
  };

  const subtitleVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        delay: 0.9,
        ease: "easeOut",
      },
    },
  };

  const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: 1.1,
        ease: "easeOut",
      },
    },
    hover: {
      scale: 1.05,
      boxShadow: "0 10px 30px rgba(255,255,255,0.2)",
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    tap: {
      scale: 0.95,
      transition: {
        duration: 0.1,
      },
    },
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: 0.3,
        ease: "easeOut",
      },
    },
  };

  const breadcrumbVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        delay: 0.4,
        ease: "easeOut",
      },
    },
  };

  return (
    <div>
        <Header/>
      {/* Full Width Banner */}
      <motion.div
        className="relative w-screen left-1/2 -translate-x-1/2 h-[200px] md:h-[300px] lg:h-[400px] overflow-hidden"
        variants={bannerVariants}
        initial="hidden"
        animate="visible"
      >
        <Image
          src={BannerImage}
          alt="Collections Banner"
          fill
          className="object-cover"
          priority
        />

        {/* Gradient Overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent flex items-center"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="container mx-auto px-4">
            <motion.div
              className="px-6 md:px-12 lg:px-16 max-w-2xl"
              variants={contentVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.h2
                className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-2 md:mb-4"
                variants={titleVariants}
                initial="hidden"
                animate="visible"
              >
                Premium Collection
                <motion.span
                  className="inline-block ml-2 text-yellow-400"
                  animate={{
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                >
                  ✨
                </motion.span>
              </motion.h2>

              <motion.p
                className="text-sm md:text-base lg:text-lg text-white/90 mb-4 md:mb-6"
                variants={subtitleVariants}
                initial="hidden"
                animate="visible"
              >
                Discover our curated selection of premium dinnerware and
                accessories
              </motion.p>

              <motion.button
                className="px-6 py-2 md:px-8 md:py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-all transform text-sm md:text-base shadow-lg relative overflow-hidden group"
                variants={buttonVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                whileTap="tap"
              >
                {/* Button Shine Effect */}
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.6 }}
                />
                <span className="relative z-10 flex items-center gap-2">
                  Shop Now
                  <motion.span
                    animate={{
                      x: [0, 5, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    →
                  </motion.span>
                </span>
              </motion.button>
            </motion.div>
          </div>
        </motion.div>

        {/* Decorative Elements */}
        <motion.div
          className="absolute top-10 right-10 w-20 h-20 border-2 border-white/10 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-10 left-10 w-12 h-12 border-2 border-white/10 rounded-full"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </motion.div>

      {/* Content Section */}
      <div className="container bg-white mx-auto px-4 py-8 md:py-10">
        {/* Page Header */}
        <motion.div
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-5 border-b border-gray-200"
          variants={headerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            className="text-2xl md:text-3xl font-semibold text-gray-800"
            whileHover={{
              color: "#F9C744",
              scale: 1.02,
            }}
            transition={{ duration: 0.3 }}
          >
            Collections
          </motion.h1>

          <motion.nav
            className="flex items-center gap-2 text-sm text-gray-500 mt-2 sm:mt-0"
            aria-label="Breadcrumb"
            variants={breadcrumbVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.span
              whileHover={{ color: "#F9C744" }}
              transition={{ duration: 0.2 }}
            >
              Home
            </motion.span>
            <span className="text-gray-300">/</span>
            <motion.span
              whileHover={{ color: "#F9C744" }}
              transition={{ duration: 0.2 }}
            >
              Products
            </motion.span>
          </motion.nav>
        </motion.div>

        {/* Main Layout */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 md:gap-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: 0.3,
            ease: "easeOut",
          }}
        >
          <FilterSidebar />
          <ProductGrid />
        </motion.div>
      </div>

      {/* Full Width Newsletter */}
      <Newsletter />

      {/* Footer */}
      <Footer />
    </div>
  );
}
