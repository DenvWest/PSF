// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  captureNurtureToken,
  getNurtureToken,
  _resetNurtureCapture,
} from "@/lib/nurture-click-attribution";

function setLocationSearch(search: string) {
  Object.defineProperty(window, "location", {
    value: {
      ...window.location,
      pathname: "/beste/magnesium",
      search,
      hash: "",
    },
    writable: true,
    configurable: true,
  });
}

describe("captureNurtureToken", () => {
  beforeEach(() => {
    _resetNurtureCapture();
    vi.spyOn(history, "replaceState").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("capture leest nt uit URL en cachet het", () => {
    setLocationSearch("?nt=test-token-abc&foo=bar");

    captureNurtureToken();

    expect(getNurtureToken()).toBe("test-token-abc");
  });

  it("strip verwijdert alleen nt, overige queryparams blijven behouden", () => {
    setLocationSearch("?foo=1&nt=mijn-token&bar=2");

    captureNurtureToken();

    const replaceCall = vi.mocked(history.replaceState).mock.calls[0];
    const newUrl = replaceCall?.[2] as string;
    expect(newUrl).toContain("foo=1");
    expect(newUrl).toContain("bar=2");
    expect(newUrl).not.toContain("nt=");
  });

  it("strip verwijdert nt ook als het de enige param is (geen trailing ?)", () => {
    setLocationSearch("?nt=solo-token");

    captureNurtureToken();

    const replaceCall = vi.mocked(history.replaceState).mock.calls[0];
    const newUrl = replaceCall?.[2] as string;
    expect(newUrl).not.toContain("?");
    expect(newUrl).not.toContain("nt=");
  });

  it("tweede capture-call is no-op (history.replaceState niet opnieuw aangeroepen)", () => {
    setLocationSearch("?nt=token-once");

    captureNurtureToken();
    captureNurtureToken();

    expect(vi.mocked(history.replaceState)).toHaveBeenCalledTimes(1);
  });

  it("getNurtureToken geeft gecachte waarde terug ná strip", () => {
    setLocationSearch("?nt=cached-token");

    captureNurtureToken();
    // Simuleer dat de URL al gestript is (geen nt meer in location.search)
    setLocationSearch("");

    expect(getNurtureToken()).toBe("cached-token");
  });

  it("geen nt in URL → getNurtureToken geeft null", () => {
    setLocationSearch("?foo=bar");

    captureNurtureToken();

    expect(getNurtureToken()).toBeNull();
    expect(vi.mocked(history.replaceState)).not.toHaveBeenCalled();
  });

  it("lege URL → getNurtureToken geeft null", () => {
    setLocationSearch("");

    captureNurtureToken();

    expect(getNurtureToken()).toBeNull();
  });
});
