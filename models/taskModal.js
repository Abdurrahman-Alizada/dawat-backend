import mongoose from "mongoose";

const TaskSchema = mongoose.Schema(
{
    taskName: { type: String, required: true },
    taskDescription: { type: String, required: true },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },  
    group: { type: mongoose.Schema.Types.ObjectId, ref: "group" }
},
  {
    timestamps: true,
  }
);

const Task = mongoose.model("task", TaskSchema);
export default Task;
