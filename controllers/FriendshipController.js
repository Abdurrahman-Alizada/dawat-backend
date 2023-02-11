import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import Friend from "../models/FriendshipModel.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
//@description     Send Friend Request 
//@route           post /api/friendship/sendRequest
//@access          Protected
const sendFriendRequest = asyncHandler(async (req, res) => {
  const { userA, userB } = req.body;

  try {
    const docA = await Friend.findOneAndUpdate(
      { requestor: userA, recipient: userB },
      { $set: { status: 1 } },
      { upsert: true, new: true }
    );
    const docB = await Friend.findOneAndUpdate(
      { recipient: userA, requestor: userB },
      { $set: { status: 2 } },
      { upsert: true, new: true }
    );
    const updateUserA = await User.findOneAndUpdate(
      { _id: userA },
      { $push: { friends: docA._id } }
    );
    const updateUserB = await User.findOneAndUpdate(
      { _id: userB },
      { $push: { friends: docB._id } }
    );

    res.send([updateUserA, updateUserB]);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//@description     Accept Friend Request
//@route           post /api/friendship/acceptRequest
//@access          Protected
const acceptFriendRequest = asyncHandler(async (req, res) => {
  const { userA, userB } = req.body;

  try {
    const docA = await Friend.findOneAndUpdate(
      { requestor: userA, recipient: userB },
      { $set: { status: 3 } }
    );
    const docB = await Friend.findOneAndUpdate(
      { recipient: userA, requestor: userB },
      { $set: { status: 3 } }
    );
    res.send([docA, docB]);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//@description     Decline Friend Request
//@route           post /api/friendship/declineRequest
//@access          Protected
const declineFriendRequest = asyncHandler(async (req, res) => {
  const { userA, userB } = req.body;

  try {
    const docA = await Friend.findOneAndRemove({
      requestor: userA,
      recipient: userB,
    });
    const docB = await Friend.findOneAndRemove({
      recipient: userA,
      requestor: userB,
    });
    const updateUserA = await User.findOneAndUpdate(
      { _id: userA },
      { $pull: { friends: docA._id } }
    );
    const updateUserB = await User.findOneAndUpdate(
      { _id: userB },
      { $pull: { friends: docB._id } }
    );
    res.send([updateUserA, updateUserB]);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//@description     get all user that can be possible friend
//@route           get /api/friendship/getFriends/:userId
//@access          Protected
const getAllFriends = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  try {
    const users = await User.aggregate([
      {
        $lookup: {
          from: Friend.collection.name,
          let: { friends: "$friends" },
          pipeline: [
            {
              $match: {
                recipient: mongoose.Types.ObjectId(userId),
                $expr: { $in: ["$_id", "$$friends"] },
              },
            },
            { $project: { status: 1 } },
          ],
          as: "friends",
        },
      },
      {
        $addFields: {
          friendsStatus: {
            $ifNull: [{ $min: "$friends.status" }, 0],
          },
        },
      },
    ]);

    const filterusers = users.filter((user) => user.friendsStatus === 2);
    let addFriend = [];
    let requested = [];
    let pending = [];
    let accepted = [];
    for (let i = 0; i < users.length; i++) {
      if (users[i].friendsStatus === 0) {
        addFriend.push(users[i]);
      } else if (users[i].friendsStatus === 1) {
        requested.push(users[i]);
      } else if (users[i].friendsStatus === 2) {
        pending.push(users[i]);
      } else if (users[i].friendsStatus === 3) {
        accepted.push(users[i]);
      }
    }
    // res.send(filterusers);
    res.send({
      addFriend: addFriend,
      requested: requested,
      pending: pending,
      accepted: accepted,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

export {
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  getAllFriends,
};
