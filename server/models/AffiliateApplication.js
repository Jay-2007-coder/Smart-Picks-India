import mongoose from "mongoose";

const AffiliateApplicationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please fill a valid email address"]
    },
    website: {
      type: String,
      required: [true, "Website or social link is required"],
      trim: true
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    appliedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

const AffiliateApplication = mongoose.models.AffiliateApplication || mongoose.model("AffiliateApplication", AffiliateApplicationSchema);
export default AffiliateApplication;
