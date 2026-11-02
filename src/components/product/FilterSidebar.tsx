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
  products?: ProductLike[];
  facetProducts?: ProductLike[];
  productsComplete?: boolean;
  availableColors?: string[];
};

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

const numeric = (value: unknown): number => {
  const n = Number(String(value ?? "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
};

const keyOf = (value: unknown): string =>
  String(value ?? "").trim();

const normalized = (value: unknown): string =>
  keyOf(value).toLowerCase();

const unique = (items: string[]) =>
  [...new Set(items.filter(Boolean))];

const formatPrice = (value: number) =>
  `₹${Math.round(value).toLocaleString("en-IN")}`;

/* -------------------------------------------------------------------------- */
/* PRODUCT FAMILY                                                             */
/* -------------------------------------------------------------------------- */

function getFamilyMembers(product: ProductLike): ProductLike[] {
  const children = [
    ...(Array.isArray(product.variants) ? product.variants : []),
    ...(Array.isArray(product.variant_products)
      ? product.variant_products
      : []),
    ...(Array.isArray(product.color_variants)
      ? product.color_variants
      : []),
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
      (typeof product.brand === "object"
        ? product.brand?.id
        : ""),
  );
}

function productBrandName(product: ProductLike): string {
  return keyOf(
    product.brand_name ??
      product.brandName ??
      (typeof product.brand === "object"
        ? product.brand?.name ?? product.brand?.title
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

  const found = categories.find(
    (c) => keyOf(c.id) === categoryId,
  );

  return (
    found?.title ||
    keyOf(
      product.category_name ??
        product.categoryName ??
        product.category_title ??
        product.collection_name ??
        (typeof value === "string"
          ? value
          : value?.title ?? value?.name),
    )
  );
}

function productSubcategoryId(product: ProductLike): string {
  return keyOf(
    product.subcategory_id ??
      product.subCategoryId ??
      product.sub_category_id ??
      (typeof product.subcategory === "object"
        ? product.subcategory?.id
        : ""),
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
    const entry = Object.entries(attrs).find(([k]) =>
      /colou?r/i.test(k),
    );

    fromAttrs = keyOf(entry?.[1]);
  }

  return keyOf(
    product.color_name ??
      (typeof product.color === "string"
        ? product.color
        : product.color?.name ?? product.color?.value) ??
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

/* -------------------------------------------------------------------------- */
/* URL FILTER HELPERS                                                         */
/* -------------------------------------------------------------------------- */

function readFilters(
  params: URLSearchParams,
  ceiling: number,
): FilterState {
  const csv = (key: string) =>
    unique(
      (params.get(key) || "")
        .split(",")
        .map((v) => v.trim()),
    );

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

/* -------------------------------------------------------------------------- */
/* FILTER SIDEBAR                                                             */
/* -------------------------------------------------------------------------- */

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

  const { data: categoriesData, isLoading } =
    useGetCategoriesQuery({});

  /* ------------------------------------------------------------------------ */
  /* CATEGORY AND BRAND API DATA                                              */
  /* ------------------------------------------------------------------------ */

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

  /* ------------------------------------------------------------------------ */
  /* BRAND <-> CATEGORY RELATIONSHIP                                          */
  /* ------------------------------------------------------------------------ */

  /*
   * API relation:
   *
   * categories:
   * {
   *   id: 6,
   *   title: "All Watches",
   *   brands: [
   *     { id: 1, title: "FABIUS", category_id: 6 }
   *   ]
   * }
   *
   * Top-level brands:
   * {
   *   id: 1,
   *   title: "FABIUS",
   *   category_id: 6
   * }
   *
   * Both structures are supported.
   */

  const brandCategoryRelations = useMemo(() => {
    const brandToCategoryId = new Map<string, string>();

    const brandToCategoryTitle = new Map<string, string>();

    const categoryToBrandIds = new Map<string, string[]>();

    const categoryTitleToId = new Map<string, string>();

    const categoryIdToTitle = new Map<string, string>();

    categories.forEach((category) => {
      const id = keyOf(category.id);
      const title = normalized(category.title);

      if (!id || !title) return;

      categoryTitleToId.set(title, id);
      categoryIdToTitle.set(id, category.title);
    });

    const addRelation = (
      brandIdValue: unknown,
      categoryIdValue: unknown,
    ) => {
      const brandId = keyOf(brandIdValue);
      const categoryId = keyOf(categoryIdValue);

      if (!brandId || !categoryId) return;

      brandToCategoryId.set(brandId, categoryId);

      const categoryTitle = categoryIdToTitle.get(categoryId);

      if (categoryTitle) {
        brandToCategoryTitle.set(
          brandId,
          categoryTitle,
        );
      }

      const existing = categoryToBrandIds.get(categoryId) ?? [];

      if (!existing.includes(brandId)) {
        categoryToBrandIds.set(categoryId, [
          ...existing,
          brandId,
        ]);
      }
    };

    // Relationship from categories[].brands[]
    categories.forEach((category) => {
      (category.brands ?? []).forEach((brand) => {
        addRelation(
          brand.id,
          brand.category_id ?? category.id,
        );
      });
    });

    // Relationship from top-level brands[]
    apiBrands.forEach((brand) => {
      addRelation(brand.id, brand.category_id);
    });

    return {
      brandToCategoryId,
      brandToCategoryTitle,
      categoryToBrandIds,
      categoryTitleToId,
      categoryIdToTitle,
    };
  }, [categories, apiBrands]);

  const {
    brandToCategoryId,
    brandToCategoryTitle,
    categoryToBrandIds,
    categoryTitleToId,
    categoryIdToTitle,
  } = brandCategoryRelations;

  /* ------------------------------------------------------------------------ */
  /* SEARCH                                                                   */
  /* ------------------------------------------------------------------------ */

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

  /* ------------------------------------------------------------------------ */
  /* PRODUCT DATA                                                             */
  /* ------------------------------------------------------------------------ */

  const complete =
    productsComplete &&
    (facetProducts !== undefined || products !== undefined);

  const sourceProducts = useMemo(
    () => facetProducts ?? products ?? [],
    [facetProducts, products],
  );

  const productFamilies = useMemo(() => {
    if (searchActive) return sourceProducts;

    return sourceProducts.filter((p) => {
      const flag = p.is_primary ?? p.isPrimary;

      return (
        flag == null ||
        flag === true ||
        flag === 1 ||
        flag === "1"
      );
    });
  }, [sourceProducts, searchActive]);

  const familyMembers = useMemo(() => {
    const byId = new Map(
      sourceProducts
        .filter((p) => p.id != null)
        .map((p) => [keyOf(p.id), p]),
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
            (
              variant as ProductLike & {
                variant_product_id?: number | string;
              }
            ).variant_product_id,
        );

        if (linked) refs.add(linked);

        if (
          variant.id != null &&
          byId.has(keyOf(variant.id))
        ) {
          refs.add(keyOf(variant.id));
        }
      }

      for (const p of sourceProducts) {
        const parent = keyOf(
          p.parent_product_id ??
            p.primary_product_id ??
            p.parent_id ??
            p.parent_product?.id,
        );

        if (primaryId && parent === primaryId) {
          refs.add(keyOf(p.id));
        }
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
        uniqueMembers.set(
          keyOf(p.id) || `nested-${index}`,
          p,
        ),
      );

      return [...uniqueMembers.values()];
    });
  }, [sourceProducts, productFamilies]);

  const members = useMemo(() => {
    const map = new Map<string, ProductLike>();

    familyMembers
      .flat()
      .forEach((p, i) =>
        map.set(keyOf(p.id) || `row-${i}`, p),
      );

    return [...map.values()];
  }, [familyMembers]);

  /* ------------------------------------------------------------------------ */
  /* PRODUCT COUNTS                                                           */
  /* ------------------------------------------------------------------------ */

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
                normalized(productBrandName(p)),
            )?.id,
          );

        if (brand) familyBrands.add(brand);

        const category = productCategoryName(p, categories);

        if (category) {
          familyCategories.add(normalized(category));
        }

        const sub = productSubcategoryId(p);

        if (sub) familySubs.add(sub);

        highest = Math.max(highest, productPrice(p));
      }

      familyBrands.forEach((v) =>
        brands.set(v, (brands.get(v) ?? 0) + 1),
      );

      familyCategories.forEach((v) =>
        cats.set(v, (cats.get(v) ?? 0) + 1),
      );

      familySubs.forEach((v) =>
        subs.set(v, (subs.get(v) ?? 0) + 1),
      );
    }

    return { brands, cats, subs, highest };
  }, [familyMembers, apiBrands, categories]);

  /* ------------------------------------------------------------------------ */
  /* PRICE                                                                    */
  /* ------------------------------------------------------------------------ */

  const ceiling = Math.max(
    1,
    numeric(maxPrice),
    ...(complete
      ? [counts.highest]
      : [
          numeric(categoriesData?.most_expensive_price),
          ...categories.map((c) => numeric(c.max_price)),
          counts.highest,
        ]),
  );

  /* ------------------------------------------------------------------------ */
  /* FILTER STATE                                                             */
  /* ------------------------------------------------------------------------ */

  const paramsString = searchParams.toString();

  const [filters, setFilters] = useState<FilterState>(() =>
    readFilters(
      new URLSearchParams(paramsString),
      ceiling,
    ),
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

  const [expandedCategories, setExpandedCategories] =
    useState<string[]>([]);

  const [priceInputs, setPriceInputs] = useState({
    min: "0",
    max: String(ceiling),
  });

  const timer = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  /* ------------------------------------------------------------------------ */
  /* URL TO STATE                                                             */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    const next = readFilters(
      new URLSearchParams(paramsString),
      ceiling,
    );

    setFilters((previous) =>
      JSON.stringify(previous) === JSON.stringify(next)
        ? previous
        : next,
    );

    setPriceInputs({
      min: String(next.priceRange[0]),
      max: String(next.priceRange[1]),
    });
  }, [paramsString, ceiling]);

  useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    },
    [],
  );

  /* ------------------------------------------------------------------------ */
  /* COLORS                                                                   */
  /* ------------------------------------------------------------------------ */

  const colorOptions = useMemo(() => {
    const values = new Set<string>(
      (availableColors ?? []).filter(Boolean),
    );

    members.forEach((p) => {
      const c = productColor(p);
      if (c) values.add(c);
    });

    (filters.colors ?? []).forEach((c) => values.add(c));

    return [...values].sort((a, b) =>
      a.localeCompare(b),
    );
  }, [availableColors, members, filters.colors]);

  /* ------------------------------------------------------------------------ */
  /* BRAND OPTIONS                                                            */
  /* ------------------------------------------------------------------------ */

  const brandOptions = useMemo(() => {
    const options = [...apiBrands];

    const known = new Set(
      options.map((b) => keyOf(b.id)),
    );

    for (const p of members) {
      const id = productBrandId(p);

      if (id && !known.has(id)) {
        options.push({
          id: Number(id),
          title: productBrandName(p) || `Brand ${id}`,
        });

        known.add(id);
      }
    }

    return options.filter((b) =>
      normalized(b.title).includes(normalized(brandSearch)),
    );
  }, [apiBrands, members, brandSearch]);

  const visibleBrands = showAllBrands
    ? brandOptions
    : brandOptions.slice(0, 7);

  /* ------------------------------------------------------------------------ */
  /* CATEGORY OPTIONS                                                         */
  /* ------------------------------------------------------------------------ */

  const categoryOptions = useMemo(() => {
    const options = [...categories];

    const known = new Set(
      options.map((c) => normalized(c.title)),
    );

    for (const p of members) {
      const title = productCategoryName(p, categories);

      if (title && !known.has(normalized(title))) {
        options.push({
          id: -(options.length + 1),
          title,
          status: "active",
          subcategories: [],
          brands: [],
        });

        known.add(normalized(title));
      }
    }

    return options;
  }, [categories, members]);

  /* ------------------------------------------------------------------------ */
  /* SUBCATEGORY RELATIONSHIPS                                                */
  /* ------------------------------------------------------------------------ */

  const subcategoryRelations = useMemo(() => {
    const selectedSubcategoryIds = new Set(
      filters.subCategories,
    );

    const selectedCategoryTitles = new Set(
      filters.categories.map(normalized),
    );

    const categoryBySubcategory = new Map<string, string>();

    const brandsBySubcategory = new Map<
      string,
      Set<string>
    >();

    const categoriesByBrand = new Map<
      string,
      Set<string>
    >();

    const inferredCategoryTitles = new Set<string>();

    const inferredBrandIds = new Set<string>();

    categories.forEach((category) => {
      const categoryTitle = normalized(category.title);

      (category.subcategories ?? []).forEach(
        (subcategory) => {
          const subcategoryId = keyOf(subcategory.id);

          if (!subcategoryId || !categoryTitle) return;

          categoryBySubcategory.set(
            subcategoryId,
            categoryTitle,
          );

          if (selectedSubcategoryIds.has(subcategoryId)) {
            inferredCategoryTitles.add(categoryTitle);
          }
        },
      );
    });

    for (const family of familyMembers) {
      const familySubcategories = new Set<string>();
      const familyBrandIds = new Set<string>();

      for (const product of family) {
        const subcategoryId =
          productSubcategoryId(product);

        const categoryTitle =
          productCategoryName(product, categories);

        if (subcategoryId && categoryTitle) {
          const normalizedTitle =
            normalized(categoryTitle);

          if (!categoryBySubcategory.has(subcategoryId)) {
            categoryBySubcategory.set(
              subcategoryId,
              normalizedTitle,
            );
          }

          if (
            selectedSubcategoryIds.has(subcategoryId)
          ) {
            inferredCategoryTitles.add(normalizedTitle);
          }
        }

        if (
          subcategoryId &&
          selectedSubcategoryIds.has(subcategoryId)
        ) {
          familySubcategories.add(subcategoryId);
        }

        const brandName = productBrandName(product);

        const brandId =
          productBrandId(product) ||
          keyOf(
            apiBrands.find(
              (brand) =>
                normalized(brand.title) ===
                normalized(brandName),
            )?.id,
          );

        if (brandId) familyBrandIds.add(brandId);
      }

      familySubcategories.forEach((subcategoryId) => {
        const existing =
          brandsBySubcategory.get(subcategoryId) ??
          new Set<string>();

        familyBrandIds.forEach((brandId) =>
          existing.add(brandId),
        );

        brandsBySubcategory.set(
          subcategoryId,
          existing,
        );
      });
    }

    selectedSubcategoryIds.forEach((subcategoryId) => {
      const parentTitle =
        categoryBySubcategory.get(subcategoryId);

      if (parentTitle) {
        inferredCategoryTitles.add(parentTitle);
      }

      brandsBySubcategory
        .get(subcategoryId)
        ?.forEach((brandId) => {
          inferredBrandIds.add(brandId);
        });
    });

    const visibleSelectedCategoryTitles = new Set([
      ...selectedCategoryTitles,
      ...inferredCategoryTitles,
    ]);

    categories.forEach((category) => {
      const categoryTitle = normalized(category.title);

      if (
        !visibleSelectedCategoryTitles.has(categoryTitle)
      ) {
        return;
      }

      const categoryId = keyOf(category.id);

      /*
       * If a category has an individually selected brand,
       * do not automatically visually check its other brands.
       * This allows individual brands to be unchecked.
       */

      const hasSelectedBrand = filters.brands.some(
        (brandId) =>
          brandToCategoryId.get(brandId) === categoryId,
      );

      if (!hasSelectedBrand) {
        (category.brands ?? []).forEach((brand) => {
          const brandId = keyOf(brand.id);

          if (brandId) {
            inferredBrandIds.add(brandId);
          }
        });

        apiBrands
          .filter(
            (brand) =>
              keyOf(brand.category_id) === categoryId,
          )
          .forEach((brand) => {
            inferredBrandIds.add(keyOf(brand.id));
          });
      }

      const linkedBrandIds = new Set<string>([
        ...(category.brands ?? []).map((brand) =>
          keyOf(brand.id),
        ),
        ...apiBrands
          .filter(
            (brand) =>
              keyOf(brand.category_id) === categoryId,
          )
          .map((brand) => keyOf(brand.id)),
      ]);

      linkedBrandIds.forEach((brandId) => {
        if (!brandId) return;

        const titles =
          categoriesByBrand.get(brandId) ??
          new Set<string>();

        titles.add(categoryTitle);

        categoriesByBrand.set(brandId, titles);
      });
    });

    // Product-derived brand/category associations.
    for (const family of familyMembers) {
      for (const product of family) {
        const categoryTitle = normalized(
          productCategoryName(product, categories),
        );

        if (
          !categoryTitle ||
          !visibleSelectedCategoryTitles.has(categoryTitle)
        ) {
          continue;
        }

        const categoryId =
          categoryTitleToId.get(categoryTitle);

        const hasSelectedBrand = categoryId
          ? filters.brands.some(
              (brandId) =>
                brandToCategoryId.get(brandId) ===
                categoryId,
            )
          : false;

        if (
          selectedCategoryTitles.has(categoryTitle) &&
          hasSelectedBrand
        ) {
          continue;
        }

        const brandId =
          productBrandId(product) ||
          keyOf(
            apiBrands.find(
              (brand) =>
                normalized(brand.title) ===
                normalized(productBrandName(product)),
            )?.id,
          );

        if (!brandId) continue;

        inferredBrandIds.add(brandId);

        const titles =
          categoriesByBrand.get(brandId) ??
          new Set<string>();

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
  }, [
    filters.subCategories,
    filters.categories,
    filters.brands,
    categories,
    familyMembers,
    apiBrands,
    brandToCategoryId,
    categoryTitleToId,
  ]);

  const {
    categoryBySubcategory,
    brandsBySubcategory,
    categoriesByBrand,
    inferredCategoryTitles,
    inferredBrandIds,
  } = subcategoryRelations;

  /* ------------------------------------------------------------------------ */
  /* AUTO EXPAND SELECTED CATEGORY                                            */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    const selectedTitles = new Set([
      ...filters.categories.map(normalized),
      ...inferredCategoryTitles,
    ]);

    const categoriesToOpen = categories
      .filter((category) =>
        selectedTitles.has(normalized(category.title)),
      )
      .map((category) => keyOf(category.id));

    if (!categoriesToOpen.length) return;

    setExpanded((previous) =>
      previous.categories
        ? previous
        : { ...previous, categories: true },
    );

    setExpandedCategories((previous) => {
      const next = unique([
        ...previous,
        ...categoriesToOpen,
      ]);

      return next.length === previous.length
        ? previous
        : next;
    });
  }, [
    filters.categories,
    filters.subCategories,
    categories,
    inferredCategoryTitles,
  ]);

  /* ------------------------------------------------------------------------ */
  /* URL UPDATE                                                               */
  /* ------------------------------------------------------------------------ */

  const applyUrl = useCallback(
    (next: FilterState) => {
      const params = new URLSearchParams(paramsString);

      const csv = (key: string, value: string[]) => {
        if (value.length) {
          params.set(key, value.join(","));
        } else {
          params.delete(key);
        }
      };

      // Empty selections are completely removed from the URL.
      csv("brand_ids", next.brands);

      csv("category", next.categories);

      csv("subcategory_ids", next.subCategories);

      csv("color", next.colors ?? []);

      if (next.priceRange[0] > 0) {
        params.set(
          "min_price",
          String(next.priceRange[0]),
        );
      } else {
        params.delete("min_price");
      }

      if (next.priceRange[1] < ceiling) {
        params.set(
          "max_price",
          String(next.priceRange[1]),
        );
      } else {
        params.delete("max_price");
      }

      const stockKeys = {
        inStock: "in_stock",
        outOfStock: "out_of_stock",
        lowStock: "low_stock",
      } as const;

      (
        Object.keys(stockKeys) as Array<
          keyof typeof stockKeys
        >
      ).forEach((key) => {
        const urlKey = stockKeys[key];

        if (next.availability[key]) {
          params.set(urlKey, "true");
        } else {
          params.delete(urlKey);
        }
      });

      // Every filter change starts from page 1.
      params.delete("page");

      const query = params.toString();

      const nextUrl = query
        ? `${PRODUCTS_ROUTE}?${query}`
        : PRODUCTS_ROUTE;

      router.replace(nextUrl, {
        scroll: false,
      });
    },
    [router, paramsString, ceiling],
  );

  /* ------------------------------------------------------------------------ */
  /* COMMIT FILTERS                                                           */
  /* ------------------------------------------------------------------------ */

  const commit = useCallback(
    (next: FilterState, delayed = false) => {
      if (timer.current) {
        clearTimeout(timer.current);
      }

      setFilters(next);

      // Update the parent ProductsPage state.
      onFilterChange?.(next);

      if (delayed) {
        timer.current = setTimeout(() => {
          applyUrl(next);
        }, 600);
      } else {
        applyUrl(next);

        if (mobile) {
          onMobileClose?.();
        }
      }
    },
    [
      applyUrl,
      mobile,
      onFilterChange,
      onMobileClose,
    ],
  );

  /* ------------------------------------------------------------------------ */
  /* BRAND CATEGORY LOOKUP                                                    */
  /* ------------------------------------------------------------------------ */

  const getRelatedCategoryTitle = useCallback(
    (brandId: string): string => {
      // First use the API relationship.
      const apiTitle =
        brandToCategoryTitle.get(brandId);

      if (apiTitle) return apiTitle;

      // Fallback: use product family data.
      const product = members.find((item) => {
        const id =
          productBrandId(item) ||
          keyOf(
            apiBrands.find(
              (brand) =>
                normalized(brand.title) ===
                normalized(productBrandName(item)),
            )?.id,
          );

        return id === brandId;
      });

      if (product) {
        return normalized(
          productCategoryName(product, categories),
        );
      }

      // Fallback: use existing inferred associations.
      const mapped = categoriesByBrand.get(brandId);

      return mapped?.values().next().value ?? "";
    },
    [
      brandToCategoryTitle,
      members,
      apiBrands,
      categories,
      categoriesByBrand,
    ],
  );

  /* ------------------------------------------------------------------------ */
  /* GET CATEGORY BRAND IDS                                                   */
  /* ------------------------------------------------------------------------ */

  const getRelatedBrandIds = useCallback(
    (categoryTitle: string): string[] => {
      const categoryId = categoryTitleToId.get(
        normalized(categoryTitle),
      );

      const result = new Set<string>();

      if (categoryId) {
        (
          categoryToBrandIds.get(categoryId) ?? []
        ).forEach((id) => result.add(id));
      }

      // Include brands associated from product family data.
      const normalizedTitle = normalized(categoryTitle);

      members.forEach((product) => {
        const productCategory = normalized(
          productCategoryName(product, categories),
        );

        if (productCategory !== normalizedTitle) return;

        const brandId =
          productBrandId(product) ||
          keyOf(
            apiBrands.find(
              (brand) =>
                normalized(brand.title) ===
                normalized(productBrandName(product)),
            )?.id,
          );

        if (brandId) result.add(brandId);
      });

      return [...result];
    },
    [
      categoryTitleToId,
      categoryToBrandIds,
      members,
      categories,
      apiBrands,
    ],
  );

  /* ------------------------------------------------------------------------ */
  /* FILTER TOGGLE - BRAND + CATEGORY SYNC                                    */
  /* ------------------------------------------------------------------------ */

  const toggleArray = (
    key: "brands" | "categories" | "subCategories" | "colors",
    value: string,
  ) => {
    const old = filters[key] ?? [];

    /* ---------------------------------------------------------------------- */
    /* CATEGORY SELECT / UNSELECT                                             */
    /* ---------------------------------------------------------------------- */

    if (key === "categories") {
      const categoryKey = normalized(value);

      const isChecked =
        old.some(
          (item) => normalized(item) === categoryKey,
        ) ||
        inferredCategoryTitles.has(categoryKey);

      const relatedBrandIds = new Set(
        getRelatedBrandIds(value),
      );

      const currentCategoryId =
        categoryTitleToId.get(categoryKey);

      /*
       * CATEGORY UNCHECKED:
       *
       * Remove:
       * 1. Category
       * 2. All related brands
       * 3. Related subcategories
       * 4. Their URL parameters
       */

      if (isChecked) {
        const subcategoriesToRemove =
          filters.subCategories.filter(
            (subcategoryId) =>
              categoryBySubcategory.get(subcategoryId) ===
              categoryKey,
          );

        const removeSubcategoryIds = new Set(
          subcategoriesToRemove,
        );

        commit({
          ...filters,

          categories: filters.categories.filter(
            (item) => normalized(item) !== categoryKey,
          ),

          brands: filters.brands.filter(
            (brandId) =>
              !relatedBrandIds.has(brandId),
          ),

          subCategories:
            filters.subCategories.filter(
              (id) => !removeSubcategoryIds.has(id),
            ),
        });

        return;
      }

      /*
       * CATEGORY CHECKED:
       *
       * Automatically select all related brands.
       */

      const nextBrands = unique([
        ...filters.brands,
        ...relatedBrandIds,
      ]);

      commit({
        ...filters,

        categories: unique([
          ...filters.categories,
          value,
        ]),

        brands: nextBrands,
      });

      return;
    }

    /* ---------------------------------------------------------------------- */
    /* BRAND SELECT / UNSELECT                                                */
    /* ---------------------------------------------------------------------- */

    if (key === "brands") {
      const isChecked =
        old.includes(value) ||
        inferredBrandIds.has(value);

      /*
       * BRAND UNCHECKED:
       *
       * Remove the brand.
       * Remove its parent category when no other selected
       * brand belongs to that category.
       */

      if (isChecked) {
        const nextBrands = filters.brands.filter(
          (item) => item !== value,
        );

        const linkedCategoryTitles = new Set<string>();

        const categoryTitle =
          getRelatedCategoryTitle(value);

        if (categoryTitle) {
          linkedCategoryTitles.add(
            normalized(categoryTitle),
          );
        }

        categoriesByBrand
          .get(value)
          ?.forEach((title) => {
            linkedCategoryTitles.add(
              normalized(title),
            );
          });

        const categoryTitlesToRemove = new Set<string>();

        linkedCategoryTitles.forEach((title) => {
          const categoryId =
            categoryTitleToId.get(title);

          /*
           * Preserve a category if another brand from
           * the same category is still selected.
           */

          const hasOtherSelectedBrand = categoryId
            ? nextBrands.some(
                (brandId) =>
                  brandId !== value &&
                  brandToCategoryId.get(brandId) ===
                    categoryId,
              )
            : false;

          if (!hasOtherSelectedBrand) {
            categoryTitlesToRemove.add(title);
          }
        });

        /*
         * Remove subcategories belonging to the removed
         * brand or removed parent category.
         */

        const removeSubcategoryIds =
          new Set<string>();

        filters.subCategories.forEach(
          (subcategoryId) => {
            const parentTitle =
              categoryBySubcategory.get(subcategoryId);

            const belongsToBrand =
              brandsBySubcategory
                .get(subcategoryId)
                ?.has(value);

            const belongsToRemovedCategory =
              parentTitle !== undefined &&
              categoryTitlesToRemove.has(parentTitle);

            if (
              belongsToBrand ||
              belongsToRemovedCategory
            ) {
              removeSubcategoryIds.add(subcategoryId);
            }
          },
        );

        const nextCategories =
          filters.categories.filter(
            (title) =>
              !categoryTitlesToRemove.has(
                normalized(title),
              ),
          );

        commit({
          ...filters,

          brands: nextBrands,

          categories: nextCategories,

          subCategories:
            filters.subCategories.filter(
              (id) => !removeSubcategoryIds.has(id),
            ),
        });

        return;
      }

      /*
       * BRAND CHECKED:
       *
       * Automatically select its parent category.
       * Keep the other selected filters unchanged.
       */

      const parentCategoryTitle =
        getRelatedCategoryTitle(value);

      const nextCategories = parentCategoryTitle
        ? unique([
            ...filters.categories,
            parentCategoryTitle,
          ])
        : filters.categories;

      commit({
        ...filters,

        brands: unique([
          ...filters.brands,
          value,
        ]),

        categories: nextCategories,
      });

      return;
    }

    /* ---------------------------------------------------------------------- */
    /* SUBCATEGORY / COLOR                                                    */
    /* ---------------------------------------------------------------------- */

    commit({
      ...filters,

      [key]: old.includes(value)
        ? old.filter((item) => item !== value)
        : [...old, value],
    });
  };

  /* ------------------------------------------------------------------------ */
  /* STOCK FILTER                                                             */
  /* ------------------------------------------------------------------------ */

  const toggleStock = (key: keyof Availability) =>
    commit({
      ...filters,

      availability: {
        ...filters.availability,
        [key]: !filters.availability[key],
      },
    });

  /* ------------------------------------------------------------------------ */
  /* CLEAR ALL FILTERS                                                       */
  /* ------------------------------------------------------------------------ */

  const clearAll = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }

    const reset: FilterState = {
      brands: [],
      categories: [],
      subCategories: [],
      colors: [],

      priceRange: [0, ceiling],

      availability: {
        inStock: false,
        outOfStock: false,
        lowStock: false,
      },
    };

    // Clear component state.
    setFilters(reset);

    setBrandSearch("");

    setShowAllBrands(false);

    setPriceInputs({
      min: "0",
      max: String(ceiling),
    });

    setExpandedCategories([]);

    // Update parent state.
    onFilterChange?.(reset);

    /*
     * Remove every filter-related parameter.
     * Keep unrelated parameters such as search and sort.
     */

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
    ].forEach((key) => params.delete(key));

    const query = params.toString();

    const nextUrl = query
      ? `${PRODUCTS_ROUTE}?${query}`
      : PRODUCTS_ROUTE;

    router.replace(nextUrl, {
      scroll: false,
    });

    if (mobile) {
      onMobileClose?.();
    }
  };

  /* ------------------------------------------------------------------------ */
  /* PRICE                                                                    */
  /* ------------------------------------------------------------------------ */

  const applyPrice = () => {
    const min = Math.max(
      0,
      Math.min(ceiling, numeric(priceInputs.min)),
    );

    const max = Math.max(
      min,
      Math.min(
        ceiling,
        priceInputs.max.trim() === ""
          ? ceiling
          : numeric(priceInputs.max),
      ),
    );

    commit({
      ...filters,
      priceRange: [min, max],
    });
  };

  /* ------------------------------------------------------------------------ */
  /* SELECTED COUNTS                                                          */
  /* ------------------------------------------------------------------------ */

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
    Number(
      filters.priceRange[0] > 0 ||
        filters.priceRange[1] < ceiling,
    );

  /* ------------------------------------------------------------------------ */
  /* SECTION COMPONENT                                                        */
  /* ------------------------------------------------------------------------ */

  const renderSection = (
    name: keyof typeof expanded,
    title: string,
    children: ReactNode,
  ) => (
    <section className="border-b border-[#e8e8e8] bg-white last:border-b-0">
      <button
        type="button"
        onClick={() =>
          setExpanded((s) => ({
            ...s,
            [name]: !s[name],
          }))
        }
        className="flex w-full items-center justify-between bg-white px-5 py-4 text-left transition-colors hover:bg-[#f5f5f5] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-black"
      >
        <span className="text-[13px] font-bold uppercase tracking-[.07em] text-[#111111]">
          {title}
        </span>

        {expanded[name] ? (
          <ChevronUp size={16} />
        ) : (
          <ChevronDown size={16} />
        )}
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
            <div className="space-y-3 bg-white px-5 pb-5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );

  /* ------------------------------------------------------------------------ */
  /* CHECKBOX COMPONENT                                                       */
  /* ------------------------------------------------------------------------ */

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
      className={`flex cursor-pointer items-center gap-2.5 text-[12px] ${
        indent ? "pl-4" : ""
      } ${disabled ? "opacity-40" : ""}`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className="h-4 w-4 shrink-0 cursor-pointer rounded border-[#d9d6d0] accent-black"
      />

      <span
        className={`min-w-0 flex-1 truncate ${
          checked
            ? "font-semibold text-black"
            : "text-[#454545]"
        }`}
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

  /* ------------------------------------------------------------------------ */
  /* RENDER                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <motion.aside
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      aria-label="Product filters"
      className={`overflow-hidden border border-[#eae7e1] bg-white ${
        mobile
          ? "max-h-[90dvh] rounded-t-2xl"
          : "rounded-xl md:sticky md:top-5"
      }`}
    >
      {/* HEADER */}

      <div className="flex items-center justify-between border-b border-[#e5e5e5] bg-white px-5 py-4">
        <div
          style={{ color: "#000000" }}
          className="flex items-center gap-2 text-[14px] font-semibold uppercase tracking-wide"
        >
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

      <div
        className={
          mobile
            ? "max-h-[calc(90dvh-65px)] overflow-y-auto"
            : ""
        }
      >
        {/* -------------------------------------------------------------- */}
        {/* BRAND */}
        {/* -------------------------------------------------------------- */}

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
                style={{ color: "#000000" }}
                type="text"
                value={brandSearch}
                onChange={(e) =>
                  setBrandSearch(e.target.value)
                }
                placeholder="Search brands"
                className="w-full rounded-full border border-[#e8e8e8] bg-[#fafafa] py-2 pl-9 pr-3 text-[12px] outline-none focus:border-black"
              />
            </div>

            {isLoading && !products ? (
              <p className="text-xs text-gray-400">
                Loading brands...
              </p>
            ) : visibleBrands.length ? (
              visibleBrands.map((b) => {
                const id = keyOf(b.id);

                return (
                  <CheckRow
                    key={id}
                    label={b.title}
                    checked={
                      filters.brands.includes(id) ||
                      inferredBrandIds.has(id)
                    }
                    onChange={() =>
                      toggleArray("brands", id)
                    }
                  />
                );
              })
            ) : (
              <p className="text-xs text-gray-400">
                No matching brands
              </p>
            )}

            {brandOptions.length > 7 && (
              <button
                type="button"
                onClick={() =>
                  setShowAllBrands((v) => !v)
                }
                className="text-[12px] font-medium underline underline-offset-2"
              >
                {showAllBrands
                  ? "Show less"
                  : `+ ${brandOptions.length - 7} more`}
              </button>
            )}
          </>,
        )}

        {/* -------------------------------------------------------------- */}
        {/* CATEGORIES */}
        {/* -------------------------------------------------------------- */}

        {renderSection(
          "categories",
          "Categories",
          <>
            {categoryOptions.length ? (
              categoryOptions.map((c) => {
                const categoryKey = normalized(c.title);

                const checked =
                  filters.categories.some(
                    (title) =>
                      normalized(title) === categoryKey,
                  ) ||
                  inferredCategoryTitles.has(categoryKey);

                const subcategories = (
                  c.subcategories ?? []
                ).filter((s) => s.status !== false);

                const isOpen = expandedCategories.includes(
                  keyOf(c.id),
                );

                return (
                  <div
                    key={c.id}
                    className="space-y-2"
                  >
                    <div className="flex items-center gap-1">
                      <div className="min-w-0 flex-1">
                        <CheckRow
                          label={c.title}
                          checked={checked}
                          onChange={() =>
                            toggleArray(
                              "categories",
                              c.title,
                            )
                          }
                        />
                      </div>

                      {subcategories.length > 0 && (
                        <button
                          type="button"
                          aria-label={`Toggle ${c.title} subcategories`}
                          onClick={() =>
                            setExpandedCategories((old) =>
                              isOpen
                                ? old.filter(
                                    (v) =>
                                      v !== keyOf(c.id),
                                  )
                                : [
                                    ...old,
                                    keyOf(c.id),
                                  ],
                            )
                          }
                          className="rounded p-1 hover:bg-gray-100"
                        >
                          <ChevronDown
                            size={15}
                            className={
                              isOpen ? "rotate-180" : ""
                            }
                          />
                        </button>
                      )}
                    </div>

                    {isOpen &&
                      subcategories.map((s) => {
                        const id = keyOf(s.id);

                        return (
                          <CheckRow
                            key={id}
                            indent
                            label={s.name}
                            checked={filters.subCategories.includes(
                              id,
                            )}
                            onChange={() =>
                              toggleArray(
                                "subCategories",
                                id,
                              )
                            }
                          />
                        );
                      })}
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-gray-400">
                No matching categories
              </p>
            )}
          </>,
        )}

        {/* -------------------------------------------------------------- */}
        {/* COLOR */}
        {/* -------------------------------------------------------------- */}

        {colorOptions.length > 0 &&
          renderSection(
            "colors",
            "Color",
            <>
              {colorOptions.map((color) => (
                <CheckRow
                  key={color}
                  label={color}
                  checked={(filters.colors ?? []).includes(
                    color,
                  )}
                  onChange={() =>
                    toggleArray("colors", color)
                  }
                />
              ))}
            </>,
          )}

        {/* -------------------------------------------------------------- */}
        {/* PRICE */}
        {/* -------------------------------------------------------------- */}

        {renderSection(
          "price",
          "Price",
          <>
            <p
              style={{ color: "#000000" }}
              className="text-[12px] font-semibold"
            >
              {formatPrice(filters.priceRange[0])} –{" "}
              {formatPrice(filters.priceRange[1])}
            </p>

            <div className="grid grid-cols-2 gap-2">
              {(["min", "max"] as const).map((key) => (
                <label
                  key={key}
                  className="space-y-1 text-[10px] text-[#777]"
                >
                  <span>
                    {key === "min"
                      ? "Min price"
                      : "Max price"}
                  </span>

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
                      if (e.key === "Enter") {
                        applyPrice();
                      }
                    }}
                    className="w-full rounded-md border border-[#e5e1dc] px-2 py-2 text-[12px] text-black outline-none focus:border-black"
                  />
                </label>
              ))}
            </div>

            {/* DUAL PRICE RANGE */}

            <div className="relative flex h-9 w-full items-center">
              <div className="absolute inset-x-0 h-1.5 rounded-full bg-[#e5e5e5]" />

              <div
                className="pointer-events-none absolute h-1.5 rounded-full bg-black"
                style={{
                  left: `${
                    (Math.min(
                      ceiling,
                      filters.priceRange[0],
                    ) /
                      ceiling) *
                    100
                  }%`,

                  right: `${
                    100 -
                    (Math.min(
                      ceiling,
                      filters.priceRange[1],
                    ) /
                      ceiling) *
                      100
                  }%`,
                }}
              />

              <input
                type="range"
                aria-label="Minimum price"
                min={0}
                max={ceiling}
                step={1}
                value={Math.min(
                  ceiling,
                  filters.priceRange[0],
                )}
                onChange={(e) => {
                  const min = Math.min(
                    Number(e.target.value),
                    filters.priceRange[1],
                  );

                  setPriceInputs({
                    min: String(min),
                    max: String(filters.priceRange[1]),
                  });

                  commit(
                    {
                      ...filters,
                      priceRange: [
                        min,
                        filters.priceRange[1],
                      ],
                    },
                    true,
                  );
                }}
                className="dual-price-range pointer-events-none absolute inset-x-0 w-full appearance-none bg-transparent"
                style={{
                  zIndex:
                    filters.priceRange[0] >= ceiling - 1
                      ? 5
                      : 3,
                }}
              />

              <input
                type="range"
                aria-label="Maximum price"
                min={0}
                max={ceiling}
                step={1}
                value={Math.min(
                  ceiling,
                  filters.priceRange[1],
                )}
                onChange={(e) => {
                  const max = Math.max(
                    Number(e.target.value),
                    filters.priceRange[0],
                  );

                  setPriceInputs({
                    min: String(filters.priceRange[0]),
                    max: String(max),
                  });

                  commit(
                    {
                      ...filters,
                      priceRange: [
                        filters.priceRange[0],
                        max,
                      ],
                    },
                    true,
                  );
                }}
                className="dual-price-range pointer-events-none absolute inset-x-0 w-full appearance-none bg-transparent"
                style={{ zIndex: 4 }}
              />
            </div>

            <style jsx>{`
              .dual-price-range::-webkit-slider-runnable-track {
                height: 6px;
                background: transparent;
              }

              .dual-price-range::-moz-range-track {
                height: 6px;
                background: transparent;
              }

              .dual-price-range::-webkit-slider-thumb {
                appearance: none;
                pointer-events: auto;
                width: 18px;
                height: 18px;
                margin-top: -6px;
                border: 3px solid #111;
                border-radius: 50%;
                background: white;
                cursor: grab;
                box-shadow: 0 1px 4px #0002;
              }

              .dual-price-range::-moz-range-thumb {
                pointer-events: auto;
                width: 13px;
                height: 13px;
                border: 3px solid #111;
                border-radius: 50%;
                background: white;
                cursor: grab;
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

        {/* -------------------------------------------------------------- */}
        {/* AVAILABILITY */}
        {/* -------------------------------------------------------------- */}

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