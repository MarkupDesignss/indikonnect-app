"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGetCategoriesQuery } from "@/lib/redux/api/categoryApi";
const PRODUCTS_ROUTE = "/products/";
type Availability = {
  inStock: boolean;
  outOfStock: boolean;
  lowStock: boolean;
};
export type FilterState = {
  brands: string[];
  categories: string[];
  subCategories: string[];
  priceRange: [number, number];
  availability: Availability;
  colors?: string[];
};
type ProductLike = {
  id?: number | string;
  is_primary?: boolean | number | string | null;
  isPrimary?: boolean | number | string | null;
  brand_id?: number | string;
  brandId?: number | string;
  brand_name?: string;
  brandName?: string;
  category_id?: number | string;
  categoryId?: number | string;
  category_name?: string;
  collection_name?: string;
  category_title?: string;
  brand?: { id?: number | string; name?: string; title?: string } | string;
  subcategory?: { id?: number | string; name?: string } | string;
  stock?: number | string;
  quantity?: number | string;
  is_in_stock?: boolean;
  categoryName?: string;
  category?: string | { id?: number | string; title?: string; name?: string };
  subcategory_id?: number | string;
  subCategoryId?: number | string;
  sub_category_id?: number | string;
  retail_price?: number | string;
  distributor_price?: number | string;
  price?: number | string;
  currentPrice?: number | string;
  stock_quantity?: number | string;
  stockQuantity?: number | string;
  low_stock_threshold?: number | string;
  lowStockThreshold?: number | string;
  inStock?: boolean;
  parent_product_id?: number | string | null;
  product_code?: string;
  parent_product?: { id?: number | string } | null;
  primary_product_id?: number | string | null;
  parent_id?: number | string | null;
  variants?: Array<
    ProductLike & {
      product_id?: number | string;
      variant_product_id?: number | string;
    }
  >;
  variant_products?: ProductLike[];
  color_variants?: ProductLike[];
  color?: string | { name?: string; value?: string };
  color_name?: string;
  variant_attributes?:
  | Record<string, unknown>
  | Array<{ name?: string; value?: string; attribute?: string }>;
};
type Category = {
  id: number;
  title: string;
  status?: string;
  products_count?: number;
  max_price?: string;
  brands?: Array<{
    id: number | string;
    title?: string;
    name?: string;
    category_id?: number | string;
  }>;
  subcategories?: {
    id: number;
    category_id?: number | string;
    name: string;
    status?: boolean;
    products_count?: number;
  }[];
};
type Brand = {
  id: number | string;
  title: string;
  category_id?: number | string;
  category_title?: string;
  products_count?: number;
};
type Props = {
  onFilterChange?: (filters: FilterState) => void;
  maxPrice?: number;
  mobile?: boolean;
  onMobileClose?: () => void;
  /** Product families from the listing, before brand/category/price filtering. */
  products?: ProductLike[];
  /** Optional complete matching catalogue/facets for accurate infinite-scroll filters. */
  facetProducts?: ProductLike[];
  /** True only when products/facetProducts cover ALL matching API products, not one page. */
  productsComplete?: boolean;
  /** Optional backend facet color options when the listing is paginated. */
  availableColors?: string[];
};
const numeric = (value: unknown): number => {
  const n = Number(String(value ?? "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
};
const keyOf = (value: unknown): string => String(value ?? "").trim();
const normalized = (value: unknown): string => keyOf(value).toLowerCase();
const unique = (items: string[]) => [...new Set(items.filter(Boolean))];
const formatPrice = (value: number) =>
  `₹${Math.round(value).toLocaleString("en-IN")}`;
function getFamilyMembers(product: ProductLike): ProductLike[] {
  const children = [
    ...(Array.isArray(product.variants) ? product.variants : []),
    ...(Array.isArray(product.variant_products)
      ? product.variant_products
      : []),
    ...(Array.isArray(product.color_variants) ? product.color_variants : []),
  ];
  const seen = new Set<string>();
  return [product, ...children].filter((item, index) => {
    const id = keyOf(item?.id) || `index-${index}`;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}
function productBrandId(product: ProductLike): string {
  return keyOf(
    product.brand_id ??
    product.brandId ??
    (typeof product.brand === "object" ? product.brand?.id : ""),
  );
}
function productBrandName(product: ProductLike): string {
  return keyOf(
    product.brand_name ??
    product.brandName ??
    (typeof product.brand === "object"
      ? (product.brand?.name ?? product.brand?.title)
      : product.brand),
  );
}
function productCategoryName(
  product: ProductLike,
  categories: Category[],
): string {
  const value = product.category;
  const categoryId = keyOf(
    product.category_id ??
    product.categoryId ??
    (typeof value === "object" ? value?.id : ""),
  );
  const found = categories.find((c) => keyOf(c.id) === categoryId);
  return (
    found?.title ||
    keyOf(
      product.category_name ??
      product.categoryName ??
      product.category_title ??
      product.collection_name ??
      (typeof value === "string" ? value : (value?.title ?? value?.name)),
    )
  );
}
function productSubcategoryId(product: ProductLike): string {
  return keyOf(
    product.subcategory_id ??
    product.subCategoryId ??
    product.sub_category_id ??
    (typeof product.subcategory === "object" ? product.subcategory?.id : ""),
  );
}
function productColor(product: ProductLike): string {
  const attrs = product.variant_attributes;
  let fromAttrs = "";
  if (Array.isArray(attrs)) {
    const found = attrs.find((a) =>
      /colou?r/i.test(String(a.name ?? a.attribute ?? "")),
    );
    fromAttrs = keyOf(found?.value);
  } else if (attrs && typeof attrs === "object") {
    const entry = Object.entries(attrs).find(([k]) => /colou?r/i.test(k));
    fromAttrs = keyOf(entry?.[1]);
  }
  return keyOf(
    product.color_name ??
    (typeof product.color === "string"
      ? product.color
      : (product.color?.name ?? product.color?.value)) ??
    fromAttrs,
  );
}
function productPrice(product: ProductLike): number {
  return numeric(
    product.currentPrice ??
    product.price ??
    product.retail_price ??
    product.distributor_price,
  );
}
function productStock(product: ProductLike): number {
  return numeric(
    product.stock_quantity ??
    product.stockQuantity ??
    product.stock ??
    product.quantity,
  );
}
function readFilters(params: URLSearchParams, ceiling: number): FilterState {
  const csv = (key: string) =>
    unique((params.get(key) || "").split(",").map((v) => v.trim()));
  const min = numeric(params.get("min_price"));
  const max = params.has("max_price")
    ? numeric(params.get("max_price"))
    : ceiling;
  return {
    brands: csv("brand_ids"),
    categories: csv("category"),
    subCategories: csv("subcategory_ids"),
    colors: csv("color"),
    priceRange: [min, Math.max(min, max)],
    availability: {
      inStock: params.get("in_stock") === "true",
      outOfStock: params.get("out_of_stock") === "true",
      lowStock: params.get("low_stock") === "true",
    },
  };
}
export default function FilterSidebar({
  onFilterChange,
  maxPrice,
  mobile = false,
  onMobileClose,
  products,
  facetProducts,
  productsComplete = false,
  availableColors,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: categoriesData, isLoading } = useGetCategoriesQuery({});
  const categories: Category[] = useMemo(
    () =>
      (categoriesData?.data ?? []).filter(
        (item: Category) => item.status !== "inactive",
      ),
    [categoriesData?.data],
  );
  const apiBrands: Brand[] = useMemo(
    () => categoriesData?.brands ?? [],
    [categoriesData?.brands],
  );
  const searchActive = Boolean(
    (
      searchParams.get("search") ||
      searchParams.get("q") ||
      searchParams.get("query") ||
      searchParams.get("search_query") ||
      searchParams.get("keyword") ||
      ""
    ).trim(),
  );
  // Prefer complete faceted data. Page-limited product arrays must not incorrectly
  // remove brands/categories that exist on subsequent infinite-scroll pages.
  // A supplied array may be only the first paginated page. Never assume completeness.
  const complete =
    productsComplete && (facetProducts !== undefined || products !== undefined);
  const sourceProducts = useMemo(
    () => facetProducts ?? products ?? [],
    [facetProducts, products],
  );
  const productFamilies = useMemo(() => {
    if (searchActive) return sourceProducts;
    // Primary cards only; unflagged standalone products remain eligible.
    return sourceProducts.filter((p) => {
      const flag = p.is_primary ?? p.isPrimary;
      return flag == null || flag === true || flag === 1 || flag === "1";
    });
  }, [sourceProducts, searchActive]);
  const familyMembers = useMemo(() => {
    const byId = new Map(
      sourceProducts.filter((p) => p.id != null).map((p) => [keyOf(p.id), p]),
    );
    return productFamilies.map((primary) => {
      const primaryId = keyOf(primary.id);
      const refs = new Set<string>([primaryId]);
      const direct = getFamilyMembers(primary);
      for (const variant of direct) {
        const linked = keyOf(
          (
            variant as ProductLike & {
              product_id?: number | string;
              variant_product_id?: number | string;
            }
          ).product_id ??
          (variant as ProductLike & { variant_product_id?: number | string })
            .variant_product_id,
        );
        if (linked) refs.add(linked);
        if (variant.id != null && byId.has(keyOf(variant.id)))
          refs.add(keyOf(variant.id));
      }
      for (const p of sourceProducts) {
        const parent = keyOf(
          p.parent_product_id ??
          p.primary_product_id ??
          p.parent_id ??
          p.parent_product?.id,
        );
        if (primaryId && parent === primaryId) refs.add(keyOf(p.id));
      }
      const family = [
        primary,
        ...direct.slice(1),
        ...[...refs]
          .map((id) => byId.get(id))
          .filter((v): v is ProductLike => Boolean(v)),
      ];
      const uniqueMembers = new Map<string, ProductLike>();
      family.forEach((p, index) =>
        uniqueMembers.set(keyOf(p.id) || `nested-${index}`, p),
      );
      return [...uniqueMembers.values()];
    });
  }, [sourceProducts, productFamilies]);
  const members = useMemo(() => {
    const map = new Map<string, ProductLike>();
    familyMembers
      .flat()
      .forEach((p, i) => map.set(keyOf(p.id) || `row-${i}`, p));
    return [...map.values()];
  }, [familyMembers]);
  const counts = useMemo(() => {
    const brands = new Map<string, number>();
    const cats = new Map<string, number>();
    const subs = new Map<string, number>();
    let highest = 0;
    for (const family of familyMembers) {
      const familyBrands = new Set<string>();
      const familyCategories = new Set<string>();
      const familySubs = new Set<string>();
      for (const p of family) {
        const brand =
          productBrandId(p) ||
          keyOf(
            apiBrands.find(
              (b) =>
                normalized(b.title) ===
                normalized(
                  p.brand_name ??
                  p.brandName ??
                  (typeof p.brand === "object"
                    ? (p.brand?.name ?? p.brand?.title)
                    : p.brand),
                ),
            )?.id,
          );
        if (brand) familyBrands.add(brand);
        const category = productCategoryName(p, categories);
        if (category) familyCategories.add(normalized(category));
        const sub = productSubcategoryId(p);
        if (sub) familySubs.add(sub);
        highest = Math.max(highest, productPrice(p));
      }
      familyBrands.forEach((v) => brands.set(v, (brands.get(v) ?? 0) + 1));
      familyCategories.forEach((v) => cats.set(v, (cats.get(v) ?? 0) + 1));
      familySubs.forEach((v) => subs.set(v, (subs.get(v) ?? 0) + 1));
    }
    return { brands, cats, subs, highest };
  }, [familyMembers, apiBrands, categories]);
  const ceiling = Math.max(
    1,
    numeric(maxPrice),
    // When complete facet data is available, use its own price ceiling.
    ...(complete
      ? [counts.highest]
      : [
        numeric(categoriesData?.most_expensive_price),
        ...categories.map((c) => numeric(c.max_price)),
        counts.highest,
      ]),
  );
  const paramsString = searchParams.toString();
  const [filters, setFilters] = useState<FilterState>(() =>
    readFilters(new URLSearchParams(paramsString), ceiling),
  );
  const [brandSearch, setBrandSearch] = useState("");
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [expanded, setExpanded] = useState({
    brands: true,
    categories: false,
    colors: false,
    price: true,
    availability: false,
  });
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [priceInputs, setPriceInputs] = useState({
    min: "0",
    max: String(ceiling),
  });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const next = readFilters(new URLSearchParams(paramsString), ceiling);
    setFilters(next);
    setPriceInputs({
      min: String(next.priceRange[0]),
      max: String(next.priceRange[1]),
    });
  }, [paramsString, ceiling]);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const colorOptions = useMemo(() => {
    const values = new Set<string>((availableColors ?? []).filter(Boolean));
    members.forEach((p) => {
      const c = productColor(p);
      if (c) values.add(c);
    });
    (filters.colors ?? []).forEach((c) => values.add(c));
    return [...values].sort((a, b) => a.localeCompare(b));
  }, [availableColors, members, filters.colors]);
  const brandOptions = useMemo(() => {
    // Keep the full brand catalogue visible after selecting any brand.
    const options = [...apiBrands];
    const known = new Set(options.map((b) => keyOf(b.id)));
    for (const p of members) {
      const id = productBrandId(p);
      if (id && !known.has(id)) {
        options.push({
          id: Number(id),
          title:
            keyOf(
              p.brand_name ??
              p.brandName ??
              (typeof p.brand === "object"
                ? (p.brand?.name ?? p.brand?.title)
                : p.brand),
            ) || `Brand ${id}`,
        });
        known.add(id);
      }
    }
    return options.filter((b) =>
      normalized(b.title).includes(normalized(brandSearch)),
    );
  }, [apiBrands, members, brandSearch]);
  const visibleBrands = showAllBrands ? brandOptions : brandOptions.slice(0, 7);
  const categoryOptions = useMemo(() => {
    // Category options must not collapse when the API returns only selected-brand products.
    const options = [...categories];
    const known = new Set(options.map((c) => normalized(c.title)));
    for (const p of members) {
      const title = productCategoryName(p, categories);
      if (title && !known.has(normalized(title))) {
        options.push({
          id: -(options.length + 1),
          title,
          status: "active",
          subcategories: [],
        });
        known.add(normalized(title));
      }
    }
    return options;
  }, [categories, members]);
  // Selecting a subcategory checks its parent category and linked brand.
  // Selecting a category also visually checks its linked brand and opens its
  // subcategory list. These inferred checks do not add extra API filters.
  const subcategoryRelations = useMemo(() => {
    const selectedSubcategoryIds = new Set(filters.subCategories);
    const selectedCategoryTitles = new Set(filters.categories.map(normalized));
    const categoryBySubcategory = new Map<string, string>();
    const brandsBySubcategory = new Map<string, Set<string>>();
    const categoriesByBrand = new Map<string, Set<string>>();
    const inferredCategoryTitles = new Set<string>();
    const inferredBrandIds = new Set<string>();

    // The category API is authoritative for parent/subcategory relationships.
    categories.forEach((category) => {
      const categoryTitle = normalized(category.title);
      (category.subcategories ?? []).forEach((subcategory) => {
        const subcategoryId = keyOf(subcategory.id);
        if (!subcategoryId || !categoryTitle) return;
        categoryBySubcategory.set(subcategoryId, categoryTitle);
        if (selectedSubcategoryIds.has(subcategoryId)) {
          inferredCategoryTitles.add(categoryTitle);
        }
      });
    });

    // Product families help link selected subcategories to their actual brands,
    // including product responses that expose only brand_name instead of brand_id.
    for (const family of familyMembers) {
      const familySubcategories = new Set<string>();
      const familyBrandIds = new Set<string>();

      for (const product of family) {
        const subcategoryId = productSubcategoryId(product);
        const categoryTitle = productCategoryName(product, categories);

        if (subcategoryId && categoryTitle) {
          const normalizedTitle = normalized(categoryTitle);
          if (!categoryBySubcategory.has(subcategoryId)) {
            categoryBySubcategory.set(subcategoryId, normalizedTitle);
          }
          if (selectedSubcategoryIds.has(subcategoryId)) {
            inferredCategoryTitles.add(normalizedTitle);
          }
        }

        if (subcategoryId && selectedSubcategoryIds.has(subcategoryId)) {
          familySubcategories.add(subcategoryId);
        }

        const brandName = productBrandName(product);
        const brandId = productBrandId(product) || keyOf(
          apiBrands.find((brand) => normalized(brand.title) === normalized(brandName))?.id,
        );
        if (brandId) familyBrandIds.add(brandId);
      }

      familySubcategories.forEach((subcategoryId) => {
        const existing = brandsBySubcategory.get(subcategoryId) ?? new Set<string>();
        familyBrandIds.forEach((brandId) => existing.add(brandId));
        brandsBySubcategory.set(subcategoryId, existing);
      });
    }

    // A checked subcategory infers its parent category.
    selectedSubcategoryIds.forEach((subcategoryId) => {
      const parentTitle = categoryBySubcategory.get(subcategoryId);
      if (parentTitle) inferredCategoryTitles.add(parentTitle);
      brandsBySubcategory.get(subcategoryId)?.forEach((brandId) => {
        inferredBrandIds.add(brandId);
      });
    });

    // IMPORTANT: The API provides category.brands and brand.category_id. Use both
    // so a selected category can check its brand even before products have loaded.
    const visibleSelectedCategoryTitles = new Set([
      ...selectedCategoryTitles,
      ...inferredCategoryTitles,
    ]);
    categories.forEach((category) => {
      const categoryTitle = normalized(category.title);
      if (!visibleSelectedCategoryTitles.has(categoryTitle)) return;

      (category.brands ?? []).forEach((brand) => {
        const brandId = keyOf(brand.id);
        if (brandId) inferredBrandIds.add(brandId);
      });

      apiBrands
        .filter((brand) => keyOf(brand.category_id) === keyOf(category.id))
        .forEach((brand) => inferredBrandIds.add(keyOf(brand.id)));

      // Keep a reverse map so clicking an inferred brand can remove the category
      // or subcategory that currently implies its checked state.
      const linkedBrandIds = new Set<string>([
        ...(category.brands ?? []).map((brand) => keyOf(brand.id)),
        ...apiBrands
          .filter((brand) => keyOf(brand.category_id) === keyOf(category.id))
          .map((brand) => keyOf(brand.id)),
      ]);
      linkedBrandIds.forEach((brandId) => {
        if (!brandId) return;
        const titles = categoriesByBrand.get(brandId) ?? new Set<string>();
        titles.add(categoryTitle);
        categoriesByBrand.set(brandId, titles);
      });
    });

    // Retain product-derived category/brand associations for API payload variants
    // that do not include category.brands or brand.category_id.
    for (const family of familyMembers) {
      for (const product of family) {
        const categoryTitle = normalized(productCategoryName(product, categories));
        if (!categoryTitle || !visibleSelectedCategoryTitles.has(categoryTitle)) continue;
        const brandId = productBrandId(product) || keyOf(
          apiBrands.find((brand) => normalized(brand.title) === normalized(productBrandName(product)))?.id,
        );
        if (!brandId) continue;
        inferredBrandIds.add(brandId);
        const titles = categoriesByBrand.get(brandId) ?? new Set<string>();
        titles.add(categoryTitle);
        categoriesByBrand.set(brandId, titles);
      }
    }

    return {
      categoryBySubcategory,
      brandsBySubcategory,
      categoriesByBrand,
      inferredCategoryTitles,
      inferredBrandIds,
    };
  }, [filters.subCategories, filters.categories, categories, familyMembers, apiBrands]);

  const {
    categoryBySubcategory,
    brandsBySubcategory,
    categoriesByBrand,
    inferredCategoryTitles,
    inferredBrandIds,
  } = subcategoryRelations;

  // Opening a category checkbox automatically expands its subcategories. This also
  // handles direct URLs containing category=... or subcategory_ids=....
  useEffect(() => {
    const selectedTitles = new Set([
      ...filters.categories.map(normalized),
      ...inferredCategoryTitles,
    ]);
    const categoriesToOpen = categories
      .filter((category) => selectedTitles.has(normalized(category.title)))
      .map((category) => keyOf(category.id));

    if (!categoriesToOpen.length) return;

    setExpanded((previous) =>
      previous.categories ? previous : { ...previous, categories: true },
    );
    setExpandedCategories((previous) => {
      const next = unique([...previous, ...categoriesToOpen]);
      return next.length === previous.length ? previous : next;
    });
  }, [filters.categories, filters.subCategories, categories, inferredCategoryTitles]);
  const applyUrl = useCallback(
    (next: FilterState) => {
      const params = new URLSearchParams(paramsString);
      const csv = (key: string, value: string[]) =>
        value.length ? params.set(key, value.join(",")) : params.delete(key);
      csv("brand_ids", next.brands);
      csv("category", next.categories);
      csv("subcategory_ids", next.subCategories);
      csv("color", next.colors ?? []);
      next.priceRange[0] > 0
        ? params.set("min_price", String(next.priceRange[0]))
        : params.delete("min_price");
      next.priceRange[1] < ceiling
        ? params.set("max_price", String(next.priceRange[1]))
        : params.delete("max_price");
      for (const key of ["inStock", "outOfStock", "lowStock"] as const) {
        const urlKey = {
          inStock: "in_stock",
          outOfStock: "out_of_stock",
          lowStock: "low_stock",
        }[key];
        next.availability[key]
          ? params.set(urlKey, "true")
          : params.delete(urlKey);
      }
      params.delete("page");
      const query = params.toString();
      router.replace(query ? `${PRODUCTS_ROUTE}?${query}` : PRODUCTS_ROUTE, {
        scroll: false,
      });
    },
    [router, paramsString, ceiling],
  );
  const commit = useCallback(
    (next: FilterState, delayed = false) => {
      if (timer.current) clearTimeout(timer.current);
      setFilters(next);
      onFilterChange?.(next);
      if (delayed) timer.current = setTimeout(() => applyUrl(next), 600);
      else {
        applyUrl(next);
        if (mobile) onMobileClose?.();
      }
    },
    [applyUrl, mobile, onFilterChange, onMobileClose],
  );
  const toggleArray = (
    key: "brands" | "categories" | "subCategories" | "colors",
    value: string,
  ) => {
    const old = filters[key] ?? [];

    if (key === "categories") {
      const categoryKey = normalized(value);
      const isVisiblyChecked =
        old.some((item) => normalized(item) === categoryKey) ||
        inferredCategoryTitles.has(categoryKey);

      if (isVisiblyChecked) {
        const subcategoriesToRemove = filters.subCategories.filter(
          (subcategoryId) => categoryBySubcategory.get(subcategoryId) === categoryKey,
        );
        const removeSet = new Set(subcategoriesToRemove);
        commit({
          ...filters,
          categories: old.filter((item) => normalized(item) !== categoryKey),
          subCategories: filters.subCategories.filter((id) => !removeSet.has(id)),
        });
      } else {
        commit({ ...filters, categories: [...old, value] });
      }
      return;
    }

    if (key === "brands") {
      const isVisiblyChecked = old.includes(value) || inferredBrandIds.has(value);
      if (isVisiblyChecked) {
        const linkedCategoryTitles = categoriesByBrand.get(value) ?? new Set<string>();
        const categoriesToRemove = filters.categories.filter((title) =>
          linkedCategoryTitles.has(normalized(title)),
        );
        const categoryTitlesToRemove = new Set(categoriesToRemove.map(normalized));
        const inheritedSubcategories = filters.subCategories.filter((subcategoryId) => {
          const parentTitle = categoryBySubcategory.get(subcategoryId);
          return (
            brandsBySubcategory.get(subcategoryId)?.has(value) ||
            (parentTitle !== undefined && categoryTitlesToRemove.has(parentTitle))
          );
        });
        const removeSubcategoryIds = new Set(inheritedSubcategories);

        commit({
          ...filters,
          brands: old.filter((item) => item !== value),
          categories: filters.categories.filter(
            (title) => !categoryTitlesToRemove.has(normalized(title)),
          ),
          subCategories: filters.subCategories.filter(
            (id) => !removeSubcategoryIds.has(id),
          ),
        });
      } else {
        commit({ ...filters, brands: [...old, value] });
      }
      return;
    }

    commit({
      ...filters,
      [key]: old.includes(value)
        ? old.filter((item) => item !== value)
        : [...old, value],
    });
  };
  const toggleStock = (key: keyof Availability) =>
    commit({
      ...filters,
      availability: {
        ...filters.availability,
        [key]: !filters.availability[key],
      },
    });
  const clearAll = () => {
    if (timer.current) clearTimeout(timer.current);
    const reset: FilterState = {
      brands: [],
      categories: [],
      subCategories: [],
      colors: [],
      priceRange: [0, ceiling],
      availability: { inStock: false, outOfStock: false, lowStock: false },
    };
    setFilters(reset);
    setBrandSearch("");
    setShowAllBrands(false);
    setPriceInputs({ min: "0", max: String(ceiling) });
    onFilterChange?.(reset);
    const params = new URLSearchParams(paramsString);
    [
      "brand_ids",
      "category",
      "subcategory_ids",
      "color",
      "min_price",
      "max_price",
      "in_stock",
      "out_of_stock",
      "low_stock",
      "page",
    ].forEach((k) => params.delete(k));
    router.replace(
      params.toString() ? `${PRODUCTS_ROUTE}?${params}` : PRODUCTS_ROUTE,
      { scroll: false },
    );
    if (mobile) onMobileClose?.();
  };
  const applyPrice = () => {
    const min = Math.max(0, Math.min(ceiling, numeric(priceInputs.min)));
    const max = Math.max(
      min,
      Math.min(
        ceiling,
        priceInputs.max.trim() === "" ? ceiling : numeric(priceInputs.max),
      ),
    );
    commit({ ...filters, priceRange: [min, max] });
  };
  const selectedBrandCount = new Set([
    ...filters.brands,
    ...inferredBrandIds,
  ]).size;
  const selectedCategoryCount = new Set([
    ...filters.categories.map(normalized),
    ...inferredCategoryTitles,
  ]).size;
  const selectedCount =
    selectedBrandCount +
    selectedCategoryCount +
    filters.subCategories.length +
    (filters.colors?.length ?? 0) +
    Object.values(filters.availability).filter(Boolean).length +
    Number(filters.priceRange[0] > 0 || filters.priceRange[1] < ceiling);
  const renderSection = (
    name: keyof typeof expanded,
    title: string,
    children: ReactNode,
  ) => (
    <section className="border-b border-[#e8e8e8] bg-white last:border-b-0">
      <button
        type="button"
        onClick={() => setExpanded((s) => ({ ...s, [name]: !s[name] }))}
        className="flex w-full items-center justify-between bg-white px-5 py-4 text-left transition-colors hover:bg-[#f5f5f5] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-black"
      >
        <span className="text-[13px] font-bold uppercase tracking-[.07em] text-[#111111]">
          {title}
        </span>
        {expanded[name] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      <AnimatePresence initial={false}>
        {expanded[name] && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 bg-white px-5 pb-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
  const CheckRow = ({
    label,
    checked,
    count,
    onChange,
    disabled = false,
    indent = false,
  }: {
    label: string;
    checked: boolean;
    count?: number;
    onChange: () => void;
    disabled?: boolean;
    indent?: boolean;
  }) => (
    <label
      className={`flex cursor-pointer items-center gap-2.5 text-[12px] ${indent ? "pl-4" : ""} ${disabled ? "opacity-40" : ""}`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className="h-4 w-4 shrink-0 cursor-pointer rounded border-[#d9d6d0] accent-black"
      />
      <span
        className={`min-w-0 flex-1 truncate ${checked ? "font-semibold text-black" : "text-[#454545]"}`}
      >
        {label}
      </span>
      {count !== undefined && (
        <span className="text-[11px] tabular-nums text-[#929292]">
          ({count})
        </span>
      )}
    </label>
  );
  return (
    <motion.aside
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      aria-label="Product filters"
      className={`overflow-hidden border border-[#eae7e1] bg-white ${mobile ? "max-h-[90dvh] rounded-t-2xl" : "rounded-xl md:sticky md:top-5"}`}
    >
      <div className="flex items-center justify-between border-b border-[#e5e5e5] bg-white px-5 py-4">
        <div style={{ color: '#000000' }} className="flex items-center gap-2 text-[14px] font-semibold uppercase tracking-wide">
          Filters
          {selectedCount > 0 && (
            <span className="rounded-full bg-black px-2 py-0.5 text-[10px] text-white">
              {selectedCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={clearAll}
            className="text-[12px] font-semibold text-[#111111] underline underline-offset-2 hover:text-[#555555]"
          >
            Clear All
          </button>
          {mobile && (
            <button
              type="button"
              onClick={onMobileClose}
              aria-label="Close filters"
            >
              <X size={19} />
            </button>
          )}
        </div>
      </div>
      <div className={mobile ? "max-h-[calc(90dvh-65px)] overflow-y-auto" : ""}>
        {renderSection(
          "brands",
          "Brand",
          <>
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999]"
              />
              <input
                style={{ color: '#000000' }}
                type="text"
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                placeholder="Search brands"
                className="w-full rounded-full border border-[#e8e8e8] bg-[#fafafa] py-2 pl-9 pr-3 text-[12px] outline-none focus:border-black"
              />
            </div>
            {isLoading && !products ? (
              <p className="text-xs text-gray-400">Loading brands...</p>
            ) : visibleBrands.length ? (
              visibleBrands.map((b) => {
                const id = keyOf(b.id);
                // Filtered product counts would misleadingly become zero for other brands.
                const count = undefined;
                return (
                  <CheckRow
                    key={id}
                    label={b.title}
                    checked={filters.brands.includes(id) || inferredBrandIds.has(id)}
                    count={count}
                    onChange={() => toggleArray("brands", id)}
                  />
                );
              })
            ) : (
              <p className="text-xs text-gray-400">No matching brands</p>
            )}
            {brandOptions.length > 7 && (
              <button
                type="button"
                onClick={() => setShowAllBrands((v) => !v)}
                className="text-[12px] font-medium underline underline-offset-2"
              >
                {showAllBrands
                  ? "Show less"
                  : `+ ${brandOptions.length - 7} more`}
              </button>
            )}
          </>,
        )}
        {renderSection(
          "categories",
          "Categories",
          <>
            {categoryOptions.length ? (
              categoryOptions.map((c) => {
                const checked =
                  filters.categories.some((title) => normalized(title) === normalized(c.title)) ||
                  inferredCategoryTitles.has(normalized(c.title));
                const count = undefined;
                const subcategories = (c.subcategories ?? []).filter(
                  (s) => s.status !== false,
                );
                const isOpen = expandedCategories.includes(keyOf(c.id));
                return (
                  <div key={c.id} className="space-y-2">
                    <div className="flex items-center gap-1">
                      <div className="min-w-0 flex-1">
                        <CheckRow
                          label={c.title}
                          checked={checked}
                          count={count}
                          onChange={() => toggleArray("categories", c.title)}
                        />
                      </div>
                      {subcategories.length > 0 && (
                        <button
                          type="button"
                          aria-label={`Toggle ${c.title} subcategories`}
                          onClick={() =>
                            setExpandedCategories((old) =>
                              isOpen
                                ? old.filter((v) => v !== keyOf(c.id))
                                : [...old, keyOf(c.id)],
                            )
                          }
                          className="rounded p-1 hover:bg-gray-100"
                        >
                          <ChevronDown
                            size={15}
                            className={isOpen ? "rotate-180" : ""}
                          />
                        </button>
                      )}
                    </div>
                    {isOpen &&
                      subcategories.map((s) => {
                        const id = keyOf(s.id);
                        const subCount = undefined;
                        return (
                          <CheckRow
                            key={id}
                            indent
                            label={s.name}
                            checked={filters.subCategories.includes(id)}
                            count={subCount}
                            onChange={() => toggleArray("subCategories", id)}
                          />
                        );
                      })}
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-gray-400">No matching categories</p>
            )}
          </>,
        )}
        {colorOptions.length > 0 &&
          renderSection(
            "colors",
            "Color",
            <>
              {colorOptions.map((color) => (
                <CheckRow
                  key={color}
                  label={color}
                  checked={(filters.colors ?? []).includes(color)}
                  onChange={() => toggleArray("colors", color)}
                />
              ))}
            </>,
          )}
        {renderSection(
          "price",
          "Price",
          <>
            <p style={{ color: '#000000' }} className="text-[12px] font-semibold">
              {formatPrice(filters.priceRange[0])} –{" "}
              {formatPrice(filters.priceRange[1])}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(["min", "max"] as const).map((key) => (
                <label key={key} className="space-y-1 text-[10px] text-[#777]">
                  <span>{key === "min" ? "Min price" : "Max price"}</span>
                  <input
                    type="number"
                    min={0}
                    max={ceiling}
                    value={priceInputs[key]}
                    onChange={(e) =>
                      setPriceInputs((old) => ({
                        ...old,
                        [key]: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") applyPrice();
                    }}
                    className="w-full rounded-md border border-[#e5e1dc] px-2 py-2 text-[12px] text-black outline-none focus:border-black"
                  />
                </label>
              ))}
            </div>
            {/* Dual-handle price range: drag either end independently. */}
            <div className="relative h-9 w-full flex items-center">
              <div className="absolute inset-x-0 h-1.5 rounded-full bg-[#e5e5e5]" />
              <div
                className="absolute h-1.5 rounded-full bg-black pointer-events-none"
                style={{
                  left: `${(Math.min(ceiling, filters.priceRange[0]) / ceiling) * 100}%`,
                  right: `${100 - (Math.min(ceiling, filters.priceRange[1]) / ceiling) * 100}%`,
                }}
              />
              <input
                type="range"
                aria-label="Minimum price"
                min={0}
                max={ceiling}
                step={1}
                value={Math.min(ceiling, filters.priceRange[0])}
                onChange={(e) => {
                  const min = Math.min(Number(e.target.value), filters.priceRange[1]);
                  setPriceInputs({ min: String(min), max: String(filters.priceRange[1]) });
                  commit({ ...filters, priceRange: [min, filters.priceRange[1]] }, true);
                }}
                className="dual-price-range absolute inset-x-0 w-full appearance-none bg-transparent pointer-events-none"
                style={{ zIndex: filters.priceRange[0] >= ceiling - 1 ? 5 : 3 }}
              />
              <input
                type="range"
                aria-label="Maximum price"
                min={0}
                max={ceiling}
                step={1}
                value={Math.min(ceiling, filters.priceRange[1])}
                onChange={(e) => {
                  const max = Math.max(Number(e.target.value), filters.priceRange[0]);
                  setPriceInputs({ min: String(filters.priceRange[0]), max: String(max) });
                  commit({ ...filters, priceRange: [filters.priceRange[0], max] }, true);
                }}
                className="dual-price-range absolute inset-x-0 w-full appearance-none bg-transparent pointer-events-none"
                style={{ zIndex: 4 }}
              />
            </div>
            <style jsx>{`
            .dual-price-range::-webkit-slider-runnable-track { height: 6px; background: transparent; }
            .dual-price-range::-moz-range-track { height: 6px; background: transparent; }
            .dual-price-range::-webkit-slider-thumb {
              appearance: none; pointer-events: auto; width: 18px; height: 18px;
              margin-top: -6px; border: 3px solid #111; border-radius: 50%;
              background: white; cursor: grab; box-shadow: 0 1px 4px #0002;
            }
            .dual-price-range::-moz-range-thumb {
              pointer-events: auto; width: 13px; height: 13px;
              border: 3px solid #111; border-radius: 50%;
              background: white; cursor: grab;
            }
          `}</style>
            <button
              type="button"
              onClick={applyPrice}
              className="w-full rounded-md bg-[#151515] px-3 py-2 text-[12px] font-semibold text-white hover:bg-black"
            >
              Apply Price
            </button>
          </>,
        )}
        {renderSection(
          "availability",
          "Availability",
          <>
            <CheckRow
              label="In Stock"
              checked={filters.availability.inStock}
              onChange={() => toggleStock("inStock")}
            />
            <CheckRow
              label="Out of Stock"
              checked={filters.availability.outOfStock}
              onChange={() => toggleStock("outOfStock")}
            />
            <CheckRow
              label="Low Stock"
              checked={filters.availability.lowStock}
              onChange={() => toggleStock("lowStock")}
            />
          </>,
        )}
      </div>
    </motion.aside>
  );
}
