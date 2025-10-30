"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // ✅ important to send/receive cookies
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ Redirect to dashboard after successful login
        router.push("/dashboard");
      } else if (res.status === 429) {
        // Handle rate limiting
        setError(
          "Too many login attempts. Please wait a few minutes before trying again."
        );
      } else {
        // ❌ Show backend error message
        setError(data.message || "Login failed");
      }
    } catch (err) {
      // 🔹 Network or unexpected errors
      console.error(err);
      if (err.name === "TypeError" && err.message.includes("Failed to fetch")) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "var(--shopify-bg-primary)" }}
    >
      <div className="w-full max-w-md">
        <div
          className="rounded-xl p-8"
          style={{
            backgroundColor: "var(--shopify-surface)",
            boxShadow: "var(--shopify-shadow-lg)",
            border: "1px solid var(--shopify-border)",
          }}
        >
          <div className="text-center mb-8">
            <div
              className="mx-auto inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4"
              style={{ backgroundColor: "var(--shopify-action-primary)" }}
            >
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
            <h1
              className="text-2xl font-semibold mb-1"
              style={{ color: "var(--shopify-text-primary)" }}
            >
              Log in
            </h1>
            <p
              className="text-sm"
              style={{ color: "var(--shopify-text-secondary)" }}
            >
              Continue to Sabri Admin
            </p>
          </div>

          {error && (
            <div
              className="mb-5 p-3 rounded-lg"
              style={{
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
              }}
            >
              <p
                className="text-sm"
                style={{ color: "var(--shopify-action-critical)" }}
              >
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label
                className="block text-sm font-medium"
                style={{ color: "var(--shopify-text-primary)" }}
              >
                Email
              </label>
              <input
                type="email"
                placeholder="admin@sabri.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm transition-all duration-150"
                style={{
                  backgroundColor: "var(--shopify-surface)",
                  border: "1.5px solid var(--shopify-border)",
                  color: "var(--shopify-text-primary)",
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor =
                    "var(--shopify-interactive)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "var(--shopify-border)")
                }
                required
              />
            </div>

            <div className="space-y-1.5">
              <label
                className="block text-sm font-medium"
                style={{ color: "var(--shopify-text-primary)" }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={isPasswordVisible ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm transition-all duration-150"
                  style={{
                    backgroundColor: "var(--shopify-surface)",
                    border: "1.5px solid var(--shopify-border)",
                    color: "var(--shopify-text-primary)",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor =
                      "var(--shopify-interactive)")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor =
                      "var(--shopify-border)")
                  }
                  required
                />
                <button
                  type="button"
                  onClick={() => setIsPasswordVisible((v) => !v)}
                  className="absolute inset-y-0 right-0 px-3 transition-colors duration-150"
                  style={{ color: "var(--shopify-text-secondary)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color =
                      "var(--shopify-text-primary)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color =
                      "var(--shopify-text-secondary)")
                  }
                  aria-label={
                    isPasswordVisible ? "Hide password" : "Show password"
                  }
                >
                  {isPasswordVisible ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 3l18 18M10.584 10.59A3 3 0 0012 15a3 3 0 002.823-4.01M21 12s-3.75 6-9 6a9.966 9.966 0 01-4.243-.93M3 12s3.75-6 9-6c1.21 0 2.356.258 3.41.72"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.644C3.423 7.51 7.36 5 12 5c4.64 0 8.577 2.51 9.964 6.678.07.213.07.431 0 .644C20.577 16.49 16.64 19 12 19c-4.64 0-8.577-2.51-9.964-6.678z"
                      />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-2.5 px-4 rounded-lg font-medium text-sm text-white transition-all duration-150 ${
                isSubmitting ? "opacity-60 cursor-not-allowed" : ""
              }`}
              style={{ backgroundColor: "var(--shopify-action-primary)" }}
              onMouseEnter={(e) =>
                !isSubmitting &&
                (e.currentTarget.style.backgroundColor =
                  "var(--shopify-action-primary-hover)")
              }
              onMouseLeave={(e) =>
                !isSubmitting &&
                (e.currentTarget.style.backgroundColor =
                  "var(--shopify-action-primary)")
              }
            >
              {isSubmitting ? "Signing in..." : "Continue"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
