import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import Chat from "../models/groupModel.js";
import Task from '../models/taskModal.js';
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
  const { taskName, taskDescription, groupId, responsibles, startingDate, dueDate, statuses, lastStatus, taskImageURL,priority } = req.body;
 
  if (!taskName || !groupId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }
  
  statuses.push({taskStatus :lastStatus, addedBy:"6332ac008afac5a474cd744d" /*addedBy:req.user._id */})
  
  let responsibleUsers = [];
  for(let i=0; i<responsibles.length; i++){
    responsibleUsers.push({responsible : responsibles[i], addedBy: "6332ac008afac5a474cd744d" /*addedBy:req.user._id */})
  }

  var newTask = {
    taskName: taskName,
    taskDescription : taskDescription,
    // addedBy: req.user._id,
    addedBy:"6332ac008afac5a474cd744d",
    group: groupId,
    responsibles: responsibleUsers,
    startingDate: startingDate,
    dueDate:dueDate,
    statuses:statuses,
    lastStatus : {taskStatus: lastStatus, addedBy:"6332ac008afac5a474cd744d" /*addedBy:req.user._id */},
    taskImageURL:taskImageURL,
    priority : { priority: priority, addedBy:"6332ac008afac5a474cd744d" /*addedBy:req.user._id */ }
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
  const { taskId, taskName,taskDescription, responsibles, startingDate, dueDate, lastStatus, taskImageURL } = req.body;
  
  if(responsibles?.length > 0){
     for(let i=0; i<responsibles.length; i++){
      let conditions = {
          _id: taskId,
          'responsibles.responsible': { $ne: responsibles[i] }
      };

      let update = {
          $addToSet: { responsibles: { responsible: responsibles[i], addedBy:"6332ac008afac5a474cd744d" /*addedBy:req.user._id */ } }
      }
      
      Task.findOneAndUpdate(conditions, update, async function (err, doc) {
        if (doc) {
          console.log("hello if",doc);
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
          // Task.findOneAndUpdate(conditions, remove)
        }
      });
    }         
  }


  const updatedTask = await Task.findByIdAndUpdate(
    taskId,
    {
      taskName: taskName,
      taskDescription:taskDescription,
      // responsibles: responsibles,
      startingDate: startingDate,
      dueDate:dueDate,
      lastStatus : {invitiStatus: lastStatus, addedBy:"6332ac008afac5a474cd744d" /*addedBy:req.user._id */},
      taskImageURL:taskImageURL,
      $push: { statuses: {taskStatus: lastStatus, addedBy:"6332ac008afac5a474cd744d" /*addedBy:req.user._id */} }
    
    },
    {
      new: true,
    }
  )
  if (!updatedTask) {
    res.status(404);
    throw new Error("task Not Found");
  } else {
    res.json(updatedTask);
  }
});


export { allTasks, createTask, updateTask, deleteTask };
