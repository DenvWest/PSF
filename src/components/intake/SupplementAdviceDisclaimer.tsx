type SupplementAdviceDisclaimerProps = {
  variant: "profile" | "foundation";
};

const COPY: Record<SupplementAdviceDisclaimerProps["variant"], string> = {
  profile:
    "Dit zijn mogelijke aandachtspunten uit je leefstijlcheck — geen persoonlijk medisch advies en niet voor iedereen geschikt. Bij medicatie, aandoeningen of twijfel: overleg met je huisarts.",
  foundation:
    "Algemene informatie die veel mannen 40+ vergelijken — niet automatisch geschikt voor jou. Geen vervanging van voeding, beweging of medisch advies.",
};

export default function SupplementAdviceDisclaimer({
  variant,
}: SupplementAdviceDisclaimerProps) {
  return (
    <p className="mb-4 rounded-lg border border-intake-card-border bg-white/[0.04] px-3 py-2.5 text-[12px] leading-snug text-intake-ink-muted">
      {COPY[variant]}
    </p>
  );
}
