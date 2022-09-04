import express from "express";

import {
    allTasks,
    createTask,
} from "../controllers/taskController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/:groupId").get(protect, allTasks);
router.route("/").post(protect, createTask);

export default router;
