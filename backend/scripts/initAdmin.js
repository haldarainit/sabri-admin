const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const Admin = require("../models/Admin");

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env") });

const initAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/sabri-admin"
    );
    console.log("Connected to database");

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      email: process.env.ADMIN_EMAIL || "admin@sabri.com",
    });

    if (existingAdmin) {
      console.log("Admin already exists:", existingAdmin.email);
      process.exit(0);
    }

    // Create super admin
    const superAdmin = new Admin({
      name: "Super Admin",
      email: process.env.ADMIN_EMAIL || "admin@sabri.com",
      password: process.env.ADMIN_PASSWORD || "admin123",
      role: "super-admin",
      isActive: true,
      permissions: {
        products: {
          create: true,
          read: true,
          update: true,
          delete: true,
        },
        orders: {
          create: false,
          read: true,
          update: true,
          delete: false,
        },
        customers: {
          create: true,
          read: true,
          update: true,
          delete: true,
        },
        staff: {
          create: true,
          read: true,
          update: true,
          delete: true,
        },
      },
    });

    await superAdmin.save();
    console.log("✅ Super Admin created successfully!");
    console.log("📧 Email:", superAdmin.email);
    console.log("🔑 Password:", process.env.ADMIN_PASSWORD || "admin123");
    console.log("🎭 Role: Super Admin");
  } catch (error) {
    console.error("❌ Error initializing admin:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed");
    process.exit(0);
  }
};

// Run the initialization
initAdmin();
