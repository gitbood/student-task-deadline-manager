import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const LOCAL_FALLBACK_DEMO_PASSWORD = "DemoPass123!";

const demoUsers = [
  { email: "admin@demo.local", role: "ADMIN" },
  { email: "student@demo.local", role: "STUDENT" },
] as const;

function getDemoPassword() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Demo account seeding is for local development only.");
  }

  const configuredPassword = process.env.DEMO_PASSWORD?.trim();
  if (configuredPassword) {
    return configuredPassword;
  }

  console.warn(
    "DEMO_PASSWORD is not set. Using local fallback password for demo accounts.",
  );
  return LOCAL_FALLBACK_DEMO_PASSWORD;
}

async function main() {
  const demoPassword = getDemoPassword();
  const passwordHash = await bcrypt.hash(demoPassword, 12);

  for (const demoUser of demoUsers) {
    await prisma.user.upsert({
      where: { email: demoUser.email },
      update: {
        passwordHash,
        role: demoUser.role,
      },
      create: {
        email: demoUser.email,
        passwordHash,
        role: demoUser.role,
      },
    });
  }

  console.log("Seeded demo users: admin@demo.local, student@demo.local");
}

main()
  .catch((error) => {
    console.error("Seed failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
