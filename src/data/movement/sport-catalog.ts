import type { MovementFormCoverage, MovementFormId } from "@/data/movement/movement-forms";

export type SportCatalogStatus = "ready" | "beta";

export type SportCatalogEntry = {
  id: string;
  label: string;
  status: SportCatalogStatus;
  recommendation: string;
  coverage: Record<MovementFormId, MovementFormCoverage>;
};

/** Redactioneel startvoorstel — review kracht/duurbasis vóór livegang. */
export const SPORT_CATALOG: readonly SportCatalogEntry[] = [
  {
    id: "wielrennen",
    label: "Wielrennen / MTB",
    status: "ready",
    recommendation: "bouwt je duurbasis en je benen op uithouding",
    coverage: {
      kracht: "niet",
      duurbasis: "dekt",
      interval: "deels",
      mobiliteit: "niet",
      ritme: "deels",
    },
  },
  {
    id: "hardlopen",
    label: "Hardlopen",
    status: "ready",
    recommendation: "houdt je duurbasis op peil en belast je botten",
    coverage: {
      kracht: "niet",
      duurbasis: "dekt",
      interval: "deels",
      mobiliteit: "niet",
      ritme: "deels",
    },
  },
  {
    id: "fitness",
    label: "Krachttraining",
    status: "ready",
    recommendation:
      "dekt je kracht af — de bouwsteen die na je veertigste het snelst wegzakt",
    coverage: {
      kracht: "dekt",
      duurbasis: "niet",
      interval: "niet",
      mobiliteit: "deels",
      ritme: "niet",
    },
  },
  {
    id: "tennis",
    label: "Tennis",
    status: "ready",
    recommendation: "zit vol korte versnellingen en richtingwisselingen",
    coverage: {
      kracht: "deels",
      duurbasis: "deels",
      interval: "dekt",
      mobiliteit: "deels",
      ritme: "niet",
    },
  },
  {
    id: "padel",
    label: "Padel",
    status: "ready",
    recommendation: "is intensief, met veel stops en starts",
    coverage: {
      kracht: "niet",
      duurbasis: "deels",
      interval: "dekt",
      mobiliteit: "deels",
      ritme: "niet",
    },
  },
  {
    id: "zwemmen",
    label: "Zwemmen",
    status: "ready",
    recommendation: "traint je duurbasis en houdt je schouders soepel",
    coverage: {
      kracht: "deels",
      duurbasis: "dekt",
      interval: "deels",
      mobiliteit: "dekt",
      ritme: "niet",
    },
  },
  {
    id: "voetbal",
    label: "Voetbal",
    status: "ready",
    recommendation: "is stoppen, sprinten en weer stoppen",
    coverage: {
      kracht: "deels",
      duurbasis: "deels",
      interval: "dekt",
      mobiliteit: "deels",
      ritme: "niet",
    },
  },
  {
    id: "golf",
    label: "Golf",
    status: "ready",
    recommendation: "houdt je in beweging en je rotatie op gang",
    coverage: {
      kracht: "niet",
      duurbasis: "deels",
      interval: "niet",
      mobiliteit: "deels",
      ritme: "dekt",
    },
  },
  {
    id: "wandelen",
    label: "Wandelen",
    status: "ready",
    recommendation: "houdt je dag in beweging",
    coverage: {
      kracht: "niet",
      duurbasis: "deels",
      interval: "niet",
      mobiliteit: "niet",
      ritme: "dekt",
    },
  },
  {
    id: "roeien",
    label: "Roeien",
    status: "ready",
    recommendation: "belast je hele keten op uithouding",
    coverage: {
      kracht: "deels",
      duurbasis: "dekt",
      interval: "deels",
      mobiliteit: "niet",
      ritme: "niet",
    },
  },
  {
    id: "klimmen",
    label: "Klimmen",
    status: "beta",
    recommendation: "vraagt kracht en beweeglijkheid tegelijk",
    coverage: {
      kracht: "dekt",
      duurbasis: "niet",
      interval: "niet",
      mobiliteit: "dekt",
      ritme: "niet",
    },
  },
  {
    id: "yoga",
    label: "Yoga / pilates",
    status: "beta",
    recommendation: "houdt je bewegingsbereik ruim",
    coverage: {
      kracht: "deels",
      duurbasis: "niet",
      interval: "niet",
      mobiliteit: "dekt",
      ritme: "niet",
    },
  },
] as const;

export function getSportCatalogEntry(id: string): SportCatalogEntry | undefined {
  return SPORT_CATALOG.find((entry) => entry.id === id);
}

const COVERAGE_RANK: Record<MovementFormCoverage, number> = {
  niet: 0,
  deels: 1,
  dekt: 2,
};

export function mergeSportCoverage(
  sportIds: readonly string[],
): Record<MovementFormId, MovementFormCoverage> {
  const merged: Record<MovementFormId, MovementFormCoverage> = {
    kracht: "niet",
    duurbasis: "niet",
    interval: "niet",
    mobiliteit: "niet",
    ritme: "niet",
  };

  for (const sportId of sportIds) {
    const entry = getSportCatalogEntry(sportId);
    if (!entry) {
      continue;
    }
    for (const form of Object.keys(merged) as MovementFormId[]) {
      const current = merged[form];
      const next = entry.coverage[form];
      if (COVERAGE_RANK[next] > COVERAGE_RANK[current]) {
        merged[form] = next;
      }
    }
  }

  return merged;
}
