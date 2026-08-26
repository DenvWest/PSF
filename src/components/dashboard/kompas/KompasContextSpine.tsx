"use client";

import Link from "next/link";
import * as Icons from "@/components/app/icons";
import DomainLadderContextPanel from "@/components/dashboard/domain/DomainLadderContextPanel";
import DomeinDoelZetten from "@/components/dashboard/voortgang/DomeinDoelZetten";
import { emitAccountClientEvent } from "@/lib/account-events-client";
import { clarityTag } from "@/lib/clarity";
import { isDomainGoalDomain } from "@/lib/domain-goal";
import { GOAL_MODE_LINE } from "@/lib/domain-goal-client";
import { trackEvent } from "@/lib/ga4";
import { buildContextSpine, type ContextSpine } from "@/lib/kompas-context-spine";
import { useDomainGoalEditor } from "@/lib/use-domain-goal-editor";
import type { DashboardData, DashboardModel, PillarId } from "@/types/dashboard";

const SCORE_OPTIONS = Array.from({ length: 11 }, (_, index) => index);

type KompasContextSpineProps = {
  domain: PillarId;
  /**
   * De ladderlaag die het scherm ernaast uitlegt, of null op de Kompas-home.
   * Bepaalt óók of de keuze-zone bestaat: zonder open laag is er geen "deze laag".
   */
  openLayerId: number | null;
  data: DashboardData | undefined;
  model: DashboardModel | null;
  todayActionDone: boolean;
  /**
   * Staat er een domeinscherm open? Alleen dan draagt deze kolom de deur naar
   * het schap: op de Kompas-home doet `KompasOndersteuningTile` dat al, en twee
   * deuren naast elkaar naar hetzelfde schap is precies wat lock N1 verbiedt.
   */
  domainScreenOpen: boolean;
  onRemeasure?: () => void;
  /** Compactere maten in de bottom sheet — zelfde schaal als CockpitInspector. */
  compact?: boolean;
};

/**
 * "Context bij vandaag" als kompas- en alertheidskolom, met een eigen balk per
 * domein.
 *
 * Vier zones over één domein — urgentie (welke laag draagt de winst, en welke
 * feitzin uit je check zegt dat), doel (waar je op koerst), schap (het aanbod
 * van dít domein, of de reden dat het er niet is) en ritme (houd je het vast,
 * en wanneer wordt het weer gemeten). Staat er een ladderlaag open, dan komt
 * "wat jij hier koos" ertussen.
 *
 * Wat per domein verschilt staat in `domain-context-bar.ts`, niet hier: vijf
 * domeinen met vijf verschillende standen van check, readout en aanbod.
 *
 * De volgorde ligt vast in {@link buildContextSpine}: urgentie bovenaan, tenzij
 * de hermeting klaarstaat — dan is dát het dringendste, want die meting bepaalt
 * juist welke laag de winst-laag wordt.
 *
 * Wat hier níét staat, en waarom:
 * - **geen afvinken** — dat woont op Mijn Dag (`daily_action_log`), roadmap R4;
 *   het ritme meldt de stand, het verandert hem niet.
 * - **geen tweede ladder** — lock N6; de urgentie-zone toont één laag, niet zes.
 * - **geen productnaam, prijs of oordeel in de schap-zone** — lock L2; die
 *   horen achter de deur, waar we ze kunnen onderbouwen.
 *
 * De doel-zone droeg tot 26 augustus alleen leestekst (roadmap C-b: deze kolom
 * is dicht onder 1280px). Sindsdien deelt hij `useDomainGoalEditor` met
 * `KompasDoelIjkpunt` — zelfde schrijfpad, twee surfaces — want anders herscoor
 * je op twee plekken met twee losse formulieren voor precies hetzelfde cijfer.
 */
