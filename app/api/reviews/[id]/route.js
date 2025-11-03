import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Review from "@/lib/models/Review";
import mongoose from "mongoose";

export async function PATCH(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const { status } = await req.json();

    // Validate id exists and is not undefined
    if (!id || id === "undefined") {
      return NextResponse.json(
        { success: false, message: "Invalid review ID" },
        { status: 400 }
      );
    }

    // Validate id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid review ID format" },
        { status: 400 }
      );
    }

    if (!status || !["pending", "approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid status" },
        { status: 400 }
      );
    }

    const updated = await Review.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true }
    );
    if (!updated)
      return NextResponse.json(
        { success: false, message: "Review not found" },
        { status: 404 }
      );

    return NextResponse.json({ success: true, data: { review: updated } });
  } catch (error) {
    console.error("Admin update review error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update review" },
      { status: 500 }
    );
  }
}
