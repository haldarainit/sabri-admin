import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = params;

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Get product error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error fetching product",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();

    const { id } = params;
    const formData = await request.formData();

    // Check if product exists
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    // Extract basic product fields
    const name = formData.get("name");
    const price = parseFloat(formData.get("price"));
    const originalPrice = parseFloat(formData.get("originalPrice")) || 0;
    const discount = parseFloat(formData.get("discount")) || 0;
    const category = formData.get("category");
    const subcategory = formData.get("subcategory") || "";
    const stock = parseInt(formData.get("stock"));
    const brand = formData.get("brand") || "Sabri";
    const description = formData.get("description");
    const shortDescription = formData.get("shortDescription") || "";
    const sku = formData.get("sku");

    // Extract specifications
    const specificationsStr = formData.get("specifications");
    let specifications = {};
    if (specificationsStr) {
      try {
        specifications = JSON.parse(specificationsStr);
      } catch (error) {
        console.error("Error parsing specifications:", error);
      }
    }

    // Extract product flags
    const isNewArrival = formData.get("isNewArrival") === "true";
    const isBestSeller = formData.get("isBestSeller") === "true";
    const isFeatured = formData.get("isFeatured") === "true";
    const isGiftable = formData.get("isGiftable") === "true";
    const isOnSale = formData.get("isOnSale") === "true";
    const men = formData.get("men") === "true";
    const women = formData.get("women") === "true";
    const kids = formData.get("kids") === "true";

    // Handle image uploads
    const imageFiles = formData.getAll("images");
    const existingImagesStr = formData.get("existingImages");
    let existingImages = [];

    if (existingImagesStr) {
      try {
        existingImages = JSON.parse(existingImagesStr);
      } catch (error) {
        console.error("Error parsing existing images:", error);
      }
    }

    let images = [...existingImages];

    // Upload new images to Cloudinary
    for (const file of imageFiles) {
      if (file && file.size > 0) {
        const uploadResult = await uploadToCloudinary(file, "sabri-jewelry");
        if (uploadResult.success) {
          images.push(uploadResult.data.url);
        } else {
          console.error(`Failed to upload image: ${uploadResult.error}`);
        }
      }
    }

    // Validate required fields
    if (!name || !price || !category || !stock || !description || !sku) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
        },
        { status: 400 }
      );
    }

    // Update product data
    const updateData = {
      name,
      price,
      originalPrice,
      discount,
      category,
      subcategory,
      stock,
      brand,
      description,
      shortDescription,
      sku,
      specifications,
      isNewArrival,
      isBestSeller,
      isFeatured,
      isGiftable,
      isOnSale,
      men,
      women,
      kids,
      images,
      tags: [
        ...(isNewArrival ? ["new-arrival"] : []),
        ...(isBestSeller ? ["best-seller"] : []),
        ...(isFeatured ? ["featured"] : []),
        ...(isGiftable ? ["giftable"] : []),
        ...(isOnSale ? ["on-sale"] : []),
        ...(men ? ["men"] : []),
        ...(women ? ["women"] : []),
        ...(kids ? ["kids"] : []),
      ],
    };

    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error updating product",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { id } = params;

    // Check if product exists
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    // Delete the product
    await Product.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error deleting product",
      },
      { status: 500 }
    );
  }
}
