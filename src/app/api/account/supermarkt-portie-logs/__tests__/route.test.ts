import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { todayInAgendaTimezone } from "@/lib/agenda-week-preview";
import type { SupermarktProduct } from "@/types/supermarkt-product";
import { GET, POST } from "../route";

const PRODUCT: SupermarktProduct = {
  prodId: "off:1",
  bron: "off",
  bronId: "1",
  naam: "Havermelk",
  merk: null,
  categorie: null,
  snapshotDatum: "2026-10-01",
  energyKcal: 45,
  fatG: 1.5,
  saturatedFatG: null,
  carbohydrateG: 6.5,
  sugarsG: null,
  fiberG: null,
  proteinG: 1,
  saltG: null,
  sodiumMg: null,
  calciumMg: null,
  ironMg: null,
  vitaminCMg: null,
  vitaminDµg: null,
  potassiumMg: null,
  magnesiumMg: null,
  zincMg: null,
  vitaminB12µg: null,
};

const LOG = { id: "l1", moment: "ontbijt", prodId: "off:1", grams: 200, createdAt: "2026-10-03T08:00:00Z" };

const mockList = vi.fn();
const mockListPeriode = vi.fn();
const mockInsert = vi.fn();
const mockHaalOp = vi.fn();

vi.mock("@/lib/account-server", () => ({
  getAccountFromCookie: vi.fn(async () => ({ id: "acc-1" })),
}));
vi.mock("@/lib/rate-limit", () => ({
  consumeRateLimitForIp: vi.fn(async () => ({ allowed: true, retryAfterSeconds: 0 })),
}));
vi.mock("@/lib/rate-limit-config", () => ({ getRateLimitConfig: vi.fn(() => ({})) }));
vi.mock("@/lib/turnstile-verify", () => ({ getClientIp: vi.fn(() => "127.0.0.1") }));
vi.mock("@/config/org", () => ({ DEFAULT_ORG_ID: "00000000-0000-0000-0000-000000000001" }));
vi.mock("@/lib/db/scoped", () => ({
  orgScoped: vi.fn(() => ({ raw: {} })),
  unscoped: vi.fn(() => ({ eenAdminClient: true })),
}));
vi.mock("@/lib/account-supermarkt-portie-logs", () => ({
  listSupermarktPortieLogs: (...args: unknown[]) => mockList(...args),
  listSupermarktPortieLogsInPeriode: (...args: unknown[]) => mockListPeriode(...args),
  insertSupermarktPortieLog: (...args: unknown[]) => mockInsert(...args),
  deleteSupermarktPortieLog: vi.fn(),
}));
vi.mock("@/lib/dagboek-producten", () => ({
  haalDagboekProductenOp: (...args: unknown[]) => mockHaalOp(...args),
}));

const DATUM = todayInAgendaTimezone();

function postVerzoek(body: unknown) {
  return new NextRequest("http://localhost/api/account/supermarkt-portie-logs", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("/api/account/supermarkt-portie-logs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockList.mockResolvedValue([LOG]);
    mockInsert.mockResolvedValue(LOG);
    mockHaalOp.mockResolvedValue(new Map([[PRODUCT.prodId, PRODUCT]]));
  });

  describe("GET", () => {
    const verzoek = () =>
      new NextRequest(`http://localhost/api/account/supermarkt-portie-logs?date=${DATUM}`);

    it("koppelt het product aan elke log bij het uitlezen", async () => {
      const response = await GET(verzoek());
      const json = await response.json();
      expect(response.status).toBe(200);
      expect(json.items[0].product).toEqual(PRODUCT);
      expect(json.items[0].grams).toBe(200);
    });

    it("breekt het dagboek niet als de producttabel niet bereikbaar is", async () => {
      mockHaalOp.mockRejectedValue(new Error('relation "sm_products" does not exist'));
      const response = await GET(verzoek());
      const json = await response.json();
      expect(response.status).toBe(200);
      expect(json.items).toHaveLength(1);
      expect(json.items[0].product).toBeNull();
    });

    it("vraagt geen producten op voor een lege dag", async () => {
      mockList.mockResolvedValue([]);
      const response = await GET(verzoek());
      expect((await response.json()).items).toEqual([]);
      expect(mockHaalOp).not.toHaveBeenCalled();
    });
  });

  describe("GET met een periode", () => {
    const verzoek = (van: string, tot: string) =>
      new NextRequest(`http://localhost/api/account/supermarkt-portie-logs?van=${van}&tot=${tot}`);
    const terug = (dagen: number) => {
      const datum = new Date(`${DATUM}T00:00:00Z`);
      datum.setUTCDate(datum.getUTCDate() - dagen);
      return datum.toISOString().slice(0, 10);
    };

    it("geeft de porties per datum terug, met product, in één verzoek", async () => {
      mockListPeriode.mockResolvedValue(new Map([[DATUM, [LOG]]]));
      const response = await GET(verzoek(terug(41), DATUM));
      const json = await response.json();
      expect(response.status).toBe(200);
      expect(json.perDag[DATUM][0].product).toEqual(PRODUCT);
      expect(mockHaalOp).toHaveBeenCalledTimes(1);
    });

    it("weigert een periode van meer dan 42 dagen of omgekeerd", async () => {
      expect((await GET(verzoek(terug(42), DATUM))).status).toBe(400);
      expect((await GET(verzoek(DATUM, terug(1)))).status).toBe(400);
      expect((await GET(verzoek("gisteren", DATUM))).status).toBe(400);
      expect(mockListPeriode).not.toHaveBeenCalled();
    });
  });

  describe("POST", () => {
    const body = { date: DATUM, moment: "ontbijt", prodId: "off:1", grams: 200 };

    it("slaat een verwijzing op en geeft de log mét product terug", async () => {
      const response = await POST(postVerzoek(body));
      const json = await response.json();
      expect(response.status).toBe(200);
      expect(json.item.product).toEqual(PRODUCT);
      expect(mockInsert).toHaveBeenCalledWith(
        { raw: {} },
        "acc-1",
        DATUM,
        { moment: "ontbijt", prodId: "off:1", grams: 200 },
      );
    });

    it("weigert een prodId dat niet in de producttabel staat, en schrijft niets", async () => {
      mockHaalOp.mockResolvedValue(new Map());
      const response = await POST(postVerzoek({ ...body, prodId: "off:onbekend" }));
      expect(response.status).toBe(400);
      expect(mockInsert).not.toHaveBeenCalled();
    });

    it("weigert een ongeldig gewicht", async () => {
      expect((await POST(postVerzoek({ ...body, grams: 0 }))).status).toBe(400);
      expect((await POST(postVerzoek({ ...body, grams: "veel" }))).status).toBe(400);
      expect(mockInsert).not.toHaveBeenCalled();
    });

    it("begrenst een onzinnig groot gewicht", async () => {
      await POST(postVerzoek({ ...body, grams: 99999 }));
      expect(mockInsert.mock.calls[0]?.[3]).toMatchObject({ grams: 2000 });
    });

    it("geeft 500 als de producttabel niet bereikbaar is, en schrijft niets", async () => {
      mockHaalOp.mockRejectedValue(new Error("tabel weg"));
      const response = await POST(postVerzoek(body));
      expect(response.status).toBe(500);
      expect(mockInsert).not.toHaveBeenCalled();
    });
  });
});
