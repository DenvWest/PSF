"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  buildDashboardAgendaHref,
  buildDashboardSchapHref,
  buildDashboardVandaagHref,
  buildDashboardVoortgangHref,
  isSchapTabId,
} from "@/lib/dashboard-url";
import { trackEvent } from "@/lib/ga4";
import type { PillarId, VoortgangScreen } from "@/types/dashboard";

type PrebuildRoute = {
  tab?: string;
  screen?: string;
  fav?: string;
  schap?: string;
  kompas?: string;
};

type PrebuildFrameProps = {
  /** Bestandsnaam onder /prebuilds/, incl. queryparams. */
  src: string;
  title: string;
};

const PILLARS = new Set<PillarId>([
  "slaap",
  "beweging",
  "voeding",
  "stress",
  "verbinding",
  "energie",
  "herstel",
]);

function asPillar(value: string | undefined): PillarId | null {
  return value && PILLARS.has(value as PillarId) ? (value as PillarId) : null;
}

/**
 * Vertaalt een navigatie-intent uít de prebuild naar een echte dashboard-URL.
 * De prebuilds dragen hun eigen appbar niet meer (die is verborgen in de
 * embed-build) — een klik op "Mijn Dag" of "Maak een keuze" moet dus de
 * échte tab verzetten, niet intern van scherm wisselen.
 */
export function resolvePrebuildHref(route: PrebuildRoute): string | null {
  if (route.tab === "agenda") {
    return buildDashboardAgendaHref();
  }
  if (route.tab === "vandaag") {
    return buildDashboardVandaagHref(asPillar(route.kompas));
  }
  if (route.tab === "voortgang") {
    // `favorieten` mét domein is de oude naam van het schap — prebuilds die
    // nog niet opnieuw gebouwd zijn dragen hem, dus hij vertaalt hier mee.
    if (route.screen === "schap" || route.screen === "favorieten") {
      const fav = asPillar(route.fav);
      if (fav) {
        return buildDashboardSchapHref(fav, isSchapTabId(route.schap) ? route.schap : null);
      }
    }
    return buildDashboardVoortgangHref(
      (route.screen ?? "hub") as VoortgangScreen,
      null,
      null,
      asPillar(route.fav),
    );
  }
  return null;
}

/**
 * Meetpunten uit een prebuild. Alleen wat hier met naam genoemd staat gaat
 * door: een iframe mag geen willekeurige eventnamen de meetlaag in schrijven,
 * ook al is hij same-origin. De ladder hergebruikt het bestaande
 * `<domein>_ladder_layer_open` van de ladder op Voortgang — zelfde event, eigen
 * surface, zodat beide plekken in één rapport naast elkaar te lezen zijn.
 */
function trackPrebuildEvent(name: string, payload: Record<string, unknown> | undefined) {
  if (name !== "dashboard.ladder_layer_opened") return;
  const domain = asPillar(typeof payload?.domain === "string" ? payload.domain : undefined);
  const layer = payload?.layer;
  if (!domain || typeof layer !== "number") return;
  trackEvent(`${domain}_ladder_layer_open`, { layer, surface: `kompas_${domain}` });
}

/**
 * De prebuild letterlijk, als same-origin iframe. Zie
 * scripts/build-prebuild-embeds.mjs voor wat de embed-build aanpast
 * (chrome + appbar verbergen, beginstand uit de URL, navigatie naar buiten).
 */
export default function PrebuildFrame({ src, title }: PrebuildFrameProps) {
  const router = useRouter();
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      const data = event.data as {
        source?: string;
        route?: PrebuildRoute;
        event?: string;
        payload?: Record<string, unknown>;
      } | null;
      if (!data || data.source !== "psf-prebuild") return;
      if (data.event) {
        trackPrebuildEvent(data.event, data.payload);
        return;
      }
      if (!data.route) return;
      const href = resolvePrebuildHref(data.route);
      if (!href) return;

      // Binnen het dashboard is dit dezelfde-pagina-navigatie: alleen de
      // queryparams verschuiven. `router.push` zou daar een volledige
      // RSC-render van maken — de pagina is dynamisch (cookies), dus dat is de
      // hele serverketen opnieuw voor een klik in het schap. De rest van het
      // dashboard verzet deze overgangen al met history.pushState; de
      // popstate-luisteraars in Dashboard en KompasHome lezen de nieuwe URL en
      // zetten de staat. Vandaar pushState + een popstate-melding.
      if (window.location.pathname === "/dashboard") {
        window.history.pushState(null, "", href);
        window.dispatchEvent(new PopStateEvent("popstate"));
        return;
      }
      router.push(href);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [router]);

  // Geen tweede scrollbalk (19 aug): het iframe groeit mee met zijn eigen
  // inhoud, zodat alleen de dashboardpagina scrollt. Tot de eerste meting
  // binnen is staat er een ruime ondergrens zodat er geen sprong zichtbaar is.
  const [height, setHeight] = useState(720);

  // Meten kan pas ná `load`. Bij mount is `contentDocument` nog het lege
  // start-document; dat wordt door de navigatie vervángen, dus een observer
  // die daarop is gezet kijkt daarna naar een losgekoppelde node. Vandaar dat
  // we de observer hier pas opzetten, op het document dat er dan echt staat.
  // Zonder dit stond de hoogte na één meting vast en werd alles wat de
  // prebuild daarna hertekende (elke tab-wissel doet `app.innerHTML = ...`)
  // afgekapt — het frame staat op overflow:hidden.
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    let observer: ResizeObserver | null = null;

    const attach = () => {
      const doc = frame.contentDocument;
      const root = doc?.documentElement;
      if (!root) return;

      const measure = () => {
        const next = root.scrollHeight;
        if (next > 0) setHeight(next);
      };
      measure();

      observer?.disconnect();
      observer = new ResizeObserver(measure);
      observer.observe(root);
      // De prebuilds vervangen bij elke interactie de inhoud van #app. Dat
      // verandert de hoogte van <html> niet altijd meteen, dus meet ook op de
      // DOM-mutatie zelf.
      if (doc.body) {
        observer.observe(doc.body);
      }
    };

    // Al geladen (bijv. bij een re-render zonder src-wissel): meteen meten.
    if (frame.contentDocument?.readyState === "complete") {
      attach();
    }
    frame.addEventListener("load", attach);
    return () => {
      observer?.disconnect();
      frame.removeEventListener("load", attach);
    };
  }, [src]);

  // Eén kader voor alle surfaces (19 aug): dezelfde vulkleur, dezelfde rand
  // en dezelfde ronding als het leefstijlprofiel-scherm. De prebuilds dragen
  // hun eigen rand niet meer (die is in de embed-build gestript), zodat elk
  // domein hier identiek uit de bus komt.
  return (
    <div className="overflow-hidden rounded-[18px] border border-white/10 bg-[#132414]">
      <iframe
        ref={frameRef}
        src={`/prebuilds/${src}`}
        title={title}
        scrolling="no"
        className="block w-full border-0"
        style={{ colorScheme: "normal", height, overflow: "hidden" }}
      />
    </div>
  );
}
