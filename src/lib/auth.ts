import bcrypt from "bcryptjs";
import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

type UserRole = "ADMIN" | "STUDENT";

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

function normalizeRole(role: string | null | undefined): UserRole {
  return role === "ADMIN" ? "ADMIN" : "STUDENT";
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
  },
  providers: [
    CredentialsProvider({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsedCredentials = signInSchema.safeParse(credentials);
        if (!parsedCredentials.success) {
          return null;
        }

        const normalizedEmail = parsedCredentials.data.email.toLowerCase();
        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (!user) {
          return null;
        }

        const matchesPassword = await bcrypt.compare(
          parsedCredentials.data.password,
          user.passwordHash,
        );

        if (!matchesPassword) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          role: normalizeRole(user.role),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = normalizeRole(user.role);
      } else {
        token.role = normalizeRole(token.role);
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id ?? token.sub ?? "";
        session.user.email = token.email ?? "";
        session.user.role = normalizeRole(token.role);
      }

      return session;
    },
  },
};

export const getServerAuthSession = () => getServerSession(authOptions);
