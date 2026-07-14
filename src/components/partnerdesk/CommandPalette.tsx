"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import {
  searchPartnerDesk,
  type SearchGroup,
} from "@/lib/partnerdesk/search-actions";

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [groups, setGroups] = useState<SearchGroup[]>([]);
  const [active, setActive] = useState(0);
  const [, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flat = groups.flatMap((g) => g.items);

  const runSearch = useCallback((q: string) => {
    startTransition(async () => {
      const result = await searchPartnerDesk(q);
      setGroups(result);
      setActive(0);
    });
  }, []);

  // Openen met ⌘K / Ctrl+K (reset de query bij toggelen).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setQuery("");
        setOpen((o) => !o);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Debounced zoeken; draait ook direct bij openen (query is dan "").
  useEffect(() => {
    if (!open) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => runSearch(query), 150);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [query, open, runSearch]);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") setOpen(false);
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, flat.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = flat[active];
      if (target) go(target.href);
    }
  }

  if (!open) return null;

  let index = -1;
  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/30 pt-[15vh]">
      <button type="button" aria-label="Sluiten" className="absolute inset-0" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-xl overflow-hidden rounded-xl border border-[var(--ps-border)] bg-[var(--ps-surface)] shadow-2xl">
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Zoek partners, contacten, contracten…  (p / c / t / >)"
          className="w-full border-b border-[var(--ps-border)] px-4 py-3 text-sm outline-none"
        />
        <div className="max-h-[50vh] overflow-y-auto py-2">
          {flat.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-[var(--ps-muted)]">Geen resultaten.</p>
          ) : (
            groups.map((g) => (
              <div key={g.key} className="mb-1">
                <p className="px-4 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--ps-muted)]">
                  {g.label}
                </p>
                {g.items.map((item) => {
                  index += 1;
                  const isActive = index === active;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => go(item.href)}
                      className={`flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm ${
                        isActive ? "bg-[var(--ps-green-light)]" : "hover:bg-[var(--ps-bg)]"
                      }`}
                    >
                      <span className="truncate">{item.title}</span>
                      {item.subtitle && (
                        <span className="shrink-0 truncate text-xs text-[var(--ps-muted)]">{item.subtitle}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
