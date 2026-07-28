import mongoose from "mongoose";

const deploymentSchema = new mongoose.Schema(
  {
    website: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Website",
      required: [true, "Deployment must belong to a website"],
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "deployed", "failed"],
        message: "Status must be: pending, deployed, or failed",
      },
      default: "pending",
    },
    zipPath: {
      type: String,
      required: [true, "Zip path reference is required"],
    },
    extractedPath: {
      type: String,
    },
    version: {
      type: Number,
      required: true,
      default: 1,
    },
    errorLog: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Deployment = mongoose.model("Deployment", deploymentSchema);
export default Deployment;
