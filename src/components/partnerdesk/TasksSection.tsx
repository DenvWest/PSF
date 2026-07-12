"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { TaskRow } from "@/components/partnerdesk/TaskRow";
import { createTaskAction } from "@/lib/partnerdesk/task-actions";
import type { PdTask } from "@/types/partnerdesk";

export function TasksSection({
  partnerId,
  slug,
  tasks,
}: {
  partnerId: string;
  slug: string;
  tasks: PdTask[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [dueOn, setDueOn] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onAdd(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await createTaskAction({ partnerId, title, dueOn: dueOn || null, slug });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setTitle("");
      setDueOn("");
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      {tasks.length === 0 ? (
        <p className="text-sm text-[var(--ps-muted)]">Geen open taken.</p>
      ) : (
        <div className="divide-y divide-[var(--ps-border)]">
          {tasks.map((t) => (
            <TaskRow key={t.id} task={t} slug={slug} />
          ))}
        </div>
      )}

      <form onSubmit={onAdd} className="flex items-center gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nieuwe taak…"
          className="flex-1 rounded-lg border border-[var(--ps-border)] px-3 py-2 text-sm outline-none focus:border-[var(--ps-green)]"
        />
        <input
          type="date"
          value={dueOn}
          onChange={(e) => setDueOn(e.target.value)}
          className="rounded-lg border border-[var(--ps-border)] bg-[var(--ps-surface)] px-2 py-2 text-sm"
          title="Deadline (optioneel)"
        />
        <button
          type="submit"
          disabled={pending || !title.trim()}
          className="rounded-lg bg-[var(--ps-green)] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[var(--ps-green-hover)] disabled:opacity-50"
        >
          + Taak
        </button>
      </form>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
