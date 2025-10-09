import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: [true, "Quantity is required"],
    min: [1, "Quantity must be at least 1"],
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
    min: [0, "Price cannot be negative"],
  },
  total: {
    type: Number,
    required: true,
  },
});

const shippingAddressSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Shipping name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    lowercase: true,
  },
  phone: {
    type: String,
    required: [true, "Phone number is required"],
    trim: true,
  },
  address: {
    type: String,
    required: [true, "Address is required"],
    trim: true,
  },
  city: {
    type: String,
    required: [true, "City is required"],
    trim: true,
  },
  state: {
    type: String,
    required: [true, "State is required"],
    trim: true,
  },
  pincode: {
    type: String,
    required: [true, "Pincode is required"],
    trim: true,
  },
  country: {
    type: String,
    default: "India",
    trim: true,
  },
});

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    items: [orderItemSchema],
    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },
    orderSummary: {
      subtotal: {
        type: Number,
        required: true,
        min: [0, "Subtotal cannot be negative"],
      },
      shipping: {
        type: Number,
        default: 0,
        min: [0, "Shipping cost cannot be negative"],
      },
      tax: {
        type: Number,
        default: 0,
        min: [0, "Tax cannot be negative"],
      },
      discount: {
        type: Number,
        default: 0,
        min: [0, "Discount cannot be negative"],
      },
      total: {
        type: Number,
        required: true,
        min: [0, "Total cannot be negative"],
      },
    },
    payment: {
      method: {
        type: String,
        enum: ["cod", "online", "card", "upi"],
        required: true,
      },
      status: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending",
      },
      transactionId: String,
      paidAt: Date,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
    tracking: {
      carrier: String,
      trackingNumber: String,
      trackingUrl: String,
      shippedAt: Date,
      deliveredAt: Date,
    },
    notes: {
      customer: String,
      admin: String,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
orderSchema.index({ orderId: 1 });
orderSchema.index({ customer: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ "shippingAddress.email": 1 });
orderSchema.index({ createdAt: -1 });

// Pre-save middleware to generate order ID
orderSchema.pre("save", async function (next) {
  if (!this.orderId) {
    const count = await mongoose.model("Order").countDocuments();
    this.orderId = `SABRI${String(count + 1).padStart(6, "0")}`;
  }
  next();
});

export default mongoose.models.Order || mongoose.model("Order", orderSchema);
