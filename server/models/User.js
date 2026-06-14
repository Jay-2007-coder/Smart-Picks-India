import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      sparse: true, // Allows null/missing values to bypass the unique constraint
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: function() {
        // Password is only required if there are no social logins
        return !this.socialAccounts || this.socialAccounts.length === 0;
      },
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    profileImage: {
      type: String,
      default: null,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockoutUntil: {
      type: Date,
      default: null,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    telegramChatId: {
      type: String,
      default: null,
    },
    socialAccounts: [
      {
        provider: {
          type: String,
          enum: ["google", "github", "microsoft"],
          required: true,
        },
        accountId: {
          type: String,
          required: true,
        },
        email: String,
        avatarUrl: String,
      },
    ],
    loginHistory: [
      {
        timestamp: { type: Date, default: Date.now },
        ipAddress: String,
        device: String,
        status: { type: String, enum: ["success", "failed"] },
      },
    ],
    xp: {
      type: Number,
      default: 0,
    },
    hubPlan: {
      type: String,
      enum: ["free", "pro"],
      default: "free",
    },
    hubPlanExpiresAt: {
      type: Date,
      default: null,
    },
    hubUsage: {
      type: Number,
      default: 0,
    },
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    walletBalance: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Method to verify if a user is currently locked out
UserSchema.methods.isLocked = function() {
  return !!(this.lockoutUntil && this.lockoutUntil > Date.now());
};

const User = mongoose.model("User", UserSchema);
export default User;
