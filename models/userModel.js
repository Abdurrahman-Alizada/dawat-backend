import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index:true },
    password: { type: String, required: true },
    token: { type: String },
    isAdmin: { type: Boolean, default: false, required: true },
    groups: [{ type: mongoose.Schema.Types.ObjectId, ref: "post" }],
  },
  {
    timestamps: true,
  }
);
const User = mongoose.model("user", userSchema);
export default User;
