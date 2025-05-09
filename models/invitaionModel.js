import mongoose from "mongoose";

const statusesSchema = new mongoose.Schema(
  {
    invitiStatus: { type: String },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  }, {
  _id: false, 
  timestamps: true 
});
const invitationSchema = mongoose.Schema(
  {
    invitiName: { type: String, required: true },
    invitiDescription: { type: String },
    invitiImageURL: {type : String},
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user"},  
  
    lastStatus: {
      invitiStatus: { type: String },
      addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" }
    },
    statuses :[statusesSchema],
    group: { type: mongoose.Schema.Types.ObjectId, ref: "group" }
  },
  {
    timestamps: true,
  }
);
const Invitation = mongoose.model("invitation", invitationSchema);
export default Invitation;
