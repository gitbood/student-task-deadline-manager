import Link from "next/link";
import { ReactNode } from "react";
import { SignOutButton } from "@/components/sign-out-button";

type AppShellProps = {
  userEmail: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function AppShell({ userEmail, title, description, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="text-sm font-semibold text-indigo-600">Student Manager</p>
            <p className="text-xs text-slate-500">{userEmail}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Dashboard
            </Link>
            <Link
              href="/courses"
              className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Courses
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
        <section className="mt-6">{children}</section>
      </main>
    </div>
  );
}
