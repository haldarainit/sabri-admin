import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

// Helper function to upload image to Cloudinary
export const uploadToCloudinary = async (file, folder = "sabri-jewelry") => {
  try {
    // Convert file to base64 if it's a Buffer
    let fileData;
    if (Buffer.isBuffer(file)) {
      fileData = `data:image/jpeg;base64,${file.toString("base64")}`;
    } else if (file instanceof File) {
      // For Next.js File objects
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fileData = `data:${file.type};base64,${buffer.toString("base64")}`;
    } else {
      fileData = file;
    }

    const result = await cloudinary.uploader.upload(fileData, {
      folder: folder,
      resource_type: "auto",
      quality: "auto",
      fetch_format: "auto",
      transformation: [
        { width: 800, height: 800, crop: "limit", quality: "auto" },
        { fetch_format: "auto" },
      ],
    });

    return {
      success: true,
      data: {
        public_id: result.public_id,
        url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      },
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Helper function to upload multiple images
export const uploadMultipleToCloudinary = async (
  files,
  folder = "sabri-jewelry"
) => {
  try {
    const uploadPromises = files.map((file) =>
      uploadToCloudinary(file, folder)
    );
    const results = await Promise.all(uploadPromises);

    const successful = results.filter((result) => result.success);
    const failed = results.filter((result) => !result.success);

    return {
      success: failed.length === 0,
      data: successful.map((result) => result.data),
      errors: failed.map((result) => result.error),
      totalUploaded: successful.length,
      totalFailed: failed.length,
    };
  } catch (error) {
    console.error("Multiple Cloudinary upload error:", error);
    return {
      success: false,
      error: error.message,
      data: [],
      errors: [error.message],
      totalUploaded: 0,
      totalFailed: files.length,
    };
  }
};

// Helper function to delete image from Cloudinary
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return {
      success: result.result === "ok",
      result: result,
    };
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
