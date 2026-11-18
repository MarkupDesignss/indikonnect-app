
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import Logo from "../../../public/indiekonnect-web/images/logo.png";

// =====================================================
// CONFIGURATION
// =====================================================

const LOGO_PATHS = [
  Logo.src,
  "/indiekonnect-web/images/logo.png",
  "/images/logo.png",
  "/logo.png",
];

const PAGE_MARGIN = 15;
const FOOTER_HEIGHT = 20;

type InvoiceRecord = Record<string, any>;

// =====================================================
// IMAGE HELPERS
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
          reject(new Error("Canvas context is unavailable"));
          return;
        }

        ctx.drawImage(img, 0, 0);

        resolve(canvas.toDataURL("image/png"));
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error(`Unable to load image: ${url}`));
    };

    img.src = url;
  });
};

const loadLogoWithFallback = async (): Promise<string | null> => {
  for (const path of LOGO_PATHS) {
    try {
      if (!path) continue;

      return await loadImageAsBase64(path);
    } catch {
      console.warn(`Invoice logo unavailable: ${path}`);
    }
  }

  return null;
};

// =====================================================
// COMMON HELPERS
// =====================================================

const isPresent = (value: any): boolean => {
  return value !== undefined && value !== null && value !== "";
};

const firstValue = (...values: any[]): any => {
  return values.find(isPresent);
};

const toNumber = (value: any): number | null => {
  if (!isPresent(value)) return null;

  const number = Number(
    String(value).replace(/,/g, "").replace(/[₹$]/g, "").trim(),
  );

  return Number.isFinite(number) ? number : null;
};

const firstNumber = (...values: any[]): number | null => {
  for (const value of values) {
    const result = toNumber(value);

    if (result !== null) {
      return result;
    }
  }

  return null;
};

