// models/Member.ts
import mongoose, { Schema, model, models } from "mongoose";

export interface IMember {
  clerkId: string;
  displayName: string;
  email: string;
  course?: string;
  year?: string;
  photoURL?: string;
  status: "Approved" | "Pending" | "Unregistered";
  appliedAt?: string;
}

const MemberSchema = new Schema<IMember>(
  {
    clerkId: { type: String, required: true, unique: true, index: true },
    displayName: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    course: { type: String, default: "" },
    year: { type: String, default: "Year 1" },
    photoURL: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Approved", "Pending", "Unregistered"],
      default: "Unregistered",
    },
    appliedAt: { type: String },
  },
  { timestamps: true }
);

export default models.Member || model<IMember>("Member", MemberSchema);
