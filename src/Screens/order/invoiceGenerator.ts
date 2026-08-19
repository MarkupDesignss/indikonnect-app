import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
const LOGO_PATH = "../../../public/indiekonnect-web/images/logo.png";

interface InvoiceData {
  invoice: {
    invoice_number: string;
    issued_at: string;
    subtotal_before_redemption: string;
    coin_redeemed: string;
    total_taxable: string;
    total_cgst: string;
    total_sgst: string;
    total_igst: string;
    total_tax: string;
    coupon_code: string | null;
    coupon_discount: string;
    shipping_charge: string;
    subtotal_after_discount: string;
    total: string;
    total_payable: string;
    line_items: string | any[];
    summary_snapshot: string;
    seller_details: {
      name: string;
      gstin: string;
      address: string;
    };
    buyer_details: {
      name: string;
      gstin: string;
      address: string;
    };
    delivery_state: string;
  };
  order: {
    order_reference: string;
    order_type: string;
    subtotal: string;
    total_gst: string;
    shipping_charge: string;
    total_payable: string;
    payment_gateway: string;
    gateway_transaction_id: string;
    confirmed_at: string;
    status: string;
  };
  order_lines: Array<{
    id: number;
    product_name: string;
    product_code: string;
    quantity: number;
    unit_price: string;
    gst_rate: string;
    gst_amount: string;
    line_total: string;
    product_image?: string;
  }>;
}

// ===== HELPER: image URL ko base64 data URL me convert karta hai =====
// jsPDF ka addImage() ko reliably kaam karne ke liye base64 chahiye hota hai.
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
    img.onerror = () => reject(new Error("Failed to load logo image"));
    img.src = url;
  });
};

