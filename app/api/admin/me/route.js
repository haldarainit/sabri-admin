import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import Admin from "@/lib/models/Admin";

// Middleware to verify JWT token
const verifyToken = async (request) => {
  try {
    const token =
      request.cookies.get("adminToken")?.value ||
      request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await connectDB();

    const admin = await Admin.findById(decoded.id).select("-password");

    if (!admin || !admin.isActive) {
      return null;
    }

    return admin;
  } catch (error) {
    return null;
  }
};

export async function GET(request) {
  try {
    const admin = await verifyToken(request);

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated",
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: admin,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error getting profile",
      },
      { status: 500 }
    );
  }
}
