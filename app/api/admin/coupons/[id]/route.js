import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Coupon from "@/lib/models/Coupon";

// PUT - Update coupon
export async function PUT(request, { params }) {
  try {
    await connectDB();

    const { id } = params;
    const updateData = await request.json();

    // Remove fields that shouldn't be updated
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.usedCount;

    // Validate minValue < maxValue if both are provided
    if (
      updateData.minValue !== undefined &&
      updateData.maxValue !== undefined
    ) {
      if (updateData.minValue >= updateData.maxValue) {
        return NextResponse.json(
          {
            success: false,
            message: "Maximum value must be greater than minimum value",
          },
          { status: 400 }
        );
      }
    }

    // Validate start and expiry dates if both are provided
    if (updateData.startDate && updateData.expiryDate) {
      const start = new Date(updateData.startDate);
      const expiry = new Date(updateData.expiryDate);
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

    // Convert string values to numbers for numeric fields
    if (updateData.amount !== undefined) {
      updateData.amount = Number(updateData.amount);
    }
    if (updateData.minValue !== undefined) {
      updateData.minValue = Number(updateData.minValue);
    }
    if (updateData.maxValue !== undefined) {
      updateData.maxValue = Number(updateData.maxValue);
    }
    if (updateData.usageLimit !== undefined) {
      updateData.usageLimit = Number(updateData.usageLimit);
    }

    // Convert dates if provided
    if (updateData.startDate && updateData.startDate.trim() !== "") {
      updateData.startDate = new Date(updateData.startDate);
    } else if (updateData.startDate === "") {
      updateData.startDate = undefined;
    }

    if (updateData.expiryDate && updateData.expiryDate.trim() !== "") {
      updateData.expiryDate = new Date(updateData.expiryDate);
    } else if (updateData.expiryDate === "") {
      updateData.expiryDate = undefined;
    }

    // Convert code to uppercase if provided
    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase();
    }

    const updatedCoupon = await Coupon.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedCoupon) {
      return NextResponse.json(
        {
          success: false,
          message: "Coupon not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Coupon updated successfully",
      data: updatedCoupon,
    });
  } catch (error) {
    console.error("Update coupon error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error updating coupon",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete coupon
export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { id } = params;

    const deletedCoupon = await Coupon.findByIdAndDelete(id);

    if (!deletedCoupon) {
      return NextResponse.json(
        {
          success: false,
          message: "Coupon not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    console.error("Delete coupon error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error deleting coupon",
      },
      { status: 500 }
    );
  }
}
