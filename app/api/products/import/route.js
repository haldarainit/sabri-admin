import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectDB();
    const { products } = await request.json();
    if (!Array.isArray(products) || !products.length) {
      return NextResponse.json(
        { success: false, message: "No products provided" },
        { status: 400 }
      );
    }

    const results = [];
    for (const raw of products) {
      // Basic mapping: attempt to map common fields
      const mapped = {
        name: raw.name || raw.title || "",
        sku: raw.sku || raw.SKU || raw.sku || undefined,
        category: raw.category || "",
        price: raw.price ? parseFloat(raw.price) : 0,
        cost: raw.cost ? parseFloat(raw.cost) : 0,
        stock: raw.stock ? parseInt(raw.stock) : 0,
        brand: raw.brand || "",
        isActive:
          raw.isActive === "true" ||
          raw.isActive === true ||
          raw.isActive === "1",
        isFeatured:
          raw.isFeatured === "true" ||
          raw.isFeatured === true ||
          raw.isFeatured === "1",
        tags: raw.tags
          ? String(raw.tags)
              .split("|")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
        images: raw.images
          ? String(raw.images)
              .split("|")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
      };

      // If _id exists, try update by _id. Else try upsert by SKU if provided, else create new.
      if (raw._id) {
        const updated = await Product.findByIdAndUpdate(raw._id, mapped, {
          new: true,
          upsert: true,
        });
        results.push({ id: updated._id, action: "updatedById" });
      } else if (mapped.sku) {
        const updated = await Product.findOneAndUpdate(
          { sku: mapped.sku },
          mapped,
          { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        results.push({ id: updated._id, action: "upsertBySku" });
      } else {
        const created = new Product(mapped);
        await created.save();
        results.push({ id: created._id, action: "created" });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Imported ${results.length} products`,
      results,
    });
  } catch (error) {
    console.error("Error importing products:", error);
    return NextResponse.json(
      { success: false, message: "Import failed", error: error.message },
      { status: 500 }
    );
  }
}
