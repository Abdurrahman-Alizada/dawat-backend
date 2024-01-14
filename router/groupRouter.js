import express from "express";
import {
  fetchGroups,
  createGroupChat,
  removeFromGroup,
  addToGroup,
  updateGroup,
  updateGroupName,
  updateGroupTime,
  updateGroupDescription,
  updateGroupImageURL,
  createMultipleGroups
} from "../controllers/groupControllers.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, fetchGroups);
router.route("/group").post(protect, createGroupChat);
router.route("/addMultipleGroups").post(protect, createMultipleGroups);
router.route("/rename").put(protect, updateGroup);
router.route("/:groupId/updateName").put(protect, updateGroupName);
router.route("/:groupId/updateTime").put(protect, updateGroupTime);
router.route("/:groupId/updateDescription").put(protect, updateGroupDescription);
router.route("/:groupId/updateImageURL").put(protect, updateGroupImageURL);
router.route("/groupremove").put(protect, removeFromGroup);
router.route("/groupadd").put(protect, addToGroup);

export default router
