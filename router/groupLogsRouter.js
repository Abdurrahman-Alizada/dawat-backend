import express from "express";

import { allLogsForGroup } from "../controllers/groupLogsController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/:groupId").get(protect, allLogsForGroup);
// router.route("/").post(protect, createTask);
// router.route("/delete").delete(protect, deleteTask);
// router.route("/update").put(protect, updateTask);

export default router;
