const express = require("express");
const Product = require("../models/Product");
const { auth, authorize } = require("../middleware/auth");
const {
  validateProductCreation,
  validateProductUpdate,
  validatePagination,
  validateObjectId,
} = require("../middleware/validation");

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products with pagination and filtering
// @access  Private
router.get(
  "/",
  auth,
  authorize("products", "read"),
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

      if (req.query.category) {
        filter.category = req.query.category;
      }

      if (req.query.isActive !== undefined) {
        filter.isActive = req.query.isActive === "true";
      }

      if (req.query.isFeatured !== undefined) {
        filter.isFeatured = req.query.isFeatured === "true";
      }

      if (req.query.minPrice || req.query.maxPrice) {
        filter.price = {};
        if (req.query.minPrice)
          filter.price.$gte = parseFloat(req.query.minPrice);
        if (req.query.maxPrice)
          filter.price.$lte = parseFloat(req.query.maxPrice);
      }

      if (req.query.lowStock === "true") {
        filter.stock = { $lte: 10 };
      }

      if (req.query.search) {
        filter.$or = [
          { name: { $regex: req.query.search, $options: "i" } },
          { description: { $regex: req.query.search, $options: "i" } },
          { tags: { $in: [new RegExp(req.query.search, "i")] } },
        ];
      }

      const products = await Product.find(filter)
        .populate("createdBy", "name email")
        .populate("updatedBy", "name email")
        .sort(sort)
        .skip(skip)
        .limit(limit);

      const total = await Product.countDocuments(filter);

      res.json({
        success: true,
        data: {
          products,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalProducts: total,
            hasNextPage: page < Math.ceil(total / limit),
            hasPrevPage: page > 1,
          },
        },
      });
    } catch (error) {
      console.error("Get products error:", error);
      res.status(500).json({
        success: false,
        message: "Server error fetching products",
      });
    }
  }
);

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Private
router.get(
  "/:id",
  auth,
  authorize("products", "read"),
  validateObjectId("id"),
  async (req, res) => {
    try {
      const product = await Product.findById(req.params.id)
        .populate("createdBy", "name email")
        .populate("updatedBy", "name email");

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      console.error("Get product error:", error);
      res.status(500).json({
        success: false,
        message: "Server error fetching product",
      });
    }
  }
);

// @route   POST /api/products
// @desc    Create new product
// @access  Private
router.post(
  "/",
  auth,
  authorize("products", "create"),
  validateProductCreation,
  async (req, res) => {
    try {
      const productData = {
        ...req.body,
        createdBy: req.admin.id,
      };

      const product = new Product(productData);
      await product.save();

      const populatedProduct = await Product.findById(product._id).populate(
        "createdBy",
        "name email"
      );

      res.status(201).json({
        success: true,
        message: "Product created successfully",
        data: populatedProduct,
      });
    } catch (error) {
      console.error("Create product error:", error);

      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "Product with this SKU already exists",
        });
      }

      res.status(500).json({
        success: false,
        message: "Server error creating product",
      });
    }
  }
);

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private
router.put(
  "/:id",
  auth,
  authorize("products", "update"),
  validateObjectId("id"),
  validateProductUpdate,
  async (req, res) => {
    try {
      const productData = {
        ...req.body,
        updatedBy: req.admin.id,
      };

      const product = await Product.findByIdAndUpdate(
        req.params.id,
        { $set: productData },
        { new: true, runValidators: true }
      )
        .populate("createdBy", "name email")
        .populate("updatedBy", "name email");

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      res.json({
        success: true,
        message: "Product updated successfully",
        data: product,
      });
    } catch (error) {
      console.error("Update product error:", error);

      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "Product with this SKU already exists",
        });
      }

      res.status(500).json({
        success: false,
        message: "Server error updating product",
      });
    }
  }
);

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private
router.delete(
  "/:id",
  auth,
  authorize("products", "delete"),
  validateObjectId("id"),
  async (req, res) => {
    try {
      const product = await Product.findByIdAndDelete(req.params.id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      res.json({
        success: true,
        message: "Product deleted successfully",
      });
    } catch (error) {
      console.error("Delete product error:", error);
      res.status(500).json({
        success: false,
        message: "Server error deleting product",
      });
    }
  }
);

// @route   PUT /api/products/:id/status
// @desc    Toggle product active status
// @access  Private
router.put(
  "/:id/status",
  auth,
  authorize("products", "update"),
  validateObjectId("id"),
  async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      product.isActive = !product.isActive;
      product.updatedBy = req.admin.id;
      await product.save();

      res.json({
        success: true,
        message: `Product ${
          product.isActive ? "activated" : "deactivated"
        } successfully`,
        data: {
          id: product._id,
          isActive: product.isActive,
        },
      });
    } catch (error) {
      console.error("Toggle product status error:", error);
      res.status(500).json({
        success: false,
        message: "Server error updating product status",
      });
    }
  }
);

// @route   PUT /api/products/:id/featured
// @desc    Toggle product featured status
// @access  Private
router.put(
  "/:id/featured",
  auth,
  authorize("products", "update"),
  validateObjectId("id"),
  async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      product.isFeatured = !product.isFeatured;
      product.updatedBy = req.admin.id;
      await product.save();

      res.json({
        success: true,
        message: `Product ${
          product.isFeatured ? "featured" : "unfeatured"
        } successfully`,
        data: {
          id: product._id,
          isFeatured: product.isFeatured,
        },
      });
    } catch (error) {
      console.error("Toggle product featured error:", error);
      res.status(500).json({
        success: false,
        message: "Server error updating product featured status",
      });
    }
  }
);

// @route   GET /api/products/stats/overview
// @desc    Get product statistics overview
// @access  Private
router.get(
  "/stats/overview",
  auth,
  authorize("products", "read"),
  async (req, res) => {
    try {
      const stats = await Product.aggregate([
        {
          $group: {
            _id: null,
            totalProducts: { $sum: 1 },
            activeProducts: {
              $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
            },
            featuredProducts: {
              $sum: { $cond: [{ $eq: ["$isFeatured", true] }, 1, 0] },
            },
            lowStockProducts: {
              $sum: { $cond: [{ $lte: ["$stock", 10] }, 1, 0] },
            },
            totalStock: { $sum: "$stock" },
            averagePrice: { $avg: "$price" },
          },
        },
      ]);

      const categoryStats = await Product.aggregate([
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
            totalStock: { $sum: "$stock" },
          },
        },
        { $sort: { count: -1 } },
      ]);

      res.json({
        success: true,
        data: {
          overview: stats[0] || {
            totalProducts: 0,
            activeProducts: 0,
            featuredProducts: 0,
            lowStockProducts: 0,
            totalStock: 0,
            averagePrice: 0,
          },
          categoryStats,
        },
      });
    } catch (error) {
      console.error("Get product stats error:", error);
      res.status(500).json({
        success: false,
        message: "Server error fetching product statistics",
      });
    }
  }
);

module.exports = router;
