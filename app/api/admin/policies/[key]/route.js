import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Policy from "@/lib/models/Policy";

// GET /api/admin/policies/[key]
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { key } = await params;
    const normalizedKey = String(key).trim().toLowerCase();
    const policy = await Policy.findOne({ key: normalizedKey }).lean();
    if (!policy) {
      return NextResponse.json(
        { success: false, message: "Policy not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: policy });
  } catch (error) {
    console.error("Get policy error:", error);
    return NextResponse.json(
      { success: false, message: "Server error fetching policy" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/policies/[key]
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { key } = await params;
    const body = await request.json();
    const { title, content, updatedBy } = body || {};

    const normalizedKey = String(key).trim().toLowerCase();

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    if (updatedBy) updates.updatedBy = updatedBy;

    const policy = await Policy.findOneAndUpdate(
      { key: normalizedKey },
      { $set: updates },
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true, data: policy });
  } catch (error) {
    console.error("Update policy error:", error);
    return NextResponse.json(
      { success: false, message: "Server error updating policy" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/policies/[key]
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { key } = await params;
    const normalizedKey = String(key).trim().toLowerCase();
    const res = await Policy.deleteOne({ key: normalizedKey });
    if (res.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Policy not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete policy error:", error);
    return NextResponse.json(
      { success: false, message: "Server error deleting policy" },
      { status: 500 }
    );
  }
}


