import mongoose from "mongoose";

const OtpSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    codeHash: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      enum: ["register", "login", "verify"],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    resendCooldownUntil: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// TTL index to automatically purge expired OTP records
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Composite index to look up by phone + purpose
OtpSchema.index({ phone: 1, purpose: 1 });

const Otp = mongoose.model("Otp", OtpSchema);
export default Otp;
