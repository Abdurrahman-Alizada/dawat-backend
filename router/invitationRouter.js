import express from "express";

import {
  allInvities,
  createInviti,
  deleteInviti,
  updateInviti
} from "../controllers/invitationController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/:groupId").get(protect, allInvities);
router.route("/").post(protect, createInviti);
router.route("/delete").delete(protect, deleteInviti);
router.route("/update").put(protect, updateInviti);

export default router;
