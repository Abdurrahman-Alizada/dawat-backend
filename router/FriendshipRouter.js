import express from "express";
import User from "../models/userModel.js";
import protect from "../middleware/authMiddleware.js";
import {
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  getAllFriends,
  SearchFriends,
  deleteFriendSuggestion,
  undoDeleteFriendSuggestion,
  SearchFriendsForUser
} from "../controllers/FriendshipController.js";

const FriendRouter = express.Router();

FriendRouter.route("/sendRequest").post(protect, sendFriendRequest);
FriendRouter.route("/acceptRequest").post(protect, acceptFriendRequest);
FriendRouter.route("/deleteFriendsSeggestion").post(protect, deleteFriendSuggestion);
FriendRouter.route("/undoDeleteFriendSuggestion").post(protect, undoDeleteFriendSuggestion);
FriendRouter.route("/declineRequest").post(protect, declineFriendRequest);
FriendRouter.route("/getFriends/:userId").get(protect, getAllFriends);
FriendRouter.route("/search/:searchQuery").get(SearchFriends);
FriendRouter.route("/search/:searchQuery/for/:userId").get(SearchFriendsForUser);

export default FriendRouter;
