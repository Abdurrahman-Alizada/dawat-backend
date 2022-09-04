import express from "express";

import {
  allInvities,
  createInviti,
} from "../controllers/invitationController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/:groupId").get(protect, allInvities);
router.route("/").post(protect, createInviti);

export default router;
