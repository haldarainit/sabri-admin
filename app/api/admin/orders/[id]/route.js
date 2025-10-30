import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/lib/models/Order";
import User from "@/lib/models/User";

export async function PUT(request, { params }) {
  try {
    await connectDB();

    const { id } = params;
    const { status } = await request.json();

    const order = await Order.findOneAndUpdate(
      { orderId: id },
      { status },
      { new: true }
    )
      .populate("user", "firstName lastName email")
      .lean();

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      {
        success: false,
        message: "Server error updating order status",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { id } = params;

    const order = await Order.findOneAndDelete({ orderId: id });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("Delete order error:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      {
        success: false,
        message: "Server error deleting order",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
