"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import {
  assignmentSchema,
  assignmentStatusSchema,
  assignmentUpdateSchema,
  courseSchema,
  courseUpdateSchema,
  idSchema,
} from "@/lib/validation";

function getSafeRedirectTo(formData: FormData, fallback: string) {
  const redirectTo = formData.get("redirectTo");
  if (
    typeof redirectTo === "string" &&
    redirectTo.startsWith("/") &&
    !redirectTo.startsWith("//")
  ) {
    return redirectTo;
  }

  return fallback;
}

function withMessage(pathWithQuery: string, type: "error" | "success", message: string) {
  const [pathname, queryString] = pathWithQuery.split("?");
  const params = new URLSearchParams(queryString ?? "");
  params.set(type, message);

  const nextQuery = params.toString();
  return nextQuery.length > 0 ? `${pathname}?${nextQuery}` : pathname;
}

function getPathname(pathWithQuery: string) {
  return pathWithQuery.split("?")[0] ?? pathWithQuery;
}

function parseDueDate(value: string) {
  const parsedDate = new Date(`${value}T23:59:59`);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
}

function firstIssueMessage(message: string, fallback: string) {
  return message.trim().length > 0 ? message : fallback;
}

export async function createCourseAction(formData: FormData) {
  const user = await requireUser();
  const redirectTo = getSafeRedirectTo(formData, "/courses");

  const parsed = courseSchema.safeParse({
    name: formData.get("name"),
    color: formData.get("color"),
  });

  if (!parsed.success) {
    redirect(
      withMessage(
        redirectTo,
        "error",
        firstIssueMessage(parsed.error.issues[0]?.message ?? "", "Invalid course."),
      ),
    );
  }

  await prisma.course.create({
    data: {
      userId: user.id,
      name: parsed.data.name,
      color: parsed.data.color,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/courses");
  revalidatePath(getPathname(redirectTo));
  redirect(withMessage(redirectTo, "success", "Course created."));
}

export async function updateCourseAction(formData: FormData) {
  const user = await requireUser();
  const redirectTo = getSafeRedirectTo(formData, "/courses");

  const parsed = courseUpdateSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    color: formData.get("color"),
  });

  if (!parsed.success) {
    redirect(
      withMessage(
        redirectTo,
        "error",
        firstIssueMessage(parsed.error.issues[0]?.message ?? "", "Invalid course."),
      ),
    );
  }

  const updateResult = await prisma.course.updateMany({
    where: {
      id: parsed.data.id,
      userId: user.id,
    },
    data: {
      name: parsed.data.name,
      color: parsed.data.color,
    },
  });

  if (updateResult.count === 0) {
    redirect(withMessage(redirectTo, "error", "Course not found."));
  }

  revalidatePath("/dashboard");
  revalidatePath("/courses");
  revalidatePath(getPathname(redirectTo));
  redirect(withMessage(redirectTo, "success", "Course updated."));
}

export async function deleteCourseAction(formData: FormData) {
  const user = await requireUser();
  const redirectTo = getSafeRedirectTo(formData, "/courses");

  const parsed = idSchema.safeParse({
    id: formData.get("id"),
  });

  if (!parsed.success) {
    redirect(withMessage(redirectTo, "error", "Invalid course ID."));
  }

  const deleteResult = await prisma.course.deleteMany({
    where: {
      id: parsed.data.id,
      userId: user.id,
    },
  });

  if (deleteResult.count === 0) {
    redirect(withMessage(redirectTo, "error", "Course not found."));
  }

  revalidatePath("/dashboard");
  revalidatePath("/courses");
  revalidatePath(getPathname(redirectTo));
  redirect(withMessage(redirectTo, "success", "Course deleted."));
}

export async function createAssignmentAction(formData: FormData) {
  const user = await requireUser();
  const redirectTo = getSafeRedirectTo(formData, "/dashboard");

  const parsed = assignmentSchema.safeParse({
    courseId: formData.get("courseId"),
    title: formData.get("title"),
    description: formData.get("description"),
    dueDate: formData.get("dueDate"),
    priority: formData.get("priority"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    redirect(
      withMessage(
        redirectTo,
        "error",
        firstIssueMessage(
          parsed.error.issues[0]?.message ?? "",
          "Invalid assignment fields.",
        ),
      ),
    );
  }

  const dueDate = parseDueDate(parsed.data.dueDate);
  if (!dueDate) {
    redirect(withMessage(redirectTo, "error", "Please provide a valid due date."));
  }

  const course = await prisma.course.findFirst({
    where: {
      id: parsed.data.courseId,
      userId: user.id,
    },
    select: { id: true },
  });

  if (!course) {
    redirect(withMessage(redirectTo, "error", "Course not found."));
  }

  await prisma.assignment.create({
    data: {
      userId: user.id,
      courseId: parsed.data.courseId,
      title: parsed.data.title,
      description: parsed.data.description,
      dueDate,
      priority: parsed.data.priority,
      status: parsed.data.status,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/courses");
  revalidatePath(`/courses/${parsed.data.courseId}`);
  revalidatePath(getPathname(redirectTo));
  redirect(withMessage(redirectTo, "success", "Assignment created."));
}

export async function updateAssignmentAction(formData: FormData) {
  const user = await requireUser();
  const redirectTo = getSafeRedirectTo(formData, "/dashboard");

  const parsed = assignmentUpdateSchema.safeParse({
    id: formData.get("id"),
    courseId: formData.get("courseId"),
    title: formData.get("title"),
    description: formData.get("description"),
    dueDate: formData.get("dueDate"),
    priority: formData.get("priority"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    redirect(
      withMessage(
        redirectTo,
        "error",
        firstIssueMessage(
          parsed.error.issues[0]?.message ?? "",
          "Invalid assignment fields.",
        ),
      ),
    );
  }

  const dueDate = parseDueDate(parsed.data.dueDate);
  if (!dueDate) {
    redirect(withMessage(redirectTo, "error", "Please provide a valid due date."));
  }

  const ownedCourse = await prisma.course.findFirst({
    where: { id: parsed.data.courseId, userId: user.id },
    select: { id: true },
  });

  if (!ownedCourse) {
    redirect(withMessage(redirectTo, "error", "Course not found."));
  }

  const updateResult = await prisma.assignment.updateMany({
    where: {
      id: parsed.data.id,
      userId: user.id,
    },
    data: {
      courseId: parsed.data.courseId,
      title: parsed.data.title,
      description: parsed.data.description,
      dueDate,
      priority: parsed.data.priority,
      status: parsed.data.status,
    },
  });

  if (updateResult.count === 0) {
    redirect(withMessage(redirectTo, "error", "Assignment not found."));
  }

  revalidatePath("/dashboard");
  revalidatePath("/courses");
  revalidatePath(`/courses/${parsed.data.courseId}`);
  revalidatePath(getPathname(redirectTo));
  redirect(withMessage(redirectTo, "success", "Assignment updated."));
}

export async function deleteAssignmentAction(formData: FormData) {
  const user = await requireUser();
  const redirectTo = getSafeRedirectTo(formData, "/dashboard");

  const parsed = idSchema.safeParse({
    id: formData.get("id"),
  });

  if (!parsed.success) {
    redirect(withMessage(redirectTo, "error", "Invalid assignment ID."));
  }

  const assignment = await prisma.assignment.findFirst({
    where: {
      id: parsed.data.id,
      userId: user.id,
    },
    select: {
      courseId: true,
    },
  });

  if (!assignment) {
    redirect(withMessage(redirectTo, "error", "Assignment not found."));
  }

  await prisma.assignment.delete({
    where: { id: parsed.data.id },
  });

  revalidatePath("/dashboard");
  revalidatePath("/courses");
  revalidatePath(`/courses/${assignment.courseId}`);
  revalidatePath(getPathname(redirectTo));
  redirect(withMessage(redirectTo, "success", "Assignment deleted."));
}

export async function setAssignmentStatusAction(formData: FormData) {
  const user = await requireUser();
  const redirectTo = getSafeRedirectTo(formData, "/dashboard");

  const parsed = assignmentStatusSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    redirect(withMessage(redirectTo, "error", "Invalid status update."));
  }

  const updateResult = await prisma.assignment.updateMany({
    where: {
      id: parsed.data.id,
      userId: user.id,
    },
    data: {
      status: parsed.data.status,
    },
  });

  if (updateResult.count === 0) {
    redirect(withMessage(redirectTo, "error", "Assignment not found."));
  }

  revalidatePath("/dashboard");
  revalidatePath("/courses");
  revalidatePath(getPathname(redirectTo));
  const successMessage =
    parsed.data.status === "DONE"
      ? "Assignment marked done."
      : "Assignment marked open.";
  redirect(withMessage(redirectTo, "success", successMessage));
}
