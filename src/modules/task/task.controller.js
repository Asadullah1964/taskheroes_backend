import Task from "./task.model.js";
import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import Review from "../review/review.model.js";
import sendNotification from "../../utils/sendNotification.js";
import { 
    createTaskSchema,
    updateTaskSchema,
    applyTaskSchema,
    updateApplicationStatusSchema,
 } from "./task.validation.js";

export const createTask = asyncHandler(async (req, res) => {
  const { error } = createTaskSchema.validate(req.body);

  if (error) {
    throw new ApiError(400, error.details[0].message);
  }

  const task = await Task.create({
    ...req.body,
    client: req.user._id,
  });


  res.status(201).json({
    success: true,
    message: "Task created successfully",
    task,
  });

// await sendNotification({
//   receiver: task.worker,
//   sender: req.user._id,
//   type: "APPLICATION",
//   title: "New Tasks Posted",
//   message: `${req.user.name} posted new task "${task.title}"`,
//   link: `/tasks/${task._id}`,
// });

});

export const getTasks = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    location,
    minBudget,
    maxBudget,
    page = 1,
    limit = 10,
  } = req.query;

  const query = {
    status: "Open",
  };

  // Search by title or description
  if (search) {
    query.$or = [
      {
        title: {
          $regex: search,
          $options: "i",
        },
      },
      {
        description: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  // Category Filter
  if (category) {
    query.category = category;
  }

  // Location Filter
  if (location) {
    query.location = {
      $regex: location,
      $options: "i",
    };
  }

  // Budget Filter
  if (minBudget || maxBudget) {
    query.budget = {};

    if (minBudget)
      query.budget.$gte = Number(minBudget);

    if (maxBudget)
      query.budget.$lte = Number(maxBudget);
  }

  const skip = (page - 1) * limit;

  const tasks = await Task.find(query)
    .populate("client", "name email profileImage")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const totalTasks = await Task.countDocuments(query);

  res.status(200).json({
    success: true,

    totalTasks,

    currentPage: Number(page),

    totalPages: Math.ceil(totalTasks / limit),

    tasks,
  });
});

export const getTaskById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const task = await Task.findById(id)
  .populate(
    "client",
    "name email profileImage"
  )
  .populate(
    "applications.worker",
    "name email profileImage"
  );

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  res.status(200).json({
    success: true,
    task,
  });
});

export const updateTask = asyncHandler(async (req, res) => {
  const { error } = updateTaskSchema.validate(req.body);

  if (error) {
    throw new ApiError(400, error.details[0].message);
  }

  const task = await Task.findById(req.params.id);

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  // Only task owner can update
  if (task.client.toString() !== req.user._id.toString()) {
    throw new ApiError(
      403,
      "You are not authorized to update this task"
    );
  }

  Object.assign(task, req.body);

  await task.save();

  res.status(200).json({
    success: true,
    message: "Task updated successfully",
    task,
  });
});

export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  // Only task owner can delete
  if (task.client.toString() !== req.user._id.toString()) {
    throw new ApiError(
      403,
      "You are not authorized to delete this task"
    );
  }

  // Don't allow deletion if applications exist
  if (task.applications.length > 0) {
    throw new ApiError(
      400,
      "Cannot delete a task that has applications"
    );
  }

  await task.deleteOne();

  res.status(200).json({
    success: true,
    message: "Task deleted successfully",
  });
});

export const applyTask = asyncHandler(async (req, res) => {
  // Validate request
  const { error } = applyTaskSchema.validate(req.body);

  if (error) {
    throw new ApiError(400, error.details[0].message);
  }

  const task = await Task.findById(req.params.id);

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  // Task must be open
  if (task.status !== "Open") {
    throw new ApiError(
      400,
      "Applications are closed for this task"
    );
  }

  // Client cannot apply
  if (task.client.toString() === req.user._id.toString()) {
    throw new ApiError(
      400,
      "You cannot apply to your own task"
    );
  }

  // Worker profile check
  if (
  req.user.role !== "worker" ||
  !req.user.workerProfile
) {
  throw new ApiError(
    403,
    "Only workers can apply"
  );
}

  // Duplicate check
  const alreadyApplied = task.applications.some(
    (application) =>
      application.worker.toString() === req.user._id.toString()
  );

  if (alreadyApplied) {
    throw new ApiError(
      400,
      "You have already applied for this task"
    );
  }

  task.applications.push({
    worker: req.user._id,
    proposal: req.body.proposal,
    expectedPrice: req.body.expectedPrice,
  });

  await task.save();

  await sendNotification({
  receiver: task.client,
  sender: req.user._id,
  type: "APPLICATION",
  title: "New Application",
  message: `${req.user.name} applied for your task "${task.title}"`,
  link: `/application/${task._id}`,
});

  res.status(201).json({
    success: true,
    message: "Application submitted successfully",
  });
});

