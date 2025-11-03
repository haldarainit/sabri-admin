"use client";

import { useEffect, useState } from "react";

export default function ReviewsAdminPage() {
  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [pRes, aRes] = await Promise.all([
        fetch("/api/reviews?status=pending"),
        fetch("/api/reviews?status=approved&limit=100"),
      ]);
      const [pJson, aJson] = await Promise.all([pRes.json(), aRes.json()]);

      console.log("Pending reviews raw:", pJson?.data?.reviews);
      console.log("Approved reviews raw:", aJson?.data?.reviews);

      // Normalize data for consistency
      const normalizePending = (pJson?.data?.reviews || []).map((r) => {
        // Ensure _id is present and valid
        const id = r._id || r.id;
        if (!id) {
          console.error("Review missing _id and id:", r);
        }

        const normalized = {
          ...r,
          _id: id, // Use _id or fallback to id
          userName: r.user?.name || "Anonymous",
          productName: r.product?.name || "Unknown Product",
          text: r.comment || "",
        };

        console.log("Normalized pending review:", normalized);
        return normalized;
      });

      const normalizeApproved = (aJson?.data?.reviews || []).map((r) => {
        // Ensure _id is present and valid
        const id = r._id || r.id;
        if (!id) {
          console.error("Review missing _id and id:", r);
        }

        const normalized = {
          ...r,
          _id: id, // Use _id or fallback to id
          userName: r.user?.name || "Anonymous",
          productName: r.product?.name || "Unknown Product",
          text: r.comment || "",
        };

        console.log("Normalized approved review:", normalized);
        return normalized;
      });

      setPending(normalizePending);
      setApproved(normalizeApproved);
    } catch (e) {
      console.error("Load reviews error:", e);
      setError("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const update = async (id, status) => {
    // Validate id before making the request
    if (!id || id === "undefined") {
      setError("Invalid review ID");
      return;
    }

    setUpdating(id);
    try {
      const response = await fetch(`/api/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (response.ok) {
        await load();
      } else {
        setError(data.message || "Failed to update review status");
      }
    } catch (e) {
      console.error("Update review error:", e);
      setError("Failed to update review status");
    } finally {
      setUpdating(null);
    }
  };

  const StatusBadge = ({ status }) => {
    const statusStyles = {
      pending: { bg: "#FFF4E5", text: "#B98900", border: "#FFD699" },
      approved: { bg: "#E6F4EA", text: "#137333", border: "#B8D4BD" },
      rejected: { bg: "#FDE7E9", text: "#D72C0D", border: "#F7C4C7" },
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
            Loading reviews...
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
          Reviews Moderation
        </h1>
        <p
          className="text-sm mt-1"
          style={{ color: "var(--shopify-text-secondary)" }}
        >
          Approve or reject customer reviews for display on your store
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div
          className="rounded-lg border p-4"
          style={{
            backgroundColor: "#FDE7E9",
            borderColor: "#F7C4C7",
            color: "#D72C0D",
          }}
        >
          <div className="flex items-center gap-2">
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
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          className="rounded-lg border p-5"
          style={{
            backgroundColor: "var(--shopify-surface)",
            borderColor: "var(--shopify-border)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p
                className="text-sm mb-1"
                style={{ color: "var(--shopify-text-secondary)" }}
              >
                Pending Reviews
              </p>
              <p
                className="text-2xl font-semibold"
                style={{ color: "var(--shopify-text-primary)" }}
              >
                {pending.length}
              </p>
            </div>
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#FFF4E5" }}
            >
              <svg
                className="w-5 h-5"
                style={{ color: "#B98900" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div
          className="rounded-lg border p-5"
          style={{
            backgroundColor: "var(--shopify-surface)",
            borderColor: "var(--shopify-border)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p
                className="text-sm mb-1"
                style={{ color: "var(--shopify-text-secondary)" }}
              >
                Approved Reviews
              </p>
              <p
                className="text-2xl font-semibold"
                style={{ color: "var(--shopify-text-primary)" }}
              >
                {approved.length}
              </p>
            </div>
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#E6F4EA" }}
            >
              <svg
                className="w-5 h-5"
                style={{ color: "#137333" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div
          className="rounded-lg border p-5"
          style={{
            backgroundColor: "var(--shopify-surface)",
            borderColor: "var(--shopify-border)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p
                className="text-sm mb-1"
                style={{ color: "var(--shopify-text-secondary)" }}
              >
                Total Reviews
              </p>
              <p
                className="text-2xl font-semibold"
                style={{ color: "var(--shopify-text-primary)" }}
              >
                {pending.length + approved.length}
              </p>
            </div>
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#EBF5FA" }}
            >
              <svg
                className="w-5 h-5"
                style={{ color: "#2C6ECB" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Reviews */}
      <div
        className="rounded-lg border"
        style={{
          backgroundColor: "var(--shopify-surface)",
          borderColor: "var(--shopify-border)",
        }}
      >
        <div
          className="p-6 border-b"
          style={{ borderColor: "var(--shopify-border)" }}
        >
          <h2
            className="text-lg font-semibold"
            style={{ color: "var(--shopify-text-primary)" }}
          >
            Pending Reviews ({pending.length})
          </h2>
          <p
            className="text-sm mt-1"
            style={{ color: "var(--shopify-text-secondary)" }}
          >
            Reviews awaiting approval
          </p>
        </div>

        <div className="p-6">
          {pending.length === 0 ? (
            <div className="text-center py-12">
              <div
                className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3"
                style={{ backgroundColor: "var(--shopify-bg-primary)" }}
              >
                <svg
                  className="w-6 h-6"
                  style={{ color: "var(--shopify-text-secondary)" }}
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
              </div>
              <p
                className="text-sm"
                style={{ color: "var(--shopify-text-secondary)" }}
              >
                No pending reviews
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pending.map((r, index) => (
                <div
                  key={r._id || `pending-${index}`}
                  className="rounded-lg border p-4 transition-colors"
                  style={{
                    backgroundColor: "var(--shopify-bg-primary)",
                    borderColor: "var(--shopify-border)",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "var(--shopify-surface-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "var(--shopify-bg-primary)")
                  }
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                          style={{ backgroundColor: "#008060" }}
                        >
                          {(r.userName || "A").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p
                            className="text-sm font-medium"
                            style={{ color: "var(--shopify-text-primary)" }}
                          >
                            {r.userName || "Anonymous"}
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: "var(--shopify-text-secondary)" }}
                          >
                            {new Date(r.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">{"⭐".repeat(r.rating)}</div>
                        <span
                          className="text-sm"
                          style={{ color: "var(--shopify-text-secondary)" }}
                        >
                          •
                        </span>
                        <span
                          className="text-sm font-medium"
                          style={{ color: "var(--shopify-text-primary)" }}
                        >
                          {r.productName}
                        </span>
                      </div>
                      {r.text && (
                        <p
                          className="text-sm"
                          style={{ color: "var(--shopify-text-primary)" }}
                        >
                          {r.text}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => {
                          console.log(
                            "Approve clicked, ID:",
                            r._id,
                            "Full review:",
                            r
                          );
                          update(r._id, "approved");
                        }}
                        disabled={updating === r._id || !r._id}
                        className="px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                        style={{
                          backgroundColor: "#E6F4EA",
                          color: "#137333",
                        }}
                        onMouseEnter={(e) =>
                          !e.currentTarget.disabled &&
                          (e.currentTarget.style.backgroundColor = "#B8D4BD")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = "#E6F4EA")
                        }
                      >
                        {updating === r._id ? "Approving..." : "Approve"}
                      </button>
                      <button
                        onClick={() => {
                          console.log(
                            "Reject clicked (pending), ID:",
                            r._id,
                            "Full review:",
                            r
                          );
                          update(r._id, "rejected");
                        }}
                        disabled={updating === r._id || !r._id}
                        className="px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                        style={{
                          backgroundColor: "#FDE7E9",
                          color: "#D72C0D",
                        }}
                        onMouseEnter={(e) =>
                          !e.currentTarget.disabled &&
                          (e.currentTarget.style.backgroundColor = "#F7C4C7")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = "#FDE7E9")
                        }
                      >
                        {updating === r._id ? "Rejecting..." : "Reject"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Approved Reviews */}
      <div
        className="rounded-lg border"
        style={{
          backgroundColor: "var(--shopify-surface)",
          borderColor: "var(--shopify-border)",
        }}
      >
        <div
          className="p-6 border-b"
          style={{ borderColor: "var(--shopify-border)" }}
        >
          <h2
            className="text-lg font-semibold"
            style={{ color: "var(--shopify-text-primary)" }}
          >
            Approved Reviews ({approved.length})
          </h2>
          <p
            className="text-sm mt-1"
            style={{ color: "var(--shopify-text-secondary)" }}
          >
            Reviews currently displayed on your store
          </p>
        </div>

        <div className="p-6">
          {approved.length === 0 ? (
            <div className="text-center py-12">
              <div
                className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3"
                style={{ backgroundColor: "var(--shopify-bg-primary)" }}
              >
                <svg
                  className="w-6 h-6"
                  style={{ color: "var(--shopify-text-secondary)" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p
                className="text-sm"
                style={{ color: "var(--shopify-text-secondary)" }}
              >
                No approved reviews yet
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {approved.map((r, index) => (
                <div
                  key={r._id || `approved-${index}`}
                  className="rounded-lg border p-4 transition-colors"
                  style={{
                    backgroundColor: "var(--shopify-bg-primary)",
                    borderColor: "var(--shopify-border)",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "var(--shopify-surface-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "var(--shopify-bg-primary)")
                  }
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                          style={{ backgroundColor: "#008060" }}
                        >
                          {(r.userName || "A").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p
                            className="text-sm font-medium"
                            style={{ color: "var(--shopify-text-primary)" }}
                          >
                            {r.userName || "Anonymous"}
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: "var(--shopify-text-secondary)" }}
                          >
                            {new Date(r.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">{"⭐".repeat(r.rating)}</div>
                        <span
                          className="text-sm"
                          style={{ color: "var(--shopify-text-secondary)" }}
                        >
                          •
                        </span>
                        <span
                          className="text-sm font-medium"
                          style={{ color: "var(--shopify-text-primary)" }}
                        >
                          {r.productName}
                        </span>
                      </div>
                      {r.text && (
                        <p
                          className="text-sm"
                          style={{ color: "var(--shopify-text-primary)" }}
                        >
                          {r.text}
                        </p>
                      )}
                    </div>
                    <div className="ml-4">
                      <button
                        onClick={() => {
                          console.log(
                            "Reject clicked (approved), ID:",
                            r._id,
                            "Full review:",
                            r
                          );
                          update(r._id, "rejected");
                        }}
                        disabled={updating === r._id || !r._id}
                        className="px-3 py-1.5 rounded-lg font-medium text-xs transition-colors disabled:opacity-50"
                        style={{
                          backgroundColor: "#FDE7E9",
                          color: "#D72C0D",
                        }}
                        onMouseEnter={(e) =>
                          !e.currentTarget.disabled &&
                          (e.currentTarget.style.backgroundColor = "#F7C4C7")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = "#FDE7E9")
                        }
                      >
                        {updating === r._id ? "..." : "Reject"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
