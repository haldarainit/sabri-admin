"use client";

import { useState, useEffect } from "react";
import { downloadInvoicePDF } from "@/utils/invoiceUtils";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [updateStatusLoading, setUpdateStatusLoading] = useState(false);
  const [stats, setStats] = useState([]);

  // Fetch orders
  const fetchOrders = async (page = 1, search = "", status = "all") => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(search && { search }),
        ...(status !== "all" && { status }),
      });

      const response = await fetch(`/api/admin/orders?${params}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setOrders(data.data.orders);
        setStats(data.data.stats);
        setTotalPages(data.data.pagination.totalPages);
        setCurrentPage(data.data.pagination.currentPage);
      } else {
        console.error("API returned error:", data.message);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      alert(`Failed to fetch orders: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage, searchTerm, statusFilter);
  }, [currentPage, searchTerm, statusFilter]);

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdateStatusLoading(true);
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        fetchOrders(currentPage, searchTerm, statusFilter);
        setSelectedOrder(data.data);
        alert("Order status updated successfully!");
      } else {
        alert(data.message || "Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status");
    } finally {
      setUpdateStatusLoading(false);
    }
  };

  // Delete order
  const deleteOrder = async (orderId) => {
    if (!confirm("Are you sure you want to delete this order?")) return;

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        fetchOrders(currentPage, searchTerm, statusFilter);
        alert("Order deleted successfully!");
      } else {
        alert(data.message || "Failed to delete order");
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      alert("Failed to delete order");
    }
  };

  // Download invoice
  const downloadInvoice = async (orderId) => {
    const order = orders.find((o) => o.orderId === orderId);
    if (!order) {
      alert("Order not found");
      return;
    }
    const ok = await downloadInvoicePDF(order);
    if (!ok) alert("Failed to download invoice PDF");
  };

  // Status badge
  const StatusBadge = ({ status }) => {
    const statusStyles = {
      pending: { bg: "#FFF4E5", text: "#FFA500", border: "#FFD699" },
      confirmed: { bg: "#E3F2FD", text: "#1976D2", border: "#90CAF9" },
      processing: { bg: "#FFF3E0", text: "#F57C00", border: "#FFCC80" },
      shipped: { bg: "#F3E5F5", text: "#7B1FA2", border: "#CE93D8" },
      delivered: { bg: "#E6F4EA", text: "#137333", border: "#81C995" },
      cancelled: { bg: "#FDE7E9", text: "#B3261E", border: "#F28B82" },
    };

    const style = statusStyles[status] || statusStyles.pending;

    return (
      <span
        className="px-2.5 py-1 text-xs font-medium rounded-full border"
        style={{
          backgroundColor: style.bg,
          color: style.text,
          borderColor: style.border,
        }}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Order details modal
  const OrderDetailsModal = ({ order, onClose, onUpdateStatus }) => {
    if (!order) return null;

    return (
      <div
        className="fixed inset-0 flex items-center justify-center p-4 z-50"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        onClick={onClose}
      >
        <div
          className="rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          style={{
            backgroundColor: "var(--shopify-surface)",
            border: "1px solid var(--shopify-border)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between p-6 border-b"
            style={{ borderColor: "var(--shopify-border)" }}
          >
            <div>
              <h2
                className="text-xl font-semibold"
                style={{ color: "var(--shopify-text-primary)" }}
              >
                Order #{order.orderId}
              </h2>
              <p
                className="text-sm mt-1"
                style={{ color: "var(--shopify-text-secondary)" }}
              >
                Placed on {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => downloadInvoice(order.orderId)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border"
                style={{
                  backgroundColor: "var(--shopify-surface)",
                  borderColor: "var(--shopify-border)",
                  color: "var(--shopify-text-primary)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "var(--shopify-surface-hover)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "var(--shopify-surface)")
                }
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Download Invoice
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg transition-colors"
                style={{
                  color: "var(--shopify-text-secondary)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "var(--shopify-surface-hover)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Order Status */}
            <div className="flex items-center justify-between">
              <div>
                <h3
                  className="text-sm font-medium mb-2"
                  style={{ color: "var(--shopify-text-primary)" }}
                >
                  Order Status
                </h3>
                <StatusBadge status={order.status} />
              </div>
              <div>
                <select
                  value={order.status}
                  onChange={(e) => onUpdateStatus(order.orderId, e.target.value)}
                  disabled={updateStatusLoading}
                  className="px-3 py-2 rounded-lg border text-sm transition-colors"
                  style={{
                    backgroundColor: "var(--shopify-surface)",
                    borderColor: "var(--shopify-border)",
                    color: "var(--shopify-text-primary)",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor =
                      "var(--shopify-action-interactive)")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "var(--shopify-border)")
                  }
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Customer & Shipping Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3
                  className="text-sm font-medium mb-3"
                  style={{ color: "var(--shopify-text-primary)" }}
                >
                  Customer Information
                </h3>
                <div
                  className="rounded-lg border p-4 space-y-2"
                  style={{
                    backgroundColor: "var(--shopify-bg-primary)",
                    borderColor: "var(--shopify-border)",
                  }}
                >
                  <p
                    className="text-sm"
                    style={{ color: "var(--shopify-text-primary)" }}
                  >
                    <span className="font-medium">Name:</span>{" "}
                    {order.shippingAddress.name}
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: "var(--shopify-text-primary)" }}
                  >
                    <span className="font-medium">Email:</span>{" "}
                    {order.shippingAddress.email}
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: "var(--shopify-text-primary)" }}
                  >
                    <span className="font-medium">Phone:</span>{" "}
                    {order.shippingAddress.phone}
                  </p>
                </div>
              </div>

              <div>
                <h3
                  className="text-sm font-medium mb-3"
                  style={{ color: "var(--shopify-text-primary)" }}
                >
                  Shipping Address
                </h3>
                <div
                  className="rounded-lg border p-4"
                  style={{
                    backgroundColor: "var(--shopify-bg-primary)",
                    borderColor: "var(--shopify-border)",
                  }}
                >
                  <p
                    className="text-sm"
                    style={{ color: "var(--shopify-text-primary)" }}
                  >
                    {order.shippingAddress.addressLine1}
                  </p>
                  {order.shippingAddress.addressLine2 && (
                    <p
                      className="text-sm"
                      style={{ color: "var(--shopify-text-primary)" }}
                    >
                      {order.shippingAddress.addressLine2}
                    </p>
                  )}
                  <p
                    className="text-sm"
                    style={{ color: "var(--shopify-text-primary)" }}
                  >
                    {order.shippingAddress.city}, {order.shippingAddress.state} -{" "}
                    {order.shippingAddress.zipCode}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3
                className="text-sm font-medium mb-3"
                style={{ color: "var(--shopify-text-primary)" }}
              >
                Order Items ({order.items.length})
              </h3>
              <div
                className="rounded-lg border p-4"
                style={{
                  backgroundColor: "var(--shopify-bg-primary)",
                  borderColor: "var(--shopify-border)",
                }}
              >
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2"
                      style={{
                        borderBottom:
                          index !== order.items.length - 1
                            ? "1px solid var(--shopify-border)"
                            : "none",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded border"
                            style={{ borderColor: "var(--shopify-border)" }}
                          />
                        )}
                        <div>
                          <p
                            className="text-sm font-medium"
                            style={{ color: "var(--shopify-text-primary)" }}
                          >
                            {item.name}
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: "var(--shopify-text-secondary)" }}
                          >
                            Qty: {item.quantity} × ₹{item.price}
                          </p>
                        </div>
                      </div>
                      <p
                        className="text-sm font-medium"
                        style={{ color: "var(--shopify-text-primary)" }}
                      >
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <h3
                className="text-sm font-medium mb-3"
                style={{ color: "var(--shopify-text-primary)" }}
              >
                Order Summary
              </h3>
              <div
                className="rounded-lg border p-4 space-y-2"
                style={{
                  backgroundColor: "var(--shopify-bg-primary)",
                  borderColor: "var(--shopify-border)",
                }}
              >
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--shopify-text-secondary)" }}>
                    Subtotal:
                  </span>
                  <span style={{ color: "var(--shopify-text-primary)" }}>
                    ₹{order.orderSummary.subtotal.toLocaleString()}
                  </span>
                </div>
                {order.orderSummary.couponDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Coupon Discount:</span>
                    <span>
                      -₹{order.orderSummary.couponDiscount.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--shopify-text-secondary)" }}>
                    Tax:
                  </span>
                  <span style={{ color: "var(--shopify-text-primary)" }}>
                    ₹{order.orderSummary.tax.toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--shopify-text-secondary)" }}>
                    Shipping:
                  </span>
                  <span style={{ color: "var(--shopify-text-primary)" }}>
                    ₹{order.orderSummary.shippingCharge}
                  </span>
                </div>
                <div
                  className="border-t pt-2 flex justify-between font-semibold"
                  style={{ borderColor: "var(--shopify-border)" }}
                >
                  <span style={{ color: "var(--shopify-text-primary)" }}>
                    Total:
                  </span>
                  <span style={{ color: "var(--shopify-text-primary)" }}>
                    ₹{order.orderSummary.total.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--shopify-text-secondary)" }}>
                    Payment Method:
                  </span>
                  <span
                    className="capitalize"
                    style={{ color: "var(--shopify-text-primary)" }}
                  >
                    {order.paymentMethod.replace("_", " ")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 mx-auto mb-4"
            style={{
              border: "3px solid var(--shopify-border)",
              borderTopColor: "var(--shopify-action-primary)",
            }}
          ></div>
          <p
            className="font-medium"
            style={{ color: "var(--shopify-text-secondary)" }}
          >
            Loading orders...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div>
        <h1
          className="text-2xl font-semibold"
          style={{ color: "var(--shopify-text-primary)" }}
        >
          Orders
        </h1>
        <p
          className="text-sm mt-1"
          style={{ color: "var(--shopify-text-secondary)" }}
        >
          Manage and track all customer orders
        </p>
      </div>

      {/* Stats */}
      {stats.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map((stat) => (
            <div
              key={stat._id}
              className="rounded-lg border p-4"
              style={{
                backgroundColor: "var(--shopify-surface)",
                borderColor: "var(--shopify-border)",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <p
                  className="text-xs font-medium uppercase"
                  style={{ color: "var(--shopify-text-secondary)" }}
                >
                  {stat._id}
                </p>
                <StatusBadge status={stat._id} />
              </div>
              <p
                className="text-2xl font-semibold"
                style={{ color: "var(--shopify-text-primary)" }}
              >
                {stat.count}
              </p>
              <p
                className="text-xs mt-1"
                style={{ color: "var(--shopify-text-secondary)" }}
              >
                ₹{stat.totalValue.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div
        className="rounded-lg border p-4"
        style={{
          backgroundColor: "var(--shopify-surface)",
          borderColor: "var(--shopify-border)",
        }}
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
                style={{ color: "var(--shopify-text-secondary)" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 rounded-lg border text-sm transition-colors"
                style={{
                  backgroundColor: "var(--shopify-surface)",
                  borderColor: "var(--shopify-border)",
                  color: "var(--shopify-text-primary)",
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor =
                    "var(--shopify-action-interactive)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "var(--shopify-border)")
                }
              />
            </div>
          </div>
          <div className="md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-sm transition-colors"
              style={{
                backgroundColor: "var(--shopify-surface)",
                borderColor: "var(--shopify-border)",
                color: "var(--shopify-text-primary)",
              }}
              onFocus={(e) =>
                (e.currentTarget.style.borderColor =
                  "var(--shopify-action-interactive)")
              }
              onBlur={(e) =>
                (e.currentTarget.style.borderColor = "var(--shopify-border)")
              }
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div
        className="rounded-lg border overflow-hidden"
        style={{
          backgroundColor: "var(--shopify-surface)",
          borderColor: "var(--shopify-border)",
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr
                style={{
                  backgroundColor: "var(--shopify-bg-primary)",
                  borderBottom: "1px solid var(--shopify-border)",
                }}
              >
                <th
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: "var(--shopify-text-secondary)" }}
                >
                  Order
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: "var(--shopify-text-secondary)" }}
                >
                  Customer
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: "var(--shopify-text-secondary)" }}
                >
                  Status
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: "var(--shopify-text-secondary)" }}
                >
                  Total
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: "var(--shopify-text-secondary)" }}
                >
                  Date
                </th>
                <th
                  className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider"
                  style={{ color: "var(--shopify-text-secondary)" }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-8 text-center"
                    style={{ color: "var(--shopify-text-secondary)" }}
                  >
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order, index) => (
                  <tr
                    key={order._id}
                    className="transition-colors"
                    style={{
                      borderBottom:
                        index !== orders.length - 1
                          ? "1px solid var(--shopify-border)"
                          : "none",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        "var(--shopify-surface-hover)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p
                          className="text-sm font-medium"
                          style={{ color: "var(--shopify-text-primary)" }}
                        >
                          #{order.orderId}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "var(--shopify-text-secondary)" }}
                        >
                          {order.items.length} items
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p
                          className="text-sm font-medium"
                          style={{ color: "var(--shopify-text-primary)" }}
                        >
                          {order.shippingAddress.name}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "var(--shopify-text-secondary)" }}
                        >
                          {order.shippingAddress.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4">
                      <p
                        className="text-sm font-medium"
                        style={{ color: "var(--shopify-text-primary)" }}
                      >
                        ₹{order.orderSummary.total.toLocaleString()}
                      </p>
                      <p
                        className="text-xs capitalize"
                        style={{ color: "var(--shopify-text-secondary)" }}
                      >
                        {order.paymentMethod.replace("_", " ")}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p
                        className="text-sm"
                        style={{ color: "var(--shopify-text-primary)" }}
                      >
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "var(--shopify-text-secondary)" }}
                      >
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderDetails(true);
                          }}
                          className="p-2 rounded-lg transition-colors"
                          style={{
                            color: "var(--shopify-action-interactive)",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "var(--shopify-surface-hover)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "transparent")
                          }
                          title="View Details"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => downloadInvoice(order.orderId)}
                          className="p-2 rounded-lg transition-colors"
                          style={{
                            color: "var(--shopify-action-primary)",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "var(--shopify-surface-hover)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "transparent")
                          }
                          title="Download Invoice"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => deleteOrder(order.orderId)}
                          className="p-2 rounded-lg transition-colors"
                          style={{
                            color: "var(--shopify-action-critical)",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#FDE7E9";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "transparent";
                          }}
                          title="Delete Order"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            className="px-6 py-4 border-t"
            style={{ borderColor: "var(--shopify-border)" }}
          >
            <div className="flex items-center justify-between">
              <p
                className="text-sm"
                style={{ color: "var(--shopify-text-secondary)" }}
              >
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded-lg font-medium text-sm transition-colors border disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: "var(--shopify-surface)",
                    borderColor: "var(--shopify-border)",
                    color: "var(--shopify-text-primary)",
                  }}
                  onMouseEnter={(e) =>
                    !e.currentTarget.disabled &&
                    (e.currentTarget.style.backgroundColor =
                      "var(--shopify-surface-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "var(--shopify-surface)")
                  }
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 rounded-lg font-medium text-sm transition-colors border disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: "var(--shopify-surface)",
                    borderColor: "var(--shopify-border)",
                    color: "var(--shopify-text-primary)",
                  }}
                  onMouseEnter={(e) =>
                    !e.currentTarget.disabled &&
                    (e.currentTarget.style.backgroundColor =
                      "var(--shopify-surface-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "var(--shopify-surface)")
                  }
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => {
            setShowOrderDetails(false);
            setSelectedOrder(null);
          }}
          onUpdateStatus={updateOrderStatus}
        />
      )}
    </div>
  );
}