export default function KompasContextSpine({
  domain,
  openLayerId,
  data,
  model,
  todayActionDone,
  domainScreenOpen,
  onRemeasure,
  compact = false,
}: KompasContextSpineProps) {
  const goalDomain = isDomainGoalDomain(domain) ? domain : null;
  const {
    goals,
    goal,
    latestScore: goalScore,
    goalLine,
    existing: existingGoal,
    anchor: goalAnchor,
    editing: goalEditing,
    panelOpen: goalPanelOpen,
    pendingScore: goalPendingScore,
    busy: goalBusy,
    error: goalError,
    setPendingScore: setGoalPendingScore,
    openEdit: openGoalEdit,
    closeEdit: closeGoalEdit,
    openReformulate: openGoalReformulate,
    saveScore: saveGoalScore,
    applySaved: applyGoalSaved,
    closePanel: closeGoalPanel,
  } = useDomainGoalEditor(goalDomain, "kompas_context");

  const spine: ContextSpine = buildContextSpine({
    domain,
    openLayerId,
    data,
    model,
    todayActionDone,
  });

  const { bar } = spine;
  const cardClass = `rounded-[14px] border bg-black/20 ${compact ? "p-3" : "p-4"}`;
  const kickerClass =
    "mb-2 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em]";
  const titleClass = `font-serif leading-tight text-[#F1EFE8] ${
    compact ? "text-[15px]" : "text-[16px]"
  }`;
  const bodyClass = `leading-relaxed text-[#9FB0A6] text-pretty ${
    compact ? "text-[11.5px]" : "text-[12px]"
  }`;

  const domainStamp = (
    <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.08em] text-[#7E8C82]">
      <span style={{ color: bar.color }}>●</span> {bar.label}
    </p>
  );

  const urgency = spine.urgency;
  let urgencyZone: React.ReactNode = null;

  if (urgency?.kind === "laag") {
    urgencyZone = (
      <section
        key="urgentie"
        aria-label="Waar je winst nu zit"
        className={`${cardClass} ${
          urgency.isFocusLayer ? "border-[rgba(200,149,108,0.4)]" : "border-white/10"
        }`}
      >
        {urgency.stateLabel ? (
          <span
            className={`${kickerClass} ${
              urgency.isFocusLayer ? "text-[#C8956C]" : "text-[#9FB0A6]"
            }`}
          >
            <Icons.RouteMap
              s={13}
              style={{ color: urgency.isFocusLayer ? "#C8956C" : "#9FB0A6" }}
            />
            {urgency.stateLabel}
          </span>
        ) : null}
        <h3 className={titleClass}>{urgency.layerName}</h3>
        {domainStamp}

        {urgency.reason ? (
          <div className="mt-2.5 border-l border-white/10 pl-2.5">
            {urgency.reason.kind === "bewijs" ? (
              <>
                <p className="text-[11px] leading-snug text-[#CDD7D0]">
                  <span className="font-semibold">{urgency.reason.label}:</span>{" "}
                  {urgency.reason.answerLabel}
                  {urgency.reason.benchmarkLabel ? (
                    <span className="text-[#7E8C82]"> · {urgency.reason.benchmarkLabel}</span>
                  ) : null}
                </p>
                <p className="mt-1 text-[11.5px] leading-relaxed text-[#9FB0A6] text-pretty">
                  {urgency.reason.whyLine}
                </p>
              </>
            ) : (
              <p className="text-[11.5px] leading-relaxed text-[#9FB0A6] text-pretty">
                {urgency.reason.line}
              </p>
            )}
          </div>
        ) : (
          /* Geen reden uit de check betekent: geen reden tonen. Wat deze laag
             inhoudt lees je in de ladder zelf, in de middenkolom. */
          <p className="mt-2.5 text-[11.5px] leading-relaxed text-[#7E8C82] text-pretty">
            Je check zegt hier niets aparts over. Wat deze prioriteit inhoudt lees je in de
            ladder.
          </p>
        )}
      </section>
    );
  } else if (urgency?.kind === "geen_winstlaag") {
    urgencyZone = (
      <section
        key="urgentie"
        aria-label="Waar je winst nu zit"
        className={`${cardClass} border-white/10`}
      >
        <span className={`${kickerClass} text-[#9FB0A6]`}>
          <Icons.RouteMap s={13} style={{ color: "#9FB0A6" }} /> Nog geen winst-laag
        </span>
        <h3 className={titleClass}>{bar.label}</h3>
        <p className={`mt-2 ${bodyClass}`}>{urgency.line}</p>
        {urgency.cta ? (
          <Link
            href={urgency.cta.href}
            onClick={() => {
              trackEvent("dashboard_kompas_context_click", { zone: "check", domain });
              clarityTag("dashboard_kompas_context", `check_${domain}`);
            }}
            className="mt-3 inline-flex min-h-9 items-center gap-1.5 text-[13px] font-semibold text-[#5A8F6A] no-underline"
          >
            {urgency.cta.label} <Icons.ArrowRight s={13} />
          </Link>
        ) : null}
      </section>
    );
  }

  const doelZone =
    goalDomain && goals ? (
      <section
        key="doel"
        aria-label="Waar je naartoe werkt"
        className={`${cardClass} border-white/10 @container/ijkpunt`}
      >
        <div className="flex items-start justify-between gap-3">
          <span className={`${kickerClass} text-[#9FB0A6]`}>
            <Icons.Target s={13} style={{ color: "#9FB0A6" }} /> Waar je naartoe werkt
          </span>
          {goalEditing ? (
            <button
              type="button"
              onClick={closeGoalEdit}
              aria-label="Ijkpunt sluiten"
              className="-mr-1 -mt-1 shrink-0 cursor-pointer rounded-lg border-none bg-transparent px-1.5 py-1 text-[14px] leading-none text-[#9FB0A6] transition hover:text-[#E7EDE8]"
            >
              ✕
            </button>
          ) : null}
        </div>

        {goalEditing && goal ? (
          <>
            <h3 className={titleClass}>{goalLine}</h3>
            <p className={`mt-2 ${bodyClass}`}>
              {goalScore != null ? `Vorige keer ${goalScore} van 10. ` : ""}
              Hoe makkelijk gaat dit nu? 0 = lukt me niet · 10 = gaat vanzelf
            </p>

            <div className="mt-2.5 grid grid-cols-6 gap-1.5 @[420px]/ijkpunt:grid-cols-11">
              {SCORE_OPTIONS.map((value) => {
                const selected = value === goalPendingScore;
                return (
                  <button
                    key={value}
                    type="button"
                    disabled={goalBusy}
                    aria-pressed={selected}
                    onClick={() => setGoalPendingScore(value)}
                    className={`flex min-h-10 cursor-pointer items-center justify-center rounded-[9px] border text-[13.5px] font-semibold tabular-nums transition disabled:opacity-60 ${
                      selected
                        ? "border-[var(--sage)] bg-[var(--sage)] text-[#0f1c10]"
                        : "border-white/12 bg-black/25 text-[#CDD7D0] hover:border-white/25"
                    }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>

            {goalError ? (
              <p className="mt-2 mb-0 text-[12px] text-[#C8956C]">{goalError}</p>
            ) : null}

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={goalBusy || goalPendingScore == null}
                onClick={() => void saveGoalScore()}
                className="flex min-h-9 cursor-pointer items-center justify-center rounded-[10px] border-none bg-[var(--sage)] px-3.5 text-[12.5px] font-semibold text-[#0f1c10] transition disabled:opacity-50"
              >
                {goalBusy ? "Opslaan…" : "Opslaan"}
              </button>
              <button
                type="button"
                disabled={goalBusy}
                onClick={openGoalReformulate}
                className="cursor-pointer border-none bg-transparent p-0 text-[12px] font-medium text-[#9FB0A6] underline-offset-2 transition hover:text-[#E7EDE8] hover:underline disabled:opacity-60"
              >
                Ander doel kiezen
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={openGoalEdit}
            className="flex w-full cursor-pointer flex-col items-start border-none bg-transparent p-0 text-left"
          >
            {goal ? (
              <>
                <h3 className={titleClass}>{goalLine}</h3>
                <p className={`mt-2 ${bodyClass}`}>
                  {goalScore != null ? `Nu ${goalScore} van 10. ` : ""}
                  {goal.mode ? GOAL_MODE_LINE[goal.mode] : ""}
                </p>
              </>
            ) : (
              <p className={bodyClass}>
                Nog geen ijkpunt op {bar.label.toLowerCase()}. Zet er een — één zin en een
                cijfer, naast de score.
              </p>
            )}
            <span className="mt-1.5 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[var(--sage)]">
              {goal ? "Bijwerken" : "Zetten"}
              <Icons.ArrowRight s={13} />
            </span>
          </button>
        )}
      </section>
    ) : null;

  const doelPanel =
    goalDomain && goalPanelOpen ? (
      <DomeinDoelZetten
        key="doel-panel"
        open
        domain={goalDomain}
        domainLabel={bar.label}
        anchor={goalAnchor}
        existingGoal={existingGoal}
        onClose={closeGoalPanel}
        onSaved={(result) => {
          applyGoalSaved(result.score, result.reformulated, {
            situationId: result.situationId,
            ownWords: result.ownWords,
          });
        }}
      />
    ) : null;

  const keuzeZone =
    openLayerId != null ? (
      <DomainLadderContextPanel
        key="keuze"
        domain={domain}
        layerId={openLayerId}
        compact={compact}
      />
    ) : null;

  /* De deur naar het schap van dít domein — of de reden dat er geen schap is.
     Alleen op een domeinscherm: op de home draagt `KompasOndersteuningTile` de
     enige deur, en die gaat naar je prioriteitsdomein. */
  const schap = spine.schap;
  const schapZone = domainScreenOpen ? (
    <section
      key="schap"
      aria-label={schap.kind === "open" ? "Je schap" : "Geen schap op dit domein"}
      className={`${cardClass} border-white/10`}
    >
      <span className={`${kickerClass} text-[#9FB0A6]`}>
        <Icons.Pill s={13} style={{ color: "#9FB0A6" }} /> {schap.label}
      </span>
      {schap.kind === "open" ? (
        <>
          <p className={bodyClass}>{schap.line}</p>
          <Link
            href={schap.href}
            onClick={() => {
              emitAccountClientEvent("choice.shelf_opened", {
                domain,
                from_state: "kompas_domein",
                surface: "kompas_context",
                target_screen: "schap",
                target_tab: "producten",
              });
              trackEvent("dashboard_kompas_context_click", { zone: "schap", domain });
              clarityTag("dashboard_kompas_context", `schap_${domain}`);
            }}
            className="mt-3 inline-flex min-h-9 items-center gap-1.5 text-[13px] font-semibold text-[#5A8F6A] no-underline"
          >
            {schap.ctaLabel} <Icons.ArrowRight s={13} />
          </Link>
        </>
      ) : (
        <p className={bodyClass}>{schap.reason}</p>
      )}
    </section>
  ) : null;

  const ritme = spine.ritme;
  const ritmeAlert = ritme.tone === "alert";
  const handleRemeasure = () => {
    trackEvent("dashboard_kompas_context_click", {
      zone: "ritme",
      domain,
      due: ritme.remeasureDue,
    });
    clarityTag("dashboard_kompas_context", ritme.remeasureDue ? "hermeting_due" : "hermeting_vroeg");
    onRemeasure?.();
  };

  const ritmeZone = (
    <section
      key="ritme"
      aria-label="Je ritme"
      className={`${cardClass} ${
        ritmeAlert ? "border-[rgba(200,149,108,0.4)]" : "border-white/10"
      }`}
    >
      <span className={`${kickerClass} ${ritmeAlert ? "text-[#C8956C]" : "text-[#9FB0A6]"}`}>
        <Icons.Refresh s={13} style={{ color: ritmeAlert ? "#C8956C" : "#9FB0A6" }} />
        {ritme.kicker}
      </span>
      <p
        className={`leading-relaxed text-[#CDD7D0] text-pretty ${
          compact ? "text-[12px]" : "text-[12.5px]"
        }`}
      >
        {ritme.line}
      </p>
      {ritme.domainLine ? (
        <p className="mt-1.5 text-[11.5px] leading-relaxed text-[#CDD7D0] text-pretty">
          {ritme.domainLine}
        </p>
      ) : null}
      {ritme.cycleLine ? (
        <p className="mt-1.5 text-[11.5px] leading-relaxed text-[#9FB0A6] text-pretty">
          {ritme.cycleLine}
        </p>
      ) : null}
      {onRemeasure ? (
        ritme.remeasureDue ? (
          <button
            type="button"
            onClick={handleRemeasure}
            className="mt-3 inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-lg border-none bg-[#5A8F6A] px-3 text-[13px] font-semibold text-[#0f1c10]"
          >
            Doe de hermeting <Icons.ArrowRight s={13} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleRemeasure}
            className="mt-2 inline-flex cursor-pointer items-center gap-1 border-none bg-transparent p-0 text-[12.5px] font-semibold text-[#C8956C]"
          >
            Alvast je hermeting doen <Icons.ArrowRight s={12} />
          </button>
        )
      ) : null}
    </section>
  );

  const zones = spine.ritmeFirst
    ? [ritmeZone, urgencyZone, doelZone, keuzeZone, schapZone]
    : [urgencyZone, doelZone, keuzeZone, schapZone, ritmeZone];

  return (
    <>
      {zones}
      {doelPanel}
    </>
  );
}
