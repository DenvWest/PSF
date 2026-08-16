"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CockpitTile from "@/components/dashboard/cockpit/CockpitTile";
import { emitAccountClientEvent } from "@/lib/account-events-client";
import { clarityTag } from "@/lib/clarity";
import {
  isProfileUsable,
  resolveProfileHighlights,
  type ProfileHighlights,
} from "@/lib/connection-profile/highlights";
import type { ConnectionProfile } from "@/lib/connection-profile/types";
import { trackEvent } from "@/lib/ga4";

/**
 * "Voor jou" + "Jouw onderwerpen" — de terugkerende oppervlakken uit
 * BESLUIT_CONNECTION_PROFILE_V1_2026-08.md §10. De tegel is de glimp, niet de
 * opbrengst: de volledige uitkomst woont op /account/wat-bij-jou-past. Eén link
 * per tegel, zoals de rest van het kompas.
 *
 * Bevat geen gezondheidsdata en leest er ook niets van: deze tegel kent alleen
 * het eigen profiel (§7).
 */

const PROFILE_ENDPOINT = "/api/account/connection-profile";
const PROFILE_HREF = "/account/wat-bij-jou-past";
const MAX_TILE_TOPICS = 4;

type TileState =
  | { status: "loading" }
  | { status: "empty" }
  | { status: "ready"; highlights: ProfileHighlights };

export default function VoorJouTile() {
  const [state, setState] = useState<TileState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(PROFILE_ENDPOINT);
        if (!response.ok) {
          if (!cancelled) setState({ status: "empty" });
          return;
        }

        const data: unknown = await response.json();
        const profile =
          data && typeof data === "object" && "profile" in data
            ? ((data as { profile: ConnectionProfile | null }).profile ?? null)
            : null;

        if (cancelled) return;

        setState(
          profile && isProfileUsable(profile)
            ? { status: "ready", highlights: resolveProfileHighlights(profile) }
            : { status: "empty" },
        );
      } catch {
        if (!cancelled) setState({ status: "empty" });
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === "loading") {
    return null;
  }

  if (state.status === "empty") {
    return (
      <CockpitTile eyebrow="Voor jou" ariaLabel="Wat bij jou past">
        <h2 className="m-0 mt-2 font-serif text-[18px] leading-snug text-[#F1EFE8]">
          Wat bij jou past
        </h2>
        <p className="mt-2 max-w-[58ch] text-[13px] leading-relaxed text-[#9FB0A6] text-pretty">
          Tik aan waar je aandacht naar uitgaat en wat je al doet. Twee minuten,
          en wij weten wat we je wel en niet moeten laten zien.
        </p>
        <Link
          href={PROFILE_HREF}
          onClick={() => {
            trackEvent("cprofile_invite_click", { surface: "kompas_home" });
            clarityTag("cprofile_invite", "kompas_home");
          }}
          className="mt-3 inline-flex min-h-11 items-center text-[13px] font-semibold text-[#5A8F6A] no-underline"
        >
          Vul het in →
        </Link>
      </CockpitTile>
    );
  }

  const { highlights } = state;

  return (
    <CockpitTile eyebrow="Voor jou" ariaLabel="Wat bij jou past">
      <h2 className="m-0 mt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7E8C82]">
        Jouw onderwerpen
      </h2>
      <ul className="m-0 mt-2 flex list-none flex-wrap gap-1.5 p-0">
        {highlights.topics.slice(0, MAX_TILE_TOPICS).map((topic) => (
          <li
            key={topic.id}
            className="rounded-full border border-[#5A8F6A]/40 bg-[#5A8F6A]/[0.12] px-2.5 py-1 text-[12px] text-[#CDD7D0]"
          >
            {topic.label}
          </li>
        ))}
      </ul>

      {highlights.firstStep ? (
        <div className="mt-3.5 border-t border-white/[0.06] pt-3">
          <p className="m-0 font-serif text-[15px] leading-snug text-[#F1EFE8]">
            {highlights.firstStep.title}
          </p>
          <p className="m-0 mt-1.5 max-w-[58ch] text-[12.5px] leading-relaxed text-[#9FB0A6] text-pretty">
            {highlights.firstStep.body}
          </p>
        </div>
      ) : null}

      <Link
        href={PROFILE_HREF}
        onClick={() => {
          trackEvent("cprofile_highlight_click", { kind: "topics" });
          emitAccountClientEvent("cprofile.highlight_clicked", { kind: "tile" });
          clarityTag("cprofile_highlight", "topics");
        }}
        className="mt-3 inline-flex min-h-11 items-center text-[13px] font-semibold text-[#5A8F6A] no-underline"
      >
        Bekijk wat bij je past →
      </Link>
    </CockpitTile>
  );
}
