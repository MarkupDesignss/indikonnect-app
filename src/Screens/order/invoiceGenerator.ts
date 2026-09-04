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

// ===== FORMAT ADDRESS =====
const formatFullAddress = (addr: any): string => {
  if (!addr) return "N/A";
  
  const parts: string[] = [];
  
  if (addr.address_line_1) parts.push(addr.address_line_1);
  if (addr.address_line_2) parts.push(addr.address_line_2);
  
  const cityStateParts: string[] = [];
  if (addr.city) cityStateParts.push(addr.city);
  if (addr.state) cityStateParts.push(addr.state);
  if (addr.pincode) cityStateParts.push(addr.pincode);
  
  if (cityStateParts.length > 0) {
    parts.push(cityStateParts.join(", "));
  }
  
  if (addr.country) parts.push(addr.country);
  
  return parts.join(", ") || "N/A";
};

// ===== MAIN INVOICE GENERATOR =====
export const generateInvoicePDF = async (data: any) => {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

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

  const invoiceNumber = data?.invoice?.invoice_number || "N/A";
  doc.text(`#${invoiceNumber}`, 20, 28);

  doc.setFontSize(9);
  doc.setTextColor(140, 140, 140);
  doc.setFont("helvetica", "normal");
  doc.text("TAX INVOICE", 20, 34);

  // ===== LOGO =====
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
  const sellerName = data?.invoice?.seller?.name || data?.invoice?.seller_details?.name || "IndieKonnect";
  doc.setFontSize(10);
  doc.setTextColor(26, 26, 46);
  doc.setFont("helvetica", "bold");
  doc.text(sellerName, pageWidth - 20, 33, { align: "right" });

  const sellerGstin = data?.invoice?.seller?.gstin || data?.invoice?.seller_details?.gstin || "N/A";
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

  const orderDate = formatDate(data?.order?.confirmed_at || data?.order?.order_date);
  doc.text(`Order Date: ${orderDate}`, 20, 59);

  const issueDate = formatDate(data?.invoice?.issued_at);
  doc.text(`Issue Date: ${issueDate}`, 20, 66);

  // ===== BILLING & SHIPPING ADDRESSES =====
  const billingAddress = data?.order?.billing_address || {};
  const deliveryAddress = data?.order?.delivery_address || {};
  const buyerName = data?.invoice?.buyer?.name || data?.invoice?.buyer_details?.name || data?.order?.user?.name || "N/A";
  
  const billingAddrStr = formatFullAddress(billingAddress);
  const deliveryAddrStr = formatFullAddress(deliveryAddress);

  // Address section start Y
  let addressStartY = 74;
  const boxWidth = 82;
  const boxHeight = 35;
  const gap = 6;
  
  // ===== BILLING ADDRESS BOX =====
  doc.setFillColor(245, 245, 245);
  doc.rect(20, addressStartY, boxWidth, boxHeight, "F");
  doc.setDrawColor(225, 225, 225);
  doc.rect(20, addressStartY, boxWidth, boxHeight);

  doc.setFontSize(9);
  doc.setTextColor(26, 26, 46);
  doc.setFont("helvetica", "bold");
  doc.text("Billing Address:", 24, addressStartY + 7);

  doc.setFontSize(8.5);
  doc.setTextColor(60, 60, 60);
  doc.setFont("helvetica", "normal");
  
  const billBuyerName = data?.invoice?.buyer?.name || data?.invoice?.buyer_details?.name || buyerName;
  doc.text(billBuyerName, 24, addressStartY + 14);
  
  const billAddrLines = doc.splitTextToSize(billingAddrStr, boxWidth - 10);
  let billY = addressStartY + 20;
  billAddrLines.forEach((line: string) => {
    if (billY < addressStartY + boxHeight - 3) {
      doc.text(line, 24, billY);
      billY += 4.5;
    }
  });

  // ===== SHIPPING ADDRESS BOX =====
  const shipX = 20 + boxWidth + gap;
  doc.setFillColor(245, 245, 245);
  doc.rect(shipX, addressStartY, boxWidth, boxHeight, "F");
  doc.setDrawColor(225, 225, 225);
  doc.rect(shipX, addressStartY, boxWidth, boxHeight);

  doc.setFontSize(9);
  doc.setTextColor(26, 26, 46);
  doc.setFont("helvetica", "bold");
  doc.text("Shipping Address:", shipX + 4, addressStartY + 7);

  doc.setFontSize(8.5);
  doc.setTextColor(60, 60, 60);
  doc.setFont("helvetica", "normal");
  
  const shipName = data?.order?.user?.name || buyerName;
  doc.text(shipName, shipX + 4, addressStartY + 14);
  
  const shipAddrLines = doc.splitTextToSize(deliveryAddrStr, boxWidth - 10);
  let shipY = addressStartY + 20;
  shipAddrLines.forEach((line: string) => {
    if (shipY < addressStartY + boxHeight - 3) {
      doc.text(line, shipX + 4, shipY);
      shipY += 4.5;
    }
  });

  addressStartY += boxHeight + 6;

  // ===== ITEMS TABLE =====
  let lineItems: any[] = [];
  try {
    if (Array.isArray(data?.order?.order_items)) {
      lineItems = data.order.order_items;
    } else if (typeof data?.invoice?.line_items === "string") {
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
    lineItems = [{
      product_name: "Product",
      quantity: 1,
      unit_price: 0,
      gst_rate: 0,
      cgst_amount: 0,
      sgst_amount: 0,
      igst_amount: 0,
      line_total: 0,
    }];
  }

  const tableHeaders = [
    "#", 
    "Product", 
    "Qty", 
    "Unit Price", 
    "GST %", 
    "CGST", 
    "SGST", 
    "IGST", 
    "Total"
  ];
  
  const tableRows = lineItems.map((item: any, index: number) => {
    const cgstAmount = parseFloat(item.cgst_amount || 0);
    const sgstAmount = parseFloat(item.sgst_amount || 0);
    const igstAmount = parseFloat(item.igst_amount || 0);
    const gstRate = parseFloat(item.gst_rate || 0);
    const hasTax = gstRate > 0 || cgstAmount > 0 || sgstAmount > 0 || igstAmount > 0;
    
    return [
      (index + 1).toString(),
      item.product_name || "Product",
      (item.quantity || 1).toString(),
      formatPrice(item.unit_price || 0),
      hasTax ? `${gstRate}%` : "-",
      hasTax ? formatPrice(cgstAmount) : "-",
      hasTax ? formatPrice(sgstAmount) : "-",
      hasTax ? formatPrice(igstAmount) : "-",
      formatPrice(item.line_total || 0),
    ];
  });

  const startY = addressStartY + 2;

  autoTable(doc, {
    startY: startY,
    head: [tableHeaders],
    body: tableRows,
    theme: "striped",
    headStyles: {
      fillColor: [26, 26, 46],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7.5,
      halign: "center",
      cellPadding: 2,
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [60, 60, 60],
      cellPadding: 2,
    },
    alternateRowStyles: {
      fillColor: [248, 248, 250],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 45, halign: "left" },
      2: { cellWidth: 10, halign: "center" },
      3: { cellWidth: 22, halign: "right" },
      4: { cellWidth: 15, halign: "center" },
      5: { cellWidth: 18, halign: "right" },
      6: { cellWidth: 18, halign: "right" },
      7: { cellWidth: 18, halign: "right" },
      8: { cellWidth: 22, halign: "right" },
    },
    styles: {
      overflow: "linebreak",
      cellWidth: "wrap",
    },
    margin: { left: 20, right: 20 },
  });

  // ===== SUMMARY =====
  const finalY = (doc as any).lastAutoTable.finalY + 6;

  let summaryStartY = finalY;
  if (summaryStartY > pageHeight - 80) {
    doc.addPage();
    summaryStartY = 20;
  }

  const orderSubtotal = parseFloat(data?.order?.subtotal || 0);
  const shippingCharge = parseFloat(data?.order?.shipping_charge || 0);
  const couponDiscount = parseFloat(data?.invoice?.coupon_discount || data?.order?.coupon_discount || 0);
  const totalGst = parseFloat(data?.order?.total_gst || data?.invoice?.total_tax || 0);
  const totalPayable = parseFloat(data?.order?.total_payable || data?.invoice?.total_payable || 0);
  const coinRedeemed = parseFloat(data?.order?.coin_redeemed_amount || data?.invoice?.coin_redeemed || 0);
  const totalCgst = parseFloat(data?.order?.total_cgst || data?.invoice?.total_cgst || 0);
  const totalSgst = parseFloat(data?.order?.total_sgst || data?.invoice?.total_sgst || 0);
  const totalIgst = parseFloat(data?.order?.total_igst || data?.invoice?.total_igst || 0);

  const summaryData: string[][] = [
    ["Subtotal", formatPrice(orderSubtotal)],
  ];

  if (shippingCharge > 0) {
    summaryData.push(["Shipping Charges", formatPrice(shippingCharge)]);
  }

  if (couponDiscount > 0) {
    summaryData.push(["Coupon Discount", `-${formatPrice(couponDiscount)}`]);
  }

  if (coinRedeemed > 0) {
    summaryData.push(["Coin Redeemed", `-${formatPrice(coinRedeemed)}`]);
  }

  if (totalCgst > 0) {
    summaryData.push(["CGST", formatPrice(totalCgst)]);
  }
  if (totalSgst > 0) {
    summaryData.push(["SGST", formatPrice(totalSgst)]);
  }
  if (totalIgst > 0) {
    summaryData.push(["IGST", formatPrice(totalIgst)]);
  }

  summaryData.push(
    ["Total GST", formatPrice(totalGst)],
    ["", ""],
    ["Total Payable", formatPrice(totalPayable)]
  );

  autoTable(doc, {
    startY: summaryStartY,
    body: summaryData,
    theme: "plain",
    styles: {
      fontSize: 9,
      textColor: [60, 60, 60],
    },
    columnStyles: {
      0: { cellWidth: 140, halign: "right" },
      1: { cellWidth: 40, halign: "right" },
    },
    margin: { left: 20, right: 20 },
    didParseCell: (cellData: any) => {
      if (cellData.section === "body") {
        if (cellData.row.index === summaryData.length - 1) {
          cellData.cell.styles.fontStyle = "bold";
          cellData.cell.styles.fontSize = 12;
          cellData.cell.styles.textColor = [26, 26, 46];
          cellData.cell.styles.fillColor = [251, 248, 242];
        }
        if (cellData.row.index === summaryData.length - 3) {
          cellData.cell.styles.fontStyle = "bold";
          cellData.cell.styles.fontSize = 9;
          cellData.cell.styles.textColor = [60, 60, 60];
        }
      }
    },
  });

  const totalRowY = (doc as any).lastAutoTable.finalY - 8;
  if (totalRowY > 0) {
    doc.setDrawColor(26, 26, 46);
    doc.setLineWidth(0.4);
    doc.line(pageWidth - 60 - 140, totalRowY, pageWidth - 20, totalRowY);
  }

  // ===== TAX BREAKDOWN (if available) =====
  const taxBreakdown = data?.order?.summary_data?.tax_breakdown || [];
  let taxY = (doc as any).lastAutoTable.finalY + 8;
  
  if (taxBreakdown.length > 0 && taxY < pageHeight - 60) {
    doc.setFontSize(9);
    doc.setTextColor(26, 26, 46);
    doc.setFont("helvetica", "bold");
    doc.text("Tax Breakdown:", 20, taxY);
    
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.setFont("helvetica", "normal");
    
    let taxTextY = taxY + 5;
    taxBreakdown.forEach((tax: any, index: number) => {
      const productName = tax.product_name || `Item ${index + 1}`;
      const rate = tax.rate || "0%";
      const category = tax.tax_category || "GST";
      const text = `${productName}: ${category} @ ${rate}`;
      const splitText = doc.splitTextToSize(text, 160);
      splitText.forEach((line: string) => {
        if (taxTextY < pageHeight - 30) {
          doc.text(line, 24, taxTextY);
          taxTextY += 4.5;
        }
      });
    });
    
    // Update Y position after tax breakdown
    taxY = taxTextY + 4;
  } else {
    taxY = (doc as any).lastAutoTable.finalY + 6;
  }

  // ===== PAYMENT DETAILS =====
  let paymentY = taxY + 4;
  
  if (paymentY < pageHeight - 30) {
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "normal");
    
    const paymentMethod = data?.order?.payment_gateway?.toUpperCase() || "N/A";
    doc.text(`Payment Method: ${paymentMethod}`, 20, paymentY);
    
    const transactionId = data?.order?.gateway_transaction_id || "N/A";
    doc.text(`Transaction ID: ${transactionId}`, 20, paymentY + 5);
    
    const paymentStatus = data?.order?.status || "N/A";
    doc.text(`Payment Status: ${paymentStatus.toUpperCase()}`, 20, paymentY + 10);
    
    const amountPaid = parseFloat(data?.order?.amount_paid || 0);
    if (amountPaid > 0) {
      doc.text(`Amount Paid: ${formatPrice(amountPaid)}`, 20, paymentY + 15);
    }

    // ===== FOOTER =====
    const footerY = paymentY + 22;
    if (footerY < pageHeight - 15) {
      doc.setDrawColor(200, 200, 200);
      doc.line(20, footerY, pageWidth - 20, footerY);

      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.setFont("helvetica", "normal");
      doc.text("Thank you for your business!", pageWidth / 2, footerY + 10, { align: "center" });
      doc.text("This is a system generated invoice. No signature required.", pageWidth / 2, footerY + 16, { align: "center" });
    }
  }

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
  
  setTimeout(() => {
    URL.revokeObjectURL(pdfUrl);
  }, 30000);
};