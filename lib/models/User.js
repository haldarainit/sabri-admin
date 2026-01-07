import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      // lastName is not strictly required for Firebase/Google users if only a displayName is provided
      required: false,
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: false, // Email is not strictly required, handled by validation
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: false, // Password is not strictly required, handled by validation
      minlength: [6, "Password must be at least 6 characters"],
    },
    phone: {
      type: String,
      required: false, // Phone is not strictly required, handled by validation
      trim: true,
      validate: {
        validator: function (v) {
          // Allow empty phone for OAuth/Firebase users or if firebaseUid is set
          if (
            (this.registeredBy === "google" ||
              this.registeredBy === "firebase" ||
              this.firebaseUid) &&
            !v
          ) {
            return true; // Allow empty phone for these users if not provided
          }
          // For regular users or if phone is provided, validate E.164 format from Firebase
          if (v) {
            // Relaxed validation to allow E.164 format with country code and '+'
            return /^\+[1-9]\d{1,14}$/.test(v);
          }
          return true; // Allow empty if not required and not provided
        },
        message:
          "Please enter a valid phone number (E.164 format, e.g., +91XXXXXXXXXX)",
      },
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    firebaseUid: {
      // New field to store Firebase Phone Auth UID
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    profilePicture: {
      type: String,
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
      enum: ["website", "google", "firebase", "admin", "import"],
      default: "website",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    // Cart functionality
    cartData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // Wishlist functionality
    wishlistData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // FCM token for push notifications
    fcmToken: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ firebaseUid: 1 });
userSchema.index({ "stats.totalOrders": -1 });
userSchema.index({ "stats.totalSpent": -1 });
userSchema.index({ createdAt: -1 });

// Virtual for user tier based on spending
userSchema.virtual("tier").get(function () {
  const totalSpent = this.stats.totalSpent;
  if (totalSpent >= 100000) return "VIP";
  if (totalSpent >= 50000) return "Gold";
  if (totalSpent >= 25000) return "Silver";
  return "Bronze";
});

// Virtual for full name
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.emailVerificationToken;
  delete user.passwordResetToken;
  delete user.emailVerificationExpires;
  delete user.passwordResetExpires;
  return user;
};

// Ensure virtual fields are serialized
userSchema.set("toJSON", { virtuals: true });

export default mongoose.models.User || mongoose.model("User", userSchema);
