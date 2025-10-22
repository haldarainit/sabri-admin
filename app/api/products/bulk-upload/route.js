import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import csv from "csv-parser";
import { Readable } from "stream";

export async function POST(request) {
  try {
    await connectDB();

    const formData = await request.formData();
    const csvFile = formData.get("csvFile");

    if (!csvFile) {
      return NextResponse.json(
        {
          success: false,
          message: "No CSV file uploaded",
        },
        { status: 400 }
      );
    }

    console.log("Uploaded CSV file:", {
      name: csvFile.name,
      size: csvFile.size,
      type: csvFile.type,
    });

    // Convert File to Buffer and then to readable stream
    const arrayBuffer = await csvFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const readable = new Readable({
      read() {
        this.push(buffer);
        this.push(null);
      },
    });

    const products = [];
    const errors = [];
    let rowIndex = 0;

    // Parse CSV
    await new Promise((resolve, reject) => {
      readable
        .pipe(
          csv({
            skipEmptyLines: true,
            trim: true,
            skipLinesWithError: true,
          })
        )
        .on("data", (row) => {
          rowIndex++;

          // Skip completely empty rows
          const hasData = Object.values(row).some(
            (value) => value && typeof value === "string" && value.trim() !== ""
          );

          if (!hasData) {
            console.log(`Skipping empty row ${rowIndex}`);
            return;
          }

          console.log(`Processing row ${rowIndex}:`, row);

          try {
            // Validate required fields
            const requiredFields = [
              "name",
              "price",
              "originalPrice",
              "cost",
              "category",
              "stock",
              "description",
              "sku",
            ];

            const missingFields = requiredFields.filter((field) => {
              // Try both camelCase and lowercase versions
              const camelCaseValue = row[field];
              const lowerCaseValue = row[field.toLowerCase()];
              const value = camelCaseValue || lowerCaseValue;
              return (
                !value || (typeof value === "string" && value.trim() === "")
              );
            });

            if (missingFields.length > 0) {
              errors.push({
                row: rowIndex,
                message: `Missing required fields: ${missingFields.join(", ")}`,
              });
              return;
            }

            // Parse and validate data types
            const price = parseFloat(row.price);
            const originalPrice = parseFloat(
              row.originalPrice || row.originalprice
            );
            const cost = parseFloat(row.cost) || 0;
            const discount = parseFloat(row.discount) || 0;
            const stock = parseInt(row.stock);

            if (isNaN(price) || price <= 0) {
              errors.push({
                row: rowIndex,
                message: "Invalid selling price value",
              });
              return;
            }

            if (isNaN(originalPrice) || originalPrice <= 0) {
              errors.push({
                row: rowIndex,
                message: "Invalid original price value",
              });
              return;
            }

            if (isNaN(stock) || stock < 0) {
              errors.push({
                row: rowIndex,
                message: "Invalid stock value",
              });
              return;
            }

            // Parse boolean fields
            const parseBoolean = (value) => {
              if (typeof value === "string") {
                return value.toLowerCase() === "true" || value === "1";
              }
              return Boolean(value);
            };

            // Parse images from pipe-separated URLs
            let images = [];
            if (row.images && row.images.trim()) {
              const imageUrls = row.images
                .split("|")
                .map((url) => url.trim())
                .filter((url) => url);
              images = imageUrls;
            }

            // Parse specifications
            const specifications = {};
            if (row.material) specifications.material = row.material;
            if (row.metalType || row.metaltype)
              specifications.metalType = row.metalType || row.metaltype;
            if (row.gemstone) specifications.gemstone = row.gemstone;
            if (row.dimensions) specifications.dimensions = row.dimensions;
            if (row.careInstructions || row.careinstructions)
              specifications.careInstructions =
                row.careInstructions || row.careinstructions;
            if (row.warranty) specifications.warranty = row.warranty;

            // Create product object
            const productData = {
              name: row.name,
              price: price,
              originalPrice: originalPrice,
              cost: cost,
              discount: discount,
              category: row.category,
              subcategory: row.subcategory || "",
              stock: stock,
              brand: row.brand || "Sabri",
              description: row.description,
              shortDescription:
                row.shortDescription || row.shortdescription || "",
              sku: row.sku,
              specifications: specifications,
              isNewArrival: parseBoolean(row.isNewArrival || row.isnewarrival),
              isBestSeller: parseBoolean(row.isBestSeller || row.isbestseller),
              isFeatured: parseBoolean(row.isFeatured || row.isfeatured),
              isGiftable: parseBoolean(row.isGiftable || row.isgiftable),
              isOnSale: parseBoolean(row.isOnSale || row.isonsale),
              ringCumBangles: parseBoolean(
                row.ringCumBangles || row.ringcumbangles
              ),
              men: parseBoolean(row.men),
              women: parseBoolean(row.women),
              kids: parseBoolean(row.kids),
              images: images,
              tags: [
                ...(parseBoolean(row.isNewArrival || row.isnewarrival)
                  ? ["new-arrival"]
                  : []),
                ...(parseBoolean(row.isBestSeller || row.isbestseller)
                  ? ["best-seller"]
                  : []),
                ...(parseBoolean(row.isFeatured || row.isfeatured)
                  ? ["featured"]
                  : []),
                ...(parseBoolean(row.isGiftable || row.isgiftable)
                  ? ["giftable"]
                  : []),
                ...(parseBoolean(row.isOnSale || row.isonsale)
                  ? ["on-sale"]
                  : []),
                ...(parseBoolean(row.ringCumBangles || row.ringcumbangles)
                  ? ["ring-cum-bangles"]
                  : []),
                ...(parseBoolean(row.men) ? ["men"] : []),
                ...(parseBoolean(row.women) ? ["women"] : []),
                ...(parseBoolean(row.kids) ? ["kids"] : []),
              ],
            };

            products.push(productData);
          } catch (error) {
            errors.push({
              row: rowIndex,
              message: `Error processing row: ${error.message}`,
            });
          }
        })
        .on("end", () => {
          console.log(
            `CSV parsing completed. Total rows: ${rowIndex}, Products: ${products.length}, Errors: ${errors.length}`
          );
          resolve();
        })
        .on("error", (error) => {
          console.error("CSV parsing error:", error);
          reject(error);
        });
    });

    // Check if there are validation errors
    if (errors.length > 0 && products.length === 0) {
      return NextResponse.json({
        success: false,
        message: "CSV processing completed with errors",
        errors: errors,
        processedProducts: 0,
      });
    }

    if (products.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No valid products found in CSV file",
      });
    }

    // Bulk insert products
    try {
      const createdProducts = await Product.insertMany(products, {
        ordered: false,
      });

      return NextResponse.json({
        success: true,
        message: `Successfully created ${createdProducts.length} products`,
        data: createdProducts,
        totalProcessed: rowIndex,
        errors: errors,
      });
    } catch (dbError) {
      console.error("Database error during bulk insert:", dbError);

      // Handle duplicate key errors and other validation errors
      if (dbError.writeErrors) {
        const bulkErrors = dbError.writeErrors.map((error) => ({
          message: error.errmsg,
          productData: error.getOperation && error.getOperation(),
        }));

        return NextResponse.json({
          success: false,
          message: "Some products could not be created",
          errors: bulkErrors,
          createdCount: dbError.result ? dbError.result.insertedCount : 0,
        });
      }

      return NextResponse.json({
        success: false,
        message: "Database error during bulk upload",
        error: dbError.message,
      });
    }
  } catch (error) {
    console.error("Error in bulk upload:", error);
    return NextResponse.json({
      success: false,
      message: "Server error during bulk upload",
      error: error.message,
    });
  }
}
