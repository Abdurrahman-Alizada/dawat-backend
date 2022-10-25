import asyncHandler from "express-async-handler";
import Message from "../models/messageModel.js";
import User from "../models/userModel.js";
import Chat from "../models/groupModel.js";
import Invitation from "../models/invitaionModel.js";
//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected
const allInvities = asyncHandler(async (req, res) => {
  try {
    const messages = await Invitation.find({ group: req.params.groupId })
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
const createInviti = asyncHandler(async (req, res) => {
  const { invitiName, invitiDescription, groupId } = req.body;

  if (!invitiName || !groupId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  var newInviti = {
    invitiName: invitiName,
    invitiDescription : invitiDescription,
    addedBy: req.user._id,
    group: groupId,
  };

  try {
    let inviti = await Invitation.create(newInviti);

    // inviti = await inviti.populate("sender", "name pic");
    inviti = await inviti.populate("group");
    inviti = await User.populate(inviti, {
      path: "group.users",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(req.body.groupId, { latestInvitions: inviti });

    res.json(inviti);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const deleteInviti = asyncHandler(async (req, res) => {
  const { invitiId, groupId } = req.body;

  if (!invitiId || !groupId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  try {
    const inviti = await Invitation.findByIdAndDelete(invitiId);
    res.json(inviti);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// @desc    Rename Inviti
// @route   PUT api/group/invitations/update
// @access  Protected
const updateInviti = asyncHandler(async (req, res) => {
  const { invitiId, invitiName,invitiDescription } = req.body;

  const updatedInviti = await Invitation.findByIdAndUpdate(
    invitiId,
    {
      invitiName: invitiName,
      invitiDescription:invitiDescription
    },
    {
      new: true,
    }
  )

  
  if (!updatedInviti) {
    res.status(404);
    throw new Error("Inviti Not Found");
  } else {
    res.json(updatedInviti);
  }
});

export { allInvities, createInviti, deleteInviti, updateInviti };
