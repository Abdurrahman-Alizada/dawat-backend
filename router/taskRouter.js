import express from "express";

import {
  allTasks,
  createTask,
  deleteTask,
  updateTask,
  markAsCompleted,
  updateName,
  updateDescription,
  updateDueDates,
  updateStartingDates,
  updatePriority,
  updateResponsibles,
} from "../controllers/taskController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/:groupId").get(protect, allTasks);
router.route("/").post(protect, createTask);
router.route("/delete").delete(protect, deleteTask);
router.route("/update").put(protect, updateTask);
router.route("/:taskId/markAsCompleted").patch(protect, markAsCompleted);

router.route("/:taskId/updateName").patch(protect, updateName);
router.route("/:taskId/updateDescription").patch(protect, updateDescription);
router.route("/:taskId/updateDueDates").patch(protect, updateDueDates);
router.route("/:taskId/updateStartingDates").patch(protect, updateStartingDates);
router.route("/:taskId/updatePriority").patch(protect, updatePriority);
router.route("/:taskId/updateResponsibles").patch(protect, updateResponsibles);

export default router;
