import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import Chat from "../models/groupModel.js";
import Task from "../models/taskModal.js";
import TaskLogs from "../models/taskLogsModel.js";

//@description     Get all logs of a specific task
//@route           GET /api/group/task/logs
//@access          Protected

const allLogsForTask = asyncHandler(async (req, res) => {
  try {
    const taskLogs = await TaskLogs.find({
      taskId: req.params.taskId,
    }).populate("addedBy", "name imageURL isAdmin");
    res.json(taskLogs);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

export { allLogsForTask };
