import mongoose from "mongoose";

const messageSchema = mongoose.Schema(
  {
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    content: { type: String, trim: true },
    group: { type: mongoose.Schema.Types.ObjectId, ref: "group" },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
  },
  { timestamps: true }
);

const Message = mongoose.model("message", messageSchema);
export default Message;
