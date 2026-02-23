import { z } from "zod";
import { PRIORITY_VALUES, STATUS_VALUES } from "@/lib/constants";

const hexColorRegex = /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/;

export const courseSchema = z.object({
  name: z.string().trim().min(1, "Course name is required.").max(80),
  color: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value && value.length > 0 ? value : null))
    .refine((value) => value === null || hexColorRegex.test(value), {
      message: "Color must be a valid hex value, like #3B82F6.",
    }),
});

export const courseUpdateSchema = courseSchema.extend({
  id: z.string().min(1),
});

export const assignmentSchema = z.object({
  courseId: z.string().min(1, "Course is required."),
  title: z.string().trim().min(1, "Title is required.").max(120),
  description: z
    .string()
    .trim()
    .max(1000, "Description is too long.")
    .optional()
    .transform((value) => (value && value.length > 0 ? value : null)),
  dueDate: z.string().min(1, "Due date is required."),
  priority: z.enum(PRIORITY_VALUES),
  status: z.enum(STATUS_VALUES).optional().default("OPEN"),
});

export const assignmentUpdateSchema = assignmentSchema.extend({
  id: z.string().min(1),
});

export const assignmentStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(STATUS_VALUES),
});

export const idSchema = z.object({
  id: z.string().min(1),
});
