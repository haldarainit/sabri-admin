"use client";

import { useState } from "react";

export default function AddProductPage() {
  const [form, setForm] = useState({
    name: "",
    price: 0,
    originalPrice: 0,
    cost: 0,
    category: "",
    subcategory: "",
    stock: 0,
    brand: "Sabri",
    description: "",
    shortDescription: "",
    sku: "",
    // Jewelry-specific fields
    material: "",
    metalType: "",
    gemstone: "",
    dimensions: "",
    careInstructions: "",
    warranty: "",
    // Product flags
    isNewArrival: false,
    isBestSeller: false,
    isFeatured: false,
    isGiftable: true,
    isOnSale: false,
    discount: 0,
    ringCumBangles: false,
    // Target audience
    men: false,
    women: false,
    kids: false,
  });

  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});

  // Bulk upload states
  const [bulkUploadFile, setBulkUploadFile] = useState(null);
  const [bulkUploadProgress, setBulkUploadProgress] = useState(false);
  const [bulkUploadResult, setBulkUploadResult] = useState(null);

  // Bulk image upload states
  const [bulkImageFiles, setBulkImageFiles] = useState([]);
  const [bulkImageProgress, setBulkImageProgress] = useState(false);
  const [bulkImageResult, setBulkImageResult] = useState(null);
  const [bulkImageUploadProgress, setBulkImageUploadProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("single"); // single | bulk

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 4) {
      alert("You can only upload up to 4 images");
      return;
    }
    setImages([...images, ...files]);

    // Clear image error if present
    if (errors.images) {
      setErrors({
        ...errors,
        images: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = "Product name is required";
    if (!form.price || form.price <= 0)
      newErrors.price = "Valid selling price is required";
    if (!form.originalPrice || form.originalPrice <= 0)
      newErrors.originalPrice = "Valid original price is required";
    if (!form.category.trim()) newErrors.category = "Category is required";
    if (!form.stock || form.stock < 0)
      newErrors.stock = "Valid stock quantity is required";
    if (!form.brand.trim()) newErrors.brand = "Brand is required";
    if (!form.description.trim())
      newErrors.description = "Description is required";
    if (!form.sku.trim()) newErrors.sku = "SKU is required";
    if (!form.material.trim()) newErrors.material = "Material is required";
    if (!form.metalType.trim()) newErrors.metalType = "Metal type is required";
    if (images.length === 0)
      newErrors.images = "At least one image is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      alert("Please fill in all required fields");
      return;
    }

    // Preparing form data for backend (with images)
    const formData = new FormData();

    // Basic product fields
    formData.append("name", form.name);
    formData.append("price", form.price);
    formData.append("originalPrice", form.originalPrice || "");
    formData.append("cost", form.cost || 0);
    formData.append("discount", form.discount || 0);
    formData.append("category", form.category);
    formData.append("subcategory", form.subcategory || "");
    formData.append("stock", form.stock);
    formData.append("brand", form.brand);
    formData.append("description", form.description);
    formData.append("shortDescription", form.shortDescription || "");
    formData.append("sku", form.sku);

    // Jewelry specifications
    formData.append(
      "specifications",
      JSON.stringify({
        material: form.material,
        metalType: form.metalType,
        gemstone: form.gemstone || "",
        dimensions: form.dimensions || "",
        careInstructions: form.careInstructions || "",
        warranty: form.warranty || "",
      })
    );

    // Product flags
    formData.append("isNewArrival", form.isNewArrival);
    formData.append("isBestSeller", form.isBestSeller);
    formData.append("isFeatured", form.isFeatured);
    formData.append("isGiftable", form.isGiftable);
    formData.append("isOnSale", form.isOnSale);
    formData.append("ringCumBangles", form.ringCumBangles);
    formData.append("men", form.men);
    formData.append("women", form.women);
    formData.append("kids", form.kids);

    // Add image files
    images.forEach((img) => formData.append("images", img));

    try {
      const res = await fetch(`/api/products`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ message: res.statusText }));
        console.error("Backend response status:", res.status);
        console.error("Backend response data:", errorData);
        throw new Error(
          `Failed to add product: ${errorData.message || res.statusText}`
        );
      }

      alert("✅ Product added successfully!");
      setForm({
        name: "",
        price: 0,
        originalPrice: 0,
        cost: 0,
        category: "",
        subcategory: "",
        stock: 0,
        brand: "Sabri",
        description: "",
        shortDescription: "",
        sku: "",
        material: "",
        metalType: "",
        gemstone: "",
        dimensions: "",
        careInstructions: "",
        warranty: "",
        isNewArrival: false,
        isBestSeller: false,
        isFeatured: false,
        isGiftable: true,
        isOnSale: false,
        discount: 0,
        ringCumBangles: false,
        men: false,
        women: false,
        kids: false,
      });
      setImages([]);
      setErrors({});
    } catch (err) {
      console.error(err);
      alert("❌ Failed to add product");
    }
  };

  // Bulk upload functions
  const handleBulkUploadFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "text/csv") {
      setBulkUploadFile(file);
      setBulkUploadResult(null);
    } else {
      alert("Please select a valid CSV file");
      e.target.value = "";
    }
  };

  const handleBulkUpload = async () => {
    if (!bulkUploadFile) {
      alert("Please select a CSV file first");
      return;
    }

    setBulkUploadProgress(true);
    setBulkUploadResult(null);

    const formData = new FormData();
    formData.append("csvFile", bulkUploadFile);

    try {
      const res = await fetch(`/api/products/bulk-upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const result = await res.json();

      if (res.ok) {
        setBulkUploadResult({
          success: true,
          message: result.message,
          createdCount: result.products ? result.products.length : 0,
          errors: result.errors || [],
        });
        setBulkUploadFile(null);
        document.querySelector('input[type="file"][accept=".csv"]').value = "";
      } else {
        setBulkUploadResult({
          success: false,
          message: result.message,
          errors: result.errors || [],
        });
      }
    } catch (error) {
      console.error("Bulk upload error:", error);
      setBulkUploadResult({
        success: false,
        message: "Failed to upload CSV file",
        errors: [{ message: error.message }],
      });
    } finally {
      setBulkUploadProgress(false);
    }
  };

  const downloadCSVTemplate = async () => {
    try {
      const res = await fetch(`/api/products/csv-template`, {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "jewelry_products_template.csv";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        alert("Failed to download CSV template");
      }
    } catch (error) {
      console.error("Download template error:", error);
      alert("Failed to download CSV template");
    }
  };

  // Bulk image upload functions
  const handleBulkImageFilesChange = (e) => {
    const files = Array.from(e.target.files);
    const currentCount = bulkImageFiles.length;
    const newCount = currentCount + files.length;

    if (newCount > 50) {
      alert(
        `Cannot add ${files.length} images. You can only have a maximum of 50 images total. Currently selected: ${currentCount}`
      );
      e.target.value = "";
      return;
    }

    // Validate file types
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const invalidFiles = files.filter(
      (file) => !validTypes.includes(file.type)
    );

    if (invalidFiles.length > 0) {
      alert(
        `Invalid file types detected: ${invalidFiles
          .map((f) => f.name)
          .join(", ")}. Please upload only JPEG, PNG, or WebP images.`
      );
      e.target.value = "";
      return;
    }

    // Check for duplicate files by name
    const existingNames = bulkImageFiles.map((file) => file.name);
    const duplicateFiles = files.filter((file) =>
      existingNames.includes(file.name)
    );

    if (duplicateFiles.length > 0) {
      alert(
        `Duplicate files detected: ${duplicateFiles
          .map((f) => f.name)
          .join(", ")}. These files are already selected.`
      );
      e.target.value = "";
      return;
    }

    // Add new files to existing selection
    setBulkImageFiles((prev) => [...prev, ...files]);
    setBulkImageResult(null);

    // Clear the input so the same files can be selected again if needed
    e.target.value = "";
  };

  const removeImageFile = (indexToRemove) => {
    setBulkImageFiles((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
    setBulkImageResult(null);
  };

  const clearAllImages = () => {
    setBulkImageFiles([]);
    setBulkImageResult(null);
  };

  const handleBulkImageUpload = async () => {
    if (bulkImageFiles.length === 0) {
      alert("Please select images to upload");
      return;
    }

    setBulkImageProgress(true);
    setBulkImageResult(null);
    setBulkImageUploadProgress(0);

    const formData = new FormData();
    bulkImageFiles.forEach((file) => {
      formData.append("images", file);
    });
    formData.append("folder", "sabri-jewelry-bulk");

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setBulkImageUploadProgress((prev) => {
          if (prev >= bulkImageFiles.length) {
            clearInterval(progressInterval);
            return bulkImageFiles.length;
          }
          return prev + 1;
        });
      }, 100);

      const res = await fetch(`/api/admin/upload-images`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      clearInterval(progressInterval);
      setBulkImageUploadProgress(bulkImageFiles.length);

      const result = await res.json();

      if (res.ok && result.success) {
        setBulkImageResult({
          success: true,
          message: `${
            result.totalUploaded || result.data.length
          } images uploaded successfully to Cloudinary`,
          uploadedImages: result.data,
          errors: result.errors || [],
          summary: {
            total: bulkImageFiles.length,
            uploaded: result.totalUploaded || result.data.length,
            failed: result.totalFailed || 0,
          },
        });
        setBulkImageFiles([]);
        setBulkImageUploadProgress(0);
      } else {
        setBulkImageResult({
          success: false,
          message: result.message || "Failed to upload images to Cloudinary",
          errors: result.errors || [],
        });
      }
    } catch (error) {
      console.error("Bulk image upload error:", error);
      setBulkImageResult({
        success: false,
        message: "Failed to upload images",
        errors: [{ message: error.message }],
      });
    } finally {
      setBulkImageProgress(false);
    }
  };

  const copyImageUrls = () => {
    if (bulkImageResult && bulkImageResult.uploadedImages) {
      const urls = bulkImageResult.uploadedImages
        .map((img) => img.cloudinary.url)
        .join("|");
      navigator.clipboard
        .writeText(urls)
        .then(() => {
          alert(
            "Image URLs copied to clipboard! You can paste them in the CSV images column."
          );
        })
        .catch((err) => {
          console.error("Failed to copy URLs:", err);
          alert("Failed to copy URLs to clipboard");
        });
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert("URL copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
        alert("Failed to copy to clipboard");
      });
  };

  const copyAllImageUrls = () => {
    if (bulkImageResult && bulkImageResult.uploadedImages) {
      const successfulUrls = bulkImageResult.uploadedImages
        .filter((img) => img.cloudinary && img.cloudinary.url)
        .map((img) => img.cloudinary.url)
        .join(", ");

      navigator.clipboard
        .writeText(successfulUrls)
        .then(() => {
          alert("All image URLs copied to clipboard!");
        })
        .catch((err) => {
          console.error("Failed to copy URLs:", err);
          alert("Failed to copy URLs to clipboard");
        });
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header - Shopify Style */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-semibold"
            style={{ color: "var(--shopify-text-primary)" }}
          >
            Add product
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: "var(--shopify-text-secondary)" }}
          >
            Create a single product or use bulk tools to add multiple products
            at once
          </p>
        </div>
      </div>

      {/* Tabs - Shopify Style */}
      <div
        className="flex items-center gap-1 border-b"
        style={{ borderColor: "var(--shopify-border)" }}
      >
        <button
          type="button"
          onClick={() => setActiveTab("single")}
          className={`px-4 py-3 text-sm font-medium transition-colors relative ${
            activeTab === "single" ? "border-b-2" : ""
          }`}
          style={{
            color:
              activeTab === "single"
                ? "var(--shopify-text-primary)"
                : "var(--shopify-text-secondary)",
            borderColor:
              activeTab === "single"
                ? "var(--shopify-text-primary)"
                : "transparent",
          }}
        >
          Single product
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("bulk")}
          className={`px-4 py-3 text-sm font-medium transition-colors relative ${
            activeTab === "bulk" ? "border-b-2" : ""
          }`}
          style={{
            color:
              activeTab === "bulk"
                ? "var(--shopify-text-primary)"
                : "var(--shopify-text-secondary)",
            borderColor:
              activeTab === "bulk"
                ? "var(--shopify-text-primary)"
                : "transparent",
          }}
        >
          Bulk tools
        </button>
      </div>

      {/* Bulk Upload Section - Shopify Style */}
      {activeTab === "bulk" && (
        <div
          className="rounded-xl p-5 border"
          style={{
            backgroundColor: "var(--shopify-surface)",
            borderColor: "var(--shopify-border)",
            boxShadow: "var(--shopify-shadow-sm)",
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="w-5 h-5"
              style={{ color: "var(--shopify-text-secondary)" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6M7 3.75h6.75L19.5 9.5V20.25A2.25 2.25 0 0117.25 22.5H7A2.25 2.25 0 014.75 20.25V6A2.25 2.25 0 017 3.75z"
              />
            </svg>
            <h3
              className="text-base font-semibold"
              style={{ color: "var(--shopify-text-primary)" }}
            >
              Bulk upload products via CSV
            </h3>
          </div>
          <p
            className="text-sm mb-4"
            style={{ color: "var(--shopify-text-secondary)" }}
          >
            Upload multiple products at once using a CSV file. Perfect for
            adding large collections.
          </p>

          {/* Format Instructions */}
          <div
            className="mb-4 p-4 rounded-lg"
            style={{
              backgroundColor: "var(--shopify-surface-subdued)",
              border: "1px solid var(--shopify-border-subdued)",
            }}
          >
            <div className="flex items-start gap-2 mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="w-5 h-5 flex-shrink-0 mt-0.5"
                style={{ color: "var(--shopify-interactive)" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                />
              </svg>
              <div>
                <p
                  className="text-sm font-medium mb-2"
                  style={{ color: "var(--shopify-text-primary)" }}
                >
                  CSV format requirements
                </p>
                <ul
                  className="text-xs space-y-1"
                  style={{ color: "var(--shopify-text-secondary)" }}
                >
                  <li>
                    • Required: name, price, category, stock, brand,
                    description, sku, material, metalType
                  </li>
                  <li>
                    • Optional: originalPrice, discount, subcategory, gemstone,
                    dimensions
                  </li>
                  <li>
                    • Categories: necklaces, earrings, rings, bracelets,
                    fine-gold, fine-silver, mens, gifts
                  </li>
                  <li>
                    • Boolean fields (isNewArrival, etc.): use "true" or "false"
                  </li>
                  <li>
                    • Multiple images: separate URLs with "|" (pipe symbol)
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Download Template Button */}
            <div>
              <button
                type="button"
                onClick={downloadCSVTemplate}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm text-white transition-colors"
                style={{ backgroundColor: "var(--shopify-action-primary)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "var(--shopify-action-primary-hover)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "var(--shopify-action-primary)")
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 12l4.5 4.5L16.5 12M12 3v13.5"
                  />
                </svg>
                <span>Download CSV template</span>
              </button>
            </div>

            {/* CSV File Upload */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--shopify-text-primary)" }}
              >
                CSV file
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleBulkUploadFileChange}
                className="w-full px-3 py-2 rounded-lg text-sm transition-colors"
                style={{
                  backgroundColor: "var(--shopify-surface)",
                  border: "1.5px solid var(--shopify-border)",
                  color: "var(--shopify-text-primary)",
                }}
              />
            </div>

            {/* Upload Button */}
            <div>
              <button
                type="button"
                onClick={handleBulkUpload}
                disabled={!bulkUploadFile || bulkUploadProgress}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: "var(--shopify-action-primary)" }}
                onMouseEnter={(e) =>
                  !e.currentTarget.disabled &&
                  (e.currentTarget.style.backgroundColor =
                    "var(--shopify-action-primary-hover)")
                }
                onMouseLeave={(e) =>
                  !e.currentTarget.disabled &&
                  (e.currentTarget.style.backgroundColor =
                    "var(--shopify-action-primary)")
                }
              >
                {bulkUploadProgress ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      ></path>
                    </svg>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 16.5V3m0 13.5l-4.5-4.5M12 16.5l4.5-4.5M3 21h18"
                      />
                    </svg>
                    <span>Upload products</span>
                  </>
                )}
              </button>
            </div>

            {/* Upload Result */}
            {bulkUploadResult && (
              <div
                className="p-4 rounded-lg"
                style={{
                  backgroundColor: bulkUploadResult.success
                    ? "#f0fdf4"
                    : "#fef2f2",
                  border: `1px solid ${
                    bulkUploadResult.success ? "#86efac" : "#fecaca"
                  }`,
                }}
              >
                <p
                  className="font-medium text-sm"
                  style={{
                    color: bulkUploadResult.success
                      ? "#166534"
                      : "var(--shopify-action-critical)",
                  }}
                >
                  {bulkUploadResult.message}
                </p>
                {bulkUploadResult.createdCount > 0 && (
                  <p className="text-sm mt-1" style={{ color: "#166534" }}>
                    Successfully created {bulkUploadResult.createdCount}{" "}
                    products
                  </p>
                )}
                {bulkUploadResult.errors &&
                  bulkUploadResult.errors.length > 0 && (
                    <div className="mt-2">
                      <p
                        className="text-sm font-medium"
                        style={{ color: "var(--shopify-action-critical)" }}
                      >
                        Errors found:
                      </p>
                      <ul
                        className="text-xs mt-1 max-h-32 overflow-y-auto"
                        style={{ color: "var(--shopify-action-critical)" }}
                      >
                        {bulkUploadResult.errors
                          .slice(0, 10)
                          .map((error, index) => (
                            <li key={index} className="mb-1">
                              Row {error.row}: {error.message}
                            </li>
                          ))}
                        {bulkUploadResult.errors.length > 10 && (
                          <li className="font-medium">
                            ... and {bulkUploadResult.errors.length - 10} more
                            errors
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bulk Image Upload Section - Shopify Style */}
      {activeTab === "bulk" && (
        <div
          className="rounded-xl p-5 border"
          style={{
            backgroundColor: "var(--shopify-surface)",
            borderColor: "var(--shopify-border)",
            boxShadow: "var(--shopify-shadow-sm)",
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="w-5 h-5"
              style={{ color: "var(--shopify-text-secondary)" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
            <h3
              className="text-base font-semibold"
              style={{ color: "var(--shopify-text-primary)" }}
            >
              Bulk image upload (Max 50 images)
            </h3>
          </div>
          <p
            className="text-sm mb-4"
            style={{ color: "var(--shopify-text-secondary)" }}
          >
            Upload multiple images to Cloudinary and get optimized URLs to use
            in CSV files.
          </p>

          <div className="space-y-4">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--shopify-text-primary)" }}
              >
                Select Images (Add one by one or multiple at once)
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleBulkImageFilesChange}
                className="w-full px-3 py-2 border rounded-lg text-sm transition-colors"
                style={{
                  backgroundColor: "var(--shopify-surface)",
                  borderColor: "var(--shopify-border)",
                  color: "var(--shopify-text-primary)",
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor =
                    "var(--shopify-action-interactive)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "var(--shopify-border)")
                }
              />
              <div className="flex justify-between items-center mt-2">
                <p
                  className="text-xs"
                  style={{ color: "var(--shopify-text-secondary)" }}
                >
                  Selected: {bulkImageFiles.length}/50 images
                  {bulkImageFiles.length > 50 && (
                    <span
                      className="ml-1"
                      style={{ color: "var(--shopify-action-critical)" }}
                    >
                      (Exceeds limit)
                    </span>
                  )}
                </p>
                {bulkImageFiles.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAllImages}
                    className="inline-flex items-center gap-1 text-xs transition-colors"
                    style={{ color: "var(--shopify-action-critical)" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.textDecoration = "underline")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.textDecoration = "none")
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="w-3.5 h-3.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    <span>Clear All</span>
                  </button>
                )}
              </div>
            </div>

            {/* Selected Images Preview */}
            {bulkImageFiles.length > 0 && (
              <div
                className="border rounded-lg p-4"
                style={{
                  backgroundColor: "var(--shopify-bg-primary)",
                  borderColor: "var(--shopify-border)",
                }}
              >
                <h4
                  className="text-sm font-semibold mb-3"
                  style={{ color: "var(--shopify-text-primary)" }}
                >
                  Selected Images:
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-64 overflow-y-auto">
                  {bulkImageFiles.map((file, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-3 transition-colors"
                      style={{
                        backgroundColor: "var(--shopify-surface)",
                        borderColor: "var(--shopify-border)",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          "var(--shopify-surface-hover)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          "var(--shopify-surface)")
                      }
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span
                          className="text-xs truncate flex-1"
                          style={{ color: "var(--shopify-text-primary)" }}
                          title={file.name}
                        >
                          {file.name.length > 15
                            ? file.name.substring(0, 15) + "..."
                            : file.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeImageFile(index)}
                          className="flex-shrink-0 p-1 rounded transition-colors"
                          style={{ color: "var(--shopify-action-critical)" }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = "#FDE7E9")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "transparent")
                          }
                          title="Remove"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            className="w-4 h-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                      <p
                        className="text-xs"
                        style={{ color: "var(--shopify-text-secondary)" }}
                      >
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleBulkImageUpload}
              disabled={
                bulkImageFiles.length === 0 ||
                bulkImageFiles.length > 50 ||
                bulkImageProgress
              }
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: bulkImageProgress
                  ? "var(--shopify-action-primary)"
                  : "var(--shopify-action-primary)",
              }}
              onMouseEnter={(e) =>
                !e.currentTarget.disabled &&
                (e.currentTarget.style.backgroundColor =
                  "var(--shopify-action-primary-hover)")
              }
              onMouseLeave={(e) =>
                !e.currentTarget.disabled &&
                (e.currentTarget.style.backgroundColor =
                  "var(--shopify-action-primary)")
              }
            >
              {bulkImageProgress ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 16.5V3m0 13.5l-4.5-4.5M12 16.5l4.5-4.5M3 21h18"
                    />
                  </svg>
                  <span>Upload Images to Cloudinary</span>
                </>
              )}
            </button>

            {/* Upload Progress */}
            {bulkImageProgress && (
              <div
                className="rounded-lg p-4"
                style={{
                  backgroundColor: "var(--shopify-surface)",
                  border: "1px solid var(--shopify-border)",
                }}
              >
                <div
                  className="flex justify-between text-sm mb-2"
                  style={{ color: "var(--shopify-text-primary)" }}
                >
                  <span className="font-medium">Uploading images...</span>
                  <span className="font-semibold">
                    {bulkImageFiles.length > 0
                      ? Math.round(
                          (bulkImageUploadProgress / bulkImageFiles.length) *
                            100
                        )
                      : 0}
                    %
                  </span>
                </div>
                <div
                  className="w-full rounded-full h-2 overflow-hidden"
                  style={{ backgroundColor: "var(--shopify-bg-primary)" }}
                >
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: "var(--shopify-action-primary)",
                      width: `${
                        bulkImageFiles.length > 0
                          ? (bulkImageUploadProgress / bulkImageFiles.length) *
                            100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            )}

            {/* Upload Results */}
            {bulkImageResult && (
              <div
                className="rounded-lg p-4"
                style={{
                  backgroundColor: "var(--shopify-surface)",
                  border: "1px solid var(--shopify-border)",
                }}
              >
                <h4
                  className="font-semibold mb-3"
                  style={{ color: "var(--shopify-text-primary)" }}
                >
                  Upload Results:
                </h4>
                {bulkImageResult.success ? (
                  <div className="space-y-2">
                    <div
                      className="rounded-lg p-3"
                      style={{
                        backgroundColor: "#D1F7E5",
                        border: "1px solid #00A860",
                      }}
                    >
                      <p
                        className="text-sm font-medium"
                        style={{ color: "#008060" }}
                      >
                        {bulkImageResult.message}
                      </p>
                    </div>
                    {bulkImageResult.uploadedImages &&
                      bulkImageResult.uploadedImages.length > 0 && (
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {bulkImageResult.uploadedImages.map(
                            (result, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 rounded-lg transition-all"
                                style={{
                                  backgroundColor: "var(--shopify-bg-primary)",
                                  border: "1px solid var(--shopify-border)",
                                }}
                              >
                                <div className="flex items-center space-x-2">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="w-4 h-4"
                                    style={{
                                      color: "var(--shopify-action-primary)",
                                    }}
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M4.5 12.75l6 6 9-13.5"
                                    />
                                  </svg>
                                  <span
                                    className="truncate max-w-xs text-sm"
                                    style={{
                                      color: "var(--shopify-text-primary)",
                                    }}
                                  >
                                    {result.originalName}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="text"
                                    value={result.cloudinary.url}
                                    readOnly
                                    className="rounded px-2 py-1 text-xs w-48"
                                    style={{
                                      backgroundColor:
                                        "var(--shopify-bg-primary)",
                                      border: "1px solid var(--shopify-border)",
                                      color: "var(--shopify-text-secondary)",
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      copyToClipboard(result.cloudinary.url)
                                    }
                                    className="inline-flex items-center gap-1 text-white px-2 py-1 rounded text-xs font-medium transition-colors"
                                    style={{
                                      backgroundColor:
                                        "var(--shopify-interactive)",
                                    }}
                                    onMouseEnter={(e) =>
                                      (e.currentTarget.style.backgroundColor =
                                        "var(--shopify-interactive-hover)")
                                    }
                                    onMouseLeave={(e) =>
                                      (e.currentTarget.style.backgroundColor =
                                        "var(--shopify-interactive)")
                                    }
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="1.5"
                                      className="w-3.5 h-3.5"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M8.25 7.5V6A2.25 2.25 0 0110.5 3.75h6.75A2.25 2.25 0 0119.5 6v10.5A2.25 2.25 0 0117.25 18.75H10.5A2.25 2.25 0 018.25 16.5V15M6 7.5H5.25A2.25 2.25 0 003 9.75v8.25A2.25 2.25 0 005.25 20.25h8.25A2.25 2.25 0 0015.75 18V9.75A2.25 2.25 0 0013.5 7.5H6z"
                                      />
                                    </svg>
                                    <span>Copy</span>
                                  </button>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      )}

                    {/* Copy All URLs Button */}
                    {bulkImageResult.uploadedImages &&
                      bulkImageResult.uploadedImages.length > 0 && (
                        <div
                          className="mt-3 pt-3"
                          style={{
                            borderTop: "1px solid var(--shopify-border)",
                          }}
                        >
                          <button
                            type="button"
                            onClick={copyAllImageUrls}
                            className="inline-flex items-center gap-2 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                            style={{
                              backgroundColor: "var(--shopify-action-primary)",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "var(--shopify-action-primary-hover)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "var(--shopify-action-primary)")
                            }
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              className="w-4 h-4"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M8.25 7.5V6A2.25 2.25 0 0110.5 3.75h6.75A2.25 2.25 0 0119.5 6v10.5A2.25 2.25 0 0117.25 18.75H10.5A2.25 2.25 0 018.25 16.5V15M6 7.5H5.25A2.25 2.25 0 003 9.75v8.25A2.25 2.25 0 005.25 20.25h8.25A2.25 2.25 0 0015.75 18V9.75A2.25 2.25 0 0013.5 7.5H6z"
                              />
                            </svg>
                            <span>Copy All URLs</span>
                          </button>
                          <p
                            className="text-xs mt-2"
                            style={{ color: "var(--shopify-text-secondary)" }}
                          >
                            Copies all successful URLs separated by commas for
                            easy pasting into CSV files.
                          </p>
                        </div>
                      )}
                  </div>
                ) : (
                  <div
                    className="rounded-lg p-3"
                    style={{
                      backgroundColor: "#FDE7E9",
                      border: "1px solid var(--shopify-action-critical)",
                    }}
                  >
                    <p
                      className="text-sm font-medium mb-2"
                      style={{ color: "var(--shopify-action-critical)" }}
                    >
                      {bulkImageResult.message}
                    </p>
                    {bulkImageResult.errors &&
                      bulkImageResult.errors.length > 0 && (
                        <div className="space-y-1">
                          {bulkImageResult.errors.map((error, index) => (
                            <p
                              key={index}
                              className="text-xs"
                              style={{
                                color: "var(--shopify-action-critical)",
                              }}
                            >
                              {error.message}
                            </p>
                          ))}
                        </div>
                      )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Single Product Form - Shopify Style */}
      {activeTab === "single" && (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Product Information Card */}
          <div
            className="rounded-xl p-5 border"
            style={{
              backgroundColor: "var(--shopify-surface)",
              borderColor: "var(--shopify-border)",
              boxShadow: "var(--shopify-shadow-sm)",
            }}
          >
            <h2
              className="text-base font-semibold mb-4"
              style={{ color: "var(--shopify-text-primary)" }}
            >
              Product information
            </h2>

            <div className="space-y-4">
              {/* Product Name */}
              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "var(--shopify-text-primary)" }}
                >
                  Title
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g., Pearl Drop Necklace"
                  value={form.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded-lg text-sm transition-all ${
                    errors.name ? "border-red-500" : ""
                  }`}
                  style={{
                    backgroundColor: "var(--shopify-surface)",
                    border: `1.5px solid ${
                      errors.name ? "#d72c0d" : "var(--shopify-border)"
                    }`,
                    color: "var(--shopify-text-primary)",
                  }}
                  onFocus={(e) =>
                    !errors.name &&
                    (e.currentTarget.style.borderColor =
                      "var(--shopify-interactive)")
                  }
                  onBlur={(e) =>
                    !errors.name &&
                    (e.currentTarget.style.borderColor =
                      "var(--shopify-border)")
                  }
                  required
                />
                {errors.name && (
                  <p
                    className="text-xs mt-1"
                    style={{ color: "var(--shopify-action-critical)" }}
                  >
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "var(--shopify-text-primary)" }}
                >
                  Description
                </label>
                <textarea
                  name="description"
                  placeholder="Elegant pearl drop necklace for special occasions. Handcrafted with premium materials..."
                  value={form.description}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded-lg text-sm transition-all ${
                    errors.description ? "border-red-500" : ""
                  }`}
                  style={{
                    backgroundColor: "var(--shopify-surface)",
                    border: `1.5px solid ${
                      errors.description ? "#d72c0d" : "var(--shopify-border)"
                    }`,
                    color: "var(--shopify-text-primary)",
                  }}
                  onFocus={(e) =>
                    !errors.description &&
                    (e.currentTarget.style.borderColor =
                      "var(--shopify-interactive)")
                  }
                  onBlur={(e) =>
                    !errors.description &&
                    (e.currentTarget.style.borderColor =
                      "var(--shopify-border)")
                  }
                  rows={4}
                  required
                />
                {errors.description && (
                  <p
                    className="text-xs mt-1"
                    style={{ color: "var(--shopify-action-critical)" }}
                  >
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Short Description */}
              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "var(--shopify-text-primary)" }}
                >
                  Short description
                </label>
                <textarea
                  name="shortDescription"
                  placeholder="Brief product summary"
                  value={form.shortDescription}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg text-sm transition-all"
                  style={{
                    backgroundColor: "var(--shopify-surface)",
                    border: "1.5px solid var(--shopify-border)",
                    color: "var(--shopify-text-primary)",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor =
                      "var(--shopify-interactive)")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor =
                      "var(--shopify-border)")
                  }
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Media Card - Shopify Style */}
          <div
            className="rounded-xl p-5 border"
            style={{
              backgroundColor: "var(--shopify-surface)",
              borderColor: "var(--shopify-border)",
              boxShadow: "var(--shopify-shadow-sm)",
            }}
          >
            <h2
              className="text-base font-semibold mb-4"
              style={{ color: "var(--shopify-text-primary)" }}
            >
              Media
            </h2>

            <div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className={`w-full px-3 py-2 rounded-lg text-sm transition-all ${
                  errors.images ? "border-red-500" : ""
                }`}
                style={{
                  backgroundColor: "var(--shopify-surface)",
                  border: `1.5px solid ${
                    errors.images ? "#d72c0d" : "var(--shopify-border)"
                  }`,
                  color: "var(--shopify-text-primary)",
                }}
              />
              {errors.images && (
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--shopify-action-critical)" }}
                >
                  {errors.images}
                </p>
              )}

              {/* Image Previews */}
              <div className="flex gap-3 mt-3 flex-wrap">
                {images.map((img, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={URL.createObjectURL(img)}
                      alt={`Product image ${i + 1}`}
                      className="w-24 h-24 object-cover rounded-lg border"
                      style={{ borderColor: "var(--shopify-border)" }}
                    />
                    {i === 0 && (
                      <div
                        className="absolute top-1 left-1 text-white text-xs px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: "var(--shopify-action-primary)",
                        }}
                      >
                        Primary
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setImages(images.filter((_, index) => index !== i));
                      }}
                      className="absolute -top-2 -right-2 rounded-full w-6 h-6 text-xs opacity-0 group-hover:opacity-100 transition-opacity text-white"
                      style={{
                        backgroundColor: "var(--shopify-action-critical)",
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}

                {/* Upload more button */}
                {images.length < 4 && (
                  <label
                    className="w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition-colors"
                    style={{ borderColor: "var(--shopify-border)" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.borderColor =
                        "var(--shopify-border-hover)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.borderColor =
                        "var(--shopify-border)")
                    }
                  >
                    <svg
                      className="w-6 h-6"
                      style={{ color: "var(--shopify-text-secondary)" }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div
                className="mt-3 text-xs"
                style={{ color: "var(--shopify-text-secondary)" }}
              >
                <p>• Upload high-quality images (JPEG, PNG, WebP)</p>
                <p>• Maximum 4 images per product</p>
                <p>• First image will be the primary image</p>
              </div>
            </div>
          </div>

          {/* Category & Organization Card */}
          <div
            className="rounded-xl p-5 border"
            style={{
              backgroundColor: "var(--shopify-surface)",
              borderColor: "var(--shopify-border)",
              boxShadow: "var(--shopify-shadow-sm)",
            }}
          >
            <h2
              className="text-base font-semibold mb-4"
              style={{ color: "var(--shopify-text-primary)" }}
            >
              Organization
            </h2>

            <div className="space-y-4">
              {/* Category */}
              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "var(--shopify-text-primary)" }}
                >
                  Category
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded-lg text-sm transition-all ${
                    errors.category ? "border-red-500" : ""
                  }`}
                  style={{
                    backgroundColor: "var(--shopify-surface)",
                    border: `1.5px solid ${
                      errors.category ? "#d72c0d" : "var(--shopify-border)"
                    }`,
                    color: "var(--shopify-text-primary)",
                  }}
                  required
                >
                  <option value="">Select category</option>
                  <option value="necklaces">Necklaces</option>
                  <option value="earrings">Earrings</option>
                  <option value="rings">Rings</option>
                  <option value="bracelets">Bracelets</option>
                  <option value="ring-cum-bangles">Ring-cum-Bangles</option>
                  <option value="fine-gold">Fine Gold</option>
                  <option value="fine-silver">Fine Silver</option>
                  <option value="mens">Men's Collection</option>
                  <option value="gifts">Gifts</option>
                </select>
                {errors.category && (
                  <p
                    className="text-xs mt-1"
                    style={{ color: "var(--shopify-action-critical)" }}
                  >
                    {errors.category}
                  </p>
                )}
              </div>

              {/* Subcategory */}
              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "var(--shopify-text-primary)" }}
                >
                  Subcategory
                </label>
                <input
                  type="text"
                  name="subcategory"
                  placeholder="e.g., Wedding Rings, Stud Earrings"
                  value={form.subcategory}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg text-sm transition-all"
                  style={{
                    backgroundColor: "var(--shopify-surface)",
                    border: "1.5px solid var(--shopify-border)",
                    color: "var(--shopify-text-primary)",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor =
                      "var(--shopify-interactive)")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor =
                      "var(--shopify-border)")
                  }
                />
              </div>

              {/* Brand */}
              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "var(--shopify-text-primary)" }}
                >
                  Brand
                </label>
                <input
                  type="text"
                  name="brand"
                  placeholder="e.g., Sabri"
                  value={form.brand}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded-lg text-sm transition-all ${
                    errors.brand ? "border-red-500" : ""
                  }`}
                  style={{
                    backgroundColor: "var(--shopify-surface)",
                    border: `1.5px solid ${
                      errors.brand ? "#d72c0d" : "var(--shopify-border)"
                    }`,
                    color: "var(--shopify-text-primary)",
                  }}
                  onFocus={(e) =>
                    !errors.brand &&
                    (e.currentTarget.style.borderColor =
                      "var(--shopify-interactive)")
                  }
                  onBlur={(e) =>
                    !errors.brand &&
                    (e.currentTarget.style.borderColor =
                      "var(--shopify-border)")
                  }
                  required
                />
                {errors.brand && (
                  <p
                    className="text-xs mt-1"
                    style={{ color: "var(--shopify-action-critical)" }}
                  >
                    {errors.brand}
                  </p>
                )}
              </div>

              {/* SKU */}
              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "var(--shopify-text-primary)" }}
                >
                  SKU (Stock Keeping Unit)
                </label>
                <input
                  type="text"
                  name="sku"
                  placeholder="e.g., NECK001"
                  value={form.sku}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded-lg text-sm transition-all ${
                    errors.sku ? "border-red-500" : ""
                  }`}
                  style={{
                    backgroundColor: "var(--shopify-surface)",
                    border: `1.5px solid ${
                      errors.sku ? "#d72c0d" : "var(--shopify-border)"
                    }`,
                    color: "var(--shopify-text-primary)",
                  }}
                  onFocus={(e) =>
                    !errors.sku &&
                    (e.currentTarget.style.borderColor =
                      "var(--shopify-interactive)")
                  }
                  onBlur={(e) =>
                    !errors.sku &&
                    (e.currentTarget.style.borderColor =
                      "var(--shopify-border)")
                  }
                  required
                />
                {errors.sku && (
                  <p
                    className="text-xs mt-1"
                    style={{ color: "var(--shopify-action-critical)" }}
                  >
                    {errors.sku}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Inventory & Pricing Card */}
          <div
            className="rounded-xl p-5 border"
            style={{
              backgroundColor: "var(--shopify-surface)",
              borderColor: "var(--shopify-border)",
              boxShadow: "var(--shopify-shadow-sm)",
            }}
          >
            <h2
              className="text-base font-semibold mb-4"
              style={{ color: "var(--shopify-text-primary)" }}
            >
              Pricing
            </h2>

            <div className="grid grid-cols-3 gap-4">
              {/* Cost */}
              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "var(--shopify-text-primary)" }}
                >
                  Cost
                </label>
                <div className="relative">
                  <span
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
                    style={{ color: "var(--shopify-text-secondary)" }}
                  >
                    ₹
                  </span>
                  <input
                    type="number"
                    name="cost"
                    placeholder="0.00"
                    value={form.cost}
                    onChange={handleChange}
                    className="w-full pl-7 pr-3 py-2 rounded-lg text-sm transition-all"
                    style={{
                      backgroundColor: "var(--shopify-surface)",
                      border: "1.5px solid var(--shopify-border)",
                      color: "var(--shopify-text-primary)",
                    }}
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor =
                        "var(--shopify-interactive)")
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor =
                        "var(--shopify-border)")
                    }
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Price */}
              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "var(--shopify-text-primary)" }}
                >
                  Price
                </label>
                <div className="relative">
                  <span
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
                    style={{ color: "var(--shopify-text-secondary)" }}
                  >
                    ₹
                  </span>
                  <input
                    type="number"
                    name="price"
                    placeholder="0.00"
                    value={form.price}
                    onChange={handleChange}
                    className="w-full pl-7 pr-3 py-2 rounded-lg text-sm transition-all"
                    style={{
                      backgroundColor: "var(--shopify-surface)",
                      border: "1.5px solid var(--shopify-border)",
                      color: "var(--shopify-text-primary)",
                    }}
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor =
                        "var(--shopify-interactive)")
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor =
                        "var(--shopify-border)")
                    }
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              {/* Compare at price */}
              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "var(--shopify-text-primary)" }}
                >
                  Compare-at price
                </label>
                <div className="relative">
                  <span
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
                    style={{ color: "var(--shopify-text-secondary)" }}
                  >
                    ₹
                  </span>
                  <input
                    type="number"
                    name="originalPrice"
                    placeholder="0.00"
                    value={form.originalPrice}
                    onChange={handleChange}
                    className="w-full pl-7 pr-3 py-2 rounded-lg text-sm transition-all"
                    style={{
                      backgroundColor: "var(--shopify-surface)",
                      border: "1.5px solid var(--shopify-border)",
                      color: "var(--shopify-text-primary)",
                    }}
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor =
                        "var(--shopify-interactive)")
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor =
                        "var(--shopify-border)")
                    }
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Profit calculation */}
            {form.cost > 0 && form.price > 0 && (
              <div
                className="mt-4 p-3 rounded-lg"
                style={{ backgroundColor: "var(--shopify-surface-subdued)" }}
              >
                <p
                  className="text-xs font-medium mb-2"
                  style={{ color: "var(--shopify-text-secondary)" }}
                >
                  Profit margin
                </p>
                <div className="flex gap-4 text-sm">
                  <div>
                    <span style={{ color: "var(--shopify-text-secondary)" }}>
                      Profit:{" "}
                    </span>
                    <span
                      className="font-medium"
                      style={{ color: "var(--shopify-action-primary)" }}
                    >
                      ₹{(form.price - form.cost).toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: "var(--shopify-text-secondary)" }}>
                      Margin:{" "}
                    </span>
                    <span
                      className="font-medium"
                      style={{ color: "var(--shopify-action-primary)" }}
                    >
                      {(((form.price - form.cost) / form.cost) * 100).toFixed(
                        1
                      )}
                      %
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Stock */}
            <div className="mt-4">
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--shopify-text-primary)" }}
              >
                Quantity
              </label>
              <input
                type="number"
                name="stock"
                placeholder="0"
                value={form.stock}
                onChange={handleChange}
                className={`w-full px-3 py-2 rounded-lg text-sm transition-all ${
                  errors.stock ? "border-red-500" : ""
                }`}
                style={{
                  backgroundColor: "var(--shopify-surface)",
                  border: `1.5px solid ${
                    errors.stock ? "#d72c0d" : "var(--shopify-border)"
                  }`,
                  color: "var(--shopify-text-primary)",
                }}
                onFocus={(e) =>
                  !errors.stock &&
                  (e.currentTarget.style.borderColor =
                    "var(--shopify-interactive)")
                }
                onBlur={(e) =>
                  !errors.stock &&
                  (e.currentTarget.style.borderColor = "var(--shopify-border)")
                }
                min="0"
                required
              />
              {errors.stock && (
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--shopify-action-critical)" }}
                >
                  {errors.stock}
                </p>
              )}
            </div>
          </div>

          {/* Jewelry Specifications Card */}
          <div
            className="rounded-xl p-5 border"
            style={{
              backgroundColor: "var(--shopify-surface)",
              borderColor: "var(--shopify-border)",
              boxShadow: "var(--shopify-shadow-sm)",
            }}
          >
            <h2
              className="text-base font-semibold mb-4"
              style={{ color: "var(--shopify-text-primary)" }}
            >
              Jewelry specifications
            </h2>

            <div className="grid grid-cols-2 gap-4">
              {/* Material */}
              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "var(--shopify-text-primary)" }}
                >
                  Material
                </label>
                <input
                  type="text"
                  name="material"
                  placeholder="e.g., Pearl, Diamond"
                  value={form.material}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded-lg text-sm transition-all ${
                    errors.material ? "border-red-500" : ""
                  }`}
                  style={{
                    backgroundColor: "var(--shopify-surface)",
                    border: `1.5px solid ${
                      errors.material ? "#d72c0d" : "var(--shopify-border)"
                    }`,
                    color: "var(--shopify-text-primary)",
                  }}
                  onFocus={(e) =>
                    !errors.material &&
                    (e.currentTarget.style.borderColor =
                      "var(--shopify-interactive)")
                  }
                  onBlur={(e) =>
                    !errors.material &&
                    (e.currentTarget.style.borderColor =
                      "var(--shopify-border)")
                  }
                  required
                />
                {errors.material && (
                  <p
                    className="text-xs mt-1"
                    style={{ color: "var(--shopify-action-critical)" }}
                  >
                    {errors.material}
                  </p>
                )}
              </div>

              {/* Metal Type */}
              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "var(--shopify-text-primary)" }}
                >
                  Metal type
                </label>
                <select
                  name="metalType"
                  value={form.metalType}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded-lg text-sm transition-all ${
                    errors.metalType ? "border-red-500" : ""
                  }`}
                  style={{
                    backgroundColor: "var(--shopify-surface)",
                    border: `1.5px solid ${
                      errors.metalType ? "#d72c0d" : "var(--shopify-border)"
                    }`,
                    color: "var(--shopify-text-primary)",
                  }}
                  required
                >
                  <option value="">Select metal type</option>
                  <option value="sterling-silver">Sterling Silver</option>
                  <option value="gold-plated">Gold Plated</option>
                  <option value="rhodium-plated">Rhodium Plated</option>
                  <option value="stainless-steel">Stainless Steel</option>
                  <option value="brass">Brass</option>
                </select>
                {errors.metalType && (
                  <p
                    className="text-xs mt-1"
                    style={{ color: "var(--shopify-action-critical)" }}
                  >
                    {errors.metalType}
                  </p>
                )}
              </div>

              {/* Gemstone */}
              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "var(--shopify-text-primary)" }}
                >
                  Gemstone
                </label>
                <input
                  type="text"
                  name="gemstone"
                  placeholder="e.g., Diamond, Pearl, Ruby"
                  value={form.gemstone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg text-sm transition-all"
                  style={{
                    backgroundColor: "var(--shopify-surface)",
                    border: "1.5px solid var(--shopify-border)",
                    color: "var(--shopify-text-primary)",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor =
                      "var(--shopify-interactive)")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor =
                      "var(--shopify-border)")
                  }
                />
              </div>

              {/* Dimensions */}
              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "var(--shopify-text-primary)" }}
                >
                  Dimensions
                </label>
                <input
                  type="text"
                  name="dimensions"
                  placeholder="e.g., 45cm chain length"
                  value={form.dimensions}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg text-sm transition-all"
                  style={{
                    backgroundColor: "var(--shopify-surface)",
                    border: "1.5px solid var(--shopify-border)",
                    color: "var(--shopify-text-primary)",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor =
                      "var(--shopify-interactive)")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor =
                      "var(--shopify-border)")
                  }
                />
              </div>

              {/* Care Instructions */}
              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "var(--shopify-text-primary)" }}
                >
                  Care instructions
                </label>
                <input
                  type="text"
                  name="careInstructions"
                  placeholder="e.g., Store in dry place"
                  value={form.careInstructions}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg text-sm transition-all"
                  style={{
                    backgroundColor: "var(--shopify-surface)",
                    border: "1.5px solid var(--shopify-border)",
                    color: "var(--shopify-text-primary)",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor =
                      "var(--shopify-interactive)")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor =
                      "var(--shopify-border)")
                  }
                />
              </div>

              {/* Warranty */}
              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "var(--shopify-text-primary)" }}
                >
                  Warranty
                </label>
                <input
                  type="text"
                  name="warranty"
                  placeholder="e.g., 1 year"
                  value={form.warranty}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg text-sm transition-all"
                  style={{
                    backgroundColor: "var(--shopify-surface)",
                    border: "1.5px solid var(--shopify-border)",
                    color: "var(--shopify-text-primary)",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor =
                      "var(--shopify-interactive)")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor =
                      "var(--shopify-border)")
                  }
                />
              </div>
            </div>
          </div>

          {/* Product Tags & Collections Card */}
          <div
            className="rounded-xl p-5 border"
            style={{
              backgroundColor: "var(--shopify-surface)",
              borderColor: "var(--shopify-border)",
              boxShadow: "var(--shopify-shadow-sm)",
            }}
          >
            <h2
              className="text-base font-semibold mb-4"
              style={{ color: "var(--shopify-text-primary)" }}
            >
              Product tags
            </h2>

            <div className="grid grid-cols-3 gap-3">
              <label
                className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer transition-colors"
                style={{ borderColor: "var(--shopify-border)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "var(--shopify-surface-hover)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <input
                  type="checkbox"
                  name="isNewArrival"
                  checked={form.isNewArrival}
                  onChange={handleChange}
                  className="accent-green-600"
                />
                <span
                  className="text-sm"
                  style={{ color: "var(--shopify-text-primary)" }}
                >
                  New arrival
                </span>
              </label>

              <label
                className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer transition-colors"
                style={{ borderColor: "var(--shopify-border)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "var(--shopify-surface-hover)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <input
                  type="checkbox"
                  name="isBestSeller"
                  checked={form.isBestSeller}
                  onChange={handleChange}
                  className="accent-green-600"
                />
                <span
                  className="text-sm"
                  style={{ color: "var(--shopify-text-primary)" }}
                >
                  Best seller
                </span>
              </label>

              <label
                className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer transition-colors"
                style={{ borderColor: "var(--shopify-border)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "var(--shopify-surface-hover)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={form.isFeatured}
                  onChange={handleChange}
                  className="accent-green-600"
                />
                <span
                  className="text-sm"
                  style={{ color: "var(--shopify-text-primary)" }}
                >
                  Featured
                </span>
              </label>

              <label
                className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer transition-colors"
                style={{ borderColor: "var(--shopify-border)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "var(--shopify-surface-hover)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <input
                  type="checkbox"
                  name="isGiftable"
                  checked={form.isGiftable}
                  onChange={handleChange}
                  className="accent-green-600"
                />
                <span
                  className="text-sm"
                  style={{ color: "var(--shopify-text-primary)" }}
                >
                  Giftable
                </span>
              </label>

              <label
                className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer transition-colors"
                style={{ borderColor: "var(--shopify-border)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "var(--shopify-surface-hover)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <input
                  type="checkbox"
                  name="isOnSale"
                  checked={form.isOnSale}
                  onChange={handleChange}
                  className="accent-green-600"
                />
                <span
                  className="text-sm"
                  style={{ color: "var(--shopify-text-primary)" }}
                >
                  On sale
                </span>
              </label>

              <label
                className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer transition-colors"
                style={{ borderColor: "var(--shopify-border)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "var(--shopify-surface-hover)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <input
                  type="checkbox"
                  name="ringCumBangles"
                  checked={form.ringCumBangles}
                  onChange={handleChange}
                  className="accent-green-600"
                />
                <span
                  className="text-sm"
                  style={{ color: "var(--shopify-text-primary)" }}
                >
                  Ring-cum-Bangles
                </span>
              </label>

              <label
                className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer transition-colors"
                style={{ borderColor: "var(--shopify-border)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "var(--shopify-surface-hover)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <input
                  type="checkbox"
                  name="men"
                  checked={form.men}
                  onChange={handleChange}
                  className="accent-green-600"
                />
                <span
                  className="text-sm"
                  style={{ color: "var(--shopify-text-primary)" }}
                >
                  Men's
                </span>
              </label>

              <label
                className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer transition-colors"
                style={{ borderColor: "var(--shopify-border)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "var(--shopify-surface-hover)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <input
                  type="checkbox"
                  name="women"
                  checked={form.women}
                  onChange={handleChange}
                  className="accent-green-600"
                />
                <span
                  className="text-sm"
                  style={{ color: "var(--shopify-text-primary)" }}
                >
                  Women's
                </span>
              </label>

              <label
                className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer transition-colors"
                style={{ borderColor: "var(--shopify-border)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "var(--shopify-surface-hover)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <input
                  type="checkbox"
                  name="kids"
                  checked={form.kids}
                  onChange={handleChange}
                  className="accent-green-600"
                />
                <span
                  className="text-sm"
                  style={{ color: "var(--shopify-text-primary)" }}
                >
                  Kids'
                </span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm text-white transition-colors"
              style={{ backgroundColor: "var(--shopify-action-primary)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "var(--shopify-action-primary-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "var(--shopify-action-primary)")
              }
            >
              <span>Save product</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
