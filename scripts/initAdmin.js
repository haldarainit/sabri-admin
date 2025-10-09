import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import Admin from "../lib/models/Admin.js";

// Load environment variables
dotenv.config({ path: ".env.local" });

const initAdmin = async () => {
  try {
    // Connect to database
    const mongoUri =
      "mongodb+srv://haldarainit_db_user:1Q4nQwMJI9ohOvce@cluster0.5uicr6o.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
    console.log(
      "Connecting to MongoDB with URI:",
      mongoUri.substring(0, 20) + "..."
    );
    await mongoose.connect(mongoUri);
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
