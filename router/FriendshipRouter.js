import express from "express";
import User from "../models/userModel.js";
import protect from "../middleware/authMiddleware.js";
import {
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  getAllFriends,
} from "../controllers/FriendshipController.js";

const FriendRouter = express.Router();

FriendRouter.route("/sendRequest").post(protect, sendFriendRequest);
FriendRouter.route("/acceptRequest").post(protect, acceptFriendRequest);
FriendRouter.route("/declineRequest").post(protect, declineFriendRequest);
FriendRouter.route("/getFriends/:userId").get(protect, getAllFriends);

export default FriendRouter;
