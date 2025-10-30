import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";

    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const [customers, total] = await Promise.all([
      User.find(filter)
        .select("-password")
        .select("+phone") // Explicitly include phone field
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        customers,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalCustomers: total,
          hasNext: skip + customers.length < total,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get customers error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error getting customers",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("id");

    if (!customerId) {
      return NextResponse.json(
        {
          success: false,
          message: "Customer ID is required",
        },
        { status: 400 }
      );
    }

    const customer = await User.findByIdAndDelete(customerId);

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          message: "Customer not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    console.error("Delete customer error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error deleting customer",
      },
      { status: 500 }
    );
  }
}
