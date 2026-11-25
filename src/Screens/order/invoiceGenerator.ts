"use client";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";
import Logo from "../../../public/indiekonnect-web/images/logo.png";

// =====================================================
// CONFIGURATION
// =====================================================

type InvoiceRecord = Record<string, any>;
type RGB = [number, number, number];
const LOGO_PATHS = [Logo.src, "/indiekonnect-web/images/logo.png", "/images/logo.png", "/logo.png"];
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
// API NORMALIZATION
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
  const items = normalizeItems(rawItems);
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
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight",
  "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen",
  "Sixteen", "Seventeen", "Eighteen", "Nineteen",
];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
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
    [10000000, "Crore"], [100000, "Lakh"], [1000, "Thousand"], [100, "Hundred"],
  ];
  for (const [value, label] of units) {
    if (n >= value) {
      return [
        numberToWords(Math.floor(n / value)),
        label,
        n % value ? numberToWords(n % value) : "",
      ].filter(Boolean).join(" ");
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
  ].filter(Boolean).join(" ");
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
const sumPaiseValues = (values: Array<number | null | undefined>): number | null => {
  const present = values.filter((value): value is number => value !== null && value !== undefined);
  return present.length ? present.reduce((sum, value) => sum + value, 0) : null;
};
const multiplyAmountPaise = (unitAmount: any, quantity: any): number | null => {
  const unitPaise = toPaise(unitAmount);
  const qty = toNumber(quantity);
  if (unitPaise === null || qty === null) return null;
  return Math.round(unitPaise * qty);
};
const sumAvailablePaiseField = (items: InvoiceRecord[], field: string): number | null =>
  sumPaiseValues(items.map((item) => toPaise(item?.[field])));
const hasAnyItemField = (items: InvoiceRecord[], fields: string[]): boolean =>
  items.some((item) => fields.some((field) => isPresent(item?.[field])));
const resolveTaxComponentPaise = (
  invoiceValue: any,
  itemValue: number | null,
): number => {
  const invoicePaise = toPaise(invoiceValue);
  // An explicit positive invoice total wins. A zero header total is treated as
  // unpopulated only when item-level detail supplies a real component amount.
  if (invoicePaise !== null && invoicePaise > 0) return invoicePaise;
  return itemValue ?? invoicePaise ?? 0;
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

  const productTaxablePaise = firstPaise(
    item.line_price_excl_gst,
    multiplyAmountPaise(item.price_excl_gst, quantity) === null
      ? null
      : multiplyAmountPaise(item.price_excl_gst, quantity)! / 100,
  );
  const componentProductGst = hasTaxComponents
    ? (cgstPaise ?? 0) + (sgstPaise ?? 0) + (utgstPaise ?? 0) + (igstPaise ?? 0)
    : null;
  const productGstPaise = componentProductGst ?? firstPaise(item.line_gst_amount);
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

  const shippingTaxablePaise = firstPaise(
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
  const shippingGstPaise = explicitShippingGstPaise ?? (
    explicitShippingGrossPaise !== null && shippingTaxablePaise !== null
      ? explicitShippingGrossPaise - shippingTaxablePaise
      : null
  );
  const shippingGrossPaise = explicitShippingGrossPaise ?? (
    shippingTaxablePaise !== null && shippingGstPaise !== null
      ? shippingTaxablePaise + shippingGstPaise
      : null
  );

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
  };
};

const sumItemFinancial = (
  items: InvoiceRecord[],
  field: keyof ItemFinancials,
): number | null =>
  sumPaiseValues(items.map((item) => getItemFinancials(item)[field] as number | null));

const mismatchPaise = (a: number | null, b: number | null): boolean =>
  a !== null && b !== null && Math.abs(a - b) > 2;

// =====================================================
// MAIN INVOICE PDF GENERATOR
// =====================================================

export const generateInvoicePDF = async (response: any): Promise<void> => {
  const previewWindow = window.open("", "_blank");
  try {
    console.info("INDIEKONNECT: DYNAMIC PRODUCT QR INVOICE V5 - FRONTEND FINANCIAL RECONCILIATION");
    const { invoice, order, items, invoiceType } = normalizeInvoiceResponse(response);
    const isSingleItem = invoiceType === "single_item";
    if (isSingleItem && items.length > 1) {
      throw new Error("Single-item invoice contains multiple product lines.");
    }

    const seller = invoice.seller || invoice.seller_details || {};
    const buyer = invoice.buyer || invoice.buyer_details || {};
    const billingAddress = buyer.billing_address || invoice.billing_address || order.billing_address || {};
    const shippingAddress = buyer.delivery_address || invoice.delivery_address || order.delivery_address || order.shipping_address || {};
    const sellerName = safeText(seller.name, "IndieKonnect");
    const sellerGSTIN = safeText(seller.gstin);
    const invoiceNumber = safeText(firstValue(invoice.invoice_number, invoice.number));
    const orderReference = safeText(firstValue(order.order_reference, order.id));
    const placeOfSupply = safeText(firstValue(invoice.place_of_supply, invoice.delivery_state, shippingAddress.state));
    const buyerName = safeText(firstValue(buyer.name, order.user?.name));
    const apiPayablePaise = firstPaise(
      invoice.total_payable,
      !isSingleItem ? order.total_payable : undefined,
    );

    // ================================================
    // FRONTEND FINANCIAL CALCULATION
    // ================================================

    const itemFinancials = items.map((item) => getItemFinancials(item));
    const itemProductTaxablePaise = sumItemFinancial(items, "productTaxablePaise");
    const productGrossPaise = sumItemFinancial(items, "productGrossPaise");
    const shippingTaxablePaise = sumItemFinancial(items, "shippingTaxablePaise") ?? 0;
    const itemShippingGrossPaise = sumItemFinancial(items, "shippingGrossPaise");
    const itemShippingGstPaise = sumItemFinancial(items, "shippingGstPaise");

    const itemCgstPaise = sumItemFinancial(items, "cgstPaise");
    const itemSgstPaise = sumItemFinancial(items, "sgstPaise");
    const itemUtgstPaise = sumItemFinancial(items, "utgstPaise");
    const itemIgstPaise = sumItemFinancial(items, "igstPaise");

    const totalCgstPaise = resolveTaxComponentPaise(invoice.total_cgst, itemCgstPaise);
    const totalSgstPaise = resolveTaxComponentPaise(invoice.total_sgst, itemSgstPaise);
    const totalUtgstPaise = resolveTaxComponentPaise(invoice.total_utgst, itemUtgstPaise);
    const totalIgstPaise = resolveTaxComponentPaise(invoice.total_igst, itemIgstPaise);
    const totalShippingGstPaise = resolveTaxComponentPaise(
      invoice.total_shipping_gst,
      itemShippingGstPaise,
    );

    const hasProductTaxComponents =
      hasAnyItemField(items, ["cgst_amount", "sgst_amount", "utgst_amount", "igst_amount"]) ||
      [invoice.total_cgst, invoice.total_sgst, invoice.total_utgst, invoice.total_igst].some(
        (value) => (toPaise(value) ?? 0) > 0,
      );
    const itemLineProductGstPaise = sumAvailablePaiseField(items, "line_gst_amount");
    const productGstPaise = hasProductTaxComponents
      ? totalCgstPaise + totalSgstPaise + totalUtgstPaise + totalIgstPaise
      : itemLineProductGstPaise ?? (
          productGrossPaise !== null && itemProductTaxablePaise !== null
            ? productGrossPaise - itemProductTaxablePaise
            : Math.max(0, (toPaise(invoice.total_tax) ?? 0) - totalShippingGstPaise)
        );
    const productTaxablePaise = itemProductTaxablePaise ?? (
      productGrossPaise !== null
        ? productGrossPaise - productGstPaise
        : toPaise(invoice.total_taxable)
    );

    // Total GST is the sum of product tax components plus separately supplied
    // shipping GST. line_total_gst_amount is deliberately not used because this
    // response includes an unexplained ₹1,200 difference in that field.
    const totalGSTPaise = productGstPaise + totalShippingGstPaise;
    const taxableAmountPaise = productTaxablePaise !== null
      ? productTaxablePaise + shippingTaxablePaise
      : toPaise(invoice.total_taxable);

    const invoiceShippingPaise = toPaise(invoice.shipping_charge);
    // The item shipping breakdown is ₹1,800, but the invoice header shipping
    // charge is ₹2,224.91. Keep the ₹424.91 difference separate; do not guess
    // its tax classification when the API does not provide that detail.
    const shippingAdjustmentPaise = invoiceShippingPaise !== null
      ? invoiceShippingPaise - (itemShippingGrossPaise ?? 0)
      : 0;

    const coinRedeemedPaise = toPaise(invoice.coin_redeemed) ?? 0;
    const couponDiscountPaise = toPaise(invoice.coupon_discount) ?? 0;
    const subtotalAfterDiscountPaise = firstPaise(
      invoice.subtotal_after_discount,
      toPaise(invoice.subtotal_before_redemption) !== null
        ? (toPaise(invoice.subtotal_before_redemption)! - couponDiscountPaise) / 100
        : null,
      productGrossPaise !== null ? productGrossPaise / 100 : null,
    );

    // Reconcile the product taxable value + GST to the net product subtotal from
    // the invoice. Any residual is disclosed as an adjustment, not silently
    // reclassified as GST.
    const productGrossFromTaxComponentsPaise =
      (productTaxablePaise ?? 0) + productGstPaise;
    const productSubtotalAdjustmentPaise = subtotalAfterDiscountPaise !== null
      ? subtotalAfterDiscountPaise - productGrossFromTaxComponentsPaise
      : 0;

    const calculatedPayablePaise = taxableAmountPaise !== null
      ? taxableAmountPaise + totalGSTPaise + shippingAdjustmentPaise +
        productSubtotalAdjustmentPaise - coinRedeemedPaise
      : null;
    const payablePaise = calculatedPayablePaise ?? apiPayablePaise;
    const payable = fromPaise(payablePaise);

    // ================================================
    // API / ITEM RECONCILIATION CHECKS
    // ================================================

    const invoiceTaxPaise = toPaise(invoice.total_tax);
    const invoiceTaxablePaise = toPaise(invoice.total_taxable);
    const lineShippingPaise = itemShippingGrossPaise;
    const lineTotalPaise = sumAvailablePaiseField(items, "line_total_incl_gst");
    const lineTotalGstPaise = sumAvailablePaiseField(items, "line_total_gst_amount");
    const missingRequiredFields =
      !items.length ||
      payablePaise === null ||
      !isPresent(invoice.invoice_number) ||
      items.some((item) => !isPresent(item.hsn_code));

    const hasMismatch =
      missingRequiredFields ||
      mismatchPaise(taxableAmountPaise, invoiceTaxablePaise) ||
      mismatchPaise(totalGSTPaise, invoiceTaxPaise) ||
      mismatchPaise(lineShippingPaise, invoiceShippingPaise) ||
      (invoiceShippingPaise !== null && lineShippingPaise === null) ||
      mismatchPaise(calculatedPayablePaise, apiPayablePaise) ||
      mismatchPaise(lineTotalPaise, calculatedPayablePaise) ||
      mismatchPaise(lineTotalGstPaise, totalGSTPaise) ||
      mismatchPaise(itemLineProductGstPaise, productGstPaise) ||
      mismatchPaise(
        productTaxablePaise !== null && productGstPaise !== null
          ? productTaxablePaise + productGstPaise
          : null,
        productGrossPaise,
      );

    const documentTitle = hasMismatch ? "Invoice Preview" : "Tax Invoice";
    if (hasMismatch) {
      console.warn("Invoice values do not fully reconcile. Preview only.", {
        calculatedTaxableAmount: fromPaise(taxableAmountPaise),
        apiTaxableAmount: fromPaise(invoiceTaxablePaise),
        calculatedTotalGST: fromPaise(totalGSTPaise),
        apiTotalGST: fromPaise(invoiceTaxPaise),
        productGST: fromPaise(productGstPaise),
        shippingGST: fromPaise(totalShippingGstPaise),
        itemShippingGross: fromPaise(itemShippingGrossPaise),
        invoiceShipping: fromPaise(invoiceShippingPaise),
        shippingAdjustment: fromPaise(shippingAdjustmentPaise),
        lineTotalGSTField: fromPaise(lineTotalGstPaise),
        calculatedPayable: fromPaise(calculatedPayablePaise),
        apiPayable: fromPaise(apiPayablePaise),
        lineTotal: fromPaise(lineTotalPaise),
      });
    }

    // ================================================
    // PDF CONFIGURATION
    // ================================================

    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4", compress: true });
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
    const wrap = (value: any, width: number, size = 8, bold = false): string[] => {
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
      doc.addImage(logo, "PNG", M + 12, y + (headerH - logoHeight) / 2, logoWidth, logoHeight);
    }
    text("INDIEKONNECT", M + logoWidth + (logoWidth ? 24 : 12), y + 40, 16, true);
    text(documentTitle, DIVIDER + RIGHT_W / 2, y + 31, 15, true, { align: "center" });
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
    const sellerAddressLines = wrap(formatAddress(seller.address), LEFT_W - 20, 8);
    const sellerFields = [
      ["GSTIN", sellerGSTIN],
      ["PAN", seller.pan],
      ["CIN", seller.cin],
      ["FSSAI Licence", seller.fssai_license_number],
    ].filter(([, value]) => isPresent(value));
    const sellerH = Math.max(
      132,
      48 + sellerLines.length * 12 + sellerAddressLines.length * 11 + sellerFields.length * 13,
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
        if (parsed.protocol === "https:" || parsed.protocol === "http:") productUrl = rawProductUrl.trim();
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
      text("Scan to View Product", DIVIDER + RIGHT_W / 2, qrY + qrSize + 9, 7, false, { align: "center" });
    } else {
      text("Product link unavailable", DIVIDER + RIGHT_W / 2, qrY + 45, 8, false, { align: "center" }, true);
    }
    text("Invoice Number", DIVIDER + RIGHT_W / 2, qrY + qrSize + 22, 7, false, { align: "center" }, true);
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
    const billingName = firstValue(billingAddress.recipient_name, billingAddress.name, buyerName);
    const shippingName = firstValue(shippingAddress.recipient_name, shippingAddress.name, buyerName);
    const orderFields: [string, any][] = [
      ["Invoice No.", invoiceNumber],
      ["Invoice Date", formatDate(invoice.issued_at)],
      ["Order ID", orderReference],
      ["Order Date", formatDate(order.created_at)],
      ["Place of Supply", placeOfSupply],
      ["Payment Mode", prettyStatus(order.payment_gateway)],
    ];
    const orderRows = orderFields.map(([label, value]) => ({ label, lines: wrap(value, orderW - 20, 7.5) }));
    const billLines = [
      ...wrap(billingName, addressW - 20, 8.5, true),
      ...wrap(formatAddress(billingAddress), addressW - 20, 8),
      ...wrap(`Phone: ${safeText(billingAddress.contact_number)}`, addressW - 20, 7.5),
      ...wrap(`GSTIN: ${safeText(buyer.gstin)}`, addressW - 20, 7.5),
    ];
    const shipLines = [
      ...wrap(shippingName, addressW - 20, 8.5, true),
      ...wrap(formatAddress(shippingAddress), addressW - 20, 8),
      ...wrap(`Phone: ${safeText(shippingAddress.contact_number)}`, addressW - 20, 7.5),
    ];
    const orderHeight = orderRows.reduce((sum, row) => sum + 15 + row.lines.length * 10, 0);
    const infoH = Math.max(145, orderHeight + 35, 40 + billLines.length * 11, 40 + shipLines.length * 11);
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
    const drawAddress = (name: any, address: any, x: number, extraFields: string[]) => {
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
    // 4. PRODUCT TABLE - ADMIN PANEL STYLE
    // ================================================

    const productRows = items.map((item, index) => {
      const financial = itemFinancials[index];
      return [
        String(index + 1),
        safeText(item.hsn_code),
        [
          safeText(firstValue(item.product_name, item.name)),
          item.product_code ? `SKU: ${item.product_code}` : "",
          (toNumber(item.product_service_charge) ?? 0) > 0
            ? `Service Charge (API - Verify): Rs. ${formatMoney(item.product_service_charge)}`
            : "",
        ]
          .filter(Boolean)
          .join("\n"),
        safeText(item.quantity),
        formatPaise(financial.productTaxablePaise),
        isPresent(item.gst_rate_percent) ? `${String(item.gst_rate_percent).replace(/%$/, "")}%` : "-",
        formatPaise(financial.cgstPaise),
        formatPaise((financial.sgstPaise ?? 0) + (financial.utgstPaise ?? 0)),
        formatPaise(financial.igstPaise),
        formatPaise(financial.productGrossPaise),
      ];
    });
    const widths = [22, 40, 128, 26, 66, 38, 50, 50, 50, 72];
    const ratio = W / widths.reduce((sum, width) => sum + width, 0);
    const columnStyles: Record<number, any> = {};
    widths.forEach((width, index) => {
      columnStyles[index] = {
        cellWidth: width * ratio,
        halign: index === 2 ? "left" : index <= 3 || index === 5 ? "center" : "right",
      };
    });
    room(70);
    autoTable(doc, {
      startY: y,
      margin: { left: M, right: M, top: 32, bottom: 45 },
      theme: "grid",
      head: [["Sr.\nNo.", "HSN", "Item Description", "Qty.", "Taxable\nAmount", "GST\nRate", "CGST", "SGST /\nUTGST", "IGST", "Amount\n(Incl. GST)"]],
      body: productRows.length ? productRows : [["-", "-", "Item details unavailable", "-", "-", "-", "-", "-", "-", "-"]],
      styles: {
        font: "helvetica",
        fontSize: 7,
        textColor: INK,
        lineColor: BORDER,
        lineWidth: 0.5,
        cellPadding: 5,
        overflow: "linebreak",
        valign: "middle",
        fillColor: [255, 255, 255],
      },
      headStyles: { fillColor: LIGHT, textColor: INK, fontStyle: "bold", fontSize: 6.8, halign: "center", minCellHeight: 28 },
      columnStyles,
      rowPageBreak: "avoid",
      showHead: "everyPage",
    });
    y = (doc as any).lastAutoTable?.finalY || y;

    // ================================================
    // 5. SHIPPING CHARGES BREAKDOWN
    // ================================================

    const shippingRows: string[][] = items
      .map((item, index) => ({ item, financial: itemFinancials[index], index }))
      .filter(({ financial }) =>
        (financial.shippingGrossPaise ?? 0) > 0 ||
        (financial.shippingTaxablePaise ?? 0) > 0 ||
        (financial.shippingGstPaise ?? 0) > 0,
      )
      .map(({ item, financial, index }) => [
        String(index + 1),
        `Delivery / Shipping - ${safeText(item.product_name)}`,
        formatPaise(financial.shippingTaxablePaise),
        formatPaise(financial.shippingGstPaise),
        formatPaise(financial.shippingGrossPaise),
      ]);

    const hasItemShipping = itemShippingGrossPaise !== null;
    if (invoiceShippingPaise !== null && hasItemShipping && shippingAdjustmentPaise !== 0) {
      shippingRows.push([
        "-",
        "Unitemized shipping difference (tax details not supplied)",
        "-",
        "-",
        formatPaise(shippingAdjustmentPaise),
      ]);
    } else if (invoiceShippingPaise !== null && !hasItemShipping && invoiceShippingPaise !== 0) {
      shippingRows.push([
        "-",
        "Shipping charge (item tax breakup not supplied)",
        "-",
        "-",
        formatPaise(invoiceShippingPaise),
      ]);
    }

    if (shippingRows.length) {
      room(65);
      autoTable(doc, {
        startY: y + 10,
        margin: { left: M, right: M, top: 32, bottom: 45 },
        theme: "grid",
        head: [["Sr.", "Nature of Charge", "Taxable Amount", "GST Amount", "Total"]],
        body: shippingRows,
        styles: { font: "helvetica", fontSize: 7.5, cellPadding: 5, textColor: INK, lineColor: BORDER, lineWidth: 0.5 },
        headStyles: { fillColor: LIGHT, textColor: INK, fontStyle: "bold" },
        columnStyles: {
          0: { cellWidth: 25 },
          2: { halign: "right" },
          3: { halign: "right" },
          4: { halign: "right" },
        },
        foot: [[
          "",
          "TOTAL SHIPPING CHARGES",
          "-",
          "-",
          formatPaise(invoiceShippingPaise ?? itemShippingGrossPaise),
        ]],
        footStyles: {
          fontStyle: "bold",
          textColor: INK,
          fillColor: LIGHT,
          lineColor: BORDER,
          lineWidth: 0.5,
        },
      });
      y = (doc as any).lastAutoTable?.finalY || y;
    }

    // ================================================
    // 6. INVOICE SUMMARY
    // ================================================

    const summaryRows: string[][] = [];
    const addSummaryPaise = (label: string, value: number | null | undefined) => {
      if (value !== null && value !== undefined) {
        summaryRows.push([label, formatPaise(value)]);
      }
    };

    addSummaryPaise("Subtotal (Products - Excl. GST)", productTaxablePaise);
    if (shippingTaxablePaise > 0) {
      addSummaryPaise("Shipping (Itemized - Excl. GST)", shippingTaxablePaise);
    }
    addSummaryPaise("Taxable Amount", taxableAmountPaise);

    if (totalCgstPaise > 0) addSummaryPaise("CGST", totalCgstPaise);
    const combinedSgstUtgstPaise = totalSgstPaise + totalUtgstPaise;
    if (combinedSgstUtgstPaise > 0) {
      addSummaryPaise("SGST / UTGST", combinedSgstUtgstPaise);
    }
    if (totalIgstPaise > 0) addSummaryPaise("IGST", totalIgstPaise);
    if (totalShippingGstPaise > 0) {
      addSummaryPaise("Shipping GST", totalShippingGstPaise);
    }
    addSummaryPaise("Total GST", totalGSTPaise);

    if (productSubtotalAdjustmentPaise !== 0) {
      addSummaryPaise("Product Subtotal Adjustment (API Reconciliation)", productSubtotalAdjustmentPaise);
    }
    if (shippingAdjustmentPaise !== 0) {
      addSummaryPaise("Unitemized Shipping Adjustment", shippingAdjustmentPaise);
    }
    if (coinRedeemedPaise > 0) {
      addSummaryPaise("Coin Redemption", -coinRedeemedPaise);
    }
    summaryRows.push(["GRAND TOTAL (INR)", formatPaise(payablePaise)]);

    const summaryW = 225;
    const summaryX = R - summaryW;
    const rowH = 20;
    const summaryH = summaryRows.length * rowH;
    y += 10;
    room(summaryH);
    const summaryY = y;
    rect(M, summaryY, W, summaryH);
    rule(summaryX, summaryY, summaryX, summaryY + summaryH);
    text("Payment Information", M + 10, summaryY + 15, 9, true);
    text(`Payment Method: ${prettyStatus(order.payment_gateway)}`, M + 10, summaryY + 31, 8);
    text("Transaction Reference:", M + 10, summaryY + 46, 8, true);
    const transactionLines = wrap(order.gateway_transaction_id, summaryX - M - 20, 8);
    transactionLines.forEach((line, index) => {
      text(line, M + 10, summaryY + 59 + index * 10, 8);
    });
    if (!isSingleItem) {
      const paidY = summaryY + 65 + transactionLines.length * 10;
      if (toNumber(order.amount_paid) !== null && paidY < summaryY + summaryH - 6) {
        text(`Order Amount Paid: Rs. ${formatMoney(order.amount_paid)}`, M + 10, paidY, 8);
      }
    }

    summaryRows.forEach(([label, value], index) => {
      const top = summaryY + index * rowH;
      const isTotal = index === summaryRows.length - 1;
      if (isTotal) fill(summaryX, top, summaryW, rowH);
      rect(summaryX, top, summaryW, rowH);
      rule(summaryX + 135, top, summaryX + 135, top + rowH);
      text(label, summaryX + 7, top + 13, isTotal ? 8.5 : 7.5, isTotal);
      text(value, R - 8, top + 13, isTotal ? 10 : 8, isTotal, { align: "right" });
    });
    y = summaryY + summaryH;

    // ================================================
    // 7. AMOUNT IN WORDS
    // ================================================

    const wordsLines = wrap(`Amount in Words: ${amountInWords(payable)}`, W - 20, 8, true);
    const wordsH = Math.max(29, wordsLines.length * 11 + 14);
    room(wordsH);
    rect(M, y, W, wordsH);
    wordsLines.forEach((line, index) => text(line, M + 10, y + 15 + index * 11, 8, true));
    y += wordsH;

    // ================================================
    // 8. API VALIDATION NOTICE
    // ================================================

    if (hasMismatch) {
      const notice = wrap(
        "PREVIEW ONLY - API invoice totals do not reconcile with item-level tax, service-charge and shipping details. GST uses the supplied tax components. Unitemized shipping differences are shown separately without assuming their tax treatment. Verify the source data before issuing a Tax Invoice.",
        W - 20,
        8,
        true,
      );
      const noticeH = notice.length * 11 + 16;
      room(noticeH);
      fill(M, y, W, noticeH);
      rect(M, y, W, noticeH);
      notice.forEach((line, index) => text(line, M + 10, y + 14 + index * 11, 8, true));
      y += noticeH;
    }

    // ================================================
    // 9. REVERSE CHARGE
    // ================================================

    const reverseCharge = firstValue(invoice.reverse_charge, invoice.is_reverse_charge);
    if (isPresent(reverseCharge)) {
      room(25);
      rect(M, y, W, 25);
      const value = [true, 1, "1", "yes", "true"].includes(reverseCharge);
      text(`Whether tax is payable on reverse charge: ${value ? "Yes" : "No"}`, M + 10, y + 16, 8, true);
      y += 25;
    }

    // ================================================
    // 10. AUTHORISED SIGNATORY
    // ================================================

    const signatureH = 77;
    room(signatureH);
    rect(M, y, W, signatureH);
    rule(DIVIDER, y, DIVIDER, y + signatureH);
    text(`For ${sellerName}`, M + 10, y + 17, 9, true);
    text(`GSTIN: ${sellerGSTIN}`, M + 10, y + 32, 8);
    text("Computer-generated document.", M + 10, y + 50, 7.5, false, {}, true);
    const signature = firstValue(invoice.signature_data_url, seller.signature_data_url);
    if (!hasMismatch && typeof signature === "string" && /^data:image\/(png|jpeg|jpg);base64,/i.test(signature)) {
      try {
        const props = doc.getImageProperties(signature);
        const scale = Math.min((RIGHT_W - 20) / props.width, 42 / props.height);
        const sw = props.width * scale;
        const sh = props.height * scale;
        doc.addImage(signature, signature.includes("image/png") ? "PNG" : "JPEG", DIVIDER + (RIGHT_W - sw) / 2, y + 8, sw, sh);
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
      text(`IndieKonnect | ${documentTitle} | ${invoiceNumber}`, M, PH - 19, 7, false, {}, true);
      text(`Page ${page} of ${pageCount}`, R, PH - 19, 7, false, { align: "right" }, true);
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
