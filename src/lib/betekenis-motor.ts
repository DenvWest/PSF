export type MeaningInput = {
  metric: string;
  referent?: string | null;
  anchorWhy?: string | null;
  implication?: string | null;
};

function trimPart(value: string | null | undefined): string | null {
  if (value == null) {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function buildMeaningSentence(input: MeaningInput): string {
  const metric = trimPart(input.metric);
  if (!metric) {
    return "";
  }

  let sentence = metric;

  const referent = trimPart(input.referent);
  if (referent) {
    sentence += ` — ${referent}`;
  }

  const anchorWhy = trimPart(input.anchorWhy);
  if (anchorWhy) {
    sentence += ` ${anchorWhy}`;
  }

  const implication = trimPart(input.implication);
  if (implication) {
    sentence += ` ${implication}`;
  }

  return sentence;
}

export function formatLastMeasured(dateIso: string, _now = new Date()): string {
  const date = new Date(dateIso);
  const formatted = new Intl.DateTimeFormat("nl-NL", {
    timeZone: "Europe/Amsterdam",
    day: "numeric",
    month: "short",
  }).format(date);

  return `Laatst gemeten · ${formatted}`;
}
