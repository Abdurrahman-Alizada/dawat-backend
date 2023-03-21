import mongoose from "mongoose";

const GroupLogsSchema = mongoose.Schema(
  {
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "task" },
    logDescription: { type: String, required: true },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    isSystemGenerated: { type: Boolean, default: false },
    identifier: { type: String },  // list is in the end
  },
  {
    timestamps: true,
  }
);

const GroupLogs = mongoose.model("groupLogs", GroupLogsSchema);
export default GroupLogs;


// task-created, 
// group-created, 
// task-deleted, 
// group-name-update,
// group-image-update, 
// group-description-update
