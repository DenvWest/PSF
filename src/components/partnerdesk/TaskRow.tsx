"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { formatNlDay } from "@/lib/partnerdesk/format";
import { todayIso } from "@/lib/partnerdesk/dates";
import { setTaskStatusAction } from "@/lib/partnerdesk/task-actions";
import type { PdTask } from "@/types/partnerdesk";

export function TaskRow({
  task,
  slug,
  partnerName,
  partnerSlug,
}: {
  task: PdTask;
  slug?: string;
  partnerName?: string | null;
  partnerSlug?: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(task.status === "done");
  const overdue =
    !done && task.due_on !== null && task.due_on < todayIso();

  function toggle() {
    const next = !done;
    setDone(next);
    startTransition(async () => {
      const result = await setTaskStatusAction({ taskId: task.id, done: next, slug });
      if (!result.ok) {
        setDone(!next);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-3 py-1.5 text-sm">
      <input
        type="checkbox"
        checked={done}
        onChange={toggle}
        disabled={pending}
        className="h-4 w-4 shrink-0 accent-[var(--ps-green)]"
      />
      <span className={`flex-1 ${done ? "text-[var(--ps-muted)] line-through" : ""}`}>
        {task.title}
        {partnerName && partnerSlug && (
          <Link
            href={`/admin/partners/${partnerSlug}`}
            className="ml-2 text-xs text-[var(--ps-body)] hover:underline"
          >
            {partnerName}
          </Link>
        )}
      </span>
      {task.due_on && (
        <span className={`shrink-0 text-xs ${overdue ? "font-medium text-red-600" : "text-[var(--ps-muted)]"}`}>
          {formatNlDay(task.due_on)}
        </span>
      )}
    </div>
  );
}
