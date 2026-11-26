"use client";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";
import Logo from "../../../../public/indiekonnect-web/images/logo.png";
// =====================================================
// CONFIGURATION
// =====================================================
type InvoiceRecord = Record<string, any>;
type RGB = [number, number, number];
const LOGO_PATHS = [
  Logo.src,
  "/indiekonnect-web/images/logo.png",
  "/images/logo.png",
  "/logo.png",
];
const INK: RGB = [30, 30, 30];
const GRAY: RGB = [95, 95, 95];
const BORDER: RGB = [75, 75, 75];
const LIGHT: RGB = [242, 242, 242];
// =====================================================
// COMMON HELPERS
// =====================================================
const isPresent = (value: any): boolean =>
  value !== undefined && value !== null && String(value).trim() !== "";
const firstValue = (...values: any[]): any => values.find(isPresent);
const safeText = (value: any, fallback = "-"): string =>
  isPresent(value) ? String(value).trim() : fallback;
const toNumber = (value: any): number | null => {
  if (!isPresent(value)) return null;
  const number = Number(String(value).replace(/[,₹]/g, "").trim());
  return Number.isFinite(number) ? number : null;
};
const formatMoney = (value: any): string => {
  const number = toNumber(value);
  if (number === null) return "-";
  return number.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
const formatDate = (value: any): string => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
};
const prettyStatus = (value: any): string =>
  safeText(value)
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
// =====================================================
// LOGO HELPERS
// =====================================================
const loadImageAsBase64 = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas unavailable"));
          return;
        }
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } catch (error) {
        reject(error);
      }
    };
    img.onerror = () => reject(new Error(`Unable to load logo: ${url}`));
    img.src = url;
  });
};
const loadLogo = async (): Promise<string | null> => {
  for (const path of LOGO_PATHS) {
    try {
      if (path) return await loadImageAsBase64(path);
    } catch {
      continue;
    }
  }
  return null;
};
// =====================================================
// INVOICE DATA NORMALIZATION
// =====================================================
const normalizeInvoiceResponse = (response: any) => {
  const root = response || {};
  const payload = [root?.data?.data, root?.data, root].find(
    (candidate) => candidate?.invoice,
  );
  if (!payload) throw new Error("Invoice information not found.");
  const invoice = payload.invoice || {};
  const order = payload.order || {};
  const rawItems = firstValue(
    invoice.invoice_items,
    invoice.line_items,
    invoice.items,
    order.order_items,
    order.items,
    order.order_lines,
  );
  const invoiceType = firstValue(
    root.invoice_type,
    root.data?.invoice_type,
    payload.invoice_type,
    invoice.invoice_type,
    order.order_items && !Array.isArray(order.order_items)
      ? "single_item"
      : undefined,
    "complete",
  );
  const scopedItems =
    String(invoiceType).toLowerCase() === "single_item"
      ? firstValue(
          invoice.invoice_items,
          invoice.line_items,
          invoice.items,
          order.order_items && !Array.isArray(order.order_items)
            ? order.order_items
            : undefined,
          Array.isArray(order.order_items) && order.order_items.length === 1
            ? order.order_items
            : undefined,
        )
      : rawItems;
  const items = normalizeItems(scopedItems);
  return { invoice, order, items, invoiceType };
};
const normalizeItems = (value: any): InvoiceRecord[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.filter((item) => item && typeof item === "object");
  }
  if (typeof value === "string") {
    try {
      return normalizeItems(JSON.parse(value));
    } catch {
      return [];
    }
  }
  if (typeof value === "object") return [value];
  return [];
};
// =====================================================
// ADDRESS HELPERS
// =====================================================
const formatAddress = (address: any): string => {
  if (!address) return "-";
  if (typeof address === "string") return address;
  const parts = [
    address.address_line_1,
    address.address_line_2,
    address.landmark,
    address.post_office,
    address.city,
    address.district,
    address.state,
    address.pincode,
    address.country,
  ]
    .filter(isPresent)
    .map((part) => String(part).trim());
  return [...new Set(parts)].join(", ") || safeText(address.full_address);
};
// =====================================================
// AMOUNT IN WORDS - INDIAN FORMAT
// =====================================================
const SMALL = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];
const TENS = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];
const numberToWords = (number: number): string => {
  const n = Math.floor(Math.abs(number));
  if (n === 0) return "Zero";
  if (n < 20) return SMALL[n];
  if (n < 100) {
    return [TENS[Math.floor(n / 10)], n % 10 ? SMALL[n % 10] : ""]
      .filter(Boolean)
      .join(" ");
  }
  const units: [number, string][] = [
    [10000000, "Crore"],
    [100000, "Lakh"],
    [1000, "Thousand"],
    [100, "Hundred"],
  ];
  for (const [value, label] of units) {
    if (n >= value) {
      return [
        numberToWords(Math.floor(n / value)),
        label,
        n % value ? numberToWords(n % value) : "",
      ]
        .filter(Boolean)
        .join(" ");
    }
  }
  return "";
};
const amountInWords = (value: any): string => {
  const amount = toNumber(value);
  if (amount === null) return "Not available";
  const totalPaise = Math.round(Math.abs(amount) * 100);
  const rupees = Math.floor(totalPaise / 100);
  const paise = totalPaise % 100;
  return [
    amount < 0 ? "Minus" : "",
    "Rupees",
    numberToWords(rupees),
    paise ? `and ${numberToWords(paise)} Paise` : "",
    "Only",
  ]
    .filter(Boolean)
    .join(" ");
};
// =====================================================
// FINANCIAL HELPERS - ALL CALCULATIONS IN PAISE
// =====================================================
// Integer paise arithmetic avoids floating-point drift in invoice totals.
const toPaise = (value: any): number | null => {
  const amount = toNumber(value);
  return amount === null ? null : Math.round(amount * 100);
};
const fromPaise = (value: number | null | undefined): number | null =>
  value === null || value === undefined ? null : value / 100;
const formatPaise = (value: number | null | undefined): string =>
  value === null || value === undefined ? "-" : formatMoney(value / 100);
