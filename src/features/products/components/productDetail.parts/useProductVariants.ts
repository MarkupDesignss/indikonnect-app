"use client";
import { useMemo } from "react";
import { parseJsonObject, isPurchaseAllowedWithoutStock, getVariantImageUrl, getVariantGalleryImages } from "./support";
import type { ProductModel } from "./useProductModel";

export function useProductVariants(apiProduct: any, product: ProductModel['product'], productGallery: string[], selectedVariantId: number | string | null) {
const variantEntries = useMemo(() => {
    if (!Array.isArray(apiProduct?.variants)) return [];

    return apiProduct.variants
      .filter((variant: any) => variant?.is_active !== false)
      .map((variant: any) => ({
        ...variant,
        parsedAttributes: parseJsonObject(variant?.attributes),
      }));
  }, [apiProduct?.variants]);

const hasVariants = variantEntries.length > 0;

const apiAvailableAttributes = useMemo(() => parseJsonObject(
    apiProduct?.available_attributes,
  ), [apiProduct?.available_attributes]);

const variantAttributeOptions = useMemo<Record<string, string[]>>(() => {
    const result: Record<string, string[]> = {};

    Object.entries(apiAvailableAttributes).forEach(([key, values]) => {
      if (Array.isArray(values)) {
        result[key] = values.map((value) => String(value)).filter(Boolean);
      }
    });

    if (Object.keys(result).length === 0) {
      variantEntries.forEach((variant: any) => {
        const attrs = variant?.parsedAttributes || {};

        Object.entries(attrs).forEach(([key, value]) => {
          if (!result[key]) {
            result[key] = [];
          }

          const stringValue = String(value);

          if (stringValue && !result[key].includes(stringValue)) {
            result[key].push(stringValue);
          }
        });
      });
    }

    return result;
  }, [apiAvailableAttributes, variantEntries]);

const displayVariants = useMemo(() => {
    if (!product) return [];

    const mainProduct = {
      id: "main-product",

      isMainProduct: true,

      slug: product.slug,

      hax_color: /rose[\s-]*gold/i.test(product.name)
        ? "#E3AF90"
        : /steel|silver/i.test(product.name)
          ? "#C0C0C0"
          : /gold/i.test(product.name)
            ? "#D6AD60"
            : "#B6B6B6",

      name: product.name,

      primary_image_url: product.image,

      images: productGallery.map((image: string, index: number) => ({
        id: `main-${index}`,
        image_url: image,
        is_primary: index === 0,
      })),

      parsedAttributes: {},

      attributes: {},
    };

    return [mainProduct, ...variantEntries];
  }, [product, productGallery, variantEntries]);

const isMainProductSelected = selectedVariantId === null;

const selectedVariant = useMemo(() => {
    if (isMainProductSelected) return null;

    return (
      variantEntries.find(
        (variant: any) => String(variant.id) === String(selectedVariantId),
      ) || null
    );
  }, [isMainProductSelected, selectedVariantId, variantEntries]);

const selectedAllowsPurchaseWithoutStock = selectedVariant
    ? isPurchaseAllowedWithoutStock(selectedVariant) ||
      (selectedVariant.allowed_purchsed == null &&
        Boolean(product?.allowedWithoutStock))
    : Boolean(product?.allowedWithoutStock);

const mainPurchaseAvailable =
    selectedAllowsPurchaseWithoutStock ||
    (selectedVariant?.stock_quantity != null
      ? Number(selectedVariant.stock_quantity) > 0
      : Boolean(product?.stockQuantity && product.stockQuantity > 0));

const selectedVariantImage = selectedVariant
    ? getVariantImageUrl(selectedVariant)
    : null;

const selectedVariantGallery = useMemo(() => {
    if (!selectedVariant) return [];

    return getVariantGalleryImages(selectedVariant);
  }, [selectedVariant]);

const gallery = useMemo(() => {
    if (!product) return [];

    if (!isMainProductSelected && selectedVariantGallery.length > 0) {
      return selectedVariantGallery;
    }

    if (!isMainProductSelected && selectedVariantImage) {
      return [selectedVariantImage];
    }

    return productGallery;
  }, [
    product,
    isMainProductSelected,
    selectedVariantGallery,
    selectedVariantImage,
    productGallery,
  ]);


return {
    variantEntries,
    hasVariants,
    variantAttributeOptions,
    displayVariants,
    isMainProductSelected,
    selectedVariant,
    selectedAllowsPurchaseWithoutStock,
    mainPurchaseAvailable,
    gallery,
  };
}
