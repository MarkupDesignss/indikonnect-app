"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Gift } from "lucide-react";
import { PLACEHOLDER, formatINR } from "@/features/products/components/productDetail.parts/support";
import type { ProductDetailViewModel } from './useProductDetail';


export default function ProductComboTab({
  comboItems,
  product,
  comboTotals,
  showBAPricing,
  gallery,
  openFullscreen,
  buildProductPath,
}: Pick<ProductDetailViewModel, 
  "comboItems"
  | "product"
  | "comboTotals"
  | "showBAPricing"
  | "gallery"
  | "openFullscreen"
  | "buildProductPath"
>) {
  return (
<motion.div
                key="combo"
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
                className="pt-6"
              >
                {/* HEADER */}
                <div className="flex flex-wrap items-center gap-2">
                  <Gift className="h-5 w-5 text-[#111]" />

                  <h3 className="text-[16px] font-semibold text-[#111]">
                    What&apos;s inside this combo
                  </h3>

                  <span className="rounded-full bg-[#F1F1F1] px-2.5 py-0.5 text-[10px] font-semibold text-[#555]">
                    {comboItems.length} products
                  </span>
                </div>

                <p className="mt-1 text-[11px] text-[#777]">
                  Short details of every product included in {product.name}.
                </p>

                {/* SUMMARY BAR */}
                {comboTotals && (
                  <div className="mt-4 grid gap-2.5 rounded-[10px] border border-[#E6E6E6] bg-[#FAFAFA] p-4 sm:grid-cols-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#999]">
                        Combo Price
                      </p>
                      <p
                        className={`mt-1 text-[18px] font-bold ${
                          showBAPricing ? "text-[#126B40]" : "text-[#111]"
                        }`}
                      >
                        ₹{formatINR(comboTotals.comboPrice)}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#999]">
                        If Bought Separately
                      </p>
                      <p className="mt-1 text-[18px] font-medium text-[#89939B] line-through">
                        ₹{formatINR(comboTotals.sumPrice)}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#999]">
                        You Save
                      </p>
                      <p className="mt-1 text-[18px] font-bold text-[#188447]">
                        {comboTotals.savings > 0
                          ? `₹${formatINR(comboTotals.savings)}`
                          : "—"}
                      </p>
                    </div>
                  </div>
                )}

                {/* PRODUCT CARDS */}
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {comboItems.map((item, itemIndex) => (
                    <article
                      key={item.id}
                      className="overflow-hidden rounded-[12px] border border-[#E6E6E6] bg-white transition hover:shadow-[0_8px_24px_rgba(0,0,0,0.07)]"
                    >
                      {/* MAIN IMAGE */}
                      <div className="relative aspect-[4/3] bg-[#F3F3F3]">
                        <button
                          type="button"
                          onClick={() => {
                            const idx = gallery.indexOf(item.primaryImage);
                            openFullscreen(idx >= 0 ? idx : 0);
                          }}
                          className="block h-full w-full"
                          aria-label={`View ${item.name} image`}
                        >
                          <Image
                            src={item.primaryImage || PLACEHOLDER}
                            alt={item.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 45vw"
                            className="object-cover"
                          />
                        </button>

                        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-[#111] shadow-sm">
                          Item {itemIndex + 1} of {comboItems.length}
                        </span>
                      </div>

                      {/* THUMBNAILS OF THIS PRODUCT */}
                      {item.images.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto border-b border-[#EFEFEF] px-4 py-3">
                          {item.images.map((img, imgIndex) => (
                            <button
                              key={`${item.id}-${img}-${imgIndex}`}
                              type="button"
                              onClick={() => {
                                const idx = gallery.indexOf(img);
                                openFullscreen(idx >= 0 ? idx : 0);
                              }}
                              className="relative h-[54px] w-[54px] flex-shrink-0 overflow-hidden rounded-[7px] border-2 border-[#E4E4E4] bg-white transition hover:border-[#111]"
                              aria-label={`${item.name} image ${imgIndex + 1}`}
                            >
                              <Image
                                src={img || PLACEHOLDER}
                                alt={`${item.name} ${imgIndex + 1}`}
                                fill
                                sizes="54px"
                                className="object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      )}

                      {/* SHORT DETAILS */}
                      <div className="p-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {item.brand && (
                            <span className="rounded-full bg-[#F1F1F1] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[#555]">
                              {item.brand}
                            </span>
                          )}

                          {item.taxName && (
                            <span className="rounded-full bg-[#F1F1F1] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[#555]">
                              {item.taxName}
                            </span>
                          )}
                        </div>

                        <h4 className="mt-2 text-[15px] font-semibold leading-snug text-[#171717]">
                          {item.name}
                        </h4>

                        <div className="mt-3 overflow-hidden rounded-[8px] border border-[#EFEFEF]">
                          {[
                            ["Category", item.category],
                            ["Sub Category", item.subcategory],
                            ["Brand", item.brand],
                            ["Product Code", item.productCode],
                          ]
                            .filter(([, value]) => Boolean(value))
                            .map(([label, value], rowIndex) => (
                              <div
                                key={label}
                                className={`flex justify-between gap-4 px-3 py-2 text-[10px] ${
                                  rowIndex % 2 === 0
                                    ? "bg-white"
                                    : "bg-[#FCFCFC]"
                                }`}
                              >
                                <span className="text-[#888]">{label}</span>

                                <span className="text-right font-semibold text-[#2A2A2A]">
                                  {value}
                                </span>
                              </div>
                            ))}
                        </div>

                        {/* PRICE */}
                        {showBAPricing ? (
                          <div className="mt-3 flex items-end justify-between gap-3 rounded-xl border border-[#E4E9E6] bg-gradient-to-br from-[#F6FBF8] to-white p-3">
                            <div>
                              <p className="text-[10px] font-semibold tracking-wide text-[#49745A]">
                                BA Price
                              </p>
                              <p className="mt-1 text-[20px] font-bold leading-none text-[#146C43]">
                                ₹{formatINR(item.price)}
                              </p>
                            </div>

                            {item.mrp > 0 && (
                              <div className="text-right">
                                <p className="text-[10px] font-medium uppercase tracking-wide text-[#78828A]">
                                  MRP
                                </p>
                                <p className="mt-1 text-[14px] font-medium leading-none text-[#89939B] line-through">
                                  ₹{formatINR(item.mrp)}
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-[18px] font-bold text-[#111]">
                              ₹{formatINR(item.price)}
                            </span>

                            {item.mrp > item.price && (
                              <span className="text-[12px] text-[#A7A7A7] line-through">
                                ₹{formatINR(item.mrp)}
                              </span>
                            )}
                          </div>
                        )}

                        {/* COMMISSION (distributor only) */}
                        {showBAPricing && item.commission !== null && (
                          <div className="mt-2.5 flex items-center justify-between gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
                            <span className="text-[10px] font-semibold text-emerald-900">
                              Commission Value
                            </span>

                            <span className="whitespace-nowrap text-[12px] font-bold text-emerald-800">
                              {formatINR(item.commission)} pts
                              <span className="ml-1 text-[9px] font-medium">
                                /unit
                              </span>
                            </span>
                          </div>
                        )}

                        <Link
                          href={buildProductPath(item.slug)}
                          className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-[#111] underline underline-offset-2 transition hover:text-[#666]"
                        >
                          View full product
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </motion.div>
  );
}
