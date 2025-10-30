"use client";
import { useState, useEffect } from "react";

export default function Coupons() {
  const [loading, setLoading] = useState(true);
  const [coupons, setCoupons] = useState([]);
  const [stats, setStats] = useState({
    totalCoupons: 0,
    activeCoupons: 0,
    scheduledCoupons: 0,
    expiredCoupons: 0,
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    type: "percentage",
    amount: "",
    minValue: "",
    maxValue: "",
    usageLimit: "",
    startDate: "",
    expiryDate: "",
  });

  const showNotification = (message, type = "success") => {
    const notificationDiv = document.createElement("div");
    notificationDiv.className = `fixed top-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 ${
      type === "success" ? "bg-green-600" : "bg-red-600"
    } text-white`;
    notificationDiv.innerHTML = `
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        ${
          type === "success"
            ? '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />'
            : '<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />'
        }
      </svg>
      ${message}
    `;
    document.body.appendChild(notificationDiv);
    setTimeout(() => notificationDiv.remove(), 3000);
  };

  // Fetch coupons
  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/coupons`, {
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        setCoupons(data.data.coupons || []);
        setStats(
          data.data.stats || {
            totalCoupons: 0,
            activeCoupons: 0,
            scheduledCoupons: 0,
            expiredCoupons: 0,
          }
        );
      }
    } catch (error) {
      console.error("Error fetching coupons:", error);
      showNotification("Failed to fetch coupons", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddCoupon = async (e) => {
    e.preventDefault();
    try {
      const couponData = {
        ...formData,
        amount: Number(formData.amount),
        minValue: Number(formData.minValue),
        maxValue: Number(formData.maxValue),
        usageLimit: Number(formData.usageLimit),
        startDate:
          formData.startDate && formData.startDate.trim() !== ""
            ? formData.startDate
            : null,
        expiryDate:
          formData.expiryDate && formData.expiryDate.trim() !== ""
            ? formData.expiryDate
            : null,
      };

      const response = await fetch(`/api/admin/coupons`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(couponData),
      });

      const data = await response.json();
      if (data.success) {
        setShowAddModal(false);
        setFormData({
          name: "",
          code: "",
          type: "percentage",
          amount: "",
          minValue: "",
          maxValue: "",
          usageLimit: "",
          startDate: "",
          expiryDate: "",
        });
        fetchCoupons();
        showNotification("Coupon created successfully!", "success");
      } else {
        showNotification(data.message || "Error creating coupon", "error");
      }
    } catch (error) {
      console.error("Error creating coupon:", error);
      showNotification("Error creating coupon", "error");
    }
  };

  const handleEditCoupon = async (e) => {
    e.preventDefault();
    try {
      const couponData = {
        ...formData,
        amount: Number(formData.amount),
        minValue: Number(formData.minValue),
        maxValue: Number(formData.maxValue),
        usageLimit: Number(formData.usageLimit),
        startDate:
          formData.startDate && formData.startDate.trim() !== ""
            ? formData.startDate
            : null,
        expiryDate:
          formData.expiryDate && formData.expiryDate.trim() !== ""
            ? formData.expiryDate
            : null,
      };

      const response = await fetch(`/api/admin/coupons/${editingCoupon._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(couponData),
      });

      const data = await response.json();
      if (data.success) {
        setShowEditModal(false);
        setEditingCoupon(null);
        setFormData({
          name: "",
          code: "",
          type: "percentage",
          amount: "",
          minValue: "",
          maxValue: "",
          usageLimit: "",
          startDate: "",
          expiryDate: "",
        });
        fetchCoupons();
        showNotification("Coupon updated successfully!", "success");
      } else {
        showNotification(data.message || "Error updating coupon", "error");
      }
    } catch (error) {
      console.error("Error updating coupon:", error);
      showNotification("Error updating coupon", "error");
    }
  };

  const handleDeleteCoupon = async (id, couponName) => {
    if (
      confirm(
        `Are you sure you want to delete "${couponName}"? This action cannot be undone.`
      )
    ) {
      try {
        const response = await fetch(`/api/admin/coupons/${id}`, {
          method: "DELETE",
          credentials: "include",
        });

        const data = await response.json();
        if (data.success) {
          fetchCoupons();
          showNotification("Coupon deleted successfully!", "success");
        } else {
          showNotification(data.message || "Error deleting coupon", "error");
        }
      } catch (error) {
        console.error("Error deleting coupon:", error);
        showNotification("Error deleting coupon", "error");
      }
    }
  };

  const openEditModal = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      name: coupon.name,
      code: coupon.code,
      type: coupon.type,
      amount: coupon.amount.toString(),
      minValue: coupon.minValue.toString(),
      maxValue: coupon.maxValue.toString(),
      usageLimit: coupon.usageLimit.toString(),
      startDate: coupon.startDate ? coupon.startDate.split("T")[0] : "",
      expiryDate: coupon.expiryDate ? coupon.expiryDate.split("T")[0] : "",
    });
    setShowEditModal(true);
  };

  const isScheduled = (coupon) => {
    return (
      coupon.startDate &&
      coupon.startDate !== "" &&
      new Date(coupon.startDate) > new Date()
    );
  };

  const isExpired = (coupon) => {
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date())
      return true;
    if (coupon.usedCount >= coupon.usageLimit) return true;
    return false;
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
            Loading coupons...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-semibold"
            style={{ color: "var(--shopify-text-primary)" }}
          >
            Coupons
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: "var(--shopify-text-secondary)" }}
          >
            Create and manage discount coupons
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-lg font-medium text-white transition-colors"
          style={{
            backgroundColor: "var(--shopify-action-primary)",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor =
              "var(--shopify-action-primary-hover)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor =
              "var(--shopify-action-primary)")
          }
        >
          Add Coupon
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          className="rounded-lg border p-5"
          style={{
            backgroundColor: "var(--shopify-surface)",
            borderColor: "var(--shopify-border)",
          }}
        >
          <p
            className="text-sm mb-1"
            style={{ color: "var(--shopify-text-secondary)" }}
          >
            Total Coupons
          </p>
          <p
            className="text-2xl font-semibold"
            style={{ color: "var(--shopify-text-primary)" }}
          >
            {stats.totalCoupons}
          </p>
        </div>

        <div
          className="rounded-lg border p-5"
          style={{
            backgroundColor: "var(--shopify-surface)",
            borderColor: "var(--shopify-border)",
          }}
        >
          <p
            className="text-sm mb-1"
            style={{ color: "var(--shopify-text-secondary)" }}
          >
            Active
          </p>
          <p className="text-2xl font-semibold" style={{ color: "#137333" }}>
            {stats.activeCoupons}
          </p>
        </div>

        <div
          className="rounded-lg border p-5"
          style={{
            backgroundColor: "var(--shopify-surface)",
            borderColor: "var(--shopify-border)",
          }}
        >
          <p
            className="text-sm mb-1"
            style={{ color: "var(--shopify-text-secondary)" }}
          >
            Scheduled
          </p>
          <p className="text-2xl font-semibold" style={{ color: "#B98900" }}>
            {stats.scheduledCoupons}
          </p>
        </div>

        <div
          className="rounded-lg border p-5"
          style={{
            backgroundColor: "var(--shopify-surface)",
            borderColor: "var(--shopify-border)",
          }}
        >
          <p
            className="text-sm mb-1"
            style={{ color: "var(--shopify-text-secondary)" }}
          >
            Expired
          </p>
          <p
            className="text-2xl font-semibold"
            style={{ color: "var(--shopify-action-critical)" }}
          >
            {stats.expiredCoupons}
          </p>
        </div>
      </div>

      {coupons.length === 0 ? (
        <div
          className="rounded-lg border p-12 text-center"
          style={{
            backgroundColor: "var(--shopify-surface)",
            borderColor: "var(--shopify-border)",
          }}
        >
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
            style={{
              backgroundColor: "var(--shopify-bg-primary)",
            }}
          >
            <svg
              className="w-8 h-8"
              style={{ color: "var(--shopify-text-secondary)" }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
          </div>
          <h3
            className="text-xl font-semibold mb-2"
            style={{ color: "var(--shopify-text-primary)" }}
          >
            No Coupons Yet
          </h3>
          <p
            className="mb-6"
            style={{ color: "var(--shopify-text-secondary)" }}
          >
            Create your first coupon to start offering discounts
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-lg font-medium text-white transition-colors"
            style={{
              backgroundColor: "var(--shopify-action-primary)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                "var(--shopify-action-primary-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor =
                "var(--shopify-action-primary)")
            }
          >
            Add First Coupon
          </button>
        </div>
      ) : (
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
                    Coupon
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: "var(--shopify-text-secondary)" }}
                  >
                    Discount
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: "var(--shopify-text-secondary)" }}
                  >
                    Min/Max Order
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: "var(--shopify-text-secondary)" }}
                  >
                    Usage
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: "var(--shopify-text-secondary)" }}
                  >
                    Validity
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: "var(--shopify-text-secondary)" }}
                  >
                    Status
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
                {coupons.map((coupon, index) => (
                  <tr
                    key={coupon._id}
                    className="transition-colors"
                    style={{
                      borderBottom:
                        index !== coupons.length - 1
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
                          {coupon.name}
                        </p>
                        <p
                          className="text-xs font-mono mt-1 inline-block px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: "var(--shopify-bg-primary)",
                            color: "var(--shopify-text-secondary)",
                          }}
                        >
                          {coupon.code}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p
                        className="text-sm font-medium"
                        style={{ color: "var(--shopify-text-primary)" }}
                      >
                        {coupon.type === "percentage"
                          ? `${coupon.amount}%`
                          : `₹${coupon.amount}`}
                      </p>
                      <p
                        className="text-xs capitalize"
                        style={{ color: "var(--shopify-text-secondary)" }}
                      >
                        {coupon.type}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p
                        className="text-sm"
                        style={{ color: "var(--shopify-text-primary)" }}
                      >
                        ₹{coupon.minValue} - ₹{coupon.maxValue}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 max-w-[100px]">
                          <div
                            className="h-1.5 rounded-full overflow-hidden"
                            style={{
                              backgroundColor: "var(--shopify-bg-primary)",
                            }}
                          >
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${
                                  (coupon.usedCount / coupon.usageLimit) * 100
                                }%`,
                                backgroundColor:
                                  (coupon.usedCount / coupon.usageLimit) * 100 >
                                  80
                                    ? "var(--shopify-action-critical)"
                                    : "var(--shopify-action-primary)",
                              }}
                            ></div>
                          </div>
                        </div>
                        <p
                          className="text-xs whitespace-nowrap"
                          style={{ color: "var(--shopify-text-secondary)" }}
                        >
                          {coupon.usedCount}/{coupon.usageLimit}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p
                        className="text-xs"
                        style={{ color: "var(--shopify-text-secondary)" }}
                      >
                        {coupon.startDate && coupon.startDate !== ""
                          ? new Date(coupon.startDate).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric" }
                            )
                          : "Now"}
                        {" - "}
                        {coupon.expiryDate
                          ? new Date(coupon.expiryDate).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric" }
                            )
                          : "No expiry"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {isScheduled(coupon) ? (
                        <span
                          className="px-2.5 py-1 text-xs font-medium rounded-full"
                          style={{
                            backgroundColor: "#FFF4E5",
                            color: "#B98900",
                          }}
                        >
                          Scheduled
                        </span>
                      ) : isExpired(coupon) ? (
                        <span
                          className="px-2.5 py-1 text-xs font-medium rounded-full"
                          style={{
                            backgroundColor: "#FDE7E9",
                            color: "#D72C0D",
                          }}
                        >
                          Expired
                        </span>
                      ) : coupon.isActive ? (
                        <span
                          className="px-2.5 py-1 text-xs font-medium rounded-full"
                          style={{
                            backgroundColor: "#E6F4EA",
                            color: "#137333",
                          }}
                        >
                          Active
                        </span>
                      ) : (
                        <span
                          className="px-2.5 py-1 text-xs font-medium rounded-full"
                          style={{
                            backgroundColor: "var(--shopify-bg-primary)",
                            color: "var(--shopify-text-secondary)",
                          }}
                        >
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(coupon)}
                          className="p-2 rounded-lg transition-colors"
                          style={{
                            color: "var(--shopify-action-interactive)",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#EBF5FA";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "transparent";
                          }}
                          title="Edit Coupon"
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
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteCoupon(coupon._id, coupon.name)
                          }
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
                          title="Delete Coupon"
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Coupon Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div
            className="rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto"
            style={{
              backgroundColor: "var(--shopify-surface)",
            }}
          >
            <div className="p-6">
              <h2
                className="text-xl font-semibold mb-5"
                style={{ color: "var(--shopify-text-primary)" }}
              >
                Add New Coupon
              </h2>
              <form onSubmit={handleAddCoupon} className="space-y-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--shopify-text-primary)" }}
                  >
                    Coupon Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
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
                      (e.currentTarget.style.borderColor =
                        "var(--shopify-border)")
                    }
                    required
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--shopify-text-primary)" }}
                  >
                    Coupon Code
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border text-sm transition-colors font-mono"
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
                      (e.currentTarget.style.borderColor =
                        "var(--shopify-border)")
                    }
                    placeholder="e.g., SUMMER50"
                    required
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--shopify-text-primary)" }}
                  >
                    Discount Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
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
                      (e.currentTarget.style.borderColor =
                        "var(--shopify-border)")
                    }
                  >
                    <option value="percentage">Percentage</option>
                    <option value="flat">Flat Amount</option>
                  </select>
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--shopify-text-primary)" }}
                  >
                    {formData.type === "percentage"
                      ? "Percentage (%)"
                      : "Amount (₹)"}
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
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
                      (e.currentTarget.style.borderColor =
                        "var(--shopify-border)")
                    }
                    min="0"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: "var(--shopify-text-primary)" }}
                    >
                      Min Value (₹)
                    </label>
                    <input
                      type="number"
                      name="minValue"
                      value={formData.minValue}
                      onChange={handleInputChange}
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
                        (e.currentTarget.style.borderColor =
                          "var(--shopify-border)")
                      }
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: "var(--shopify-text-primary)" }}
                    >
                      Max Value (₹)
                    </label>
                    <input
                      type="number"
                      name="maxValue"
                      value={formData.maxValue}
                      onChange={handleInputChange}
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
                        (e.currentTarget.style.borderColor =
                          "var(--shopify-border)")
                      }
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--shopify-text-primary)" }}
                  >
                    Usage Limit
                  </label>
                  <input
                    type="number"
                    name="usageLimit"
                    value={formData.usageLimit}
                    onChange={handleInputChange}
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
                      (e.currentTarget.style.borderColor =
                        "var(--shopify-border)")
                    }
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--shopify-text-primary)" }}
                  >
                    Start Date (Optional)
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
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
                      (e.currentTarget.style.borderColor =
                        "var(--shopify-border)")
                    }
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--shopify-text-primary)" }}
                  >
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
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
                      (e.currentTarget.style.borderColor =
                        "var(--shopify-border)")
                    }
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-lg font-medium text-white transition-colors"
                    style={{
                      backgroundColor: "var(--shopify-action-primary)",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        "var(--shopify-action-primary-hover)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        "var(--shopify-action-primary)")
                    }
                  >
                    Create Coupon
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-2.5 rounded-lg font-medium border transition-colors"
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
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Coupon Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div
            className="rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto"
            style={{
              backgroundColor: "var(--shopify-surface)",
            }}
          >
            <div className="p-6">
              <h2
                className="text-xl font-semibold mb-5"
                style={{ color: "var(--shopify-text-primary)" }}
              >
                Edit Coupon
              </h2>
              <form onSubmit={handleEditCoupon} className="space-y-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--shopify-text-primary)" }}
                  >
                    Coupon Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
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
                      (e.currentTarget.style.borderColor =
                        "var(--shopify-border)")
                    }
                    required
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--shopify-text-primary)" }}
                  >
                    Coupon Code
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border text-sm transition-colors font-mono"
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
                      (e.currentTarget.style.borderColor =
                        "var(--shopify-border)")
                    }
                    required
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--shopify-text-primary)" }}
                  >
                    Discount Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
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
                      (e.currentTarget.style.borderColor =
                        "var(--shopify-border)")
                    }
                  >
                    <option value="percentage">Percentage</option>
                    <option value="flat">Flat Amount</option>
                  </select>
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--shopify-text-primary)" }}
                  >
                    {formData.type === "percentage"
                      ? "Percentage (%)"
                      : "Amount (₹)"}
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
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
                      (e.currentTarget.style.borderColor =
                        "var(--shopify-border)")
                    }
                    min="0"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: "var(--shopify-text-primary)" }}
                    >
                      Min Value (₹)
                    </label>
                    <input
                      type="number"
                      name="minValue"
                      value={formData.minValue}
                      onChange={handleInputChange}
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
                        (e.currentTarget.style.borderColor =
                          "var(--shopify-border)")
                      }
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: "var(--shopify-text-primary)" }}
                    >
                      Max Value (₹)
                    </label>
                    <input
                      type="number"
                      name="maxValue"
                      value={formData.maxValue}
                      onChange={handleInputChange}
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
                        (e.currentTarget.style.borderColor =
                          "var(--shopify-border)")
                      }
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--shopify-text-primary)" }}
                  >
                    Usage Limit
                  </label>
                  <input
                    type="number"
                    name="usageLimit"
                    value={formData.usageLimit}
                    onChange={handleInputChange}
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
                      (e.currentTarget.style.borderColor =
                        "var(--shopify-border)")
                    }
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--shopify-text-primary)" }}
                  >
                    Start Date (Optional)
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
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
                      (e.currentTarget.style.borderColor =
                        "var(--shopify-border)")
                    }
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--shopify-text-primary)" }}
                  >
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
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
                      (e.currentTarget.style.borderColor =
                        "var(--shopify-border)")
                    }
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-lg font-medium text-white transition-colors"
                    style={{
                      backgroundColor: "var(--shopify-action-primary)",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        "var(--shopify-action-primary-hover)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        "var(--shopify-action-primary)")
                    }
                  >
                    Update Coupon
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 py-2.5 rounded-lg font-medium border transition-colors"
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
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