const firstPaise = (...values: any[]): number | null => {
  for (const value of values) {
    const parsed = toPaise(value);
    if (parsed !== null) return parsed;
  }
  return null;
};
const sumPaiseValues = (
  values: Array<number | null | undefined>,
): number | null => {
  const present = values.filter(
    (value): value is number => value !== null && value !== undefined,
  );
  return present.length ? present.reduce((sum, value) => sum + value, 0) : null;
};
const multiplyAmountPaise = (unitAmount: any, quantity: any): number | null => {
  const unitPaise = toPaise(unitAmount);
  const qty = toNumber(quantity);
  if (unitPaise === null || qty === null) return null;
  return Math.round(unitPaise * qty);
};
interface ItemFinancials {
  productTaxablePaise: number | null;
  productGrossPaise: number | null;
  cgstPaise: number | null;
  sgstPaise: number | null;
  utgstPaise: number | null;
  igstPaise: number | null;
  productGstPaise: number | null;
  shippingTaxablePaise: number | null;
  shippingGstPaise: number | null;
  shippingGrossPaise: number | null;
  shippingCgstPaise: number | null;
  shippingSgstPaise: number | null;
  shippingUtgstPaise: number | null;
  shippingIgstPaise: number | null;
  shippingSplitStatus: "recorded" | "calculated" | "unavailable";
}
const getItemFinancials = (item: InvoiceRecord): ItemFinancials => {
  const quantity = firstValue(item.quantity, 1);
  const cgstPaise = toPaise(item.cgst_amount);
  const sgstPaise = toPaise(item.sgst_amount);
  const utgstPaise = toPaise(item.utgst_amount);
  const igstPaise = toPaise(item.igst_amount);
  const hasTaxComponents = [
    item.cgst_amount,
    item.sgst_amount,
    item.utgst_amount,
    item.igst_amount,
  ].some(isPresent);
  let productTaxablePaise = firstPaise(
    item.line_price_excl_gst,
    multiplyAmountPaise(item.price_excl_gst, quantity) === null
      ? null
      : multiplyAmountPaise(item.price_excl_gst, quantity)! / 100,
  );
  const componentProductGst = hasTaxComponents
    ? (cgstPaise ?? 0) + (sgstPaise ?? 0) + (utgstPaise ?? 0) + (igstPaise ?? 0)
    : null;
  let productGstPaise = componentProductGst ?? firstPaise(item.line_gst_amount);
  const productGrossPaise = firstPaise(
    item.line_price_incl_gst,
    item.price_incl_gst !== undefined && item.price_incl_gst !== null
      ? multiplyAmountPaise(item.price_incl_gst, quantity) === null
        ? null
        : multiplyAmountPaise(item.price_incl_gst, quantity)! / 100
      : null,
    productTaxablePaise !== null && productGstPaise !== null
      ? (productTaxablePaise + productGstPaise) / 100
      : null,
  );
  if (
    productGstPaise === null &&
    productGrossPaise !== null &&
    productTaxablePaise !== null
  )
    productGstPaise = productGrossPaise - productTaxablePaise;
  if (
    productTaxablePaise === null &&
    productGrossPaise !== null &&
    productGstPaise !== null
  )
    productTaxablePaise = productGrossPaise - productGstPaise;
  let shippingTaxablePaise = firstPaise(
    item.shipping_excl_gst,
    item.shipping_per_unit_excl_gst !== undefined
      ? multiplyAmountPaise(item.shipping_per_unit_excl_gst, quantity) === null
        ? null
        : multiplyAmountPaise(item.shipping_per_unit_excl_gst, quantity)! / 100
      : null,
  );
  const explicitShippingGstPaise = toPaise(item.shipping_gst_amount);
  const explicitShippingGrossPaise = firstPaise(
    item.shipping_incl_gst,
    item.shipping_per_unit_incl_gst !== undefined
      ? multiplyAmountPaise(item.shipping_per_unit_incl_gst, quantity) === null
        ? null
        : multiplyAmountPaise(item.shipping_per_unit_incl_gst, quantity)! / 100
      : null,
  );
  const shippingGstPaise =
    explicitShippingGstPaise ??
    (explicitShippingGrossPaise !== null && shippingTaxablePaise !== null
      ? explicitShippingGrossPaise - shippingTaxablePaise
      : null);
  const shippingGrossPaise =
    explicitShippingGrossPaise ??
    (shippingTaxablePaise !== null && shippingGstPaise !== null
      ? shippingTaxablePaise + shippingGstPaise
      : null);
  if (
    shippingTaxablePaise === null &&
    shippingGrossPaise !== null &&
    shippingGstPaise !== null
  )
    shippingTaxablePaise = shippingGrossPaise - shippingGstPaise;
  // Prefer recorded shipping components. Derive only when no component was
  // supplied and the product has an unambiguous tax pattern. Derived tax
  // components require confirmation before issuance of a final tax invoice.
  type Split = [number | null, number | null, number | null, number | null];
  const recorded: Split = [
    item.shipping_cgst_amount,
    item.shipping_sgst_amount,
    item.shipping_utgst_amount,
    item.shipping_igst_amount,
  ].map(toPaise) as Split;
  let split: Split = [null, null, null, null];
  let shippingSplitStatus: ItemFinancials["shippingSplitStatus"] =
    "unavailable";
  const supplied = recorded.some((v) => v !== null);
  if (shippingGstPaise !== null && shippingGstPaise >= 0) {
    if (
      supplied &&
      recorded.every((v) => v === null || v >= 0) &&
      recorded.reduce<number>((total, v) => total + (v ?? 0), 0) ===
        shippingGstPaise
    ) {
      split = recorded.map((v) => v ?? 0) as Split;
      shippingSplitStatus = "recorded";
    } else if (!supplied && shippingGstPaise === 0) {
      split = [0, 0, 0, 0];
      shippingSplitStatus = "recorded";
    } else if (!supplied) {
      const c = cgstPaise ?? 0,
        s = sgstPaise ?? 0;
      const u = utgstPaise ?? 0,
        i = igstPaise ?? 0;
      const half = Math.round(shippingGstPaise / 2);
      if (i > 0 && c === 0 && s === 0 && u === 0) {
        split = [0, 0, 0, shippingGstPaise];
      } else if (c > 0 && s > 0 && u === 0 && i === 0) {
        split = [half, shippingGstPaise - half, 0, 0];
      } else if (c > 0 && u > 0 && s === 0 && i === 0) {
        split = [half, 0, shippingGstPaise - half, 0];
      }
      if (split[0] !== null) shippingSplitStatus = "calculated";
    }
  }
  return {
    productTaxablePaise,
    productGrossPaise,
    cgstPaise,
    sgstPaise,
    utgstPaise,
    igstPaise,
    productGstPaise,
    shippingTaxablePaise,
    shippingGstPaise,
    shippingGrossPaise,
    shippingCgstPaise: split[0],
    shippingSgstPaise: split[1],
    shippingUtgstPaise: split[2],
    shippingIgstPaise: split[3],
    shippingSplitStatus,
  };
};
// A missing line is not zero; never use a partial sum as an invoice total.
const sumComplete = (values: (number | null)[]): number | null =>
  values.length && values.every((v) => v !== null)
    ? values.reduce<number>((sum, v) => sum + v!, 0)
    : null;
