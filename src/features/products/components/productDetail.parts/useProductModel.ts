"use client";
import { useMemo } from "react";
import { PLACEHOLDER, distributorOfferPrice, generateSlugFromName, getAverageRating, getTotalReviews, isPurchaseAllowedWithoutStock, parseJsonObject } from "./support";
import { distributorRetailReference } from "./pricing";

export function useProductModel(apiProduct: any, userAccountType: "retail" | "distributor") {
const apiComboProducts: any[] = useMemo(() => Array.isArray(apiProduct?.combo_products)
    ? apiProduct.combo_products
    : [], [apiProduct?.combo_products]);

const isCombo =
    String(apiProduct?.product_type ?? "").toLowerCase() === "combo" &&
    apiComboProducts.length > 0;

const comboItems = useMemo(() => {
    if (!isCombo) return [];

    const isDistributorUser = userAccountType === "distributor";

    return apiComboProducts.map((c: any) => {
      const imgs: string[] = Array.isArray(c?.images)
        ? [...c.images]
            .sort(
              (a: any, b: any) =>
                Number(a?.sort_order ?? 0) - Number(b?.sort_order ?? 0),
            )
            .map((img: any) => img?.image_url || img?.image)
            .filter(Boolean)
        : [];

      const primary =
        c?.images?.find((img: any) => img?.is_primary)?.image_url ||
        imgs[0] ||
        PLACEHOLDER;

      const galleryImages: string[] = Array.from(
        new Set([primary, ...imgs].filter(Boolean)),
      );

      const price = isDistributorUser
        ? distributorOfferPrice(
            c,
            Number(c?.distributor_price || c?.retail_price || 0),
          )
        : Number(c?.retail_price || 0);

      // Distributor: struck-through reference price = RETAIL price.
      const mrp = isDistributorUser
        ? distributorRetailReference(c)
        : Number(c?.retail_mrp || 0);

      const commission =
        c?.commission_value !== null &&
        c?.commission_value !== undefined &&
        Number.isFinite(Number(c.commission_value))
          ? Math.max(0, Number(c.commission_value))
          : null;

      return {
        id: c?.id,
        name: String(c?.name ?? ""),
        slug: c?.slug || generateSlugFromName(String(c?.name ?? "")),
        productCode: c?.product_code || "",
        primaryImage: primary as string,
        images: galleryImages,
        category: c?.category?.name || "",
        subcategory: c?.subcategory?.name || "",
        brand: c?.brand?.name || "",
        brandLogo: c?.brand?.logo || "",
        taxName: c?.tax_category?.name || "",
        taxRate:
          c?.tax_category?.rate !== undefined &&
          c?.tax_category?.rate !== null &&
          Number.isFinite(Number(c.tax_category.rate))
            ? Number(c.tax_category.rate)
            : null,
        price,
        mrp,
        commission,
      };
    });
  }, [isCombo, apiComboProducts, userAccountType]);

const manufacturingInfo = useMemo(() => {
    const spec = parseJsonObject(apiProduct?.specification);

    return {
      country: String(
        spec["Country of Origin:"] ??
          spec["Country of Origin"] ??
          spec["Country of Manufacture"] ??
          "India",
      ),

      manufacturedBy: String(
        spec["Manufactured By:"] ?? spec["Manufactured By"] ?? "Not available",
      ),

      marketedBy: String(
        spec["Marketed By:"] ?? spec["Marketed By"] ?? "Not available",
      ),
    };
  }, [apiProduct?.specification]);

const reviewsSummary =
    apiProduct?.reviews_summary ?? apiProduct?.reviews?.summary ?? null;

const reviewsList: any[] = useMemo(() => Array.isArray(apiProduct?.reviews?.data)
    ? apiProduct.reviews.data
    : Array.isArray(apiProduct?.reviews)
      ? apiProduct.reviews
      : [], [apiProduct?.reviews]);

const product = useMemo(() => apiProduct
    ? {
        id: apiProduct.id,

        name: apiProduct.name,

        slug: apiProduct.slug || generateSlugFromName(apiProduct.name),

        description: apiProduct.description,

        specification: apiProduct.specification,

        category: apiProduct.category?.name || "Uncategorized",

        categoryId: apiProduct.category_id || apiProduct.category?.id,

        productCode: apiProduct.product_code,

        retailMrp: Number(apiProduct.retail_mrp || 0),

        distributorMrp: Number(apiProduct.distributor_mrp || 0),

        retailPrice: Number(apiProduct.retail_price || 0),

        distributorPrice: Number(apiProduct.distributor_price || 0),

        commissionValue:
          apiProduct.commission_value !== null &&
          apiProduct.commission_value !== undefined &&
          Number.isFinite(Number(apiProduct.commission_value))
            ? Math.max(0, Number(apiProduct.commission_value))
            : null,

        price:
          userAccountType === "distributor"
            ? distributorOfferPrice(
                apiProduct,
                Number(
                  apiProduct.distributor_price || apiProduct.retail_price || 0,
                ),
              )
            : Number(apiProduct.retail_price || 0),

        // Distributor: struck-through price = RETAIL price.
        mrp:
          userAccountType === "distributor"
            ? distributorRetailReference(apiProduct)
            : Number(apiProduct.retail_mrp || 0),

        originalPrice:
          userAccountType === "distributor"
            ? distributorRetailReference(apiProduct)
            : Number(apiProduct.retail_mrp || 0),

        discount:
          userAccountType === "distributor"
            ? (() => {
                const mrp = distributorRetailReference(apiProduct);

                const price = distributorOfferPrice(
                  apiProduct,
                  Number(
                    apiProduct.distributor_price ||
                      apiProduct.retail_price ||
                      0,
                  ),
                );

                return mrp > price && price > 0
                  ? Math.round(((mrp - price) / mrp) * 100)
                  : null;
              })()
            : (() => {
                const mrp = Number(apiProduct.retail_mrp || 0);

                const price = Number(apiProduct.retail_price || 0);

                return mrp > price && price > 0
                  ? Math.round(((mrp - price) / mrp) * 100)
                  : null;
              })(),

        image:
          apiProduct.primary_image_url ||
          apiProduct.images?.[0]?.image_url ||
          PLACEHOLDER,

        images: apiProduct.images || [],

        // Correct rating source from API.
        rating: getAverageRating(reviewsSummary),

        // Correct review count from API.
        reviews: getTotalReviews(reviewsSummary),

        allowedWithoutStock: isPurchaseAllowedWithoutStock(apiProduct),
        inStock:
          isPurchaseAllowedWithoutStock(apiProduct) ||
          Number(apiProduct.stock_quantity ?? 0) > 0,

        stockQuantity: Number(apiProduct.stock_quantity ?? 0),

        isLowStock:
          !isPurchaseAllowedWithoutStock(apiProduct) &&
          Number(apiProduct.stock_quantity ?? 0) > 0 &&
          Number(apiProduct.stock_quantity ?? 0) <=
            Number(apiProduct.low_stock_threshold ?? 10),

        lowStockThreshold: Number(apiProduct.low_stock_threshold || 10),
      }
    : null, [apiProduct, userAccountType, reviewsSummary]);

const productGallery = useMemo(() => {
    if (!product) return [];

    const images = Array.isArray(product.images)
      ? product.images
          .map((img: any) => img?.image_url || img?.image)
          .filter(Boolean)
      : [];

    return Array.from(
      new Set([product.image, ...images].filter(Boolean)),
    ) as string[];
  }, [product]);

const comboTotals = useMemo(() => {
    if (!isCombo) return null;

    const sumPrice = comboItems.reduce((acc, i) => acc + i.price, 0);
    const sumMrp = comboItems.reduce((acc, i) => acc + i.mrp, 0);
    const sumCommission = comboItems.reduce(
      (acc, i) => acc + (i.commission ?? 0),
      0,
    );

    const comboPrice = product?.price ?? 0;
    const savings = sumPrice > comboPrice ? sumPrice - comboPrice : 0;

    return {
      sumPrice,
      sumMrp,
      sumCommission,
      comboPrice,
      savings,
    };
  }, [isCombo, comboItems, product?.price]);


return {
    isCombo,
    comboItems,
    manufacturingInfo,
    reviewsSummary,
    reviewsList,
    product,
    productGallery,
    comboTotals,
  };
}
export type ProductModel = ReturnType<typeof useProductModel>;
