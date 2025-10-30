"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id;

  const [form, setForm] = useState({
    name: "",
    price: 0,
    originalPrice: 0,
    cost: 0,
    discount: 0,
    category: "",
    subcategory: "",
    stock: 0,
    brand: "Sabri",
    description: "",
    shortDescription: "",
    sku: "",
    // Jewelry-specific fields (matching add product structure)
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
    ringCumBangles: false,
    // Target audience
    men: false,
    women: false,
    kids: false,
  });

  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const fetchProduct = useCallback(async () => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch product");
      }

      const responseData = await response.json();
      const product = responseData.data || responseData;
      setForm({
        name: product.name || "",
        price: product.price || 0,
        originalPrice: product.originalPrice || 0,
        cost: product.cost || 0, // Default to 0 if not set
        discount: product.discount || 0,
        category: product.category || "",
        subcategory: product.subcategory || "",
        stock: product.stock || 0,
        brand: product.brand || "Sabri",
        description: product.description || "",
        shortDescription: product.shortDescription || "",
        sku: product.sku || "",
        // Extract specifications to top level (matching add product structure)
        material: product.specifications?.material || "",
        metalType: product.specifications?.metalType || "",
        gemstone: product.specifications?.gemstone || "",
        dimensions: product.specifications?.dimensions || "",
        careInstructions: product.specifications?.careInstructions || "",
        warranty: product.specifications?.warranty || "",
        isNewArrival: product.isNewArrival || false,
        isBestSeller: product.isBestSeller || false,
        isFeatured: product.isFeatured || false,
        isGiftable:
          product.isGiftable !== undefined ? product.isGiftable : true,
        isOnSale: product.isOnSale || false,
        ringCumBangles: product.ringCumBangles || false,
        men: product.men || false,
        women: product.women !== undefined ? product.women : false,
        kids: product.kids || false,
      });
      setExistingImages(product.images || []);
    } catch (error) {
      console.error("Error fetching product:", error);
      alert("Failed to load product data");
      router.push("/dashboard/view-products");
    } finally {
      setLoading(false);
    }
  }, [productId, router]);

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId, fetchProduct]);

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
    if (files.length + images.length + existingImages.length > 4) {
      alert("You can only have up to 4 images total");
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

  const removeNewImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  // Drag and drop handlers for existing images
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", "");
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      const newImages = [...existingImages];
      const draggedImage = newImages[draggedIndex];
      newImages.splice(draggedIndex, 1);
      newImages.splice(dropIndex, 0, draggedImage);
      setExistingImages(newImages);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Drag and drop handlers for new images
  const handleNewImageDragStart = (e, index) => {
    setDraggedIndex(existingImages.length + index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", "");
  };

  const handleNewImageDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleNewImageDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(existingImages.length + index);
  };

  const handleNewImageDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleNewImageDrop = (e, dropIndex) => {
    e.preventDefault();
    const actualDropIndex = existingImages.length + dropIndex;
    if (draggedIndex !== null && draggedIndex !== actualDropIndex) {
      if (draggedIndex >= existingImages.length) {
        // Dragging from new images to new images
        const newImages = [...images];
        const draggedImage = newImages[draggedIndex - existingImages.length];
        newImages.splice(draggedIndex - existingImages.length, 1);
        newImages.splice(dropIndex, 0, draggedImage);
        setImages(newImages);
      } else {
        // Dragging from existing images to new images (not allowed)
        console.log("Cannot move existing image to new images section");
      }
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
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
    if (images.length + existingImages.length === 0)
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

    // Jewelry specifications (matching add product structure)
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

    // Add new images
    images.forEach((img) => formData.append("images", img));

    // Add existing images URLs (to keep them)
    existingImages.forEach((img) => {
      const imageUrl = typeof img === "string" ? img : img.url || img;
      formData.append("existingImages", imageUrl);
    });

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "PUT",
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
          `Failed to update product: ${errorData.message || res.statusText}`
        );
      }

      alert("✅ Product updated successfully!");
      router.push("/dashboard/view-products");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to update product");
    }
  };

  if (loading) {
    return (
      <div className="min-h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">✏️ Edit Product</h2>
          <button
            onClick={() => router.push("/dashboard/view-products")}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              placeholder="e.g., Ray-Ban Aviator Sunglasses"
              value={form.name}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              required
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Price and Original Price */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cost Price *
              </label>
              <input
                type="number"
                name="cost"
                placeholder="e.g., 100"
                value={form.cost}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
                min="0"
                step="0.01"
              />
              <p className="text-xs text-gray-500 mt-1">Actual cost</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selling Price *
              </label>
              <input
                type="number"
                name="price"
                placeholder="e.g., 150"
                value={form.price}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg ${
                  errors.price ? "border-red-500" : "border-gray-300"
                }`}
                min="0"
                step="0.01"
                required
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">{errors.price}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">Customer price</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Compare-At Price *
              </label>
              <input
                type="number"
                name="originalPrice"
                placeholder="e.g., 200"
                value={form.originalPrice}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg ${
                  errors.originalPrice ? "border-red-500" : "border-gray-300"
                }`}
                min="0"
                step="0.01"
                required
              />
              {errors.originalPrice && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.originalPrice}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">Original MRP</p>
            </div>
          </div>

          {/* Profit Calculation Display */}
          {form.cost > 0 && form.price > 0 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Profit Calculation
              </h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Gross Profit:</span>
                  <span className="text-green-600 font-semibold ml-2">
                    ₹{(form.price - form.cost).toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Profit Margin:</span>
                  <span className="text-green-600 font-semibold ml-2">
                    {(((form.price - form.cost) / form.cost) * 100).toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Markup:</span>
                  <span className="text-blue-600 font-semibold ml-2">
                    {(((form.price - form.cost) / form.price) * 100).toFixed(1)}
                    %
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Discount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Discount (%)
            </label>
            <input
              type="number"
              name="discount"
              placeholder="e.g., 25"
              value={form.discount}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg"
              min="0"
              max="100"
              step="0.01"
            />
          </div>

          {/* Category and Subcategory */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg ${
                  errors.category ? "border-red-500" : "border-gray-300"
                }`}
                required
              >
                <option value="">Select Category</option>
                <option value="rings">Rings</option>
                <option value="necklaces">Necklaces</option>
                <option value="earrings">Earrings</option>
                <option value="bracelets">Bracelets</option>
                <option value="fine-gold">Fine Gold</option>
                <option value="fine-silver">Fine Silver</option>
                <option value="mens">Men's</option>
                <option value="gifts">Gifts</option>
                <option value="new-arrivals">New Arrivals</option>
                <option value="best-sellers">Best Sellers</option>
                <option value="collections">Collections</option>
              </select>
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">{errors.category}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subcategory
              </label>
              <input
                type="text"
                name="subcategory"
                placeholder="e.g., Wedding Rings"
                value={form.subcategory}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* Stock and SKU */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Quantity *
              </label>
              <input
                type="number"
                name="stock"
                placeholder="e.g., 25"
                value={form.stock}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg ${
                  errors.stock ? "border-red-500" : "border-gray-300"
                }`}
                min="0"
                required
              />
              {errors.stock && (
                <p className="text-red-500 text-sm mt-1">{errors.stock}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SKU *
              </label>
              <input
                type="text"
                name="sku"
                placeholder="e.g., SAB-RING-001"
                value={form.sku}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg ${
                  errors.sku ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
              {errors.sku && (
                <p className="text-red-500 text-sm mt-1">{errors.sku}</p>
              )}
            </div>
          </div>

          {/* Brand */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brand *
            </label>
            <input
              type="text"
              name="brand"
              placeholder="e.g., Sabri"
              value={form.brand}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg ${
                errors.brand ? "border-red-500" : "border-gray-300"
              }`}
              required
            />
            {errors.brand && (
              <p className="text-red-500 text-sm mt-1">{errors.brand}</p>
            )}
          </div>

          {/* Description and Short Description */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Description *
              </label>
              <textarea
                name="description"
                placeholder="Detailed description of the product..."
                value={form.description}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg ${
                  errors.description ? "border-red-500" : "border-gray-300"
                }`}
                rows={4}
                required
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Short Description
              </label>
              <textarea
                name="shortDescription"
                placeholder="Brief description for product cards..."
                value={form.shortDescription}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
                rows={2}
              />
            </div>
          </div>

          {/* Jewelry Specifications */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Jewelry Specifications
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Material *
                </label>
                <input
                  type="text"
                  name="material"
                  placeholder="e.g., Pearl, Diamond, Gold"
                  value={form.material}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-lg ${
                    errors.material ? "border-red-500" : "border-gray-300"
                  }`}
                  required
                />
                {errors.material && (
                  <p className="text-red-500 text-sm mt-1">{errors.material}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Metal Type *
                </label>
                <select
                  name="metalType"
                  value={form.metalType}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-lg ${
                    errors.metalType ? "border-red-500" : "border-gray-300"
                  }`}
                  required
                >
                  <option value="">Select Metal Type</option>
                  <option value="sterling-silver">Sterling Silver</option>
                  <option value="gold-plated">Gold Plated</option>
                  <option value="rhodium-plated">Rhodium Plated</option>
                  <option value="stainless-steel">Stainless Steel</option>
                  <option value="brass">Brass</option>
                </select>
                {errors.metalType && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.metalType}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Gemstone
                </label>
                <input
                  type="text"
                  name="gemstone"
                  placeholder="e.g., Diamond, Pearl, Ruby"
                  value={form.gemstone}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Dimensions
                </label>
                <input
                  type="text"
                  name="dimensions"
                  placeholder="e.g., 45cm chain length, 6mm studs"
                  value={form.dimensions}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Care Instructions
                </label>
                <input
                  type="text"
                  name="careInstructions"
                  placeholder="e.g., Store in dry place, avoid contact with perfumes"
                  value={form.careInstructions}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Warranty
                </label>
                <input
                  type="text"
                  name="warranty"
                  placeholder="e.g., 1 year, 2 years, Lifetime"
                  value={form.warranty}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Images (max 4 total) *
            </label>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Current Images:{" "}
                  <span className="text-xs text-gray-500">
                    (Drag to reorder)
                  </span>
                </p>
                <div className="flex gap-2 flex-wrap">
                  {existingImages.map((img, i) => (
                    <div
                      key={i}
                      className={`relative ${
                        draggedIndex === i ? "opacity-50" : ""
                      } ${
                        dragOverIndex === i && draggedIndex !== i
                          ? "ring-2 ring-blue-500 ring-opacity-50"
                          : ""
                      }`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, i)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => handleDragOver(e, i)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, i)}
                    >
                      <img
                        src={typeof img === "string" ? img : img.url}
                        alt="existing"
                        className="w-20 h-20 object-cover rounded border cursor-move hover:scale-105 transition-transform"
                      />
                      <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">
                        {i + 1}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExistingImage(i)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images Upload */}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className={`w-full p-2 border rounded-lg ${
                errors.images ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.images && (
              <p className="text-red-500 text-sm mt-1">{errors.images}</p>
            )}

            {/* New Images Preview */}
            {images.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 mb-2">
                  New Images:{" "}
                  <span className="text-xs text-gray-500">
                    (Drag to reorder)
                  </span>
                </p>
                <div className="flex gap-2 flex-wrap">
                  {images.map((img, i) => (
                    <div
                      key={i}
                      className={`relative ${
                        draggedIndex === existingImages.length + i
                          ? "opacity-50"
                          : ""
                      } ${
                        dragOverIndex === existingImages.length + i &&
                        draggedIndex !== existingImages.length + i
                          ? "ring-2 ring-blue-500 ring-opacity-50"
                          : ""
                      }`}
                      draggable
                      onDragStart={(e) => handleNewImageDragStart(e, i)}
                      onDragEnd={handleNewImageDragEnd}
                      onDragOver={(e) => handleNewImageDragOver(e, i)}
                      onDragLeave={handleNewImageDragLeave}
                      onDrop={(e) => handleNewImageDrop(e, i)}
                    >
                      <img
                        src={URL.createObjectURL(img)}
                        alt="preview"
                        className="w-20 h-20 object-cover rounded border cursor-move hover:scale-105 transition-transform"
                      />
                      <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-1 rounded">
                        {existingImages.length + i + 1}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeNewImage(i)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Product Categories */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Product Categories & Flags
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  name="isNewArrival"
                  checked={form.isNewArrival}
                  onChange={handleChange}
                  className="text-blue-600"
                />
                <span>New Arrival</span>
              </label>

              <label className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  name="isBestSeller"
                  checked={form.isBestSeller}
                  onChange={handleChange}
                  className="text-blue-600"
                />
                <span>Best Seller</span>
              </label>

              <label className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={form.isFeatured}
                  onChange={handleChange}
                  className="text-blue-600"
                />
                <span>Featured</span>
              </label>

              <label className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  name="isGiftable"
                  checked={form.isGiftable}
                  onChange={handleChange}
                  className="text-blue-600"
                />
                <span>Giftable</span>
              </label>

              <label className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  name="isOnSale"
                  checked={form.isOnSale}
                  onChange={handleChange}
                  className="text-blue-600"
                />
                <span>On Sale</span>
              </label>

              <label className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  name="ringCumBangles"
                  checked={form.ringCumBangles}
                  onChange={handleChange}
                  className="text-blue-600"
                />
                <span>Ring-cum-Bangles</span>
              </label>

              <label className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  name="men"
                  checked={form.men}
                  onChange={handleChange}
                  className="text-blue-600"
                />
                <span>Men's Collection</span>
              </label>

              <label className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  name="women"
                  checked={form.women}
                  onChange={handleChange}
                  className="text-blue-600"
                />
                <span>Women's Collection</span>
              </label>

              <label className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  name="kids"
                  checked={form.kids}
                  onChange={handleChange}
                  className="text-blue-600"
                />
                <span>Kids' Collection</span>
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              💾 Update Product
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard/view-products")}
              className="px-6 bg-gray-500 text-white p-3 rounded-lg hover:bg-gray-600 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
