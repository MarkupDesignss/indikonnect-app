// components/FeaturedProducts/FeaturedProducts.jsx
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { useState } from "react";

const products = [
  {
    id: 1,
    name: "Premium Sneakers",
    price: "$129.99",
    rating: 4.8,
    reviews: 312,
    image:
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=500&fit=crop",
    category: "Footwear",
  },
  {
    id: 2,
    name: "Classic Watch",
    price: "$249.99",
    rating: 4.9,
    reviews: 245,
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=500&fit=crop",
    category: "Accessories",
  },
  {
    id: 3,
    name: "Minimalist Bag",
    price: "$89.99",
    rating: 4.7,
    reviews: 189,
    image:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=500&fit=crop",
    category: "Bags",
  },
  {
    id: 4,
    name: "Sunglasses",
    price: "$159.99",
    rating: 4.6,
    reviews: 156,
    image:
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&h=500&fit=crop",
    category: "Accessories",
  },
];

export default function FeaturedProducts() {
  const [liked, setLiked] = useState({});

  const toggleLike = (id) => {
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
    hover: {
      y: -8,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
          className="space-y-12"
        >
          {/* Section Header */}
          <motion.div variants={cardVariants} className="text-center space-y-3">
            <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">
              Collection
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900">
              Featured Products
            </h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Handpicked selection of our most popular items
            </p>
          </motion.div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                variants={cardVariants}
                whileHover="hover"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={index}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-shadow duration-500"
              >
                <div className="relative overflow-hidden aspect-[4/5]">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={400}
                    height={500}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Quick actions */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleLike(product.id)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all duration-300 ${
                        liked[product.id]
                          ? "bg-red-500 text-white"
                          : "bg-white text-gray-600 hover:bg-red-50 hover:text-red-500"
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          liked[product.id] ? "fill-current" : ""
                        }`}
                      />
                    </motion.button>
                  </div>

                  {/* Category badge */}
                  <div className="absolute bottom-3 left-3">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700">
                      {product.category}
                    </span>
                  </div>

                  {/* Add to cart button (appears on hover) */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full py-3 bg-white text-gray-900 rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-shadow"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      Add to Cart
                    </motion.button>
                  </motion.div>
                </div>

                {/* Product Info */}
                <div className="p-4 space-y-2">
                  <h3 className="font-semibold text-gray-900 text-lg truncate">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-indigo-600">
                      {product.price}
                    </span>
                    <div className="flex items-center gap-1 text-sm">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < Math.floor(product.rating)
                                ? "fill-current"
                                : "fill-gray-200 text-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-gray-400 text-xs ml-1">
                        ({product.reviews})
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* View All Button */}
          <motion.div variants={cardVariants} className="text-center pt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 border-2 border-indigo-600 text-indigo-600 rounded-full font-medium hover:bg-indigo-600 hover:text-white transition-all duration-300"
            >
              View All Products
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
