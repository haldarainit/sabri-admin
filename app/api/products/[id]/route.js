import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

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
    const { id } = await params;

    // Check content type to determine how to parse the request
    const contentType = request.headers.get("content-type");

    // If it's a simple JSON update (like stock update from view products page)
    if (contentType && contentType.includes("application/json")) {
      const body = await request.json();

      // Update the product with the provided fields
      const product = await Product.findByIdAndUpdate(id, body, {
        new: true,
        runValidators: true,
      });

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
        message: "Product updated successfully",
        data: product,
      });
    }

    // Otherwise, handle as FormData (full product update with images)
    const formData = await request.formData();

    // Extract basic product fields with proper parsing
    const name = formData.get("name");
    const priceValue = formData.get("price");
    const price = priceValue ? parseFloat(priceValue) : 0;
    const originalPriceValue = formData.get("originalPrice");
    const originalPrice = originalPriceValue
      ? parseFloat(originalPriceValue)
      : 0;
    const costValue = formData.get("cost");
    const cost = costValue ? parseFloat(costValue) : 0;
    const discountValue = formData.get("discount");
    const discount = discountValue ? parseFloat(discountValue) : 0;
    const category = formData.get("category");
    const subcategory = formData.get("subcategory") || "";
    const stockValue = formData.get("stock");
    const stock = stockValue ? parseInt(stockValue, 10) : 0;
    const brand = formData.get("brand") || "Sabri";
    const description = formData.get("description");
    const shortDescription = formData.get("shortDescription") || "";
    const sku = formData.get("sku");

    // Debug logging
    console.log("Stock value received:", stockValue, "Parsed stock:", stock);

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
    const ringCumBangles = formData.get("ringCumBangles") === "true";
    const men = formData.get("men") === "true";
    const women = formData.get("women") === "true";
    const kids = formData.get("kids") === "true";

    // Handle image uploads to Cloudinary
    const imageFiles = formData.getAll("images");
    const existingImagesParam = formData.get("existingImages");
    let images = [];

    // Process existing images that should be kept
    if (existingImagesParam) {
      try {
        const existingImagesArray = JSON.parse(existingImagesParam);
        if (Array.isArray(existingImagesArray)) {
          images = existingImagesArray.filter((img) => img && img.trim());
        }
      } catch (error) {
        console.error("Error parsing existing images:", error);
      }
    }

    // Add new uploaded images
    if (imageFiles && imageFiles.length > 0 && imageFiles[0].size > 0) {
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
    }

    // Ensure we have at least one image
    if (images.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "At least one image is required",
        },
        { status: 400 }
      );
    }

    // Validate required fields
    if (
      !name ||
      price === undefined ||
      price === null ||
      isNaN(price) ||
      originalPrice === undefined ||
      originalPrice === null ||
      isNaN(originalPrice) ||
      !category ||
      stock === undefined ||
      stock === null ||
      isNaN(stock) ||
      !description ||
      !sku
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Missing required fields (name, price, originalPrice, category, stock, description, sku)",
        },
        { status: 400 }
      );
    }

    // Create product update object
    const productData = {
      name,
      price,
      originalPrice,
      cost,
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
      ringCumBangles,
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
        ...(ringCumBangles ? ["ring-cum-bangles"] : []),
        ...(men ? ["men"] : []),
        ...(women ? ["women"] : []),
        ...(kids ? ["kids"] : []),
      ],
    };

    // Debug: Log the product data being sent
    console.log("Product data to update:", {
      ...productData,
      images: `[${productData.images.length} images]`,
    });

    // Validate stock is not negative before updating
    if (productData.stock < 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid stock value: ${productData.stock}. Stock cannot be negative.`,
        },
        { status: 400 }
      );
    }

    // Update the product
    const product = await Product.findByIdAndUpdate(id, productData, {
      new: true,
      runValidators: true,
    });

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
      message: "Product updated successfully",
      data: product,
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
    const { id } = await params;

    const product = await Product.findByIdAndDelete(id);
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
