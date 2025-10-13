import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Shipping from "@/lib/models/Shipping";

// DELETE - Delete all shipping locations for a specific state
export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { state } = params;

    if (!state) {
      return NextResponse.json(
        {
          success: false,
          message: "State parameter is required",
        },
        { status: 400 }
      );
    }

    const deletedLocations = await Shipping.deleteMany({ state });

    if (deletedLocations.deletedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No shipping locations found for this state",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Deleted ${deletedLocations.deletedCount} shipping location(s) for state: ${state}`,
    });
  } catch (error) {
    console.error("Delete shipping locations by state error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error deleting shipping locations by state",
      },
      { status: 500 }
    );
  }
}
