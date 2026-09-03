"use client";

import { useEffect, useMemo, useState } from "react";
import * as Icons from "@/components/app/icons";
import CategorieDetailPaneel from "@/components/nutrition/CategorieDetailPaneel";
import VerschuivingTabel from "@/components/nutrition/VerschuivingTabel";
import { emitAccountClientEvent } from "@/lib/account-events-client";
import { clarityTag } from "@/lib/clarity";
import type { LadderEvidenceStatus } from "@/lib/domain-ladder-readout";
import { trackEvent } from "@/lib/ga4";
import { heeftDetail } from "@/lib/nutrition-categorie-detail";
import type { NutritionSelfReport } from "@/lib/nutrition-intake-estimate";
import type { NutritionFactRow, NutritionLadderReport } from "@/lib/nutrition-ladder";
import { surfaceStyles } from "@/lib/dashboard-surface";
import { bouwVerschuiving } from "@/lib/voedingsbasis-verschuiving";
import type { DomainMeasurement } from "@/types/dashboard";
import {
  categorieKaarten,
  GEEN_RICHTLIJN_LABEL_KORT,
  type CategorieKaart,
} from "@/lib/nutrition-voedselgroepen";

/**
 * P1 Voedingsbasis — één meetbalk per categorie.
 *
 * ## Waarom balken en geen tabel
 *
 * De tabel hiervoor zette per categorie vier kolommen naast elkaar (jij, de
 * richtlijn, de status, en een uitklap). Dat leest als een spreadsheet: je
 * vergelijkt cellen met elkaar en moet zelf uitrekenen waar de ruimte zit.
 * Terwijl de vraag van deze laag maar één ding is — *waar heb ik de meeste
 * ruimte* — en dat is precies wat een balk in één oogopslag beantwoordt.
 *
 * Elke categorie krijgt daarom zijn eigen baan met zijn eigen meetwaarde: waar
 * jouw antwoord op de schaal van díé vraag staat. Zeven banen onder elkaar
 * lezen als één instrument, en de langste lege ruimte is meteen je antwoord.
 *
 * ## Waarom de meetwaarde niet de status herhaalt
 *
 * De status (`below`/`near`/`meets`) is een oordeel in drie stappen; de
 * `schaalPositie` is waar je antwoord op zijn eigen schaal staat. Die twee
 * zeggen iets anders: twee categorieën kunnen allebei "ruimte" hebben terwijl
 * de één op de eerste stop staat en de ander vlak onder de lat. De balk toont
 * die afstand, de kleur toont het oordeel.
 *
 * Categorieën zonder eigen slider (de gecombineerde groepen) krijgen een baan
 * zonder markering — hun kleur zegt genoeg, en een verzonnen positie zou de
 * enige echte meetwaarde op dit scherm onbetrouwbaar maken.
 *
 * ## De doordruk
 *
 * Elke categorie die bronnen achter zich heeft, klapt open naar
 * `CategorieDetailPaneel`: welke stoffen deze groep draagt en uit welke
 * bronnen. Eén tegelijk open — de vraag is per categorie te beantwoorden.
 */

const STATUS_KLEUR: Record<Exclude<LadderEvidenceStatus, "own">, string> = {
  below: "#C8956C",
  near: "#C99A3C",
  meets: "#5A8F6A",
};

const STATUS_LABEL: Record<LadderEvidenceStatus, string> = {
  below: "ruimte",
  near: "bijna",
  meets: "op orde",
  own: "eigen ijkpunt",
};

/** Ruimte eerst — dat is waar deze laag voor bestaat. */
const STATUS_VOLGORDE: Record<LadderEvidenceStatus, number> = {
  below: 0,
  near: 1,
  meets: 2,
  own: 3,
};

/**
 * De meetbaan van één categorie.
 *
 * De gevulde breedte is de schaalpositie; de fijne streep is de lat. Zonder
 * positie blijft de baan leeg met alleen zijn kleur — dan draagt de kleur het
 * oordeel en belooft de baan geen precisie die er niet is.
 */
