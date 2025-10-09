import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^[6-9]\d{9}$/, "Please enter a valid 10-digit phone number"],
    },
    addresses: [
      {
        type: {
          type: String,
          enum: ["home", "work", "other"],
          default: "home",
        },
        name: {
          type: String,
          required: true,
          trim: true,
        },
        phone: {
          type: String,
          required: true,
          trim: true,
        },
        address: {
          type: String,
          required: true,
          trim: true,
        },
        city: {
          type: String,
          required: true,
          trim: true,
        },
        state: {
          type: String,
          required: true,
          trim: true,
        },
        pincode: {
          type: String,
          required: true,
          trim: true,
        },
        country: {
          type: String,
          default: "India",
          trim: true,
        },
        isDefault: {
          type: Boolean,
          default: false,
        },
      },
    ],
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer-not-to-say"],
    },
    preferences: {
      categories: [
        {
          type: String,
          enum: [
            "rings",
            "necklaces",
            "earrings",
            "bracelets",
            "fine-gold",
            "fine-silver",
            "mens",
            "gifts",
          ],
        },
      ],
      priceRange: {
        min: { type: Number, min: 0 },
        max: { type: Number, min: 0 },
      },
      newsletter: {
        type: Boolean,
        default: true,
      },
      sms: {
        type: Boolean,
        default: false,
      },
    },
    stats: {
      totalOrders: {
        type: Number,
        default: 0,
      },
      totalSpent: {
        type: Number,
        default: 0,
      },
      lastOrderDate: Date,
      averageOrderValue: {
        type: Number,
        default: 0,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: Date,
    registeredBy: {
      type: String,
      enum: ["website", "admin", "import"],
      default: "website",
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
customerSchema.index({ email: 1 });
customerSchema.index({ phone: 1 });
customerSchema.index({ "stats.totalOrders": -1 });
customerSchema.index({ "stats.totalSpent": -1 });
customerSchema.index({ createdAt: -1 });

// Virtual for customer tier based on spending
customerSchema.virtual("tier").get(function () {
  const totalSpent = this.stats.totalSpent;
  if (totalSpent >= 100000) return "VIP";
  if (totalSpent >= 50000) return "Gold";
  if (totalSpent >= 25000) return "Silver";
  return "Bronze";
});

// Ensure virtual fields are serialized
customerSchema.set("toJSON", { virtuals: true });

export default mongoose.models.Customer ||
  mongoose.model("Customer", customerSchema);
