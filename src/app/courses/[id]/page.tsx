import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { AssignmentCreateForm } from "@/components/assignment-create-form";
import { AssignmentList } from "@/components/assignment-list";
import { FlashAlert } from "@/components/flash-alert";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";

type CourseDetailPageProps = {
  params: { id: string };
  searchParams: Record<string, string | string[] | undefined>;
};

export default async function CourseDetailPage({
  params,
  searchParams,
}: CourseDetailPageProps) {
  const user = await requireUser();
  const [course, allCourses] = await Promise.all([
    prisma.course.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        assignments: {
          include: {
            course: {
              select: { id: true, name: true, color: true },
            },
          },
          orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
        },
      },
    }),
    prisma.course.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!course) {
    notFound();
  }

  const redirectTo = `/courses/${course.id}`;

  return (
    <AppShell
      userEmail={user.email}
      title={course.name}
      description="Manage assignments for this course."
    >
      <div className="space-y-6">
        <FlashAlert
          error={searchParams.error}
          success={searchParams.success}
        />

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Add Assignment
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            New assignments created here are added to this course.
          </p>
          <div className="mt-4">
            <AssignmentCreateForm
              courses={allCourses}
              redirectTo={redirectTo}
              lockedCourseId={course.id}
            />
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">Assignments</h2>
          <div className="mt-3">
            <AssignmentList
              assignments={course.assignments}
              courses={allCourses}
              redirectTo={redirectTo}
              emptyMessage="No assignments in this course yet."
            />
          </div>
        </section>
      </div>
    </AppShell>
  );
}
