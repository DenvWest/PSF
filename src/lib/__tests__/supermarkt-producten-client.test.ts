import { afterEach, describe, expect, it, vi } from "vitest";
import { haalNevoProductenViaApi } from "@/lib/supermarkt-producten-client";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("haalNevoProductenViaApi", () => {
  it("splitst meer dan 60 codes over meerdere verzoeken en voegt ze samen", async () => {
    const fetchMock = vi.fn(async (url: string) => {
      const codes = decodeURIComponent(url.split("codes=")[1]!).split(",");
      expect(codes.length).toBeLessThanOrEqual(60);
      return new Response(JSON.stringify({ producten: codes.map((code) => ({ prodId: `nevo:${code}` })) }));
    });
    vi.stubGlobal("fetch", fetchMock);

    const codes = Array.from({ length: 130 }, (_, i) => String(i + 1));
    const producten = await haalNevoProductenViaApi(codes);

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(producten).toHaveLength(130);
  });

  it("houdt de rest als één stuk mislukt", async () => {
    let aanroep = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        aanroep += 1;
        if (aanroep === 1) return new Response("{}", { status: 500 });
        return new Response(JSON.stringify({ producten: [{ prodId: "nevo:x" }] }));
      }),
    );
    const producten = await haalNevoProductenViaApi(Array.from({ length: 61 }, (_, i) => String(i)));
    expect(producten).toEqual([{ prodId: "nevo:x" }]);
  });
});
