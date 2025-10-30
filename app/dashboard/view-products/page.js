"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ViewProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products?getAll=true", {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await res.json();
        setProducts(data.data?.products || []);
      } catch (error) {
        console.error("Error fetching products:", error);
        showNotification("Failed to fetch products", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

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

  const handleDelete = async (id, productName) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${productName}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to delete product");
      }

      showNotification("Product deleted successfully!", "success");
      setProducts(products.filter((product) => product._id !== id));
    } catch (error) {
      console.error("Error deleting product:", error);
      showNotification("Failed to delete product", "error");
    }
  };

  const handleStockUpdate = async (productId, newStockStatus) => {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stock: newStockStatus === "available" ? 10 : 0,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update stock");
      }

      showNotification("Stock updated successfully!", "success");
      setProducts(
        products.map((product) =>
          product._id === productId
            ? { ...product, stock: newStockStatus === "available" ? 10 : 0 }
            : product
        )
      );
    } catch (error) {
      console.error("Error updating stock:", error);
      showNotification("Failed to update stock", "error");
    }
  };

  // Filter and search products
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      !filterCategory || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    if (sortBy === "price" || sortBy === "stock") {
      aValue = parseFloat(aValue) || 0;
      bValue = parseFloat(bValue) || 0;
    } else {
      aValue = String(aValue || "").toLowerCase();
      bValue = String(bValue || "").toLowerCase();
    }

    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = sortedProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);

  // Get unique categories for filter
  const categories = [...new Set(products.map((product) => product.category))];

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
            Loading products...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Page Header - Shopify Style */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-semibold"
            style={{ color: "var(--shopify-text-primary)" }}
          >
            Products
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: "var(--shopify-text-secondary)" }}
          >
            {sortedProducts.length}{" "}
            {sortedProducts.length === 1 ? "product" : "products"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={async () => {
              try {
                if (!products || !products.length) {
                  alert("No products to export");
                  return;
                }
                const headers = [
                  "_id",
                  "name",
                  "sku",
                  "category",
                  "price",
                  "cost",
                  "stock",
                  "brand",
                  "isActive",
                  "isFeatured",
                  "tags",
                ];

                const rows = products.map((p) => [
                  p._id || "",
                  p.name || "",
                  p.sku || "",
                  p.category || "",
                  p.price || "",
                  p.cost || "",
                  p.stock || 0,
                  p.brand || "",
                  p.isActive ? "true" : "false",
                  p.isFeatured ? "true" : "false",
                  Array.isArray(p.tags) ? p.tags.join("|") : p.tags || "",
                ]);

                const csvContent = [headers, ...rows]
                  .map((r) =>
                    r
                      .map((cell) => {
                        if (cell === null || cell === undefined) return "";
                        const cellStr = String(cell).replace(/"/g, '""');
                        return `"${cellStr}"`;
                      })
                      .join(",")
                  )
                  .join("\n");

                const blob = new Blob([csvContent], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `products_export_${new Date()
                  .toISOString()
                  .slice(0, 10)}.csv`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
              } catch (e) {
                console.error("Error exporting CSV:", e);
                alert("Failed to export CSV. See console for details.");
              }
            }}
            className="px-4 py-2 rounded-lg font-medium text-sm transition-colors border"
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
              (e.currentTarget.style.backgroundColor = "var(--shopify-surface)")
            }
          >
            Export
          </button>
          <button
            onClick={() => router.push("/dashboard/add-product")}
            className="px-4 py-2 rounded-lg font-medium text-sm text-white transition-colors"
            style={{ backgroundColor: "var(--shopify-action-primary)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                "var(--shopify-action-primary-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor =
                "var(--shopify-action-primary)")
            }
          >
            Add product
          </button>
        </div>
      </div>

      {/* Statistics Cards - Shopify Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className="rounded-lg p-5 border"
          style={{
            backgroundColor: "var(--shopify-surface)",
            borderColor: "var(--shopify-border)",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-sm mb-1"
                style={{ color: "var(--shopify-text-secondary)" }}
              >
                Total SKUs
              </p>
              <p
                className="text-2xl font-semibold"
                style={{ color: "var(--shopify-text-primary)" }}
              >
                {products.length}
              </p>
            </div>
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{
                backgroundColor: "var(--shopify-action-primary)",
                opacity: 0.1,
              }}
            >
              <svg
                className="w-5 h-5"
                style={{ color: "var(--shopify-action-primary)" }}
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
            </div>
          </div>
        </div>

        <div
          className="rounded-lg p-5 border"
          style={{
            backgroundColor: "var(--shopify-surface)",
            borderColor: "var(--shopify-border)",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-sm mb-1"
                style={{ color: "var(--shopify-text-secondary)" }}
              >
                Total Units
              </p>
              <p
                className="text-2xl font-semibold"
                style={{ color: "var(--shopify-text-primary)" }}
              >
                {products
                  .reduce((sum, product) => sum + (product.stock || 0), 0)
                  .toLocaleString()}
              </p>
            </div>
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{
                backgroundColor: "#5E4DB2",
                opacity: 0.1,
              }}
            >
              <svg
                className="w-5 h-5"
                style={{ color: "#5E4DB2" }}
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
          </div>
        </div>

        <div
          className="rounded-lg p-5 border"
          style={{
            backgroundColor: "var(--shopify-surface)",
            borderColor: "var(--shopify-border)",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-sm mb-1"
                style={{ color: "var(--shopify-text-secondary)" }}
              >
                Total Cost
              </p>
              <p
                className="text-2xl font-semibold"
                style={{ color: "var(--shopify-text-primary)" }}
              >
                ₹
                {products
                  .reduce((sum, product) => {
                    const cost = parseFloat(product.cost) || 0;
                    const stock = parseInt(product.stock) || 0;
                    return sum + cost * stock;
                  }, 0)
                  .toLocaleString()}
              </p>
              <p
                className="text-xs mt-1"
                style={{ color: "var(--shopify-text-secondary)" }}
              >
                {products.filter((p) => (parseFloat(p.cost) || 0) > 0).length}{" "}
                products
              </p>
            </div>
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{
                backgroundColor: "#FFA500",
                opacity: 0.1,
              }}
            >
              <svg
                className="w-5 h-5"
                style={{ color: "#FFA500" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div
          className="rounded-lg p-5 border"
          style={{
            backgroundColor: "var(--shopify-surface)",
            borderColor: "var(--shopify-border)",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-sm mb-1"
                style={{ color: "var(--shopify-text-secondary)" }}
              >
                Total Profit
              </p>
              <p
                className="text-2xl font-semibold"
                style={{ color: "var(--shopify-text-primary)" }}
              >
                ₹
                {products
                  .reduce((sum, product) => {
                    const profit =
                      ((product.price || 0) - (product.cost || 0)) *
                      (product.stock || 0);
                    return sum + profit;
                  }, 0)
                  .toLocaleString()}
              </p>
            </div>
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{
                backgroundColor: "var(--shopify-action-primary)",
                opacity: 0.1,
              }}
            >
              <svg
                className="w-5 h-5"
                style={{ color: "var(--shopify-action-primary)" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {products.length === 0 ? (
        // Empty State - Shopify Style
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
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <h3
            className="text-xl font-semibold mb-2"
            style={{ color: "var(--shopify-text-primary)" }}
          >
            No Products Found
          </h3>
          <p
            className="mb-6"
            style={{ color: "var(--shopify-text-secondary)" }}
          >
            Get started by adding your first product
          </p>
          <button
            onClick={() => router.push("/dashboard/add-product")}
            className="px-6 py-2.5 rounded-lg font-medium text-white transition-colors"
            style={{ backgroundColor: "var(--shopify-action-primary)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                "var(--shopify-action-primary-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor =
                "var(--shopify-action-primary)")
            }
          >
            Add Product
          </button>
        </div>
      ) : (
        <>
          {/* Filters and Search - Shopify Style */}
          <div
            className="rounded-lg border p-4"
            style={{
              backgroundColor: "var(--shopify-surface)",
              borderColor: "var(--shopify-border)",
            }}
          >
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                {/* Search */}
                <div className="relative flex-1 lg:w-80">
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
                    placeholder="Search products..."
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

                {/* Category Filter */}
                <select
                  value={filterCategory}
                  onChange={(e) => {
                    setFilterCategory(e.target.value);
                    setCurrentPage(1);
                  }}
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
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Options */}
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
                  <option value="price">Sort by Price</option>
                  <option value="stock">Sort by Stock</option>
                  <option value="category">Sort by Category</option>
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

          {/* Products Table - Shopify Style */}
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
                      Product
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: "var(--shopify-text-secondary)" }}
                    >
                      Category
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: "var(--shopify-text-secondary)" }}
                    >
                      Price
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: "var(--shopify-text-secondary)" }}
                    >
                      Stock
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
                  {currentProducts.map((product, index) => (
                    <tr
                      key={product._id}
                      className="transition-colors"
                      style={{
                        borderBottom:
                          index !== currentProducts.length - 1
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
                        <div className="flex items-center gap-3">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-lg border"
                              style={{ borderColor: "var(--shopify-border)" }}
                            />
                          ) : (
                            <div
                              className="w-12 h-12 rounded-lg border flex items-center justify-center"
                              style={{
                                backgroundColor: "var(--shopify-bg-primary)",
                                borderColor: "var(--shopify-border)",
                              }}
                            >
                              <svg
                                className="w-6 h-6"
                                style={{
                                  color: "var(--shopify-text-secondary)",
                                }}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                          )}
                          <div>
                            <p
                              className="font-medium text-sm"
                              style={{ color: "var(--shopify-text-primary)" }}
                            >
                              {product.name}
                            </p>
                            <p
                              className="text-xs"
                              style={{ color: "var(--shopify-text-secondary)" }}
                            >
                              SKU: {product.sku || "N/A"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="px-2.5 py-1 text-xs font-medium rounded-full"
                          style={{
                            backgroundColor: "var(--shopify-bg-primary)",
                            color: "var(--shopify-text-primary)",
                          }}
                        >
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p
                          className="font-medium text-sm"
                          style={{ color: "var(--shopify-text-primary)" }}
                        >
                          ₹{product.price?.toLocaleString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={
                            product.stock > 0 ? "available" : "unavailable"
                          }
                          onChange={(e) =>
                            handleStockUpdate(product._id, e.target.value)
                          }
                          className="px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors"
                          style={{
                            backgroundColor:
                              product.stock > 0 ? "#E6F4EA" : "#FDE7E9",
                            borderColor:
                              product.stock > 0 ? "#34A853" : "#D72C0D",
                            color: product.stock > 0 ? "#137333" : "#B3261E",
                          }}
                        >
                          <option value="available">
                            Available ({product.stock})
                          </option>
                          <option value="unavailable">Out of Stock</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() =>
                              router.push(`/dashboard/products/${product._id}`)
                            }
                            className="p-2 rounded-lg transition-colors"
                            style={{
                              backgroundColor: "transparent",
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
                            title="Edit"
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
                              handleDelete(product._id, product.name)
                            }
                            className="p-2 rounded-lg transition-colors"
                            style={{
                              backgroundColor: "transparent",
                              color: "var(--shopify-action-critical)",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#FDE7E9";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor =
                                "transparent";
                            }}
                            title="Delete"
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

          {/* Pagination - Shopify Style */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p
                className="text-sm"
                style={{ color: "var(--shopify-text-secondary)" }}
              >
                Showing {indexOfFirstProduct + 1} to{" "}
                {Math.min(indexOfLastProduct, sortedProducts.length)} of{" "}
                {sortedProducts.length} products
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
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
                {[...Array(totalPages)].map((_, index) => {
                  const pageNumber = index + 1;
                  // Show first, last, and pages around current
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 1 &&
                      pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => paginate(pageNumber)}
                        className="px-3 py-2 rounded-lg font-medium text-sm transition-colors border"
                        style={
                          currentPage === pageNumber
                            ? {
                                backgroundColor:
                                  "var(--shopify-action-primary)",
                                borderColor: "var(--shopify-action-primary)",
                                color: "white",
                              }
                            : {
                                backgroundColor: "var(--shopify-surface)",
                                borderColor: "var(--shopify-border)",
                                color: "var(--shopify-text-primary)",
                              }
                        }
                        onMouseEnter={(e) =>
                          currentPage !== pageNumber &&
                          (e.currentTarget.style.backgroundColor =
                            "var(--shopify-surface-hover)")
                        }
                        onMouseLeave={(e) =>
                          currentPage !== pageNumber &&
                          (e.currentTarget.style.backgroundColor =
                            "var(--shopify-surface)")
                        }
                      >
                        {pageNumber}
                      </button>
                    );
                  } else if (
                    pageNumber === currentPage - 2 ||
                    pageNumber === currentPage + 2
                  ) {
                    return (
                      <span
                        key={pageNumber}
                        className="px-2"
                        style={{ color: "var(--shopify-text-secondary)" }}
                      >
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
                <button
                  onClick={() => paginate(currentPage + 1)}
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
          )}
        </>
      )}
    </div>
  );
}
