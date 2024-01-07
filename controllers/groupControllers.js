import asyncHandler from "express-async-handler";
import Chat from "../models/groupModel.js";
import User from "../models/userModel.js";
import GroupLogs from "../models/GroupLogsModel.js";
//@description     Create or fetch One to One Chat
//@route           POST /api/chat/
//@access          Protected
const accessGroup = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("UserId param not sent with request");
    return res.sendStatus(400);
  }

  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  if (isChat.length > 0) {
    res.send(isChat);
  } else {
    var chatData = {
      groupName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).json(FullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});

//@description     Fetch all chats for a user
//@route           GET /api/chat/
//@access          Protected
const fetchGroups = asyncHandler(async (req, res) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("createdBy", "-password")
      .populate("groupAdmins", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name pic email",
        });
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

  var users = req.body.users;

  // if (users.length < 2) {
  //   return res
  //     .status(400)
  //     .send("More than 2 users are required to form a group chat");
  // }

  users.push(req.user);
  try {
    const group = await Chat.create({
      groupName: req.body.groupName,
      groupDescription: req.body.groupDescription,
      imageURL: req.body.imageURL,
      isChat: req.body.isChat,
      isTasks: req.body.isTasks,
      isInvitations: req.body.isInvitations,
      isMute: req.body.isMute,
      users: users,
      createdBy: req.user,
      groupAdmins: [req.user],
      time: req.body.time,
    });
    const newGroup = await Chat.findOne({ _id: group._id })
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
    if(!groups.length){
    return res.json({message:"Nothing to sync"});
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
    let res1 = await Chat.insertMany(readyToAddGroups);
    res.json(res1);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// @desc    Rename Group
// @route   PUT /api/chat/rename
// @access  Protected
const updateGroup = asyncHandler(async (req, res) => {
  const { chatId, groupName, groupDescription, imageURL } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
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
    throw new Error("Chat Not Found");
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

  const updatedGroup = await Chat.findByIdAndUpdate(
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
    throw new Error("Chat Not Found");
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

  const updatedGroup = await Chat.findByIdAndUpdate(
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
    throw new Error("Chat Not Found");
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

  const updatedGroup = await Chat.findByIdAndUpdate(
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
    throw new Error("Chat Not Found");
  } else {
    res.json(updatedGroup);
  }
});

// @desc    Remove user from Group
// @route   PUT /api/chat/groupremove
// @access  Protected
const removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  // check if the requester is admin

  const removed = await Chat.findByIdAndUpdate(
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
    throw new Error("Chat Not Found");
  } else {
    res.json(removed);
  }
});

// @desc    Add user to Group / Leave
// @route   PUT /api/chat/groupadd
// @access  Protected
const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;
  console.log(userId);
  // check if the requester is admin

  const added = await Chat.findByIdAndUpdate(
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
    throw new Error("Chat Not Found");
  } else {
    res.json(added);
  }
});

export {
  accessGroup,
  fetchGroups,
  createGroupChat,
  createMultipleGroups,
  updateGroup,
  updateGroupName,
  updateGroupDescription,
  updateGroupImageURL,
  addToGroup,
  removeFromGroup,
};
