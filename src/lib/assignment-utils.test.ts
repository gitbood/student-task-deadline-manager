import {
  getOverdueAssignments,
  getUpcomingAssignments,
  isOverdueAssignment,
  isUpcomingAssignment,
} from "@/lib/assignment-utils";

describe("assignment date helpers", () => {
  const now = new Date("2026-02-01T10:00:00.000Z");

  it("detects upcoming open assignments in next 7 days", () => {
    const assignment = {
      dueDate: new Date("2026-02-05T12:00:00.000Z"),
      status: "OPEN",
    };

    expect(isUpcomingAssignment(assignment, now)).toBe(true);
  });

  it("does not mark done assignments as upcoming", () => {
    const assignment = {
      dueDate: new Date("2026-02-05T12:00:00.000Z"),
      status: "DONE",
    };

    expect(isUpcomingAssignment(assignment, now)).toBe(false);
  });

  it("detects overdue open assignments", () => {
    const assignment = {
      dueDate: new Date("2026-01-30T09:59:59.000Z"),
      status: "OPEN",
    };

    expect(isOverdueAssignment(assignment, now)).toBe(true);
  });

  it("filters upcoming and overdue sets correctly", () => {
    const assignments = [
      {
        dueDate: new Date("2026-02-03T10:00:00.000Z"),
        status: "OPEN",
      },
      {
        dueDate: new Date("2026-01-28T10:00:00.000Z"),
        status: "OPEN",
      },
      {
        dueDate: new Date("2026-02-03T10:00:00.000Z"),
        status: "DONE",
      },
    ];

    expect(getUpcomingAssignments(assignments, now)).toHaveLength(1);
    expect(getOverdueAssignments(assignments, now)).toHaveLength(1);
  });
});
