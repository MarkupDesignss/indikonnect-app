"use client";




export const PRODUCTS_ROUTE = "/products/";


export type Availability = {
  inStock: boolean;
  outOfStock: boolean;
  lowStock: boolean;
};


export type ProductLike = {
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


export type Category = {
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


export type Brand = {
  id: number | string;
  title: string;
  category_id?: number | string;
  category_title?: string;
  products_count?: number;
};


/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

export const numeric = (value: unknown): number => {
  const n = Number(String(value ?? "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
};


export const keyOf = (value: unknown): string => String(value ?? "").trim();


export const normalized = (value: unknown): string => keyOf(value).toLowerCase();


export const unique = (items: string[]) => [...new Set(items.filter(Boolean))];


export const formatPrice = (value: number) =>
  `₹${Math.round(value).toLocaleString("en-IN")}`;


/* -------------------------------------------------------------------------- */
/* PRODUCT FAMILY                                                             */
/* -------------------------------------------------------------------------- */

export function getFamilyMembers(product: ProductLike): ProductLike[] {
  const children = [
    ...(Array.isArray(product.variants) ? product.variants : []),
    ...(Array.isArray(product.variant_products) ? product.variant_products : []),
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


export function productBrandId(product: ProductLike): string {
  return keyOf(
    product.brand_id ??
      product.brandId ??
      (typeof product.brand === "object" ? product.brand?.id : ""),
  );
}


export function productBrandName(product: ProductLike): string {
  return keyOf(
    product.brand_name ??
      product.brandName ??
      (typeof product.brand === "object"
        ? product.brand?.name ?? product.brand?.title
        : product.brand),
  );
}


export function productCategoryName(
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
        (typeof value === "string" ? value : value?.title ?? value?.name),
    )
  );
}


export function productSubcategoryId(product: ProductLike): string {
  return keyOf(
    product.subcategory_id ??
      product.subCategoryId ??
      product.sub_category_id ??
      (typeof product.subcategory === "object" ? product.subcategory?.id : ""),
  );
}


export function productColor(product: ProductLike): string {
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
        : product.color?.name ?? product.color?.value) ??
      fromAttrs,
  );
}


export function productPrice(product: ProductLike): number {
  return numeric(
    product.currentPrice ??
      product.price ??
      product.retail_price ??
      product.distributor_price,
  );
}
