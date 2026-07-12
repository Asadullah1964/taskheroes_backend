import Joi from "joi";

export const createReviewSchema = Joi.object({
  rating: Joi.number()
    .min(1)
    .max(5)
    .required(),

  comment: Joi.string()
    .min(10)
    .max(500)
    .required(),
});