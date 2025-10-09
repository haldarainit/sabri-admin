const express = require("express");
const Customer = require("../models/Customer");
const Order = require("../models/Order");
const { auth, authorize } = require("../middleware/auth");
const {
  validateCustomerCreation,
  validateCustomerUpdate,
  validatePagination,
  validateObjectId,
} = require("../middleware/validation");

const router = express.Router();

// @route   GET /api/admin/customers
// @desc    Get all customers with pagination and filtering
// @access  Private
router.get(
  "/",
  auth,
  authorize("customers", "read"),
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

      if (req.query.isActive !== undefined) {
        filter.isActive = req.query.isActive === "true";
      }

      if (req.query.isVerified !== undefined) {
        filter.isVerified = req.query.isVerified === "true";
      }

      if (req.query.tier) {
        // Note: This is a virtual field, so we'll filter after aggregation
        // For now, we'll filter by totalSpent ranges
        const tierRanges = {
          Bronze: { $lt: 25000 },
          Silver: { $gte: 25000, $lt: 50000 },
          Gold: { $gte: 50000, $lt: 100000 },
          VIP: { $gte: 100000 },
        };

        if (tierRanges[req.query.tier]) {
          filter["stats.totalSpent"] = tierRanges[req.query.tier];
        }
      }

      if (req.query.search) {
        filter.$or = [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
          { phone: { $regex: req.query.search, $options: "i" } },
        ];
      }

      const customers = await Customer.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit);

      const total = await Customer.countDocuments(filter);

      res.json({
        success: true,
        data: {
          customers,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalCustomers: total,
            hasNextPage: page < Math.ceil(total / limit),
            hasPrevPage: page > 1,
          },
        },
      });
    } catch (error) {
      console.error("Get customers error:", error);
      res.status(500).json({
        success: false,
        message: "Server error fetching customers",
      });
    }
  }
);

// @route   GET /api/admin/customers/:id
// @desc    Get single customer with order history
// @access  Private
router.get(
  "/:id",
  auth,
  authorize("customers", "read"),
  validateObjectId("id"),
  async (req, res) => {
    try {
      const customer = await Customer.findById(req.params.id);

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: "Customer not found",
        });
      }

      // Get customer's orders
      const orders = await Order.find({ customer: req.params.id })
        .populate("items.product", "name images price")
        .sort({ createdAt: -1 })
        .limit(10);

      res.json({
        success: true,
        data: {
          customer,
          recentOrders: orders,
        },
      });
    } catch (error) {
      console.error("Get customer error:", error);
      res.status(500).json({
        success: false,
        message: "Server error fetching customer",
      });
    }
  }
);

// @route   POST /api/admin/customers
// @desc    Create new customer
// @access  Private
router.post(
  "/",
  auth,
  authorize("customers", "create"),
  validateCustomerCreation,
  async (req, res) => {
    try {
      const { name, email, phone } = req.body;

      // Check if customer already exists
      const existingCustomer = await Customer.findOne({
        $or: [{ email }, { phone }],
      });

      if (existingCustomer) {
        return res.status(400).json({
          success: false,
          message: "Customer with this email or phone already exists",
        });
      }

      const customer = new Customer({
        name,
        email,
        phone,
        registeredBy: "admin",
      });

      await customer.save();

      res.status(201).json({
        success: true,
        message: "Customer created successfully",
        data: customer,
      });
    } catch (error) {
      console.error("Create customer error:", error);

      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "Customer with this email or phone already exists",
        });
      }

      res.status(500).json({
        success: false,
        message: "Server error creating customer",
      });
    }
  }
);

// @route   PUT /api/admin/customers/:id
// @desc    Update customer
// @access  Private
router.put(
  "/:id",
  auth,
  authorize("customers", "update"),
  validateObjectId("id"),
  validateCustomerUpdate,
  async (req, res) => {
    try {
      const customer = await Customer.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
      );

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: "Customer not found",
        });
      }

      res.json({
        success: true,
        message: "Customer updated successfully",
        data: customer,
      });
    } catch (error) {
      console.error("Update customer error:", error);

      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "Customer with this email or phone already exists",
        });
      }

      res.status(500).json({
        success: false,
        message: "Server error updating customer",
      });
    }
  }
);

// @route   DELETE /api/admin/customers/:id
// @desc    Delete customer (soft delete)
// @access  Private
router.delete(
  "/:id",
  auth,
  authorize("customers", "delete"),
  validateObjectId("id"),
  async (req, res) => {
    try {
      const customer = await Customer.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
      );

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: "Customer not found",
        });
      }

      res.json({
        success: true,
        message: "Customer deactivated successfully",
      });
    } catch (error) {
      console.error("Delete customer error:", error);
      res.status(500).json({
        success: false,
        message: "Server error deleting customer",
      });
    }
  }
);

