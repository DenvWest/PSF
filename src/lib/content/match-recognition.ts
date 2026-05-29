export type RecognitionMatchOperator = "<=" | ">=" | "=" | "in";

export type RecognitionLineCandidate = {
  body_text: string;
  match_question_id: string;
  match_operator: RecognitionMatchOperator;
  match_value: unknown;
  priority: number;
};

function parseMatchValue(raw: unknown): number | number[] | null {
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return raw;
  }
  if (Array.isArray(raw)) {
    const nums = raw.filter(
      (entry): entry is number =>
        typeof entry === "number" && Number.isFinite(entry),
    );
    return nums.length > 0 ? nums : null;
  }
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (/^\d+$/.test(trimmed)) {
      return Number(trimmed);
    }
    try {
      const parsed: unknown = JSON.parse(trimmed);
      return parseMatchValue(parsed);
    } catch {
      return null;
    }
  }
  return null;
}

export function matchesRecognitionLine(
  line: RecognitionLineCandidate,
  answers: Record<string, number>,
): boolean {
  const answer = answers[line.match_question_id];
  if (typeof answer !== "number" || !Number.isFinite(answer)) {
    return false;
  }

  const expected = parseMatchValue(line.match_value);
  if (expected === null) {
    return false;
  }

  switch (line.match_operator) {
    case "<=":
      return typeof expected === "number" && answer <= expected;
    case ">=":
      return typeof expected === "number" && answer >= expected;
    case "=":
      return typeof expected === "number" && answer === expected;
    case "in":
      return Array.isArray(expected) && expected.includes(answer);
    default:
      return false;
  }
}

export function pickRecognitionLines(
  lines: RecognitionLineCandidate[],
  answers: Record<string, number>,
  limit = 3,
): string[] {
  return lines
    .filter((line) => matchesRecognitionLine(line, answers))
    .sort((a, b) => a.priority - b.priority)
    .map((line) => line.body_text)
    .slice(0, limit);
}
