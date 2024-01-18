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

//@description     Delete Friend suggestion
//@route           post /api/friendship/deleteFriendsSeggestion
//@access          Protected
const deleteFriendSuggestion = asyncHandler(async (req, res) => {
  const { userA, userB } = req.body;

  try {
    const docA = await Friend.findOneAndUpdate(
      { requestor: userA, recipient: userB },
      { $set: { status: 4 } },
      { upsert: true, new: true }
    );
    const docB = await Friend.findOneAndUpdate(
      { recipient: userA, requestor: userB },
      { $set: { status: 4 } },
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

//@description     undo deleted Friend suggestion
//@route           post /api/friendship/undoDeleteFriendSuggestion
//@access          Protected
const undoDeleteFriendSuggestion = asyncHandler(async (req, res) => {
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
//@comment         before changing the functionality of this function, remember first rule of programming: If it's working don't touch it.
const getAllFriends = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    res.status(400).send({ message: "userId not found" });
  }
  try {
    const users = await User.aggregate([
      {
        $addFields: {
          friends: {
            $cond: {
              if: {
                $ne: [{ $type: "$friends" }, "array"],
              },
              then: [],
              else: "$friends",
            },
          },
        },
      },
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

    let addFriend = [];
    let requested = [];
    let pending = [];
    let accepted = [];
    let deleted = [];
    let blocked = [];
    for (let i = 0; i < users.length; i++) {
      if (users[i]._id.valueOf() !== userId) {
        if (users[i].friendsStatus === 0) {
          addFriend.push(users[i]);
        } else if (users[i].friendsStatus === 1) {
          requested.push(users[i]);
        } else if (users[i].friendsStatus === 2) {
          pending.push(users[i]);
        } else if (users[i].friendsStatus === 3) {
          accepted.push(users[i]);
        } else if (users[i].friendsStatus === 4) {
          deleted.push(users[i]);
        } else if (users[i].friendsStatus === 5) {
          blocked.push(users[i]);
        }
      }
    }
    res.send({
      addFriend: addFriend,
      requested: requested,
      pending: pending,
      accepted: accepted,
      deleted: deleted,
      blocked: blocked,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

//@description     Search for friends
//@route           get /api/friendship?searh
//@access          Public
const SearchFriends = asyncHandler(async (req, res, next) => {
  // We look for a query parameter "search"
  const { searchQuery } = req.params;
  let friends;

  if (searchQuery) {
    friends = await User.find({ name: new RegExp(searchQuery, "i") })
      .limit(15)
      .select("-password -email");
    // .lean()

    res.send(friends);
  } else {
    friends = await User.find()
      .select("-password -email")
      .sort({ createdAt: "desc" });
    res.send(friends);
  }
});

//@description     Search for friends
//@route           get /api/friendship?searh
//@access          Public
const SearchFriendsForUser = asyncHandler(async (req, res, next) => {
  const { searchQuery, userId } = req.params;
  let friends;

  const usersWithFriendshipStatus = await User.aggregate([
    {
      $addFields: {
        friends: {
          $cond: {
            if: {
              $ne: [{ $type: "$friends" }, "array"],
            },
            then: [],
            else: "$friends",
          },
        },
      },
    },
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
      $match: {
        $or: [{ name: { $regex: searchQuery, $options: "i" } }],
      },
    },
    {
      $addFields: {
        friendsStatus: {
          $ifNull: [{ $min: "$friends.status" }, 0],
        },
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        friendsStatus: 1,
        imageURL:1
      },
    },
    {
      $limit: 15,
    },
  ]);

  res.send(usersWithFriendshipStatus);
});

export {
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  getAllFriends,
  SearchFriends,
  deleteFriendSuggestion,
  undoDeleteFriendSuggestion,
  SearchFriendsForUser,
};