export const getMyTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({
    client: req.user._id,
  })
    .populate(
      "applications.worker",
      "name email profileImage workerProfile"
    )
    .populate(
      "assignedWorker",
      "name profileImage"
    )
    .sort({ createdAt: -1 });

  const tasksWithReviewStatus = await Promise.all(
    tasks.map(async (task) => {
      let hasReviewed = false;

      if (task.status === "Completed" && task.assignedWorker) {
        hasReviewed = !!(await Review.findOne({
          task: task._id,
          client: req.user._id,
          worker: task.assignedWorker,
        }));
      }

      return {
        ...task.toObject(),
        hasReviewed,
      };
    })
  );

  res.status(200).json({
    success: true,
    count: tasksWithReviewStatus.length,
    tasks: tasksWithReviewStatus,
  });
});

export const getTaskApplications = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const task = await Task.findById(id)
    .populate(
      "applications.worker",
      "name email profileImage workerProfile"
    );

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  // Only the task owner can view applications
  if (task.client.toString() !== req.user._id.toString()) {
    throw new ApiError(
      403,
      "You are not authorized to view these applications"
    );
  }

  res.status(200).json({
    success: true,
    count: task.applications.length,
    applications: task.applications,
  });
});

export const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { error } = updateApplicationStatusSchema.validate(req.body);

  if (error) {
    throw new ApiError(400, error.details[0].message);
  }

  const { taskId, applicationId } = req.params;
  const { status } = req.body;

  const task = await Task.findById(taskId);

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  // Only task owner can update
  if (task.client.toString() !== req.user._id.toString()) {
    throw new ApiError(
      403,
      "You are not authorized to update this application"
    );
  }

  const application = task.applications.id(applicationId);

  if (!application) {
    throw new ApiError(404, "Application not found");
  }

  // ============================
  // ADD THESE CHECKS HERE
  // ============================

  // Task must still be open
  if (task.status !== "Open") {
    throw new ApiError(
      400,
      "Applications can only be managed while the task is open"
    );
  }

  // Application must still be pending
  if (application.status !== "Pending") {
    throw new ApiError(
      400,
      "This application has already been processed"
    );
  }

  // ============================
  // Existing code continues
  // ============================

  application.status = status;

if (status === "Accepted") {
  task.status = "Assigned";
  task.assignedWorker = application.worker;

  task.applications.forEach((app) => {
    if (app._id.toString() !== applicationId) {
      app.status = "Rejected";
    }
  });
}

await task.save();

// Notify selected worker
await sendNotification({
  receiver: application.worker,
  sender: req.user._id,
  type:
    status === "Accepted"
      ? "APPLICATION_ACCEPTED"
      : "APPLICATION_REJECTED",
  title:
    status === "Accepted"
      ? "Application Accepted"
      : "Application Rejected",
  message:
    status === "Accepted"
      ? `Your application for "${task.title}" has been accepted.`
      : `Your application for "${task.title}" has been rejected.`,
  link: `/tasks/${task._id}`,
});

  res.status(200).json({
    success: true,
    message: `Application ${status.toLowerCase()} successfully`,
    task,
  });
});

export const getAppliedTasks = asyncHandler(async (req, res) => {
  // Only workers can access
  if (req.user.role !== "worker") {
    throw new ApiError(
      403,
      "Only workers can access this resource"
    );
  }

  const tasks = await Task.find({
    "applications.worker": req.user._id,
  })
    .populate(
      "client",
      "name email profileImage location"
    )
    .populate(
      "assignedWorker",
      "name profileImage"
    )
    .sort({ createdAt: -1 });

  const appliedTasks = tasks
    .map((task) => {
      const application = task.applications.find(
        (app) =>
          app.worker.toString() === req.user._id.toString()
      );

      // Safety check
      if (!application) return null;

      return {
        _id: task._id,
        title: task.title,
        description: task.description,
        category: task.category,
        budget: task.budget,
        location: task.location,
        deadline: task.deadline,

        taskStatus: task.status,
        applicationStatus: application.status,

        proposal: application.proposal,
        expectedPrice: application.expectedPrice,
        appliedAt: application.createdAt,

        client: task.client,
        assignedWorker: task.assignedWorker,
      };
    })
    .filter(Boolean);

  res.status(200).json({
    success: true,
    count: appliedTasks.length,
    tasks: appliedTasks,
  });
});

import User from "../user/user.model.js";

export const completeTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  // Only task owner
  if (task.client.toString() !== req.user._id.toString()) {
    throw new ApiError(
      403,
      "You are not authorized to complete this task"
    );
  }

  // Task must be assigned
  if (task.status !== "Assigned") {
    throw new ApiError(
      400,
      "Only assigned tasks can be completed"
    );
  }

  // Find accepted application
  const acceptedApplication = task.applications.find(
    (app) => app.status === "Accepted"
  );

  if (!acceptedApplication) {
    throw new ApiError(
      400,
      "No accepted worker found"
    );
  }

  // Update worker completed jobs
  await User.findByIdAndUpdate(
    acceptedApplication.worker,
    {
      $inc: {
        "workerProfile.completedJobs": 1,
      },
    }
  );

  task.status = "Completed";

  await task.save();

  res.status(200).json({
    success: true,
    message: "Task completed successfully",
    task,
  });
});