/**
 * Snippet-contract (A3). Het zoekresultaat is de enige plek waar een bezoeker
 * kiest tussen jouw pagina en die van iemand anders — en waar twee eigen
 * pagina's elkaar kunnen verdringen. Deze module toetst titel, beschrijving en
 * h1 van de vergelijkings- en gidspagina's op vier manieren:
 *
 *   1. uniek       — geen twee pagina's met dezelfde snippet
 *   2. lengte      — past binnen wat Google toont, en vult die ruimte ook
 *   3. sjabloon    — niet hetzelfde zinnetje met een andere stofnaam erin
 *   4. botsing     — /beste/x en /supplementen/x beloven niet hetzelfde
 *   5. rolverdeling — elke laag houdt zich aan de vorm uit
 *                     docs/research/BESLUIT_BESTE_VS_SUPPLEMENTEN_2026-09-04.md
 *
 * De regels zijn opzettelijk mechanisch: ze geven een groen/rood signaal bij het
 * schrijven van copy, ze beoordelen geen smaak.
 */

export type SnippetPage = {
  /** Uniek pad, bijv. /beste/magnesium. */
  path: string;
  /** Stof waar de pagina over gaat — bindt /beste/x aan /supplementen/x. */
  substance: string;
  title: string;
  description: string;
  h1: string;
};

export type SnippetRule =
  | "titel-uniek"
  | "beschrijving-uniek"
  | "h1-uniek"
  | "titel-lengte"
  | "beschrijving-lengte"
  | "sjabloon"
  | "intentie-botsing"
  | "rolverdeling";

export type SnippetFinding = {
  path: string;
  rule: SnippetRule;
  detail: string;
};

export const TITLE_MIN = 30;
export const TITLE_MAX = 60;
export const DESCRIPTION_MIN = 120;
export const DESCRIPTION_MAX = 160;

/** Vanaf deze overlap in betekenisdragende woorden beloven twee snippets hetzelfde. */
export const COLLISION_THRESHOLD = 0.6;

/** Woorden die op elke pagina staan en dus niets onderscheiden. */
const STOPWORDS = new Set([
  "de", "het", "een", "en", "of", "van", "voor", "op", "in", "met", "je",
  "jou", "jouw", "bij", "welke", "welk", "wat", "past", "is", "zijn", "die",
  "dat", "te", "per", "naar", "uit", "aan", "als", "ook", "er", "wordt",
  "worden", "hoe", "hoeveel", "doen", "nodig", "hebt", "heb", "beste",
  "supplement", "supplementen", "vergelijking", "vergeleken", "vergelijken",
  "uitgelegd", "onafhankelijk", "onafhankelijke", "objectief",
  "perfectsupplement", "getest", "eerlijk", "kiezen", "kies",
]);

