import express from "express";
import {
  accessGroup,
  fetchGroups,
  createGroupChat,
  removeFromGroup,
  addToGroup,
  updateGroup,
  updateGroupName,
  updateGroupDescription,
  updateGroupImageURL
} from "../controllers/groupControllers.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").post(protect, accessGroup);
router.route("/").get(protect, fetchGroups);
router.route("/group").post(protect, createGroupChat);
router.route("/rename").put(protect, updateGroup);
router.route("/:groupId/updateName").put(protect, updateGroupName);
router.route("/:groupId/updateDescription").put(protect, updateGroupDescription);
router.route("/:groupId/updateImageURL").put(protect, updateGroupImageURL);
router.route("/groupremove").put(protect, removeFromGroup);
router.route("/groupadd").put(protect, addToGroup);

export default router
