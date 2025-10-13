import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Shipping from "@/lib/models/Shipping";

// POST - Create new shipping location (alternative endpoint)
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
