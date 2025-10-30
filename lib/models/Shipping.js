import mongoose from "mongoose";

const shippingSchema = new mongoose.Schema(
  {
    zipCode: {
      type: String,
      required: [true, "Zip code is required"],
      trim: true,
      maxlength: [10, "Zip code cannot exceed 10 characters"],
    },
    charges: {
      type: Number,
      required: [true, "Shipping charges are required"],
      min: [0, "Charges cannot be negative"],
    },
    priceLessThan: {
      type: Number,
      required: [true, "Price threshold is required"],
      min: [0, "Price threshold cannot be negative"],
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
      maxlength: [50, "State name cannot exceed 50 characters"],
    },
    stateCode: {
      type: String,
      required: [true, "State code is required"],
      trim: true,
      uppercase: true,
      maxlength: [5, "State code cannot exceed 5 characters"],
    },
    gstCode: {
      type: String,
      required: [true, "GST code is required"],
      trim: true,
      maxlength: [10, "GST code cannot exceed 10 characters"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
shippingSchema.index({ zipCode: 1 });
shippingSchema.index({ state: 1 });
shippingSchema.index({ stateCode: 1 });
shippingSchema.index({ isActive: 1 });
shippingSchema.index({ createdAt: -1 });

// Ensure unique zip code
shippingSchema.index({ zipCode: 1 }, { unique: true });

// Force model refresh to avoid caching issues
if (mongoose.models.Shipping) {
  delete mongoose.models.Shipping;
}

export default mongoose.model("Shipping", shippingSchema);
