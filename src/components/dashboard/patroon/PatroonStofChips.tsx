import StofChipRij from "@/components/dashboard/StofChipRij";
import { STOF_TOON_KLEUR, type StofToon } from "@/components/dashboard/patroon/PatroonStofHero";
import type { PatroonStof } from "@/lib/nutrition-stof-meting";

export type StofChip = { stof: PatroonStof; label: string; toon: StofToon };

/**
 * De stoffen van Per stof als chips, met een stip voor de stand — dezelfde
 * taal als de stofchips in Keuze. "Overzicht" is de lijst met alle stoffen;
 * "Stoffen kiezen" opent de gedeelde kiezer voor wat je volgt.
 */
export default function PatroonStofChips({
  chips,
  actief,
  kiezerOpen,
  onKies,
  onKiezer,
}: {
  chips: readonly StofChip[];
  actief: PatroonStof | null;
  kiezerOpen: boolean;
  onKies: (stof: PatroonStof | null) => void;
  onKiezer: () => void;
}) {
  const chipKlasse = (aan: boolean) =>
    `vd-chip inline-flex min-h-[40px] items-center gap-1.5 ${aan ? "!border-[var(--vd-sage)] !text-[var(--vd-sage-2)]" : ""}`;

  return (
    <div className="mb-2.5">
      <StofChipRij label="Kies een stof" actief={actief}>
      <button type="button" aria-pressed={actief === null} onClick={() => onKies(null)} className={chipKlasse(actief === null)}>
        Overzicht
      </button>
      {chips.map((chip) => (
        <button
          key={chip.stof}
          type="button"
          aria-pressed={actief === chip.stof}
          onClick={() => onKies(chip.stof)}
          className={chipKlasse(actief === chip.stof)}
        >
          <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: STOF_TOON_KLEUR[chip.toon] }} />
          {chip.label}
        </button>
      ))}
      </StofChipRij>
      <button
        type="button"
        aria-expanded={kiezerOpen}
        onClick={onKiezer}
        className="min-h-[36px] cursor-pointer border-0 bg-transparent p-0 text-[0.75rem] font-semibold text-[var(--vd-sage-2)] hover:underline"
      >
        {kiezerOpen ? "Klaar met kiezen" : "+ Stoffen kiezen die je volgt"}
      </button>
    </div>
  );
}
