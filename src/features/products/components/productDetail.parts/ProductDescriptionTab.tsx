"use client";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { ProductDetailViewModel } from './useProductDetail';


export default function ProductDescriptionTab({ product, specRows, router }: Pick<ProductDetailViewModel, "product" | "specRows" | "router">) {
  return (
<motion.div
                key="details"
                initial={{
                  opacity: 0,
                  y: 6,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -6,
                }}
                className="grid gap-7 pt-6 lg:grid-cols-[1fr_240px]"
              >
                <div>
                  <p className="whitespace-pre-wrap text-[13px] leading-7 text-[#5D5D5D]">
                    {product.description ||
                      "Premium quality product with exceptional design and craftsmanship."}
                  </p>

                  <div className="mt-6 overflow-hidden rounded-[7px] border border-[#E6E6E6]">
                    <div className="border-b border-[#E6E6E6] bg-[#FAFAFA] px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide">
                      Specifications
                    </div>

                    <div className="grid md:grid-cols-2">
                      {specRows
                        .slice(0, 8)
                        .filter(([label]) => label !== "Manufactured By:")
                        .map(([label, value], index) => (
                          <div
                            key={label}
                            className={`flex justify-between gap-4 border-b border-[#EFEFEF] px-4 py-2.5 text-[10px] ${
                              index % 2 === 0 ? "bg-white" : "bg-[#FCFCFC]"
                            }`}
                          >
                            <span className="text-[#888]">{label}</span>

                            <span className="text-right font-semibold text-[#2A2A2A]">
                              {value}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                <aside className="self-start rounded-[10px] bg-[#F3F3F3] p-5">
                  <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#888]">
                    IndieKonnect
                  </p>

                  <h3 className="mt-1 text-lg font-semibold">
                    Premium Collection
                  </h3>

                  <p className="mt-1 text-[10px] leading-5 text-[#777]">
                    Discover more products from our collection.
                  </p>

                  <button
                    type="button"
                    onClick={() => router.push("/products/")}
                    className="mt-3 inline-flex items-center gap-1 rounded-full border border-[#777] px-3.5 py-1.5 text-[10px] font-semibold"
                  >
                    View
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </aside>
              </motion.div>
  );
}
