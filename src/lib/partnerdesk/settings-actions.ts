"use server";

import { revalidatePath } from "next/cache";
import { getPartnerDeskDb } from "@/lib/partnerdesk/db";
import type { ActionResult } from "@/lib/partnerdesk/actions";

function done() {
  revalidatePath("/admin/instellingen");
  revalidatePath("/admin/partners");
}

// ── Netwerken ───────────────────────────────────────────────────────────────

export async function createNetworkAction(input: {
  name: string;
  kind: "network" | "direct";
  loginUrl: string;
}): Promise<ActionResult> {
  if (!input.name.trim()) return { ok: false, error: "Naam is verplicht." };
  try {
    const db = getPartnerDeskDb();
    const { error } = await db.from("pd_networks").insert({
      name: input.name.trim(),
      kind: input.kind,
      login_url: input.loginUrl.trim() || null,
    });
    if (error) return { ok: false, error: error.message };
    done();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Onbekende fout." };
  }
}

export async function deleteNetworkAction(input: { id: string }): Promise<ActionResult> {
  try {
    const db = getPartnerDeskDb();
    const { error } = await db.from("pd_networks").delete().eq("id", input.id);
    if (error) {
      // FK: partners verwijzen naar dit netwerk (geen cascade).
      return { ok: false, error: "Netwerk heeft nog partners en kan niet weg." };
    }
    done();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Onbekende fout." };
  }
}

// ── Categorieën ─────────────────────────────────────────────────────────────

export async function createCategoryAction(input: { name: string }): Promise<ActionResult> {
  if (!input.name.trim()) return { ok: false, error: "Naam is verplicht." };
  try {
    const db = getPartnerDeskDb();
    const { error } = await db.from("pd_categories").insert({ name: input.name.trim() });
    if (error) return { ok: false, error: error.message };
    done();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Onbekende fout." };
  }
}

export async function deleteCategoryAction(input: { id: string }): Promise<ActionResult> {
  try {
    const db = getPartnerDeskDb();
    // Partners/regels verwijzen met on delete set null — verwijderen is veilig.
    const { error } = await db.from("pd_categories").delete().eq("id", input.id);
    if (error) return { ok: false, error: error.message };
    done();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Onbekende fout." };
  }
}

// ── Labels ──────────────────────────────────────────────────────────────────

export async function createLabelAction(input: {
  name: string;
  color: string;
}): Promise<ActionResult> {
  if (!input.name.trim()) return { ok: false, error: "Naam is verplicht." };
  try {
    const db = getPartnerDeskDb();
    const { error } = await db
      .from("pd_labels")
      .insert({ name: input.name.trim(), color: input.color });
    if (error) return { ok: false, error: error.message };
    done();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Onbekende fout." };
  }
}

export async function deleteLabelAction(input: { id: string }): Promise<ActionResult> {
  try {
    const db = getPartnerDeskDb();
    const { error } = await db.from("pd_labels").delete().eq("id", input.id);
    if (error) return { ok: false, error: error.message };
    done();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Onbekende fout." };
  }
}
