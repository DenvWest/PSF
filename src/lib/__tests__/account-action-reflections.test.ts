import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  isReflectionAnswer,
  listReflectedBlockIds,
  listReflectionAnswers,
  upsertActionReflection,
} from "@/lib/account-action-reflections";

function selectStub(result: { data: unknown; error: unknown }) {
  const chain = {
    select: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    order: vi.fn(() => chain),
    limit: vi.fn(() => Promise.resolve(result)),
    then: (resolve: (value: unknown) => unknown) => Promise.resolve(result).then(resolve),
  };
  return { from: vi.fn(() => chain), chain } as unknown as {
    from: () => typeof chain;
    chain: typeof chain;
  };
}

describe("isReflectionAnswer", () => {
  it("laat alleen de drie vaste antwoorden door", () => {
    expect(isReflectionAnswer("gelukt")).toBe(true);
    expect(isReflectionAnswer("deels")).toBe(true);
    expect(isReflectionAnswer("niet")).toBe(true);
  });

  it("weigert vrije tekst", () => {
    // Vrije tekst hoort nooit in een event- of opslagpad.
    expect(isReflectionAnswer("ging wel oké")).toBe(false);
    expect(isReflectionAnswer("")).toBe(false);
    expect(isReflectionAnswer("GELUKT")).toBe(false);
  });
});

describe("listReflectedBlockIds", () => {
  it("levert de beantwoorde blok-ids", async () => {
    const stub = selectStub({ data: [{ block_id: "a" }, { block_id: "b" }], error: null });
    const ids = await listReflectedBlockIds(stub as unknown as SupabaseClient, "acc");
    expect(ids).toEqual(["a", "b"]);
  });

  it("geeft een lege lijst bij een fout in plaats van te werpen", async () => {
    const stub = selectStub({ data: null, error: { message: "boom" } });
    await expect(
      listReflectedBlockIds(stub as unknown as SupabaseClient, "acc"),
    ).resolves.toEqual([]);
  });
});

describe("listReflectionAnswers", () => {
  it("filtert waarden die niet in de enum zitten", async () => {
    const stub = selectStub({
      data: [{ answer: "gelukt" }, { answer: "onzin" }, { answer: "niet" }],
      error: null,
    });
    const answers = await listReflectionAnswers(
      stub as unknown as SupabaseClient,
      "acc",
      "voeding",
    );
    expect(answers).toEqual(["gelukt", "niet"]);
  });
});

describe("upsertActionReflection", () => {
  it("schrijft op (account, blok) zodat een tweede antwoord niet stapelt", async () => {
    const upsert = vi.fn(() => Promise.resolve({ error: null }));
    const supabase = { from: vi.fn(() => ({ upsert })) } as unknown as SupabaseClient;

    const ok = await upsertActionReflection(supabase, "acc", {
      blockId: "b1",
      domain: "voeding",
      answer: "deels",
    });

    expect(ok).toBe(true);
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({ account_id: "acc", block_id: "b1", answer: "deels" }),
      { onConflict: "account_id,block_id" },
    );
  });

  it("meldt falen zonder te werpen", async () => {
    const upsert = vi.fn(() => Promise.resolve({ error: { message: "nee" } }));
    const supabase = { from: vi.fn(() => ({ upsert })) } as unknown as SupabaseClient;
    await expect(
      upsertActionReflection(supabase, "acc", {
        blockId: "b1",
        domain: "voeding",
        answer: "niet",
      }),
    ).resolves.toBe(false);
  });

  it("schrijft geen score-veld mee", async () => {
    const payloads: Record<string, unknown>[] = [];
    const upsert = vi.fn((row: Record<string, unknown>) => {
      payloads.push(row);
      return Promise.resolve({ error: null });
    });
    const supabase = { from: vi.fn(() => ({ upsert })) } as unknown as SupabaseClient;
    await upsertActionReflection(supabase, "acc", {
      blockId: "b1",
      domain: "voeding",
      answer: "gelukt",
    });
    const payload = payloads[0];
    // De lock: zelfrapportage over één actie raakt nooit een check-score.
    expect(Object.keys(payload).sort()).toEqual(["account_id", "answer", "block_id", "domain"]);
  });
});
