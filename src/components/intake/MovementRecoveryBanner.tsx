import Link from "next/link";
import type { MovementRecoveryHint } from "@/lib/movement-recovery-hint";

type MovementRecoveryBannerProps = {
  hint: MovementRecoveryHint;
};

export default function MovementRecoveryBanner({ hint }: MovementRecoveryBannerProps) {
  const tone =
    hint.level === "medical"
      ? "border-intake-terra/35 bg-intake-terra/8"
      : hint.level === "rest"
        ? "border-intake-sage/30 bg-intake-sage/8"
        : "border-intake-card-border bg-intake-bg-elevated/60";

  return (
    <aside
      className={`mb-4 rounded-xl border px-4 py-3 ${tone}`}
      aria-label="Herstel-tip voor vandaag"
    >
      <p className="text-sm font-semibold text-intake-ink">{hint.headline}</p>
      <p className="mt-1 text-sm leading-relaxed text-intake-ink-muted">{hint.body}</p>
      {hint.showMedicalNote ? (
        <p className="mt-2 text-xs leading-relaxed text-intake-ink-subtle">
          Geen diagnose — bij aanhoudende klachten:{" "}
          <Link
            href="/herstel-verbeteren-na-40#huisarts"
            className="font-medium text-intake-sage underline decoration-intake-sage/35 underline-offset-2"
          >
            bespreek het met je huisarts
          </Link>
          .
        </p>
      ) : null}
    </aside>
  );
}
