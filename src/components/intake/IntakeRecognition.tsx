"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { RecognitionContent, ThemeSlug } from "@/lib/content/themes";

type IntakeRecognitionProps = {
  themeSlug: ThemeSlug;
  answers: Record<string, number>;
  onBack: () => void;
  onContinue: () => void;
};

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; content: RecognitionContent };

export default function IntakeRecognition({
  themeSlug,
  answers,
  onBack,
  onContinue,
}: IntakeRecognitionProps) {
  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    const header = document.querySelector<HTMLElement>(".intake-layout-header");
    if (header) header.style.display = "none";
    return () => {
      if (header) header.style.display = "";
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setLoadState({ status: "loading" });
      try {
        const response = await fetch("/api/intake/recognition", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ theme_slug: themeSlug, answers }),
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          if (!cancelled) {
            setLoadState({
              status: "error",
              message:
                payload?.error ??
                "Herkenning kon niet worden geladen. Probeer het opnieuw.",
            });
          }
          return;
        }

        const content = (await response.json()) as RecognitionContent;
        if (!cancelled) {
          setLoadState({ status: "ready", content });
        }
      } catch {
        if (!cancelled) {
          setLoadState({
            status: "error",
            message: "Herkenning kon niet worden geladen. Probeer het opnieuw.",
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [themeSlug, answers]);

  return (
    <>
      <Link
        href="/"
        className="fixed right-4 top-4 z-50 px-1 py-1 text-[13px] text-intake-ink-subtle no-underline transition-colors hover:text-intake-ink"
        aria-label="Sluiten"
      >
        ✕ Sluiten
      </Link>

      <div className="mx-auto box-border w-full max-w-[480px] px-6 pb-10 pt-8">
        <header className="mb-6 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-intake-ink-subtle">
            <span className="text-intake-terra">04</span> · Herkenning
          </p>
          {loadState.status === "ready" ? (
            <>
              <h1 className="mb-1 font-serif text-[28px] font-normal leading-tight text-intake-ink">
                {loadState.content.theme.label}
              </h1>
              <p className="text-sm text-intake-ink-muted">
                {loadState.content.theme.sublabel}
              </p>
            </>
          ) : (
            <h1 className="mb-1 font-serif text-[28px] font-normal leading-tight text-intake-ink">
              Herkenning
            </h1>
          )}
        </header>

        {loadState.status === "loading" ? (
          <div
            className="flex min-h-[200px] flex-col items-center justify-center gap-3"
            role="status"
            aria-label="Laden"
          >
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-intake-card-border border-t-intake-terra" />
            <p className="text-sm text-intake-ink-subtle">Even geduld…</p>
          </div>
        ) : null}

        {loadState.status === "error" ? (
          <div className="rounded-2xl border border-intake-terra/30 bg-intake-terra/10 px-5 py-4 text-center">
            <p className="m-0 text-sm text-intake-ink-muted">{loadState.message}</p>
            <button
              type="button"
              onClick={onBack}
              className="mt-4 cursor-pointer text-sm font-medium text-intake-sage underline underline-offset-2"
            >
              Terug naar overzicht
            </button>
          </div>
        ) : null}

        {loadState.status === "ready" ? (
          <>
            <section
              className="mb-6 rounded-2xl border border-intake-card-border bg-intake-bg px-5 py-5"
              aria-label="Herkenningszinnen"
            >
              <ul className="m-0 list-none space-y-4 p-0">
                {loadState.content.lines.map((line, index) => (
                  <li
                    key={`recognition-${index}`}
                    className="text-[15px] leading-relaxed text-intake-ink"
                  >
                    {line}
                  </li>
                ))}
              </ul>
            </section>

            <div className="text-center">
              <button
                type="button"
                onClick={onContinue}
                className="inline-flex min-h-[44px] w-full cursor-pointer items-center justify-center rounded-[10px] border-none px-6 py-3.5 text-sm font-bold text-white"
                style={{ background: "#C8956C" }}
              >
                En wat kun je hieraan doen? →
              </button>
              <button
                type="button"
                onClick={onBack}
                className="mt-4 cursor-pointer text-sm font-medium text-intake-ink-subtle underline underline-offset-2 hover:text-intake-ink-muted"
              >
                ← Terug naar overzicht
              </button>
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}
