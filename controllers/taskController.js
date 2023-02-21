import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import Chat from "../models/groupModel.js";
import Task from "../models/taskModal.js";
import TaskLogs from "../models/taskLogsModel.js";

//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected

const allTasks = asyncHandler(async (req, res) => {
  try {
    const messages = await Task.find({ group: req.params.groupId })
      .populate("addedBy", "name pic email")
      .populate("responsibles.responsible", "name pic email")
      .populate("priority.addedBy", "name pic email")
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
  const {
    taskName,
    taskDescription,
    groupId,
    responsibles,
    startingDate,
    dueDate,
    statuses,
    lastStatus,
    taskImageURL,
    priority,
  } = req.body;

  if (!taskName || !groupId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  statuses.push({ taskStatus: lastStatus, addedBy: req.user._id });

  let responsibleUsers = [];
  for (let i = 0; i < responsibles.length; i++) {
    responsibleUsers.push({
      responsible: responsibles[i],
      addedBy: req.user._id,
    });
  }

  var newTask = {
    taskName: taskName,
    taskDescription: taskDescription,
    addedBy: req.user._id,
    group: groupId,
    responsibles: responsibleUsers,
    startingDate: startingDate,
    dueDate: dueDate,
    taskImageURL: taskImageURL,
    priority: { priority: priority, addedBy: req.user._id },
  };

  try {
    let task = await Task.create(newTask);

    task = await task.populate("addedBy", "name pic");
    task = await task.populate("group");
    task = await User.populate(task, {
      path: "group.users",
      select: "name imageURL email",
    });

    await Chat.findByIdAndUpdate(req.body.groupId, { latestTasks: task });

    // generate logs for creating task
    const newLog = {
      taskId: task?._id,
      logDescription: `created the task '${task?.taskName}'`,
      addedBy: task?.addedBy,
      isSystemGenerated: true,
      identifier: "task-created",
    };
    await TaskLogs.create(newLog);

    res.json(task);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// @desc    Delete Inviti
// @route   DELETE api/group/task/delete
// @access  Protected
const deleteTask = asyncHandler(async (req, res) => {
  const { taskId, groupId } = req.body;

  if (!taskId || !groupId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  try {
    const task = await Task.findByIdAndDelete(taskId);
    res.json(task);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// @desc    Rename Inviti
// @route   PUT api/group/task/update
// @access  Protected
const updateTask = asyncHandler(async (req, res) => {
  const {
    taskId,
    taskName,
    taskDescription,
    responsibles,
    startingDate,
    dueDate,
    lastStatus,
    taskImageURL,
  } = req.body;

  if (responsibles?.length > 0) {
    for (let i = 0; i < responsibles.length; i++) {
      let conditions = {
        _id: taskId,
        "responsibles.responsible": { $ne: responsibles[i] },
      };

      let update = {
        $addToSet: {
          responsibles: { responsible: responsibles[i], addedBy: req.user._id },
        },
      };

      Task.findOneAndUpdate(conditions, update, async function (err, doc) {
        if (doc) {
          console.log("hello if", doc);
        } else {
          await Task.findOneAndUpdate(
            { _id: taskId },
            {
              $pull: {
                responsibles: {
                  responsible: responsibles[i],
                },
              },
            },
            { safe: true, multi: false }
          );
        }
      });
    }
  }

  const updatedTask = await Task.findByIdAndUpdate(
    taskId,
    {
      taskName: taskName,
      taskDescription: taskDescription,
      startingDate: startingDate,
      dueDate: dueDate,
      lastStatus: { invitiStatus: lastStatus, addedBy: req.user._id },
      taskImageURL: taskImageURL,
      $push: { statuses: { taskStatus: lastStatus, addedBy: req.user._id } },
    },
    {
      new: true,
    }
  );
  if (!updatedTask) {
    res.status(404);
    throw new Error("task Not Found");
  } else {
    res.json(updatedTask);
  }
});

// @desc    Mark the task as completed or uncompleted
// @route   patch /api/group/tasks/:taskId/markAsCompleted
// @access  Protected
const markAsCompleted = asyncHandler(async (req, res) => {
  const { condition, userId } = req.body;
  const { taskId } = req.params;

  const updatedTask = await Task.findByIdAndUpdate(
    taskId,
    { isCompleted: condition },
    { new: true }
  );
  // generate logs for mark as completed
  const newLog = {
    taskId: taskId,
    logDescription: `mark as completed`,
    addedBy: userId,
    isSystemGenerated: false,
    identifier: condition ? "task-completed" : "task-not-completed",
  };
  await TaskLogs.create(newLog);

  if (!updatedTask) {
    res.status(404);
    throw new Error("task Not Found");
  } else {
    res.json(updatedTask);
  }
});

// @desc    update the task description
// @route   patch /api/group/tasks/:taskId/updateName
// @access  Protected
const updateName = asyncHandler(async (req, res) => {
  const { previousTaskName, newTaskName, userId } = req.body;
  const { taskId } = req.params;

  const updatedTask = await Task.findByIdAndUpdate(
    taskId,
    { taskName: newTaskName },
    { new: true }
  );
  // generate logs for name change
  const newLog = {
    taskId: taskId,
    logDescription: `changed the task title from '${previousTaskName}' to '${newTaskName}'`,
    addedBy: userId,
    isSystemGenerated: false,
    identifier: "task-name-changed",
  };
  await TaskLogs.create(newLog);

  if (!updatedTask) {
    res.status(404);
    throw new Error("task Not Found");
  } else {
    res.json(updatedTask);
  }
});

// @desc    update the task title
// @route   patch /api/group/tasks/:taskId/updateDescription
// @access  Protected
const updateDescription = asyncHandler(async (req, res) => {
  const { taskDescription, userId } = req.body;
  const { taskId } = req.params;

  const updatedTask = await Task.findByIdAndUpdate(
    taskId,
    { taskDescription: taskDescription },
    { new: true }
  );
  // generate logs for name change
  const newLog = {
    taskId: taskId,
    logDescription: `changed the task description`,
    addedBy: userId,
    isSystemGenerated: false,
    identifier: "task-description-changed",
  };
  await TaskLogs.create(newLog);

  if (!updatedTask) {
    res.status(404);
    throw new Error("task Not Found");
  } else {
    res.json(updatedTask);
  }
});

// @desc    update the task starting date
// @route   patch /api/group/tasks/:taskId/updateStartingDates
// @access  Protected
const updateStartingDates = asyncHandler(async (req, res) => {
  const { previousStartingDate, startingDate, userId } = req.body;
  const { taskId } = req.params;

  const updatedTask = await Task.findByIdAndUpdate(
    taskId,
    { startingDate: startingDate },
    { new: true }
  );
  // generate logs for name change

  const newLog = {
    taskId: taskId,
    logDescription: `changed the task staring date ${previousStartingDate} to ${startingDate}`,
    addedBy: userId,
    isSystemGenerated: false,
    identifier: "task-starting-date-changed",
  };
  await TaskLogs.create(newLog);

  if (!updatedTask) {
    res.status(404);
    throw new Error("task Not Found");
  } else {
    res.json(updatedTask);
  }
});

// @desc    update the task due date
// @route   patch /api/group/tasks/:taskId/updateDueDates
// @access  Protected
const updateDueDates = asyncHandler(async (req, res) => {
  const { previousDueDate, dueDate, userId } = req.body;
  const { taskId } = req.params;

  const updatedTask = await Task.findByIdAndUpdate(
    taskId,
    { dueDate: dueDate },
    { new: true }
  );
  // generate logs for name change

  const newLog = {
    taskId: taskId,
    logDescription: `changed the task due date from ${previousDueDate} to ${dueDate}`,
    addedBy: userId,
    isSystemGenerated: false,
    identifier: "task-starting-date-changed",
  };
  await TaskLogs.create(newLog);

  if (!updatedTask) {
    res.status(404);
    throw new Error("task Not Found");
  } else {
    res.json(updatedTask);
  }
});

// @desc    update the task priority
// @route   patch /api/group/tasks/:taskId/updatePriority
// @access  Protected
const updatePriority = asyncHandler(async (req, res) => {
  const { previousPriority, priority, userId } = req.body;
  const { taskId } = req.params;

  const updatedTask = await Task.findByIdAndUpdate(
    taskId,
    { priority: { priority: priority, addedBy: userId } },
    { new: true }
  );
  // generate logs for name change

  const newLog = {
    taskId: taskId,
    logDescription: `changed the priority from '${previousPriority}' to '${priority}'`,
    addedBy: userId,
    isSystemGenerated: false,
    identifier: "task-starting-date-changed",
  };
  await TaskLogs.create(newLog);

  if (!updatedTask) {
    res.status(404);
    throw new Error("task Not Found");
  } else {
    res.json(updatedTask);
  }
});

// @desc    update the responsibles persons for task
// @route   patch /api/group/tasks/:taskId/updateResponsibles
// @access  Protected
const updateResponsibles = asyncHandler(async (req, res) => {
  const { responsibles, userId } = req.body;
  const { taskId } = req.params;

  if (responsibles?.length > 0) {
    for (let i = 0; i < responsibles.length; i++) {
      let conditions = {
        _id: taskId,
        "responsibles.responsible": { $ne: responsibles[i].id },
      };

      let update = {
        $addToSet: {
          responsibles: { responsible: responsibles[i].id, addedBy: req.user._id },
        },
      };

       Task.findOneAndUpdate(conditions, update, async function (err, doc) {
        if (doc) {
          const newLog = {
            taskId: taskId,
            logDescription: `added '${responsibles[i].name}'`,
            addedBy: userId,
            isSystemGenerated: false,
            identifier: "task-responsible-added",
          };
          await TaskLogs.create(newLog);
          
          if(responsibles.length - 1 == i){
            res.send(doc)
          }

        } else {
         const updatedTask = await Task.findOneAndUpdate(
            { _id: taskId },
            {
              $pull: {
                responsibles: {
                  responsible: responsibles[i].id,
                },
              },
            },
            { safe: true, multi: false }
          );
           const newLog = {
            taskId: taskId,
            logDescription: `removed '${responsibles[i].name}'`,
            addedBy: userId,
            isSystemGenerated: false,
            identifier: "task-responsible-removed",
          };
          await TaskLogs.create(newLog);
          if(responsibles.length - 1 == i){
            res.send(updatedTask)
          }
        }
      });
    }
  }

});

export {
  allTasks,
  createTask,
  updateTask,
  deleteTask,
  markAsCompleted,
  updateName,
  updateDescription,
  updateDueDates,
  updateStartingDates,
  updatePriority,
  updateResponsibles,
};
