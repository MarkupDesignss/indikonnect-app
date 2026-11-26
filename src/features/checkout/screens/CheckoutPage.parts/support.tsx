"use client";

import { SiAxisbank, SiHdfcbank, SiRazorpay } from "react-icons/si";
import { type HdfcApiResult } from "@/lib/redux/api/checkoutApi";


export interface CheckoutSummaryItem {
  product_id: number;
  allowed_purchsed?: number | string | boolean | null;
  cart_item_id?: number | null;
  cartItemId?: number | null;
  cart_item?: { id?: number | null } | null;
  variant_id?: number | null;
  variant?: { id?: number | null; stock_quantity?: number | null } | null;
  product?: {
    allowed_purchsed?: number | string | boolean | null;
    stock_quantity?: number | null;
    available_stock?: number | null;
    commission_value?: string | number | null;
  } | null;
  stock_quantity?: number | null;
  available_stock?: number | null;
  variant_stock_quantity?: number | null;
  max_stock?: number | null;
  product_name: string;
  product_code: string;
  quantity: number;
  unit_price: number;
  tax_category: string;
  tax_rate: string;
  taxable_value: number;
  cgst: number;
  sgst: number;
  igst: number;
  total_tax: number;
  line_total: number;

  commission_value?: string | number | null;
  commission_total?: string | number | null;

  primary_image?: string;
  images?: {
    id: number;
    image: string;
    image_url: string;
    is_primary: boolean;
    sort_order: number;
  }[];
}


export interface CheckoutSummaryData {
  checkout_type?: "cart" | "buy_now";
  subtotal: number;
  coupon_discount: number;
  subtotal_after_discount: number;
  total_tax: number;
  shipping_cost: number;         // ✅ Shipping charge
  service_charge?: number;       // ✅ Service charge (NEW — separate field)
  subtotal_after_discount_and_tax: number;
  grand_total: number;
  items: CheckoutSummaryItem[];

  total_commission?: string | number | null;

  product_tax_breakdown?: Record<string, any>;
  tax_by_category?: {
    category: string;
    rate: string;
    taxable_amount: number;
    tax_amount: number;
    cgst: number;
    sgst: number;
    igst: number;
    is_gst: boolean;
  }[];
  tax_breakdown?: any[];
}

export interface RazorpayOrderData {
  orderId: number;
  orderReference: string;
  amount: number;
  razorpayOrderId: string;
  razorpayKey: string;
}


export type PaymentGatewayId =
  "freecharge-axis" | "hdfc-ie" | "hdfc-sg" | "razorpay-axis";


export type PaymentGatewayKind = "razorpay" | "hdfc" | "axispg";


export interface PaymentGatewayOption {
  id: PaymentGatewayId;
  settingKey: string;
  title: string;
  description: string;
  paymentGateway: "axispg" | "razorpay" | "hdfc_ie" | "hdfc_sg";
  kind: PaymentGatewayKind;
  icon: "axis" | "hdfc" | "razorpay";
  tag?: string;
}


// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

export const INK = "#111827";


// The backend returns the signed Axis PG fields in `axispg_checkout`.
// Keep sandbox as the safe default. Set NEXT_PUBLIC_AXISPG_ENV=production
// in the production deployment only after production merchant credentials are enabled.
export const AXISPG_ENDPOINTS = {
  sandbox: "https://sandbox-axispg.freecharge.in/payment/v1/checkout",
  production: "https://axispg.freecharge.in/payment/v1/checkout",
} as const;


export type AxisPgPaymentTarget = {
  window: Window;
};


