"use client";

import * as Icons from "@/components/app/icons";
import { useVoortgangFavorites, type VoortgangFavoriteItem } from "@/lib/voortgang-favorites-context";

type FavoriteSaveButtonProps = {
  item: VoortgangFavoriteItem;
  surface: string;
  compact?: boolean;
  /**
   * Eigen opschrift, voor surfaces waar "favorieten" niet het woord is dat de
   * gebruiker ziet — op de ladder heet dezelfde lijst "Mijn keuze". Alleen de
   * tekst wijkt af; het is dezelfde knop naar dezelfde bron.
   */
  labels?: { save: string; saved: string };
};

export default function FavoriteSaveButton({
  item,
  surface,
  compact = false,
  labels,
}: FavoriteSaveButtonProps) {
  const { isSaved, save, remove } = useVoortgangFavorites();
  const saved = isSaved(item.id);

  const handleClick = () => {
    if (saved) {
      remove(item.id);
      return;
    }
    save(item);
  };

  const savedLabel = labels?.saved ?? "Staat in favorieten";
  const saveLabel = labels?.save ?? "Bewaar in favorieten";
  const label = saved ? `${savedLabel} — klik om weg te halen` : saveLabel;

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={label}
        aria-pressed={saved}
        data-surface={surface}
        className="shrink-0 cursor-pointer rounded-lg border border-[var(--divider)] bg-transparent p-1.5 text-[var(--text-subtle)] transition hover:border-[var(--sage)] hover:text-[var(--sage)]"
      >
        <Icons.Heart
          s={16}
          style={{ color: saved ? "var(--sage)" : "currentColor", fill: saved ? "var(--sage)" : "none" }}
        />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={saved}
      data-surface={surface}
      className={`inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-semibold transition ${
        saved
          ? "border-[var(--sage)] bg-[rgba(90,143,106,0.14)] text-[var(--sage)]"
          : "border-[var(--divider)] bg-transparent text-[var(--text-muted)] hover:border-[var(--sage)] hover:text-[var(--sage)]"
      }`}
    >
      <Icons.Heart
        s={14}
        style={{ color: saved ? "var(--sage)" : "currentColor", fill: saved ? "var(--sage)" : "none" }}
      />
      {saved ? savedLabel : saveLabel}
    </button>
  );
}
