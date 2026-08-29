"use client";

import type { ReactNode } from "react";
import { ALLE_CATEGORIEEN } from "@/data/blog/categorieen";
import type { ContentAudience } from "@/lib/content-audience";
import type { LibraryItem } from "@/lib/library/library-item";
import { leestijdInMinuten } from "@/lib/library/blog-items";
import BlogCategorieIcon from "@/components/blog/BlogCategorieIcon";
import LibraryBrowser from "@/components/library/LibraryBrowser";
import type { AudienceContext } from "@/components/library/LibraryAudienceLens";

const AUDIENCE_CONTEXT: Record<ContentAudience, AudienceContext> = {
  alle: {
    toelichting:
      "Alles op volgorde van publicatie. Kies je fysiologie en de stukken die daar specifiek over gaan komen bovenaan — er verdwijnt niets.",
  },
  mannen: {
    toelichting:
      "Testosteron daalt na je veertigste met ongeveer een procent per jaar. Dat raakt slaap, herstel en spiermassa; die stukken staan nu vooraan.",
    link: { label: "Naar de pijler Testosteron na 40", href: "/testosteron-na-40" },
  },
  vrouwen: {
    toelichting:
      "In de perimenopauze verandert je slaap, herstel en botopbouw door dalend oestrogeen. De leefstijlbasis hieronder geldt onverkort; het hormonale deel staat in de overgangspijler.",
    link: { label: "Naar de pijler Overgang", href: "/overgang" },
  },
};

const CROSS_LINKS = [
  {
    label: "Kennisbank",
    hint: "De begrippen achter de artikelen, met bronnen.",
    href: "/kennisbank",
  },
  {
    label: "Supplementen vergelijken",
    hint: "Dezelfde meetlat over alle producten: PS-Score.",
    href: "/supplementen",
  },
  {
    label: "Gezondheidsgidsen",
    hint: "Per thema een gratis gids, ook voor mannen en vrouwen apart.",
    href: "/gidsen",
  },
];

const SORTS = [
  { key: "nieuwste", label: "Nieuwste eerst" },
  { key: "bronnen", label: "Meeste bronnen" },
  { key: "alfabet", label: "Op titel" },
] as const;

type BlogLibraryProps = {
  items: LibraryItem[];
  initialAudience?: ContentAudience;
  initialGroup?: string;
  personalSlot?: ReactNode;
  footerSlot?: ReactNode;
};

export default function BlogLibrary({
  items,
  initialAudience,
  initialGroup,
  personalSlot,
  footerSlot,
}: BlogLibraryProps) {
  return (
    <LibraryBrowser
      surface="blog"
      items={items}
      groups={ALLE_CATEGORIEEN.map((categorie) => ({
        key: categorie.id,
        label: categorie.naam,
        icon: <BlogCategorieIcon categorie={categorie.id} className="h-4 w-4" />,
      }))}
      allesLabel="Alle onderwerpen"
      itemNoun={{ enkel: "artikel", meervoud: "artikelen" }}
      intro={{
        title: "Lees op onderwerp, niet op toeval",
        body: "Elk artikel noemt het mechanisme, het bewijsniveau en de bronnen eronder. Geen wondermiddelen, geen affiliate-links in de teksten.",
        link: { label: "Zo beoordelen we", href: "/onderbouwing" },
      }}
      audienceContext={AUDIENCE_CONTEXT}
      initialAudience={initialAudience}
      initialGroup={initialGroup}
      filters={[
        {
          key: "kort",
          label: "Kort (≤ 6 min)",
          predicate: (item: LibraryItem) =>
            leestijdInMinuten(item.metaLabel ?? "") <= 6,
        },
        {
          key: "onderbouwd",
          label: "8+ bronnen",
          predicate: (item: LibraryItem) => (item.sourceCount ?? 0) >= 8,
        },
      ]}
      sorts={SORTS}
      zoekPlaceholder="Zoek op klacht of stof"
      crossLinks={CROSS_LINKS}
      personalSlot={personalSlot}
      footerSlot={footerSlot}
    />
  );
}
