import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    groupName: { type: String, required: true },
    totalMembers: { type: Number, required: true },
    // ImageUrl: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  },
  {
    timestamps: true,
  }
);

const groupPost = mongoose.model("group", groupSchema);
export default groupPost;
