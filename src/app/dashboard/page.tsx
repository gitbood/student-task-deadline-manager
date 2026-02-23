import { AppShell } from "@/components/app-shell";
import { AssignmentCreateForm } from "@/components/assignment-create-form";
import { AssignmentList } from "@/components/assignment-list";
import { FlashAlert } from "@/components/flash-alert";
import {
  PRIORITY_LABELS,
  PRIORITY_VALUES,
  STATUS_LABELS,
  STATUS_VALUES,
  PriorityValue,
  StatusValue,
} from "@/lib/constants";
import { getOverdueAssignments, getUpcomingAssignments } from "@/lib/assignment-utils";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";

type DashboardPageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

function firstValue(value?: string | string[]) {
  if (!value) return "";
  return Array.isArray(value) ? value[0] ?? "" : value;
}

function isPriority(value: string): value is PriorityValue {
  return PRIORITY_VALUES.includes(value as PriorityValue);
}

function isStatus(value: string): value is StatusValue {
  return STATUS_VALUES.includes(value as StatusValue);
}

function buildDashboardRedirect(
  courseIdFilter: string,
  statusFilter: string,
  priorityFilter: string,
) {
  const params = new URLSearchParams();
  if (courseIdFilter !== "ALL") {
    params.set("courseId", courseIdFilter);
  }
  if (statusFilter !== "ALL") {
    params.set("status", statusFilter);
  }
  if (priorityFilter !== "ALL") {
    params.set("priority", priorityFilter);
  }

  const query = params.toString();
  return query.length > 0 ? `/dashboard?${query}` : "/dashboard";
}

function formatDueDate(date: Date) {
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const user = await requireUser();
  const [courses, assignments] = await Promise.all([
    prisma.course.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true, color: true },
    }),
    prisma.assignment.findMany({
      where: { userId: user.id },
      include: {
        course: {
          select: { id: true, name: true, color: true },
        },
      },
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    }),
  ]);

  const requestedCourseId = firstValue(searchParams.courseId);
  const requestedStatus = firstValue(searchParams.status);
  const requestedPriority = firstValue(searchParams.priority);

  const courseIdFilter =
    requestedCourseId && courses.some((course) => course.id === requestedCourseId)
      ? requestedCourseId
      : "ALL";
  const statusFilter = isStatus(requestedStatus) ? requestedStatus : "ALL";
  const priorityFilter = isPriority(requestedPriority) ? requestedPriority : "ALL";

  const redirectTo = buildDashboardRedirect(
    courseIdFilter,
    statusFilter,
    priorityFilter,
  );

  const filteredAssignments = assignments.filter((assignment) => {
    const matchesCourse =
      courseIdFilter === "ALL" || assignment.courseId === courseIdFilter;
    const matchesStatus =
      statusFilter === "ALL" || assignment.status === statusFilter;
    const matchesPriority =
      priorityFilter === "ALL" || assignment.priority === priorityFilter;
    return matchesCourse && matchesStatus && matchesPriority;
  });

  const upcomingAssignments = getUpcomingAssignments(assignments);
  const overdueAssignments = getOverdueAssignments(assignments);
  const completedCount = assignments.filter(
    (assignment) => assignment.status === "DONE",
  ).length;

  return (
    <AppShell
      userEmail={user.email}
      title="Dashboard"
      description="Track upcoming deadlines, overdue tasks, and completed work."
    >
      <div className="space-y-6">
        <FlashAlert
          error={searchParams.error}
          success={searchParams.success}
        />

        <p className="text-sm font-medium text-slate-700">
          Role: <span className="font-semibold text-slate-900">{user.role}</span>
        </p>

        <section className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Upcoming (next 7 days)</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {upcomingAssignments.length}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Overdue</p>
            <p className="mt-2 text-2xl font-semibold text-red-600">
              {overdueAssignments.length}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Completed</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-600">
              {completedCount}
            </p>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Upcoming Tasks</h2>
            <ul className="mt-2 space-y-2 text-sm text-slate-700">
              {upcomingAssignments.slice(0, 5).map((assignment) => (
                <li key={assignment.id} className="rounded-md bg-slate-50 px-3 py-2">
                  {assignment.title} - {assignment.course.name} ({formatDueDate(assignment.dueDate)})
                </li>
              ))}
              {upcomingAssignments.length === 0 ? (
                <li className="rounded-md bg-slate-50 px-3 py-2 text-slate-500">
                  No tasks due in the next 7 days.
                </li>
              ) : null}
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Overdue Tasks</h2>
            <ul className="mt-2 space-y-2 text-sm text-slate-700">
              {overdueAssignments.slice(0, 5).map((assignment) => (
                <li key={assignment.id} className="rounded-md bg-red-50 px-3 py-2">
                  {assignment.title} - {assignment.course.name} ({formatDueDate(assignment.dueDate)})
                </li>
              ))}
              {overdueAssignments.length === 0 ? (
                <li className="rounded-md bg-slate-50 px-3 py-2 text-slate-500">
                  Nothing overdue right now.
                </li>
              ) : null}
            </ul>
          </div>
        </section>

        {courses.length > 0 ? (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">Create Assignment</h2>
            <AssignmentCreateForm courses={courses} redirectTo={redirectTo} />
          </section>
        ) : (
          <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">
            Create a course first before adding assignments.
          </p>
        )}

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Filters</h2>
          <form className="mt-3 grid gap-3 md:grid-cols-4" method="GET">
            <label className="text-sm font-medium text-slate-700">
              Course
              <select
                name="courseId"
                defaultValue={courseIdFilter}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="ALL">All courses</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium text-slate-700">
              Status
              <select
                name="status"
                defaultValue={statusFilter}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="ALL">All statuses</option>
                {STATUS_VALUES.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium text-slate-700">
              Priority
              <select
                name="priority"
                defaultValue={priorityFilter}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="ALL">All priorities</option>
                {PRIORITY_VALUES.map((priority) => (
                  <option key={priority} value={priority}>
                    {PRIORITY_LABELS[priority]}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="rounded-md bg-slate-800 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
              >
                Apply
              </button>
              <a
                href="/dashboard"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Clear
              </a>
            </div>
          </form>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">Assignments</h2>
          <AssignmentList
            assignments={filteredAssignments}
            courses={courses}
            redirectTo={redirectTo}
            emptyMessage="No assignments match your filters."
          />
        </section>
      </div>
    </AppShell>
  );
}
