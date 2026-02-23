import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";

export async function requireUser() {
  const session = await getServerAuthSession();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  return session.user;
}
