"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id;

  const [loading, setLoading] = useState(true);
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

  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${productId}`, {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch product");
        }

        const data = await res.json();
        const product = data.data || data;

        // Populate form with existing product data
        setForm({
          name: product.name || "",
          price: product.price || 0,
          originalPrice: product.originalPrice || 0,
          cost: product.cost || 0,
          category: product.category || "",
          subcategory: product.subcategory || "",
          stock: product.stock || 0,
          brand: product.brand || "Sabri",
          description: product.description || "",
          shortDescription: product.shortDescription || "",
          sku: product.sku || "",
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
          discount: product.discount || 0,
          ringCumBangles: product.ringCumBangles || false,
          men: product.men || false,
          women: product.women || false,
          kids: product.kids || false,
        });

        setExistingImages(product.images || []);
      } catch (error) {
        console.error("Error fetching product:", error);
        alert("Failed to load product. Redirecting...");
        router.push("/dashboard/view-products");
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId, router]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = existingImages.length + images.length + files.length;

    if (totalImages > 4) {
      alert("You can only have up to 4 images in total");
      return;
    }

    setImages([...images, ...files]);
  };

  const removeExistingImage = (index) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // Drag and drop handlers for existing images
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      return;
    }

    const newImages = [...existingImages];
    const draggedImage = newImages[draggedIndex];

    // Remove from old position
    newImages.splice(draggedIndex, 1);

    // Insert at new position
    newImages.splice(dropIndex, 0, draggedImage);

    setExistingImages(newImages);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Product name is required";
    if (!form.price || form.price <= 0)
      newErrors.price = "Valid price is required";
    if (!form.category.trim()) newErrors.category = "Category is required";
    if (!form.sku.trim()) newErrors.sku = "SKU is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      alert("Please fill in all required fields");
      return;
    }

    setSaving(true);

    try {
      const formData = new FormData();

      // Append form fields with proper type conversion
      formData.append("name", form.name);
      formData.append("price", String(Number(form.price) || 0));
      formData.append("originalPrice", String(Number(form.originalPrice) || 0));
      formData.append("cost", String(Number(form.cost) || 0));
      formData.append("discount", String(Number(form.discount) || 0));
      formData.append("category", form.category);
      formData.append("subcategory", form.subcategory);
      formData.append("stock", String(Number(form.stock) || 0));
      formData.append("brand", form.brand);
      formData.append("description", form.description);
      formData.append("shortDescription", form.shortDescription);
      formData.append("sku", form.sku);

      // Debug logging
      console.log("Form stock value:", form.stock);
      console.log("Converted stock:", Number(form.stock) || 0);
      console.log("Stock being sent:", String(Number(form.stock) || 0));

      // Append specifications as JSON
      const specifications = {
        material: form.material,
        metalType: form.metalType,
        gemstone: form.gemstone,
        dimensions: form.dimensions,
        careInstructions: form.careInstructions,
        warranty: form.warranty,
      };
      formData.append("specifications", JSON.stringify(specifications));

      // Append boolean flags
      formData.append("isNewArrival", form.isNewArrival);
      formData.append("isBestSeller", form.isBestSeller);
      formData.append("isFeatured", form.isFeatured);
      formData.append("isGiftable", form.isGiftable);
      formData.append("isOnSale", form.isOnSale);
      formData.append("ringCumBangles", form.ringCumBangles);
      formData.append("men", form.men);
      formData.append("women", form.women);
      formData.append("kids", form.kids);

      // Append existing images as a JSON string
      formData.append("existingImages", JSON.stringify(existingImages));

      // Append new image files
      images.forEach((image) => {
        formData.append("images", image);
      });

      const res = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update product");
      }

      alert("Product updated successfully!");
      router.push("/dashboard/view-products");
    } catch (error) {
      console.error("Error updating product:", error);
      alert(error.message || "Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 mx-auto mb-4"
            style={{
              border: "3px solid var(--shopify-border)",
              borderTopColor: "var(--shopify-action-primary)",
            }}
          ></div>
          <p
            className="font-medium"
            style={{ color: "var(--shopify-text-secondary)" }}
          >
            Loading product...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-semibold"
            style={{ color: "var(--shopify-text-primary)" }}
          >
            Edit Product
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: "var(--shopify-text-secondary)" }}
          >
            Update product information
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard/view-products")}
          className="px-4 py-2 rounded-lg font-medium text-sm transition-colors border"
          style={{
            backgroundColor: "var(--shopify-surface)",
            borderColor: "var(--shopify-border)",
            color: "var(--shopify-text-primary)",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor =
              "var(--shopify-surface-hover)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "var(--shopify-surface)")
          }
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Product Information */}
        <div
          className="rounded-lg border p-6"
          style={{
            backgroundColor: "var(--shopify-surface)",
            borderColor: "var(--shopify-border)",
          }}
        >
          <h2
            className="text-lg font-semibold mb-4"
            style={{ color: "var(--shopify-text-primary)" }}
          >
            Product Information
          </h2>
          <div className="space-y-4">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--shopify-text-primary)" }}
              >
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border text-sm transition-colors"
                style={{
                  backgroundColor: "var(--shopify-surface)",
                  borderColor: errors.name
                    ? "var(--shopify-action-critical)"
                    : "var(--shopify-border)",
                  color: "var(--shopify-text-primary)",
                }}
                onFocus={(e) =>
                  !errors.name &&
                  (e.currentTarget.style.borderColor =
                    "var(--shopify-action-interactive)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "var(--shopify-border)")
                }
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--shopify-text-primary)" }}
                >
                  SKU *
                </label>
                <input
                  type="text"
                  name="sku"
                  value={form.sku}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border text-sm transition-colors"
                  style={{
                    backgroundColor: "var(--shopify-surface)",
                    borderColor: errors.sku
                      ? "var(--shopify-action-critical)"
                      : "var(--shopify-border)",
                    color: "var(--shopify-text-primary)",
                  }}
                  onFocus={(e) =>
                    !errors.sku &&
                    (e.currentTarget.style.borderColor =
                      "var(--shopify-action-interactive)")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor =
                      "var(--shopify-border)")
                  }
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

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--shopify-text-primary)" }}
                >
                  Brand
                </label>
                <input
                  type="text"
                  name="brand"
                  value={form.brand}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border text-sm transition-colors"
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
                    (e.currentTarget.style.borderColor =
                      "var(--shopify-border)")
                  }
                />
              </div>
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--shopify-text-primary)" }}
              >
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 rounded-lg border text-sm transition-colors resize-none"
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
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--shopify-text-primary)" }}
              >
                Short Description
              </label>
              <textarea
                name="shortDescription"
                value={form.shortDescription}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 rounded-lg border text-sm transition-colors resize-none"
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
            </div>
          </div>
        </div>

        {/* Media */}
        <div
          className="rounded-lg border p-6"
          style={{
            backgroundColor: "var(--shopify-surface)",
            borderColor: "var(--shopify-border)",
          }}
        >
          <h2
            className="text-lg font-semibold mb-4"
            style={{ color: "var(--shopify-text-primary)" }}
          >
            Media
          </h2>

          {/* Existing Images with Drag & Drop */}
          {existingImages.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--shopify-text-primary)" }}
                >
                  Current Images
                </p>
                <p
                  className="text-xs"
                  style={{ color: "var(--shopify-text-secondary)" }}
                >
                  Drag to reorder
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {existingImages.map((imageUrl, index) => (
                  <div
                    key={index}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className="relative group cursor-move"
                    style={{
                      opacity: draggedIndex === index ? 0.5 : 1,
                    }}
                  >
                    <div className="relative">
                      <img
                        src={imageUrl}
                        alt={`Product ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border"
                        style={{ borderColor: "var(--shopify-border)" }}
                      />
                      {/* Image number badge */}
                      <div
                        className="absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold"
                        style={{
                          backgroundColor: "var(--shopify-action-primary)",
                          color: "white",
                        }}
                      >
                        {index + 1}
                      </div>
                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{
                          backgroundColor: "var(--shopify-action-critical)",
                          color: "white",
                        }}
                        title="Remove image"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                      {/* Drag handle indicator */}
                      <div
                        className="absolute bottom-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{
                          color: "var(--shopify-text-primary)",
                          backgroundColor: "rgba(255, 255, 255, 0.9)",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          fontSize: "10px",
                        }}
                      >
                        ⇅ Drag
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Images */}
          {images.length > 0 && (
            <div className="mb-4">
              <p
                className="text-sm font-medium mb-2"
                style={{ color: "var(--shopify-text-primary)" }}
              >
                New Images to Upload
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`New ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border"
                      style={{ borderColor: "var(--shopify-border)" }}
                    />
                    {/* New badge */}
                    <div
                      className="absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-semibold"
                      style={{
                        backgroundColor: "var(--shopify-action-primary)",
                        color: "white",
                      }}
                    >
                      NEW
                    </div>
                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{
                        backgroundColor: "var(--shopify-action-critical)",
                        color: "white",
                      }}
                      title="Remove image"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Button */}
          <div>
            {existingImages.length + images.length < 4 ? (
              <label
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors"
                style={{
                  borderColor: "var(--shopify-border)",
                  backgroundColor: "var(--shopify-bg-primary)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor =
                    "var(--shopify-action-interactive)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor = "var(--shopify-border)")
                }
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className="w-8 h-8 mb-3"
                    style={{ color: "var(--shopify-text-secondary)" }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p
                    className="mb-2 text-sm"
                    style={{ color: "var(--shopify-text-primary)" }}
                  >
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "var(--shopify-text-secondary)" }}
                  >
                    PNG, JPG up to 10MB ({existingImages.length + images.length}
                    /4 images)
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                />
              </label>
            ) : (
              <div
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg"
                style={{
                  borderColor: "var(--shopify-border)",
                  backgroundColor: "var(--shopify-bg-primary)",
                }}
              >
                <svg
                  className="w-8 h-8 mb-2"
                  style={{ color: "var(--shopify-text-secondary)" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p
                  className="text-sm"
                  style={{ color: "var(--shopify-text-secondary)" }}
                >
                  Maximum 4 images reached
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Organization */}
        <div
          className="rounded-lg border p-6"
          style={{
            backgroundColor: "var(--shopify-surface)",
            borderColor: "var(--shopify-border)",
          }}
        >
          <h2
            className="text-lg font-semibold mb-4"
            style={{ color: "var(--shopify-text-primary)" }}
          >
            Organization
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--shopify-text-primary)" }}
              >
                Category *
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border text-sm transition-colors"
                style={{
                  backgroundColor: "var(--shopify-surface)",
                  borderColor: errors.category
                    ? "var(--shopify-action-critical)"
                    : "var(--shopify-border)",
                  color: "var(--shopify-text-primary)",
                }}
                onFocus={(e) =>
                  !errors.category &&
                  (e.currentTarget.style.borderColor =
                    "var(--shopify-action-interactive)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "var(--shopify-border)")
                }
              >
                <option value="">Select Category</option>
                <option value="rings">Rings</option>
                <option value="necklaces">Necklaces</option>
                <option value="bracelets">Bracelets</option>
                <option value="earrings">Earrings</option>
                <option value="ring-cum-bangles">Ring-cum-Bangle</option>
                <option value="fine-silver">Fine Silver</option>
                <option value="fine-gold">Fine Gold</option>
                <option value="mens">Mens</option>
                <option value="gifts">Gifts</option>
                <option value="new-arrivals">New Arrivals</option>
                <option value="best-sellers">Best Sellers</option>
                <option value="collections">Collections</option>
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

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--shopify-text-primary)" }}
              >
                Subcategory
              </label>
              <input
                type="text"
                name="subcategory"
                value={form.subcategory}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border text-sm transition-colors"
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
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div
          className="rounded-lg border p-6"
          style={{
            backgroundColor: "var(--shopify-surface)",
            borderColor: "var(--shopify-border)",
          }}
        >
          <h2
            className="text-lg font-semibold mb-4"
            style={{ color: "var(--shopify-text-primary)" }}
          >
            Pricing
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--shopify-text-primary)" }}
              >
                Price *
              </label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border text-sm transition-colors"
                style={{
                  backgroundColor: "var(--shopify-surface)",
                  borderColor: errors.price
                    ? "var(--shopify-action-critical)"
                    : "var(--shopify-border)",
                  color: "var(--shopify-text-primary)",
                }}
                onFocus={(e) =>
                  !errors.price &&
                  (e.currentTarget.style.borderColor =
                    "var(--shopify-action-interactive)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "var(--shopify-border)")
                }
              />
              {errors.price && (
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--shopify-action-critical)" }}
                >
                  {errors.price}
                </p>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--shopify-text-primary)" }}
              >
                Original Price
              </label>
              <input
                type="number"
                name="originalPrice"
                value={form.originalPrice}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border text-sm transition-colors"
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
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--shopify-text-primary)" }}
              >
                Cost
              </label>
              <input
                type="number"
                name="cost"
                value={form.cost}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border text-sm transition-colors"
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
            </div>
          </div>
        </div>

        {/* Inventory */}
        <div
          className="rounded-lg border p-6"
          style={{
            backgroundColor: "var(--shopify-surface)",
            borderColor: "var(--shopify-border)",
          }}
        >
          <h2
            className="text-lg font-semibold mb-4"
            style={{ color: "var(--shopify-text-primary)" }}
          >
            Inventory
          </h2>
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--shopify-text-primary)" }}
            >
              Stock Quantity
            </label>
            <input
              type="number"
              name="stock"
              value={form.stock}
              onChange={handleChange}
              min="0"
              step="1"
              className="w-full px-3 py-2 rounded-lg border text-sm transition-colors"
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
          </div>
        </div>

        {/* Jewelry Specifications */}
        <div
          className="rounded-lg border p-6"
          style={{
            backgroundColor: "var(--shopify-surface)",
            borderColor: "var(--shopify-border)",
          }}
        >
          <h2
            className="text-lg font-semibold mb-4"
            style={{ color: "var(--shopify-text-primary)" }}
          >
            Jewelry Specifications
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--shopify-text-primary)" }}
              >
                Material
              </label>
              <input
                type="text"
                name="material"
                value={form.material}
                onChange={handleChange}
                placeholder="e.g., Sterling Silver, Gold"
                className="w-full px-3 py-2 rounded-lg border text-sm transition-colors"
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
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--shopify-text-primary)" }}
              >
                Metal Type
              </label>
              <input
                type="text"
                name="metalType"
                value={form.metalType}
                onChange={handleChange}
                placeholder="e.g., 925 Silver, 18K Gold"
                className="w-full px-3 py-2 rounded-lg border text-sm transition-colors"
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
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--shopify-text-primary)" }}
              >
                Gemstone
              </label>
              <input
                type="text"
                name="gemstone"
                value={form.gemstone}
                onChange={handleChange}
                placeholder="e.g., Diamond, Ruby, Sapphire"
                className="w-full px-3 py-2 rounded-lg border text-sm transition-colors"
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
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--shopify-text-primary)" }}
              >
                Dimensions
              </label>
              <input
                type="text"
                name="dimensions"
                value={form.dimensions}
                onChange={handleChange}
                placeholder="e.g., 2cm x 1cm"
                className="w-full px-3 py-2 rounded-lg border text-sm transition-colors"
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
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--shopify-text-primary)" }}
              >
                Care Instructions
              </label>
              <input
                type="text"
                name="careInstructions"
                value={form.careInstructions}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border text-sm transition-colors"
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
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--shopify-text-primary)" }}
              >
                Warranty
              </label>
              <input
                type="text"
                name="warranty"
                value={form.warranty}
                onChange={handleChange}
                placeholder="e.g., 1 year warranty"
                className="w-full px-3 py-2 rounded-lg border text-sm transition-colors"
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
            </div>
          </div>
        </div>

        {/* Product Flags */}
        <div
          className="rounded-lg border p-6"
          style={{
            backgroundColor: "var(--shopify-surface)",
            borderColor: "var(--shopify-border)",
          }}
        >
          <h2
            className="text-lg font-semibold mb-4"
            style={{ color: "var(--shopify-text-primary)" }}
          >
            Product Flags
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { name: "isNewArrival", label: "New Arrival" },
              { name: "isBestSeller", label: "Best Seller" },
              { name: "isFeatured", label: "Featured" },
              { name: "isGiftable", label: "Giftable" },
              { name: "isOnSale", label: "On Sale" },
              { name: "ringCumBangles", label: "Ring cum Bangles" },
            ].map((flag) => (
              <label
                key={flag.name}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  name={flag.name}
                  checked={form[flag.name]}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border"
                  style={{
                    accentColor: "var(--shopify-action-primary)",
                  }}
                />
                <span
                  className="text-sm"
                  style={{ color: "var(--shopify-text-primary)" }}
                >
                  {flag.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Target Audience */}
        <div
          className="rounded-lg border p-6"
          style={{
            backgroundColor: "var(--shopify-surface)",
            borderColor: "var(--shopify-border)",
          }}
        >
          <h2
            className="text-lg font-semibold mb-4"
            style={{ color: "var(--shopify-text-primary)" }}
          >
            Target Audience
          </h2>
          <div className="flex gap-6">
            {[
              { name: "men", label: "Men" },
              { name: "women", label: "Women" },
              { name: "kids", label: "Kids" },
            ].map((audience) => (
              <label
                key={audience.name}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  name={audience.name}
                  checked={form[audience.name]}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border"
                  style={{
                    accentColor: "var(--shopify-action-primary)",
                  }}
                />
                <span
                  className="text-sm"
                  style={{ color: "var(--shopify-text-primary)" }}
                >
                  {audience.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push("/dashboard/view-products")}
            className="px-6 py-2.5 rounded-lg font-medium text-sm transition-colors border"
            style={{
              backgroundColor: "var(--shopify-surface)",
              borderColor: "var(--shopify-border)",
              color: "var(--shopify-text-primary)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                "var(--shopify-surface-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--shopify-surface)")
            }
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-lg font-medium text-sm text-white transition-colors disabled:opacity-50"
            style={{ backgroundColor: "var(--shopify-action-primary)" }}
            onMouseEnter={(e) =>
              !saving &&
              (e.currentTarget.style.backgroundColor =
                "var(--shopify-action-primary-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor =
                "var(--shopify-action-primary)")
            }
          >
            {saving ? "Saving..." : "Save Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
