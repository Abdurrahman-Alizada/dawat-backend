import express from "express";

import {
    allTasks,
    createTask,
    deleteTask,
    updateTask
} from "../controllers/taskController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/:groupId").get(protect, allTasks);
router.route("/").post(protect, createTask);
router.route("/delete").delete(protect, deleteTask);
router.route("/update").put(protect, updateTask);

export default router;
