/** @vitest-environment jsdom */
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import FavoriteSaveButton from "@/components/dashboard/voortgang/FavoriteSaveButton";

const mockSave = vi.fn();
const mockRemove = vi.fn();
const mockIsSaved = vi.fn(() => false);

vi.mock("@/lib/voortgang-favorites-context", () => ({
  useVoortgangFavorites: () => ({
    isSaved: mockIsSaved,
    save: mockSave,
    remove: mockRemove,
    items: [],
    hydrated: true,
  }),
}));

describe("FavoriteSaveButton", () => {
  it("calls save when not yet saved", () => {
    render(
      <FavoriteSaveButton
        surface="test"
        item={{
          id: "card-1",
          title: "Kracht",
          kind: "activiteit",
          domain: "beweging",
          source: "aanbevolen",
        }}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Bewaar in favorieten" }));
    expect(mockSave).toHaveBeenCalledWith({
      id: "card-1",
      title: "Kracht",
      kind: "activiteit",
      domain: "beweging",
      source: "aanbevolen",
    });
  });
});
