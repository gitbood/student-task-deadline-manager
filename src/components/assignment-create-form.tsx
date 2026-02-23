import { createAssignmentAction } from "@/app/actions";
import { PRIORITY_LABELS, PRIORITY_VALUES, PriorityValue } from "@/lib/constants";

type CourseOption = {
  id: string;
  name: string;
};

type AssignmentCreateFormProps = {
  courses: CourseOption[];
  redirectTo: string;
  lockedCourseId?: string;
};

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function AssignmentCreateForm({
  courses,
  redirectTo,
  lockedCourseId,
}: AssignmentCreateFormProps) {
  const defaultCourseId = lockedCourseId ?? courses[0]?.id ?? "";
  const defaultDueDate = toDateInputValue(new Date());

  return (
    <form
      action={createAssignmentAction}
      className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-2"
    >
      <input type="hidden" name="redirectTo" value={redirectTo} />

      {lockedCourseId ? (
        <input type="hidden" name="courseId" value={lockedCourseId} />
      ) : (
        <label className="text-sm font-medium text-slate-700">
          Course
          <select
            name="courseId"
            required
            defaultValue={defaultCourseId}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-indigo-200 focus:border-indigo-500 focus:ring"
          >
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
        </label>
      )}

      <label className="text-sm font-medium text-slate-700">
        Title
        <input
          name="title"
          required
          maxLength={120}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-indigo-200 focus:border-indigo-500 focus:ring"
          placeholder="e.g. Midterm preparation"
        />
      </label>

      <label className="text-sm font-medium text-slate-700 md:col-span-2">
        Description (optional)
        <textarea
          name="description"
          rows={2}
          maxLength={1000}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-indigo-200 focus:border-indigo-500 focus:ring"
          placeholder="Any notes for this assignment"
        />
      </label>

      <label className="text-sm font-medium text-slate-700">
        Due date
        <input
          type="date"
          name="dueDate"
          required
          defaultValue={defaultDueDate}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-indigo-200 focus:border-indigo-500 focus:ring"
        />
      </label>

      <label className="text-sm font-medium text-slate-700">
        Priority
        <select
          name="priority"
          defaultValue="MEDIUM"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-indigo-200 focus:border-indigo-500 focus:ring"
        >
          {PRIORITY_VALUES.map((priority) => (
            <option key={priority} value={priority}>
              {PRIORITY_LABELS[priority as PriorityValue]}
            </option>
          ))}
        </select>
      </label>

      <button
        type="submit"
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 md:col-span-2"
      >
        Add Assignment
      </button>
    </form>
  );
}
