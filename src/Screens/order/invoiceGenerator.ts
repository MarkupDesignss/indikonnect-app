import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Try multiple logo paths - use relative path that works in both dev and prod
const LOGO_PATHS = [
  "/indiekonnect-web/images/logo.png",
  "/images/logo.png",
  "/logo.png",
  "/indiekonnect-web/images/logo.svg",
];

// ===== HELPER: image URL ko base64 data URL me convert karta hai =====
const loadImageAsBase64 = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context not available"));
        return;
      }
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => {
      // Try next path
      reject(new Error(`Failed to load image from: ${url}`));
    };
    img.src = url;
  });
};

const loadLogoWithFallback = async (): Promise<string | null> => {
  for (const path of LOGO_PATHS) {
    try {
      const base64 = await loadImageAsBase64(path);
      return base64;
    } catch (err) {
      console.warn(`Logo not found at ${path}, trying next...`);
    }
  }
  return null;
};

// ===== FORMAT HELPERS =====
const formatPrice = (amount: string | number) => {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  const safeNum = isNaN(num) ? 0 : num;
  return `Rs. ${safeNum.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "N/A";
  }
};

// ===== MAIN INVOICE GENERATOR =====
export const generateInvoicePDF = async (data: any) => {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();

  // ===== HEADER =====
  const headerHeight = 40;
  doc.setFillColor(251, 248, 242);
  doc.rect(0, 0, pageWidth, headerHeight, "F");

  // Thin accent bar
  doc.setFillColor(26, 26, 46);
  doc.rect(0, headerHeight, pageWidth, 1.2, "F");

  doc.setFontSize(24);
  doc.setTextColor(26, 26, 46);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", 20, 20);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");

  // Safe invoice number
  const invoiceNumber = data?.invoice?.invoice_number || "N/A";
  doc.text(`#${invoiceNumber}`, 20, 28);

  doc.setFontSize(9);
  doc.setTextColor(140, 140, 140);
  doc.setFont("helvetica", "normal");
  doc.text("TAX INVOICE", 20, 34);

  // ===== LOGO (with fallback) =====
  try {
    const logoBase64 = await loadLogoWithFallback();
    if (logoBase64) {
      const logoWidth = 22;
      const logoHeight = 22;
      doc.addImage(
        logoBase64,
        "PNG",
        pageWidth - 20 - logoWidth,
        6,
        logoWidth,
        logoHeight
      );
    }
  } catch (err) {
    console.warn("Could not load logo for invoice:", err);
  }

  // Seller details (right side)
  const sellerName = data?.invoice?.seller_details?.name || "IndieKonnect";
  doc.setFontSize(10);
  doc.setTextColor(26, 26, 46);
  doc.setFont("helvetica", "bold");
  doc.text(sellerName, pageWidth - 20, 33, { align: "right" });

  const sellerGstin = data?.invoice?.seller_details?.gstin || "N/A";
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");
  doc.text(`GSTIN: ${sellerGstin}`, pageWidth - 20, 38, { align: "right" });

  // ===== ORDER DETAILS =====
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.setFont("helvetica", "normal");

  const orderRef = data?.order?.order_reference || "N/A";
  doc.text(`Order Reference: ${orderRef}`, 20, 52);

  const orderDate = formatDate(data?.order?.confirmed_at);
  doc.text(`Order Date: ${orderDate}`, 20, 59);

  const issueDate = formatDate(data?.invoice?.issued_at);
  doc.text(`Issue Date: ${issueDate}`, 20, 66);

  const sellerAddress = data?.invoice?.seller_details?.address || "";
  if (sellerAddress) {
    doc.text(sellerAddress, pageWidth - 20, 66, {
      align: "right",
      maxWidth: 80,
    });
  }

  // ===== BUYER DETAILS =====
  doc.setFillColor(245, 245, 245);
  doc.rect(20, 74, 170, 28, "F");
  doc.setDrawColor(225, 225, 225);
  doc.rect(20, 74, 170, 28);

  doc.setFontSize(10);
  doc.setTextColor(26, 26, 46);
  doc.setFont("helvetica", "bold");
  doc.text("Bill To:", 24, 82);

  const buyerName = data?.invoice?.buyer_details?.name || "N/A";
  const buyerAddress = data?.invoice?.buyer_details?.address || "N/A";
  const buyerGstin = data?.invoice?.buyer_details?.gstin;

  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  doc.setFont("helvetica", "normal");
  doc.text(buyerName, 24, 90);
  doc.text(buyerAddress, 24, 97);
  if (buyerGstin) {
    doc.text(`GSTIN: ${buyerGstin}`, 24, 104);
  }

  // ===== ITEMS TABLE =====
  let lineItems: any[] = [];
  try {
    if (typeof data?.invoice?.line_items === "string") {
      lineItems = JSON.parse(data.invoice.line_items);
    } else if (Array.isArray(data?.invoice?.line_items)) {
      lineItems = data.invoice.line_items;
    } else if (Array.isArray(data?.order_lines)) {
      lineItems = data.order_lines;
    }
  } catch (e) {
    console.warn("Could not parse line items:", e);
  }

  if (lineItems.length === 0) {
    // Use a fallback
    lineItems = [{
      product_name: "Product",
      quantity: 1,
      unit_price: 0,
      gst_rate: 0,
      gst_amount: 0,
      line_total: 0,
    }];
  }

  const tableHeaders = ["S.N", "Product", "Qty", "Unit Price", "GST %", "Tax", "Total"];
  const tableRows = lineItems.map((item: any, index: number) => [
    (index + 1).toString(),
    item.product_name || "Product",
    (item.quantity || 1).toString(),
    formatPrice(item.unit_price || 0),
    `${item.gst_rate || 0}%`,
    formatPrice(item.gst_amount || 0),
    formatPrice(item.line_total || 0),
  ]);

  const startY = buyerGstin ? 114 : 109;

  autoTable(doc, {
    startY: startY,
    head: [tableHeaders],
    body: tableRows,
    theme: "striped",
    headStyles: {
      fillColor: [26, 26, 46],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
      halign: "center",
      cellPadding: 3,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [60, 60, 60],
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: [248, 248, 250],
    },
    columnStyles: {
      0: { cellWidth: 14, halign: "center" },
      1: { cellWidth: 58, halign: "left" },
      2: { cellWidth: 14, halign: "center" },
      3: { cellWidth: 26, halign: "right" },
      4: { cellWidth: 20, halign: "center", cellPadding: { top: 3, bottom: 3, left: 1, right: 1 } },
      5: { cellWidth: 22, halign: "right" },
      6: { cellWidth: 26, halign: "right" },
    },
    styles: {
      overflow: "linebreak",
      cellWidth: "wrap",
    },
    margin: { left: 20, right: 20 },
  });

  // ===== SUMMARY =====
  const finalY = (doc as any).lastAutoTable.finalY + 10;

  const orderSubtotal = data?.order?.subtotal || 0;
  const shippingCharge = data?.order?.shipping_charge || 0;
  const couponDiscount = parseFloat(data?.invoice?.coupon_discount) || 0;
  const totalGst = data?.order?.total_gst || 0;
  const totalPayable = data?.order?.total_payable || data?.invoice?.total_payable || 0;

  const summaryData: string[][] = [
    ["Subtotal", formatPrice(orderSubtotal)],
    ["Shipping", formatPrice(shippingCharge)],
  ];

  if (couponDiscount > 0) {
    summaryData.push(["Coupon Discount", `-${formatPrice(couponDiscount)}`]);
  }

  summaryData.push(
    ["Total GST", formatPrice(totalGst)],
    ["", ""],
    ["Total Payable", formatPrice(totalPayable)]
  );

  autoTable(doc, {
    startY: finalY,
    body: summaryData,
    theme: "plain",
    styles: {
      fontSize: 9,
      textColor: [60, 60, 60],
    },
    columnStyles: {
      0: { cellWidth: 130, halign: "right" },
      1: { cellWidth: 40, halign: "right" },
    },
    margin: { left: 20, right: 20 },
    didParseCell: (cellData: any) => {
      if (cellData.section === "body" && cellData.row.index === summaryData.length - 1) {
        cellData.cell.styles.fontStyle = "bold";
        cellData.cell.styles.fontSize = 12;
        cellData.cell.styles.textColor = [26, 26, 46];
        cellData.cell.styles.fillColor = [251, 248, 242];
      }
    },
  });

  // Thin rule above the "Total Payable" row
  const totalRowY = (doc as any).lastAutoTable.finalY - 9;
  doc.setDrawColor(26, 26, 46);
  doc.setLineWidth(0.4);
  doc.line(pageWidth - 60 - 130, totalRowY, pageWidth - 20, totalRowY);

  // ===== PAYMENT DETAILS =====
  const paymentY = (doc as any).lastAutoTable.finalY + 8;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");
  const paymentMethod = data?.order?.payment_gateway?.toUpperCase() || "N/A";
  doc.text(`Payment Method: ${paymentMethod}`, 20, paymentY);
  const transactionId = data?.order?.gateway_transaction_id || "N/A";
  doc.text(`Transaction ID: ${transactionId}`, 20, paymentY + 5);

  // ===== FOOTER =====
  doc.setDrawColor(200, 200, 200);
  doc.line(20, paymentY + 12, pageWidth - 20, paymentY + 12);

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.setFont("helvetica", "normal");
  doc.text("Thank you for your business!", pageWidth / 2, paymentY + 22, { align: "center" });
  doc.text("This is a system generated invoice. No signature required.", pageWidth / 2, paymentY + 28, { align: "center" });

  // Page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(170, 170, 170);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 20, doc.internal.pageSize.getHeight() - 8, {
      align: "right",
    });
  }

  // ===== SAVE / OPEN PDF =====
  const pdfBlob = doc.output("blob");
  const pdfUrl = URL.createObjectURL(pdfBlob);
  window.open(pdfUrl, "_blank");
  
  // Clean up URL after a delay
  setTimeout(() => {
    URL.revokeObjectURL(pdfUrl);
  }, 30000);
};