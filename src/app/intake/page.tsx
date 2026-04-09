"use client";

import { useEffect, useState } from "react";
import {
  CATEGORIES,
  QUESTIONS,
  SYMPTOMS,
  type CategoryId,
  type SymptomId,
} from "@/data/intake-questions";
import type { DomainScores } from "@/lib/intake-engine";
import {
  calcDomainScores,
  getAdvice,
  getProfileLabel,
  getUrgency,
} from "@/lib/intake-engine";

type Phase =
  | "intro"
  | "symptoms"
  | "questions"
  | "calculating"
  | "results";

const CATEGORY_TO_SCORE_KEY: Record<CategoryId, keyof DomainScores> = {
  slaap: "sleep_score",
  energie: "energy_score",
  stress: "stress_score",
  voeding: "nutrition_score",
  beweging: "movement_score",
  herstel: "recovery_score",
};

export default function IntakePage() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [symptoms, setSymptoms] = useState<SymptomId[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [scores, setScores] = useState<DomainScores | null>(null);

  useEffect(() => {
    if (phase !== "calculating") {
      return;
    }

    const timer = setTimeout(() => {
      setScores(calcDomainScores(answers));
      setPhase("results");
    }, 2000);

    return () => clearTimeout(timer);
  }, [phase, answers]);

  function toggleSymptom(id: SymptomId) {
    setSymptoms((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  }

  function selectAnswer(value: number) {
    const q = QUESTIONS[currentQ];
    setAnswers((prev) => ({ ...prev, [q.id]: value }));
    if (currentQ < 11) {
      setCurrentQ((c) => c + 1);
    } else {
      setPhase("calculating");
    }
  }

  if (phase === "intro") {
    return (
      <div>
        <p>Intro — korte intake voor je profiel.</p>
        <button type="button" onClick={() => setPhase("symptoms")}>
          Start
        </button>
      </div>
    );
  }

  if (phase === "symptoms") {
    return (
      <div>
        <p>Selecteer symptomen (meerdere mogelijk)</p>
        {SYMPTOMS.map((s) => (
          <div key={s.id}>
            <button type="button" onClick={() => toggleSymptom(s.id)}>
              {symptoms.includes(s.id) ? "[x]" : "[ ]"} {s.label}
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => {
            setCurrentQ(0);
            setAnswers({});
            setPhase("questions");
          }}
        >
          Verder naar vragen
        </button>
      </div>
    );
  }

  if (phase === "questions") {
    const q = QUESTIONS[currentQ];
    return (
      <div>
        <p>
          Vraag {currentQ + 1} van {QUESTIONS.length}
        </p>
        <p>{q.question}</p>
        {q.options.map((opt) => (
          <div key={opt.label}>
            <button type="button" onClick={() => selectAnswer(opt.value)}>
              {opt.label}
            </button>
          </div>
        ))}
      </div>
    );
  }

  if (phase === "calculating") {
    return <div>Berekenen…</div>;
  }

  if (phase === "results") {
    if (!scores) {
      return <div>Geen scores beschikbaar.</div>;
    }

    const urgency = getUrgency(scores);
    const profile = getProfileLabel(scores);
    const advice = getAdvice(scores, answers, symptoms);

    return (
      <div>
        <p>Resultaten</p>
        <p>Urgentie: {urgency.label}</p>
        <p>
          Profiel: {profile.name} (domein {profile.domain}, score{" "}
          {profile.score})
        </p>
        <p>Domeinscores</p>
        <ul>
          {CATEGORIES.map((cat) => (
            <li key={cat.id}>
              {cat.label}: {scores[CATEGORY_TO_SCORE_KEY[cat.id]]}
            </li>
          ))}
        </ul>
        <p>Snelle winst</p>
        <ul>
          {advice.quickWins.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <p>Supplementen</p>
        <ul>
          {advice.supplements.map((s) => (
            <li key={s.name}>
              {s.name} — {s.reason}
            </li>
          ))}
        </ul>
        <p>Langetermijn</p>
        <ul>
          {advice.longTerm.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>
    );
  }

  return null;
}
