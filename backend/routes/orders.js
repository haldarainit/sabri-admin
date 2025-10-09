const express = require("express");
const Order = require("../models/Order");
const { auth, authorize } = require("../middleware/auth");
const {
  validateOrderUpdate,
  validatePagination,
  validateObjectId,
} = require("../middleware/validation");

const router = express.Router();

// @route   GET /api/admin/orders
// @desc    Get all orders with pagination and filtering
// @access  Private
router.get(
  "/",
  auth,
  authorize("orders", "read"),
  validatePagination,
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const sortField = req.query.sort || "createdAt";
      const sortOrder = req.query.order === "asc" ? 1 : -1;
      const sort = { [sortField]: sortOrder };

      // Build filter object
      const filter = {};

      if (req.query.status) {
        filter.status = req.query.status;
      }

      if (req.query.paymentStatus) {
        filter["payment.status"] = req.query.paymentStatus;
      }

      if (req.query.dateFrom || req.query.dateTo) {
        filter.createdAt = {};
        if (req.query.dateFrom) {
          filter.createdAt.$gte = new Date(req.query.dateFrom);
        }
        if (req.query.dateTo) {
          filter.createdAt.$lte = new Date(req.query.dateTo);
        }
      }

      if (req.query.minAmount || req.query.maxAmount) {
        filter["orderSummary.total"] = {};
        if (req.query.minAmount)
          filter["orderSummary.total"].$gte = parseFloat(req.query.minAmount);
        if (req.query.maxAmount)
          filter["orderSummary.total"].$lte = parseFloat(req.query.maxAmount);
      }

      if (req.query.search) {
        filter.$or = [
          { orderId: { $regex: req.query.search, $options: "i" } },
          {
            "shippingAddress.name": { $regex: req.query.search, $options: "i" },
          },
          {
            "shippingAddress.email": {
              $regex: req.query.search,
              $options: "i",
            },
          },
          {
            "shippingAddress.phone": {
              $regex: req.query.search,
              $options: "i",
            },
          },
        ];
      }

      const orders = await Order.find(filter)
        .populate("customer", "name email phone")
        .populate("items.product", "name images price")
        .populate("processedBy", "name email")
        .sort(sort)
        .skip(skip)
        .limit(limit);

      const total = await Order.countDocuments(filter);

      res.json({
        success: true,
        data: {
          orders,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalOrders: total,
            hasNextPage: page < Math.ceil(total / limit),
            hasPrevPage: page > 1,
          },
        },
      });
    } catch (error) {
      console.error("Get orders error:", error);
      res.status(500).json({
        success: false,
        message: "Server error fetching orders",
      });
    }
  }
);

// @route   GET /api/admin/orders/:id
// @desc    Get single order
// @access  Private
router.get(
  "/:id",
  auth,
  authorize("orders", "read"),
  validateObjectId("id"),
  async (req, res) => {
    try {
      const order = await Order.findById(req.params.id)
        .populate("customer", "name email phone")
        .populate("items.product", "name images price category")
        .populate("processedBy", "name email");

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      console.error("Get order error:", error);
      res.status(500).json({
        success: false,
        message: "Server error fetching order",
      });
    }
  }
);

// @route   PUT /api/admin/orders/:id
// @desc    Update order
// @access  Private
router.put(
  "/:id",
  auth,
  authorize("orders", "update"),
  validateObjectId("id"),
  validateOrderUpdate,
  async (req, res) => {
    try {
      const orderData = {
        ...req.body,
        processedBy: req.admin.id,
      };

      const order = await Order.findByIdAndUpdate(
        req.params.id,
        { $set: orderData },
        { new: true, runValidators: true }
      )
        .populate("customer", "name email phone")
        .populate("items.product", "name images price")
        .populate("processedBy", "name email");

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      res.json({
        success: true,
        message: "Order updated successfully",
        data: order,
      });
    } catch (error) {
      console.error("Update order error:", error);
      res.status(500).json({
        success: false,
        message: "Server error updating order",
      });
    }
  }
);

// @route   PUT /api/admin/orders/:id/status
// @desc    Update order status
// @access  Private
router.put(
  "/:id/status",
  auth,
  authorize("orders", "update"),
  validateObjectId("id"),
  async (req, res) => {
    try {
      const { status } = req.body;

      if (
        ![
          "pending",
          "confirmed",
          "processing",
          "shipped",
          "delivered",
          "cancelled",
        ].includes(status)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid order status",
        });
      }

      const order = await Order.findById(req.params.id);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      // Update status and set timestamps
      const updateData = {
        status,
        processedBy: req.admin.id,
      };

      if (status === "shipped" && !order.tracking.shippedAt) {
        updateData["tracking.shippedAt"] = new Date();
      }

      if (status === "delivered" && !order.tracking.deliveredAt) {
        updateData["tracking.deliveredAt"] = new Date();
      }

      const updatedOrder = await Order.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        { new: true, runValidators: true }
      )
        .populate("customer", "name email phone")
        .populate("items.product", "name images price")
        .populate("processedBy", "name email");

      res.json({
        success: true,
        message: "Order status updated successfully",
        data: updatedOrder,
      });
    } catch (error) {
      console.error("Update order status error:", error);
      res.status(500).json({
        success: false,
        message: "Server error updating order status",
      });
    }
  }
);

