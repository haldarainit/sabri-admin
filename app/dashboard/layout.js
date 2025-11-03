"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [shippingDropdownOpen, setShippingDropdownOpen] = useState(false);

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const res = await fetch("/api/admin/me", {
          method: "GET",
          credentials: "include", // send cookies
        });

        if (!res.ok) {
          router.push("/login");
          return;
        }

        const data = await res.json();
        setAdmin(data); // ✅ set admin state
      } catch (error) {
        router.push("/login");
      } finally {
        setLoading(false); // ✅ hide loader
      }
    };

    verifyAdmin();

    // Set initial sidebar visibility based on screen size
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        // lg breakpoint
        setSidebarVisible(true);
      } else {
        setSidebarVisible(false);
      }
    };

    // Set initial state
    handleResize();

    // Listen for window resize
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      router.push("/login");
    }
  };

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  if (loading) {
    return (
      <div
        className="h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--shopify-bg-primary)" }}
      >
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
            style={{ borderColor: "var(--shopify-action-primary)" }}
          ></div>
          <p
            className="font-medium"
            style={{ color: "var(--shopify-text-secondary)" }}
          >
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ backgroundColor: "var(--shopify-bg-primary)" }}
    >
      {/* Fixed Navbar - Shopify Style */}
      <nav
        className="border-b flex-shrink-0 shadow-sm"
        style={{
          backgroundColor: "var(--shopify-surface)",
          borderColor: "var(--shopify-border)",
        }}
      >
        <div className="px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {/* Menu Toggle Button */}
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg transition-all duration-200 hover:bg-opacity-80"
              style={{
                backgroundColor: "transparent",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "var(--shopify-surface-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
              title={sidebarVisible ? "Hide Menu" : "Show Menu"}
            >
              <svg
                className="w-5 h-5"
                style={{ color: "var(--shopify-text-primary)" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            {/* Logo */}
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "var(--shopify-action-primary)" }}
              >
                <svg
                  className="w-5 h-5 text-white"
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
              <div
                className="text-lg font-semibold"
                style={{ color: "var(--shopify-text-primary)" }}
              >
                Sabri Admin
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Access - Analytics Button */}
            <button
              onClick={() => router.push("/dashboard/analytics")}
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-white font-medium text-sm shadow-sm"
              style={{ backgroundColor: "var(--shopify-action-primary)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "var(--shopify-action-primary-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "var(--shopify-action-primary)")
              }
              title="View Analytics Dashboard"
            >
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <span>Analytics</span>
            </button>

            {admin && (
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                style={{ backgroundColor: "var(--shopify-surface-subdued)" }}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "var(--shopify-action-primary)" }}
                >
                  <svg
                    className="w-4 h-4 text-white"
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
                </div>
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--shopify-text-secondary)" }}
                >
                  {admin.email}
                </span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg transition-all duration-200 text-white font-medium text-sm"
              style={{ backgroundColor: "var(--shopify-action-critical)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "var(--shopify-action-critical-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "var(--shopify-action-critical)")
              }
            >
              <span className="flex items-center gap-2">
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
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Logout
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Section - Takes remaining height */}
      <div className="flex flex-1 relative overflow-hidden">
        {/* Fixed Sidebar - Shopify Style */}
        <aside
          className={`${
            sidebarVisible ? "translate-x-0" : "-translate-x-full"
          } fixed top-[52px] left-0 h-[calc(100vh-52px)] w-64 transition-transform duration-300 border-r z-40 flex-shrink-0`}
          style={{
            backgroundColor: "var(--shopify-surface)",
            borderColor: "var(--shopify-border)",
          }}
        >
          <div className="p-4 h-full overflow-y-auto">
            <ul className="space-y-1">
              {/* Dashboard Section */}
              <li className="mb-3">
                <div className="px-3 py-2">
                  <h3
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "var(--shopify-text-secondary)" }}
                  >
                    Dashboard
                  </h3>
                </div>
              </li>
              <li>
                <button
                  onClick={() => {
                    router.push("/dashboard");
                    if (window.innerWidth < 1024) setSidebarVisible(false);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-3 group font-medium text-sm"
                  style={{ color: "var(--shopify-text-primary)" }}
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
                    style={{ color: "var(--shopify-text-secondary)" }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  <span>Home</span>
                </button>
              </li>

              <li>
                <button
                  onClick={() => {
                    router.push("/dashboard/add-product");
                    if (window.innerWidth < 1024) setSidebarVisible(false);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-3 group font-medium text-sm"
                  style={{ color: "var(--shopify-text-primary)" }}
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
                    style={{ color: "var(--shopify-text-secondary)" }}
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
                  <span>Add Product</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    router.push("/dashboard/view-products");
                    if (window.innerWidth < 1024) setSidebarVisible(false);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-3 group font-medium text-sm"
                  style={{ color: "var(--shopify-text-primary)" }}
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
                    style={{ color: "var(--shopify-text-secondary)" }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                  <span>Products</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    router.push("/dashboard/orders");
                    if (window.innerWidth < 1024) setSidebarVisible(false);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-3 group font-medium text-sm"
                  style={{ color: "var(--shopify-text-primary)" }}
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
                  <span>Orders</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    router.push("/dashboard/customers");
                    if (window.innerWidth < 1024) setSidebarVisible(false);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-3 group font-medium text-sm"
                  style={{ color: "var(--shopify-text-primary)" }}
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
                    style={{ color: "var(--shopify-text-secondary)" }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                  <span>Customers</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    router.push("/dashboard/reviews");
                    if (window.innerWidth < 1024) setSidebarVisible(false);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-3 group font-medium text-sm"
                  style={{ color: "var(--shopify-text-primary)" }}
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
                    style={{ color: "var(--shopify-text-secondary)" }}
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
                  <span>Reviews</span>
                </button>
              </li>
              <li className="py-2">
                <div
                  className="border-t"
                  style={{ borderColor: "var(--shopify-border-subdued)" }}
                ></div>
              </li>

              <li>
                <button
                  onClick={() => {
                    router.push("/dashboard/email-journey");
                    if (window.innerWidth < 1024) setSidebarVisible(false);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-3 group font-medium text-sm"
                  style={{ color: "var(--shopify-text-primary)" }}
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
                    style={{ color: "var(--shopify-text-secondary)" }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span>Email Journey</span>
                </button>
              </li>

              <li>
                <button
                  onClick={() => {
                    router.push("/dashboard/coupons");
                    if (window.innerWidth < 1024) setSidebarVisible(false);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-3 group font-medium text-sm"
                  style={{ color: "var(--shopify-text-primary)" }}
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
                  <span>Discounts</span>
                </button>
              </li>

              <li>
                <button
                  onClick={() => {
                    router.push("/dashboard/analytics");
                    if (window.innerWidth < 1024) setSidebarVisible(false);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-3 group font-medium text-sm"
                  style={{ color: "var(--shopify-text-primary)" }}
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
                    style={{ color: "var(--shopify-text-secondary)" }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <span>Analytics</span>
                </button>
              </li>

              {/* Shipping Settings Dropdown */}
              <li>
                <div className="relative">
                  <button
                    onClick={() =>
                      setShippingDropdownOpen(!shippingDropdownOpen)
                    }
                    className="w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 flex items-center justify-between group font-medium text-sm"
                    style={{ color: "var(--shopify-text-primary)" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        "var(--shopify-surface-hover)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <div className="flex items-center gap-3">
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
                      <span>Shipping</span>
                    </div>
                    <svg
                      className={`w-4 h-4 transform ${
                        shippingDropdownOpen ? "rotate-180" : "rotate-0"
                      } transition-transform duration-200`}
                      style={{ color: "var(--shopify-text-secondary)" }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  </button>
                  {shippingDropdownOpen && (
                    <ul className="pl-8 mt-1 space-y-1">
                      <li>
                        <button
                          onClick={() => {
                            router.push("/dashboard/shipping/locations");
                            if (window.innerWidth < 1024)
                              setSidebarVisible(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm"
                          style={{ color: "var(--shopify-text-secondary)" }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "var(--shopify-surface-hover)";
                            e.currentTarget.style.color =
                              "var(--shopify-text-primary)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "transparent";
                            e.currentTarget.style.color =
                              "var(--shopify-text-secondary)";
                          }}
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
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <span>Locations</span>
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => {
                            router.push("/dashboard/shipping/states");
                            if (window.innerWidth < 1024)
                              setSidebarVisible(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm"
                          style={{ color: "var(--shopify-text-secondary)" }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "var(--shopify-surface-hover)";
                            e.currentTarget.style.color =
                              "var(--shopify-text-primary)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "transparent";
                            e.currentTarget.style.color =
                              "var(--shopify-text-secondary)";
                          }}
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
                              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                            />
                          </svg>
                          <span>States</span>
                        </button>
                      </li>
                    </ul>
                  )}
                </div>
              </li>
            </ul>
          </div>
        </aside>

        {/* Mobile Overlay - Only shows on mobile when sidebar is open */}
        {sidebarVisible && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden top-[52px]"
            onClick={() => setSidebarVisible(false)}
          ></div>
        )}

        {/* Scrollable Main Content - Shopify Style */}
        <main
          className={`flex-1 transition-all duration-300 overflow-hidden ${
            sidebarVisible ? "lg:ml-64" : "ml-0"
          }`}
          style={{ backgroundColor: "var(--shopify-bg-primary)" }}
        >
          {/* Content wrapper with scroll */}
          <div className="h-full overflow-y-auto">
            <div className="p-6 max-w-[1600px] mx-auto">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
