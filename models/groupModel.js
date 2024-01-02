import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    groupName: { type: String, trim: true,required: true },
    groupDescription: { type: String, trim: true },
    imageURL:{type:String},
    isChat: { type: Boolean, default: true },
    isTasks: { type: Boolean, default: true },
    isInvitations: { type: Boolean, default: true },
    isMute: { type: Boolean, default: false },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    latestMessage: { type: mongoose.Schema.Types.ObjectId, ref: "message",},
    latestInvitions: {type: mongoose.Schema.Types.ObjectId, ref: "invitation",},
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    groupAdmins: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    time: { type: Date, default: Date.now },
  },
  
 {
    timestamps: true,
  }
);

const groupPost = mongoose.model("group", groupSchema);
export default groupPost;
