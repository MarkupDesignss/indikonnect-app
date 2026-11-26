"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGetCategoriesQuery } from "@/lib/redux/api/categoryApi";
import { Availability, Brand, Category, PRODUCTS_ROUTE, ProductLike, formatPrice, getFamilyMembers, keyOf, normalized, numeric, productBrandId, productBrandName, productCategoryName, productColor, productPrice, productSubcategoryId, unique } from "@/features/products/components/FilterSidebar.parts/support";


export type FilterState = {
  brands: string[];
  categories: string[];
  subCategories: string[];
  priceRange: [number, number];
  availability: Availability;
  colors: string[];
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
/* URL FILTER HELPERS                                                         */
/* -------------------------------------------------------------------------- */

function readFilters(params: URLSearchParams, ceiling: number): FilterState {
  const csv = (key: string) =>
    unique(
      (params.get(key) || "")
        .split(",")
        .map((v) => v.trim()),
    );

  const min = numeric(params.get("min_price"));
  const max = params.has("max_price") ? numeric(params.get("max_price")) : ceiling;

  return {
    brands: csv("brand_ids"),
    categories: csv("category"),
    subCategories: csv("subcategory_ids"),
    colors: csv("color"),

    priceRange: [min, Math.max(min, max)],

    availability: (() => {
      // PRIMARY: comma-separated `stock_status` param (supports MULTIPLE values).
      const raw = params.get("stock_status") || "";
      const selectedStatuses = raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      // BACKWARD-COMPAT: legacy `stock_status[]` array + single-flag params.
      if (selectedStatuses.length === 0) {
        const legacyArray = [
          ...params.getAll("stock_status[]"),
          ...params.getAll("stock_status"),
        ];
        if (legacyArray.length) {
          selectedStatuses.push(...legacyArray);
        } else {
          if (params.get("in_stock") === "true") selectedStatuses.push("in_stock");
          if (params.get("out_of_stock") === "true")
            selectedStatuses.push("out_of_stock");
          if (params.get("low_stock") === "true") selectedStatuses.push("low_stock");
        }
      }

      return {
        inStock: selectedStatuses.includes("in_stock"),
        outOfStock: selectedStatuses.includes("out_of_stock"),
        lowStock: selectedStatuses.includes("low_stock"),
      };
    })(),
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

  const { data: categoriesData, isLoading } = useGetCategoriesQuery({});

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
  /* PRODUCT DATA                                                             */
  /* ------------------------------------------------------------------------ */

  const complete =
    productsComplete && (facetProducts !== undefined || products !== undefined);

  const sourceProducts = useMemo(
    () => facetProducts ?? products ?? [],
    [facetProducts, products],
  );

  // Only products explicitly marked primary are shown as listing families.
  // Their non-primary family members are still used to resolve variants/facets.
  const productFamilies = useMemo(() => {
    return sourceProducts.filter((p) => {
      const flag = p.is_primary ?? p.isPrimary;
      return (
        flag === true ||
        flag === 1 ||
        (typeof flag === "string" && ["1", "true"].includes(flag.trim().toLowerCase()))
      );
    });
  }, [sourceProducts]);

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
          (variant as ProductLike & { product_id?: number | string }).product_id ??
            (variant as ProductLike & { variant_product_id?: number | string })
              .variant_product_id,
        );
        if (linked) refs.add(linked);
        if (variant.id != null && byId.has(keyOf(variant.id))) {
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
              (b) => normalized(b.title) === normalized(productBrandName(p)),
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

  /* ------------------------------------------------------------------------ */
  /* URL TO STATE                                                             */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    const next = readFilters(new URLSearchParams(paramsString), ceiling);

    setFilters((previous) =>
      JSON.stringify(previous) === JSON.stringify(next) ? previous : next,
    );

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

  /* ------------------------------------------------------------------------ */
  /* COLORS                                                                   */
  /* ------------------------------------------------------------------------ */

  const colorOptions = useMemo(() => {
    const values = new Set<string>((availableColors ?? []).filter(Boolean));

    members.forEach((p) => {
      const c = productColor(p);
      if (c) values.add(c);
    });

    (filters.colors ?? []).forEach((c) => values.add(c));

    return [...values].sort((a, b) => a.localeCompare(b));
  }, [availableColors, members, filters.colors]);

  /* ------------------------------------------------------------------------ */
  /* BRAND OPTIONS                                                            */
  /* ------------------------------------------------------------------------ */

  const brandOptions = useMemo(() => {
    const options = [...apiBrands];
    const known = new Set(options.map((b) => keyOf(b.id)));

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

  const visibleBrands = showAllBrands ? brandOptions : brandOptions.slice(0, 7);

  /* ------------------------------------------------------------------------ */
  /* CATEGORY OPTIONS                                                         */
  /* ------------------------------------------------------------------------ */

  const categoryOptions = useMemo(() => {
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
    const categoryBySubcategory = new Map<string, string>();
    const inferredCategoryTitles = new Set<string>();

    categories.forEach((category) => {
      const categoryTitle = normalized(category.title);
      (category.subcategories ?? []).forEach((subcategory) => {
        const subcategoryId = keyOf(subcategory.id);
        if (!subcategoryId || !categoryTitle) return;
        categoryBySubcategory.set(subcategoryId, categoryTitle);
      });
    });

    for (const family of familyMembers) {
      for (const product of family) {
        const subcategoryId = productSubcategoryId(product);
        const categoryTitle = normalized(productCategoryName(product, categories));
        if (subcategoryId && categoryTitle && !categoryBySubcategory.has(subcategoryId)) {
          categoryBySubcategory.set(subcategoryId, categoryTitle);
        }
      }
    }

    filters.subCategories.forEach((subcategoryId) => {
      const parentTitle = categoryBySubcategory.get(subcategoryId);
      if (parentTitle) inferredCategoryTitles.add(parentTitle);
    });

    return { categoryBySubcategory, inferredCategoryTitles };
  }, [filters.subCategories, categories, familyMembers]);

  const { categoryBySubcategory, inferredCategoryTitles } = subcategoryRelations;

  /* ------------------------------------------------------------------------ */
  /* AUTO EXPAND SELECTED CATEGORY                                            */
  /* ------------------------------------------------------------------------ */

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
        if (value.length) params.set(key, value.join(","));
        else params.delete(key);
      };

      csv("brand_ids", next.brands);
      csv("category", next.categories);
      csv("subcategory_ids", next.subCategories);
      csv("color", next.colors ?? []);

      if (next.priceRange[0] > 0) {
        params.set("min_price", String(next.priceRange[0]));
      } else {
        params.delete("min_price");
      }

      if (next.priceRange[1] < ceiling) {
        params.set("max_price", String(next.priceRange[1]));
      } else {
        params.delete("max_price");
      }

      // Remove every stock-param format first so stale values
      // never survive a filter change.
      [
        "stock_status[]",
        "stock_status",
        "in_stock",
        "out_of_stock",
        "low_stock",
      ].forEach((key) => params.delete(key));

      // MULTIPLE selections allowed: in_stock + out_of_stock + low_stock
      const selectedStatuses: string[] = [];
      if (next.availability.inStock) selectedStatuses.push("in_stock");
      if (next.availability.outOfStock) selectedStatuses.push("out_of_stock");
      if (next.availability.lowStock) selectedStatuses.push("low_stock");

      // SINGLE comma-separated param — consistent across the app.
      if (selectedStatuses.length) {
        selectedStatuses.forEach((status) => {
          params.append("stock_status[]", status);
        });
      }

      // Every filter change starts from page 1.
      params.delete("page");

      const query = params.toString();

      const nextUrl = query
        ? `${PRODUCTS_ROUTE}?${query}`
        : PRODUCTS_ROUTE;

      router.replace(nextUrl, { scroll: false });
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
        timer.current = null;
      }

      setFilters(next);

      // ProductsPage is the sole owner of URL/API updates. This prevents
      // competing router.replace calls from dropping earlier selections.
      if (onFilterChange) {
        onFilterChange(next);
        return;
      }

      // Standalone fallback if this sidebar is rendered without a parent.
      if (delayed) {
        timer.current = setTimeout(() => applyUrl(next), 350);
      } else {
        applyUrl(next);
      }
    },
    [applyUrl, onFilterChange],
  );

  /* ------------------------------------------------------------------------ */
  /* FILTER TOGGLE - INDEPENDENT MULTI-SELECT                                 */
  /* ------------------------------------------------------------------------ */

  const toggleArray = (
    key: "brands" | "categories" | "subCategories" | "colors",
    value: string,
  ) => {
    const old = filters[key] ?? [];
    const alreadySelected = old.includes(value);

    if (key === "categories") {
      const categoryKey = normalized(value);
      const isChecked =
        old.some((item) => normalized(item) === categoryKey) ||
        inferredCategoryTitles.has(categoryKey);

      const nextCategories = isChecked
        ? old.filter((item) => normalized(item) !== categoryKey)
        : unique([...old, value]);

      // Removing a category clears its subcategories, but leaves brands alone.
      const nextSubCategories = isChecked
        ? filters.subCategories.filter(
            (subcategoryId) => categoryBySubcategory.get(subcategoryId) !== categoryKey,
          )
        : filters.subCategories;

      commit({
        ...filters,
        categories: nextCategories,
        subCategories: nextSubCategories,
      });
      return;
    }

    // Brands, subcategories and colors are independent selectable arrays.
    commit({
      ...filters,
      [key]: alreadySelected
        ? old.filter((item) => item !== value)
        : unique([...old, value]),
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

    setFilters(reset);
    setBrandSearch("");
    setShowAllBrands(false);
    setPriceInputs({ min: "0", max: String(ceiling) });
    setExpandedCategories([]);

    if (onFilterChange) {
      onFilterChange(reset);
    } else {
      applyUrl(reset);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* PRICE                                                                    */
  /* ------------------------------------------------------------------------ */

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

  /* ------------------------------------------------------------------------ */
  /* SELECTED COUNTS                                                          */
  /* ------------------------------------------------------------------------ */

  const selectedBrandCount = filters.brands.length;

  // Count explicitly selected categories only; a checked parent implied by
  // a selected subcategory must not inflate the active-filter badge.
  const selectedCategoryCount = new Set(filters.categories.map(normalized)).size;

  const selectedCount =
    selectedBrandCount +
    selectedCategoryCount +
    filters.subCategories.length +
    (filters.colors?.length ?? 0) +
    Object.values(filters.availability).filter(Boolean).length +
    Number(filters.priceRange[0] > 0 || filters.priceRange[1] < ceiling);

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
          setExpanded((s) => ({ ...s, [name]: !s[name] }))
        }
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
          checked ? "font-semibold text-black" : "text-[#454545]"
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
          ? "flex h-[85dvh] max-h-[90dvh] flex-col rounded-t-2xl"
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
          mobile ? "min-h-0 flex-1 overflow-y-auto overscroll-contain" : ""
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

                return (
                  <CheckRow
                    key={id}
                    label={b.title}
                    checked={filters.brands.includes(id)}
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
                className="text-[12px] font-medium underline text-black underline-offset-2"
              >
                {showAllBrands ? "Show less" : `+ ${brandOptions.length - 7} more`}
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
                    (title) => normalized(title) === categoryKey,
                  ) || inferredCategoryTitles.has(categoryKey);

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

                        return (
                          <CheckRow
                            key={id}
                            indent
                            label={s.name}
                            checked={filters.subCategories.includes(id)}
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
                  checked={(filters.colors ?? []).includes(color)}
                  onChange={() => toggleArray("colors", color)}
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
            <p style={{ color: "#000000" }} className="text-[12px] font-semibold">
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

            <div className="relative flex h-9 w-full items-center">
              <div className="absolute inset-x-0 h-1.5 rounded-full bg-[#e5e5e5]" />

              <div
                className="pointer-events-none absolute h-1.5 rounded-full bg-black"
                style={{
                  left: `${
                    (Math.min(ceiling, filters.priceRange[0]) / ceiling) * 100
                  }%`,
                  right: `${
                    100 -
                    (Math.min(ceiling, filters.priceRange[1]) / ceiling) * 100
                  }%`,
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
                      priceRange: [min, filters.priceRange[1]],
                    },
                    true,
                  );
                }}
                className="dual-price-range pointer-events-none absolute inset-x-0 w-full appearance-none bg-transparent"
                style={{
                  zIndex: filters.priceRange[0] >= ceiling - 1 ? 5 : 3,
                }}
              />

              <input
                type="range"
                aria-label="Maximum price"
                min={0}
                max={ceiling}
                step={1}
                value={Math.min(ceiling, filters.priceRange[1])}
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
                      priceRange: [filters.priceRange[0], max],
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

      {mobile && (
        <div className="shrink-0 border-t border-[#e8e8e8] bg-white p-4">
          <button
            type="button"
            onClick={onMobileClose}
            className="w-full rounded-full bg-[#111111] px-4 py-3 text-[13px] font-semibold text-white transition hover:bg-black/85"
          >
            Show Products
          </button>
        </div>
      )}
    </motion.aside>
  );
}