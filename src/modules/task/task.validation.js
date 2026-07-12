import Joi from "joi";

export const createTaskSchema = Joi.object({
  title: Joi.string().min(5).max(100).required(),

  description: Joi.string().min(20).required(),

  category: Joi.string().required(),

  budget: Joi.number().min(100).required(),

  location: Joi.string().required(),

  deadline: Joi.date().required(),
});

export const updateTaskSchema = Joi.object({
  title: Joi.string().min(5).max(100),

  description: Joi.string().min(20),

  category: Joi.string(),

  budget: Joi.number().min(100),

  location: Joi.string(),

  deadline: Joi.date(),

  status: Joi.string().valid(
    "Open",
    "Assigned",
    "Completed",
    "Cancelled"
  ),
}).min(1);

export const applyTaskSchema = Joi.object({
  proposal: Joi.string()
    .min(20)
    .max(1000)
    .required(),

  expectedPrice: Joi.number()
    .min(100)
    .required(),
});

export const updateApplicationStatusSchema = Joi.object({
  status: Joi.string()
    .valid("Accepted", "Rejected")
    .required(),
});