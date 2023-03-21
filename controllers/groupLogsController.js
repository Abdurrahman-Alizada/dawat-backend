import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import Chat from "../models/groupModel.js";
import GroupLogs from "../models/GroupLogsModel.js";

//@description     Get all logs of a specific group
//@route           GET /api/group/task/logs
//@access          Protected

const allLogsForGroup = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  try {
    const user = await User.findById(req?.user?._id);
    const group = await Chat.findById(groupId);

    const foundedUsers = group?.users?.filter(
      (singleUser) => singleUser.valueOf() === user?._id?.valueOf()
    );

    if (foundedUsers) {
      const groupLogs = await GroupLogs.find({
        groupId: groupId,
      }).populate("addedBy", "name imageURL isAdmin");
      res.json(groupLogs);
    } else {
      res.status(199).send("non member can not access logs of a group");
    }
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

export { allLogsForGroup };
