import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    groupName: { type: String, trim: true,required: true },
    isGroupChat: { type: Boolean, default: false },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    latestMessage: { type: mongoose.Schema.Types.ObjectId, ref: "message",},
    latestInvitions: {type: mongoose.Schema.Types.ObjectId, ref: "invitation",},
    groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  },
 {
    timestamps: true,
  }
);

const groupPost = mongoose.model("group", groupSchema);
export default groupPost;
