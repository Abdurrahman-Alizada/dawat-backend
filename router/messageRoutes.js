import express from "express";

import {
  allMessages,
  sendMessage,
  deleteMessages
} from "../controllers/messageControllers.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/:groupId").get(protect, allMessages);
router.route("/").post(protect, sendMessage);
router.route("/delete").delete(protect, deleteMessages);

export default router;
