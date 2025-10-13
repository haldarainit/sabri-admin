import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Coupon name is required"],
      trim: true,
      maxlength: [100, "Coupon name cannot exceed 100 characters"],
    },
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: [20, "Coupon code cannot exceed 20 characters"],
    },
    type: {
      type: String,
      enum: ["flat", "percentage"],
      required: [true, "Coupon type is required"],
    },
    amount: {
      type: Number,
      required: [true, "Coupon amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    minValue: {
      type: Number,
      required: [true, "Minimum value is required"],
      min: [0, "Minimum value cannot be negative"],
    },
    maxValue: {
      type: Number,
      required: [true, "Maximum value is required"],
      min: [0, "Maximum value cannot be negative"],
    },
    usageLimit: {
      type: Number,
      required: [true, "Usage limit is required"],
      min: [1, "Usage limit must be at least 1"],
    },
    usedCount: {
      type: Number,
      default: 0,
      min: [0, "Used count cannot be negative"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    startDate: {
      type: Date,
      required: false,
    },
    expiryDate: {
      type: Date,
      required: false,
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

// Virtual for remaining uses
couponSchema.virtual("remainingUses").get(function () {
  return this.usageLimit - this.usedCount;
});

// Index for better query performance
couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1 });
couponSchema.index({ startDate: 1 });
couponSchema.index({ expiryDate: 1 });
couponSchema.index({ createdAt: -1 });

// Pre-save middleware to validate dates
couponSchema.pre("save", function (next) {
  if (this.startDate && this.expiryDate && this.startDate >= this.expiryDate) {
    return next(new Error("Start date must be before expiry date"));
  }
  if (this.minValue >= this.maxValue) {
    return next(new Error("Maximum value must be greater than minimum value"));
  }
  next();
});

export default mongoose.models.Coupon || mongoose.model("Coupon", couponSchema);
