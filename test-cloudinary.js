// Quick test script to verify Cloudinary configuration
import cloudinary from "./lib/cloudinary.js";
import dotenv from "dotenv";

dotenv.config();

console.log("🔧 Testing Cloudinary Configuration...");
console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log(
  "API Key:",
  process.env.CLOUDINARY_API_KEY ? "✅ Set" : "❌ Missing"
);
console.log(
  "API Secret:",
  process.env.CLOUDINARY_API_SECRET ? "✅ Set" : "❌ Missing"
);

if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  console.log("✅ Cloudinary configuration looks good!");
  console.log("📸 Ready for jewelry image uploads!");
} else {
  console.log(
    "❌ Please check your .env.local file for missing Cloudinary credentials"
  );
}
