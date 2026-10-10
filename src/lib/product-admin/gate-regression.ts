import type { EfsaClaimId } from "@/data/approved-claims";
import { productMeetsClaimThreshold } from "@/lib/claim-condition";
import { buildDosering } from "@/lib/supplement-catalog-db/loader";
import {
  evaluatePublishGate,
  type GateCriterion,
  type GateInput,
} from "@/lib/product-admin/publish-gate";
import type { ProductDossier } from "@/lib/product-admin/queries";

export type PublishedEdit =
  | { kind: "removeImage"; imageId: string }
  | { kind: "updateImage"; imageId: string; source: string; licenseNote: string }
  | { kind: "removeActive"; activeId: string }
  | { kind: "updateActive"; activeId: string; amount: number; unit: string }
  | { kind: "removeSource"; sourceId: string }
  | { kind: "setOfferActive"; offerId: string; active: boolean };

/** Criteria die vóór de wijziging slaagden en erna falen. */
export function gateRegressions(before: GateInput, after: GateInput): GateCriterion[] {
  const was = new Map(evaluatePublishGate(before).map((c) => [c.key, c.ok]));
  return evaluatePublishGate(after).filter((c) => !c.ok && was.get(c.key) === true);
}

export function gateInputFromDossier(dossier: ProductDossier, today: string): GateInput {
  const score = dossier.gate.find((c) => c.key === "score");
  return {
    images: dossier.images,
    actives: dossier.actives,
    claims: dossier.claims,
    offers: dossier.offers,
    sourceCount: dossier.sources.length,
    score: { available: score?.ok ?? false, detail: score?.detail ?? "" },
    today,
  };
}

function applyEdit(dossier: ProductDossier, edit: PublishedEdit, today: string): GateInput {
  const base = gateInputFromDossier(dossier, today);
  switch (edit.kind) {
    case "removeImage":
      return { ...base, images: dossier.images.filter((i) => i.id !== edit.imageId) };
    case "updateImage":
      return {
        ...base,
        images: dossier.images.map((i) =>
          i.id === edit.imageId ? { ...i, source: edit.source, license_note: edit.licenseNote.trim() } : i,
        ),
      };
    case "removeSource":
      return { ...base, sourceCount: dossier.sources.filter((s) => s.id !== edit.sourceId).length };
    case "setOfferActive":
      return {
        ...base,
        offers: dossier.offers.map((o) => (o.id === edit.offerId ? { ...o, active: edit.active } : o)),
      };
    case "removeActive":
    case "updateActive": {
      const actives =
        edit.kind === "removeActive"
          ? dossier.actives.filter((a) => a.id !== edit.activeId)
          : dossier.actives.map((a) =>
              a.id === edit.activeId ? { ...a, amount_per_serving: edit.amount, unit: edit.unit } : a,
            );
      const complete = actives.flatMap((a) =>
        a.amount_per_serving !== null && a.unit
          ? [{ ...a, amount_per_serving: a.amount_per_serving, unit: a.unit, product_id: dossier.product.id }]
          : [],
      );
      const dosering = complete.length > 0 ? buildDosering(complete) : null;
      const claims = dossier.claims.map((c) => ({
        ...c,
        meets_condition: dosering !== null && productMeetsClaimThreshold(dosering, c.efsa_claim_id as EfsaClaimId),
      }));
      return { ...base, actives, claims };
    }
  }
}

/**
 * Een gepubliceerd product mag door een admin-wijziging niet onder de
 * publiceerpoort zakken (besluit B-2). Alleen criteria die nu slagen worden
 * bewaakt: zo blijven wijzigingen mogelijk die een falend product verbeteren.
 * Geeft een foutmelding of null.
 */
export function publishedEditBlock(dossier: ProductDossier, edit: PublishedEdit, today: string): string | null {
  if (dossier.product.status !== "published") return null;
  const regressions = gateRegressions(gateInputFromDossier(dossier, today), applyEdit(dossier, edit, today));
  if (regressions.length === 0) return null;
  return `Geblokkeerd: dit product is gepubliceerd en zou de publiceerpoort niet meer halen (${regressions
    .map((r) => r.label)
    .join("; ")}). Zet het product eerst op concept.`;
}
