import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Policy from "@/lib/models/Policy";

// GET /api/admin/policies -> list all policies
export async function GET() {
  try {
    await connectDB();
    const policies = await Policy.find({}).sort({ createdAt: 1 }).lean();
    return NextResponse.json({ success: true, data: policies });
  } catch (error) {
    console.error("Get policies error:", error);
    return NextResponse.json(
      { success: false, message: "Server error fetching policies" },
      { status: 500 }
    );
  }
}

// POST /api/admin/policies -> create or update a policy (upsert)
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    const { key, title, content, updatedBy } = body || {};
    if (!key || !title) {
      return NextResponse.json(
        { success: false, message: "'key' and 'title' are required" },
        { status: 400 }
      );
    }

    const normalizedKey = String(key).trim().toLowerCase();

    const policy = await Policy.findOneAndUpdate(
      { key: normalizedKey },
      {
        $set: {
          key: normalizedKey,
          title,
          content: content ?? "",
          ...(updatedBy ? { updatedBy } : {}),
        },
      },
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true, data: policy });
  } catch (error) {
    console.error("Upsert policy error:", error);
    return NextResponse.json(
      { success: false, message: "Server error saving policy" },
      { status: 500 }
    );
  }
}


