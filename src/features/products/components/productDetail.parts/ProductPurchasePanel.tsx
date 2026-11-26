"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { Star, Heart, Package, CreditCard, CheckCircle, ShoppingBag, ArrowRight, Loader2, Bell, Info, BadgeCheck, Gift } from "lucide-react";
import IndiaPostDeliveryChecker from "@/features/products/components/IndiaPostDeliveryChecker";
import { PLACEHOLDER, formatINR, getVariantImageUrl } from "@/features/products/components/productDetail.parts/support";
import type { ProductDetailViewModel } from './useProductDetail';


export default function ProductPurchasePanel({
  product,
  isCombo,
  isDistributorApp,
  userAccountType,
  quantity,
  handleReadMore,
  comboItems,
  handleViewComboDetails,
  handleSelectComboImage,
  showBAPricing,
  comboTotals,
  hasVariants,
  variantAttributeOptions,
  selectedVariantAttributes,
  handleAttributeSelect,
  displayVariants,
  isMainProductSelected,
  selectedVariantId,
  handleSelectVariant,
  selectedVariant,
  mainPurchaseAvailable,
  handleBuyNow,
  isBuyingNow,
  handleAddToCart,
  isAddedToCart,
  handleNotifySubmit,
  isNotifyLoading,
  handleWishlistToggle,
  isWishlisted,
  activeProductSlug,
  apiProduct,
  manufacturingInfo,
  setShowManufacturingInfo,
}: Pick<ProductDetailViewModel,
  "product"
  | "isCombo"
  | "isDistributorApp"
  | "userAccountType"
  | "quantity"
  | "handleReadMore"
  | "comboItems"
  | "handleViewComboDetails"
  | "handleSelectComboImage"
  | "showBAPricing"
  | "comboTotals"
  | "hasVariants"
  | "variantAttributeOptions"
  | "selectedVariantAttributes"
  | "handleAttributeSelect"
  | "displayVariants"
  | "isMainProductSelected"
  | "selectedVariantId"
  | "handleSelectVariant"
  | "selectedVariant"
  | "mainPurchaseAvailable"
  | "handleBuyNow"
  | "isBuyingNow"
  | "handleAddToCart"
  | "isAddedToCart"
  | "handleNotifySubmit"
  | "isNotifyLoading"
  | "handleWishlistToggle"
  | "isWishlisted"
  | "activeProductSlug"
  | "apiProduct"
  | "manufacturingInfo"
  | "setShowManufacturingInfo"
>) {
  return (
    <div className="rounded-[8px] bg-white p-5 sm:p-6 lg:p-7">
      <div className="flex flex-wrap items-center gap-2">
        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#999]">
          {product.category}
        </div>

        {isCombo && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#111] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white">
            <Gift className="h-3 w-3" />
            Combo
          </span>
        )}
      </div>

      <h1 className="mt-1 text-[21px] font-semibold leading-[1.3] tracking-[-0.01em] text-[#171717] sm:text-[23px]">
        {product.name}
      </h1>

      {/* MAIN PRODUCT RATING - GREEN */}
      {product.rating > 0 && (
        <div className="mt-2.5 flex items-center gap-2.5">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                className={`h-3.5 w-3.5 ${n <= Math.floor(product.rating)
                    ? "fill-[#188447] text-[#188447]"
                    : "fill-[#188447]/10 text-[#D1D5DB]"
                  }`}
              />
            ))}
          </div>

          <span className="text-[12px] font-semibold text-[#333]">
            {product.rating.toFixed(1)}
          </span>

          {product.reviews > 0 && (
            <span className="text-[11px] text-[#888]">
              {product.reviews}{" "}
              {product.reviews === 1 ? "Rating" : "Ratings"}
            </span>
          )}
        </div>
      )}

      {/* PRICE: BA Price and Retail Price only on distributor portal */}
      {isDistributorApp && userAccountType === "distributor" ? (
        <div className="mt-4 overflow-hidden rounded-2xl border border-[#DCE9E0] bg-gradient-to-br from-[#F3FAF5] via-white to-[#F8FBF9] shadow-[0_4px_20px_rgba(22,101,52,0.055)]">
          <div className="flex flex-wrap items-stretch gap-0">
            <div className="min-w-[160px] flex-1 px-4 py-4 sm:px-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#377450]">
                BA Price
              </p>

              <p className="mt-2 break-words text-[25px] font-bold leading-tight tracking-[-0.035em] text-[#126B40]">
                ₹
                {product.price.toLocaleString("en-IN", {
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            {product.mrp > 0 && (
              <div className="flex min-w-[125px] flex-1 flex-col justify-center border-t border-[#E5ECE7] px-4 py-4 sm:border-l sm:border-t-0 sm:px-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#818B92]">
                  MRP
                </p>
                <p className="mt-2 break-words text-[25px] font-medium leading-tight tracking-tight text-[#89939B] line-through decoration-[#89939B] decoration-[1.5px]">
                  ₹
                  {product.mrp.toLocaleString("en-IN", {
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-3 flex items-end gap-2.5">
          <span className="text-[26px] font-bold tracking-[-0.02em] text-[#111]">
            ₹{product.price.toLocaleString("en-IN")}
          </span>

          {product.mrp > product.price && (
            <>
              <span className="pb-0.5 text-[15px] text-[#A7A7A7] line-through">
                ₹{product.mrp.toLocaleString("en-IN")}
              </span>

              <span className="text-[12px] font-semibold text-[#E25858]">
                ({product.discount}% OFF)
              </span>
            </>
          )}
        </div>
      )}
      <p className="mt-0.5 text-[11px] text-[#777]">
        Include all taxes with shipping charges
      </p>

      {/* DISTRIBUTOR-ONLY COMMISSION (product detail API) */}
      {isDistributorApp &&
        userAccountType === "distributor" &&
        product.commissionValue !== null && (
          <section
            aria-label="Distributor commission value"
            className="mt-4 rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-white px-4 py-3 sm:px-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-800">
                  Distributor Commission Value
                </p>
                <p className="mt-1 text-[20px] font-bold text-emerald-900">
                  {product.commissionValue.toLocaleString("en-IN", {
                    maximumFractionDigits: 2,
                  })}{" "}
                  pts
                  <span className="ml-2 text-[12px] font-medium text-emerald-700">
                    per unit
                  </span>
                </p>
              </div>
              {quantity > 1 && (
                <div className="text-left sm:text-right">
                  <p className="text-[11px] text-emerald-800">
                    Estimated for {quantity} units
                  </p>
                  <p className="text-[17px] font-bold text-emerald-900">
                    {(product.commissionValue * quantity).toLocaleString(
                      "en-IN",
                      { maximumFractionDigits: 2 },
                    )}{" "}
                    pts
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

      {/* LOW STOCK */}
      {product.isLowStock && (
        <div
          className="mt-3 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5"
          role="status"
        >
          <span aria-hidden="true" className="text-base">
            🔥
          </span>

          <span className="text-[12px] font-semibold text-amber-800">
            Hurry! Only {product.stockQuantity} left in stock
          </span>
        </div>
      )}

      {/* DESCRIPTION */}
      {product.description && (
        <div className="mt-4 border-t border-[#E8E8E8] pt-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#999]">
            About this product
          </p>

          <div className="relative mt-1.5 h-[36px] overflow-hidden">
            <p className="text-[11px] leading-[18px] text-[#666]">
              {product.description}
            </p>

            <button
              type="button"
              onClick={handleReadMore}
              className="absolute bottom-0 right-0 bg-white pl-2 text-[10px] font-semibold text-[#111] underline underline-offset-2 transition hover:text-[#666]"
            >
              Read more
            </button>
          </div>
        </div>
      )}

      {/* COMBO INCLUDES (visible in hero) */}
      {isCombo && comboItems.length > 0 && (
        <div className="mt-4 border-t border-[#E8E8E8] pt-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Gift className="h-4 w-4 text-[#111]" />

              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#222]">
                This combo includes
              </p>

              <span className="rounded-full bg-[#F1F1F1] px-2 py-0.5 text-[9px] font-semibold text-[#555]">
                {comboItems.length} products
              </span>
            </div>

            <button
              type="button"
              onClick={handleViewComboDetails}
              className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#111] underline underline-offset-2 transition hover:text-[#666]"
            >
              View details
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2">
            {comboItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectComboImage(item.primaryImage)}
                className="group/combo flex items-center gap-3 rounded-[10px] border border-[#E6E6E6] bg-[#FAFAFA] p-2.5 text-left transition hover:border-[#111] hover:bg-white"
              >
                <span className="relative h-[60px] w-[60px] flex-shrink-0 overflow-hidden rounded-[8px] border border-[#E6E6E6] bg-white">
                  <Image
                    src={item.primaryImage || PLACEHOLDER}
                    alt={item.name}
                    fill
                    sizes="60px"
                    className="object-cover transition duration-300 group-hover/combo:scale-105"
                  />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12px] font-semibold text-[#171717]">
                    {item.name}
                  </span>

                  <span className="mt-0.5 block truncate text-[10px] text-[#777]">
                    {[item.brand, item.subcategory || item.category]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>

                  <span
                    className={`mt-1 block text-[12px] font-bold ${showBAPricing ? "text-[#126B40]" : "text-[#111]"
                      }`}
                  >
                    ₹{formatINR(item.price)}
                    {item.mrp > item.price && (
                      <span className="ml-1.5 text-[10px] font-medium text-[#A7A7A7] line-through">
                        ₹{formatINR(item.mrp)}
                      </span>
                    )}
                  </span>
                </span>
              </button>
            ))}
          </div>

          {comboTotals && comboTotals.savings > 0 && (
            <p className="mt-2.5 rounded-lg bg-[#E8F5EE] px-3 py-2 text-[11px] font-semibold text-[#188447]">
              🎉 You save ₹{formatINR(comboTotals.savings)} compared to
              buying these separately
            </p>
          )}
        </div>
      )}

      {/* ATTRIBUTES */}
      {hasVariants && (
        <div className="mt-5 border-t border-[#E8E8E8] pt-4">
          {Object.entries(variantAttributeOptions).map(
            ([attributeKey, values]) => {
              if (
                attributeKey.toLowerCase() === "color1" ||
                attributeKey.toLowerCase() === "color"
              ) {
                return null;
              }

              return (
                <div key={attributeKey} className="mb-4">
                  <p className="mb-2 text-[11px] font-semibold text-[#222]">
                    {attributeKey
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (char) => char.toUpperCase())}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {values.map((value) => {
                      const selected =
                        selectedVariantAttributes[attributeKey] === value;

                      return (
                        <button
                          key={`${attributeKey}-${value}`}
                          type="button"
                          onClick={() =>
                            handleAttributeSelect(attributeKey, value)
                          }
                          className={`rounded-full border px-4 py-1.5 text-[11px] font-semibold transition ${selected
                              ? "border-[#111] bg-[#111] text-white"
                              : "border-[#D7D7D7] bg-white text-[#222] hover:border-[#111]"
                            }`}
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            },
          )}

          {/* COLORS */}
          <div className="mt-2">
            <div className="mb-2.5 flex items-center gap-2">
              <p className="text-[11px] font-semibold text-[#222]">
                More Colors
              </p>

              <span className="text-[9px] text-[#999]">
                {displayVariants.length} options
              </span>
            </div>

            <div className="flex flex-wrap items-start gap-3">
              {displayVariants.map((variant) => {
                const isMain = variant?.isMainProduct === true;

                const image = isMain
                  ? product.image
                  : getVariantImageUrl(variant);

                if (!image) return null;

                const isSelected = isMain
                  ? isMainProductSelected
                  : String(selectedVariantId) === String(variant.id);

                const colorName =
                  variant?.parsedAttributes?.color1 ||
                  variant?.parsedAttributes?.color ||
                  variant?.parsedAttributes?.Color ||
                  (/rose[\s-]*gold/i.test(variant?.name || "")
                    ? "Rose Gold"
                    : /steel|silver/i.test(variant?.name || "")
                      ? "Steel"
                      : /gold/i.test(variant?.name || "")
                        ? "Gold"
                        : variant?.name || "");

                return (
                  <div
                    key={isMain ? "main-product" : variant.id}
                    className="flex w-[60px] flex-col items-center"
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectVariant(variant)}
                      className={`relative h-[58px] w-[58px] overflow-hidden rounded-[8px] border-2 bg-white transition ${isSelected
                          ? "border-[#111] ring-1 ring-[#111]"
                          : "border-[#E3E3E3] hover:border-[#999]"
                        }`}
                      aria-label={colorName || product.name}
                    >
                      <Image
                        src={image}
                        alt={colorName || product.name}
                        fill
                        sizes="58px"
                        className="object-cover transition duration-300 hover:scale-105"
                      />
                    </button>

                    {!isMain && colorName && (
                      <span
                        className={`mt-1 max-w-[60px] truncate text-center text-[9px] font-medium ${isSelected ? "text-[#111]" : "text-[#888]"
                          }`}
                        title={colorName}
                      >
                        {colorName}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SELECTED VARIANT */}
      {!isMainProductSelected && selectedVariant && (
        <div className="mt-3 rounded-[7px] bg-[#F8F8F8] px-3 py-2">
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-[#777]">
            {selectedVariant?.sku && (
              <span>
                SKU:
                <span className="ml-1 font-semibold text-[#111]">
                  {selectedVariant.sku}
                </span>
              </span>
            )}

            {Object.entries(selectedVariantAttributes).map(
              ([key, value]) => (
                <span key={key}>
                  {key}:
                  <span className="ml-1 font-semibold text-[#111]">
                    {value}
                  </span>
                </span>
              ),
            )}
          </div>
        </div>
      )}

      {/* ACTIONS */}
      <div className="mt-5 flex items-center gap-2 border-t border-[#E8E8E8] pt-4">
        {mainPurchaseAvailable ? (
          <>
            <motion.button
              whileTap={{
                scale: 0.98,
              }}
              onClick={handleBuyNow}
              disabled={isBuyingNow}
              className="flex h-[46px] flex-1 items-center justify-center gap-2 rounded-[4px] bg-[#111] text-[12px] font-bold uppercase tracking-wide text-white hover:bg-[#252525] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isBuyingNow ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "BUY NOW"
              )}
            </motion.button>

            <motion.button
              whileTap={{
                scale: 0.98,
              }}
              onClick={handleAddToCart}
              className="flex h-[46px] flex-1 items-center justify-center gap-1.5 rounded-[4px] border-2 border-[#111] bg-white text-[12px] font-semibold uppercase tracking-wide text-[#111] hover:bg-[#111] hover:text-white"
            >
              {isAddedToCart ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Added
                </>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4" />
                  ADD TO BAG
                </>
              )}
            </motion.button>
          </>
        ) : (
          <motion.button
            whileTap={{
              scale: 0.98,
            }}
            type="button"
            onClick={handleNotifySubmit}
            disabled={isNotifyLoading}
            className="flex h-[46px] flex-1 items-center justify-center gap-1.5 rounded-[4px] bg-[#111] text-[12px] font-bold uppercase tracking-wide text-white transition hover:bg-[#252525] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isNotifyLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                SENDING...
              </>
            ) : (
              <>
                <Bell className="h-4 w-4" />
                NOTIFY ME
              </>
            )}
          </motion.button>
        )}

        <button
          type="button"
          onClick={(e) => handleWishlistToggle(e)}
          className={`flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center rounded-[4px] border-2 ${isWishlisted
              ? "border-[#111] bg-[#111] text-white"
              : "border-[#D7D7D7] bg-white text-[#111]"
            }`}
        >
          <Heart
            className={`h-[18px] w-[18px] ${isWishlisted ? "fill-white" : ""
              }`}
          />
        </button>
      </div>

      {!mainPurchaseAvailable && (
        <p className="mt-2 text-[10px] font-medium text-[#E25858]">
          Currently out of stock
        </p>
      )}

      {/* DELIVERY COVERAGE: INDIA EXCEPT TELANGANA (RTK QUERY) */}
      <IndiaPostDeliveryChecker
        key={`${activeProductSlug}-${String(selectedVariantId ?? "main")}`}
        product={apiProduct}
        variant={selectedVariant}
      />

      {/* PRODUCT INFO */}
      <div className="mt-4 border-t border-[#E8E8E8] pt-4">
        <div className="flex items-center justify-between gap-3 rounded-[8px] bg-[#FAFAFA] px-3 py-2.5">
          <div className="text-[12px] text-[#666]">
            Country Of Origin:{" "}
            <span className="font-semibold text-[#222]">
            {manufacturingInfo?.country || "India"}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowManufacturingInfo(true)}
            className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-[#D9D9D9] bg-white text-[#222] shadow-sm transition hover:border-[#111] hover:bg-[#111] hover:text-white"
            aria-label="View manufacturing and marketing information"
          >
            <Info className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1.5 text-[10px] text-[#666]">
          <span>
            <span className="font-bold text-[#4CAF50]">✓</span> Pay Secure
          </span>

          <span>
            <span className="font-bold text-[#4CAF50]">✓</span> Quality
            Assured
          </span>

          <span>
            <span className="font-bold text-[#4CAF50]">✓</span> 100%
            Original
          </span>
        </div>
      </div>

      {/* QUICK INFO */}
      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[#E8E8E8] pt-4">
        {[
          {
            icon: Package,
            label: "Trusted by 10,000+",
            sub: "Happy customers",
          },
          {
            icon: CreditCard,
            label: "Secure Payment",
            sub: "100% secure",
          },
          {
            icon: BadgeCheck,
            label: "Quality Assured",
            sub: "100% genuine",
          },
        ].map(({ icon: Icon, label, sub }) => (
          <div key={label} className="text-center">
            <Icon className="mx-auto h-4 w-4 text-[#222]" />

            <p className="mt-1 text-[9px] font-semibold text-[#222]">
              {label}
            </p>

            <p className="text-[8px] text-[#999]">{sub}</p>
          </div>
        ))}
      </div>

      {/* OFFER */}
      <div className="mt-4 border-t border-[#E8E8E8] pt-3">
        {/* Existing offer section intentionally kept commented */}
      </div>
    </div>
  );
}
