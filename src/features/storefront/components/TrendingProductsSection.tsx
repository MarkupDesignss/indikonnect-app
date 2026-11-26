"use client";

import { useMemo, type ComponentType } from "react";

/** Each item is passed through from the listing API without changing brand_name. */
export interface TrendingProduct {
  id: number | string;
  name?: string;
  brand_id?: number | string | null;
  brand_name?: string | null;
  is_trending?: boolean | number | string | null;
  is_published?: boolean | number | string | null;
  trending_sort_order?: number | string | null;
  [key: string]: unknown;
}

export interface TrendingProductsSectionProps {
  /** Pass the full API data array, before slicing. */
  products: TrendingProduct[] | null | undefined;
  /** Your existing ProductRail: it must display product.brand_name directly. */
  ProductRail: ComponentType<any>;
  userType: any;
  wish: any;
  router: any;
  handleToggleWishlist: any;
  isProductsLoading: boolean;
  isProductsError: boolean;
  refetchProducts: any;
  sectionContainerClass?: string;
  limit?: number;
}

const enabled = (value: unknown): boolean =>
  value === true || value === 1 || value === "1" || value === "true";

/** Mix brands while preserving the exact API product objects and their brand_name values. */
export function mixTrendingBrands(
  allProducts: TrendingProduct[] | null | undefined,
  limit = 12,
): TrendingProduct[] {
  if (!Array.isArray(allProducts)) return [];

  const sorted = allProducts
    .filter(
      (product) =>
        enabled(product.is_trending) &&
        (product.is_published == null || enabled(product.is_published)),
    )
    .sort(
      (a, b) =>
        Number(a.trending_sort_order ?? 0) - Number(b.trending_sort_order ?? 0),
    );

  const groups = new Map<string, TrendingProduct[]>();
  for (const product of sorted) {
    // Only use brand fields for grouping. Never assign a brand based on product title/category.
    const id = product.brand_id == null ? "" : String(product.brand_id).trim();
    const name =
      typeof product.brand_name === "string"
        ? product.brand_name.trim().toLowerCase()
        : "";
    const key = id
      ? `id:${id}`
      : name
        ? `name:${name}`
        : `unknown:${product.id}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(product);
  }

  const buckets = [...groups.values()];
  const output: TrendingProduct[] = [];
  const seen = new Set<string>();
  const safeLimit = Math.max(0, Math.floor(limit));

  while (
    output.length < safeLimit &&
    buckets.some((bucket) => bucket.length > 0)
  ) {
    for (const bucket of buckets) {
      const product = bucket.shift();
      if (!product) continue;
      const key = String(product.id);
      if (seen.has(key)) continue;
      seen.add(key);
      // Original object, including exact API brand_name, goes to ProductRail unchanged.
      output.push(product);
      if (output.length >= safeLimit) break;
    }
  }
  return output;
}

export default function TrendingProductsSection({
  products,
  ProductRail,
  userType,
  wish,
  router,
  handleToggleWishlist,
  isProductsLoading,
  isProductsError,
  refetchProducts,
  sectionContainerClass = "mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10",
  limit = 12,
}: TrendingProductsSectionProps) {
  const trendingProducts = useMemo(
    () => mixTrendingBrands(products, limit),
    [products, limit],
  );

  return (
    <section className="relative isolate flow-root w-full overflow-hidden bg-white py-8 sm:py-10 md:py-12">
      <div className={sectionContainerClass}>
        <div
          className={`mb-5 flex w-full flex-col ${trendingProducts.length <= 2 ? "items-center text-center" : "items-start text-left"}`}
        >
          <h2
            className="text-[20px] font-medium leading-tight tracking-tight text-[#111111] sm:text-[25px] lg:text-[28px]"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            Trending Products
          </h2>
        </div>
        <ProductRail
          products={trendingProducts}
          userType={userType}
          wish={wish}
          router={router}
          handleToggleWishlist={handleToggleWishlist}
          isLoading={isProductsLoading}
          isError={isProductsError}
          retry={refetchProducts}
          emptyText="No trending products available"
          labelMode="trending"
          imagesEnabled={true}
          showCartButtons={true}
        />
      </div>
    </section>
  );
}
