import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Coupon from "@/lib/models/Coupon";

// GET - Fetch all coupons with pagination and filtering
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";
    const status = searchParams.get("status") || "all";

    const skip = (page - 1) * limit;

    // Build filter
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
      ];
    }

    if (type && type !== "all") {
      query.type = type;
    }

    if (status === "active") {
      query.isActive = true;
      query.$expr = { $lt: ["$usedCount", "$usageLimit"] };
      // Also check if coupon has started and not expired
      query.$and = [
        {
          $or: [
            { startDate: { $exists: false } },
            { startDate: { $lte: new Date() } },
          ],
        },
        {
          $or: [
            { expiryDate: { $exists: false } },
            { expiryDate: { $gte: new Date() } },
          ],
        },
      ];
    } else if (status === "expired") {
      query.$or = [
        { isActive: false },
        { $expr: { $gte: ["$usedCount", "$usageLimit"] } },
        { expiryDate: { $lt: new Date() } },
      ];
    } else if (status === "scheduled") {
      // New status for coupons that haven't started yet
      query.startDate = { $gt: new Date() };
    }

    const [coupons, total] = await Promise.all([
      Coupon.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Coupon.countDocuments(query),
    ]);

    // Get coupon statistics
    const stats = await Coupon.aggregate([
      {
        $group: {
          _id: null,
          totalCoupons: { $sum: 1 },
          activeCoupons: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$isActive", true] },
                    { $lt: ["$usedCount", "$usageLimit"] },
                    {
                      $or: [
                        { $not: { $ifNull: ["$startDate", false] } },
                        { $lte: ["$startDate", new Date()] },
                      ],
                    },
                    {
                      $or: [
                        { $not: { $ifNull: ["$expiryDate", false] } },
                        { $gte: ["$expiryDate", new Date()] },
                      ],
                    },
                  ],
                },
                1,
                0,
              ],
            },
          },
          scheduledCoupons: {
            $sum: {
              $cond: [{ $gt: ["$startDate", new Date()] }, 1, 0],
            },
          },
          expiredCoupons: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $eq: ["$isActive", false] },
                    { $gte: ["$usedCount", "$usageLimit"] },
                    { $lt: ["$expiryDate", new Date()] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      data: {
        coupons,
        stats: stats[0] || {
          totalCoupons: 0,
          activeCoupons: 0,
          scheduledCoupons: 0,
          expiredCoupons: 0,
        },
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalCoupons: total,
          hasNext: skip + coupons.length < total,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get coupons error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error getting coupons",
      },
      { status: 500 }
    );
  }
}

// POST - Create new coupon
export async function POST(request) {
  try {
    await connectDB();

    const {
      name,
      code,
      type,
      amount,
      minValue,
      maxValue,
      usageLimit,
      startDate,
      expiryDate,
    } = await request.json();

    // Validate required fields
    if (
      !name ||
      !code ||
      !type ||
      amount === undefined ||
      !minValue ||
      !maxValue ||
      !usageLimit
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "All required fields must be provided",
        },
        { status: 400 }
      );
    }

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return NextResponse.json(
        {
          success: false,
          message: "Coupon code already exists",
        },
        { status: 400 }
      );
    }

    // Validate minValue < maxValue
    if (minValue >= maxValue) {
      return NextResponse.json(
        {
          success: false,
          message: "Maximum value must be greater than minimum value",
        },
        { status: 400 }
      );
    }

    // Validate start and expiry dates
    if (startDate && expiryDate) {
      const start = new Date(startDate);
      const expiry = new Date(expiryDate);
      if (start >= expiry) {
        return NextResponse.json(
          {
            success: false,
            message: "Start date must be before expiry date",
          },
          { status: 400 }
        );
      }
    }

    // Create coupon object
    const couponData = {
      name,
      code: code.toUpperCase(),
      type,
      amount: Number(amount),
      minValue: Number(minValue),
      maxValue: Number(maxValue),
      usageLimit: Number(usageLimit),
    };

    // Add dates only if they have values
    if (startDate && startDate.trim() !== "") {
      couponData.startDate = new Date(startDate);
    }

    if (expiryDate && expiryDate.trim() !== "") {
      couponData.expiryDate = new Date(expiryDate);
    }

    const newCoupon = await Coupon.create(couponData);

    return NextResponse.json({
      success: true,
      message: "Coupon created successfully",
      data: newCoupon,
    });
  } catch (error) {
    console.error("Create coupon error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error creating coupon",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
