import Link from "next/link";
import { deleteCourseAction, updateCourseAction } from "@/app/actions";

type CourseItem = {
  id: string;
  name: string;
  color: string | null;
  assignmentsCount: number;
};

type CourseListProps = {
  courses: CourseItem[];
  redirectTo: string;
};

export function CourseList({ courses, redirectTo }: CourseListProps) {
  if (courses.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
        No courses yet. Create one above to start organizing assignments.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {courses.map((course) => (
        <div
          key={course.id}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span
                className="h-4 w-4 rounded-full border border-slate-200"
                style={{ backgroundColor: course.color ?? "#CBD5E1" }}
              />
              <div>
                <p className="font-medium text-slate-900">{course.name}</p>
                <p className="text-sm text-slate-500">
                  {course.assignmentsCount} assignment
                  {course.assignmentsCount === 1 ? "" : "s"}
                </p>
              </div>
            </div>
            <Link
              href={`/courses/${course.id}`}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Open Course
            </Link>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_120px_auto_auto]">
            <form action={updateCourseAction} className="contents">
              <input type="hidden" name="id" value={course.id} />
              <input type="hidden" name="redirectTo" value={redirectTo} />
              <input
                name="name"
                required
                defaultValue={course.name}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-indigo-200 focus:border-indigo-500 focus:ring"
              />
              <input
                name="color"
                defaultValue={course.color ?? ""}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-indigo-200 focus:border-indigo-500 focus:ring"
                placeholder="#3B82F6"
              />
              <button
                type="submit"
                className="rounded-md bg-slate-800 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
              >
                Save
              </button>
            </form>

            <form action={deleteCourseAction}>
              <input type="hidden" name="id" value={course.id} />
              <input type="hidden" name="redirectTo" value={redirectTo} />
              <button
                type="submit"
                className="rounded-md border border-red-300 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
              >
                Delete
              </button>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
}
