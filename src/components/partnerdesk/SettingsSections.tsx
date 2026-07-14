"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import {
  createCategoryAction,
  createLabelAction,
  createNetworkAction,
  deleteCategoryAction,
  deleteLabelAction,
  deleteNetworkAction,
} from "@/lib/partnerdesk/settings-actions";
import type { PdCategory, PdLabel, PdNetwork } from "@/types/partnerdesk";

const LABEL_COLORS = ["gray", "green", "amber", "red", "blue", "purple"];
const inputCls =
  "rounded-md border border-[var(--ps-border)] px-2.5 py-1.5 text-sm outline-none focus:border-[var(--ps-green)]";

function Row({ children, onDelete, pending }: { children: React.ReactNode; onDelete: () => void; pending: boolean }) {
  return (
    <li className="flex items-center gap-2 border-b border-[var(--ps-border)] py-1.5 text-sm last:border-0">
      <span className="flex-1">{children}</span>
      <button type="button" onClick={onDelete} disabled={pending} className="text-xs text-[var(--ps-muted)] hover:text-red-600">
        verwijder
      </button>
    </li>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-[var(--ps-border)] bg-[var(--ps-surface)] p-5">
      <h2 className="mb-3 text-base font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export function SettingsSections({
  networks,
  categories,
  labels,
}: {
  networks: PdNetwork[];
  categories: PdCategory[];
  labels: PdLabel[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [nwName, setNwName] = useState("");
  const [nwKind, setNwKind] = useState<"network" | "direct">("network");
  const [nwUrl, setNwUrl] = useState("");
  const [catName, setCatName] = useState("");
  const [lblName, setLblName] = useState("");
  const [lblColor, setLblColor] = useState("gray");

  function run(fn: () => Promise<{ ok: boolean; error?: string }>, reset?: () => void) {
    setError(null);
    startTransition(async () => {
      const result = await fn();
      if (!result.ok) {
        setError(result.error ?? "Er ging iets mis.");
        return;
      }
      reset?.();
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <Section title="Netwerken">
        <ul className="mb-3">
          {networks.map((n) => (
            <Row key={n.id} pending={pending} onDelete={() => run(() => deleteNetworkAction({ id: n.id }))}>
              {n.name}
              <span className="ml-1 text-xs text-[var(--ps-muted)]">
                {n.kind === "direct" ? "· direct" : "· netwerk"}
              </span>
            </Row>
          ))}
        </ul>
        <form
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            run(() => createNetworkAction({ name: nwName, kind: nwKind, loginUrl: nwUrl }), () => {
              setNwName("");
              setNwUrl("");
            });
          }}
          className="flex flex-wrap gap-2"
        >
          <input value={nwName} onChange={(e) => setNwName(e.target.value)} placeholder="Naam" className={inputCls} />
          <select value={nwKind} onChange={(e) => setNwKind(e.target.value as "network" | "direct")} className={inputCls}>
            <option value="network">Netwerk</option>
            <option value="direct">Direct</option>
          </select>
          <input value={nwUrl} onChange={(e) => setNwUrl(e.target.value)} placeholder="Login-URL (optioneel)" className={`${inputCls} flex-1`} />
          <button type="submit" disabled={pending || !nwName.trim()} className="rounded-lg bg-[var(--ps-green)] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[var(--ps-green-hover)] disabled:opacity-50">
            + Netwerk
          </button>
        </form>
      </Section>

      <Section title="Categorieën">
        <ul className="mb-3">
          {categories.map((c) => (
            <Row key={c.id} pending={pending} onDelete={() => run(() => deleteCategoryAction({ id: c.id }))}>
              {c.name}
            </Row>
          ))}
        </ul>
        <form
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            run(() => createCategoryAction({ name: catName }), () => setCatName(""));
          }}
          className="flex gap-2"
        >
          <input value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="Naam" className={`${inputCls} flex-1`} />
          <button type="submit" disabled={pending || !catName.trim()} className="rounded-lg bg-[var(--ps-green)] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[var(--ps-green-hover)] disabled:opacity-50">
            + Categorie
          </button>
        </form>
      </Section>

      <Section title="Labels">
        <ul className="mb-3">
          {labels.map((l) => (
            <Row key={l.id} pending={pending} onDelete={() => run(() => deleteLabelAction({ id: l.id }))}>
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: l.color }} />
                {l.name}
              </span>
            </Row>
          ))}
        </ul>
        <form
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            run(() => createLabelAction({ name: lblName, color: lblColor }), () => setLblName(""));
          }}
          className="flex flex-wrap gap-2"
        >
          <input value={lblName} onChange={(e) => setLblName(e.target.value)} placeholder="Naam" className={inputCls} />
          <select value={lblColor} onChange={(e) => setLblColor(e.target.value)} className={inputCls}>
            {LABEL_COLORS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button type="submit" disabled={pending || !lblName.trim()} className="rounded-lg bg-[var(--ps-green)] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[var(--ps-green-hover)] disabled:opacity-50">
            + Label
          </button>
        </form>
      </Section>
    </div>
  );
}
