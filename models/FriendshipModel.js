import mongoose from "mongoose";

const friendsSchema = new mongoose.Schema(
  {
    requestor: { type: mongoose.Schema.Types.ObjectId, ref: "user" }, // Requestor
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "user" }, // reciever
    status: {
      type: Number,
      enums: [
        0, //'add friend',
        1, //'requested',
        2, //'pending',
        3, //'friends'
      ],
    },
  },
  {
    timestamps: true,
  }
);
const Friends = mongoose.model("Friends", friendsSchema);
export default Friends;
