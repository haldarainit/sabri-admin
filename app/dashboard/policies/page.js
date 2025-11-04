"use client";

import { useEffect, useState } from "react";
import RichTextEditor from "../../../components/RichTextEditor";
import ErrorBoundary from "../../../components/ErrorBoundary";

export default function PoliciesPage() {
  const [showEditor, setShowEditor] = useState(false);
  const [currentPolicy, setCurrentPolicy] = useState(null);
  const [policyContents, setPolicyContents] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [policies] = useState([
    {
      id: 1,
      key: "return_refund",
      title: "Return and refund policy",
      icon: (
        <svg
          className="w-5 h-5"
          style={{ color: "var(--shopify-text-secondary)" }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
          />
        </svg>
      ),
    },
    {
      id: 2,
      key: "privacy",
      title: "Privacy policy",
      icon: (
        <svg
          className="w-5 h-5"
          style={{ color: "var(--shopify-text-secondary)" }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      ),
    },
    {
      id: 3,
      key: "terms",
      title: "Terms of service",
      icon: (
        <svg
          className="w-5 h-5"
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
      ),
    },
    {
      id: 4,
      key: "shipping",
      title: "Shipping policy",
      icon: (
        <svg
          className="w-5 h-5"
          style={{ color: "var(--shopify-text-secondary)" }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
          />
        </svg>
      ),
    },
    {
      id: 5,
      key: "contact",
      title: "Contact information",
      icon: (
        <svg
          className="w-5 h-5"
          style={{ color: "var(--shopify-text-secondary)" }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
  ]);

  useEffect(() => {
    let isActive = true;
    async function loadPolicies() {
      try {
        setLoading(true);
        setError("");
        const res = await fetch("/api/admin/policies", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load policies");
        const json = await res.json();
        if (json?.success && Array.isArray(json.data)) {
          const map = {};
          for (const p of json.data) {
            if (p?.key) map[p.key] = p.content || "";
          }
          if (isActive) setPolicyContents(map);
        }
      } catch (e) {
        if (isActive) setError("Could not load saved policies.");
      } finally {
        if (isActive) setLoading(false);
      }
    }
    loadPolicies();
    return () => {
      isActive = false;
    };
  }, []);

  const handlePolicyClick = (policy) => {
    setCurrentPolicy(policy);
    setShowEditor(true);
  };

  const handleSavePolicy = async (content) => {
    if (!currentPolicy) return;
    try {
      setError("");
      const key = currentPolicy.key;
      const res = await fetch(`/api/admin/policies/${key}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: currentPolicy.title, content }),
      });
      if (!res.ok) throw new Error("Failed to save policy");
      setPolicyContents((prev) => ({ ...prev, [key]: content }));
      setShowEditor(false);
      setCurrentPolicy(null);
    } catch (e) {
      setError("Could not save policy. Please try again.");
    }
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
    setCurrentPolicy(null);
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--shopify-bg-primary)" }}
    >
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1
            className="text-2xl font-semibold"
            style={{ color: "var(--shopify-text-primary)" }}
          >
            Written policies
          </h1>
          <button
            className="p-2 rounded-lg hover:bg-opacity-80 transition-all duration-200"
            style={{ color: "var(--shopify-text-secondary)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                "var(--shopify-surface-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
            title="More options"
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
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </button>
        </div>

        <p
          className="text-sm"
          style={{ color: "var(--shopify-text-secondary)" }}
        >
          Policies are linked in the footer of checkout and can be added to your{" "}
          <a
            href="#"
            className="underline hover:no-underline"
            style={{ color: "var(--shopify-action-primary)" }}
          >
            online store menu
          </a>
        </p>
      </div>

      {/* Policies List */}
      <div
        className="rounded-lg border shadow-sm"
        style={{
          backgroundColor: "var(--shopify-surface)",
          borderColor: "var(--shopify-border)",
        }}
      >
        <div
          className="divide-y"
          style={{ borderColor: "var(--shopify-border)" }}
        >
          {policies.map((policy, index) => (
            <div
              key={policy.id}
              className={`flex items-center justify-between p-4 hover:bg-opacity-50 transition-all duration-200 cursor-pointer group ${
                index === 0 ? "rounded-t-lg" : ""
              } ${index === policies.length - 1 ? "rounded-b-lg" : ""}`}
              onClick={() => handlePolicyClick(policy)}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "var(--shopify-surface-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">{policy.icon}</div>
                <span
                  className="font-medium text-sm"
                  style={{ color: "var(--shopify-text-primary)" }}
                >
                  {policy.title}
                </span>
              </div>

              <svg
                className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200"
                style={{ color: "var(--shopify-text-secondary)" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-6">
        <div
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: "var(--shopify-surface-subdued)",
            borderColor: "var(--shopify-border-subdued)",
          }}
        >
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 mt-0.5 flex-shrink-0"
              style={{ color: "var(--shopify-action-primary)" }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h4
                className="font-medium text-sm mb-1"
                style={{ color: "var(--shopify-text-primary)" }}
              >
                Policy management
              </h4>
              <p
                className="text-sm"
                style={{ color: "var(--shopify-text-secondary)" }}
              >
                Click on any policy above to edit its content. These policies
                help build trust with your customers and ensure compliance with
                legal requirements.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rich Text Editor Modal */}
      {showEditor && currentPolicy && (
        <ErrorBoundary>
          <RichTextEditor
            title={`Edit ${currentPolicy.title}`}
            initialContent={
              policyContents[currentPolicy.key] ||
              `<h2>${
                currentPolicy.title
              }</h2><p>Start writing your ${currentPolicy.title.toLowerCase()} content here...</p>`
            }
            onSave={handleSavePolicy}
            onClose={handleCloseEditor}
          />
        </ErrorBoundary>
      )}
    </div>
  );
}
