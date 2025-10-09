const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    // Extract token
    const token = authHeader.substring(7);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get admin from token
    const admin = await Admin.findById(decoded.id).select("-password");

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Admin not found.",
      });
    }

    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated.",
      });
    }

    // Add admin to request object
    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token.",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired.",
      });
    }

    console.error("Auth middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Server error in authentication.",
    });
  }
};

// Permission-based authorization middleware
const authorize = (resource, action) => {
  return (req, res, next) => {
    try {
      const admin = req.admin;

      if (!admin) {
        return res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
      }

      // Super admin has all permissions
      if (admin.role === "super-admin") {
        return next();
      }

      // Check specific permission
      const permission = admin.permissions[resource];

      if (!permission || !permission[action]) {
        return res.status(403).json({
          success: false,
          message: `Access denied. You don't have permission to ${action} ${resource}.`,
        });
      }

      next();
    } catch (error) {
      console.error("Authorization middleware error:", error);
      res.status(500).json({
        success: false,
        message: "Server error in authorization.",
      });
    }
  };
};

// Optional auth middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);

      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await Admin.findById(decoded.id).select("-password");

        if (admin && admin.isActive) {
          req.admin = admin;
        }
      }
    }

    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};

module.exports = {
  auth,
  authorize,
  optionalAuth,
};
