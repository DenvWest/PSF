import { describe, it, expect } from "vitest";
import {
  bucketForTask,
  groupTasks,
} from "@/lib/partnerdesk/task-grouping";

const TODAY = "2026-07-12";

describe("bucketForTask", () => {
  it("plaatst een taak zonder datum in 'someday'", () => {
    expect(bucketForTask(null, TODAY)).toBe("someday");
  });

  it("plaatst een verlopen taak in 'overdue'", () => {
    expect(bucketForTask("2026-07-11", TODAY)).toBe("overdue");
    expect(bucketForTask("2026-01-01", TODAY)).toBe("overdue");
  });

  it("plaatst vandaag in 'today'", () => {
    expect(bucketForTask("2026-07-12", TODAY)).toBe("today");
  });

  it("plaatst 1–7 dagen vooruit in 'week'", () => {
    expect(bucketForTask("2026-07-13", TODAY)).toBe("week");
    expect(bucketForTask("2026-07-19", TODAY)).toBe("week");
  });

  it("plaatst 8+ dagen vooruit in 'later'", () => {
    expect(bucketForTask("2026-07-20", TODAY)).toBe("later");
  });

  it("valt terug op 'someday' bij een onparseerbare datum", () => {
    expect(bucketForTask("morgen", TODAY)).toBe("someday");
  });
});

describe("groupTasks", () => {
  it("verdeelt taken over de emmers en behoudt volgorde", () => {
    const tasks = [
      { id: "a", due_on: "2026-07-10" },
      { id: "b", due_on: "2026-07-12" },
      { id: "c", due_on: "2026-07-15" },
      { id: "d", due_on: null },
      { id: "e", due_on: "2026-08-30" },
      { id: "f", due_on: "2026-07-01" },
    ];
    const groups = groupTasks(tasks, TODAY);
    expect(groups.overdue.map((t) => t.id)).toEqual(["a", "f"]);
    expect(groups.today.map((t) => t.id)).toEqual(["b"]);
    expect(groups.week.map((t) => t.id)).toEqual(["c"]);
    expect(groups.later.map((t) => t.id)).toEqual(["e"]);
    expect(groups.someday.map((t) => t.id)).toEqual(["d"]);
  });
});
