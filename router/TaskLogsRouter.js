import express from "express";

import { allLogsForTask } from "../controllers/TaskLogsController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/:taskId").get(protect, allLogsForTask);
// router.route("/").post(protect, createTask);
// router.route("/delete").delete(protect, deleteTask);
// router.route("/update").put(protect, updateTask);

export default router;
