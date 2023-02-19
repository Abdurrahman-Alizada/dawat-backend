import mongoose from "mongoose";

const statusesSchema = new mongoose.Schema(
  {
    taskStatus: { type: String },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  },
  {
    _id: false,
    timestamps: true,
  }
);

const responsiblesSchema = new mongoose.Schema(
  {
    responsible: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  },
  {
    _id: false,
    timestamps: true,
  }
);

const prioritySchema = new mongoose.Schema(
  {
    priority: { type: String },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  },
  {
    _id: false,
    timestamps: true,
  }
);

const TaskSchema = mongoose.Schema(
  {
    taskName: { type: String, required: true },
    taskDescription: { type: String, required: true },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    group: { type: mongoose.Schema.Types.ObjectId, ref: "group" },
    responsibles: [responsiblesSchema],
    startingDate: { type: Date, default: Date.now },
    dueDate: { type: Date, default: Date.now },
    statuses: [statusesSchema],
    lastStatus: {
      taskStatus: { type: String },
      addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    },
    taskImageURL: { type: String },
    priority: prioritySchema,
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Task = mongoose.model("task", TaskSchema);
export default Task;
