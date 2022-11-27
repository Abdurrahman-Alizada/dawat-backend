import mongoose from "mongoose";

const invitationSchema = mongoose.Schema(
  {
    invitiName: { type: String, required: true },
    invitiDescription: { type: String, required: true },
    invitiImageURL: {type : String},
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user"},  
  
    lastStatus: {
      invitiStatus: { type: String },
      addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" }
    },

    statuses : [{
      invitiStatus: { type: String },
      addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" }
    }],
    group: { type: mongoose.Schema.Types.ObjectId, ref: "group" }
  },
  {
    timestamps: true,
  }
);
const Invitation = mongoose.model("invitation", invitationSchema);
export default Invitation;
