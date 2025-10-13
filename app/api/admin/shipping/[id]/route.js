import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Shipping from "@/lib/models/Shipping";

// PUT - Update shipping location
export async function PUT(request, { params }) {
  try {
    await connectDB();

    const { id } = params;
    const updateData = await request.json();

    // Remove fields that shouldn't be updated
    delete updateData._id;
    delete updateData.createdAt;

    // Convert string values to numbers for numeric fields
    if (updateData.charges !== undefined) {
      updateData.charges = Number(updateData.charges);
    }
    if (updateData.priceLessThan !== undefined) {
      updateData.priceLessThan = Number(updateData.priceLessThan);
    }

    // Convert string fields to proper format
    if (updateData.zipCode) {
      updateData.zipCode = updateData.zipCode.trim();
    }
    if (updateData.state) {
      updateData.state = updateData.state.trim();
    }
    if (updateData.stateCode) {
      updateData.stateCode = updateData.stateCode.trim().toUpperCase();
    }
    if (updateData.gstCode) {
      updateData.gstCode = updateData.gstCode.trim();
    }

    const updatedShippingLocation = await Shipping.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedShippingLocation) {
      return NextResponse.json(
        {
          success: false,
          message: "Shipping location not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Shipping location updated successfully",
      data: updatedShippingLocation,
    });
  } catch (error) {
    console.error("Update shipping location error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error updating shipping location",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete shipping location
export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { id } = params;

    const deletedShippingLocation = await Shipping.findByIdAndDelete(id);

    if (!deletedShippingLocation) {
      return NextResponse.json(
        {
          success: false,
          message: "Shipping location not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Shipping location deleted successfully",
    });
  } catch (error) {
    console.error("Delete shipping location error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error deleting shipping location",
      },
      { status: 500 }
    );
  }
}
