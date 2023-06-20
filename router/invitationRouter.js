import express from "express";

import {
  allInvities,
  createInviti,
  deleteInviti,
  updateInviti,
  updateInvitiStatus,
  createMultipleInviti,
  deleteMultipleInviti,
  updateStatusOfMultipleInvities,
  invitiesSummary
} from "../controllers/invitationController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/:groupId").get(protect, allInvities);
router.route("/:groupId/invitiesSummary").get(protect, invitiesSummary);
router.route("/").post(protect, createInviti);
router.route("/addMultiple").post(protect, createMultipleInviti);
router.route("/delete").delete(protect, deleteInviti);
router.route("/deleteMultiple").delete(protect, deleteMultipleInviti);
router.route("/update").put(protect, updateInviti);
router.route("/:id/updateInviteStatus").patch(protect, updateInvitiStatus);
router.route("/updateStatusOfMultipleInvities").patch(protect, updateStatusOfMultipleInvities);

export default router;