function Meetbaan({
  positie,
  status,
}: {
  positie: number | null;
  status: LadderEvidenceStatus;
}) {
  const kleur = status === "own" ? "#7E8C82" : STATUS_KLEUR[status];
  return (
    <div className="relative mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
      {positie != null ? (
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-500"
          style={{
            width: `${Math.max(3, Math.round(positie * 100))}%`,
            background: `linear-gradient(90deg, ${kleur}55, ${kleur})`,
          }}
        />
      ) : (
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-full rounded-full opacity-25"
          style={{ background: kleur }}
        />
      )}
    </div>
  );
}

function CategorieBaan({
  kaart,
  open,
  onToggle,
  report,
  surface,
}: {
  kaart: CategorieKaart;
  open: boolean;
  onToggle: () => void;
  report: NutritionSelfReport | null;
  surface: string;
}) {
  const uitklapbaar = heeftDetail(kaart.id);
  const paneelId = `voedingsbasis-detail-${kaart.id}`;
  const kleur = kaart.status === "own" ? "#9FB0A6" : STATUS_KLEUR[kaart.status];

  const kop = (
    <>
      <span className="flex items-baseline justify-between gap-3">
        <span className="flex min-w-0 items-center gap-1.5">
          {uitklapbaar ? (
            <span
              aria-hidden
              className="inline-flex shrink-0 text-[#7E8C82] transition-transform"
              style={{ transform: open ? "rotate(90deg)" : undefined }}
            >
              <Icons.ChevronRight s={11} />
            </span>
          ) : null}
          <span className="truncate text-[13px] font-semibold leading-snug text-[#E7EDE8]">
            {kaart.label}
          </span>
        </span>
        <span
          className="shrink-0 text-[10.5px] font-semibold uppercase tracking-[0.06em]"
          style={{ color: kleur }}
        >
          {STATUS_LABEL[kaart.status]}
        </span>
      </span>
      <Meetbaan positie={kaart.schaalPositie} status={kaart.status} />
      <span className="mt-1.5 flex items-baseline justify-between gap-3">
        <span className="min-w-0 truncate text-[11.5px] leading-snug text-[#9FB0A6]">
          {kaart.jij}
        </span>
        <span className="shrink-0 text-[10.5px] leading-snug text-[#7E8C82]">
          {kaart.aanbevolen ??
            (kaart.exemption ? GEEN_RICHTLIJN_LABEL_KORT[kaart.exemption] : null)}
        </span>
      </span>
    </>
  );

  return (
    <li className="min-w-0">
      {uitklapbaar ? (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={paneelId}
          className="w-full cursor-pointer border-none bg-transparent p-0 text-left font-[inherit]"
        >
          {kop}
        </button>
      ) : (
        <div>{kop}</div>
      )}

      {open ? (
        <div id={paneelId} className="mt-2 rounded-lg bg-black/25 px-3 py-2.5">
          <CategorieDetailPaneel
            categorieId={kaart.id}
            categorieLabel={kaart.label}
            report={report}
            surface={surface}
          />
        </div>
      ) : null}
    </li>
  );
}

