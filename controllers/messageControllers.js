import asyncHandler from "express-async-handler";
import Message from "../models/messageModel.js";
import User from "../models/userModel.js";
import Group from "../models/groupModel.js";

//@description     Get all Messages
//@route           GET /api/group/message/:groupId
//@access          Protected
const allMessages = asyncHandler(async (req, res) => {
  try {
    let messages = await Message.find({ group: req.params.groupId })
      .populate("addedBy", "name imageURL")
      .sort({ _id: -1 });
    // .populate("group")

    // messages =  await User.populate(messages, {
    //     path: "group.users",
    //     select: "name imageURL",
    //   });

    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//@description     Create New Message
//@route           POST /api/group/message
//@access          Protected
const sendMessage = asyncHandler(async (req, res) => {
  const { content, groupId } = req.body;
  if (!content || !groupId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  var newMessage = {
    addedBy: req.user._id,
    content: content,
    group: groupId,
  };

  try {
    var message = await Message.create(newMessage);

    message = await message.populate("addedBy", "name email imageURL");
    message = await message.populate("group");
    message = await User.populate(message, {
      path: "group.users",
      select: "name email imageURL",
    });

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const deleteMessages = asyncHandler(async (req, res) => {
  const { groupId, userId, messages } = req.body;

  try {
    // let foundedUsers;

    if (!messages?.length || !groupId || !userId) {
      console.log("Invalid data passed into request");
      return res.sendStatus(400);
    } 

    let i;
    for (i = 0; i < messages.length; i++) {
      if(messages[i]?.addedBy?._id == req.user?._id){
         await Message.findByIdAndDelete(messages[i]._id);
      }else{
        await Message.findByIdAndUpdate(
          messages[i],
          {
            $push: { messageDeletedFor: req.user?._id },
          },
          {
            new: true,
          }
        );
      }
    }

    res.json("message(s) deleted succesfully");
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

export { allMessages, sendMessage, deleteMessages };
