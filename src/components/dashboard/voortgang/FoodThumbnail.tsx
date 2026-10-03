"use client";

import Image from "next/image";
import { useState } from "react";
import FoodGroupTile from "@/components/dashboard/voortgang/FoodGroupTile";
import { catalogImageSrc, type CatalogEntry } from "@/data/nutrition/food-catalog";
import { VOEDSELGROEP_TEGEL } from "@/lib/voedselgroep-tegel";

/**
 * Kleine catalogusfoto bij een zoekresultaat of dagboekregel.
 *
 * Het bestand bestaat pas ná review + `food-image-download.py`. Tot die tijd
 * (en bij een 404) toont dit de tegel van de voedselgroep — geen kapot-plaatje.
 */
export default function FoodThumbnail({
  entry,
  size = 40,
}: {
  entry: CatalogEntry;
  size?: 40 | 48;
}) {
  const [failed, setFailed] = useState(false);
  const src = catalogImageSrc(entry);

  if (failed || !src) {
    const tegel = VOEDSELGROEP_TEGEL[entry.groep];
    return <FoodGroupTile icoon={tegel.icoon} label={tegel.label} size={size} />;
  }

  return (
    <Image
      src={src}
      alt={entry.labelNl}
      width={size}
      height={size}
      className={`shrink-0 rounded-lg object-cover ${size === 48 ? "h-12 w-12" : "h-10 w-10"}`}
      onError={() => setFailed(true)}
    />
  );
}
