import asyncHandler from "express-async-handler";
import Group from "../models/groupModel.js";
import User from "../models/userModel.js";
import GroupLogs from "../models/GroupLogsModel.js";

//@description     Fetch all groups for a user
//@route           GET /api/group
//@access          Protected
const fetchGroups = asyncHandler(async (req, res) => {
  try {
    Group.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("createdBy", "-password")
      .populate("groupAdmins", "-password")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        res.status(200).send(results);
      });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//@description     Create New Group
//@route           POST /api/group/group
//@access          Protected
const createGroupChat = asyncHandler(async (req, res) => {
  if (!req.body.users || !req.body.groupName) {
    return res.status(400).send({ message: "Please Fill all the feilds" });
  }

  let users = req.body.users;

  users.push(req.user);
  try {
    const group = await Group.create({
      groupName: req.body.groupName,
      groupDescription: req.body.groupDescription,
      imageURL: req.body.imageURL,
      users: users,
      createdBy: req.user,
      groupAdmins: [req.user],
      time: req.body.time,
    });
    const newGroup = await Group.findOne({ _id: group._id })
      .populate("users", "-password")
      .populate("groupAdmins", "-password");

    // generate logs for creating Group
    const newLog = {
      groupId: newGroup?._id,
      logDescription: `created the group '${req.body.groupName}'`,
      addedBy: req.user,
      isSystemGenerated: true,
      identifier: "group-created",
    };
    await GroupLogs.create(newLog);

    res.status(200).json(newGroup);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//@description     Create multiple groups
//@route           POST /api/group/addMultipleGroups
//@access          Protected
const createMultipleGroups = asyncHandler(async (req, res) => {
  const { groups } = req.body;

  try {
    if (!groups.length) {
      return res.json({ message: "Nothing to sync" });
    }
    const readyToAddGroups = groups.map((group) => {
      let newInviti = {
        groupName: group.groupName,
        groupDescription: group.groupDescription,
        users: [req.user],
        createdBy: req.user,
        groupAdmins: [req.user],
        time: new Date(group.time),
      };
      return newInviti;
    });
    let res1 = await Group.insertMany(readyToAddGroups);
    res.json(res1);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// @desc    Rename Group
// @route   PUT /api/group/rename
// @access  Protected
const updateGroup = asyncHandler(async (req, res) => {
  const { chatId, groupName, groupDescription, imageURL } = req.body;

  const updatedChat = await Group.findByIdAndUpdate(
    chatId,
    {
      groupName: groupName,
      groupDescription: groupDescription,
      imageURL: imageURL,
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmins", "-password");

  if (!updatedChat) {
    res.status(404);
    throw new Error("Group Not Found");
  } else {
    res.json(updatedChat);
  }
});

// @desc    update group name
// @route   PUT api/group/:groupId/updateName
// @access  Protected
const updateGroupName = asyncHandler(async (req, res) => {
  const { newGroupName, previousGroupName } = req.body;
  const { groupId } = req.params;

  const updatedGroup = await Group.findByIdAndUpdate(
    groupId,
    {
      groupName: newGroupName,
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmins", "-password");

  // generate logs for updating Group name
  const newLog = {
    groupId: groupId,
    logDescription: `update the group title from '${previousGroupName}' to '${newGroupName}' `,
    addedBy: req.user,
    isSystemGenerated: true,
    identifier: "group-name-update",
  };
  await GroupLogs.create(newLog);

  if (!updatedGroup) {
    res.status(404);
    throw new Error("Group Not Found");
  } else {
    res.json(updatedGroup);
  }
});

// @desc    update group time
// @route   PUT api/group/:groupId/updateTime
// @access  Protected
const updateGroupTime = asyncHandler(async (req, res) => {
  const { newGroupTime, previousGroupTime } = req.body;
  const { groupId } = req.params;

  const updatedGroup = await Group.findByIdAndUpdate(
    groupId,
    {
      time: newGroupTime,
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmins", "-password");

  // generate logs for updating Group name
  const newLog = {
    groupId: groupId,
    logDescription: `update the group time from '${previousGroupTime}' to '${newGroupTime}' `,
    addedBy: req.user,
    isSystemGenerated: true,
    identifier: "group-time-update",
  };
  await GroupLogs.create(newLog);

  if (!updatedGroup) {
    res.status(404);
    throw new Error("group Not Found");
  } else {
    res.json(updatedGroup);
  }
});

// @desc    update group name
// @route   PUT api/group/:groupId/updateDescription
// @access  Protected
const updateGroupDescription = asyncHandler(async (req, res) => {
  const { groupDescription } = req.body;
  const { groupId } = req.params;

  const updatedGroup = await Group.findByIdAndUpdate(
    groupId,
    {
      groupDescription: groupDescription,
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmins", "-password");

  // generate logs for updating Group description
  const newLog = {
    groupId: groupId,
    logDescription: `update the group description to '${groupDescription}' `,
    addedBy: req.user,
    isSystemGenerated: true,
    identifier: "group-description-update",
  };
  await GroupLogs.create(newLog);

  if (!updatedGroup) {
    res.status(404);
    throw new Error("Group Not Found");
  } else {
    res.json(updatedGroup);
  }
});

// @desc    update group name
// @route   PUT api/group/:groupId/updateImageURL
// @access  Protected
const updateGroupImageURL = asyncHandler(async (req, res) => {
  const { imageURL } = req.body;
  const { groupId } = req.params;

  const updatedGroup = await Group.findByIdAndUpdate(
    groupId,
    {
      imageURL: imageURL,
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmins", "-password");

  // generate logs for updating Group profile image
  const newLog = {
    groupId: groupId,
    logDescription: `change the profile image`,
    addedBy: req.user,
    isSystemGenerated: true,
    identifier: "group-image-update",
  };
  await GroupLogs.create(newLog);

  if (!updatedGroup) {
    res.status(404);
    throw new Error("Group Not Found");
  } else {
    res.json(updatedGroup);
  }
});

// @desc    Remove user from Group
// @route   PUT /api/group/groupremove
// @access  Protected
const removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  // check if the requester is admin

  const removed = await Group.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmins", "-password");

  if (!removed) {
    res.status(404);
    throw new Error("Group Not Found");
  } else {
    res.json(removed);
  }
});

// @desc    Add user to Group / Leave
// @route   PUT /api/group/groupadd
// @access  Protected
const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;
  console.log(userId);
  // check if the requester is admin

  const added = await Group.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmins", "-password");

  if (!added) {
    res.status(404);
    throw new Error("Group Not Found");
  } else {
    res.json(added);
  }
});

export {
  fetchGroups,
  createGroupChat,
  createMultipleGroups,
  updateGroup,
  updateGroupName,
  updateGroupTime,
  updateGroupDescription,
  updateGroupImageURL,
  addToGroup,
  removeFromGroup,
};