// @route   PUT /api/admin/orders/:id/tracking
// @desc    Update order tracking information
// @access  Private
router.put(
  "/:id/tracking",
  auth,
  authorize("orders", "update"),
  validateObjectId("id"),
  async (req, res) => {
    try {
      const { carrier, trackingNumber, trackingUrl } = req.body;

      const trackingData = {};
      if (carrier) trackingData["tracking.carrier"] = carrier;
      if (trackingNumber)
        trackingData["tracking.trackingNumber"] = trackingNumber;
      if (trackingUrl) trackingData["tracking.trackingUrl"] = trackingUrl;

      const order = await Order.findByIdAndUpdate(
        req.params.id,
        { $set: trackingData },
        { new: true, runValidators: true }
      )
        .populate("customer", "name email phone")
        .populate("items.product", "name images price")
        .populate("processedBy", "name email");

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      res.json({
        success: true,
        message: "Tracking information updated successfully",
        data: order,
      });
    } catch (error) {
      console.error("Update tracking error:", error);
      res.status(500).json({
        success: false,
        message: "Server error updating tracking information",
      });
    }
  }
);

// @route   PUT /api/admin/orders/:id/payment
// @desc    Update order payment status
// @access  Private
router.put(
  "/:id/payment",
  auth,
  authorize("orders", "update"),
  validateObjectId("id"),
  async (req, res) => {
    try {
      const { paymentStatus, transactionId } = req.body;

      if (!["pending", "paid", "failed", "refunded"].includes(paymentStatus)) {
        return res.status(400).json({
          success: false,
          message: "Invalid payment status",
        });
      }

      const updateData = {
        "payment.status": paymentStatus,
        processedBy: req.admin.id,
      };

      if (transactionId) {
        updateData["payment.transactionId"] = transactionId;
      }

      if (paymentStatus === "paid") {
        updateData["payment.paidAt"] = new Date();
      }

      const order = await Order.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        { new: true, runValidators: true }
      )
        .populate("customer", "name email phone")
        .populate("items.product", "name images price")
        .populate("processedBy", "name email");

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      res.json({
        success: true,
        message: "Payment status updated successfully",
        data: order,
      });
    } catch (error) {
      console.error("Update payment status error:", error);
      res.status(500).json({
        success: false,
        message: "Server error updating payment status",
      });
    }
  }
);

// @route   GET /api/admin/orders/stats/overview
// @desc    Get order statistics overview
// @access  Private
router.get(
  "/stats/overview",
  auth,
  authorize("orders", "read"),
  async (req, res) => {
    try {
      const stats = await Order.aggregate([
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: "$orderSummary.total" },
            averageOrderValue: { $avg: "$orderSummary.total" },
            pendingOrders: {
              $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
            },
            confirmedOrders: {
              $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] },
            },
            processingOrders: {
              $sum: { $cond: [{ $eq: ["$status", "processing"] }, 1, 0] },
            },
            shippedOrders: {
              $sum: { $cond: [{ $eq: ["$status", "shipped"] }, 1, 0] },
            },
            deliveredOrders: {
              $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] },
            },
            cancelledOrders: {
              $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
            },
          },
        },
      ]);

      // Get daily sales for last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const dailySales = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: thirtyDaysAgo },
            status: { $ne: "cancelled" },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              day: { $dayOfMonth: "$createdAt" },
            },
            totalSales: { $sum: "$orderSummary.total" },
            orderCount: { $sum: 1 },
          },
        },
        {
          $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
        },
      ]);

      res.json({
        success: true,
        data: {
          overview: stats[0] || {
            totalOrders: 0,
            totalRevenue: 0,
            averageOrderValue: 0,
            pendingOrders: 0,
            confirmedOrders: 0,
            processingOrders: 0,
            shippedOrders: 0,
            deliveredOrders: 0,
            cancelledOrders: 0,
          },
          dailySales,
        },
      });
    } catch (error) {
      console.error("Get order stats error:", error);
      res.status(500).json({
        success: false,
        message: "Server error fetching order statistics",
      });
    }
  }
);

module.exports = router;
