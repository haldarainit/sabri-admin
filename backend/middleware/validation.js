const { body, param, query, validationResult } = require("express-validator");

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
        value: error.value,
      })),
    });
  }

  next();
};

// Admin validation rules
const validateAdminLogin = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  handleValidationErrors,
];

const validateAdminCreation = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("role")
    .optional()
    .isIn(["super-admin", "admin", "manager"])
    .withMessage("Invalid role specified"),
  handleValidationErrors,
];

// Product validation rules
const validateProductCreation = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Product name must be between 2 and 100 characters"),
  body("description")
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Description must be between 10 and 1000 characters"),
  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("originalPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Original price must be a positive number"),
  body("category")
    .isIn([
      "rings",
      "necklaces",
      "earrings",
      "bracelets",
      "fine-gold",
      "fine-silver",
      "mens",
      "gifts",
      "new-arrivals",
      "best-sellers",
      "collections",
    ])
    .withMessage("Invalid category specified"),
  body("stock")
    .isInt({ min: 0 })
    .withMessage("Stock must be a non-negative integer"),
  body("images")
    .isArray({ min: 1 })
    .withMessage("At least one image is required"),
  body("images.*").isURL().withMessage("Each image must be a valid URL"),
  handleValidationErrors,
];

const validateProductUpdate = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Product name must be between 2 and 100 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Description must be between 10 and 1000 characters"),
  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("originalPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Original price must be a positive number"),
  body("category")
    .optional()
    .isIn([
      "rings",
      "necklaces",
      "earrings",
      "bracelets",
      "fine-gold",
      "fine-silver",
      "mens",
      "gifts",
      "new-arrivals",
      "best-sellers",
      "collections",
    ])
    .withMessage("Invalid category specified"),
  body("stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Stock must be a non-negative integer"),
  body("images")
    .optional()
    .isArray({ min: 1 })
    .withMessage("At least one image is required"),
  body("images.*")
    .optional()
    .isURL()
    .withMessage("Each image must be a valid URL"),
  handleValidationErrors,
];

// Order validation rules
const validateOrderUpdate = [
  body("status")
    .isIn([
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ])
    .withMessage("Invalid order status"),
  body("tracking.carrier")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Carrier name must be between 2 and 50 characters"),
  body("tracking.trackingNumber")
    .optional()
    .trim()
    .isLength({ min: 5, max: 50 })
    .withMessage("Tracking number must be between 5 and 50 characters"),
  body("notes.admin")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Admin notes cannot exceed 500 characters"),
  handleValidationErrors,
];

// Customer validation rules
const validateCustomerCreation = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
  body("phone")
    .matches(/^[6-9]\d{9}$/)
    .withMessage("Please provide a valid 10-digit phone number"),
  handleValidationErrors,
];

const validateCustomerUpdate = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
  body("phone")
    .optional()
    .matches(/^[6-9]\d{9}$/)
    .withMessage("Please provide a valid 10-digit phone number"),
  handleValidationErrors,
];

// Query parameter validation
const validatePagination = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  query("sort")
    .optional()
    .isIn(["createdAt", "updatedAt", "name", "price", "stock"])
    .withMessage("Invalid sort field"),
  query("order")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Sort order must be asc or desc"),
  handleValidationErrors,
];

// ObjectId validation
const validateObjectId = (paramName) => [
  param(paramName).isMongoId().withMessage(`Invalid ${paramName} format`),
  handleValidationErrors,
];

module.exports = {
  handleValidationErrors,
  validateAdminLogin,
  validateAdminCreation,
  validateProductCreation,
  validateProductUpdate,
  validateOrderUpdate,
  validateCustomerCreation,
  validateCustomerUpdate,
  validatePagination,
  validateObjectId,
};
