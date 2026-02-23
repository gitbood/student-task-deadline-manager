import { createCourseAction } from "@/app/actions";

type CourseCreateFormProps = {
  redirectTo: string;
};

export function CourseCreateForm({ redirectTo }: CourseCreateFormProps) {
  return (
    <form
      action={createCourseAction}
      className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_120px_auto]"
    >
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <label className="text-sm font-medium text-slate-700">
        Course name
        <input
          name="name"
          required
          maxLength={80}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-indigo-200 focus:border-indigo-500 focus:ring"
          placeholder="e.g. Calculus"
        />
      </label>

      <label className="text-sm font-medium text-slate-700">
        Color
        <input
          name="color"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-indigo-200 focus:border-indigo-500 focus:ring"
          placeholder="#3B82F6"
        />
      </label>

      <button
        type="submit"
        className="mt-6 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
      >
        Add Course
      </button>
    </form>
  );
}
