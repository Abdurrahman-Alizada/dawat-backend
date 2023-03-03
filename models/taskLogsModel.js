import mongoose from "mongoose";

const TaskLogsSchema = mongoose.Schema(
  {
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: "task" },
    logDescription: { type: String, required: true },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    isSystemGenerated: { type: Boolean, default: false},
    identifier: { type: String },
  },
  {
    timestamps: true,
  }
);

const TaskLogs = mongoose.model("taskLogs", TaskLogsSchema);
export default TaskLogs;
