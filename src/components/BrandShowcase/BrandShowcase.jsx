// components/BrandShowcase/BrandShowcase.jsx
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

const brands = [
  {
    name: "Nike",
    logo: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&h=80&fit=crop",
  },
  {
    name: "Adidas",
    logo: "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=120&h=80&fit=crop",
  },
  {
    name: "Puma",
    logo: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=120&h=80&fit=crop",
  },
  {
    name: "Gucci",
    logo: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=120&h=80&fit=crop",
  },
  {
    name: "Zara",
    logo: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=120&h=80&fit=crop",
  },
  {
    name: "H&M",
    logo: "https://images.unsplash.com/photo-1534126511673-b6899657816a?w=120&h=80&fit=crop",
  },
];

export default function BrandShowcase() {
  const containerRef = useRef(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8, filter: "grayscale(100%)" },
    visible: {
      opacity: 1,
      scale: 1,
      filter: "grayscale(0%)",
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <section className="py-16 bg-white border-t border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
          className="space-y-4"
        >
          <motion.p
            variants={itemVariants}
            className="text-center text-sm font-medium text-gray-400 uppercase tracking-widest"
          >
            Trusted by Leading Brands
          </motion.p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 md:gap-8">
            {brands.map((brand, i) => (
              <motion.div
                key={brand.name}
                variants={itemVariants}
                whileHover={{
                  scale: 1.08,
                  filter: "grayscale(0%)",
                  transition: { duration: 0.2 },
                }}
                className="flex items-center justify-center p-4 rounded-xl bg-gray-50/50 hover:bg-gray-100/80 transition-colors duration-300 cursor-pointer group"
              >
                <div className="relative w-full h-12 flex items-center justify-center">
                  <Image
                    src={brand.logo}
                    alt={brand.name}
                    width={100}
                    height={40}
                    className="object-contain opacity-70 group-hover:opacity-100 transition-opacity duration-300"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${brand.name}&background=6366f1&color=fff&size=40`;
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Animated Marquee Line */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="relative overflow-hidden py-3 mt-4"
          >
            <motion.div
              animate={{ x: ["0%", "-100%"] }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear",
              }}
              className="flex gap-12 whitespace-nowrap"
            >
              {[...Array(2)].map((_, i) => (
                <span
                  key={i}
                  className="text-sm text-gray-300 font-medium tracking-wider"
                >
                  ✦ PREMIUM QUALITY ✦ SUSTAINABLE ✦ INNOVATIVE DESIGN ✦ CRAFTED
                  WITH CARE ✦
                </span>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
