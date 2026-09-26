"use client";

import { useEffect } from "react";

const STALE_SERVER_ACTION_PATTERNS = [
  "Failed to find Server Action",
  "Failed to parse body as FormData",
];

function isStaleServerActionError(error: Error): boolean {
  return STALE_SERVER_ACTION_PATTERNS.some((pattern) => error.message.includes(pattern));
}

// Server Actions hebben een build-specifiek ID. Blijft een admin-tabblad open
// tijdens een deploy, dan verwijst de volgende klik naar een ID dat de nieuwe
// server niet meer kent — vandaar deze twee foutmeldingen. Eén automatische
// refresh lost het op; de guard voorkomt een reload-lus als de fout om een
// andere reden aanhoudt.
const RELOAD_GUARD_KEY = "psf-admin-stale-action-reload";
const RELOAD_GUARD_WINDOW_MS = 10_000;

function recentlyAutoReloaded(): boolean {
  if (typeof window === "undefined") return false;
  const lastReload = Number(sessionStorage.getItem(RELOAD_GUARD_KEY) ?? "0");
  return Date.now() - lastReload < RELOAD_GUARD_WINDOW_MS;
}

export default function AdminError({ error }: { error: Error & { digest?: string } }) {
  const stale = isStaleServerActionError(error);
  const showReloading = stale && !recentlyAutoReloaded();

  useEffect(() => {
    if (!stale || recentlyAutoReloaded()) return;

    sessionStorage.setItem(RELOAD_GUARD_KEY, String(Date.now()));
    window.location.reload();
  }, [stale]);

  if (showReloading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <p className="text-sm" style={{ color: "var(--ps-body)" }}>
          Nieuwe versie geladen — pagina wordt ververst…
        </p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-xl font-semibold" style={{ color: "var(--ps-ink)" }}>
        Er ging iets mis
      </h1>
      <p className="max-w-md text-sm" style={{ color: "var(--ps-body)" }}>
        {stale
          ? "Deze pagina verwijst nog naar een oudere versie van de server (na een deploy). Ververs de pagina om verder te gaan."
          : "Er is een onverwachte fout opgetreden in het admin-dashboard."}
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="rounded-lg px-3.5 py-2 text-sm font-semibold text-white"
        style={{ backgroundColor: "var(--ps-green)" }}
      >
        Pagina verversen
      </button>
    </main>
  );
}
