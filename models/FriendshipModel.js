import mongoose from "mongoose";

const friendsSchema = new mongoose.Schema(
  {
    requestor: { type: mongoose.Schema.Types.ObjectId, ref: "user" }, // Requestor
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "user" }, // reciever
    status: {
      type: Number,
      enums: [
        0, //'add friend - current login user can send request',
        1, //'requested - current login user request to connect',
        2, //'pending -  other request to current login user to connect',
        3, //'friends - one requested and another accepted'
      ],
    },
  },
  {
    timestamps: true,
  }
);
const Friends = mongoose.model("Friends", friendsSchema);
export default Friends;