export const PAYMENT_GATEWAY_OPTIONS: PaymentGatewayOption[] = [
  {
    id: "freecharge-axis",
    settingKey: "Freecharge(Axis)",
    title: "Freecharge",
    description: "Pay securely via Freecharge checkout gateway.",
    paymentGateway: "axispg",
    kind: "axispg",
    icon: "axis",
    tag: "Axis",
  },
  {
    id: "hdfc-ie",
    settingKey: "HDFC_IE",
    title: "HDFC Bank",
    description: "Pay securely via HDFC SmartGateway (Merchant 1).",
    paymentGateway: "hdfc_ie",
    kind: "hdfc",
    icon: "hdfc",
    tag: "India",
  },
  {
    id: "hdfc-sg",
    settingKey: "HDFC_SG",
    title: "HDFC Bank",
    description: "Pay securely via HDFC SmartGateway (Merchant 2).",
    paymentGateway: "hdfc_sg",
    kind: "hdfc",
    icon: "hdfc",
    tag: "Singapore",
  },
  {
    id: "razorpay-axis",
    settingKey: "Razorpay (Axis)",
    title: "Razorpay",
    description: "Pay securely via Razorpay checkout gateway.",
    paymentGateway: "razorpay",
    kind: "razorpay",
    icon: "razorpay",
    tag: "Axis",
  },
];


// ─────────────────────────────────────────────────────────────────────────────
// Utility helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Open the payment tab synchronously from the Place Order / Retry click.
 * This avoids popup blockers after the checkout API request has completed.
 */
export function openAxisPgPaymentTab(): AxisPgPaymentTarget | null {
  const paymentWindow = window.open("", "_blank");

  if (!paymentWindow) return null;

  try {
    // Do not let the external payment page access the checkout window.
    paymentWindow.opener = null;
    paymentWindow.document.title = "Secure Freecharge Payment";

    const message = paymentWindow.document.createElement("div");
    message.textContent = "Preparing your secure Freecharge payment...";
    message.style.cssText =
      "display:flex;min-height:100vh;align-items:center;justify-content:center;padding:24px;box-sizing:border-box;font:500 16px Arial,sans-serif;color:#173e2b;background:#f7faf8;text-align:center";
    paymentWindow.document.body.replaceChildren(message);
  } catch {
    // The payment tab can still be targeted even if its temporary message fails.
  }

  return { window: paymentWindow };
}


export function closeAxisPgPaymentTab(target: AxisPgPaymentTarget | null): void {
  if (!target) return;

  try {
    if (!target.window.closed) target.window.close();
  } catch {
    // Ignore browser errors while closing a temporary payment tab.
  }
}


export function getAxisPgFields(checkoutPayload: unknown): Array<{ name: string; value: string }> {
  let checkout: unknown = checkoutPayload;

  if (typeof checkout === "string") {
    try {
      checkout = JSON.parse(checkout);
    } catch {
      throw new Error("The Axis PG checkout payload returned by the server is not valid JSON.");
    }
  }

  if (!checkout || typeof checkout !== "object" || Array.isArray(checkout)) {
    throw new Error("Axis PG checkout details were not returned in the expected format.");
  }

  const checkoutObject = checkout as Record<string, unknown>;

  // Some gateway integrations return a single encrypted field.
  if (typeof checkoutObject.encData === "string" && checkoutObject.encData.trim()) {
    return [{ name: "encData", value: checkoutObject.encData }];
  }

  // Also support the payload wrapper documented in the backend test page.
  const source =
    checkoutObject.payload &&
    typeof checkoutObject.payload === "object" &&
    !Array.isArray(checkoutObject.payload)
      ? (checkoutObject.payload as Record<string, unknown>)
      : checkoutObject;

  const fields = Object.entries(source)
    .filter(([name, value]) =>
      /^[A-Za-z][A-Za-z0-9_]*$/.test(name) &&
      value !== null &&
      value !== undefined &&
      ["string", "number", "boolean"].includes(typeof value),
    )
    .map(([name, value]) => ({ name, value: String(value) }));

  if (fields.length === 0) {
    throw new Error("No valid Axis PG fields were found in axispg_checkout.");
  }

  return fields;
}


