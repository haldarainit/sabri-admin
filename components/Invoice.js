"use client";

import { forwardRef } from "react";

const Invoice = forwardRef(({ orderData }, ref) => {
  if (!orderData) return null;

  const formatDate = (dateString) => {
    if (!dateString) return new Date().toLocaleDateString();
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  const calculateSubtotal = () => {
    if (!orderData.items) return 0;
    return orderData.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  };

  const calculateSavings = () => {
    if (!orderData.items) return 0;
    return orderData.items.reduce((total, item) => {
      const originalTotal = (item.originalPrice || item.price) * item.quantity;
      const currentTotal = item.price * item.quantity;
      return total + (originalTotal - currentTotal);
    }, 0);
  };

  return (
    <div ref={ref} className="invoice-container" style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logo}>
            <h1 style={styles.logoText}>SABRI</h1>
            <p style={styles.tagline}>Fine Jewellery & Accessories</p>
          </div>
        </div>
        <div style={styles.headerRight}>
          <h2 style={styles.invoiceTitle}>INVOICE</h2>
          <div style={styles.invoiceDetails}>
            <p style={styles.invoiceDetail}>
              <strong>Invoice No:</strong> {orderData.orderId || "N/A"}
            </p>
            <p style={styles.invoiceDetail}>
              <strong>Date:</strong> {formatDate(orderData.createdAt)}
            </p>
            <p style={styles.invoiceDetail}>
              <strong>Order ID:</strong> {orderData.orderId || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Company Info */}
      <div style={styles.companyInfo}>
        <div style={styles.companyLeft}>
          <h3 style={styles.sectionTitle}>From:</h3>
          <div style={styles.companyDetails}>
            <p style={styles.companyName}>Sabri Jewellery</p>
            <p style={styles.companyAddress}>
              Plot No 173, Engineering Park, Heavy Industrial Area,
              <br />
              Hathkhoj, Bhilai, C.G. 490024
              <br />
              India
            </p>
            <p style={styles.companyContact}>
              Phone: +91 8770672422
              <br />
              Email: info@sabri.com
              <br />
              Website: www.mysabri.in
            </p>
          </div>
        </div>
        <div style={styles.companyRight}>
          <h3 style={styles.sectionTitle}>Bill To:</h3>
          <div style={styles.customerDetails}>
            <p style={styles.customerName}>
              {orderData.shippingAddress?.name || "N/A"}
            </p>
            <p style={styles.customerAddress}>
              {orderData.shippingAddress?.addressLine1 || "N/A"}
              {orderData.shippingAddress?.addressLine2 && (
                <>
                  <br />
                  {orderData.shippingAddress.addressLine2}
                </>
              )}
              <br />
              {orderData.shippingAddress?.city || "N/A"},{" "}
              {orderData.shippingAddress?.state || "N/A"} -{" "}
              {orderData.shippingAddress?.zipCode || "N/A"}
            </p>
            <p style={styles.customerContact}>
              Phone: {orderData.shippingAddress?.phone || "N/A"}
              <br />
              Email: {orderData.shippingAddress?.email || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div style={styles.itemsSection}>
        <h3 style={styles.sectionTitle}>Order Items</h3>
        <table style={styles.itemsTable}>
          <thead>
            <tr style={styles.tableHeaderRow}>
              <th style={styles.tableHeader}>Item</th>
              <th style={styles.tableHeader}>Category</th>
              <th style={styles.tableHeader}>Size/Color</th>
              <th style={styles.tableHeader}>Qty</th>
              <th style={styles.tableHeader}>Price</th>
              <th style={styles.tableHeader}>Total</th>
            </tr>
          </thead>
          <tbody>
            {orderData.items?.map((item, index) => (
              <tr key={index} style={styles.tableRow}>
                <td style={styles.tableCell}>
                  <div style={styles.itemName}>
                    {item.name || "Unnamed Item"}
                  </div>
                </td>
                <td style={styles.tableCell}>{item.category || "N/A"}</td>
                <td style={styles.tableCell}>
                  {item.size && `Size: ${item.size}`}
                  {item.size && item.color && " • "}
                  {item.color && `Color: ${item.color}`}
                </td>
                <td style={styles.tableCell}>{item.quantity || 1}</td>
                <td style={styles.tableCell}>{formatCurrency(item.price)}</td>
                <td style={styles.tableCell}>
                  {formatCurrency(item.price * (item.quantity || 1))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Summary */}
      <div style={styles.summarySection}>
        <div style={styles.summaryLeft}>
          <h3 style={styles.sectionTitle}>Payment Information</h3>
          <div style={styles.paymentInfo}>
            <p style={styles.paymentDetail}>
              <strong>Payment Method:</strong>{" "}
              {orderData.paymentMethod === "cash_on_delivery"
                ? "Cash on Delivery"
                : orderData.paymentMethod || "N/A"}
            </p>
            <p style={styles.paymentDetail}>
              <strong>Order Status:</strong> Confirmed
            </p>
            <p style={styles.paymentDetail}>
              <strong>Estimated Delivery:</strong> 7-9 business days
            </p>
          </div>
        </div>
        <div style={styles.summaryRight}>
          <h3 style={styles.sectionTitle}>Order Summary</h3>
          <div style={styles.summaryTable}>
            <div style={styles.summaryRow}>
              <span>Subtotal:</span>
              <span>{formatCurrency(calculateSubtotal())}</span>
            </div>
            {calculateSavings() > 0 && (
              <div style={styles.summaryRow}>
                <span>You Save:</span>
                <span style={styles.savingsText}>
                  {formatCurrency(calculateSavings())}
                </span>
              </div>
            )}
            {orderData.orderSummary?.couponDiscount > 0 && (
              <div style={styles.summaryRow}>
                <span>
                  Coupon Discount ({orderData.orderSummary?.couponCode}):
                </span>
                <span style={styles.discountText}>
                  -{formatCurrency(orderData.orderSummary.couponDiscount)}
                </span>
              </div>
            )}
            <div style={styles.summaryRow}>
              <span>Shipping:</span>
              <span>
                {orderData.orderSummary?.shippingCharge === 0
                  ? "FREE"
                  : formatCurrency(orderData.orderSummary?.shippingCharge)}
              </span>
            </div>
            <div style={styles.summaryRow}>
              <span>Tax (GST 3% inclusive):</span>
              <span>{formatCurrency(orderData.orderSummary?.tax)}</span>
            </div>
            <div style={styles.summaryTotal}>
              <span>
                <strong>Total Amount:</strong>
              </span>
              <span>
                <strong>{formatCurrency(orderData.orderSummary?.total)}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <div style={styles.footerLeft}>
          <h4 style={styles.footerTitle}>Thank You!</h4>
          <p style={styles.footerText}>
            Thank you for choosing Sabri Jewellery. We appreciate your business
            and look forward to serving you again.
          </p>
        </div>
        <div style={styles.footerRight}>
          <h4 style={styles.footerTitle}>Terms & Conditions</h4>
          <ul style={styles.termsList}>
            <li>All items are subject to availability</li>
            <li>Returns accepted within 2 days of delivery</li>
            <li>GST included in all prices</li>
          </ul>
        </div>
      </div>
    </div>
  );
});

Invoice.displayName = "Invoice";

const styles = {
  container: {
    width: "210mm",
    minHeight: "297mm",
    margin: "0 auto",
    padding: "20mm",
    backgroundColor: "#ffffff",
    fontFamily: "Arial, sans-serif",
    fontSize: "12px",
    lineHeight: "1.4",
    color: "#333333",
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "30px",
    borderBottom: "2px solid #333333",
    paddingBottom: "20px",
  },
  headerLeft: {
    flex: "1",
  },
  logo: {
    textAlign: "left",
  },
  logoText: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#333333",
    margin: "0",
    letterSpacing: "2px",
  },
  tagline: {
    fontSize: "14px",
    color: "#666666",
    margin: "5px 0 0 0",
    fontStyle: "italic",
  },
  headerRight: {
    textAlign: "right",
  },
  invoiceTitle: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#333333",
    margin: "0 0 15px 0",
  },
  invoiceDetails: {
    textAlign: "right",
  },
  invoiceDetail: {
    margin: "3px 0",
    fontSize: "12px",
  },
  companyInfo: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "30px",
  },
  companyLeft: {
    flex: "1",
    marginRight: "30px",
  },
  companyRight: {
    flex: "1",
  },
  sectionTitle: {
    fontSize: "14px",
    fontWeight: "bold",
    color: "#333333",
    margin: "0 0 10px 0",
    textTransform: "uppercase",
    borderBottom: "1px solid #cccccc",
    paddingBottom: "5px",
  },
  companyDetails: {
    fontSize: "12px",
  },
  companyName: {
    fontSize: "16px",
    fontWeight: "bold",
    margin: "0 0 8px 0",
  },
  companyAddress: {
    margin: "0 0 8px 0",
    lineHeight: "1.5",
  },
  companyContact: {
    margin: "0",
    lineHeight: "1.5",
  },
  customerDetails: {
    fontSize: "12px",
  },
  customerName: {
    fontSize: "14px",
    fontWeight: "bold",
    margin: "0 0 8px 0",
  },
  customerAddress: {
    margin: "0 0 8px 0",
    lineHeight: "1.5",
  },
  customerContact: {
    margin: "0",
    lineHeight: "1.5",
  },
  itemsSection: {
    marginBottom: "30px",
  },
  itemsTable: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "15px",
  },
  tableHeaderRow: {
    backgroundColor: "#f5f5f5",
  },
  tableHeader: {
    padding: "10px 8px",
    textAlign: "left",
    border: "1px solid #cccccc",
    fontSize: "11px",
    fontWeight: "bold",
    backgroundColor: "#f5f5f5",
  },
  tableRow: {
    borderBottom: "1px solid #eeeeee",
  },
  tableCell: {
    padding: "10px 8px",
    border: "1px solid #cccccc",
    fontSize: "11px",
    verticalAlign: "top",
  },
  itemName: {
    fontWeight: "500",
  },
  summarySection: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "30px",
  },
  summaryLeft: {
    flex: "1",
    marginRight: "30px",
  },
  summaryRight: {
    flex: "1",
  },
  paymentInfo: {
    fontSize: "12px",
  },
  paymentDetail: {
    margin: "5px 0",
  },
  summaryTable: {
    fontSize: "12px",
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    margin: "8px 0",
    padding: "3px 0",
  },
  summaryTotal: {
    display: "flex",
    justifyContent: "space-between",
    margin: "15px 0 5px 0",
    padding: "10px 0",
    borderTop: "2px solid #333333",
    borderBottom: "2px solid #333333",
    fontSize: "14px",
    fontWeight: "bold",
  },
  savingsText: {
    color: "#22c55e",
    fontWeight: "bold",
  },
  discountText: {
    color: "#22c55e",
    fontWeight: "bold",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "30px",
    paddingTop: "20px",
    borderTop: "1px solid #cccccc",
  },
  footerLeft: {
    flex: "1",
    marginRight: "30px",
  },
  footerRight: {
    flex: "1",
  },
  footerTitle: {
    fontSize: "14px",
    fontWeight: "bold",
    margin: "0 0 10px 0",
  },
  footerText: {
    fontSize: "11px",
    lineHeight: "1.5",
    margin: "0",
  },
  termsList: {
    fontSize: "11px",
    lineHeight: "1.5",
    margin: "0",
    paddingLeft: "15px",
  },
  signature: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "40px",
    paddingTop: "20px",
    borderTop: "1px solid #cccccc",
  },
  signatureLeft: {
    flex: "1",
    marginRight: "30px",
  },
  signatureRight: {
    flex: "1",
  },
  signatureLabel: {
    fontSize: "11px",
    margin: "0 0 5px 0",
  },
  signatureLine: {
    height: "1px",
    borderBottom: "1px solid #333333",
    marginTop: "30px",
  },
};

export default Invoice;
