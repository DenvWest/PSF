"use client";

import Link from "next/link";
import * as Icons from "@/components/app/icons";
import CockpitTile from "@/components/dashboard/cockpit/CockpitTile";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import type {
  BewegingAdviesTreden as TredenModel,
  TredeStatus,
  TredeSupplementItem,
} from "@/lib/beweging-advies-treden";

const STATUS_STYLE: Record<TredeStatus, string> = {
  nu: "border-[#5A8F6A]/40 bg-[#5A8F6A]/15 text-[#8FBF9E]",
  staat: "border-white/15 bg-white/[0.04] text-[#9FB0A6]",
  wacht: "border-[#C8956C]/35 bg-[#C8956C]/10 text-[#C8956C]",
  dicht: "border-white/10 bg-transparent text-[#7E8C82]",
};

function Rung({
  index,
  title,
  status,
  statusLabel,
  children,
}: {
  index: number;
  title: string;
  status: TredeStatus;
  statusLabel: string;
  children: React.ReactNode;
}) {
  return (
    <li className="border-t border-white/10 pt-3.5 first:border-t-0 first:pt-0">
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/15 font-mono text-[11px] text-[#9FB0A6]"
        >
          {index}
        </span>
        <h4 className="m-0 flex-1 font-serif text-[16px] leading-tight text-[#F1EFE8]">
          {title}
        </h4>
        <span
          className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLE[status]}`}
        >
          {statusLabel}
        </span>
      </div>
      <div className="mt-2.5 pl-[34px]">{children}</div>
    </li>
  );
}

function SupplementRow({
  item,
  onCompare,
  onOpenFavorieten,
}: {
  item: TredeSupplementItem;
  onCompare: (item: TredeSupplementItem) => void;
  onOpenFavorieten: () => void;
}) {
  return (
    <div className="border-t border-white/[0.07] pt-3 first:border-t-0 first:pt-0">
      <p className="m-0 flex items-baseline gap-2 text-[14px] text-[#F1EFE8]">
        <span className="font-semibold">{item.name}</span>
        <span className="text-[12px] text-[#9FB0A6]">— {item.label}</span>
      </p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-[#CDD7D0] text-pretty">
        {item.reason}
      </p>
      {item.claimText ? (
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#9FB0A6] text-pretty">
          De claim die mag: “{item.claimText}” — EFSA-goedgekeurde tekst, geen eigen
          belofte.
        </p>
      ) : null}
      {item.open && !item.claimText ? (
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#9FB0A6] text-pretty">
          Hier bestaat geen goedgekeurde gezondheidsclaim voor. Wat je vergelijkt is
          inname en praktijk — eiwitgehalte, prijs per portie — geen belofte over wat
          het met je doet.
        </p>
      ) : null}
      <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {item.open && item.comparisonPath ? (
          <Link
            href={item.comparisonPath}
            onClick={() => onCompare(item)}
            className="text-[13px] font-semibold text-[#5A8F6A] no-underline"
          >
            Vergelijk {item.name.toLowerCase()} <Icons.ChevronRight s={13} />
          </Link>
        ) : null}
        <button
          type="button"
          onClick={onOpenFavorieten}
          className="cursor-pointer border-none bg-transparent p-0 text-[13px] font-medium text-[#9FB0A6]"
        >
          Zie ons oordeel ›
        </button>
      </div>
    </div>
  );
}

export default function BewegingAdviesTreden({
  treden,
  onGoVandaag,
  onOpenVoedingAdvies,
  onOpenFavorieten,
}: {
  treden: TredenModel;
  onGoVandaag: () => void;
  onOpenVoedingAdvies: () => void;
  onOpenFavorieten: () => void;
}) {
  const { trede1, trede2, trede3 } = treden;

  const handleCompare = (item: TredeSupplementItem) => {
    trackEvent("dashboard_beweging_supplement_click", {
      surface: "advies_voortgang",
      target: "vergelijking",
      slug: item.ingredientKey,
    });
    clarityTag("dashboard_beweging_advies", "vergelijking");
  };

  const handleVoedingAdvies = () => {
    trackEvent("dashboard_beweging_supplement_click", {
      surface: "advies_voortgang",
      target: "voeding_advies",
    });
    onOpenVoedingAdvies();
  };

  return (
    <CockpitTile eyebrow="Wat een supplement hier wél en niet doet" ariaLabel="Advies beweging">
      <p className="mt-2 text-[13px] leading-relaxed text-[#9FB0A6] text-pretty">
        Drie treden, altijd in deze orde. Een supplement is nooit trede 1 — hij is een
        aanvulling op wat er al staat.
      </p>

      <ul className="mt-4 flex list-none flex-col gap-3.5 p-0">
        <Rung
          index={1}
          title="Je interventie"
          status={trede1.status}
          statusLabel={trede1.proteinGap ? "iets te doen" : "staat"}
        >
          <p className="m-0 text-[13.5px] leading-relaxed text-[#CDD7D0] text-pretty">
            {trede1.programLabel
              ? `Je programma staat op ${trede1.programLabel.toLowerCase()}. Dat is de interventie — de rest komt daarnaast.`
              : "Je beweegprogramma is nog niet ingesteld. Dat is de interventie — de rest komt daarnaast."}
          </p>
          {trede1.positionLine ? (
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#9FB0A6] text-pretty">
              {trede1.positionLine}
            </p>
          ) : null}
          {trede1.proteinGap ? (
            <p className="mt-2 text-[13px] leading-relaxed text-[#CDD7D0] text-pretty">
              Je eiwit uit voeding blijft achter terwijl je traint. Dat hoort bij je
              bord, niet hier —{" "}
              <button
                type="button"
                onClick={handleVoedingAdvies}
                className="cursor-pointer border-none bg-transparent p-0 text-[13px] font-semibold text-[#5A8F6A]"
              >
                bekijk je voedingsadvies ›
              </button>
            </p>
          ) : null}
          <button
            type="button"
            onClick={onGoVandaag}
            className="mt-2 cursor-pointer border-none bg-transparent p-0 text-left text-[13px] font-medium text-[#9FB0A6]"
          >
            Terug naar je stap van vandaag ›
          </button>
        </Rung>

        <Rung
          index={2}
          title="Waar sta je"
          status={trede2.status}
          statusLabel={trede2.statusLabel}
        >
          {trede2.scoreLine ? (
            <p className="m-0 text-[13.5px] leading-relaxed text-[#CDD7D0] text-pretty">
              {trede2.scoreLine}
            </p>
          ) : null}
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#9FB0A6] text-pretty">
            Deze trede is geen slot voor trede 3 — hij is hoe je merkt of trede 1
            gewerkt heeft. De beweegcheck hierboven zet hem opnieuw.
          </p>
        </Rung>

        <Rung
          index={3}
          title="Aanvulling"
          status={trede3.status}
          statusLabel={trede3.status === "nu" ? "open" : "dicht"}
        >
          {trede3.items.length === 0 ? (
            <p className="m-0 text-[13.5px] leading-relaxed text-[#CDD7D0] text-pretty">
              Dit hebben we voor jou nog niet beoordeeld.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {trede3.items.map((item) => (
                <SupplementRow
                  key={item.ingredientKey}
                  item={item}
                  onCompare={handleCompare}
                  onOpenFavorieten={onOpenFavorieten}
                />
              ))}
            </div>
          )}
          <p className="mt-3 border-t border-white/[0.07] pt-2.5 text-[12px] leading-relaxed text-[#7E8C82] text-pretty">
            Ons oordeel is altijd gratis en gaat niet achter een slot. Aan sommige
            vergelijkingen verdienen we iets, aan andere niets — dat verandert niets aan
            wat we ervan vinden.
          </p>
        </Rung>
      </ul>
    </CockpitTile>
  );
}
