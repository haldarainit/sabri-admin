import { NextResponse } from "next/server";
import {
  uploadToCloudinary,
  uploadMultipleToCloudinary,
} from "@/lib/cloudinary";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("images");
    const folder = formData.get("folder") || "sabri-jewelry";

    if (!files || files.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No images provided",
        },
        { status: 400 }
      );
    }

    // Validate file types (including GIF for animated images)
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    const invalidFiles = files.filter(
      (file) => !validTypes.includes(file.type)
    );

    if (invalidFiles.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid file types detected. Please upload only JPEG, PNG, WebP, or GIF images.`,
        },
        { status: 400 }
      );
    }

    // Check file sizes (max 10MB per file)
    const maxSize = 10 * 1024 * 1024; // 10MB
    const oversizedFiles = files.filter((file) => file.size > maxSize);

    if (oversizedFiles.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Files too large. Maximum size is 10MB per file.`,
        },
        { status: 400 }
      );
    }

    let result;

    if (files.length === 1) {
      result = await uploadToCloudinary(files[0], folder);
    } else {
      result = await uploadMultipleToCloudinary(files, folder);
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message:
          files.length === 1
            ? "Image uploaded successfully"
            : `${result.totalUploaded} images uploaded successfully`,
        data: result.data,
        errors: result.errors || [],
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to upload images",
          errors: result.errors || [result.error],
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error during image upload",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