const mismatchPaise = (a: number | null, b: number | null): boolean =>
  a !== null && b !== null && a !== b;

// Invoice lines are authoritative for product and shipping amounts. Header totals
// are reconciliation inputs only; a difference is never a charge or a discount.
const calculateInvoice = (invoice: InvoiceRecord, items: InvoiceRecord[]) => {
  const itemFinancials = items.map(getItemFinancials);
  const sum = (field: Exclude<keyof ItemFinancials, "shippingSplitStatus">) =>
    sumComplete(itemFinancials.map((row) => row[field]));
  const productTaxablePaise = sum("productTaxablePaise");
  const productGstPaise = sum("productGstPaise");
  const productGrossPaise = sum("productGrossPaise");
  const shippingTaxablePaise = sum("shippingTaxablePaise");
  const shippingGstPaise = sum("shippingGstPaise");
  const shippingTotalPaise = sum("shippingGrossPaise");
  const itemsTotalPaise =
    productGrossPaise !== null && shippingTotalPaise !== null
      ? productGrossPaise + shippingTotalPaise
      : null;
  const recordedPayablePaise = toPaise(invoice.total_payable);
  const recordedShippingPaise = toPaise(invoice.shipping_charge);
  const before = toPaise(invoice.subtotal_before_redemption);
  const after = toPaise(invoice.subtotal_after_discount);
  const coupon = Math.abs(toPaise(invoice.coupon_discount) ?? 0);
  const coins = Math.abs(toPaise(invoice.coin_redeemed) ?? 0);
  // Apply deductions only when the header's product/shipping scope and net
  // payable agree with these exact lines. Never allocate an order-wide deduction.
  const couponSeparate =
    coupon > 0 &&
    productGrossPaise !== null &&
    before === productGrossPaise &&
    after === productGrossPaise - coupon;
  const couponIncluded =
    coupon > 0 &&
    productGrossPaise !== null &&
    after === productGrossPaise &&
    before === productGrossPaise + coupon;
  const headerProductMatches =
    productGrossPaise !== null &&
    (couponSeparate ||
      couponIncluded ||
      (coupon === 0 &&
        (before === null || before === productGrossPaise) &&
        (after === null || after === productGrossPaise)));
  const proposedCoupon = couponSeparate ? coupon : 0;
  const proposedPayable =
    itemsTotalPaise === null ? null : itemsTotalPaise - proposedCoupon - coins;
  const deductionsVerified =
    headerProductMatches &&
    (coupon === 0 || couponSeparate || couponIncluded) &&
    (recordedShippingPaise === null ||
      recordedShippingPaise === shippingTotalPaise) &&
    proposedPayable !== null &&
    proposedPayable >= 0 &&
    recordedPayablePaise === proposedPayable;
  const couponDeductedPaise = deductionsVerified ? proposedCoupon : 0;
  const coinRedeemedPaise = deductionsVerified ? coins : 0;
  const calculatedPayablePaise =
    itemsTotalPaise === null
      ? null
      : itemsTotalPaise - couponDeductedPaise - coinRedeemedPaise;
  const taxable =
    productTaxablePaise !== null && shippingTaxablePaise !== null
      ? productTaxablePaise + shippingTaxablePaise
      : null;
  const tax =
    productGstPaise !== null && shippingGstPaise !== null
      ? productGstPaise + shippingGstPaise
      : null;
  const invalidLine = itemFinancials.some((row, index) => {
    const item = items[index];
    const {
      productTaxablePaise: base,
      productGstPaise: gst,
      productGrossPaise: gross,
      shippingTaxablePaise: shipBase,
      shippingGstPaise: shipTax,
      shippingGrossPaise: shipGross,
    } = row;
    return (
      [base, gst, gross, shipBase, shipTax, shipGross].some(
        (v) => v === null || v < 0,
      ) ||
      base! + gst! !== gross ||
      shipBase! + shipTax! !== shipGross ||
      mismatchPaise(toPaise(item.line_gst_amount), gst) ||
      mismatchPaise(toPaise(item.line_total_incl_gst), gross! + shipGross!) ||
      mismatchPaise(toPaise(item.line_total_gst_amount), gst! + shipTax!) ||
      (toPaise(item.product_service_charge) ?? 0) !== 0
    );
  });
  const hasMismatch =
    !items.length ||
    itemFinancials.some((row) => row.shippingSplitStatus !== "recorded") ||
    invalidLine ||
    !isPresent(firstValue(invoice.invoice_number, invoice.number)) ||
    items.some((item) => !isPresent(item.hsn_code)) ||
    !deductionsVerified ||
    mismatchPaise(toPaise(invoice.total_taxable), taxable) ||
    mismatchPaise(toPaise(invoice.total_tax), tax) ||
    mismatchPaise(toPaise(invoice.total_shipping_gst), shippingGstPaise) ||
    (
      [
        ["total_cgst", "cgstPaise"],
        ["total_sgst", "sgstPaise"],
        ["total_utgst", "utgstPaise"],
        ["total_igst", "igstPaise"],
      ] as const
    ).some(([header, field]) =>
      mismatchPaise(toPaise(invoice[header]), sum(field)),
    );
  return {
    itemFinancials,
    productTaxablePaise,
    productGstPaise,
    productGrossPaise,
    shippingTaxablePaise,
    shippingGstPaise,
    shippingTotalPaise,
    itemsTotalPaise,
    couponDeductedPaise,
    coinRedeemedPaise,
    calculatedPayablePaise,
    recordedPayablePaise,
    recordedShippingPaise,
    hasMismatch,
    cgstPaise: sum("cgstPaise"),
    sgstPaise: sum("sgstPaise"),
    utgstPaise: sum("utgstPaise"),
    igstPaise: sum("igstPaise"),
    shippingCgstPaise: sum("shippingCgstPaise"),
    shippingSgstPaise: sum("shippingSgstPaise"),
    shippingUtgstPaise: sum("shippingUtgstPaise"),
    shippingIgstPaise: sum("shippingIgstPaise"),
  };
};
// =====================================================
// MAIN INVOICE PDF GENERATOR
// =====================================================
export const generateInvoicePDF = async (response: any): Promise<void> => {
  const previewWindow = window.open("", "_blank");
  try {
    console.info(
      "INDIEKONNECT: DYNAMIC PRODUCT QR INVOICE V5 - FRONTEND FINANCIAL RECONCILIATION",
    );
    const { invoice, order, items, invoiceType } =
      normalizeInvoiceResponse(response);
    const isSingleItem = String(invoiceType).toLowerCase() === "single_item";
    if (isSingleItem && items.length > 1) {
      throw new Error("Single-item invoice contains multiple product lines.");
    }
    const seller = invoice.seller || invoice.seller_details || {};
    const buyer = invoice.buyer || invoice.buyer_details || {};
    const billingAddress =
      buyer.billing_address ||
      invoice.billing_address ||
      order.billing_address ||
      {};
    const shippingAddress =
      buyer.delivery_address ||
      invoice.delivery_address ||
      order.delivery_address ||
      order.shipping_address ||
      {};
    const sellerName = safeText(seller.name, "IndieKonnect");
    const sellerGSTIN = safeText(seller.gstin);
    const invoiceNumber = safeText(
      firstValue(invoice.invoice_number, invoice.number),
    );
    const orderReference = safeText(
      firstValue(order.order_reference, order.id),
    );
    const placeOfSupply = safeText(
      firstValue(
        invoice.place_of_supply,
        invoice.delivery_state,
        shippingAddress.state,
      ),
    );
    const buyerName = safeText(firstValue(buyer.name, order.user?.name));
    const financials = calculateInvoice(invoice, items);
    const {
      itemFinancials,
      productTaxablePaise,
      productGstPaise,
      productGrossPaise,
      shippingTaxablePaise,
      shippingGstPaise,
      shippingTotalPaise,
      itemsTotalPaise,
      couponDeductedPaise,
      coinRedeemedPaise,
      calculatedPayablePaise,
      hasMismatch,
    } = financials;
    const payablePaise = calculatedPayablePaise;
    const payable = fromPaise(payablePaise);
    const documentTitle = hasMismatch ? "Invoice Preview" : "Tax Invoice";
    if (hasMismatch) {
      console.warn(
        "Invoice line amounts require verification; no differences added to charges.",
        financials,
      );
    }
    // ================================================
    // PDF CONFIGURATION
    // ================================================
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
      compress: true,
    });
    doc.setProperties({
      title: `${documentTitle} ${invoiceNumber}`,
      subject: `Order ${orderReference}`,
      author: "IndieKonnect",
      creator: "IndieKonnect Distributor Panel",
    });
    const PW = doc.internal.pageSize.getWidth();
    const PH = doc.internal.pageSize.getHeight();
    const M = 32;
    const R = PW - M;
    const W = PW - M * 2;
    const DIVIDER = M + W * 0.69;
    const LEFT_W = DIVIDER - M;
    const RIGHT_W = R - DIVIDER;
    let y = M;
    // ================================================
    // DRAWING HELPERS
    // ================================================
    const text = (
      value: any,
      x: number,
      baseline: number,
      size = 8,
      bold = false,
      options: any = {},
      muted = false,
    ) => {
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setFontSize(size);
      doc.setTextColor(...(muted ? GRAY : INK));
      doc.text(safeText(value), x, baseline, options);
    };
    const wrap = (
      value: any,
      width: number,
      size = 8,
      bold = false,
    ): string[] => {
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setFontSize(size);
      return doc.splitTextToSize(safeText(value), width) as string[];
    };
    const rect = (x: number, top: number, width: number, height: number) => {
      doc.setDrawColor(...BORDER);
      doc.setLineWidth(0.55);
      doc.rect(x, top, width, height);
    };
    const rule = (x1: number, y1: number, x2: number, y2: number) => {
      doc.setDrawColor(...BORDER);
      doc.setLineWidth(0.55);
      doc.line(x1, y1, x2, y2);
    };
    const room = (height: number) => {
      if (y + height > PH - 45) {
        doc.addPage();
        y = 32;
      }
    };
    const fill = (x: number, top: number, width: number, height: number) => {
      doc.setFillColor(...LIGHT);
      doc.rect(x, top, width, height, "F");
    };
    // ================================================
    // 1. HEADER - ORIGINAL LOGO + INVOICE TITLE
    // ================================================
    const headerH = 72;
    rect(M, y, W, headerH);
    rule(DIVIDER, y, DIVIDER, y + headerH);
    const logo = await loadLogo();
    let logoWidth = 0;
    if (logo) {
      const props = doc.getImageProperties(logo);
      const scale = Math.min(140 / props.width, 54 / props.height);
      logoWidth = props.width * scale;
      const logoHeight = props.height * scale;
      doc.addImage(
        logo,
        "PNG",
        M + 12,
        y + (headerH - logoHeight) / 2,
        logoWidth,
        logoHeight,
      );
    }
    text(
      "INDIEKONNECT",
      M + logoWidth + (logoWidth ? 24 : 12),
      y + 40,
      16,
      true,
    );
    text(documentTitle, DIVIDER + RIGHT_W / 2, y + 31, 15, true, {
      align: "center",
    });
    text(
      hasMismatch ? "PENDING VERIFICATION" : "ORIGINAL FOR RECIPIENT",
      DIVIDER + RIGHT_W / 2,
      y + 47,
      7,
      false,
      { align: "center" },
      true,
    );
    y += headerH;
    // ================================================
    // 2. SELLER DETAILS + SCANNABLE QR CODE
    // ================================================
    const sellerLines = wrap(sellerName, LEFT_W - 20, 9.5, true);
    const sellerAddressLines = wrap(
      formatAddress(seller.address),
      LEFT_W - 20,
      8,
    );
    const sellerFields = [
      ["GSTIN", sellerGSTIN],
      ["PAN", seller.pan],
      ["CIN", seller.cin],
      ["FSSAI Licence", seller.fssai_license_number],
    ].filter(([, value]) => isPresent(value));
    const sellerH = Math.max(
      132,
      48 +
        sellerLines.length * 12 +
        sellerAddressLines.length * 11 +
        sellerFields.length * 13,
    );
    rect(M, y, W, sellerH);
    rule(DIVIDER, y, DIVIDER, y + sellerH);
    text("Sold By / Seller", M + 10, y + 15, 8, true);
    let sellerY = y + 32;
    sellerLines.forEach((line) => {
      text(line, M + 10, sellerY, 9.5, true);
      sellerY += 12;
    });
    sellerY += 3;
    sellerAddressLines.forEach((line) => {
      text(line, M + 10, sellerY, 8);
      sellerY += 11;
    });
    sellerY += 7;
    sellerFields.forEach(([label, value]) => {
      text(label, M + 10, sellerY, 8, true);
      text(`: ${value}`, M + 105, sellerY, 8);
      sellerY += 13;
    });
    const rawProductUrl = items[0]?.product_url;
    let productUrl = "";
    if (typeof rawProductUrl === "string") {
      try {
        const parsed = new URL(rawProductUrl.trim());
        if (parsed.protocol === "https:" || parsed.protocol === "http:")
          productUrl = rawProductUrl.trim();
      } catch {
        // Missing or invalid product URL should not prevent PDF generation.
      }
    }
    const qrSize = 82;
    const qrX = DIVIDER + (RIGHT_W - qrSize) / 2;
    const qrY = y + 5;
    if (productUrl) {
      const qrCode = await QRCode.toDataURL(productUrl, {
        width: 400,
        margin: 4,
        errorCorrectionLevel: "M",
        color: { dark: "#000000", light: "#FFFFFF" },
      });
      doc.addImage(qrCode, "PNG", qrX, qrY, qrSize, qrSize);
      doc.link(qrX, qrY, qrSize, qrSize, { url: productUrl });
      text(
        "Scan to View Product",
        DIVIDER + RIGHT_W / 2,
        qrY + qrSize + 9,
        7,
        false,
        { align: "center" },
      );
    } else {
      text(
        "Product link unavailable",
        DIVIDER + RIGHT_W / 2,
        qrY + 45,
        8,
        false,
        { align: "center" },
        true,
      );
    }
    text(
      "Invoice Number",
      DIVIDER + RIGHT_W / 2,
      qrY + qrSize + 22,
      7,
      false,
      { align: "center" },
      true,
    );
    text(invoiceNumber, DIVIDER + RIGHT_W / 2, qrY + qrSize + 34, 9, true, {
      align: "center",
      maxWidth: RIGHT_W - 12,
    });
    y += sellerH;
    // ================================================
    // 3. ORDER DETAILS / BILL TO / SHIP TO
    // ================================================
    const orderW = W * 0.32;
    const addressW = (W - orderW) / 2;
    const billX = M + orderW;
    const shipX = billX + addressW;
    const billingName = firstValue(
      billingAddress.recipient_name,
      billingAddress.name,
      buyerName,
    );
    const shippingName = firstValue(
      shippingAddress.recipient_name,
      shippingAddress.name,
      buyerName,
    );
    const orderFields: [string, any][] = [
      ["Invoice No.", invoiceNumber],
      ["Invoice Date", formatDate(invoice.issued_at)],
      ["Order ID", orderReference],
      ["Order Date", formatDate(order.created_at)],
      ["Place of Supply", placeOfSupply],
      ["Payment Mode", prettyStatus(order.payment_gateway)],
    ];
    const orderRows = orderFields.map(([label, value]) => ({
      label,
      lines: wrap(value, orderW - 20, 7.5),
    }));
    const billLines = [
      ...wrap(billingName, addressW - 20, 8.5, true),
      ...wrap(formatAddress(billingAddress), addressW - 20, 8),
      ...wrap(
        `Phone: ${safeText(billingAddress.contact_number)}`,
        addressW - 20,
        7.5,
      ),
      ...wrap(`GSTIN: ${safeText(buyer.gstin)}`, addressW - 20, 7.5),
    ];
    const shipLines = [
      ...wrap(shippingName, addressW - 20, 8.5, true),
      ...wrap(formatAddress(shippingAddress), addressW - 20, 8),
      ...wrap(
        `Phone: ${safeText(shippingAddress.contact_number)}`,
        addressW - 20,
        7.5,
      ),
    ];
    const orderHeight = orderRows.reduce(
      (sum, row) => sum + 15 + row.lines.length * 10,
      0,
    );
    const infoH = Math.max(
      145,
      orderHeight + 35,
      40 + billLines.length * 11,
      40 + shipLines.length * 11,
    );
    room(infoH);
    fill(M, y, W, 23);
    rect(M, y, W, infoH);
    rule(billX, y, billX, y + infoH);
    rule(shipX, y, shipX, y + infoH);
    rule(M, y + 23, R, y + 23);
    text("Order Information", M + 10, y + 15, 8.5, true);
    text("Bill To", billX + 10, y + 15, 8.5, true);
    text("Ship To", shipX + 10, y + 15, 8.5, true);
    let orderY = y + 36;
    orderRows.forEach((row) => {
      text(row.label, M + 10, orderY, 7, true);
      orderY += 10;
      row.lines.forEach((line) => {
        text(line, M + 10, orderY, 7.5);
        orderY += 10;
      });
      orderY += 5;
    });
    const drawAddress = (
      name: any,
      address: any,
      x: number,
      extraFields: string[],
    ) => {
      let cursor = y + 38;
      wrap(name, addressW - 20, 8.5, true).forEach((line) => {
        text(line, x + 10, cursor, 8.5, true);
        cursor += 11;
      });
      cursor += 4;
      wrap(formatAddress(address), addressW - 20, 8).forEach((line) => {
        text(line, x + 10, cursor, 8);
        cursor += 11;
      });
      cursor += 5;
      extraFields.forEach((field) => {
        wrap(field, addressW - 20, 7.5).forEach((line) => {
          text(line, x + 10, cursor, 7.5);
          cursor += 11;
        });
      });
    };
    drawAddress(billingName, billingAddress, billX, [
      `Phone: ${safeText(billingAddress.contact_number)}`,
      `GSTIN: ${safeText(buyer.gstin)}`,
    ]);
    drawAddress(shippingName, shippingAddress, shipX, [
      `Phone: ${safeText(shippingAddress.contact_number)}`,
    ]);
    y += infoH;
    // ================================================
    // 4. COMBINED PRODUCT AND SHIPPING TABLE
    // ================================================
    type CombinedLine = {
      cells: string[];
      gross: number | null;
      taxable: number | null;
      gst: number | null;
    };
    const combinedLines: CombinedLine[] = [];
    const appendLine = (
      cells: string[],
      gross: number | null,
      taxable: number | null,
      gst: number | null,
    ) => {
      combinedLines.push({
        cells: [String(combinedLines.length + 1), ...cells],
        gross,
        taxable,
        gst,
      });
    };

    items.forEach((item, index) => {
      const financial = itemFinancials[index];
      const name = safeText(firstValue(item.product_name, item.name));
      const stateTax = sumPaiseValues([
        financial.sgstPaise,
        financial.utgstPaise,
      ]);
      appendLine(
        [
          safeText(item.hsn_code),
          [
            name,
            item.product_code ? `SKU: ${item.product_code}` : "",
            (toNumber(item.product_service_charge) ?? 0) > 0
              ? `Service Charge (Pending Confirmation): Rs. ${formatMoney(item.product_service_charge)}`
              : "",
          ]
            .filter(Boolean)
            .join("\n"),
          safeText(item.quantity),
          formatPaise(financial.productTaxablePaise),
          isPresent(item.gst_rate_percent)
            ? `${String(item.gst_rate_percent).replace(/%$/, "")}%`
            : "-",
          formatPaise(financial.cgstPaise),
          formatPaise(stateTax),
          formatPaise(financial.igstPaise),
          formatPaise(financial.productGstPaise),
          formatPaise(financial.productGrossPaise),
        ],
        financial.productGrossPaise,
        financial.productTaxablePaise,
        financial.productGstPaise,
      );
    });

    // Show recorded or calculated shipping GST components without adding tax twice.
    items.forEach((item, index) => {
      const financial = itemFinancials[index];
      if (
        ![
          financial.shippingGrossPaise,
          financial.shippingTaxablePaise,
          financial.shippingGstPaise,
        ].some((value) => value !== null && value !== 0)
      )
        return;
      const name = safeText(firstValue(item.product_name, item.name));
      const explicitShippingRate = toNumber(
        isPresent(item.shipping_gst_rate_percent)
          ? String(item.shipping_gst_rate_percent)
              .trim()
              .replace(/%$/, "")
              .trim()
          : null,
      );
      const shippingRate =
        explicitShippingRate ??
        (financial.shippingTaxablePaise !== null &&
        financial.shippingTaxablePaise > 0 &&
        financial.shippingGstPaise !== null
          ? Math.round(
              (financial.shippingGstPaise / financial.shippingTaxablePaise) *
                10000,
            ) / 100
          : null);
      const shippingCgst = financial.shippingCgstPaise;
      const shippingStateGst = sumPaiseValues([
        financial.shippingSgstPaise,
        financial.shippingUtgstPaise,
      ]);
      const shippingIgst = financial.shippingIgstPaise;
      const hasConfirmedSplit = financial.shippingSplitStatus !== "unavailable";
      appendLine(
        [
          "-",
          `Shipping - ${name}`,
          "-",
          formatPaise(financial.shippingTaxablePaise),
          shippingRate !== null ? `${shippingRate}%` : "-",
          hasConfirmedSplit ? formatPaise(shippingCgst) : "-",
          hasConfirmedSplit ? formatPaise(shippingStateGst) : "-",
          hasConfirmedSplit ? formatPaise(shippingIgst) : "-",
          formatPaise(financial.shippingGstPaise),
          formatPaise(financial.shippingGrossPaise),
        ],
        financial.shippingGrossPaise,
        financial.shippingTaxablePaise,
        financial.shippingGstPaise,
      );
    });

    // Only the listed product and shipping lines contribute to this total.
    const combinedTotalPaise = itemsTotalPaise;
    const productRows = combinedLines.map((line) => line.cells);
    const widths = [23, 48, 110, 25, 70, 36, 49, 49, 49, 62, 76];
    const ratio = W / widths.reduce((sum, width) => sum + width, 0);
    const columnStyles: Record<number, any> = {};
    widths.forEach((width, index) => {
      columnStyles[index] = {
        cellWidth: width * ratio,
        halign:
          index === 2 ? "left" : index <= 3 || index === 5 ? "center" : "right",
      };
    });
    room(70);
    autoTable(doc, {
      startY: y,
      margin: { left: M, right: M, top: 32, bottom: 45 },
      theme: "grid",
      head: [
        [
          "Sr.\nNo.",
          "HSN",
          "Item Description",
          "Qty.",
          "Taxable\nAmount",
          "GST\nRate",
          "CGST",
          "SGST /\nUTGST",
          "IGST",
          "GST\nAmount",
          "Amount\n(Incl. GST)",
        ],
      ],
      body: productRows.length
        ? productRows
        : [
            [
              "-",
              "-",
              "Item details unavailable",
              "-",
              "-",
              "-",
              "-",
              "-",
              "-",
              "-",
              "-",
            ],
          ],
      styles: {
        font: "helvetica",
        fontSize: 7,
        textColor: INK,
        lineColor: BORDER,
        lineWidth: 0.5,
        cellPadding: { top: 5, bottom: 5, left: 3, right: 3 },
        overflow: "linebreak",
        valign: "middle",
        fillColor: [255, 255, 255],
      },
      headStyles: {
        fillColor: LIGHT,
        textColor: INK,
        fontStyle: "bold",
        fontSize: 6.8,
        halign: "center",
        minCellHeight: 28,
      },
      foot: combinedLines.length
        ? [
            [
              {
                content: "Items & Charges Total",
                colSpan: 10,
                styles: {
                  halign: "right",
                  cellPadding: { top: 5, bottom: 5, left: 3, right: 8 },
                },
              },
              {
                content: formatPaise(combinedTotalPaise),
                styles: { halign: "right" },
              },
            ],
          ]
        : [],
      footStyles: {
        fontStyle: "bold",
        fillColor: LIGHT,
        textColor: INK,
        lineColor: BORDER,
        lineWidth: 0.5,
      },
      showFoot: "lastPage",
      columnStyles,
      rowPageBreak: "avoid",
      showHead: "everyPage",
    });
    y = (doc as any).lastAutoTable?.finalY || y;
    // ================================================
    // 5. INVOICE SUMMARY - SIGNED PAYABLE WATERFALL
    // ================================================
    type SummaryRow = {
      label: string;
      value: string;
      kind: "normal" | "subtotal" | "total" | "note";
      amount?: number | null;
    };
    // A single customer-facing calculation. Amounts are in INR (column heading).
    const moneyWithSign = (amount: number | null, signed = false): string => {
      if (amount === null) return "Not available";
      const sign = amount < 0 ? "- " : signed && amount > 0 ? "+ " : "";
      return `${sign}${formatPaise(Math.abs(amount))}`;
    };
    const makeRow = (
      label: string,
      amount: number | null,
      kind: SummaryRow["kind"] = "normal",
      signed = false,
    ): SummaryRow => ({
      label,
      value: moneyWithSign(amount, signed),
      kind,
      amount,
    });
    const summaryRows: SummaryRow[] = [
      makeRow("Product Price (Excl. GST)", productTaxablePaise),
    ];
    const productTaxes = [
      ["CGST", financials.cgstPaise],
      ["SGST", financials.sgstPaise],
      ["UTGST", financials.utgstPaise],
      ["IGST", financials.igstPaise],
    ] as const;
    const componentSum = productTaxes.reduce(
      (sum, [, amount]) => sum + (amount ?? 0),
      0,
    );
    if (
      productGstPaise !== null &&
      componentSum === productGstPaise &&
      productGstPaise !== 0
    ) {
      productTaxes.forEach(([label, amount]) => {
        if (amount !== null && amount !== 0)
          summaryRows.push(makeRow(label, amount, "normal", true));
      });
    } else {
      summaryRows.push(makeRow("Product GST", productGstPaise, "normal", true));
    }
    summaryRows.push(
      makeRow("Product Total (Incl. GST)", productGrossPaise, "subtotal"),
    );
    if (couponDeductedPaise !== 0)
      summaryRows.push(
        makeRow("Coupon Discount", -couponDeductedPaise, "normal", true),
      );
    if (
      shippingTotalPaise !== 0 ||
      shippingTaxablePaise !== 0 ||
      shippingGstPaise !== 0
    ) {
      if (shippingTaxablePaise !== null && shippingGstPaise !== null) {
        summaryRows.push(
          makeRow(
            "Shipping Charges (Excl. GST)",
            shippingTaxablePaise,
            "normal",
            true,
          ),
        );
        const shippingTaxes = [
          ["Shipping CGST", financials.shippingCgstPaise],
          ["Shipping SGST", financials.shippingSgstPaise],
          ["Shipping UTGST", financials.shippingUtgstPaise],
          ["Shipping IGST", financials.shippingIgstPaise],
        ] as const;
        if (shippingGstPaise !== 0) {
          if (
            shippingTaxes.every(([, amount]) => amount !== null) &&
            shippingTaxes.reduce(
              (sum, [, amount]) => sum + (amount ?? 0),
              0,
            ) === shippingGstPaise
          ) {
            shippingTaxes.forEach(([label, amount]) => {
              if (amount !== null && amount !== 0)
                summaryRows.push(makeRow(label, amount, "normal", true));
            });
          } else
            summaryRows.push(
              makeRow("Shipping GST", shippingGstPaise, "normal", true),
            );
        }
      } else {
        summaryRows.push(
          makeRow(
            "Shipping Charges (Incl. GST)",
            shippingTotalPaise,
            "normal",
            true,
          ),
        );
      }
    }
    if (coinRedeemedPaise !== 0)
      summaryRows.push(
        makeRow("Coin Redemption", -coinRedeemedPaise, "normal", true),
      );
    summaryRows.push(
      makeRow(
        hasMismatch ? "Calculated Total" : "Total Payable",
        payablePaise,
        "total",
      ),
    );
    // Full-width compact tables avoid clipping long labels and large INR values.
    // Notes below the payable amount are informational and are not added again.
    const drawSummaryTable = (heading: string, rows: SummaryRow[]) => {
      // Keep a compact summary together when it fits on a fresh page.
      const estimatedHeight =
        35 +
        rows.reduce(
          (height, row) => height + (row.kind === "total" ? 31 : 19),
          0,
        );
      room(Math.min(estimatedHeight, PH - 85));
      autoTable(doc, {
        startY: y + 8,
        margin: { left: M, right: M, top: 32, bottom: 45 },
        theme: "plain",
        tableWidth: W,
        head: [[heading, "AMOUNT (INR)"]],
        body: rows.map((row) => [row.label, row.value]),
        styles: {
          font: "helvetica",
          fontSize: 8.5,
          textColor: INK,
          cellPadding: { top: 4, bottom: 4, left: 9, right: 9 },
          overflow: "linebreak",
          valign: "middle",
          lineColor: [220, 224, 228],
          lineWidth: { bottom: 0.4 },
        },
        headStyles: { fillColor: LIGHT, textColor: INK, fontStyle: "bold" },
        columnStyles: {
          0: { cellWidth: W * 0.67 },
          1: { cellWidth: W * 0.33, halign: "right" },
        },
        rowPageBreak: "avoid",
        showHead: "everyPage",
        didParseCell: (data) => {
          if (data.section === "head" && data.column.index === 1)
            data.cell.styles.halign = "right";
          if (data.section !== "body") return;
          const row = rows[data.row.index];
          if (!row) return;
          if (row.kind === "subtotal") {
            data.cell.styles.fillColor = [242, 244, 246];
            data.cell.styles.fontStyle = "bold";
          }
          if (
            data.column.index === 1 &&
            row.kind === "normal" &&
            (row.amount ?? 0) < 0
          ) {
            data.cell.styles.fontStyle = "bold";
          }
          if (row.kind === "note") data.cell.styles.textColor = [95, 95, 95];
          if (row.kind === "total") {
            data.cell.styles.fillColor = LIGHT;
            data.cell.styles.textColor = INK;
            data.cell.styles.fontStyle = "bold";
            data.cell.styles.fontSize = 11;
            data.cell.styles.cellPadding = 8;
          }
        },
      });
      y = (doc as any).lastAutoTable?.finalY || y;
    };
    drawSummaryTable("INVOICE SUMMARY", summaryRows);
    // ================================================
    // 6. AMOUNT IN WORDS
    // ================================================
    const wordsLines = wrap(
      `${hasMismatch ? "Calculated amount in words" : "Amount in words"}: ${amountInWords(payable)}`,
      W - 20,
      8,
      true,
    );
    const wordsH = Math.max(29, wordsLines.length * 11 + 14);
    room(wordsH);
    rect(M, y, W, wordsH);
    wordsLines.forEach((line, index) =>
      text(line, M + 10, y + 15 + index * 11, 8, true),
    );
    y += wordsH;
    // ================================================
    // 7. INVOICE REVIEW NOTICE
    // ================================================
    if (hasMismatch) {
      const shippingNotice = itemFinancials.some(
        (row) => row.shippingSplitStatus === "calculated",
      )
        ? " Shipping tax split calculated using the product tax pattern; confirmation required."
        : itemFinancials.some(
              (row) => row.shippingSplitStatus === "unavailable",
            )
          ? " Shipping tax breakup requires confirmation."
          : "";
      const notice = wrap(
        "Calculated from listed items and shipping. Final payable requires verification." +
          shippingNotice,
        W - 20,
        8,
        true,
      );
      const noticeH = notice.length * 11 + 16;
      room(noticeH);
      fill(M, y, W, noticeH);
      rect(M, y, W, noticeH);
      notice.forEach((line, index) =>
        text(line, M + 10, y + 14 + index * 11, 8, true),
      );
      y += noticeH;
    }
    // ================================================
    // 8. REVERSE CHARGE
    // ================================================
    const reverseCharge = firstValue(
      invoice.reverse_charge,
      invoice.is_reverse_charge,
    );
    if (isPresent(reverseCharge)) {
      room(25);
      rect(M, y, W, 25);
      const value = [true, 1, "1", "yes", "true"].includes(reverseCharge);
      text(
        `Whether tax is payable on reverse charge: ${value ? "Yes" : "No"}`,
        M + 10,
        y + 16,
        8,
        true,
      );
      y += 25;
    }
    // ================================================
    // 9. AUTHORISED SIGNATORY
    // ================================================
    const signatureH = 77;
    room(signatureH);
    rect(M, y, W, signatureH);
    rule(DIVIDER, y, DIVIDER, y + signatureH);
    text(`For ${sellerName}`, M + 10, y + 17, 9, true);
    text(`GSTIN: ${sellerGSTIN}`, M + 10, y + 32, 8);
    text("Computer-generated document.", M + 10, y + 50, 7.5, false, {}, true);
    const signature = firstValue(
      invoice.signature_data_url,
      seller.signature_data_url,
    );
    if (
      !hasMismatch &&
      typeof signature === "string" &&
      /^data:image\/(png|jpeg|jpg);base64,/i.test(signature)
    ) {
      try {
        const props = doc.getImageProperties(signature);
        const scale = Math.min((RIGHT_W - 20) / props.width, 42 / props.height);
        const sw = props.width * scale;
        const sh = props.height * scale;
        doc.addImage(
          signature,
          signature.includes("image/png") ? "PNG" : "JPEG",
          DIVIDER + (RIGHT_W - sw) / 2,
          y + 8,
          sw,
          sh,
        );
      } catch (error) {
        console.warn("Unable to render signature", error);
      }
    }
    text(
      hasMismatch ? "Pending Verification" : "Authorised Signatory",
      DIVIDER + RIGHT_W / 2,
      y + signatureH - 12,
      8,
      true,
      { align: "center" },
    );
    y += signatureH;
    // ================================================
    // 11. FOOTER AND PAGE NUMBERS
    // ================================================
    const pageCount = doc.getNumberOfPages();
    for (let page = 1; page <= pageCount; page++) {
      doc.setPage(page);
      rule(M, PH - 32, R, PH - 32);
      text(
        `IndieKonnect | ${documentTitle} | ${invoiceNumber}`,
        M,
        PH - 19,
        7,
        false,
        {},
        true,
      );
      text(
        `Page ${page} of ${pageCount}`,
        R,
        PH - 19,
        7,
        false,
        { align: "right" },
        true,
      );
    }
    // ================================================
    // 12. OPEN PDF / DOWNLOAD
    // ================================================
    const pdfBlob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const filename = invoiceNumber.replace(/[^a-zA-Z0-9_-]/g, "_");
    if (previewWindow && !previewWindow.closed) {
      previewWindow.location.replace(pdfUrl);
      window.setTimeout(() => URL.revokeObjectURL(pdfUrl), 300000);
    } else {
      doc.save(`${filename}${hasMismatch ? "-preview" : ""}.pdf`);
      URL.revokeObjectURL(pdfUrl);
    }
  } catch (error) {
    console.error("Invoice PDF generation failed:", error);
    if (previewWindow && !previewWindow.closed) previewWindow.close();
    throw error;
  }
};
