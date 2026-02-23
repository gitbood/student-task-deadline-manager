import "next-auth";
import "next-auth/jwt";

type UserRole = "ADMIN" | "STUDENT";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    role: UserRole;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      role: UserRole;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
  }
}
