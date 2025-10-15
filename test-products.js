import connectDB from "./lib/db.js";
import Product from "./lib/models/Product.js";

async function testProducts() {
  try {
    await connectDB();
    console.log("Connected to database");

    const products = await Product.find({}).limit(5);
    console.log("Found products:", products.length);
    console.log(
      "Products:",
      products.map((p) => ({
        id: p._id,
        name: p.name,
        category: p.category,
        stock: p.stock,
      }))
    );

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

testProducts();
