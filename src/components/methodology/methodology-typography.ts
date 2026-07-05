export const methodologyH2Class =
  "font-serif text-3xl md:text-4xl lg:text-5xl leading-tight text-balance text-stone-900";

export const methodologyLeadClass =
  "mt-4 max-w-2xl text-base leading-[1.75] text-stone-700 md:text-lg";

export const methodologyLeadColumnClass =
  "mt-4 max-w-xl text-base leading-[1.75] md:text-lg";

export const methodologySectionLabelClass =
  "font-serif text-lg text-stone-900";

export const methodologyBodyClass =
  "text-base leading-[1.75] text-stone-600";

export const methodologyBodySmClass =
  "text-sm leading-[1.75] text-stone-600 md:text-base";

export function splitLeadOnDelimiter(
  text: string,
  delimiter: string,
): [string, string | null] {
  const idx = text.indexOf(delimiter);
  if (idx === -1) return [text, null];
  return [text.slice(0, idx + delimiter.length).trimEnd(), text.slice(idx + delimiter.length).trim()];
}
