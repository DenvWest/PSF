import { daysBetween } from "@/lib/partnerdesk/dates";

export type TaskBucket = "overdue" | "today" | "week" | "later" | "someday";

export interface TaskLike {
  due_on: string | null;
}

export const TASK_BUCKET_ORDER: TaskBucket[] = [
  "overdue",
  "today",
  "week",
  "later",
  "someday",
];

export const TASK_BUCKET_LABEL: Record<TaskBucket, string> = {
  overdue: "Te laat",
  today: "Vandaag",
  week: "Deze week",
  later: "Later",
  someday: "Geen datum",
};

/** Plaatst een taak in een emmer op basis van zijn deadline t.o.v. vandaag. */
export function bucketForTask(dueOn: string | null, todayIso: string): TaskBucket {
  if (!dueOn) return "someday";
  const diff = daysBetween(todayIso, dueOn);
  if (diff === null) return "someday";
  if (diff < 0) return "overdue";
  if (diff === 0) return "today";
  if (diff <= 7) return "week";
  return "later";
}

/** Groepeert taken per emmer; behoudt de inkomende volgorde binnen elke emmer. */
export function groupTasks<T extends TaskLike>(
  tasks: T[],
  todayIso: string,
): Record<TaskBucket, T[]> {
  const groups: Record<TaskBucket, T[]> = {
    overdue: [],
    today: [],
    week: [],
    later: [],
    someday: [],
  };
  for (const task of tasks) {
    groups[bucketForTask(task.due_on, todayIso)].push(task);
  }
  return groups;
}
