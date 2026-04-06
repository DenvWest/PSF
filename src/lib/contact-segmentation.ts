export const DOELGROEP_OPTIONS = [
  'man_40', 'man_50plus',
  'vrouw_premenopauze', 'vrouw_menopauze'
] as const;

export const HOOFD_SYMPTOOM_OPTIONS = [
  'vermoeidheid', 'slaap', 'libido',
  'focus', 'spiergewicht', 'gewricht'
] as const;

export const LEEFSTIJL_OPTIONS = [
  'sedentair', 'licht_actief', 'actief', 'sportief'
] as const;

export const SUPPLEMENT_FASE_OPTIONS = [
  'orientatie', 'overweging', 'koopklaar', 'klant'
] as const;

export type Doelgroep = typeof DOELGROEP_OPTIONS[number];
export type HoofdSymptoom = typeof HOOFD_SYMPTOOM_OPTIONS[number];
export type LeefstijlScore = typeof LEEFSTIJL_OPTIONS[number];
export type SupplementFase = typeof SUPPLEMENT_FASE_OPTIONS[number];
