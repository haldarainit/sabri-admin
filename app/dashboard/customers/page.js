"use client";

import { useState, useEffect } from "react";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [customersPerPage] = useState(10);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

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

  const handleDeleteCustomer = async (
    customerId,
    customerFirstName,
    customerLastName
  ) => {
    const customerName = `${customerFirstName} ${
      customerLastName || ""
    }`.trim();

    const confirmed = window.confirm(
      `Are you sure you want to delete "${customerName}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      const url = `/api/admin/customers?id=${customerId}`;
      const response = await fetch(url, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          `Failed to delete customer: ${
            errorData?.message || response.statusText
          }`
        );
      }

      showNotification("Customer deleted successfully!", "success");
      setCustomers(customers.filter((customer) => customer._id !== customerId));
    } catch (error) {
      console.error("Delete error:", error);
      showNotification(`Failed to delete customer: ${error.message}`, "error");
    }
  };

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch("/api/admin/customers", {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch customers");
        }

        const data = await response.json();
        if (data.success && data.data && data.data.customers) {
          setCustomers(data.data.customers || []);
        } else if (Array.isArray(data)) {
          setCustomers(data || []);
        } else {
          setCustomers([]);
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
        showNotification("Failed to fetch customers", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter((customer) => {
    const fullName = `${customer.firstName} ${customer.lastName || ""}`.trim();
    const phone = customer.phone || "";
    const email = customer.email || "";
    const matchesSearch =
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      phone.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    let aValue, bValue;

    if (sortBy === "name") {
      aValue = `${a.firstName} ${a.lastName || ""}`.trim();
      bValue = `${b.firstName} ${b.lastName || ""}`.trim();
    } else {
      aValue = a[sortBy];
      bValue = b[sortBy];
    }

    aValue = String(aValue || "").toLowerCase();
    bValue = String(bValue || "").toLowerCase();

    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = sortedCustomers.slice(
    indexOfFirstCustomer,
    indexOfLastCustomer
  );
  const totalPages = Math.ceil(sortedCustomers.length / customersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getInitials = (firstName, lastName) => {
    const name = `${firstName} ${lastName || ""}`.trim();
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (firstName, lastName) => {
    const name = `${firstName} ${lastName || ""}`.trim();
    const colors = [
      "#2563EB",
      "#10B981",
      "#8B5CF6",
      "#EC4899",
      "#6366F1",
      "#EF4444",
      "#F59E0B",
      "#14B8A6",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
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
            Loading customers...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-semibold"
            style={{ color: "var(--shopify-text-primary)" }}
          >
            Customers
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: "var(--shopify-text-secondary)" }}
          >
            {sortedCustomers.length}{" "}
            {sortedCustomers.length === 1 ? "customer" : "customers"}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
            Total Customers
          </p>
          <p
            className="text-2xl font-semibold"
            style={{ color: "var(--shopify-text-primary)" }}
          >
            {customers.length}
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
            Active Customers
          </p>
          <p
            className="text-2xl font-semibold"
            style={{ color: "var(--shopify-text-primary)" }}
          >
            {customers.length}
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
            Showing Results
          </p>
          <p
            className="text-2xl font-semibold"
            style={{ color: "var(--shopify-text-primary)" }}
          >
            {sortedCustomers.length}
          </p>
        </div>
      </div>

      {customers.length === 0 ? (
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
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
          </div>
          <h3
            className="text-xl font-semibold mb-2"
            style={{ color: "var(--shopify-text-primary)" }}
          >
            No Customers Found
          </h3>
          <p
            className="mb-6"
            style={{ color: "var(--shopify-text-secondary)" }}
          >
            Customers will appear here once they register for your store
          </p>
        </div>
      ) : (
        <>
          {/* Search and Sort */}
          <div
            className="rounded-lg border p-4"
            style={{
              backgroundColor: "var(--shopify-surface)",
              borderColor: "var(--shopify-border)",
            }}
          >
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex-1 w-full lg:w-auto">
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
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
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
                      (e.currentTarget.style.borderColor =
                        "var(--shopify-border)")
                    }
                  />
                </div>
              </div>

              <div className="flex gap-3 w-full lg:w-auto">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
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
                    (e.currentTarget.style.borderColor =
                      "var(--shopify-border)")
                  }
                >
                  <option value="name">Sort by Name</option>
                  <option value="email">Sort by Email</option>
                  <option value="phone">Sort by Phone</option>
                </select>
                <button
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                  className="px-3 py-2 rounded-lg border transition-colors flex items-center gap-2"
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
                  title={`Sort ${
                    sortOrder === "asc" ? "Descending" : "Ascending"
                  }`}
                >
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${
                      sortOrder === "desc" ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 11l5-5m0 0l5 5m-5-5v12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Customers Table */}
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
                      Customer
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: "var(--shopify-text-secondary)" }}
                    >
                      Phone
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: "var(--shopify-text-secondary)" }}
                    >
                      Email
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
                  {currentCustomers.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-8 text-center"
                        style={{ color: "var(--shopify-text-secondary)" }}
                      >
                        {searchTerm
                          ? `No customers matching "${searchTerm}"`
                          : "No customers found"}
                      </td>
                    </tr>
                  ) : (
                    currentCustomers.map((customer, index) => {
                      // Check if user has a valid phone number (E.164 format)
                      const hasValidPhone =
                        customer.phone &&
                        /^\+[1-9]\d{1,14}$/.test(customer.phone);

                      return (
                        <tr
                          key={customer._id}
                          className="transition-colors"
                          style={{
                            borderBottom:
                              index !== currentCustomers.length - 1
                                ? "1px solid var(--shopify-border)"
                                : "none",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "var(--shopify-surface-hover)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "transparent")
                          }
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm"
                                style={{
                                  backgroundColor: getAvatarColor(
                                    customer.firstName,
                                    customer.lastName
                                  ),
                                }}
                              >
                                {getInitials(
                                  customer.firstName,
                                  customer.lastName
                                )}
                              </div>
                              <div>
                                <p
                                  className="text-sm font-medium"
                                  style={{
                                    color: "var(--shopify-text-primary)",
                                  }}
                                >
                                  {`${customer.firstName} ${
                                    customer.lastName || ""
                                  }`.trim()}
                                </p>
                                <p
                                  className="text-xs"
                                  style={{
                                    color: "var(--shopify-text-secondary)",
                                  }}
                                >
                                  ID: {customer._id.slice(-6)}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {customer.phone ? (
                              <p
                                className="text-sm"
                                style={{ color: "var(--shopify-text-primary)" }}
                              >
                                {customer.phone}
                              </p>
                            ) : (
                              <span
                                className="text-sm"
                                style={{
                                  color: "var(--shopify-text-secondary)",
                                }}
                              >
                                —
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {hasValidPhone ? (
                              <span
                                className="text-sm"
                                style={{
                                  color: "var(--shopify-text-secondary)",
                                }}
                              >
                                Hidden
                              </span>
                            ) : (
                              <p
                                className="text-sm"
                                style={{ color: "var(--shopify-text-primary)" }}
                              >
                                {customer.email || "—"}
                              </p>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className="px-2.5 py-1 text-xs font-medium rounded-full"
                              style={{
                                backgroundColor: "#E6F4EA",
                                color: "#137333",
                              }}
                            >
                              Active
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() =>
                                  handleDeleteCustomer(
                                    customer._id,
                                    customer.firstName,
                                    customer.lastName
                                  )
                                }
                                className="p-2 rounded-lg transition-colors"
                                style={{
                                  color: "var(--shopify-action-critical)",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    "#FDE7E9";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    "transparent";
                                }}
                                title="Delete Customer"
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
                      );
                    })
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
                    Showing {indexOfFirstCustomer + 1}-
                    {Math.min(indexOfLastCustomer, sortedCustomers.length)} of{" "}
                    {sortedCustomers.length} customers
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => paginate(Math.max(1, currentPage - 1))}
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
                        paginate(Math.min(totalPages, currentPage + 1))
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
        </>
      )}
    </div>
  );
}
