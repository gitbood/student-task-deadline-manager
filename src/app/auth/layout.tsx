import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";

type AuthLayoutProps = {
  children: ReactNode;
};

export default async function AuthLayout({ children }: AuthLayoutProps) {
  const session = await getServerAuthSession();

  if (session?.user?.id) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
