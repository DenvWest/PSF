import {
  Apple,
  Bean,
  Beef,
  Carrot,
  Cookie,
  CookingPot,
  Croissant,
  Droplet,
  Droplets,
  EggFried,
  Fish,
  Leaf,
  type LucideIcon,
  Milk,
  Nut,
  Package,
  Pizza,
  Salad,
  Sandwich,
  Soup,
  Sprout,
  Candy,
  CupSoda,
  Utensils,
  Wheat,
} from "lucide-react";

export type FoodMotif =
  | "groenten"
  | "fruit"
  | "granen"
  | "brood"
  | "pasta"
  | "peulvruchten"
  | "noten"
  | "zaden"
  | "vlees"
  | "vis"
  | "eieren"
  | "zuivel"
  | "kaas"
  | "plantaardig"
  | "vetten"
  | "sauzen"
  | "ontbijt"
  | "snacks"
  | "soepen"
  | "maaltijden"
  | "dranken"
  | "aardappel"
  | "snoep"
  | "verpakt";

const MOTIEVEN: Record<FoodMotif, { icoon: LucideIcon; kleur: string }> = {
  groenten: { icoon: Salad, kleur: "text-emerald-300" },
  fruit: { icoon: Apple, kleur: "text-rose-300" },
  granen: { icoon: Wheat, kleur: "text-amber-300" },
  brood: { icoon: Croissant, kleur: "text-orange-300" },
  pasta: { icoon: CookingPot, kleur: "text-amber-200" },
  peulvruchten: { icoon: Bean, kleur: "text-lime-300" },
  noten: { icoon: Nut, kleur: "text-orange-200" },
  zaden: { icoon: Sprout, kleur: "text-lime-200" },
  vlees: { icoon: Beef, kleur: "text-red-300" },
  vis: { icoon: Fish, kleur: "text-sky-300" },
  eieren: { icoon: EggFried, kleur: "text-yellow-200" },
  zuivel: { icoon: Milk, kleur: "text-sky-100" },
  kaas: { icoon: Pizza, kleur: "text-yellow-300" },
  plantaardig: { icoon: Leaf, kleur: "text-emerald-200" },
  vetten: { icoon: Droplet, kleur: "text-lime-200" },
  sauzen: { icoon: Droplets, kleur: "text-orange-300" },
  ontbijt: { icoon: Sandwich, kleur: "text-amber-200" },
  snacks: { icoon: Cookie, kleur: "text-orange-200" },
  soepen: { icoon: Soup, kleur: "text-orange-300" },
  maaltijden: { icoon: Utensils, kleur: "text-stone-200" },
  dranken: { icoon: CupSoda, kleur: "text-cyan-300" },
  aardappel: { icoon: Carrot, kleur: "text-orange-300" },
  snoep: { icoon: Candy, kleur: "text-pink-300" },
  verpakt: { icoon: Package, kleur: "text-stone-300" },
};

/** Lijnicoon van een voedingsmiddelgroep of -categorie, in een eigen tint. Decoratief. */
export default function FoodIllustration({
  motief,
  className = "",
}: {
  motief: FoodMotif;
  className?: string;
}) {
  const { icoon: Icoon, kleur } = MOTIEVEN[motief];
  return <Icoon aria-hidden="true" strokeWidth={1.75} className={`${kleur} ${className}`} />;
}
