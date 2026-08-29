import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const adminMock = vi.hoisted(() => ({ createSupabaseAdmin: vi.fn() }));
vi.mock("@/lib/supabase-admin", () => adminMock);

type Row = {
  id: string;
  organization_id: string;
  occurred_at: string;
  event_type: string;
  session_id: string | null;
  email: string | null;
  payload: Record<string, unknown> | null;
  delivered_to: string[];
};

function row(id: string, delivered: string[]): Row {
  return {
    id,
    organization_id: "org-1",
    occurred_at: `2026-08-29T10:0${id}:00Z`,
    event_type: "intake.track_chosen",
    session_id: "sess-1",
    email: null,
    payload: { track: "supplement" },
    delivered_to: delivered,
  };
}

/** Minimale PostgREST-dubbel die vastlegt wélke filters de query meestuurt. */
function makeAdmin(rows: Row[]) {
  const filters: string[] = [];
  const updated: Array<{ id: string; delivered_to: string[] }> = [];

  const selectBuilder = () => {
    let selectedId: string | null = null;
    const builder = {
      not(column: string, operator: string, value: string) {
        filters.push(`${column}.not.${operator}.${value}`);
        return builder;
      },
      eq(_column: string, id: string) {
        selectedId = id;
        return builder;
      },
      order() {
        return builder;
      },
      limit() {
        const remaining = rows.filter(
          (candidate) => !candidate.delivered_to.includes("n8n_webhook"),
        );
        return Promise.resolve({ data: remaining, error: null });
      },
      maybeSingle() {
        const match = rows.find((candidate) => candidate.id === selectedId) ?? null;
        return Promise.resolve({ data: match, error: null });
      },
    };
    return builder;
  };

  return {
    filters,
    updated,
    admin: {
      from() {
        return {
          select: selectBuilder,
          update(values: { delivered_to: string[] }) {
            return {
              eq(_column: string, id: string) {
                updated.push({ id, delivered_to: values.delivered_to });
                return Promise.resolve({ error: null });
              },
            };
          },
        };
      },
    },
  };
}

describe("runPendingN8nDomainEvents", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.N8N_WEBHOOK_URL = "https://n8n.example.test/webhook/psf";
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: true, status: 200 }) as unknown as Response),
    );
  });

  afterEach(() => {
    delete process.env.N8N_WEBHOOK_URL;
    vi.unstubAllGlobals();
    adminMock.createSupabaseAdmin.mockReset();
  });

  it("vraagt de database alleen om events die n8n nog niet heeft gehad", async () => {
    const { filters, admin } = makeAdmin([row("1", ["posthog"])]);
    adminMock.createSupabaseAdmin.mockReturnValue(admin);

    const { runPendingN8nDomainEvents } = await import("@/lib/n8n-webhook");
    await runPendingN8nDomainEvents();

    expect(filters).toContain("delivered_to.not.cs.{n8n_webhook}");
  });

  it("blijft nieuwe events doorsturen als de oudste rijen al bezorgd zijn", async () => {
    const bulk = Array.from({ length: 50 }, (_, index) =>
      row(String(index), ["posthog", "n8n_webhook"]),
    );
    const { admin, updated } = makeAdmin([...bulk, row("99", ["posthog"])]);
    adminMock.createSupabaseAdmin.mockReturnValue(admin);

    const { runPendingN8nDomainEvents } = await import("@/lib/n8n-webhook");
    const result = await runPendingN8nDomainEvents();

    expect(result).toEqual({ forwarded: 1, errors: 0 });
    expect(updated.map((entry) => entry.id)).toEqual(["99"]);
  });

  it("markeert niets als de webhook faalt", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: false, status: 500 }) as unknown as Response),
    );
    const { admin, updated } = makeAdmin([row("1", ["posthog"])]);
    adminMock.createSupabaseAdmin.mockReturnValue(admin);

    const { runPendingN8nDomainEvents } = await import("@/lib/n8n-webhook");
    const result = await runPendingN8nDomainEvents();

    expect(result).toEqual({ forwarded: 0, errors: 1 });
    expect(updated).toEqual([]);
  });

  it("doet niets zonder N8N_WEBHOOK_URL", async () => {
    delete process.env.N8N_WEBHOOK_URL;
    const { admin } = makeAdmin([row("1", ["posthog"])]);
    adminMock.createSupabaseAdmin.mockReturnValue(admin);

    const { runPendingN8nDomainEvents } = await import("@/lib/n8n-webhook");
    expect(await runPendingN8nDomainEvents()).toEqual({ forwarded: 0, errors: 0 });
  });
});
