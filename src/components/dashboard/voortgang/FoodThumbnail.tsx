"use client";

import Image from "next/image";
import { useState } from "react";
import { catalogImageSrc, type CatalogEntry } from "@/data/nutrition/food-catalog";

/**
 * Kleine catalogusfoto bij een zoekresultaat of dagboekregel.
 *
 * Het bestand bestaat pas ná review + `food-image-download.py`. Tot die tijd
 * (en bij een 404) toont dit een letter-placeholder — geen kapot-plaatje.
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
  const letter = entry.labelNl.trim().charAt(0).toUpperCase() || "?";
  const box = size === 48 ? "h-12 w-12 text-[20px]" : "h-10 w-10 text-[17px]";

  if (failed || !src) {
    return (
      <span
        aria-hidden="true"
        className={`inline-flex shrink-0 items-center justify-center rounded-lg bg-[#5A8F6A]/25 font-medium text-[#9CC5A9] ${box}`}
      >
        {letter}
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={entry.labelNl}
      width={size}
      height={size}
      className={`shrink-0 rounded-lg object-cover ${box}`}
      onError={() => setFailed(true)}
    />
  );
}