const formatPrice = (amount: any): string => {
  const number = toNumber(amount);

  if (number === null) return "N/A";

  return `Rs. ${number.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatMoneyCell = (amount: any): string => {
  return amount === null || amount === undefined
    ? "-"
    : formatPrice(amount);
};

const formatDate = (dateString: any): string => {
  if (!dateString) return "N/A";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const normalizePaymentGateway = (value: any): string => {
  if (!value) return "N/A";

  return String(value)
    .replace(/[_-]/g, " ")
    .toUpperCase();
};

const safeText = (value: any, fallback = "N/A"): string => {
  if (!isPresent(value)) return fallback;

  return String(value);
};

// =====================================================
// API RESPONSE NORMALIZATION
// =====================================================

const normalizeInvoiceResponse = (response: any) => {
  const root = response || {};

  // Supports:
  // 1. API response: { success, data: { invoice, order } }
  // 2. RTK response with nested data
  // 3. Direct payload: { invoice, order }

  const candidates = [
    root?.data?.data,
    root?.data,
    root,
  ];

  const payload =
    candidates.find(
      (candidate: any) =>
        candidate &&
        typeof candidate === "object" &&
        candidate.invoice,
    ) || {};

  return {
    invoice: payload.invoice || {},
    order: payload.order || {},
    invoiceType:
      root?.invoice_type ||
      root?.data?.invoice_type ||
      payload?.invoice_type ||
      "complete",
  };
};

// =====================================================
// ADDRESS HELPERS
// =====================================================

const formatFullAddress = (address: InvoiceRecord | null): string => {
  if (!address) return "N/A";

  const parts = [
    address.address_line_1,
    address.address_line_2,
    address.post_office,
    address.city,
    address.state,
    address.pincode,
    address.country,
  ]
    .filter(isPresent)
    .map((part) => String(part).trim())
    .filter(Boolean);

  return [...new Set(parts)].join(", ") || "N/A";
};

// =====================================================
// ITEM NORMALIZATION
// =====================================================

const normalizeItems = (value: any): InvoiceRecord[] => {
  if (!isPresent(value)) return [];

  if (Array.isArray(value)) {
    return value.filter(
      (item) => item && typeof item === "object",
    );
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return normalizeItems(parsed);
    } catch {
      console.warn("Unable to parse invoice line items");
      return [];
    }
  }

  if (typeof value === "object") {
    return [value];
  }

  return [];
};

const getItemTaxableAmount = (
  item: InvoiceRecord,
): number | null => {
  const quantity = firstNumber(item.quantity) ?? 1;

  const directAmount = firstNumber(
    item.line_price_excl_gst,
    item.line_total_excl_gst,
    item.line_subtotal,
  );

  if (directAmount !== null) {
    return directAmount;
  }

  const unitPrice = firstNumber(
    item.price_excl_gst,
    item.unit_price,
  );

  if (unitPrice !== null) {
    return unitPrice * quantity;
  }

  const inclusiveAmount = firstNumber(
    item.line_price_incl_gst,
    item.line_total_incl_gst,
    item.line_total,
  );

  return inclusiveAmount;
};

const getItemsTotal = (
  items: InvoiceRecord[],
): number | null => {
  if (!items.length) return null;

  let total = 0;

  for (const item of items) {
    const amount = getItemTaxableAmount(item);

    if (amount === null) {
      return null;
    }

    total += amount;
  }

  return total;
};

const getInvoiceItems = (
  invoice: InvoiceRecord,
  order: InvoiceRecord,
  invoiceType: string,
): InvoiceRecord[] => {
  // First preference: actual invoice-specific item data.

  const invoiceItems = normalizeItems(
    firstValue(
      invoice.invoice_items,
      invoice.line_items,
      invoice.items,
    ),
  );

  if (invoiceItems.length > 0) {
    return invoiceItems;
  }

  // Fallback: order item data.
  // For a single-item invoice, verify that its amount agrees
  // with the invoice taxable amount before using it.

  const orderItems = normalizeItems(
    firstValue(
      order.order_items,
      order.order_lines,
      order.items,
    ),
  );

  if (!orderItems.length) {
    return [];
  }

  const isSingleItem = invoiceType === "single_item";

  if (!isSingleItem) {
    return orderItems;
  }

  const invoiceAmount = firstNumber(
    invoice.total_taxable,
    invoice.subtotal_after_discount,
    invoice.subtotal_before_redemption,
    invoice.total,
  );

  const orderItemsAmount = getItemsTotal(orderItems);

  // Do not display a complete-order item as an invoice item
  // when its amount clearly conflicts with the invoice.

  if (
    invoiceAmount !== null &&
    orderItemsAmount !== null &&
    Math.abs(invoiceAmount - orderItemsAmount) > 1
  ) {
    console.warn(
      "Invoice API mismatch: order item amount does not match the single-item invoice.",
      {
        invoiceAmount,
        orderItemsAmount,
        invoiceItems,
        orderItems,
      },
    );

    return [];
  }

  return orderItems;
};

// =====================================================
// ITEM TABLE MAPPING
// =====================================================

const getItemTableRow = (
  item: InvoiceRecord,
  index: number,
): string[] => {
  const quantity = firstNumber(item.quantity) ?? 1;

  const productName = safeText(
    firstValue(
      item.product_name,
      item.name,
      item.title,
    ),
    "Product",
  );

  const hsnCode = safeText(
    firstValue(item.hsn_code, item.hsn_sac_code),
    "-",
  );

  const uom = firstValue(item.uom, item.unit_of_measure);

  const description = uom
    ? `${productName}\nUOM: ${uom}`
    : productName;

  const unitPrice = firstNumber(
    item.unit_price,
    item.price_excl_gst,
    item.price_incl_gst,
  );

  const gstRate = firstValue(
    item.gst_rate_percent,
    item.gst_rate,
    item.tax_rate_percent,
    item.tax_rate,
  );

  const gstLabel = isPresent(gstRate)
    ? `${String(gstRate).replace(/%$/, "")}%`
    : "-";

  const cgst = firstNumber(
    item.line_cgst_amount,
    item.cgst_amount,
  );

  const sgst = firstNumber(
    item.line_sgst_amount,
    item.sgst_amount,
  );

  const igst = firstNumber(
    item.line_igst_amount,
    item.igst_amount,
  );

  let lineAmount = firstNumber(
    item.line_price_incl_gst,
    item.line_total,
    item.line_total_incl_gst,
    item.line_price_excl_gst,
    item.line_total_excl_gst,
    item.total_amount,
    item.amount,
  );

  if (lineAmount === null && unitPrice !== null) {
    lineAmount = unitPrice * quantity;
  }

  return [
    String(index + 1),
    description,
    hsnCode,
    String(quantity),
    formatMoneyCell(unitPrice),
    gstLabel,
    formatMoneyCell(cgst),
    formatMoneyCell(sgst),
    formatMoneyCell(igst),
    formatMoneyCell(lineAmount),
  ];
};

// =====================================================
// INVOICE AMOUNT RESOLUTION
// =====================================================

const getInvoiceAmounts = (
  invoice: InvoiceRecord,
  order: InvoiceRecord,
  invoiceType: string,
) => {
  const isSingleItem = invoiceType === "single_item";

  // Never use whole-order totals as invoice totals
  // for a single-item invoice.

  const orderSubtotal = isSingleItem
    ? undefined
    : order.subtotal;

  const orderShipping = isSingleItem
    ? undefined
    : order.shipping_charge;

  const orderCoin = isSingleItem
    ? undefined
    : firstValue(
        order.coin_redeemed_amount,
        order.coin_redeemed,
      );

  const orderCoupon = isSingleItem
    ? undefined
    : order.coupon_discount;

  const orderCGST = isSingleItem ? undefined : order.total_cgst;
  const orderSGST = isSingleItem ? undefined : order.total_sgst;
  const orderIGST = isSingleItem ? undefined : order.total_igst;
  const orderTax = isSingleItem ? undefined : order.total_gst;
  const orderTotal = isSingleItem ? undefined : order.total_payable;

  const subtotal = firstNumber(
    invoice.subtotal_before_redemption,
    invoice.subtotal_after_discount,
    invoice.total_taxable,
    orderSubtotal,
  );

  const coinRedeemed = firstNumber(
    invoice.coin_redeemed,
    invoice.coin_redeemed_amount,
    orderCoin,
  );

  const couponDiscount = firstNumber(
    invoice.coupon_discount,
    orderCoupon,
  );

  const shippingCharge = firstNumber(
    invoice.shipping_charge,
    orderShipping,
  );

  const taxableAmount = firstNumber(
    invoice.total_taxable,
    invoice.subtotal_after_discount,
    !isSingleItem ? order.summary_data?.net_subtotal : undefined,
  );

  const cgst = firstNumber(
    invoice.total_cgst,
    orderCGST,
  );

  const sgst = firstNumber(
    invoice.total_sgst,
    orderSGST,
  );

  const igst = firstNumber(
    invoice.total_igst,
    orderIGST,
  );

  const taxComponentsProvided = [
    invoice.total_cgst,
    invoice.total_sgst,
    invoice.total_igst,
  ].some(isPresent);

  const calculatedTax =
    taxComponentsProvided
      ? (cgst ?? 0) + (sgst ?? 0) + (igst ?? 0)
      : null;

  const totalTax = firstNumber(
    invoice.total_tax,
    calculatedTax,
    orderTax,
  );

  const invoiceTotal = firstNumber(
    invoice.total,
    !isSingleItem ? order.total : undefined,
  );

  const totalPayable = firstNumber(
    invoice.total_payable,
    orderTotal,
    invoice.total,
  );

  return {
    subtotal,
    coinRedeemed,
    couponDiscount,
    shippingCharge,
    taxableAmount,
    cgst,
    sgst,
    igst,
    totalTax,
    invoiceTotal,
    totalPayable,
  };
};

// =====================================================
// ADDRESS CARD
// =====================================================

const drawAddressCard = (
  doc: jsPDF,
  config: {
    x: number;
    y: number;
    width: number;
    height: number;
    title: string;
    recipient: string;
    phone: string;
    meta: string;
    address: string;
    addressLines: string[];
    nameLines: string[];
  },
) => {
  const {
    x,
    y,
    width,
    height,
    title,
    phone,
    meta,
    addressLines,
    nameLines,
  } = config;

  doc.setFillColor(247, 249, 252);
  doc.setDrawColor(224, 231, 240);

  doc.roundedRect(
    x,
    y,
    width,
    height,
    2,
    2,
    "FD",
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(26, 42, 64);

  doc.text(title, x + 4, y + 7);

  let currentY = y + 14;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(45, 58, 78);

  doc.text(nameLines, x + 4, currentY);

  currentY += nameLines.length * 3.5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.3);
  doc.setTextColor(78, 91, 108);

  doc.text(`Contact: ${phone}`, x + 4, currentY + 2);

  currentY += 5;

  doc.text(meta, x + 4, currentY + 2);

  currentY += 5;

  doc.setFontSize(7.2);
  doc.setTextColor(75, 87, 103);

  doc.text(addressLines, x + 4, currentY + 2);
};

// =====================================================
// MAIN INVOICE GENERATOR
// =====================================================

export const generateInvoicePDF = async (
  response: any,
): Promise<void> => {
  // Open a window immediately to avoid popup blockers
  // while the asynchronous logo is being loaded.

  const previewWindow = window.open("", "_blank");

  try {
    const {
      invoice,
      order,
      invoiceType,
    } = normalizeInvoiceResponse(response);

    if (!Object.keys(invoice).length) {
      throw new Error("Invoice information was not found in API response.");
    }

    const doc = new jsPDF("p", "mm", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // =================================================
    // EXTRACT ACTUAL API DETAILS
    // =================================================

    const seller = invoice.seller || invoice.seller_details || {};

    const buyer = invoice.buyer || invoice.buyer_details || {};

    // IMPORTANT:
    // Billing and delivery addresses are under invoice.buyer.

    const billingAddress =
      buyer.billing_address ||
      invoice.billing_address ||
      {};

    const deliveryAddress =
      buyer.delivery_address ||
      invoice.delivery_address ||
      {};

    const buyerName = safeText(
      firstValue(
        buyer.name,
        order.user?.name,
      ),
      "N/A",
    );

    const billingRecipient = safeText(
      firstValue(
        billingAddress.recipient_name,
        buyerName,
      ),
    );

    const deliveryRecipient = safeText(
      firstValue(
        deliveryAddress.recipient_name,
        buyerName,
      ),
    );

    const sellerName = safeText(seller.name, "IndieKonnect");
    const sellerGSTIN = safeText(seller.gstin);
    const sellerAddress = safeText(seller.address);

    const buyerGSTIN = safeText(buyer.gstin);

    const invoiceNumber = safeText(
      invoice.invoice_number,
      `INV-${invoice.id || "N/A"}`,
    );

    const orderReference = safeText(
      order.order_reference,
    );

    const issueDate = formatDate(
      invoice.issued_at || invoice.created_at,
    );

    const orderDate = formatDate(
      order.confirmed_at || order.created_at,
    );

    const deliveryState = safeText(
      invoice.delivery_state || order.delivery_state,
    );

    const items = getInvoiceItems(
      invoice,
      order,
      invoiceType,
    );

    const amounts = getInvoiceAmounts(
      invoice,
      order,
      invoiceType,
    );

    // =================================================
    // HEADER
    // =================================================

    const headerHeight = 52;

    doc.setFillColor(248, 250, 253);
    doc.rect(0, 0, pageWidth, headerHeight, "F");

    doc.setFillColor(23, 58, 117);
    doc.rect(0, headerHeight, pageWidth, 1.2, "F");

    // Invoice title

    doc.setFont("helvetica", "bold");
    doc.setFontSize(23);
    doc.setTextColor(26, 42, 64);

    doc.text("TAX INVOICE", 20, 19);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(55, 72, 95);

    doc.text(`# ${invoiceNumber}`, 20, 27);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(110, 123, 141);

    doc.text("ORIGINAL FOR RECIPIENT", 20, 34);

    // Seller logo

    try {
      const logoBase64 = await loadLogoWithFallback();

      if (logoBase64) {
        doc.addImage(
          logoBase64,
          "PNG",
          pageWidth - 39,
          5,
          19,
          19,
        );
      }
    } catch (error) {
      console.warn("Invoice logo could not be added:", error);
    }

    // Seller details

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(26, 42, 64);

    doc.text(
      sellerName,
      pageWidth - 20,
      29,
      { align: "right" },
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.3);
    doc.setTextColor(92, 105, 122);

    doc.text(
      `GSTIN: ${sellerGSTIN}`,
      pageWidth - 20,
      35,
      { align: "right" },
    );

    const sellerAddressLines = doc.splitTextToSize(
      sellerAddress,
      85,
    );

    doc.text(
      sellerAddressLines.slice(0, 2),
      pageWidth - 20,
      40,
      { align: "right" },
    );

    // =================================================
    // ORDER / INVOICE INFORMATION
    // =================================================

    const informationY = 62;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(73, 86, 104);

    doc.text(
      `Order Reference: ${orderReference}`,
      20,
      informationY,
    );

    doc.text(
      `Order Date: ${orderDate}`,
      20,
      informationY + 7,
    );

    doc.text(
      `Issue Date: ${issueDate}`,
      pageWidth / 2 + 5,
      informationY,
    );

    doc.text(
      `Place of Supply: ${deliveryState}`,
      pageWidth / 2 + 5,
      informationY + 7,
    );

    // =================================================
    // BILLING AND DELIVERY ADDRESSES
    // =================================================

    const addressY = 79;
    const boxGap = 6;

    const boxWidth =
      (pageWidth - PAGE_MARGIN * 2 - boxGap) / 2;

    const billingAddressText = formatFullAddress(
      billingAddress,
    );

    const deliveryAddressText = formatFullAddress(
      deliveryAddress,
    );

    const billingAddressLines = doc.splitTextToSize(
      billingAddressText,
      boxWidth - 8,
    );

    const deliveryAddressLines = doc.splitTextToSize(
      deliveryAddressText,
      boxWidth - 8,
    );

    const billingNameLines = doc.splitTextToSize(
      billingRecipient,
      boxWidth - 8,
    ).slice(0, 2);

    const deliveryNameLines = doc.splitTextToSize(
      deliveryRecipient,
      boxWidth - 8,
    ).slice(0, 2);

    const addressLineHeight = 3.5;

    const billingCardHeight =
      32 +
      billingNameLines.length * addressLineHeight +
      billingAddressLines.length * addressLineHeight;

    const deliveryCardHeight =
      32 +
      deliveryNameLines.length * addressLineHeight +
      deliveryAddressLines.length * addressLineHeight;

    const addressBoxHeight = Math.max(
      43,
      billingCardHeight,
      deliveryCardHeight,
    );

    drawAddressCard(doc, {
      x: PAGE_MARGIN,
      y: addressY,
      width: boxWidth,
      height: addressBoxHeight,
      title: "BILL TO",
      recipient: billingRecipient,
      phone: safeText(billingAddress.contact_number),
      meta: `Buyer GSTIN: ${buyerGSTIN}`,
      address: billingAddressText,
      addressLines: billingAddressLines,
      nameLines: billingNameLines,
    });

    drawAddressCard(doc, {
      x: PAGE_MARGIN + boxWidth + boxGap,
      y: addressY,
      width: boxWidth,
      height: addressBoxHeight,
      title: "SHIP TO",
      recipient: deliveryRecipient,
      phone: safeText(deliveryAddress.contact_number),
      meta: `Place of Supply: ${deliveryState}`,
      address: deliveryAddressText,
      addressLines: deliveryAddressLines,
      nameLines: deliveryNameLines,
    });

    // =================================================
    // ITEM TABLE
    // =================================================

    const tableStartY = addressY + addressBoxHeight + 9;

    const tableHeaders = [
      "#",
      "Description",
      "HSN",
      "Qty",
      "Unit Price",
      "GST %",
      "CGST",
      "SGST",
      "IGST",
      "Amount",
    ];

    const tableRows: string[][] = items.length
      ? items.map(getItemTableRow)
      : [
          [
            "1",
            invoiceType === "single_item"
              ? "Invoice-specific item details not provided by API"
              : "Item details unavailable",
            "-",
            "-",
            "-",
            "-",
            "-",
            "-",
            "-",
            "-",
          ],
        ];

    autoTable(doc, {
      startY: tableStartY,

      head: [tableHeaders],

      body: tableRows,

      theme: "striped",

      showHead: "everyPage",

      tableLineColor: [228, 234, 242],

      tableLineWidth: 0.1,

      headStyles: {
        fillColor: [23, 58, 117],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 7,
        halign: "center",
        cellPadding: 2.3,
      },

      bodyStyles: {
        fontSize: 7,
        textColor: [58, 70, 87],
        cellPadding: 2.4,
        valign: "middle",
        lineColor: [232, 237, 244],
        lineWidth: 0.1,
      },

      alternateRowStyles: {
        fillColor: [248, 250, 253],
      },

      columnStyles: {
        0: {
          cellWidth: 7,
          halign: "center",
        },

        1: {
          cellWidth: 42,
          halign: "left",
        },

        2: {
          cellWidth: 14,
          halign: "center",
        },

        3: {
          cellWidth: 9,
          halign: "center",
        },

        4: {
          cellWidth: 21,
          halign: "right",
        },

        5: {
          cellWidth: 12,
          halign: "center",
        },

        6: {
          cellWidth: 16,
          halign: "right",
        },

        7: {
          cellWidth: 16,
          halign: "right",
        },

        8: {
          cellWidth: 16,
          halign: "right",
        },

        9: {
          cellWidth: 22,
          halign: "right",
          fontStyle: "bold",
        },
      },

      styles: {
        overflow: "linebreak",
        cellWidth: "wrap",
        font: "helvetica",
      },

      margin: {
        left: PAGE_MARGIN,
        right: PAGE_MARGIN,
        bottom: FOOTER_HEIGHT,
      },

      rowPageBreak: "avoid",
    });

    // =================================================
    // INVOICE SUMMARY
    // =================================================

    let summaryRows: {
      label: string;
      value: string;
      isTotal?: boolean;
    }[] = [];

    const addSummaryRow = (
      label: string,
      amount: number | null,
    ) => {
      if (amount === null) return;

      summaryRows.push({
        label,
        value: formatPrice(amount),
      });
    };

    // Subtotal

    addSummaryRow(
      "Subtotal",
      amounts.subtotal,
    );

    // Redemptions and discounts

    if (
      amounts.coinRedeemed !== null &&
      amounts.coinRedeemed > 0
    ) {
      summaryRows.push({
        label: "Coin Redeemed",
        value: `-${formatPrice(amounts.coinRedeemed)}`,
      });
    }

    if (
      amounts.couponDiscount !== null &&
      amounts.couponDiscount > 0
    ) {
      summaryRows.push({
        label: `Coupon Discount${
          invoice.coupon_code
            ? ` (${invoice.coupon_code})`
            : ""
        }`,
        value: `-${formatPrice(amounts.couponDiscount)}`,
      });
    }

    // Taxable amount, only when different from subtotal.

    if (
      amounts.taxableAmount !== null &&
      (
        amounts.subtotal === null ||
        Math.abs(
          amounts.taxableAmount - amounts.subtotal,
        ) > 0.01
      )
    ) {
      addSummaryRow(
        "Taxable Amount",
        amounts.taxableAmount,
      );
    }

    // GST components

    const hasTaxComponents =
      (amounts.cgst ?? 0) > 0 ||
      (amounts.sgst ?? 0) > 0 ||
      (amounts.igst ?? 0) > 0;

    if (hasTaxComponents) {
      addSummaryRow("CGST", amounts.cgst);
      addSummaryRow("SGST", amounts.sgst);
      addSummaryRow("IGST", amounts.igst);
    } else {
      addSummaryRow(
        "Total GST",
        amounts.totalTax,
      );
    }

    // Shipping

    if (
      amounts.shippingCharge !== null &&
      amounts.shippingCharge > 0
    ) {
      addSummaryRow(
        "Shipping Charges",
        amounts.shippingCharge,
      );
    }

    // Invoice total and payable

    if (
      amounts.invoiceTotal !== null &&
      (
        amounts.totalPayable === null ||
        Math.abs(
          amounts.invoiceTotal - amounts.totalPayable,
        ) > 0.01
      )
    ) {
      addSummaryRow(
        "Invoice Total",
        amounts.invoiceTotal,
      );
    }

    if (amounts.totalPayable !== null) {
      summaryRows.push({
        label: "TOTAL PAYABLE",
        value: formatPrice(amounts.totalPayable),
        isTotal: true,
      });
    }

    let summaryStartY =
      ((doc as any).lastAutoTable?.finalY ||
        tableStartY) + 8;

    // Give summary enough room and avoid placing
    // it against the bottom of an item-table page.

    if (summaryStartY > pageHeight - 85) {
      doc.addPage();
      summaryStartY = 22;
    }

    const summaryWidth = 94;

    const summaryLeft =
      pageWidth - PAGE_MARGIN - summaryWidth;

    autoTable(doc, {
      startY: summaryStartY,

      body: summaryRows.map((row) => [
        row.label,
        row.value,
      ]),

      theme: "plain",

      tableWidth: summaryWidth,

      styles: {
        font: "helvetica",
        fontSize: 8.3,
        textColor: [65, 78, 96],
        cellPadding: 2.5,
      },

      columnStyles: {
        0: {
          cellWidth: 59,
          halign: "right",
        },

        1: {
          cellWidth: 35,
          halign: "right",
        },
      },

      margin: {
        left: summaryLeft,
        right: PAGE_MARGIN,
        bottom: FOOTER_HEIGHT,
      },

      didParseCell: (hookData: any) => {
        if (
          hookData.section === "body" &&
          summaryRows[hookData.row.index]?.isTotal
        ) {
          hookData.cell.styles.fontStyle = "bold";
          hookData.cell.styles.fontSize = 10;
          hookData.cell.styles.textColor = [23, 58, 117];
          hookData.cell.styles.fillColor = [237, 243, 252];
        }
      },
    });

    // =================================================
    // PAYMENT DETAILS
    // =================================================

    let paymentY =
      ((doc as any).lastAutoTable?.finalY || summaryStartY) + 9;

    if (paymentY > pageHeight - 43) {
      doc.addPage();
      paymentY = 24;
    }

    const paymentGateway = normalizePaymentGateway(
      order.payment_gateway,
    );

    const transactionId = safeText(
      order.gateway_transaction_id,
    );

    doc.setDrawColor(224, 231, 240);
    doc.line(
      PAGE_MARGIN,
      paymentY,
      pageWidth - PAGE_MARGIN,
      paymentY,
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(26, 42, 64);

    doc.text(
      "PAYMENT DETAILS",
      PAGE_MARGIN,
      paymentY + 7,
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.8);
    doc.setTextColor(80, 92, 108);

    doc.text(
      `Payment Method: ${paymentGateway}`,
      PAGE_MARGIN,
      paymentY + 14,
    );

    doc.text(
      `Transaction Reference: ${transactionId}`,
      PAGE_MARGIN,
      paymentY + 20,
    );

    // order.amount_paid is deliberately not shown for a
    // single-item invoice because it represents the
    // complete order amount, not necessarily this invoice.

    if (invoiceType !== "single_item") {
      const amountPaid = firstNumber(order.amount_paid);

      if (amountPaid !== null) {
        doc.text(
          `Amount Paid: ${formatPrice(amountPaid)}`,
          PAGE_MARGIN,
          paymentY + 26,
        );
      }
    }

    // =================================================
    // FOOTER AND PAGE NUMBERS
    // =================================================

    const pageCount = doc.getNumberOfPages();

    for (let page = 1; page <= pageCount; page++) {
      doc.setPage(page);

      doc.setDrawColor(224, 231, 240);

      doc.line(
        PAGE_MARGIN,
        pageHeight - 16,
        pageWidth - PAGE_MARGIN,
        pageHeight - 16,
      );

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(135, 146, 160);

      doc.text(
        "This is a system-generated invoice. No signature required.",
        PAGE_MARGIN,
        pageHeight - 9,
      );

      doc.text(
        `Page ${page} of ${pageCount}`,
        pageWidth - PAGE_MARGIN,
        pageHeight - 9,
        { align: "right" },
      );
    }

    // =================================================
    // OPEN / DOWNLOAD PDF
    // =================================================

    const pdfBlob = doc.output("blob");

    const pdfUrl = URL.createObjectURL(pdfBlob);

    if (previewWindow && !previewWindow.closed) {
      previewWindow.location.href = pdfUrl;
    } else {
      // Browser blocked the popup: download instead.
      doc.save(`${invoiceNumber}.pdf`);
    }

    // Keep the object URL available while the PDF opens.
    window.setTimeout(() => {
      URL.revokeObjectURL(pdfUrl);
    }, 60000);

  } catch (error) {
    console.error("Invoice PDF generation failed:", error);

    if (previewWindow && !previewWindow.closed) {
      previewWindow.close();
    }

    throw error;
  }
};
