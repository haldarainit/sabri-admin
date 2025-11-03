import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Review from "@/lib/models/Review";

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = Math.min(
      parseInt(searchParams.get("limit") || "50", 10),
      200
    );

    const filter = {};
    if (status) filter.status = status;

    const docs = await Review.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate({ path: "user", select: "firstName lastName email" })
      .populate({ path: "product", select: "name images sku" });

    // Normalize data with proper user name
    const normalizedReviews = docs.map((r) => {
      const reviewObj = r.toObject();
      const reviewId = reviewObj._id ? reviewObj._id.toString() : null;

      if (!reviewId) {
        console.error("Review without _id found:", reviewObj);
      }

      return {
        ...reviewObj,
        _id: reviewId, // Ensure _id is a string
        user: reviewObj.user
          ? {
              ...reviewObj.user,
              _id: reviewObj.user._id?.toString(),
              name:
                reviewObj.user.firstName || reviewObj.user.lastName
                  ? `${reviewObj.user.firstName || ""} ${
                      reviewObj.user.lastName || ""
                    }`.trim()
                  : "Anonymous",
            }
          : null,
        product: reviewObj.product
          ? {
              ...reviewObj.product,
              _id: reviewObj.product._id?.toString(),
            }
          : null,
      };
    });

    return NextResponse.json({
      success: true,
      data: { reviews: normalizedReviews },
    });
  } catch (error) {
    console.error("Admin list reviews error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
