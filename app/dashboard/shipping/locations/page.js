"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ShippingLocationsPage() {
  const router = useRouter();
  const [zipCodes, setZipCodes] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchZipCodes();
  }, []);

  const fetchZipCodes = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/shipping");
      if (!res.ok) {
        throw new Error("Failed to fetch zip codes");
      }
      const data = await res.json();
      if (data.success) {
        setZipCodes(data.data || []);
      } else {
        throw new Error(data.message || "Failed to fetch zip codes");
      }
    } catch (error) {
      console.error("Error fetching zip codes:", error);
      showNotification("Failed to fetch shipping locations", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddZipCode = () => {
    router.push("/dashboard/shipping/locations/add");
  };

  const handleDeleteZipCode = async (id, zipCode) => {
    if (
      !confirm(
        `Are you sure you want to delete zip code "${zipCode}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/shipping/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete zip code");
      }

      setZipCodes(zipCodes.filter((zc) => zc._id !== id));
      showNotification("Zip code deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting zip code:", error);
      showNotification("Failed to delete zip code", "error");
    }
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
            Loading shipping locations...
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
            Shipping Locations
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: "var(--shopify-text-secondary)" }}
          >
            Manage zip codes and shipping charges
          </p>
        </div>
        <button
          onClick={handleAddZipCode}
          className="px-4 py-2.5 rounded-lg font-medium text-white transition-colors flex items-center gap-2"
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Zip Codes
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            Total Locations
          </p>
          <p
            className="text-2xl font-semibold"
            style={{ color: "var(--shopify-text-primary)" }}
          >
            {zipCodes.length}
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
            Unique States
          </p>
          <p
            className="text-2xl font-semibold"
            style={{ color: "var(--shopify-text-primary)" }}
          >
            {new Set(zipCodes.map((zc) => zc.state)).size}
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
            Avg. Shipping Charge
          </p>
          <p
            className="text-2xl font-semibold"
            style={{ color: "var(--shopify-text-primary)" }}
          >
            ₹
            {zipCodes.length > 0
              ? (
                  zipCodes.reduce((sum, zc) => sum + (zc.charges || 0), 0) /
                  zipCodes.length
                ).toFixed(0)
              : 0}
          </p>
        </div>
      </div>

      {zipCodes.length === 0 ? (
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
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <h3
            className="text-xl font-semibold mb-2"
            style={{ color: "var(--shopify-text-primary)" }}
          >
            No Shipping Locations Yet
          </h3>
          <p
            className="mb-6"
            style={{ color: "var(--shopify-text-secondary)" }}
          >
            Add zip codes to configure shipping charges for different locations
          </p>
          <button
            onClick={handleAddZipCode}
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
            Add First Location
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
                    Zip Code
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: "var(--shopify-text-secondary)" }}
                  >
                    State
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: "var(--shopify-text-secondary)" }}
                  >
                    State Code
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: "var(--shopify-text-secondary)" }}
                  >
                    Shipping Charge
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: "var(--shopify-text-secondary)" }}
                  >
                    Min. Order Value
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
                {zipCodes.map((zc, index) => (
                  <tr
                    key={zc._id}
                    className="transition-colors"
                    style={{
                      borderBottom:
                        index !== zipCodes.length - 1
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
                      <p
                        className="text-sm font-medium font-mono"
                        style={{ color: "var(--shopify-text-primary)" }}
                      >
                        {zc.zipCode}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p
                        className="text-sm"
                        style={{ color: "var(--shopify-text-primary)" }}
                      >
                        {zc.state || "N/A"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="px-2.5 py-1 text-xs font-medium rounded-full"
                        style={{
                          backgroundColor: "#EBF5FA",
                          color: "#2C6ECB",
                        }}
                      >
                        {zc.stateCode || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p
                        className="text-sm font-medium"
                        style={{ color: "var(--shopify-text-primary)" }}
                      >
                        ₹{zc.charges ? zc.charges.toFixed(2) : "0.00"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p
                        className="text-sm"
                        style={{ color: "var(--shopify-text-secondary)" }}
                      >
                        ₹
                        {zc.priceLessThan
                          ? zc.priceLessThan.toFixed(2)
                          : "0.00"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => handleDeleteZipCode(zc._id, zc.zipCode)}
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
                          title="Delete Location"
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
    </div>
  );
}
