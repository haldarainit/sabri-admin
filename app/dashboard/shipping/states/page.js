"use client";

import { useState, useEffect } from "react";

export default function StatesPage() {
  const [states, setStates] = useState([]);
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
    fetchStatesFromShipping();
  }, []);

  const fetchStatesFromShipping = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/shipping");
      if (!res.ok) {
        throw new Error("Failed to fetch shipping data");
      }
      const data = await res.json();

      if (data.success) {
        // Extract unique states from shipping data
        const uniqueStates = data.data.reduce((acc, current) => {
          const existing = acc.find(
            (item) =>
              item.state === current.state &&
              item.stateCode === current.stateCode &&
              item.gstCode === current.gstCode
          );
          if (!existing) {
            acc.push({
              _id: current._id,
              state: current.state,
              stateCode: current.stateCode,
              gstCode: current.gstCode,
            });
          }
          return acc;
        }, []);

        setStates(uniqueStates);
      } else {
        throw new Error(data.message || "Failed to fetch shipping data");
      }
    } catch (error) {
      console.error("Error fetching states from shipping data:", error);
      showNotification("Failed to fetch shipping states", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteState = async (stateName) => {
    if (
      !confirm(
        `Are you sure you want to delete all shipping rules for "${stateName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/shipping/state/${stateName}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete shipping rule");
      }

      fetchStatesFromShipping();
      showNotification("Shipping rule deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting shipping rule:", error);
      showNotification("Failed to delete shipping rule", "error");
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
            Loading shipping states...
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
            Shipping States
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: "var(--shopify-text-secondary)" }}
          >
            States derived from shipping locations
          </p>
        </div>
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
            Total States
          </p>
          <p
            className="text-2xl font-semibold"
            style={{ color: "var(--shopify-text-primary)" }}
          >
            {states.length}
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
            Unique GST Codes
          </p>
          <p
            className="text-2xl font-semibold"
            style={{ color: "var(--shopify-text-primary)" }}
          >
            {new Set(states.map((s) => s.gstCode)).size}
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
            Unique State Codes
          </p>
          <p
            className="text-2xl font-semibold"
            style={{ color: "var(--shopify-text-primary)" }}
          >
            {new Set(states.map((s) => s.stateCode)).size}
          </p>
        </div>
      </div>

      {states.length === 0 ? (
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
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
          </div>
          <h3
            className="text-xl font-semibold mb-2"
            style={{ color: "var(--shopify-text-primary)" }}
          >
            No States Found
          </h3>
          <p
            className="mb-6"
            style={{ color: "var(--shopify-text-secondary)" }}
          >
            Add shipping locations to see states appear here
          </p>
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
                    State Name
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
                    GST Code
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
                {states.map((s, index) => (
                  <tr
                    key={s._id}
                    className="transition-colors"
                    style={{
                      borderBottom:
                        index !== states.length - 1
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
                        className="text-sm font-medium"
                        style={{ color: "var(--shopify-text-primary)" }}
                      >
                        {s.state}
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
                        {s.stateCode}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="px-2.5 py-1 text-xs font-medium rounded-full"
                        style={{
                          backgroundColor: "#F4F0FF",
                          color: "#6E59A5",
                        }}
                      >
                        {s.gstCode}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => handleDeleteState(s.state)}
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
                          title="Delete State"
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
