"use client";
import { useMemo } from "react";
import { PLACEHOLDER, distributorOfferPrice, generateSlugFromName, getAverageRating, getTotalReviews, isPurchaseAllowedWithoutStock } from "./support";
import { distributorRetailReference } from "./pricing";

export type RelatedSort = "recommended" | "price_asc" | "price_desc" | "newest";
export function useRelatedProducts(categoryProductsData: any, productId: number | string | undefined, userAccountType: "retail" | "distributor", relatedSortOption: RelatedSort) {
const categoryProductList: any[] = useMemo(() => Array.isArray(categoryProductsData?.data)
    ? categoryProductsData.data
    : Array.isArray(categoryProductsData?.data?.data)
      ? categoryProductsData.data.data
      : Array.isArray(categoryProductsData)
        ? categoryProductsData
        : [], [categoryProductsData]);

const similarProducts = useMemo(() => categoryProductList
    .filter((p: any) => String(p.id) !== String(productId))
    .slice(0, 10)
    .map((p: any) => {
      const distributor = userAccountType === "distributor";

      const price = distributor
        ? distributorOfferPrice(
            p,
            Number(p.distributor_price || p.retail_price || 0),
          )
        : Number(p.retail_price || 0);

      // Distributor: struck-through reference price = RETAIL price.
      const mrp = distributor
        ? distributorRetailReference(p)
        : Number(p.retail_mrp || 0);

      /*
       * IMPORTANT:
       * Category API returns reviews_summary directly.
       * Do not rely only on reviews.summary.
       */
      const reviewSummary = p?.reviews_summary ?? p?.reviews?.summary ?? {};

      const rating = getAverageRating(reviewSummary);

      const totalReviews = getTotalReviews(reviewSummary);

      return {
        id: p.id,

        name: p.name,

        slug: p.slug || generateSlugFromName(p.name),

        category: p.category?.name || p.category_name || "",

        brand: p.brand_name || p.brandName || p.brand || "",

        description: p.short_description || p.description || "",

        stockQuantity: Number(p.stock_quantity || 0),

        lowStockThreshold: Number(p.low_stock_threshold || 0),

        peopleBought: Number(
          p.people_bought_this_week || p.peopleBoughtThisWeek || 0,
        ),

        badge:
          p.badge ||
          (p.is_deal_of_the_day
            ? "Deal of the Day"
            : p.sale_type === "today_best"
              ? "Best Seller"
              : ""),

        price,

        commissionValue:
          p.commission_value !== null &&
          p.commission_value !== undefined &&
          Number.isFinite(Number(p.commission_value))
            ? Math.max(0, Number(p.commission_value))
            : null,

        originalPrice: mrp,

        discount:
          mrp > price && price > 0
            ? Math.round(((mrp - price) / mrp) * 100)
            : null,

        image:
          p.primary_image_url ||
          p.images?.find((img: any) => img?.is_primary)?.image_url ||
          p.images?.[0]?.image_url ||
          PLACEHOLDER,

        // Correct rating mapping.
        rating,

        // Correct review count mapping.
        reviews: totalReviews,

        allowedWithoutStock: isPurchaseAllowedWithoutStock(p),
        inStock:
          isPurchaseAllowedWithoutStock(p) || Number(p.stock_quantity || 0) > 0,

        createdAt: p.created_at || p.createdAt || null,
      };
    }), [categoryProductList, productId, userAccountType]);

const sortedSimilarProducts = useMemo(() => {
    const list = [...similarProducts];

    switch (relatedSortOption) {
      case "price_asc":
        return list.sort((a, b) => a.price - b.price);

      case "price_desc":
        return list.sort((a, b) => b.price - a.price);

      case "newest":
        return list.sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;

          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;

          return bTime - aTime;
        });

      default:
        return list;
    }
  }, [similarProducts, relatedSortOption]);

const visibleSimilarProducts = useMemo(() => sortedSimilarProducts.slice(0, 12), [sortedSimilarProducts]);


return { similarProducts, sortedSimilarProducts, visibleSimilarProducts };
}
