"use client";

import { useEffect, useId, useRef, useState } from "react";
import * as Icons from "@/components/app/icons";
import { clarityTag } from "@/lib/clarity";
import {
  CUSTOM_SITUATION_ID,
  getSituationLabel,
  isCustomSituation,
  isValidOwnWords,
  OWN_WORDS_MAX_LENGTH,
  orderSituationsForAnchor,
  type DomainGoalDomain,
  type SituationId,
} from "@/lib/domain-goal";
import type { MovementAnchor } from "@/lib/movement-prefs";

/**
 * Slice B (PLAN_EIGEN_IJKPUNT_DOEL_PER_DOMEIN.md §10.1): het zetmoment.
 * Eén call-site — de domeinrij in Voortgang — en werkt zowel voor het eerste
 * doel (situatie → eigen woorden → ijkpunt) als voor herscoren/herformuleren
 * van een bestaand doel, want zonder slice D is dit tot nader order de enige
 * plek waar het ijkpunt kan bewegen.
 */

export type DomeinDoelZettenExistingGoal = {
  situationId: SituationId;
  ownWords: string | null;
};

type DomeinDoelZettenProps = {
  open: boolean;
  domain: DomainGoalDomain;
  domainLabel: string;
  anchor: MovementAnchor | null;
  existingGoal: DomeinDoelZettenExistingGoal | null;
  onClose: () => void;
  onSaved: (result: {
    situationId: SituationId;
    ownWords: string | null;
    score: number;
    reformulated: boolean;
  }) => void;
};

type Step = "situatie" | "eigen_woorden" | "ijkpunt";

const SCORE_OPTIONS = Array.from({ length: 11 }, (_, i) => i);

