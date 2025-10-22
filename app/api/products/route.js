import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import Admin from "@/lib/models/Admin";
import { uploadToCloudinary } from "@/lib/cloudinary";
import csv from "csv-parser";
import { Readable } from "stream";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const getAll = searchParams.get("getAll") === "true";
    const skip = (page - 1) * limit;

    let products;
    let total;

    if (getAll) {
      // Fetch all products without pagination
      products = await Product.find({}).sort({ createdAt: -1 });
      total = products.length;
    } else {
      // Fetch products with pagination
      products = await Product.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      total = await Product.countDocuments();
    }

    return NextResponse.json({
      success: true,
      data: {
        products,
        pagination: getAll
          ? null
          : {
              currentPage: page,
              totalPages: Math.ceil(total / limit),
              totalProducts: total,
              hasNextPage: page < Math.ceil(total / limit),
              hasPrevPage: page > 1,
            },
      },
    });
  } catch (error) {
    console.error("Get products error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error fetching products",
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const formData = await request.formData();

    // Extract basic product fields
    const name = formData.get("name");
    const price = parseFloat(formData.get("price"));
    const originalPrice = parseFloat(formData.get("originalPrice")) || 0;
    const cost = parseFloat(formData.get("cost")) || 0;
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
    const ringCumBangles = formData.get("ringCumBangles") === "true";
    const men = formData.get("men") === "true";
    const women = formData.get("women") === "true";
    const kids = formData.get("kids") === "true";

    // Handle image uploads to Cloudinary
    const imageFiles = formData.getAll("images");
    let images = [];

    if (!imageFiles || imageFiles.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "At least one image is required",
        },
        { status: 400 }
      );
    }

    // Upload images to Cloudinary
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

    if (images.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to upload images",
        },
        { status: 400 }
      );
    }

    // Validate required fields
    if (
      !name ||
      !price ||
      !originalPrice ||
      !category ||
      !stock ||
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

    // Create product object
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

    // Create the product
    const product = await Product.create(productData);

    return NextResponse.json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error creating product",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
