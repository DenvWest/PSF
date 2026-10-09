import type { SupabaseClient } from "@supabase/supabase-js";
import { haalNevoFoodsOp, nevoCodeUitProdId, nevoFoodNaarSupermarktProduct, zoekNevoFoods } from "@/lib/nevo-foods";
import { haalSupermarktProductenOp, MAX_ZOEKRESULTATEN, zoekSupermarktProducten } from "@/lib/supermarkt-products";
import type { SupermarktProduct } from "@/types/supermarkt-product";

/**
 * Eén ingang voor het dagboek over de bronnen heen. De tabellen blijven
 * gescheiden (`sm_products` = Open Food Facts, `nevo_foods` = NEVO); alleen hier
 * komen ze bij elkaar, in het geheugen, via het bronvoorvoegsel van `prod_id`
 * (`off:` of `nevo:`). Zie `docs/plan/ONTWERP_SUPERMARKT_PRODUCTTABEL_2026-10.md` §7.
 *
 * Een bron die faalt (bijvoorbeeld een tabel die nog niet bestaat) maakt de
 * andere niet onbruikbaar.
 */

/**
 * Haalt producten op `prod_id` op, uit welke bron dan ook. Faalt een bron, dan
 * ontbreken alleen zijn producten; faalt het ophalen overal, dan gooit dit.
 */
export async function haalDagboekProductenOp(
  supabase: SupabaseClient,
  prodIds: readonly string[],
): Promise<Map<string, SupermarktProduct>> {
  const nevoCodes: string[] = [];
  const overige: string[] = [];
  for (const id of prodIds) {
    const code = nevoCodeUitProdId(id);
    if (code) nevoCodes.push(code);
    else overige.push(id);
  }

  const [off, nevo] = await Promise.allSettled([
    overige.length > 0 ? haalSupermarktProductenOp(supabase, overige) : Promise.resolve(new Map<string, SupermarktProduct>()),
    nevoCodes.length > 0 ? haalNevoFoodsOp(supabase, nevoCodes) : Promise.resolve(null),
  ]);
  if (off.status === "rejected" && nevo.status === "rejected") throw off.reason;

  const resultaat = new Map<string, SupermarktProduct>();
  if (off.status === "fulfilled") for (const [id, product] of off.value) resultaat.set(id, product);
  if (nevo.status === "fulfilled" && nevo.value) {
    for (const [id, food] of nevo.value) resultaat.set(id, nevoFoodNaarSupermarktProduct(food));
  }
  return resultaat;
}

/**
 * Zoekt in beide bronnen. NEVO eerst: de generieke, verse voedingsmiddelen
 * (en gratis voor de gebruiker) komen vóór het merkproduct; daarna Open Food
 * Facts. Hooguit {@link MAX_ZOEKRESULTATEN} samen, ruwweg half-half als beide
 * bronnen genoeg hebben. Gooit alleen als beide bronnen falen.
 */
export async function zoekDagboekProducten(
  supabase: SupabaseClient,
  query: string,
): Promise<SupermarktProduct[]> {
  const [nevo, off] = await Promise.allSettled([zoekNevoFoods(supabase, query), zoekSupermarktProducten(supabase, query)]);
  if (nevo.status === "rejected" && off.status === "rejected") throw off.reason;

  const nevoProducten = nevo.status === "fulfilled" ? nevo.value.map(nevoFoodNaarSupermarktProduct) : [];
  const offProducten = off.status === "fulfilled" ? off.value : [];

  const helft = Math.ceil(MAX_ZOEKRESULTATEN / 2);
  const nevoDeel = nevoProducten.slice(0, Math.max(helft, MAX_ZOEKRESULTATEN - offProducten.length));
  const offDeel = offProducten.slice(0, MAX_ZOEKRESULTATEN - nevoDeel.length);
  return [...nevoDeel, ...offDeel];
}
