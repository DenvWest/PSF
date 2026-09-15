import { describe, expect, it } from "vitest";
import { SNIPPET_CONTRACT_BASELINE } from "@/data/seo/snippet-contract-baseline";
import {
  auditSnippets,
  contentWords,
  findingKey,
  withoutSubstance,
  type SnippetPage,
} from "@/lib/seo/snippet-contract";
import { buildSnippetCorpus } from "@/lib/seo/snippet-corpus";

function page(overrides: Partial<SnippetPage>): SnippetPage {
  return {
    path: "/beste/x",
    substance: "magnesium",
    title: "Beste magnesium 2026: bisglycinaat, citraat of complex",
    description:
      "Bisglycinaat, citraat of complex? Drie magnesiumsupplementen vergeleken op vorm, elementaire mg per dag en prijs per dag. Voor mannen van 30 en ouder.",
    h1: "Beste magnesium: bisglycinaat, citraat of complex?",
    ...overrides,
  };
}

describe("snippet-contract — de regels zelf", () => {
  it("laat een snippet die aan alle regels voldoet ongemoeid", () => {
    expect(auditSnippets([page({})])).toEqual([]);
  });

  it("flagt twee pagina's met dezelfde titel", () => {
    const findings = auditSnippets([
      page({ path: "/beste/a" }),
      page({ path: "/beste/b", substance: "zink", h1: "Beste zink op zuiverheid en mg per dag" }),
    ]);

    expect(findings.map((f) => f.rule)).toContain("titel-uniek");
  });

  it("flagt hetzelfde sjabloon met alleen een andere stofnaam", () => {
    const findings = auditSnippets([
      page({
        path: "/supplementen/magnesium",
        substance: "magnesium",
        title: "Magnesium: welke vorm past bij jou?",
        h1: "Magnesium: welke vorm past bij jou?",
        description:
          "Magnesium uitgelegd: vormen, dosering en bij welke klachten die per vorm verschillen, zodat je weet welke vorm je nodig hebt.",
      }),
      page({
        path: "/supplementen/zink",
        substance: "zink",
        title: "Zink: welke vorm past bij jou?",
        h1: "Zink: welke vorm past bij jou?",
        description:
          "Zink uitgelegd: vormen, dosering en bij welke klachten die per vorm verschillen, zodat je weet welke vorm je nodig hebt.",
      }),
    ]);

    expect(findings.filter((f) => f.rule === "sjabloon").length).toBeGreaterThan(0);
  });

  it("flagt een te lange titel en een te korte beschrijving", () => {
    const findings = auditSnippets([
      page({
        title:
          "Magnesium Vergelijken: Alle Merken Uitgebreid Getest En Beoordeeld In 2026",
        description: "Magnesium vergeleken.",
      }),
    ]);

    expect(findings.map((f) => f.rule)).toEqual(
      expect.arrayContaining(["titel-lengte", "beschrijving-lengte"]),
    );
  });

  it("flagt een vergelijking en een gids die dezelfde belofte doen", () => {
    const findings = auditSnippets([
      page({ path: "/beste/magnesium", h1: "Welke magnesium past bij jou?" }),
      page({
        path: "/supplementen/magnesium",
        title: "Magnesium: welke vorm past bij jou?",
        h1: "Magnesium: welke vorm past bij jou?",
        description:
          "Magnesium uitgelegd: welke vormen er zijn, hoeveel elementair magnesium erin zit en wanneer een vorm wel of niet logisch is.",
      }),
    ]);

    const botsingen = findings.filter((f) => f.rule === "intentie-botsing");
    expect(botsingen.map((f) => f.path)).toEqual(
      expect.arrayContaining(["/beste/magnesium", "/supplementen/magnesium"]),
    );
  });

  it("haalt de stofnaam en sjabloonwoorden uit de vergelijking", () => {
    expect(withoutSubstance("Beste magnesium supplement", "magnesium")).toBe(
      "beste supplement",
    );
    expect(contentWords("Welke magnesium past bij jou?", "magnesium")).toEqual([]);
    expect(
      contentWords("Beste magnesium 2026: bisglycinaat of citraat", "magnesium"),
    ).toEqual(["bisglycinaat", "citraat"]);
  });
});

describe("snippet-contract — de live pagina's", () => {
  const findings = auditSnippets(buildSnippetCorpus());
  const bekend = new Set(SNIPPET_CONTRACT_BASELINE);
  const gevonden = new Set(findings.map(findingKey));

  it("levert geen nieuwe dubbele of generieke snippets op", () => {
    const nieuw = findings
      .filter((finding) => !bekend.has(findingKey(finding)))
      .map((finding) => `${findingKey(finding)} — ${finding.detail}`);

    expect(nieuw).toEqual([]);
  });

  it("houdt de baseline schoon: opgeloste regels horen eruit", () => {
    const verouderd = [...bekend].filter((key) => !gevonden.has(key));

    expect(verouderd).toEqual([]);
  });

  it("houdt /beste/magnesium — de rankende URL — buiten de baseline", () => {
    const magnesium = findings.filter(
      (finding) => finding.path === "/beste/magnesium",
    );

    expect(magnesium).toEqual([]);
  });
});
