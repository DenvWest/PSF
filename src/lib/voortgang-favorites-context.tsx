"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { AccountFavoriteItem } from "@/lib/account-favorites";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import type { PillarId } from "@/types/dashboard";

export type VoortgangFavoriteItem = AccountFavoriteItem;

type VoortgangFavoritesContextValue = {
  items: VoortgangFavoriteItem[];
  hydrated: boolean;
  isSaved: (id: string) => boolean;
  save: (item: VoortgangFavoriteItem) => void;
  remove: (id: string) => void;
};

const VoortgangFavoritesContext = createContext<VoortgangFavoritesContextValue | null>(null);

async function fetchFavorites(): Promise<VoortgangFavoriteItem[] | null> {
  try {
    const response = await fetch("/api/account/favorites", { credentials: "include" });
    if (response.status === 401) {
      return null;
    }
    if (!response.ok) {
      return [];
    }
    const json = (await response.json()) as { items?: VoortgangFavoriteItem[] };
    return Array.isArray(json.items) ? json.items : [];
  } catch {
    return [];
  }
}

async function persistFavorite(item: VoortgangFavoriteItem): Promise<boolean> {
  try {
    const response = await fetch("/api/account/favorites", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        item_id: item.id,
        title: item.title,
        kind: item.kind,
        domain: item.domain,
        source: item.source,
      }),
    });
    return response.ok || response.status === 401;
  } catch {
    return false;
  }
}

async function deleteFavorite(itemId: string): Promise<boolean> {
  try {
    const response = await fetch(
      `/api/account/favorites?item_id=${encodeURIComponent(itemId)}`,
      { method: "DELETE", credentials: "include" },
    );
    return response.ok || response.status === 401;
  } catch {
    return false;
  }
}

export function VoortgangFavoritesProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<VoortgangFavoriteItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const accountBackedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    void fetchFavorites().then((remote) => {
      if (cancelled) {
        return;
      }
      if (remote !== null) {
        accountBackedRef.current = true;
        setItems(remote);
      }
      setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const isSaved = useCallback(
    (id: string) => items.some((item) => item.id === id),
    [items],
  );

  const save = useCallback((item: VoortgangFavoriteItem) => {
    setItems((current) => {
      if (current.some((row) => row.id === item.id)) {
        return current;
      }
      trackEvent("dashboard_favorieten_save", {
        item_id: item.id,
        kind: item.kind,
        ...(item.source ? { source: item.source } : {}),
        ...(item.domain ? { domain: item.domain } : {}),
      });
      clarityTag("dashboard_favorieten", item.id);
      return [...current, item];
    });
    void persistFavorite(item).then((ok) => {
      if (ok) {
        accountBackedRef.current = true;
      }
    });
  }, []);

  const remove = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
    if (accountBackedRef.current) {
      void deleteFavorite(id);
    }
  }, []);

  const value = useMemo(
    () => ({ items, hydrated, isSaved, save, remove }),
    [items, hydrated, isSaved, save, remove],
  );

  return (
    <VoortgangFavoritesContext.Provider value={value}>
      {children}
    </VoortgangFavoritesContext.Provider>
  );
}

export function useVoortgangFavorites(): VoortgangFavoritesContextValue {
  const context = useContext(VoortgangFavoritesContext);
  if (!context) {
    throw new Error("useVoortgangFavorites must be used within VoortgangFavoritesProvider");
  }
  return context;
}

export type { PillarId };
