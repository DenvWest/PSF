// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import MijnKeuzes from "@/components/dashboard/keuze/MijnKeuzes";
import { nutrientRoute } from "@/data/nutrition/nutrient-routes";
import { VoortgangFavoritesProvider } from "@/lib/voortgang-favorites-context";

vi.mock("@/lib/ga4", () => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/clarity", () => ({ clarityTag: vi.fn() }));
vi.mock("@/lib/use-kernstof-normen", () => ({
  useEiwitDoel: () => null,
  useKernstofProfiel: () => ({ geslacht: null, zeventigPlus: false, voedingswijze: null, streefwaarden: {} }),
}));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it("een moment bij het supplement wordt via de echte favorieten-provider bewaard", async () => {
  const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
    if (url === "/api/account/favorites" && !init?.method) {
      return new Response(JSON.stringify({ items: [
        { id: "voeding-product-magnesium-vital-nutrition-citraat", title: "x", kind: "supplement" },
      ] }), { status: 200 });
    }
    return new Response(JSON.stringify({ items: [] }), { status: 200 });
  });
  vi.stubGlobal("fetch", fetchMock);
  render(
    <VoortgangFavoritesProvider>
      <MijnKeuzes
        statuses={[{ nutrient: "magnesium", label: "Magnesium", route: nutrientRoute("magnesium"), status: "gap", answerLabel: "", carriesVerdict: true, sources: [], supplementDoorOpen: false, doorReasonNl: "", comparisonPath: "" }]}
        reeksen={[]}
        onNaarVergelijken={vi.fn()}
      />
    </VoortgangFavoritesProvider>,
  );
  const kant = await screen.findByRole("region", { name: "Uit een supplement" });
  const lunch = within(kant).getByRole("button", { name: "Lunch" });
  fireEvent.click(lunch);
  await waitFor(() => expect(within(kant).getByRole("button", { name: "Lunch" }).getAttribute("aria-pressed")).toBe("true"));
});
