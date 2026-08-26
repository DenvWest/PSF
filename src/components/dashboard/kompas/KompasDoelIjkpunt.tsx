"use client";

import * as Icons from "@/components/app/icons";
import DomeinDoelZetten from "@/components/dashboard/voortgang/DomeinDoelZetten";
import { isDomainGoalDomain, type DomainGoalDomain } from "@/lib/domain-goal";
import { GOAL_MODE_LINE } from "@/lib/domain-goal-client";
import { useDomainGoalEditor } from "@/lib/use-domain-goal-editor";
import type { PillarId } from "@/types/dashboard";

type KompasDoelIjkpuntProps = {
  domain: PillarId;
  domainLabel: string;
};

const SCORE_OPTIONS = Array.from({ length: 11 }, (_, index) => index);

/**
 * Het ijkpunt van je focusdomein als vierde kolom in het focus-paneel: naast
 * stand, route en duiding, en wisselend met het domein dat in de focus-pill
 * staat. Herscoren gaat inline in dezelfde box; een ander doel kiezen opent het
 * volledige zetmoment (`DomeinDoelZetten`), want situatie en eigen woorden
 * horen daar.
 *
 * Draagt zijn eigen grid-cel: dit component hangt in de `@container/focus` van
 * `FocusVoortgangPanel` en loopt uitgeklapt over de volle paneelbreedte, zodat
 * de 0-10-schaal niet in een kolom van 200px geperst wordt.
 */
export default function KompasDoelIjkpunt({ domain, domainLabel }: KompasDoelIjkpuntProps) {
  const goalDomain: DomainGoalDomain | null = isDomainGoalDomain(domain) ? domain : null;
  const {
    goals,
    goal,
    latestScore,
    goalLine,
    existing,
    anchor,
    editing,
    panelOpen,
    pendingScore,
    busy,
    error,
    setPendingScore,
    openEdit,
    closeEdit,
    openReformulate,
    saveScore,
    applySaved,
    closePanel,
  } = useDomainGoalEditor(goalDomain, "kompas_home");

  if (!goalDomain || goals == null) {
    return null;
  }

  // Uitgeklapt staat het ijkpunt altijd op een eigen rij (scheiding boven);
  // ingeklapt is het vanaf 860px de vierde kolom (scheiding links).
  const cellClass = editing
    ? "@container/ijkpunt flex min-w-0 flex-col justify-center border-t border-white/8 pt-3 @[520px]/focus:col-span-3 @[860px]/focus:col-span-4"
    : "@container/ijkpunt flex min-w-0 flex-col justify-center border-t border-white/8 pt-3 @[520px]/focus:col-span-3 @[860px]/focus:col-span-1 @[860px]/focus:border-l @[860px]/focus:border-t-0 @[860px]/focus:pl-5 @[860px]/focus:pt-0";

  const label = `Je doelstelling · ${domainLabel.toLowerCase()}`;

  return (
    <>
      <div className={cellClass}>
        {editing && goal ? (
          <>
            <div className="flex items-start justify-between gap-3">
              <span className="min-w-0">
                <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9FB0A6]">
                  {label}
                </span>
                <span className="mt-1 block text-[13.5px] leading-snug text-[#E7EDE8] text-pretty">
                  {goalLine}
                </span>
              </span>
              <button
                type="button"
                onClick={closeEdit}
                aria-label="Ijkpunt sluiten"
                className="-mr-1 shrink-0 cursor-pointer rounded-lg border-none bg-transparent px-1.5 py-1 text-[14px] leading-none text-[#9FB0A6] transition hover:text-[#E7EDE8]"
              >
                ✕
              </button>
            </div>

            <p className="mt-2.5 mb-2 text-[12px] text-[#9FB0A6]">
              {latestScore != null ? `Vorige keer ${latestScore} van 10. ` : ""}
              Hoe makkelijk gaat dit nu? 0 = lukt me niet · 10 = gaat vanzelf
            </p>

            <div className="grid grid-cols-6 gap-1.5 @[420px]/ijkpunt:grid-cols-11">
              {SCORE_OPTIONS.map((value) => {
                const selected = value === pendingScore;
                return (
                  <button
                    key={value}
                    type="button"
                    disabled={busy}
                    aria-pressed={selected}
                    onClick={() => setPendingScore(value)}
                    className={`flex min-h-10 cursor-pointer items-center justify-center rounded-[9px] border text-[13.5px] font-semibold tabular-nums transition disabled:opacity-60 ${selected
                        ? "border-[var(--sage)] bg-[var(--sage)] text-[#0f1c10]"
                        : "border-white/12 bg-black/25 text-[#CDD7D0] hover:border-white/25"
                      }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>

            {error ? <p className="mt-2 mb-0 text-[12px] text-[#C8956C]">{error}</p> : null}

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={busy || pendingScore == null}
                onClick={() => void saveScore()}
                className="flex min-h-10 cursor-pointer items-center justify-center rounded-[10px] border-none bg-[var(--sage)] px-4 text-[13px] font-semibold text-[#0f1c10] transition disabled:opacity-50"
              >
                {busy ? "Opslaan…" : "Opslaan"}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={openReformulate}
                className="cursor-pointer border-none bg-transparent p-0 text-[12.5px] font-medium text-[#9FB0A6] underline-offset-2 transition hover:text-[#E7EDE8] hover:underline disabled:opacity-60"
              >
                Ander doel kiezen
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={openEdit}
            className="flex w-full cursor-pointer flex-col items-start border-none bg-transparent p-0 text-left"
          >
            <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9FB0A6]">
              {label}
            </span>
            <span className="mt-1 block text-[13.5px] leading-snug text-[#E7EDE8] text-pretty">
              {goalLine ?? "Zet je eigen doel voor dit domein"}
            </span>
            <span className="mt-0.5 block text-[12px] text-[#9FB0A6] text-pretty">
              {goal
                ? `${latestScore != null ? `Nu ${latestScore} van 10. ` : ""}${goal.mode ? GOAL_MODE_LINE[goal.mode] : ""
                  }`.trim() || "Bijwerken bij je volgende check."
                : "Eén zin en een cijfer — dat is je meetlat naast de score."}
            </span>
            <span className="mt-1.5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--sage)]">
              {goal ? "Bijwerken" : "Zetten"}
              <Icons.ArrowRight s={14} />
            </span>
          </button>
        )}
      </div>

      {panelOpen ? (
        <DomeinDoelZetten
          open
          domain={goalDomain}
          domainLabel={domainLabel}
          anchor={anchor}
          existingGoal={existing}
          onClose={closePanel}
          onSaved={(result) => {
            applySaved(result.score, result.reformulated, {
              situationId: result.situationId,
              ownWords: result.ownWords,
            });
          }}
        />
      ) : null}
    </>
  );
}