// NOTE: function ab async hai (logo load karne ke liye), isliye jahan bhi
// generateInvoicePDF() call ho raha hai wahan `await generateInvoicePDF(data)`
// ya `.then()` use karna hoga.
export const generateInvoicePDF = async (data: InvoiceData) => {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();

  // ===== FORMAT HELPERS =====
  // IMPORTANT: jsPDF's built-in fonts (helvetica/times/courier) do NOT support
  // the ₹ glyph. If you print "₹" directly, jsPDF silently substitutes a wrong
  // character (commonly shows up as a stray "1" before the number, e.g.
  // "₹420.00" renders as "1420.00"). Fix: use "Rs. " text instead of the symbol.
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
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ===== HEADER =====
  const headerHeight = 40;
  doc.setFillColor(251, 248, 242);
  doc.rect(0, 0, pageWidth, headerHeight, "F");

  // Thin accent bar under the header for a slightly more premium look
  doc.setFillColor(26, 26, 46);
  doc.rect(0, headerHeight, pageWidth, 1.2, "F");

  doc.setFontSize(24);
  doc.setTextColor(26, 26, 46);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", 20, 20);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");
  doc.text(`#${data.invoice.invoice_number}`, 20, 28);

  doc.setFontSize(9);
  doc.setTextColor(140, 140, 140);
  doc.setFont("helvetica", "normal");
  doc.text("TAX INVOICE", 20, 34);

  // ===== LOGO + SELLER DETAILS (Right side) =====
  // FIX: was calling loadImageAsBase64(logoImage) — "logoImage" doesn't exist
  // anymore (renamed to LOGO_PATH), which is an undefined-variable error and
  // fails the whole TS compile, so NOTHING in this file — not even the
  // seller name text below — was actually running. Using LOGO_PATH now.
  try {
    const logoBase64 = await loadImageAsBase64(LOGO_PATH);
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
  } catch (err) {
    // Agar logo load na ho paaye toh bina crash kiye invoice generate hota rahega.
    console.error(`Invoice logo could not be loaded from "${LOGO_PATH}":`, err);
  }

  doc.setFontSize(10);
  doc.setTextColor(26, 26, 46);
  doc.setFont("helvetica", "bold");
  doc.text(data.invoice.seller_details.name, pageWidth - 20, 33, { align: "right" });

  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");
  doc.text(`GSTIN: ${data.invoice.seller_details.gstin || "N/A"}`, pageWidth - 20, 38, { align: "right" });

  // ===== ORDER DETAILS =====
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.setFont("helvetica", "normal");

  doc.text(`Order Reference: ${data.order.order_reference}`, 20, 52);
  doc.text(`Order Date: ${formatDate(data.order.confirmed_at)}`, 20, 59);
  doc.text(`Issue Date: ${formatDate(data.invoice.issued_at)}`, 20, 66);
  doc.text(data.invoice.seller_details.address || "", pageWidth - 20, 66, {
    align: "right",
    maxWidth: 80,
  });

  // ===== BUYER DETAILS =====
  doc.setFillColor(245, 245, 245);
  doc.rect(20, 74, 170, 28, "F");
  doc.setDrawColor(225, 225, 225);
  doc.rect(20, 74, 170, 28);

  doc.setFontSize(10);
  doc.setTextColor(26, 26, 46);
  doc.setFont("helvetica", "bold");
  doc.text("Bill To:", 24, 82);

  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  doc.setFont("helvetica", "normal");
  doc.text(data.invoice.buyer_details.name || "N/A", 24, 90);
  doc.text(data.invoice.buyer_details.address || "N/A", 24, 97);
  if (data.invoice.buyer_details.gstin) {
    doc.text(`GSTIN: ${data.invoice.buyer_details.gstin}`, 24, 104);
  }

  // ===== ITEMS TABLE (product-wise) =====
  const lineItems = typeof data.invoice.line_items === "string"
    ? JSON.parse(data.invoice.line_items)
    : data.invoice.line_items;

  const tableHeaders = ["S.N", "Product", "Qty", "Unit Price", "GST %", "Tax", "Total"];
  const tableRows = lineItems.map((item: any, index: number) => [
    (index + 1).toString(),
    item.product_name,
    item.quantity.toString(),
    formatPrice(item.unit_price),
    `${item.gst_rate || 0}%`,
    formatPrice(item.gst_amount || 0),
    formatPrice(item.line_total),
  ]);

  const startY = data.invoice.buyer_details.gstin ? 114 : 109;

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

  const summaryData: string[][] = [
    ["Subtotal", formatPrice(data.order.subtotal)],
    ["Shipping", formatPrice(data.order.shipping_charge)],
  ];

  if (parseFloat(data.invoice.coupon_discount) > 0) {
    summaryData.push(["Coupon Discount", `-${formatPrice(data.invoice.coupon_discount)}`]);
  }

  summaryData.push(
    ["Total GST", formatPrice(data.order.total_gst)],
    ["", ""],
    ["Total Payable", formatPrice(data.order.total_payable)]
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

  // Thin rule above the "Total Payable" row for emphasis
  const totalRowY = (doc as any).lastAutoTable.finalY - 9;
  doc.setDrawColor(26, 26, 46);
  doc.setLineWidth(0.4);
  doc.line(pageWidth - 60 - 130, totalRowY, pageWidth - 20, totalRowY);

  // ===== PAYMENT DETAILS =====
  const paymentY = (doc as any).lastAutoTable.finalY + 8;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");
  doc.text(`Payment Method: ${data.order.payment_gateway?.toUpperCase() || "N/A"}`, 20, paymentY);
  doc.text(`Transaction ID: ${data.order.gateway_transaction_id || "N/A"}`, 20, paymentY + 5);

  // ===== FOOTER =====
  doc.setDrawColor(200, 200, 200);
  doc.line(20, paymentY + 12, pageWidth - 20, paymentY + 12);

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.setFont("helvetica", "normal");
  doc.text("Thank you for your business!", pageWidth / 2, paymentY + 22, { align: "center" });
  doc.text("This is a system generated invoice. No signature required.", pageWidth / 2, paymentY + 28, { align: "center" });

  // Page number (useful if items overflow to page 2+)
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
};