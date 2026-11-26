
"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Eye } from "lucide-react";
import type { ProductDetailViewModel } from "./useProductDetail";
import ManufacturingInfoModal from "./ManufacturingInfoModal";

type Props = Pick<
  ProductDetailViewModel,
  "product" | "specRows" | "router"
>;

type ManufacturingInfo = {
  country: string;
  manufacturedBy: string;
  manufacturerAddress: string;
  marketedBy: string;
};

export default function ProductDescriptionTab({
  product,
  specRows,
  router,
}: Props) {
  const [showManufacturingInfo, setShowManufacturingInfo] =
    useState(false);

  // Parse product specification safely.
  const specification = useMemo<Record<string, unknown>>(() => {
    try {
      const raw = product?.specification;

      if (!raw) return {};

      if (typeof raw === "object" && !Array.isArray(raw)) {
        return raw as Record<string, unknown>;
      }

      if (typeof raw === "string") {
        const parsed = JSON.parse(raw);

        if (
          parsed &&
          typeof parsed === "object" &&
          !Array.isArray(parsed)
        ) {
          return parsed as Record<string, unknown>;
        }
      }

      return {};
    } catch (error) {
      console.error("Unable to parse product specification:", error);
      return {};
    }
  }, [product?.specification]);

  // Read a specification value without depending on key capitalization.
  const getSpecificationValue = (label: string): string => {
    const entry = Object.entries(specification).find(
      ([key]) => key.trim().toLowerCase() === label.toLowerCase()
    );

    const value = entry?.[1];

    if (value === null || value === undefined) return "";

    return String(value).trim();
  };

  // Manufacturing information from API.
  const manufacturingInfo = useMemo<ManufacturingInfo>(() => {
    return {
      country: getSpecificationValue("Country of Manufacture"),
      manufacturedBy: getSpecificationValue("Manufactured By"),
      manufacturerAddress: getSpecificationValue(
        "Manufacturer Address"
      ),
      marketedBy: getSpecificationValue("Marketed By"),
    };
  }, [specification]);

  // Fields that should not appear in the normal specifications table.
  const hiddenLabels = [
    "manufactured by",
    "manufacturer address",
    "marketed by",
  ];

  const visibleSpecRows = specRows.filter(([label]) => {
    const normalizedLabel = String(label)
      .replace(/[_:]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

    return !hiddenLabels.includes(normalizedLabel);
  });

  const hasManufacturingDetails = Boolean(
    manufacturingInfo.country ||
      manufacturingInfo.manufacturedBy ||
      manufacturingInfo.manufacturerAddress ||
      manufacturingInfo.marketedBy
  );

  return (
    <>
      <motion.div
        key="details"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        className="grid gap-7 pt-6 lg:grid-cols-[1fr_240px]"
      >
        <div>
          {/* Product Description */}
          <p className="whitespace-pre-wrap text-[13px] leading-7 text-[#5D5D5D]">
            {product.description ||
              "Premium quality product with exceptional design and craftsmanship."}
          </p>

          {/* Specifications */}
          <div className="mt-6 overflow-hidden rounded-[7px] border border-[#E6E6E6]">
            {/* Specifications Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E6E6E6] bg-[#FAFAFA] px-4 py-3">
              <span className="text-[11px] font-bold uppercase tracking-wide text-[#222]">
                Specifications
              </span>

              {hasManufacturingDetails && (
                <button
                  type="button"
                  onClick={() => setShowManufacturingInfo(true)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#DCDCDC] bg-white px-3 py-1.5 text-[10px] font-semibold text-[#333] transition-all duration-200 hover:border-black hover:bg-[#111] hover:text-white"
                >
                  <Eye className="h-3.5 w-3.5" />

                  Manufacturer Details
                </button>
              )}
            </div>

            {/* Specifications Rows */}
            <div className="grid md:grid-cols-2">
              {visibleSpecRows.slice(0, 8).map(([label, value], index) => (
                <div
                  key={label}
                  className={`flex items-start justify-between gap-4 border-b border-[#EFEFEF] px-4 py-3 text-[11px] ${
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

        {/* Collection Sidebar */}
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
            className="mt-3 inline-flex items-center gap-1 rounded-full border border-[#777] px-3.5 py-1.5 text-[10px] font-semibold transition hover:bg-black hover:text-white"
          >
            View

            <ArrowRight className="h-3 w-3" />
          </button>
        </aside>
      </motion.div>

      {/* Manufacturer Details Modal */}
      <ManufacturingInfoModal
        showManufacturingInfo={showManufacturingInfo}
        setShowManufacturingInfo={setShowManufacturingInfo}
        manufacturingInfo={manufacturingInfo}
      />
    </>
  );
}
