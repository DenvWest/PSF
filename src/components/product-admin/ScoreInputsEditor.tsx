"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveScoreInputsAction } from "@/lib/product-admin/edit-actions";
import { LABEL_FACT_KEYS, type StoredScoreInputs } from "@/lib/product-admin/score-inputs";
import type { LabelFacts } from "@/types/supplement-score";

const LABEL_FACT_TEXT: Record<keyof LabelFacts, string> = {
  werkzameStofGekwantificeerd: "Werkzame stof staat als getal op het etiket",
  dagdoseringVermeld: "Expliciete dagdosering op het etiket",
  samenstellingUitgesplitst: "Samenstelling per vorm uitgesplitst",
  proprietaryBlend: "Proprietary blend (totaalgewicht wel, verdeling niet)",
};

const EMPTY: StoredScoreInputs = {
  formKey: "",
  label: {
    werkzameStofGekwantificeerd: false,
    dagdoseringVermeld: false,
    samenstellingUitgesplitst: false,
    proprietaryBlend: false,
  },
  certificeringen: [],
  kwaliteitsmarkers: {},
  dosisOnzekerReden: null,
};

const inputCls =
  "rounded-md border border-[var(--ps-border)] px-2 py-1 text-sm outline-none focus:border-[var(--ps-green)]";

export function ScoreInputsEditor({
  productId,
  slug,
  initial,
  source,
  columnAvailable,
  forms,
  markers,
}: {
  productId: string;
  slug: string;
  initial: StoredScoreInputs | null;
  source: "database" | "code" | "leeg";
  columnAvailable: boolean;
  forms: { key: string; label: string }[];
  markers: { key: string; label: string; waarom: string }[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const start = initial ?? EMPTY;
  const [formKey, setFormKey] = useState(start.formKey);
  const [label, setLabel] = useState<LabelFacts>(start.label);
  const [markerState, setMarkerState] = useState<Record<string, boolean>>(start.kwaliteitsmarkers);
  const [certs, setCerts] = useState(start.certificeringen.join(", "));
  const [reason, setReason] = useState(start.dosisOnzekerReden ?? "");

  function save() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await saveScoreInputsAction({
        productId,
        slug,
        inputs: {
          formKey,
          label,
          certificeringen: certs.split(",").map((c) => c.trim()).filter(Boolean),
          kwaliteitsmarkers: markerState,
          dosisOnzekerReden: reason.trim() || null,
        },
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  if (forms.length === 0) {
    return <p className="text-sm text-[var(--ps-muted)]">Voor deze categorie is nog geen scoremodel met vormen beschikbaar.</p>;
  }

  return (
    <div className="space-y-4">
      {!columnAvailable && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          De kolom score_inputs bestaat nog niet in de database. Draai eerst de migratie (zie supabase/migrations/OPENSTAAND.md);
          opslaan werkt daarna.
        </p>
      )}
      <p className="text-xs text-[var(--ps-muted)]">
        {source === "database" && "Deze invoer staat in de database."}
        {source === "code" && "Deze invoer komt nu nog uit score-inputs.ts. Opslaan legt hem vast in de database."}
        {source === "leeg" && "Nog geen score-invoer. Vul de feiten in die op de verpakking of in de webshop na te lezen zijn."}
      </p>

      <label className="flex max-w-md flex-col gap-1 text-sm">
        <span className="text-[var(--ps-body)]">Vorm van de werkzame stof</span>
        <select value={formKey} onChange={(e) => setFormKey(e.target.value)} className={inputCls}>
          <option value="">— kies —</option>
          {forms.map((f) => (
            <option key={f.key} value={f.key}>
              {f.label}
            </option>
          ))}
        </select>
      </label>

      <fieldset className="space-y-1.5">
        <legend className="mb-1 text-sm text-[var(--ps-body)]">Etiketfeiten</legend>
        {LABEL_FACT_KEYS.map((key) => (
          <label key={key} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={label[key]}
              onChange={(e) => setLabel((prev) => ({ ...prev, [key]: e.target.checked }))}
              className="accent-[var(--ps-green)]"
            />
            {LABEL_FACT_TEXT[key]}
          </label>
        ))}
      </fieldset>

      {markers.length > 0 && (
        <fieldset className="space-y-2">
          <legend className="mb-1 text-sm text-[var(--ps-body)]">Kwaliteitsmarkers</legend>
          <p className="text-xs text-amber-800">
            Vink een marker pas aan als je de gepubliceerde waarde of het rapport zelf hebt gezien. Een keurmerk of testuitslag toeschrijven
            aan een merk dat het niet voert, is een feitelijke bewering over dat bedrijf.
          </p>
          {markers.map((m) => (
            <label key={m.key} className="flex items-start gap-2 text-sm" title={m.waarom}>
              <input
                type="checkbox"
                checked={markerState[m.key] === true}
                onChange={(e) => setMarkerState((prev) => ({ ...prev, [m.key]: e.target.checked }))}
                className="mt-0.5 accent-[var(--ps-green)]"
              />
              {m.label}
            </label>
          ))}
        </fieldset>
      )}

      <label className="flex max-w-md flex-col gap-1 text-sm">
        <span className="text-[var(--ps-body)]">Certificeringen voor de score (kommagescheiden)</span>
        <input value={certs} onChange={(e) => setCerts(e.target.value)} className={inputCls} placeholder="bijv. ifos, creapure" />
      </label>

      <label className="flex max-w-xl flex-col gap-1 text-sm">
        <span className="text-[var(--ps-body)]">Reden als de dagdosis niet uit het etiket vast te stellen is (leeg = dosis bekend)</span>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} className={inputCls} />
      </label>

      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={pending || !columnAvailable}
          onClick={save}
          className="rounded-lg bg-[var(--ps-green)] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[var(--ps-green-hover)] disabled:opacity-50"
        >
          Score-invoer opslaan
        </button>
        {error && <span className="text-xs text-red-600">{error}</span>}
        {saved && <span className="text-xs text-[var(--ps-green-hover)]">Opgeslagen</span>}
      </div>
    </div>
  );
}
