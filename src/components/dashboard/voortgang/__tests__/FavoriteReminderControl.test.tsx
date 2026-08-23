/** @vitest-environment jsdom */
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import FavoriteReminderControl from "@/components/dashboard/voortgang/FavoriteReminderControl";
import type { VoortgangFavoriteItem } from "@/lib/voortgang-favorites-context";

const mockUpdateReminder = vi.fn();
const mockIsSaved = vi.fn(() => true);
let mockItems: VoortgangFavoriteItem[] = [];

vi.mock("@/lib/voortgang-favorites-context", () => ({
  useVoortgangFavorites: () => ({
    isSaved: mockIsSaved,
    updateReminder: mockUpdateReminder,
    items: mockItems,
    hydrated: true,
  }),
}));

const baseItem: VoortgangFavoriteItem = {
  id: "laag-beweging-p1-onderbreek-elk-werkuur",
  title: "Onderbreek elk werkuur twee minuten — staan is genoeg.",
  kind: "activiteit",
  domain: "beweging",
  source: "aanbevolen",
};

describe("FavoriteReminderControl", () => {
  it("rendert niets als de actie nog niet bewaard is", () => {
    mockIsSaved.mockReturnValue(false);
    mockItems = [];
    const { container } = render(<FavoriteReminderControl item={baseItem} surface="test" />);
    expect(container.firstChild).toBeNull();
  });

  it("roept updateReminder aan met de gekozen starttijd, samengevoegd met het bestaande item", () => {
    mockIsSaved.mockReturnValue(true);
    mockItems = [baseItem];
    render(<FavoriteReminderControl item={baseItem} surface="test" />);

    fireEvent.click(screen.getByRole("button", { name: "Tijdstip" }));
    fireEvent.click(screen.getByRole("button", { name: "Kies 09:00" }));
    fireEvent.click(screen.getByRole("button", { name: "Bevestig" }));

    expect(mockUpdateReminder).toHaveBeenCalledWith(
      { ...baseItem, reminderStartTime: "09:00" },
      "test",
    );
  });

  it("'Herhaalt zich' aanzetten voegt eindtijd en interval toe", () => {
    mockIsSaved.mockReturnValue(true);
    mockItems = [{ ...baseItem, reminderStartTime: "09:00" }];
    render(<FavoriteReminderControl item={baseItem} surface="test" />);

    fireEvent.click(screen.getByRole("button", { name: "Herhaalt zich" }));

    expect(mockUpdateReminder).toHaveBeenCalledWith(
      {
        ...baseItem,
        reminderStartTime: "09:00",
        reminderEndTime: "17:00",
        reminderIntervalMinutes: 60,
      },
      "test",
    );
  });

  it("'Herhaalt zich' uitzetten verwijdert eindtijd en interval weer", () => {
    mockIsSaved.mockReturnValue(true);
    mockItems = [
      {
        ...baseItem,
        reminderStartTime: "09:00",
        reminderEndTime: "17:00",
        reminderIntervalMinutes: 60,
      },
    ];
    render(<FavoriteReminderControl item={baseItem} surface="test" />);

    fireEvent.click(screen.getByRole("button", { name: "Herhaalt zich" }));

    const [calledItem] = mockUpdateReminder.mock.calls[0] as [VoortgangFavoriteItem, string];
    expect(calledItem.reminderEndTime).toBeUndefined();
    expect(calledItem.reminderIntervalMinutes).toBeUndefined();
    expect(calledItem.reminderStartTime).toBe("09:00");
  });

  it("melding aanzetten zonder starttijd defaultet naar 09:00", () => {
    mockIsSaved.mockReturnValue(true);
    mockItems = [baseItem];
    render(<FavoriteReminderControl item={baseItem} surface="test" />);

    fireEvent.click(screen.getByRole("switch", { name: "Melding aan/uit" }));

    expect(mockUpdateReminder).toHaveBeenCalledWith(
      { ...baseItem, alertEnabled: true, reminderStartTime: "09:00" },
      "test",
    );
  });
});
