"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddZipCodePage() {
  const router = useRouter();
  const [zipCode, setZipCode] = useState("");
  const [charge, setCharge] = useState("");
  const [priceLessThan, setPriceLessThan] = useState("");
  const [state, setState] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [gstCode, setGstCode] = useState("");

  const handleCreateZipCode = async () => {
    // Comprehensive validation
    const errors = [];

    // Check required fields
    if (!zipCode || zipCode.trim() === "") {
      errors.push("Zip code is required");
    } else if (zipCode.length > 10) {
      errors.push("Zip code cannot exceed 10 characters");
    }

    if (!charge || charge === "") {
      errors.push("Shipping charge is required");
    } else if (isNaN(parseFloat(charge)) || parseFloat(charge) < 0) {
      errors.push("Shipping charge must be a valid positive number");
    }

    if (!priceLessThan || priceLessThan === "") {
      errors.push("Price threshold is required");
    } else if (
      isNaN(parseFloat(priceLessThan)) ||
      parseFloat(priceLessThan) < 0
    ) {
      errors.push("Price threshold must be a valid positive number");
    }

    if (!state || state.trim() === "") {
      errors.push("State is required");
    } else if (state.length > 50) {
      errors.push("State name cannot exceed 50 characters");
    }

    if (!stateCode || stateCode.trim() === "") {
      errors.push("State code is required");
    } else if (stateCode.length > 5) {
      errors.push("State code cannot exceed 5 characters");
    }

    if (!gstCode || gstCode.trim() === "") {
      errors.push("GST code is required");
    } else if (gstCode.length > 10) {
      errors.push("GST code cannot exceed 10 characters");
    }

    // Show validation errors if any
    if (errors.length > 0) {
      alert("Please fix the following errors:\n\n" + errors.join("\n"));
      return;
    }

    try {
      const res = await fetch("/api/admin/shipping/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          zipCode,
          charges: parseFloat(charge),
          priceLessThan: parseFloat(priceLessThan),
          state,
          stateCode,
          gstCode,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        // Handle validation errors specifically
        if (data.errors && Array.isArray(data.errors)) {
          alert("Validation failed:\n\n" + data.errors.join("\n"));
        } else {
          throw new Error(data.message || "Failed to create zip code");
        }
        return;
      }

      alert("Zip Code Created Successfully!");

      // Navigate back to the shipping locations page
      router.push("/dashboard/shipping/locations");
    } catch (error) {
      console.error("Error creating zip code:", error);
      alert(error.message || "Failed to create zip code. Please try again.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-6">
        Add New Zip Code
      </h1>

      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="zipCode"
              className="block text-sm font-semibold text-white mb-2"
            >
              Zip Code
            </label>
            <input
              type="text"
              id="zipCode"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-300"
              placeholder="Enter zip code (max 10 characters)"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value.slice(0, 10))}
              maxLength={10}
            />
          </div>

          <div>
            <label
              htmlFor="charge"
              className="block text-sm font-semibold text-white mb-2"
            >
              Shipping Charge (₹)
            </label>
            <input
              type="number"
              id="charge"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-300"
              placeholder="Enter shipping charge (₹)"
              value={charge}
              onChange={(e) => setCharge(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label
              htmlFor="priceLessThan"
              className="block text-sm font-semibold text-white mb-2"
            >
              Price Less Than (₹)
            </label>
            <input
              type="number"
              id="priceLessThan"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-300"
              placeholder="Enter price threshold (₹)"
              value={priceLessThan}
              onChange={(e) => setPriceLessThan(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label
              htmlFor="state"
              className="block text-sm font-semibold text-white mb-2"
            >
              State
            </label>
            <input
              type="text"
              id="state"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-300"
              placeholder="Enter state name (max 50 characters)"
              value={state}
              onChange={(e) => setState(e.target.value.slice(0, 50))}
              maxLength={50}
            />
          </div>

          <div>
            <label
              htmlFor="stateCode"
              className="block text-sm font-semibold text-white mb-2"
            >
              State Code
            </label>
            <input
              type="text"
              id="stateCode"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-300"
              placeholder="Enter state code (max 5 characters)"
              value={stateCode}
              onChange={(e) =>
                setStateCode(e.target.value.slice(0, 5).toUpperCase())
              }
              maxLength={5}
            />
          </div>

          <div>
            <label
              htmlFor="gstCode"
              className="block text-sm font-semibold text-white mb-2"
            >
              GST Code
            </label>
            <input
              type="text"
              id="gstCode"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-300"
              placeholder="Enter GST code (max 10 characters)"
              value={gstCode}
              onChange={(e) => setGstCode(e.target.value.slice(0, 10))}
              maxLength={10}
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-4">
          <button
            onClick={() => router.push("/dashboard/shipping/locations")}
            className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
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
            Cancel
          </button>
          <button
            onClick={handleCreateZipCode}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Create Zip Code
          </button>
        </div>
      </div>
    </div>
  );
}
