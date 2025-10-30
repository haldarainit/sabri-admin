import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Shipping from "@/lib/models/Shipping";

// GET - Fetch all shipping locations
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 50;
    const search = searchParams.get("search") || "";
    const state = searchParams.get("state") || "";

    const skip = (page - 1) * limit;

    // Build filter
    let query = { isActive: true };

    if (search) {
      query.$or = [
        { zipCode: { $regex: search, $options: "i" } },
        { state: { $regex: search, $options: "i" } },
      ];
    }

    if (state && state !== "all") {
      query.state = { $regex: state, $options: "i" };
    }

    const [shippingLocations, total] = await Promise.all([
      Shipping.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Shipping.countDocuments(query),
    ]);

    // Get unique states for filtering
    const states = await Shipping.distinct("state", { isActive: true });

    return NextResponse.json({
      success: true,
      data: shippingLocations,
      states,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalLocations: total,
        hasNext: skip + shippingLocations.length < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Get shipping data error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error getting shipping data",
      },
      { status: 500 }
    );
  }
}

// POST - Create new shipping location
export async function POST(request) {
  try {
    await connectDB();

    const { zipCode, charges, priceLessThan, state, stateCode, gstCode } =
      await request.json();

    // Validate required fields
    if (
      !zipCode ||
      charges === undefined ||
      priceLessThan === undefined ||
      !state ||
      !stateCode ||
      !gstCode
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "All required fields must be provided",
        },
        { status: 400 }
      );
    }

    // Check if zip code already exists
    const existingLocation = await Shipping.findOne({ zipCode });
    if (existingLocation) {
      return NextResponse.json(
        {
          success: false,
          message: "Zip code already exists",
        },
        { status: 400 }
      );
    }

    // Create shipping location
    const shippingData = {
      zipCode: zipCode.trim(),
      charges: Number(charges),
      priceLessThan: Number(priceLessThan),
      state: state.trim(),
      stateCode: stateCode.trim().toUpperCase(),
      gstCode: gstCode.trim(),
    };

    const newShippingLocation = await Shipping.create(shippingData);

    return NextResponse.json({
      success: true,
      message: "Shipping location created successfully",
      data: newShippingLocation,
    });
  } catch (error) {
    console.error("Create shipping location error:", error);

    // Handle validation errors specifically
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: validationErrors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Server error creating shipping location",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