export default function VoedingsbasisOverzicht({
  rijen,
  report,
  selfReport = null,
  moments = [],
  surface,
}: {
  rijen: readonly NutritionFactRow[];
  report: NutritionLadderReport | null;
  /**
   * Het frequentie-zelfrapport, voor de doordruk. Los van `report`: die draagt
   * de slider-indices voor de tabel zelf, dit draagt de genormaliseerde vorm
   * waar de nutriënt-engine op draait. Null = doordruk toont de neutrale staat.
   */
  selfReport?: NutritionSelfReport | null;
  /** De meetmomenten van voeding, nieuwste eerst — voedt de verschuivingstabel. */
  moments?: readonly DomainMeasurement[];
  surface: string;
}) {
  const kaarten = useMemo(() => {
    const gebouwd = categorieKaarten(rijen, report);
    // Ruimte bovenaan; bij gelijke status blijft de bordvolgorde uit
    // VOEDSELGROEPEN staan (Array.prototype.sort is stabiel).
    return [...gebouwd].sort(
      (a, b) => STATUS_VOLGORDE[a.status] - STATUS_VOLGORDE[b.status],
    );
  }, [rijen, report]);

  const verschuiving = useMemo(
    () => bouwVerschuiving({ kaarten, moments }),
    [kaarten, moments],
  );

  const [openCategorie, setOpenCategorie] = useState<string | null>(null);
  const kaartSignature = kaarten.map((kaart) => `${kaart.id}:${kaart.status}`).join("|");

  useEffect(() => {
    if (kaarten.length === 0) {
      return;
    }
    for (const kaart of kaarten) {
      trackEvent("nutrition_basis_category_view", {
        surface,
        category_id: kaart.id,
        status: kaart.status,
      });
      emitAccountClientEvent("nutrition.basis_category_viewed", {
        category_id: kaart.id,
        status: kaart.status,
        surface,
      });
    }
    clarityTag("nutrition_basis_overview", surface);
  }, [kaartSignature, kaarten, surface]);

  if (kaarten.length === 0) {
    return (
      <div className={`mt-4 ${surfaceStyles("dashboard").kaart} px-4 py-3.5`}>
        <p className="m-0 text-[13.5px] leading-relaxed text-[#9FB0A6] text-pretty">
          Doe de voedingscheck om per categorie te zien waar je staat ten opzichte van de
          richtlijn.
        </p>
      </div>
    );
  }

  // De legenda-regel is een telling, geen uitleg. De vorige zin ("wat
  // aanbevolen is en wat jij doet, waar de meeste ruimte zit bovenaan")
  // beschreef de vorm van het blok eronder — dat is precies wat de vorm zelf
  // al doet. Wat je daar wél wilt lezen is hoeveel categorieën ruimte laten
  // zien, want dat is het antwoord waar je voor kwam.
  const metRuimte = kaarten.filter((kaart) => kaart.status === "below").length;
  const opOrde = kaarten.filter((kaart) => kaart.status === "meets").length;

  return (
    <div className="mt-4">
      {/* De samenvatting als balk in plaats van als alinea: drie tellingen
          naast elkaar lezen sneller dan een zin die hetzelfde zegt, en ze
          dragen dezelfde kleurtaal als de banen eronder. */}
      <div
        className={`flex flex-wrap items-center gap-x-4 gap-y-1.5 border border-white/10 bg-black/20 px-3.5 py-2.5 ${
          verschuiving.momenten.length > 1 ? "rounded-t-xl" : "mb-3 rounded-xl"
        }`}
      >
        <p className="m-0 text-[9.5px] font-bold uppercase tracking-[0.15em] text-[#7E8C82]">
          Per categorie
        </p>
        <span className="flex items-center gap-3.5">
          {metRuimte > 0 ? (
            <span className="flex items-center gap-1.5 text-[11.5px] font-semibold text-[#C8956C]">
              <span
                aria-hidden
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: STATUS_KLEUR.below }}
              />
              {metRuimte} met ruimte
            </span>
          ) : null}
          {opOrde > 0 ? (
            <span className="flex items-center gap-1.5 text-[11.5px] font-semibold text-[#9CC5A9]">
              <span
                aria-hidden
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: STATUS_KLEUR.meets }}
              />
              {opOrde} op orde
            </span>
          ) : null}
          <span className="text-[11px] text-[#7E8C82]">{kaarten.length} totaal</span>
        </span>
      </div>

      {/* De verschuiving sluit aan op de kop: hij zegt hoe de stand eronder
          tot stand kwam, dus geen losse kaart ertussen. */}
      <VerschuivingTabel verschuiving={verschuiving} />

      <ul className="m-0 mt-3.5 flex list-none flex-col gap-3.5 p-0" role="list">
        {kaarten.map((kaart) => (
          <CategorieBaan
            key={kaart.id}
            kaart={kaart}
            open={openCategorie === kaart.id}
            onToggle={() =>
              setOpenCategorie((huidig) => (huidig === kaart.id ? null : kaart.id))
            }
            report={selfReport}
            surface={surface}
          />
        ))}
      </ul>
    </div>
  );
}