export const formatPrice = (value: any): string => {
  const amount = Number(value || 0);

  return `${amount.toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
};


export const formatPoints = (value: number): string =>
  Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });


export const getErrorMessage = (error: any, fallback: string): string =>
  error?.data?.message ||
  error?.error?.data?.message ||
  error?.data?.error ||
  error?.message ||
  fallback;


export const pickCommissionValue = (source: any): number | null => {
  if (!source || typeof source !== "object") return null;

  const candidates = [
    source.commission_value,
    source.commision_value,
    source.commission,
    source.commission_amount,
    source.product?.commission_value,
    source.product?.commission,
    source.product?.commission_amount,
    source.variant?.commission_value,
    source.variant?.commission,
  ];

  for (const c of candidates) {
    if (c === null || c === undefined || c === "") continue;
    const n = Number(c);
    if (Number.isFinite(n) && n > 0) return n;
  }

  return null;
};


// The backend intentionally names this field `allowed_purchsed`.
// Only an explicit 1 / true permits bypassing stock checks.
export const allowsPurchaseWithoutStock = (value: unknown): boolean =>
  value === true || value === 1 || value === "1";


export const findSummaryBreakdown = (
  summaryData: CheckoutSummaryData | undefined,
  productId: number,
  variantId?: number | null,
): any | undefined => {
  const entries = Object.values(summaryData?.product_tax_breakdown || {});
  return entries.find((entry: any) =>
    Number(entry?.product_id) === Number(productId) &&
    (variantId == null || Number(entry?.variant_id || 0) === Number(variantId || 0)),
  ) ?? entries.find((entry: any) => Number(entry?.product_id) === Number(productId));
};


export const isStockBypassEnabled = (
  summaryData: CheckoutSummaryData | undefined,
  productId: number,
  cartItems: any[] = [],
  variantId?: number | null,
): boolean => {
  const breakdown = findSummaryBreakdown(summaryData, productId, variantId);
  if (breakdown?.allowed_purchsed !== undefined && breakdown?.allowed_purchsed !== null) {
    return allowsPurchaseWithoutStock(breakdown.allowed_purchsed);
  }
  const summaryItem = summaryData?.items?.find((item) =>
    Number(item.product_id) === Number(productId) &&
    (variantId == null || Number(item.variant_id || 0) === Number(variantId || 0)),
  );
  const itemFlag = summaryItem?.allowed_purchsed ?? summaryItem?.product?.allowed_purchsed;
  if (itemFlag !== undefined && itemFlag !== null) return allowsPurchaseWithoutStock(itemFlag);

  const cartLine = cartItems.find((item: any) =>
    Number(item?.product_id) === Number(productId) &&
    (variantId == null || Number(item?.variant_id || 0) === Number(variantId || 0)),
  );
  return allowsPurchaseWithoutStock(cartLine?.allowed_purchsed ?? cartLine?.product?.allowed_purchsed);
};


export const normalizeSummaryItems = (
  summaryData?: CheckoutSummaryData,
  cartLines?: any[],
): CheckoutSummaryItem[] => {
  if (!summaryData) return [];

  const breakdown = summaryData.product_tax_breakdown || {};

  const findBreakdownForProduct = (productId: number) => {
    return Object.values(breakdown).find(
      (b: any) => Number(b?.product_id) === Number(productId),
    ) as any;
  };

  const findCartLineForProduct = (productId: number) => {
    if (!Array.isArray(cartLines)) return undefined;
    return cartLines.find((l) => Number(l?.product_id) === Number(productId));
  };

  if (Array.isArray(summaryData.items) && summaryData.items.length > 0) {
    return summaryData.items.map((raw: any) => {
      const productId = Number(raw?.product_id);

      const breakdownItem = findBreakdownForProduct(productId);
      const cartLine = findCartLineForProduct(productId);

      const commissionValue =
        pickCommissionValue(raw) ??
        pickCommissionValue(breakdownItem) ??
        pickCommissionValue(cartLine);

      const quantity = Number(raw?.quantity || 1);

      const commissionTotal =
        commissionValue !== null ? commissionValue * quantity : null;

      return {
        ...raw,
        allowed_purchsed:
          breakdownItem?.allowed_purchsed ??
          raw?.allowed_purchsed ??
          raw?.product?.allowed_purchsed ??
          cartLine?.product?.allowed_purchsed ??
          cartLine?.allowed_purchsed ??
          0,
        commission_value: commissionValue,
        commission_total: commissionTotal,
      };
    });
  }

  return Object.values(breakdown).map((product: any) => {
    const productId = Number(product?.product_id);
    const cartLine = findCartLineForProduct(productId);

    const commissionValue =
      pickCommissionValue(product) ?? pickCommissionValue(cartLine);

    const quantity = Number(product.quantity || 1);

    const commissionTotal =
      commissionValue !== null ? commissionValue * quantity : null;

    return {
      product_id: product.product_id ?? 0,
      allowed_purchsed:
        product.allowed_purchsed ??
        cartLine?.product?.allowed_purchsed ??
        cartLine?.allowed_purchsed ??
        0,
      cart_item_id: product.cart_item_id ?? product.cart_item?.id ?? null,
      cartItemId: product.cartItemId ?? null,
      cart_item: product.cart_item ?? null,
      variant_id: product.variant_id ?? product.variant?.id ?? null,
      variant: product.variant ?? null,
      product: product.product ?? null,
      stock_quantity: product.stock_quantity ?? null,
      available_stock: product.available_stock ?? null,
      variant_stock_quantity: product.variant_stock_quantity ?? null,
      max_stock: product.max_stock ?? null,
      product_name: product.product_name,
      product_code: product.product_code,
      quantity,
      unit_price: product.unit_price || 0,
      tax_category: product.tax_category,
      tax_rate: product.tax_rate,
      taxable_value: product.taxable_value || 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      total_tax: product.tax_amount || 0,
      line_total: product.line_total_after_tax || product.unit_price * quantity,
      commission_value: commissionValue,
      commission_total: commissionTotal,
      primary_image: product.primary_image,
      images: product.images || [],
    };
  });
};


export const getItemImage = (item: {
  primary_image?: string;
  images?: { image_url: string; is_primary: boolean }[];
}) =>
  item.primary_image ||
  item.images?.find((img) => img.is_primary)?.image_url ||
  item.images?.[0]?.image_url ||
  null;


export const getInitialGatewayId = (value: unknown): PaymentGatewayId => {
  const code = String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

  if (code === "HDFC_IE") return "hdfc-ie";
  if (code === "HDFC_SG" || code === "HDFC") return "hdfc-sg";
  // Freecharge uses the separate Axis PG checkout flow, not Razorpay.
  if (code.includes("FREECHARGE") || code.includes("AXISPG")) {
    return "freecharge-axis";
  }
  if (code.includes("RAZORPAY")) return "razorpay-axis";
  if (code.includes("AXIS")) return "razorpay-axis";

  return "freecharge-axis";
};


// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

export function GatewayBrandIcon({
  icon,
  className = "",
}: {
  icon: PaymentGatewayOption["icon"];
  className?: string;
}) {
  if (icon === "hdfc") {
    return <SiHdfcbank aria-hidden="true" className={className} />;
  }

  if (icon === "razorpay") {
    return <SiRazorpay aria-hidden="true" className={className} />;
  }

  return <SiAxisbank aria-hidden="true" className={className} />;
}


export function CheckoutSkeleton() {
  return (
    <div className="animate-pulse space-y-2">
      <div className="h-3 w-1/3 rounded bg-[#eeeeec]" />
      <div className="h-3 w-2/3 rounded bg-[#eeeeec]" />
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

export function getSafeHdfcUrl(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("HDFC payment URL is unavailable. Please try again.");
  }

  const url = new URL(value);

  if (
    url.protocol !== "https:" ||
    url.hostname !== "smartgateway.hdfc.bank.in"
  ) {
    throw new Error("Unexpected HDFC payment destination.");
  }

  return url.href;
}


export function unwrapHdfc(result: HdfcApiResult): HdfcApiResult {
  return result.data && typeof result.data === "object" ? result.data : result;
}
