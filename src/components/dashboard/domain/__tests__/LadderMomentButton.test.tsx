// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import LadderMomentButton from "@/components/dashboard/domain/LadderMomentButton";
import { addAgendaDays, todayInAgendaTimezone } from "@/lib/agenda-week-preview";
import { LadderMomentsProvider } from "@/lib/ladder-moments-context";
import { formatMomentDay, resolveQuickLadderMoment } from "@/lib/ladder-moments";
import type { AgendaBlockRecord } from "@/types/agenda";

const TITLE = "Onderbreek elk werkuur twee minuten — staan is genoeg.";

function blockFor(date: string): AgendaBlockRecord {
  return {
    id: "block-1",
    date,
    categoryId: "beweging",
    title: TITLE,
    startTime: "09:00",
    endTime: "09:30",
    source: "routine",
    status: "open",
    externalProvider: null,
    externalRef: null,
    deletedAt: null,
  };
}

function mockAgenda(existing: AgendaBlockRecord[]) {
  const created: unknown[] = [];
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    if (url.startsWith("/api/account/agenda-blocks") && (!init || init.method === undefined)) {
      return new Response(JSON.stringify({ blocks: existing }), { status: 200 });
    }
    if (init?.method === "POST") {
      const body = JSON.parse(String(init.body)) as Record<string, unknown>;
      created.push(body);
      return new Response(
        JSON.stringify({
          block: { ...blockFor(String(body.date)), startTime: String(body.startTime) },
        }),
        { status: 200 },
      );
    }
    return new Response("{}", { status: 200 });
  });
  vi.stubGlobal("fetch", fetchMock);
  return { created };
}

function renderButton() {
  return render(
    <LadderMomentsProvider>
      <LadderMomentButton domain="beweging" title={TITLE} surface="kompas_beweging" layer={1} />
    </LadderMomentsProvider>,
  );
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("LadderMomentButton — een keuze krijgt een datum en een tijd", () => {
  it("plant in één klik op het voorgestelde moment", async () => {
    const { created } = mockAgenda([]);
    const quick = resolveQuickLadderMoment();
    renderButton();

    // De bestemming staat in het opschrift, dus de klik verrast niet.
    const knop = await screen.findByRole("button", { name: /Zet op Mijn Dag/ });
    expect(knop.textContent).toContain(formatMomentDay(quick.date));
    fireEvent.click(knop);

    await waitFor(() => expect(created).toHaveLength(1));
    expect(created[0]).toMatchObject({
      categoryId: "beweging",
      title: TITLE,
      date: quick.date,
      startTime: quick.startTime,
    });
    expect(await screen.findByText(/Staat op Mijn Dag/)).toBeTruthy();
  });

  it("vraagt geen datum voordat er iets staat — de kiezer hoort bij verplaatsen", async () => {
    mockAgenda([]);
    renderButton();

    await screen.findByRole("button", { name: /Zet op Mijn Dag/ });
    expect(screen.queryByRole("button", { name: "Morgen" })).toBeNull();
    expect(screen.queryByText(/Welke dag\?/)).toBeNull();
  });

  it("toont een bestaand moment meteen, zonder opnieuw te plannen", async () => {
    mockAgenda([blockFor(todayInAgendaTimezone())]);
    renderButton();

    expect(await screen.findByText(/Staat op Mijn Dag · vandaag · 09:00/)).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Zet op Mijn Dag/ })).toBeNull();
    expect(screen.queryByRole("button", { name: "Verplaatsen" })).not.toBeNull();
  });

  it("belooft geen ritme dat de agenda niet kent", async () => {
    mockAgenda([]);
    renderButton();

    fireEvent.click(await screen.findByRole("button", { name: /Zet op Mijn Dag/ }));
    fireEvent.click(await screen.findByRole("button", { name: "Verplaatsen" }));
    expect(screen.queryByText(/Eén moment op je agenda/)).not.toBeNull();
    expect(document.body.textContent ?? "").not.toMatch(/elke week|wekelijks herhalen/i);
  });

  it("is doorklikbaar naar Mijn Dag op de dag van het moment", async () => {
    const date = addAgendaDays(todayInAgendaTimezone(), 2);
    mockAgenda([blockFor(date)]);
    window.history.pushState(null, "", "/dashboard?tab=vandaag&kompas=beweging");
    renderButton();

    fireEvent.click(await screen.findByRole("button", { name: /Staat op Mijn Dag/ }));

    expect(window.location.pathname).toBe("/dashboard");
    expect(window.location.search).toContain("tab=agenda");
    expect(window.location.search).toContain(`dag=${date}`);
  });

  it("verdwijnt stil buiten de provider", () => {
    const { container } = render(
      <LadderMomentButton domain="beweging" title={TITLE} surface="kompas_beweging" />,
    );
    expect(container.firstChild).toBeNull();
  });
});
