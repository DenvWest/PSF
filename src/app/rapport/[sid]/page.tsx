import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeltaRadar } from "@/components/report/DeltaRadar";
import { DeltaRow } from "@/components/report/DeltaRow";
import {
  computePerDomainDelta,
  loadBaselineSnapshot,
} from "@/lib/intake-baseline";
import type { DomainScoreKey, DomainScores } from "@/lib/intake-engine";
import { verifySignedIntakeSessionCookie } from "@/lib/intake-session-cookie";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export const metadata: Metadata = {
  title: "Jouw 30-dagen beeld | PerfectSupplement",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://www.perfectsupplement.nl/rapport" },
};

const DOMAIN_LABELS: Record<DomainScoreKey, string> = {
  sleep_score: "Slaap",
  energy_score: "Energie",
  stress_score: "Stress",
  nutrition_score: "Voeding",
  movement_score: "Beweging",
  recovery_score: "Herstel",
};

const DOMAIN_KEYS: DomainScoreKey[] = [
  "sleep_score",
  "energy_score",
  "stress_score",
  "nutrition_score",
  "movement_score",
  "recovery_score",
];

type Params = Promise<{ sid: string }>;
type SearchParams = Promise<{ base?: string }>;

async function loadRemeasureScores(
  remeasureSessionId: string,
): Promise<DomainScores | null> {
  const admin = createSupabaseAdmin();
  if (!admin) return null;

  const { data, error } = await admin
    .from("intake_sessions")
    .select("domain_scores")
    .eq("id", remeasureSessionId)
    .maybeSingle();

  if (error || !data) return null;

  const raw = data.domain_scores;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;

  const record = raw as Record<string, unknown>;
  const scores = {} as DomainScores;
  for (const key of DOMAIN_KEYS) {
    if (typeof record[key] !== "number" || !Number.isFinite(record[key])) {
      return null;
    }
    scores[key] = record[key] as number;
  }
  return scores;
}

export default async function RapportPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { sid } = await params;
  const { base } = await searchParams;

  const remeasureSessionId = verifySignedIntakeSessionCookie(
    decodeURIComponent(sid),
  );
  const baselineSessionId = base
    ? verifySignedIntakeSessionCookie(decodeURIComponent(base))
    : null;

  if (!remeasureSessionId || !baselineSessionId) {
    notFound();
  }

  const [remeasureScores, baselineSnapshot] = await Promise.all([
    loadRemeasureScores(remeasureSessionId),
    loadBaselineSnapshot(baselineSessionId),
  ]);

  if (!remeasureScores || !baselineSnapshot) {
    notFound();
  }

  const delta = computePerDomainDelta(
    baselineSnapshot.domainScores,
    remeasureScores,
  );

  const daysSinceBaseline = Math.max(
    0,
    Math.round(
      (Date.now() - new Date(baselineSnapshot.frozenAt).getTime()) /
        (24 * 60 * 60 * 1000),
    ),
  );

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-7xl px-6 lg:px-8 mx-auto py-12">
        <div className="max-w-2xl mx-auto">
          <header className="mb-8 text-center">
            <p className="text-sm font-medium text-emerald-600 mb-2">
              30-dagen hermeting
            </p>
            <h1 className="text-3xl font-bold text-slate-900 mb-3">
              Zo veranderde je beeld in {daysSinceBaseline} dagen
            </h1>
            <p className="text-slate-500 text-base">
              Profiel:{" "}
              <span className="font-medium text-slate-700">
                {baselineSnapshot.profileLabel}
              </span>
            </p>
          </header>

          <section aria-label="Spinnenwebgrafiek" className="mb-10">
            <DeltaRadar
              baseline={baselineSnapshot.domainScores}
              current={remeasureScores}
              daysSinceBaseline={daysSinceBaseline}
            />
          </section>

          <section
            aria-label="Verandering per domein"
            className="bg-white rounded-2xl border border-slate-200 p-6 mb-8"
          >
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Verandering per domein
            </h2>
            <div>
              {DOMAIN_KEYS.map((key) => (
                <DeltaRow
                  key={key}
                  label={DOMAIN_LABELS[key]}
                  delta={delta[key]}
                />
              ))}
            </div>
          </section>

          <aside className="bg-emerald-50 rounded-2xl border border-emerald-100 p-6 mb-8">
            <p className="text-sm text-emerald-800 leading-relaxed">
              Dit overzicht toont hoe jouw ingevulde antwoorden zich verhouden
              tot je startmeting. Het is geen medische diagnose en koppelt geen
              oorzaak aan een supplement.
            </p>
          </aside>

          <nav
            aria-label="Verdere stappen"
            className="flex flex-col sm:flex-row gap-3"
          >
            <Link
              href="/intake"
              className="flex-1 text-center bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              Nieuwe intake starten
            </Link>
            <Link
              href="/rapport"
              className="flex-1 text-center border border-slate-300 hover:border-slate-400 text-slate-700 font-medium py-3 px-6 rounded-xl transition-colors"
            >
              Wat is de hermeting?
            </Link>
          </nav>
        </div>
      </div>
    </main>
  );
}
