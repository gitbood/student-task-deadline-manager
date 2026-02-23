type AssignmentLike = {
  dueDate: Date;
  status: string;
};

const OPEN_STATUS = "OPEN";

export function isUpcomingAssignment(
  assignment: AssignmentLike,
  now: Date = new Date(),
) {
  if (assignment.status !== OPEN_STATUS) {
    return false;
  }

  const sevenDaysAhead = new Date(now);
  sevenDaysAhead.setDate(sevenDaysAhead.getDate() + 7);

  return assignment.dueDate >= now && assignment.dueDate <= sevenDaysAhead;
}

export function isOverdueAssignment(
  assignment: AssignmentLike,
  now: Date = new Date(),
) {
  return assignment.status === OPEN_STATUS && assignment.dueDate < now;
}

export function getUpcomingAssignments<T extends AssignmentLike>(
  assignments: T[],
  now: Date = new Date(),
) {
  return assignments.filter((assignment) => isUpcomingAssignment(assignment, now));
}

export function getOverdueAssignments<T extends AssignmentLike>(
  assignments: T[],
  now: Date = new Date(),
) {
  return assignments.filter((assignment) => isOverdueAssignment(assignment, now));
}
