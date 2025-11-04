import { NextResponse } from "next/server";
import { generateProductDescription } from "../../../lib/gemini";

/**
 * API Route for AI Product Description Generation
 * POST /api/generate-description
 *
 * This route handles product description generation requests and keeps the API key secure on the server
 */
export async function POST(request) {
  try {
    // Parse request body
    const { userPrompt, productInfo } = await request.json();

    // Validate required fields
    if (!userPrompt || !userPrompt.trim()) {
      return NextResponse.json(
        { error: "User prompt is required" },
        { status: 400 }
      );
    }

    // Generate product description using Gemini AI
    const generatedContent = await generateProductDescription(
      userPrompt,
      productInfo || {}
    );

    // Return the generated content
    return NextResponse.json({
      success: true,
      content: generatedContent,
    });
  } catch (error) {
    console.error("Product description generation API error:", error);

    // Return appropriate error response
    return NextResponse.json(
      {
        error: error.message || "Failed to generate product description",
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS(request) {
  return NextResponse.json({}, { status: 200 });
}
