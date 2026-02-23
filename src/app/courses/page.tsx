import { AppShell } from "@/components/app-shell";
import { CourseCreateForm } from "@/components/course-create-form";
import { CourseList } from "@/components/course-list";
import { FlashAlert } from "@/components/flash-alert";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";

type CoursesPageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const user = await requireUser();
  const courses = await prisma.course.findMany({
    where: { userId: user.id },
    orderBy: [{ createdAt: "desc" }],
    select: {
      id: true,
      name: true,
      color: true,
      _count: { select: { assignments: true } },
    },
  });

  return (
    <AppShell
      userEmail={user.email}
      title="Courses"
      description="Create and manage your courses here."
    >
      <div className="space-y-6">
        <FlashAlert
          error={searchParams.error}
          success={searchParams.success}
        />
        <CourseCreateForm redirectTo="/courses" />
        <CourseList
          courses={courses.map((course) => ({
            id: course.id,
            name: course.name,
            color: course.color,
            assignmentsCount: course._count.assignments,
          }))}
          redirectTo="/courses"
        />
      </div>
    </AppShell>
  );
}
