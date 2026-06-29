import mongoose from "mongoose";

const CustomSkillTreeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    roleName: {
      type: String,
      required: [true, "Role name is required"],
      trim: true,
    },
    nodes: [
      {
        id: { type: String, required: true },
        label: { type: String, required: true },
        tier: {
          type: String,
          enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
          default: "Beginner",
        },
        description: { type: String, default: "" },
        resources: { type: [String], default: [] },
        status: {
          type: String,
          enum: ["locked", "unlocked", "completed"],
          default: "locked",
        },
        quiz: {
          question: { type: String, required: true },
          options: { type: [String], required: true },
          answerIndex: { type: Number, required: true },
          explanation: { type: String, default: "" },
        },
        x: { type: Number, required: true },
        y: { type: Number, required: true },
      },
    ],
    edges: [
      {
        id: { type: String, required: true },
        source: { type: String, required: true },
        target: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

const CustomSkillTree = mongoose.models.CustomSkillTree || mongoose.model("CustomSkillTree", CustomSkillTreeSchema);
export default CustomSkillTree;
