import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    groupName: { type: String, trim: true,required: true },
    groupDescription: { type: String, trim: true },
    imageURL:{type:String},
    time: { type: Date, default: Date.now },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    groupAdmins: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    isUpdated: { type: Boolean, default: false },
    localImageIndex :{type:Number, default:0}
  },
  
 {
    timestamps: true,
  }
);

const groupPost = mongoose.model("group", groupSchema);
export default groupPost;
