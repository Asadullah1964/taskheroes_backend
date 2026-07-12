import express from "express";

import protect from "../../middleware/auth.js";

import {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
    applyTask,
    getMyTasks,
    updateApplicationStatus,
    getAppliedTasks,
    completeTask,
} from "./task.controller.js";

const router = express.Router();

router.post("/", protect, createTask);
router.get("/", getTasks);
router.get("/my", protect, getMyTasks);
router.get(
    "/applied",
    protect,
    getAppliedTasks
);
router.get("/:id", getTaskById);
router.put("/:id", protect, updateTask);
router.delete("/:id", protect, deleteTask);
router.post("/:id/apply", protect, applyTask);
router.patch(
  "/:taskId/applications/:applicationId",
  protect,
  updateApplicationStatus
);
router.patch(
  "/:id/complete",
  protect,
  completeTask
);

export default router;