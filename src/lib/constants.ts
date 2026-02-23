export const PRIORITY_VALUES = ["LOW", "MEDIUM", "HIGH"] as const;
export const STATUS_VALUES = ["OPEN", "DONE"] as const;

export type PriorityValue = (typeof PRIORITY_VALUES)[number];
export type StatusValue = (typeof STATUS_VALUES)[number];

export const PRIORITY_LABELS: Record<PriorityValue, string> = {
  LOW: "Low",
  MEDIUM: "Med",
  HIGH: "High",
};

export const STATUS_LABELS: Record<StatusValue, string> = {
  OPEN: "Open",
  DONE: "Done",
};