export function normalizeSnippet(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function substanceTokens(substance: string): Set<string> {
  return new Set(normalizeSnippet(substance).split(" ").filter(Boolean));
}

/** De snippet met de stofnaam eruit — twee pagina's met hetzelfde restant delen één sjabloon. */
export function withoutSubstance(text: string, substance: string): string {
  const drop = substanceTokens(substance);
  return normalizeSnippet(text)
    .split(" ")
    .filter((word) => word.length > 0 && !drop.has(word))
    .join(" ");
}

/** Woorden die dít zoekresultaat onderscheiden van elk ander. */
export function contentWords(text: string, substance: string): string[] {
  const drop = substanceTokens(substance);
  return [
    ...new Set(
      normalizeSnippet(text)
        .split(" ")
        .filter(
          (word) =>
            word.length > 0 &&
            !STOPWORDS.has(word) &&
            !drop.has(word) &&
            // Een jaartal onderscheidt twee pagina's over dezelfde stof niet.
            !/^(19|20)\d{2}$/.test(word),
        ),
    ),
  ];
}

export function overlapRatio(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 1;
  const setB = new Set(b);
  const shared = a.filter((word) => setB.has(word)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 1 : shared / union;
}

function duplicates(
  pages: SnippetPage[],
  pick: (page: SnippetPage) => string,
  rule: SnippetRule,
  label: string,
): SnippetFinding[] {
  const byValue = new Map<string, string[]>();
  for (const page of pages) {
    const key = normalizeSnippet(pick(page));
    byValue.set(key, [...(byValue.get(key) ?? []), page.path]);
  }
  return [...byValue.entries()]
    .filter(([, paths]) => paths.length > 1)
    .flatMap(([, paths]) =>
      paths.map((path) => ({
        path,
        rule,
        detail: `${label} is identiek aan ${paths
          .filter((other) => other !== path)
          .join(", ")}`,
      })),
    );
}

function templateFindings(pages: SnippetPage[]): SnippetFinding[] {
  const fields: Array<[keyof SnippetPage, string]> = [
    ["title", "Titel"],
    ["description", "Beschrijving"],
    ["h1", "H1"],
  ];

  return fields.flatMap(([field, label]) => {
    const byShape = new Map<string, string[]>();
    for (const page of pages) {
      const shape = withoutSubstance(String(page[field]), page.substance);
      if (!shape) continue;
      byShape.set(shape, [...(byShape.get(shape) ?? []), page.path]);
    }
    return [...byShape.entries()]
      .filter(([, paths]) => paths.length > 1)
      .flatMap(([, paths]) =>
        paths.map((path) => ({
          path,
          rule: "sjabloon" as const,
          detail: `${label} is hetzelfde sjabloon als ${paths
            .filter((other) => other !== path)
            .join(", ")} — alleen de stofnaam verschilt`,
        })),
      );
  });
}

function lengthFindings(page: SnippetPage): SnippetFinding[] {
  const findings: SnippetFinding[] = [];
  const titleLength = page.title.trim().length;
  const descriptionLength = page.description.trim().length;

  if (titleLength < TITLE_MIN || titleLength > TITLE_MAX) {
    findings.push({
      path: page.path,
      rule: "titel-lengte",
      detail: `Titel is ${titleLength} tekens (moet ${TITLE_MIN}–${TITLE_MAX} zijn)`,
    });
  }
  if (
    descriptionLength < DESCRIPTION_MIN ||
    descriptionLength > DESCRIPTION_MAX
  ) {
    findings.push({
      path: page.path,
      rule: "beschrijving-lengte",
      detail: `Beschrijving is ${descriptionLength} tekens (moet ${DESCRIPTION_MIN}–${DESCRIPTION_MAX} zijn)`,
    });
  }
  return findings;
}

/**
 * Twee pagina's over dezelfde stof mogen niet dezelfde belofte doen: de
 * vergelijking gaat over kiezen en kopen, de gids over begrijpen. Een h1 of
 * titel zonder eigen betekenisdragende woorden botst per definitie.
 */
function collisionFindings(pages: SnippetPage[]): SnippetFinding[] {
  const bySubstance = new Map<string, SnippetPage[]>();
  for (const page of pages) {
    const key = normalizeSnippet(page.substance);
    bySubstance.set(key, [...(bySubstance.get(key) ?? []), page]);
  }

  const findings: SnippetFinding[] = [];
  for (const groep of bySubstance.values()) {
    for (let i = 0; i < groep.length; i += 1) {
      for (let j = i + 1; j < groep.length; j += 1) {
        for (const [field, label] of [
          ["h1", "H1"],
          ["title", "Titel"],
        ] as const) {
          const a = contentWords(groep[i][field], groep[i].substance);
          const b = contentWords(groep[j][field], groep[j].substance);
          const ratio = overlapRatio(a, b);
          // Twee snippets die allebei alleen uit sjabloonwoorden bestaan botsen
          // ook als ze toevallig geen woord delen — ze beloven dan allebei niets.
          const leeg = a.length < 2 && b.length < 2;
          if (!leeg && ratio < COLLISION_THRESHOLD) continue;
          const reden = leeg
            ? "geen eigen onderscheidend woord"
            : `${Math.round(ratio * 100)}% woordoverlap`;
          findings.push(
            {
              path: groep[i].path,
              rule: "intentie-botsing",
              detail: `${label} botst met ${groep[j].path} — ${reden}`,
            },
            {
              path: groep[j].path,
              rule: "intentie-botsing",
              detail: `${label} botst met ${groep[i].path} — ${reden}`,
            },
          );
        }
      }
    }
  }
  return findings;
}

/**
 * De rolverdeling uit BESLUIT_BESTE_VS_SUPPLEMENTEN_2026-09-04: /beste/* is de
 * commerciële laag en begint met "Beste"; /supplementen/* is de uitleglaag en
 * mag de keuzezin van de vergelijking niet lenen. Zonder deze regel groeit de
 * botsing gewoon terug bij de volgende contentronde.
 */
function roleFindings(page: SnippetPage): SnippetFinding[] {
  const h1 = normalizeSnippet(page.h1);

  if (page.path.startsWith("/beste/") && !h1.startsWith("beste ")) {
    return [
      {
        path: page.path,
        rule: "rolverdeling",
        detail: 'H1 van een vergelijkingspagina begint met "Beste"',
      },
    ];
  }

  if (page.path.startsWith("/supplementen/") && /\bpast bij jou\b/.test(h1)) {
    return [
      {
        path: page.path,
        rule: "rolverdeling",
        detail:
          'H1 van een gidspagina gebruikt de keuzezin "past bij jou" — die hoort bij /beste/*',
      },
    ];
  }

  return [];
}

export function auditSnippets(pages: SnippetPage[]): SnippetFinding[] {
  const findings = [
    ...duplicates(pages, (p) => p.title, "titel-uniek", "Titel"),
    ...duplicates(pages, (p) => p.description, "beschrijving-uniek", "Beschrijving"),
    ...duplicates(pages, (p) => p.h1, "h1-uniek", "H1"),
    ...pages.flatMap(lengthFindings),
    ...pages.flatMap(roleFindings),
    ...templateFindings(pages),
    ...collisionFindings(pages),
  ];

  return findings.sort(
    (a, b) => a.path.localeCompare(b.path) || a.rule.localeCompare(b.rule),
  );
}

/** `pad::regel` — de sleutel waarmee de baseline een bevinding aanwijst. */
export function findingKey(finding: Pick<SnippetFinding, "path" | "rule">): string {
  return `${finding.path}::${finding.rule}`;
}
