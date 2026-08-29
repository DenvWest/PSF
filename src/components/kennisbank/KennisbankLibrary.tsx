"use client";

import type { ReactNode } from "react";
import { getAllThemes, themeLabels } from "@/data/kennisbank";
import type { ContentAudience } from "@/lib/content-audience";
import type { LibraryItem } from "@/lib/library/library-item";
import KennisbankThemaIcon from "@/components/kennisbank/KennisbankThemaIcon";
import LibraryBrowser from "@/components/library/LibraryBrowser";
import type { AudienceContext } from "@/components/library/LibraryAudienceLens";

const AUDIENCE_CONTEXT: Record<ContentAudience, AudienceContext> = {
  alle: {
    toelichting:
      "De meeste begrippen zijn fysiologie die voor iedereen geldt — biobeschikbaarheid werkt niet anders per geslacht. Kies je fysiologie voor wat wél verschilt.",
  },
  mannen: {
    toelichting:
      "Alleen bij hormonale begrippen loopt de fysiologie uiteen. Die staan nu bovenaan; de rest van de meetlat blijft identiek.",
    link: { label: "Naar de pijler Testosteron na 40", href: "/testosteron-na-40" },
  },
  vrouwen: {
    toelichting:
      "Oestrogeen stuurt na je veertigste botopbouw, slaap en herstel mee. Dat begrippenblok bouwen we nog uit; de overgangspijler behandelt het nu.",
    link: { label: "Naar de pijler Overgang", href: "/overgang" },
  },
};

const CROSS_LINKS = [
  {
    label: "Herstelbibliotheek",
    hint: "De artikelen waarin deze begrippen samenkomen.",
    href: "/blog",
  },
  {
    label: "Supplementen vergelijken",
    hint: "Dezelfde meetlat over alle producten: PS-Score.",
    href: "/supplementen",
  },
  {
    label: "Onze methode",
    hint: "Hoe we beoordelen en wat we bewust niet claimen.",
    href: "/onderbouwing",
  },
];

const SORTS = [
  { key: "alfabet", label: "Alfabetisch" },
  { key: "bronnen", label: "Meeste bronnen" },
  { key: "nieuwste", label: "Laatst herzien" },
] as const;

type KennisbankLibraryProps = {
  items: LibraryItem[];
  initialAudience?: ContentAudience;
  initialGroup?: string;
  personalSlot?: ReactNode;
  footerSlot?: ReactNode;
};

export default function KennisbankLibrary({
  items,
  initialAudience,
  initialGroup,
  personalSlot,
  footerSlot,
}: KennisbankLibraryProps) {
  return (
    <LibraryBrowser
      surface="kennisbank"
      items={items}
      groups={getAllThemes().map((theme) => ({
        key: theme,
        label: themeLabels[theme].title,
        icon: <KennisbankThemaIcon theme={theme} className="h-4 w-4" />,
      }))}
      allesLabel="Alle thema's"
      itemNoun={{ enkel: "begrip", meervoud: "begrippen" }}
      intro={{
        title: "De begrippen achter het oordeel",
        body: "Elk begrip legt uit wat het is, hoe het werkt en waarom het meeweegt in onze beoordeling — met minimaal vijf bronnen eronder.",
        link: { label: "Zo beoordelen we", href: "/onderbouwing" },
      }}
      audienceContext={AUDIENCE_CONTEXT}
      initialAudience={initialAudience}
      initialGroup={initialGroup}
      filters={[
        {
          key: "basis",
          label: "Basis",
          predicate: (item: LibraryItem) => item.badge !== "Verdieping",
          exclusiveGroup: "diepgang",
        },
        {
          key: "verdieping",
          label: "Verdieping",
          predicate: (item: LibraryItem) => item.badge === "Verdieping",
          exclusiveGroup: "diepgang",
        },
      ]}
      sorts={SORTS}
      zoekPlaceholder="Zoek een begrip"
      crossLinks={CROSS_LINKS}
      personalSlot={personalSlot}
      footerSlot={footerSlot}
    />
  );
}
