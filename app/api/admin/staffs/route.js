import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Admin from "@/lib/models/Admin";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    // Build filter
    const filter = { role: { $ne: "super-admin" } }; // Exclude super-admin
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const [staffs, total] = await Promise.all([
      Admin.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Admin.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      data: staffs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalStaffs: total,
        hasNext: skip + staffs.length < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Get staffs error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error getting staffs",
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, email, password, role = "admin", permissions = [] } = body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin with this email already exists",
        },
        { status: 400 }
      );
    }

    // Create new admin
    const admin = new Admin({
      name,
      email,
      password,
      role,
      permissions,
      isActive: true,
    });

    await admin.save();

    return NextResponse.json({
      success: true,
      message: "Staff created successfully",
      data: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        isActive: admin.isActive,
      },
    });
  } catch (error) {
    console.error("Create staff error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error creating staff",
      },
      { status: 500 }
    );
  }
}
