import { describe, expect, it } from "vitest";
import { PILLAR } from "@/data/dashboard";
import {
  buildVandaagFollowUp,
  buildVandaagOnderbouwingHref,
  firstSentence,
  getVandaagContextLine,
} from "@/lib/vandaag-card-links";

describe("firstSentence", () => {
  it("returns the first sentence before a period", () => {
    expect(
      firstSentence(
        "Je valt laat in of slaapt onrustig. Na 40 reageert je diepe slaap sneller op licht.",
      ),
    ).toBe("Je valt laat in of slaapt onrustig.");
  });

  it("returns the segment before an em dash", () => {
    expect(
      firstSentence(
        "Je blijft 'aan' staan na werk — begin bij je ademhaling, niet bij een supplement.",
      ),
    ).toBe("Je blijft 'aan' staan na werk");
  });

  it("returns trimmed text when no delimiter is present", () => {
    expect(firstSentence("  Eén contactmoment deze week  ")).toBe(
      "Eén contactmoment deze week",
    );
  });
});

describe("buildVandaagOnderbouwingHref", () => {
  it("routes voeding to the nutrition evidence page", () => {
    expect(buildVandaagOnderbouwingHref("voeding")).toBe(
      "/onderbouwing/voeding?from=dashboard",
    );
  });

  it("routes other domains to the general evidence page", () => {
    expect(buildVandaagOnderbouwingHref("slaap")).toBe(
      "/onderbouwing?from=dashboard",
    );
  });
});

describe("buildVandaagFollowUp", () => {
  it("links to the domain check-in when available", () => {
    expect(buildVandaagFollowUp("slaap")).toEqual({
      href: "/intake/slaap?from=dashboard",
      label: "Check-in bijwerken",
    });
  });

  it("links to kompas deep view when no check-in route exists", () => {
    expect(buildVandaagFollowUp("verbinding")).toEqual({
      href: "/dashboard?tab=vandaag&kompas=verbinding",
      label: "Meer over Verbinding",
    });
  });
});

describe("getVandaagContextLine", () => {
  it("prefers a concise habit detail over the pillar lever", () => {
    const line = getVandaagContextLine(PILLAR.slaap, {
      detail: "Schermen weg na 21:00 helpt je diepe slaap.",
    });

    expect(line).toBe("Schermen weg na 21:00 helpt je diepe slaap.");
  });

  it("falls back to the pillar lever when habit detail is long", () => {
    const line = getVandaagContextLine(PILLAR.slaap, {
      detail:
        "Een langere uitleg over waarom je avondritme belangrijk is en hoe je dat in kleine stappen kunt verbeteren zonder direct alles te veranderen.",
    });

    expect(line).toBe(firstSentence(PILLAR.slaap.lever));
  });

  it("uses quickWin detail when lever is empty", () => {
    const pillar = {
      lever: "",
      quickWin: { title: "Test", detail: "Korte quick win uitleg." },
    };

    expect(getVandaagContextLine(pillar, null)).toBe("Korte quick win uitleg.");
  });
});
