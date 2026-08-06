"use client";

import Image from "next/image";
import Link from "next/link";

import {
  Heart,
  ArrowRight,
} from "lucide-react";

import { FiArrowUpRight } from "react-icons/fi";

import Watch from "../../../../public/images/watch.jpeg";
import Dinner from "../../../../public/images/Dinner.jpeg";
import Notebook from "../../../../public/images/notebook.jpeg";
import Plate from "../../../../public/images/plate.jpeg";

import { getFont, FONT_WEIGHT } from "../../../lib/constants/font-family";

const products = [
  {
    id: 1,
    image: Watch,
    category: "MEN'S JEWELLERY",
    title: "Fabius Resolute Black. Seagull Automatic Skeleton",
    price: "MRP ₹ 1,15,479",
  },
  {
    id: 2,
    image: Dinner,
    category: "DINNERWARE",
    title: "Kintsugi Spectrum Luxe. Porcelain, 24kt Gold Plated",
    price: "MRP ₹ 1,38,180",
  },
  {
    id: 3,
    image: Notebook,
    category: "MEN'S JEWELLERY",
    title: "The Signature Desk & Tech Collection",
    price: "MRP ₹ 3,450",
  },
  {
    id: 4,
    image: Plate,
    category: "DINNERWARE",
    title: "Kintsugi Royal Opulence. Porcelain, 24kt Gold Plated",
    price: "MRP ₹ 1,92,465",
  },
];

export default function FeaturedProducts() {
  return (
    <section className="w-full bg-white py-20">
      <div className="w-full max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-10 gap-4">
          <div>
            <p
              className="text-[13px] text-[#555] text-center sm:text-left"
              style={{
                fontFamily: getFont("arimo", FONT_WEIGHT.regular),
              }}
            >
              The Collections
            </p>

            <h2
              className="mt-2 text-[28px] sm:text-[34px] lg:text-[38px] leading-none text-[#202020] text-center sm:text-left"
              style={{
                fontFamily: getFont("arimo", FONT_WEIGHT.medium),
              }}
            >
              Our Best Sellers
            </h2>
          </div>

          <Link
            href="/collections"
            className="group flex items-center gap-2 text-[#202020] self-center sm:self-auto"
            style={{
              fontFamily: getFont("lato", FONT_WEIGHT.regular),
            }}
          >
            <span className="text-[15px] sm:text-[17px]">View All</span>

            <div
              className="
                w-8 h-8 rounded-full bg-[#EFEFEF]
                flex items-center justify-center
                transition-all duration-300
                group-hover:translate-x-1
                group-hover:bg-black group-hover:text-white
              "
            >
              <FiArrowUpRight size={16} />
            </div>
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="group cursor-pointer bg-white transition-all duration-500 hover:-translate-y-1"
            >
              {/* Image */}
              <div className="relative overflow-hidden bg-[#F5F5F5]">
                <Image
                  src={product.image}
                  alt={product.title}
                  width={400}
                  height={380}
                  className="
                    w-full h-[280px] sm:h-[320px] lg:h-[380px] object-cover
                    transition-all duration-700
                    group-hover:scale-105
                  "
                />

                {/* Favourite Button */}
                <button
                  className="
                    absolute top-3 right-3 sm:top-4 sm:right-4
                    w-8 h-8 sm:w-10 sm:h-10 rounded-full
                    bg-white shadow-md
                    flex items-center justify-center
                    transition-all duration-300
                    hover:bg-black hover:text-white
                  "
                >
                  <Heart size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>
              </div>

              {/* Content */}
              <div className="pt-3 sm:pt-4">
                {/* Category */}
                <p
                  className="
                    uppercase text-[10px] sm:text-[11px] tracking-[1.8px]
                    text-[#9C9C9C] mb-1 sm:mb-2
                  "
                  style={{
                    fontFamily: getFont("lato", FONT_WEIGHT.regular),
                  }}
                >
                  {product.category}
                </p>

                {/* Title */}
                <h3
                  className="
                    text-[15px] sm:text-[18px] leading-[24px] sm:leading-[28px]
                    text-[#202020] min-h-[40px] sm:min-h-[70px]
                    transition-colors duration-300
                    group-hover:text-[#8B6A3E]
                  "
                  style={{
                    fontFamily: getFont("lato", FONT_WEIGHT.regular),
                  }}
                >
                  {product.title}
                </h3>

                {/* Price - Small font */}
                <p
                  className=" text-[16px] sm:text-[16px] text-[#202020]"
                  style={{
                    fontFamily: getFont("lato", FONT_WEIGHT.bold),
                  }}
                >
                  {product.price}
                </p>

                {/* Tax Info - Replacing Explore */}
                <p
                  className=" text-[10px] sm:text-[11px] text-[#888]"
                  style={{
                    fontFamily: getFont("lato", FONT_WEIGHT.regular),
                  }}
                >
                  (incl. of all taxes)
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}