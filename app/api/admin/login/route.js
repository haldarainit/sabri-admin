import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import Admin from "@/lib/models/Admin";
import { loginRateLimit } from "@/lib/middleware/rateLimit";

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export async function POST(request) {
  // Apply rate limiting
  const rateLimitResponse = loginRateLimit(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    await connectDB();

    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required",
        },
        { status: 400 }
      );
    }

    // Check if admin exists
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    // Check if admin is active
    if (!admin.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: "Account is deactivated. Please contact administrator.",
        },
        { status: 401 }
      );
    }

    // Check password
    const isPasswordMatch = await admin.comparePassword(password);

    if (!isPasswordMatch) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate token
    const token = generateToken(admin._id);

    // Create response
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      data: {
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions,
        },
        token,
      },
    });

    // Set HTTP-only cookie
    response.cookies.set("adminToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error during login",
      },
      { status: 500 }
    );
  }
}
