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
    toelichting: "Kies Mannen of Vrouwen voor hormonale begrippen.",
  },
  mannen: {
    toelichting: "Hormonale begrippen voor mannen staan nu bovenaan.",
    link: { label: "Naar de pijler Testosteron na 30", href: "/testosteron-na-40" },
  },
  vrouwen: {
    toelichting: "Hormonale begrippen voor vrouwen staan nu bovenaan.",
    link: { label: "Naar de pijler Overgang", href: "/overgang" },
  },
};

const CROSS_LINKS = [
  {
    label: "Herstelbibliotheek",
    hint: "Artikelen over slaap, stress en herstel.",
    href: "/blog",
  },
  {
    label: "Supplementen vergelijken",
    hint: "Producten vergelijken op dezelfde criteria.",
    href: "/supplementen",
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
        title: "Thema's",
        body: "Kies een thema of zoek een begrip.",
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
