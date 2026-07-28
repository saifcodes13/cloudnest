import mongoose from "mongoose";

const websiteSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Website name is required"],
      unique: true,
      lowercase: true,
      trim: true,
      minlength: [3, "Website name must be at least 3 characters long"],
      maxlength: [63, "Website name cannot exceed 63 characters"],
      match: [
        /^[a-z0-9-]+$/,
        "Website name can only contain lowercase letters, numbers, and dashes",
      ],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Website owner is required"],
    },
    activeDeployment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Deployment",
    },
  },
  {
    timestamps: true,
  }
);

export const Website = mongoose.model("Website", websiteSchema);
export default Website;
