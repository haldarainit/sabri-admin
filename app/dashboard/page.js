"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Bar, Doughnut, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const OverviewDemographics = dynamic(
  () => import("@/components/OverviewDemographics"),
  { ssr: false }
);

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
    recentOrders: [],
    lowStockProducts: [],
    topCustomers: [],
    orders: [],
    products: [],
  });
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const customersResponse = await fetch("/api/admin/customers", {
        credentials: "include",
      });
      let customers = [];
      if (customersResponse.ok) {
        const customersData = await customersResponse.json();
        if (
          customersData.success &&
          customersData.data &&
          customersData.data.customers
        ) {
          customers = Array.isArray(customersData.data.customers)
            ? customersData.data.customers
            : [];
        } else if (Array.isArray(customersData)) {
          customers = customersData;
        }
      }

      const ordersResponse = await fetch("/api/admin/orders", {
        credentials: "include",
      });
      let orders = [];
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        if (ordersData.success && ordersData.data && ordersData.data.orders) {
          orders = Array.isArray(ordersData.data.orders)
            ? ordersData.data.orders
            : [];
        } else if (Array.isArray(ordersData)) {
          orders = ordersData;
        }
      }

      const productsResponse = await fetch("/api/products?getAll=true", {
        credentials: "include",
      });
      let products = [];
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        if (
          productsData.success &&
          productsData.data &&
          productsData.data.products
        ) {
          products = Array.isArray(productsData.data.products)
            ? productsData.data.products
            : [];
        } else if (productsData.products) {
          products = Array.isArray(productsData.products)
            ? productsData.products
            : [];
        } else if (Array.isArray(productsData)) {
          products = productsData;
        }
      }

      const recentOrders = orders.slice(0, 5);
      const lowStockProducts = products.filter((product) => product.stock < 10);

      const totalRevenue = orders.reduce((sum, order) => {
        return sum + (order.orderSummary?.total || 0);
      }, 0);

      const customerOrderCounts = {};
      orders.forEach((order) => {
        if (order.shippingAddress?.email) {
          const customerId = order.shippingAddress.email;
          customerOrderCounts[customerId] =
            (customerOrderCounts[customerId] || 0) + 1;
        }
      });

      const topCustomers = Object.entries(customerOrderCounts)
        .map(([email, count]) => {
          const customer = customers.find((c) => c.email === email);
          if (customer) {
            const customerName =
              customer.fullName ||
              `${customer.firstName || ""} ${customer.lastName || ""}`.trim() ||
              "Unknown Customer";
            return {
              ...customer,
              name: customerName,
              orderCount: count,
            };
          }
          return null;
        })
        .filter(Boolean)
        .sort((a, b) => b.orderCount - a.orderCount)
        .slice(0, 5);

      setStats({
        totalCustomers: customers.length,
        totalOrders: orders.length,
        totalProducts: products.length,
        totalRevenue,
        recentOrders,
        lowStockProducts,
        topCustomers,
        orders,
        products,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      setStats({
        totalCustomers: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalRevenue: 0,
        recentOrders: [],
        lowStockProducts: [],
        topCustomers: [],
        orders: [],
        products: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: { bg: "#FFF4E5", text: "#B98900", border: "#FFDF90" },
      confirmed: { bg: "#EBF5FA", text: "#2C6ECB", border: "#B8D9F0" },
      processing: { bg: "#F4F0FF", text: "#6E59A5", border: "#D4C9F5" },
      shipped: { bg: "#EBF5FA", text: "#2C6ECB", border: "#B8D9F0" },
      delivered: { bg: "#E6F4EA", text: "#137333", border: "#B8D4BD" },
      cancelled: { bg: "#FDE7E9", text: "#D72C0D", border: "#F7C4C7" },
    };
    return (
      colors[status] || { bg: "#F1F2F4", text: "#6D7175", border: "#DBDFE4" }
    );
  };

  const generateRevenueChartData = () => {
    const last7Days = [];
    const revenueData = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      last7Days.push(dateStr);

      const dayRevenue = stats.orders
        .filter((order) => {
          const orderDate = new Date(order.createdAt || order.orderDate);
          return orderDate.toDateString() === date.toDateString();
        })
        .reduce((sum, order) => sum + (order.orderSummary?.total || 0), 0);

      revenueData.push(dayRevenue);
    }

    return {
      labels: last7Days,
      datasets: [
        {
          label: "Revenue (₹)",
          data: revenueData,
          borderColor: "#008060",
          backgroundColor: "rgba(0, 128, 96, 0.1)",
          tension: 0.4,
          fill: true,
          borderWidth: 2,
        },
      ],
    };
  };

  const generateOrdersChartData = () => {
    const last7Days = [];
    const ordersData = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      last7Days.push(dateStr);

      const dayOrders = stats.orders.filter((order) => {
        const orderDate = new Date(order.createdAt || order.orderDate);
        return orderDate.toDateString() === date.toDateString();
      }).length;

      ordersData.push(dayOrders);
    }

    return {
      labels: last7Days,
      datasets: [
        {
          label: "Orders",
          data: ordersData,
          backgroundColor: "#008060",
          borderColor: "#008060",
          borderWidth: 0,
          borderRadius: 4,
        },
      ],
    };
  };

  const generateCategoryChartData = () => {
    const categoryCount = {};
    stats.products.forEach((product) => {
      categoryCount[product.category] =
        (categoryCount[product.category] || 0) + 1;
    });

    const categories = Object.keys(categoryCount);
    const counts = Object.values(categoryCount);

    const colors = [
      "#008060",
      "#2C6ECB",
      "#6E59A5",
      "#B98900",
      "#D72C0D",
      "#6D7175",
    ];

    return {
      labels: categories,
      datasets: [
        {
          data: counts,
          backgroundColor: colors.slice(0, categories.length),
          borderWidth: 0,
        },
      ],
    };
  };

  const generateOrderStatusChartData = () => {
    const statusCount = {};
    stats.orders.forEach((order) => {
      statusCount[order.status] = (statusCount[order.status] || 0) + 1;
    });

    const statuses = Object.keys(statusCount);
    const counts = Object.values(statusCount);

    const statusColors = {
      pending: "#B98900",
      confirmed: "#2C6ECB",
      processing: "#6E59A5",
      shipped: "#2C6ECB",
      delivered: "#137333",
      cancelled: "#D72C0D",
    };

    const colors = statuses.map(
      (status) => statusColors[status] || "#6D7175"
    );

    return {
      labels: statuses.map(
        (status) => status.charAt(0).toUpperCase() + status.slice(1)
      ),
      datasets: [
        {
          data: counts,
          backgroundColor: colors,
          borderWidth: 0,
        },
      ],
    };
  };

  const generateTopProductsChartData = () => {
    const topProducts = stats.products
      .sort((a, b) => b.stock - a.stock)
      .slice(0, 5);

    const productNames = topProducts.map((product) =>
      product.name.length > 15
        ? product.name.substring(0, 15) + "..."
        : product.name
    );
    const stockData = topProducts.map((product) => product.stock);

    return {
      labels: productNames,
      datasets: [
        {
          label: "Stock Quantity",
          data: stockData,
          backgroundColor: "#008060",
          borderWidth: 0,
          borderRadius: 4,
        },
      ],
    };
  };

  const generateMonthlyRevenueData = () => {
    const last6Months = [];
    const revenueData = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStr = date.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });
      last6Months.push(monthStr);

      const monthRevenue = stats.orders
        .filter((order) => {
          const orderDate = new Date(order.createdAt || order.orderDate);
          return (
            orderDate.getMonth() === date.getMonth() &&
            orderDate.getFullYear() === date.getFullYear()
          );
        })
        .reduce((sum, order) => sum + (order.orderSummary?.total || 0), 0);

      revenueData.push(monthRevenue);
    }

    return {
      labels: last6Months,
      datasets: [
        {
          label: "Monthly Revenue (₹)",
          data: revenueData,
          borderColor: "#008060",
          backgroundColor: "rgba(0, 128, 96, 0.1)",
          tension: 0.4,
          fill: true,
          borderWidth: 2,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#202223",
          font: {
            size: 12,
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#6D7175",
          font: {
            size: 11,
          },
        },
        grid: {
          color: "#E1E3E5",
          drawBorder: false,
        },
      },
      y: {
        ticks: {
          color: "#6D7175",
          font: {
            size: 11,
          },
        },
        grid: {
          color: "#E1E3E5",
          drawBorder: false,
        },
      },
    },
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
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-semibold"
          style={{ color: "var(--shopify-text-primary)" }}
        >
          Dashboard
        </h1>
        <p
          className="text-sm mt-1"
          style={{ color: "var(--shopify-text-secondary)" }}
        >
          {getGreeting()}, Admin. Here's what's happening with your store today.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                Total Revenue
              </p>
              <p
                className="text-2xl font-semibold"
                style={{ color: "var(--shopify-text-primary)" }}
              >
                ₹{stats.totalRevenue.toLocaleString()}
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
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
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
                Total Orders
              </p>
              <p
                className="text-2xl font-semibold"
                style={{ color: "var(--shopify-text-primary)" }}
              >
                {stats.totalOrders}
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
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
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
                Total Products
              </p>
              <p
                className="text-2xl font-semibold"
                style={{ color: "var(--shopify-text-primary)" }}
              >
                {stats.totalProducts}
              </p>
            </div>
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#F4F0FF" }}
            >
              <svg
                className="w-5 h-5"
                style={{ color: "#6E59A5" }}
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
                Total Customers
              </p>
              <p
                className="text-2xl font-semibold"
                style={{ color: "var(--shopify-text-primary)" }}
              >
                {stats.totalCustomers}
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
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Demographics */}
      <div>
        <OverviewDemographics />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div
          className="rounded-lg border p-5"
          style={{
            backgroundColor: "var(--shopify-surface)",
            borderColor: "var(--shopify-border)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              className="text-base font-semibold"
              style={{ color: "var(--shopify-text-primary)" }}
            >
              Revenue Overview
            </h3>
            <span
              className="text-xs"
              style={{ color: "var(--shopify-text-secondary)" }}
            >
              Last 7 days
            </span>
          </div>
          <div className="h-64">
            <Line data={generateRevenueChartData()} options={chartOptions} />
          </div>
        </div>

        <div
          className="rounded-lg border p-5"
          style={{
            backgroundColor: "var(--shopify-surface)",
            borderColor: "var(--shopify-border)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              className="text-base font-semibold"
              style={{ color: "var(--shopify-text-primary)" }}
            >
              Orders Trend
            </h3>
            <span
              className="text-xs"
              style={{ color: "var(--shopify-text-secondary)" }}
            >
              Last 7 days
            </span>
          </div>
          <div className="h-64">
            <Bar data={generateOrdersChartData()} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div
          className="rounded-lg border p-5"
          style={{
            backgroundColor: "var(--shopify-surface)",
            borderColor: "var(--shopify-border)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              className="text-base font-semibold"
              style={{ color: "var(--shopify-text-primary)" }}
            >
              Order Status
            </h3>
          </div>
          <div className="h-64">
            <Pie
              data={generateOrderStatusChartData()}
              options={{
                ...chartOptions,
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: {
                      color: "#202223",
                      padding: 12,
                      font: { size: 11 },
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        <div
          className="rounded-lg border p-5"
          style={{
            backgroundColor: "var(--shopify-surface)",
            borderColor: "var(--shopify-border)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              className="text-base font-semibold"
              style={{ color: "var(--shopify-text-primary)" }}
            >
              Top Products
            </h3>
            <span
              className="text-xs"
              style={{ color: "var(--shopify-text-secondary)" }}
            >
              By Stock
            </span>
          </div>
          <div className="h-64">
            <Bar
              data={generateTopProductsChartData()}
              options={{
                ...chartOptions,
                indexAxis: "y",
                plugins: {
                  legend: { display: false },
                },
              }}
            />
          </div>
        </div>

        <div
          className="rounded-lg border p-5"
          style={{
            backgroundColor: "var(--shopify-surface)",
            borderColor: "var(--shopify-border)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              className="text-base font-semibold"
              style={{ color: "var(--shopify-text-primary)" }}
            >
              Monthly Revenue
            </h3>
            <span
              className="text-xs"
              style={{ color: "var(--shopify-text-secondary)" }}
            >
              Last 6 months
            </span>
          </div>
          <div className="h-64">
            <Line data={generateMonthlyRevenueData()} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Product Categories */}
      <div
        className="rounded-lg border p-5"
        style={{
          backgroundColor: "var(--shopify-surface)",
          borderColor: "var(--shopify-border)",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3
            className="text-base font-semibold"
            style={{ color: "var(--shopify-text-primary)" }}
          >
            Product Categories
          </h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64">
            <Doughnut
              data={generateCategoryChartData()}
              options={{
                ...chartOptions,
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: {
                      color: "#202223",
                      padding: 15,
                      font: { size: 11 },
                    },
                  },
                },
              }}
            />
          </div>
          <div className="flex flex-col justify-center">
            <div className="space-y-3">
              {Object.entries(
                stats.products.reduce((acc, product) => {
                  acc[product.category] = (acc[product.category] || 0) + 1;
                  return acc;
                }, {})
              ).map(([category, count], index) => {
                const colors = [
                  "#008060",
                  "#2C6ECB",
                  "#6E59A5",
                  "#B98900",
                  "#D72C0D",
                  "#6D7175",
                ];
                return (
                  <div
                    key={category}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: colors[index % colors.length],
                        }}
                      ></div>
                      <span
                        className="text-sm"
                        style={{ color: "var(--shopify-text-primary)" }}
                      >
                        {category}
                      </span>
                    </div>
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "var(--shopify-text-primary)" }}
                    >
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Orders */}
        <div
          className="rounded-lg border p-5"
          style={{
            backgroundColor: "var(--shopify-surface)",
            borderColor: "var(--shopify-border)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              className="text-base font-semibold"
              style={{ color: "var(--shopify-text-primary)" }}
            >
              Recent Orders
            </h3>
            <button
              onClick={() => router.push("/dashboard/orders")}
              className="text-sm font-medium transition-colors"
              style={{ color: "var(--shopify-action-interactive)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.textDecoration = "underline")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.textDecoration = "none")
              }
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {stats.recentOrders.length > 0 ? (
              stats.recentOrders.map((order) => {
                const statusColor = getStatusColor(order.status);
                return (
                  <div
                    key={order._id}
                    className="flex items-center justify-between p-3 rounded-lg border transition-colors"
                    style={{
                      backgroundColor: "var(--shopify-surface)",
                      borderColor: "var(--shopify-border)",
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
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                        style={{ backgroundColor: "#008060" }}
                      >
                        {order.shippingAddress.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p
                          className="text-sm font-medium"
                          style={{ color: "var(--shopify-text-primary)" }}
                        >
                          {order.shippingAddress.name}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "var(--shopify-text-secondary)" }}
                        >
                          #{order.orderId}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className="text-sm font-medium mb-1"
                        style={{ color: "var(--shopify-text-primary)" }}
                      >
                        ₹{order.orderSummary?.total?.toLocaleString() || 0}
                      </p>
                      <span
                        className="px-2 py-0.5 text-xs font-medium rounded-full"
                        style={{
                          backgroundColor: statusColor.bg,
                          color: statusColor.text,
                        }}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
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
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </div>
                <p
                  className="text-sm"
                  style={{ color: "var(--shopify-text-secondary)" }}
                >
                  No recent orders
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Products */}
        <div
          className="rounded-lg border p-5"
          style={{
            backgroundColor: "var(--shopify-surface)",
            borderColor: "var(--shopify-border)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              className="text-base font-semibold"
              style={{ color: "var(--shopify-text-primary)" }}
            >
              Low Stock Alert
            </h3>
            <button
              onClick={() => router.push("/dashboard/view-products")}
              className="text-sm font-medium transition-colors"
              style={{ color: "var(--shopify-action-interactive)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.textDecoration = "underline")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.textDecoration = "none")
              }
            >
              Manage Inventory
            </button>
          </div>
          <div className="space-y-3">
            {stats.lowStockProducts.length > 0 ? (
              stats.lowStockProducts.slice(0, 5).map((product) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between p-3 rounded-lg border transition-colors"
                  style={{
                    backgroundColor: "var(--shopify-surface)",
                    borderColor: "var(--shopify-border)",
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
                  <div className="flex items-center gap-3">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded-lg border"
                        style={{ borderColor: "var(--shopify-border)" }}
                      />
                    ) : (
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{
                          backgroundColor: "var(--shopify-bg-primary)",
                        }}
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
                      </div>
                    )}
                    <div>
                      <p
                        className="text-sm font-medium"
                        style={{ color: "var(--shopify-text-primary)" }}
                      >
                        {product.name}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "var(--shopify-text-secondary)" }}
                      >
                        {product.category}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className="text-sm font-medium"
                      style={{ color: "var(--shopify-action-critical)" }}
                    >
                      {product.stock} left
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--shopify-text-secondary)" }}
                    >
                      Low stock
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div
                  className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3"
                  style={{ backgroundColor: "#E6F4EA" }}
                >
                  <svg
                    className="w-6 h-6"
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
                <p
                  className="text-sm"
                  style={{ color: "var(--shopify-text-secondary)" }}
                >
                  All products well stocked
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Customers */}
      {stats.topCustomers.length > 0 && (
        <div
          className="rounded-lg border p-5"
          style={{
            backgroundColor: "var(--shopify-surface)",
            borderColor: "var(--shopify-border)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              className="text-base font-semibold"
              style={{ color: "var(--shopify-text-primary)" }}
            >
              Top Customers
            </h3>
            <button
              onClick={() => router.push("/dashboard/customers")}
              className="text-sm font-medium transition-colors"
              style={{ color: "var(--shopify-action-interactive)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.textDecoration = "underline")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.textDecoration = "none")
              }
            >
              View All Customers
            </button>
          </div>
          <div className="space-y-3">
            {stats.topCustomers.map((customer, index) => {
              const colors = [
                "#008060",
                "#2C6ECB",
                "#6E59A5",
                "#B98900",
                "#D72C0D",
              ];
              const bgColors = [
                "#E6F4EA",
                "#EBF5FA",
                "#F4F0FF",
                "#FFF4E5",
                "#FDE7E9",
              ];
              return (
                <div
                  key={customer._id}
                  className="flex items-center justify-between p-3 rounded-lg border transition-colors"
                  style={{
                    backgroundColor: "var(--shopify-surface)",
                    borderColor: "var(--shopify-border)",
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
                  <div className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: "#008060" }}
                    >
                      {index + 1}
                    </div>
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
                      style={{
                        backgroundColor: bgColors[index % bgColors.length],
                        color: colors[index % colors.length],
                      }}
                    >
                      {(customer.name || customer.email || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                    <div>
                      <p
                        className="text-sm font-medium"
                        style={{ color: "var(--shopify-text-primary)" }}
                      >
                        {customer.name || customer.email || "Unknown Customer"}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "var(--shopify-text-secondary)" }}
                      >
                        {customer.email}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className="text-sm font-medium"
                      style={{ color: "var(--shopify-text-primary)" }}
                    >
                      {customer.orderCount} orders
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--shopify-text-secondary)" }}
                    >
                      Loyal customer
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
