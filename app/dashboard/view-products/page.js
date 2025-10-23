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
        // Show error notification
        const errorDiv = document.createElement("div");
        errorDiv.className =
          "fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2";
        errorDiv.innerHTML = `
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          Failed to fetch products
        `;
        document.body.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 3000);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleDelete = async (id, productName) => {
    // Custom confirmation modal
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

      // Success notification
      const successDiv = document.createElement("div");
      successDiv.className =
        "fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2";
      successDiv.innerHTML = `
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        Product deleted successfully!
      `;
      document.body.appendChild(successDiv);
      setTimeout(() => successDiv.remove(), 3000);

      setProducts(products.filter((product) => product._id !== id));
    } catch (error) {
      console.error("Error deleting product:", error);
      // Error notification
      const errorDiv = document.createElement("div");
      errorDiv.className =
        "fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2";
      errorDiv.innerHTML = `
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        Failed to delete product
      `;
      document.body.appendChild(errorDiv);
      setTimeout(() => errorDiv.remove(), 3000);
    }
  };

  // Handle stock status update
  const handleStockUpdate = async (productId, newStockStatus) => {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stock: newStockStatus === "available" ? 10 : 0, // Set to 10 for available, 0 for unavailable
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update stock");
      }

      const updatedProduct = await res.json();

      // Success notification
      const successDiv = document.createElement("div");
      successDiv.className =
        "fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2";
      successDiv.innerHTML = `
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        Stock updated successfully!
      `;
      document.body.appendChild(successDiv);
      setTimeout(() => successDiv.remove(), 3000);

      // Update the local state
      setProducts(
        products.map((product) =>
          product._id === productId
            ? { ...product, stock: newStockStatus === "available" ? 10 : 0 }
            : product
        )
      );
    } catch (error) {
      console.error("Error updating stock:", error);
      // Error notification
      const errorDiv = document.createElement("div");
      errorDiv.className =
        "fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2";
      errorDiv.innerHTML = `
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        Failed to update stock
      `;
      document.body.appendChild(errorDiv);
      setTimeout(() => errorDiv.remove(), 3000);
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white font-medium">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      {/* Page Header */}
      <div className="mb-8">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
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
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                  Product Management
                </h1>
                <p className="text-gray-300 mt-1">
                  Manage your product inventory and listings
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {/* Total SKUs */}
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-lg px-5 py-3 rounded-lg border border-blue-400/30 shadow-lg">
                <span className="text-xs text-blue-200 block mb-1 font-medium">
                  Total SKUs
                </span>
                <span className="text-2xl font-bold text-white">
                  {products.length}
                </span>
              </div>

              {/* Total Products (Units) */}
              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-lg px-5 py-3 rounded-lg border border-purple-400/30 shadow-lg">
                <span className="text-xs text-purple-200 block mb-1 font-medium">
                  Total Units
                </span>
                <span className="text-2xl font-bold text-white">
                  {products
                    .reduce((sum, product) => sum + (product.stock || 0), 0)
                    .toLocaleString()}
                </span>
              </div>

              {/* Total Cost */}
              <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-lg px-5 py-3 rounded-lg border border-orange-400/30 shadow-lg">
                <span className="text-xs text-orange-200 block mb-1 font-medium">
                  Total Cost
                </span>
                <span className="text-2xl font-bold text-orange-300">
                  ₹
                  {products
                    .reduce((sum, product) => {
                      const cost = parseFloat(product.cost) || 0;
                      const stock = parseInt(product.stock) || 0;
                      return sum + cost * stock;
                    }, 0)
                    .toLocaleString()}
                </span>
                <span className="text-xs text-orange-200 block mt-1">
                  {products.filter((p) => (parseFloat(p.cost) || 0) > 0).length}{" "}
                  products with cost data
                </span>
              </div>

              {/* Total Profit */}
              <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-lg px-5 py-3 rounded-lg border border-green-400/30 shadow-lg">
                <span className="text-xs text-green-200 block mb-1 font-medium">
                  Total Profit
                </span>
                <span className="text-2xl font-bold text-green-300">
                  ₹
                  {products
                    .reduce((sum, product) => {
                      const profit =
                        ((product.price || 0) - (product.cost || 0)) *
                        (product.stock || 0);
                      return sum + profit;
                    }, 0)
                    .toLocaleString()}
                </span>
              </div>

              <button
                onClick={() => router.push("/dashboard/add-product")}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2"
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Add Product
              </button>

              {/* CSV Export */}
              <button
                onClick={async () => {
                  try {
                    // Generate CSV from products array
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
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2"
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
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {products.length === 0 ? (
          // Empty State
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full mb-4">
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
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No Products Found
            </h3>
            <p className="text-gray-300 mb-6">
              Get started by adding your first product to the inventory.
            </p>
            <button
              onClick={() => router.push("/dashboard/add-product")}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg inline-flex items-center gap-2"
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
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add Your First Product
            </button>
          </div>
        ) : (
          <>
            {/* Filters and Search */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-6 mb-6">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                  {/* Search */}
                  <div className="relative flex-1 lg:w-80">
                    <svg
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
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
                      placeholder="Search products, categories, brands..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                    />
                  </div>

                  {/* Category Filter */}
                  <select
                    value={filterCategory}
                    onChange={(e) => {
                      setFilterCategory(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                  >
                    <option value="" className="bg-gray-800">
                      All Categories
                    </option>
                    {categories.map((category) => (
                      <option
                        key={category}
                        value={category}
                        className="bg-gray-800"
                      >
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
                    className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                  >
                    <option value="name" className="bg-gray-800">
                      Sort by Name
                    </option>
                    <option value="price" className="bg-gray-800">
                      Sort by Price
                    </option>
                    <option value="stock" className="bg-gray-800">
                      Sort by Stock
                    </option>
                    <option value="category" className="bg-gray-800">
                      Sort by Category
                    </option>
                  </select>
                  <button
                    onClick={() =>
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                    }
                    className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-300 flex items-center gap-2 text-white"
                    title={`Sort ${
                      sortOrder === "asc" ? "Descending" : "Ascending"
                    }`}
                  >
                    <svg
                      className={`w-5 h-5 transition-transform duration-200 ${
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
                        d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Results Info */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-sm text-gray-300">
                  Showing {indexOfFirstProduct + 1}-
                  {Math.min(indexOfLastProduct, sortedProducts.length)} of{" "}
                  {sortedProducts.length} products
                  {searchTerm && ` matching "${searchTerm}"`}
                  {filterCategory && ` in "${filterCategory}"`}
                </p>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider border-b border-white/10">
                        Product
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider border-b border-white/10">
                        Category
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider border-b border-white/10">
                        Cost
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider border-b border-white/10">
                        Price
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider border-b border-white/10">
                        Profit
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider border-b border-white/10">
                        Stock
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider border-b border-white/10">
                        Status
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-white uppercase tracking-wider border-b border-white/10">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {currentProducts.map((product) => (
                      <tr
                        key={product._id}
                        className="hover:bg-white/5 transition-all duration-300"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-16 w-16">
                              {product.images && product.images.length > 0 ? (
                                <img
                                  className="h-16 w-16 rounded-lg object-cover shadow-sm border border-white/20"
                                  src={
                                    typeof product.images[0] === "string"
                                      ? product.images[0]
                                      : product.images[0].url
                                  }
                                  alt={product.name}
                                />
                              ) : (
                                <div className="h-16 w-16 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
                                  <svg
                                    className="w-8 h-8 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={1}
                                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-semibold text-gray-200 mb-1">
                                {product.name}
                              </div>
                              <div className="text-sm text-gray-400">
                                {product.brand}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-blue-500/20 text-blue-300">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                          {product.cost && product.cost > 0 ? (
                            <span className="font-medium">
                              ₹{product.cost?.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-200">
                          ₹{product.price?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                          {product.cost && product.cost > 0 && product.price ? (
                            <div className="flex flex-col">
                              <span className="font-medium text-green-400">
                                ₹
                                {(
                                  product.price - product.cost
                                )?.toLocaleString()}
                              </span>
                              <span className="text-xs text-gray-400">
                                {(
                                  ((product.price - product.cost) /
                                    product.cost) *
                                  100
                                ).toFixed(1)}
                                %
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                          <div className="flex items-center">
                            <div
                              className={`w-2 h-2 rounded-full mr-2 ${
                                product.stock > 20
                                  ? "bg-green-400"
                                  : product.stock > 5
                                  ? "bg-yellow-400"
                                  : "bg-red-400"
                              }`}
                            ></div>
                            {product.stock} units
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                              product.stock > 0
                                ? "bg-green-500/20 text-green-300"
                                : "bg-red-500/20 text-red-300"
                            }`}
                          >
                            {product.stock > 0 ? "In Stock" : "Out of Stock"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            {/* Stock Control Dropdown */}
                            <select
                              value={
                                product.stock > 0 ? "available" : "unavailable"
                              }
                              onChange={(e) =>
                                handleStockUpdate(product._id, e.target.value)
                              }
                              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                              title="Update Stock Status"
                            >
                              <option value="available" className="bg-gray-800">
                                Available
                              </option>
                              <option
                                value="unavailable"
                                className="bg-gray-800"
                              >
                                Unavailable
                              </option>
                            </select>

                            <button
                              onClick={() =>
                                router.push(
                                  `/dashboard/edit-product/${product._id}`
                                )
                              }
                              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-1"
                              title="Edit Product"
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
                              Edit
                            </button>
                            <button
                              onClick={() =>
                                handleDelete(product._id, product.name)
                              }
                              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-1"
                              title="Delete Product"
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
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white/5 px-6 py-4 flex items-center justify-between border-t border-white/10">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-4 py-2 border border-white/20 text-sm font-medium rounded-lg ${
                        currentPage === 1
                          ? "text-gray-400 bg-white/10 cursor-not-allowed"
                          : "text-white bg-white/10 hover:bg-white/20"
                      } transition-all duration-300`}
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`ml-3 relative inline-flex items-center px-4 py-2 border border-white/20 text-sm font-medium rounded-lg ${
                        currentPage === totalPages
                          ? "text-gray-400 bg-white/10 cursor-not-allowed"
                          : "text-white bg-white/10 hover:bg-white/20"
                      } transition-all duration-300`}
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-300">
                        Showing page{" "}
                        <span className="font-medium text-white">
                          {currentPage}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium text-white">
                          {totalPages}
                        </span>
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px">
                        <button
                          onClick={() => paginate(currentPage - 1)}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-lg border border-white/20 text-sm font-medium ${
                            currentPage === 1
                              ? "text-gray-400 bg-white/10 cursor-not-allowed"
                              : "text-gray-300 bg-white/10 hover:bg-white/20"
                          } transition-all duration-300`}
                        >
                          <svg
                            className="h-5 w-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>

                        {/* Page Numbers */}
                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
                            let pageNumber;
                            if (totalPages <= 5) {
                              pageNumber = i + 1;
                            } else if (currentPage <= 3) {
                              pageNumber = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNumber = totalPages - 4 + i;
                            } else {
                              pageNumber = currentPage - 2 + i;
                            }

                            return (
                              <button
                                key={pageNumber}
                                onClick={() => paginate(pageNumber)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-all duration-300 ${
                                  currentPage === pageNumber
                                    ? "z-10 bg-purple-500/20 border-purple-500 text-purple-300"
                                    : "bg-white/10 border-white/20 text-gray-300 hover:bg-white/20"
                                }`}
                              >
                                {pageNumber}
                              </button>
                            );
                          }
                        )}

                        <button
                          onClick={() => paginate(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-lg border border-white/20 text-sm font-medium ${
                            currentPage === totalPages
                              ? "text-gray-400 bg-white/10 cursor-not-allowed"
                              : "text-gray-300 bg-white/10 hover:bg-white/20"
                          } transition-all duration-300`}
                        >
                          <svg
                            className="h-5 w-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