export default function DomeinDoelZetten({
  open,
  domain,
  domainLabel,
  anchor,
  existingGoal,
  onClose,
  onSaved,
}: DomeinDoelZettenProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLElement>(null);

  const [step, setStep] = useState<Step>(existingGoal ? "ijkpunt" : "situatie");
  const [reformulating, setReformulating] = useState(!existingGoal);
  const [situationId, setSituationId] = useState<SituationId | null>(
    existingGoal?.situationId ?? null,
  );
  const [ownWords, setOwnWords] = useState(existingGoal?.ownWords ?? "");
  const [score, setScore] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    clarityTag("dashboard_voortgang_doel", `open_${domain}`);

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      clarityTag("dashboard_voortgang_doel", `close_${domain}`);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, domain]);

  if (!open) {
    return null;
  }

  const situations = orderSituationsForAnchor(domain, anchor);

  const handlePickSituation = (id: SituationId) => {
    setSituationId(id);
    if (isCustomSituation(id)) {
      setOwnWords("");
    } else if (!ownWords.trim()) {
      setOwnWords(getSituationLabel(domain, id));
    }
    setStep("eigen_woorden");
  };

  const handleStartReformulate = () => {
    setReformulating(true);
    setStep("situatie");
  };

  const handleSubmit = async () => {
    if (score == null) {
      return;
    }
    if (reformulating) {
      if (!situationId) {
        setError("Kies eerst een situatie.");
        return;
      }
      const trimmedOwnWords = ownWords.trim();
      if (situationId && isCustomSituation(situationId) && !trimmedOwnWords) {
        setError("Schrijf je doel zelf op.");
        return;
      }
      if (trimmedOwnWords && !isValidOwnWords(trimmedOwnWords)) {
        setError("Eigen woorden mogen maximaal 80 tekens zijn.");
        return;
      }
    }

    setBusy(true);
    setError(null);
    try {
      const body = reformulating
        ? {
            action: "set",
            domain,
            situationId,
            ownWords: ownWords.trim() || null,
            initialScore: score,
            entryPoint: "domeinrij",
          }
        : {
            action: "rescore",
            domain,
            score,
            entryPoint: "domeinrij",
          };

      const response = await fetch("/api/account/domain-goal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        setError("Opslaan lukte niet — probeer het zo nog eens.");
        setBusy(false);
        return;
      }

      onSaved({
        situationId: (reformulating ? situationId : existingGoal!.situationId)!,
        ownWords: reformulating ? ownWords.trim() || null : (existingGoal?.ownWords ?? null),
        score,
        reformulated: reformulating,
      });
      onClose();
    } catch {
      setError("Opslaan lukte niet — probeer het zo nog eens.");
      setBusy(false);
    }
  };

  const trimmedOwnWords = ownWords.trim();
  const isCustomGoal = situationId != null && isCustomSituation(situationId);
  const customWordsMissing = isCustomGoal && !trimmedOwnWords;

  return (
    <div className="fixed inset-0 z-[100]" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Sluit doel-scherm"
        onClick={onClose}
      />

      <aside
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="fixed bottom-0 left-0 right-0 flex max-h-[85vh] flex-col rounded-t-2xl border border-[#ebe7e2] bg-[#fcfbfa] shadow-2xl outline-none md:bottom-auto md:left-auto md:top-0 md:h-dvh md:max-h-none md:w-[420px] md:rounded-none md:rounded-l-2xl md:border-l md:border-t-0"
      >
        <div className="flex items-center justify-between gap-3 border-b border-[#ebe7e2] px-4 py-4 md:px-6">
          <h2
            id={titleId}
            className="m-0 text-[15px] font-semibold text-[#1c1917]"
            style={{ fontFamily: "var(--f-sans)" }}
          >
            Je doel · {domainLabel}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-9 shrink-0 cursor-pointer items-center rounded-lg border-none bg-transparent px-2 text-[18px] leading-none text-[#78716c] transition-colors hover:text-[#1c1917]"
            aria-label="Sluiten"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto px-4 py-4 md:px-6">
          {step === "situatie" ? (
            <>
              <p className="mb-3 text-[13px] leading-normal text-[#78716c]">
                Wat wil je zelf kunnen op het gebied van {domainLabel.toLowerCase()}?
              </p>
              <div className="flex flex-col gap-2">
                {situations.map((option) => {
                  const selected = option.id === situationId;
                  const isCustom = option.id === CUSTOM_SITUATION_ID;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      disabled={busy}
                      onClick={() => handlePickSituation(option.id)}
                      className="flex min-h-12 w-full cursor-pointer items-center justify-between gap-2 rounded-[12px] border px-3.5 text-left text-[14px] transition-colors disabled:opacity-60"
                      style={{
                        borderColor: isCustom
                          ? selected
                            ? "#b45309"
                            : "#d6b896"
                          : selected
                            ? "var(--sage)"
                            : "#e4e0da",
                        background: isCustom
                          ? selected
                            ? "rgba(180,120,60,0.16)"
                            : "rgba(180,120,60,0.08)"
                          : selected
                            ? "rgba(122,151,110,0.08)"
                            : "white",
                        color: "#1c1917",
                        fontFamily: "var(--f-sans)",
                      }}
                    >
                      {option.label}
                      {selected ? (
                        <Icons.Check
                          s={14}
                          style={{ color: isCustom ? "#b45309" : "var(--sage)" }}
                        />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </>
          ) : null}

          {step === "eigen_woorden" ? (
            <>
              {isCustomGoal ? (
                <p className="mb-2 text-[13px] leading-normal text-[#78716c]">
                  Schrijf je doel zelf op.
                </p>
              ) : null}
              <label className="mb-1 block">
                <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#78716c]">
                  Zet het in je eigen woorden
                </span>
                <textarea
                  value={ownWords}
                  disabled={busy}
                  maxLength={OWN_WORDS_MAX_LENGTH}
                  rows={2}
                  onChange={(event) => setOwnWords(event.target.value)}
                  className="w-full resize-none rounded-[10px] border border-[#e4e0da] bg-white px-3 py-2.5 text-[15px] text-[#1c1917] disabled:opacity-60"
                  style={{ fontFamily: "var(--f-sans)" }}
                />
              </label>
              <p className="mb-4 text-right text-[11px] text-[#a8a29e]">
                {trimmedOwnWords.length}/{OWN_WORDS_MAX_LENGTH}
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setStep("situatie")}
                  className="inline-flex min-h-11 cursor-pointer items-center rounded-[10px] border border-[#e4e0da] bg-white px-4 text-[14px] font-medium text-[#1c1917] disabled:opacity-60"
                  style={{ fontFamily: "var(--f-sans)" }}
                >
                  Terug
                </button>
                <button
                  type="button"
                  disabled={busy || customWordsMissing}
                  onClick={() => setStep("ijkpunt")}
                  className="flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-[10px] border-none text-[14px] font-semibold disabled:opacity-60"
                  style={{
                    background: "var(--sage)",
                    color: "#0f1c10",
                    fontFamily: "var(--f-sans)",
                  }}
                >
                  Volgende
                  <Icons.ChevronRight s={14} />
                </button>
              </div>
            </>
          ) : null}

          {step === "ijkpunt" ? (
            <>
              {!reformulating && existingGoal ? (
                <p className="mb-3 text-[13px] leading-normal text-[#78716c]">
                  Je doel:{" "}
                  <span className="font-medium text-[#1c1917]">
                    {existingGoal.ownWords || getSituationLabel(domain, existingGoal.situationId)}
                  </span>
                </p>
              ) : null}

              <p className="mb-1 text-[15px] font-medium text-[#1c1917]">
                Hoe makkelijk gaat dit op dit moment?
              </p>
              <p className="mb-4 text-[12px] text-[#78716c]">
                0 = lukt me niet · 10 = gaat vanzelf
              </p>

              <div className="mb-5 grid grid-cols-6 gap-2 sm:grid-cols-11">
                {SCORE_OPTIONS.map((value) => {
                  const selected = value === score;
                  return (
                    <button
                      key={value}
                      type="button"
                      disabled={busy}
                      onClick={() => setScore(value)}
                      aria-pressed={selected}
                      className="flex min-h-11 cursor-pointer items-center justify-center rounded-[10px] border text-[14px] font-semibold tabular-nums transition-colors disabled:opacity-60"
                      style={{
                        borderColor: selected ? "var(--sage)" : "#e4e0da",
                        background: selected ? "var(--sage)" : "white",
                        color: selected ? "#0f1c10" : "#1c1917",
                        fontFamily: "var(--f-sans)",
                      }}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>

              {error ? <p className="mb-3 text-[13px] text-[#b45309]">{error}</p> : null}

              <div className="flex gap-2">
                {reformulating && existingGoal ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setStep("eigen_woorden")}
                    className="inline-flex min-h-11 cursor-pointer items-center rounded-[10px] border border-[#e4e0da] bg-white px-4 text-[14px] font-medium text-[#1c1917] disabled:opacity-60"
                    style={{ fontFamily: "var(--f-sans)" }}
                  >
                    Terug
                  </button>
                ) : null}
                <button
                  type="button"
                  disabled={busy || score == null}
                  onClick={() => void handleSubmit()}
                  className="flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-[10px] border-none text-[14px] font-semibold disabled:opacity-60"
                  style={{
                    background: "var(--sage)",
                    color: "#0f1c10",
                    fontFamily: "var(--f-sans)",
                  }}
                >
                  {reformulating ? "Doel opslaan" : "Ijkpunt opslaan"}
                </button>
              </div>

              {!reformulating && existingGoal ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleStartReformulate}
                  className="mt-3 cursor-pointer border-none bg-transparent p-0 text-[12.5px] font-medium text-[var(--sage)] underline-offset-2 hover:underline disabled:opacity-60"
                  style={{ fontFamily: "var(--f-sans)" }}
                >
                  Ander doel kiezen
                </button>
              ) : null}
            </>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
