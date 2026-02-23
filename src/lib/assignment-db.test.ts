import { prisma } from "@/lib/prisma";

describe("assignment db flow", () => {
  it("creates an assignment and marks it done", async () => {
    const uniqueId = Date.now().toString();
    const user = await prisma.user.create({
      data: {
        email: `test-${uniqueId}@local.dev`,
        passwordHash: "test-hash",
      },
    });

    try {
      const course = await prisma.course.create({
        data: {
          userId: user.id,
          name: `Course ${uniqueId}`,
          color: "#3B82F6",
        },
      });

      const assignment = await prisma.assignment.create({
        data: {
          userId: user.id,
          courseId: course.id,
          title: "Draft project outline",
          dueDate: new Date("2026-03-01T23:59:59.000Z"),
          priority: "MEDIUM",
          status: "OPEN",
        },
      });

      expect(assignment.status).toBe("OPEN");

      await prisma.assignment.update({
        where: { id: assignment.id },
        data: { status: "DONE" },
      });

      const updated = await prisma.assignment.findUnique({
        where: { id: assignment.id },
      });

      expect(updated).not.toBeNull();
      expect(updated?.status).toBe("DONE");
    } finally {
      await prisma.user.delete({
        where: { id: user.id },
      });
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});
