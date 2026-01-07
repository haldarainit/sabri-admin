import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/lib/models/Order";
import User from "@/lib/models/User";
import { sendOrderStatusNotification } from "@/lib/pushNotificationService";

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

    // Send push notification to user about status change
    console.log("\n═══════════════════════════════════════");
    console.log("🔔 SENDING ORDER STATUS NOTIFICATION");
    console.log("═══════════════════════════════════════");
    console.log("Order ID:", id);
    console.log("New Status:", status);

    try {
      // Get user's FCM token
      const userWithToken = await User.findById(order.user._id || order.user).select("fcmToken");
      if (userWithToken?.fcmToken) {
        const pushResult = await sendOrderStatusNotification(
          userWithToken.fcmToken,
          id,
          status
        );
        if (pushResult.success) {
          console.log("✅ Push notification sent successfully");
        } else {
          console.log("⚠️ Push notification failed:", pushResult.error);
          // Remove invalid token if needed
          if (pushResult.shouldRemoveToken) {
            await User.findByIdAndUpdate(order.user._id || order.user, { fcmToken: null });
            console.log("🗑️ Invalid FCM token removed");
          }
        }
      } else {
        console.log("ℹ️ User has no FCM token, skipping push notification");
      }
    } catch (pushError) {
      console.error("❌ Error sending push notification:", pushError);
      // Don't fail the order update if push notification fails
    }
    console.log("═══════════════════════════════════════\n");

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
