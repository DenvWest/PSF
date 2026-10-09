import { describe, expect, it } from "vitest";
import { leesPatroonUrl, metPatroonStand } from "@/lib/patroon-url";

describe("patroon-url", () => {
  it("leest sectie, stof, zoekterm en periode, en negeert onzin", () => {
    expect(leesPatroonUrl("?tab=voortgang&sectie=stof&stof=protein&zoek=eiwit&periode=30")).toEqual({
      sectie: "stof",
      stof: "protein",
      zoek: "eiwit",
      periode: "30",
    });
    expect(leesPatroonUrl("?sectie=x&stof=lood&periode=99")).toEqual({
      sectie: null,
      stof: null,
      zoek: "",
      periode: null,
    });
  });

  it("schrijft de stand en laat tab staan; leeg wist de parameter", () => {
    const href = "http://localhost/dashboard?tab=voortgang&zoek=oud";
    expect(metPatroonStand(href, { sectie: "stof", stof: "magnesium", zoek: "" })).toBe(
      "/dashboard?tab=voortgang&sectie=stof&stof=magnesium",
    );
    expect(metPatroonStand(href, { zoek: " pompoen " })).toBe("/dashboard?tab=voortgang&zoek=pompoen");
  });
});