// @route   PUT /api/admin/customers/:id/status
// @desc    Toggle customer active status
// @access  Private
router.put(
  "/:id/status",
  auth,
  authorize("customers", "update"),
  validateObjectId("id"),
  async (req, res) => {
    try {
      const customer = await Customer.findById(req.params.id);

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: "Customer not found",
        });
      }

      customer.isActive = !customer.isActive;
      await customer.save();

      res.json({
        success: true,
        message: `Customer ${
          customer.isActive ? "activated" : "deactivated"
        } successfully`,
        data: {
          id: customer._id,
          isActive: customer.isActive,
        },
      });
    } catch (error) {
      console.error("Toggle customer status error:", error);
      res.status(500).json({
        success: false,
        message: "Server error updating customer status",
      });
    }
  }
);

// @route   PUT /api/admin/customers/:id/address
// @desc    Add or update customer address
// @access  Private
router.put(
  "/:id/address",
  auth,
  authorize("customers", "update"),
  validateObjectId("id"),
  async (req, res) => {
    try {
      const {
        type,
        name,
        phone,
        address,
        city,
        state,
        pincode,
        country,
        isDefault,
      } = req.body;

      if (!name || !phone || !address || !city || !state || !pincode) {
        return res.status(400).json({
          success: false,
          message: "All address fields are required",
        });
      }

      const customer = await Customer.findById(req.params.id);

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: "Customer not found",
        });
      }

      const addressData = {
        type: type || "home",
        name,
        phone,
        address,
        city,
        state,
        pincode,
        country: country || "India",
        isDefault: isDefault || false,
      };

      // If this is set as default, remove default from other addresses
      if (isDefault) {
        customer.addresses.forEach((addr) => {
          addr.isDefault = false;
        });
      }

      // Add new address
      customer.addresses.push(addressData);
      await customer.save();

      res.json({
        success: true,
        message: "Address added successfully",
        data: customer,
      });
    } catch (error) {
      console.error("Add customer address error:", error);
      res.status(500).json({
        success: false,
        message: "Server error adding customer address",
      });
    }
  }
);

// @route   GET /api/admin/customers/:id/orders
// @desc    Get customer order history
// @access  Private
router.get(
  "/:id/orders",
  auth,
  authorize("customers", "read"),
  validateObjectId("id"),
  validatePagination,
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const orders = await Order.find({ customer: req.params.id })
        .populate("items.product", "name images price category")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Order.countDocuments({ customer: req.params.id });

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
      console.error("Get customer orders error:", error);
      res.status(500).json({
        success: false,
        message: "Server error fetching customer orders",
      });
    }
  }
);

// @route   GET /api/admin/customers/stats/overview
// @desc    Get customer statistics overview
// @access  Private
router.get(
  "/stats/overview",
  auth,
  authorize("customers", "read"),
  async (req, res) => {
    try {
      const stats = await Customer.aggregate([
        {
          $group: {
            _id: null,
            totalCustomers: { $sum: 1 },
            activeCustomers: {
              $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
            },
            verifiedCustomers: {
              $sum: { $cond: [{ $eq: ["$isVerified", true] }, 1, 0] },
            },
            totalRevenue: { $sum: "$stats.totalSpent" },
            averageOrderValue: { $avg: "$stats.averageOrderValue" },
          },
        },
      ]);

      // Get customer tier distribution
      const tierDistribution = await Customer.aggregate([
        {
          $addFields: {
            tier: {
              $switch: {
                branches: [
                  {
                    case: { $gte: ["$stats.totalSpent", 100000] },
                    then: "VIP",
                  },
                  {
                    case: { $gte: ["$stats.totalSpent", 50000] },
                    then: "Gold",
                  },
                  {
                    case: { $gte: ["$stats.totalSpent", 25000] },
                    then: "Silver",
                  },
                ],
                default: "Bronze",
              },
            },
          },
        },
        {
          $group: {
            _id: "$tier",
            count: { $sum: 1 },
          },
        },
        {
          $sort: { count: -1 },
        },
      ]);

      res.json({
        success: true,
        data: {
          overview: stats[0] || {
            totalCustomers: 0,
            activeCustomers: 0,
            verifiedCustomers: 0,
            totalRevenue: 0,
            averageOrderValue: 0,
          },
          tierDistribution,
        },
      });
    } catch (error) {
      console.error("Get customer stats error:", error);
      res.status(500).json({
        success: false,
        message: "Server error fetching customer statistics",
      });
    }
  }
);

module.exports = router;
