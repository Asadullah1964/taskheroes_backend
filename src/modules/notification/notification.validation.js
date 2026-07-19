import { z } from "zod";

export const createNotificationSchema = z.object({
  receiver: z.string(),

  sender: z.string(),

  type: z.enum([
    "APPLICATION",
    "APPLICATION_ACCEPTED",
    "APPLICATION_REJECTED",
    "MESSAGE",
    "TASK_COMPLETED",
    "REVIEW",
  ]),

  title: z.string().min(1),

  message: z.string().min(1),

  link: z.string().optional(),
});