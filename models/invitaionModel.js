import mongoose from "mongoose";

const invitationSchema = mongoose.Schema(
  {
    invitationName: { type: String, required: true },
    invitationSubtitle: { type: String, required: true },
    invitationCode : {type:String, required:true},
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },  
    group: { type: mongoose.Schema.Types.ObjectId, ref: "group" }
},
  {
    timestamps: true,
  }
);

const Invitation = mongoose.model("invitation", invitationSchema);
export default Invitation;
