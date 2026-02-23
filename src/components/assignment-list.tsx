import {
  deleteAssignmentAction,
  setAssignmentStatusAction,
  updateAssignmentAction,
} from "@/app/actions";
import {
  PRIORITY_LABELS,
  PRIORITY_VALUES,
  STATUS_LABELS,
  STATUS_VALUES,
  PriorityValue,
  StatusValue,
} from "@/lib/constants";

type CourseOption = {
  id: string;
  name: string;
};

type AssignmentItem = {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  dueDate: Date;
  priority: string;
  status: string;
  course: {
    id: string;
    name: string;
    color: string | null;
  };
};

type AssignmentListProps = {
  assignments: AssignmentItem[];
  courses: CourseOption[];
  redirectTo: string;
  emptyMessage: string;
};

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toReadableDate(date: Date) {
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function isPriorityValue(value: string): value is PriorityValue {
  return PRIORITY_VALUES.includes(value as PriorityValue);
}

function isStatusValue(value: string): value is StatusValue {
  return STATUS_VALUES.includes(value as StatusValue);
}

export function AssignmentList({
  assignments,
  courses,
  redirectTo,
  emptyMessage,
}: AssignmentListProps) {
  if (assignments.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {assignments.map((assignment) => {
        const priorityLabel = isPriorityValue(assignment.priority)
          ? PRIORITY_LABELS[assignment.priority]
          : assignment.priority;
        const statusLabel = isStatusValue(assignment.status)
          ? STATUS_LABELS[assignment.status]
          : assignment.status;
        const nextStatus = assignment.status === "DONE" ? "OPEN" : "DONE";

        return (
          <article
            key={assignment.id}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">{assignment.title}</p>
                {assignment.description ? (
                  <p className="mt-1 text-sm text-slate-600">{assignment.description}</p>
                ) : null}
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">
                    Due {toReadableDate(assignment.dueDate)}
                  </span>
                  <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-800">
                    {priorityLabel}
                  </span>
                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-800">
                    {statusLabel}
                  </span>
                  <span
                    className="rounded-full border border-slate-200 px-2 py-1 text-slate-700"
                    style={{
                      backgroundColor: assignment.course.color
                        ? `${assignment.course.color}20`
                        : undefined,
                    }}
                  >
                    {assignment.course.name}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <form action={setAssignmentStatusAction}>
                  <input type="hidden" name="id" value={assignment.id} />
                  <input type="hidden" name="status" value={nextStatus} />
                  <input type="hidden" name="redirectTo" value={redirectTo} />
                  <button
                    type="submit"
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    {assignment.status === "DONE" ? "Mark Open" : "Mark Done"}
                  </button>
                </form>

                <form action={deleteAssignmentAction}>
                  <input type="hidden" name="id" value={assignment.id} />
                  <input type="hidden" name="redirectTo" value={redirectTo} />
                  <button
                    type="submit"
                    className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-50"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </div>

            <details className="mt-3">
              <summary className="cursor-pointer text-sm font-medium text-indigo-600">
                Edit assignment
              </summary>

              <form action={updateAssignmentAction} className="mt-3 grid gap-3 md:grid-cols-2">
                <input type="hidden" name="id" value={assignment.id} />
                <input type="hidden" name="redirectTo" value={redirectTo} />

                <label className="text-sm font-medium text-slate-700">
                  Title
                  <input
                    name="title"
                    required
                    defaultValue={assignment.title}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-indigo-200 focus:border-indigo-500 focus:ring"
                  />
                </label>

                <label className="text-sm font-medium text-slate-700">
                  Course
                  <select
                    name="courseId"
                    required
                    defaultValue={assignment.courseId}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-indigo-200 focus:border-indigo-500 focus:ring"
                  >
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-sm font-medium text-slate-700 md:col-span-2">
                  Description
                  <textarea
                    name="description"
                    defaultValue={assignment.description ?? ""}
                    rows={2}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-indigo-200 focus:border-indigo-500 focus:ring"
                  />
                </label>

                <label className="text-sm font-medium text-slate-700">
                  Due date
                  <input
                    type="date"
                    name="dueDate"
                    required
                    defaultValue={toDateInputValue(assignment.dueDate)}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-indigo-200 focus:border-indigo-500 focus:ring"
                  />
                </label>

                <label className="text-sm font-medium text-slate-700">
                  Priority
                  <select
                    name="priority"
                    required
                    defaultValue={assignment.priority}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-indigo-200 focus:border-indigo-500 focus:ring"
                  >
                    {PRIORITY_VALUES.map((priority) => (
                      <option key={priority} value={priority}>
                        {PRIORITY_LABELS[priority]}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-sm font-medium text-slate-700">
                  Status
                  <select
                    name="status"
                    required
                    defaultValue={assignment.status}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-indigo-200 focus:border-indigo-500 focus:ring"
                  >
                    {STATUS_VALUES.map((status) => (
                      <option key={status} value={status}>
                        {STATUS_LABELS[status]}
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  type="submit"
                  className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 md:col-span-2"
                >
                  Save Changes
                </button>
              </form>
            </details>
          </article>
        );
      })}
    </div>
  );
}
