type PaidActionDisclosureProps = {
  text: string;
  providerLabel?: string | null;
};

/** Inline affiliate/partner-disclosure boven een betaalde actie. Niet verbergbaar (KOAG/affiliate-conform). */
export default function PaidActionDisclosure({
  text,
  providerLabel,
}: PaidActionDisclosureProps) {
  return (
    <p className="mb-3 rounded-lg border border-intake-terra/30 bg-intake-terra/10 px-3 py-2 text-xs leading-relaxed text-intake-ink-muted">
      {providerLabel ? (
        <span className="font-semibold text-intake-ink">
          Aangeboden door {providerLabel}.{" "}
        </span>
      ) : null}
      {text}
    </p>
  );
}
