type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  titleAs?: "h2" | "h3";
  titleId?: string;
};

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  titleAs: TitleTag = "h2",
  titleId,
}: SectionHeadingProps) {
  const alignClass = align === "center" ? "text-center mx-auto max-w-4xl" : "";
  const descClass =
    align === "center" ? "mx-auto text-center" : "";

  return (
    <div className={`mb-14 sm:mb-20 md:mb-24 ${alignClass}`}>
      {eyebrow ? (
        <p className="text-[0.6875rem] font-medium uppercase tracking-[0.28em] text-[var(--ps-muted)] sm:text-xs">
          {eyebrow}
        </p>
      ) : null}
      <TitleTag
        id={titleId}
        className="font-display mt-5 text-[clamp(2rem,4.5vw,3.75rem)] font-light leading-[1.08] tracking-wide text-[var(--ps-ink)] sm:mt-6 md:text-[clamp(2.25rem,4vw,4.25rem)]"
      >
        {title}
      </TitleTag>
      {description ? (
        <p
          className={`mt-6 max-w-2xl text-[1.0625rem] leading-[1.7] text-[var(--ps-body)] sm:text-lg sm:leading-relaxed md:max-w-3xl md:text-xl md:leading-relaxed ${descClass}`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
