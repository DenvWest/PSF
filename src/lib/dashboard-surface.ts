/**
 * Één bron voor het oppervlak van Voortgang — kaart, paneel, tekst, rij, chip
 * en de statuskleuren.
 *
 * **Waarom dit bestand bestaat.** Voor deze laag schreef elk paneel zijn eigen
 * `STYLES`-object of zijn eigen losse klassen. Een telling over
 * `src/components/dashboard` en `src/components/nutrition` gaf 57× `bg-black/20`
 * naast 31× `bg-black/25`, 169× `border-white/10` naast 26× `border-white/15`,
 * en 232× `text-[#9FB0A6]` naast 168× `text-[#7E8C82]` — allemaal met de hand
 * herhaald. Dat zijn geen ontwerpbesluiten meer maar kopieerfouten: hetzelfde
 * bedoelde vlak kreeg per component een net andere waarde. Elke visuele
 * verbetering moest daardoor op tientallen plekken tegelijk, en dreef binnen
 * één feature weer uiteen.
 *
 * Vanaf hier importeert een paneel `surfaceStyles(surface)` en kiest het geen
 * eigen waarden meer.
 *
 * **De twee surfaces.** `dashboard` is het donkere Voortgang-oppervlak binnen
 * `.ps-dash`; `check` is het lichte oppervlak van de intake. Dezelfde
 * componenten draaien op allebei — daarom is de surface een parameter en geen
 * media query.
 *
 * **Waarom hier klassen staan en geen CSS-variabelen.** `globals.css` heeft al
 * een `.ps-dash`-tokenset (`--panel`, `--text-muted`, `--divider`). Die dekt de
 * shell, niet de panelen: de paneelwaarden hierboven zijn er nooit naartoe
 * gemigreerd en lopen er inhoudelijk naast. Deze laag legt eerst één set vast
 * in de vorm die de componenten nú gebruiken — Tailwind-klassen in JSX, zoals
 * CLAUDE.md voorschrijft. Het samenvoegen van beide sets is een volgende stap
 * en verandert dan nog maar één bestand.
 */

export type DashboardSurface = "check" | "dashboard";

/**
 * De rollen die een paneel nodig heeft. Bewust klein gehouden: elke rol die
 * erbij komt is een nieuw besluit dat overal moet kloppen.
 */
export type SurfaceStyles = {
  /** Buitenrand van een paneel: radius, rand en vlak in één. */
  kaart: string;
  /** Genest vlak bínnen een kaart — uitklap, detailblok. */
  paneel: string;
  /** Bovenkop en labels: klein, hoofdletters, rustig. */
  kop: string;
  /** Leestekst met het volle contrast. */
  tekst: string;
  /** Bijzin, bron- en voetregels. */
  zacht: string;
  /** Randkleur voor scheidingslijnen tussen rijen. */
  rij: string;
  /** Tekstknop en inline link. */
  knop: string;
  /** Filterchip in ruststand. */
  chipUit: string;
  /** Filterchip als hij aanstaat. */
  chipAan: string;
  /** Bed waar een voortgangs- of verhoudingsbalk overheen ligt. */
  balkBed: string;
};

const CHECK: SurfaceStyles = {
  kaart: "rounded-[14px] border border-[#ebe7e2] bg-[#faf9f7]",
  paneel: "bg-white/70",
  kop: "text-[#78716c]",
  tekst: "text-[#1c1917]",
  zacht: "text-[#78716c]",
  rij: "border-[#ebe7e2]",
  knop: "text-[#5A8F6A]",
  chipUit: "border-[#e4e0da] bg-white text-[#57534e]",
  chipAan: "border-[#5A8F6A] bg-[#5A8F6A] text-white",
  balkBed: "bg-[#efece7]",
};

const DASHBOARD: SurfaceStyles = {
  kaart: "rounded-2xl border border-white/10 bg-black/20",
  paneel: "bg-black/25",
  kop: "text-[#9FB0A6]",
  tekst: "text-[#E7EDE8]",
  zacht: "text-[#9FB0A6]",
  rij: "border-white/10",
  knop: "text-[#9CC5A9]",
  chipUit: "border-white/15 bg-transparent text-[#9FB0A6]",
  chipAan: "border-[#9CC5A9] bg-[#9CC5A9]/20 text-[#E7EDE8]",
  balkBed: "bg-white/10",
};

const SURFACES: Record<DashboardSurface, SurfaceStyles> = {
  check: CHECK,
  dashboard: DASHBOARD,
};

export function surfaceStyles(surface: DashboardSurface): SurfaceStyles {
  return SURFACES[surface];
}

/**
 * De statuskleuren van een feitenrij.
 *
 * Drie statussen krijgen kleur, `own` bewust niet: een kleur zonder richtlijn
 * is een oordeel dat we niet kunnen onderbouwen. Die rij krijgt overal een
 * open bolletje en straks geen balk.
 *
 * Deze waarden zijn dezelfde in beide surfaces — de betekenis van "hier zit je
 * ruimte" hangt niet af van de achtergrond waarop hij staat.
 */
export const STATUS_KLEUR = {
  below: "#C24B4B",
  near: "#D4824A",
  meets: "#3D8B5A",
} as const;

export type StatusMetKleur = keyof typeof STATUS_KLEUR;

/** Of een status een kleur en een balk krijgt, of alleen een open bolletje. */
export function heeftStatusKleur(status: string): status is StatusMetKleur {
  return status === "below" || status === "near" || status === "meets";
}

/**
 * De zone-verhoudingen van een verhoudingsbalk, als percentages van de breedte.
 *
 * De balk toont drie zones — ruimte, bijna, goed — met daarop één marker waar
 * jij staat. De zones zijn vast: ze horen bij de richtlijn, niet bij jouw
 * antwoord, en verspringen dus niet per rij.
 *
 * **Waarom de marker op een status staat en niet op een getal.** De check meet
 * frequentie ("2× per dag"), geen hoeveelheid. Er is geen ratio tussen jouw
 * antwoord en de lat die we kunnen verdedigen — `below/near/meets` is alles wat
 * de bron draagt. De marker gaat dus naar het midden van zijn zone: precies
 * genoeg om de positie te tonen, en niet meer precisie suggereren dan er is.
 */
export const BALK_ZONES = [
  { status: "below", breedte: 34 },
  { status: "near", breedte: 26 },
  { status: "meets", breedte: 40 },
] as const;

/** Waar de marker staat, in procent van links — het midden van zijn zone. */
export function markerPositie(status: StatusMetKleur): number {
  let start = 0;
  for (const zone of BALK_ZONES) {
    if (zone.status === status) {
      return start + zone.breedte / 2;
    }
    start += zone.breedte;
  }
  return 50;
}
