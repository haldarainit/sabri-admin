import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  originalPrice: {
    type: Number,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  size: String,
  color: String,
  category: String,
  image: String,
});

const shippingAddressSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  addressLine1: {
    type: String,
    required: true,
  },
  addressLine2: String,
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  zipCode: {
    type: String,
    required: true,
  },
  shippingInfo: {
    state: String,
    finalCharge: Number,
  },
});

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],
    shippingAddress: shippingAddressSchema,
    paymentMethod: {
      type: String,
      enum: ["cash_on_delivery", "online_payment"],
      required: true,
    },
    orderSummary: {
      subtotal: {
        type: Number,
        required: true,
      },
      couponDiscount: {
        type: Number,
        default: 0,
      },
      couponCode: String,
      tax: {
        type: Number,
        required: true,
      },
      shippingCharge: {
        type: Number,
        required: true,
      },
      total: {
        type: Number,
        required: true,
      },
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
    orderDate: {
      type: Date,
      default: Date.now,
    },
    estimatedDelivery: {
      type: Date,
      default: function () {
        const delivery = new Date();
        delivery.setDate(delivery.getDate() + 7);
        return delivery;
      },
    },
    notes: String,
    invoice: {
      invoiceId: {
        type: String,
        default: null,
      },
      generatedDate: Date,
      dueDate: Date,
      paymentStatus: {
        type: String,
        enum: ["pending", "paid", "overdue", "cancelled"],
        default: "pending",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
orderSchema.index({ orderId: 1 });
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ "shippingAddress.email": 1 });
orderSchema.index({ createdAt: -1 });

export default mongoose.models.Order || mongoose.model("Order", orderSchema);
