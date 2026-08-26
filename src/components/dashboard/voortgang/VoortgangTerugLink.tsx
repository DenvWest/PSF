"use client";

import * as Icons from "@/components/app/icons";

/**
 * Terugweg binnen Voortgang. Was een ronde icoonknop naast de kop; die at op
 * telefoonbreedte ~50px van de titel op, terwijl de balk in de header nu al
 * zegt waar je bent. Als tekstlink erbóven kost hij één regel en leest hij
 * ook voor wat hij doet.
 */
export default function VoortgangTerugLink({ onBack }: { onBack: () => void }) {
  return (
    <button
      type="button"
      onClick={onBack}
      className="mb-2.5 inline-flex cursor-pointer items-center gap-0.5 border-none bg-transparent p-0 text-[12.5px] font-semibold text-[#9FB0A6] transition hover:text-[#F1EFE8]"
    >
      <Icons.ChevronLeft s={14} sw={2} style={{ color: "currentColor" }} />
      Overzicht
    </button>
  );
}
