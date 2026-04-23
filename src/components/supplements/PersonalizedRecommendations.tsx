"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { buildRecommendations } from "@/lib/build-recommendations";
import type { IntakeSessionPayload } from "@/lib/intake-session-payload";

export default function PersonalizedRecommendations() {
  const [session, setSession] = useState<IntakeSessionPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch("/api/intake/session");
        const data: { session?: IntakeSessionPayload | null } = await res.json();
        setSession(data.session ?? null);
      } catch {
        setSession(null);
      } finally {
        setLoading(false);
      }
    }
    fetchSession();
  }, []);

  if (loading) return null;

  if (!session) {
    return null;
  }

  const recommendations = buildRecommendations(session);

  if (recommendations.length === 0) return null;

  return (
    <section className="mb-16">
      <p className="text-xs font-medium uppercase tracking-widest text-[#5A8F6A] mb-3">
        Aanbevolen voor jou
      </p>
      <h2 className="font-serif text-2xl text-stone-900 mb-2">
        Op basis van jouw Leefstijlcheck
      </h2>
      <p className="text-stone-500 text-sm mb-8">Profiel: {session.profile}</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((rec) => (
          <div
            key={rec.slug}
            className="rounded-2xl border border-stone-200 bg-white p-6 flex flex-col"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{rec.icon}</span>
              <h3 className="font-semibold text-stone-900">{rec.name}</h3>
            </div>
            <p className="text-sm text-stone-600 mb-6 flex-1">{rec.reason}</p>
            <div className="flex flex-col gap-2">
              <Link
                href={rec.guideHref}
                className="text-sm font-medium text-[#5A8F6A] hover:text-[#4a7a5a] transition-colors"
              >
                Lees de gids →
              </Link>
              {rec.comparisonHref ? (
                <Link
                  href={rec.comparisonHref}
                  className="text-sm font-medium text-[#C4873B] hover:text-[#a36e2f] transition-colors"
                >
                  Vergelijk producten →
                </Link>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
