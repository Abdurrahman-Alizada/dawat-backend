import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import Chat from "../models/groupModel.js";
import Invitation from "../models/invitaionModel.js";
import Task from '../models/taskModal.js';
//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected

const allTasks = asyncHandler(async (req, res) => {
  try {
    const messages = await Task.find({ group: req.params.groupId })
      .populate("addedBy", "name pic email")
      .populate("group");
    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//@description     Create New Message
//@route           POST /api/Message/
//@access          Protected
const createTask = asyncHandler(async (req, res) => {
  const { taskName, taskDescription, groupId } = req.body;

  if (!taskName || !groupId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  var newTask = {
    taskName: taskName,
    taskDescription : taskDescription,
    addedBy: req.user._id,
    group: groupId,
  };

  try {
    let task = await Task.create(newTask);

    task = await task.populate("addedBy", "name pic");
    task = await task.populate("group");
    task = await User.populate(task, {
      path: "group.users",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(req.body.groupId, { latestTasks: task });

    res.json(task);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

export { allTasks, createTask };
