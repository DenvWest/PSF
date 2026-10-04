/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/ga4", () => ({ trackEvent: vi.fn() }));

function antwoord(body: unknown, status = 200) {
  return Promise.resolve(new Response(JSON.stringify(body), { status }));
}

async function laadKiezer() {
  vi.resetModules();
  const { default: Kiezer } = await import("@/components/dashboard/doelen/GevolgdeStoffenKiezer");
  const { trackEvent } = await import("@/lib/ga4");
  return { Kiezer, trackEvent };
}

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("GevolgdeStoffenKiezer", () => {
  it("zet een stof aan, bewaart de lijst en meet het", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockImplementationOnce(() => antwoord({ stoffen: [] }));
    fetchMock.mockImplementationOnce(() => antwoord({ stoffen: ["calciumMg"] }));
    const { Kiezer, trackEvent } = await laadKiezer();

    render(<Kiezer surface="patroon" />);
    const knop = await screen.findByRole("button", { name: /Calcium/ });
    await waitFor(() => expect((knop as HTMLButtonElement).disabled).toBe(false));
    fireEvent.click(knop);

    await waitFor(() => expect(knop.getAttribute("aria-pressed")).toBe("true"));
    const [, init] = fetchMock.mock.calls[1]!;
    expect(JSON.parse(String(init?.body))).toEqual({ stoffen: ["calciumMg"] });
    expect(trackEvent).toHaveBeenCalledWith("voedingsdoel_aangepast", {
      setting: "gevolgde_stof_aan",
      stof: "calciumMg",
      surface: "patroon",
    });
  });

  it("springt terug en toont de fout als opslaan mislukt", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockImplementationOnce(() => antwoord({ stoffen: [] }));
    fetchMock.mockImplementationOnce(() => antwoord({ error: "Stoffen volgen kan nog niet." }, 503));
    const { Kiezer } = await laadKiezer();

    render(<Kiezer surface="doelen" />);
    const knop = await screen.findByRole("button", { name: /Vezels/ });
    await waitFor(() => expect((knop as HTMLButtonElement).disabled).toBe(false));
    fireEvent.click(knop);

    expect((await screen.findByRole("alert")).textContent).toContain("Stoffen volgen kan nog niet.");
    expect(knop.getAttribute("aria-pressed")).toBe("false");
  });
});
